# import logging
# import re
# import time

# import pdfplumber
# from django.conf import settings

# from ..models import (
#     Research,
#     Paper,
#     Prerequisite,
#     Citation,
# )

# from .rag_paper_analysis import extract_key_points_rag
# from .deep_paper_analysis import extract_deep_analysis
# from .rag_retriever import index_paper
# from .relevance_analysis import assess_paper_relevance

# logger = logging.getLogger(__name__)

# LLM_BASE_URL = getattr(
#     settings,
#     "LLM_BASE_URL",
#     "https://api.groq.com/openai/v1",
# )

# LLM_MODEL = getattr(
#     settings,
#     "LLM_MODEL",
#     "openai/gpt-oss-120b",
# )

# LLM_API_KEY = getattr(
#     settings,
#     "LLM_API_KEY",
#     "",
# )

# # Only the AI analysis steps need spacing for API rate limits.
# SECONDS_BETWEEN_PAPERS = 4


# # ============================================================
# # PDF TEXT EXTRACTION
# # ============================================================

# def _extract_pdf_text(file_field):
#     """
#     Extract text from an uploaded Paper PDF.

#     The same extracted text is used by:
#     - citation detection
#     - prerequisite detection
#     - Paper Analysis
#     - AI Assistant / RAG indexing

#     This avoids parsing the same PDF multiple times.
#     """

#     if not file_field:
#         return ""

#     text_parts = []

#     file_field.open("rb")

#     try:
#         with pdfplumber.open(file_field) as pdf:
#             for page in pdf.pages:
#                 page_text = page.extract_text()

#                 if page_text:
#                     text_parts.append(page_text)

#     finally:
#         file_field.close()

#     return "\n".join(text_parts).strip()


# # Keep the old function name available in case another part
# # of the project imports it directly.
# def extract_pdf_text(file_path):
#     """
#     Extract text from a PDF file path.

#     This compatibility helper preserves the original function
#     from the user's pipeline.
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
#         logger.exception(
#             "PDF extraction failed for %s",
#             file_path,
#         )
#         return ""

#     return "\n".join(text_parts).strip()


# # ============================================================
# # CITATION DETECTION
# # ============================================================


# # ============================================================
# # CITATION DETECTION
# # ============================================================


# def extract_paper_metadata(paper, text):
#     lines = [
#         re.sub(r"\s+", " ", line).strip()
#         for line in text.splitlines()
#         if line.strip()
#     ]

#     if not lines:
#         return

#     if not paper.title:
#         paper.title = lines[0][:500]

#     skip_phrases = {
#         "invited paper",
#         "abstract",
#         "introduction",
#         "contents",
#     }

#     # Find a plausible author line near the beginning.
#     if not paper.authors:
#         for line in lines[1:15]:
#             cleaned = line.strip(" ,.;")

#             if cleaned.lower() in skip_phrases:
#                 continue

#             if len(cleaned) > 250:
#                 continue

#             if re.search(
#                 r"\b(university|department|institute|school|"
#                 r"abstract|copyright|received|published)\b",
#                 cleaned,
#                 re.IGNORECASE,
#             ):
#                 continue

#             # Skip likely title continuation lines.
#             if any(
#                 word in cleaned.lower()
#                 for word in [
#                     "handshake protocol",
#                     "network devices",
#                 ]
#             ):
#                 continue

#             if re.search(r"[A-Za-z]{3,}", cleaned):
#                 paper.authors = cleaned[:500]
#                 break

#     # Find a likely publication year near the beginning.
#     if not paper.year:
#         year_match = re.search(
#             r"\b(19|20)\d{2}\b",
#             "\n".join(lines[:40]),
#         )

#         if year_match:
#             paper.year = int(year_match.group())

#     paper.save(
#         update_fields=["title", "authors", "year"]
#     )



# def detect_citations(papers, paper_texts):
#     """
#     Detect citation relationships between uploaded papers.
#     """

#     results = []

#     def normalize(value):
#         value = (value or "").lower()
#         value = re.sub(r"[^a-z0-9]+", " ", value)
#         return " ".join(value.split())

#     def get_first_author_surname(paper):
#         authors = (paper.authors or "").strip()

#         if not authors:
#             return ""

#         first_author = authors.split(";")[0].strip()

#         if "," in first_author:
#             return first_author.split(",")[0].strip()

#         return first_author.split()[-1]

#     def get_year(paper):
#         return str(paper.year) if paper.year else None

#     for cited_paper in papers:
#         surname = get_first_author_surname(cited_paper)
#         year = get_year(cited_paper)
#         cited_title = normalize(cited_paper.title)

#         filename = ""
#         if cited_paper.file:
#             filename = cited_paper.file.name.split("/")[-1]
#             filename = re.sub(
#                 r"\.pdf$", "", filename,
#                 flags=re.IGNORECASE
#             )

#         filename = normalize(filename)

#         citation_keys = set()

#         if surname and year:
#             surname_key = re.sub(
#                 r"[^a-z]", "", surname.lower()
#             )
#             citation_keys.add(
#                 f"{surname_key}{year[-2:]}"
#             )

