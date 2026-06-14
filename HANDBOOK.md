# HANDBOOK — Project Ascend

## Architecture

```
project-ff/
├── src/
│   ├── App.tsx                  # Root: explore/auth → onboarding gate → app (default tab: Today)
│   ├── main.tsx                 # ReactDOM entry
│   ├── types.ts                 # UserProfile, PillarStats, Quest (+planner), GameMode(Def), Priority
│   ├── data.ts                  # PILLARS, GAMEMODES, BOUNTY_TIERS, parseQuickAdd, journal prompts
│   ├── supabase.ts              # Supabase client: Google OAuth, profiles/daily_logs, realtime
│   ├── streak.ts                # Kintsugi streak engine (gamemode-aware recovery)
│   ├── haptics.ts               # Vibration patterns (tap/success/streak/levelup), iOS-safe no-op
│   ├── vite-env.d.ts            # Vite client types (import.meta.env)
│   ├── index.css                # Tailwind v4 @theme, glow utilities, fonts
│   └── components/
│       ├── AuthScreen.tsx           # Login: Google auth + offline mode
│       ├── OnboardingScreen.tsx     # Pillars → Choose Your Path → Reveal (avatar + first quest)
│       ├── TodayHub.tsx             # DEFAULT tab: greeting, ring, Morning Plan, Top-3, agenda, Reflect
│       ├── CaptureSheet.tsx         # Global ✨ FAB sheet: capture task/note + live recall search
│       ├── SkillTree.tsx            # Consistency-gated skill trees per pillar (Progress → Skills)
│       ├── RadarChart.tsx           # "Shape of You" 6-attribute radar (Progress → Overview)
│       ├── FocusRaid.tsx            # Deep Focus full-screen timer ("raid" you fail by leaving)
│       ├── ScheduleView.tsx         # 24h time-blocking + drag-and-drop (dnd-kit), date navigator
│       ├── JournalView.tsx          # Journal: voice-to-text, mood, prompts, ritual, streak, history
│       ├── Dashboard.tsx            # Future Self card, XP, gamemode/streak chips, quests
│       ├── FutureSelf.tsx           # Living Future Self avatar (XP ring, tiers, gold seams)
│       ├── PillarTracker.tsx        # Per-pillar journaling, weight slider, effort log
│       ├── QuestsAchievements.tsx   # Tasks: core/daily/weekly, custom editor, bounties, badges
│       ├── LevelUpNotification.tsx  # Full-screen level-up modal
│       └── KintsugiBrain.tsx        # SVG emblem: brain with gold Kintsugi lines
├── public/
│   ├── icon.svg                 # App icon (512×512, Kintsugi brain)
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
├── supabase/
│   └── schema.sql               # profiles + daily_logs tables + row-level security
├── .env                         # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (git-ignored)
├── GROWTH_STRATEGY.md           # Product/growth strategy doc
├── index.html                   # HTML shell
├── vite.config.ts               # Vite + React + Tailwind plugins
├── tsconfig.json                # TypeScript config (ES2022, react-jsx)
└── package.json                 # Dependencies & scripts
# Legacy (unused, pending cleanup): firebase-applet-config.json, firebase-blueprint.json,
# firestore.rules, project-ff-war-room/ (old Firebase copy, excluded from tsconfig)
```

## Stack
| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Build | Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres (`profiles`, `daily_logs`) + Realtime |
| Offline | localStorage with `projectff_offline` flag |
| Animation | motion/react |
| Icons | lucide-react |
| Drag & drop | @dnd-kit/core (Schedule time-blocking) |

## Data model (Supabase)

```
public.profiles      → one row per user (id = auth.users.id)   → UserProfile
public.daily_logs    → one row per (user_id, date)             → DailyLog
```
Both tables have row-level security (a user sees only their own rows). Pillar
data is stored as JSONB, so PillarStats fields can grow without a migration.
Schema lives in `supabase/schema.sql`.

### UserProfile
| Field | Type | Notes |
|-------|------|-------|
| uid | string | Firebase Auth UID |
| email | string | |
| displayName | string | |
| level | number | Overall character level |
| xp | number | Overall XP |
| pillars | Record<string, PillarStats> | Dynamic — keyed by pillar ID |
| achievements | string[] | Unlocked achievement IDs |
| levelUpHistory | { fromLevel, toLevel, date }[] | Full history |
| onboardingComplete | boolean | Gate for onboarding flow |
| questionnaire | QuestionnaireAnswers? | Stored after onboarding |
| createdAt | string | ISO date |
| updatedAt | string | ISO date |

