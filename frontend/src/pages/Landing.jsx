import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

// Drop your two sourced images here - see setup instructions.
// If the files aren't there yet, these imports will fail the build;
// add the images first, or temporarily comment out the two lines
// and the two className="photo-hero"/"photo-band" backgroundImage
// props below to preview the rest of the page without them.
import heroImg from "../assets/images/hero-books.jpg";
import bandImg from "../assets/images/study-band.jpg";

/* ---- Constellation art (kept as the product-diagram moment,
   now living in the checklist section rather than the hero,
   since the hero carries real photography instead) ------------ */

const NODES = [
  { id: "a", x: 70, y: 300, onPath: true },
  { id: "b", x: 210, y: 160, onPath: true },
  { id: "c", x: 210, y: 400 },
  { id: "d", x: 360, y: 90, onPath: true },
  { id: "e", x: 370, y: 300 },
  { id: "f", x: 520, y: 190, onPath: true },
  { id: "g", x: 520, y: 400 },
];
const EDGES = [
  { from: "a", to: "b" }, { from: "a", to: "c" }, { from: "b", to: "d" },
  { from: "b", to: "e" }, { from: "c", to: "e" }, { from: "d", to: "f" },
  { from: "e", to: "f" }, { from: "e", to: "g" },
];
const PATH_EDGES = new Set(["a-b", "b-d", "d-f"]);
const findNode = (id) => NODES.find((n) => n.id === id);

function ConstellationHero() {
  return (
    <svg viewBox="0 0 600 480" width="100%" height="100%" style={{ overflow: "visible" }}>
      {EDGES.map((e) => {
        const from = findNode(e.from);
        const to = findNode(e.to);
        const key = `${e.from}-${e.to}`;
        const onPath = PATH_EDGES.has(key);
        return (
          <line key={key} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={onPath ? "#E8963D" : "rgba(27,35,51,0.14)"}
            strokeWidth={onPath ? 2.5 : 1.2} />
        );
      })}
      {NODES.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.onPath ? 26 : 20}
            fill={n.onPath ? "rgba(232,150,61,0.14)" : "rgba(62,111,242,0.10)"} />
          <rect x={n.x - 12} y={n.y - 15} width="24" height="30" rx="4" fill="#FFFFFF"
            stroke={n.onPath ? "#E8963D" : "#3E6FF2"} strokeWidth="1.5" />
          <line x1={n.x - 6} y1={n.y - 6} x2={n.x + 6} y2={n.y - 6} stroke="#9AA3BD" strokeWidth="1.3" />
          <line x1={n.x - 6} y1={n.y} x2={n.x + 6} y2={n.y} stroke="#9AA3BD" strokeWidth="1.3" />
          <line x1={n.x - 6} y1={n.y + 6} x2={n.x + 2} y2={n.y + 6} stroke="#9AA3BD" strokeWidth="1.3" />
        </g>
      ))}
      <text x={NODES[0].x} y={NODES[0].y + 48} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#E8963D" fontWeight="600">START HERE</text>
      <text x={NODES[5].x} y={NODES[5].y - 42} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#E8963D" fontWeight="600">TARGET PAPER</text>
    </svg>
  );
}

/* ---- Data --------------------------------------------------------- */

const STEP_RAIL = [
  "01 — Upload your papers",
  "02 — System reads every one",
  "03 — Dependencies get mapped",
  "04 — You get a reading order",
];
const ACTIVE_STEP = 2; // purely visual emphasis, like the reference's highlighted "03"

// const PREVIEWS = [
//   { icon: "🧭", label: "Learning Path", caption: "The order to read in", color: "#E8963D" },
//   { icon: "🕸️", label: "Knowledge Graph", caption: "Concepts, mapped", color: "#3E6FF2" },
//   { icon: "🔗", label: "Citation Graph", caption: "Who cites whom", color: "#2ED9C3" },
//   { icon: "📄", label: "Paper Explorer", caption: "Every abstract, searchable", color: "#7C93F0" },
// ];

const PREVIEWS = [
  {
    label: "Learning Path",
    caption: "The order to read in",
    type: "learning",
  },
  {
    label: "Knowledge Graph",
    caption: "Concepts, mapped",
    type: "knowledge",
  },
  {
    label: "Citation Graph",
    caption: "Who cites whom",
    type: "citation",
  },
  {
    label: "Paper Explorer",
    caption: "Every abstract, searchable",
    type: "explorer",
  },
];