#         for citing_paper in papers:
#             if citing_paper.id == cited_paper.id:
#                 continue

#             citing_text = paper_texts.get(
#                 citing_paper.id, ""
#             )
#             normalized_text = normalize(citing_text)

#             if not normalized_text:
#                 continue

#             found = False

#             # 1. Full title
#             if cited_title and len(cited_title) >= 12:
#                 if cited_title in normalized_text:
#                     found = True

#             # 2. Filename
#             if not found and filename and len(filename) >= 8:
#                 if filename in normalized_text:
#                     found = True

#             # 3. Author-year patterns
#             if not found and surname and year:
#                 surname_pattern = re.escape(surname)

#                 author_year_patterns = [
#                     rf"\b{surname_pattern}\s+et\s+al\.?,?\s*\(?{year}\)?\b",
#                     rf"\b{surname_pattern}\s*[,;]\s*{year}\b",
#                     rf"\b{surname_pattern}\s*\(\s*{year}\s*\)",
#                 ]

#                 for pattern in author_year_patterns:
#                     if re.search(
#                         pattern, citing_text,
#                         re.IGNORECASE
#                     ):
#                         found = True
#                         break

#             # 4. Derived citation keys
#             if not found:
#                 for key in citation_keys:
#                     if re.search(
#                         rf"(?<![a-z0-9]){re.escape(key)}(?![a-z0-9])",
#                         citing_text,
#                         re.IGNORECASE
#                     ):
#                         found = True
#                         break

#             if found:
#                 logger.info(
#                     "CITATION FOUND: %s -> %s",
#                     citing_paper.file.name,
#                     cited_paper.file.name,
#                 )

#                 results.append({
#                     "citing_paper": citing_paper,
#                     "cited_paper": cited_paper,
#                 })

#     logger.info(
#         "Total citation relationships detected: %s",
#         len(results)
#     )

#     return results



# # ============================================================
# # PREREQUISITE DETECTION
# # ============================================================

# def detect_prerequisites(papers, paper_texts):
#     """
#     Build prerequisite relationships from detected citations.

#     A citation does NOT automatically mean a prerequisite.

#     For now, a prerequisite is created only when the citation
#     relationship is one-directional.

#     Reverse relationships are ignored so circular prerequisite
#     relationships are not created.
#     """

#     results = []

#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     citation_pairs = set()

#     for item in citation_results:

#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         if citing_paper.id == cited_paper.id:
#             continue

#         citation_pairs.add(
#             (
#                 citing_paper.id,
#                 cited_paper.id,
#             )
#         )

#     seen = set()

#     for citing_id, cited_id in citation_pairs:

#         # If the reverse relationship also exists,
#         # don't create a prerequisite in either direction.
#         if (cited_id, citing_id) in citation_pairs:

#             logger.info(
#                 "Skipping circular prerequisite: %s <-> %s",
#                 citing_id,
#                 cited_id,
#             )

#             continue

#         key = (
#             citing_id,
#             cited_id,
#         )

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

#     logger.info(
#         "Prerequisite relationships detected: %s",
#         len(results),
#     )

#     return results


# # ============================================================
# # PAPER ANALYSIS
# # ============================================================

# def analyze_paper(paper, text):
#     """
#     Run all per-paper AI functionality.

#     1. Cache extracted PDF text
#     2. Index full paper for AI Assistant / RAG
#     3. Extract AI key points
#     4. Extract deep paper analysis
#     5. Save results into Paper.raw_ai_data
#     6. Save a short Paper.ai_summary
#     """

#     if not text:

#         paper.raw_ai_data = {
#             **(paper.raw_ai_data or {}),
#             "error": (
#                 "No extractable text found in this PDF "
#                 "(it may be scanned images)."
#             ),
#         }

#         paper.text = ""

#         paper.save(
#             update_fields=[
#                 "text",
#                 "raw_ai_data",
#             ]
#         )

#         return

#     # ---------------------------------------------------------
#     # Save extracted text
#     # ---------------------------------------------------------

#     paper.text = text

#     # ---------------------------------------------------------
#     # Index FULL paper for AI Assistant / RAG
#     #
#     # A failure here should NOT prevent Paper Analysis.
#     # ---------------------------------------------------------

#     try:

#         index_paper(
#             research_id=paper.research_id,
#             paper_id=paper.id,
#             paper_text=text,
#         )

#     except Exception:
#         logger.exception(
#             "Indexing failed for paper %s. "
#             "AI Assistant retrieval may be degraded.",
#             paper.id,
#         )

#     # ---------------------------------------------------------
#     # AI key points
#     # ---------------------------------------------------------

#     try:

#         key_points = extract_key_points_rag(text)

#     except Exception as exc:

#         logger.exception(
#             "LLM key-point extraction failed for paper %s",
#             paper.id,
#         )

#         paper.raw_ai_data = {
#             **(paper.raw_ai_data or {}),
#             "error": f"AI analysis failed: {exc}",
#         }

