import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ArcCarousel from "../components/ArcCarousel";
import Reveal from "../components/Reveal";
import { motion } from "framer-motion";
import "../styles/theme.css";

import heroImg from "../assets/images/hero-books.jpg";
import bandImg from "../assets/images/study-band.jpg";
import cardBooks from "../assets/images/cards/card-books.jpg";
import cardNotes from "../assets/images/cards/card-notes.jpg";
import cardLibrary from "../assets/images/cards/card-library.jpg";
import contactBg from "../assets/images/contact-bg.jpg";

/* ============================================================
   CONSTELLATION ART
============================================================ */

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
  { from: "a", to: "b" },
  { from: "a", to: "c" },
  { from: "b", to: "d" },
  { from: "b", to: "e" },
  { from: "c", to: "e" },
  { from: "d", to: "f" },
  { from: "e", to: "f" },
  { from: "e", to: "g" },
];

const PATH_EDGES = new Set(["a-b", "b-d", "d-f"]);

const findNode = (id) => NODES.find((n) => n.id === id);

function ConstellationHero() {
  return (
    <svg
      viewBox="0 0 600 480"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {EDGES.map((e) => {
        const from = findNode(e.from);
        const to = findNode(e.to);
        const key = `${e.from}-${e.to}`;
        const onPath = PATH_EDGES.has(key);

        return (
          <line
            key={key}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={
              onPath
                ? "#E8963D"
                : "rgba(27,35,51,0.14)"
            }
            strokeWidth={onPath ? 2.5 : 1.2}
          />
        );
      })}

      {NODES.map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.onPath ? 26 : 20}
            fill={
              n.onPath
                ? "rgba(232,150,61,0.14)"
                : "rgba(62,111,242,0.10)"
            }
          />

          <rect
            x={n.x - 12}
            y={n.y - 15}
            width="24"
            height="30"
            rx="4"
            fill="#FFFFFF"
            stroke={
              n.onPath ? "#E8963D" : "#3E6FF2"
            }
            strokeWidth="1.5"
          />

          <line
            x1={n.x - 6}
            y1={n.y - 6}
            x2={n.x + 6}
            y2={n.y - 6}
            stroke="#9AA3BD"
            strokeWidth="1.3"
          />

          <line
            x1={n.x - 6}
            y1={n.y}
            x2={n.x + 6}
            y2={n.y}
            stroke="#9AA3BD"
            strokeWidth="1.3"
          />

          <line
            x1={n.x - 6}
            y1={n.y + 6}
            x2={n.x + 2}
            y2={n.y + 6}
            stroke="#9AA3BD"
            strokeWidth="1.3"
          />
        </g>
      ))}

      <text
        x={NODES[0].x}
        y={NODES[0].y + 48}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="11"
        fill="#E8963D"
        fontWeight="600"
      >
        START HERE
      </text>

      <text
        x={NODES[5].x}
        y={NODES[5].y - 42}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="11"
        fill="#E8963D"
        fontWeight="600"
      >
        TARGET PAPER
      </text>
    </svg>
  );
}

/* ============================================================
   DATA
============================================================ */

const GALLERY_TILES = [
  {
    key: "large",
    image: cardLibrary,
    title: "Prerequisite Detection",
    caption: "Confidence-scored edges",
  },
  {
    key: "small1",
    image: cardNotes,
    title: "Citation Graph",
    caption: "Who cites whom",
  },
  {
    key: "small2",
    image: cardBooks,
    title: "Paper Explorer",
    caption: "Every abstract, searchable",
  },
  {
    key: "wide",
    image: bandImg,
    title: "Learning Path",
    caption: "The order to read in",
  },
];

const ABOUT_FEATURES = [
  {
    icon: "🧭",
    title: "Order, not ranking",
    body: "A sequence you follow, not a relevance score you interpret.",
  },
  {
    icon: "🎯",
    title: "Stated confidence",
    body: "Every dependency comes with how sure the system is, not just an arrow.",
  },
  {
    icon: "🔒",
    title: "Grounded, not generic",
    body: "Answers come from your uploaded papers only — nothing outside them.",
  },
];

