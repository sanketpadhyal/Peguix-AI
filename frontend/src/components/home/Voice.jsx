import { useState, useRef, useEffect } from "react";
import { FiMic, FiMicOff, FiX, FiEdit3, FiHeadphones, FiCpu, FiActivity, FiVolume2, FiSend } from "react-icons/fi";
import { MdKeyboard } from "react-icons/md";
import "./Voice.css";

export default function Voice() {

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Tap to talk");
  const [mode, setMode] = useState("idle");
  const [lastReply, setLastReply] = useState("");
  const [showReplay, setShowReplay] = useState(false);

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [typedText, setTypedText] = useState("");
  

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const autoStopRef = useRef(null);
  const thinkingTimerRef = useRef(null);

  const keyboardRef = useRef(null);

  const vibrate = (pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (!("vibrate" in navigator)) return;

    if (mode === "noted") vibrate(40);
    if (mode === "getting") vibrate([30, 40, 30]);
    if (mode === "thinking") vibrate([50, 80, 50]);
    if (mode === "speaking") vibrate(60);
    if (mode === "idle") vibrate(25);

  }, [mode]);

  useEffect(() => {
    const unlock = () => {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      speechSynthesis.speak(u);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    return () => fullShutdown();
  }, []);

  useEffect(() => {
    if (showKeyboard && keyboardRef.current) {
      setTimeout(() => {
        keyboardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 120);
    }
  }, [showKeyboard]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fullShutdown = () => {
    clearTimeout(autoStopRef.current);
    clearTimeout(thinkingTimerRef.current);

    try {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch {}

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (window.speechSynthesis) speechSynthesis.cancel();

    mediaRecorderRef.current = null;
    setIsListening(false);
    setIsSpeaking(false);
    setShowReplay(false);
    setShowKeyboard(false);
    setMode("idle");
    setStatus("Tap to talk");

    scrollToTop();
  };

  const cleanForSpeech = (text) => {
    return text.replace(/[^\w\s.,!?'"()-]/g, "").replace(/\s+/g, " ").trim();
  };



  const startListening = async () => {
    try {
      clearTimeout(autoStopRef.current);
      setShowReplay(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = async () => {
        cleanupMic();

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (blob.size < 2000) {
          setMode("idle");
          setStatus("Tap to talk");
          return;
        }

        setMode("noted");
        setStatus("Noted");

        setTimeout(async () => {
          setMode("getting");
          setStatus("Getting things...");

          thinkingTimerRef.current = setTimeout(() => {
            setMode("thinking");
            setStatus("Thinking...");
          }, 4000);

          await sendToWhisper(blob);
        }, 700);
      };

      mediaRecorder.start();
      setIsListening(true);
      setMode("listening");
      setStatus("Listening...");

      autoStopRef.current = setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 4000);

    } catch {
      setMode("idle");
      setStatus("Tap to talk");
    }
  };

  const stopListening = () => {
    clearTimeout(autoStopRef.current);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsListening(false);
    setMode("thinking");
    setStatus("Thinking...");
  };

  const cleanupMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsListening(false);
  };

  const sendToWhisper = async (audioBlob) => {
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "voice.webm");

      const res = await fetch("/stt", { method: "POST", body: form });
      const data = await res.json();

      if (!data.text) {
        setMode("idle");
        setStatus("Tap to talk");
        return;
      }

      await sendToAI(data.text, true);

    } catch {
      setMode("idle");
      setStatus("Tap to talk");
    }
  };


  const sendToAI = async (text, fromVoice = false) => {
    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, voice: fromVoice })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      const cleanText = cleanForSpeech(fullText.trim());
      setLastReply(cleanText);
      speakAI(cleanText);

    } catch {
      setMode("idle");
      setStatus("Tap to talk");
    }
  };


  const speakAI = (text) => {
    clearTimeout(thinkingTimerRef.current);

    if (!text || !window.speechSynthesis) {
      setMode("idle");
      setStatus("Tap to talk");
      return;
    }

    setMode("speaking");
    setStatus("Speaking...");
    setIsSpeaking(true);
    setShowReplay(false);

    const speakNow = () => {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      const voices = speechSynthesis.getVoices();

      const preferredVoice =
        voices.find(v => v.name.toLowerCase().includes("samantha")) ||
        voices.find(v => v.name.toLowerCase().includes("victoria")) ||
        voices.find(v => v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.name.toLowerCase().includes("zira")) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0];

      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => {
        setIsSpeaking(false);
        setMode("idle");
        setStatus("Tap to talk");
        setShowReplay(true);
      };

      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }
  };

  const replayLast = () => {
    if (!lastReply) return;
    speakAI(lastReply);
  };

const interruptAndListen = () => {
  if (window.speechSynthesis) speechSynthesis.cancel();

  // ❌ DO NOT START MIC
  setIsSpeaking(false);
  setShowReplay(false);
  setMode("idle");
  setStatus("Tap to talk");
};


  const statusIcon = () => {
    if (mode === "listening") return <FiHeadphones />;
    if (mode === "noted") return <FiEdit3 />;
    if (mode === "getting") return <FiCpu />;
    if (mode === "thinking") return <FiActivity />;
    if (mode === "speaking") return <FiVolume2 />;
    return <FiMic />;
  };


  const sendTypedMessage = () => {
    if (!typedText.trim()) return;

    const msg = typedText.trim();
    setTypedText("");
    setShowKeyboard(false);
    setShowReplay(false);

    scrollToTop();

    setMode("noted");
    setStatus("Noted");

    setTimeout(() => {
      setMode("getting");
      setStatus("Getting things...");

      thinkingTimerRef.current = setTimeout(() => {
        setMode("thinking");
        setStatus("Thinking...");
      }, 4000);

      sendToAI(msg, false);

    }, 700);
  };

  return (
    <div className="voice-page">

      <div className="voice-orb">
        <div className={`orb ${mode}`}></div>
      </div>

      <div className={`voice-status status-${mode}`}>
        <span style={{ marginRight: 8, fontSize: 18 }}>{statusIcon()}</span>
        {status}
      </div>

      {showKeyboard && (
        <div className="keyboard-box" ref={keyboardRef}>
          <input
            type="text"
            placeholder="Type your message..."
            value={typedText}
            autoFocus
            onChange={(e) => setTypedText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendTypedMessage()}
          />
          <button onClick={sendTypedMessage}>
            <FiSend />
          </button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>

        {isSpeaking && (
          <button className="voice-interrupt-btn" onClick={interruptAndListen}>
            <FiX />
          </button>
        )}

        <button
          className={`voice-keyboard-btn ${showKeyboard ? "open" : ""}`}
          onClick={() => {
            if (showKeyboard) scrollToTop();
            setShowKeyboard(prev => !prev);
          }}
        >
          {showKeyboard ? <FiX /> : <MdKeyboard />}
        </button>

        <button
          className={`voice-mic-btn ${isListening ? "on" : ""}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? <FiMicOff /> : <FiMic />}
        </button>

      </div>

      {showReplay && !isSpeaking && lastReply && (
        <button className="voice-replay-btn" onClick={replayLast}>
          <span className="uptime-dot replay-dot"></span>
          <span className="replay-text">Tap to hear again</span>
        </button>
      )}

    </div>
  );
}
