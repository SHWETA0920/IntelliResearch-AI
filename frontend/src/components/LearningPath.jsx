// import { useMemo } from "react";
// import "../styles/LearningPath.css";

// function LearningPath({
//   papers = [],
//   prerequisites = [],
//   research = null,
// }) {
//   function getPaperId(value) {
//     if (value == null) return null;

//     return typeof value === "object"
//       ? value.id
//       : value;
//   }


//   function getPaperTitle(value) {
//   if (value == null) return "Unknown paper";

//   const paperId =
//     typeof value === "object"
//       ? value.id
//       : value;

//   const paper = papers.find(
//     (item) =>
//       String(item.id) === String(paperId)
//   );

//   if (!paper) {
//     return `Paper ${paperId}`;
//   }

//   // Prefer database title
//   if (paper.title?.trim()) {
//     return paper.title.trim();
//   }

//   // Then name
//   if (paper.name?.trim()) {
//     return paper.name.trim();
//   }

//   // Then uploaded filename
//   if (paper.file) {
//     const filePath =
//       typeof paper.file === "string"
//         ? paper.file
//         : paper.file.name;

//     if (filePath) {
//       const filename = filePath
//         .split("/")
//         .pop()
//         .replace(/\.pdf$/i, "")
//         .replace(/[_-]+/g, " ")
//         .trim();

//       if (filename) {
//         return filename;
//       }
//     }
//   }

//   return `Paper ${paperId}`;
// }

//   function getPaper(paperId) {
//     return papers.find(
//       (item) => String(item.id) === String(paperId)
//     );
//   }

//   function getPaperYear(paper) {
//     return (
//       paper?.year ||
//       paper?.publication_year ||
//       "—"
//     );
//   }

//   function getAuthors(paper) {
//     return (
//       paper?.authors ||
//       "Authors not available"
//     );
//   }

//   function getPrerequisiteSource(item) {
//     return (
//       item.prerequisite_paper ??
//       item.prerequisite_paper_id ??
//       item.prerequisite ??
//       item.source
//     );
//   }

//   function getPrerequisiteTarget(item) {
//     return (
//       item.paper ??
//       item.paper_id ??
//       item.target
//     );
//   }

//   const learningPath = useMemo(() => {
//   if (!papers.length) return [];

//   const prerequisiteMap = new Map();

//   prerequisites.forEach((item) => {
//     const source = getPaperId(getPrerequisiteSource(item));
//     const target = getPaperId(getPrerequisiteTarget(item));

//     if (source == null || target == null) return;

//     const targetKey = String(target);

//     if (!prerequisiteMap.has(targetKey)) {
//       prerequisiteMap.set(targetKey, []);
//     }

//     prerequisiteMap.get(targetKey).push(String(source));
//   });

//   const visited = new Set();
//   const visiting = new Set();
//   const result = [];

//   function visit(paper) {
//     const paperId = String(paper.id);

//     // Already completely processed
//     if (visited.has(paperId)) {
//       return;
//     }

//     // Circular dependency detected
//     if (visiting.has(paperId)) {
//       console.warn(
//         `Circular prerequisite detected at paper: ${paperId}`
//       );
//       return;
//     }

//     visiting.add(paperId);

//     const dependencies =
//       prerequisiteMap.get(paperId) || [];

//     for (const dependencyId of dependencies) {
//       const dependencyPaper = papers.find(
//         (item) =>
//           String(item.id) === String(dependencyId)
//       );

//       if (!dependencyPaper) {
//         continue;
//       }

//       // IMPORTANT:
//       // Do not recurse into a paper already on
//       // the current dependency chain.
//       if (visiting.has(String(dependencyPaper.id))) {
//         console.warn(
//           `Skipping circular dependency: ${paperId} -> ${dependencyPaper.id}`
//         );
//         continue;
//       }

//       visit(dependencyPaper);
//     }

//     visiting.delete(paperId);
//     visited.add(paperId);

//     if (!result.some((item) => String(item.id) === paperId)) {
//       result.push(paper);
//     }
//   }

//   papers.forEach((paper) => {
//     visit(paper);
//   });

