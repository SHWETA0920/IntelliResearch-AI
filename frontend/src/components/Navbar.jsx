import { Link, useNavigate } from "react-router-dom";
import "../styles/theme.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="pill-nav">
        <Link to="/" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--text-dark)" }}>
          IntelliResearch
        </Link>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <button
            className="btn btn-primary"
            style={{ marginLeft: 14, padding: "10px 22px" }}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;