# STATUS — Project Ascend

> **How we work:** 🟢 Autonomous default. Three living docs (README, STATUS, HANDBOOK).
> Build → verify → commit → deploy on every change. Owner-only: secrets, money, destructive actions.

## Current phase: Productivity OS build-out
Growth Phases 0–4 + auth inversion shipped; expanded into a daily-use
productivity/planning/journaling app. Roadmap items 1–8 + mobile PRD phases 9–13
shipped (typecheck clean). On-device voice journaling is in; **cloud AI**
(transcription-at-scale, AI summaries/insights, Gemini quest-gen) remains
**halted** pending owner decisions (cost/privacy/provider). Dev server runs on :3000.

---

## Active ⬜ To-do

- ⏸ **AI Voice Journal** — record → transcribe → AI summary/mood/themes/action items. **HALTED**: needs decisions on transcription engine, AI provider (Gemini in deps), audio storage, privacy/consent, cost ceiling. (See `GROWTH_STRATEGY.md` / product-strategy §7.)
- ⬜ Recurring-task engine (`recurrence` field + daily materialization)
- ⬜ Local/web push reminders via `sw.js` (scheduled-task notifications)
- ⬜ Simple ↔ Pro vocabulary toggle (hide RPG jargon/XP for casual users)
- ⬜ Rule-based weekly insights dashboard
- ⬜ Enforce per-gamemode daily quest counts (1/3/5/7) + explicit Repair Quests
- ⬜ Live-test Kintsugi seam visualization with a real broken streak (`seams > 0`)
- ⬜ Wire up Gemini AI for daily quest generation (also behind the AI halt)
- ⬜ Deploy (hosting target TBD)
- ⬜ **Phase 5a**: Extract design tokens from `index.css` → Tailwind `@theme` variables
- ⬜ **Phase 5b**: Component standardization — extract `ui/` primitives, audit touch targets
- ⬜ **Phase 5c**: Motion audit — standardize durations/easings, reduced-motion checks
- ⬜ **Phase 5d**: Mobile polish sprint — accordions, swipe, haptic, sticky buttons, auto-save drafts
- ⬜ **Phase 5e**: Desktop enhancement (Phase 3a desktop redesign — DEFERRED per desktop freeze)

---

## ✅ Done — by phase

### Phase: Deep Focus raid (Kintsugi-styled focus timer)
- ✅ **Decision:** kept the Kintsugi brand (rejected the Solo Leveling cyan reskin — spec was never applied; fonts unchanged: Outfit / Space Grotesk / JetBrains Mono). Ported only the worthwhile *mechanic* in purple/gold
- ✅ **`FocusRaid.tsx`** — full-screen immersive overlay: setup (objective + 25/50/90m) → active (draining ring, big tabular timer, Retreat) → cleared (gold ring + KintsugiBrain). Launches from a Deep Focus card on Today
- ✅ **Commitment device** — leaving early forfeits the session (verified: XP unchanged on retreat); clearing forges focus → XP into Productivity/Focus + `focusSessions`/`focusMinutes` (new optional profile fields), level-up aware, haptic + "Focus forged" toast
- ✅ Brand-true: leaving is gentle ("the gate closes, come back when ready") — forgiveness, not shame
- ✅ Typecheck clean; verified live (setup, countdown 25:00→24:08, retreat-confirm, fail-path no-reward); mobile screenshot confirmed

### Phase: Radar chart ("The Shape of You") + Boss Fights
- ✅ **Option B attributes** — 6 fixed axes (`ATTRIBUTES` + `PILLAR_TO_ATTRIBUTE` in data.ts): Vitality · Focus · Mind · Create · Connect · **Resolve**. Pillars are domains, attributes are stats → every player's shape is comparable (social-ready)
- ✅ **Resolve is the Kintsugi stat** — fed by Finance/Faith XP AND consistency itself (+5/best-streak-day, +25/seam, +5/journal-streak day). Verified: Lv 2 with zero finance/faith quests, purely from streaks + a comeback
- ✅ **`RadarChart.tsx`** — hand-rolled SVG hexagon at top of Progress → Overview: tier-colored stroke (Future Self ramp), spring morph on mount, gold vertex on strongest stat, per-axis levels, "How stats grow" transparent-mapping legend, aria-label for screen readers
- ✅ **Boss Fights** — `Quest.isBoss` + editor toggle ("the thing you've been avoiding", XP auto-bumps to 50); rose-styled Boss Fight section atop Tasks; completion fires ⚔️ BOSS SLAIN toast + levelup haptic; "N bosses slain" trophy chip on the radar (derived from participation)
- ⏸ **Underdog Bonus** (lowest-attribute +XP spotlight) — designed, deliberately deferred
- ✅ Typecheck clean; verified live (attribute math, boss toast, trophy count 2→3); mobile screenshot confirmed

