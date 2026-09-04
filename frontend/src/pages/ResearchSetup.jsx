// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/client";
// import "../styles/theme.css";

// const KNOWN_CONCEPTS = [
//   "Programming Basics",
//   "Arrays",
//   "Recursion",
//   "Dynamic Programming",
//   "Graph Algorithms",
// ];

// const GOALS = [
//   "Understand the topic",
//   "Read research papers",
//   "Prepare for research",
//   "Explore advanced work",
// ];

// function ResearchSetup() {
//   const navigate = useNavigate();

//   const [topic, setTopic] = useState("");
//   const [files, setFiles] = useState([]);
//   const [knownConcepts, setKnownConcepts] = useState([]);
//   const [goal, setGoal] = useState(GOALS[0]);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   function toggleConcept(concept) {
//     setKnownConcepts((prev) =>
//       prev.includes(concept) ? prev.filter((c) => c !== concept) : [...prev, concept]
//     );
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);

//     if (!topic.trim()) {
//       setError("Please enter a topic.");
//       return;
//     }
//     if (files.length < 2) {
//       setError("Please upload at least 2 PDFs.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const research = await api.createResearch({ topic, status: "pending" });

//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("research", research.id);
//         formData.append("file", file);
//         await fetch("http://127.0.0.1:8000/api/papers/", {
//           method: "POST",
//           body: formData,
//         });
//       }

//       await api.analyzeResearch(research.id);

//       navigate(`/research/${research.id}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 60 }}>
//       <div className="container" style={{ paddingTop: 40, maxWidth: 760 }}>
//         <span className="eyebrow">Step 1 of 1</span>
//         <h1 className="fluid-h1" style={{ marginTop: 14 }}>What do you want to learn?</h1>
//         <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
//           Give a topic and a few papers — we'll take it from there.
//         </p>

//         <form onSubmit={handleSubmit} style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 20 }}>
//           {/* Topic + upload */}
//           <div className="card">
//             <label style={labelStyle}>Research Topic</label>
//             <input
//               type="text"
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="e.g. Dynamic Programming"
//               style={inputStyle}
//             />

//             <label style={{ ...labelStyle, marginTop: 20 }}>Upload Papers</label>
//             <div
//               style={{
//                 border: "2px dashed var(--border)",
//                 borderRadius: 14,
//                 padding: "28px 20px",
//                 textAlign: "center",
//                 background: "var(--primary-light)",
//               }}
//             >
//               <div style={{ fontSize: 28 }}>📄</div>
//               <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0 14px" }}>
//                 Drop PDFs here, or browse — at least 2 required
//               </p>
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 multiple
//                 onChange={(e) => setFiles(Array.from(e.target.files))}
//               />
//             </div>

//             {files.length > 0 && (
//               <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
//                 {files.map((f, i) => (
//                   <span key={i} className="badge badge-teal">
//                     ✓ {f.name}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Existing knowledge */}
//           <div className="card">
//             <label style={labelStyle}>What do you already know? (optional)</label>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
//               {KNOWN_CONCEPTS.map((concept) => {
//                 const active = knownConcepts.includes(concept);
//                 return (
//                   <button
//                     type="button"
//                     key={concept}
//                     onClick={() => toggleConcept(concept)}
//                     style={{
//                       padding: "8px 16px",
//                       borderRadius: 999,
//                       border: active ? "1.5px solid var(--signal)" : "1.5px solid var(--border)",
//                       background: active ? "var(--primary-light)" : "white",
//                       color: active ? "var(--signal)" : "var(--text-muted)",
//                       fontSize: 13,
//                       fontWeight: 600,
//                       cursor: "pointer",
//                     }}
//                   >
//                     {active ? "✓ " : ""}
//                     {concept}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Goal */}
//           <div className="card">
//             <label style={labelStyle}>What is your goal?</label>
//             <div className="grid-2" style={{ gap: 10, marginTop: 12 }}>
//               {GOALS.map((g) => {
//                 const active = goal === g;
//                 return (
//                   <button
//                     type="button"
//                     key={g}
//                     onClick={() => setGoal(g)}
//                     style={{
//                       padding: "14px 16px",
//                       borderRadius: 12,
//                       textAlign: "left",
//                       border: active ? "1.5px solid var(--signal)" : "1.5px solid var(--border)",
//                       background: active ? "var(--primary-light)" : "white",
//                       color: active ? "var(--signal)" : "var(--text-dark)",
//                       fontSize: 14,
//                       fontWeight: 600,
//                       cursor: "pointer",
//                     }}
//                   >
//                     {active ? "● " : "○ "}
//                     {g}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {error && (
//             <p style={{ color: "#E14B4B", background: "#FFECEC", padding: "10px 14px", borderRadius: 10, fontSize: 14 }}>
//               {error}
//             </p>
//           )}

