
// AVOID COMMENTS BECAUSE WEB WAS CREATED IN SHORT TIME 5 HOURS //

import { useState, useEffect, useRef } from "react";
import { FiMic, FiPaperclip, FiSend, FiShare2, FiEdit3, FiActivity } from "react-icons/fi";
import { FaStop, FaRegCopy, FaCheck } from "react-icons/fa";
import "./Chat.css";
import logo from "/Users/sanketpadhyal/Desktop/offline-ai-react/frontend/src/components/assets/logoo.png";
const extractFiveSentences = (text) => {
  if (!text) return null;

  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 25); 

  if (sentences.length === 0) return null;

  return sentences.slice(0, 5).join(". ") + ".";
};


export default function Chat() {
const [aiStatus, setAiStatus] = useState(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("cluster_chat");
    return saved ? JSON.parse(saved) : [
      { 
        role: "ai", 
        text: "<b><i>Welcome to Peguix</i></b>", 
        showLogo: true,
        time: Date.now()
      }
    ];
  });

  useEffect(() => {
  try {
    localStorage.setItem("cluster_chat", JSON.stringify(messages));
  } catch (e) {
    console.warn("LocalStorage save failed", e);
  }
}, [messages]);

  const BACKEND_URL = "https://localhost:8000";

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedBlock, setCopiedBlock] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);
  const recognitionRef = useRef(null);


  // 🔥 AUTO SCROLL
useEffect(() => {
  if (!bottomRef.current) return;

  // 🔥 NO SMOOTH DURING STREAMING
  bottomRef.current.scrollIntoView({
    behavior: isTyping ? "auto" : "smooth"
  });
}, [messages, isTyping]);


  // 🔥 ACCENTS
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("chat_accent") || "dark";
  });

  useEffect(() => {
    const stored = localStorage.getItem("chat_accent");
    if (stored) setAccent(stored);
  }, []);

  const [aiAccent, setAiAccent] = useState(() => {
    return localStorage.getItem("chat_accent_ai") || "dark";
  });

  useEffect(() => {
    const stored = localStorage.getItem("chat_accent_ai");
    if (stored) setAiAccent(stored);
  }, []);

  // =====================
  // 🗓️ DATE LABEL HELPER
  // =====================
  const getDayLabel = (timestamp) => {
    if (!timestamp) return "Today";

    const msgDate = new Date(timestamp);
    const today = new Date();

    const isToday = msgDate.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
      msgDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return msgDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

const copyAiText = (text, index) => {
  navigator.clipboard.writeText(text);
  setCopiedBlock(`ai-${index}`);
  setTimeout(() => setCopiedBlock(null), 1500);
};

// 📋 COPY CODE BLOCK
const copyCodeBlock = (code, key) => {
  navigator.clipboard.writeText(code);
  setCopiedBlock(key);
  setTimeout(() => setCopiedBlock(null), 1500);
};


  // =====================
  // 🔗 SHARE AI TEXT
  // =====================
  const shareAiText = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Peguix",
          text: text
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert("Text copied (share not supported in this browser)");
    }
  };

  // =====================
  // 🖼️ IMAGE PICK
  // =====================
  const pickImage = () => fileRef.current.click();

const onImageSelect = (file) => {
  if (!file) return;

  // 🔒 IMAGE SIZE LIMIT (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Image too large. Please upload an image under 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setSelectedImage({ file, preview: reader.result });
  };
  reader.readAsDataURL(file);
};


  // =====================
  // 🎙️ MIC
  // =====================
  const startMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Mic not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognitionRef.current = recognition;
    setIsListening(true);

    let finalText = "";

    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setInput(finalText + interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalText.trim()) {
        setTimeout(() => sendMessage(finalText.trim()), 300);
      }
    };

    recognition.start();
  };

  const stopMic = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

    // ❌ REMOVE SELECTED IMAGE
const removeSelectedImage = () => {
  setSelectedImage(null);
};

  const stopGeneration = () => {


    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsTyping(false);
  };
