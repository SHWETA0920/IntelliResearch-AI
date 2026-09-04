"""
Chunking utilities for RAG.

Standalone — depends on nothing else in this project. Safe to develop
and test in isolation.
"""
import re


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    """
    Splits text into overlapping chunks by character count (not tokens —
    simple, dependency-free, good enough for this use case).

    chunk_size / overlap are in characters.
    """
    text = clean_text(text)
    if not text:
        return []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # avoid cutting mid-sentence if a period is nearby
        if end < text_len:
            next_period = text.find(". ", end)
            if next_period != -1 and next_period - end < 150:
                end = next_period + 1

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= text_len:
            break
        start = max(end - overlap, start + 1)  # always move forward

    return chunks


# ---------------------------------------------------------------------
# Standalone test — run: python chunking.py
# ---------------------------------------------------------------------

def test_chunking():
    sample = "This is one sentence about transformers. " * 100
    chunks = chunk_text(sample, chunk_size=500, overlap=100)
    print(f"Produced {len(chunks)} chunks from {len(sample)} chars")
    assert len(chunks) > 1, "Expected multiple chunks for long text"
    assert all(len(c) > 0 for c in chunks)
    print("chunking.py OK ✅")


if __name__ == "__main__":
    test_chunking()