const CHECKLIST = [
  "Upload any number of PDFs on one topic",
  "Concepts and definitions extracted automatically",
  "Prerequisite edges with a stated reason and confidence",
  "Citation lineage kept as a separate, honest view",
  "Ask the assistant anything — grounded in your papers only",
];

const CAROUSEL_ITEMS = [
  {
    label: "Paper Explorer",
    color: "#7C9EF2",
    image: cardBooks,
  },
  {
    label: "Citation Graph",
    color: "#5B8DEF",
    image: cardNotes,
  },
  {
    label: "Prerequisites",
    color: "#2ED9C3",
    image: cardLibrary,
  },
  {
    label: "Learning Path",
    color: "#E8963D",
    image: cardBooks,
  },
  {
    label: "Knowledge Graph",
    color: "#3E6FF2",
    image: cardNotes,
  },
  {
    label: "Confidence Scores",
    color: "#16213E",
    image: cardLibrary,
  },
  {
    label: "AI Assistant",
    color: "#A9C2FA",
    image: cardBooks,
  },
];

const CONTACT_REASONS = [
  {
    icon: "💬",
    label: "General questions",
    body: "About how the reading path or graphs work.",
  },
  {
    icon: "🐛",
    label: "Bug reports",
    body: "Something broke, or an answer looked wrong.",
  },
  {
    icon: "🤝",
    label: "Collaboration",
    body: "Ideas for extending the project further.",
  },
];

/* ============================================================
   SCROLL HELPER
============================================================ */

