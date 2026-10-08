import { useMemo } from "react";
import "../styles/LearningPath.css";

function LearningPath({
  papers = [],
  prerequisites = [],
  research = null,
}) {
  function getPaperId(value) {
    if (value == null) return null;

    return typeof value === "object"
      ? value.id
      : value;
  }


  function getPaperTitle(value) {
  if (value == null) return "Unknown paper";

  const paperId =
    typeof value === "object"
      ? value.id
      : value;

  const paper = papers.find(
    (item) =>
      String(item.id) === String(paperId)
  );

  if (!paper) {
    return `Paper ${paperId}`;
  }

  // Prefer database title
  if (paper.title?.trim()) {
    return paper.title.trim();
  }

  // Then name
  if (paper.name?.trim()) {
    return paper.name.trim();
  }

  // Then uploaded filename
  if (paper.file) {
    const filePath =
      typeof paper.file === "string"
        ? paper.file
        : paper.file.name;

    if (filePath) {
      const filename = filePath
        .split("/")
        .pop()
        .replace(/\.pdf$/i, "")
        .replace(/[_-]+/g, " ")
        .trim();

      if (filename) {
        return filename;
      }
    }
  }

  return `Paper ${paperId}`;
}

  function getPaper(paperId) {
    return papers.find(
      (item) => String(item.id) === String(paperId)
    );
  }

  function getPaperYear(paper) {
    return (
      paper?.year ||
      paper?.publication_year ||
      "—"
    );
  }

  function getAuthors(paper) {
    return (
      paper?.authors ||
      "Authors not available"
    );
  }

  function getPrerequisiteSource(item) {
    return (
      item.prerequisite_paper ??
      item.prerequisite_paper_id ??
      item.prerequisite ??
      item.source
    );
  }

  function getPrerequisiteTarget(item) {
    return (
      item.paper ??
      item.paper_id ??
      item.target
    );
  }

  const learningPath = useMemo(() => {
  if (!papers.length) return [];

  const prerequisiteMap = new Map();

  prerequisites.forEach((item) => {
    const source = getPaperId(getPrerequisiteSource(item));
    const target = getPaperId(getPrerequisiteTarget(item));

    if (source == null || target == null) return;

    const targetKey = String(target);

    if (!prerequisiteMap.has(targetKey)) {
      prerequisiteMap.set(targetKey, []);
    }

    prerequisiteMap.get(targetKey).push(String(source));
  });

  const visited = new Set();
  const visiting = new Set();
  const result = [];

  function visit(paper) {
    const paperId = String(paper.id);

    // Already completely processed
    if (visited.has(paperId)) {
      return;
    }

    // Circular dependency detected
    if (visiting.has(paperId)) {
      console.warn(
        `Circular prerequisite detected at paper: ${paperId}`
      );
      return;
    }

    visiting.add(paperId);

    const dependencies =
      prerequisiteMap.get(paperId) || [];

    for (const dependencyId of dependencies) {
      const dependencyPaper = papers.find(
        (item) =>
          String(item.id) === String(dependencyId)
      );

      if (!dependencyPaper) {
        continue;
      }

      // IMPORTANT:
      // Do not recurse into a paper already on
      // the current dependency chain.
      if (visiting.has(String(dependencyPaper.id))) {
        console.warn(
          `Skipping circular dependency: ${paperId} -> ${dependencyPaper.id}`
        );
        continue;
      }

      visit(dependencyPaper);
    }

    visiting.delete(paperId);
    visited.add(paperId);

    if (!result.some((item) => String(item.id) === paperId)) {
      result.push(paper);
    }
  }

  papers.forEach((paper) => {
    visit(paper);
  });

  return result;
}, [papers, prerequisites]);

  function downloadLearningPath() {
    const topic =
      research?.topic || "Research";

    const rows = learningPath
      .map((paper, index) => {
        return `
          <div class="item">
            <h2>
              ${index + 1}.
              ${escapeHtml(
  getPaperTitle(paper)
              )}
            </h2>

            <p>
              <strong>Authors:</strong>
              ${escapeHtml(
                getAuthors(paper)
              )}
            </p>

            <p>
              <strong>Year:</strong>
              ${escapeHtml(
                getPaperYear(paper)
              )}
            </p>
          </div>
        `;
      })
      .join("");

    const dependencies = prerequisites
      .map((item) => {
        const source = getPaperId(
          getPrerequisiteSource(item)
        );

        const target = getPaperId(
          getPrerequisiteTarget(item)
        );

        if (source == null || target == null) {
          return "";
        }

        return `
          <div class="dependency">
            ${escapeHtml(
              getPaperTitle(source)
            )}
            →
            ${escapeHtml(
              getPaperTitle(target)
            )}
          </div>
        `;
      })
      .join("");

    const printableWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printableWindow) {
      return;
    }

    printableWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Learning Path</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #0e1526;
            }

            h1 {
              color: #e8963d;
              margin-bottom: 8px;
            }

            .meta {
              color: #687083;
              margin-bottom: 30px;
            }

            .item {
              border-bottom: 1px solid #ddd;
              padding: 16px 0;
            }

            .dependency {
              padding: 10px 0;
            }
          </style>
        </head>

        <body>
          <h1>Learning Path</h1>

          <div class="meta">
            Research:
            ${escapeHtml(topic)}
          </div>

          ${rows}

          ${
            dependencies
              ? `
                <h2>Paper Dependencies</h2>
                ${dependencies}
              `
              : ""
          }
        </body>
      </html>
    `);

    printableWindow.document.close();

    setTimeout(() => {
      printableWindow.focus();
      printableWindow.print();
    }, 300);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return (
    <section className="learning-path-card">

      <div className="learning-path-header">
        <div>
          <span className="learning-path-eyebrow">
            RECOMMENDED READING
          </span>

          <h2>Learning Path</h2>

          <p>
            Follow this order to build your
            understanding from foundational papers
            toward more advanced research.
          </p>
        </div>

        <button
          type="button"
          className="learning-download-button"
          onClick={downloadLearningPath}
        >
          ↓ Download PDF
        </button>
      </div>

      {/* {learningPath.length === 0 ? (
        <div className="learning-empty">
          <div className="learning-empty-icon">
            ✦
          </div>

          <h3>
            Learning path not available yet
          </h3>

          <p>
            Once prerequisite relationships have
            been generated for your papers, your
            recommended reading order will appear
            here.
          </p>
        </div>
      ) : ( */}
            {learningPath.length === 0 ? (
        <div className="learning-empty">
          <div className="learning-empty-icon">
            ✦
          </div>

          <h3>
            No learning relationships found
          </h3>

          <p>
            Your papers were loaded successfully, but
            no prerequisite relationships have been
            generated yet.
          </p>
        </div>
      ) : (
        <>
          <div className="learning-path-list">
            {learningPath.map((paper, index) => {
              const isFirst = index === 0;

              const badge =
                index === 0
                  ? "Start Here"
                  : index === 1
                    ? "Prerequisite"
                    : "Recommended Next";

              return (
                <div
                  className="learning-step"
                  key={paper.id}
                >
                  <div
                    className={`learning-paper ${
                      isFirst
                        ? "learning-paper-first"
                        : ""
                    }`}
                  >
                    <div className="learning-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="learning-paper-info">
                      <span className="learning-step-label">
                        STEP {index + 1}
                      </span>

                      
                        <h3>
  {getPaperTitle(paper)}
</h3>
                      

                      <p>
                        {getAuthors(paper)}
                      </p>

                      <span className="learning-year">
                        {getPaperYear(paper)}
                      </span>
                    </div>

                    <div className="learning-badge">
                      {badge}
                    </div>
                  </div>

                  {index <
                    learningPath.length - 1 && (
                    <div className="learning-arrow">
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {prerequisites.length > 0 && (
            <div className="dependency-section">
              <div className="dependency-heading">
                <span>
                  PAPER RELATIONSHIPS
                </span>

                <h3>
                  Paper Dependencies
                </h3>

                <p>
                  These relationships explain why
                  the papers appear in this order.
                </p>
              </div>

              <div className="dependency-list">
                {prerequisites.map(
                  (item, index) => {
                    const source = getPaperId(
                      getPrerequisiteSource(item)
                    );

                    const target = getPaperId(
                      getPrerequisiteTarget(item)
                    );

                    if (
                      source == null ||
                      target == null
                    ) {
                      return null;
                    }

                    return (
                      <div
                        className="dependency-item"
                        key={item.id || index}
                      >
                        <span>
                          {getPaperTitle(source)}
                        </span>

                        <b>→</b>

                        <span>
                          {getPaperTitle(target)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default LearningPath;
