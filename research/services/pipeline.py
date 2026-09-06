import logging
import re
import time

import pdfplumber
from django.conf import settings

from ..models import Research, Paper, Prerequisite, Citation

from .rag_paper_analysis import extract_key_points_rag
from .deep_paper_analysis import extract_deep_analysis
from .rag_retriever import index_paper

logger = logging.getLogger(__name__)

LLM_BASE_URL = getattr(settings, "LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b")
LLM_API_KEY = getattr(settings, "LLM_API_KEY", "")

# Only the LLM steps (key_points + deep_analysis) need spacing to stay
# under Groq's rate limit — citation/prerequisite detection below is
# pure local regex matching, no API calls, so it isn't throttled.
SECONDS_BETWEEN_PAPERS = 4


# ---------------------------------------------------------------------
# PDF text extraction — ONE shared pass, used by both feature areas.
# Previously each of you extracted text separately (once via
# paper.file.path, once via paper.file.open()) which risked the two
# copies silently drifting apart and doubled the PDF-parsing work.
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
# CITATION DETECTION (rule-based, no LLM)
# ---------------------------------------------------------------------

def detect_citations(papers, paper_texts):
    """
    Detect whether one uploaded paper appears to reference another
    uploaded paper. Basic local detector — no AI/NLP involved.
    """
    results = []

    for citing_paper in papers:
        citing_text = paper_texts.get(citing_paper.id, "").lower()

        if not citing_text:
            continue

        for cited_paper in papers:
            if citing_paper.id == cited_paper.id:
                continue

            identifiers = []

            filename = cited_paper.file.name
            if filename:
                filename = filename.split("/")[-1]
                filename_without_ext = re.sub(r"\.pdf$", "", filename, flags=re.IGNORECASE)
                identifiers.append(filename_without_ext.lower())

            if cited_paper.title:
                identifiers.append(cited_paper.title.lower())

            if cited_paper.authors:
                first_author = cited_paper.authors.split(",")[0].strip().lower()
                if first_author:
                    identifiers.append(first_author)

            found = False

            for identifier in identifiers:
                if not identifier:
                    continue

                normalized_identifier = re.sub(r"[_\-]+", " ", identifier)
                words = normalized_identifier.split()
                words = [word for word in words if len(word) >= 4]

                if not words:
                    continue

                matches = sum(1 for word in words if word in citing_text)

                if matches >= min(2, len(words)):
                    found = True
                    break

            if found:
                print(f"CITATION FOUND: {citing_paper.file.name} -> {cited_paper.file.name}")
                results.append({"citing_paper": citing_paper, "cited_paper": cited_paper})

    return results


# ---------------------------------------------------------------------
# PREREQUISITE DETECTION (derived from citations, rule-based)
# ---------------------------------------------------------------------

def detect_prerequisites(papers, paper_texts):
    """
    Build prerequisite relationships from detected citations.

    A citation does NOT automatically mean a prerequisite. A prerequisite
    is only created when the citation relationship is one-directional —
    this also prevents circular prerequisite relationships.
    """
    results = []

    citation_results = detect_citations(papers, paper_texts)

    citation_pairs = set()
    for item in citation_results:
        citing_paper = item["citing_paper"]
        cited_paper = item["cited_paper"]
        if citing_paper.id == cited_paper.id:
            continue
        citation_pairs.add((citing_paper.id, cited_paper.id))

    seen = set()

    for citing_id, cited_id in citation_pairs:
        # If the reverse relationship also exists, don't create a
        # prerequisite in either direction.
        if (cited_id, citing_id) in citation_pairs:
            print(f"Skipping circular prerequisite: {citing_id} <-> {cited_id}")
            continue

        key = (citing_id, cited_id)
        if key in seen:
            continue
        seen.add(key)

        citing_paper = next((p for p in papers if p.id == citing_id), None)
        cited_paper = next((p for p in papers if p.id == cited_id), None)

        if not citing_paper or not cited_paper:
            continue

        results.append(
            {
                "paper": citing_paper,
                "prerequisite_paper": cited_paper,
                "reason": (
                    f"{citing_paper.title or citing_paper.file.name} "
                    f"references {cited_paper.title or cited_paper.file.name}"
                ),
                "confidence": 0.75,
            }
        )

    print(f"Prerequisite relationships detected: {len(results)}")
    return results


# ---------------------------------------------------------------------
# Per-paper LLM analysis: key points + deep analysis + chat indexing.
# Takes already-extracted text (from the shared pass above) instead of
# re-extracting the PDF a second time.
# ---------------------------------------------------------------------

