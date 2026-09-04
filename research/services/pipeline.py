import logging
import time

import pdfplumber
from django.conf import settings

from ..models import Research, Paper

from .rag_paper_analysis import extract_key_points_rag
from .deep_paper_analysis import extract_deep_analysis
from .rag_retriever import index_paper

logger = logging.getLogger(__name__)

LLM_BASE_URL = getattr(settings, "LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b")
LLM_API_KEY = getattr(settings, "LLM_API_KEY", "")

# 2 LLM calls per paper (key_points + deep_analysis). Indexing is free
# (local embeddings, no API call) so it doesn't add to this budget.
SECONDS_BETWEEN_PAPERS = 4


# ---------------------------------------------------------------------
# PDF text extraction
# ---------------------------------------------------------------------

def _extract_pdf_text(file_field) -> str:
    """Pull plain text out of a Paper's uploaded PDF."""
    text_parts = []
    file_field.open("rb")
    try:
        with pdfplumber.open(file_field) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
    finally:
        file_field.close()
    return "\n".join(text_parts).strip()


# ---------------------------------------------------------------------
# Per-paper + per-research entry points
# ---------------------------------------------------------------------

def analyze_paper(paper: Paper) -> None:
    """Extract text, index it for chat retrieval, then run key points + deep analysis."""
    try:
        text = _extract_pdf_text(paper.file)
    except Exception as exc:  # noqa: BLE001
        logger.exception("PDF extraction failed for paper %s", paper.id)
        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": f"PDF extraction failed: {exc}",
        }
        paper.save(update_fields=["raw_ai_data"])
        return

    if not text:
        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": "No extractable text found in this PDF (it may be scanned images).",
        }
        paper.save(update_fields=["raw_ai_data"])
        return

    # Index the FULL paper text (not a summary) so the chatbot can answer
    # detailed questions, not just what fits in 6 bullets. This is local
    # embedding + vector store — no LLM call, so a failure here shouldn't
    # be treated as seriously as an LLM failure, but it also shouldn't
    # silently block key_points/deep_analysis from still succeeding.
    try:
        index_paper(research_id=paper.research_id, paper_id=paper.id, paper_text=text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Indexing failed for paper %s (chat retrieval will be degraded)", paper.id)

    try:
        key_points = extract_key_points_rag(text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("LLM key-point extraction failed for paper %s", paper.id)
        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": f"AI analysis failed: {exc}",
        }
        paper.save(update_fields=["raw_ai_data"])
        return

    try:
        deep_analysis = extract_deep_analysis(text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Deep analysis failed for paper %s", paper.id)
        deep_analysis = {"error": f"Deep analysis failed: {exc}"}

    paper.raw_ai_data = {
        **(paper.raw_ai_data or {}),
        "key_points": key_points,
        "deep_analysis": deep_analysis,
        "error": "",
    }
    if key_points:
        paper.ai_summary = " ".join(key_points[:2])
    paper.save(update_fields=["raw_ai_data", "ai_summary"])


def analyze_research(research):
    """
    Research analysis pipeline.

    Validates the research object, then extracts + indexes + analyzes
    every paper belonging to this research session.
    """
    if not isinstance(research, Research):
        raise ValueError("Invalid research object.")

    papers = research.papers.all()

    if not papers.exists():
        raise ValueError("No papers were uploaded for this research.")

    research.status = "analyzing"
    research.save(update_fields=["status"])

    papers_processed = 0
    papers_failed = 0
    total_papers = papers.count()

    for index, paper in enumerate(papers):
        analyze_paper(paper)
        papers_processed += 1
        if (paper.raw_ai_data or {}).get("error"):
            papers_failed += 1

        if index < total_papers - 1:
            time.sleep(SECONDS_BETWEEN_PAPERS)

    research.status = "failed" if papers_failed == papers_processed else "ready"
    research.save(update_fields=["status"])

    return {
        "research_id": research.id,
        "papers_processed": papers_processed,
        "papers_failed": papers_failed,
    }