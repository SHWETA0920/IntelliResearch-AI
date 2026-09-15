import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Navbar({ variant = "pill" }) {
  const navigate = useNavigate();

  const brand = (light) => (
    <a href="#home" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="brand-mark">
      <svg className="brand-mark__icon" width="22" height="22" viewBox="0 0 22 22">
        <line x1="4" y1="16" x2="11" y2="6" stroke="#E8963D" strokeWidth="1.6" />
        <line x1="11" y1="6" x2="18" y2="14" stroke="#3E6FF2" strokeWidth="1.6" opacity="0.5" />
        <circle cx="4" cy="16" r="3" fill="#E8963D" />
        <circle cx="11" cy="6" r="2.6" fill="#3E6FF2" />
        <circle cx="18" cy="14" r="2.2" fill="#7C9EF2" />
      </svg>
      {/* <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 19,
          color: light ? "white" : "var(--text-dark)",
        }}
      >
        IntelliResearch
      </span> */}
    </a>
  );

  const navItems = [
    { label: "Home", action: scrollToTop },
    { label: "About", action: () => scrollToId("about") },
    { label: "Contact", action: () => scrollToId("contact") },
  ];

  const links = (
    <div style={{ display: "flex", alignItems: "center" }}>
      {navItems.map((item) => (
        <a
          key={item.label}
          href={`#${item.label.toLowerCase()}`}
          className="nav-link"
          onClick={(e) => { e.preventDefault(); item.action(); }}
        >
          {item.label}
        </a>
      ))}
      <button
        className="btn btn-primary"
        style={{ marginLeft: 14, padding: "10px 22px" }}
        onClick={() => navigate("/login")}
      >
        Login
      </button>
    </div>
  );

  if (variant === "floating") {
    return (
      <div className="nav-floating-wrap">
        <div className="nav-floating">
          {brand(true)}
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`#${item.label.toLowerCase()}`}
              className="nav-link"
              onClick={(e) => { e.preventDefault(); item.action(); }}
            >
              {item.label}
            </a>
          ))}
          <button className="btn btn-ember" style={{ padding: "9px 20px", fontSize: 14 }} onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className="nav-bar">
        <div className="container nav-bar__inner">
          {brand(true)}
          {links}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="pill-nav">
        {brand(false)}
        {links}
      </div>
    </div>
  );
}

export default Navbar;