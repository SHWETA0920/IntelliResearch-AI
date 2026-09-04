import React from "react";

function LearningPath({ papers = [], prerequisites = [], research = null }) {
  // Safely handle missing or invalid data
  const safePapers = Array.isArray(papers) ? papers : [];
  const safePrerequisites = Array.isArray(prerequisites)
    ? prerequisites
    : [];

  // Build prerequisite map
  const prerequisiteMap = new Map();

  safePrerequisites.forEach((item) => {
    if (!item) return;

    const target =
      item.paper ||
      item.paper_id ||
      item.target;

    const source =
      item.prerequisite_paper ||
      item.prerequisite_paper_id ||
      item.prerequisite ||
      item.source;

    if (target == null || source == null) return;

    const targetId =
      typeof target === "object" ? target.id : target;

    const sourceId =
      typeof source === "object" ? source.id : source;

    if (targetId == null || sourceId == null) return;

    if (!prerequisiteMap.has(String(targetId))) {
      prerequisiteMap.set(String(targetId), []);
    }

    prerequisiteMap
      .get(String(targetId))
      .push(String(sourceId));
  });

  // Build learning path
  const visited = new Set();
  const learningPath = [];

  function visit(paper) {
    if (!paper || paper.id == null) return;

    const paperId = String(paper.id);

    if (visited.has(paperId)) return;

    const dependencies =
      prerequisiteMap.get(paperId) || [];

    dependencies.forEach((dependencyId) => {
      const dependencyPaper = safePapers.find(
        (p) => String(p.id) === String(dependencyId)
      );

      if (dependencyPaper) {
        visit(dependencyPaper);
      }
    });

    visited.add(paperId);
    learningPath.push(paper);
  }

  safePapers.forEach(visit);

  function getYear(paper) {
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

  function getTitle(paper) {
    return (
      paper?.title ||
      paper?.name ||
      `Paper ${paper?.id || ""}`
    );
  }

  return (
    <section className="result-card">
      <div className="result-header">
        <div>
          <span className="result-eyebrow">
            RECOMMENDED READING
          </span>

          <h2>Learning Path</h2>

          <p>
            AI-recommended order to read your papers
            based on prerequisite relationships.
          </p>
        </div>
      </div>

      {learningPath.length === 0 ? (
        <div className="empty-result">
          <h3>No learning path available</h3>

          <p>
            Upload and analyze papers to generate
            a recommended learning path.
          </p>
        </div>
      ) : (
        <div className="learning-path-list">
          {learningPath.map((paper, index) => (
            <div
              className={`learning-paper ${
                index === 0 ? "recommended" : ""
              }`}
              key={paper.id || index}
            >
              <div className="step-number">
                {index + 1}
              </div>

              <div className="learning-paper-content">
                <h3>{getTitle(paper)}</h3>

                <p>{getAuthors(paper)}</p>

                <span>{getYear(paper)}</span>
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

      {safePrerequisites.length > 0 && (
        <div className="dependency-section">
          <h3>Paper Dependency Graph</h3>

          <div className="dependency-list">
            {safePrerequisites.map((item, index) => {
              const source =
                item?.prerequisite_paper ||
                item?.prerequisite_paper_id ||
                item?.prerequisite ||
                item?.source;

              const target =
                item?.paper ||
                item?.paper_id ||
                item?.target;

              const sourceId =
                typeof source === "object"
                  ? source?.id
                  : source;

              const targetId =
                typeof target === "object"
                  ? target?.id
                  : target;

              const sourcePaper = safePapers.find(
                (paper) =>
                  String(paper.id) ===
                  String(sourceId)
              );

              const targetPaper = safePapers.find(
                (paper) =>
                  String(paper.id) ===
                  String(targetId)
              );

              return (
                <div
                  className="dependency-item"
                  key={item?.id || index}
                >
                  <span>
                    {sourcePaper
                      ? getTitle(sourcePaper)
                      : `Paper ${sourceId || "?"}`}
                  </span>

                  <b>→</b>

                  <span>
                    {targetPaper
                      ? getTitle(targetPaper)
                      : `Paper ${targetId || "?"}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default LearningPath;