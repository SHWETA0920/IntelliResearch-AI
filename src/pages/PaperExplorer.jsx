import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";

function PaperExplorer() {
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState(null);

  const fetchAll = useCallback(() => {
    Promise.all([api.getResearch(id), api.listPrerequisites(id), api.listCitations(id)])
      .then(([researchData, prereqData, citationData]) => {
        setResearch(researchData);
        setPrerequisites(prereqData);
        setCitations(citationData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <div style={{ padding: 60 }}>Loading papers...</div>;
  if (error) return <div style={{ padding: 60 }}>Error: {error}</div>;
  if (!research) return <div style={{ padding: 60 }}>Not found.</div>;

  const papers = research.papers.filter((p) => {
    const label = (p.title || p.file.split("/").pop()).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  const selectedPaper = research.papers.find((p) => String(p.id) === String(selectedPaperId));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="pill-nav">
          <Link to={`/research/${id}`} style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>
            ← Back to Workspace
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: 30 }}>
        <span className="badge badge-purple">{research.topic}</span>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>Research Papers</h1>

        <input
          type="text"
          placeholder="🔍 Search papers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px 16px",
            width: 320,
            marginTop: 16,
            marginBottom: 24,
            background: "white",
            border: "1px solid var(--border)",
            color: "var(--text-dark)",
            borderRadius: 999,
            fontSize: 14,
            outline: "none",
          }}
        />

        {selectedPaper ? (
          <PaperDetail
            paper={selectedPaper}
            papers={research.papers}
            prerequisites={prerequisites}
            citations={citations}
            onBack={() => setSelectedPaperId(null)}
          />
        ) : (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {papers.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No papers match your search.</p>
            ) : (
              papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} onOpen={() => setSelectedPaperId(paper.id)} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PaperCard({ paper, onOpen }) {
  return (
    <div className="card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div style={{ fontSize: 26 }}>📄</div>
      <h3 style={{ margin: "10px 0 4px", fontSize: 16 }}>{paper.title || paper.file.split("/").pop()}</h3>
      {paper.authors && (
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {paper.authors}
          {paper.year ? ` • ${paper.year}` : ""}
        </p>
      )}
      {paper.abstract && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>
          {paper.abstract.length > 130 ? paper.abstract.slice(0, 130) + "…" : paper.abstract}
        </p>
      )}
      <p style={{ fontSize: 13, color: "var(--primary)", marginTop: 14, fontWeight: 700 }}>Open →</p>
    </div>
  );
}

function PaperDetail({ paper, papers, prerequisites, citations, onBack }) {
  const requires = prerequisites.filter((p) => String(p.paper) === String(paper.id));
  const citesOut = citations.filter((c) => String(c.citing_paper) === String(paper.id));
  const citedByIn = citations.filter((c) => String(c.cited_paper) === String(paper.id));

  const findTitle = (pid) => {
    const p = papers.find((pp) => String(pp.id) === String(pid));
    return p ? (p.title || p.file.split("/").pop()) : `Paper #${pid}`;
  };

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: 20, padding: "8px 18px", fontSize: 13 }}>
        ← Back to list
      </button>

      <span className="badge badge-purple">Paper</span>
      <h2 style={{ marginTop: 12 }}>{paper.title || paper.file.split("/").pop()}</h2>
      {paper.authors && (
        <p style={{ color: "var(--text-muted)" }}>
          {paper.authors}
          {paper.year ? ` • ${paper.year}` : ""}
        </p>
      )}

      {paper.abstract && (
        <>
          <p style={sectionLabel}>Abstract</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{paper.abstract}</p>
        </>
      )}

      {paper.ai_summary && (
        <>
          <p style={sectionLabel}>AI Summary</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{paper.ai_summary}</p>
        </>
      )}

      <p style={sectionLabel}>Why am I reading this now?</p>
      {requires.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No prerequisites recorded.</p>
      ) : (
        requires.map((r) => (
          <div key={r.id} style={{ background: "var(--primary-light)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13 }}>
              Requires: <strong>{findTitle(r.prerequisite_paper)}</strong>
            </p>
            {r.reason && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{r.reason}</p>}
            {r.confidence != null && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                Confidence: {Math.round(r.confidence * 100)}%
              </p>
            )}
          </div>
        ))
      )}

      <p style={sectionLabel}>Citations</p>
      {citesOut.length === 0 && citedByIn.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No citation links recorded.</p>
      ) : (
        <>
          {citesOut.map((c) => (
            <p key={c.id} style={{ fontSize: 14 }}>
              Cites: <strong>{findTitle(c.cited_paper)}</strong>
            </p>
          ))}
          {citedByIn.map((c) => (
            <p key={c.id} style={{ fontSize: 14 }}>
              Cited by: <strong>{findTitle(c.citing_paper)}</strong>
            </p>
          ))}
        </>
      )}

      <a href={paper.file} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "inline-block", marginTop: 20 }}>
        Open PDF
      </a>
    </div>
  );
}

const sectionLabel = {
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "var(--primary)",
  marginTop: 20,
  marginBottom: 6,
};

export default PaperExplorer;