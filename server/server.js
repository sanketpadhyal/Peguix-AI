import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import https from "https";
import os from "os";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// ensure uploads folder
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});


// ================= PATH FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendPath));

// ================= 🧠 SYSTEM PROMPT =================
const SYSTEM_PROMPT = `
You are Peguix AI based on LLaMma 3.2-vision 🤖✨  
A friendly, intelligent offline AI assistant.

Identity:
- Name: Peguix AI 
- Created by: Sanket
- Trained by: Sanket
- Knowledge cutoff: January 2026
- Gender : Female

Personality:
- Friendly, warm, human-like 😊
- Use light emojis naturally ✨🙂🔥😉
- Speak simple, clear English
- Helpful, supportive, positive
- Be Flirty

Rules:
- Never mention OpenAI or Meta
- Never say you are ChatGPT
- If asked who made you → "I was created and trained by Sanket"
- If asked cutoff → "January 2026"
- Never break character

Style:
- Short, fast replies ⚡
- No boring long answers unless needed
`;

// ================= MEMORY =================
let chatHistory = [];

function trimHistory() {
  if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
}

function buildPrompt(extra = "") {
  let full = SYSTEM_PROMPT + "\n\n";
  for (let msg of chatHistory) {
    if (msg.role === "user") full += `User: ${msg.content}\n`;
    if (msg.role === "ai") full += `${msg.content}\n`;
  }
  full += extra;
  return full;
}

// ================= 🎙️ STT ROUTE (WHISPER) =================
app.post("/stt", upload.single("audio"), async (req, res) => {
  try {
    const webmPath = path.join(__dirname, req.file.path);
    const wavPath = webmPath + ".wav";

    // convert webm → wav
    const convertCmd = `ffmpeg -y -i "${webmPath}" -ar 16000 -ac 1 "${wavPath}"`;

    exec(convertCmd, () => {

      const whisperCmd = `
cd /Users/sanketpadhyal/whisper.cpp &&
./build/bin/whisper-cli -m models/ggml-base.en.bin -f "${wavPath}" --no-timestamps
      `;

      exec(whisperCmd, (err, stdout) => {
        try { fs.unlinkSync(webmPath); } catch {}
        try { fs.unlinkSync(wavPath); } catch {}

        if (err) return res.json({ text: "" });

        const lines = stdout.split("\n").map(l => l.trim()).filter(Boolean);
        let text = lines[lines.length - 1] || "";
        text = text.replace(/\[.*?\]/g, "").trim();

        // 🔕 NO TERMINAL LOGS
        res.json({ text });
      });
    });

  } catch {
    res.json({ text: "" });
  }
});

// ================= 🤖 CHAT ROUTE =================
app.post("/chat", upload.single("image"), async (req, res) => {

  const isVoice = req.body?.voice === true;

  let userMessage = "";
  let imagePath = null;

  if (req.body?.message) userMessage = req.body.message;
  if (req.body?.prompt && req.file) {
    userMessage = req.body.prompt;
    imagePath = path.join(__dirname, req.file.path);
  }

  if (!userMessage && !imagePath) return res.end();

  chatHistory.push({ role: "user", content: userMessage });
  trimHistory();

  const isCodeRequest =
    userMessage.includes("code") ||
    userMessage.includes("import") ||
    userMessage.includes("function") ||
    userMessage.includes("react") ||
    userMessage.includes("express") ||
    userMessage.includes("server") ||
    userMessage.includes("component");

  const fullPrompt = isCodeRequest
    ? SYSTEM_PROMPT + "\n\nUser: " + userMessage + "\nQuanta AI:"
    : buildPrompt("Quanta AI: ");

  try {
    let payload;

    // IMAGE MODE
    if (imagePath) {
      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

      payload = {
        model: "llama3.2-vision",
        prompt: fullPrompt + "\nDescribe this image carefully and clearly.",
        images: [imageBase64],
        stream: true,
        options: {
          temperature: 0.5,
          top_p: 0.9,
          num_predict: 2048,
          num_ctx: 8192,
          num_thread: 8
        }
      };
    }

    // TEXT MODE
    else {
      payload = {
        model: "llama3.2-vision",
        prompt: fullPrompt,
        stream: true,
        options: {
          temperature: 0.6,
          top_p: 0.9,
          num_predict: 4096,
          num_ctx: 8192,
          num_thread: 8
        }
      };
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    let aiText = "";

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ================= STREAM =================
    for await (const chunk of response.body) {
      const lines = chunk.toString("utf8").split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.response) {
            const text = data.response;

            // 🔊 VOICE MODE — INSTANT FULL TEXT
            if (isVoice) {
              aiText += text;
              res.write(text);
            }

            // 💬 CHAT MODE — SMOOTH STREAM
            else {
              for (const char of text) {
                aiText += char;
                res.write(char);
                const delay = char === "\n" ? 18 : 6;
                await sleep(delay);
              }
            }
          }

        } catch {}
      }
    }

    chatHistory.push({ role: "ai", content: aiText });
    trimHistory();

    if (imagePath) {
      try { fs.unlinkSync(imagePath); } catch {}
    }

    res.end();

  } catch {
    
    res.end();
  }
});

// ================= ROUTES =================
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================= 🔥 SHOW LOCAL IP =================
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

// ================= HTTPS =================
const httpsOptions = {
  key: fs.readFileSync("localhost+3-key.pem"),
  cert: fs.readFileSync("localhost+3.pem")
};

https.createServer(httpsOptions, app).listen(8000, "0.0.0.0", () => {

  const ip = getLocalIP();

  console.log("\n🔥🔥🔥 PEGUIX SERVERS ARE TURNED ON🔥🔥🔥\n");

  console.log("🌐 LOCAL SERVER:");
  console.log(`   https://localhost:8000`);

  console.log("\n🌐 NETWORK SERVER:");
  console.log(`   https://${ip}:8000`);

  console.log("\n🧠 OLLAMA BACKEND:");
  console.log("   http://localhost:11434\n");
});
