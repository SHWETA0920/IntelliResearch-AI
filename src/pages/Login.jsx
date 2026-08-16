import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <div
      className="ink-surface"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="atmosphere" />

      <form
        onSubmit={handleLogin}
        className="glass-card atmosphere-content"
        style={{ width: 380, padding: 36, display: "flex", flexDirection: "column", gap: 16 }}
      >
        <span className="eyebrow" style={{ color: "#E8963D" }}>Welcome back</span>
        <h2 style={{ margin: 0, fontSize: 26, color: "var(--text-on-ink)" }}>IntelliResearch</h2>
        <p style={{ margin: 0, color: "var(--text-on-ink-muted)", fontSize: 14, marginBottom: 6 }}>
          Log in to continue mapping your reading paths.
        </p>

        <input
          className="field-on-ink"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={fieldStyle}
        />
        <input
          className="field-on-ink"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={fieldStyle}
        />

        <button className="btn btn-ember" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
          Log In
        </button>
      </form>
    </div>
  );
}

const fieldStyle = {
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid rgba(237, 239, 247, 0.18)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "var(--text-on-ink)",
  fontSize: 14,
  outline: "none",
};

export default Login;