//   return result;
// }, [papers, prerequisites]);

//   function downloadLearningPath() {
//     const topic =
//       research?.topic || "Research";

//     const rows = learningPath
//       .map((paper, index) => {
//         return `
//           <div class="item">
//             <h2>
//               ${index + 1}.
//               ${escapeHtml(
//   getPaperTitle(paper)
//               )}
//             </h2>

//             <p>
//               <strong>Authors:</strong>
//               ${escapeHtml(
//                 getAuthors(paper)
//               )}
//             </p>

//             <p>
//               <strong>Year:</strong>
//               ${escapeHtml(
//                 getPaperYear(paper)
//               )}
//             </p>
//           </div>
//         `;
//       })
//       .join("");

//     const dependencies = prerequisites
//       .map((item) => {
//         const source = getPaperId(
//           getPrerequisiteSource(item)
//         );

//         const target = getPaperId(
//           getPrerequisiteTarget(item)
//         );

//         if (source == null || target == null) {
//           return "";
//         }

//         return `
//           <div class="dependency">
//             ${escapeHtml(
//               getPaperTitle(source)
//             )}
//             →
//             ${escapeHtml(
//               getPaperTitle(target)
//             )}
//           </div>
//         `;
//       })
//       .join("");

//     const printableWindow = window.open(
//       "",
//       "_blank",
//       "width=900,height=700"
//     );

//     if (!printableWindow) {
//       return;
//     }

//     printableWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Learning Path</title>

//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               padding: 40px;
//               color: #0e1526;
//             }

//             h1 {
//               color: #e8963d;
//               margin-bottom: 8px;
//             }

//             .meta {
//               color: #687083;
//               margin-bottom: 30px;
//             }

//             .item {
//               border-bottom: 1px solid #ddd;
//               padding: 16px 0;
//             }

//             .dependency {
//               padding: 10px 0;
//             }
//           </style>
//         </head>

//         <body>
//           <h1>Learning Path</h1>

//           <div class="meta">
//             Research:
//             ${escapeHtml(topic)}
//           </div>

//           ${rows}

//           ${
//             dependencies
//               ? `
//                 <h2>Paper Dependencies</h2>
//                 ${dependencies}
//               `
//               : ""
//           }
//         </body>
//       </html>
//     `);

//     printableWindow.document.close();

//     setTimeout(() => {
//       printableWindow.focus();
//       printableWindow.print();
//     }, 300);
//   }

//   function escapeHtml(value) {
//     return String(value ?? "")
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//       .replaceAll('"', "&quot;")
//       .replaceAll("'", "&#039;");
//   }

//   return (
//     <section className="learning-path-card">

//       <div className="learning-path-header">
//         <div>
//           <span className="learning-path-eyebrow">
//             RECOMMENDED READING
//           </span>

//           <h2>Learning Path</h2>

//           <p>
//             Follow this order to build your
//             understanding from foundational papers
//             toward more advanced research.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="learning-download-button"
//           onClick={downloadLearningPath}
//         >
//           ↓ Download PDF
//         </button>
//       </div>

//       {/* {learningPath.length === 0 ? (
//         <div className="learning-empty">
//           <div className="learning-empty-icon">
//             ✦
//           </div>

//           <h3>
//             Learning path not available yet
//           </h3>

//           <p>
//             Once prerequisite relationships have
//             been generated for your papers, your
//             recommended reading order will appear
//             here.
//           </p>
//         </div>
//       ) : ( */}
//             {learningPath.length === 0 ? (
//         <div className="learning-empty">
//           <div className="learning-empty-icon">
//             ✦
//           </div>

//           <h3>
//             No learning relationships found
//           </h3>

//           <p>
//             Your papers were loaded successfully, but
//             no prerequisite relationships have been
//             generated yet.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="learning-path-list">
//             {learningPath.map((paper, index) => {
//               const isFirst = index === 0;

//               const badge =
//                 index === 0
//                   ? "Start Here"
//                   : index === 1
//                     ? "Prerequisite"
//                     : "Recommended Next";

