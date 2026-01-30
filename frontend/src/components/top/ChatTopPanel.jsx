import { useState } from "react";
import { FiCpu, FiTrash2, FiInfo } from "react-icons/fi";
import "./ChatTopPanel.css";


export default function ChatTopPanel() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("cluster_chat");
      window.location.reload();
    }, 900); 
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setLoading(false);
  };

  return (
    <div className="chat-top-panel">
      {/* LEFT */}
      <div className="chat-top-left">
        <FiCpu />
        <span>Peguix Powered by LLMs </span>
        <span className="model-badge">llama 3.2 · vision</span>
      </div>
      {/* RIGHT */}
      <div className="chat-top-right">
        <button
          title="Clear chat"
          className="delete-chat-btn"
          onClick={handleDeleteClick}
        >
          <FiTrash2 /> Delete Chat
        </button>
      </div>
      {/* Slide-down confirmation panel */}
      {showConfirm && (
        <div className="chat-confirm-panel">
          <div className="chat-confirm-content">
            <span>Are you sure you want to clear the chat?</span>
            <div className="chat-confirm-actions">
              <button className="yes-btn" onClick={handleConfirm} disabled={loading}>
                Yes
                {loading && <span className="yes-loader"></span>}
              </button>
              <button className="no-btn" onClick={handleCancel}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
