"""
research/services/pipeline.py

Orchestrates the analysis of one research session:

    1. Extract text from every uploaded PDF (once) and cache it in Paper.text
    2. Best-effort metadata (title / authors / year) from the first page
    3. Detect citations by reading each paper's reference list
       (research/services/citation_detector.py)
    4. Derive prerequisite relationships from those citations
    5. Replace the stored Citation / Prerequisite rows (atomically)
    6. Per paper: index for the AI Assistant (RAG), key points, deep analysis,
       relevance to the research topic (skipped when nothing has changed)
    7. Pairwise relevance between every pair of papers -> PaperRelevance rows
       (independent of citations / prerequisites)

research.status transitions are owned by views.py (the `analyze` action),
not by this module.
"""

import hashlib
import json
import logging
import os
import re
import time

import pdfplumber
from django.conf import settings
from django.db import transaction

from ..models import (
    Research,
    Paper,
    Prerequisite,
    Citation,
    PaperRelevance,
)

from .rag_paper_analysis import extract_key_points_rag
from .deep_paper_analysis import extract_deep_analysis
from .rag_retriever import index_paper
from .citation_detector import find_citations, save_citations

try:
    from .relevance_analysis import assess_paper_relevance
except ImportError:  # keep the pipeline usable if the module is not present
    assess_paper_relevance = None

try:
    from .relevance_analysis import assess_pairwise_relevance
except ImportError:  # pairwise relevance is skipped if not available
    assess_pairwise_relevance = None

logger = logging.getLogger(__name__)

# The LLM settings (base URL / model / key) live in llm_client.py, which is
# the single place that reads them from Django settings.

# Spacing to stay under API rate limits (overridable from Django settings).
SECONDS_BETWEEN_PAPERS = getattr(settings, "SECONDS_BETWEEN_PAPERS", 4)
SECONDS_BETWEEN_PAIRWISE_CALLS = getattr(
    settings, "SECONDS_BETWEEN_PAIRWISE_CALLS", 1
)

# Minimum score for a pair of papers to be stored as "relevant".
PAIRWISE_RELEVANCE_THRESHOLD = float(
    getattr(settings, "PAIRWISE_RELEVANCE_THRESHOLD", 0.55)
)

# Print per-paper reference-section diagnostics from the citation detector.
# Set to False once citation detection is working.
CITATION_DEBUG = True


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def _extract_pdf_text(file_field):
    """
    Extract text from an uploaded Paper PDF (a Django FieldFile).

    The same extracted text is used by citation detection, prerequisite
    detection, Paper Analysis and AI Assistant / RAG indexing, so the PDF
    is parsed only once.
    """
    if not file_field:
        return ""

    text_parts = []

    file_field.open("rb")
    try:
        with pdfplumber.open(file_field) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    finally:
        file_field.close()

    return "\n".join(text_parts).strip()


def extract_pdf_text(file_path):
    """
    Extract text from a PDF *file path*.

    Compatibility helper kept in case another part of the project imports it.
    """
    if not file_path:
        return ""

    text_parts = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception:
        logger.exception("PDF extraction failed for %s", file_path)
        return ""

    return "\n".join(text_parts).strip()


# ============================================================
# METADATA EXTRACTION (best effort, heuristic)
# ============================================================

# Front-matter lines that are never a title or an author list.
_FRONT_MATTER_SKIP = {
    "invited paper",
    "abstract",
    "introduction",
    "contents",
    "keywords",
    "index terms",
}

# Journal / affiliation furniture.
_NOISE_LINE = re.compile(
    r"\b(university|department|institute|school|laboratory|abstract|"
    r"copyright|received|accepted|published|proceedings|journal|ieee|acm|"
    r"arxiv|vol\.?|preprint|permission)\b",
    re.IGNORECASE,
)

# Words that appear in titles but essentially never in author lists. They let
# us tell a wrapped title line ("Handshake Protocol") from an author line.
_TITLE_WORDS = {
    "analysis", "protocol", "protocols", "network", "networks", "devices",
    "systems", "system", "security", "secure", "cryptography",
    "cryptographic", "algorithm", "algorithms", "attack", "attacks",
    "detection", "framework", "approach", "model", "models", "learning",
    "data", "computer", "computing", "information", "design", "evaluation",
    "survey", "study", "theory", "using", "based", "towards", "toward",
    "efficient", "practical", "trust", "trusting",
}

_TITLE_CONNECTORS = {
    "of", "the", "and", "for", "in", "on", "a", "an", "to", "with", "by",
    "from", "at", "via", "or",
}

_YEAR_RE = re.compile(r"\b(19[5-9]\d|20[0-2]\d)\b")


