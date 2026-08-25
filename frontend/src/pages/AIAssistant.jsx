import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";

const SUGGESTED_QUESTIONS = [
  "What should I read first?",
  "What prerequisites do I need?",
  "Explain the main concept simply.",
  "Summarize this research topic.",
];

function AIAssistant() {
  const { id } = useParams();
  const [research, setResearch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getResearch(id).then(setResearch).catch((err) => setError(err.message));
  }, [id]);

  function send(text) {
    const question = text ?? input;
    if (!question.trim() || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    api
      .sendChatMessage(id, question)
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
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="pill-nav">
          <Link to={`/research/${id}`} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--signal)" }}>
            ← Back to Workspace
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: 30, maxWidth: 720 }}>
        <span className="eyebrow">Grounded in your papers only</span>
        <h1 style={{ fontSize: 32, marginTop: 14 }}>AI Research Assistant</h1>
        {research && <p style={{ color: "var(--text-muted)", marginTop: 6 }}>{research.topic}</p>}
        {error && (
          <p style={{ color: "#E14B4B", background: "#FFECEC", padding: "10px 14px", borderRadius: 10, fontSize: 14, marginTop: 12 }}>
            Error: {error}
          </p>
        )}

        <div className="card" style={{ marginTop: 26, minHeight: 420, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.length === 0 && (
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>Try asking:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="btn btn-outline"
                      style={{ fontSize: 13, padding: "8px 16px" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--signal)" : "var(--bg)",
                  color: m.role === "user" ? "white" : "var(--text-dark)",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  maxWidth: "80%",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>Thinking...</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your papers, prerequisites, or learning path..."
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 14,
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
            <button className="btn btn-primary" type="submit" disabled={sending}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;