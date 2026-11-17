import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import robotImg from "../assets/images/ai-assistant-robot.png";
// Single stylesheet for this page. Every rule inside is scoped under
// .ai-assistant-page, so no other page is affected.
// (AIAssistantEnhanced.css is no longer needed - remove its import/file.)
import "../styles/AIAssistant.css";

const SUGGESTED_QUESTIONS = [
  "What should I read first?",
  "What prerequisites do I need?",
  "Explain the main concept simply.",
  "Summarize this research topic.",
];

// Parallel to SUGGESTED_QUESTIONS: icon + one-line hint for each card.
const SUGGESTION_META = [
  { icon: "compass", hint: "Get a recommended reading order" },
  { icon: "link", hint: "See what to know before diving in" },
  { icon: "lightbulb", hint: "A plain-language explanation" },
  { icon: "book", hint: "A concise overview of your papers" },
];

const PROVIDER_PRESETS = {
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    baseUrl: "",
    model: "",
  },
};

// Non-secret settings only. The API key is deliberately never persisted.
const SETTINGS_STORAGE_KEY = "ai-assistant-llm-settings";

function loadSavedSettings() {
  const fallback = {
    provider: "groq",
    baseUrl: PROVIDER_PRESETS.groq.baseUrl,
    model: PROVIDER_PRESETS.groq.model,
  };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || !PROVIDER_PRESETS[parsed.provider]) return fallback;
    return {
      provider: parsed.provider,
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : fallback.baseUrl,
      model: typeof parsed.model === "string" ? parsed.model : fallback.model,
    };
  } catch {
    return fallback;
  }
}

// Make sure an API key can never leak into an on-screen error message.
function scrubSecret(message, secret) {
  let text = String(message || "Something went wrong. Please try again.");
  if (secret) text = text.split(secret).join("[hidden]");
  return text;
}

/* ------------------------------------------------------------------ */
/* Tiny inline icon set (no extra dependency)                          */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  compass:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  lightbulb:
    "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  sparkle:
    "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z",
  sliders:
    "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:
    "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22",
  fileText:
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  quote:
    "M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .76-2 2v6c0 1.25.76 2 2 2h4M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .76-2 2v6c0 1.25.76 2 2 2h4",
  route:
    "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 16h5a4 4 0 0 0 4-4v-1",
  check: "M20 6L9 17l-5-5",
  chevronDown: "M6 9l6 6 6-6",
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      className="aa-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Markdown-ish rendering (unchanged logic)                            */
/* ------------------------------------------------------------------ */

