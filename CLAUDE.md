# CLAUDE.md — Project Ascend (Kintsugi)

> Feed this file to a new Claude Code session as the project briefing.
> The real codebase is at `C:\Users\faysa\Downloads\project-ff`.

## Identity

**Project Ascend** — a gamified RPG self-improvement web app with the **Kintsugi** visual identity (purple/gold, "repair the cracks with gold"). The user explicitly rejected a Solo Leveling cyan reskin — keep Kintsugi. Cloud AI features are **HALTED** pending owner decisions on cost/privacy/provider.

## Stack

- **Vite 6** + **React 19** + **TypeScript 5.8** + **Tailwind CSS 4** + **Supabase** (Postgres, Auth, Realtime)
- `motion/react` for animations, `lucide-react` for icons, `@dnd-kit/core` for drag-and-drop
- PWA via `manifest.json` + `sw.js`
- Fonts: **Outfit** (body), **Space Grotesk** (display/`font-display`), **JetBrains Mono** (numbers/mono)
- Dev server: `npm run dev` → port 3000, `--host=0.0.0.0`
- Build: `npm run build` (passes clean), lint: `npm run lint` = `tsc --noEmit`

## Architecture

### App.tsx — root component (hooks pattern)
Uses extracted hooks, NOT monolith state:
- `useGameState` — central state (profile, quests, todayLog, activeTab, etc.)
- `useAuth` — Supabase auth lifecycle (Google OAuth, offline mode)
- `useCloudSync` — Supabase realtime sync
- `useQuestActions` — quest toggle + quick-add + streak/XP/levelup logic
- `useJournalActions` — onboarding, journal save, pillar updates
- `useNonNegotiables` — auto-regenerating daily quest templates
- `useRecurringTasks` — daily/weekly/weekdays/interval recurrence engine

Layout components: `AppSidebar` (desktop), `AppHeader`, `AppTabNav` (mobile bottom bar), `AppRightRail` (desktop)

### Tab model
```ts
type AppTab = "today" | "schedule" | "quests" | "journal" | "stats";
// default = "today"
```
Stats has sub-views: `"overview" | "radar" | "skills" | "pillars" | "insights"` (local state in App.tsx)

### Key components
| Component | What it does |
|---|---|
| `TodayHub` | Default home: greeting, morning plan, quick-add, deep focus card, bounties funnel, top 3 pinned, plan tomorrow |
| `ScheduleView` | 24h timeline, date nav, @dnd-kit drag-drop, auto-scroll to current hour |
| `QuestsAchievements` | Boss Fights, Bounties (scroll-target), Non-Negotiables, Core Habits, Daily/Weekly quests, editor |
| `JournalView` | Mood picker, guided prompts, voice-to-text (Web Speech API), gratitude/win, weekly review, searchable history |
| `RadarChart` | Hand-rolled SVG hexagonal radar, 6 fixed attributes, tier-colored stroke, spring animation |
| `SkillTree` | 6 consistency-gated nodes per pillar, derived from PillarStats (no stored state) |
| `FocusRaid` | Full-screen timer overlay, 25/60/90m presets (persistent), forfeit = no reward, cleared = XP |
| `CaptureSheet` | Global FAB → bottom sheet: task (parseQuickAdd) or timestamped journal note + live recall search |
| `BugReport` | Bug/confusing/idea/other → Supabase `bug_reports` table with localStorage queue fallback |
| `Dashboard` | Legacy main view — still used for some UI, has midnight countdown |
| `KintsugiBrain` | SVG Kintsugi emblem used across screens |

### Data model (src/types.ts)
- `UserProfile` — level, xp, pillars (Record<string, PillarStats>), participation, journalStreak, focusMinutes, nonNegotiableTemplates, vocabularyMode
- `Quest` — isBoss, isNonNegotiable, priority, pinned, scheduledTime/Date, durationMin, recurrence
- `DailyLog` — completedTasks, pillarNotes, journalEntry, morningIntention, mood, gratitude, win
- `PillarStats` — level, xp, streak, weight, lastActiveDate, freezes, seams, longestStreak

