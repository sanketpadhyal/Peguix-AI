import { NavLink, useNavigate } from "react-router-dom";
import { FiSettings, FiUser, FiMenu } from "react-icons/fi";
import "./Navbar.css";
import logo from "../assets/logoo.png";

export default function Navbar({ onOpenSidebar }) {
  const navigate = useNavigate();

  
  const openSettings = () => {
    if (window.innerWidth <= 768) {
      navigate("/mobile-settings"); 
    } else {
      navigate("/settings");        
    }
  };

  return (
    <div className="nav-wrapper">
      <div className="navbar">

        {}
        <button className="mobile-left-btn" onClick={onOpenSidebar}>
          <FiMenu />
        </button>

        {}
        <NavLink to="/" className="logo-box">
          <img src={logo} alt="Quanta AI" />
        </NavLink>

        {}
        <NavLink to="/chat" className="nav-item">Chat</NavLink>
        <NavLink to="/voice" className="nav-item">Voice</NavLink>

        {}
        <button
          className="mobile-profile-btn"
          onClick={() => navigate("/profile")}
        >
          <FiUser />
        </button>

        {}
        <button
          className="mobile-settings-btn"
          onClick={openSettings}
        >
          <FiSettings />
        </button>

      </div>
    </div>
  );
}
