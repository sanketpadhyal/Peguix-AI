import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  FiSettings,
  FiBell,
  FiSliders,
  FiGrid,
  FiDatabase,
  FiShield,
  FiUsers,
  FiUser,
  FiPlay,
    FiCpu,
  FiSquare
} from "react-icons/fi";
import "./SettingsPanel.css";

export default function SettingsPanel() {
  const navigate = useNavigate();
  const speechRef = useRef(null);

  const [active, setActive] = useState("general");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(null);
  const [storageItems, setStorageItems] = useState([]);



  // 🌐 AUTO DETECT LANGUAGE
  const systemLang = navigator.language || "en-US";

  const formatLang = (lang) => {
    const [code, region] = lang.split("-");
    const names = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
      fr: "French",
      es: "Spanish"
    };
    return `${names[code] || code.toUpperCase()}${region ? ` (${region})` : ""}`;
  };
const deleteStorageKey = (key) => {
  localStorage.removeItem(key);
  setStorageItems(prev => prev.filter(item => item.key !== key));
};

  // 🎨 ACCENTS
  const [accent, setAccent] = useState(
    localStorage.getItem("chat_accent") || "green"
  );

  const [aiAccent, setAiAccent] = useState(
    localStorage.getItem("chat_accent_ai") || "dark"
  );

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && navigate(-1);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [navigate]);

  // ⏹ STOP VOICE
  const stopVoice = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
  if (active !== "storage") return;

  const items = Object.keys(localStorage).map(key => ({
    key,
    value: localStorage.getItem(key)
  }));

  setStorageItems(items);
}, [active]);


  // 🔊 TEST FEMALE VOICE
  const testVoice = () => {
    if (!window.speechSynthesis || isSpeaking) return;

    const speakNow = () => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "Hey there, mic testing."
      );

      utterance.lang = systemLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.08;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();

      const femaleVoice =
        voices.find(v => v.name.toLowerCase().includes("samantha")) ||
        voices.find(v => v.name.toLowerCase().includes("victoria")) ||
        voices.find(v => v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.name.toLowerCase().includes("zira")) ||
        voices.find(v => v.lang === systemLang) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0];

      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      speechRef.current = utterance;
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }
  };

  // 🎨 CHANGE USER ACCENT
  const changeAccent = (color) => {
    localStorage.setItem("chat_accent", color);
    setAccent(color);
  };

  // 🤖 CHANGE AI ACCENT
  const changeAiAccent = (color) => {
    localStorage.setItem("chat_accent_ai", color);
    setAiAccent(color);
  };
  // =========================
// 🔥 DATA CONTROLS
// =========================

const runWithLoader = async (key, action) => {
  if (loadingBtn) return;

  setLoadingBtn(key);
  setTimeout(async () => {
    try {
      await action();
    } catch {}
    setLoadingBtn(null);
  }, 1800);
};

const clearLocalStorage = () => {
  localStorage.clear();
};

const clearChats = () => {
  localStorage.removeItem("cluster_chat");
};

const clearCache = async () => {
  if ("caches" in window) {
    const names = await caches.keys();
    await Promise.all(names.map(n => caches.delete(n)));
  }
};

const resetVoice = () => {
  if (window.speechSynthesis) speechSynthesis.cancel();
  localStorage.removeItem("preferred_voice");
  localStorage.removeItem("voice_rate");
  localStorage.removeItem("voice_pitch");
};