const sendMessage = async (overrideText = null) => {
  if (((!input.trim() && !overrideText) && !selectedImage) || isTyping) return;

  const userText = overrideText || input;
  const imageData = selectedImage;

  setInput("");
  setSelectedImage(null);

  // USER MESSAGE
  setMessages(prev => [...prev, {
    role: "user",
    text: userText || "",
    image: imageData?.preview || null,
    time: Date.now()
  }]);

  // AI PLACEHOLDER
  let aiIndex;
  setMessages(prev => {
    aiIndex = prev.length;
    return [...prev, { role: "ai", text: "", time: Date.now() }];
  });

  setIsTyping(true);
  const controller = new AbortController();
  abortRef.current = controller;

  try {

if (imageData) {
  setAiStatus("analyzing");
  await new Promise(r => setTimeout(r, 3000));

  setAiStatus("checking");
  await new Promise(r => setTimeout(r, 3000));

  setAiStatus("thinking");
} else {
  setAiStatus("noted");
  await new Promise(r => setTimeout(r, 2000)); // ⏱️ 2 seconds
  setAiStatus("thinking");
}



    let res;

    if (imageData) {
      const form = new FormData();
      form.append("image", imageData.file);
      form.append("prompt", userText?.trim() || "Describe this image in detail.");

      res = await fetch("/chat", {
        method: "POST",
        body: form,
        signal: controller.signal
      });

    } else {
      res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal
      });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";
    let firstChunk = true;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // 🔥 REMOVE STATUS ONLY WHEN FIRST TOKEN ARRIVES
      if (firstChunk) {
        setAiStatus(null);
        firstChunk = false;
      }

      const chunk = decoder.decode(value, { stream: true });

      for (let i = 0; i < chunk.length; i++) {
        fullText += chunk[i];

        setMessages(prev => {
          const copy = [...prev];
          copy[aiIndex] = { ...copy[aiIndex], text: fullText };
          return copy;
        });

        // 🔥 SAVE 5 MEANINGFUL SENTENCES ONCE
const alreadySaved = localStorage.getItem("current_chat_summary");

if (!alreadySaved) {
  const summary = extractFiveSentences(fullText);
  if (summary) {
    localStorage.setItem("current_chat_summary", summary);
  }
}


        await new Promise(r => setTimeout(r, 2));
      }
    }

    setMessages(prev => {
      const copy = [...prev];
      copy[aiIndex] = { ...copy[aiIndex], text: fullText };
      return copy;
    });

    setIsTyping(false);

  } catch (err) {

    // 🔥 USER STOP
    if (err.name === "AbortError") {
      setIsTyping(false);
      return;
    }

    setMessages(prev => {
      const copy = [...prev];
      copy[copy.length - 1] = { 
        role: "ai", 
        text: "⚠️ Server error. Try again.", 
        time: Date.now() 
      };
      return copy;
    });

    setIsTyping(false);
  }
};


  // =====================
  // 🧩 RENDER MESSAGE
  // =====================