//           <button type="submit" disabled={submitting} className="btn btn-primary" style={{ alignSelf: "center", padding: "14px 40px", fontSize: 16 }}>
//             {submitting ? "Analyzing..." : "Analyze Papers →"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// const labelStyle = {
//   display: "block",
//   fontWeight: 700,
//   fontSize: 14,
//   color: "var(--text-dark)",
//   marginBottom: 8,
// };

// const inputStyle = {
//   width: "100%",
//   padding: "12px 14px",
//   borderRadius: 10,
//   border: "1px solid var(--border)",
//   fontSize: 15,
//   outline: "none",
// };

// export default ResearchSetup;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/client";
// import "../styles/theme.css";
// import researchBackground from "../assets/research-background.png";

// function ResearchSetup() {
//   const navigate = useNavigate();

//   const [topic, setTopic] = useState("");
//   const [files, setFiles] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);

//     if (!topic.trim()) {
//       setError("Please enter a topic.");
//       return;
//     }

//     if (files.length < 2) {
//       setError("Please upload at least 2 PDFs.");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const research = await api.createResearch({
//         topic,
//         status: "pending",
//       });

//       for (const file of files) {
//         const formData = new FormData();

//         formData.append("research", research.id);
//         formData.append("file", file);

//         await fetch("http://127.0.0.1:8000/api/papers/", {
//           method: "POST",
//           body: formData,
//         });
//       }

//       await api.analyzeResearch(research.id);

//       navigate(`/research/${research.id}`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         position: "relative",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "50px 20px",
//         boxSizing: "border-box",

//         backgroundImage: `url(${researchBackground})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",

//         overflow: "hidden",
//       }}
//     >
//       {/* Background overlay */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "rgba(20, 16, 12, 0.30)",
//           zIndex: 0,
//         }}
//       />

//       {/* Main research setup box */}
//       <div
//         style={{
//           width: "100%",
//           maxWidth: 820,
//           position: "relative",
//           zIndex: 1,

//           padding: "42px 46px",

//           background: "rgba(24, 21, 18, 0.82)",
//           backdropFilter: "blur(12px)",
//           WebkitBackdropFilter: "blur(12px)",

//           border: "1px solid rgba(232, 150, 61, 0.55)",
//           borderRadius: 22,

//           boxShadow:
//             "0 25px 70px rgba(0, 0, 0, 0.45)",

//           boxSizing: "border-box",
//         }}
//       >
//         {/* Header */}
//         <div style={{ marginBottom: 32 }}>
//           <span
//             style={{
//               display: "inline-block",
//               color: "#E8963D",
//               fontSize: 13,
//               fontWeight: 700,
//               letterSpacing: "0.16em",
//               textTransform: "uppercase",
//               marginBottom: 12,
//             }}
//           >
//             Start a new research
//           </span>

//           <h1
//             style={{
//               margin: 0,
//               color: "#F5F1EA",
//               fontSize: "clamp(30px, 4vw, 42px)",
//               lineHeight: 1.15,
//               fontWeight: 700,
//             }}
//           >
//             Build your research path
//           </h1>

//           <p
//             style={{
//               margin: "12px 0 0",
//               color: "rgba(245, 241, 234, 0.72)",
//               fontSize: 15,
//               lineHeight: 1.6,
//               maxWidth: 650,
//             }}
//           >
//             Enter your research topic and upload the papers you want
//             IntelliResearch to analyze.
//           </p>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 26,
//           }}
//         >
//           {/* Research Topic */}
//           <div>
//             <label
//               style={{
//                 display: "block",
//                 color: "#E8963D",
//                 fontWeight: 700,
//                 fontSize: 15,
//                 marginBottom: 10,
//               }}
//             >
//               Research Topic
//             </label>

//             <input
//               type="text"
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               placeholder="e.g. Dynamic Programming"
//               style={{
//                 width: "100%",
//                 padding: "16px 18px",
//                 boxSizing: "border-box",

