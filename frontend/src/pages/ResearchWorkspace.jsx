import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import "../styles/ResearchWorkspace.css";
import researchBackground from "../assets/workspace-background.png";
import LearningPath from "../components/LearningPath";

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

export default function ResearchWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [research, setResearch] = useState(null);
  const [papers, setPapers] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);

  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResearch();
  }, [id]);

async function loadResearch() {
  setLoading(true);
  setError("");

  try {

          const [
        researchResponse,
        papersResponse,
        conceptsResponse,
        prerequisitesResponse,
        citationsResponse,
      ] = await Promise.all([
        api.getResearch(id),
        api.listPapers(id),
        api.listConcepts(id),
        api.listPrerequisites(id),
        api.listCitations(id),
      ]);

      setResearch(researchResponse);

      setPapers(
        Array.isArray(papersResponse)
          ? papersResponse
          : papersResponse?.results || []
      );

      setConcepts(
        Array.isArray(conceptsResponse)
          ? conceptsResponse
          : conceptsResponse?.results || []
      );

      setPrerequisites(
        Array.isArray(prerequisitesResponse)
          ? prerequisitesResponse
          : prerequisitesResponse?.results || []
      );

      setCitations(
        Array.isArray(citationsResponse)
          ? citationsResponse
          : citationsResponse?.results || []
      );

  } catch (err) {
    console.error("Research workspace error:", err);
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
            typeof concept === "object"
              ? concept.id || concept.name
              : concept
          );
        });
      }
    });

    return unique.size;
  }, [concepts, papers]);

