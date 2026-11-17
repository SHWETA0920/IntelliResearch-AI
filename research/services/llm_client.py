# """
# Shared LLM-calling helper. Deliberately has ZERO dependency on
# vector_store.py / chromadb, so anything that only needs to call the LLM
# (like rag_paper_analysis.py) doesn't drag in the retrieval stack.

# chat_service.py imports from here too, instead of defining its own copy.

# FIX: reads config from Django settings (getattr(settings, ...)), same as
# pipeline.py — single source of truth, not raw os.environ.

# FIX #2: restored the retry-with-backoff logic that was in the original
# pipeline.py's _call_llm but got dropped when this file was split out.
# Groq enforces TWO separate rate limits — requests per minute AND tokens
# per minute (TPM) — and the TPM one can trigger even with few, well-spaced
# calls if each call's prompt is large (like deep_paper_analysis.py's
# 6-chunk prompts). Without retry logic, a single 429 crashed the whole
# paper's analysis instead of waiting the few seconds Groq asks for.
# """
# import re
# import time
# import logging

# import requests
# from django.conf import settings

# logger = logging.getLogger(__name__)

# LLM_BASE_URL = getattr(settings, "LLM_BASE_URL", "https://api.groq.com/openai/v1")
# LLM_MODEL = getattr(settings, "LLM_MODEL", "openai/gpt-oss-120b")
# LLM_API_KEY = getattr(settings, "LLM_API_KEY", "")

# MAX_RETRIES = 4
# INITIAL_BACKOFF_SECONDS = 5


# def _extract_retry_seconds(response) -> float:
#     """
#     Groq signals how long to wait in a few different ways depending on
#     which limit was hit:
#       - Retry-After header (seconds)
#       - x-ratelimit-reset-tokens header (e.g. "5.9s" or "1m30s")
#       - or, for TPM limits specifically, inside the JSON error message
#         itself: "Please try again in 5.955s."
#     Falls back to exponential backoff if none of these parse.
#     """
#     retry_after = response.headers.get("Retry-After")
#     if retry_after:
#         try:
#             return float(retry_after)
#         except ValueError:
#             pass

#     reset_tokens = response.headers.get("x-ratelimit-reset-tokens")
#     if reset_tokens:
#         try:
#             if "m" in reset_tokens:
#                 minutes, seconds = reset_tokens.split("m")
#                 return float(minutes) * 60 + float(seconds.replace("s", ""))
#             return float(reset_tokens.replace("s", ""))
#         except ValueError:
#             pass

#     # Groq's TPM-limit error body includes "Please try again in 5.955s."
#     # even when no useful header is present — parse it directly.
#     try:
#         match = re.search(r"try again in ([\d.]+)s", response.text)
#         if match:
#             return float(match.group(1))
#     except Exception:  # noqa: BLE001
#         pass

#     return None  # signal caller to use exponential backoff instead


# # def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
# #     """
# #     max_tokens default (600) matches the original short key-point
# #     extraction use case. Callers needing longer structured output (like
# #     deep_paper_analysis.py's 7-field JSON) should pass a higher value.
# #     """
# #     if not LLM_API_KEY:
# #         raise RuntimeError(
# #             "LLM_API_KEY is not configured. Set it in settings.py / your .env."
# #         )

# #     backoff = INITIAL_BACKOFF_SECONDS
# #     last_exc = None

# #     for attempt in range(MAX_RETRIES):
# #         response = requests.post(
# #             f"{LLM_BASE_URL}/chat/completions",
# #             headers={"Authorization": f"Bearer {LLM_API_KEY}", "Content-Type": "application/json"},
# #             json={
# #                 "model": LLM_MODEL,
# #                 "messages": [
# #                     {"role": "system", "content": system_prompt},
# #                     {"role": "user", "content": user_prompt},
# #                 ],
# #                 "temperature": 0.2,
# #                 "max_tokens": max_tokens,
# #             },
# #             timeout=90,
# #         )