//                 borderRadius: 12,
//                 border: "1px solid rgba(237, 239, 247, 0.22)",

//                 background: "rgba(255, 255, 255, 0.07)",
//                 color: "#F5F1EA",

//                 fontSize: 15,
//                 outline: "none",

//                 transition: "border 0.2s ease, background 0.2s ease",
//               }}
//             />
//           </div>

//           {/* Upload Papers */}
//           <div>
//             <label
//               style={{
//                 display: "block",
//                 color: "#E8963D",
//                 fontWeight: 700,
//                 fontSize: 15,
//                 marginBottom: 10,
//               }}
//             >
//               Upload Papers
//             </label>

//             <div
//               style={{
//                 border: "1.5px dashed rgba(237, 239, 247, 0.38)",
//                 borderRadius: 14,
//                 padding: "32px 20px",
//                 textAlign: "center",

//                 background: "rgba(255, 255, 255, 0.045)",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 38,
//                   marginBottom: 10,
//                 }}
//               >
//                 ☁️
//               </div>

//               <p
//                 style={{
//                   color: "#F5F1EA",
//                   fontSize: 15,
//                   margin: "0 0 6px",
//                   fontWeight: 600,
//                 }}
//               >
//                 Upload your research papers
//               </p>

//               <p
//                 style={{
//                   color: "rgba(245, 241, 234, 0.62)",
//                   fontSize: 13,
//                   margin: "0 0 18px",
//                 }}
//               >
//                 Select multiple PDF files — at least 2 required
//               </p>

//               <label
//                 style={{
//                   display: "inline-block",
//                   padding: "11px 22px",
//                   borderRadius: 10,

//                   border: "1px solid #E8963D",
//                   background: "rgba(232, 150, 61, 0.10)",

//                   color: "#E8963D",
//                   fontSize: 14,
//                   fontWeight: 700,

//                   cursor: "pointer",
//                 }}
//               >
//                 Browse Files

//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   multiple
//                   onChange={(e) =>
//                     setFiles(Array.from(e.target.files))
//                   }
//                   style={{ display: "none" }}
//                 />
//               </label>
//             </div>

//             {/* Selected files */}
//             {files.length > 0 && (
//               <div
//                 style={{
//                   marginTop: 14,
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 8,
//                 }}
//               >
//                 {files.map((file, index) => (
//                   <div
//                     key={index}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 10,

//                       padding: "10px 13px",
//                       borderRadius: 9,

//                       background: "rgba(232, 150, 61, 0.10)",
//                       border:
//                         "1px solid rgba(232, 150, 61, 0.25)",

//                       color: "#F5F1EA",
//                       fontSize: 13,
//                     }}
//                   >
//                     <span style={{ color: "#E8963D" }}>✓</span>

//                     <span
//                       style={{
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {file.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Error */}
//           {error && (
//             <p
//               style={{
//                 color: "#FFB4A8",
//                 background: "rgba(225, 75, 75, 0.12)",
//                 border:
//                   "1px solid rgba(225, 75, 75, 0.25)",
//                 padding: "11px 14px",
//                 borderRadius: 10,
//                 fontSize: 14,
//                 margin: 0,
//               }}
//             >
//               {error}
//             </p>
//           )}

//           {/* Continue button */}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               marginTop: 4,
//             }}
//           >
//             <button
//               type="submit"
//               disabled={submitting}
//               style={{
//                 padding: "14px 28px",
//                 borderRadius: 11,

//                 border: "1px solid #E8963D",

//                 background: submitting
//                   ? "rgba(232, 150, 61, 0.45)"
//                   : "#E8963D",

//                 color: "#181512",

//                 fontSize: 15,
//                 fontWeight: 700,

//                 cursor: submitting
//                   ? "not-allowed"
//                   : "pointer",

//                 boxShadow:
//                   "0 8px 24px rgba(232, 150, 61, 0.22)",

//                 transition:
//                   "transform 0.2s ease, background 0.2s ease",
//               }}
//             >
//               {submitting ? "Analyzing..." : "Analyze Papers →"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ResearchSetup;

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/client";
// import "../styles/theme.css";
import researchBackground from "../assets/research-background.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";

