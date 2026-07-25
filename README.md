# Mentora AI 🎓

An **Agentic AI Study Mentor** that helps students prepare for exams.  
Built for **SDG 4 – Quality Education**.

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | Vue 3 + Vite + Vue Router   |
| Backend  | Node.js + Express           |
| AI       | Groq API                    |

---

## Quick Start (Unified Application)

The entire full-stack application (both frontend UI and backend API) is consolidated into the `server/` folder for simplicity.

### 1. Clone & Setup

```bash
git clone <repo-url>
cd Mentora-AI/server
```

### 2. Environment Variables

Create `.env` inside the `server/` directory (you can copy from `.env.example`):

```bash
cp .env.example .env        # add your GROQ_API_KEY
```

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

### 3. Install & Run (Development Mode)

Start both the Express API backend and Vite Vue frontend simultaneously with a single command:

```bash
npm install
npm run dev
```

- **Frontend UI**: http://localhost:5173 (with automated API proxying to backend)
- **Backend API**: http://localhost:3000

---

## Production / Full-Stack Mode

To build and run the application as a single Node/Express server serving both the API and the compiled Vue SPA:

```bash
cd server
npm run build
npm start
```

- **Unified Application**: Access everything at http://localhost:3000

---

## Repository Structure

- `server/` – **Main Application:** Contains the combined full-stack Node.js + Vue 3 application.
- `frontend/` & `backend/` – Kept intact in this test repository for reference purposes.

---

## Features

- 📋 **Student Setup** – Name, subject, exam details
- 📅 **Study Planner** – AI-generated day-by-day plan
- 📝 **Quiz Generator** – MCQ, Short Answer, True/False
- ✅ **Answer Evaluation** – Score, explanations, weak topics
- 📊 **Progress Tracker** – Scores, streaks, improvements
- 💬 **Motivation** – Personalised messages after every quiz

---

## License

MIT
