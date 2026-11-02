// import { useState } from "react";
// import Navbar from "../components/Navbar";
// import "../styles/theme.css";

// const FEATURES = [
//   {
//     key: "setup",
//     badge: "badge-purple",
//     title: "Research Setup",
//     short: "Give a topic, upload your PDFs.",
//     detail: "Start every session by naming what you want to learn and dropping in your papers. That's all the input the system needs.",
//     Visual: SetupVisual,
//   },
//   {
//     key: "path",
//     badge: "badge-yellow",
//     title: "Learning Path",
//     short: "AI orders your papers by what depends on what.",
//     detail: "Instead of just listing papers, the system finds real prerequisite relationships and arranges a reading order that actually builds understanding.",
//     Visual: PathVisual,
//   },
//   {
//     key: "knowledge",
//     badge: "badge-yellow",
//     title: "Knowledge Graph",
//     short: "See which papers introduce or require each concept.",
//     detail: "Concepts sit at the center — papers connect to them as either introducing new ideas or requiring background knowledge.",
//     Visual: KnowledgeVisual,
//   },
//   {
//     key: "citation",
//     badge: "badge-coral",
//     title: "Citation Graph",
//     short: "How your papers cite each other.",
//     detail: "A separate lineage view — citations are a supporting signal, not automatically the reading order, but useful context on research history.",
//     Visual: CitationVisual,
//   },
//   {
//     key: "explorer",
//     badge: "badge-purple",
//     title: "Paper Explorer",
//     short: "Browse, search, and read paper details.",
//     detail: "Every paper's abstract, AI summary, prerequisites, and citations in one searchable place — with a direct link to the original PDF.",
//     Visual: ExplorerVisual,
//   },
//   {
//     key: "assistant",
//     badge: "badge-teal",
//     title: "AI Assistant",
//     short: "Ask questions grounded in your own papers.",
//     detail: "\"Why should I read this before that?\" \"Can I skip this paper?\" — answered using your actual uploaded research, not generic knowledge.",
//     Visual: AssistantVisual,
//   },
// ];

// function About() {
//   const [hovered, setHovered] = useState(null);

//   return (
//     <div>
//       <Navbar />
//       <div className="container" style={{ marginTop: 60, maxWidth: 900 }}>
//         <span className="eyebrow">How it works</span>
//         <h1 style={{ fontSize: 38, marginTop: 14 }}>About IntelliResearch</h1>
//         <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7, marginTop: 12, maxWidth: 640 }}>
//           IntelliResearch doesn't just rank papers by difficulty — it discovers
//           prerequisite relationships between concepts and papers, then uses
//           that to build a meaningful reading order. Hover over a feature below
//           to see how it works.
//         </p>

//         <div className="grid-2" style={{ marginTop: 40 }}>
//           {FEATURES.map((f) => (
//             <FeatureCard
//               key={f.key}
//               feature={f}
//               isHovered={hovered === f.key}
//               onHover={() => setHovered(f.key)}
//               onLeave={() => setHovered(null)}
//             />
//           ))}
//         </div>
//       </div>
//       <div style={{ height: 60 }} />
//     </div>
//   );
// }

// function FeatureCard({ feature, isHovered, onHover, onLeave }) {
//   const { badge, title, short, detail, Visual } = feature;
//   return (
//     <div
//       className="card"
//       onMouseEnter={onHover}
//       onMouseLeave={onLeave}
//       style={{
//         cursor: "pointer",
//         transition: "transform 0.2s ease, box-shadow 0.2s ease",
//         transform: isHovered ? "translateY(-4px)" : "none",
//         boxShadow: isHovered ? "0 14px 30px rgba(62,111,242,0.16)" : "var(--shadow)",
//       }}
//     >
//       <span className={`badge ${badge}`}>{title}</span>
//       <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)" }}>
//         {isHovered ? detail : short}
//       </p>
//       <div style={{ marginTop: 16, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Visual active={isHovered} />
//       </div>
//     </div>
//   );
// }

// /* --- Mini SVG illustrations, recolored to the ink / signal / ember palette --- */

// function SetupVisual({ active }) {
//   return (
//     <svg width="140" height="70" viewBox="0 0 140 70">
//       <rect x="10" y="15" width="50" height="40" rx="8" fill={active ? "#E9EFFF" : "#F4F2FC"} stroke="#3E6FF2" strokeWidth="1.5" />
//       <text x="35" y="39" textAnchor="middle" fontSize="10" fill="#3E6FF2">Topic</text>
//       <rect x="80" y="15" width="50" height="40" rx="8" fill={active ? "#E3FBF8" : "#F4F2FC"} stroke="#2ED9C3" strokeWidth="1.5" />
//       <text x="105" y="39" textAnchor="middle" fontSize="10" fill="#1AA893">PDFs</text>
//       <line x1="60" y1="35" x2="80" y2="35" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow)" />
//       <defs>
//         <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
//           <path d="M0,0 L6,3 L0,6 Z" fill="#B7C3EA" />
//         </marker>
//       </defs>
//     </svg>
//   );
// }

