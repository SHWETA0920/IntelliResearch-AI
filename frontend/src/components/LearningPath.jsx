import { useMemo } from "react";
import "../styles/LearningPath.css";

/* =========================================================
   SUMMARY HELPERS
   Pure functions (no React state) used to build the short
   summary shown inside every learning-path card:
     - the paper's role (foundation / bridge / ...)
     - what it covers
     - its keywords
   ========================================================= */

const STOPWORDS = new Set(
  (
    "a about above after again against all also although always among an and " +
    "another any are around as at away be because been before being below " +
    "between both but by can could did do does doing done down during each " +
    "either else even ever every few for from further had has have having " +
    "he her here hers him his how however i if in into is it its itself just " +
    "least less like made make makes many may might more most much must my " +
    "need needs never no nor not now of off often on once one only or other " +
    "others our out over own per perhaps rather same shall she should since " +
    "so some such than that the their theirs them then there these they this " +
    "those though three through thus to too toward towards two under until " +
    "up upon us use used uses using very via was we well were what when " +
    "whenever where whether which while who whom whose why will with within " +
    "without would yet you your " +
    // generic academic wording that says nothing about the topic
    "paper papers propose proposes proposed present presents presented show " +
    "shows shown showed result results approach approaches method methods " +
    "based study studies work works new novel first second third find " +
    "finds found finding findings introduce introduces introduced describe " +
    "describes described discuss discusses discussion provide provides " +
    "provided give gives given problem problems issue issues limitation " +
    "limitations future novelty specified explicitly mentioned stated " +
    "section figure table abstract introduction conclusion conclusions " +
    "author authors different various several specific general particular " +
    "important existing current recent previous prior including include " +
    "includes based allow allows enable enables consider considers " +
    "considered analyze analyzes analyzed evaluate evaluates evaluated " +
    "demonstrate demonstrates demonstrated achieve achieves achieved " +
    "improve improves improved performance step steps way ways time case " +
    "cases example examples part parts kind kinds thing things lot"
  ).split(/\s+/)
);

// Values the AI sometimes returns when a field is empty.
const PLACEHOLDER_TEXT =
  /^(not (explicitly )?(specified|discussed|available|stated|mentioned)\b|n\/a\b|none\.?$)/i;

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulText(value) {
  const text = cleanText(value);
  return text.length > 3 && !PLACEHOLDER_TEXT.test(text);
}

// Shorten to roughly `max` characters, preferring a sentence end,
// then a word boundary.
function shortenText(value, max = 190) {
  const text = cleanText(value);

  if (text.length <= max) return text;

  const cut = text.slice(0, max);

  const sentenceEnd = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("! ")
  );

  if (sentenceEnd >= max * 0.5) {
    return cut.slice(0, sentenceEnd + 1);
  }

  const space = cut.lastIndexOf(" ");
  const end = space > 0 ? space : max;

  return `${cut.slice(0, end).replace(/[,;:\-–\s]+$/, "")}…`;
}

