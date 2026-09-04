// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { api } from "../api/client";
// import Reveal from "../components/Reveal";
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
//           <Reveal delay={0}>
//             <StatCard label="Research Sessions" value={totalSessions} color="var(--signal)" bg="var(--primary-light)" icon="📚" />
//           </Reveal>
//           <Reveal delay={0.08}>
//             <StatCard label="Total Papers" value={totalPapers} color="#1AA893" bg="#E3FBF8" icon="📄" />
//           </Reveal>
//           <Reveal delay={0.16}>
//             <StatCard label="Ready Sessions" value={readyCount} color="#A9631C" bg="#FDF0DE" icon="✅" />
//           </Reveal>
//         </div>

//         {/* Charts row */}
//         <div className="charts-grid" style={{ marginTop: 20 }}>
//           <Reveal delay={0.1}>
//             <div className="card hover-lift">
//               <h3 style={{ marginTop: 0 }}>Papers per Session</h3>
//               <BarChart
//                 data={research.map((r) => ({
//                   label: r.topic,
//                   value: r.papers?.length || 0,
//                 }))}
//               />
//             </div>
//           </Reveal>

//           <Reveal delay={0.18}>
//             <div className="card hover-lift">
//               <h3 style={{ marginTop: 0 }}>Status Breakdown</h3>
//               <DonutChart counts={statusCounts} total={totalSessions} />
//             </div>
//           </Reveal>
//         </div>

//         {/* Research session list */}
//         <Reveal delay={0.1}>
//           <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
//             <h2 style={{ margin: 0 }}>Your Research Sessions</h2>
//             <button className="btn btn-primary" onClick={() => navigate("/research/new")}>
//               + New Research
//             </button>
//           </div>
//         </Reveal>

//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
//           {research.length === 0 ? (
//             <EmptyState onCreate={() => navigate("/research/new")} />
//           ) : (
//             research.map((r, i) => (
//               <Reveal key={r.id} delay={Math.min(i * 0.05, 0.4)}>
//                 <ResearchCard research={r} onOpen={() => navigate(`/research/${r.id}`)} />
//               </Reveal>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function EmptyState({ onCreate }) {
//   return (
//     <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 50 }}>
//       <div style={{ fontSize: 34 }}>🗺️</div>
//       <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>No research sessions yet</p>
//       <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
//         Start your first one and get a reading path back in minutes.
//       </p>
//       <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={onCreate}>
//         + New Research
//       </button>
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
//     <div className="card hover-lift" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <div>
//         <div className="stat-label">{label}</div>
//         <motion.div
//           className="stat-value"
//           style={{ color }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.4 }}
//         >
//           {value}
//         </motion.div>
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
//           <motion.div
//             initial={{ height: 0 }}
//             animate={{ height: `${(d.value / max) * 130 || 4}px` }}
//             transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
//             style={{
//               width: 40,
//               background: barColors[i % barColors.length],
//               borderRadius: "8px 8px 0 0",
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
//             <motion.circle
//               key={status}
//               cx="75"
//               cy="75"
//               r={radius}
//               fill="none"
//               stroke={STATUS_COLORS[status]}
//               strokeWidth="18"
//               initial={{ strokeDasharray: `0 ${circumference}` }}
//               animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
//               transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
//     <div className="card hover-lift" onClick={onOpen} style={{ cursor: "pointer" }}>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import Reveal from "../components/Reveal";
import "../styles/theme.css";

const STATUS_COLORS = {
  pending: "#E8963D",
  analyzing: "#3E6FF2",
  ready: "#2ED9C3",
  failed: "#FF6B6B",
};