// function PathVisual({ active }) {
//   const c = active ? ["#3E6FF2", "#E8963D", "#2ED9C3"] : ["#D9DEEF", "#D9DEEF", "#D9DEEF"];
//   return (
//     <svg width="140" height="60" viewBox="0 0 140 60">
//       {[15, 65, 115].map((x, i) => (
//         <circle key={x} cx={x} cy="30" r="14" fill={c[i]} />
//       ))}
//       <line x1="29" y1="30" x2="51" y2="30" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow2)" />
//       <line x1="79" y1="30" x2="101" y2="30" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow2)" />
//       <defs>
//         <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
//           <path d="M0,0 L6,3 L0,6 Z" fill="#B7C3EA" />
//         </marker>
//       </defs>
//     </svg>
//   );
// }

// function KnowledgeVisual({ active }) {
//   return (
//     <svg width="140" height="80" viewBox="0 0 140 80">
//       <rect x="10" y="10" width="45" height="26" rx="6" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
//       <rect x="85" y="10" width="45" height="26" rx="6" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
//       <circle cx="70" cy="60" r="16" fill={active ? "#3E6FF2" : "#D9DEEF"} />
//       <line x1="32" y1="36" x2="60" y2="50" stroke="#B7C3EA" strokeWidth="2" />
//       <line x1="107" y1="36" x2="80" y2="50" stroke="#B7C3EA" strokeWidth="2" />
//     </svg>
//   );
// }

// function CitationVisual({ active }) {
//   const stroke = active ? "#FF6B6B" : "#E9C6C6";
//   return (
//     <svg width="140" height="70" viewBox="0 0 140 70">
//       <circle cx="30" cy="20" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
//       <circle cx="110" cy="20" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
//       <circle cx="70" cy="55" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
//       <line x1="38" y1="28" x2="62" y2="48" stroke={stroke} strokeWidth="2" />
//       <line x1="102" y1="28" x2="78" y2="48" stroke={stroke} strokeWidth="2" />
//       <line x1="42" y1="20" x2="98" y2="20" stroke={stroke} strokeWidth="2" />
//     </svg>
//   );
// }

// function ExplorerVisual({ active }) {
//   return (
//     <svg width="140" height="70" viewBox="0 0 140 70">
//       {[0, 1, 2].map((i) => (
//         <rect
//           key={i}
//           x={15 + i * 40}
//           y={active ? 15 - i * 3 : 20}
//           width="30"
//           height="40"
//           rx="6"
//           fill={i === 1 ? "#E9EFFF" : "#F4F2FC"}
//           stroke="#3E6FF2"
//           strokeWidth="1.2"
//         />
//       ))}
//     </svg>
//   );
// }

// function AssistantVisual({ active }) {
//   return (
//     <svg width="140" height="70" viewBox="0 0 140 70">
//       <rect x="10" y="10" width="70" height="24" rx="12" fill={active ? "#E3FBF8" : "#F4F2FC"} stroke="#2ED9C3" strokeWidth="1.5" />
//       <rect x="55" y="40" width="75" height="24" rx="12" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
//     </svg>
//   );
// }

// export default About;

import { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

const FEATURES = [
  {
    key: "setup",
    badge: "badge-purple",
    title: "Research Setup",
    short: "Give a topic, upload your PDFs.",
    detail: "Start every session by naming what you want to learn and dropping in your papers. That's all the input the system needs.",
    Visual: SetupVisual,
  },
  {
    key: "path",
    badge: "badge-yellow",
    title: "Learning Path",
    short: "AI orders your papers by what depends on what.",
    detail: "Instead of just listing papers, the system finds real prerequisite relationships and arranges a reading order that actually builds understanding.",
    Visual: PathVisual,
  },
  {
    key: "knowledge",
    badge: "badge-yellow",
    title: "Knowledge Graph",
    short: "See which papers introduce or require each concept.",
    detail: "Concepts sit at the center — papers connect to them as either introducing new ideas or requiring background knowledge.",
    Visual: KnowledgeVisual,
  },
  {
    key: "citation",
    badge: "badge-coral",
    title: "Citation Graph",
    short: "How your papers cite each other.",
    detail: "A separate lineage view — citations are a supporting signal, not automatically the reading order, but useful context on research history.",
    Visual: CitationVisual,
  },
  {
    key: "explorer",
    badge: "badge-purple",
    title: "Paper Explorer",
    short: "Browse, search, and read paper details.",
    detail: "Every paper's abstract, AI summary, prerequisites, and citations in one searchable place — with a direct link to the original PDF.",
    Visual: ExplorerVisual,
  },
  {
    key: "assistant",
    badge: "badge-teal",
    title: "AI Assistant",
    short: "Ask questions grounded in your own papers.",
    detail: "\"Why should I read this before that?\" \"Can I skip this paper?\" — answered using your actual uploaded research, not generic knowledge.",
    Visual: AssistantVisual,
  },
];

function About() {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: 60, maxWidth: 900 }}>
        <span className="eyebrow">How it works</span>
        <h1 style={{ fontSize: 38, marginTop: 14 }}>About IntelliResearch</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7, marginTop: 12, maxWidth: 640 }}>
          IntelliResearch doesn't just rank papers by difficulty — it discovers
          prerequisite relationships between concepts and papers, then uses
          that to build a meaningful reading order. Hover over a feature below
          to see how it works.
        </p>

        <div className="grid-2" style={{ marginTop: 40 }}>
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.key}
              feature={f}
              isHovered={hovered === f.key}
              onHover={() => setHovered(f.key)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

function FeatureCard({ feature, isHovered, onHover, onLeave }) {
  const { badge, title, short, detail, Visual } = feature;
  return (
    <div
      className="card"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: isHovered ? "translateY(-4px)" : "none",
        boxShadow: isHovered ? "0 14px 30px rgba(62,111,242,0.16)" : "var(--shadow)",
      }}
    >
      <span className={`badge ${badge}`}>{title}</span>
      <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-muted)" }}>
        {isHovered ? detail : short}
      </p>
      <div style={{ marginTop: 16, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Visual active={isHovered} />
      </div>
    </div>
  );
}

