import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { api } from "../api/client";
import "../styles/theme.css";

const STATUS_BADGE = {
  pending: "badge-yellow",
  analyzing: "badge-purple",
  ready: "badge-teal",
  failed: "badge-coral",
};

function ResearchWorkspace() {
  const { id } = useParams();

  const [research, setResearch] = useState(null);
  const [prerequisites, setPrerequisites] = useState([]);
  const [citations, setCitations] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [paperConcepts, setPaperConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("path");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const pollRef = useRef(null);

  const fetchAll = useCallback(() => {
    Promise.all([
      api.getResearch(id),
      api.listPrerequisites(id),
      api.listCitations(id),
      api.listConcepts(id),
      api.listPaperConcepts(id),
    ])
      .then(([researchData, prereqData, citationData, conceptData, paperConceptData]) => {
        setResearch(researchData);
        setPrerequisites(prereqData);
        setCitations(citationData);
        setConcepts(conceptData);
        setPaperConcepts(paperConceptData);
        setLoading(false);
        if (researchData.status === "ready" || researchData.status === "failed") {
          clearInterval(pollRef.current);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        clearInterval(pollRef.current);
      });
  }, [id]);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  if (loading) return <div style={{ padding: 60 }}>Loading research session...</div>;
  if (error) return <div style={{ padding: 60 }}>Error: {error}</div>;
  if (!research) return <div style={{ padding: 60 }}>Not found.</div>;

  const isAnalyzing = research.status === "pending" || research.status === "analyzing";

  const TABS = [
    { key: "path", label: "Learning Path" },
    { key: "knowledge", label: "Knowledge Graph" },
    { key: "citations", label: "Citation Graph" },
    { key: "papers", label: "Papers" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="pill-nav">
          <Link to="/dashboard" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--signal)" }}>
            ← Dashboard
          </Link>
          <Link to={`/research/${id}/papers`} className="nav-link" style={{ fontWeight: 600, color: "var(--signal)" }}>
            Open Paper Explorer →
          </Link>
        </div>
      </div>

      <div className="container" style={{ marginTop: 30 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 30, margin: 0 }}>{research.topic}</h1>
              <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
                {research.papers.length} paper(s)
              </p>
            </div>
            <span className={`badge ${STATUS_BADGE[research.status]}`} style={{ fontSize: 13, padding: "6px 16px" }}>
              {research.status}
            </span>
          </div>
        </div>

        {isAnalyzing && (
          <div className="card" style={{ marginTop: 20, borderLeft: "4px solid var(--signal)" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {research.status === "pending" ? "⏳ Queued for analysis..." : "🔄 Analyzing your research... this can take a minute."}
            </p>
          </div>
        )}

        {research.status === "failed" && (
          <div className="card" style={{ marginTop: 20, borderLeft: "4px solid var(--coral)" }}>
            <p style={{ margin: 0, color: "#E14B4B", fontWeight: 600 }}>Analysis failed. Please try again.</p>
          </div>
        )}

        {research.status === "ready" && (
          <>
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={activeTab === t.key ? "btn btn-primary" : "btn btn-outline"}
                  style={{ padding: "10px 20px", fontSize: 14 }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="workspace-layout" style={{ marginTop: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {activeTab === "path" && (
                    <LearningPathGraph
                      papers={research.papers}
                      prerequisites={prerequisites}
                      onNodeClick={(paperId) => setSelectedPaper(paperId)}
                    />
                  )}
                  {activeTab === "knowledge" && (
                    <KnowledgeGraph
                      papers={research.papers}
                      concepts={concepts}
                      paperConcepts={paperConcepts}
                      onPaperClick={(paperId) => setSelectedPaper(paperId)}
                    />
                  )}
                  {activeTab === "citations" && (
                    <CitationGraph
                      papers={research.papers}
                      citations={citations}
                      onNodeClick={(paperId) => setSelectedPaper(paperId)}
                    />
                  )}
                  {activeTab === "papers" && (
                    <div style={{ padding: 24 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                        {research.papers.map((paper) => (
                          <div
                            key={paper.id}
                            onClick={() => setSelectedPaper(paper.id)}
                            style={{
                              padding: 16,
                              borderRadius: 12,
                              border: "1px solid var(--border)",
                              cursor: "pointer",
                              background: "var(--primary-light)",
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                              📄 {paper.title || paper.file.split("/").pop()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedPaper && (
                <PaperDrawer
                  paperId={selectedPaper}
                  papers={research.papers}
                  prerequisites={prerequisites}
                  citations={citations}
                  onClose={() => setSelectedPaper(null)}
                />
              )}
            </div>
          </>
        )}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

const nodeStyle = {
  background: "white",
  color: "var(--text-dark)",
  border: "1.5px solid var(--signal)",
  borderRadius: 12,
  padding: 12,
  width: 190,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  boxShadow: "0 4px 10px rgba(62,111,242,0.14)",
};

function LearningPathGraph({ papers, prerequisites, onNodeClick }) {
  if (papers.length === 0) return <p style={{ padding: 24 }}>No papers to show.</p>;

  const nodes = papers.map((paper, i) => ({
    id: String(paper.id),
    position: { x: i * 240, y: 100 },
    data: { label: `📄 ${paper.title || paper.file.split("/").pop()}` },
    style: nodeStyle,
  }));

  // Ember, deliberately matching the hero's "reading path" color - the
  // Learning Path tab is the same concept the landing page introduces.
  const edges = prerequisites.map((p) => ({
    id: `e${p.id}`,
    source: String(p.prerequisite_paper),
    target: String(p.paper),
    markerEnd: { type: MarkerType.ArrowClosed, color: "#E8963D" },
    style: { stroke: "#E8963D", strokeWidth: 2.5 },
  }));

  return (
    <div style={{ height: 420 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(event, node) => onNodeClick(node.id)}>
        <Background color="#E4DFD1" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function CitationGraph({ papers, citations, onNodeClick }) {
  if (papers.length === 0) return <p style={{ padding: 24 }}>No papers to show.</p>;

  const nodes = papers.map((paper, i) => ({
    id: String(paper.id),
    position: { x: i * 240, y: 100 },
    data: { label: `📄 ${paper.title || paper.file.split("/").pop()}` },
    style: nodeStyle,
  }));

  const edges = citations.map((c) => ({
    id: `c${c.id}`,
    source: String(c.citing_paper),
    target: String(c.cited_paper),
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3E6FF2" },
    style: { stroke: "#3E6FF2", strokeWidth: 2 },
    label: "cites",
    labelStyle: { fill: "#3E6FF2", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
  }));

  return (
    <div style={{ height: 420 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(event, node) => onNodeClick(node.id)}>
        <Background color="#E4DFD1" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function KnowledgeGraph({ papers, concepts, paperConcepts, onPaperClick }) {
  if (concepts.length === 0) {
    return <p style={{ padding: 24, color: "var(--text-muted)" }}>No concepts recorded yet.</p>;
  }

  const paperNodes = papers.map((paper, i) => ({
    id: `paper-${paper.id}`,
    position: { x: i * 240, y: 40 },
    data: { label: `📄 ${paper.title || paper.file.split("/").pop()}` },
    style: nodeStyle,
  }));

  const conceptNodes = concepts.map((concept, i) => ({
    id: `concept-${concept.id}`,
    position: { x: i * 240, y: 280 },
    data: { label: concept.name },
    style: {
      background: "#E8963D",
      color: "#3A2409",
      border: "none",
      borderRadius: "50%",
      padding: 10,
      width: 130,
      height: 130,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontWeight: 700,
      fontSize: 13,
      boxShadow: "0 4px 14px rgba(232,150,61,0.4)",
    },
  }));

  const edges = paperConcepts.map((pc) => {
    const isIntroduces = pc.role === "introduces";
    return {
      id: `pc${pc.id}`,
      source: isIntroduces ? `paper-${pc.paper}` : `concept-${pc.concept}`,
      target: isIntroduces ? `concept-${pc.concept}` : `paper-${pc.paper}`,
      markerEnd: { type: MarkerType.ArrowClosed, color: isIntroduces ? "#2ED9C3" : "#FF6B6B" },
      style: { stroke: isIntroduces ? "#2ED9C3" : "#FF6B6B", strokeWidth: 2 },
      label: isIntroduces ? "introduces" : "requires",
      labelStyle: { fontWeight: 700, fontSize: 12, fill: isIntroduces ? "#1AA893" : "#E14B4B", fontFamily: "'JetBrains Mono', monospace" },
    };
  });

  return (
    <div style={{ height: 460 }}>
      <ReactFlow
        nodes={[...paperNodes, ...conceptNodes]}
        edges={edges}
        fitView
        onNodeClick={(event, node) => {
          if (node.id.startsWith("paper-")) onPaperClick(node.id.replace("paper-", ""));
        }}
      >
        <Background color="#E4DFD1" gap={18} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function PaperDrawer({ paperId, papers, prerequisites, citations, onClose }) {
  const paper = papers.find((p) => String(p.id) === String(paperId));
  if (!paper) return null;

  const requires = prerequisites.filter((p) => String(p.paper) === String(paperId));
  const citesOut = citations.filter((c) => String(c.citing_paper) === String(paperId));
  const citedByIn = citations.filter((c) => String(c.cited_paper) === String(paperId));

  const findTitle = (pid) => {
    const p = papers.find((pp) => String(pp.id) === String(pid));
    return p ? (p.title || p.file.split("/").pop()) : `Paper #${pid}`;
  };

  return (
    <div className="card workspace-drawer" style={{ height: "fit-content" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{paper.title || paper.file.split("/").pop()}</h3>
        <span onClick={onClose} style={{ cursor: "pointer", fontSize: 20, color: "var(--text-muted)" }}>
          ×
        </span>
      </div>

      {paper.authors && (
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
          {paper.authors}
          {paper.year ? ` • ${paper.year}` : ""}
        </p>
      )}

      {paper.abstract && (
        <>
          <p style={sectionLabel}>Abstract</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{paper.abstract}</p>
        </>
      )}

      {paper.ai_summary && (
        <>
          <p style={sectionLabel}>AI Summary</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{paper.ai_summary}</p>
        </>
      )}

      <p style={sectionLabel}>Why this paper is here</p>
      {requires.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No prerequisites recorded.</p>
      ) : (
        requires.map((r) => (
          <div key={r.id} style={{ background: "#FDF0DE", borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 12 }}>
              Requires: <strong>{findTitle(r.prerequisite_paper)}</strong>
            </p>
            {r.reason && <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.85 }}>{r.reason}</p>}
            {r.confidence != null && (
              <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.75, fontFamily: "var(--font-mono)" }}>
                Confidence: {Math.round(r.confidence * 100)}%
              </p>
            )}
          </div>
        ))
      )}

      <p style={sectionLabel}>Citations</p>
      {citesOut.length === 0 && citedByIn.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No citation links recorded.</p>
      ) : (
        <>
          {citesOut.map((c) => (
            <p key={c.id} style={{ fontSize: 13 }}>
              Cites: <strong>{findTitle(c.cited_paper)}</strong>
            </p>
          ))}
          {citedByIn.map((c) => (
            <p key={c.id} style={{ fontSize: 13 }}>
              Cited by: <strong>{findTitle(c.citing_paper)}</strong>
            </p>
          ))}
        </>
      )}
    </div>
  );
}

const sectionLabel = {
  fontWeight: 700,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "var(--signal)",
  marginTop: 18,
  marginBottom: 6,
  fontFamily: "var(--font-mono)",
};

export default ResearchWorkspace;