# 🏦 KodBank — AI-Powered Banking Application

A modern full-stack banking web application with an integrated AI financial assistant.

![KodBank](https://img.shields.io/badge/KodBank-Banking%20App-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![AI](https://img.shields.io/badge/AI-Groq%20%2F%20DeepSeek-FF6B35?style=for-the-badge)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration
- 🏠 **Dashboard** — Account overview with live balance
- 💳 **Cards** — View and manage cards
- ↗ **Fund Transfer** — Transfer between accounts
- 🧾 **Bill Payments** — Pay utility bills
- ⚙️ **Settings** — Profile management
- 🤖 **AI Chat Assistant** — Ask financial questions powered by Groq (Llama 3.3 70B)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, CSS |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT, bcrypt, cookies |
| AI | Groq API (Llama 3.3 70B) / DeepSeek / HuggingFace |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/ambikaec1901-lgtm/kodbank.git
cd kodbank/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create `frontend/.env`:
```env
# Get FREE key from https://console.groq.com
GROQ_API_KEY=your_groq_key_here

# Optional: HuggingFace
HF_API_KEY=your_hf_key_here

# Optional: DeepSeek
DEEPSEEK_API_KEY=your_deepseek_key_here
```

### 4. Run the app
```bash
# Starts both backend (port 5000) + frontend (port 5173)
npm start
```

Open **http://localhost:5173**

---

## 🤖 AI Chat Setup

The AI Chat works in 3 modes (priority order):

1. **Groq** ⚡ — Free, fastest (500+ tokens/sec) → [console.groq.com](https://console.groq.com)
2. **HuggingFace** — Free inference API → [huggingface.co](https://huggingface.co)
3. **Built-in** — Works offline, no API key needed

---

## 📁 Project Structure

```
kodbank/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard
│   │   ├── views/          # Accounts, Cards, Transfer, Bills, Settings, ChatAI
│   │   ├── dashboard.css   # All dashboard styles
│   │   └── App.jsx
│   ├── server/
│   │   ├── index.js        # Express API server
│   │   └── db.js           # SQLite database
│   ├── hf-space/           # HuggingFace Space files (optional)
│   └── scripts/            # Setup helpers
└── README.md
```

---

## 🔒 Security

- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcrypt
- API keys stored server-side only (never exposed to frontend)
- `.env` and `bank.db` excluded from version control

---

*Built with ❤️ — KodBank AI Banking Platform*