// Split text into clauses so two-word phrases never span punctuation.
function splitClauses(text) {
  return cleanText(text)
    .split(/[.;:,()\[\]?!\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function tokenize(clause) {
  return clause
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

const ACRONYM = /^[A-Z][A-Z0-9]{1,5}$/;

function keywordKey(word) {
  return word.toLowerCase();
}

function isKeywordWord(word) {
  const key = keywordKey(word);

  if (STOPWORDS.has(key)) return false;
  if (/^\d+$/.test(key)) return false;

  // Acronyms such as TLS, RSA, DNS are worth keeping even when short.
  if (ACRONYM.test(word) && key.length >= 2) return true;

  return key.length >= 4;
}

function displayKeyword(key, acronyms) {
  return key
    .split(" ")
    .map((part) => (acronyms.has(part) ? part.toUpperCase() : part))
    .join(" ");
}

/**
 * sources: [{ text, weight }]
 * Returns up to `limit` keywords / short key phrases, strongest first.
 */
function extractKeywords(sources, limit = 5) {
  const single = new Map();
  const pairs = new Map();
  const acronyms = new Set();

  const add = (map, key, weight) =>
    map.set(key, (map.get(key) || 0) + weight);

  sources.forEach(({ text, weight }) => {
    if (!isUsefulText(text)) return;

    splitClauses(text).forEach((clause) => {
      const words = tokenize(clause);

      words.forEach((word, i) => {
        const ok = isKeywordWord(word);

        if (ok) {
          if (ACRONYM.test(word)) acronyms.add(keywordKey(word));
          add(single, keywordKey(word), weight);
        }

        const next = words[i + 1];

        if (ok && next && isKeywordWord(next)) {
          add(pairs, `${keywordKey(word)} ${keywordKey(next)}`, weight);
        }
      });
    });
  });

  // A phrase must be reasonably well supported; a word must appear
  // in the title/analysis, or more than once in the other text.
  const candidates = [
    ...[...pairs.entries()]
      .filter(([, score]) => score >= 3)
      .map(([key, score]) => ({ key, score: score * 1.4, isPair: true })),
    ...[...single.entries()]
      .filter(([, score]) => score >= 2)
      .map(([key, score]) => ({ key, score, isPair: false })),
  ].sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));

  const picked = [];
  const used = new Set();

  for (const candidate of candidates) {
    if (picked.length >= limit) break;

    const parts = candidate.key.split(" ");

    // Skip a word already covered by a chosen phrase, and a phrase that
    // overlaps one already chosen.
    if (candidate.isPair) {
      if (parts.some((part) => used.has(part))) continue;
    } else if (used.has(candidate.key)) {
      continue;
    }

    picked.push(candidate.key);
    parts.forEach((part) => used.add(part));
  }

  return picked.map((key) => displayKeyword(key, acronyms));
}

function shortTitle(title, max = 58) {
  const text = cleanText(title);
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

// ["A", "B", "C"] -> "“A”, “B” and 1 more"
function formatTitleList(titles, maxShown = 2) {
  const shown = titles.slice(0, maxShown).map((t) => `“${shortTitle(t)}”`);
  const rest = titles.length - shown.length;

  if (rest > 0) {
    return `${shown.join(", ")} and ${rest} more`;
  }

  if (shown.length === 2) {
    return `${shown[0]} and ${shown[1]}`;
  }

  return shown.join(", ");
}

function getRole(prerequisiteCount, dependantCount) {
  if (prerequisiteCount === 0 && dependantCount > 0) {
    return { key: "foundation", label: "Foundation" };
  }

  if (prerequisiteCount > 0 && dependantCount > 0) {
    return { key: "bridge", label: "Bridge" };
  }

  if (prerequisiteCount > 0) {
    return { key: "advanced", label: "Builds on earlier work" };
  }

  return { key: "standalone", label: "Standalone" };
}

function buildWhyText({
  role,
  prerequisiteTitles,
  dependantTitles,
  totalPapers,
}) {
  const needs = formatTitleList(prerequisiteTitles);
  const unlocks = formatTitleList(dependantTitles);

  switch (role.key) {
    case "foundation":
      return (
        `Read this before ${unlocks}. ` +
        `${dependantTitles.length === 1 ? "That paper builds" : "Those papers build"} ` +
        `on it, and it needs nothing else from this set first.`
      );

    case "bridge":
      return (
        `It builds on ${needs}; ${unlocks} ` +
        `${dependantTitles.length === 1 ? "builds" : "build"} on it. ` +
        `So read it after ` +
        `${prerequisiteTitles.length === 1 ? "that paper" : "those papers"} ` +
        `and before ${dependantTitles.length === 1 ? "it" : "them"}.`
      );

    case "advanced":
      return (
        `Builds on ${needs}, so read ` +
        `${prerequisiteTitles.length === 1 ? "that paper" : "those papers"} ` +
        `first. No other paper in this set depends on it.`
      );

    default:
      return totalPapers <= 1
        ? "This is the only paper in this research."
        : "No citation link to the other papers was found, so it is " +
          "placed by publication year and title.";
  }
}

/* =========================================================
   COMPONENT
   ========================================================= */

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

    // Prefer database title, then name, then uploaded filename
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

    // Reduce full dates like "2012-08-01" to just the year
    const match = String(raw).match(/\b(1[5-9]\d{2}|20\d{2})\b/);
    return match ? match[1] : String(raw);
  }

  function formatAuthors(value) {
    if (!value) return "";

    if (typeof value === "string") {
      const text = value.trim();

      // Handle JSON strings such as '["A. Smith","B. Jones"]'
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
              [author?.first_name, author?.last_name]
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

  // "source" = the prerequisite (must be read FIRST)
  // "target" = the paper that depends on it (read AFTER)
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

  // Tie-break order: oldest year first, then natural title order (CC1, CC2, ... CC10)
  function comparePapers(a, b) {
    const yearA = Number(getPaperYear(a)) || Infinity;
    const yearB = Number(getPaperYear(b)) || Infinity;

    if (yearA !== yearB) return yearA - yearB;

    return getPaperTitle(a).localeCompare(
      getPaperTitle(b),
      undefined,
      { numeric: true, sensitivity: "base" }
    );
  }

  // Who requires whom, built once and shared by the sequencing and the
  // card summaries.
  //   requires: paperId -> ids of papers that must be read BEFORE it
  //   unlocks:  paperId -> ids of papers that need it (read AFTER it)
  //   details:  paperId -> raw prerequisite records pointing at it
  const relations = useMemo(() => {
    const validIds = new Set(papers.map((p) => String(p.id)));

    const requires = new Map();
    const unlocks = new Map();
    const details = new Map();

    papers.forEach((p) => {
      const id = String(p.id);
      requires.set(id, new Set());
      unlocks.set(id, new Set());
      details.set(id, []);
    });

    prerequisites.forEach((item) => {
      const source = getPaperId(getPrerequisiteSource(item));
      const target = getPaperId(getPrerequisiteTarget(item));

      if (source == null || target == null) return;

      const s = String(source);
      const t = String(target);

      if (s === t || !validIds.has(s) || !validIds.has(t)) return;

      requires.get(t).add(s);
      unlocks.get(s).add(t);
      details.get(t).push(item);
    });

    return { requires, unlocks, details };
  }, [papers, prerequisites]);

  // Prerequisite-based sequencing: papers with no prerequisites are
  // Sequence 1; every other paper is one sequence after its deepest
  // prerequisite. Unresolvable (circular) papers are flagged for review.
  const learningPath = useMemo(() => {
    if (!papers.length) return [];

    const required = relations.requires;
    const relationshipDetails = relations.details;

    const candidates = [...papers].sort(comparePapers);

    // paperId -> assigned sequence number
    const assigned = new Map();
    const result = [];

    while (assigned.size < papers.length) {
      // Papers whose prerequisites have all been assigned a sequence.
      const ready = candidates.filter((paper) => {
        const id = String(paper.id);

        if (assigned.has(id)) return false;

        return [...required.get(id)].every((prerequisiteId) =>
          assigned.has(prerequisiteId)
        );
      });

      // Nothing ready: the rest are circular / unresolved.
      if (!ready.length) {
        candidates
          .filter((paper) => !assigned.has(String(paper.id)))
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

      // Assign every sequence for this pass first, so papers that become
      // ready in the same pass never see each other's numbers.
      ready.forEach((paper) => {
        const id = String(paper.id);
        const prerequisiteIds = [...required.get(id)];

        const sequence =
          prerequisiteIds.length === 0
            ? 1
            : Math.max(
                ...prerequisiteIds.map((prerequisiteId) =>
                  assigned.get(prerequisiteId)
                )
              ) + 1;

        let reason;

        if (sequence === 1) {
          reason =
            "No prerequisite papers are recorded. You can start with this paper independently.";
        } else {
          const prerequisiteTitles = prerequisiteIds.map(
            (prerequisiteId) => getPaperTitle(prerequisiteId)
          );

          reason =
            `Read this after ${prerequisiteTitles.join(", ")}. ` +
            "It depends on knowledge introduced in those prerequisite papers.";

          const recordedReasons = (relationshipDetails.get(id) || [])
            .map((item) => item.reason)
            .filter(
              (value) =>
                typeof value === "string" && value.trim()
            );

          if (recordedReasons.length) {
            reason += ` Relationship explanation: ${recordedReasons.join("; ")}`;
          }
        }

        result.push({ paper, sequence, cycle: false, reason });
      });

      // Commit this pass's sequence numbers.
      result.forEach((step) => {
        if (step.sequence != null) {
          assigned.set(String(step.paper.id), step.sequence);
        }
      });
    }

    // Ascending sequence order; "needs review" papers last.
    return result.sort((a, b) => {
      if (a.sequence == null && b.sequence == null) {
        return comparePapers(a.paper, b.paper);
      }
      if (a.sequence == null) return 1;
      if (b.sequence == null) return -1;

      if (a.sequence !== b.sequence) {
        return a.sequence - b.sequence;
      }

      return comparePapers(a.paper, b.paper);
    });
  }, [papers, relations]);

  // Short summary for every card: role, what it covers, keywords.
  const summaries = useMemo(() => {
    const position = new Map(
      learningPath.map((step, index) => [String(step.paper.id), index])
    );

    const byPosition = (a, b) => position.get(a) - position.get(b);
    const result = new Map();

    learningPath.forEach(({ paper }) => {
      const id = String(paper.id);

      const prerequisiteIds = [...relations.requires.get(id)].sort(byPosition);
      const dependantIds = [...relations.unlocks.get(id)].sort(byPosition);

      const role = getRole(prerequisiteIds.length, dependantIds.length);

      const why = buildWhyText({
        role,
        prerequisiteTitles: prerequisiteIds.map((pid) => getPaperTitle(pid)),
        dependantTitles: dependantIds.map((pid) => getPaperTitle(pid)),
        totalPapers: papers.length,
      });

      // What the paper is about, from the AI analysis when it exists.
      const ai = paper.raw_ai_data || {};
      const deep = ai.deep_analysis || {};
      const keyPoints = Array.isArray(ai.key_points)
        ? ai.key_points.filter(isUsefulText)
        : [];

      const coversSource = [
        deep.problem,
        keyPoints[0],
        paper.ai_summary,
        paper.abstract,
      ].find(isUsefulText);

      const approachSource = isUsefulText(deep.method) ? deep.method : "";

      const keywords = extractKeywords(
        [
          { text: getPaperTitle(paper), weight: 3 },
          { text: deep.problem, weight: 2 },
          { text: deep.method, weight: 2 },
          { text: deep.novelty, weight: 2 },
          { text: deep.key_findings, weight: 1 },
          ...keyPoints.map((text) => ({ text, weight: 1 })),
          { text: paper.ai_summary, weight: 1 },
          { text: paper.abstract, weight: 1 },
        ],
        5
      );

      result.set(id, {
        role,
        why,
        covers: coversSource ? shortenText(coversSource, 170) : "",
        approach: approachSource ? shortenText(approachSource, 120) : "",
        keywords,
        prerequisiteCount: prerequisiteIds.length,
        dependantCount: dependantIds.length,
      });
    });

    return result;
  }, [learningPath, relations, papers]);

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
        const summary = summaries.get(String(step.paper.id));

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

            ${
              summary
                ? `
                  <p>
                    <strong>${escapeHtml(summary.role.label)}.</strong>
                    ${escapeHtml(summary.why)}
                  </p>
                  ${
                    summary.covers
                      ? `<p><strong>Covers:</strong> ${escapeHtml(summary.covers)}</p>`
                      : ""
                  }
                  ${
                    summary.approach
                      ? `<p><strong>Approach:</strong> ${escapeHtml(summary.approach)}</p>`
                      : ""
                  }
                  ${
                    summary.keywords.length
                      ? `<p><strong>Keywords:</strong> ${escapeHtml(summary.keywords.join(", "))}</p>`
                      : ""
                  }
                `
                : ""
            }
          </div>
        `;
      })
      .join("");

    const dependencies = prerequisites
      .map((item) => {
        const source = getPaperId(getPrerequisiteSource(item));
        const target = getPaperId(getPrerequisiteTarget(item));

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

            .item p {
              margin: 6px 0;
              line-height: 1.5;
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
                    const summary = summaries.get(String(paper.id));

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

                            <h3>{getPaperTitle(paper)}</h3>

                            <span className="learning-year">
                              {getPaperYear(paper)}
                            </span>

                            <p className="learning-reason">
                              <strong>Why this sequence?</strong>{" "}
                              {step.reason}
                            </p>

                            {summary && (
                              <div className="learning-summary">
                                <span
                                  className={`learning-role learning-role-${summary.role.key}`}
                                >
                                  {summary.role.label}
                                </span>

                                {summary.covers && (
                                  <div className="learning-summary-line">
                                    <strong>Covers:</strong>{" "}
                                    {summary.covers}
                                  </div>
                                )}

                                {summary.approach && (
                                  <div className="learning-summary-line">
                                    <strong>Approach:</strong>{" "}
                                    {summary.approach}
                                  </div>
                                )}

                                {summary.keywords.length > 0 && (
                                  <div className="learning-keywords">
                                    {summary.keywords.map(
                                      (keyword) => (
                                        <span
                                          className="learning-keyword"
                                          key={keyword}
                                        >
                                          {keyword}
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
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

                  if (source == null || target == null) {
                    return null;
                  }

                  return (
                    <div
                      className="dependency-item"
                      key={item.id || index}
                    >
                      <span>{getPaperTitle(source)}</span>

                      <b>→</b>

                      <span>{getPaperTitle(target)}</span>

                      {item.reason && <p>{item.reason}</p>}
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