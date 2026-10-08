"""
RAG-based key-point extraction — an alternative to pipeline.py's old
chunk-per-call approach.

WHY THIS EXISTS:
The old _extract_key_points() called the LLM once PER CHUNK, then once
more to merge candidates — 5-7 calls for a long paper, which hit Groq's
rate limit fast.

THE FIX:
1. Chunk the paper (free, local).
2. Embed chunks locally with sentence-transformers (free, local, no API).
3. Pick ~4 representative chunks via embedding similarity to the
   whole-paper centroid, always keeping the first (intro) and last
   (conclusion) chunk.
4. Send just those chunks in ONE LLM call via llm_client.call_llm().

DEPENDENCIES: chunking.py, embeddings.py, llm_client.py. Deliberately
does NOT import chat_service.py / rag_retriever.py / vector_store.py —
those pull in chromadb, which key-point extraction doesn't need.
Install: sentence-transformers, numpy (no chromadb required for this file).
"""
import json
import re

import numpy as np

from .chunking import chunk_text
from .embeddings import embed_texts
from .llm_client import call_llm

SYSTEM_PROMPT = (
    "You extract the most important points from academic papers. "
    "Respond with ONLY a JSON array of short strings (max ~25 words "
    "each) — no prose, no markdown fences, no extra keys."
)


def _select_representative_chunks(chunks: list[str], max_chunks: int = 4) -> list[str]:
    if len(chunks) <= max_chunks:
        return chunks

    vectors = np.array(embed_texts(chunks))
    centroid = vectors.mean(axis=0)
    similarities = vectors @ centroid  # cosine-ish since embeddings are normalized

    keep_indices = {0, len(chunks) - 1}  # first + last
    remaining_slots = max(max_chunks - len(keep_indices), 0)

    ranked = sorted(
        (i for i in range(len(chunks)) if i not in keep_indices),
        key=lambda i: similarities[i],
        reverse=True,
    )
    keep_indices.update(ranked[:remaining_slots])

    return [chunks[i] for i in sorted(keep_indices)]


def _parse_json_list(raw: str, fallback_limit: int = 8) -> list[str]:
    cleaned = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()

    # Attempt 1: strict parse of the whole cleaned response.
    try:
        data = json.loads(cleaned)
        if isinstance(data, list):
            return [str(x).strip() for x in data if str(x).strip()]
        if isinstance(data, dict) and "key_points" in data:
            return [str(x).strip() for x in data["key_points"] if str(x).strip()]
    except json.JSONDecodeError:
        pass

    # Attempt 2: the model sometimes wraps the array in a sentence
    # ("Here are the key points: [...]") — strict parsing of the FULL
    # response then fails even though a valid array is in there. Pull
    # out just the outermost [...] substring and parse that instead.
    match = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
    if match:
        for parser_kwargs in ({}, {"strict": False}):
            try:
                data = json.loads(match.group(0), **parser_kwargs)
                if isinstance(data, list):
                    return [str(x).strip() for x in data if str(x).strip()]
            except json.JSONDecodeError:
                continue

    # Attempt 3: the array is genuinely truncated (response hit max_tokens
    # mid-string, e.g. "...even on) — no closing quote/bracket exists at
    # all, so the regex above never matches. Look for just the OPENING
    # bracket instead, take everything after it, and salvage whatever
    # complete items exist by trimming back to the last fully-closed
    # item ('",') and closing the array there — so a paper still gets
    # 4-5 real bullets instead of one broken blob.
    open_bracket = cleaned.find("[")
    if open_bracket != -1:
        array_text = match.group(0) if match else cleaned[open_bracket:]
        last_complete_item = array_text.rfind('",')
        if last_complete_item != -1:
            repaired = array_text[: last_complete_item + 1] + "]"
            try:
                data = json.loads(repaired)
                if isinstance(data, list):
                    return [str(x).strip() for x in data if str(x).strip()]
            except json.JSONDecodeError:
                pass

    # Final fallback: split on lines/bullets. Only useful if the model
    # genuinely returned non-JSON, line-separated text — won't help if
    # everything came back as one unbroken line, but at least won't
    # silently return the raw array-as-text as a single "point" anymore
    # for the common cases above.
    lines = [line.strip("-•* \t") for line in cleaned.splitlines() if line.strip()]
    return lines[:fallback_limit]


def extract_key_points_rag(paper_text: str, max_points: int = 6, max_chunks: int = 4) -> list[str]:
    """Drop-in replacement for the old _extract_key_points() — 1 LLM call."""
    chunks = chunk_text(paper_text, chunk_size=1200, overlap=100)
    if not chunks:
        return []

    selected = _select_representative_chunks(chunks, max_chunks=max_chunks)
    combined = "\n\n---\n\n".join(selected)

    raw = call_llm(
        SYSTEM_PROMPT,
        f"Extract the {max_points} most important points (methods, "
        f"findings, contributions, results) from these excerpts of one "
        f"paper:\n\n{combined}",
        max_tokens=900,  # was the 600 default — too tight for 6 detailed
                          # points on content-rich papers, causing mid-JSON
                          # truncation (see paper 85: cut off with no
                          # closing bracket at all).
    )
    return _parse_json_list(raw)[:max_points]


# ---------------------------------------------------------------------
# Standalone test — run: python rag_paper_analysis.py
# NOTE: needs Django settings configured now (config comes from
# settings.py via llm_client.py). Easiest to test via `manage.py shell`.
# ---------------------------------------------------------------------

def test_key_point_extraction():
    fake_paper = (
        "Abstract: We propose a new method for graph learning. "
        "Introduction: prior work relies on random-walk based embeddings. "
        "Method: our approach uses attention over sampled neighborhoods. "
        "Results: we outperform baselines by 4 points on average across "
        "three benchmark datasets. "
        "Conclusion: this shows the value of attention-based aggregation "
        "for inductive node representation learning."
    ) * 6

    points = extract_key_points_rag(fake_paper, max_points=5, max_chunks=3)
    print("Key points extracted with 1 LLM call:")
    for p in points:
        print("-", p)

    assert points, "Expected at least one key point"
    print("rag_paper_analysis.py OK ✅ (chromadb not required)")


if __name__ == "__main__":
    test_key_point_extraction()