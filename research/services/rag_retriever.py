"""
High-level retrieval pipeline: raw paper text -> chunks -> embeddings ->
vector store, plus a retrieve_context() helper used by chat_service.py.

Standalone: only depends on chunking.py, embeddings.py, vector_store.py
(all files you own). No dependency on your teammate's code, pipeline.py,
or pdf_extraction.py — a self-contained PDF reader is included below so
you can test end-to-end without them. Swap it out at integration time
if you want to reuse the shared one.
"""
from .chunking import chunk_text
from .vector_store import add_paper_chunks, query_collection


def index_paper(research_id, paper_id, paper_text: str, chunk_size: int = 900, overlap: int = 150):
    """
    Call once per paper (after text extraction) to make it searchable.
    Safe to re-run — upserts, doesn't duplicate.
    """
    chunks = chunk_text(paper_text, chunk_size=chunk_size, overlap=overlap)
    add_paper_chunks(research_id, paper_id, chunks)
    return {"paper_id": paper_id, "chunks_indexed": len(chunks)}


def retrieve_context(research_id, question: str, top_k: int = 5, paper_id=None):
    """
    Returns the most relevant chunks for a question, across all papers in
    a research session (or scoped to a single paper if paper_id is given).
    """
    return query_collection(research_id, question, top_k=top_k, paper_id=paper_id)


def extract_pdf_text_standalone(path_or_fileobj) -> str:
    """
    Self-contained PDF text extraction so this module works without
    pdf_extraction.py during Phase 2. At integration time you can swap
    this for the shared version — same signature idea.
    """
    import pdfplumber
    text_parts = []
    with pdfplumber.open(path_or_fileobj) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or "")
    return "\n".join(text_parts).strip()


# ---------------------------------------------------------------------
# Standalone test — run: python rag_retriever.py
# ---------------------------------------------------------------------

def test_pdf_retrieval():
    fake_paper_text = (
        "This paper introduces a new attention mechanism for transformers. "
        "It builds on prior work in recurrent networks and convolutional "
        "architectures. The main contribution is a linear-time attention "
        "variant. Experiments show a 2x speedup with comparable accuracy."
    ) * 5

    result = index_paper(research_id="demo", paper_id="42", paper_text=fake_paper_text)
    print("Indexed:", result)

    hits = retrieve_context("demo", "What is the main contribution?", top_k=3)
    for h in hits:
        print("-", h["text"][:90], "...")

    assert hits, "Expected retrieval hits"
    print("rag_retriever.py OK ✅")


if __name__ == "__main__":
    test_pdf_retrieval()