function ResearchSetup() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    if (files.length < 2) {
      setError("Please upload at least 2 PDFs.");
      return;
    }

    setSubmitting(true);

    try {
      const research = await api.createResearch({
        topic,
        status: "pending",
      });

      for (const file of files) {
        const formData = new FormData();

        formData.append("research", research.id);
        formData.append("file", file);

        await fetch("http://127.0.0.1:8000/api/papers/", {
          method: "POST",
          body: formData,
        });
      }

      await api.analyzeResearch(research.id);

      navigate(`/research/${research.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        boxSizing: "border-box",

        backgroundImage: `url(${researchBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        overflow: "hidden",
      }}
    >
      {/* Background overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20, 16, 12, 0.30)",
          zIndex: 0,
        }}
      />

      {/* Medium-sized research setup box */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          position: "relative",
          zIndex: 1,

          padding: "30px 34px",

          background: "rgba(24, 21, 18, 0.84)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",

          border: "1px solid rgba(232, 150, 61, 0.55)",
          borderRadius: 18,

          boxShadow: "0 20px 55px rgba(0, 0, 0, 0.45)",

          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <span
            style={{
              display: "inline-block",
              color: "#E8963D",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Start a new research
          </span>

          <h1
            style={{
              margin: 0,
              color: "#F5F1EA",
              fontSize: "clamp(28px, 3.5vw, 36px)",
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            Build your research path
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "rgba(245, 241, 234, 0.70)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Enter your research topic and upload the papers you want
            IntelliResearch to analyze.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Research Topic */}
          <div>
            <label
              style={{
                display: "block",
                color: "#E8963D",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 7,
              }}
            >
              Research Topic
            </label>

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming"
              style={{
                width: "100%",
                padding: "13px 15px",
                boxSizing: "border-box",

                borderRadius: 10,
                border: "1px solid rgba(237, 239, 247, 0.22)",

                background: "rgba(255, 255, 255, 0.07)",
                color: "#F5F1EA",

                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Upload Papers */}
          <div>
            <label
              style={{
                display: "block",
                color: "#E8963D",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 7,
              }}
            >
              Upload Papers
            </label>

            <div
              style={{
                border: "1.5px dashed rgba(237, 239, 247, 0.35)",
                borderRadius: 12,
                padding: "20px 18px",
                textAlign: "center",

                background: "rgba(255, 255, 255, 0.045)",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  marginBottom: 5,
                }}
              >
                📄
              </div>

              <p
                style={{
                  color: "#F5F1EA",
                  fontSize: 14,
                  margin: "0 0 4px",
                  fontWeight: 600,
                }}
              >
                Upload your research papers
              </p>

              <p
                style={{
                  color: "rgba(245, 241, 234, 0.60)",
                  fontSize: 12,
                  margin: "0 0 12px",
                }}
              >
                Select multiple PDF files — at least 2 required
              </p>

              <label
                style={{
                  display: "inline-block",
                  padding: "9px 18px",
                  borderRadius: 9,

                  border: "1px solid #E8963D",
                  background: "rgba(232, 150, 61, 0.10)",

                  color: "#E8963D",
                  fontSize: 13,
                  fontWeight: 700,

                  cursor: "pointer",
                }}
              >
                Browse Files

                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) =>
                    setFiles(Array.from(e.target.files))
                  }
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Selected files */}
            {files.length > 0 && (
              <div
                style={{
                  marginTop: 9,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {files.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,

                      padding: "7px 10px",
                      borderRadius: 8,

                      background: "rgba(232, 150, 61, 0.10)",
                      border:
                        "1px solid rgba(232, 150, 61, 0.25)",

                      color: "#F5F1EA",
                      fontSize: 12,
                      maxWidth: "100%",
                    }}
                  >
                    <span style={{ color: "#E8963D" }}>✓</span>

                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                color: "#FFB4A8",
                background: "rgba(225, 75, 75, 0.12)",
                border:
                  "1px solid rgba(225, 75, 75, 0.25)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* Analyze button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 2,
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 24px",
                borderRadius: 10,

                border: "1px solid #E8963D",

                background: submitting
                  ? "rgba(232, 150, 61, 0.45)"
                  : "#E8963D",

                color: "#181512",

                fontSize: 14,
                fontWeight: 700,

                cursor: submitting
                  ? "not-allowed"
                  : "pointer",

                boxShadow:
                  "0 7px 20px rgba(232, 150, 61, 0.20)",
              }}
            >
              {submitting ? "Analyzing..." : "Analyze Papers →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResearchSetup;
