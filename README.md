<div align="center">

<img src="./public/favicon.svg" alt="Endeerment logo" width="56" align="center" />

 # Endeerment
Endeerment is a cozy mental wellness app that helps people build healthier habits through reflective check-ins, gentle gamification, and a forest that grows as they do.

</div>
## Overview

Endeerment turns small acts of self-care into visible growth. Users can check in with their emotions, care for a deer companion, grow a garden, manage tasks, and connect with friends through a shared social garden. The goal is to make wellness feel calm, personal, and sustainable instead of clinical or overwhelming.

## Features

- Reflective check-ins with warm AI responses
- A growing forest and garden tied to personal progress
- A deer companion with mood, happiness, and interaction systems
- Task tracking with lightweight prioritization
- Daily streaks, points, gifts, and gentle progression loops
- Social features for adding friends and visiting their gardens
- Soft motion and nature-inspired UI throughout the app

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Supabase Auth + database
- Groq-backed reflection endpoint for local/server AI responses

## Project structure

```text
src/
  components/      UI building blocks, forest scene, deer, layout
  contexts/        auth, user data, and social state
  lib/             utilities, mock data, Supabase client helpers
  pages/           landing, dashboard, pet, todos, shop, friends, neighbourhood
api/
  reflect.ts       AI reflection / brain-dump / todo-prioritization endpoint
supabase/
  migrations/      app state + social graph schema
public/
  favicon.svg      app mark / logo
```

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

### 3. Fill in the required environment variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

### 4. Run the app

```bash
bun run dev
```

### 5. Build for production

```bash
bun run build
```

## Supabase setup

This project uses Supabase for authentication and persistent app data.

Relevant migrations:

- [`supabase/migrations/20260418_app_state.sql`](./supabase/migrations/20260418_app_state.sql)
- [`supabase/migrations/20260418_social_graph.sql`](./supabase/migrations/20260418_social_graph.sql)

The schema includes:

- profile and public profile data
- app state storage for reflections, todos, and pet state
- friend requests and friendships
- row-level security policies for authenticated access

## How it works

Users write short check-ins and receive a supportive reflection. Those interactions feed into the rest of the app: progress can grow plants, improve the deer companion's state, and reinforce return habits through streaks and rewards. Social features extend that loop by letting users send friend requests and explore other gardens in the neighbourhood view.

## Inspiration

Endeerment was inspired by the idea that many wellness and productivity tools feel too clinical, too demanding, or too easy to abandon. The goal was to create something gentler: a place where reflection and habit-building feel warm, visual, and rewarding. Instead of treating self-care like a checklist, Endeerment turns it into a living world that grows with the user.

## What it does

Endeerment is a mental wellness and habit-building app where users can check in with themselves, reflect on their emotions, manage small tasks, care for a deer companion, and grow a forest and garden over time. It also includes social features so friends can connect and visit each other's spaces.

## How we built it

We built Endeerment as a full-stack web app using React, TypeScript, Vite, Tailwind CSS, and Framer Motion on the frontend, with Supabase handling authentication and persistent data. We also added a server-side reflection endpoint for AI-powered responses and designed the interface around soft motion, calming visuals, and game-like feedback loops.

## Challenges we ran into

One of the biggest challenges was keeping the experience cohesive as more systems were added. Check-ins, pet state, gardens, rewards, tasks, and social features all had to work together without making the app feel cluttered. Another challenge was maintaining an emotionally supportive tone while still making the app engaging enough that users would want to return.

## Accomplishments that we're proud of

We are proud that Endeerment feels distinct from a typical tracker or dashboard. The combination of reflective wellness tools, a growing forest, a deer companion, and social gardens gives it a strong identity. We are also proud of how much care went into making the interface feel gentle, animated, and consistent.

## What we learned

We learned that building a strong product is not just about functional features, but about emotional design, pacing, and clarity. We also learned a lot about tying frontend state, database structure, and user-facing feedback loops into one cohesive experience.

## What's next for Endeerment

Next, we want to expand customization, deepen the social experience, and make the deer companion and forest systems feel even more responsive. We also want to continue refining the reflection flow and habit systems so the app becomes an even more meaningful daily ritual.

## Notes

- This app is designed as a wellness companion, not a clinical or diagnostic tool.
- AI reflections are meant to feel supportive and grounding, not medical.