### PillarStats
| Field | Type | Notes |
|-------|------|-------|
| level | number | |
| xp | number | |
| streak | number | Consecutive days with quests completed |
| weight | number | 0-100, user-editable, drives overall XP contribution |
| lastActiveDate | string? | YYYY-MM-DD of last completion (drives streak gap calc) |
| freezes | number? | Banked streak-freezes (gamemode-dependent) |
| seams | number? | Kintsugi gold seams — comebacks after a break |
| longestStreak | number? | Best streak ever reached |

### Gamemodes (`QuestionnaireAnswers.gameMode`)
`GameMode = "drift" | "momentum" | "forge" | "ascendant"`. Each `GameModeDef`
(in `data.ts` → `GAMEMODES`) carries `dailyQuests`, `xpMultiplier`, streak/recovery
rules, copy, and accent. Look up via `getGameMode(id)` (defaults to Momentum).

### DailyLog
| Field | Type | Notes |
|-------|------|-------|
| userId | string | |
| date | string | YYYY-MM-DD |
| completedTasks | Record<string, boolean> | questId → completed |
| pillarNotes | Record<string, string> | Per-pillar journal entries |
| journalEntry | string | Overall daily reflection |

### Quest
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| title | string | |
| description | string | |
| pillar | string | Pillar ID |
| xpReward | number | |
| completed | boolean | |
| type | 'daily' \| 'weekly' \| 'milestone' | |
| isCoreHabit | boolean? | |
| priority | 'low' \| 'med' \| 'high'? | colored border + sort |
| pinned | boolean? | "Top 3 Today" |
| scheduledTime | string? | HH:MM block on the Schedule timeline |
| scheduledDate | string? | YYYY-MM-DD; set = one-off on that day, unset = recurs daily |
| durationMin | number? | block length |

> Quests are **localStorage-only** (`projectff_quests`) — not synced to Supabase.
> The journal fields on `DailyLog` (`morningIntention`, `mood`, `gratitude`, `win`)
> DO sync: they're packed into the `pillar_notes` JSONB under a reserved `__journal`
> key by `supabase.ts` (no DB migration). `UserProfile` also gains optional
> `journalStreak` / `journalLastDate` / `journalLongest`.

## Available pillars (9)
| ID | Label | Icon |
|----|-------|------|
| `health` | Health & Fitness | Flame |
| `mental` | Mental Wellness | Brain |
| `productivity` | Productivity | Target |
| `finance` | Finance | DollarSign |
| `relationships` | Relationships | Users |
| `learning` | Learning & Education | BookOpen |
| `faith` | Faith / Religion | Sun |
| `creativity` | Creativity | PenTool |
| `career` | Career & Leadership | Briefcase |

