"""
RAG chatbot for a research session. Answers questions grounded ONLY in the
retrieved chunks from the uploaded papers.

Uses llm_client.py for the actual LLM call (reads config from Django
settings, same as pipeline.py — single source of truth for
LLM_BASE_URL / LLM_MODEL / LLM_API_KEY).
"""
from .rag_retriever import retrieve_context
from .llm_client import call_llm

# SYSTEM_PROMPT = (
#     "You are a research assistant. Answer ONLY using the provided paper "
#     "excerpts. If the excerpts don't contain the answer, say you don't "
#     "have enough information from the uploaded papers instead of guessing. "
#     "Mention which paper each fact comes from when possible."
# )
SYSTEM_PROMPT = (
    "You are a research assistant. Answer ONLY using the provided paper "
    "excerpts. If the excerpts don't contain the answer, say you don't "
    "have enough information from the uploaded papers instead of guessing. "
    "Mention which paper each fact comes from when possible. "
    "CRITICAL: excerpts from a Literature Review or Related Work section "
    "often describe OTHER researchers' methods, not the paper's own work — "
    "look for citation markers like '[17]', author names, or phrases like "
    "'X et al. implemented...' Do not attribute a cited study's methods, "
    "datasets, or results to the current paper's own experiment unless the "
    "excerpt clearly states it as the authors' own work."
)

def _build_prompt(question: str, hits: list[dict]) -> str:
    context_blocks = [f"[Paper {h['paper_id']}]: {h['text']}" for h in hits]
    context = "\n\n".join(context_blocks) if context_blocks else "No relevant excerpts found."

    return (
        f"Paper excerpts:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer clearly and concisely, grounded only in the excerpts above."
    )


def answer_question(research_id, question: str, top_k: int = 5, paper_id=None) -> dict:
    """
    Matches the {answer, evidence} shape your frontend (ChatWidget.jsx,
    AIAssistant.jsx) already expects from api.sendChatMessage().
    """
    hits = retrieve_context(research_id, question, top_k=top_k, paper_id=paper_id)

    if not hits:
        return {
            "answer": "I don't have any indexed content for this research "
                      "session yet — make sure the papers have been analyzed first.",
            "evidence": [],
        }

    prompt = _build_prompt(question, hits)
    answer = call_llm(SYSTEM_PROMPT, prompt)
    evidence = [{"paper_id": h["paper_id"], "excerpt": h["text"][:200]} for h in hits]

    return {"answer": answer, "evidence": evidence}


# ---------------------------------------------------------------------
# Standalone test — run: python chat_service.py
# NOTE: now needs Django settings configured (see llm_client.py's note
# at the bottom of its __main__ block) since config comes from settings,
# not raw env vars. Easiest way to test this file for real: from
# `python manage.py shell`.
# ---------------------------------------------------------------------

def test_rag_answer():
    from .rag_retriever import index_paper

    text = (
        "This paper proposes GraphSAGE, an inductive framework for node "
        "embeddings that generalizes to unseen nodes, unlike transductive "
        "methods such as DeepWalk. It requires understanding of graph "
        "convolutional networks as background knowledge."
    ) * 3
    index_paper(research_id="demo2", paper_id="7", paper_text=text)

    result = answer_question("demo2", "What background knowledge does this paper assume?")
    print("Answer:", result["answer"])
    print("Evidence:", result["evidence"])


def test_chat_service():
    test_rag_answer()
    print("chat_service.py OK ✅")


if __name__ == "__main__":
    test_chat_service()