### Config (src/data.ts)
Key exports: `AVAILABLE_PILLARS`, `GAMEMODES`, `getGameMode()`, `getDailyQuestCap()`, `BOUNTY_TIERS`/`nextBounty()`/`earnedBounties()`, `PILLAR_GOAL_CHIPS`, `parseQuickAdd()`, `PRIORITY_META`, `MOODS`/`promptForDate()`, `ATTRIBUTES`/`PILLAR_TO_ATTRIBUTE`/`computeAttributes()`, `SKILL_NODES`/`pillarCompletions()`, `APP_VERSION = "0.9.0-beta"`, `generateRepairQuests()`, `createDefaultProfile()`

### Gamification systems
- **4 gamemodes:** Drift, Momentum, Forge, Ascendant (different quest counts, XP multipliers, streak rules)
- **6 radar attributes (fixed):** Vitality, Focus, Mind, Create, Connect, Resolve — pillars map 1:1 via `PILLAR_TO_ATTRIBUTE`
- **Resolve** is the Kintsugi stat (streaks + seams + journal streak, not just quest XP)
- **Skill trees:** 6 nodes per pillar (Initiate→Foundation→Rhythm→Deep Groove→Kintsugi→Identity), fully derived
- **Kintsugi streak engine** (`src/streak.ts`): action-driven, gamemode-aware, freezes, gold seams, 50% floors
- **Boss Fights:** `Quest.isBoss`, rose-styled `.boss-live` CSS pulse, BOSS SLAIN toast
- **Bounties:** `BOUNTY_TIERS` (5/10/25/50/100/250 completions) with participation tracking
- **Haptics** (`src/haptics.ts`): tap/success/streak/levelup vibration patterns

### Storage
- **Local:** all `projectff_*` localStorage keys (profile, quests, daily logs, templates, focus pref, bug queue)
- **Cloud:** Supabase `profiles` + `daily_logs` tables (RLS per user). Journal fields packed into `pillar_notes.__journal` JSONB key
- **Bug reports:** Supabase `bug_reports` table (anon-insert RLS, owner reads in dashboard)

## Critical gotchas

1. **`@types/react` IS installed** (v19.2.17) — earlier sessions had issues with React 19 `key` prop but the types package is now present
2. **No concurrent AI agents** — a parallel DeepSeek agent caused a catastrophic fork by rewriting App.tsx. Never run two agents on this repo simultaneously
3. **Cloud AI is HALTED** — on-device voice transcription (Web Speech API) is the only allowed voice feature. Do not build cloud AI features without explicit owner sign-off
4. **.env contains live Supabase credentials** — git-ignored, never commit
5. **`handleReset`** wipes ALL `projectff_*` localStorage keys (except offline flag) AND upserts a fresh default profile to Supabase for signed-in users
6. **Mobile nav** — single bottom bar only (`AppTabNav`, `md:hidden`). A redundant top pill nav was removed — don't re-add it
7. **Content padding** — `<main>` has `pb-[calc(6rem+env(safe-area-inset-bottom))]` so content doesn't hide behind nav/FAB
8. **Focus presets** are 25/60/90 minutes (not 25/50/90)
9. **Kintsugi node** in skill trees unlocks via `seams >= 1` OR 14-day streak
10. **Journal fields** cloud-sync via `pillar_notes.__journal` JSONB packing (no DB migration needed)

## CSS theme (src/index.css)
Tokens: `brand`, `brand-dark`, `brand-glow`, `brand-neon`, `gold`, `gold-light`
Classes: `.text-ascend` (gradient), `.system-card`, `.boss-live` (boss-pulse animation), `.hud-bar`
Supports `prefers-reduced-motion`, `:focus-visible` ring, safe-area insets, custom scrollbars

## Supabase
- Project URL: `https://msdabogetqgjrqjkigju.supabase.co`
- Schema: `supabase/schema.sql` (profiles + daily_logs + bug_reports)
- Auth: Google OAuth provider enabled
- `src/supabase.ts`: client, `loginWithGoogle()`, `logoutUser()`, `upsertProfile()`, `upsertDailyLog()`, `submitBugReport()`, `flushBugReports()`

## Pending tasks (prioritized)

1. **Create `bug_reports` table** — run updated `supabase/schema.sql` in Supabase SQL Editor
2. **Set Vercel env vars** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project settings
3. **Commit + deploy to Vercel** — production build passes, code is deploy-ready
4. **Recurring task engine** — `useRecurringTasks` hook exists but daily materialization may need testing
5. **Simple ↔ Pro mode** — hide XP/weights/ranks for beginners (designed, not built)
6. **Rule-based weekly insights** — `WeeklyInsights.tsx` exists, may need polish
7. **Local/web push reminders** via `sw.js`
8. **Underdog Bonus** — lowest-attribute +XP spotlight (designed, deferred)

