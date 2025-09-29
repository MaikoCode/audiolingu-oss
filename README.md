## 🚀 Project Overview

Audiolingu is an open‑source language‑learning companion that turns podcasts into interactive lessons. It transcribes episodes, generates quizzes, and lets you follow along with transcripts, voices, and progress tracking — all built for The Modern Stack Hackathon.

This repository is fully open source. Contributions, issues, and pull requests are welcome.

## ✨ Features

- Interactive episode playback with transcript sync
- AI‑generated quizzes and progress scoring
- Voice catalog with selectable voices
- Onboarding flow for language, level, and interests
- Mobile‑friendly layout with a persistent now‑playing bar
- Authentication with Google

## 🛠️ Tech Stack

- Next.js App Router (React 19)
- TypeScript, TailwindCSS, Radix UI, shadcn/ui
- Convex (database, auth, functions, workflows)
- OpenAI + ElevenLabs for AI and TTS
- Upstash Redis for rate‑limiting/caching
- Resend for transactional email

## 📦 Installation & Usage

Prerequisites:

- Node.js 18+ and npm
- Convex CLI and a Convex project

1. Clone and install

```bash
git clone <your-fork-or-repo-url>
cd audiolingu
npm install
```

2. Local environment

```bash
cp .env.example .env.local
# Fill in values as needed (see Environment Variables below)
```

3. Dev server

```bash
npm run dev
# visit http://localhost:3000
```

4. Build & start (production)

```bash
npm run build
npm run start
```

## 🌍 Demo / Screenshots

Add screenshots or a demo link here.

## ☁️ Deployment (Convex)

Follow the Convex deployment guide: [Convex Deployment Guide](ADD-CONVEX-GUIDE-URL-HERE)

Environment setup:

- Local Next.js: `.env.local` (copy from `.env.example`)
- Convex environment variables: set these in your Convex deployment

Required Convex env vars:

```
AI_GATEWAY_API_KEY
BETTER_AUTH_SECRE
ELEVENLABS_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
OPENAI_API_KEY
R2_ACCESS_KEY_ID
R2_BUCKET
R2_ENDPOINT
R2_SECRET_ACCESS_KEY
R2_TOKEN
RESEND_API_KEY
RESEND_FROM
SCORECARD_API_KEY
SITE_URL
UPSTASH_REDIS_REST_TOKEN
UPSTASH_REDIS_REST_URL
```

## 👥 Team

Project by the Audiolingu team for The Modern Stack Hackathon. Add yourself and contributors here.

## 📜 License

MIT — see `LICENSE` for details.