#         paper.save(
#             update_fields=[
#                 "text",
#                 "raw_ai_data",
#             ]
#         )

#         return

#     # ---------------------------------------------------------
#     # Deep analysis
#     # ---------------------------------------------------------

#     try:

#         deep_analysis = extract_deep_analysis(text)

#     except Exception as exc:

#         logger.exception(
#             "Deep analysis failed for paper %s",
#             paper.id,
#         )

#         # Deep analysis failing should not destroy
#         # successful key-point analysis.
#         deep_analysis = {
#             "error": f"Deep analysis failed: {exc}",
#         }

#     # ---------------------------------------------------------
#     # Relevance assessment against the actual research topic
#     # ---------------------------------------------------------

#     try:
#         relevance = assess_paper_relevance(
#             paper.research.topic,
#             text,
#         )
#     except Exception as exc:
#         logger.exception(
#             "Relevance assessment failed for paper %s",
#             paper.id,
#         )
#         relevance = {
#             "status": "unknown",
#             "reason": f"Relevance assessment failed: {exc}",
#             "evidence": "",
#         }

#     # ---------------------------------------------------------
#     # Save all AI results
#     # ---------------------------------------------------------

#     paper.raw_ai_data = {
#         **(paper.raw_ai_data or {}),
#         "key_points": key_points,
#         "deep_analysis": deep_analysis,
#         "relevance": relevance,
#         "error": "",
#     }

#     if key_points:
#         paper.ai_summary = " ".join(key_points[:2])

#     paper.save(
#         update_fields=[
#             "text",
#             "raw_ai_data",
#             "ai_summary",
#         ]
#     )


# # ============================================================
# # MAIN RESEARCH ANALYSIS
# # ============================================================
# print("### ANALYSIS FILE LOADED ###")
# # def analyze_research(research):
# #     print("### ANALYZE_RESEARCH STARTED ###")
# #     """
# #     Analyze every uploaded paper in a research session.

# #     The pipeline performs:

# #     1. Validate research
# #     2. Get uploaded papers
# #     3. Extract each PDF once
# #     4. Cache extracted text in Paper.text
# #     5. Detect citations
# #     6. Detect prerequisites
# #     7. Save relationships
# #     8. Index papers for AI Assistant
# #     9. Generate AI key points
# #     10. Generate deep Paper Analysis
# #     """

# #     if not isinstance(research, Research):
# #         raise ValueError(
# #             "Invalid research object."
# #         )

# #     papers = list(
# #         research.papers.all()
# #     )

# #     if not papers:
# #         raise ValueError(
# #             "No papers were uploaded for this research."
# #         )

# #     logger.info(
# #         "=== ANALYZING RESEARCH %s ===",
# #         research.id,
# #     )

# #     logger.info(
# #         "Papers found: %s",
# #         len(papers),
# #     )

# #     # ========================================================
# #     # EXTRACT TEXT ONCE PER PAPER
# #     # ========================================================

# #     paper_texts = {}

# #     for paper in papers:

# #         logger.info(
# #             "Extracting: %s",
# #             paper.file.name,
# #         )

# #         try:

# #             text = _extract_pdf_text(
# #                 paper.file
# #             )

# #         except Exception as exc:

# #             logger.exception(
# #                 "PDF extraction failed for paper %s",
# #                 paper.id,
# #             )

# #             text = ""

# #             paper.raw_ai_data = {
# #                 **(paper.raw_ai_data or {}),
# #                 "error": (
# #                     f"PDF extraction failed: {exc}"
# #                 ),
# #             }

# #             paper.text = ""

# #             paper.save(
# #                 update_fields=[
# #                     "text",
# #                     "raw_ai_data",
# #                 ]
# #             )

# #         paper_texts[paper.id] = text

# #         logger.info(
# #     "PAPER TEXT CHECK: %s | characters: %s | year: %s | authors: %s",
# #     paper.file.name,
# #     len(text),
# #     paper.year,
# #     paper.authors,
# # )

# #         logger.info(
# #             "Extracted %s characters from %s",
# #             len(text),
# #             paper.file.name,
# #         )

# #     # ========================================================
# #     # CLEAR OLD RELATIONSHIPS
# #     # ========================================================

# #     Prerequisite.objects.filter(
# #         paper__research=research
# #     ).delete()

# #     Citation.objects.filter(
# #         citing_paper__research=research
# #     ).delete()

# #     # ========================================================
# #     # DETECT RELATIONSHIPS
# #     # ========================================================

# #     prerequisite_results = detect_prerequisites(
# #         papers,
# #         paper_texts,
# #     )
# #     print("### PAPER TEXT DIAGNOSTIC ###")
# # for paper in papers:
# #     text = paper_texts.get(paper.id, "")
# #     print(
# #         f"Paper ID: {paper.id} | "
# #         f"Title: {paper.title} | "
# #         f"Year: {paper.year} | "
# #         f"Authors: {paper.authors} | "
# #         f"Extracted characters: {len(text)}"
# #     )
# #     print("Text preview:", repr(text[:300]))
# #     print("### CALLING CITATION DETECTOR ###")
# #     citation_results = detect_citations(papers, paper_texts)
# # print("### DETECTED CITATION COUNT:", len(citation_results), "###")
# #     # citation_results = detect_citations(
# #     #     papers,
# #     #     paper_texts,
# #     # )

