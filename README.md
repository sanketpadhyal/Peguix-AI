# Peguix AI — Offline AI Web Application

<a>
    <img src="frontend/src/components/assets/logo.png" width="55" />
</a>


Peguix AI is a **fully offline AI web application** built using **React (frontend)** and **Node.js (backend)**, powered locally by **Ollama** with **LLaMA 3.2 Vision**.  
It focuses on **privacy, speed, and local inference** without relying on cloud APIs.

---

## 🚀 Features

- 💬 Offline AI Chat (local inference)
- 🖼️ Vision-based image understanding (LLaMA 3.2 Vision)
- 🎙️ Voice input (Speech-to-Text)
- ⚡ Fast responses (runs on local machine)
- 🔒 No data sent to cloud
- 🎨 Modern ChatGPT-style UI
- 🖥️ Desktop-focused (PC optimized)

---

## 🧠 Tech Stack

### Frontend
- React
- CSS (custom UI)
- Web Speech API (for mic input)

### Backend
- Node.js
- Express
- Multer (image upload)
- Ollama (local LLM engine)

### AI Models
- **LLaMA 3.2 Vision**
- Whisper.cpp (for voice input)

---

## ⚠️ Important Note (Please Read)

This project is **NOT meant to run on live hosting** such as GitHub Pages, Vercel, or Netlify.

### Why?
- Requires **Ollama running locally**
- Uses **local AI models**
- Requires **system-level dependencies**
- Backend communicates with `localhost`

✅ The project works **perfectly in offline / local setup**  
❌ It will **not work on public live URLs**

This repository is shared for **learning, demonstration, and development reference**.

---

## 🛠️ How to Run Locally

### 1️⃣ Install Ollama
Download and install Ollama from:
https://ollama.com

### 2️⃣ Pull the Vision Model
```bash
ollama pull llama3.2-vision
