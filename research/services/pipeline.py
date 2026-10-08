# import re
# import pdfplumber

# from ..models import (
#     Research,
#     Prerequisite,
#     Citation,
# )


# def analyze_research(research):
#     """
#     Analyze all papers belonging to a research session.

#     Steps:
#     1. Validate research
#     2. Get uploaded papers
#     3. Extract PDF text
#     4. Detect citations
#     5. Detect prerequisites
#     6. Save relationships
#     """

#     if not isinstance(research, Research):
#         raise ValueError("Invalid research object.")

#     papers = list(research.papers.all())

#     if not papers:
#         raise ValueError("No papers were uploaded for this research.")

#     print(f"\n=== ANALYZING RESEARCH {research.id} ===")
#     print(f"Papers found: {len(papers)}")

#     # ---------------------------------------------------------
#     # Extract text from every PDF
#     # ---------------------------------------------------------

#     paper_texts = {}

#     for paper in papers:
#         print(f"Extracting: {paper.file.name}")

#         text = extract_pdf_text(paper.file.path)

#         paper_texts[paper.id] = text

#         print(
#             f"  Extracted {len(text)} characters"
#         )

#     # ---------------------------------------------------------
#     # Clear previous relationships
#     # ---------------------------------------------------------

#     Prerequisite.objects.filter(
#         paper__research=research
#     ).delete()

#     Citation.objects.filter(
#         citing_paper__research=research
#     ).delete()

#     # ---------------------------------------------------------
#     # Detect relationships
#     # ---------------------------------------------------------

#     prerequisite_results = detect_prerequisites(
#         papers,
#         paper_texts,
#     )

#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     # ---------------------------------------------------------
#     # Save prerequisites
#     # ---------------------------------------------------------

#     prerequisites_created = 0

#     for item in prerequisite_results:

#         paper = item["paper"]
#         prerequisite_paper = item["prerequisite_paper"]

#         if paper.id == prerequisite_paper.id:
#             continue

#         _, created = Prerequisite.objects.get_or_create(
#             paper=paper,
#             prerequisite_paper=prerequisite_paper,
#             defaults={
#                 "reason": item.get("reason", ""),
#                 "confidence": item.get("confidence"),
#             },
#         )

#         if created:
#             prerequisites_created += 1

#     # ---------------------------------------------------------
#     # Save citations
#     # ---------------------------------------------------------

#     citations_created = 0

#     for item in citation_results:

#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         if citing_paper.id == cited_paper.id:
#             continue

#         _, created = Citation.objects.get_or_create(
#             citing_paper=citing_paper,
#             cited_paper=cited_paper,
#         )

#         if created:
#             citations_created += 1

#     print("\n=== ANALYSIS COMPLETE ===")
#     print(
#         f"Prerequisites created: {prerequisites_created}"
#     )
#     print(
#         f"Citations created: {citations_created}"
#     )

#     return {
#         "research_id": research.id,
#         "papers_processed": len(papers),
#         "prerequisites_created": prerequisites_created,
#         "citations_created": citations_created,
#     }


# # ============================================================
# # PDF TEXT EXTRACTION
# # ============================================================

# def extract_pdf_text(file_path):
#     """
#     Extract text from a PDF.

#     IMPORTANT:
#     This function receives a FILE PATH string.
#     """

#     if not file_path:
#         return ""

#     text_parts = []

#     try:
#         with pdfplumber.open(file_path) as pdf:

#             for page in pdf.pages:

#                 page_text = page.extract_text()

#                 if page_text:
#                     text_parts.append(page_text)

#     except Exception as exc:
#         print(
#             f"PDF extraction failed for {file_path}: {exc}"
#         )
#         return ""

#     return "\n".join(text_parts)


# # ============================================================
# # CITATION DETECTION
# # ============================================================

# def detect_citations(papers, paper_texts):
#     """
#     Detect whether one uploaded paper appears to reference
#     another uploaded paper.

#     This is a basic local detector for now.
#     Later we can replace this with AI/NLP detection.
#     """

#     results = []

#     for citing_paper in papers:

#         citing_text = paper_texts.get(
#             citing_paper.id,
#             ""
#         ).lower()

