import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import "../styles/ResearchWorkspace.css";
import researchBackground from "../assets/workspace-background.png";

const TABS = [
  {
    id: "learning",
    icon: "↗",
    title: "Learning Path",
    description: "Recommended reading order",
  },
  {
    id: "citations",
    icon: "❝",
    title: "Citations",
    description: "Paper reference relationships",
  },
  {
    id: "analysis",
    icon: "▤",
    title: "Paper Analysis",
    description: "Paper-by-paper information",
  },
];

// Same 7-field structure as deep_paper_analysis.py's extract_deep_analysis().
const DEEP_ANALYSIS_FIELDS = [
  { key: "problem", label: "Problem" },
  { key: "method", label: "Method" },
  { key: "datasets", label: "Datasets" },
  { key: "key_findings", label: "Key Findings" },
  { key: "limitations", label: "Limitations" },
  { key: "novelty", label: "Novelty" },
  { key: "future_work", label: "Future Work" },
];

// Ported from PaperAnalysisPage.jsx — that page used a separate route
// (/research/:id/analysis) which is no longer navigated to now that the
// "Paper Analysis" tab renders inline here instead. Keeping both files'
// deep-analysis rendering in sync until one of them is retired.
function DeepAnalysisSection({ deep }) {
  const [expanded, setExpanded] = useState(false);

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
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "var(--text-muted, #9ca3af)",
                    }}
                  >
                    {deep[f.key]}
                  </p>
                </div>
              ) : null,
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