## Rules you must not break
- **Offline-first:** Always write to localStorage *before* Supabase. Profile and log must survive page refresh.
- **XP calculation:** `level = Math.floor(xp / 100) + 1`. XP never goes below 0.
- **Gamemode multiplier:** Quest XP = `quest.xpReward * gameMode.xpMultiplier` (Drift 1× / Momentum 1.25× / Forge 1.5× / Ascendant 2×), applied before weighting. Reversible on un-toggle.
- **Weighted XP:** Overall XP delta = `gamemodeAdjustedXp * (pillar.weight / 100)`.
- **Quest toggle:** Marking complete adds XP; unmarking subtracts it (reversible).
- **Kintsugi streak engine (`src/streak.ts`):** All streak changes happen **on quest completion only** (action-driven), never on load — this avoids realtime-sync ping-pong. `registerCompletion()` evaluates the day-gap and applies the gamemode recovery rule (freeze / 50% floor / reset + seam). Keep it a pure function.
- **Cloud/local merge:** On sign-in, local progress with higher XP wins; tasks are union-merged.
- **Future Self tiers (`src/components/FutureSelf.tsx`):** Evolution breakpoints Lv.1/5/10/25/50; gold seams render from total `seams` across pillars. Pure presentational — derives everything from props.
- **KintsugiBrain IDs:** SVG gradient/filter IDs are scoped per instance via React `useId()`.
- **Onboarding gate:** `profile.onboardingComplete === false` → render OnboardingScreen, not the main app.
- **Default tab is `today`** (the Today hub). Five tabs: today · schedule · quests · journal · dashboard. Pillar Labs lives INSIDE the Progress tab (`progressView: "overview" | "pillars"`), not as its own tab.
- **Typography:** `font-display` (Space Grotesk) for headlines only; `font-sans` (Outfit) body; `.text-ascend` gradient reserved for identity moments (landing, reveal, level-up) — don't spread it.
- **Accessibility floor:** keep `:focus-visible` ring + `prefers-reduced-motion` in index.css; meaningful text ≥ `text-white/40` on the dark canvas; ≥44px touch targets.
- **Scroll behavior:** tab changes reset window scroll (effect on `[activeTab]`); inner panes (Schedule timeline) scroll their own container — never `scrollIntoView` on window-scrolling pages.
- **Tab transitions must feel instant:** enter-only animation (~140ms), NO exit animation / `mode="wait"` on the main view switch — exit waits read as lag.
- **Capture is global:** the ✨ FAB + `CaptureSheet` render at App level on every tab. Notes append to `todayLog.journalEntry` as `• text — HH:MM` lines; tasks go through `parseQuickAdd`. Keep capture ≤2 taps from anywhere.
- **Haptics on reward moments only** (`haptic()` from `src/haptics.ts`): completion/streak/level-up/pin/capture — don't add vibration to passive navigation.
- **Attributes are fixed (Option B), pillars map 1:1 onto them** (`PILLAR_TO_ATTRIBUTE`): the six radar axes are identical for every user — never make them dynamic, the future social layer depends on comparable shapes. **Resolve is the Kintsugi stat**: it earns XP from consistency itself (streaks/seams/journal) in `computeAttributes` — keep that mechanical, not cosmetic. All attribute state is derived; nothing stored.
- **Deep Focus raid** (`FocusRaid.tsx`, launched from Today): a focus timer you forfeit by leaving (the commitment device — no reward on retreat). Clearing forges `mins` XP into the Productivity/Focus pillar + `focusSessions`/`focusMinutes`. Brand rule: leaving is **gentle, never shaming** (Kintsugi). Visual stays purple→gold — the rejected Solo Leveling cyan skin was never applied; app fonts remain Outfit/Space Grotesk/JetBrains Mono.
- **Boss Fights** (`Quest.isBoss`): user-defined avoidance tasks. Biggest celebration in the app (levelup haptic + BOSS SLAIN toast); rendered in their own section atop Tasks; trophy count = participation over boss quests. No hidden XP multipliers — the user sets the stakes. A **live (undefeated) boss row carries `.boss-live`** (subtle `boss-pulse` raid-banner glow in index.css; reduced-motion-safe); the pulse stops the moment it's completed.
- **Skill trees are consistency-gated and DERIVED:** `SKILL_NODES` unlock from streaks/reps/seams (never raw XP — consistency is the only currency), computed live from `PillarStats` + `participation` with zero stored state. Nodes stay visible when locked (goal-gradient); the Kintsugi node treats a comeback (`seams ≥ 1`) as a skill. Progress tab sub-views: `overview | skills | pillars`.
- **Quick-add is rule-based, NOT AI** (`parseQuickAdd`): pulls time (6pm / 18:00), duration (45m / 1h), priority (! / !!). Keep it deterministic.
- **Journal streak** increments once per day when any journal field has content (handled in `handleSaveJournal`).
- **No `@types/react` is installed** (React 19 ships none) → custom function components do NOT accept a `key` prop. Put `key` on a wrapping intrinsic element (e.g. `<div key=…>`), not on a custom component.
- **Schedule is 24h + date-aware:** timeline 00:00–23:00, auto-scrolls to "now"; `viewDate` drives the day; recurring blocks (no `scheduledDate`) show every day, dated blocks only on their day; **completion only on today** (future days are plan-only). `onSchedule(id, time, date)`.
- **Voice journaling is on-device only** (`SpeechRecognition` / `webkitSpeechRecognition`), feature-detected, typed fallback. NOT cloud — keep it that way unless the AI gate is cleared.
- **Mobile safe areas:** use `env(safe-area-inset-*)` (content top, bottom-nav). `index.html` already sets `viewport-fit=cover`.
- **Cloud AI is halted** (transcription-at-scale, AI insights/summaries, Gemini quest-gen) pending owner decisions — do not build without sign-off. (On-device voice transcription is allowed and already shipped.)

## Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#3506ee` | Primary purple |
| `--color-brand-dark` | `#1f0393` | Darker purple |
| `--color-brand-neon` | `#a855f7` | Neon accent |
| Kintsugi gold | `#D4AF37` → `#F5D061` | Emblem gold gradient |

## Verify → deploy loop
```bash
npm run lint          # typecheck (tsc --noEmit)
npm run build         # production build → dist/
npm run preview       # preview production build locally
```

Backend: **Supabase** (project `msdabogetqgjrqjkigju`). Static-host target TBD
(any static host works — the app is a Vite SPA talking to Supabase over HTTPS).

## Technical changelog
| Date | Change |
|------|--------|
| 2026-06-08 | **Deep Focus raid** — `FocusRaid.tsx` full-screen focus timer (forfeit-by-leaving commitment device), Kintsugi purple/gold; rejected the Solo Leveling cyan reskin (never applied) |
| 2026-06-08 | **Radar + Boss Fights** — `RadarChart.tsx` (6 fixed attributes, Resolve = Kintsugi consistency stat, derived) on Progress → Overview; `Quest.isBoss` + editor toggle + Boss section + BOSS SLAIN celebration |
| 2026-06-08 | **Skill Trees** — `SKILL_NODES` + `SkillTree.tsx`: 6 consistency-gated nodes per pillar (reps/streaks/comebacks, never XP), fully derived, under Progress → Skills |
| 2026-06-08 | **Second brain + app feel** — global CaptureSheet (✨ FAB: task/note capture + live recall search); `haptics.ts` wired to reward moments; instant tab transitions; manifest rebranded to Project Ascend |
| 2026-06-08 | **Design/a11y pass** — Space Grotesk display font + `.text-ascend` gradient; nav 6→5 (Pillar Labs → Progress sub-view); focus-visible + reduced-motion + contrast sweep; scroll-reset on tab change |
| 2026-06-08 | **Mobile PRD (phases 9–13)** — on-device voice journaling; safe-area mobile polish; 24h Schedule timeline; future-date planning (`scheduledDate` + date navigator); "Plan Tomorrow" ritual |
| 2026-06-08 | **Productivity OS (items 1–8)** — Today hub (default), Journal tab, time-blocking Schedule (dnd-kit), quick-add parser, Top-3 pins, priority, bookend ritual; added `@dnd-kit/core` |
| 2026-06-08 | **Participation bounties** — `BOUNTY_TIERS` + cumulative `profile.participation` → tiered awards; Bounties UI in Tasks tab |
| 2026-06-08 | **UX polish** — Dashboard Reset button (`handleReset`, confirm-gated); Schedule planner reordered to Monday → Sunday |
| 2026-06-08 | **Auth inversion** — explore-first onboarding; auth wall deferred to the reveal step (`wantAuth` gate + explore-bootstrap effect + `handleConvert`) |
| 2026-06-08 | **Growth Phase 4** — `FutureSelf.tsx` evolving avatar (XP ring, 5 tiers, gold seams) on Dashboard + onboarding reveal |
| 2026-06-08 | **Growth Phase 3** — Onboarding 2.0: Avatar Reveal step + first quest seeding real XP/streak |
| 2026-06-08 | **Growth Phase 2/2.5** — `streak.ts` Kintsugi engine + gamemode XP multiplier; Dashboard streak/freeze/seam chips + recovery toast |
| 2026-06-08 | **Growth Phase 0/1** — onboarding friction fixes (cap 3, chips, no weight step) + 4 gamemodes / "Choose Your Path" |
| 2026-06-08 | **Supabase migration** — Firebase Auth+Firestore → Supabase (client, schema, RLS, Google OAuth); removed `firebase.ts` |
| 2026-06-08 | Major generalization refactor — dynamic pillars, onboarding, weights, level-up, calorie removal |
| 2026-06-07 | Replaced Sword emblem with KintsugiBrain SVG (AuthScreen, App header, Dashboard avatar) |
| 2026-06-07 | Created `icon.svg` for favicon/PWA; updated index.html + manifest.json |
| 2026-06-07 | Established three-doc workflow (README, STATUS, HANDBOOK) |