// The backend returns markdown-style text (**bold**, "- " bullet
// lines, blank-line-separated paragraphs, and occasionally a
// markdown table). Rendering that as raw text shows the literal
// characters, so this turns it into real React elements instead -
// no new dependency, just a small parser for the markdown bits the
// model actually uses.
function renderFormattedText(text) {
  if (!text) return null;

  const blocks = text.trim().split(/\n\s*\n/); // split into paragraphs/lists/tables

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").filter((l) => l.trim());

    const isTable =
      lines.length >= 2 &&
      lines.every((l) => l.trim().startsWith("|")) &&
      /^\|?\s*:?-+:?\s*\|/.test(lines[1].trim());

    if (isTable) {
      return renderTable(lines, blockIndex);
    }

    const isList = lines.length > 0 && lines.every((l) => /^[-•]\s+/.test(l.trim()));

    if (isList) {
      return (
        <ul className="chat-bubble-list" key={blockIndex}>
          {lines.map((line, i) => (
            <li key={i}>{renderInline(line.trim().replace(/^[-•]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p className="chat-bubble-paragraph" key={blockIndex}>
        {renderInline(block)}
      </p>
    );
  });
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines, blockIndex) {
  const headerCells = splitTableRow(lines[0]);
  const bodyRows = lines.slice(2).map(splitTableRow);

  return (
    <div className="chat-bubble-table-wrapper" key={blockIndex}>
      <table className="chat-bubble-table">
        <thead>
          <tr>
            {headerCells.map((cell, i) => (
              <th key={i}>{renderInline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Handles inline **bold** spans and [Paper N] / 【Paper N】 citation
// tags within a single paragraph/line/cell.
function renderInline(text) {
  const normalized = text.replace(/【([^】]+)】/g, "[$1]");
  const parts = normalized.split(/(\*\*[^*]+\*\*|\[Paper\s*\d+\])/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\[Paper\s*\d+\]$/.test(part)) {
      return (
        <span className="citation-tag" key={i}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function AIAssistant() {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);
  const sendingRef = useRef(false); // synchronous guard against double submits
  const activeIdRef = useRef(id); // ignore replies that arrive after navigating away

  // --- Optional "bring your own API key" settings panel state ---
  // When apiKey is blank (the default), nothing is sent to the backend
  // beyond the message itself - existing behavior is fully preserved.
  const [initialSettings] = useState(loadSavedSettings);
  const [provider, setProvider] = useState(initialSettings.provider);
  const [baseUrl, setBaseUrl] = useState(initialSettings.baseUrl);
  const [model, setModel] = useState(initialSettings.model);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); // mobile/tablet collapse

  useEffect(() => {
    activeIdRef.current = id;
    let cancelled = false;
    setResearch(null);
    setError(null);
    setMessages([]);
    api
      .getResearch(id)
      .then((data) => {
        if (!cancelled) setResearch(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Keep the newest message in view (scrolls only the chat list,
  // never the whole page).
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Auto-grow the composer textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  function handleProviderChange(nextProvider) {
    setProvider(nextProvider);
    const preset = PROVIDER_PRESETS[nextProvider];
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
  }

  // Persists provider / base URL / model in this browser only.
  // The API key is intentionally NOT stored: it lives in memory for
  // this page session and is lost on refresh.
  function saveSettings() {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ provider, baseUrl: baseUrl.trim(), model: model.trim() })
      );
    } catch {
      // Storage may be unavailable (private mode); settings still apply
      // to this session, so just fall through.
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2200);
  }

  function send(text) {
    const question = (typeof text === "string" ? text : input).trim();
    if (!question || sendingRef.current) return;

    sendingRef.current = true;
    const chatId = id;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    // Only attach custom LLM settings when the user actually entered
    // their own key - otherwise this stays null and
    // api.sendChatMessage behaves exactly as it always has.
    const key = apiKey.trim();
    const llmSettings = key
      ? {
          provider,
          base_url: baseUrl.trim(),
          model: model.trim(),
          api_key: key,
        }
      : null;

    api
      .sendChatMessage(chatId, question, llmSettings)
      .then((data) => {
        if (activeIdRef.current !== chatId) return;
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      })
      .catch((err) => {
        if (activeIdRef.current !== chatId) return;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            error: true,
            text: `Error: ${scrubSecret(err && err.message, key)}`,
          },
        ]);
      })
      .finally(() => {
        sendingRef.current = false;
        setSending(false);
      });
  }

  function handleComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  const usingCustomKey = Boolean(apiKey.trim());
  const canSend = Boolean(input.trim()) && !sending;

  return (
    <div className="ai-assistant-page">
      <div className="assistant-shell">
        {/* HERO */}
        <header className="assistant-hero">
          <div className="assistant-hero__text">
            <Link to={`/research/${id}`} className="assistant-back-link">
              <Icon name="arrowLeft" size={15} />
              Back to Workspace
            </Link>

            <span className="assistant-eyebrow">AI-powered research</span>
            <h1>Your research, understood.</h1>
            <p className="assistant-subtitle">
              Ask about your papers, the prerequisites behind them, the
              concepts they build on, and the best order to read them in.
            </p>

            {research?.topic && (
              <div className="assistant-topic-pill" title={research.topic}>
                <span className="assistant-topic-pill__label">Topic</span>
                <span className="assistant-topic-pill__text">{research.topic}</span>
              </div>
            )}
            {error && (
              <div className="assistant-error" role="alert">
                Error: {error}
              </div>
            )}

            <ul className="assistant-trust">
              <li>
                <Icon name="fileText" size={15} /> Paper-grounded answers
              </li>
              <li>
                <Icon name="quote" size={15} /> Paper citations
              </li>
              <li>
                <Icon name="route" size={15} /> Prerequisite-aware guidance
              </li>
            </ul>
          </div>

          <div className="assistant-hero__art" aria-hidden="true">
            <span className="assistant-hero__ring assistant-hero__ring--outer" />
            <span className="assistant-hero__ring assistant-hero__ring--inner" />
            <div className="assistant-hero__stage">
              <img src={robotImg} alt="" className="assistant-hero__robot" />
            </div>
          </div>
        </header>

        <div className="assistant-main-grid">
          {/* CHAT */}
          <section className="assistant-chat-card" aria-label="Research chat">
            <div className="assistant-chat-head">
              <span className="assistant-chat-head__icon" aria-hidden="true">
                <Icon name="sparkle" size={17} />
              </span>
              <div className="assistant-chat-head__titles">
                <h2>Research Assistant</h2>
                <p>Responses are grounded in the current research context</p>
              </div>
              <span className="assistant-chat-head__status">
                <span className="assistant-chat-head__dot" aria-hidden="true" />
                {usingCustomKey
                  ? `${PROVIDER_PRESETS[provider].label} · your key`
                  : "Default model"}
              </span>
            </div>

            <div
              className="assistant-messages"
              ref={messagesRef}
              role="log"
              aria-live="polite"
              aria-busy={sending}
            >
              {messages.length === 0 && !sending && (
                <div className="assistant-welcome">
                  <span className="assistant-welcome__icon" aria-hidden="true">
                    <Icon name="sparkle" size={22} />
                  </span>
                  <h3 className="assistant-welcome__title">
                    What would you like to understand?
                  </h3>
                  <p className="assistant-welcome__desc">
                    Pick a starting point below, or ask your own question. I
                    answer from your research papers and cite them as I go.
                  </p>
                  <div className="assistant-suggestions">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="suggestion-chip"
                        type="button"
                        disabled={sending}
                      >
                        <span className="suggestion-chip__icon">
                          <Icon name={SUGGESTION_META[i].icon} size={18} />
                        </span>
                        <span className="suggestion-chip__body">
                          <span className="suggestion-chip__title">{q}</span>
                          <span className="suggestion-chip__hint">
                            {SUGGESTION_META[i].hint}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`chat-row ${m.role}`}>
                  <div className="chat-avatar" aria-hidden="true">
                    {m.role === "assistant" ? <Icon name="sparkle" size={15} /> : "You"}
                  </div>
                  <div
                    className={`chat-bubble ${m.role}${m.error ? " is-error" : ""}`}
                  >
                    {m.role === "assistant" ? renderFormattedText(m.text) : m.text}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="chat-thinking" role="status">
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                  Reading your papers...
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="assistant-input-form"
            >
              <div className="composer-box">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask anything about your research papers..."
                  className="assistant-input"
                  rows={1}
                  aria-label="Message the research assistant"
                />
                <button
                  className="assistant-send-button"
                  type="submit"
                  disabled={!canSend}
                  aria-label={sending ? "Sending message" : "Send message"}
                >
                  <Icon name="send" size={17} />
                </button>
              </div>
              <div className="composer-meta">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>Answers are based on your research context.</span>
              </div>
            </form>
          </section>

          {/* SETTINGS */}
          <aside className="assistant-settings-card" aria-label="Model settings">
            <div className="settings-header">
              <span className="settings-icon" aria-hidden="true">
                <Icon name="sliders" size={16} />
              </span>
              <h2>Model settings</h2>
              <span
                className={`settings-status ${
                  usingCustomKey ? "is-custom" : "is-default"
                }`}
              >
                {usingCustomKey ? "Custom API key" : "Default model"}
              </span>
              <button
                type="button"
                className="settings-toggle"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-expanded={settingsOpen}
                aria-controls="assistant-settings-body"
                aria-label={settingsOpen ? "Hide model settings" : "Show model settings"}
              >
                <Icon name="chevronDown" size={18} />
              </button>
            </div>

            <div
              id="assistant-settings-body"
              className={`settings-body${settingsOpen ? " is-open" : ""}`}
            >
              <p className="settings-hint">
                Uses the default model unless you add your own key. Bring a
                different provider or your own plan.
              </p>

              <div className="settings-group">
                <label className="settings-label" htmlFor="llm-provider">
                  Provider
                </label>
                <select
                  id="llm-provider"
                  className="settings-select"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label" htmlFor="llm-api-key">
                  API key
                </label>
                <div className="settings-key-field">
                  <input
                    id="llm-api-key"
                    type={showApiKey ? "text" : "password"}
                    className="settings-input"
                    placeholder="Leave blank to use the default"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="settings-key-toggle"
                    onClick={() => setShowApiKey((v) => !v)}
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    aria-pressed={showApiKey}
                  >
                    <Icon name={showApiKey ? "eyeOff" : "eye"} size={17} />
                  </button>
                </div>
              </div>

              <div className="settings-group">
                <label className="settings-label" htmlFor="llm-base-url">
                  Base URL
                </label>
                <input
                  id="llm-base-url"
                  type="text"
                  className="settings-input"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  spellCheck={false}
                />
              </div>

              <div className="settings-group">
                <label className="settings-label" htmlFor="llm-model">
                  Model
                </label>
                <input
                  id="llm-model"
                  type="text"
                  className="settings-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="model-name"
                  spellCheck={false}
                />
              </div>

              <button
                type="button"
                className="settings-save-button"
                onClick={saveSettings}
              >
                {settingsSaved ? (
                  <>
                    <Icon name="check" size={16} /> Saved to this browser
                  </>
                ) : (
                  "Save settings"
                )}
              </button>

              <p className="settings-privacy">
                Provider, base URL and model are remembered in this browser. Your
                API key is kept in memory only, sent with your requests, and is
                cleared when you refresh. It is not securely stored, so only use
                a key you are comfortable having in this browser.
              </p>

              {usingCustomKey && (
                <p className="settings-active-note" role="status">
                  Using your {PROVIDER_PRESETS[provider].label} key for new
                  messages.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;