#         if not citing_text:
#             continue

#         for cited_paper in papers:

#             if citing_paper.id == cited_paper.id:
#                 continue

#             # -------------------------------------------------
#             # Build possible identifiers for the cited paper
#             # -------------------------------------------------

#             identifiers = []

#             # File name
#             filename = cited_paper.file.name

#             if filename:
#                 filename = filename.split("/")[-1]

#                 filename_without_ext = re.sub(
#                     r"\.pdf$",
#                     "",
#                     filename,
#                     flags=re.IGNORECASE,
#                 )

#                 identifiers.append(
#                     filename_without_ext.lower()
#                 )

#             # Title
#             if cited_paper.title:
#                 identifiers.append(
#                     cited_paper.title.lower()
#                 )

#             # Author
#             if cited_paper.authors:
#                 first_author = (
#                     cited_paper.authors
#                     .split(",")[0]
#                     .strip()
#                     .lower()
#                 )

#                 if first_author:
#                     identifiers.append(first_author)

#             # -------------------------------------------------
#             # Check whether identifier appears in text
#             # -------------------------------------------------

#             found = False

#             for identifier in identifiers:

#                 if not identifier:
#                     continue

#                 # Make filename matching easier
#                 normalized_identifier = re.sub(
#                     r"[_\-]+",
#                     " ",
#                     identifier,
#                 )

#                 words = normalized_identifier.split()

#                 # Ignore extremely short identifiers
#                 words = [
#                     word
#                     for word in words
#                     if len(word) >= 4
#                 ]

#                 if not words:
#                     continue

#                 # If several meaningful filename/title words
#                 # appear in the citing paper, treat as a match.
#                 matches = sum(
#                     1
#                     for word in words
#                     if word in citing_text
#                 )

#                 if matches >= min(2, len(words)):
#                     found = True
#                     break

#             if found:

#                 print(
#                     f"CITATION FOUND: "
#                     f"{citing_paper.file.name} -> "
#                     f"{cited_paper.file.name}"
#                 )

#                 results.append(
#                     {
#                         "citing_paper": citing_paper,
#                         "cited_paper": cited_paper,
#                     }
#                 )

#     return results


# def detect_prerequisites(papers, paper_texts):
#     """
#     Build prerequisite relationships from detected citations.

#     A citation does NOT automatically mean a prerequisite.
#     For now, we create a prerequisite only when the citation
#     relationship is one-directional.

#     This also prevents circular prerequisite relationships.
#     """

#     results = []

#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     # Store citation pairs
#     citation_pairs = set()

#     for item in citation_results:
#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         if citing_paper.id == cited_paper.id:
#             continue

#         citation_pairs.add(
#             (citing_paper.id, cited_paper.id)
#         )

#     seen = set()

#     for citing_id, cited_id in citation_pairs:

#         # If the reverse relationship also exists,
#         # do NOT create a prerequisite in either direction.
#         if (cited_id, citing_id) in citation_pairs:
#             print(
#                 f"Skipping circular prerequisite: "
#                 f"{citing_id} <-> {cited_id}"
#             )
#             continue

#         key = (citing_id, cited_id)

#         if key in seen:
#             continue

#         seen.add(key)

#         citing_paper = next(
#             (
#                 paper
#                 for paper in papers
#                 if paper.id == citing_id
#             ),
#             None,
#         )

#         cited_paper = next(
#             (
#                 paper
#                 for paper in papers
#                 if paper.id == cited_id
#             ),
#             None,
#         )

#         if not citing_paper or not cited_paper:
#             continue

#         results.append(
#             {
#                 "paper": citing_paper,
#                 "prerequisite_paper": cited_paper,
#                 "reason": (
#                     f"{citing_paper.title or citing_paper.file.name} "
#                     f"references "
#                     f"{cited_paper.title or cited_paper.file.name}"
#                 ),
#                 "confidence": 0.75,
#             }
#         )

#     print(
#         f"Prerequisite relationships detected: {len(results)}"
#     )

#     return results

import logging
import re
import time

import pdfplumber
from django.conf import settings

from ..models import (
    Research,
    Paper,
    Prerequisite,
    Citation,
)

