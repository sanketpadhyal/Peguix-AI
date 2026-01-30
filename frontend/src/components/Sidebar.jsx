import "./Sidebar.css";
import {
  FiLogOut,
  FiInfo,
  FiSettings,
  FiCpu,
  FiMic,
  FiMessageCircle,
  FiDatabase,
  FiUser,
  FiHelpCircle,
  FiX
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import logo from "/Users/sanketpadhyal/Desktop/offline-ai-react/frontend/src/components/assets/logo.png";
import nameLogo from "/Users/sanketpadhyal/Desktop/offline-ai-react/frontend/src/components/assets/name.png";

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // 🔥 CURRENT CHAT TITLE
  const [currentChatTitle, setCurrentChatTitle] = useState(() => {
    return localStorage.getItem("current_chat_summary") || "Current Chat";
  });

  const openStorageDetails = () => {
    const keys = Object.keys(localStorage);
    alert(`Local Storage Keys:\n\n${keys.join("\n") || "No data found"}`);
  };

const openSettings = () => {
  const isMobile =
    window.matchMedia("(max-width: 900px)").matches ||
    /Mobi|Android|iPhone/i.test(navigator.userAgent);

  navigate(isMobile ? "/mobile-settings" : "/settings");

  setProfileOpen(false);
  if (onClose) onClose();
};


useEffect(() => {
  const handler = (e) => {
    if (
      profileOpen &&
      profileRef.current &&
      !profileRef.current.contains(e.target)
    ) {
      setProfileOpen(false);
    }
  };

  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}, [profileOpen]);


  // 🔥 LISTEN FOR CHAT TITLE UPDATE
  useEffect(() => {
    const updateTitle = () => {
      const title =
        localStorage.getItem("current_chat_summary") || "Current Chat";
      setCurrentChatTitle(title);
    };

    window.addEventListener("chat-title-updated", updateTitle);
    return () =>
      window.removeEventListener("chat-title-updated", updateTitle);
  }, []);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <button className="sidebar-close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="sidebar-top">
          <div className="sidebar-logo-img">
            <img src={logo} alt="Peguix AI" />
          </div>
          <div className="sidebar-name-img">
            <img src={nameLogo} alt="Peguix AI" />
          </div>
        </div>

        <div className="sidebar-divider" />

        <div
          className="sidebar-item"
          onClick={() => {
            navigate("/chat");
            if (onClose) onClose();
          }}
        >
          <FiMessageCircle />
          <span>Chat</span>
        </div>

        <div className="sidebar-section main">
          <div
            className="sidebar-item"
            onClick={() => {
              navigate("/voice");
              if (onClose) onClose();
            }}
          >
            <FiMic />
            <span>Voice Chat</span>
          </div>

          <div
            className="sidebar-item"
            onClick={() => {
              // Open settings panel with 'model' tab active
              navigate("/settings?tab=model");
              if (onClose) onClose();
            }}
          >
            <FiCpu />
            <span>Model Info</span>
          </div>

          <div
            className="sidebar-item"
            onClick={() => {
              openStorageDetails();
              if (onClose) onClose();
            }}
          >
            <FiDatabase />
            <span>Storage Info</span>
          </div>

          <div
            className="sidebar-item"
            onClick={() => {
              navigate("/about");
              if (onClose) onClose();
            }}
          >
            <FiInfo />
            <span>About Us</span>
          </div>

          <div className="sidebar-item" onClick={openSettings}>
            <FiSettings />
            <span>Settings</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-title">Chats</div>

        <div className="sidebar-section chats">
          <div
            className={`sidebar-chat ${
              location.pathname === "/chat" ? "active" : ""
            }`}
            onClick={() => {
              navigate("/chat");
              if (onClose) onClose();
            }}
          >
            <FiMessageCircle />
            <span>{currentChatTitle}</span>
          </div>
        </div>

       <div
  className="sidebar-bottom"
  ref={profileRef}
  onClick={(e) => {
    e.stopPropagation();
    setProfileOpen(true);
  }}
>

          <div className="profile-circle">GU</div>

          <div className="profile-info">
            <div className="profile-name">GUEST</div>
          </div>
        </div>

        {profileOpen && (
          <div className="profile-panel-overlay">
            <div className="profile-panel">
              <button
                className="profile-panel-close"
                onClick={() => setProfileOpen(false)}
              >
                <FiX />
              </button>

              <div className="profile-dd-item">
                <FiUser />
                <span>My Profile</span>
              </div>

              <div
  className="profile-dd-item"
  onClick={(e) => {
    e.stopPropagation();
    openSettings();
  }}
>
                <FiSettings />
                <span>Settings</span>
              </div>

              <div className="profile-dd-item">
                <FiHelpCircle />
                <span>Help</span>
              </div>

              <div className="profile-dd-divider" />

              <div className="profile-dd-item logout">
                <FiLogOut />
                <span>Log out</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
