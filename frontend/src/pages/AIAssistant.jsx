import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import "../styles/AIAssistant.css";

const SUGGESTED_QUESTIONS = [
  "What should I read first?",
  "What prerequisites do I need?",
  "Explain the main concept simply.",
  "Summarize this research topic.",
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

// The backend returns markdown-style text (**bold**, "- " bullet
// lines, blank-line-separated paragraphs, and occasionally a
// markdown table). Rendering that as raw text shows the literal
// characters, so this turns it into real React elements instead —
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
            <li key={i}>{renderInline(line.replace(/^[-•]\s+/, ""))}</li>
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

function AIAssistant() {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // --- Optional "bring your own API key" settings panel state ---
  // Kept entirely separate from the chat state above. When apiKey is
  // blank (the default), nothing is sent to the backend beyond the
  // message itself — existing behavior is fully preserved.
  const [provider, setProvider] = useState("groq");
  const [baseUrl, setBaseUrl] = useState(PROVIDER_PRESETS.groq.baseUrl);
  const [model, setModel] = useState(PROVIDER_PRESETS.groq.model);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    api.getResearch(id).then(setResearch).catch((err) => setError(err.message));
  }, [id]);

  function handleProviderChange(nextProvider) {
    setProvider(nextProvider);
    const preset = PROVIDER_PRESETS[nextProvider];
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
  }

  function saveSettings() {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1800);
  }

  function send(text) {
    const question = text ?? input;
    if (!question.trim() || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    // Only attach custom LLM settings when the user actually entered
    // their own key — otherwise this stays undefined and
    // api.sendChatMessage behaves exactly as it always has.
    const llmSettings = apiKey.trim()
      ? {
          provider,
          base_url: baseUrl.trim(),
          model: model.trim(),
          api_key: apiKey.trim(),
        }
      : null;

    api
      .sendChatMessage(id, question, llmSettings)
      .then((data) => {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
        setSending(false);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${err.message}` },
        ]);
        setSending(false);
      });
  }

  return (
    <div className="ai-assistant-page">
      <div className="assistant-shell assistant-shell-with-sidebar">
        {/* TOP BAR */}
        <div className="assistant-topbar">
          <Link to={`/research/${id}`} className="assistant-back-link">
            ← Back to Workspace
          </Link>
        </div>

        {/* HEADER */}
        <div className="assistant-header">
          <span className="assistant-eyebrow">Grounded in your papers only</span>
          <h1>AI Research Assistant</h1>
          {research && <p className="assistant-topic">{research.topic}</p>}
          {error && <div className="assistant-error">Error: {error}</div>}
        </div>

        <div className="assistant-main-grid">
          {/* CHAT CARD */}
          <div className="assistant-chat-card">
            <div className="assistant-messages">
              {messages.length === 0 && (
                <div>
                  <p className="assistant-suggestions-label">Try asking:</p>
                  <div className="assistant-suggestions">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="suggestion-chip"
                        type="button"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>
                  {m.role === "assistant" ? renderFormattedText(m.text) : m.text}
                </div>
              ))}

              {sending && (
                <div className="chat-thinking">
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                  <span className="chat-thinking-dot" />
                  Thinking...
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your papers, prerequisites, or learning path..."
                className="assistant-input"
              />
              <button
                className="assistant-send-button"
                type="submit"
                disabled={sending}
              >
                Send
              </button>
            </form>
          </div>

          {/* SETTINGS SIDE PANEL */}
          <aside className="assistant-settings-card">
            <div className="settings-header">
              <span className="settings-icon">◉</span>
              <h2>AI Settings</h2>
            </div>

            <p className="settings-hint">
              Using the default key by default. Add your own to use a
              different provider or your own paid plan.
            </p>

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

            <label className="settings-label" htmlFor="llm-api-key">
              API key
            </label>
            <div className="settings-key-field">
              <input
                id="llm-api-key"
                type={showApiKey ? "text" : "password"}
                className="settings-input"
                placeholder="Leave blank to use the default key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="settings-key-toggle"
                onClick={() => setShowApiKey((v) => !v)}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? "🙈" : "👁"}
              </button>
            </div>

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
            />

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
            />

            <button
              type="button"
              className="settings-save-button"
              onClick={saveSettings}
            >
              {settingsSaved ? "✓ Saved" : "Save Settings"}
            </button>

            {apiKey.trim() && (
              <p className="settings-active-note">
                Using your {PROVIDER_PRESETS[provider].label} key for new messages.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;