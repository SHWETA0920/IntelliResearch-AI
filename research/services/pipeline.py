import re
import pdfplumber

from ..models import (
    Research,
    Prerequisite,
    Citation,
)


def analyze_research(research):
    """
    Analyze all papers belonging to a research session.

    Steps:
    1. Validate research
    2. Get uploaded papers
    3. Extract PDF text
    4. Detect citations
    5. Detect prerequisites
    6. Save relationships
    """

    if not isinstance(research, Research):
        raise ValueError("Invalid research object.")

    papers = list(research.papers.all())

    if not papers:
        raise ValueError("No papers were uploaded for this research.")

    print(f"\n=== ANALYZING RESEARCH {research.id} ===")
    print(f"Papers found: {len(papers)}")

    # ---------------------------------------------------------
    # Extract text from every PDF
    # ---------------------------------------------------------

    paper_texts = {}

    for paper in papers:
        print(f"Extracting: {paper.file.name}")

        text = extract_pdf_text(paper.file.path)

        paper_texts[paper.id] = text

        print(
            f"  Extracted {len(text)} characters"
        )

    # ---------------------------------------------------------
    # Clear previous relationships
    # ---------------------------------------------------------

    Prerequisite.objects.filter(
        paper__research=research
    ).delete()

    Citation.objects.filter(
        citing_paper__research=research
    ).delete()

    # ---------------------------------------------------------
    # Detect relationships
    # ---------------------------------------------------------

    prerequisite_results = detect_prerequisites(
        papers,
        paper_texts,
    )

    citation_results = detect_citations(
        papers,
        paper_texts,
    )

    # ---------------------------------------------------------
    # Save prerequisites
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Save citations
    # ---------------------------------------------------------

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

    print("\n=== ANALYSIS COMPLETE ===")
    print(
        f"Prerequisites created: {prerequisites_created}"
    )
    print(
        f"Citations created: {citations_created}"
    )

    return {
        "research_id": research.id,
        "papers_processed": len(papers),
        "prerequisites_created": prerequisites_created,
        "citations_created": citations_created,
    }


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_pdf_text(file_path):
    """
    Extract text from a PDF.

    IMPORTANT:
    This function receives a FILE PATH string.
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
        print(
            f"PDF extraction failed for {file_path}: {exc}"
        )
        return ""

    return "\n".join(text_parts)


# ============================================================
# CITATION DETECTION
# ============================================================

def detect_citations(papers, paper_texts):
    """
    Detect whether one uploaded paper appears to reference
    another uploaded paper.

    This is a basic local detector for now.
    Later we can replace this with AI/NLP detection.
    """

    results = []

    for citing_paper in papers:

        citing_text = paper_texts.get(
            citing_paper.id,
            ""
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

            # Title
            if cited_paper.title:
                identifiers.append(
                    cited_paper.title.lower()
                )

            # Author
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
            # Check whether identifier appears in text
            # -------------------------------------------------

            found = False

            for identifier in identifiers:

                if not identifier:
                    continue

                # Make filename matching easier
                normalized_identifier = re.sub(
                    r"[_\-]+",
                    " ",
                    identifier,
                )

                words = normalized_identifier.split()

                # Ignore extremely short identifiers
                words = [
                    word
                    for word in words
                    if len(word) >= 4
                ]

                if not words:
                    continue

                # If several meaningful filename/title words
                # appear in the citing paper, treat as a match.
                matches = sum(
                    1
                    for word in words
                    if word in citing_text
                )

                if matches >= min(2, len(words)):
                    found = True
                    break

            if found:

                print(
                    f"CITATION FOUND: "
                    f"{citing_paper.file.name} -> "
                    f"{cited_paper.file.name}"
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

# def detect_prerequisites(papers, paper_texts):
#     """
#     Build prerequisite relationships from detected citations.

#     If Paper A cites Paper B, Paper B is treated as a
#     prerequisite/foundation for Paper A.
#     """

#     results = []

#     # First detect citation relationships
#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     seen = set()