# #         if response.status_code == 429:
# #             wait_seconds = _extract_retry_seconds(response)
# #             if wait_seconds is None:
# #                 wait_seconds = backoff
# #                 backoff *= 2
# #             wait_seconds += 1  # small safety buffer

# #             logger.warning(
# #                 "Groq rate limit hit (attempt %s/%s). Waiting %.1fs before retry.",
# #                 attempt + 1, MAX_RETRIES, wait_seconds,
# #             )
# #             time.sleep(wait_seconds)
# #             last_exc = requests.exceptions.HTTPError(
# #                 f"429 rate limited after {attempt + 1} attempt(s). Response body: {response.text}"
# #             )
# #             continue

# #         try:
# #             response.raise_for_status()
# #         except requests.exceptions.HTTPError as exc:
# #             # include the response body — this is what actually explains a
# #             # 404/400 (e.g. Groq's "model_decommissioned" message), which
# #             # the bare raise_for_status() swallows.
# #             raise requests.exceptions.HTTPError(
# #                 f"{exc}. Response body: {response.text}"
# #             ) from exc

# #         return response.json()["choices"][0]["message"]["content"]

# #     raise last_exc or RuntimeError("LLM call failed after retries.")

# def call_llm(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
#     if not LLM_API_KEY:
#         raise RuntimeError(
#             "LLM_API_KEY is not configured. Set it in settings.py / your .env."
#         )

#     backoff = INITIAL_BACKOFF_SECONDS
#     last_exc = None

#     for attempt in range(MAX_RETRIES):
#         try:
#             response = requests.post(
#                 f"{LLM_BASE_URL.rstrip('/')}/chat/completions",
#                 headers={
#                     "Authorization": f"Bearer {LLM_API_KEY}",
#                     "Content-Type": "application/json",
#                 },
#                 json={
#                     "model": LLM_MODEL,
#                     "messages": [
#                         {"role": "system", "content": system_prompt},
#                         {"role": "user", "content": user_prompt},
#                     ],
#                     "temperature": 0.2,
#                     "max_tokens": max_tokens,
#                 },
#                 timeout=(10, 90),
#             )

#             if response.status_code == 429:
#                 wait_seconds = _extract_retry_seconds(response)

#                 if wait_seconds is None:
#                     wait_seconds = backoff
#                     backoff *= 2

#                 wait_seconds += 1
#                 last_exc = requests.exceptions.HTTPError(
#                     f"429 rate limited. Response body: {response.text}"
#                 )

#                 if attempt < MAX_RETRIES - 1:
#                     logger.warning(
#                         "Groq rate limit (attempt %s/%s). Waiting %.1fs.",
#                         attempt + 1,
#                         MAX_RETRIES,
#                         wait_seconds,
#                     )
#                     time.sleep(wait_seconds)
#                     continue

#                 break

#             response.raise_for_status()
#             return response.json()["choices"][0]["message"]["content"]

#         except (
#             requests.exceptions.ConnectionError,
#             requests.exceptions.Timeout,
#         ) as exc:
#             last_exc = exc

#             if attempt < MAX_RETRIES - 1:
#                 wait_seconds = backoff
#                 backoff *= 2

#                 logger.warning(
#                     "Temporary Groq connection failure (attempt %s/%s): %s. "
#                     "Retrying in %.1fs.",
#                     attempt + 1,
#                     MAX_RETRIES,
#                     exc,
#                     wait_seconds,
#                 )
#                 time.sleep(wait_seconds)
#                 continue

#         except requests.exceptions.HTTPError as exc:
#             raise requests.exceptions.HTTPError(
#                 f"{exc}. Response body: {response.text}"
#             ) from exc

#     raise last_exc or RuntimeError("LLM call failed after retries.")


# def test_call_llm():
#     print(f"Using model: {LLM_MODEL}")
#     print(f"Using base URL: {LLM_BASE_URL}")
#     print(f"API key configured: {bool(LLM_API_KEY)}")

#     if not LLM_API_KEY:
#         print("No LLM_API_KEY found in Django settings — skipping live call.")
#         return

