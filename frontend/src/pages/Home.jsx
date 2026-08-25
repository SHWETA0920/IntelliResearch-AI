// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/client";
// import "../styles/theme.css";

// const STATUS_COLORS = {
//   pending: "#E8963D",
//   analyzing: "#3E6FF2",
//   ready: "#2ED9C3",
//   failed: "#FF6B6B",
// };

// function Home() {
//   const [research, setResearch] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     api
//       .listResearch()
//       .then((data) => {
//         setResearch(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div style={{ padding: 60 }}>Loading dashboard...</div>;
//   if (error) return <div style={{ padding: 60 }}>Error: {error}</div>;

//   const totalSessions = research.length;
//   const totalPapers = research.reduce((sum, r) => sum + (r.papers?.length || 0), 0);
//   const readyCount = research.filter((r) => r.status === "ready").length;
//   const statusCounts = research.reduce((acc, r) => {
//     acc[r.status] = (acc[r.status] || 0) + 1;
//     return acc;
//   }, {});

//   return (
//     <div style={{ paddingBottom: 60 }}>
//       <DashboardHeader />

//       <div className="container" style={{ marginTop: 28 }}>
//         {/* Top stat cards */}
//         <div className="grid-3">
//           <StatCard label="Research Sessions" value={totalSessions} color="var(--signal)" bg="var(--primary-light)" icon="📚" />
//           <StatCard label="Total Papers" value={totalPapers} color="#1AA893" bg="#E3FBF8" icon="📄" />
//           <StatCard label="Ready Sessions" value={readyCount} color="#A9631C" bg="#FDF0DE" icon="✅" />
//         </div>

//         {/* Charts row */}
//         <div className="charts-grid" style={{ marginTop: 20 }}>
//           <div className="card">
//             <h3 style={{ marginTop: 0 }}>Papers per Session</h3>
//             <BarChart
//               data={research.map((r) => ({
//                 label: r.topic,
//                 value: r.papers?.length || 0,
//               }))}
//             />
//           </div>

//           <div className="card">
//             <h3 style={{ marginTop: 0 }}>Status Breakdown</h3>
//             <DonutChart counts={statusCounts} total={totalSessions} />
//           </div>
//         </div>