const renderMessage = (text, msgIndex) => {
  // split by ``` for code blocks
  const parts = text.split("```");
  return parts.map((part, i) => {
    // NORMAL TEXT
    if (i % 2 === 0) {
      // Render HTML for welcome message
      if (part === "<b><i>Welcome to Peguix</i></b>") {
        return (
          <span key={i} className="normal-text" dangerouslySetInnerHTML={{ __html: part }} />
        );
      }
      return (
        <span key={i} className="normal-text">
          {part}
        </span>
      );
    }

    // CODE BLOCK PART
    let lines = part.split("\n");
    let lang = lines[0].trim();        // first line = language
    let code = lines.slice(1).join("\n");

    const copyKey = `code-${msgIndex}-${i}`;

    return (
      <div key={i} className="code-block-wrapper">

        {/* LANGUAGE HEADER */}
        <div className="code-lang-header">
          {lang || "code"}
        </div>

        {/* COPY BUTTON */}
        <button
          className="code-copy-btn"
          onClick={() => copyCodeBlock(code, copyKey)}
        >
          {copiedBlock === copyKey ? <FaCheck /> : <FaRegCopy />}
        </button>

        {/* CODE AREA */}
        <pre className="code-block">
          {code}
        </pre>

      </div>
    );
  });
};

  return (
    <div className="chatgpt-page">
      <div className="chatgpt-chat-wrapper">
        <div className="chatgpt-messages">

          {messages.map((msg, i) => {

            const currentLabel = getDayLabel(msg.time);
            const prevLabel = i > 0 ? getDayLabel(messages[i - 1].time) : null;
            const showDateSeparator = currentLabel !== prevLabel;

            const isLast = i === messages.length - 1;
            const showTyping =
              msg.role === "ai" &&
              isTyping &&
              isLast &&
              (!msg.text || msg.text.trim() === "");

            return (
              <div key={i}>

                {showDateSeparator && (
                  <div className="chat-date-separator">{currentLabel}</div>
                )}

                <div
                  className={`chatgpt-row ${msg.role} ${
                    msg.role === "user" ? `accent-${accent}` : `accent-ai-${aiAccent}`
                  }`}
                >
                  <div className="chat-bubble-wrapper">

                    <div className={`chatgpt-bubble ${showTyping ? "uptime-bot" : ""}`}>

                      {msg.showLogo && (
                        <img src={logo} alt="Quanta AI" className="chat-logo" />
                      )}

                      {msg.image && (
                        <img src={msg.image} alt="upload" className="chat-image" />
                      )}

                      {showTyping ? (
  <div className="ai-typing-wrapper">

    <span className="uptime-dot"></span>{aiStatus && (
  <div className={`ai-status-text status-${aiStatus}`}>

    {aiStatus === "noted" && (
      <>
        <FiEdit3 />
        <span>Noted</span>
      </>
    )}

    {aiStatus === "analyzing" && (
      <>
        <FiEdit3 />
        <span>Analyzing image</span>
      </>
    )}

    {aiStatus === "checking" && (
      <>
        <FiActivity />
        <span>Checking details</span>
      </>
    )}

    {aiStatus === "thinking" && (
      <>
        <FiActivity />
        <span>Thinking...</span>
      </>
    )}

  </div>
)}




  </div>
) : (
  renderMessage(msg.text, i)
)}


                    </div>

                    {/* 🔥 AI ACTION PANEL */}
                    {msg.role === "ai" &&
 msg.text &&
 !(isTyping && isLast) && (   // 🔥 HIDE WHILE STREAMING LAST MESSAGE
  <div className="ai-action-panel">


                        <button
                          className="ai-action-btn"
                          onClick={() => copyAiText(msg.text, i)}
                        >
                          {copiedBlock === `ai-${i}` ? <FaCheck /> : <FaRegCopy />}
                        </button>

                        <button
                          className="ai-action-btn"
                          onClick={() => shareAiText(msg.text)}
                        >
                          <FiShare2 />
                        </button>

                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* INPUT BAR */}
        {/* 🖼️ IMAGE PREVIEW BAR */}
{selectedImage && (
  <div className="image-preview-bar">
    <img src={selectedImage.preview} alt="preview" />
    <button onClick={removeSelectedImage}>✕</button>
  </div>
)}

        <div className="chatgpt-input-wrapper">
          <div className="chatgpt-input-bar">

            <button className="icon-btn" onClick={pickImage}><FiPaperclip /></button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onImageSelect(e.target.files[0])}
            />

            <button
              className={`icon-btn ${isListening ? "mic-on" : ""}`}
              onClick={isListening ? stopMic : startMic}
            >
              <FiMic />
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Ask anything..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {isTyping ? (
              <button className="send-btn stop-btn" onClick={stopGeneration}><FaStop /></button>
            ) : (
              <button className="send-btn" onClick={() => sendMessage()}><FiSend /></button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
