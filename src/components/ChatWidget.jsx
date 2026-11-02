// import { useState } from "react";
// import { api } from "../api/client";

// function ChatWidget({ researchId }) {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [sending, setSending] = useState(false);

//   function send(text) {
//   const question = text ?? input;
//   if (!question.trim() || sending || !researchId) return;

//     setMessages((prev) => [...prev, { role: "user", text: question }]);
//     setInput("");
//     setSending(true);

//     api
//       .sendChatMessage(researchId, question)
//       .then((data) => {
//         setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
//         setSending(false);
//       })
//       .catch((err) => {
//         setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message}` }]);
//         setSending(false);
//       });
//   }

//   return (
//     <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
//       {open && (
//         <div
//           className="card"
//           style={{
//             width: 340,
//             height: 440,
//             marginBottom: 14,
//             display: "flex",
//             flexDirection: "column",
//             padding: 0,
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               background: "var(--signal)",
//               color: "white",
//               padding: "14px 18px",
//               fontWeight: 700,
//               fontFamily: "var(--font-display)",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             AI Research Assistant
//             <span style={{ cursor: "pointer", fontSize: 18 }} onClick={() => setOpen(false)}>
//               ×
//             </span>
//           </div>

//           <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
//             {messages.length === 0 && (
//             <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
//                 {researchId
//                 ? "Ask about prerequisites, papers, or your learning path."
//                 : "Open a research session to ask questions about your papers."}
//             </p>
//             )}
//             {messages.map((m, i) => (
//               <div
//                 key={i}
//                 style={{
//                   alignSelf: m.role === "user" ? "flex-end" : "flex-start",
//                   background: m.role === "user" ? "var(--primary-light)" : "var(--bg)",
//                   color: "var(--text-dark)",
//                   borderRadius: 12,
//                   padding: "8px 12px",
//                   maxWidth: "85%",
//                   fontSize: 13,
//                 }}
//               >
//                 {m.text}
//               </div>
//             ))}
//             {sending && <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>Thinking...</p>}
//           </div>

//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               send();
//             }}
//             style={{ display: "flex", borderTop: "1px solid var(--border)", padding: 10, gap: 8 }}
//           >
//             <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder={researchId ? "Ask a question..." : "Open a research first..."}
//             disabled={!researchId}
//               style={{
//                 flex: 1,
//                 padding: "8px 10px",
//                 borderRadius: 8,
//                 border: "1px solid var(--border)",
//                 fontSize: 13,
//                 outline: "none",
//               }}
//             />
//             <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} type="submit">
//               Send
//             </button>
//           </form>
//         </div>
//       )}

//       <button
//         onClick={() => setOpen((o) => !o)}
//         style={{
//           width: 58,
//           height: 58,
//           borderRadius: "50%",
//           background: "var(--ember)",
//           color: "var(--ink)",
//           border: "none",
//           fontSize: 24,
//           cursor: "pointer",
//           boxShadow: "0 8px 20px rgba(232,150,61,0.4)",
//         }}
//       >
//         {open ? "×" : "💬"}
//       </button>
//     </div>
//   );
// }

// export default ChatWidget;

import { useState } from "react";
import { api } from "../api/client";

function ChatWidget({ researchId }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  function send(text) {
  const question = text ?? input;
  if (!question.trim() || sending || !researchId) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    api
      .sendChatMessage(researchId, question)
      .then((data) => {
        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
        setSending(false);
      })
      .catch((err) => {
        setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message}` }]);
        setSending(false);
      });
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {open && (
        <div
          className="card"
          style={{
            width: 340,
            height: 440,
            marginBottom: 14,
            display: "flex",
            flexDirection: "column",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "var(--signal)",
              color: "white",
              padding: "14px 18px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            AI Research Assistant
            <span style={{ cursor: "pointer", fontSize: 18 }} onClick={() => setOpen(false)}>
              ×
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {researchId
                ? "Ask about prerequisites, papers, or your learning path."
                : "Open a research session to ask questions about your papers."}
            </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--primary-light)" : "var(--bg)",
                  color: "var(--text-dark)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  maxWidth: "85%",
                  fontSize: 13,
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>Thinking...</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{ display: "flex", borderTop: "1px solid var(--border)", padding: 10, gap: 8 }}
          >
            <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={researchId ? "Ask a question..." : "Open a research first..."}
            disabled={!researchId}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} type="submit">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "var(--ember)",
          color: "var(--ink)",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(232,150,61,0.4)",
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;