# #     # ========================================================
# #     # SAVE PREREQUISITES
# #     # ========================================================

# # prerequisites_created = 0

# # for item in prerequisite_results:

# #         paper = item["paper"]

# #         prerequisite_paper = item[
# #             "prerequisite_paper"
# #         ]

# #         if paper.id == prerequisite_paper.id:
# #             continue

# #         _, created = Prerequisite.objects.get_or_create(
# #             paper=paper,
# #             prerequisite_paper=prerequisite_paper,
# #             defaults={
# #                 "reason": item.get(
# #                     "reason",
# #                     "",
# #                 ),
# #                 "confidence": item.get(
# #                     "confidence"
# #                 ),
# #             },
# #         )

# #         if created:
# #             prerequisites_created += 1

# #     # ========================================================
# #     # SAVE CITATIONS
# #     # ========================================================

# # citations_created = 0

# # for item in citation_results:

# #         citing_paper = item[
# #             "citing_paper"
# #         ]

# #         cited_paper = item[
# #             "cited_paper"
# #         ]

# #         if citing_paper.id == cited_paper.id:
# #             continue

# #         _, created = Citation.objects.get_or_create(
# #             citing_paper=citing_paper,
# #             cited_paper=cited_paper,
# #         )

# #         if created:
# #             citations_created += 1

# # logger.info(
# #         "=== CITATION/PREREQUISITE DETECTION COMPLETE ==="
# #     )

# # logger.info(
# #         "Prerequisites created: %s",
# #         prerequisites_created,
# #     )

# # logger.info(
# #         "Citations created: %s",
# #         citations_created,
# #     )

# #     # ========================================================
# #     # AI PAPER ANALYSIS + RAG INDEXING
# #     # ========================================================

# # papers_processed = 0
# # papers_failed = 0

# # total_papers = len(papers)

# # for index, paper in enumerate(papers):

# #         analyze_paper(
# #             paper,
# #             paper_texts.get(
# #                 paper.id,
# #                 "",
# #             ),
# #         )

# #         papers_processed += 1

# #         if (paper.raw_ai_data or {}).get(
# #             "error"
# #         ):
# #             papers_failed += 1

# #         # Respect API rate limits between papers.
# #         if index < total_papers - 1:
# #             time.sleep(
# #                 SECONDS_BETWEEN_PAPERS
# #             )

# # logger.info(
# #         "=== FULL ANALYSIS COMPLETE ==="
# #     )

# # return {
# #         "research_id": research.id,
# #         "papers_processed": papers_processed,
# #         "papers_failed": papers_failed,
# #         "prerequisites_created": (
# #             prerequisites_created
# #         ),
# #         "citations_created": (
# #             citations_created
# #         ),
# #     }


# print("### ANALYSIS FILE LOADED ###")


# def analyze_research(research):
#     print("### ANALYZE_RESEARCH STARTED ###")

#     """
#     Analyze every uploaded paper in a research session.
#     """

#     if not isinstance(research, Research):
#         raise ValueError("Invalid research object.")

#     papers = list(research.papers.all())

#     if not papers:
#         raise ValueError(
#             "No papers were uploaded for this research."
#         )

#     logger.info("=== ANALYZING RESEARCH %s ===", research.id)
#     logger.info("Papers found: %s", len(papers))

#     # --------------------------------------------------------
#     # Extract text once per paper
#     # --------------------------------------------------------

#     paper_texts = {}

#     for paper in papers:
#         print("Extracting:", paper.file.name)

#         try:
#             text = _extract_pdf_text(paper.file)

#         except Exception as exc:
#             logger.exception(
#                 "PDF extraction failed for paper %s",
#                 paper.id,
#             )

#             text = ""

#             paper.raw_ai_data = {
#                 **(paper.raw_ai_data or {}),
#                 "error": f"PDF extraction failed: {exc}",
#             }

#             paper.text = ""

#             paper.save(
#                 update_fields=["text", "raw_ai_data"]
#             )

#         paper_texts[paper.id] = text
#         if text:
#          extract_paper_metadata(paper, text)

#         print(
#            "METADATA CHECK:",
#             paper.title,
#            "|",
#            paper.authors,
#            "|",
#            paper.year,
# )  

#         print(
#             "PAPER TEXT CHECK:",
#             paper.file.name,
#             "| characters:",
#             len(text),
#             "| year:",
#             paper.year,
#             "| authors:",
#             paper.authors,
#         )

#     # --------------------------------------------------------
#     # Clear old relationships
#     # --------------------------------------------------------

#     Prerequisite.objects.filter(
#         paper__research=research
#     ).delete()

#     Citation.objects.filter(
#         citing_paper__research=research
#     ).delete()

#     # --------------------------------------------------------
#     # Diagnostic: inspect extracted text
#     # --------------------------------------------------------