from .rag_paper_analysis import extract_key_points_rag
from .deep_paper_analysis import extract_deep_analysis
from .rag_retriever import index_paper


logger = logging.getLogger(__name__)

LLM_BASE_URL = getattr(
    settings,
    "LLM_BASE_URL",
    "https://api.groq.com/openai/v1",
)

LLM_MODEL = getattr(
    settings,
    "LLM_MODEL",
    "openai/gpt-oss-120b",
)

LLM_API_KEY = getattr(
    settings,
    "LLM_API_KEY",
    "",
)

# Only the AI analysis steps need spacing for API rate limits.
SECONDS_BETWEEN_PAPERS = 4


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def _extract_pdf_text(file_field):
    """
    Extract text from an uploaded Paper PDF.

    The same extracted text is used by:
    - citation detection
    - prerequisite detection
    - Paper Analysis
    - AI Assistant / RAG indexing

    This avoids parsing the same PDF multiple times.
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


# Keep the old function name available in case another part
# of the project imports it directly.
def extract_pdf_text(file_path):
    """
    Extract text from a PDF file path.

    This compatibility helper preserves the original function
    from the user's pipeline.
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

    except Exception as exc:
        logger.exception(
            "PDF extraction failed for %s",
            file_path,
        )
        return ""

    return "\n".join(text_parts).strip()


# ============================================================
# CITATION DETECTION
# ============================================================

def detect_citations(papers, paper_texts):
    """
    Detect whether one uploaded paper appears to reference
    another uploaded paper.

    This remains a local rule-based detector.
    No LLM call is required here.
    """

    results = []

    for citing_paper in papers:

        citing_text = paper_texts.get(
            citing_paper.id,
            "",
        ).lower()

        if not citing_text:
            continue

        for cited_paper in papers:

            if citing_paper.id == cited_paper.id:
                continue

            # -------------------------------------------------
            # Build possible identifiers for the cited paper
            # -------------------------------------------------

            identifiers = []

            # File name
            filename = cited_paper.file.name

            if filename:
                filename = filename.split("/")[-1]

                filename_without_ext = re.sub(
                    r"\.pdf$",
                    "",
                    filename,
                    flags=re.IGNORECASE,
                )

                identifiers.append(
                    filename_without_ext.lower()
                )

            # Paper title
            if cited_paper.title:
                identifiers.append(
                    cited_paper.title.lower()
                )

            # First author
            if cited_paper.authors:
                first_author = (
                    cited_paper.authors
                    .split(",")[0]
                    .strip()
                    .lower()
                )

                if first_author:
                    identifiers.append(first_author)

            # -------------------------------------------------
            # Check identifiers against citing paper text
            # -------------------------------------------------

            found = False

            for identifier in identifiers:

                if not identifier:
                    continue

                normalized_identifier = re.sub(
                    r"[_\-]+",
                    " ",
                    identifier,
                )

                words = normalized_identifier.split()

                # Ignore extremely short words.
                words = [
                    word
                    for word in words
                    if len(word) >= 4
                ]

                if not words:
                    continue

                matches = sum(
                    1
                    for word in words
                    if word in citing_text
                )

                if matches >= min(2, len(words)):
                    found = True
                    break

            if found:

                logger.info(
                    "CITATION FOUND: %s -> %s",
                    citing_paper.file.name,
                    cited_paper.file.name,
                )

                results.append(
                    {
                        "citing_paper": citing_paper,
                        "cited_paper": cited_paper,
                    }
                )

    return results


# ============================================================
# PREREQUISITE DETECTION
# ============================================================

