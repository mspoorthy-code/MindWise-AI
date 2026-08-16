# MindWise AI 🧠

> **AI-Powered Mental Health Support for College Students & Young Professionals**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5--Flash-purple?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

**MindWise AI** delivers an empathetic, AI-powered mental health companion for students and young professionals. The application has been architected into **separated frontend and backend services** with a **PostgreSQL database**:

- **Frontend (`frontend/`)**: Modern UI built with Next.js 16 (App Router), React 19, TypeScript, and Vanilla CSS design system.
- **Backend (`backend/`)**: RESTful Express API server in TypeScript powered by **PostgreSQL** (Prisma ORM) and **Google Gemini 2.5 Flash**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Psychological Assessment** | 10-question scored assessment across 5 dimensions (Stress, Anxiety, Mood, Sleep, Self-Esteem) |
| 💬 **AI Therapy Chat** | Gemini AI conversational therapy tailored to your psychological profile |
| 📊 **Mood Tracking** | Daily mood logger with interactive 7-day trend chart |
| 📝 **AI Journaling** | Empathetic AI reflections generated for your journal entries |
| 🌿 **Guided Sessions** | Interactive CBT thought reframing, 5-sense grounding, and Navy SEAL Box Breathing |
| 🕵️ **Anonymous & User Auth** | Email/Password login, Sign up, or instant Anonymous mode |
| 🆘 **Crisis Detection** | Urgent crisis helpline resource banner triggered on safety keywords |
| 📈 **Session Summary** | AI-generated session summaries at the end of therapy conversations |

---

## 🏗️ Architecture

```
MindWiseAI/
├── frontend/                    # Next.js 16 Frontend UI
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── assessment/         # 10-question psychological assessment
│   │   ├── auth/               # Sign In / Sign Up / Anonymous auth
│   │   ├── chat/               # AI therapy chat interface
│   │   ├── dashboard/          # Mood chart, journaling, guided sessions
│   │   └── therapy/            # Guided CBT / Mindfulness / Box Breathing
│   └── lib/
│       └── assessment.ts       # Scoring engine & question bank
│
├── backend/                     # Express REST API Server + PostgreSQL
│   ├── src/
│   │   ├── server.ts           # Server entrypoint (Port 5000)
│   │   ├── app.ts              # Express middleware & app routes
│   │   ├── routes/
│   │   │   ├── auth.ts         # User auth & anonymous session API
│   │   │   ├── assessment.ts   # Assessment profile persistence API
│   │   │   ├── mood.ts         # Mood tracking & trend history API
│   │   │   ├── journal.ts      # Journaling & Gemini reflection API
│   │   │   └── therapy.ts      # AI therapy chat & session summary API
│   │   └── lib/
│   │       ├── db.ts           # Prisma PostgreSQL client
│   │       └── gemini.ts       # Google Gemini AI client
│   └── prisma/
│       └── schema.prisma       # PostgreSQL Database Schema
│
└── package.json                 # Workspace root scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **PostgreSQL**: Local or hosted database instance
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### Setup & Installation

1. **Install workspace dependencies**:
   ```bash
   npm install
   ```

2. **Configure Backend Environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `backend/.env` to configure your PostgreSQL connection and Gemini API key:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mindwise_db?schema=public"
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

3. **Initialize Database (PostgreSQL & Prisma)**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Run Development Server (Both Frontend & Backend concurrently)**:
   From the root folder:
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:5000

---

## 🧪 Testing

Run test suites for both frontend and backend:

```bash
# Run all tests (Frontend + Backend)
npm test

# Run backend tests only
npm run dev:backend -- test

# Run frontend tests only
npm run dev:frontend -- test
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Vanilla CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Google Gemini 2.5 Flash SDK (`@google/generative-ai`)
- **Testing**: Jest, Supertest, ts-jest