//               return (
//                 <div
//                   className="learning-step"
//                   key={paper.id}
//                 >
//                   <div
//                     className={`learning-paper ${
//                       isFirst
//                         ? "learning-paper-first"
//                         : ""
//                     }`}
//                   >
//                     <div className="learning-number">
//                       {String(index + 1).padStart(
//                         2,
//                         "0"
//                       )}
//                     </div>

//                     <div className="learning-paper-info">
//                       <span className="learning-step-label">
//                         STEP {index + 1}
//                       </span>

                      
//                         <h3>
//   {getPaperTitle(paper)}
// </h3>
                      

//                       <p>
//                         {getAuthors(paper)}
//                       </p>

//                       <span className="learning-year">
//                         {getPaperYear(paper)}
//                       </span>
//                     </div>

//                     <div className="learning-badge">
//                       {badge}
//                     </div>
//                   </div>

//                   {index <
//                     learningPath.length - 1 && (
//                     <div className="learning-arrow">
//                       ↓
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {prerequisites.length > 0 && (
//             <div className="dependency-section">
//               <div className="dependency-heading">
//                 <span>
//                   PAPER RELATIONSHIPS
//                 </span>

//                 <h3>
//                   Paper Dependencies
//                 </h3>

//                 <p>
//                   These relationships explain why
//                   the papers appear in this order.
//                 </p>
//               </div>

//               <div className="dependency-list">
//                 {prerequisites.map(
//                   (item, index) => {
//                     const source = getPaperId(
//                       getPrerequisiteSource(item)
//                     );

//                     const target = getPaperId(
//                       getPrerequisiteTarget(item)
//                     );

//                     if (
//                       source == null ||
//                       target == null
//                     ) {
//                       return null;
//                     }

//                     return (
//                       <div
//                         className="dependency-item"
//                         key={item.id || index}
//                       >
//                         <span>
//                           {getPaperTitle(source)}
//                         </span>

//                         <b>→</b>

//                         <span>
//                           {getPaperTitle(target)}
//                         </span>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// }

// export default LearningPath;

// import { useMemo } from "react";
// import "../styles/LearningPath.css";

// function LearningPath({
//   papers = [],
//   prerequisites = [],
//   research = null,
// }) {
//   function getPaperId(value) {
//     if (value == null) return null;

//     return typeof value === "object"
//       ? value.id
//       : value;
//   }

//   function getPaperTitle(value) {
//     if (value == null) return "Unknown paper";

//     const paperId =
//       typeof value === "object"
//         ? value.id
//         : value;

//     const paper = papers.find(
//       (item) =>
//         String(item.id) === String(paperId)
//     );

//     if (!paper) {
//       return `Paper ${paperId}`;
//     }

//     // Prefer database title
//     if (paper.title?.trim()) {
//       return paper.title.trim();
//     }

//     // Then name
//     if (paper.name?.trim()) {
//       return paper.name.trim();
//     }

//     // Then uploaded filename
//     if (paper.file) {
//       const filePath =
//         typeof paper.file === "string"
//           ? paper.file
//           : paper.file.name;

//       if (filePath) {
//         const filename = filePath
//           .split("/")
//           .pop()
//           .replace(/\.pdf$/i, "")
//           .replace(/[_-]+/g, " ")
//           .trim();

//         if (filename) {
//           return filename;
//         }
//       }
//     }

//     return `Paper ${paperId}`;
//   }

//   function getPaper(paperId) {
//     return papers.find(
//       (item) => String(item.id) === String(paperId)
//     );
//   }

//   function getPaperYear(paper) {
//     const raw =
//       paper?.year ||
//       paper?.publication_year ||
//       paper?.published_year ||
//       paper?.publication_date ||
//       paper?.published_date ||
//       paper?.date ||
//       paper?.metadata?.year ||
//       paper?.metadata?.publication_year ||
//       paper?.metadata?.date;

//     if (!raw) return "—";

//     // Reduce full dates like "2012-08-01" to just the year
//     const match = String(raw).match(/\b(1[5-9]\d{2}|20\d{2})\b/);
//     return match ? match[1] : String(raw);
//   }

//   function formatAuthors(value) {
//     if (!value) return "";

//     if (typeof value === "string") {
//       let text = value.trim();

//       // Handle JSON strings such as '["A. Smith","B. Jones"]'
//       if (text.startsWith("[")) {
//         try {
//           return formatAuthors(JSON.parse(text));
//         } catch {
//           /* fall through and use the raw text */
//         }
//       }

//       return text;
//     }

//     if (Array.isArray(value)) {
//       return value
//         .map((author) =>
//           typeof author === "string"
//             ? author
//             : author?.name ||
//               author?.full_name ||
//               [author?.first_name, author?.last_name]
//                 .filter(Boolean)
//                 .join(" ")
//         )
//         .map((name) => String(name || "").trim())
//         .filter(Boolean)
//         .join(", ");
//     }

//     if (typeof value === "object") {
//       return value.name || value.full_name || "";
//     }

//     return String(value);
//   }

//   function getAuthors(paper) {
//     const authors =
//       formatAuthors(paper?.authors) ||
//       formatAuthors(paper?.author) ||
//       formatAuthors(paper?.author_names) ||
//       formatAuthors(paper?.authors_list) ||
//       formatAuthors(paper?.metadata?.authors) ||
//       formatAuthors(paper?.metadata?.author);

//     return authors || "Authors not available";
//   }

//   // FIXED DIRECTION:
//   // "source"  = the prerequisite (must be read FIRST)
//   // "target"  = the paper that depends on it (read AFTER)
//   function getPrerequisiteSource(item) {
//     return (
//       item.prerequisite_paper ??
//       item.prerequisite_paper_id ??
//       item.prerequisite ??
//       item.source
//     );
//   }

//   function getPrerequisiteTarget(item) {
//     return (
//       item.paper ??
//       item.paper_id ??
//       item.target
//     );
//   }

//   // Tie-break order: oldest year first, then natural title order (CC1, CC2, ... CC10)
//   function comparePapers(a, b) {
//     const yearA = Number(getPaperYear(a)) || Infinity;
//     const yearB = Number(getPaperYear(b)) || Infinity;

//     if (yearA !== yearB) return yearA - yearB;

//     return getPaperTitle(a).localeCompare(
//       getPaperTitle(b),
//       undefined,
//       { numeric: true, sensitivity: "base" }
//     );
//   }

//   const learningPath = useMemo(() => {
//     if (!papers.length) return [];

//     const validIds = new Set(papers.map((p) => String(p.id)));

//     // paperId -> set of prerequisite ids that must come first
//     const required = new Map();
//     papers.forEach((p) => required.set(String(p.id), new Set()));

//     prerequisites.forEach((item) => {
//       const source = getPaperId(getPrerequisiteSource(item));
//       const target = getPaperId(getPrerequisiteTarget(item));

//       if (source == null || target == null) return;

//       const s = String(source);
//       const t = String(target);

//       if (s === t || !validIds.has(s) || !validIds.has(t)) return;

//       required.get(t).add(s);
//     });

//     const candidates = [...papers].sort(comparePapers);
//     const done = new Set();
//     const result = [];

//     while (result.length < papers.length) {
//       // First paper (in tie-break order) whose prerequisites are all done
//       let next = candidates.find(
//         (p) =>
//           !done.has(String(p.id)) &&
//           [...required.get(String(p.id))].every((id) => done.has(id))
//       );

//       // Circular dependency: fall back to the next unfinished paper
//       if (!next) {
//         next = candidates.find((p) => !done.has(String(p.id)));
//         console.warn(
//           `Circular prerequisite detected near paper: ${next.id}`
//         );
//       }

//       done.add(String(next.id));
//       result.push(next);
//     }

//     return result;
//   }, [papers, prerequisites]);

//   function downloadLearningPath() {
//     const topic =
//       research?.topic || "Research";

//     const rows = learningPath
//       .map((paper, index) => {
//         return `
//           <div class="item">
//             <h2>
//               ${index + 1}.
//               ${escapeHtml(
//                 getPaperTitle(paper)
//               )}
//             </h2>

//             <p>
//               <strong>Year:</strong>
//               ${escapeHtml(
//                 getPaperYear(paper)
//               )}
//             </p>
//           </div>
//         `;
//       })
//       .join("");

//     const dependencies = prerequisites
//       .map((item) => {
//         const source = getPaperId(
//           getPrerequisiteSource(item)
//         );

//         const target = getPaperId(
//           getPrerequisiteTarget(item)
//         );

//         if (source == null || target == null) {
//           return "";
//         }

//         return `
//           <div class="dependency">
//             ${escapeHtml(
//               getPaperTitle(source)
//             )}
//             →
//             ${escapeHtml(
//               getPaperTitle(target)
//             )}
//           </div>
//         `;
//       })
//       .join("");

//     const printableWindow = window.open(
//       "",
//       "_blank",
//       "width=900,height=700"
//     );

//     if (!printableWindow) {
//       return;
//     }

//     printableWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Learning Path</title>

//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               padding: 40px;
//               color: #0e1526;
//             }

//             h1 {
//               color: #e8963d;
//               margin-bottom: 8px;
//             }

//             .meta {
//               color: #687083;
//               margin-bottom: 30px;
//             }

//             .item {
//               border-bottom: 1px solid #ddd;
//               padding: 16px 0;
//             }

//             .dependency {
//               padding: 10px 0;
//             }
//           </style>
//         </head>

//         <body>
//           <h1>Learning Path</h1>

//           <div class="meta">
//             Research:
//             ${escapeHtml(topic)}
//           </div>

//           ${rows}

//           ${
//             dependencies
//               ? `
//                 <h2>Paper Dependencies</h2>
//                 ${dependencies}
//               `
//               : ""
//           }
//         </body>
//       </html>
//     `);

//     printableWindow.document.close();

//     setTimeout(() => {
//       printableWindow.focus();
//       printableWindow.print();
//     }, 300);
//   }

//   function escapeHtml(value) {
//     return String(value ?? "")
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//       .replaceAll('"', "&quot;")
//       .replaceAll("'", "&#039;");
//   }

//   return (
//     <section className="learning-path-card">

//       <div className="learning-path-header">
//         <div>
//           <span className="learning-path-eyebrow">
//             RECOMMENDED READING
//           </span>

//           <h2>Learning Path</h2>

//           <p>
//             Follow this order to build your
//             understanding from foundational papers
//             toward more advanced research.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="learning-download-button"
//           onClick={downloadLearningPath}
//         >
//           ↓ Download PDF
//         </button>
//       </div>

//       {learningPath.length === 0 ? (
//         <div className="learning-empty">
//           <div className="learning-empty-icon">
//             ✦
//           </div>

//           <h3>
//             No learning relationships found
//           </h3>

//           <p>
//             Your papers were loaded successfully, but
//             no prerequisite relationships have been
//             generated yet.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="learning-path-list">
//             {learningPath.map((paper, index) => {
//               const isFirst = index === 0;

//               const badge =
//                 index === 0
//                   ? "Start Here"
//                   : index === 1
//                     ? "Prerequisite"
//                     : "Recommended Next";

//               return (
//                 <div
//                   className="learning-step"
//                   key={paper.id}
//                 >
//                   <div
//                     className={`learning-paper ${
//                       isFirst
//                         ? "learning-paper-first"
//                         : ""
//                     }`}
//                   >
//                     <div className="learning-number">
//                       {String(index + 1).padStart(
//                         2,
//                         "0"
//                       )}
//                     </div>

//                     <div className="learning-paper-info">
//                       <span className="learning-step-label">
//                         STEP {index + 1}
//                       </span>

//                       <h3>
//                         {getPaperTitle(paper)}
//                       </h3>

//                       <span className="learning-year">
//                         {getPaperYear(paper)}
//                       </span>
//                     </div>

//                     <div className="learning-badge">
//                       {badge}
//                     </div>
//                   </div>

//                   {index <
//                     learningPath.length - 1 && (
//                     <div className="learning-arrow">
//                       ↓
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {prerequisites.length > 0 && (
//             <div className="dependency-section">
//               <div className="dependency-heading">
//                 <span>
//                   PAPER RELATIONSHIPS
//                 </span>

//                 <h3>
//                   Paper Dependencies
//                 </h3>

//                 <p>
//                   These relationships explain why
//                   the papers appear in this order.
//                 </p>
//               </div>

//               <div className="dependency-list">
//                 {prerequisites.map(
//                   (item, index) => {
//                     const source = getPaperId(
//                       getPrerequisiteSource(item)
//                     );

//                     const target = getPaperId(
//                       getPrerequisiteTarget(item)
//                     );

//                     if (
//                       source == null ||
//                       target == null
//                     ) {
//                       return null;
//                     }

//                     return (
//                       <div
//                         className="dependency-item"
//                         key={item.id || index}
//                       >
//                         <span>
//                           {getPaperTitle(source)}
//                         </span>

//                         <b>→</b>

//                         <span>
//                           {getPaperTitle(target)}
//                         </span>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// }

// export default LearningPath;


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
      ? value.id ?? value.pk ?? null
      : value;
  }

  function getPaperTitle(value) {
    if (value == null) return "Unknown paper";

    const paperId = getPaperId(value);

    const paper = papers.find(
      (item) => String(item.id) === String(paperId)
    );

    if (!paper) return `Paper ${paperId}`;

    if (paper.title?.trim()) return paper.title.trim();
    if (paper.name?.trim()) return paper.name.trim();

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

        if (filename) return filename;
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
    const raw =
      paper?.year ||
      paper?.publication_year ||
      paper?.published_year ||
      paper?.publication_date ||
      paper?.published_date ||
      paper?.date ||
      paper?.metadata?.year ||
      paper?.metadata?.publication_year ||
      paper?.metadata?.date;

    if (!raw) return "—";

    const match = String(raw).match(
      /\b(1[5-9]\d{2}|20\d{2})\b/
    );

    return match ? match[1] : String(raw);
  }

  function formatAuthors(value) {
    if (!value) return "";

    if (typeof value === "string") {
      const text = value.trim();

      if (text.startsWith("[")) {
        try {
          return formatAuthors(JSON.parse(text));
        } catch {
          return text;
        }
      }

      return text;
    }

    if (Array.isArray(value)) {
      return value
        .map((author) =>
          typeof author === "string"
            ? author
            : author?.name ||
              author?.full_name ||
              [
                author?.first_name,
                author?.last_name,
              ]
                .filter(Boolean)
                .join(" ")
        )
        .map((name) => String(name || "").trim())
        .filter(Boolean)
        .join(", ");
    }

    if (typeof value === "object") {
      return value.name || value.full_name || "";
    }

    return String(value);
  }

  function getAuthors(paper) {
    const authors =
      formatAuthors(paper?.authors) ||
      formatAuthors(paper?.author) ||
      formatAuthors(paper?.author_names) ||
      formatAuthors(paper?.authors_list) ||
      formatAuthors(paper?.metadata?.authors) ||
      formatAuthors(paper?.metadata?.author);

    return authors || "Authors not available";
  }

  // prerequisite_paper must be read BEFORE paper.
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

  function comparePapers(a, b) {
    const yearA = Number(getPaperYear(a)) || Infinity;
    const yearB = Number(getPaperYear(b)) || Infinity;

    if (yearA !== yearB) return yearA - yearB;

    return getPaperTitle(a).localeCompare(
      getPaperTitle(b),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );
  }

  console.log("PAPERS:", papers.map((p) => p.id));

console.log(
  "PREREQUISITES:",
  prerequisites.map((item) => ({
    paper: item.paper,
    prerequisite_paper: item.prerequisite_paper,
  }))
);

  // Build a prerequisite-based learning path.
  const learningPath = useMemo(() => {
    if (!papers.length) return [];

    const validIds = new Set(
      papers.map((paper) => String(paper.id))
    );

    // Paper ID -> prerequisites that must be read first.
    const required = new Map();

    // Paper ID -> prerequisite relationship records.
    const relationshipDetails = new Map();

    papers.forEach((paper) => {
      const id = String(paper.id);

      required.set(id, new Set());
      relationshipDetails.set(id, []);
    });

    prerequisites.forEach((item) => {
      const source = getPaperId(
        getPrerequisiteSource(item)
      );

      const target = getPaperId(
        getPrerequisiteTarget(item)
      );

      if (source == null || target == null) return;

      const sourceId = String(source);
      const targetId = String(target);

      if (
        sourceId === targetId ||
        !validIds.has(sourceId) ||
        !validIds.has(targetId)
      ) {
        return;
      }

      required.get(targetId).add(sourceId);
      relationshipDetails.get(targetId).push(item);
    });

    const candidates = [...papers].sort(comparePapers);

    // Store the assigned sequence for each paper.
    const assigned = new Map();

    const result = [];

    while (assigned.size < papers.length) {
      // Find all papers whose prerequisites have already
      // been assigned a sequence.
      const ready = candidates.filter((paper) => {
        const id = String(paper.id);

        if (assigned.has(id)) return false;

        return [...required.get(id)].every(
          (prerequisiteId) => assigned.has(prerequisiteId)
        );
      });

      // If no paper is ready, remaining papers contain
      // circular or unresolved prerequisite relationships.
      if (!ready.length) {
        candidates
          .filter(
            (paper) => !assigned.has(String(paper.id))
          )
          .forEach((paper) => {
            result.push({
              paper,
              sequence: null,
              cycle: true,
              reason:
                "A circular or unresolved prerequisite dependency exists. This paper needs its dependencies reviewed before a reliable reading sequence can be assigned.",
            });
          });

        break;
      }

      ready.forEach((paper) => {
        const id = String(paper.id);

        const prerequisiteIds = [
          ...required.get(id),
        ];

        // No prerequisites means the paper can be
        // read independently in Sequence 1.
        const sequence =
          prerequisiteIds.length === 0
            ? 1
            : Math.max(
                ...prerequisiteIds.map(
                  (prerequisiteId) =>
                    assigned.get(prerequisiteId)
                )
              ) + 1;

        let reason;

        if (sequence === 1) {
          reason =
            "No prerequisite papers are recorded. You can start with this paper independently.";
        } else {
          const prerequisiteTitles =
            prerequisiteIds.map((prerequisiteId) =>
              getPaperTitle(prerequisiteId)
            );

          reason =
            `Read this after ${prerequisiteTitles.join(", ")}. ` +
            "It depends on knowledge introduced in those prerequisite papers.";

          const details =
            relationshipDetails.get(id) || [];

          const recordedReasons = details
            .map((item) => item.reason)
            .filter(
              (value) =>
                typeof value === "string" &&
                value.trim()
            );

          if (recordedReasons.length) {
            reason +=
              ` Relationship explanation: ${recordedReasons.join("; ")}`;
          }
        }

        assigned.set(id, sequence);

        result.push({
          paper,
          sequence,
          cycle: false,
          reason,
        });
      });
    }

    // Display sequence numbers in ascending order.
    return result.sort((a, b) => {
      if (a.sequence == null) return 1;
      if (b.sequence == null) return -1;

      if (a.sequence !== b.sequence) {
        return a.sequence - b.sequence;
      }

      return comparePapers(a.paper, b.paper);
    });
  }, [papers, prerequisites]);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function downloadLearningPath() {
    const topic = research?.topic || "Research";

    const rows = learningPath
      .map((step) => {
        return `
          <div class="item">
            <h2>
              ${
                step.sequence
                  ? `Sequence ${step.sequence}`
                  : "Needs review"
              }:
              ${escapeHtml(getPaperTitle(step.paper))}
            </h2>

            <p>
              <strong>Authors:</strong>
              ${escapeHtml(getAuthors(step.paper))}
            </p>

            <p>
              <strong>Year:</strong>
              ${escapeHtml(getPaperYear(step.paper))}
            </p>

            <p>
              <strong>Why this sequence?</strong>
              ${escapeHtml(step.reason)}
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
            ${escapeHtml(getPaperTitle(source))}
            →
            ${escapeHtml(getPaperTitle(target))}
            ${
              item.reason
                ? `<p>${escapeHtml(item.reason)}</p>`
                : ""
            }
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
              page-break-inside: avoid;
            }

            .item h2 {
              font-size: 18px;
            }

            .dependency {
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }

            .dependency p {
              color: #687083;
              font-size: 13px;
            }
          </style>
        </head>

        <body>
          <h1>Learning Path</h1>

          <div class="meta">
            Research: ${escapeHtml(topic)}
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

  // Group papers by sequence for display.
  const sequenceGroups = useMemo(() => {
    const groups = new Map();

    learningPath.forEach((step) => {
      const key =
        step.sequence == null
          ? "review"
          : String(step.sequence);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(step);
    });

    return [...groups.entries()];
  }, [learningPath]);

  return (
    <section className="learning-path-card">
      <div className="learning-path-header">
        <div>
          <span className="learning-path-eyebrow">
            RECOMMENDED READING
          </span>

          <h2>Learning Path</h2>

          <p>
            Start with papers that have no prerequisites,
            then progress toward papers that build on
            earlier knowledge.
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

      {learningPath.length === 0 ? (
        <div className="learning-empty">
          <div className="learning-empty-icon">
            ✦
          </div>

          <h3>No learning relationships found</h3>

          <p>
            Your papers were loaded successfully, but
            no prerequisite relationships have been
            generated yet.
          </p>
        </div>
      ) : (
        <>
          <div className="learning-path-list">
            {sequenceGroups.map(([sequence, steps]) => {
              const isReview = sequence === "review";
              const sequenceNumber = isReview
                ? null
                : Number(sequence);

              return (
                <div
                  className="learning-sequence-group"
                  key={sequence}
                >
                  <div className="learning-sequence-heading">
                    <span>
                      {isReview
                        ? "DEPENDENCY REVIEW"
                        : `SEQUENCE ${sequenceNumber}`}
                    </span>

                    <h3>
                      {isReview
                        ? "Papers needing review"
                        : sequenceNumber === 1
                          ? "Start Here"
                          : "Read After Earlier Sequences"}
                    </h3>

                    <p>
                      {isReview
                        ? "These papers have unresolved prerequisite relationships."
                        : sequenceNumber === 1
                          ? "These papers have no recorded prerequisites and can be read independently."
                          : "These papers depend on knowledge from earlier sequences."}
                    </p>
                  </div>

                  {steps.map((step) => {
                    const paper = step.paper;

                    return (
                      <div
                        className="learning-step"
                        key={paper.id}
                      >
                        <div
                          className={`learning-paper ${
                            step.sequence === 1
                              ? "learning-paper-first"
                              : ""
                          }`}
                        >
                          <div className="learning-number">
                            {step.sequence
                              ? String(step.sequence).padStart(2, "0")
                              : "!"}
                          </div>

                          <div className="learning-paper-info">
                            <span className="learning-step-label">
                              {step.sequence
                                ? `SEQUENCE ${step.sequence}`
                                : "DEPENDENCY ISSUE"}
                            </span>

                            <h3>
                              {getPaperTitle(paper)}
                            </h3>

                            <span className="learning-year">
                              {getPaperYear(paper)}
                            </span>

                            <p className="learning-reason">
                              <strong>
                                Why this sequence?
                              </strong>
                              {" "}
                              {step.reason}
                            </p>
                          </div>

                          <div className="learning-badge">
                            {step.cycle
                              ? "Needs Review"
                              : step.sequence === 1
                                ? "Start Here"
                                : "Prerequisites First"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {prerequisites.length > 0 && (
            <div className="dependency-section">
              <div className="dependency-heading">
                <span>PAPER RELATIONSHIPS</span>

                <h3>Paper Dependencies</h3>

                <p>
                  These relationships show which papers
                  should be read before others.
                </p>
              </div>

              <div className="dependency-list">
                {prerequisites.map((item, index) => {
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

                      {item.reason && (
                        <p>{item.reason}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default LearningPath;