def _has_title_words(line):
    words = {w.lower() for w in re.findall(r"[A-Za-z]+", line)}
    return bool(words & _TITLE_WORDS)


def _looks_like_authors(line):
    """True for lines that plausibly list people (very rough heuristic)."""
    cleaned = line.strip(" ,.;")

    if not cleaned or len(cleaned) > 250:
        return False
    if cleaned.lower() in _FRONT_MATTER_SKIP:
        return False
    if _NOISE_LINE.search(cleaned):
        return False
    if _has_title_words(cleaned):
        return False

    tokens = re.findall(r"[A-Za-z][A-Za-z'.\-]*", cleaned)
    if len(tokens) < 2:
        return False

    capitalised = sum(1 for t in tokens if t[0].isupper())
    return capitalised / len(tokens) >= 0.6


def _is_front_matter_noise(line):
    cleaned = line.strip(" ,.;")
    if len(cleaned) < 8:
        return True
    if cleaned.lower() in _FRONT_MATTER_SKIP:
        return True
    if _NOISE_LINE.search(cleaned):
        return True
    digits = sum(ch.isdigit() for ch in cleaned)
    return digits / len(cleaned) > 0.3


def extract_paper_metadata(paper, text):
    """
    Fill EMPTY title / authors / year fields from the first lines of the PDF.

    This is a heuristic: it works for the common "title, then authors" layout
    but cannot be perfect. Existing values are never overwritten, and the
    citation detector does not depend on it alone (it also uses the file name
    and the first lines of the text).
    """
    if not text:
        return

    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.splitlines()[:80]
        if line.strip()
    ]
    if not lines:
        return

    changed = []
    title_end = 0  # index of the last line used for the title

    # ---- title -------------------------------------------------------
    if not paper.title:
        for i, line in enumerate(lines[:12]):
            if _is_front_matter_noise(line):
                continue

            title = line
            title_end = i

            # Join up to two wrapped continuation lines.
            for _ in range(2):
                if title_end + 1 >= len(lines) or len(title) >= 200:
                    break
                nxt = lines[title_end + 1]
                words = title.rstrip(" :,-").split()
                last_word = words[-1].lower() if words else ""

                is_continuation = (
                    last_word in _TITLE_CONNECTORS
                    or title.endswith(":")
                    or nxt[:1].islower()
                    or (
                        _has_title_words(nxt)
                        and not _looks_like_authors(nxt)
                        and len(nxt) < 100
                    )
                )
                if not is_continuation or _is_front_matter_noise(nxt):
                    break

                title = f"{title} {nxt}"
                title_end += 1

            paper.title = title[:500]
            changed.append("title")
            break

    # ---- authors -----------------------------------------------------
    if not paper.authors:
        start = title_end + 1 if "title" in changed else 1
        for line in lines[start:start + 14]:
            if _looks_like_authors(line):
                authors = _YEAR_RE.sub("", line).strip(" ,.;")
                if authors:
                    paper.authors = authors[:500]
                    changed.append("authors")
                    break

    # ---- year --------------------------------------------------------
    if not paper.year:
        match = _YEAR_RE.search("\n".join(lines[:40]))
        if match:
            paper.year = int(match.group(1))
            changed.append("year")

    if changed:
        paper.save(update_fields=changed)


# ============================================================
# CITATION DETECTION (compatibility wrapper)
# ============================================================

def detect_citations(papers, paper_texts):
    """
    Compatibility wrapper around citation_detector.find_citations.

    Returns the dict format of the older pipeline:
        [{"citing_paper": Paper, "cited_paper": Paper}, ...]
    analyze_research() calls find_citations() directly.
    """
    return [
        {"citing_paper": citing, "cited_paper": cited}
        for citing, cited, _evidence in find_citations(papers, paper_texts)
    ]


# ============================================================
# PREREQUISITE DETECTION
# ============================================================

def _paper_label(paper):
    """A readable name for log messages and prerequisite reasons."""
    if paper.title:
        return paper.title
    name = getattr(paper.file, "name", "") or ""
    return os.path.basename(name) or f"Paper {paper.id}"