def analyze_paper(paper: Paper, text: str) -> None:
    if not text:
        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": "No extractable text found in this PDF (it may be scanned images).",
        }
        paper.save(update_fields=["text", "raw_ai_data"])
        return

    # Index the FULL paper text for chat retrieval. Local embedding, no
    # LLM call — a failure here degrades chat quality for this paper but
    # shouldn't block key_points/deep_analysis from still succeeding.
    try:
        index_paper(research_id=paper.research_id, paper_id=paper.id, paper_text=text)
    except Exception:  # noqa: BLE001
        logger.exception("Indexing failed for paper %s (chat retrieval will be degraded)", paper.id)

    try:
        key_points = extract_key_points_rag(text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("LLM key-point extraction failed for paper %s", paper.id)
        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": f"AI analysis failed: {exc}",
        }
        paper.save(update_fields=["text", "raw_ai_data"])
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
    paper.save(update_fields=["text", "raw_ai_data", "ai_summary"])


# ---------------------------------------------------------------------
# COMBINED entry point — runs both feature areas, sharing one text
# extraction pass. research.status transitions are now owned entirely
# by views.py's `analyze` action (single owner, no double-setting).
# ---------------------------------------------------------------------

def analyze_research(research):
    if not isinstance(research, Research):
        raise ValueError("Invalid research object.")

    papers = list(research.papers.all())

    if not papers:
        raise ValueError("No papers were uploaded for this research.")

    print(f"\n=== ANALYZING RESEARCH {research.id} ===")
    print(f"Papers found: {len(papers)}")

    # ---- Extract text once per paper, shared by both feature areas ----
    # Also cached into paper.text (new field) so future work doesn't need
    # to re-parse the PDF every single time — just read paper.text.
    paper_texts = {}
    for paper in papers:
        try:
            text = _extract_pdf_text(paper.file)
        except Exception as exc:  # noqa: BLE001
            logger.exception("PDF extraction failed for paper %s", paper.id)
            paper.text = ""
            paper.raw_ai_data = {
                **(paper.raw_ai_data or {}),
                "error": f"PDF extraction failed: {exc}",
            }
            paper.save(update_fields=["text", "raw_ai_data"])
            text = ""

        paper_texts[paper.id] = text
        paper.text = text  # set in-memory now; persisted by whichever
                            # save() runs next for this paper (below, or
                            # inside analyze_paper()) — avoids an extra
                            # DB round trip just to save this one field.
        print(f"  Extracted {len(text)} characters from {paper.file.name}")

    # ---- Citation + prerequisite detection (rule-based, no LLM) ----
    Prerequisite.objects.filter(paper__research=research).delete()
    Citation.objects.filter(citing_paper__research=research).delete()

    prerequisite_results = detect_prerequisites(papers, paper_texts)
    citation_results = detect_citations(papers, paper_texts)

    prerequisites_created = 0
    for item in prerequisite_results:
        target_paper = item["paper"]
        prerequisite_paper = item["prerequisite_paper"]

        if target_paper.id == prerequisite_paper.id:
            continue

        _, created = Prerequisite.objects.get_or_create(
            paper=target_paper,
            prerequisite_paper=prerequisite_paper,
            defaults={
                "reason": item.get("reason", ""),
                "confidence": item.get("confidence"),
            },
        )
        if created:
            prerequisites_created += 1

    citations_created = 0
    for item in citation_results:
        citing_paper = item["citing_paper"]
        cited_paper = item["cited_paper"]

        if citing_paper.id == cited_paper.id:
            continue

        _, created = Citation.objects.get_or_create(
            citing_paper=citing_paper,
            cited_paper=cited_paper,
        )
        if created:
            citations_created += 1

    print("\n=== CITATION/PREREQUISITE DETECTION COMPLETE ===")
    print(f"Prerequisites created: {prerequisites_created}")
    print(f"Citations created: {citations_created}")

    # ---- Per-paper LLM analysis: key points, deep analysis, indexing ----
    papers_processed = 0
    papers_failed = 0
    total_papers = len(papers)

    for index, paper in enumerate(papers):
        analyze_paper(paper, paper_texts.get(paper.id, ""))
        papers_processed += 1

        if (paper.raw_ai_data or {}).get("error"):
            papers_failed += 1

        if index < total_papers - 1:
            time.sleep(SECONDS_BETWEEN_PAPERS)

    print("\n=== FULL ANALYSIS COMPLETE ===")

    return {
        "research_id": research.id,
        "papers_processed": papers_processed,
        "papers_failed": papers_failed,
        "prerequisites_created": prerequisites_created,
        "citations_created": citations_created,
    }