def detect_prerequisites(papers, paper_texts):
    """
    Build prerequisite relationships from detected citations.

    A citation does NOT automatically mean a prerequisite.

    For now, a prerequisite is created only when the citation
    relationship is one-directional.

    Reverse relationships are ignored so circular prerequisite
    relationships are not created.
    """

    results = []

    citation_results = detect_citations(
        papers,
        paper_texts,
    )

    citation_pairs = set()

    for item in citation_results:

        citing_paper = item["citing_paper"]
        cited_paper = item["cited_paper"]

        if citing_paper.id == cited_paper.id:
            continue

        citation_pairs.add(
            (
                citing_paper.id,
                cited_paper.id,
            )
        )

    seen = set()

    for citing_id, cited_id in citation_pairs:

        # If the reverse relationship also exists,
        # don't create a prerequisite in either direction.
        if (cited_id, citing_id) in citation_pairs:

            logger.info(
                "Skipping circular prerequisite: %s <-> %s",
                citing_id,
                cited_id,
            )

            continue

        key = (
            citing_id,
            cited_id,
        )

        if key in seen:
            continue

        seen.add(key)

        citing_paper = next(
            (
                paper
                for paper in papers
                if paper.id == citing_id
            ),
            None,
        )

        cited_paper = next(
            (
                paper
                for paper in papers
                if paper.id == cited_id
            ),
            None,
        )

        if not citing_paper or not cited_paper:
            continue

        results.append(
            {
                "paper": citing_paper,
                "prerequisite_paper": cited_paper,
                "reason": (
                    f"{citing_paper.title or citing_paper.file.name} "
                    f"references "
                    f"{cited_paper.title or cited_paper.file.name}"
                ),
                "confidence": 0.75,
            }
        )

    logger.info(
        "Prerequisite relationships detected: %s",
        len(results),
    )

    return results


# ============================================================
# PAPER ANALYSIS
# ============================================================

def analyze_paper(paper, text):
    """
    Run all per-paper AI functionality.

    1. Cache extracted PDF text
    2. Index full paper for AI Assistant / RAG
    3. Extract AI key points
    4. Extract deep paper analysis
    5. Save results into Paper.raw_ai_data
    6. Save a short Paper.ai_summary
    """

    if not text:

        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": (
                "No extractable text found in this PDF "
                "(it may be scanned images)."
            ),
        }

        paper.text = ""

        paper.save(
            update_fields=[
                "text",
                "raw_ai_data",
            ]
        )

        return

    # ---------------------------------------------------------
    # Save extracted text
    # ---------------------------------------------------------

    paper.text = text

    # ---------------------------------------------------------
    # Index FULL paper for AI Assistant / RAG
    #
    # A failure here should NOT prevent Paper Analysis.
    # ---------------------------------------------------------

    try:

        index_paper(
            research_id=paper.research_id,
            paper_id=paper.id,
            paper_text=text,
        )

    except Exception:
        logger.exception(
            "Indexing failed for paper %s. "
            "AI Assistant retrieval may be degraded.",
            paper.id,
        )

    # ---------------------------------------------------------
    # AI key points
    # ---------------------------------------------------------

    try:

        key_points = extract_key_points_rag(text)

    except Exception as exc:

        logger.exception(
            "LLM key-point extraction failed for paper %s",
            paper.id,
        )

        paper.raw_ai_data = {
            **(paper.raw_ai_data or {}),
            "error": f"AI analysis failed: {exc}",
        }

        paper.save(
            update_fields=[
                "text",
                "raw_ai_data",
            ]
        )

        return

    # ---------------------------------------------------------
    # Deep analysis
    # ---------------------------------------------------------

    try:

        deep_analysis = extract_deep_analysis(text)

    except Exception as exc:

        logger.exception(
            "Deep analysis failed for paper %s",
            paper.id,
        )

        # Deep analysis failing should not destroy
        # successful key-point analysis.
        deep_analysis = {
            "error": f"Deep analysis failed: {exc}",
        }

    # ---------------------------------------------------------
    # Save all AI results
    # ---------------------------------------------------------

    paper.raw_ai_data = {
        **(paper.raw_ai_data or {}),
        "key_points": key_points,
        "deep_analysis": deep_analysis,
        "error": "",
    }

    if key_points:

        paper.ai_summary = " ".join(
            key_points[:2]
        )

    paper.save(
        update_fields=[
            "text",
            "raw_ai_data",
            "ai_summary",
        ]
    )


# ============================================================
# MAIN RESEARCH ANALYSIS
# ============================================================