function PreviewVisual({ type }) {
  if (type === "learning") {
    return (
      <svg
        viewBox="0 0 240 150"
        className="preview-card__visual"
        aria-hidden="true"
      >
        <path
          d="M35 118 C70 100, 72 72, 108 76 C143 80, 145 45, 202 30"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="35" cy="118" r="9" fill="#fff" />
        <circle cx="108" cy="76" r="9" fill="#fff" />
        <circle cx="202" cy="30" r="11" fill="#fff" />

        <rect
          x="27"
          y="92"
          width="18"
          height="25"
          rx="3"
          fill="rgba(255,255,255,0.92)"
          transform="rotate(-18 27 92)"
        />

        <rect
          x="100"
          y="48"
          width="18"
          height="25"
          rx="3"
          fill="rgba(255,255,255,0.92)"
          transform="rotate(12 100 48)"
        />

        <rect
          x="194"
          y="3"
          width="18"
          height="25"
          rx="3"
          fill="rgba(255,255,255,0.95)"
          transform="rotate(18 194 3)"
        />

        <path
          d="M195 30 L185 30 M195 30 L190 24"
          stroke="#E8963D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "knowledge") {
    return (
      <svg
        viewBox="0 0 240 150"
        className="preview-card__visual"
        aria-hidden="true"
      >
        <line
          x1="120"
          y1="75"
          x2="55"
          y2="35"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="2"
        />
        <line
          x1="120"
          y1="75"
          x2="55"
          y2="115"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="2"
        />
        <line
          x1="120"
          y1="75"
          x2="190"
          y2="35"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="2"
        />
        <line
          x1="120"
          y1="75"
          x2="190"
          y2="115"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="2"
        />

        <circle cx="120" cy="75" r="22" fill="#fff" />
        <circle cx="55" cy="35" r="13" fill="rgba(255,255,255,0.88)" />
        <circle cx="55" cy="115" r="13" fill="rgba(255,255,255,0.88)" />
        <circle cx="190" cy="35" r="13" fill="rgba(255,255,255,0.88)" />
        <circle cx="190" cy="115" r="13" fill="rgba(255,255,255,0.88)" />

        <circle cx="120" cy="75" r="8" fill="#E8963D" />
      </svg>
    );
  }

  if (type === "citation") {
    return (
      <svg
        viewBox="0 0 240 150"
        className="preview-card__visual"
        aria-hidden="true"
      >
        <rect
          x="28"
          y="38"
          width="52"
          height="70"
          rx="6"
          fill="rgba(255,255,255,0.92)"
        />
        <rect
          x="95"
          y="22"
          width="52"
          height="70"
          rx="6"
          fill="#fff"
        />
        <rect
          x="162"
          y="50"
          width="52"
          height="70"
          rx="6"
          fill="rgba(255,255,255,0.92)"
        />

        <line
          x1="80"
          y1="70"
          x2="95"
          y2="58"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
        />
        <line
          x1="147"
          y1="58"
          x2="162"
          y2="78"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
        />

        <path
          d="M88 64 L94 58 L87 56"
          fill="none"
          stroke="#E8963D"
          strokeWidth="2"
        />
        <path
          d="M155 72 L162 78 L160 69"
          fill="none"
          stroke="#E8963D"
          strokeWidth="2"
        />

        <line
          x1="40"
          y1="56"
          x2="67"
          y2="56"
          stroke="#E8963D"
          strokeWidth="3"
          opacity="0.8"
        />
        <line
          x1="107"
          y1="40"
          x2="134"
          y2="40"
          stroke="#E8963D"
          strokeWidth="3"
          opacity="0.8"
        />
        <line
          x1="174"
          y1="68"
          x2="201"
          y2="68"
          stroke="#E8963D"
          strokeWidth="3"
          opacity="0.8"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 150"
      className="preview-card__visual"
      aria-hidden="true"
    >
      <rect
        x="65"
        y="20"
        width="110"
        height="115"
        rx="7"
        fill="rgba(255,255,255,0.95)"
      />

      <rect
        x="65"
        y="20"
        width="110"
        height="25"
        rx="7"
        fill="rgba(255,255,255,0.75)"
      />

      <circle cx="82" cy="32" r="4" fill="#E8963D" />

      <line
        x1="85"
        y1="62"
        x2="155"
        y2="62"
        stroke="#E8963D"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <line
        x1="85"
        y1="77"
        x2="155"
        y2="77"
        stroke="#A9B0C0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <line
        x1="85"
        y1="91"
        x2="145"
        y2="91"
        stroke="#A9B0C0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <line
        x1="85"
        y1="105"
        x2="150"
        y2="105"
        stroke="#A9B0C0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle
        cx="183"
        cy="105"
        r="20"
        fill="rgba(255,255,255,0.9)"
      />

      <path
        d="M175 105 L181 111 L192 98"
        fill="none"
        stroke="#E8963D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ADVANTAGES = [
  { icon: "🧭", title: "Order, not ranking", body: "A sequence you follow, not a relevance score you interpret." },
  { icon: "🎯", title: "Stated confidence", body: "Every dependency comes with how sure the system is, not just an arrow." },
  { icon: "📖", title: "Evidence traced to a page", body: "Ask why, get an answer that points back to where it came from." },
  { icon: "🔒", title: "Grounded, not generic", body: "Answers come from your uploaded papers only — nothing outside them." },
];

const CHECKLIST = [
  "Upload any number of PDFs on one topic",
  "Concepts and definitions extracted automatically",
  "Prerequisite edges with a stated reason and confidence",
  "Citation lineage kept as a separate, honest view",
  "Ask the assistant anything — grounded in your papers only",
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO - photographic, dark scrim, floating navbar */}
      <div className="photo-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
          <Navbar />
        </div>

        <div className="container" style={{ position: "relative", zIndex: 1, paddingBottom: 60, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 560 }}>
              <span className="eyebrow" style={{ color: "#E8963D" }}>Prerequisite-aware research reading</span>
              <h1 className="fluid-h1" style={{ margin: "18px 0 8px", color: "#FFFFFF" }}>
                Read papers
                <span className="accent-line" style={{ fontSize: "0.6em", marginTop: 2, color: "#E8963D" }}>
                  in the order they were meant to be understood.
                </span>
              </h1>
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", marginTop: 18, maxWidth: 460 }}>
                Upload what you've collected on a topic. The system maps which papers assume knowledge
                from which others, and hands you a sequence to actually follow.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
                <button className="btn btn-ember" onClick={() => navigate("/login")}>
                  Map your first topic →
                </button>
                <a href="#how-it-works" className="btn btn-outline-on-ink">
                  ▶ See how it works
                </a>
              </div>
            </div>

            <div className="step-rail">
              {STEP_RAIL.map((s, i) => (
                <span key={s} className={`step-rail__item ${i === ACTIVE_STEP ? "step-rail__item--active" : ""}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW ROW - light section */}
      <div style={{ background: "var(--bg)" }}>
        <div className="container" style={{ paddingTop: 70, paddingBottom: 70 }}>
          <span className="eyebrow">Four views</span>
          <h2 className="fluid-h2" style={{ marginTop: 12, marginBottom: 30 }}>
            See your papers from every angle
          </h2>

          {/* <div className="grid-4">
            {PREVIEWS.map((p) => (
              <div key={p.label} className="preview-card" style={{ background: `linear-gradient(160deg, ${p.color}, ${p.color}CC)` }}>
                <div className="preview-card__label">
                  <span className="preview-card__icon">{p.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 2 }}>{p.caption}</div>
                </div>
              </div>
            ))}
          </div> */}
          <div className="grid-4">
  {PREVIEWS.map((p) => (
    <div
      key={p.label}
      className="preview-card"
      style={{
        background: "linear-gradient(160deg, #E8963D, #D97F2E)",
      }}
    >
      <div className="preview-card__art">
        <PreviewVisual type={p.type} />
      </div>

      <div className="preview-card__label">
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {p.label}
        </div>

        <div
          style={{
            fontSize: 12.5,
            opacity: 0.9,
            marginTop: 4,
          }}
        >
          {p.caption}
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      </div>

      {/* ADVANTAGES - dark icon row */}
      <div className="ink-surface">
        <div className="atmosphere" />
        <div className="container atmosphere-content" style={{ paddingTop: 60, paddingBottom: 60 }}>
          <span className="eyebrow" style={{ color: "#E8963D" }}>Why it's different</span>
          <h2 className="fluid-h2" style={{ marginTop: 12, marginBottom: 40, color: "var(--text-on-ink)" }}>
            It doesn't just find papers. It orders them.
          </h2>
          <div className="icon-row">
            {ADVANTAGES.map((a) => (
              <div key={a.title} className="icon-row__item">
                <span style={{ fontSize: 24 }}>{a.icon}</span>
                <h3 style={{ fontSize: 16, marginTop: 14, marginBottom: 8, color: "var(--text-on-ink)" }}>{a.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-on-ink-muted)", lineHeight: 1.6 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PHOTO BAND - second real image, mirrors reference's "explore" section */}
      <div className="photo-band" style={{ backgroundImage: `url(${bandImg})` }}>
        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 60 }}>
          <div style={{ maxWidth: 520 }}>
            <span className="eyebrow" style={{ color: "#E8963D" }}>The actual problem</span>
            <h2 className="fluid-h2" style={{ marginTop: 14, color: "#FFFFFF" }}>
              Papers assume you've already read something else.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 16, lineHeight: 1.75, fontSize: 15.5 }}>
              A collection of papers on a topic isn't a reading list — it's a dependency graph nobody
              drew for you. IntelliResearch reads the collection once, finds those dependencies, and
              gives you the order that actually builds understanding.
            </p>
            <a href="#how-it-works" className="btn btn-outline-on-ink" style={{ marginTop: 24 }}>
              ▶ See how it works
            </a>
          </div>
        </div>
      </div>

      {/* CHECKLIST + PRODUCT DIAGRAM - light section */}
      <div style={{ background: "var(--bg)" }} id="how-it-works">
        <div className="container" style={{ paddingTop: 70, paddingBottom: 80 }}>
          <div className="hero-grid">
            <div>
              <span className="eyebrow">What you get</span>
              <h2 className="fluid-h2" style={{ marginTop: 14, marginBottom: 22 }}>
                Every reading path comes with receipts
              </h2>
              <div>
                {CHECKLIST.map((item) => (
                  <div key={item} className="checklist-item">
                    <span className="checklist-item__check">✓</span>
                    <span style={{ fontSize: 15, color: "var(--text-dark)" }}>{item}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/login")}>
                Try it yourself →
              </button>
            </div>
            <div style={{ minHeight: 380 }}>
              <ConstellationHero />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="ink-surface">
        <div className="atmosphere" />
        <div className="container atmosphere-content" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>
            <div>
              <h2 className="fluid-h2" style={{ color: "var(--text-on-ink)", maxWidth: 440 }}>
                You already have the papers.<br />You're missing the order.
              </h2>
              <p style={{ color: "var(--text-on-ink-muted)", marginTop: 16, maxWidth: 400, lineHeight: 1.7 }}>
                Drop in what you've collected on a topic and get a reading path back — with the reasoning shown.
              </p>
            </div>
            <div className="glass-card" style={{ padding: 30 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "var(--text-on-ink)" }}>Map your first topic</p>
              <p style={{ margin: "6px 0 20px", fontSize: 13, color: "var(--text-on-ink-muted)" }}>
                Free to try — no setup beyond a topic and your PDFs.
              </p>
              <button className="btn btn-ember" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/login")}>
                Get started →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="ink-surface" style={{ borderTop: "1px solid var(--border-on-ink)" }}>
        <div className="container" style={{ paddingTop: 50, paddingBottom: 40, position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 30 }}>
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-on-ink)" }}>
                IntelliResearch
              </span>
              <p style={{ color: "var(--text-on-ink-muted)", fontSize: 13.5, marginTop: 12, maxWidth: 280, lineHeight: 1.6 }}>
                An AI research assistant that maps prerequisite relationships between papers and builds
                a reading order — not just a summary.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-on-ink-muted)", marginBottom: 14, textTransform: "uppercase" }}>Product</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="#how-it-works" style={{ color: "var(--text-on-ink-muted)", fontSize: 14 }}>How it works</a>
                <a href="/login" style={{ color: "var(--text-on-ink-muted)", fontSize: 14 }}>Get started</a>
              </div>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.06em", color: "var(--text-on-ink-muted)", marginBottom: 14, textTransform: "uppercase" }}>Company</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/about" style={{ color: "var(--text-on-ink-muted)", fontSize: 14 }}>About</a>
                <a href="/contact" style={{ color: "var(--text-on-ink-muted)", fontSize: 14 }}>Contact</a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border-on-ink)", fontSize: 12.5, color: "var(--text-on-ink-muted)" }}>
            IntelliResearch — a research reading-order tool.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;