const resetApp = () => {
  localStorage.clear();
  if ("caches" in window) {
    caches.keys().then(names => names.forEach(n => caches.delete(n)));
  }
  setTimeout(() => window.location.reload(), 200);
};


  return (
    <div className="sp-overlay" onClick={() => navigate(-1)}>
      <div className="sp-modal" onClick={(e) => e.stopPropagation()}>

        {/* CLOSE */}
        <button className="sp-close" onClick={() => navigate(-1)}>×</button>

        {/* LEFT MENU */}
        <aside className="sp-left">
          <div
            className={`sp-item ${active === "general" ? "active" : ""}`}
            onClick={() => setActive("general")}
          >
            <FiSettings /> General
          </div>

          <div
            className={`sp-item ${active === "notifications" ? "active" : ""}`}
            onClick={() => setActive("notifications")}
          >
            <FiBell /> Notifications
          </div>

          <div
            className={`sp-item ${active === "personalization" ? "active" : ""}`}
            onClick={() => setActive("personalization")}
          >
            <FiSliders /> Personalization
          </div>

          <div
  className={`sp-item ${active === "data" ? "active" : ""}`}
  onClick={() => setActive("data")}
>
  <FiDatabase /> Data controls
</div>

          <div
  className={`sp-item ${active === "storage" ? "active" : ""}`}
  onClick={() => setActive("storage")}
>
  <FiGrid /> Storage
</div>

          <div
  className={`sp-item ${active === "model" ? "active" : ""}`}
  onClick={() => setActive("model")}
>
  <FiCpu /> Model info
</div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="sp-right">

          {/* ================= GENERAL ================= */}
          {active === "general" && (
            <>
              <h2 className="sp-title">General</h2>

              <div className="sp-row sp-row-column">
                <span>User Accent</span>
                <div className="sp-accent-row">
                  {["green", "blue", "yellow", "dark"].map(c => (
                    <button
                      key={c}
                      className={`sp-accent-btn ${c} ${accent === c ? "active" : ""}`}
                      onClick={() => changeAccent(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="sp-row sp-row-column">
                <span>AI Accent</span>
                <div className="sp-accent-row">
                  {["green", "blue", "yellow", "dark"].map(c => (
                    <button
                      key={c}
                      className={`sp-accent-btn ${c} ${aiAccent === c ? "active" : ""}`}
                      onClick={() => changeAiAccent(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="sp-divider" />

              <div className="sp-row">
                <span>Language</span>
                <span className="sp-muted">Auto-detect</span>
              </div>

              <div className="sp-row">
                <span>Spoken language</span>
                <span className="sp-muted">{formatLang(systemLang)}</span>
              </div>

              <div className="sp-divider" />

              <div className="sp-row">
                <span>Test Voice</span>
                {!isSpeaking ? (
                  <button className="sp-play" onClick={testVoice}>
                    <FiPlay style={{ marginRight: 6 }} /> Play
                  </button>
                ) : (
                  <button className="sp-play speaking" onClick={stopVoice}>
                    <FiSquare style={{ marginRight: 6 }} /> Stop
                  </button>
                )}
              </div>

              <div className="sp-row">
                <span>Female Voice</span>
                <div className="sp-toggle locked on"></div>
              </div>
            </>
          )}

          {/* ================= NOTIFICATIONS ================= */}
          {active === "notifications" && (
            <>
              <h2 className="sp-title">Notifications</h2>

              <div className="sp-row">
                <span>Notifications</span>
                <div className="sp-toggle locked off"></div>
              </div>

              <div className="sp-row sp-muted" style={{ color: "#ffb300" }}>
                Notifications unavailable due to security restrictions
              </div>

              <div className="sp-row sp-row-column" style={{ opacity: 0.5 }}>
                <span>Push Notifications</span>
                <button className="sp-play" disabled>Enable</button>
              </div>

              <div className="sp-row sp-row-column" style={{ opacity: 0.5 }}>
                <span>Email Alerts</span>
                <button className="sp-play" disabled>Enable</button>
              </div>

              <div className="sp-row sp-row-column" style={{ opacity: 0.5 }}>
                <span>Sound Alerts</span>
                <button className="sp-play" disabled>Enable</button>
              </div>
            </>
          )}

          {/* ================= PERSONALIZATION ================= */}
          {active === "personalization" && (
            <>
              <h2 className="sp-title">Personalization</h2>

              <div
  className="sp-row sp-muted"
  style={{
    fontSize: "12.5px",
    lineHeight: 1.5,
    marginTop: 14,
    color: "#b0b0b0"
  }}
>
  Some personalization settings are intentionally locked or non-changeable due to
  system limitations and security considerations.
</div>


              {/* repeat accents */}
              <div className="sp-row sp-row-column">
                <span>User Accent</span>
                <div className="sp-accent-row">
                  {["green", "blue", "yellow", "dark"].map(c => (
                    <button
                      key={c}
                      className={`sp-accent-btn ${c} ${accent === c ? "active" : ""}`}
                      onClick={() => changeAccent(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="sp-row sp-row-column">
                <span>AI Accent</span>
                <div className="sp-accent-row">
                  {["green", "blue", "yellow", "dark"].map(c => (
                    <button
                      key={c}
                      className={`sp-accent-btn ${c} ${aiAccent === c ? "active" : ""}`}
                      onClick={() => changeAiAccent(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="sp-divider" />

              {/* female voice locked */}
              <div className="sp-row">
                <span>Female Voice</span>
                <div className="sp-toggle locked on"></div>
              </div>

              {/* useless fillers for scroll 😄 */}
              <div className="sp-divider" />

              <div className="sp-row">
                <span>Glow intensity</span>
                <span className="sp-muted">Balanced</span>
              </div>

              <div className="sp-row">
                <span>Bubble curvature</span>
                <span className="sp-muted">Medium</span>
              </div>

              <div className="sp-row">
                <span>Typing animation</span>
                <span className="sp-muted">Smooth</span>
              </div>

              <div className="sp-row">
                <span>Ambient effects</span>
                <span className="sp-muted">Enabled</span>
              </div>

              <div className="sp-row">
                <span>Personality depth</span>
                <span className="sp-muted">Normal</span>
              </div>



            </>
          )}

{/* ================= DATA CONTROLS ================= */}
{active === "data" && (
  <>
    <h2 className="sp-title">Data controls</h2>

    <button
      className="sp-data-btn"
      onClick={() => runWithLoader("storage", clearLocalStorage)}
      disabled={loadingBtn}
    >
      Clear Local Storage
      {loadingBtn === "storage" && <span className="sp-loader"></span>}
    </button>
    <p className="sp-data-usage">
      Removes all saved preferences, settings, and temporary data stored on this device.
    </p>

    <button
      className="sp-data-btn"
      onClick={() => runWithLoader("chats", clearChats)}
      disabled={loadingBtn}
    >
      Clear Chats
      {loadingBtn === "chats" && <span className="sp-loader"></span>}
    </button>
    <p className="sp-data-usage">
      Deletes your conversation history while keeping system and UI settings intact.
    </p>

    <button
      className="sp-data-btn"
      onClick={() => runWithLoader("cache", clearCache)}
      disabled={loadingBtn}
    >
      Clear Cache
      {loadingBtn === "cache" && <span className="sp-loader"></span>}
    </button>
    <p className="sp-data-usage">
      Clears cached files to fix loading issues and improve overall performance.
    </p>

    <button
      className="sp-data-btn"
      onClick={() => runWithLoader("voice", resetVoice)}
      disabled={loadingBtn}
    >
      Reset Voice System
      {loadingBtn === "voice" && <span className="sp-loader"></span>}
    </button>
    <p className="sp-data-usage">
      Stops active speech, resets voice memory, and resolves audio playback problems.
    </p>

    <button
      className="sp-data-btn danger"
      onClick={() => runWithLoader("reset", resetApp)}
      disabled={loadingBtn}
    >
      Reset Application
      {loadingBtn === "reset" && <span className="sp-loader"></span>}
    </button>
    <p className="sp-data-usage danger">
      Performs a full reset by clearing all data and restarting the application.
    </p>
  </>
)}
{/* ================= STORAGE ================= */}
{active === "storage" && (
  <>
    <h2 className="sp-title">Local Storage</h2>

    {storageItems.length === 0 ? (
      <p className="sp-muted">No data stored on this device.</p>
    ) : (
      <div className="sp-storage-list">
        {storageItems.map(item => (
          <div key={item.key} className="sp-storage-item">
            <div className="sp-storage-text">
              <div className="sp-storage-key">{item.key}</div>
              <div className="sp-storage-value">
                {String(item.value).slice(0, 120)}
              </div>
            </div>

            <button
              className="sp-storage-delete"
              onClick={() => deleteStorageKey(item.key)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    )}

    {storageItems.length > 0 && (
      <button
        className="sp-btn"
        onClick={() => {
          localStorage.clear();
          setStorageItems([]);
        }}
      >
        Clear All Storage
      </button>
    )}
  </>
)}

{/* ================= MODEL INFO ================= */}
{active === "model" && (
  <>
    <h2 className="sp-title">Model Information</h2>

    <div className="sp-row">
      <span>AI Engine</span>
      <span className="sp-muted">Peguix AI (Web)</span>
    </div>

    <div className="sp-row">
      <span>Base Model</span>
      <span className="sp-muted">LLaMA 3.2</span>
    </div>

    <div className="sp-row">
      <span>Capabilities</span>
      <span className="sp-muted">Text • Vision • Reasoning</span>
    </div>

    <div className="sp-row">
      <span>Deployment</span>
      <span className="sp-muted">Browser-based (Client + API)</span>
    </div>

    <div className="sp-row">
      <span>Context Handling</span>
      <span className="sp-muted">Session-aware</span>
    </div>

    <div className="sp-divider" />

    <div className="sp-note">
      Peguix AI is powered by a large language model based on the LLaMA 3.2
      architecture with multimodal (vision) support. Responses are generated
      dynamically and may vary based on input complexity, system load, and
      session context.
    </div>

    <div className="sp-note" style={{ marginTop: 12 }}>
      This model does not retain personal data outside the active session.<br />
      All processing follows client-side and API-level security constraints.<br />
      Can work offline.
    </div>
    
  </>
)}




        </section>
      </div>
    </div>
  );
}
