# AudioLingu

![AudioLingu Banner](./public/banner.png)

<div align="center">

**AI-Powered Podcast Generator for Language Learning**

[🚀 Live Demo](https://audiolingu.com) | [🐦 Twitter](https://x.com/Maikoke5)

[![Built for The Modern Stack Hackathon](https://img.shields.io/badge/Built%20for-The%20Modern%20Stack%20Hackathon-blue)](https://www.convex.dev/hackathons/modernstack)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

---

## 🚀 Project Overview

You know that stage when you're learning a new language—when you've mastered the basics and it's time to consume real content to improve your understanding and proficiency? Whether it's watching movies, listening to podcasts, or reading in your target language, immersion is key.

**Audiolingu** is an AI-powered podcast generator tailored for language learning. You specify your target language, current level, and interests, and it generates custom podcast episodes designed just for you. Each episode includes interactive transcripts, AI-generated quizzes to test comprehension, multiple voice options, and progress tracking to help you level up—all built for The Modern Stack Hackathon.

This repository is fully open source. You can explore, modify, or contribute to the code.

## ✨ Features

**🎧 Core Learning Experience**

- Interactive episode playback with word-level transcript synchronization
- AI-powered quiz generation with progress scoring and comprehension tracking
- Custom podcast episodes generated based on your level, language, and interests

**🤖 AI-Powered Content**

- Multi-agent AI system (podcast writer, quiz generator, title generator, and more)
- Automated daily episode generation workflows using Convex Workflows and Cron jobs
- AI-generated custom cover art for each episode
- Content tailored to avoid repetition by analyzing past episodes

**🎙️ Voice & Audio**

- Curated voice catalog with multiple selectable voices via ElevenLabs
- High-quality text-to-speech with word-level alignment for perfect transcript sync

**⚙️ Personalization & Automation**

- Comprehensive onboarding flow (target language, proficiency level, interests, voice preference)
- Daily cron jobs to automatically generate new episodes
- Email notifications via Resend when your episode is ready
- Opt-in/opt-out controls for daily podcasts and email preferences

**🔐 Authentication & Infrastructure**

- Google OAuth and magic link authentication with Better Auth
- Rate limiting with Upstash Redis
- Cloudflare R2 for scalable audio and image storage
- Mobile-responsive design with modern UI (shadcn/ui, Radix UI, TailwindCSS)

## 🛠️ Tech Stack

**Frontend**

- Next.js 15 App Router with React 19
- TypeScript for type safety
- TailwindCSS, Radix UI, and shadcn/ui for modern UI components

**Backend & Infrastructure**

- Convex for everything backend: database, authentication, serverless functions, workflows, cron jobs, agent components, etc.
- Cloudflare R2 for audio and image storage

**AI & Generation**

- OpenAI GPT-5 for multi-agent system (podcast generation, quiz creation, content analysis)
- OpenAI GPT-Image-1 for AI-generated episode cover art
- ElevenLabs for high-quality text-to-speech with word-level alignment
- Scorecard for AI evaluation, A/B testing, and improving model reliability

**Authentication & Communication**

- Better Auth for Google OAuth and magic link authentication
- Resend for transactional emails and daily episode notifications
- Upstash Redis for rate limiting on magic links

## 📦 Installation & Usage

Prerequisites:

- Node.js 18+ and npm
- Convex CLI and a Convex project

1. Clone and install

```bash
git clone https://github.com/MaikoCode/audiolingu-oss.git
cd audiolingu
npm install
```

2. Local environment

```bash
cp .env.example .env.local
# Fill in values as needed
```

3. Dev server

```bash
npx convex dev
npm run dev
# visit http://localhost:3000
```

4. Build & start (production)

```bash
npx convex deploy
npm run build
npm run start
```

## 🌍 Demo

## ☁️ Deployment (Convex)

Follow the Convex deployment guide: [Convex Deployment Guide](https://docs.convex.dev/production/hosting/)

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

Project by [@Maiko](https://x.com/Maikoke5) for The Modern Stack Hackathon.

## 📜 License

MIT
