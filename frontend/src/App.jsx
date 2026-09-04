// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// import Landing from "./pages/Landing";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import ResearchSetup from "./pages/ResearchSetup";
// import ResearchWorkspace from "./pages/ResearchWorkspace";
// import PaperExplorer from "./pages/PaperExplorer";
// import AIAssistant from "./pages/AIAssistant";
// import ChatWidget from "./components/ChatWidget";

// function AppLayout() {
//   const location = useLocation();

//   const match = location.pathname.match(/^\/research\/(\d+)/);
//   const researchId = match ? match[1] : null;

//   const hideOn = ["/", "/about", "/contact", "/login"];
//   const showWidget =
//     !hideOn.includes(location.pathname) &&
//     !location.pathname.startsWith("/research/");

//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<Landing />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/login" element={<Login />} />

//         <Route path="/research/new" element={<ResearchSetup />} />
//         <Route path="/research/:id" element={<ResearchWorkspace />} />

//         <Route path="/research/:id/papers" element={<PaperExplorer />} />
//         <Route path="/research/:id/assistant" element={<AIAssistant />} />
//       </Routes>

//       {showWidget && <ChatWidget researchId={researchId} />}
//     </>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AppLayout />
//     </BrowserRouter>
//   );
// }

// export default App;


// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// // HER PAGES
// import Landing from "./pages/Landing";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
// import AIAssistant from "./pages/AIAssistant";

// // YOUR PAGES
// import Login from "./pages/Login";
// import ResearchSetup from "./pages/ResearchSetup";
// import ResearchWorkspace from "./pages/ResearchWorkspace";
// import PaperExplorer from "./pages/PaperExplorer";

// import ChatWidget from "./components/ChatWidget";

// function AppLayout() {
//   const location = useLocation();

//   // Get research ID from:
//   // /research/1
//   // /research/1/papers
//   // /research/1/assistant
//   const match = location.pathname.match(/^\/research\/(\d+)/);
//   const researchId = match ? match[1] : null;

//   /*
//    * AI Assistant is a separate page.
//    * The research workspace also has its own UI,
//    * so the floating ChatWidget should not appear there.
//    */
//   const isResearchPage =
//     location.pathname.startsWith("/research/");

//   const hideWidget =
//     location.pathname === "/" ||
//     location.pathname === "/about" ||
//     location.pathname === "/contact" ||
//     location.pathname === "/login" ||
//     isResearchPage;

//   const showWidget = !hideWidget;

//   return (
//     <>
//       <Routes>

//         {/* =========================
//             HER — FIRST OPENING PAGE
//             ========================= */}
//         <Route
//           path="/"
//           element={<Landing />}
//         />

//         {/* HER — ABOUT */}
//         <Route
//           path="/about"
//           element={<About />}
//         />

//         {/* HER — CONTACT */}
//         <Route
//           path="/contact"
//           element={<Contact />}
//         />

//         {/* =========================
//             YOUR — LOGIN
//             ========================= */}
//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         {/* =========================
//             YOUR — RESEARCH SETUP
//             + PAPER UPLOAD
//             SAME PAGE
//             ========================= */}
//         <Route
//           path="/research/new"
//           element={<ResearchSetup />}
//         />

//         {/* =========================
//             YOUR — RESEARCH WORKSPACE
//             ========================= */}
//         <Route
//           path="/research/:id"
//           element={<ResearchWorkspace />}
//         />

//         {/* YOUR — PAPER EXPLORER */}
//         <Route
//           path="/research/:id/papers"
//           element={<PaperExplorer />}
//         />

//         {/* =========================
//             HER — AI ASSISTANT
//             SEPARATE PAGE
//             ========================= */}
//         <Route
//           path="/research/:id/assistant"
//           element={<AIAssistant />}
//         />

//       </Routes>

//       {/* Floating widget is not shown
//           on the research pages because
//           AI Assistant is a separate page. */}
//       {showWidget && (
//         <ChatWidget researchId={researchId} />
//       )}
//     </>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AppLayout />
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";
import PaperExplorer from "./pages/PaperExplorer";

import AIAssistant from "./pages/AIAssistant";
import ChatWidget from "./components/ChatWidget";

function AppLayout() {
  const location = useLocation();

  // Get research ID from:
  // /research/1
  // /research/1/papers
  // /research/1/assistant
  const match = location.pathname.match(/^\/research\/(\d+)/);
  const researchId = match ? match[1] : null;

  // No floating chatbot on public pages
  const hideWidget = [
    "/",
    "/about",
    "/contact",
    "/login",
  ].includes(location.pathname);

  // Also don't show the floating widget inside the
  // research flow because Workspace has its own footer
  // AI Assistant button.
  const isResearchPage =
    location.pathname.startsWith("/research/");

  const showWidget =
    !hideWidget &&
    !isResearchPage;

  return (
    <>
      <Routes>
        {/* HER OPENING PAGE */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* YOUR RESEARCH FLOW */}
        <Route path="/login" element={<Login />} />
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
        <Route path="/research/:id/papers" element={<PaperExplorer />} />

        {/* HER SEPARATE AI ASSISTANT PAGE */}
        <Route
          path="/research/:id/assistant"
          element={<AIAssistant />}
        />
      </Routes>

      {showWidget && (
        <ChatWidget researchId={researchId} />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;