def detect_prerequisites(papers, paper_texts, citation_pairs=None):
    """
    Build prerequisite relationships from detected citations.

    A citation does NOT automatically mean a prerequisite. For now a
    prerequisite is created only when the citation is one-directional;
    mutual citations are skipped so circular relationships are never created.

    citation_pairs: optional list of (citing_paper, cited_paper) tuples. Pass
    the pairs you already computed to avoid running the detector twice; if
    omitted they are computed here.

    Returns a list of dicts: paper, prerequisite_paper, reason, confidence
    ("paper" requires "prerequisite_paper" to be read first).
    """
    if citation_pairs is None:
        citation_pairs = [
            (citing, cited)
            for citing, cited, _evidence in find_citations(papers, paper_texts)
        ]

    pairs = {
        (citing.id, cited.id)
        for citing, cited in citation_pairs
        if citing.id != cited.id
    }
    by_id = {paper.id: paper for paper in papers}

    results = []

    for citing_id, cited_id in sorted(pairs):
        if (cited_id, citing_id) in pairs:
            logger.info(
                "Skipping circular prerequisite: %s <-> %s",
                citing_id,
                cited_id,
            )
            continue

        citing_paper = by_id.get(citing_id)
        cited_paper = by_id.get(cited_id)
        if not citing_paper or not cited_paper:
            continue

        results.append(
            {
                "paper": citing_paper,
                "prerequisite_paper": cited_paper,
                "reason": (
                    f"{_paper_label(citing_paper)} references "
                    f"{_paper_label(cited_paper)}"
                ),
                # Fixed placeholder: citation-derived, not a calibrated score.
                "confidence": 0.75,
            }
        )

    logger.info("Prerequisite relationships detected: %s", len(results))
    return results


# ============================================================
# PER-PAPER ANALYSIS CACHE
# ============================================================

def _analysis_cache_key(text, topic):
    """Changes whenever the paper text, research topic or LLM model changes."""
    payload = {
        "text": text,
        "topic": topic or "",
        "model": getattr(settings, "LLM_MODEL", ""),
        "version": 2,
    }
    encoded = json.dumps(
        payload, sort_keys=True, ensure_ascii=False
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


# ============================================================
# PER-PAPER AI ANALYSIS
# ============================================================

def analyze_paper(paper: Paper, text: str, topic=None) -> bool:
    """
    Run all per-paper AI functionality.

    1. Cache extracted PDF text
    2. Index the full paper for AI Assistant / RAG
    3. Extract AI key points
    4. Extract deep paper analysis
    5. Assess relevance to the research topic
    6. Save everything into Paper.raw_ai_data (+ a short Paper.ai_summary)

    Each step fails independently, and a failure never discards a previous
    successful result. If the text, topic and model are unchanged since the
    last fully successful run, the LLM steps are skipped.

    Returns True if LLM calls were made (used for rate-limit spacing).
    """
    data = dict(paper.raw_ai_data or {})

    if not text:
        data["error"] = (
            "No extractable text found in this PDF "
            "(it may be scanned images)."
        )
        paper.text = ""
        paper.raw_ai_data = data
        paper.save(update_fields=["text", "raw_ai_data"])
        return False

    topic = topic or paper.research.topic
    cache_key = _analysis_cache_key(text, topic)
    cached = data.get("_analysis_cache") or {}

    # Skip only if the previous run fully succeeded AND indexing worked,
    # so chat retrieval is never left stale.
    if cached.get("key") == cache_key and not data.get("rag_index_error"):
        paper.text = text
        paper.save(update_fields=["text"])
        logger.info("Reusing cached analysis for paper %s", paper.id)
        return False

    paper.text = text

    # ---- RAG indexing (failure degrades chat only) -------------------
    try:
        index_paper(
            research_id=paper.research_id,
            paper_id=paper.id,
            paper_text=text,
        )
        data.pop("rag_index_error", None)
    except Exception:  # noqa: BLE001
        logger.exception(
            "Indexing failed for paper %s. "
            "AI Assistant retrieval may be degraded.",
            paper.id,
        )
        data["rag_index_error"] = (
            "Indexing failed; retrieval may be incomplete."
        )

    successful = set()

    # ---- key points --------------------------------------------------
    try:
        key_points = extract_key_points_rag(text)
        data["key_points"] = key_points
        data.pop("key_points_error", None)
        successful.add("key_points")

        if key_points:
            paper.ai_summary = " ".join(str(p) for p in key_points[:2])
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "LLM key-point extraction failed for paper %s", paper.id
        )
        data["key_points_error"] = str(exc)

    # ---- deep analysis -----------------------------------------------
    try:
        data["deep_analysis"] = extract_deep_analysis(text)
        data.pop("deep_analysis_error", None)
        successful.add("deep_analysis")
    except Exception as exc:  # noqa: BLE001
        logger.exception("Deep analysis failed for paper %s", paper.id)
        data["deep_analysis_error"] = str(exc)
        # Keep a previous good result; otherwise keep the old error shape.
        data.setdefault(
            "deep_analysis", {"error": f"Deep analysis failed: {exc}"}
        )

    # ---- relevance to research topic ---------------------------------
    if assess_paper_relevance is None:
        data.setdefault(
            "relevance",
            {
                "status": "unknown",
                "reason": "Relevance analysis is not available.",
                "evidence": "",
            },
        )
    else:
        try:
            data["relevance"] = assess_paper_relevance(topic, text)
            data.pop("relevance_error", None)
            successful.add("relevance")
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "Relevance assessment failed for paper %s", paper.id
            )
            data["relevance_error"] = str(exc)
            data.setdefault(
                "relevance",
                {
                    "status": "unknown",
                    "reason": f"Relevance assessment failed: {exc}",
                    "evidence": "",
                },
            )

    # Cache only when every AI step succeeded.
    if {"key_points", "deep_analysis", "relevance"} <= successful:
        data["_analysis_cache"] = {"key": cache_key}
    else:
        data.pop("_analysis_cache", None)

    # "error" drives papers_failed; it is only set if key points are missing.
    data["error"] = (
        "" if data.get("key_points") else data.get("key_points_error", "")
    )

    paper.raw_ai_data = data
    paper.save(update_fields=["text", "raw_ai_data", "ai_summary"])
    return True


