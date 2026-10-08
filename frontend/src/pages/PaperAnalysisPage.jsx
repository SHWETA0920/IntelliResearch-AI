import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import "../styles/ResearchWorkspace.css"; // reuses the same glass-card / result-card classes

const DEEP_ANALYSIS_FIELDS = [
  { key: "problem", label: "Problem" },
  { key: "method", label: "Method" },
  { key: "datasets", label: "Datasets" },
  { key: "key_findings", label: "Key Findings" },
  { key: "limitations", label: "Limitations" },
  { key: "novelty", label: "Novelty" },
  { key: "future_work", label: "Future Work" },
];

function DeepAnalysisSection({ deep }) {
  const [expanded, setExpanded] = useState(false);

  // deep_analysis can fail gracefully into {"error": "..."} or fall back
  // to {"raw_response": "..."} if the model's JSON didn't parse — in
  // either case there's nothing structured to render.
  const hasStructuredFields = DEEP_ANALYSIS_FIELDS.some((f) => deep?.[f.key]);

  if (!deep || (!hasStructuredFields && !deep.raw_response)) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--signal, var(--primary))",
          cursor: "pointer",
        }}
      >
        {expanded ? "▲ Hide deep analysis" : "▼ Show deep analysis"}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 14,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          {deep.error && (
            <p style={{ fontSize: 13, color: "#FF6B6B" }}>⚠ {deep.error}</p>
          )}

          {hasStructuredFields ? (
            DEEP_ANALYSIS_FIELDS.map((f) =>
              deep[f.key] ? (
                <div key={f.key}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      color: "var(--text-h, #fff)",
                      marginBottom: 4,
                    }}
                  >
                    {f.label}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--text-muted, #9ca3af)" }}>
                    {deep[f.key]}
                  </p>
                </div>
              ) : null
            )
          ) : deep.raw_response ? (
            <p style={{ fontSize: 13, color: "var(--text-muted, #9ca3af)" }}>
              {deep.raw_response}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function PaperAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [research, setResearch] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [researchData, papersData] = await Promise.all([
        api.getResearch(id),
        api.listPapers(id),
      ]);

      setResearch(researchData);
      setPapers(
        Array.isArray(papersData)
          ? papersData
          : papersData?.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load paper analysis.");
    } finally {
      setLoading(false);
    }
  }

  function getPaperYear(paper) {
    return paper?.year || paper?.publication_year || "—";
  }

  const analyzedCount = useMemo(() => {
    return papers.filter((paper) => {
      const keyPoints = paper.raw_ai_data?.key_points;
      return Array.isArray(keyPoints) && keyPoints.length > 0;
    }).length;
  }, [papers]);

  // --- PDF export (same approach as ResearchWorkspace's downloadAnalysis) ---

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function downloadAnalysisPdf() {
    const printableWindow = window.open("", "_blank", "width=900,height=700");
    if (!printableWindow) {
      alert("Please allow pop-ups to download the PDF.");
      return;
    }

    const body = papers.length
      ? papers
          .map((paper, index) => {
            const keyPoints = paper.raw_ai_data?.key_points;
            const hasKeyPoints = Array.isArray(keyPoints) && keyPoints.length > 0;

            const analysisBlock = hasKeyPoints
              ? `<ul>${keyPoints
                  .map((point) => `<li>${escapeHtml(point)}</li>`)
                  .join("")}</ul>`
              : `<p>${escapeHtml(
                  paper.ai_summary ||
                    paper.abstract ||
                    "No paper analysis is available yet."
                )}</p>`;

            // include deep analysis in the exported PDF too, if present
            const deep = paper.raw_ai_data?.deep_analysis;
            const deepHasFields = deep && DEEP_ANALYSIS_FIELDS.some((f) => deep[f.key]);
            const deepBlock = deepHasFields
              ? `<div style="margin-top:10px;">
                  <strong>Deep Analysis:</strong>
                  ${DEEP_ANALYSIS_FIELDS.map((f) =>
                    deep[f.key]
                      ? `<p style="margin:6px 0;"><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(deep[f.key])}</p>`
                      : ""
                  ).join("")}
                </div>`
              : "";

            return `
              <div class="item">
                <strong>${index + 1}. ${escapeHtml(
              paper.title || `Paper ${paper.id}`
            )}</strong>
                <p><strong>Authors:</strong> ${escapeHtml(
                  paper.authors || "Authors not available"
                )}</p>
                <p><strong>Year:</strong> ${escapeHtml(getPaperYear(paper))}</p>
                <p><strong>Key Points:</strong></p>
                ${analysisBlock}
                ${deepBlock}
              </div>
            `;
          })
          .join("")
      : "<p>No papers are available for analysis.</p>";

    printableWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paper Analysis</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #0e1526; line-height: 1.6; }
            h1 { color: #e8963d; margin-bottom: 8px; }
            .meta { color: #687083; margin-bottom: 30px; }
            .item { padding: 14px 0; border-bottom: 1px solid #ddd; page-break-inside: avoid; }
            .item:last-child { border-bottom: none; }
            .item ul { margin: 8px 0 0; padding-left: 20px; }
            .item ul li { margin-bottom: 4px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>Paper Analysis</h1>
          <div class="meta">Research: ${escapeHtml(research?.topic || "Research")}</div>
          ${body}
        </body>
      </html>
    `);
    printableWindow.document.close();
    setTimeout(() => {
      printableWindow.focus();
      printableWindow.print();
    }, 300);
  }

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="loading-glass-card">
          <div className="loading-spinner" />
          <p>Loading paper analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="research-workspace">
      <div className="workspace-overlay" />
      <div className="bg-glow bg-glow-orange" />
      <div className="bg-glow bg-glow-blue" />

      <div className="workspace-shell">
        <div className="workspace-content" style={{ width: "100%" }}>
          {/* TOP BAR */}
          <header className="workspace-topbar glass-card">
            <button
              className="logout-button"
              onClick={() => navigate(`/research/${id}`)}
            >
              ← Back to Workspace
            </button>

            <div className="topbar-topic">
              {research?.topic || "Research Workspace"}
            </div>

            <button className="download-button" onClick={downloadAnalysisPdf}>
              ↓ PDF
            </button>
          </header>

          {/* HERO */}
          <section className="workspace-hero glass-card">
            <div className="hero-copy">
              <span className="hero-label">PAPER-BY-PAPER INFORMATION</span>
              <h1>Paper Analysis</h1>
              <p>
                AI-extracted key points for every paper in{" "}
                <strong>{research?.topic || "this research"}</strong> —{" "}
                {analyzedCount} of {papers.length} analyzed.
              </p>
            </div>
          </section>

          {/* ERROR */}
          {error && <div className="workspace-error glass-card">{error}</div>}

          {/* RESULTS */}
          <section className="result-card">
            {papers.length === 0 ? (
              <div className="empty-result">
                No papers are available for analysis.
              </div>
            ) : (
              <div className="analysis-list">
                {papers.map((paper, index) => (
                  <article className="analysis-paper" key={paper.id || index}>
                    <div className="analysis-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="analysis-content">
                      <div className="analysis-title-row">
                        <h3>{paper.title || `Paper ${paper.id}`}</h3>
                        <span>{getPaperYear(paper)}</span>
                      </div>

                      <p className="paper-authors">
                        {paper.authors || "Authors not available"}
                      </p>

                      <div className="analysis-description">
                        {(() => {
                          const keyPoints = paper.raw_ai_data?.key_points;
                          const analysisError = paper.raw_ai_data?.error;

                          if (Array.isArray(keyPoints) && keyPoints.length > 0) {
                            return (
                              <ul className="key-points-list">
                                {keyPoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            );
                          }

                          if (analysisError) {
                            return (
                              <span className="analysis-error-text">
                                ⚠ {analysisError}
                              </span>
                            );
                          }

                          if (research?.status === "analyzing") {
                            return (
                              <span className="analysis-pending">
                                Extracting key points...
                              </span>
                            );
                          }

                          return (
                            paper.ai_summary ||
                            paper.abstract ||
                            "No paper analysis is available yet."
                          );
                        })()}
                      </div>

                      <DeepAnalysisSection deep={paper.raw_ai_data?.deep_analysis} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}