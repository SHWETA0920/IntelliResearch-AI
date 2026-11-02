// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { api } from "../api/client";
// import "../styles/theme.css";
// import "../styles/AIAssistant.css";
// import researchBackground from "../assets/workspace-background.png";

// const SUGGESTED_QUESTIONS = [
//   "What should I read first?",
//   "What prerequisites do I need?",
//   "Explain the main concept simply.",
//   "Summarize this research topic.",
// ];

// function AIAssistant() {
//   const { id } = useParams();
//   const [research, setResearch] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     api.getResearch(id).then(setResearch).catch((err) => setError(err.message));
//   }, [id]);

//   function send(text) {
//     const question = text ?? input;
//     if (!question.trim() || sending) return;

//     setMessages((prev) => [...prev, { role: "user", text: question }]);
//     setInput("");
//     setSending(true);

//     api
//       .sendChatMessage(id, question)
//       .then((data) => {
//         setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
//         setSending(false);
//       })
//       .catch((err) => {
//         setMessages((prev) => [
//           ...prev,
//           { role: "assistant", text: `Error: ${err.message}` },
//         ]);
//         setSending(false);
//       });
//   }

//   // return (
//   //   <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
//   //     <div className="container" style={{ paddingTop: 24 }}>
//   //       <div className="pill-nav">
//   //         <Link to={`/research/${id}`} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--signal)" }}>
//   //           ← Back to Workspace
//   //         </Link>
//   //       </div>
//   //     </div>

//   //     <div className="container" style={{ marginTop: 30, maxWidth: 720 }}>
//   //       <span className="eyebrow">Grounded in your papers only</span>
//   //       <h1 style={{ fontSize: 32, marginTop: 14 }}>AI Research Assistant</h1>
//   //       {research && <p style={{ color: "var(--text-muted)", marginTop: 6 }}>{research.topic}</p>}
//   //       {error && (
//   //         <p style={{ color: "#E14B4B", background: "#FFECEC", padding: "10px 14px", borderRadius: 10, fontSize: 14, marginTop: 12 }}>
//   //           Error: {error}
//   //         </p>
//   //       )}

//   //       <div className="card" style={{ marginTop: 26, minHeight: 420, display: "flex", flexDirection: "column" }}>
//   //         <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
//   //           {messages.length === 0 && (
//   //             <div>
//   //               <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>Try asking:</p>
//   //               <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//   //                 {SUGGESTED_QUESTIONS.map((q) => (
//   //                   <button
//   //                     key={q}
//   //                     onClick={() => send(q)}
//   //                     className="btn btn-outline"
//   //                     style={{ fontSize: 13, padding: "8px 16px" }}
//   //                   >
//   //                     {q}
//   //                   </button>
//   //                 ))}
//   //               </div>
//   //             </div>
//   //           )}

//   //           {messages.map((m, i) => (
//   //             <div
//   //               key={i}
//   //               style={{
//   //                 alignSelf: m.role === "user" ? "flex-end" : "flex-start",
//   //                 background: m.role === "user" ? "var(--signal)" : "var(--bg)",
//   //                 color: m.role === "user" ? "white" : "var(--text-dark)",
//   //                 border: m.role === "user" ? "none" : "1px solid var(--border)",
//   //                 borderRadius: 14,
//   //                 padding: "12px 16px",
//   //                 maxWidth: "80%",
//   //                 fontSize: 14.5,
//   //                 lineHeight: 1.55,
//   //               }}
//   //             >
//   //               {m.text}
//   //             </div>
//   //           ))}
//   //           {sending && (
//   //             <p style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>Thinking...</p>
//   //           )}
//   //         </div>

//   //         <form
//   //           onSubmit={(e) => {
//   //             e.preventDefault();
//   //             send();
//   //           }}
//   //           style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}
//   //         >
//   //           <input
//   //             type="text"
//   //             value={input}
//   //             onChange={(e) => setInput(e.target.value)}
//   //             placeholder="Ask about your papers, prerequisites, or learning path..."
//   //             style={{
//   //               flex: 1,
//   //               padding: "12px 14px",
//   //               borderRadius: 10,
//   //               border: "1px solid var(--border)",
//   //               fontSize: 14,
//   //               outline: "none",
//   //               fontFamily: "var(--font-body)",
//   //             }}
//   //           />
//   //           <button className="btn btn-primary" type="submit" disabled={sending}>
//   //             Send
//   //           </button>
//   //         </form>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );

//   return (
//   <main
//     className="ai-assistant-page"
//     // style={{
//     //   backgroundImage: `url(${researchBackground})`,
//     // }}
//   >
//     <div className="ai-assistant-overlay" />

//     <div className="ai-assistant-content">

//       {/* TOP BAR */}
//       <header className="ai-assistant-topbar glass-card">
//         <div>
//           <span className="ai-assistant-eyebrow">
//             INTELLIGENT RESEARCH
//           </span>

//           <h1>AI Research Assistant</h1>

//           <p>
//             Ask questions and explore insights from your research papers.
//           </p>
//         </div>

//         <button
//           className="ai-back-button"
//           onClick={() => navigate(`/research/${id}`)}
//         >
//           ← Workspace
//         </button>
//       </header>


//       {/* MAIN AI CARD */}
//       <section className="ai-assistant-card glass-card">

//         <div className="ai-card-header">
//           <div className="ai-avatar">
//             ✦
//           </div>

//           <div>
//             <h2>Research Assistant</h2>
//             <span>
//               AI-powered research support
//             </span>
//           </div>

//           <div className="ai-status">
//             <span className="ai-status-dot" />
//             Ready
//           </div>
//         </div>


//         {/* CHAT AREA */}
//         <div className="ai-chat-area">

//           {messages.length === 0 ? (
//             <div className="ai-welcome">

//               <div className="ai-welcome-icon">
//                 ✦
//               </div>

//               <h2>
//                 How can I help with your research?
//               </h2>

//               <p>
//                 Ask about your papers, methods, findings,
//                 concepts, citations, or anything related to
//                 your research.
//               </p>

//               <div className="ai-suggestion-grid">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setMessage("Summarize the main findings of these papers.")
//                   }
//                 >
//                   <span>01</span>
//                   Summarize the main findings
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setMessage("Explain the methodology used in these papers.")
//                   }
//                 >
//                   <span>02</span>
//                   Explain the methodology
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setMessage("Compare the research approaches in these papers.")
//                   }
//                 >
//                   <span>03</span>
//                   Compare the research approaches
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setMessage("What are the key limitations discussed in these papers?")
//                   }
//                 >
//                   <span>04</span>
//                   Find key limitations
//                 </button>

//               </div>
//             </div>
//           ) : (
//             <div className="ai-messages">

//               {messages.map((message, index) => (
//                 <div
//                   key={index}
//                   className={`ai-message-row ${
//                     message.role === "user"
//                       ? "user-row"
//                       : "assistant-row"
//                   }`}
//                 >
//                   {message.role !== "user" && (
//                     <div className="message-avatar">
//                       ✦
//                     </div>
//                   )}

//                   <div
//                     className={`ai-message ${
//                       message.role === "user"
//                         ? "user-message"
//                         : "assistant-message"
//                     }`}
//                   >
//                     {message.content}
//                   </div>
//                 </div>
//               ))}

//               {loading && (
//                 <div className="ai-message-row assistant-row">
//                   <div className="message-avatar">
//                     ✦
//                   </div>

//                   <div className="assistant-message ai-thinking">
//                     <span />
//                     <span />
//                     <span />
//                   </div>
//                 </div>
//               )}

//             </div>
//           )}

//         </div>


//         {/* INPUT */}
//         <form
//           className="ai-input-area"
//           onSubmit={handleSubmit}
//         >
//           <div className="ai-input-wrapper">

//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Ask something about your research..."
//               rows={1}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   handleSubmit(e);
//                 }
//               }}
//             />

//             <button
//               type="submit"
//               className="ai-send-button"
//               disabled={loading || !message.trim()}
//             >
//               →
//             </button>

//           </div>

//           <p className="ai-input-hint">
//             Press Enter to send · Shift + Enter for a new line
//           </p>
//         </form>

//       </section>

//     </div>
//   </main>
// );
// }

// export default AIAssistant;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/theme.css";
import "../styles/AIAssistant.css";
import researchBackground from "../assets/AI.png";

