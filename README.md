# Project Ascend — Self-Improvement RPG

A gamified self-improvement dashboard where users choose who they want to become,
complete daily quests, and watch a **Living Future Self avatar** evolve through
RPG-style progression. Built on the Kintsugi philosophy — embracing flaws and
forging them into gold.

Users choose up to 3 of **9 pillars** (Health & Fitness, Mental Wellness,
Productivity, Finance, Relationships, Learning & Education, Faith / Religion,
Creativity, Career & Leadership), pick one of **4 gamemodes** (Drift · Momentum ·
Forge · Ascendant) that set their daily rhythm and XP multiplier, and build
**Kintsugi streaks** — forgiving streaks where a comeback after a miss leaves a
permanent gold seam on the avatar.

It's built to be a **second brain**: a global ✨ capture button on every screen
takes any thought in two taps — parsed into a scheduled task ("Gym 6pm 45m !!")
or a timestamped journal note — and live-searches everything you've ever stored
as you type, so nothing captured is ever lost. Haptic feedback and instant tab
switching keep it feeling like a native app.

It's also a **daily-use productivity app**: a **Today** hub (the default home) wraps
the day in a Plan → execute → Reflect ritual, **Schedule** offers a 24-hour
drag-and-drop **time-blocking** timeline with **future-date planning**, **Tasks**
handles to-dos + custom habits + participation bounties, and **Journal** gives
guided prompts, mood, a journaling streak, and **on-device voice-to-text**. Quick-add
parses plain text ("Gym 6pm 45m !!") with no AI. Each pillar grows a **skill tree**
whose nodes unlock only through consistency — streaks, repetitions, and comebacks —
never raw XP. Progress renders your **"Shape of You" radar** across six fixed
attributes (Vitality · Focus · Mind · Create · Connect · Resolve — the Kintsugi
stat, fed by streaks and comebacks), and **Boss Fights** let you name the task
you've been avoiding and slay it for the biggest win of the week. A **Deep Focus
raid** is a full-screen focus timer you forfeit by leaving — clear it to forge
focus into XP.

Backend is **Supabase** (Postgres + Auth + Realtime), with a full offline mode, and
mobile-first layout that respects device safe areas. Design is deliberately
**minimal**: five tabs (Today · Schedule · Tasks · Journal · Progress), a display
typeface (Space Grotesk) reserved for identity moments, WCAG-minded contrast,
visible keyboard-focus rings, and `prefers-reduced-motion` support.

> Note: voice journaling uses the **on-device** Web Speech API (no cloud). The
> heavier **cloud-AI** features (AI summaries/insights, large-scale transcription,
> Gemini quest-gen) are designed but **intentionally not built** — gated on
> cost/privacy/provider decisions (see `GROWTH_STRATEGY.md`).

## How we work
- 🟢 **Autonomous** is the standing default — build on judgment, pause only for
  destructive actions, secrets, money, or big product-direction calls.
- One human directs; the AI builds. Only chat messages are instructions.
- Every change goes through **build → verify → commit → deploy**.

## The three docs
| Doc | Audience | Purpose |
|-----|----------|---------|
| `README.md` | anyone | What it is + how we work + doc map |
| `STATUS.md` | owner + AI | Current phase, state, done ✅, active ⬜ to-do |
| `HANDBOOK.md` | builders | Architecture, data model, rules, deploy, changelog |
| `GROWTH_STRATEGY.md` | product/growth | Onboarding, retention, gamemode & landing strategy |

## Quick start
```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build → dist/
npm run lint       # typecheck: tsc --noEmit
```

Supabase config lives in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`);
the database schema is in `supabase/schema.sql`.
