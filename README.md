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

## Quick Start

### 1. Clone & Setup

```bash
git clone <repo-url>
cd Mentora-AI
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # add your GROQ_API_KEY
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

---

## Features

- 📋 **Student Setup** – Name, subject, exam details
- 📅 **Study Planner** – AI-generated day-by-day plan
- 📝 **Quiz Generator** – MCQ, Short Answer, True/False
- ✅ **Answer Evaluation** – Score, explanations, weak topics
- 📊 **Progress Tracker** – Scores, streaks, improvements
- 💬 **Motivation** – Personalised messages after every quiz

---

## Environment Variables

Create `backend/.env`:

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

---

## License

MIT
