"""
research/services/citation_detector.py

Detects which uploaded papers cite which other uploaded papers by reading
each paper's *reference list* (not the whole body text) and matching its
entries against the metadata of the other uploaded papers.

Direction convention (matches the Citation model and the React graph):
    citing_paper  ->  cited_paper

Matching evidence, strongest first:
    1. DOI / arXiv id of the cited paper appears in the reference list.
    2. The cited paper's title appears in the reference list (tolerant of
       punctuation, capitalisation, line breaks and hyphenation).
    3. First-author surname + year + at least half of the title words appear
       together inside ONE reference entry.

Weak matches (surname + year alone) are deliberately NOT accepted, because
authors often publish several papers in the same year.

Public API
    find_citations(papers, paper_texts, debug=False)
        -> list of (citing_paper, cited_paper, evidence_string)
           Pure computation: nothing is written to the database.
    save_citations(found)
        -> number of NEW Citation rows created
    detect_and_save_citations(papers, paper_texts, debug=False)
        -> number of citation relationships detected (also saved to the DB)
"""

import logging
import os
import re
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

STOPWORDS = {
    "a", "an", "the", "of", "in", "on", "for", "and", "to", "with", "by",
    "from", "at", "is", "are", "as", "via", "or", "its", "their", "into",
}

# Lines that are page headers / journal furniture rather than a paper title.
HEADER_HINTS = (
    "ieee", "acm", "proceedings", "journal", "vol.", "transactions",
    "arxiv", "copyright", "permission", "http", "doi", "©", "www.",
    "communications of", "preprint", "submitted", "published",
)

REF_HEADING = re.compile(
    r"(?im)^[ \t]*(?:\d+(?:\.\d+)*\.?[ \t]+|[IVX]+\.[ \t]+)?"
    r"(?:references?(?:[ \t]+and[ \t]+notes)?|bibliography|works[ \t]+cited"
    r"|literature[ \t]+cited|reference[ \t]+list)"
    r"[ \t]*:?[ \t]*$"
)

NUMBER_MARKER = re.compile(r"^(\[\d{1,3}\]|\d{1,3}[.)]\s|\(\d{1,3}\))")
AUTHOR_START = re.compile(
    r"^[A-Z][A-Za-z'\u2019\-]+,\s*(?:[A-Z]\.|[A-Z][a-z]+)"
    r"|^[A-Z]\.\s?(?:[A-Z]\.\s?)*[A-Z][A-Za-z'\u2019\-]+"
)


# ---------------------------------------------------------------------
# Small text helpers
# ---------------------------------------------------------------------

def _norm(text):
    """Lowercase, strip punctuation, collapse whitespace."""
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _dehyphenate(text):
    """Join words split by a line-break hyphen: 'cryp-\\ntography'."""
    return re.sub(r"(\w)-[ \t]*\n[ \t]*(\w)", r"\1\2", text or "")


def _sig_tokens(norm_text):
    return [t for t in norm_text.split() if t not in STOPWORDS]


def _looks_like_header(line):
    low = line.lower()
    if len(line) < 10:
        return True
    if any(h in low for h in HEADER_HINTS):
        return True
    digits = sum(ch.isdigit() for ch in line)
    return digits / max(len(line), 1) > 0.2


# ---------------------------------------------------------------------
# Metadata for each uploaded paper
# ---------------------------------------------------------------------

def _filename_title(paper):
    file_field = getattr(paper, "file", None)
    name = getattr(file_field, "name", "") or ""
    if not name:
        return ""
    base = os.path.splitext(os.path.basename(name))[0]
    # Django appends a random 7-character suffix to duplicate filenames.
    base = re.sub(r"_[A-Za-z0-9]{7}$", "", base)
    return re.sub(r"[_\-]+", " ", base).strip()


def _title_candidates(paper, text):
    """
    Several possible titles, because stored metadata is often incomplete:
    the title field, the filename, and the first non-header lines of the PDF.
    """
    raw = []

    title = (getattr(paper, "title", "") or "").strip()
    if title:
        raw.append(title)

    fname = _filename_title(paper)
    if fname:
        raw.append(fname)

    lines = []
    for line in (text or "")[:2500].splitlines():
        line = line.strip()
        if line and not _looks_like_header(line):
            lines.append(line)
        if len(lines) == 3:
            break
    for n in (1, 2, 3):
        if len(lines) >= n:
            raw.append(" ".join(lines[:n]))

    out = []
    for candidate in raw:
        norm = _norm(candidate)
        if len(norm) >= 18 and len(_sig_tokens(norm)) >= 3 and norm not in out:
            out.append(norm)
    return out


def _surnames(authors):
    """Best-effort list of author surnames, lowercase, first author first."""
    if not authors:
        return []
    parts = re.split(r",|;|\band\b|&|\n|\bet al\.?", authors, flags=re.I)
    names = []
    for part in parts:
        tokens = re.findall(r"[A-Za-z][A-Za-z'\u2019\-]+", part)
        tokens = [t for t in tokens if len(t) >= 3]  # drops initials
        if not tokens:
            continue
        surname = tokens[-1].lower()
        if surname not in names:
            names.append(surname)
    return names[:6]


def _infer_year(text):
    years = [
        int(y) for y in re.findall(r"\b(19[5-9]\d|20[0-2]\d)\b", (text or "")[:2500])
    ]
    return max(years) if years else None


def _identifiers(text):
    """DOI / arXiv ids printed near the top of the paper."""
    head = (text or "")[:4000]
    ids = set()
    for m in re.finditer(r"\b(10\.\d{4,9}/[^\s\"<>,;]+)", head):
        ids.add(m.group(1).rstrip(".)").lower())
    for m in re.finditer(r"arxiv[:\s]*([0-9]{4}\.[0-9]{4,5})", head, re.I):
        ids.add("arxiv:" + m.group(1))
    return ids


