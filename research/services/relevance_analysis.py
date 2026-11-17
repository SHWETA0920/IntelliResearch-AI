
# import json
# import re

# from .llm_client import call_llm


# RELEVANCE_SYSTEM_PROMPT = """
# You are an academic research relevance assessor.

# Compare a paper's content with the research topic supplied by the user.
# Base your judgment only on the supplied topic and paper content.

# Return ONLY a valid JSON object with these keys:
# {
#   "status": "relevant | partially_relevant | low_relevance",
#   "reason": "A concise explanation of why the paper matches or does not match the topic.",
#   "evidence": "A short quotation or specific detail from the supplied paper text supporting the assessment."
# }

# Guidelines:
# - relevant: the paper directly investigates or substantially advances the topic.
# - partially_relevant: the paper addresses a related method, subproblem, or supporting concept.
# - low_relevance: the paper has little direct connection to the topic.
# - Do not infer relevance from filename alone.
# - Do not invent evidence, methods, findings, or quotations.
# - If the text does not provide enough evidence, use partially_relevant and explain the uncertainty.
# """


# def assess_paper_relevance(topic: str, paper_text: str) -> dict:
#     """Assess one paper against the user's actual research topic."""
#     if not topic or not topic.strip():
#         return {
#             "status": "unknown",
#             "reason": "No research topic was provided.",
#             "evidence": "",
#         }

#     if not paper_text or not paper_text.strip():
#         return {
#             "status": "unknown",
#             "reason": "The paper's text could not be extracted.",
#             "evidence": "",
#         }

#     # Limit prompt size while retaining the beginning and end of the paper.
#     text = paper_text.strip()
#     max_chars = 12000
#     if len(text) > max_chars:
#         text = text[:9000] + "\n\n[Middle section omitted]\n\n" + text[-3000:]

#     raw = call_llm(
#         RELEVANCE_SYSTEM_PROMPT,
#         f"RESEARCH TOPIC:\n{topic.strip()}\n\nPAPER TEXT:\n{text}",
#         max_tokens=400,
#     )

#     cleaned = re.sub(
#         r"^\s*```(?:json)?\s*|\s*```\s*$",
#         "",
#         raw.strip(),
#         flags=re.IGNORECASE,
#     )

#     try:
#         result = json.loads(cleaned)
#     except json.JSONDecodeError:
#         return {
#             "status": "unknown",
#             "reason": "The AI returned an invalid relevance response.",
#             "evidence": "",
#         }

#     allowed = {"relevant", "partially_relevant", "low_relevance"}
#     status = result.get("status")

#     if status not in allowed:
#         status = "unknown"

#     return {
#         "status": status,
#         "reason": str(result.get("reason", ""))[:1500],
#         "evidence": str(result.get("evidence", ""))[:1000],
#     }

import json
import re

from .llm_client import call_llm


RELEVANCE_SYSTEM_PROMPT = """
You are an academic research relevance assessor.

Compare a paper's content with the research topic supplied by the user.
Base your judgment only on the supplied topic and paper content.

Return ONLY a valid JSON object with these keys:
{
  "status": "relevant | partially_relevant | low_relevance",
  "reason": "A concise explanation of why the paper matches or does not match the topic.",
  "evidence": "A short quotation or specific detail from the supplied paper text supporting the assessment."
}

Guidelines:
- relevant: the paper directly investigates or substantially advances the topic.
- partially_relevant: the paper addresses a related method, subproblem, or supporting concept.
- low_relevance: the paper has little direct connection to the topic.
- Do not infer relevance from filename alone.
- Do not invent evidence, methods, findings, or quotations.
- If the text does not provide enough evidence, use partially_relevant and explain the uncertainty.
"""


