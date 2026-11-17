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

//   // Get research ID from:
//   // /research/1
//   // /research/1/papers
//   // /research/1/assistant
//   const match = location.pathname.match(/^\/research\/(\d+)/);
//   const researchId = match ? match[1] : null;

//   // No floating chatbot on public pages
//   const hideWidget = [
//     "/",
//     "/about",
//     "/contact",
//     "/login",
//   ].includes(location.pathname);

//   // Also don't show the floating widget inside the
//   // research flow because Workspace has its own footer
//   // AI Assistant button.
//   const isResearchPage =
//     location.pathname.startsWith("/research/");

//   const showWidget =
//     !hideWidget &&
//     !isResearchPage;

//   return (
//     <>
//       <Routes>
//         {/* HER OPENING PAGE */}
//         <Route path="/" element={<Landing />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />

//         {/* YOUR RESEARCH FLOW */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/research/new" element={<ResearchSetup />} />
//         <Route path="/research/:id" element={<ResearchWorkspace />} />
//         <Route path="/research/:id/papers" element={<PaperExplorer />} />

//         {/* HER SEPARATE AI ASSISTANT PAGE */}
//         <Route
//           path="/research/:id/assistant"
//           element={<AIAssistant />}
//         />
//       </Routes>

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

import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";

// Public / landing flow
import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Auth + dashboard
import Login from "./pages/Login";
import Home from "./pages/Home";

// Research flow
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";
import PaperExplorer from "./pages/PaperExplorer";
import PaperAnalysisPage from "./pages/PaperAnalysisPage";
import AIAssistant from "./pages/AIAssistant";

// Shared
import ChatWidget from "./components/ChatWidget";

// Pages where the floating ChatWidget must NOT appear.
// Add or remove entries here without touching the rest of the file.
const WIDGET_HIDDEN_PATHS = [
  "/",                         // landing
  "/about",                    // public
  "/contact",                  // public
  "/login",                    // pre-login
  "/research/new",             // setup form
  "/research/:id",             // Workspace has its own footer AI button
  "/research/:id/assistant",   // this IS the assistant page
];

function AppLayout() {
  const location = useLocation();

  // Extract research id from /research/1, /research/1/papers, etc.
  const match = location.pathname.match(/^\/research\/(\d+)/);
  const researchId = match ? match[1] : null;

  // MERGE CONFLICT: the two versions decide differently where the widget is
  // hidden. The WIDGET_HIDDEN_PATHS logic below is active. The other
  // version's logic is kept here, commented out:
  //
  //   // Hide the widget on public/pre-login pages
  //   const hideOn = ["/", "/login"];
  //   const showWidget = !hideOn.includes(location.pathname);
  //
  const showWidget = !WIDGET_HIDDEN_PATHS.some((path) =>
    matchPath({ path, end: true }, location.pathname)
  );

  return (
    <>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth + dashboard */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />

        {/* Research flow */}
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
        <Route path="/research/:id/papers" element={<PaperExplorer />} />
        <Route path="/research/:id/analysis" element={<PaperAnalysisPage />} />
        <Route path="/research/:id/assistant" element={<AIAssistant />} />
      </Routes>

      {showWidget && <ChatWidget researchId={researchId} />}
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