function Home() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listResearch()
      .then((data) => {
        setResearch(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 60 }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 60 }}>Error: {error}</div>;

  const totalSessions = research.length;
  const totalPapers = research.reduce((sum, r) => sum + (r.papers?.length || 0), 0);
  const readyCount = research.filter((r) => r.status === "ready").length;
  const statusCounts = research.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ paddingBottom: 60 }}>
      <DashboardHeader />

      <div className="container" style={{ marginTop: 28 }}>
        {/* Top stat cards */}
        <div className="grid-3">
          <Reveal delay={0}>
            <StatCard label="Research Sessions" value={totalSessions} color="var(--signal)" bg="var(--primary-light)" icon="📚" />
          </Reveal>
          <Reveal delay={0.08}>
            <StatCard label="Total Papers" value={totalPapers} color="#1AA893" bg="#E3FBF8" icon="📄" />
          </Reveal>
          <Reveal delay={0.16}>
            <StatCard label="Ready Sessions" value={readyCount} color="#A9631C" bg="#FDF0DE" icon="✅" />
          </Reveal>
        </div>

        {/* Charts row */}
        <div className="charts-grid" style={{ marginTop: 20 }}>
          <Reveal delay={0.1}>
            <div className="card hover-lift">
              <h3 style={{ marginTop: 0 }}>Papers per Session</h3>
              <BarChart
                data={research.map((r) => ({
                  label: r.topic,
                  value: r.papers?.length || 0,
                }))}
              />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="card hover-lift">
              <h3 style={{ marginTop: 0 }}>Status Breakdown</h3>
              <DonutChart counts={statusCounts} total={totalSessions} />
            </div>
          </Reveal>
        </div>

        {/* Research session list */}
        <Reveal delay={0.1}>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Your Research Sessions</h2>
            <button className="btn btn-primary" onClick={() => navigate("/research/new")}>
              + New Research
            </button>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginTop: 20 }}>
          {research.length === 0 ? (
            <EmptyState onCreate={() => navigate("/research/new")} />
          ) : (
            research.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i * 0.05, 0.4)}>
                <ResearchCard research={r} onOpen={() => navigate(`/research/${r.id}`)} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 50 }}>
      <div style={{ fontSize: 34 }}>🗺️</div>
      <p style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>No research sessions yet</p>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
        Start your first one and get a reading path back in minutes.
      </p>
      <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={onCreate}>
        + New Research
      </button>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="pill-nav">
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--signal)" }}>
          IntelliResearch Dashboard
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: 20 }}>
          <span>🔍</span>
          <span>⚙️</span>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--signal)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            U
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="card hover-lift" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div className="stat-label">{label}</div>
        <motion.div
          className="stat-value"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {value}
        </motion.div>
      </div>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  if (data.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColors = ["#3E6FF2", "#2ED9C3", "#E8963D", "#FF6B6B", "#7C93F0"];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 180, padding: "10px 4px", overflowX: "auto" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto", minWidth: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: "var(--font-mono)" }}>{d.value}</div>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 130 || 4}px` }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 40,
              background: barColors[i % barColors.length],
              borderRadius: "8px 8px 0 0",
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 8,
              textAlign: "center",
              maxWidth: 70,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={d.label}
          >
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ counts, total }) {
  if (total === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet.</p>;
  }

  const statuses = ["ready", "analyzing", "pending", "failed"];
  let cumulative = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ flexShrink: 0 }}>
        <circle cx="75" cy="75" r={radius} fill="none" stroke="#EFEADA" strokeWidth="18" />
        {statuses.map((status) => {
          const count = counts[status] || 0;
          if (count === 0) return null;
          const fraction = count / total;
          const dash = fraction * circumference;
          const offset = cumulative * circumference;
          cumulative += fraction;
          return (
            <motion.circle
              key={status}
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={STATUS_COLORS[status]}
              strokeWidth="18"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              strokeDashoffset={-offset}
              transform="rotate(-90 75 75)"
              strokeLinecap="round"
            />
          );
        })}
        <text x="75" y="80" textAnchor="middle" fontSize="24" fontWeight="700" fontFamily="'Fraunces', serif" fill="var(--text-dark)">
          {total}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {statuses.map((status) =>
          counts[status] ? (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[status] }} />
              <span style={{ textTransform: "capitalize" }}>{status}</span>
              <span style={{ color: "var(--text-muted)" }}>({counts[status]})</span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function ResearchCard({ research, onOpen }) {
  const badgeClass =
    research.status === "ready"
      ? "badge-teal"
      : research.status === "failed"
      ? "badge-coral"
      : research.status === "analyzing"
      ? "badge-purple"
      : "badge-yellow";

  return (
    <div className="card hover-lift" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17 }}>{research.topic}</h3>
        <span className={`badge ${badgeClass}`}>{research.status}</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 10 }}>
        {research.papers?.length || 0} paper(s)
      </p>
      <p style={{ color: "var(--signal)", fontSize: 13, marginTop: 14, fontWeight: 600 }}>Open →</p>
    </div>
  );
}

export default Home;