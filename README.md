# Bible Study App

A Bible study web app with AI-generated commentary. Enter any verse reference, read it alongside structured commentary, write a personal reflection, and share it with the community — no sign-up required. Visitors get an anonymous session with one click and can start reading immediately.

**Live demo:** _[add URL here]_

## Screenshots

_[Add screenshots here — suggested: landing page, verse + commentary view, shared reflections panel]_

## Features

- **Verse lookup** — fetches accurate Scripture text from the ESV Bible API
- **AI commentary** — three concurrent OpenAI prompts generate historical context, general meaning, a "Reading it Right" study guide (Summarize / Expose / Change / Prepare), denominational perspectives, and a reflective question, with graceful fallbacks if any prompt fails
- **Personal reflections** — answer the reflective question, add an insight, and save it (optionally shared publicly)
- **Community feed** — shared reflections from the last 30 days rotate in a carousel with theme tags and likes
- **Anonymous demo access** — Supabase anonymous auth creates a real, RLS-scoped user without any registration friction

## Tech stack

- **Next.js 15** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — Postgres, Row Level Security, anonymous auth, and a Postgres RPC function for atomic like-toggling
- **OpenAI API** (gpt-4o-mini) for commentary generation
- **ESV Bible API** for Scripture text
- **Vercel** for hosting and analytics

## Architecture

The core flow lives on the reading page:

1. **Verse fetch** — the client posts the reference to `/api/verse`, a route handler that queries the ESV API server-side (the ESV key never reaches the browser).
2. **Commentary pipeline** — the verse text goes to `/api/commentary`, which fans out three OpenAI JSON-mode prompts in parallel (`Promise.all`), merges the results over a default commentary object, and normalizes the AI's themes against an allowed list so theme tags stay consistent.
3. **Reflections** — saves go directly from the browser to Supabase using a single shared client (`lib/supabaseClient.ts`). RLS policies scope reads/writes of private data to the authenticated user; shared reflections (`is_shared = true`) are readable by all authenticated users.
4. **Community + likes** — the shared panel refetches after each save, and likes call a `toggle_like` Postgres function (SECURITY DEFINER) that locks the row and updates the like count and liker list atomically.

All user-facing DB calls are wrapped in a timeout guard so a wedged request surfaces an error instead of hanging, and debug logging is dev-only (`lib/logger.ts` no-ops in production, and the production build also strips `console.*`).

## Local setup

Requires Node 18+.

```bash
npm install
```

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key
ESV_API_KEY=your-esv-api-key
```

Set up the database by running the SQL files in `supabase/migrations/` (in filename order) in your Supabase project's SQL editor — they create the tables, RLS policies, and the `toggle_like` function. Enable anonymous sign-ins under Authentication settings in the Supabase dashboard.

Then:

```bash
npm run dev
```

and open http://localhost:3000.

## Project structure

```
app/
  page.tsx              landing page (verse of the day, start journey)
  reading/page.tsx      main flow: verse → commentary → reflection → community
  profile/page.tsx      reading history and reflection stats
  api/verse/            ESV API proxy
  api/commentary/       OpenAI commentary pipeline
components/             header, theme chips, loading skeletons
context/AuthContext.tsx session state via Supabase auth listener
lib/supabaseClient.ts   the single shared browser client + timeout helper
lib/logger.ts           dev-only logger
supabase/migrations/    schema, RLS policies, toggle_like function
```