#     print("### PAPER TEXT DIAGNOSTIC ###")

#     for paper in papers:
#         text = paper_texts.get(paper.id, "")

#         print(
#             f"Paper ID: {paper.id} | "
#             f"Title: {paper.title} | "
#             f"Year: {paper.year} | "
#             f"Authors: {paper.authors} | "
#             f"Extracted characters: {len(text)}"
#         )

#         print("Text preview:", repr(text[:300]))

#     # --------------------------------------------------------
#     # Detect relationships
#     # --------------------------------------------------------
     
#     print("### REFERENCE SECTION PREVIEW ###")

#     for paper in papers:
#        text = paper_texts.get(paper.id, "")

#        match = re.search(
#         r"(?im)^\s*(references|bibliography|works cited)\s*$",
#         text,
#     )

#     print("\nPAPER:", paper.id, paper.title)

#     if match:
#         print(text[match.start():match.start() + 1800])
#     else:
#         print("No reference heading found.")


#     print("### REFERENCE SECTION PREVIEW ###")

# for paper in papers:
#     text = paper_texts.get(paper.id, "")

#     match = re.search(
#         r"(?im)^\s*(?:\d+\.?\s*)?(references|bibliography|works cited)\s*$",
#         text
#     )

#     print("\nPAPER:", paper.id, paper.title)

#     if match:
#         print(text[match.start():match.start() + 2500])
#     else:
#         print("No reference heading found.")
#         print("LAST 2000 CHARACTERS:")
#         print(text[-2000:])

    
#     print("### CALLING CITATION DETECTOR ###")

#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     print(
#         "### DETECTED CITATION COUNT:",
#         len(citation_results),
#         "###",
#     )

#     prerequisite_results = detect_prerequisites(
#         papers,
#         paper_texts,
#     )

#     # --------------------------------------------------------
#     # Save prerequisites
#     # --------------------------------------------------------

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

#     # --------------------------------------------------------
#     # Save citations
#     # --------------------------------------------------------

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

#     logger.info(
#         "=== CITATION/PREREQUISITE DETECTION COMPLETE ==="
#     )
#     logger.info(
#         "Prerequisites created: %s",
#         prerequisites_created,
#     )
#     logger.info(
#         "Citations created: %s",
#         citations_created,
#     )

#     # --------------------------------------------------------
#     # AI paper analysis and RAG indexing
#     # --------------------------------------------------------

#     papers_processed = 0
#     papers_failed = 0
#     total_papers = len(papers)

#     for index, paper in enumerate(papers):
#         analyze_paper(
#             paper,
#             paper_texts.get(paper.id, ""),
#         )

#         papers_processed += 1

#         if (paper.raw_ai_data or {}).get("error"):
#             papers_failed += 1

#         if index < total_papers - 1:
#             time.sleep(SECONDS_BETWEEN_PAPERS)

#     logger.info("=== FULL ANALYSIS COMPLETE ===")

#     return {
#         "research_id": research.id,
#         "papers_processed": papers_processed,
#         "papers_failed": papers_failed,
#         "prerequisites_created": prerequisites_created,
#         "citations_created": citations_created,
#     }


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

from .relevance_analysis import (
    assess_paper_relevance,
    assess_pairwise_relevance,
)


logger = logging.getLogger(__name__)


SECONDS_BETWEEN_PAPERS = getattr(
    settings,
    "SECONDS_BETWEEN_PAPERS",
    4,
)

SECONDS_BETWEEN_PAIRWISE_CALLS = getattr(
    settings,
    "SECONDS_BETWEEN_PAIRWISE_CALLS",
    1,
)

PAIRWISE_RELEVANCE_THRESHOLD = float(
    getattr(
        settings,
        "PAIRWISE_RELEVANCE_THRESHOLD",
        0.55,
    )
)


# ---------------------------------------------------------
# PDF TEXT EXTRACTION
# ---------------------------------------------------------

def _extract_pdf_text(file_field):
    """Extract text once from an uploaded PDF field."""

    if not file_field:
        return ""

    parts = []

    file_field.open("rb")

    try:
        with pdfplumber.open(file_field) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    parts.append(page_text)

    finally:
        file_field.close()

    return "\n".join(parts).strip()


def extract_pdf_text(file_path):
    """Compatibility helper retained for existing imports."""

    if not file_path:
        return ""

    try:
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(
                page.extract_text() or ""
                for page in pdf.pages
            ).strip()

    except Exception:
        logger.exception(
            "PDF extraction failed for %s",
            file_path,
        )
        return ""


# ---------------------------------------------------------
# PAPER METADATA EXTRACTION
# ---------------------------------------------------------