#     result = call_llm("You are helpful.", "Say hi in 3 words.")
#     print("LLM response:", result)
#     print("llm_client.py OK ✅")


# if __name__ == "__main__":
#     # Note: this file now needs Django settings configured to run standalone.
#     # If running outside `manage.py shell`, you'll need:
#     #   import django, os
#     #   os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yourproject.settings")
#     #   django.setup()
#     # before this import works.
#     test_call_llm()



"""
Shared LLM-calling helper.

- Uses Django settings as the single source of configuration.
- Supports both prompt-based and messages-based calls.
- Retries rate limits, temporary server errors, and network failures.
- Does not retry permanent HTTP 4xx errors.
"""


import logging
import random
import re
import time

import requests
from django.conf import settings


logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

LLM_BASE_URL = getattr(
    settings,
    "LLM_BASE_URL",
    "https://api.groq.com/openai/v1",
).rstrip("/")

LLM_MODEL = getattr(
    settings,
    "LLM_MODEL",
    "openai/gpt-oss-120b",
)

LLM_API_KEY = getattr(
    settings,
    "LLM_API_KEY",
    "",
)

MAX_RETRIES = int(
    getattr(settings, "LLM_MAX_RETRIES", 4)
)

INITIAL_BACKOFF_SECONDS = float(
    getattr(settings, "LLM_INITIAL_BACKOFF_SECONDS", 3)
)

MAX_BACKOFF_SECONDS = float(
    getattr(settings, "LLM_MAX_BACKOFF_SECONDS", 60)
)

CONNECT_TIMEOUT = float(
    getattr(settings, "LLM_CONNECT_TIMEOUT", 10)
)

READ_TIMEOUT = float(
    getattr(settings, "LLM_READ_TIMEOUT", 90)
)


# ---------------------------------------------------------
# RETRY HELPERS
# ---------------------------------------------------------

def _seconds_from_header(value):
    """
    Parse retry values such as:
    '2', '2s', '1m30s', or '500ms'.
    """

    if not value:
        return None

    value = str(value).strip().lower()

    try:
        return max(0.0, float(value))
    except ValueError:
        pass

    matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*(ms|s|m|h)",
        value,
    )

    if not matches:
        return None

    total = 0.0

    for amount, unit in matches:
        amount = float(amount)

        if unit == "ms":
            total += amount / 1000
        elif unit == "s":
            total += amount
        elif unit == "m":
            total += amount * 60
        elif unit == "h":
            total += amount * 3600

    return total


def _extract_retry_seconds(response):
    """
    Read the server's suggested retry delay, if supplied.
    """

    for name in ("Retry-After", "retry-after"):
        delay = _seconds_from_header(
            response.headers.get(name)
        )

        if delay is not None:
            return delay

    for name in (
        "x-ratelimit-reset-tokens",
        "x-ratelimit-reset-requests",
    ):
        delay = _seconds_from_header(
            response.headers.get(name)
        )

        if delay is not None:
            return delay

    try:
        body = response.json()
        message = str(
            body.get("error", {}).get("message", "")
        )

    except (ValueError, AttributeError, TypeError):
        message = response.text or ""

    match = re.search(
        r"try again in\s+(\d+(?:\.\d+)?)\s*(ms|seconds?|s|m|h)",
        message,
        re.I,
    )

    if match:
        amount = float(match.group(1))
        unit = match.group(2).lower()

        if unit == "ms":
            return amount / 1000
        if unit == "m":
            return amount * 60
        if unit == "h":
            return amount * 3600

        return amount

    return None


def _is_daily_token_limit(response):
    """
    Detect Groq's daily token quota error.
    """

    try:
        body = response.json()
        error = body.get("error", {})
        message = str(
            error.get("message", "")
        ).lower()

        error_code = str(
            error.get("code", "")
        ).lower()

    except (ValueError, AttributeError, TypeError):
        message = (response.text or "").lower()
        error_code = ""

    return (
        "tokens per day" in message
        or "tokens per day (tpd)" in message
        or (
            error_code == "rate_limit_exceeded"
            and "daily" in message
        )
    )