def analyze_research(research):
    """
    Analyze every uploaded paper in a research session.

    The pipeline performs:

    1. Validate research
    2. Get uploaded papers
    3. Extract each PDF once
    4. Cache extracted text in Paper.text
    5. Detect citations
    6. Detect prerequisites
    7. Save relationships
    8. Index papers for AI Assistant
    9. Generate AI key points
    10. Generate deep Paper Analysis
    """

    if not isinstance(research, Research):
        raise ValueError(
            "Invalid research object."
        )

    papers = list(
        research.papers.all()
    )

    if not papers:
        raise ValueError(
            "No papers were uploaded for this research."
        )

    logger.info(
        "=== ANALYZING RESEARCH %s ===",
        research.id,
    )

    logger.info(
        "Papers found: %s",
        len(papers),
    )

    # ========================================================
    # EXTRACT TEXT ONCE PER PAPER
    # ========================================================

    paper_texts = {}

    for paper in papers:

        logger.info(
            "Extracting: %s",
            paper.file.name,
        )

        try:

            text = _extract_pdf_text(
                paper.file
            )

        except Exception as exc:

            logger.exception(
                "PDF extraction failed for paper %s",
                paper.id,
            )

            text = ""

            paper.raw_ai_data = {
                **(paper.raw_ai_data or {}),
                "error": (
                    f"PDF extraction failed: {exc}"
                ),
            }

            paper.text = ""

            paper.save(
                update_fields=[
                    "text",
                    "raw_ai_data",
                ]
            )

        paper_texts[paper.id] = text

        logger.info(
            "Extracted %s characters from %s",
            len(text),
            paper.file.name,
        )

    # ========================================================
    # CLEAR OLD RELATIONSHIPS
    # ========================================================

    Prerequisite.objects.filter(
        paper__research=research
    ).delete()

    Citation.objects.filter(
        citing_paper__research=research
    ).delete()

    # ========================================================
    # DETECT RELATIONSHIPS
    # ========================================================

    prerequisite_results = detect_prerequisites(
        papers,
        paper_texts,
    )

    citation_results = detect_citations(
        papers,
        paper_texts,
    )

    # ========================================================
    # SAVE PREREQUISITES
    # ========================================================

    prerequisites_created = 0

    for item in prerequisite_results:

        paper = item["paper"]

        prerequisite_paper = item[
            "prerequisite_paper"
        ]

        if paper.id == prerequisite_paper.id:
            continue

        _, created = Prerequisite.objects.get_or_create(
            paper=paper,
            prerequisite_paper=prerequisite_paper,
            defaults={
                "reason": item.get(
                    "reason",
                    "",
                ),
                "confidence": item.get(
                    "confidence"
                ),
            },
        )

        if created:
            prerequisites_created += 1

    # ========================================================
    # SAVE CITATIONS
    # ========================================================

    citations_created = 0

    for item in citation_results:

        citing_paper = item[
            "citing_paper"
        ]

        cited_paper = item[
            "cited_paper"
        ]

        if citing_paper.id == cited_paper.id:
            continue

        _, created = Citation.objects.get_or_create(
            citing_paper=citing_paper,
            cited_paper=cited_paper,
        )

        if created:
            citations_created += 1

    logger.info(
        "=== CITATION/PREREQUISITE DETECTION COMPLETE ==="
    )

    logger.info(
        "Prerequisites created: %s",
        prerequisites_created,
    )

    logger.info(
        "Citations created: %s",
        citations_created,
    )

    # ========================================================
    # AI PAPER ANALYSIS + RAG INDEXING
    # ========================================================

    papers_processed = 0
    papers_failed = 0

    total_papers = len(papers)

    for index, paper in enumerate(papers):

        analyze_paper(
            paper,
            paper_texts.get(
                paper.id,
                "",
            ),
        )

        papers_processed += 1

        if (paper.raw_ai_data or {}).get(
            "error"
        ):
            papers_failed += 1

        # Respect API rate limits between papers.
        if index < total_papers - 1:
            time.sleep(
                SECONDS_BETWEEN_PAPERS
            )

    logger.info(
        "=== FULL ANALYSIS COMPLETE ==="
    )

    return {
        "research_id": research.id,
        "papers_processed": papers_processed,
        "papers_failed": papers_failed,
        "prerequisites_created": (
            prerequisites_created
        ),
        "citations_created": (
            citations_created
        ),
    }