const SUGGESTED_QUESTIONS = [
  "What should I read first?",
  "What prerequisites do I need?",
  "Explain the main concept simply.",
  "Summarize this research topic.",
];

function AIAssistant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [research, setResearch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getResearch(id)
      .then(setResearch)
      .catch((err) => setError(err.message));
  }, [id]);

  function send(text) {
    const question = text ?? input;

    if (!question.trim() || sending) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    setInput("");
    setSending(true);
    setError(null);

    api
      .sendChatMessage(id, question)
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              data.answer ||
              "I couldn't generate an answer for that question.",
          },
        ]);

        setSending(false);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `Error: ${err.message}`,
          },
        ]);

        setSending(false);
      });
  }

  return (
    <main className="ai-assistant-page"
    style={{ backgroundImage: `url(${researchBackground})` }}>
      <div className="ai-assistant-overlay" />

      <div className="ai-assistant-content">

        {/* TOP BAR */}
        <header className="ai-assistant-topbar glass-card">
          <div>
            <span className="ai-assistant-eyebrow">
              INTELLIGENT RESEARCH
            </span>

            <h1>AI Research Assistant</h1>

            <p>
              Ask questions and explore insights from your research papers.
            </p>

            {research && (
              <span className="ai-research-topic">
                {research.topic}
              </span>
            )}

            {error && (
              <p className="ai-error">
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            className="ai-back-button"
            onClick={() => navigate(`/research/${id}`)}
          >
            ← Workspace
          </button>
        </header>


        {/* MAIN AI CARD */}
        <section className="ai-assistant-card glass-card">

          {/* CARD HEADER */}
          <div className="ai-card-header">

            <div className="ai-avatar">
              ✦
            </div>

            <div>
              <h2>Research Assistant</h2>

              <span>
                AI-powered research support
              </span>
            </div>

            <div className="ai-status">
              <span className="ai-status-dot" />
              {sending ? "Thinking..." : "Ready"}
            </div>

          </div>


          {/* CHAT AREA */}
          <div className="ai-chat-area">

            {messages.length === 0 ? (
              <div className="ai-welcome">

                <div className="ai-welcome-icon">
                  ✦
                </div>

                <h2>
                  How can I help with your research?
                </h2>

                <p>
                  Ask about your papers, methods, findings,
                  concepts, citations, or anything related to
                  your research.
                </p>


                {/* SUGGESTED QUESTIONS */}
                <div className="ai-suggestion-grid">

                  <button
                    type="button"
                    onClick={() =>
                      send(
                        "Summarize the main findings of these papers."
                      )
                    }
                  >
                    <span>01</span>
                    Summarize the main findings
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      send(
                        "Explain the methodology used in these papers."
                      )
                    }
                  >
                    <span>02</span>
                    Explain the methodology
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      send(
                        "Compare the research approaches in these papers."
                      )
                    }
                  >
                    <span>03</span>
                    Compare the research approaches
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      send(
                        "What are the key limitations discussed in these papers?"
                      )
                    }
                  >
                    <span>04</span>
                    Find key limitations
                  </button>

                </div>
              </div>
            ) : (
              <div className="ai-messages">

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`ai-message-row ${
                      message.role === "user"
                        ? "user-row"
                        : "assistant-row"
                    }`}
                  >

                    {message.role !== "user" && (
                      <div className="message-avatar">
                        ✦
                      </div>
                    )}

                    <div
                      className={`ai-message ${
                        message.role === "user"
                          ? "user-message"
                          : "assistant-message"
                      }`}
                    >
                      {message.text}
                    </div>

                  </div>
                ))}


                {/* THINKING INDICATOR */}
                {sending && (
                  <div className="ai-message-row assistant-row">

                    <div className="message-avatar">
                      ✦
                    </div>

                    <div className="assistant-message ai-thinking">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>


          {/* INPUT AREA */}
          <form
            className="ai-input-area"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >

            <div className="ai-input-wrapper">

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something about your research..."
                rows={1}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />

              <button
                type="submit"
                className="ai-send-button"
                disabled={sending || !input.trim()}
              >
                →
              </button>

            </div>

            <p className="ai-input-hint">
              Press Enter to send · Shift + Enter for a new line
            </p>

          </form>

        </section>

      </div>
    </main>
  );
}

export default AIAssistant;