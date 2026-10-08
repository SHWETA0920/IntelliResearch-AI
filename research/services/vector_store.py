"""
Vector store — local, persistent Chroma DB, no external server needed.
One collection PER research session, so papers from different sessions
never leak into each other's retrieval results.

Install:
    pip install chromadb

During integration, move `_STORE_PATH` into Django settings
(e.g. BASE_DIR / "chroma_store") instead of a relative path.
"""
import chromadb

from .embeddings import embed_texts, embed_query

_CLIENT = None
_STORE_PATH = "chroma_store"


def _get_client():
    global _CLIENT
    if _CLIENT is None:
        _CLIENT = chromadb.PersistentClient(path=_STORE_PATH)
    return _CLIENT


def _collection_name(research_id) -> str:
    return f"research_{research_id}"


def get_collection(research_id):
    client = _get_client()
    return client.get_or_create_collection(name=_collection_name(research_id))


def add_paper_chunks(research_id, paper_id, chunks: list[str]):
    """Embeds + stores a paper's chunks. Safe to re-run (upserts)."""
    if not chunks:
        return

    collection = get_collection(research_id)
    ids = [f"paper{paper_id}_chunk{i}" for i in range(len(chunks))]
    embeddings = embed_texts(chunks)
    metadatas = [{"paper_id": str(paper_id), "chunk_index": i} for i in range(len(chunks))]

    collection.upsert(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)


def query_collection(research_id, query_text: str, top_k: int = 5, paper_id=None):
    collection = get_collection(research_id)
    query_embedding = embed_query(query_text)

    where = {"paper_id": str(paper_id)} if paper_id is not None else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
    )

    hits = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]

    for doc, meta, dist in zip(docs, metas, dists):
        hits.append({"text": doc, "paper_id": meta.get("paper_id"), "distance": dist})

    return hits


# ---------------------------------------------------------------------
# Standalone test — run: python vector_store.py
# ---------------------------------------------------------------------

def test_vector_store():
    add_paper_chunks(
        research_id="test_session",
        paper_id="1",
        chunks=[
            "Transformers rely on self-attention instead of recurrence.",
            "Convolutional networks use local filters for image data.",
        ],
    )
    hits = query_collection("test_session", "What mechanism do transformers use?", top_k=1)
    assert hits, "Expected at least one hit"
    print("Top hit:", hits[0]["text"])
    print("vector_store.py OK ✅")


if __name__ == "__main__":
    test_vector_store()