def _normalise(value):
    value = (value or "").lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def extract_paper_metadata(paper, text):
    """
    Conservative metadata fallback.

    Attempts to avoid mistaking DOI and journal masthead lines
    for title or author metadata.
    """

    lines = [
        re.sub(r"\s+", " ", line).strip(" \t|•")
        for line in (text or "").splitlines()
    ]

    lines = [line for line in lines if line]

    if not lines:
        return

    title_candidates = []

    for line in lines[:35]:
        low = line.lower()

        if len(line) < 18 or len(line) > 350:
            continue

        if re.search(
            r"https?://|doi\s*:|"
            r"\b(issn|vol\.?\s*\d|journal of|"
            r"transactions on|proceedings of)\b",
            low,
        ):
            continue

        if re.fullmatch(r"[\d\W]+", line):
            continue

        if low in {
            "abstract",
            "introduction",
            "review article",
            "research article",
        }:
            continue

        title_candidates.append(line)

    if not paper.title and title_candidates:
        chosen = []

        for line in title_candidates[:5]:
            if re.search(
                r"\b(abstract|keywords|university|department|"
                r"received|accepted|published)\b",
                line,
                re.I,
            ):
                break

            chosen.append(line)

            if len(" ".join(chosen)) >= 45:
                break

        paper.title = (
            " ".join(chosen)[:500]
            or title_candidates[0][:500]
        )

    if not paper.authors:
        for line in lines[:45]:
            low = line.lower()

            if len(line) < 5 or len(line) > 250:
                continue

            if re.search(
                r"https?://|doi|"
                r"\b(university|department|institute|school|"
                r"abstract|keywords|copyright|received|"
                r"published|journal|vol\.?|issn)\b",
                low,
            ):
                continue

            if paper.title and (
                _normalise(line) in _normalise(paper.title)
            ):
                continue

            looks_like_names = (
                re.search(
                    r"[A-Z][a-z]+\s+[A-Z]|"
                    r"[A-Z][a-z]+\s*,\s*[A-Z]",
                    line,
                )
                or re.search(
                    r"[A-Z][a-z]{2,}"
                    r"(?:\s+[A-Z][a-z]{2,}){1,5}",
                    line,
                )
            )

            if looks_like_names:
                paper.authors = line[:500]
                break

    if not paper.year:
        header = "\n".join(lines[:35])

        matches = re.findall(
            r"\b(?:19|20)\d{2}\b",
            header,
        )

        if matches:
            years = [
                int(value)
                for value in matches
                if 1900 <= int(value) <= 2100
            ]

            if years:
                paper.year = years[-1]

    paper.save(
        update_fields=[
            "title",
            "authors",
            "year",
        ]
    )


# ---------------------------------------------------------
# CITATION DETECTION
# ---------------------------------------------------------

def _first_author_surname(authors):
    if not authors:
        return ""

    first = re.split(
        r";| and | & ",
        authors,
        maxsplit=1,
        flags=re.I,
    )[0].strip()

    if "," in first:
        return first.split(",", 1)[0].strip()

    tokens = re.findall(
        r"[A-Za-z][A-Za-z'-]+",
        first,
    )

    return tokens[-1] if tokens else ""


def detect_citations(papers, paper_texts):
    """
    Heuristic intra-session citation detection.

    Citation direction:
    citing_paper -> cited_paper
    """

    results = []
    seen = set()

    for cited in papers:
        title = _normalise(cited.title)

        filename = (
            _normalise(
                os.path.splitext(
                    os.path.basename(cited.file.name)
                )[0]
            )
            if cited.file
            else ""
        )

        surname = _first_author_surname(cited.authors)
        year = str(cited.year) if cited.year else ""

        for citing in papers:
            if citing.id == cited.id:
                continue

            text = paper_texts.get(citing.id, "") or ""
            norm_text = _normalise(text)

            found = bool(
                title
                and len(title) >= 18
                and title in norm_text
            )

            if not found and filename and len(filename) >= 10:
                found = filename in norm_text

            if not found and surname and year:
                surname_pattern = re.escape(surname)

                found = bool(
                    re.search(
                        rf"\b{surname_pattern}\b.{{0,35}}\b{year}\b",
                        text,
                        re.I,
                    )
                )

            pair = (citing.id, cited.id)

            if found and pair not in seen:
                seen.add(pair)

                results.append(
                    {
                        "citing_paper": citing,
                        "cited_paper": cited,
                    }
                )

                logger.info(
                    "Citation candidate detected: %s -> %s",
                    citing.id,
                    cited.id,
                )

    logger.info(
        "Total citation relationships detected: %d",
        len(results),
    )

    return results


# ---------------------------------------------------------
# PREREQUISITE DETECTION
# ---------------------------------------------------------

def detect_prerequisites(
    papers,
    paper_texts,
    citation_results=None,
):
    """
    Preserve the existing citation-based prerequisite heuristic.

    These records are not used as pairwise relevance connections.
    """

    if citation_results is None:
        citation_results = detect_citations(
            papers,
            paper_texts,
        )

    pairs = {
        (
            item["citing_paper"].id,
            item["cited_paper"].id,
        )
        for item in citation_results
    }

    by_id = {
        paper.id: paper
        for paper in papers
    }

    results = []

    for citing_id, cited_id in pairs:
        if (cited_id, citing_id) in pairs:
            continue

        citing = by_id.get(citing_id)
        cited = by_id.get(cited_id)

        if not citing or not cited:
            continue

        results.append(
            {
                "paper": citing,
                "prerequisite_paper": cited,
                "reason": (
                    f"{citing.title or citing.file.name} "
                    f"references "
                    f"{cited.title or cited.file.name}"
                ),
                "confidence": 0.75,
            }
        )

    logger.info(
        "Prerequisite relationships detected: %d",
        len(results),
    )

    return results


