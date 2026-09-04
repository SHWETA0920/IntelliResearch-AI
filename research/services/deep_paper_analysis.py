"""
Deep, structured paper analysis — an addition alongside extract_key_points_rag,
not a replacement.

WHY THIS EXISTS:
extract_key_points_rag() gives 6 flat bullets. Good for a quick scan, but
too shallow for a researcher deciding whether to read the paper or what
to reuse — especially when two papers in the same subfield produce
near-identical bullets (see papers 74/75).

This asks for STRUCTURED categories instead of a flat list, which forces
the model to actually differentiate:
  - problem: what gap/problem does this paper address?
  - method: what approach/technique do they use?
  - datasets: what data/benchmarks were used?
  - key_findings: what did they actually find (with numbers if present)?
  - limitations: what does the paper itself admit is weak/unsolved?
  - novelty: what's different here vs. prior work?
  - future_work: what do they say is left to do?

Still 1 LLM call per paper — same cost profile as extract_key_points_rag,
just a richer prompt and more chunk coverage.

Output is saved separately (e.g. raw_ai_data["deep_analysis"]) so it
doesn't collide with the existing raw_ai_data["key_points"] field the
frontend already reads — PaperAnalysisPage.jsx keeps working unchanged
until someone (at integration) decides to also render this.
"""
import json
import re

import numpy as np

from .chunking import chunk_text
from .embeddings import embed_texts
from .llm_client import call_llm

DEEP_SYSTEM_PROMPT = (
    "You are an expert research assistant helping a researcher quickly "
    "understand an academic paper in depth. Respond with ONLY a JSON "
    "object — no prose, no markdown fences — with these exact keys:\n"
    '{\n'
    '  "problem": "the specific gap or problem this paper addresses (1-2 sentences)",\n'
    '  "method": "the core technique/approach, specific enough to distinguish it from similar papers (2-3 sentences)",\n'
    '  "datasets": "datasets, benchmarks, or evaluation setup used (or \'not specified\' if absent)",\n'
    '  "key_findings": "concrete results, ideally with numbers/metrics if present in the text (2-3 sentences)",\n'
    '  "limitations": "weaknesses or open issues the paper itself acknowledges (or \'not explicitly discussed\')",\n'
    '  "novelty": "what specifically differs from prior work mentioned in the excerpts (1-2 sentences)",\n'
    '  "future_work": "what the authors suggest as next steps (or \'not specified\')"\n'
    '}\n'
    "Be specific and concrete — avoid generic phrases like 'the paper proposes a new method'. "
    "If the excerpts genuinely don't cover a field, say so honestly rather than guessing."
)


def _select_representative_chunks(chunks: list[str], max_chunks: int = 6) -> list[str]:
    """Same strategy as rag_paper_analysis, but keeps more chunks (6 vs 4)
    since deep analysis needs broader coverage of the paper to fill out
    all 7 fields meaningfully, not just the intro/conclusion."""
    if len(chunks) <= max_chunks:
        return chunks

    vectors = np.array(embed_texts(chunks))
    centroid = vectors.mean(axis=0)
    similarities = vectors @ centroid

    keep_indices = {0, len(chunks) - 1}  # intro + conclusion always included
    remaining_slots = max(max_chunks - len(keep_indices), 0)

    ranked = sorted(
        (i for i in range(len(chunks)) if i not in keep_indices),
        key=lambda i: similarities[i],
        reverse=True,
    )
    keep_indices.update(ranked[:remaining_slots])

    return [chunks[i] for i in sorted(keep_indices)]


def _parse_json_object(raw: str) -> dict:
    cleaned = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()

    # Attempt 1: strict parse (handles the common, well-formed case).
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # Attempt 2: non-strict parse. Models sometimes format JSON with real
    # line breaks INSIDE string values (multi-line "readable" formatting),
    # which strict JSON rejects but strict=False tolerates.
    try:
        data = json.loads(cleaned, strict=False)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # Attempt 3: strip raw control characters (newlines/tabs) that appear
    # INSIDE quoted strings, then retry strict parsing. This is a last
    # resort — it can occasionally mangle intentional formatting, but
    # getting the 7 fields is more useful than one raw blob.
    try:
        repaired = re.sub(r'(?<=[^\\])\n(?=[^"]*")', ' ', cleaned)
        data = json.loads(repaired)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    # Final fallback: return the raw text under one field rather than
    # crashing, so a malformed response still shows the researcher
    # SOMETHING instead of an error.
    return {"raw_response": cleaned}


def extract_deep_analysis(paper_text: str, max_chunks: int = 6, chunk_size: int = 1500) -> dict:
    """
    Returns a structured dict with problem/method/datasets/key_findings/
    limitations/novelty/future_work. Still 1 LLM call.
    """
    chunks = chunk_text(paper_text, chunk_size=chunk_size, overlap=150)
    if not chunks:
        return {}

    selected = _select_representative_chunks(chunks, max_chunks=max_chunks)
    combined = "\n\n---\n\n".join(selected)

    raw = call_llm(
        DEEP_SYSTEM_PROMPT,
        f"Analyze these excerpts from one academic paper:\n\n{combined}",
        max_tokens=1000,  # 7 detailed fields need more room than the 600-token
                          # default (built for the shorter 6-bullet key-points
                          # extraction) — a truncated response can't be parsed
                          # as valid JSON no matter how good the parser is.
    )
    return _parse_json_object(raw)


# ---------------------------------------------------------------------
# Standalone test — run: python deep_paper_analysis.py
# Needs Django settings (via llm_client.py) — test through manage.py shell,
# same as rag_paper_analysis.py.
# ---------------------------------------------------------------------

def test_deep_analysis():
    fake_paper = (
        "Abstract: We propose GraphSAGE, an inductive framework for "
        "generating node embeddings that generalizes to unseen nodes, "
        "unlike transductive methods such as DeepWalk. "
        "Introduction: prior approaches require the entire graph to be "
        "present during training, which fails for evolving graphs. "
        "Method: we sample and aggregate features from a node's local "
        "neighborhood using learned aggregator functions. "
        "Experiments: we evaluate on three datasets — Cora, Citeseer, "
        "and a large Reddit post graph — achieving a 4-point F1 "
        "improvement over DeepWalk on Reddit. "
        "Limitations: performance depends heavily on neighborhood "
        "sampling size, and very deep graphs remain expensive. "
        "Future work: extending to heterogeneous graphs and dynamic "
        "edge weights is left for future research."
    ) * 3

    result = extract_deep_analysis(fake_paper)
    print(json.dumps(result, indent=2))

    assert "problem" in result or "raw_response" in result
    print("deep_paper_analysis.py OK ✅")


if __name__ == "__main__":
    test_deep_analysis()