export default function ResearchWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [research, setResearch] = useState(null);
  const [papers, setPapers] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);

  const [activeTab, setActiveTab] = useState("learning");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadResearch();
  }, [id]);

  async function loadResearch() {
    setLoading(true);
    setError("");

    try {
      const [
        researchData,
        papersData,
        conceptsData,
        prerequisitesData,
        citationsData,
      ] = await Promise.all([
        api.getResearch(id),
        api.listPapers(id),
        api.listConcepts(id),
        api.listPrerequisites(id),
        api.listCitations(id),
      ]);

      setResearch(researchData);

      setPapers(
        Array.isArray(papersData) ? papersData : papersData?.results || [],
      );

      setConcepts(
        Array.isArray(conceptsData)
          ? conceptsData
          : conceptsData?.results || [],
      );

      setPrerequisites(
        Array.isArray(prerequisitesData)
          ? prerequisitesData
          : prerequisitesData?.results || [],
      );

      setCitations(
        Array.isArray(citationsData)
          ? citationsData
          : citationsData?.results || [],
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load this research workspace.");
    } finally {
      setLoading(false);
    }
  }

  const conceptCount = useMemo(() => {
    if (concepts.length) {
      return concepts.length;
    }

    const unique = new Set();

    papers.forEach((paper) => {
      if (Array.isArray(paper.concepts)) {
        paper.concepts.forEach((concept) => {
          unique.add(
            typeof concept === "object" ? concept.id || concept.name : concept,
          );
        });
      }
    });

    return unique.size;
  }, [concepts, papers]);

  const readingProgress = useMemo(() => {
    if (!papers.length) return 0;

    const analyzed = papers.filter((paper) => {
      const keyPoints = paper.raw_ai_data?.key_points;
      return (
        (Array.isArray(keyPoints) && keyPoints.length > 0) ||
        paper.ai_summary ||
        paper.abstract
      );
    }).length;

    return Math.round((analyzed / papers.length) * 100);
  }, [papers]);

  function getPaperTitle(paperId) {
    const paper = papers.find((item) => String(item.id) === String(paperId));

    return paper?.title || paper?.name || `Paper ${paperId}`;
  }

  function getPaperYear(paper) {
    return paper?.year || paper?.publication_year || "—";
  }

  function getPrerequisiteSource(item) {
    return (
      item.prerequisite_paper ||
      item.prerequisite_paper_id ||
      item.prerequisite ||
      item.source
    );
  }

  function getPrerequisiteTarget(item) {
    return item.paper || item.paper_id || item.target;
  }

  function getCitationSource(item) {
    return item.citing_paper || item.citing_paper_id || item.source;
  }

  function getCitationTarget(item) {
    return item.cited_paper || item.cited_paper_id || item.target;
  }

  function buildLearningPath() {
    if (!papers.length) return [];

    const prerequisiteMap = new Map();

    prerequisites.forEach((item) => {
      const target = getPrerequisiteTarget(item);
      const source = getPrerequisiteSource(item);

      if (target == null || source == null) return;

      const targetId = typeof target === "object" ? target.id : target;

      const sourceId = typeof source === "object" ? source.id : source;

      if (!prerequisiteMap.has(String(targetId))) {
        prerequisiteMap.set(String(targetId), []);
      }

      prerequisiteMap.get(String(targetId)).push(String(sourceId));
    });

    const visited = new Set();
    const result = [];

    function visit(paper) {
      const paperId = String(paper.id);

      if (visited.has(paperId)) return;

      const dependencies = prerequisiteMap.get(paperId) || [];

      dependencies.forEach((dependencyId) => {
        const dependencyPaper = papers.find(
          (paperItem) => String(paperItem.id) === dependencyId,
        );

        if (dependencyPaper) {
          visit(dependencyPaper);
        }
      });

      visited.add(paperId);
      result.push(paper);
    }

    papers.forEach(visit);

    return result;
  }

  const learningPath = buildLearningPath();

  function handleTabClick(tabId) {
    setActiveTab((current) => (current === tabId ? null : tabId));
    setSidebarOpen(false);
  }

  function goTo(path) {
    setSidebarOpen(false);
    navigate(path);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function printAsPdf(title, content) {
    const printableWindow = window.open("", "_blank", "width=900,height=700");

    if (!printableWindow) {
      alert("Please allow pop-ups to download the PDF.");
      return;
    }

    printableWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #0e1526;
              line-height: 1.6;
            }

            h1 {
              color: #e8963d;
              margin-bottom: 8px;
            }

            h2 {
              margin-top: 30px;
            }

            .meta {
              color: #687083;
              margin-bottom: 30px;
            }

            .item {
              padding: 14px 0;
              border-bottom: 1px solid #ddd;
              page-break-inside: avoid;
            }

            .item:last-child {
              border-bottom: none;
            }

            .item ul {
              margin: 8px 0 0;
              padding-left: 20px;
            }

            .item ul li {
              margin-bottom: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f4eee6;
            }

            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>
          ${content}
        </body>
      </html>
    `);

    printableWindow.document.close();

    setTimeout(() => {
      printableWindow.focus();
      printableWindow.print();
    }, 300);
  }

  function downloadLearningPath() {
    const content = `
      <h1>Learning Path</h1>

      <div class="meta">
        Research:
        ${escapeHtml(research?.topic || "Research")}
      </div>

      ${
        learningPath.length
          ? learningPath
              .map(
                (paper, index) => `
                  <div class="item">
                    <strong>
                      ${index + 1}. 
                      ${escapeHtml(paper.title || `Paper ${paper.id}`)}
                    </strong>

                    ${
                      paper.authors
                        ? `<br />Authors: ${escapeHtml(paper.authors)}`
                        : ""
                    }

                    <br />

                    Year:
                    ${escapeHtml(getPaperYear(paper))}
                  </div>
                `,
              )
              .join("")
          : "<p>No learning path information is available.</p>"
      }
    `;

    printAsPdf("Learning Path", content);
  }

  function downloadCitations() {
    const content = `
      <h1>Citations</h1>

      <div class="meta">
        Research:
        ${escapeHtml(research?.topic || "Research")}
      </div>

      ${
        citations.length
          ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Citing Paper</th>
                  <th>Cited Paper</th>
                </tr>
              </thead>

              <tbody>
                ${citations
                  .map((citation, index) => {
                    const source = getCitationSource(citation);

                    const target = getCitationTarget(citation);

                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>
                          ${escapeHtml(getPaperTitle(source))}
                        </td>
                        <td>
                          ${escapeHtml(getPaperTitle(target))}
                        </td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          `
          : "<p>No citation relationships were found.</p>"
      }
    `;

    printAsPdf("Citations", content);
  }

  function downloadAnalysis() {
    const content = `
      <h1>Paper Analysis</h1>

      <div class="meta">
        Research:
        ${escapeHtml(research?.topic || "Research")}
      </div>

      ${
        papers.length
          ? papers
              .map((paper, index) => {
                const keyPoints = paper.raw_ai_data?.key_points;
                const hasKeyPoints =
                  Array.isArray(keyPoints) && keyPoints.length > 0;

                const analysisBlock = hasKeyPoints
                  ? `<ul>${keyPoints
                      .map((point) => `<li>${escapeHtml(point)}</li>`)
                      .join("")}</ul>`
                  : escapeHtml(
                      paper.ai_summary ||
                        paper.abstract ||
                        "No paper analysis is available yet.",
                    );

                const deep = paper.raw_ai_data?.deep_analysis;
                const deepHasFields =
                  deep && DEEP_ANALYSIS_FIELDS.some((f) => deep[f.key]);
                const deepBlock = deepHasFields
                  ? `<div style="margin-top:10px;">
                      <strong>Deep Analysis:</strong>
                      ${DEEP_ANALYSIS_FIELDS.map((f) =>
                        deep[f.key]
                          ? `<p style="margin:6px 0;"><strong>${escapeHtml(f.label)}:</strong> ${escapeHtml(deep[f.key])}</p>`
                          : "",
                      ).join("")}
                    </div>`
                  : "";

                return `
                  <div class="item">
                    <strong>
                      ${index + 1}.
                      ${escapeHtml(paper.title || `Paper ${paper.id}`)}
                    </strong>

                    ${
                      paper.authors
                        ? `<p><strong>Authors:</strong> ${escapeHtml(paper.authors)}</p>`
                        : ""
                    }

                    <p>
                      <strong>Year:</strong>
                      ${escapeHtml(getPaperYear(paper))}
                    </p>

                    <p>
                      <strong>Analysis:</strong>
                    </p>
                    ${analysisBlock}
                    ${deepBlock}
                  </div>
                `;
              })
              .join("")
          : "<p>No papers are available for analysis.</p>"
      }
    `;

    printAsPdf("Paper Analysis", content);
  }

  function renderLearningPath() {
    return (
      <section className="result-card">
        <div className="result-header">
          <div>
            <span className="result-eyebrow">RECOMMENDED READING</span>

            <h2>Learning Path</h2>

            <p>
              AI-recommended order to read your papers based on prerequisite
              relationships.
            </p>
          </div>

          <button className="download-button" onClick={downloadLearningPath}>
            ↓ PDF
          </button>
        </div>

        {learningPath.length === 0 ? (
          <div className="empty-result">
            No learning path information is available yet.
          </div>
        ) : (
          <div className="learning-path-list">
            {learningPath.map((paper, index) => (
              <div
                className={`learning-paper ${index === 0 ? "recommended" : ""}`}
                key={paper.id}
              >
                <div className="step-number">{index + 1}</div>

                <div className="learning-paper-content">
                  <h3>{paper.title || `Paper ${paper.id}`}</h3>

                  {paper.authors && <p>{paper.authors}</p>}

                  <span>{getPaperYear(paper)}</span>
                </div>

                <div className="learning-badge">
                  {index === 0
                    ? "Start Here"
                    : index === 1
                      ? "Prerequisite"
                      : "Recommended Next"}
                </div>
              </div>
            ))}
          </div>
        )}

        {prerequisites.length > 0 && (
          <div className="dependency-section">
            <h3>Paper Dependency Graph</h3>

            <div className="dependency-list">
              {prerequisites.map((item, index) => {
                const source = getPrerequisiteSource(item);

                const target = getPrerequisiteTarget(item);

                return (
                  <div className="dependency-item" key={item.id || index}>
                    <span>{getPaperTitle(source)}</span>

                    <b>→</b>

                    <span>{getPaperTitle(target)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderCitations() {
    return (
      <section className="result-card">
        <div className="result-header">
          <div>
            <span className="result-eyebrow">RESEARCH REFERENCES</span>

            <h2>Citations</h2>

            <p>
              Paper-to-paper citation relationships discovered in your research.
            </p>
          </div>

          <button className="download-button" onClick={downloadCitations}>
            ↓ PDF
          </button>
        </div>

        {citations.length === 0 ? (
          <div className="empty-result">
            No citation relationships were found.
          </div>
        ) : (
          <div className="citation-table-wrapper">
            <table className="citation-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Citing Paper</th>
                  <th>Cited Paper</th>
                  <th>Year</th>
                </tr>
              </thead>

              <tbody>
                {citations.map((citation, index) => {
                  const source = getCitationSource(citation);

                  const target = getCitationTarget(citation);

                  const sourceId =
                    typeof source === "object" ? source.id : source;

                  const sourcePaper = papers.find(
                    (paper) => String(paper.id) === String(sourceId),
                  );

                  return (
                    <tr key={citation.id || index}>
                      <td>{index + 1}</td>

                      <td>{getPaperTitle(source)}</td>

                      <td>{getPaperTitle(target)}</td>

                      <td>{getPaperYear(sourcePaper)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  function renderAnalysis() {
    return (
      <section className="result-card">
        <div className="result-header">
          <div>
            <span className="result-eyebrow">PAPER-BY-PAPER INFORMATION</span>

            <h2>Paper Analysis</h2>

            <p>
              Detailed information and AI-generated summaries for your research
              papers.
            </p>
          </div>

          <button className="download-button" onClick={downloadAnalysis}>
            ↓ PDF
          </button>
        </div>

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

                  {paper.authors && (
                    <p className="paper-authors">{paper.authors}</p>
                  )}

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

                  <DeepAnalysisSection
                    deep={paper.raw_ai_data?.deep_analysis}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  async function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    } finally {
      navigate("/login");
    }
  }

  if (loading) {
    return (
      <div
        className="workspace-loading"
        style={{
          backgroundImage: `url(${researchBackground})`,
        }}
      >
        <div className="loading-glass-card">
          <div className="loading-spinner" />
          <p>Loading research workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="research-workspace"
      style={{
        backgroundImage: `url(${researchBackground})`,
      }}
    >
      <div className="workspace-overlay" />

      <div className="bg-glow bg-glow-orange" />
      <div className="bg-glow bg-glow-blue" />

      <div className={`workspace-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />

        <aside className="workspace-sidebar glass-card">
          <div className="sidebar-brand">
            <span className="brand-mark">▰</span>
            <span className="brand-name">IntelliResearch</span>
          </div>

          <nav className="sidebar-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-link ${
                  activeTab === tab.id ? "active" : ""
                }`}
                onClick={() => handleTabClick(tab.id)}
              >
                <span className="sidebar-icon">{tab.icon}</span>
                {tab.title}
              </button>
            ))}

            <button
              className="sidebar-link"
              onClick={() => goTo(`/research/${id}/assistant`)}
            >
              <span className="sidebar-icon">◉</span>
              AI Assistant
            </button>

            <div className="sidebar-divider" />

            <button className="sidebar-link" onClick={() => goTo("/settings")}>
              <span className="sidebar-icon">⚙</span>
              Settings
            </button>

            <button className="sidebar-link" onClick={() => goTo("/profile")}>
              <span className="sidebar-icon">☺</span>
              Profile
            </button>
          </nav>
        </aside>

        <div className="workspace-content">
          <header className="workspace-topbar glass-card">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <div className="topbar-topic">
              {research?.topic || "Research Workspace"}
            </div>

            <button className="logout-button" onClick={logout}>
              ↪ Logout
            </button>
          </header>

          <section className="workspace-hero glass-card">
            <div className="hero-copy">
              <span className="hero-label">YOUR RESEARCH WORKSPACE</span>

              <h1>Welcome back!</h1>

              <p>
                Explore your research journey for{" "}
                <strong>{research?.topic || "your research"}</strong>
              </p>
            </div>
          </section>

          {error && <div className="workspace-error glass-card">{error}</div>}

          <section className="stats-row">
            <div className="stat-card glass-card">
              <div className="stat-icon">▥</div>
              <div className="stat-text">
                <span className="stat-label">TOTAL PAPERS</span>
                <strong className="stat-value">{papers.length}</strong>
                <span className="stat-sub">Across all sessions</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon">▤</div>
              <div className="stat-text">
                <span className="stat-label">CONCEPTS IDENTIFIED</span>
                <strong className="stat-value">{conceptCount}</strong>
                <span className="stat-sub">From your papers</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon">↗</div>
              <div className="stat-text">
                <span className="stat-label">READING PROGRESS</span>
                <strong className="stat-value">{readingProgress}%</strong>
                <span className="stat-sub">Overall completion</span>
              </div>
            </div>
          </section>

          <section className="results-area">
            {!activeTab && (
              <div className="results-placeholder glass-card">
                <div className="placeholder-icon">✦</div>

                <h2>Choose a research section</h2>

                <p>
                  Select Learning Path, Citations, or Paper Analysis from the
                  sidebar to view its results.
                </p>
              </div>
            )}

            {activeTab === "learning" && renderLearningPath()}
            {activeTab === "citations" && renderCitations()}
            {activeTab === "analysis" && renderAnalysis()}
          </section>

          <footer className="workspace-footer glass-card">
            <div className="footer-brand">
              <div className="footer-logo">▰</div>

              <div>
                <strong>IntelliResearch</strong>
                <span>Your intelligent research workspace</span>
              </div>
            </div>

            <div className="footer-actions">
              <button
                className="footer-ai-button"
                onClick={() => navigate(`/research/${id}/assistant`)}
              >
                <span className="footer-button-icon">◉</span>

                <span>
                  <strong>AI Research Assistant</strong>
                  <small>Ask questions about your research</small>
                </span>

                <b>→</b>
              </button>

              <button
                className="footer-download-button"
                onClick={downloadLearningPath}
              >
                <span>↗</span>
                Learning Path PDF
              </button>

              <button
                className="footer-download-button"
                onClick={downloadCitations}
              >
                <span>↗</span>
                Citations PDF
              </button>

              <button
                className="footer-download-button"
                onClick={downloadAnalysis}
              >
                <span>↗</span>
                Analysis PDF
              </button>
            </div>

            <div className="footer-quote">
              Research is to see what everybody else has seen, and to think what
              nobody else has thought.
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
