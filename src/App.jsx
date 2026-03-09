import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Contacts from "./pages/Contacts";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import { useAuth } from "./lib/hooks";

// Global styles injection
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes fs-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fs-slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes fs-scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes fs-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  @keyframes fs-barGrow { from { width:0%; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow: hidden; }
  .fs-hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .fs-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(60, 64, 67, 0.08); }
  .fs-nav-item { transition: background 0.15s ease, color 0.15s ease; }
  .fs-nav-item:hover { background: #F1F3F4; }
  .fs-view-btn { transition: all 0.15s ease; }
  .fs-view-btn:hover { background: #F1F3F4; }
  input::placeholder, textarea::placeholder { color: #9AA0A6; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: #DADCE0; border-radius: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  select { appearance: none; -webkit-appearance: none; }
`;
if (!document.querySelector("style[data-fs]")) {
  styleTag.setAttribute("data-fs", "1");
  document.head.appendChild(styleTag);
}

// Font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
if (!document.querySelector('link[href*="Nunito"]')) document.head.appendChild(fontLink);

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Nunito', sans-serif", color: "#5F6368", fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Login onAuth={(mode, email, password) =>
        mode === "signin" ? signIn(email, password) : signUp(email, password)
      } />
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onSignOut={signOut}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
