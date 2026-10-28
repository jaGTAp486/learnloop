# AI StudyMate — Study Smarter. Learn Faster.

> An AI-powered learning assistant for engineering students in India. Understand difficult concepts, generate notes, create quizzes, and prepare for exams — all in one place.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20TypeScript%20%2B%20Supabase-0d9488)

---

## The Problem

First- and second-year engineering students in India often struggle with:

- **Dense textbooks** and concepts that are hard to understand without a tutor
- **No structured notes** — spending more time organizing than learning
- **No way to self-test** before exams
- **Poor study planning** — cramming without a schedule
- **Limited access** to personalized, on-demand academic help

## The Solution

AI StudyMate is a single web app that gives every student an AI tutor, note-taker, quiz maker, and study planner. It runs on any device, requires no sign-up, and works immediately — in **Demo Mode** out of the box, or with **real AI** when an OpenAI API key is configured.

### Core Features

| # | Feature | What it does |
|---|---------|-------------|
| 1 | **AI Doubt Solver** | Enter any academic question → get a step-by-step explanation with examples. Optional "Simple English" mode. |
| 2 | **AI Notes Generator** | Enter a topic → get structured notes with definitions, key points, examples, and a quick revision summary. |
| 3 | **AI Quiz Generator** | Enter a topic → get 5 multiple-choice questions. Select answers, submit, see correct answers + explanations, and get a final score. |
| 4 | **Exam Prep Mode** | Enter subject, unit, and available time → get a prioritized, day-by-day study schedule with revision and practice sessions. |
| 5 | **Student Dashboard** | Track quiz scores, recent activity, and study goals. All progress saved in local storage. |
| 6 | **AI Chat Assistant** | Conversational tutor for follow-up questions and interactive learning. |

### Demo Mode vs Real AI

The app **never pretends** to have AI when it doesn't.

- **No API key configured** → Every AI response is clearly labeled with a yellow **"Demo Mode"** banner. Responses are curated samples — functional but static.
- **OpenAI API key configured** → All responses are real, dynamic, and tailored to the student's exact input. No banners shown.

This means the app is **fully demonstrable at a hackathon with zero configuration**, and becomes a real product the moment a key is added.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (custom teal/green design system) |
| Icons | Lucide React + custom SVG logo |
| Backend | Supabase (Edge Functions for AI proxy) |
| AI Provider | OpenAI `gpt-4o-mini` (via server-side edge function) |
| State Persistence | Browser Local Storage (quiz scores, activity, goals) |
| Hosting | Bolt.new / Any static host + Supabase Edge Functions |

### Architecture

```
Browser (React)
  ├── User input → fetch → Supabase Edge Function (/ai-tutor)
  │                        ├── If OPENAI_API_KEY set → calls OpenAI API
  │                        └── If no key → returns curated demo response (isDemo: true)
  └── Local Storage ← quiz scores, activity log, study goals
```

**API keys are never exposed to the frontend.** All AI calls go through the Supabase Edge Function, which reads the OpenAI key from server-side environment variables.

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A Supabase project (already provisioned on Bolt.new)

### 1. Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 2. Enable Real AI (Optional)

To switch from Demo Mode to real AI responses:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions → Secrets**
3. Add a secret named `OPENAI_API_KEY` with your OpenAI API key value
4. Redeploy the edge function (or it picks up the secret on next invoke)

That's it — the app automatically detects the key and switches to real AI. No code changes needed.

### 3. Build for Production

```bash
npm run build      # type-checks + builds to dist/
npm run preview    # preview the production build
```

---

## How to Demonstrate (Hackathon)

### Flow 1: Doubt Solver
1. Click **"Launch App"** on the landing page
2. Open **Doubt Solver** from the sidebar
3. Type a question (e.g. "Explain Newton's Second Law") or click a sample
4. Click **Get Answer** → see the step-by-step explanation
5. Toggle **Simple English** and try again

### Flow 2: Quiz Generator
1. Open **Quiz Generator** from the sidebar
2. Enter a topic (e.g. "Basic Electronics") or click a sample
3. Click **Generate Quiz** → answer the 5 questions
4. Click **Submit Quiz** → see score, correct answers, and explanations
5. Check the **Dashboard** — the quiz score appears in history

### Flow 3: Exam Prep
1. Open **Exam Prep Mode**
2. Enter subject, unit, and available time
3. Click **Generate Study Plan** → see the day-by-day schedule with priorities

### Flow 4: Chat Assistant
1. Open **Chat Assistant**
2. Ask a question → get a response → ask a follow-up
3. The conversation persists during the session

### Flow 5: Dashboard
1. Open **Dashboard** → see quiz scores, recent activity, and stats
2. Add a study goal → check it off → it saves to local storage
3. Refresh the page → everything persists

---

## Project Pitch

### Innovation
AI StudyMate brings six AI-powered study tools into one cohesive app — something that typically requires juggling multiple websites, apps, and PDFs. The key innovation is the **Demo Mode fallback**: the app works perfectly for demonstration without any API key, then seamlessly upgrades to real AI when a key is added. This makes it both a hackathon showcase *and* a deployable product.

### Impact
For engineering students in India — especially those without access to private tutors — AI StudyMate provides:
- **On-demand explanations** in simple English
- **Structured notes** without manual effort
- **Self-testing** with instant feedback
- **Realistic study schedules** tailored to their time and priorities
- **Zero cost, zero sign-up** — accessible to everyone with a phone or laptop

### Why It's Different
- No fake AI — demo mode is clearly labeled
- API keys stay server-side — no security risks
- Progress persists without accounts — local storage
- Designed for the actual student workflow: understand → note → test → plan → revise

---

## Limitations

1. **Demo Mode responses are static** — they're curated samples, not dynamic AI. Real AI requires an OpenAI API key.
2. **No user accounts** — progress is stored per-browser in local storage. Clearing browser data resets it.
3. **Quiz count is fixed at 5 questions** per generation (by design, for quick practice).
4. **Exam schedules are generated once** — they don't adapt dynamically as you complete sessions.
5. **AI accuracy depends on the provider** — always verify important information against your textbook.

---

## Project Structure

```
src/
├── components/
│   ├── AppShell.tsx        # Sidebar navigation + layout
│   ├── ChatAssistant.tsx   # Conversational AI tutor
│   ├── Dashboard.tsx       # Stats, goals, activity, quiz history
│   ├── DoubtSolver.tsx     # Question → step-by-step answer
│   ├── ExamPrep.tsx        # Study schedule generator
│   ├── Landing.tsx         # Marketing landing page
│   ├── Logo.tsx            # StudyMate brand mark (SVG)
│   ├── NotesGenerator.tsx  # Topic → structured notes
│   ├── PageHeader.tsx      # Shared page title component
│   ├── QuizGenerator.tsx   # MCQ quiz with scoring
│   └── ui.tsx              # Loading, error, demo banner, empty state
├── hooks/
│   └── useAppData.ts       # Local storage state hook
├── lib/
│   ├── ai.ts               # Edge function API client
│   ├── markdown.ts         # Lightweight markdown renderer
│   ├── parse.ts            # JSON quiz/schedule parser
│   ├── storage.ts          # Local storage load/save
│   └── supabase.ts         # Supabase client setup
├── types.ts                # Shared TypeScript types
├── App.tsx                 # Root: landing ↔ app routing
└── index.css               # Tailwind + design system

supabase/
└── functions/
    └── ai-tutor/
        └── index.ts        # Edge function: AI proxy + demo fallback
```

---

## License

Built for educational and hackathon use. Free to adapt and extend.

*Study Smarter. Learn Faster.*
