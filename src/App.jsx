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

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";
import PaperExplorer from "./pages/PaperExplorer";
import AIAssistant from "./pages/AIAssistant";
import ChatWidget from "./components/ChatWidget";
import PaperAnalysisPage from "./pages/PaperAnalysisPage";

function AppLayout() {
  const location = useLocation();

  // Extract a research id from the URL if present, e.g. /research/2 or /research/2/papers
  const match = location.pathname.match(/^\/research\/(\d+)/);
  const researchId = match ? match[1] : null;

  // Hide the widget on public/pre-login pages
  const hideOn = ["/", "/login"];
  const showWidget = !hideOn.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
        <Route path="/research/:id/papers" element={<PaperExplorer />} />
        <Route path="/research/:id/assistant" element={<AIAssistant />} />
        <Route path="/research/:id/analysis" element={<PaperAnalysisPage />} />
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