class _Meta:
    def __init__(self, paper, text):
        self.paper = paper
        self.titles = _title_candidates(paper, text)
        self.surnames = _surnames(getattr(paper, "authors", "") or "")
        self.year = getattr(paper, "year", None) or _infer_year(text)
        self.ids = _identifiers(text)


# ---------------------------------------------------------------------
# Reference list extraction
# ---------------------------------------------------------------------

def extract_reference_section(text):
    """Return the text of the reference list (empty string if none)."""
    if not text:
        return ""
    matches = list(REF_HEADING.finditer(text))
    if matches:
        # Prefer the last heading that is followed by a real amount of text,
        # so a table-of-contents "References" line is not mistaken for it.
        for m in reversed(matches):
            tail = text[m.end():]
            if len(tail) >= 300:
                return tail
        return text[matches[-1].end():]
    # No heading found: fall back to the last 30% of the document.
    return text[int(len(text) * 0.7):]


def split_references(section):
    """Split a reference section into individual entries."""
    section = _dehyphenate(section)
    lines = [ln.strip() for ln in section.splitlines() if ln.strip()]
    if not lines:
        return []

    numbered = sum(1 for ln in lines if NUMBER_MARKER.match(ln)) >= 2

    entries, current = [], []
    for line in lines:
        if numbered:
            starts_new = bool(NUMBER_MARKER.match(line))
        else:
            starts_new = bool(
                AUTHOR_START.match(line)
                and current
                and re.search(r"[.)\d]$", current[-1])
            )
        if starts_new and current:
            entries.append(" ".join(current))
            current = [line]
        else:
            current.append(line)
    if current:
        entries.append(" ".join(current))

    return [e for e in entries if len(e) >= 25]


# ---------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------

def _title_in_text(title_norm, text_norm):
    if title_norm in text_norm:
        return True
    sm = SequenceMatcher(None, title_norm, text_norm, autojunk=False)
    longest = sm.find_longest_match(0, len(title_norm), 0, len(text_norm))
    return longest.size >= 0.85 * len(title_norm)


def _word_in(word, text):
    return re.search(rf"\b{re.escape(word)}\b", text, re.I) is not None


def _match(meta, section_norm, section_lower, entries):
    """Return an evidence string if `meta`'s paper is cited here, else ''."""
    # 1. Identifiers
    for ident in meta.ids:
        needle = ident.split(":", 1)[1] if ident.startswith("arxiv:") else ident
        if needle in section_lower:
            return f"identifier match ({ident})"

    # 2. Title
    for title in meta.titles:
        if _title_in_text(title, section_norm):
            return f"title match ({title[:70]})"

    # 3. First-author surname + year + >= 50% of the title words, all inside
    #    the same reference entry.
    if meta.year and meta.surnames and meta.titles:
        first = meta.surnames[0]
        year = str(meta.year)
        for entry in entries:
            if year not in entry or not _word_in(first, entry):
                continue
            entry_tokens = set(_norm(entry).split())
            for title in meta.titles:
                sig = set(_sig_tokens(title))
                if sig and len(sig & entry_tokens) / len(sig) >= 0.5:
                    return f"author/year/title-words match ({first}, {year})"
    return ""


# ---------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------

def find_citations(papers, paper_texts, debug=False):
    """
    Return a list of (citing_paper, cited_paper, evidence) tuples.

    papers       iterable of Paper objects
    paper_texts  dict mapping paper.id -> extracted PDF text

    This function only computes; it never touches the database.
    """
    papers = list(papers)
    paper_texts = paper_texts or {}
    metas = {p.id: _Meta(p, paper_texts.get(p.id) or "") for p in papers}
    found = []

    for citing in papers:
        text = paper_texts.get(citing.id) or ""
        section = extract_reference_section(text)

        if debug:
            print(f"\n[citations] paper {citing.id}: reference section "
                  f"{len(section)} chars (document: {len(text)} chars)")

        if not section.strip():
            continue

        prepared = _dehyphenate(section)
        section_norm = _norm(prepared)
        section_lower = prepared.lower()
        entries = split_references(section)

        if debug:
            print(f"[citations] paper {citing.id}: {len(entries)} reference entries")

        for cited in papers:
            if cited.id == citing.id:
                continue

            meta = metas[cited.id]
            evidence = _match(meta, section_norm, section_lower, entries)
            if not evidence:
                continue

            # A paper cannot cite one published years after itself. Applied only
            # to the weakest evidence type; titles/identifiers are stronger
            # than the (inferred) years.
            if evidence.startswith("author/year"):
                citing_year = metas[citing.id].year
                if meta.year and citing_year and meta.year > citing_year + 1:
                    continue

            found.append((citing, cited, evidence))
            if debug:
                print(f"[citations]   {citing.id} -> {cited.id}: {evidence}")

    return found


def save_citations(found):
    """
    Store the result of find_citations() as Citation rows.
    Returns the number of NEW rows created (existing ones are left alone).
    """
    from ..models import Citation  # imported here so the module is testable

    created_count = 0
    for citing, cited, evidence in found:
        _, created = Citation.objects.get_or_create(
            citing_paper=citing, cited_paper=cited
        )
        if created:
            created_count += 1
        logger.info(
            "Citation saved: %s -> %s (%s)", citing.id, cited.id, evidence
        )
    return created_count


def detect_and_save_citations(papers, paper_texts, debug=False):
    """Detect citations and store them as Citation rows.

    Returns the number of citation relationships DETECTED.
    """
    found = find_citations(papers, paper_texts, debug=debug)
    save_citations(found)
    return len(found)