function scrollToId(id) {
  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/* ============================================================
   ENHANCED SECTION BLOCK
============================================================ */

function SectionBlock({
  number,
  eyebrow,
  title,
  action,
  dark = false,
  onClick,
}) {
  return (
    <div
      style={{
        position: "relative",
        height: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={onClick ? { y: -5 } : {}}
        onClick={onClick}
        style={{
          position: "absolute",
          left: "50%",
          top: "-48px",
          x: "-50%",

          width: "min(1320px, calc(100% - 32px))",
          minHeight: 96,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,

          padding: "16px 24px 16px 30px",

          background: dark
            ? "rgba(22,33,62,0.96)"
            : "rgba(255,255,255,0.97)",

          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",

          border: dark
            ? "1px solid rgba(255,255,255,0.14)"
            : "1px solid rgba(22,33,62,0.10)",

          boxShadow: dark
            ? "0 24px 70px rgba(0,0,0,0.34)"
            : "0 24px 70px rgba(22,33,62,0.16)",

          cursor: onClick ? "pointer" : "default",

          overflow: "hidden",

          pointerEvents: "auto",
        }}
      >
        {/* Left orange accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background:
              "linear-gradient(180deg, #F2B36A, #E8963D)",
          }}
        />

        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            left: 75,
            right: 75,
            top: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #E8963D, transparent)",
            opacity: 0.8,
          }}
        />

        {/* Small glow */}
        <div
          style={{
            position: "absolute",
            left: 30,
            top: "50%",
            width: 100,
            height: 100,
            transform: "translateY(-50%)",
            background:
              "radial-gradient(circle, rgba(232,150,61,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Left content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 17,
            minWidth: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Number */}
          <motion.div
            animate={{
              boxShadow: [
                "inset 0 0 20px rgba(232,150,61,0.04), 0 0 0px rgba(232,150,61,0)",
                "inset 0 0 20px rgba(232,150,61,0.10), 0 0 14px rgba(232,150,61,0.25)",
                "inset 0 0 20px rgba(232,150,61,0.04), 0 0 0px rgba(232,150,61,0)",
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 46,
              height: 46,
              flexShrink: 0,

              display: "grid",
              placeItems: "center",

              background: dark
                ? "rgba(232,150,61,0.15)"
                : "rgba(232,150,61,0.09)",

              color: "#E8963D",

              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,

              border:
                "1px solid rgba(232,150,61,0.25)",
            }}
          >
            {number}
          </motion.div>

          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",

                color: dark
                  ? "rgba(255,255,255,0.46)"
                  : "rgba(22,33,62,0.48)",

                marginBottom: 4,
              }}
            >
              {eyebrow}
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,

                color: dark
                  ? "#FFFFFF"
                  : "#16213E",

                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
          </div>
        </div>

        {/* Right action */}
        <div
          style={{
            flexShrink: 0,

            display: "flex",
            alignItems: "center",
            gap: 12,

            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",

            color: dark
              ? "rgba(255,255,255,0.62)"
              : "rgba(22,33,62,0.56)",

            position: "relative",
            zIndex: 1,
          }}
        >
          {action}

          <motion.span
            whileHover={onClick ? { x: 4 } : {}}
            transition={{ duration: 0.2 }}
            style={{
              width: 36,
              height: 36,

              display: "grid",
              placeItems: "center",

              border:
                "1px solid " +
                (dark
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(22,33,62,0.13)"),

              fontSize: 15,
            }}
          >
            →
          </motion.span>
        </div>

        {/* Bottom decorative blocks */}
        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: 0,
            width: 75,
            height: 3,
            background: "#E8963D",
            opacity: 0.65,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: 0,
            width: 36,
            height: 3,
            background: dark
              ? "rgba(255,255,255,0.24)"
              : "rgba(22,33,62,0.14)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ============================================================
   CONTACT SECTION
============================================================ */

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);

  const inputWrap = (icon, key, children) => (
    <div
      className="field-icon-wrap"
      style={{
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",

        transform:
          focused === key
            ? "translateY(-2px)"
            : "translateY(0)",

        boxShadow:
          focused === key
            ? "0 10px 30px rgba(22,33,62,0.10)"
            : "none",
      }}
    >
      <span className="field-icon-wrap__icon">
        {icon}
      </span>

      {children}
    </div>
  );

  return (
    <div
      id="contact"
      style={{
        position: "relative",
        overflow: "hidden",

        backgroundImage: `
          linear-gradient(
            135deg,
            rgba(12,20,38,0.88),
            rgba(22,33,62,0.68)
          ),
          url(${contactBg})
        `,

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        color: "#FFFFFF",
      }}
    >
      {/* Decorative background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,

          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.08) 1px,
              transparent 1px
            )
          `,

          backgroundSize: "50px 50px",

          maskImage:
            "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent)",
        }}
      />

      {/* Orange glow */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          left: "-180px",
          top: "15%",

          background:
            "radial-gradient(circle, rgba(232,150,61,0.20), transparent 70%)",

          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          right: "-150px",
          bottom: "-100px",

          background:
            "radial-gradient(circle, rgba(62,111,242,0.18), transparent 70%)",

          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <SectionBlock
        number="04"
        eyebrow="Continue the conversation"
        title="Have a question about IntelliResearch?"
        action="GET IN TOUCH"
        onClick={() => scrollToId("contact")}
        dark={true}
      />

      <div
        className="container"
        style={{
          paddingTop: 125,
          paddingBottom: 105,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Reveal>
          <div
            style={{
              textAlign: "center",
              maxWidth: 650,
              margin: "0 auto 60px",
            }}
          >
            <span
              className="eyebrow"
              style={{
                justifyContent: "center",
                color: "#E8963D",
              }}
            >
              Get in touch
            </span>

            <h2
              className="fluid-h2"
              style={{
                marginTop: 15,
                color: "#FFFFFF",
              }}
            >
              Questions or feedback?
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.68)",
                marginTop: 12,
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Whether you found a bug, have an idea,
              or simply want to know more — we'd love
              to hear from you.
            </p>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 1fr",
            gap: 55,
            alignItems: "start",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {/* Contact reasons */}
          <Reveal delay={0.05}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {CONTACT_REASONS.map((r, index) => (
                <motion.div
                  key={r.label}
                  whileHover={{
                    x: 5,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",

                    padding: "18px 18px",

                    background:
                      "rgba(255,255,255,0.07)",

                    border:
                      "1px solid rgba(255,255,255,0.10)",

                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter:
                      "blur(8px)",

                    boxShadow:
                      "0 12px 35px rgba(0,0,0,0.12)",
                  }}
                >
                  <span
                    className="dot-marker"
                    style={{
                      background:
                        "rgba(232,150,61,0.16)",
                      color: "#E8963D",
                      border:
                        "1px solid rgba(232,150,61,0.25)",
                    }}
                  >
                    {r.icon}
                  </span>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#FFFFFF",
                      }}
                    >
                      {r.label}
                    </p>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color:
                          "rgba(255,255,255,0.60)",
                      }}
                    >
                      {r.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal delay={0.12}>
            {sent ? (
              <motion.div
                initial={{
                  scale: 0.92,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                className="card"
                style={{
                  textAlign: "center",
                  padding: 50,

                  background:
                    "rgba(255,255,255,0.94)",

                  border:
                    "1px solid rgba(255,255,255,0.25)",

                  boxShadow:
                    "0 30px 80px rgba(0,0,0,0.22)",
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    margin: "0 auto",

                    display: "grid",
                    placeItems: "center",

                    borderRadius: "50%",

                    background:
                      "rgba(232,150,61,0.12)",

                    color: "#E8963D",

                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>

                <p
                  style={{
                    marginTop: 16,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  Message sent
                </p>

                <p
                  style={{
                    marginTop: 7,
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  Thanks — we'll get back to you soon.
                </p>
              </motion.div>
            ) : (
              <form
                className="card"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,

                  padding: 28,

                  background:
                    "rgba(255,255,255,0.96)",

                  border:
                    "1px solid rgba(255,255,255,0.25)",

                  boxShadow:
                    "0 30px 80px rgba(0,0,0,0.24)",

                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter:
                    "blur(14px)",
                }}
              >
                {inputWrap(
                  "👤",
                  "name",
                  <input
                    className="field-enhanced"
                    placeholder="Your name"
                    required
                    onFocus={() =>
                      setFocused("name")
                    }
                    onBlur={() =>
                      setFocused(null)
                    }
                  />
                )}

                {inputWrap(
                  "✉️",
                  "email",
                  <input
                    className="field-enhanced"
                    placeholder="Your email"
                    type="email"
                    required
                    onFocus={() =>
                      setFocused("email")
                    }
                    onBlur={() =>
                      setFocused(null)
                    }
                  />
                )}

                <textarea
                  className="field-enhanced"
                  placeholder="Message"
                  rows={5}
                  required
                  onFocus={() =>
                    setFocused("message")
                  }
                  onBlur={() =>
                    setFocused(null)
                  }
                  style={{
                    resize: "vertical",
                    minHeight: 130,
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                  type="submit"
                  style={{
                    justifyContent: "center",
                    marginTop: 3,
                  }}
                >
                  Send Message →
                </motion.button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANIMATION VARIANTS
============================================================ */

const heroContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ============================================================
   LANDING PAGE
============================================================ */

function Landing() {
  const navigate = useNavigate();

  return (
    <div
      id="home"
      style={{
        overflow: "hidden",
      }}
    >
      {/* ======================================================
          HERO
      ====================================================== */}

      <div
        className="photo-hero"
        style={{
          backgroundImage: `url(${heroImg})`,
          alignItems: "center",
          position: "relative",
        }}
      >
        <Navbar variant="floating" />

        <motion.div
          className="container"
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            textAlign: "center",
            paddingTop: 90,
          }}
        >
          <motion.span
            variants={heroItemVariants}
            className="eyebrow"
            style={{
              color: "#E8963D",
              justifyContent: "center",
            }}
          >
            Prerequisite-aware research reading
          </motion.span>

          <motion.h1
            variants={heroItemVariants}
            className="fluid-h1"
            style={{
              margin: "18px auto 0",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
              maxWidth: 640,
            }}
          >
            Read papers{" "}
            <span
              style={{
                color: "white",
                fontWeight: 700,
              }}
            >
              in the order
            </span>
            <br />
            they were meant to be{" "}
            <span
              style={{
                color: "white",
                fontWeight: 700,
              }}
            >
              understood.
            </span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 460,
              margin: "22px auto 0",
            }}
          >
            Upload your papers. Get back the order they
            should be read in.
          </motion.p>

          <motion.div
            variants={heroItemVariants}
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-ember"
              onClick={() => navigate("/login")}
            >
              Map your first topic →
            </motion.button>

            <a
              href="#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "white",
                fontSize: 14.5,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "1.5px solid white",
                }}
              />

              See how it works
            </a>
          </motion.div>

          <motion.div
            variants={heroItemVariants}
            style={{
              marginTop: 40,
            }}
          >
            <ArcCarousel items={CAROUSEL_ITEMS} />
          </motion.div>

          <motion.p
            variants={heroItemVariants}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "rgba(255,255,255,0.4)",
              marginTop: 4,
            }}
          >
            ← drag to explore →
          </motion.p>
        </motion.div>
      </div>

      {/* ======================================================
          HERO → ABOUT
      ====================================================== */}

      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(180deg, #b2cdec 0%, #c3d8ef 100%)",
        }}
      >
        <SectionBlock
          number="01"
          eyebrow="Explore the system"
          title="See what IntelliResearch actually maps"
          action="ABOUT"
          onClick={() => scrollToId("about")}
        />

        <div id="about">
          <div
            className="container"
            style={{
              paddingTop: 100,
              paddingBottom: 80,
            }}
          >
            <Reveal>
              <span className="eyebrow">
                About IntelliResearch
              </span>

              <h2
                className="fluid-h2"
                style={{
                  marginTop: 12,
                  marginBottom: 30,
                }}
              >
                See it before you use it
              </h2>
            </Reveal>

            <div className="about-gallery">
              {GALLERY_TILES.map((t, i) => (
                <Reveal key={t.key} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    className={`gallery-tile about-gallery__${t.key}`}
                    style={{
                      backgroundImage: `url(${t.image})`,
                    }}
                    onClick={() => navigate("/login")}
                  >
                    <span className="gallery-tile__arrow">
                      ↗
                    </span>

                    <div className="gallery-tile__label">
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {t.title}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.85,
                          marginTop: 2,
                        }}
                      >
                        {t.caption}
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>

            <div
              className="hero-grid"
              style={{
                marginTop: 70,
              }}
            >
              <Reveal>
                <div>
                  <h2
                    className="fluid-h2"
                    style={{
                      marginBottom: 16,
                    }}
                  >
                    Read with context, not just access
                  </h2>

                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: 15,
                      lineHeight: 1.75,
                      marginBottom: 30,
                    }}
                  >
                    Most tools help you find papers.
                    IntelliResearch helps you understand
                    them in the right order — mapping which
                    ideas depend on which, before you start
                    reading.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 22,
                    }}
                  >
                    {ABOUT_FEATURES.map((f, i) => (
                      <motion.div
                        key={f.title}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        style={{
                          display: "flex",
                          gap: 14,
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          className="dot-marker"
                          style={{
                            background: "var(--ink)",
                            color: "white",
                          }}
                        >
                          {f.icon}
                        </span>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              fontSize: 15,
                            }}
                          >
                            {f.title}
                          </p>

                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 13.5,
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            {f.body}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  transition={{ duration: 0.3 }}
                  className="gallery-tile"
                  style={{
                    backgroundImage: `url(${heroImg})`,
                    height: 420,
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 16,
                      bottom: 16,
                      display: "flex",
                      gap: 10,
                      zIndex: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="thumb-chip"
                      onClick={() =>
                        navigate("/login")
                      }
                    >
                      📄 Paper Explorer
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="thumb-chip"
                      onClick={() =>
                        scrollToId("contact")
                      }
                    >
                      💬 Ask a question
                    </motion.div>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          ABOUT → PROBLEM
      ====================================================== */}

      <div
        style={{
          position: "relative",
          background: "#c3d8ef",
          height: 0,
          zIndex: 30,
        }}
      >
        <SectionBlock
          number="02"
          eyebrow="The problem"
          title="Papers assume you've already read something else"
          action="DISCOVER"
          dark={true}
          onClick={() => scrollToId("problem")}
        />
      </div>

      {/* ======================================================
          PROBLEM
      ====================================================== */}

      <div
        className="photo-band"
        id="problem"
        style={{
          backgroundImage: `url(${bandImg})`,
          position: "relative",
        }}
      >
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: 110,
            paddingBottom: 100,
          }}
        >
          <Reveal>
            <div
              style={{
                maxWidth: 520,
              }}
            >
              <span
                className="eyebrow"
                style={{
                  color: "#E8963D",
                }}
              >
                The actual problem
              </span>

              <h2
                className="fluid-h2"
                style={{
                  marginTop: 14,
                  color: "#FFFFFF",
                }}
              >
                Papers assume you've already read something else.
              </h2>

              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 16,
                  lineHeight: 1.75,
                  fontSize: 15.5,
                }}
              >
                A collection of papers on a topic isn't
                a reading list — it's a dependency graph
                nobody drew for you. IntelliResearch reads
                the collection once, finds those dependencies,
                and gives you the order that actually builds
                understanding.
              </p>

              <a
                href="#how-it-works"
                className="btn btn-outline-on-ink"
                style={{
                  marginTop: 24,
                }}
              >
                ▶ See how it works
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ======================================================
          PROBLEM → HOW IT WORKS
      ====================================================== */}

      <div
        style={{
          position: "relative",
          background: "#c3d8ef",
          height: 0,
          zIndex: 30,
        }}
      >
        <SectionBlock
          number="03"
          eyebrow="Build your path"
          title="Turn your papers into a dependency-aware reading order"
          action="HOW IT WORKS"
          onClick={() =>
            scrollToId("how-it-works")
          }
        />
      </div>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <div
        style={{
          background:
            "linear-gradient(180deg, #c3d8ef 0%, #b2cdec 100%)",
        }}
        id="how-it-works"
      >
        <div
          className="container"
          style={{
            paddingTop: 100,
            paddingBottom: 100,
          }}
        >
          <div className="hero-grid">
            <Reveal>
              <div>
                <span className="eyebrow">
                  What you get
                </span>

                <h2
                  className="fluid-h2"
                  style={{
                    marginTop: 14,
                    marginBottom: 22,
                  }}
                >
                  Every reading path comes with receipts
                </h2>

                <div>
                  {CHECKLIST.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="checklist-item"
                    >
                      <span className="checklist-item__check">
                        ✓
                      </span>

                      <span
                        style={{
                          fontSize: 15,
                          color: "var(--text-dark)",
                        }}
                      >
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn btn-primary"
                  style={{
                    marginTop: 24,
                  }}
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Try it yourself →
                </motion.button>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div
                style={{
                  minHeight: 380,
                }}
              >
                <ConstellationHero />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTACT
      ====================================================== */}

      <ContactSection />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        className="ink-surface"
        style={{
          borderTop:
            "1px solid var(--border-on-ink)",
        }}
      >
        <div
          className="container"
          style={{
            paddingTop: 50,
            paddingBottom: 40,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 1fr 1fr",
              gap: 30,
            }}
          >
            <div>
              <span
                style={{
                  fontFamily:
                    "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 19,
                  color:
                    "var(--text-on-ink)",
                }}
              >
                IntelliResearch
              </span>

              <p
                style={{
                  color:
                    "var(--text-on-ink-muted)",
                  fontSize: 13.5,
                  marginTop: 12,
                  maxWidth: 280,
                  lineHeight: 1.6,
                }}
              >
                An AI research assistant that maps
                prerequisite relationships between
                papers and builds a reading order —
                not just a summary.
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily:
                    "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color:
                    "var(--text-on-ink-muted)",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                Product
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <a
                  href="#how-it-works"
                  style={{
                    color:
                      "var(--text-on-ink-muted)",
                    fontSize: 14,
                  }}
                >
                  How it works
                </a>

                <a
                  href="/login"
                  style={{
                    color:
                      "var(--text-on-ink-muted)",
                    fontSize: 14,
                  }}
                >
                  Get started
                </a>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontFamily:
                    "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color:
                    "var(--text-on-ink-muted)",
                  marginBottom: 14,
                  textTransform: "uppercase",
                }}
              >
                Company
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <a
                  href="#about"
                  style={{
                    color:
                      "var(--text-on-ink-muted)",
                    fontSize: 14,
                  }}
                >
                  About
                </a>

                <a
                  href="#contact"
                  style={{
                    color:
                      "var(--text-on-ink-muted)",
                    fontSize: 14,
                  }}
                >
                  Contact
                </a>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop:
                "1px solid var(--border-on-ink)",
              fontSize: 12.5,
              color:
                "var(--text-on-ink-muted)",
            }}
          >
            IntelliResearch — a research reading-order
            tool.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;