function getPaperTitle(value) {
  const paperId =
    value && typeof value === "object"
      ? value.id
      : value;

  const paper = papers.find(
    (item) => String(item.id) === String(paperId)
  );

  if (!paper) {
    return `Paper ${paperId ?? "Unknown"}`;
  }

  if (paper.title?.trim()) {
    return paper.title.trim();
  }

  if (paper.name?.trim()) {
    return paper.name.trim();
  }

  if (paper.file) {
    const filename = paper.file
      .split("/")
      .pop()
      .split("?")[0];

    return decodeURIComponent(filename)
      .replace(/\.pdf$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return `Paper ${paper.id}`;
}

  function getPrerequisiteTarget(item) {
    return item.paper || item.paper_id || item.target;
  }

  function getCitationSource(item) {
    return (
      item.citing_paper ||
      item.citing_paper_id ||
      item.source
    );
  }

  function getCitationTarget(item) {
    return (
      item.cited_paper ||
      item.cited_paper_id ||
      item.target
    );
  }

  const learningPath = papers;

  function handleTabClick(tabId) {
    setActiveTab((current) =>
      current === tabId ? null : tabId
    );
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
    const printableWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

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
                      ${escapeHtml(
                        paper.title || `Paper ${paper.id}`
                      )}
                    </strong>

                    <br />

                    Authors:
                    ${escapeHtml(
                      paper.authors ||
                        "Authors not available"
                    )}

                    <br />

                    Year:
                    ${escapeHtml(
                      getPaperYear(paper)
                    )}
                  </div>
                `
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
                  <th>Paper</th>
                  <th>References</th>
                  <p>
  These papers reference each other based on the
  relationships detected during analysis.
</p>
                </tr>
              </thead>

              <tbody>
                ${citations
                  .map((citation, index) => {
                    const source =
                      getCitationSource(citation);

                    const target =
                      getCitationTarget(citation);

                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>
                          ${escapeHtml(
                            getPaperTitle(source)
                          )}
                        </td>
                        <td>
                          ${escapeHtml(
                            getPaperTitle(target)
                          )}
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
              .map(
                (paper, index) => `
                  <div class="item">
                    <strong>
                      ${index + 1}.
                      ${escapeHtml(
                        paper.title ||
                          `Paper ${paper.id}`
                      )}
                    </strong>

                    <p>
                      <strong>Authors:</strong>
                      ${escapeHtml(
                        paper.authors ||
                          "Authors not available"
                      )}
                    </p>

                    <p>
                      <strong>Year:</strong>
                      ${escapeHtml(
                        getPaperYear(paper)
                      )}
                    </p>

                    <p>
                      <strong>Analysis:</strong>
                      ${escapeHtml(
                        paper.ai_summary ||
                          paper.abstract ||
                          "No paper analysis is available yet."
                      )}
                    </p>
                  </div>
                `
              )
              .join("")
          : "<p>No papers are available for analysis.</p>"
      }
    `;

    printAsPdf("Paper Analysis", content);
  }

const getPaperById = (paperOrId) => {
  if (!paperOrId) return null;

  const id =
    typeof paperOrId === "object"
      ? paperOrId.id
      : paperOrId;

  return papers.find(
    (paper) => String(paper.id) === String(id)
  );
};


const getPaperAuthors = (paperOrId) => {
  const paper = getPaperById(paperOrId);

  return paper?.authors || "Authors not available";
};

const getPaperYear = (paperOrId) => {
  const paper = getPaperById(paperOrId);

  return (
    paper?.year ||
    paper?.publication_year ||
    "—"
  );
};
function renderCitations() {
  return (
    <section className="result-card">
      <div className="result-header">
        <div>
          <span className="result-eyebrow">
            RESEARCH REFERENCES
          </span>

          <h2>Citations</h2>

          <p>
            Paper-to-paper citation relationships discovered
            in your research.
          </p>
        </div>

        <button
          className="download-button"
          onClick={downloadCitations}
        >
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
    const sourceId =
      typeof citation.citing_paper === "object"
        ? citation.citing_paper.id
        : citation.citing_paper;

    const targetId =
      typeof citation.cited_paper === "object"
        ? citation.cited_paper.id
        : citation.cited_paper;

    const sourcePaper = getPaperById(sourceId);
    const targetPaper = getPaperById(targetId);

    return (
      <tr key={citation.id || index}>
        <td>{index + 1}</td>

        <td>
          <strong>
            {getPaperTitle(sourceId)}
          </strong>

          <div className="citation-meta">
            {getPaperAuthors(sourceId)}
          </div>
        </td>

        <td>
          <strong>
            {getPaperTitle(targetId)}
          </strong>

          <div className="citation-meta">
            {getPaperAuthors(targetId)}
          </div>
        </td>

        <td>
          {getPaperYear(sourceId)}
        </td>
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
            <span className="result-eyebrow">
              PAPER-BY-PAPER INFORMATION
            </span>

            <h2>Paper Analysis</h2>

            <p>
              Detailed information and AI-generated
              summaries for your research papers.
            </p>
          </div>

          <button
            className="download-button"
            onClick={downloadAnalysis}
          >
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
              <article
                className="analysis-paper"
                key={paper.id || index}
              >
                <div className="analysis-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="analysis-content">
                  <div className="analysis-title-row">
                    <h3>
                      {paper.title ||
                        `Paper ${paper.id}`}
                    </h3>

                    <span>
                      {getPaperYear(paper)}
                    </span>
                  </div>

                  <p className="paper-authors">
                    {paper.authors ||
                      "Authors not available"}
                  </p>

                  <div className="analysis-description">
                    {paper.ai_summary ||
                      paper.abstract ||
                      "No paper analysis is available yet."}
                  </div>
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

      <div className="workspace-content">
        {/* TOP NAVIGATION */}
        <header className="workspace-topbar glass-card">
          <div className="brand">
            <span className="brand-mark">▰</span>

            <span className="brand-name">
              IntelliResearch
            </span>
          </div>

          <div className="topbar-topic">
            {research?.topic || "Research Workspace"}
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            ↪ Logout
          </button>
        </header>

        {/* HERO */}
        <section className="workspace-hero glass-card">
          <div className="hero-copy">
            <span className="hero-label">
              YOUR RESEARCH WORKSPACE
            </span>

            <h1>Welcome back!</h1>

            <p>
              Explore your research journey for{" "}
              <strong>
                {research?.topic || "your research"}
              </strong>
            </p>

            <div className="hero-meta">
              <span>
                {papers.length} Papers
              </span>

              <span className="meta-divider">
                •
              </span>

              <span>
                {conceptCount} Concepts
              </span>

              <span className="meta-divider">
                •
              </span>

              <span>
                {research?.status === "ready"
                  ? "Analysis Ready"
                  : "Analysis in Progress"}
              </span>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="workspace-error glass-card">
            {error}
          </div>
        )}

        {/* MAIN NAVIGATION */}
        <section className="research-sections">
          <div className="section-heading">
            <span>EXPLORE YOUR RESEARCH</span>

            <h2>Research Insights</h2>

            <p>
              Choose a section below to explore the
              results generated from your papers.
            </p>
          </div>

          <div className="floating-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`floating-tab glass-card ${
                  activeTab === tab.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleTabClick(tab.id)
                }
              >
                <span className="tab-icon">
                  {tab.icon}
                </span>

                <span className="tab-text">
                  <strong>{tab.title}</strong>

                  <small>
                    {tab.description}
                  </small>
                </span>

                <span className="tab-arrow">
                  {activeTab === tab.id
                    ? "↑"
                    : "→"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* RESULTS */}
        <section className="results-area">
          {!activeTab && (
            <div className="results-placeholder glass-card">
              <div className="placeholder-icon">
                ✦
              </div>

              <h2>
                Choose a research section
              </h2>

              <p>
                Select Learning Path, Citations,
                or Paper Analysis above to view
                its results.
              </p>
            </div>
          )}

          {activeTab === "learning" && (
  <LearningPath
    papers={papers}
    prerequisites={prerequisites}
    research={research}
  />
)}

          {activeTab === "citations" &&
            renderCitations()}

          {activeTab === "analysis" &&
            renderAnalysis()}
        </section>

        {/* FOOTER */}
        <footer className="workspace-footer glass-card">
          <div className="footer-brand">
            <div className="footer-logo">
              ▰
            </div>

            <div>
              <strong>
                IntelliResearch
              </strong>

              <span>
                Your intelligent research workspace
              </span>
            </div>
          </div>

          <div className="footer-actions">
            <button
              className="footer-ai-button"
              onClick={() =>
                navigate(
                  `/research/${id}/assistant`
                )
              }
            >
              <span className="footer-button-icon">
                ◉
              </span>

              <span>
                <strong>
                  AI Research Assistant
                </strong>

                <small>
                  Ask questions about your research
                </small>
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
            Research is to see what everybody else has
            seen, and to think what nobody else has
            thought.
          </div>
        </footer>
      </div>
    </main>
  );
}