#     for item in citation_results:
#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         # Prevent self relationships
#         if citing_paper.id == cited_paper.id:
#             continue

#         key = (
#             citing_paper.id,
#             cited_paper.id,
#         )

#         if key in seen:
#             continue

#         seen.add(key)

#         results.append(
#             {
#                 # The paper that needs the knowledge
#                 "paper": citing_paper,

#                 # The paper that provides the foundation
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

# def detect_prerequisites(papers, paper_texts):
#     """
#     Build prerequisite relationships from detected citations.

#     If Paper A cites Paper B, B can be considered a prerequisite
#     of A.

#     Cyclic relationships are removed so the frontend can safely
#     build a learning path.
#     """

#     results = []

#     # Detect citations first
#     citation_results = detect_citations(
#         papers,
#         paper_texts,
#     )

#     # ---------------------------------------------------------
#     # Build directed graph
#     #
#     # prerequisite_paper -> paper
#     #
#     # Example:
#     # A cites B
#     # B -> A
#     # ---------------------------------------------------------

#     graph = {}

#     for item in citation_results:
#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         if citing_paper.id == cited_paper.id:
#             continue

#         graph.setdefault(cited_paper.id, set())
#         graph[cited_paper.id].add(citing_paper.id)

#     # ---------------------------------------------------------
#     # Check whether adding an edge creates a cycle
#     # ---------------------------------------------------------

#     def creates_cycle(graph, source, target):
#         """
#         Check whether target can already reach source.

#         If yes, adding source -> target would create a cycle.
#         """

#         visited = set()

#         def visit(node):
#             if node == source:
#                 return True

#             if node in visited:
#                 return False

#             visited.add(node)

#             for neighbour in graph.get(node, set()):
#                 if visit(neighbour):
#                     return True

#             return False

#         return visit(target)

#     # ---------------------------------------------------------
#     # Build acyclic prerequisite relationships
#     # ---------------------------------------------------------

#     acyclic_graph = {}

#     seen = set()

#     for item in citation_results:
#         citing_paper = item["citing_paper"]
#         cited_paper = item["cited_paper"]

#         if citing_paper.id == cited_paper.id:
#             continue

#         key = (
#             citing_paper.id,
#             cited_paper.id,
#         )

#         if key in seen:
#             continue

#         seen.add(key)

#         # Relationship direction:
#         #
#         # cited paper -> citing paper
#         #
#         # Meaning:
#         # cited paper should come before citing paper.
#         source = cited_paper.id
#         target = citing_paper.id

#         # Check if this edge would create a cycle
#         if creates_cycle(
#             acyclic_graph,
#             source,
#             target,
#         ):
#             print(
#                 f"Skipping circular prerequisite: "
#                 f"{cited_paper.id} -> {citing_paper.id}"
#             )
#             continue

#         acyclic_graph.setdefault(source, set())
#         acyclic_graph[source].add(target)

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

def detect_prerequisites(papers, paper_texts):
    """
    Build prerequisite relationships from detected citations.

    A citation does NOT automatically mean a prerequisite.
    For now, we create a prerequisite only when the citation
    relationship is one-directional.

    This also prevents circular prerequisite relationships.
    """

    results = []

    citation_results = detect_citations(
        papers,
        paper_texts,
    )

    # Store citation pairs
    citation_pairs = set()

    for item in citation_results:
        citing_paper = item["citing_paper"]
        cited_paper = item["cited_paper"]

        if citing_paper.id == cited_paper.id:
            continue

        citation_pairs.add(
            (citing_paper.id, cited_paper.id)
        )

    seen = set()

    for citing_id, cited_id in citation_pairs:

        # If the reverse relationship also exists,
        # do NOT create a prerequisite in either direction.
        if (cited_id, citing_id) in citation_pairs:
            print(
                f"Skipping circular prerequisite: "
                f"{citing_id} <-> {cited_id}"
            )
            continue

        key = (citing_id, cited_id)

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

    print(
        f"Prerequisite relationships detected: {len(results)}"
    )

    return results