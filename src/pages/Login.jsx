// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/theme.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   function handleLogin(e) {
//     e.preventDefault();
//     navigate("/dashboard");
//   }

//   return (
//     <div
//       className="ink-surface"
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <div className="atmosphere" />

//       <form
//         onSubmit={handleLogin}
//         className="glass-card atmosphere-content"
//         style={{ width: 380, padding: 36, display: "flex", flexDirection: "column", gap: 16 }}
//       >
//         <span className="eyebrow" style={{ color: "#E8963D" }}>Welcome back</span>
//         <h2 style={{ margin: 0, fontSize: 26, color: "var(--text-on-ink)" }}>IntelliResearch</h2>
//         <p style={{ margin: 0, color: "var(--text-on-ink-muted)", fontSize: 14, marginBottom: 6 }}>
//           Log in to continue mapping your reading paths.
//         </p>

//         <input
//           className="field-on-ink"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={fieldStyle}
//         />
//         <input
//           className="field-on-ink"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={fieldStyle}
//         />

//         <button className="btn btn-ember" type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }

// const fieldStyle = {
//   padding: "13px 14px",
//   borderRadius: 10,
//   border: "1px solid rgba(237, 239, 247, 0.18)",
//   background: "rgba(255, 255, 255, 0.06)",
//   color: "var(--text-on-ink)",
//   fontSize: 14,
//   outline: "none",
// };

// export default Login;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/theme.css";
// // import loginBackground from "../assets/images/login-background.png";
// import loginBackground from "../assets/login-background.png";
// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   function handleLogin(e) {
//     e.preventDefault();
//     navigate("/dashboard");
//   }

//   return (
//     <div
//       className="login-page"
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         backgroundImage: `url(${loginBackground})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Dark overlay over the background image */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "rgba(0, 0, 0, 0.30)",
//           zIndex: 0,
//         }}
//       />

//       <form
//         onSubmit={handleLogin}
//         className="glass-card"
//         style={{
//           width: 380,
//           padding: 36,
//           display: "flex",
//           flexDirection: "column",
//           gap: 16,
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         <span
//           className="eyebrow"
//           style={{
//             color: "#E8963D",
//           }}
//         >
//           Welcome back
//         </span>

//         <h2
//           style={{
//             margin: 0,
//             fontSize: 26,
//             color: "var(--text-on-ink)",
//           }}
//         >
//           IntelliResearch
//         </h2>

//         <p
//           style={{
//             margin: 0,
//             color: "var(--text-on-ink-muted)",
//             fontSize: 14,
//             marginBottom: 6,
//           }}
//         >
//           Log in to continue mapping your reading paths.
//         </p>

//         <input
//           className="field-on-ink"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={fieldStyle}
//         />

//         <input
//           className="field-on-ink"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={fieldStyle}
//         />

//         <button
//           className="btn btn-ember"
//           type="submit"
//           style={{
//             justifyContent: "center",
//             marginTop: 6,
//           }}
//         >
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }

// const fieldStyle = {
//   padding: "13px 14px",
//   borderRadius: 10,
//   border: "1px solid rgba(237, 239, 247, 0.18)",
//   background: "rgba(255, 255, 255, 0.06)",
//   color: "var(--text-on-ink)",
//   fontSize: 14,
//   outline: "none",
// };

// export default Login;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/theme.css";
// import loginBackground from "../assets/login-background.png";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   function handleLogin(e) {
//     e.preventDefault();

//     // Directly open the New Research page after login
//     navigate("/research/new");
//   }

//   return (
//     <div
//       className="login-page"
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         backgroundImage: `url(${loginBackground})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Dark overlay over the background image */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "rgba(0, 0, 0, 0.30)",
//           zIndex: 0,
//         }}
//       />

//       <form
//         onSubmit={handleLogin}
//         className="glass-card"
//         style={{
//           width: 380,
//           padding: 36,
//           display: "flex",
//           flexDirection: "column",
//           gap: 16,
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         <span
//           className="eyebrow"
//           style={{
//             color: "#E8963D",
//           }}
//         >
//           Welcome back
//         </span>

//         <h2
//           style={{
//             margin: 0,
//             fontSize: 26,
//             color: "var(--text-on-ink)",
//           }}
//         >
//           IntelliResearch
//         </h2>

//         <p
//           style={{
//             margin: 0,
//             color: "var(--text-on-ink-muted)",
//             fontSize: 14,
//             marginBottom: 6,
//           }}
//         >
//           Log in to continue mapping your reading paths.
//         </p>

