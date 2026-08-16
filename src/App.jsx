import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ResearchSetup from "./pages/ResearchSetup";
import ResearchWorkspace from "./pages/ResearchWorkspace";
import PaperExplorer from "./pages/PaperExplorer";
import AIAssistant from "./pages/AIAssistant";
import ChatWidget from "./components/ChatWidget";

function AppLayout() {
  const location = useLocation();

  // Extract a research id from the URL if present, e.g. /research/2 or /research/2/papers
  const match = location.pathname.match(/^\/research\/(\d+)/);
  const researchId = match ? match[1] : null;

  // Hide the widget on public/pre-login pages
  const hideOn = ["/", "/about", "/contact", "/login"];
  const showWidget = !hideOn.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/research/new" element={<ResearchSetup />} />
        <Route path="/research/:id" element={<ResearchWorkspace />} />
        <Route path="/research/:id/papers" element={<PaperExplorer />} />
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