# ============================================================
# PAIRWISE PAPER RELEVANCE
# ============================================================

def _save_pairwise_relevance(papers, paper_texts):
    """
    Compare each unique pair of papers and store PaperRelevance rows.

    A successful "relevant" result creates/updates the row; a successful
    "not relevant" result removes it; a FAILED comparison leaves any existing
    row untouched. Returns the number of newly created rows.
    """
    if assess_pairwise_relevance is None:
        logger.warning(
            "assess_pairwise_relevance not available; "
            "skipping pairwise relevance."
        )
        return 0

    created_count = 0
    total_pairs = len(papers) * (len(papers) - 1) // 2
    processed_pairs = 0

    for index, paper_a in enumerate(papers):
        for paper_b in papers[index + 1:]:
            processed_pairs += 1

            text_a = paper_texts.get(paper_a.id, "")
            text_b = paper_texts.get(paper_b.id, "")

            if not text_a or not text_b:
                logger.warning(
                    "Skipping pair %s/%s because text is missing.",
                    paper_a.id,
                    paper_b.id,
                )
                continue

            # Store each pair once, in a stable order.
            first, second = sorted(
                [paper_a, paper_b], key=lambda p: p.id
            )

            try:
                result = assess_pairwise_relevance(text_a, text_b)
                score = float(result.get("score", 0.0))

                is_relevant = (
                    result.get("relevant", False)
                    and score >= PAIRWISE_RELEVANCE_THRESHOLD
                )

                if is_relevant:
                    _, was_created = PaperRelevance.objects.update_or_create(
                        paper_a=first,
                        paper_b=second,
                        defaults={
                            "score": score,
                            "reason": result.get("reason", ""),
                            "evidence": result.get("evidence", ""),
                        },
                    )
                    if was_created:
                        created_count += 1

                    logger.info(
                        "Relevant pair found: %s <-> %s (%.3f)",
                        paper_a.id,
                        paper_b.id,
                        score,
                    )
                else:
                    PaperRelevance.objects.filter(
                        paper_a=first, paper_b=second
                    ).delete()

                    logger.info(
                        "No relevance edge: %s / %s (%.3f)",
                        paper_a.id,
                        paper_b.id,
                        score,
                    )

            except Exception:  # noqa: BLE001
                logger.exception(
                    "Pairwise relevance failed for papers %s and %s",
                    paper_a.id,
                    paper_b.id,
                )

            if (
                processed_pairs < total_pairs
                and SECONDS_BETWEEN_PAIRWISE_CALLS > 0
            ):
                time.sleep(SECONDS_BETWEEN_PAIRWISE_CALLS)

    return created_count


# ============================================================
# MAIN RESEARCH ANALYSIS
# ============================================================