/* --- Mini SVG illustrations, recolored to the ink / signal / ember palette --- */

function SetupVisual({ active }) {
  return (
    <svg width="140" height="70" viewBox="0 0 140 70">
      <rect x="10" y="15" width="50" height="40" rx="8" fill={active ? "#E9EFFF" : "#F4F2FC"} stroke="#3E6FF2" strokeWidth="1.5" />
      <text x="35" y="39" textAnchor="middle" fontSize="10" fill="#3E6FF2">Topic</text>
      <rect x="80" y="15" width="50" height="40" rx="8" fill={active ? "#E3FBF8" : "#F4F2FC"} stroke="#2ED9C3" strokeWidth="1.5" />
      <text x="105" y="39" textAnchor="middle" fontSize="10" fill="#1AA893">PDFs</text>
      <line x1="60" y1="35" x2="80" y2="35" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#B7C3EA" />
        </marker>
      </defs>
    </svg>
  );
}

function PathVisual({ active }) {
  const c = active ? ["#3E6FF2", "#E8963D", "#2ED9C3"] : ["#D9DEEF", "#D9DEEF", "#D9DEEF"];
  return (
    <svg width="140" height="60" viewBox="0 0 140 60">
      {[15, 65, 115].map((x, i) => (
        <circle key={x} cx={x} cy="30" r="14" fill={c[i]} />
      ))}
      <line x1="29" y1="30" x2="51" y2="30" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow2)" />
      <line x1="79" y1="30" x2="101" y2="30" stroke="#B7C3EA" strokeWidth="2" markerEnd="url(#arrow2)" />
      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#B7C3EA" />
        </marker>
      </defs>
    </svg>
  );
}

function KnowledgeVisual({ active }) {
  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      <rect x="10" y="10" width="45" height="26" rx="6" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
      <rect x="85" y="10" width="45" height="26" rx="6" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
      <circle cx="70" cy="60" r="16" fill={active ? "#3E6FF2" : "#D9DEEF"} />
      <line x1="32" y1="36" x2="60" y2="50" stroke="#B7C3EA" strokeWidth="2" />
      <line x1="107" y1="36" x2="80" y2="50" stroke="#B7C3EA" strokeWidth="2" />
    </svg>
  );
}

function CitationVisual({ active }) {
  const stroke = active ? "#FF6B6B" : "#E9C6C6";
  return (
    <svg width="140" height="70" viewBox="0 0 140 70">
      <circle cx="30" cy="20" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
      <circle cx="110" cy="20" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
      <circle cx="70" cy="55" r="12" fill={active ? "#FFECEC" : "#F4F2FC"} stroke={stroke} strokeWidth="1.5" />
      <line x1="38" y1="28" x2="62" y2="48" stroke={stroke} strokeWidth="2" />
      <line x1="102" y1="28" x2="78" y2="48" stroke={stroke} strokeWidth="2" />
      <line x1="42" y1="20" x2="98" y2="20" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function ExplorerVisual({ active }) {
  return (
    <svg width="140" height="70" viewBox="0 0 140 70">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={15 + i * 40}
          y={active ? 15 - i * 3 : 20}
          width="30"
          height="40"
          rx="6"
          fill={i === 1 ? "#E9EFFF" : "#F4F2FC"}
          stroke="#3E6FF2"
          strokeWidth="1.2"
        />
      ))}
    </svg>
  );
}

function AssistantVisual({ active }) {
  return (
    <svg width="140" height="70" viewBox="0 0 140 70">
      <rect x="10" y="10" width="70" height="24" rx="12" fill={active ? "#E3FBF8" : "#F4F2FC"} stroke="#2ED9C3" strokeWidth="1.5" />
      <rect x="55" y="40" width="75" height="24" rx="12" fill={active ? "#FDF0DE" : "#F4F2FC"} stroke="#E8963D" strokeWidth="1.5" />
    </svg>
  );
}

export default About;