PAIRWISE_RELEVANCE_SYSTEM_PROMPT = """
You are an academic research-comparison assessor.

Compare TWO supplied papers for substantive conceptual relevance.

Assess shared or complementary:
- research questions
- topics and concepts
- methods and techniques
- datasets
- findings
- theoretical approaches
- contributions

Important:
- Do NOT treat a citation or reference alone as evidence of relevance.
- Do NOT treat common authorship, the same journal, or generic field membership as sufficient relevance.
- A meaningful shared or complementary research contribution is required.

Return ONLY valid JSON with these keys:
{
  "relevant": true,
  "score": 0.0,
  "reason": "A brief explanation of the relationship.",
  "evidence": "Specific supporting details from both papers."
}

Score must be between 0.0 and 1.0.

Set relevant=true only when:
- score is at least 0.55, AND
- there is a meaningful substantive connection.

If evidence is insufficient, return relevant=false and a low score.
Do not invent details or quotations.
"""


def _clean_json(raw):
    """Remove optional Markdown code fences around a JSON response."""
    return re.sub(
        r"^\s*```(?:json)?\s*|\s*```\s*$",
        "",
        (raw or "").strip(),
        flags=re.IGNORECASE,
    )


def _paper_excerpt(text, max_chars=10000):
    """Keep the beginning and end of a paper when limiting prompt size."""
    text = (text or "").strip()

    if len(text) <= max_chars:
        return text

    return (
        text[:7500]
        + "\n\n[Middle section omitted]\n\n"
        + text[-2500:]
    )


def assess_paper_relevance(topic: str, paper_text: str) -> dict:
    """
    Existing feature:
    Assess one paper against the overall research topic.
    """

    if not topic or not topic.strip():
        return {
            "status": "unknown",
            "reason": "No research topic was provided.",
            "evidence": "",
        }

    if not paper_text or not paper_text.strip():
        return {
            "status": "unknown",
            "reason": "The paper's text could not be extracted.",
            "evidence": "",
        }

    prompt = (
        f"RESEARCH TOPIC:\n{topic.strip()}\n\n"
        f"PAPER TEXT:\n{_paper_excerpt(paper_text, 12000)}"
    )

    raw = call_llm(
        RELEVANCE_SYSTEM_PROMPT,
        prompt,
        max_tokens=400,
    )

    try:
        result = json.loads(_clean_json(raw))
    except (json.JSONDecodeError, TypeError):
        return {
            "status": "unknown",
            "reason": "The AI returned an invalid relevance response.",
            "evidence": "",
        }

    status = result.get("status")

    if status not in {
        "relevant",
        "partially_relevant",
        "low_relevance",
    }:
        status = "unknown"

    return {
        "status": status,
        "reason": str(result.get("reason", ""))[:1500],
        "evidence": str(result.get("evidence", ""))[:1000],
    }


def assess_pairwise_relevance(
    paper_a_text: str,
    paper_b_text: str,
) -> dict:
    """
    New feature:
    Assess substantive relevance between two papers.

    This assessment is independent of citation and prerequisite
    relationships.
    """

    if not paper_a_text or not paper_b_text:
        return {
            "relevant": False,
            "score": 0.0,
            "reason": "One or both papers have no extractable text.",
            "evidence": "",
        }

    prompt = (
        f"PAPER A:\n{_paper_excerpt(paper_a_text)}\n\n"
        f"PAPER B:\n{_paper_excerpt(paper_b_text)}"
    )

    raw = call_llm(
        PAIRWISE_RELEVANCE_SYSTEM_PROMPT,
        prompt,
        max_tokens=500,
    )

    try:
        result = json.loads(_clean_json(raw))

        score = float(result.get("score", 0.0))
        score = max(0.0, min(1.0, score))

        relevant = (
            bool(result.get("relevant", False))
            and score >= 0.55
        )

        return {
            "relevant": relevant,
            "score": round(score, 3),
            "reason": str(result.get("reason", ""))[:1500],
            "evidence": str(result.get("evidence", ""))[:1500],
        }

    except (json.JSONDecodeError, TypeError, ValueError):
        return {
            "relevant": False,
            "score": 0.0,
            "reason": (
                "The AI returned an invalid pairwise "
                "relevance response."
            ),
            "evidence": "",
        }
        