import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import loginBackground from "../assets/images/hero-books2.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setIsSubmitting(true);
    // Directly open the New Research page after login
    navigate("/research/new");
  }

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 20,
      }}
    >
      {/* Dark overlay over the background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)",
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-card {
          animation: loginCardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .login-field-wrap {
          position: relative;
        }
        .login-field-wrap input {
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .login-field-wrap input:hover {
          border-color: rgba(237, 239, 247, 0.32) !important;
        }
        .login-field-wrap input:focus {
          border-color: #E8963D !important;
          background: rgba(255, 255, 255, 0.09) !important;
          box-shadow: 0 0 0 3px rgba(232, 150, 61, 0.18);
        }
        .login-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.55;
          pointer-events: none;
        }
        .login-toggle-visibility {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(237, 239, 247, 0.55);
          border-radius: 6px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .login-toggle-visibility:hover {
          color: rgba(237, 239, 247, 0.9);
          background: rgba(255, 255, 255, 0.08);
        }
        .login-submit-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(232, 150, 61, 0.35);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit-btn:disabled {
          opacity: 0.75;
          cursor: default;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-spinner {
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <form
        onSubmit={handleLogin}
        className="glass-card login-card"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 36,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          className="eyebrow"
          style={{
            color: "#E8963D",
            letterSpacing: "0.06em",
          }}
        >
          Welcome back
        </span>

        <h2
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 600,
            color: "var(--text-on-ink)",
          }}
        >
          IntelliResearch
        </h2>

        <p
          style={{
            margin: 0,
            color: "var(--text-on-ink-muted)",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 6,
          }}
        >
          Log in to continue mapping your reading paths.
        </p>

        <label className="login-field-wrap">
          <span
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
            }}
          >
            Email
          </span>
          <svg
            className="login-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-on-ink)" }}
          >
            <path d="M4 4h16v16H4z" opacity="0" />
            <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6z" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
          <input
            className="field-on-ink"
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...fieldStyle, paddingLeft: 40 }}
          />
        </label>

        <label className="login-field-wrap">
          <span
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
            }}
          >
            Password
          </span>
          <svg
            className="login-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-on-ink)" }}
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <input
            className="field-on-ink"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...fieldStyle, paddingLeft: 40, paddingRight: 40 }}
          />
          <button
            type="button"
            className="login-toggle-visibility"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.94 10.94 0 0112 20c-6 0-10-5-10-8a13.5 13.5 0 013.06-4.94M9.9 4.24A9.12 9.12 0 0112 4c6 0 10 5 10 8a13.06 13.06 0 01-1.67 2.68M14.12 14.12a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </label>

        <button
          className="btn btn-ember login-submit-btn"
          type="submit"
          disabled={isSubmitting}
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          {isSubmitting && (
            <svg
              className="login-spinner"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" />
            </svg>
          )}
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid rgba(237, 239, 247, 0.18)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "var(--text-on-ink)",
  fontSize: 14,
  outline: "none",
};

export default Login;