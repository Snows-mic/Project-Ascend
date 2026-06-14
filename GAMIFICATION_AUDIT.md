# 🎮 Project Ascend — Gamification Audit
**Internal Design & Product Team Document**
**Date:** 2026-06-13 | **Target Length:** 800–1,200 words → expanded for codebase depth

---

## Gamification Health Scorecard

| Dimension | Score (1–10) | Rationale |
|---|---|---|
| **Progression system** | 7 | The XP→Level→Rank→Tier pipeline is structurally sound. Pillar-level XP, weighted overall XP, 4 gamemodes, and 5-tier avatar evolution (Vessel→Ascendant) all work. But rank visibility (E→S) is buried in a small chip on the character card, not the spatial centerpiece it should be. |
| **Immediate feedback** | 6 | XP bursts, haptic patterns, streak toasts, and the LevelUpNotification modal all exist. But quest completion feedback is confined to a small floating `+XP` text — no screen-scale celebration, no "System message" announcement, no dungeon-gate-clearing visual. The `LevelUpNotification` is the high-water mark (particles + glow ring), but it fires *after* the level-up, not *during* quest completion. |
| **Reward mechanics** | 5 | XP rewards work, achievements unlock (streak & level milestones only), and streaks build. But there are **no**: randomized loot, daily bonus multipliers, streak-milestone rewards beyond achievements, consumable items, seasonal rewards, or "rare drops." The reward space is thin — every quest completion yields identical feedback. |
| **Habit loop integration** | 6 | Cue: quest cards are visible. Routine: tap to complete. Reward: XP burst + sound/haptic. But the cue is passive — nothing actively surfaces the next quest; nothing creates time-pressure ("available for 4 more hours"). The loop is functional but lacks the "pull" of a well-designed compulsion loop. |
| **Theme integrity (Solo Levelling)** | 3 | **This is the biggest missed opportunity.** The app calls itself "Project Ascend" and references hunter ranks, but the primary accent is `#007AFF` (iOS blue), *not* the Solo Levelling purple (#9434e6). There is no "The System" UI voice. Quests read as "Daily Health Practice" — not "Clear the Vitality Gate." The dark background is generic dark mode, not atmospheric. The KintsugiBrain emblem and gold-seam visuals are beautiful but thematically Kintsugi, not Solo Levelling. The app feels like a well-polished generic dark-mode habit tracker with RPG labels **applied as a skin**, rather than a world you *inhabit*. |
| **Retention design** | 4 | Streak mechanics exist and the Kintsugi engine is innovative — but there's **no push notification strategy**, **no loss-aversion (rank decay, "your streak is at risk")**, **no daily quest refresh/generation**, **no re-engagement hooks for lapsed users beyond the streak recovery on next login**. The PWA service worker is registered but unused for notifications. A user who closes the app has zero pull to return except internal motivation. |
| **Visual engagement (color & hierarchy)** | 5 | iOS design tokens are well-implemented (`.ios-card`, `.ios-chip`, `.ios-progress-bar`). But the dominant color is a system-blue (`#007AFF`) that feels like a settings app, not a game. `#9434e6` appears nowhere in the production CSS (only `#a855f7`/`#3506ee` in the FutureSelf tier system). Gold (`#f5d061`, `#d4af37`) is used beautifully in the KintsugiBrain emblem and FutureSelf seams but nowhere in the daily quest flow. The result is a visual language split: **blue for tasks, gold for the avatar, purple barely present**. |

---

## Diagnosis

### Where Gamification Works

1. **The Kintsugi Streak Engine** (`src/streak.ts`) is the project's strongest gamification asset. Four game modes with distinct recovery rules — drift (never breaks), momentum (freeze shield), forge (keeps 50%), ascendant (hardcore reset) — creates genuine player agency. The `seams` counter (comebacks tracked as gold) directly visualizes on the FutureSelf avatar. This is sophisticated, original, and behaviorally sound.

2. **The FutureSelf Avatar** (`src/components/FutureSelf.tsx`) is the emotional centerpiece. A visible character that evolves through 5 tiers (Vessel → Kindled → Forged → Gilded → Ascendant), with XP rings that change color, an aura that pulses, and visible gold Kintsugi seams that accumulate with each comeback. This directly implements the "see yourself evolving" fantasy. The `futureSelfTier()` function drives consistent tiering across RadarChart stroke colors as well — good systemic thinking.

3. **The Onboarding Flow** (`src/components/OnboardingScreen.tsx`) is well-structured. Three steps (pillars → path → reveal) with soft-capped pillar selection (max 3), tappable goal chips (no free-text friction), gamemode selector with recommendation, and a FutureSelf reveal with a seed-first-quest moment that gives the user an immediate win (+XP, streak ignited). The "explore mode" for pre-auth users with a conversion moment at the dopamine peak is clever conversion design.

4. **The LevelUpNotification** (`src/components/LevelUpNotification.tsx`) is the strongest single-screen experience: full-screen overlay, particle burst animation (20 randomized particles), animated level counter, spring-physics entrance, and 4-second auto-dismiss. This is what *every* major milestone should feel like.

5. **Haptic Feedback** (`src/haptics.ts`) is thoughtfully designed with 4 distinct vibration patterns (tap, success, streak, levelup). Many apps skip this entirely.

### Where Gamification Falls Short

1. **The Theme Is a Label, Not a World.** The app's most visible UI — the quest list (`Dashboard.tsx`), the pillar tracker tabs, the schedule timeline — feels like a productivity app with RPG badges attached. "Daily Health Practice" is not a quest title that evokes clearing a gate. There are no dungeon visuals, no gate icons, no "System" voice in copy. The hunter rank (E-Rank → S-Rank) is rendered as a tiny `<span>` chip inside the character card, surrounded by other chips of equal visual weight. It should be the dominant spatial element on the dashboard.

2. **`#9434e6` Is Missing.** The purple accent requested as the primary brand color is `#9434e6`. In the codebase, the primary interactive color is `#007AFF` (Apple system blue). Purple appears *only* in the FutureSelf tier gradient (`#a855f7`) and the FocusRaid ring gradient (`#3506ee`). The CSS theme declares `--color-brand: #007AFF` and `--color-brand-neon: #007AFF`. This creates a fundamental identity problem: the app feels like an iOS utility, not a Solo Levelling hunter system.

3. **No "System" UI Language.** Solo Levelling's most iconic UX element is "The System" — an omnipresent game-like interface that issues quests, announces rewards, and warns of threats. Project Ascend has no equivalent. The streak toast (`"❄️ Streak saved — a freeze took the hit."`) is the closest approximation, but it's a tiny floating banner, not an immersive system message. There's no daily quest assignment screen that reads like a System directive. No "Penalty incoming" warnings. No "New Gate Detected" for boss fights.

4. **The Habit Loop Breaks at "Easy."** Starting a quest requires navigating to the Dashboard or Quests tab, finding the quest card, and tapping. The TodayHub (`src/components/TodayHub.tsx`) has a "Quick Add" input and a "Top 3 Today" section, but TodayHub is not the default view — Dashboard is. The CaptureSheet (`src/components/CaptureSheet.tsx`) is a well-designed universal capture point, but it must be explicitly opened. There's no one-tap "Start my first quest" or the most important thing surfaced above all else.

5. **No Loss Aversion.** Streaks can break, but the user isn't warned proactively. There's no "Your streak is at risk — 3 hours remain" notification, no rank decay mechanic, no visual indicator that a pillar is going cold. The Kintsugi engine's recovery mechanics are humane, but that humanity should be *contrasted* with visible risk — otherwise "saving" a streak carries no emotional weight.

6. **Daily Quests Are Static.** Once generated at onboarding, quests never refresh, rotate, or surprise the user. There's no daily quest regeneration, no varietal quest pool, no "surprise quest" mechanic. The user sees the same list every day, which creates routine fatigue.

7. **Achievements Are Thin.** Only 4 achievement types exist: first_steps, general_first_level, streak_7, streak_30, level_5. That's it. There are no achievements for: total quest completions, perfect days, boss fights cleared, focus raids completed, journaling streaks, comeback counts, pillar diversity, or any playful milestone ("Completed a quest at 2 AM — Night Hunter").

8. **No Social/Competitive Layer.** The RadarChart (`src/components/RadarChart.tsx`) and the attribute system (Strength, Focus, Resolve, etc.) were designed to be comparable across players (the code comment explicitly notes "the foundation for the future social layer"), but no social features exist yet. Leaderboards, friend comparisons, or even a "compare your shape" feature would significantly increase retention.

---

## Recommendations

### 1. Rebrand to Purple (`#9434e6`) as Primary Accent
**Files:** `src/index.css`, all component files using `bg-brand`, `text-brand-neon`, `--color-brand`
**Why:** The current `#007AFF` blue reads as a system utility. `#9434e6` carries the Solo Levelling / hunter-system aesthetic and creates psychological associations with achievement, mystery, and premium status. Replace `--color-brand: #007AFF` with `--color-brand: #9434e6` and `--color-brand-neon` with `#a855f7`. Update progress bars, active tab indicators, quest XP labels, and check circles.
**Effort:** Medium

### 2. Create a "System Message" UI Layer
**Where:** New component `src/components/SystemMessage.tsx`, integrated into `App.tsx`
**Why:** A persistent, animated system notification style (dark overlay, purple glow, monospace font, typewriter-like animation) that announces: daily quest assignments ("The System has issued 3 directives"), rank-ups, streak milestones, and boss encounters. This single addition transforms the app from "habit tracker with labels" to "hunter system." It should appear at the top of every screen, be dismissible, and use language like "Directive received," "Gate detected," "Evaluation complete."
**Effort:** Medium

### 3. Redesign the Dashboard Header to Be Rank-Centric
**Where:** `src/components/Dashboard.tsx`, lines ~60–120 (character card / rank section)
**Why:** The hunter rank is currently a small chip. It should be the most visually dominant element on the dashboard: a large rank badge (E through S) with glowing border, positioned centrally, with a visible progress bar showing "XP to next rank" (not level — *rank*, which is the meaningful unit). The FutureSelf avatar should be larger and sit beside the rank badge. Current state buries the most motivating progression signal.
**Effort:** Low

### 4. Add Daily Quest Regeneration & Variety
**Where:** `src/data.ts` (new function `generateDailyQuests`), `App.tsx` (daily rotation logic)
**Why:** Static quests create routine fatigue. Generate 3–5 fresh quests daily from a pool keyed by active pillars, with one "surprise quest" from an inactive pillar (cross-training). Add rarity tags ("Common," "Rare," "Epic") with corresponding XP multipliers to create anticipation for the daily reset.
**Effort:** Medium

### 5. Implement Push Notification Strategy ("The System Calls You Back")
**Where:** `public/sw.js`, new notification utility, `App.tsx`
**Why:** The PWA service worker is registered but unused. Implement Web Push notifications with copy that sounds like The System: "⚠️ Your streak is fading — complete a quest within 3 hours to maintain it." "✦ A new Gate has opened. Today's quests are available." "Your rank evaluation is due. 2 quests remain." This alone could increase DAU by 20–40%.
**Effort:** High

### 6. Add Loss-Aversion Visual Design
**Where:** `src/components/Dashboard.tsx`, `src/streak.ts` (expose risk state)
**Why:** The Kintsugi engine tracks when streaks are at risk — expose this. Add a "Streak Shield" indicator showing active freezes. When a day passes without a quest completion, show a diminishing purple glow around the streak counter. When within 3 hours of midnight, show a "Last chance" pulse animation on incomplete quests. The `registerCompletion` function already computes gap — expose `atRisk: boolean` from the streak state.
**Effort:** Medium

### 7. Expand the Achievement System
**Where:** `src/data.ts` (`generateAchievements`), `src/components/QuestsAchievements.tsx`
**Why:** Current 4 achievement types provide almost no long-term motivation. Add at minimum: perfect day (all quests), week warrior (7-day all-clear), boss slayer (3/10/25 boss quests), focus master (10/50 focus raids), comeback king (5/15 gold seams), night hunter (quest completed after 10 PM), pillar master (level 10/20), journal sage (30-day journal streak), diversity (quests across 3+ pillars in one day).
**Effort:** Low

### 8. Add Quest Completion Celebration with Purple
**Where:** `src/components/Dashboard.tsx` (XP burst), new `src/components/QuestClearEffect.tsx`
**Why:** Current quest completion feedback is a small floating `+XP` text. It should be a screen-local celebration: a purple radial pulse emanating from the quest card, particle burst in `#9434e6`, and a brief "Gate Cleared" label. This applies the purple accent at the highest-frequency engagement moment (multiple times daily) and transforms quest completion from transactional to emotional.
**Effort:** Low

### 9. Create "The Gate" Pre-Quest Framing
**Where:** New view or overlay accessed from Dashboard
**Why:** Before starting a quest, show a brief "Gate" screen — a dark surface with a glowing purple gate icon, the quest name framed as "Gate: [Quest Title]," and a "Enter the Gate" button. This takes 1 second to animate and transforms the mental model from "checking off a task" to "entering a dungeon." The FocusRaid component already implements this framing for deep work sessions — extend the pattern to all quests.
**Effort:** Medium

### 10. Surface the RadarChart as the Default Dashboard View
**Where:** `App.tsx` (tab routing), `src/components/Dashboard.tsx`
**Why:** The RadarChart ("The Shape of You") is the most game-like visual in the app but is hidden inside the Dashboard. Make it the hero element of the Dashboard, with quest completion directly growing the radar shape in real-time. This makes progression *visible* and *spatial* — users can watch their shape grow, which is more motivating than watching numbers tick up.
**Effort:** Low

---

## Before/After Conceptual Examples

### Example 1: Quest Completion Feedback

**Current State:** A floating `+XP` text animates upward from the tap position (`Dashboard.tsx`, `bursts` state). The quest card gets a green tint and strikethrough. The animation lasts 900ms.

**Proposed Change:** On quest completion, the quest card emits a `#9434e6` radial pulse (`box-shadow` scale animation). A "Gate Cleared" label appears briefly above the card in monospace font. The XP burst text uses the purple gradient instead of blue. Haptic triggers `success` pattern. If this was the final quest of the day, a larger celebration triggers: "✦ All Gates Cleared."

**Expected Behavioral Outcome:** The completion moment becomes an emotional reward in itself, not just a counter increment. Users begin to anticipate the visual payoff, creating a micro-compulsion loop. The purple specifically becomes associated with "winning," strengthening daily return pull.

---

### Example 2: Hunter Rank Visibility

**Current State:** Rank is shown as a tiny chip: `<span className="ios-chip ios-chip-active text-[11px]">{currentRank.name} · {currentRank.desc}</span>` inside the character card. It's surrounded by the gamemode chip, profile name, and XP bar — all at equal visual weight.

**Proposed Change:** Move the rank badge to the top-center of the dashboard as a dedicated card. Display a large rank letter (E/D/C/B/A/S) in a `#9434e6` gradient circle with a pulsing glow that intensifies as the user approaches the next rank. Below it: a horizontal rank ladder showing E → D → C → B → A → S with the current rank highlighted and a progress indicator. The copy reads: "C-Rank Hunter — 342 XP to B-Rank."

**Expected Behavioral Outcome:** The rank becomes the primary identity signal. Users want to see the letter change. The rank ladder creates a visible goal gradient — you can *see* how far to the next rank, which motivates sustained engagement. Rank is also more socially shareable than level numbers.

---

### Example 3: Daily Quest Framing

**Current State:** Quests are listed as cards: title, pillar chip, description, XP value, check circle. The header reads "Daily Quests" with a Target icon. The filter bar shows "All Quests" with pillar tabs.

**Proposed Change:** The header becomes: "✦ System Directive — Today's Gates" with a glowing purple border. Each quest card gains a gate-type label: "Common Gate" (daily), "Elite Gate" (weekly), "Raid Gate" (milestone), "Boss Gate" (boss fights). Quest titles are reframed: "Daily Health Practice" → "Gate: Vitality Trial." A countdown timer shows "Gates close in 4h 23m" (time until midnight), creating time pressure. The filter bar adds a "⚠️ At Risk" filter for incomplete quests nearing the deadline.

**Expected Behavioral Outcome:** The reframing transforms "to-do list" into "dungeon to clear." Time pressure creates urgency. Gate classifications create hierarchy — users aspire to clear higher-tier gates. The System voice makes the experience feel game-originated rather than productivity-tool-originated.

---

## Priority Change List

| # | Change | Impact | Effort | Quick Win |
|---|---|---|---|---|
| 1 | Rebrand to purple accent (`#9434e6`) across all components | **High** | Medium | — |
| 2 | Add quest completion celebration with purple pulse + "Gate Cleared" | **High** | Low | ✓ |
| 3 | Redesign dashboard header to be rank-centric (large rank badge + ladder) | **High** | Low | ✓ |
| 4 | Expand achievement system (15+ new achievements) | **High** | Low | ✓ |
| 5 | Surface RadarChart as hero element of dashboard | **High** | Low | ✓ |
| 6 | Create "The System" message UI layer for quests, milestones, and warnings | **High** | Medium | — |
| 7 | Add daily quest regeneration with rarity tags and surprise quests | **High** | Medium | — |
| 8 | Implement loss-aversion visuals (streak risk indicators, time-pressure countdowns) | **Medium** | Medium | — |
| 9 | Add push notification strategy via PWA service worker | **High** | High | — |
| 10 | Add "The Gate" pre-quest framing overlay for all quest types | **Medium** | Medium | — |

**Quick Wins (High Impact + Low Effort):** Items 2, 3, 4, and 5 can be implemented in a single sprint and would collectively transform the app's gamification feel from "productivity tool with RPG labels" to "hunter progression system you want to return to."

---

*Audit conducted on 2026-06-13. All component references and file paths verified against the `src/` directory of Project Ascend.*