//         {/* Research session list */}
//         <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
//           <h2 style={{ margin: 0 }}>Your Research Sessions</h2>
//           <button className="btn btn-primary" onClick={() => navigate("/research/new")}>
//             + New Research
//           </button>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
//           {research.length === 0 ? (
//             <p style={{ color: "var(--text-muted)" }}>No research sessions yet — start your first one.</p>
//           ) : (
//             research.map((r) => <ResearchCard key={r.id} research={r} onOpen={() => navigate(`/research/${r.id}`)} />)
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function DashboardHeader() {
//   return (
//     <div className="container" style={{ paddingTop: 24 }}>
//       <div className="pill-nav">
//         <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--signal)" }}>
//           IntelliResearch Dashboard
//         </span>
//         <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: 20 }}>
//           <span>🔍</span>
//           <span>⚙️</span>
//           <div
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: "50%",
//               background: "var(--signal)",
//               color: "white",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 14,
//               fontWeight: 700,
//               fontFamily: "var(--font-mono)",
//             }}
//           >
//             U
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, color, bg, icon }) {
//   return (
//     <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <div>
//         <div className="stat-label">{label}</div>
//         <div className="stat-value" style={{ color }}>{value}</div>
//       </div>
//       <div
//         style={{
//           width: 52,
//           height: 52,
//           borderRadius: 14,
//           background: bg,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 22,
//           flexShrink: 0,
//         }}
//       >
//         {icon}
//       </div>
//     </div>
//   );
// }

// function BarChart({ data }) {
//   if (data.length === 0) {
//     return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
//   }
//   const max = Math.max(...data.map((d) => d.value), 1);
//   const barColors = ["#3E6FF2", "#2ED9C3", "#E8963D", "#FF6B6B", "#7C93F0"];

//   return (
//     <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, padding: "10px 4px", overflowX: "auto" }}>
//       {data.map((d, i) => (
//         <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto", minWidth: 56 }}>
//           <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-mono)" }}>{d.value}</div>
//           <div
//             style={{
//               width: 40,
//               height: `${(d.value / max) * 130 || 4}px`,
//               background: barColors[i % barColors.length],
//               borderRadius: "8px 8px 0 0",
//               transition: "height 0.3s ease",
//             }}
//           />
//           <div
//             style={{
//               fontSize: 11,
//               color: "var(--text-muted)",
//               marginTop: 8,
//               textAlign: "center",
//               maxWidth: 70,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//             }}
//             title={d.label}
//           >
//             {d.label}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function DonutChart({ counts, total }) {
//   if (total === 0) {
//     return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
//   }

//   const statuses = ["ready", "analyzing", "pending", "failed"];
//   let cumulative = 0;
//   const radius = 60;
//   const circumference = 2 * Math.PI * radius;

//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
//       <svg width="150" height="150" viewBox="0 0 150 150" style={{ flexShrink: 0 }}>
//         <circle cx="75" cy="75" r={radius} fill="none" stroke="#EFEADA" strokeWidth="18" />
//         {statuses.map((status) => {
//           const count = counts[status] || 0;
//           if (count === 0) return null;
//           const fraction = count / total;
//           const dash = fraction * circumference;
//           const offset = cumulative * circumference;
//           cumulative += fraction;
//           return (
//             <circle
//               key={status}
//               cx="75"
//               cy="75"
//               r={radius}
//               fill="none"
//               stroke={STATUS_COLORS[status]}
//               strokeWidth="18"
//               strokeDasharray={`${dash} ${circumference - dash}`}
//               strokeDashoffset={-offset}
//               transform="rotate(-90 75 75)"
//               strokeLinecap="round"
//             />
//           );
//         })}
//         <text x="75" y="80" textAnchor="middle" fontSize="24" fontWeight="700" fontFamily="'Fraunces', serif" fill="var(--text-dark)">
//           {total}
//         </text>
//       </svg>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {statuses.map((status) =>
//           counts[status] ? (
//             <div key={status} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
//               <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[status] }} />
//               <span style={{ textTransform: "capitalize" }}>{status}</span>
//               <span style={{ color: "var(--text-muted)" }}>({counts[status]})</span>
//             </div>
//           ) : null
//         )}
//       </div>
//     </div>
//   );
// }

// function ResearchCard({ research, onOpen }) {
//   const badgeClass =
//     research.status === "ready"
//       ? "badge-teal"
//       : research.status === "failed"
//       ? "badge-coral"
//       : research.status === "analyzing"
//       ? "badge-purple"
//       : "badge-yellow";

//   return (
//     <div className="card" onClick={onOpen} style={{ cursor: "pointer" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
//         <h3 style={{ margin: 0, fontSize: 17 }}>{research.topic}</h3>
//         <span className={`badge ${badgeClass}`}>{research.status}</span>
//       </div>
//       <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 10 }}>
//         {research.papers?.length || 0} paper(s)
//       </p>
//       <p style={{ color: "var(--signal)", fontSize: 13, marginTop: 14, fontWeight: 600 }}>Open →</p>
//     </div>
//   );
// }

// export default Home;

import { useState } from "react";
import "../styles/theme.css";

function Home() {
  const [activeTab, setActiveTab] = useState("learning");

  const tabs = [
    {
      id: "learning",
      label: "LEARNING PATH",
      icon: "♧",
    },
    {
      id: "citations",
      label: "CITATIONS",
      icon: "♧",
    },
    {
      id: "analysis",
      label: "PAPER ANALYSIS",
      icon: "▤",
    },
    {
      id: "assistant",
      label: "AI ASSISTANT",
      icon: "♙",
    },
  ];

  function downloadPDF(sectionName) {
    alert(
      `PDF export for ${sectionName} is ready. Use the browser print dialog and choose "Save as PDF".`
    );
    window.print();
  }

  return (
    <div className="research-dashboard">

      {/* ================= SIDEBAR ================= */}
      <aside className="research-sidebar">

        <div className="sidebar-logo">
          <div className="logo-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="logo-text">
            Intelli<span>Research</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button className="sidebar-item active">
            <span className="sidebar-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">⊞</span>
            <span>Research Hub</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">⊕</span>
            <span>New Research</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">♧</span>
            <span>My Sessions</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">⌂</span>
            <span>Learning Path</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">♧</span>
            <span>Citations</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">▤</span>
            <span>Paper Analysis</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">♙</span>
            <span>AI Assistant</span>
          </button>

          <div className="sidebar-divider"></div>

          <button className="sidebar-item">
            <span className="sidebar-icon">⚙</span>
            <span>Settings</span>
          </button>

          <button className="sidebar-item">
            <span className="sidebar-icon">♙</span>
            <span>Profile</span>
          </button>

        </nav>

        {/* Books on the left */}
        <div className="sidebar-books">
          <div className="book book-1"></div>
          <div className="book book-2"></div>
          <div className="book book-3"></div>
          <div className="book book-4"></div>
          <div className="book book-5"></div>
          <div className="book book-6"></div>
        </div>

        <div className="sidebar-quote">
          <div className="quote-mark">“</div>

          <p>
            Research is to see what everybody else has seen,
            and to think what nobody else has thought.
          </p>

          <span>— Albert Szent-Györgyi</span>
        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}
      <main className="research-main">

        {/* HERO */}
        <section className="research-hero">

          <div className="hero-topbar">
            <button className="menu-button">☰</button>

            <button className="logout-button">
              ⇥ &nbsp; Logout
            </button>
          </div>

          <div className="hero-content">
            <h1>Welcome back!</h1>
            <p>Your research workspace</p>
          </div>

          <div className="hero-books">
            <div className="hero-book-open">
              <div className="page left-page"></div>
              <div className="page right-page"></div>
            </div>

            <div className="hero-laptop">
              <div className="laptop-screen">
                <div className="chart-line"></div>
                <div className="chart-line second"></div>
                <div className="chart-line third"></div>
              </div>

              <div className="laptop-base"></div>
            </div>
          </div>

        </section>

        {/* ================= STAT CARDS ================= */}
        <section className="stats-grid">

          <StatCard
            icon="▥"
            title="TOTAL PAPERS"
            value="24"
            description="Across all sessions"
          />

          <StatCard
            icon="▤"
            title="CONCEPTS IDENTIFIED"
            value="136"
            description="From your papers"
          />

          <StatCard
            icon="↗"
            title="READING PROGRESS"
            value="68%"
            description="Overall completion"
          />

        </section>

        {/* ================= TABS ================= */}
        <section className="research-tabs">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`research-tab ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

        </section>

        {/* ================= TAB CONTENT ================= */}

        {activeTab === "learning" && (
          <LearningPath
            onDownload={() => downloadPDF("Learning Path")}
          />
        )}

        {activeTab === "citations" && (
          <Citations
            onDownload={() => downloadPDF("Citations")}
          />
        )}

        {activeTab === "analysis" && (
          <PaperAnalysis
            onDownload={() => downloadPDF("Paper Analysis")}
          />
        )}

        {activeTab === "assistant" && (
          <AIAssistant />
        )}

        {/* ================= AI ASSISTANT ================= */}
        {activeTab !== "assistant" && <AssistantSection />}

      </main>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon, title, value, description }) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <div className="stat-title">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-description">
          {description}
        </div>
      </div>

    </div>
  );
}


/* =========================================================
   LEARNING PATH
========================================================= */

function LearningPath({ onDownload }) {
  const papers = [
    {
      number: 1,
      name: "Paper 7",
      title: "Foundations of Machine Learning",
      year: "2016",
      tag: "Prerequisite",
      type: "green",
    },
    {
      number: 2,
      name: "Paper 12",
      title: "Deep Learning Basics",
      year: "2017",
      tag: "Prerequisite",
      type: "green",
    },
    {
      number: 3,
      name: "Paper 3",
      title: "Neural Networks and Backpropagation",
      year: "2018",
      tag: "Recommended Next",
      type: "orange",
      active: true,
    },
    {
      number: 4,
      name: "Paper 15",
      title: "Convolutional Neural Networks",
      year: "2019",
      tag: "After Paper 3",
      type: "blue",
    },
    {
      number: 5,
      name: "Paper 21",
      title: "Transformers Explained",
      year: "2020",
      tag: "After Paper 15",
      type: "blue",
    },
  ];

  return (
    <section className="content-card">

      <div className="section-heading">

        <div>
          <h2>Learning Path</h2>
          <p>
            AI recommended order to read your papers based on
            concept dependencies.
          </p>
        </div>

        <button
          className="download-button"
          onClick={onDownload}
        >
          ⇩ &nbsp; Download PDF
        </button>

      </div>

      <div className="paper-path">

        {papers.map((paper, index) => (
          <div
            className={`paper-node ${
              paper.active ? "selected" : ""
            }`}
            key={paper.number}
          >

            <div className="paper-number">
              {paper.number}
            </div>

            <div className="paper-card">

              <h3>{paper.name}</h3>

              <strong>
                {paper.title}
              </strong>

              <p className="paper-year">
                {paper.year}
              </p>

              <span className={`paper-tag ${paper.type}`}>
                {paper.tag}
              </span>

            </div>

            {index < papers.length - 1 && (
              <div className="path-arrow">
                →
              </div>
            )}

          </div>
        ))}

      </div>

      {/* Dependency graph */}
      <div className="dependency-box">

        <h3>
          Concept Dependency Graph
        </h3>

        <div className="dependency-graph">

          <div className="concept concept-top-left">
            Linear Algebra
          </div>

          <div className="concept concept-top-right">
            Probability
          </div>

          <div className="concept concept-left">
            Optimization
          </div>

          <div className="concept concept-center">
            Neural Networks
          </div>

          <div className="concept concept-right">
            Deep Learning
          </div>

          <div className="concept concept-bottom-left">
            Backpropagation
          </div>

          <div className="concept concept-bottom-center">
            CNN
          </div>

          <div className="concept concept-bottom-right">
            Transformers
          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   CITATIONS
========================================================= */

function Citations({ onDownload }) {
  const citations = [
    [
      1,
      "Deep Learning Approaches",
      "A Theoretical Framework for Deep Learning",
      "2018",
      "24",
    ],
    [
      2,
      "Advanced Neural Architectures",
      "Deep Learning Basics",
      "2017",
      "18",
    ],
    [
      3,
      "Transfer Learning in Practice",
      "Convolutional Neural Networks",
      "2016",
      "16",
    ],
    [
      4,
      "Attention Mechanisms",
      "Neural Networks and Backpropagation",
      "2018",
      "14",
    ],
    [
      5,
      "BERT and Beyond",
      "Transformers Explained",
      "2020",
      "12",
    ],
  ];

  return (
    <section className="content-card">

      <div className="section-heading">

        <div>
          <h2>Top Citations in Your Research</h2>
          <p>
            Papers with the strongest citation relationships.
          </p>
        </div>

        <button
          className="download-button"
          onClick={onDownload}
        >
          ⇩ &nbsp; Download PDF
        </button>

      </div>

      <div className="citation-table-wrapper">

        <table className="citation-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Citing Paper</th>
              <th>Cited Paper</th>
              <th>Year</th>
              <th>Citations</th>
            </tr>
          </thead>

          <tbody>

            {citations.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td className="citation-count">
                  {row[4]}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

      <button className="view-all-button">
        View All Citations →
      </button>

    </section>
  );
}


/* =========================================================
   PAPER ANALYSIS
========================================================= */

function PaperAnalysis({ onDownload }) {
  const papers = [
    {
      name: "Paper 7",
      title: "Foundations of Machine Learning",
      year: "2016",
      summary:
        "Introduces fundamental machine learning concepts and establishes the mathematical foundation for later research.",
    },
    {
      name: "Paper 12",
      title: "Deep Learning Basics",
      year: "2017",
      summary:
        "Explores neural network architectures and the foundations of modern deep learning systems.",
    },
    {
      name: "Paper 3",
      title: "Neural Networks and Backpropagation",
      year: "2018",
      summary:
        "Explains neural network training and the role of backpropagation in learning complex representations.",
    },
  ];

  return (
    <section className="content-card">

      <div className="section-heading">

        <div>
          <h2>Paper Analysis</h2>
          <p>
            AI-generated analysis of the papers in this research.
          </p>
        </div>

        <button
          className="download-button"
          onClick={onDownload}
        >
          ⇩ &nbsp; Download PDF
        </button>

      </div>

      <div className="analysis-list">

        {papers.map((paper) => (
          <article
            className="analysis-card"
            key={paper.name}
          >

            <div className="analysis-number">
              {paper.name.replace("Paper ", "")}
            </div>

            <div>
              <h3>{paper.title}</h3>

              <span className="analysis-year">
                Published {paper.year}
              </span>

              <p>
                {paper.summary}
              </p>
            </div>

          </article>
        ))}

      </div>

    </section>
  );
}


/* =========================================================
   AI ASSISTANT
========================================================= */

function AssistantSection() {
  return (
    <section className="assistant-card">

      <div className="assistant-content">

        <div className="assistant-title">
          <span className="assistant-icon">
            ♙
          </span>

          <h2>AI Research Assistant</h2>
        </div>

        <select className="assistant-input">
          <option>groq</option>
          <option>OpenAI</option>
          <option>Local Model</option>
        </select>

        <input
          className="assistant-input"
          placeholder="Ask anything about your research... (e.g. Which paper introduces Transformers?)"
        />

        <div className="assistant-row">

          <input
            className="assistant-input"
            placeholder="Enter API key"
            type="password"
          />

        </div>

        <div className="assistant-row">

          <select className="assistant-input">
            <option>
              https://api.groq.com/openai/v1
            </option>
          </select>

          <select className="assistant-input">
            <option>
              llama-3.3-70b-versatile
            </option>
          </select>

        </div>

        <button className="assistant-button">
          ✨ &nbsp; Generate AI Insights
        </button>

      </div>

      <div className="assistant-visual">

        <div className="speech-bubble bubble-one">
          —
          <br />
          —
        </div>

        <div className="speech-bubble bubble-two">
          —
          <br />
          —
        </div>

        <div className="assistant-laptop">

          <div className="assistant-screen">
            <div className="robot-face">
              ♙
            </div>
          </div>

          <div className="assistant-laptop-base"></div>

        </div>

        <div className="mini-book">
          <div></div>
          <div></div>
          <div></div>
        </div>

      </div>

    </section>
  );
}


/* =========================================================
   AI ASSISTANT TAB
========================================================= */

function AIAssistant() {
  return (
    <section className="assistant-full-card">

      <div className="assistant-full-header">
        <div>
          <h2>AI Research Assistant</h2>
          <p>
            Ask questions about your papers and research.
          </p>
        </div>
      </div>

      <select className="assistant-input">
        <option>groq</option>
        <option>OpenAI</option>
        <option>Local Model</option>
      </select>

      <input
        className="assistant-input"
        placeholder="Ask anything about your research..."
      />

      <input
        className="assistant-input"
        placeholder="Enter API key"
        type="password"
      />

      <div className="assistant-row">

        <select className="assistant-input">
          <option>
            https://api.groq.com/openai/v1
          </option>
        </select>

        <select className="assistant-input">
          <option>
            llama-3.3-70b-versatile
          </option>
        </select>

      </div>

      <button className="assistant-button">
        ✨ &nbsp; Generate AI Insights
      </button>

    </section>
  );
}

export default Home;