//         <input
//           className="field-on-ink"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           style={fieldStyle}
//         />

//         <input
//           className="field-on-ink"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           style={fieldStyle}
//         />

//         <button
//           className="btn btn-ember"
//           type="submit"
//           style={{
//             justifyContent: "center",
//             marginTop: 6,
//           }}
//         >
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }

// const fieldStyle = {
//   padding: "13px 14px",
//   borderRadius: 10,
//   border: "1px solid rgba(237, 239, 247, 0.18)",
//   background: "rgba(255, 255, 255, 0.06)",
//   color: "var(--text-on-ink)",
//   fontSize: 14,
//   outline: "none",
// };

// export default Login;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/theme.css";
// import loginBackground from "../assets/login-background.png";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   function handleLogin(e) {
//     e.preventDefault();
//     setError("");

//     // Basic validation
//     if (!email.trim()) {
//       setError("Please enter your email.");
//       return;
//     }

//     if (!password.trim()) {
//       setError("Please enter your password.");
//       return;
//     }

//     /*
//       After login, go DIRECTLY to the Research Setup page.

//       The old flow was:
//         Login -> Dashboard -> New Research -> Research Setup

//       New flow:
//         Login -> Research Setup
//     */
//     navigate("/research/new");
//   }

//   return (
//     <div
//       className="login-page"
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "relative",
//         overflow: "hidden",

//         backgroundImage: `url(${loginBackground})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Dark overlay */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "rgba(0, 0, 0, 0.30)",
//           zIndex: 0,
//         }}
//       />

//       {/* Login Card */}
//       <form
//         onSubmit={handleLogin}
//         className="glass-card"
//         style={{
//           width: "min(380px, calc(100vw - 40px))",
//           padding: 36,

//           display: "flex",
//           flexDirection: "column",
//           gap: 16,

//           position: "relative",
//           zIndex: 1,

//           borderRadius: 18,
//           boxSizing: "border-box",
//         }}
//       >
//         {/* Heading */}
//         <span
//           className="eyebrow"
//           style={{
//             color: "#E8963D",
//           }}
//         >
//           Welcome back
//         </span>

//         <h2
//           style={{
//             margin: 0,
//             fontSize: 28,
//             lineHeight: 1.2,
//             color: "var(--text-on-ink)",
//           }}
//         >
//           IntelliResearch
//         </h2>

//         <p
//           style={{
//             margin: 0,
//             marginBottom: 6,
//             color: "var(--text-on-ink-muted)",
//             fontSize: 14,
//             lineHeight: 1.5,
//           }}
//         >
//           Log in to continue mapping your reading paths.
//         </p>

//         {/* Email */}
//         <input
//           className="field-on-ink"
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           autoComplete="email"
//           style={fieldStyle}
//         />

//         {/* Password */}
//         <input
//           className="field-on-ink"
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           autoComplete="current-password"
//           style={fieldStyle}
//         />

//         {/* Error */}
//         {error && (
//           <div
//             style={{
//               padding: "10px 12px",
//               borderRadius: 10,
//               background: "rgba(225, 75, 75, 0.12)",
//               border: "1px solid rgba(225, 75, 75, 0.35)",
//               color: "#ffb3b3",
//               fontSize: 13,
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {/* Login button */}
//         <button
//           className="btn btn-ember"
//           type="submit"
//           style={{
//             justifyContent: "center",
//             marginTop: 6,
//             width: "100%",
//           }}
//         >
//           Log In
//         </button>
//       </form>
//     </div>
//   );
// }

// const fieldStyle = {
//   width: "100%",
//   boxSizing: "border-box",

//   padding: "13px 14px",

//   borderRadius: 10,
//   border: "1px solid rgba(237, 239, 247, 0.18)",

//   background: "rgba(255, 255, 255, 0.06)",

//   color: "var(--text-on-ink)",

//   fontSize: 14,

//   outline: "none",
// };

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import loginBackground from "../assets/login-background.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

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
      }}
    >
      {/* Dark overlay over the background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.30)",
          zIndex: 0,
        }}
      />

      <form
        onSubmit={handleLogin}
        className="glass-card"
        style={{
          width: 380,
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
          }}
        >
          Welcome back
        </span>

        <h2
          style={{
            margin: 0,
            fontSize: 26,
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
            marginBottom: 6,
          }}
        >
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

        <button
          className="btn btn-ember"
          type="submit"
          style={{
            justifyContent: "center",
            marginTop: 6,
          }}
        >
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