### Phase: Skill Trees (consistency-gated)
- ✅ **Decision:** not a blank tree, not just relabeled pillars — pillars ARE the skill trees, with **visible-but-locked nodes** gated by consistency milestones (the neuroscience framework), never raw XP
- ✅ **6 nodes per pillar** (`SKILL_NODES` in `data.ts`): Initiate (1 rep) → Foundation (5 reps) → Rhythm (3-day streak) → Deep Groove (7-day) → **Kintsugi (a comeback counts — seams ≥ 1, or 14-day)** → Identity (Lv 5 or 30-day). Each node carries a one-line neuroscience rationale
- ✅ **Fully derived state** — unlocks computed from existing `PillarStats` + `participation` (no storage, no migration, retroactive); `pillarCompletions()` helper
- ✅ **`SkillTree.tsx`** under Progress → **Overview | Skills | Pillars** segmented control; locked nodes show their requirement, first locked node highlighted as "Next" (goal-gradient target)
- ✅ Typecheck clean; verified live (Health 5/6 incl. Kintsugi-via-seam, Learning 1/6, "Next" hints correct); mobile screenshots confirmed

### Phase: Second brain + app feel
- ✅ **Global Capture sheet** (`CaptureSheet.tsx`) — a ✨ FAB on every tab opens a bottom sheet: one input → "Add task" (quick-add parsed: time/duration/priority) or "Save note" (timestamped line appended to today's journal). Verified: "Call dentist 2pm !" → 14:00/med; notes land as "• … — HH:MM".
- ✅ **Live recall** — typing in the capture sheet searches all tasks + every stored journal entry ("Already in your brain") with tap-to-complete on task hits. Capture + recall = the second-brain loop.
- ✅ **Haptics** (`src/haptics.ts`) — distinct vibration patterns for tap/success/streak/levelup, wired into quest completion, streak events, level-ups, pinning, capture. No-ops safely on iOS.
- ✅ **Instant tab switching** — removed the exit animation (`mode="wait"` added ~0.5s dead time per switch); tabs now swap in 140ms.
- ✅ **PWA identity fixed** — manifest renamed Project FF → "Project Ascend"/"Ascend", second-brain description, theme color matched to canvas (`#090514`).

### Phase: Design & accessibility pass (minimalism)
- ✅ **Type system** — added Space Grotesk display face (`--font-display` / `.font-display`) for headlines; `.text-ascend` gradient (white→neon→gold) reserved for identity moments (landing, Future Self reveal)
- ✅ **Landing copy** — "RPG Self-Improvement System" → "Become who you keep saying you'll become." (identity promise) on AuthScreen + header tagline
- ✅ **Nav reduced 6 → 5 tabs** — Pillar Labs folded into **Progress** as an Overview | Pillars segmented sub-view (no info lost)
- ✅ **Accessibility baseline** — global `:focus-visible` ring, `prefers-reduced-motion` support, font smoothing, contrast sweep (23× `text-white/25–35` → `/40–50`)
- ✅ **Scroll-reset fix** — tab changes reset `window.scrollTo(0,0)`; Schedule auto-scroll now scrolls its own container, not the window
- ✅ Typecheck clean; verified live (5-tab nav, sub-toggle, display font, tagline)

### Phase: Mobile PRD (phases 9–13)
- ✅ **9. Voice journaling** — on-device `SpeechRecognition` mic in `JournalView` (single-tap, live transcribe, typed fallback, feature-detected). No cloud/AI. iOS Safari support is partial → degrades gracefully.
- ✅ **10. Mobile optimization** — safe-area insets (`env(safe-area-inset-*)`) on header + bottom nav, bottom-content clearance, ≥44px nav targets; fixed stale `index.html` title → "Project Ascend"
- ✅ **11. 24-hour timeline** — `ScheduleView` now 00:00–23:00, auto-scrolls to the current hour
- ✅ **12. Future planning** — date navigator (← Today →, tappable Mon→Sun week strip), `Quest.scheduledDate`; recurring (no date) vs dated one-off blocks; completion = today only
- ✅ **13. Gamification glue** — "Plan Tomorrow" card on Today (deep-links Schedule to tomorrow) + planning-ahead toast
- ✅ Typecheck clean; PRD written (problem/need/solution/benefit/gamification/UX/tech/priority)

### Phase: Productivity OS (roadmap items 1–8)
- ✅ **1. Today hub** — new default tab (`TodayHub.tsx`): greeting + day-progress ring, Morning Plan intention, Top-3 pin, today's agenda, Evening Reflect
- ✅ **2. Quick-add** — rule-based parser (`parseQuickAdd` in `data.ts`) pulls time/duration/priority from one line ("Gym 6pm 45m !!"). No AI.
- ✅ **3. Carry-over** — Top-3 pins persist on the quest object → priorities roll into the next day
- ✅ **4. Journal tab** — first-class (`JournalView.tsx`): mood, guided prompts (daily rotation + weekly review), morning/evening, **journaling streak**, searchable history
- ✅ **5. Priority** — `Quest.priority` (low/med/high) + `PRIORITY_META`; colored left borders + dots; surfaced in Today/Schedule
- ✅ **6. Accessibility** — plain-language nav (Today/Schedule/Tasks/Journal/Progress), default-to-action, bumped contrast/targets in new surfaces
- ✅ **7. Bookend ritual** — time-of-day-aware Morning Plan + Evening Reflect cards
- ✅ **8. Time-blocking** — `ScheduleView.tsx` rewritten: drag tasks (dnd-kit) from an Unscheduled tray onto an hour timeline; Mon→Sun week strip
- ✅ Data: `Quest` planner fields + `DailyLog` journal fields + `UserProfile` journal-streak (all optional); journal packed into `pillar_notes` JSONB so it cloud-syncs with no migration
- ✅ Added `@dnd-kit/core`; typecheck clean; previewed live (Today/Schedule/Journal/quick-add)

### Phase 5: Design System (DESIGN_SYSTEM.md)
- ✅ **Color system** — 12-layer semantic color map: surfaces, text, brand, gold (Kintsugi), semantic, pillar accents, gamemode accents, system chrome
- ✅ **Color philosophy** — Kintsugi color meanings: gold seam = visible repair, freeze = safety net, streak reset → gold = celebrate repair
- ✅ **Gamemode color identity** — Drift (emerald→teal), Momentum (orange→amber), Forge (red→rose), Ascendant (amber→yellow)
- ✅ **Opacity scale** — disabled (0.30), muted (0.50), subtle (0.08), overlay (0.70), glass (0.75)
- ✅ **Typography scale** — 12-level type ramp (mobile + desktop overrides), 4 font families, line height scale, letter spacing scale
- ✅ **Spacing scale** — 4px base unit, 11 levels (0–48px), touch target minimums, content width constraints
- ✅ **Corner radius scale** — 7 levels (none→full), nesting rule (parent − 2px)
- ✅ **Shadow & elevation** — 8 shadow tokens, 7 z-index layers (z-0 to z-9999)
- ✅ **Motion tokens** — 5 duration steps, 5 easing curves, 9 preset transitions, Kintsugi motion philosophy, reduced-motion respect
- ✅ **Component library** — 12 primitives (Button, Chip, Input, Textarea, ProgressBar, CheckCircle, Toast) + 8 composites (Card, QuestCard, PillarStatsCard, CharacterCard, TabBar, Modal, DomainPicker, StreakToast)
- ✅ **Cross-platform adaptation** — 5 breakpoints, full adaptation map (mobile vs desktop), desktop freeze boundary
- ✅ **Icon system** — lucide-react exclusive, no raw emoji, 4 size steps, icon-to-concept map
- ✅ **Haptic feedback map** — 6 event patterns with durations
- ✅ **Rollout strategy** — 5 sub-phases (5a→5e), desktop freeze rule, commit ceremony (`design:` prefix)
- ✅ **Governance** — token creation rule (3+ uses), component extraction rule (2+ places), desktop verification step

### Phase: Supabase migration
- ✅ Migrated Firebase Auth + Firestore → **Supabase** (`@supabase/supabase-js`)
- ✅ `src/supabase.ts` — client, Google OAuth, profiles/daily_logs helpers, realtime
- ✅ `supabase/schema.sql` — `profiles` + `daily_logs` tables with row-level security
- ✅ Live project connected, Google provider enabled, tables verified (HTTP 200)
- ✅ Removed dead `src/firebase.ts`; added `src/vite-env.d.ts`; scoped tsconfig

### Phase: Growth & Retention overhaul (strategy in `GROWTH_STRATEGY.md`)
- ✅ **0 — Onboarding friction** — removed weight-% step (auto-distribute), capped pillars at 3, free-text goals → tappable chips, step indicator
- ✅ **1 — 4 Gamemodes** — Drift / Momentum / Forge / Ascendant in `data.ts`; "Choose Your Path" selector replacing the difficulty buttons
- ✅ **2 — Kintsugi streaks** — `src/streak.ts` engine (action-driven recovery, freezes, gold seams); gamemode XP multiplier wired into quest completion; **10/10 unit tests pass**
- ✅ **2.5 — Surfacing** — gamemode badge + streak/freeze/seam chips on Dashboard; recovery toast driven by the engine's event
- ✅ **3 — Onboarding 2.0** — Avatar Reveal step + a real first quest that seeds XP/streak before the dashboard
- ✅ **4 — Living Future Self** — `src/components/FutureSelf.tsx` evolving avatar (XP ring, 5 tiers, gold seams); mounted on Dashboard + onboarding reveal
- ✅ **Auth inversion** — new visitors onboard *before* any auth wall ("explore" mode); Google/offline choice deferred to the reveal step's dopamine peak (loss-aversion framed). Onboarding persists locally before any Google redirect, so the local→cloud merge preserves selections. "Sign in" escape hatch for returning users.
- ✅ **UX polish** — Dashboard **Reset** button (with confirm; wipes local progress + cloud profile, returns to onboarding); **Schedule** planner now runs **Monday → Sunday**
- ✅ Typecheck clean throughout; previewed live via headless preview

### Phase 1: Foundation & UI (original)
- ✅ React 19 + Vite 6 + TypeScript 5.8 scaffold
- ✅ Tailwind CSS 4 with custom brand theme
- ✅ Firebase Auth (Google sign-in) + Firestore
- ✅ Offline mode with localStorage fallback
- ✅ PWA manifest + service worker
- ✅ motion/react animations throughout

### Phase: Kintsugi emblem refresh
- ✅ `KintsugiBrain.tsx` SVG component with scoped IDs via `useId()`
- ✅ Emblem replaced in AuthScreen, App header, Dashboard avatar
- ✅ `icon.svg` favicon/PWA icon created

### Phase: Generalization refactor (6 requirements)
- ✅ **1. Remove personal hardcoding** — All "Faysal", "FAYSAL'S WAR ROOM", personal defaults stripped. App renamed to "Project Ascend". localStorage keys genericized (`projectff_*`).
- ✅ **2. Pillar selection onboarding** — New `OnboardingScreen.tsx` with 3-step flow: pillar picker (9 options), weight configuration, questionnaire (time/difficulty/goals).
- ✅ **3. Editable pillar weights** — Each pillar has a `weight` field (0-100). Adjustable via +/- in PillarTracker. Weight bars in Dashboard. XP contribution: `xp * weight/100`.
- ✅ **4. AI-generated tasks + questionnaire** — Questionnaire captures timePerDay, difficulty, per-pillar goals. Starter quests via `generateStarterQuests()`. Gemini stubbed.
- ✅ **5. Level-up notifications** — New `LevelUpNotification.tsx` — full-screen modal with particles, "Lv.X → Lv.Y". History logged in `profile.levelUpHistory[]`.
- ✅ **6. Calorie tracker removed** — All calorie UI deleted. DailyLog simplified to `completedTasks`, `pillarNotes`, `journalEntry`.
- ✅ TypeScript compiles clean — `npm run lint` passes with zero errors
- ✅ Dev server running on port 5173

### Type system changes
- `UserPillars` → `Record<string, PillarStats>` (dynamic keys)
- `PillarStats` gains `weight: number`
- `UserProfile` gains `levelUpHistory`, `onboardingComplete`; loses `weight`
- `DailyLog` simplified to 4 fields
- `Quest.pillar` → `string`
- New types: `PillarDefinition`, `QuestionnaireAnswers`, `LevelUpEntry`

### New files
- `src/components/OnboardingScreen.tsx`
- `src/components/LevelUpNotification.tsx`

### Rewritten files
- `src/types.ts`, `src/data.ts`, `src/App.tsx`
- `src/components/AuthScreen.tsx`, `Dashboard.tsx`, `PillarTracker.tsx`
- `src/components/ScheduleView.tsx`, `QuestsAchievements.tsx`

---

### Phase: Solo Levelling "System" Theme — visual identity overhaul

- ✅ **UI string replacements** — 6 labels renamed across 4 components:
  - Dashboard: `"Complete Daily Quests to Earn XP & Level Up"` → `"[THE SYSTEM] AWAITS YOUR COMMITMENT, PLAYER"`
  - ScheduleView tray: `"Unscheduled"` → `"QUEUED PROTOCOLS"`
  - ScheduleView timeline: `"Today's Timeline"` → `"BATTLE SCHEDULE"`
  - PillarTracker button: `"Log Effort"` → `"RECORD PROTOCOL"`
  - QuestsAchievements: `"Core Habits"` → `"DAILY PROTOCOLS"`
  - QuestsAchievements: `"Weekly Quests"` → `"WEEKLY BOUNTIES"`
- ✅ **Rank flavor text** — added `"You are barely a flicker in The System's eye."` subtitle below the E-Rank badge (reuses muted `text-white/40 text-[13px]` styling)
- ✅ **Accent colour change** — iOS blue `#007AFF` → indigo `#4B0082` across all 5 CSS tokens in `src/index.css` (`--color-ios-blue`, `--color-brand`, `--color-brand-dark`, `--color-brand-glow`, `--color-brand-neon`). All derived classes (`bg-brand`, `text-ios-blue`, `border-brand-neon`, `shadow-brand/20`, etc.) updated automatically via Tailwind token system. No component files touched.
- ✅ **Scanline overlay** — `.system-bg-overlay::before` CSS class added to `index.css`: fixed-position repeating-linear-gradient at 3% opacity indigo, `pointer-events: none`, `z-index: 9999`. Applied to root `<div>` in `App.tsx` for a CRT/system-interface aesthetic.
- ✅ **Quest completion feedback** — three layered effects on quest toggle (Dashboard.tsx):
  1. **XP float**: existing burst animation timing reduced 0.9s → 0.6s
  2. **System toast**: `"PROTOCOL EXECUTED — THE SYSTEM ACKNOWLEDGES"` — framer-motion banner, slides down from top, auto-dismisses after 2s
  3. **Vignette flash**: `.vignette-flash` CSS class applies `box-shadow: inset 0 0 60px rgba(75, 0, 130, 0.25)` for 300ms on quest complete
- ✅ **Midnight countdown timer** — `useEffect` + `setInterval(1000ms)` in Dashboard computes HH:MM:SS until midnight; displayed right-aligned in Daily Quests header as `"DIRECTIVES EXPIRE IN HH:MM:SS"` in `font-mono tracking-wider text-white/25`. Flips to `"ALL PROTOCOLS EXECUTED TODAY — THE SYSTEM IS SATISFIED."` when all quests complete. Interval cleaned up on unmount.
- ✅ **Mobile nav labels** — bottom nav renamed: "Command" / "Schedule" / "Pillar Labs" / "Bounties"
- ✅ Typecheck clean; verified live (all 4 tabs, quest completion feedback chain, countdown ticker)

### Files changed this session
- `src/index.css` — colour tokens, scanline overlay, vignette flash CSS
- `src/App.tsx` — `system-bg-overlay` class on root wrapper
- `src/components/Dashboard.tsx` — string replacement, rank subtitle, quest feedback (toast + vignette + burst timing), midnight countdown timer
- `src/components/ScheduleView.tsx` — `QUEUED PROTOCOLS` + `BATTLE SCHEDULE` labels
- `src/components/PillarTracker.tsx` — `RECORD PROTOCOL` button label
- `src/components/QuestsAchievements.tsx` — `DAILY PROTOCOLS` + `WEEKLY BOUNTIES` section headers