# ---------------------------------------------------------
# PER-PAPER ANALYSIS CACHE
# ---------------------------------------------------------

def _analysis_cache_key(paper, text):
    """Change the cache key whenever the paper or research topic changes."""

    payload = {
        "text": text,
        "topic": paper.research.topic or "",
        "model": getattr(settings, "LLM_MODEL", ""),
        "version": 2,
    }

    encoded = json.dumps(
        payload,
        sort_keys=True,
        ensure_ascii=False,
    ).encode("utf-8")

    return hashlib.sha256(encoded).hexdigest()


# ---------------------------------------------------------
# PER-PAPER AI ANALYSIS
# ---------------------------------------------------------

def analyze_paper(paper, text):
    """
    Run individual paper analysis.

    Existing successful results are preserved when a new
    AI request fails.
    """

    data = dict(paper.raw_ai_data or {})

    if not text:
        data["error"] = (
            "No extractable text found in this PDF "
            "(it may be scanned images)."
        )

        paper.text = ""
        paper.raw_ai_data = data

        paper.save(
            update_fields=[
                "text",
                "raw_ai_data",
            ]
        )

        return

    cache_key = _analysis_cache_key(
        paper,
        text,
    )

    cached = data.get("_analysis_cache", {})

    if cached.get("key") == cache_key:
        paper.text = text
        paper.save(update_fields=["text"])

        logger.info(
            "Reusing cached analysis for paper %s",
            paper.id,
        )

        return

    paper.text = text

    # Local RAG indexing.
    try:
        index_paper(
            research_id=paper.research_id,
            paper_id=paper.id,
            paper_text=text,
        )

        data.pop("rag_index_error", None)

    except Exception:
        logger.exception(
            "RAG indexing failed for paper %s",
            paper.id,
        )

        data["rag_index_error"] = (
            "Indexing failed; retrieval may be incomplete."
        )

    successful = {}

    # Key-point extraction.
    try:
        key_points = extract_key_points_rag(text)

        data["key_points"] = key_points
        data.pop("key_points_error", None)

        successful["key_points"] = True

        if key_points:
            paper.ai_summary = " ".join(
                str(point)
                for point in key_points[:2]
            )

    except Exception as exc:
        logger.exception(
            "Key-point extraction failed for paper %s",
            paper.id,
        )

        data["key_points_error"] = str(exc)

    # Deep analysis.
    try:
        deep_analysis = extract_deep_analysis(text)

        data["deep_analysis"] = deep_analysis
        data.pop("deep_analysis_error", None)

        successful["deep_analysis"] = True

    except Exception as exc:
        logger.exception(
            "Deep analysis failed for paper %s",
            paper.id,
        )

        data["deep_analysis_error"] = str(exc)

    # Individual research-topic relevance.
    try:
        relevance = assess_paper_relevance(
            paper.research.topic,
            text,
        )

        data["relevance"] = relevance
        data.pop("relevance_error", None)

        successful["relevance"] = True

    except Exception as exc:
        logger.exception(
            "Topic relevance failed for paper %s",
            paper.id,
        )

        # Preserve the previous successful relevance result.
        data["relevance_error"] = str(exc)

    # Only mark the complete analysis as cached if all
    # three AI features succeeded.
    if all(
        successful.get(name)
        for name in (
            "key_points",
            "deep_analysis",
            "relevance",
        )
    ):
        data["_analysis_cache"] = {
            "key": cache_key,
        }

    # Keep the existing summary if key-point extraction failed.
    data["error"] = (
        ""
        if data.get("key_points")
        else data.get("key_points_error", "")
    )

    paper.raw_ai_data = data

    paper.save(
        update_fields=[
            "text",
            "raw_ai_data",
            "ai_summary",
        ]
    )


# ---------------------------------------------------------
# PAIRWISE PAPER RELEVANCE
# ---------------------------------------------------------

