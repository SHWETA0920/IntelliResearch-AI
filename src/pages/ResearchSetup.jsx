import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";

const KNOWN_CONCEPTS = [
  "Programming Basics",
  "Arrays",
  "Recursion",
  "Dynamic Programming",
  "Graph Algorithms",
];

const GOALS = [
  "Understand the topic",
  "Read research papers",
  "Prepare for research",
  "Explore advanced work",
];

function ResearchSetup() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState([]);
  const [knownConcepts, setKnownConcepts] = useState([]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function toggleConcept(concept) {
    setKnownConcepts((prev) =>
      prev.includes(concept) ? prev.filter((c) => c !== concept) : [...prev, concept]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (files.length < 2) {
      setError("Please upload at least 2 PDFs.");
      return;
    }

    setSubmitting(true);
    try {
      const research = await api.createResearch({ topic, status: "pending" });

      for (const file of files) {
        const formData = new FormData();
        formData.append("research", research.id);
        formData.append("file", file);
        await fetch("http://127.0.0.1:8000/api/papers/", {
          method: "POST",
          body: formData,
        });
      }

      await api.analyzeResearch(research.id);

      navigate(`/research/${research.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 40, maxWidth: 760 }}>
        <span className="eyebrow">Step 1 of 1</span>
        <h1 className="fluid-h1" style={{ marginTop: 14 }}>What do you want to learn?</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
          Give a topic and a few papers — we'll take it from there.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Topic + upload */}
          <div className="card">
            <label style={labelStyle}>Research Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 20 }}>Upload Papers</label>
            <div
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 14,
                padding: "28px 20px",
                textAlign: "center",
                background: "var(--primary-light)",
              }}
            >
              <div style={{ fontSize: 28 }}>📄</div>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0 14px" }}>
                Drop PDFs here, or browse — at least 2 required
              </p>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
            </div>

            {files.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {files.map((f, i) => (
                  <span key={i} className="badge badge-teal">
                    ✓ {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Existing knowledge */}
          <div className="card">
            <label style={labelStyle}>What do you already know? (optional)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {KNOWN_CONCEPTS.map((concept) => {
                const active = knownConcepts.includes(concept);
                return (
                  <button
                    type="button"
                    key={concept}
                    onClick={() => toggleConcept(concept)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: active ? "1.5px solid var(--signal)" : "1.5px solid var(--border)",
                      background: active ? "var(--primary-light)" : "white",
                      color: active ? "var(--signal)" : "var(--text-muted)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {active ? "✓ " : ""}
                    {concept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal */}
          <div className="card">
            <label style={labelStyle}>What is your goal?</label>
            <div className="grid-2" style={{ gap: 10, marginTop: 12 }}>
              {GOALS.map((g) => {
                const active = goal === g;
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGoal(g)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      textAlign: "left",
                      border: active ? "1.5px solid var(--signal)" : "1.5px solid var(--border)",
                      background: active ? "var(--primary-light)" : "white",
                      color: active ? "var(--signal)" : "var(--text-dark)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {active ? "● " : "○ "}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p style={{ color: "#E14B4B", background: "#FFECEC", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ alignSelf: "center", padding: "14px 40px", fontSize: 16 }}>
            {submitting ? "Analyzing..." : "Analyze Papers →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontWeight: 700,
  fontSize: 14,
  color: "var(--text-dark)",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 15,
  outline: "none",
};

export default ResearchSetup;