import { useState } from "react";
import "./Settings.css";

export default function Settings() {

  const [loadingBtn, setLoadingBtn] = useState(null);
  const [alertText, setAlertText] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [accent, setAccent] = useState(
    localStorage.getItem("chat_accent") || "green"
  );

  const [aiAccent, setAiAccent] = useState(
    localStorage.getItem("chat_accent_ai") || "dark"
  );

  const showSystemAlert = (text) => {
    setAlertText(text);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const changeAccent = (color) => {
    localStorage.setItem("chat_accent", color);
    setAccent(color);
    showSystemAlert(`User accent changed to ${color}`);
  };

  const changeAiAccent = (color) => {
    localStorage.setItem("chat_accent_ai", color);
    setAiAccent(color);
    showSystemAlert(`AI accent changed to ${color}`);
  };

  // 🔥 CLEAR ONLY COLOR STORAGE (RESET TO DEFAULT)
  const resetColorsToDefault = () => {
    localStorage.removeItem("chat_accent");
    localStorage.removeItem("chat_accent_ai");

    setAccent("green");
    setAiAccent("dark");

    showSystemAlert("Chat colors reset to default");
  };

  const runWithLoader = async (key, action, successText) => {
    if (loadingBtn) return;

    setLoadingBtn(key);

    setTimeout(async () => {
      try {
        await action();
        showSystemAlert(successText);
      } catch {
        showSystemAlert("Operation completed with minor issues.");
      }
      setLoadingBtn(null);
    }, 2500);
  };

  const clearLocalStorage = () => {
    localStorage.clear();
  };

  const clearChats = () => {
    localStorage.removeItem("cluster_chat");
  };

  const clearCache = async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let reg of registrations) {
        await reg.unregister();
      }
    }
  };

  const clearVoices = () => {
    if (window.speechSynthesis) speechSynthesis.cancel();

    localStorage.removeItem("preferred_voice");
    localStorage.removeItem("voice_rate");
    localStorage.removeItem("voice_pitch");
  };

  const resetApp = () => {
    localStorage.clear();

    if ("caches" in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    if (window.speechSynthesis) speechSynthesis.cancel();

    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const renderButton = (key, label, className, action, successText) => (
    <button
      className={`settings-btn ${className || ""}`}
      disabled={loadingBtn !== null}
      onClick={() => runWithLoader(key, action, successText)}
    >
      <span>{label}</span>
      {loadingBtn === key && <span className="btn-loader-inline"></span>}
    </button>
  );

  return (
    <div className="settings-page">
      <div className="settings-card">

        <h2 className="settings-title">
          <span className="title-big">S</span>
          <span className="title-box">ettings</span>
        </h2>

        <p className="settings-sub-note">
          Manage system data, storage, voice settings, and application behavior from here.
        </p>

        {/* 🎨 USER ACCENT */}
        <div className="settings-accent">

          <p className="settings-accent-title">User Chat Accent</p>

          <div className="accent-row">
            <button
              className={`accent-btn green ${accent === "green" ? "selected" : ""}`}
              onClick={() => changeAccent("green")}
            />
            <button
              className={`accent-btn blue ${accent === "blue" ? "selected" : ""}`}
              onClick={() => changeAccent("blue")}
            />
            <button
              className={`accent-btn yellow ${accent === "yellow" ? "selected" : ""}`}
              onClick={() => changeAccent("yellow")}
            />
            <button
              className={`accent-btn dark ${accent === "dark" ? "selected" : ""}`}
              onClick={() => changeAccent("dark")}
            />
          </div>

        </div>

        {/* 🎨 AI ACCENT */}
        <div className="settings-accent">

          <p className="settings-accent-title">AI Chat Accent</p>

          <div className="accent-row">
            <button
              className={`accent-btn green ${aiAccent === "green" ? "selected" : ""}`}
              onClick={() => changeAiAccent("green")}
            />
            <button
              className={`accent-btn blue ${aiAccent === "blue" ? "selected" : ""}`}
              onClick={() => changeAiAccent("blue")}
            />
            <button
              className={`accent-btn yellow ${aiAccent === "yellow" ? "selected" : ""}`}
              onClick={() => changeAiAccent("yellow")}
            />
            <button
              className={`accent-btn dark ${aiAccent === "dark" ? "selected" : ""}`}
              onClick={() => changeAiAccent("dark")}
            />
          </div>

        </div>

        {/* 🔥 RESET COLOR STORAGE BUTTON */}
        <div className="settings-actions">
          <button
            className="settings-btn"
            onClick={resetColorsToDefault}
          >
            Reset Chat Colors to Default
          </button>
          <p className="settings-quick-note">
            Clears only color preferences and restores default chat theme.
          </p>
        </div>

        <div className="settings-actions">

          {renderButton(
            "storage",
            "Clear Local Storage",
            "danger",
            clearLocalStorage,
            "Local storage cleared successfully."
          )}
          <p className="settings-quick-note">
            Removes all saved data, preferences, and chats from this device.
          </p>

          {renderButton(
            "chats",
            "Clear Chats",
            "",
            clearChats,
            "All chat history cleared."
          )}
          <p className="settings-quick-note">
            Deletes only your conversation history while keeping system settings.
          </p>

          {renderButton(
            "cache",
            "Clear Cache",
            "",
            clearCache,
            "Application cache cleared."
          )}
          <p className="settings-quick-note">
            Refreshes internal files and fixes loading or performance issues.
          </p>

          {renderButton(
            "voice",
            "Reset Voice System",
            "",
            clearVoices,
            "Voice system reset completed."
          )}
          <p className="settings-quick-note">
            Stops speech, clears voice memory, and resolves audio playback problems.
          </p>

          {renderButton(
            "reset",
            "Reset Application",
            "danger-outline",
            resetApp,
            "Application reset in progress..."
          )}
          <p className="settings-quick-note">
            Performs a clean restart with all data cleared and system refreshed.
          </p>

        </div>

      </div>

      {showAlert && (
        <div className="settings-alert">
          {alertText}
        </div>
      )}

    </div>
  );
}