def _save_pairwise_relevance(papers, paper_texts):
    """
    Compare each unique pair of papers.

    Successful comparisons update the stored relationship.
    Failed comparisons preserve existing relationships.
    """

    if not papers:
        return 0

    created_count = 0

    total_pairs = (
        len(papers) * (len(papers) - 1) // 2
    )

    processed_pairs = 0

    for index, paper_a in enumerate(papers):
        for paper_b in papers[index + 1:]:
            processed_pairs += 1

            text_a = paper_texts.get(
                paper_a.id,
                "",
            )

            text_b = paper_texts.get(
                paper_b.id,
                "",
            )

            if not text_a or not text_b:
                logger.warning(
                    "Skipping pair %s/%s because text is missing.",
                    paper_a.id,
                    paper_b.id,
                )
                continue

            first, second = sorted(
                [paper_a, paper_b],
                key=lambda paper: paper.id,
            )

            try:
                result = assess_pairwise_relevance(
                    text_a,
                    text_b,
                )

                score = float(
                    result.get("score", 0.0)
                )

                is_relevant = (
                    result.get("relevant", False)
                    and score >= PAIRWISE_RELEVANCE_THRESHOLD
                )

                if is_relevant:
                    _, was_created = (
                        PaperRelevance.objects.update_or_create(
                            paper_a=first,
                            paper_b=second,
                            defaults={
                                "score": score,
                                "reason": result.get("reason", ""),
                                "evidence": result.get("evidence", ""),
                            },
                        )
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
                    # Only remove a relationship after a
                    # successful comparison says it is not relevant.
                    PaperRelevance.objects.filter(
                        paper_a=first,
                        paper_b=second,
                    ).delete()

                    logger.info(
                        "No relevance edge: %s / %s (%.3f)",
                        paper_a.id,
                        paper_b.id,
                        score,
                    )

            except Exception:
                # Preserve any previous relationship on failure.
                logger.exception(
                    "Pairwise relevance failed for papers %s and %s",
                    paper_a.id,
                    paper_b.id,
                )

            if (
                processed_pairs < total_pairs
                and SECONDS_BETWEEN_PAIRWISE_CALLS > 0
            ):
                time.sleep(
                    SECONDS_BETWEEN_PAIRWISE_CALLS
                )

    return created_count


# ---------------------------------------------------------
# COMPLETE RESEARCH ANALYSIS PIPELINE
# ---------------------------------------------------------

def analyze_research(research):
    """
    Full research analysis pipeline.

    1. Extract PDF text once.
    2. Extract metadata.
    3. Detect citations.
    4. Preserve prerequisite detection.
    5. Run per-paper AI analysis and RAG indexing.
    6. Compare all paper pairs for substantive relevance.
    """

    logger.info(
        "Starting analysis for research %s",
        research.id,
    )

    papers = list(
        research.papers.all().order_by(
            "order_position",
            "id",
        )
    )

    if not papers:
        raise ValueError(
            "No papers have been uploaded for this research."
        )

    paper_texts = {}
    papers_failed = 0

    # Extract each PDF only once.
    for paper in papers:
        try:
            text = _extract_pdf_text(
                paper.file,
            )

            paper_texts[paper.id] = text

            if text:
                extract_paper_metadata(
                    paper,
                    text,
                )

            logger.info(
                "Paper %s: extracted %d characters",
                paper.id,
                len(text),
            )

        except Exception:
            logger.exception(
                "Text extraction failed for paper %s",
                paper.id,
            )

            paper_texts[paper.id] = ""

    # Replace citation and prerequisite records.
    # Do not delete PaperRelevance records here.
    Prerequisite.objects.filter(
        paper__research=research,
    ).delete()

    Citation.objects.filter(
        citing_paper__research=research,
    ).delete()

    # Detect citations.
    citation_results = detect_citations(
        papers,
        paper_texts,
    )

    # Detect prerequisites separately.
    prerequisite_results = detect_prerequisites(
        papers,
        paper_texts,
        citation_results,
    )

    citations_created = 0
    prerequisites_created = 0

    with transaction.atomic():

        for item in citation_results:
            _, created = Citation.objects.get_or_create(
                citing_paper=item["citing_paper"],
                cited_paper=item["cited_paper"],
            )

            citations_created += int(created)

        for item in prerequisite_results:
            _, created = Prerequisite.objects.get_or_create(
                paper=item["paper"],
                prerequisite_paper=item["prerequisite_paper"],
                defaults={
                    "reason": item.get("reason", ""),
                    "confidence": item.get("confidence"),
                },
            )

            prerequisites_created += int(created)

    # Per-paper AI analysis and local RAG indexing.
    for index, paper in enumerate(papers):

        analyze_paper(
            paper,
            paper_texts.get(
                paper.id,
                "",
            ),
        )

        # Refresh so we count the latest saved error state.
        paper.refresh_from_db(
            fields=["raw_ai_data"],
        )

        if (paper.raw_ai_data or {}).get("error"):
            papers_failed += 1

        if (
            index < len(papers) - 1
            and SECONDS_BETWEEN_PAPERS > 0
        ):
            time.sleep(
                SECONDS_BETWEEN_PAPERS
            )

    # Pairwise relevance is independent of citations.
    relevance_created = _save_pairwise_relevance(
        papers,
        paper_texts,
    )

    relevance_count = PaperRelevance.objects.filter(
        paper_a__research=research,
    ).count()

    logger.info(
        "Analysis complete: citations=%d prerequisites=%d "
        "relevant_pairs=%d",
        citations_created,
        prerequisites_created,
        relevance_count,
    )

    return {
        "research_id": research.id,
        "papers_processed": len(papers),
        "papers_failed": papers_failed,
        "prerequisites_created": prerequisites_created,
        "citations_created": citations_created,
        "paper_relevance_created": relevance_created,
        "paper_relevance_count": relevance_count,
    }