def _backoff(attempt):
    """
    Exponential backoff with a small random delay.
    """

    delay = min(
        INITIAL_BACKOFF_SECONDS * (2 ** attempt),
        MAX_BACKOFF_SECONDS,
    )

    jitter = random.uniform(
        0,
        min(1.0, delay * 0.15),
    )

    return delay + jitter


# ---------------------------------------------------------
# MESSAGE VALIDATION
# ---------------------------------------------------------

def _prepare_messages(
    system_prompt=None,
    user_prompt=None,
    messages=None,
):
    """
    Convert supported call styles into a messages array.

    Supported:

        call_llm("System prompt", "User prompt")

        call_llm(messages=[
            {"role": "system", "content": "..."},
            {"role": "user", "content": "..."},
        ])

        call_llm([
            {"role": "system", "content": "..."},
            {"role": "user", "content": "..."},
        ])
    """

    if (
        messages is None
        and isinstance(system_prompt, list)
        and user_prompt is None
    ):
        messages = system_prompt

    if messages is not None:

        if not isinstance(messages, list):
            raise TypeError(
                "messages must be a list of message dictionaries."
            )

        request_messages = messages

    else:

        if not isinstance(system_prompt, str):
            raise TypeError(
                "system_prompt must be a string."
            )

        if not isinstance(user_prompt, str):
            raise TypeError(
                "user_prompt must be a string."
            )

        request_messages = [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ]

    if not request_messages:
        raise ValueError(
            "messages cannot be empty."
        )

    for index, message in enumerate(request_messages):

        if not isinstance(message, dict):
            raise TypeError(
                f"Message at index {index} must be a dictionary."
            )

        if not isinstance(message.get("role"), str):
            raise ValueError(
                f"Message at index {index} needs a string role."
            )

        if not isinstance(message.get("content"), str):
            raise ValueError(
                f"Message at index {index} needs string content."
            )

    return request_messages


# ---------------------------------------------------------
# RESPONSE VALIDATION
# ---------------------------------------------------------

def _extract_response_content(result):
    """
    Extract and validate the assistant's response text.
    """

    try:
        choices = result["choices"]

        if not choices:
            raise ValueError(
                "Groq returned an empty choices array."
            )

        message = choices[0]["message"]
        content = message.get("content")

        if not isinstance(content, str):
            raise TypeError(
                "Groq response content is not a string. "
                f"Received: {content!r}"
            )

        content = content.strip()

        if not content:
            finish_reason = choices[0].get("finish_reason")

            raise RuntimeError(
                "Groq returned empty response content. "
                f"Finish reason: {finish_reason!r}. "
                f"Response: {result}"
            )

        return content

    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(
            "Unexpected Groq response structure: "
            f"{result}"
        ) from exc


# ---------------------------------------------------------
# MAIN LLM FUNCTION
# ---------------------------------------------------------

