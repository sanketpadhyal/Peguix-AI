import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/Sidebar";
import Chat from "./components/home/Chat";
import Voice from "./components/home/Voice";
import SettingsPanel from "./components/settings/SettingsPanel";
import MobileSettings from "./components/settings/Settings";
import ChatTopPanel from "./components/top/ChatTopPanel";

/* ----------------------------------
   🔥 TOP PANEL CONTROLLER
----------------------------------- */
function TopPanelGate() {
  const location = useLocation();

  // show top panel ONLY on chat page
  if (location.pathname !== "/chat") return null;

  return <ChatTopPanel />;
}

function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Router>

      {/* SIDEBAR */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="app-main">

        {/* 🔥 CHAT TOP PANEL (PC ONLY, /chat only) */}
        <TopPanelGate />

        {/* MAIN NAVBAR */}
        <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        {/* ROUTES */}
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route path="/voice" element={<Voice />} />

          {/* 📱 MOBILE SETTINGS */}
          <Route path="/mobile-settings" element={<MobileSettings />} />

          {/* 🖥️ PC SETTINGS PANEL */}
          <Route path="/settings" element={<SettingsPanel />} />

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>

      </div>

    </Router>
  );
}

export default App;
