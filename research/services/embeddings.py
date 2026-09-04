"""
Local embedding model wrapper.

Uses sentence-transformers so embeddings are computed on your machine —
ZERO API calls, ZERO rate-limit risk for this step. Only the final
answer-generation / key-point call goes to Groq.

Install:
    pip install sentence-transformers
"""
from functools import lru_cache

_MODEL_NAME = "all-MiniLM-L6-v2"  # small, fast, good enough for this use case


@lru_cache(maxsize=1)
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(_MODEL_NAME)


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = _get_model()
    vectors = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return vectors.tolist()


def embed_query(query: str) -> list[float]:
    return embed_texts([query])[0]


# ---------------------------------------------------------------------
# Standalone test — run: python embeddings.py
# ---------------------------------------------------------------------

def test_embeddings():
    vecs = embed_texts(["hello world", "graph neural networks", "self-attention"])
    assert len(vecs) == 3
    assert len(vecs[0]) > 0
    print(f"Embedding dimension: {len(vecs[0])}")
    print("embeddings.py OK ✅")


if __name__ == "__main__":
    test_embeddings()