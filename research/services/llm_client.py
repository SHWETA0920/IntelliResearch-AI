"""
Shared LLM-calling helper. Deliberately has ZERO dependency on
vector_store.py / chromadb, so anything that only needs to call the LLM
(like rag_paper_analysis.py) doesn't drag in the retrieval stack.

chat_service.py imports from here too, instead of defining its own copy.

FIX: reads config from Django settings (getattr(settings, ...)), same as
pipeline.py — single source of truth, not raw os.environ.

FIX #2: restored the retry-with-backoff logic that was in the original
pipeline.py's _call_llm but got dropped when this file was split out.
Groq enforces TWO separate rate limits — requests per minute AND tokens
per minute (TPM) — and the TPM one can trigger even with few, well-spaced
calls if each call's prompt is large (like deep_paper_analysis.py's
6-chunk prompts). Without retry logic, a single 429 crashed the whole
paper's analysis instead of waiting the few seconds Groq asks for.
"""
import re
import time
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

LLM_BASE_URL = getattr(settings, "LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b")
LLM_API_KEY = getattr(settings, "LLM_API_KEY", "")

MAX_RETRIES = 4
INITIAL_BACKOFF_SECONDS = 5


def _extract_retry_seconds(response) -> float:
    """
    Groq signals how long to wait in a few different ways depending on
    which limit was hit:
      - Retry-After header (seconds)
      - x-ratelimit-reset-tokens header (e.g. "5.9s" or "1m30s")
      - or, for TPM limits specifically, inside the JSON error message
        itself: "Please try again in 5.955s."
    Falls back to exponential backoff if none of these parse.
    """
    retry_after = response.headers.get("Retry-After")
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass

    reset_tokens = response.headers.get("x-ratelimit-reset-tokens")
    if reset_tokens:
        try:
            if "m" in reset_tokens:
                minutes, seconds = reset_tokens.split("m")
                return float(minutes) * 60 + float(seconds.replace("s", ""))
            return float(reset_tokens.replace("s", ""))
        except ValueError:
            pass

    # Groq's TPM-limit error body includes "Please try again in 5.955s."
    # even when no useful header is present — parse it directly.
    try:
        match = re.search(r"try again in ([\d.]+)s", response.text)
        if match:
            return float(match.group(1))
    except Exception:  # noqa: BLE001
        pass

    return None  # signal caller to use exponential backoff instead


def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
    """
    max_tokens default (600) matches the original short key-point
    extraction use case. Callers needing longer structured output (like
    deep_paper_analysis.py's 7-field JSON) should pass a higher value.
    """
    if not LLM_API_KEY:
        raise RuntimeError(
            "LLM_API_KEY is not configured. Set it in settings.py / your .env."
        )

    backoff = INITIAL_BACKOFF_SECONDS
    last_exc = None

    for attempt in range(MAX_RETRIES):
        response = requests.post(
            f"{LLM_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
                "max_tokens": max_tokens,
            },
            timeout=90,
        )

        if response.status_code == 429:
            wait_seconds = _extract_retry_seconds(response)
            if wait_seconds is None:
                wait_seconds = backoff
                backoff *= 2
            wait_seconds += 1  # small safety buffer

            logger.warning(
                "Groq rate limit hit (attempt %s/%s). Waiting %.1fs before retry.",
                attempt + 1, MAX_RETRIES, wait_seconds,
            )
            time.sleep(wait_seconds)
            last_exc = requests.exceptions.HTTPError(
                f"429 rate limited after {attempt + 1} attempt(s). Response body: {response.text}"
            )
            continue

        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as exc:
            # include the response body — this is what actually explains a
            # 404/400 (e.g. Groq's "model_decommissioned" message), which
            # the bare raise_for_status() swallows.
            raise requests.exceptions.HTTPError(
                f"{exc}. Response body: {response.text}"
            ) from exc

        return response.json()["choices"][0]["message"]["content"]

    raise last_exc or RuntimeError("LLM call failed after retries.")


def test_call_llm():
    print(f"Using model: {LLM_MODEL}")
    print(f"Using base URL: {LLM_BASE_URL}")
    print(f"API key configured: {bool(LLM_API_KEY)}")

    if not LLM_API_KEY:
        print("No LLM_API_KEY found in Django settings — skipping live call.")
        return

    result = call_llm("You are helpful.", "Say hi in 3 words.")
    print("LLM response:", result)
    print("llm_client.py OK ✅")


if __name__ == "__main__":
    # Note: this file now needs Django settings configured to run standalone.
    # If running outside `manage.py shell`, you'll need:
    #   import django, os
    #   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yourproject.settings")
    #   django.setup()
    # before this import works.
    test_call_llm()