def analyze_research(research):
    """
    Analyze every uploaded paper in a research session.

    Returns a summary dict:
        research_id, papers_processed, papers_failed,
        prerequisites_created, citations_created,
        paper_relevance_created, paper_relevance_count
    """
    if not isinstance(research, Research):
        raise ValueError("Invalid research object.")

    papers = list(research.papers.all().order_by("order_position", "id"))

    if not papers:
        raise ValueError("No papers were uploaded for this research.")

    logger.info("=== ANALYZING RESEARCH %s ===", research.id)
    logger.info("Papers found: %s", len(papers))

    # ---------------------------------------------------------
    # 1. Extract text once per paper, then metadata
    # ---------------------------------------------------------
    paper_texts = {}

    for paper in papers:
        try:
            text = _extract_pdf_text(paper.file)
        except Exception as exc:  # noqa: BLE001
            logger.exception("PDF extraction failed for paper %s", paper.id)
            text = ""
            paper.raw_ai_data = {
                **(paper.raw_ai_data or {}),
                "error": f"PDF extraction failed: {exc}",
            }
            paper.text = ""
            paper.save(update_fields=["text", "raw_ai_data"])

        paper_texts[paper.id] = text

        if text:
            try:
                extract_paper_metadata(paper, text)
            except Exception:  # noqa: BLE001
                logger.exception(
                    "Metadata extraction failed for paper %s", paper.id
                )

        logger.info(
            "Paper %s | %s | characters: %s | title: %r | authors: %r | year: %s",
            paper.id,
            getattr(paper.file, "name", ""),
            len(text),
            paper.title,
            paper.authors,
            paper.year,
        )

    # ---------------------------------------------------------
    # 2. Detect relationships (pure computation, no DB writes).
    #    The detector runs ONCE; citations and prerequisites share it.
    # ---------------------------------------------------------
    found = find_citations(papers, paper_texts, debug=CITATION_DEBUG)
    citation_pairs = [(citing, cited) for citing, cited, _evidence in found]

    prerequisite_results = detect_prerequisites(
        papers, paper_texts, citation_pairs
    )

    logger.info("Citations detected: %s", len(found))

    # ---------------------------------------------------------
    # 3. Replace stored relationships atomically, so a failure
    #    cannot leave the research with its old edges deleted
    #    and no new ones created.
    #    PaperRelevance rows are NOT touched here.
    # ---------------------------------------------------------
    with transaction.atomic():
        Prerequisite.objects.filter(paper__research=research).delete()
        Citation.objects.filter(citing_paper__research=research).delete()

        citations_created = save_citations(found)

        prerequisites_created = 0
        for item in prerequisite_results:
            paper = item["paper"]
            prerequisite_paper = item["prerequisite_paper"]

            if paper.id == prerequisite_paper.id:
                continue

            _, created = Prerequisite.objects.get_or_create(
                paper=paper,
                prerequisite_paper=prerequisite_paper,
                defaults={
                    "reason": item.get("reason", ""),
                    "confidence": item.get("confidence"),
                },
            )

            if created:
                prerequisites_created += 1

    logger.info("Prerequisites created: %s", prerequisites_created)
    logger.info("Citations created: %s", citations_created)

    # ---------------------------------------------------------
    # 4. AI paper analysis and RAG indexing
    # ---------------------------------------------------------
    papers_processed = 0
    papers_failed = 0
    previous_paper_used_llm = False

    for paper in papers:
        text = paper_texts.get(paper.id, "")

        # Respect API rate limits: pause only after a paper that actually
        # made LLM calls (no text or a cache hit makes none).
        if text and previous_paper_used_llm and SECONDS_BETWEEN_PAPERS > 0:
            time.sleep(SECONDS_BETWEEN_PAPERS)

        try:
            previous_paper_used_llm = bool(
                analyze_paper(paper, text, topic=research.topic)
            )
        except Exception as exc:  # noqa: BLE001
            # One unexpected failure must not stop the other papers.
            logger.exception("Analysis crashed for paper %s", paper.id)
            previous_paper_used_llm = bool(text)
            paper.raw_ai_data = {
                **(paper.raw_ai_data or {}),
                "error": f"Analysis failed: {exc}",
            }
            try:
                paper.save(update_fields=["raw_ai_data"])
            except Exception:  # noqa: BLE001
                logger.exception(
                    "Could not save error state for paper %s", paper.id
                )

        papers_processed += 1

        if (paper.raw_ai_data or {}).get("error"):
            papers_failed += 1

    # ---------------------------------------------------------
    # 5. Pairwise relevance (independent of citations)
    # ---------------------------------------------------------
    try:
        relevance_created = _save_pairwise_relevance(papers, paper_texts)
    except Exception:  # noqa: BLE001
        logger.exception("Pairwise relevance step crashed.")
        relevance_created = 0

    relevance_count = PaperRelevance.objects.filter(
        paper_a__research=research
    ).count()

    logger.info(
        "=== FULL ANALYSIS COMPLETE === citations=%s prerequisites=%s "
        "relevant_pairs=%s",
        citations_created,
        prerequisites_created,
        relevance_count,
    )

    return {
        "research_id": research.id,
        "papers_processed": papers_processed,
        "papers_failed": papers_failed,
        "prerequisites_created": prerequisites_created,
        "citations_created": citations_created,
        "paper_relevance_created": relevance_created,
        "paper_relevance_count": relevance_count,
    }