## Designed but NOT built
- Social layer (accountability buddy, circles)
- Seasons/prestige system
- Level-up attribute point allocation (explicitly rejected — breaks "earned by behavior" principle)
- Cloud AI features (voice journal AI summaries, Gemini quest-gen)

## File tree (key files)
```
project-ff/
├── src/
│   ├── App.tsx                    # Root component (hooks architecture)
│   ├── types.ts                   # All TypeScript interfaces
│   ├── data.ts                    # Config, constants, helpers (~massive)
│   ├── streak.ts                  # Kintsugi streak engine
│   ├── haptics.ts                 # Vibration patterns
│   ├── supabase.ts                # Supabase client + helpers
│   ├── notifications.ts           # Push notification helpers
│   ├── index.css                  # Theme tokens, animations, a11y
│   ├── hooks/
│   │   ├── useGameState.ts        # Central state + AppTab type
│   │   ├── useAuth.ts             # Auth lifecycle
│   │   ├── useCloudSync.ts        # Supabase realtime
│   │   ├── useQuestActions.ts     # Quest toggle + XP + streaks
│   │   ├── useJournalActions.ts   # Journal save + onboarding
│   │   ├── useNonNegotiables.ts   # Auto-regen daily quests
│   │   └── useRecurringTasks.ts   # Recurrence engine
│   └── components/
│       ├── TodayHub.tsx           # Home tab
│       ├── ScheduleView.tsx       # 24h timeline + drag-drop
│       ├── QuestsAchievements.tsx  # Quests/bosses/bounties/editor
│       ├── JournalView.tsx        # Guided journal + voice + history
│       ├── RadarChart.tsx         # SVG hexagonal radar
│       ├── SkillTree.tsx          # Consistency-gated skill nodes
│       ├── FocusRaid.tsx          # Deep focus timer overlay
│       ├── CaptureSheet.tsx       # Global capture FAB + recall
│       ├── BugReport.tsx          # Beta feedback reporter
│       ├── Dashboard.tsx          # Legacy main view
│       ├── AppSidebar.tsx         # Desktop sidebar nav
│       ├── AppHeader.tsx          # Top header bar
│       ├── AppTabNav.tsx          # Mobile bottom nav
│       ├── AppRightRail.tsx       # Desktop right panel
│       ├── WeeklyInsights.tsx     # Stats insights dashboard
│       ├── PillarTracker.tsx      # Pillar weight/log editor
│       ├── AuthScreen.tsx         # Login/offline screen
│       ├── OnboardingScreen.tsx   # 3-step onboarding flow
│       ├── FutureSelf.tsx         # Evolving avatar (5 tiers)
│       ├── KintsugiBrain.tsx      # SVG Kintsugi emblem
│       ├── LevelUpNotification.tsx # Full-screen level-up modal
│       └── ErrorBoundary.tsx      # Error boundary wrapper
├── supabase/schema.sql            # DB schema (profiles + daily_logs + bug_reports)
├── public/manifest.json           # PWA manifest
├── index.html                     # Entry point
├── vite.config.ts                 # Vite config (@ alias, HMR toggle)
├── tsconfig.json                  # TS config (ES2022, bundler resolution)
├── .env                           # Supabase credentials (GIT-IGNORED)
├── STATUS.md                      # Living status doc (all phases)
├── HANDBOOK.md                    # App handbook / rules
├── README.md                      # Project readme
├── DESIGN_SYSTEM.md               # Full design system spec
└── GROWTH_STRATEGY.md             # Growth/retention strategy doc
```

## How to verify
```bash
cd C:\Users\faysa\Downloads\project-ff
npm run lint      # tsc --noEmit (should be 0 errors)
npm run build     # production build (~225 kB gzip)
npm run dev       # dev server on :3000
```

## Conventions
- localStorage keys: `projectff_*` prefix
- Quest IDs: `q_${Date.now()}_${random}`
- Non-negotiable template IDs: `nnt_${Date.now()}_${random}`
- Dates: YYYY-MM-DD strings throughout
- All new profile/quest fields are optional for backward compatibility
- No `@types/react` issues — it IS installed now (v19.2.17)
- Commit messages should be descriptive, not just "update"
- Update STATUS.md after shipping features