def call_llm(
    system_prompt=None,
    user_prompt=None,
    max_tokens=1000,
    temperature=0.2,
    model=None,
    messages=None,
):
    """
    OpenAI-compatible chat completion request.

    Supports:
      - call_llm(system_prompt, user_prompt)
      - call_llm(messages=[...])
      - call_llm([...])

    Retries:
      - Temporary HTTP 429 rate limits
      - Temporary HTTP 5xx errors
      - Connection errors
      - Request timeouts

    Does not retry:
      - Daily token quota exhaustion
      - Permanent HTTP 4xx errors
      - Invalid or empty successful responses
    """

    api_key = LLM_API_KEY or getattr(
        settings,
        "LLM_API_KEY",
        "",
    )

    if not api_key:
        raise RuntimeError(
            "LLM_API_KEY is missing. "
            "Configure it in Django settings."
        )

    request_messages = _prepare_messages(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        messages=messages,
    )

    url = (
        f"{LLM_BASE_URL.rstrip('/')}"
        "/chat/completions"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model or LLM_MODEL,
        "messages": request_messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    retryable_network_errors = (
        requests.exceptions.ConnectionError,
        requests.exceptions.Timeout,
    )

    for attempt in range(MAX_RETRIES + 1):

        try:
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=(
                    CONNECT_TIMEOUT,
                    READ_TIMEOUT,
                ),
            )

            # ---------------------------------------------
            # HTTP 429: RATE LIMIT
            # ---------------------------------------------

            if response.status_code == 429:

                if _is_daily_token_limit(response):
                    logger.error(
                        "Groq daily token limit reached. "
                        "Not retrying: %s",
                        response.text[:3000],
                    )
                    response.raise_for_status()

                if attempt >= MAX_RETRIES:
                    logger.error(
                        "Groq rate limit persisted after retries: %s",
                        response.text[:3000],
                    )
                    response.raise_for_status()

                server_delay = _extract_retry_seconds(
                    response
                )

                if server_delay is not None:
                    delay = min(
                        server_delay,
                        MAX_BACKOFF_SECONDS,
                    )
                else:
                    delay = _backoff(attempt)

                logger.warning(
                    "Groq temporary rate limit (429), "
                    "attempt %s/%s; waiting %.1fs",
                    attempt + 1,
                    MAX_RETRIES,
                    delay,
                )

                time.sleep(delay)
                continue

            # ---------------------------------------------
            # HTTP 5XX: TEMPORARY SERVER ERRORS
            # ---------------------------------------------

            if 500 <= response.status_code < 600:

                if attempt >= MAX_RETRIES:
                    logger.error(
                        "Groq server error after retries: %s",
                        response.text[:3000],
                    )
                    response.raise_for_status()

                delay = _backoff(attempt)

                logger.warning(
                    "Groq server error %s, "
                    "attempt %s/%s; waiting %.1fs",
                    response.status_code,
                    attempt + 1,
                    MAX_RETRIES,
                    delay,
                )

                time.sleep(delay)
                continue

            # ---------------------------------------------
            # OTHER HTTP ERRORS
            # ---------------------------------------------

            if not response.ok:
                logger.error(
                    "Groq API error | status=%s | response=%s",
                    response.status_code,
                    response.text[:3000],
                )

                response.raise_for_status()

            # ---------------------------------------------
            # SUCCESSFUL HTTP RESPONSE
            # ---------------------------------------------

            try:
                result = response.json()
            except ValueError as exc:
                raise RuntimeError(
                    "Groq returned a successful HTTP status "
                    "but the response was not valid JSON. "
                    f"Response: {response.text[:3000]}"
                ) from exc

            return _extract_response_content(result)

        # ---------------------------------------------
        # NETWORK ERRORS AND TIMEOUTS
        # ---------------------------------------------

        except retryable_network_errors as exc:

            if attempt >= MAX_RETRIES:
                logger.exception(
                    "Groq network request failed after retries."
                )
                raise

            delay = _backoff(attempt)

            logger.warning(
                "Temporary Groq network error (%s), "
                "attempt %s/%s; waiting %.1fs",
                type(exc).__name__,
                attempt + 1,
                MAX_RETRIES,
                delay,
            )

            time.sleep(delay)

    raise RuntimeError(
        "Groq request ended without a successful response."
    )


# ---------------------------------------------------------
# CONNECTION TEST
# ---------------------------------------------------------

def test_call_llm():
    print("Testing Groq connection...")
    print("Model:", LLM_MODEL)
    print("Base URL:", LLM_BASE_URL)
    print("API key configured:", bool(LLM_API_KEY))

    if not LLM_API_KEY:
        print(
            "LLM_API_KEY is missing from Django settings."
        )
        return

    result = call_llm(
        "You are a helpful assistant.",
        "Reply with exactly: CONNECTION OK",
        max_tokens=100,
    )

    print("LLM response:", repr(result))
    print("LLM client test completed successfully.")


if __name__ == "__main__":
    print(
        "This module requires Django settings. "
        "Run test_call_llm() through manage.py shell."
    )