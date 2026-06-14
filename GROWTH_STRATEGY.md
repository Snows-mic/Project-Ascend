# Project Ascend — Growth & Retention Strategy

> A strategy document for redesigning onboarding, landing, retention, gamemodes, and
> task preferences. Grounded in the actual build (9 pillars, per-pillar XP/level/streak/weight,
> `level = floor(xp/100)+1`, Kintsugi philosophy, offline mode).

## Executive Summary

Project Ascend competes with Instagram and the comfort of who the user already is — not with
Notion or Todoist. The enemy is the gap between aspiration and the avatar in the mirror.

Three truths about the current build:

1. **Configuration is front-loaded before any feeling is delivered.** Onboarding asks a teenager to
   assign weight percentages ("total = 100% for best results") before a single dopamine hit. That is a
   spreadsheet, not an RPG. The work is front-loaded and the reward back-loaded — inverted the wrong way.
2. **The most ownable asset is dormant.** Kintsugi (repairing breaks with gold) is the strongest
   emotional metaphor in the category, and it is currently just a logo. It should be the
   streak-recovery system, the failure philosophy, and the character-evolution engine.
3. **There is no character.** The promise is "become who you aspire to become," but the UI shows a
   level number and an XP bar. The aspiration is invisible. The highest-leverage build is a visible,
   evolving Future Self.

Strategy in one line: **Feel first, configure later, recover always, evolve visibly.**

## Landing Page Strategy

The current "landing page" (`AuthScreen.tsx`) is a login wall. The real one:

- **Headline:** "Become who you keep saying you'll become." (identity, not output)
- **Subhead:** "An RPG for real life. Pick who you're becoming, do the quests, watch yourself level up — for real."
- **Kill:** "RPG Self-Improvement System." "System" is a productivity word; the audience is allergic to it.

**Scroll flow (order is the strategy):**
1. Hero — animated Future Self avatar (low→high morph), headline, one CTA "Start becoming →", ghost text "No account needed to start."
2. The 3-second demo — looping clip of the full dopamine loop before any ask.
3. "Choose who you're becoming" — 9 pillars as identity cards, tap to preview a sample quest.
4. Social proof band — peers not press: live counter, streak screenshots, TikTok-style testimonials. Bracket the decision (after demo + before final CTA).
5. Character progression showcase — avatar at Lv.1/10/30/50 with accumulating gold seams.
6. The forgiveness promise — "Missed a day? You repair it." (Headspace borrow; pre-empts abandonment fear).
7. Final CTA — full-bleed, single button: "Start becoming — free, no account."

**CTA rules:** one primary CTA per viewport; verb the identity ("Start becoming"), never "Sign up";
Google sign-in does NOT appear on the landing page.

## Mobile Experience

Mobile is the product; desktop is the brochure. Design mobile-first.

- Thumb-zone CTAs, full-width, min 56px tall (current 48px is slightly short).
- One decision per screen (current 9-card grid + CTA in one viewport is a hunt).
- Persistent streak flame in the top bar, one tap from the protecting quest.
- Haptics on every reward (`navigator.vibrate`) — distinct per event.
- Bottom tab nav (5 max): Today · Quests · Self · Pillars · Profile. "Today" is home.
- Notifications speak as the character, not the app: "Your Future Self is one quest from Lv.12."
- Trigger install-to-home-screen at first level-up, not on arrival.

## Desktop Experience

- Desktop's job is conversion + reflection, not daily use.
- Two-column dashboard: left = today's quests (action), right = living avatar + progression (reward).
- Keyboard-first: `space` completes focused quest, `1-9` jump pillars.
- Don't waste width on whitespace — waste it on the avatar (hero-sized, animated).
- Ambient XP-toward-next-level ring around the avatar.

## Inverted Onboarding 2.0

Current "inverted onboarding" defers signup via Offline Mode but replaces a signup wall with a
configuration wall. Corrected principle: **Experience → Investment → Conversion.**

**Friction points (ranked):**
1. Weight % step with "must = 100%" — math homework, zero dopamine. DELETE; auto-distribute; expose editing later as advanced.
2. 9-pillar multi-select, no preview — choice overload + abstract. Reframe as identities; preview on tap; soft-cap at 3.
3. Free-text goals — phone typing is the highest-friction interaction. Replace with tappable chips.
4. No reward before the dashboard. Insert avatar reveal + an onboarding quest.
5. Auth placement too early. Defer to after first XP + avatar reveal.

**Missed dopamine to add:** Avatar Reveal (cinematic Future Self), Onboarding Quest (real,
completed inside onboarding → first XP), 1-day streak ignition (now there's something to lose).

**Conversion moment:** after first XP + streak, "Save your progress so your Future Self doesn't reset"
— loss aversion at peak motivation, not "sign up."

**Onboarding 2.0 flow:** Who are you becoming? (≤3 identities) → Choose your path (4 gamemodes) →
Avatar Reveal → First Quest → Conversion.

## Death Wire Criteria

**Non-negotiable landing elements:** moving avatar above the fold; identity-promise headline;
"no account needed"; dopamine loop shown before any ask; peer social proof bracketing the decision;
one primary CTA per viewport.

**Conversion killers:** signup wall before first dopamine hit (fatal); numeric configuration in
onboarding (fatal); free-text on mobile onboarding; two competing CTAs above fold;
"productivity/system/tool" language.

**Messaging mistakes:** leading with mechanics not identity; feature lists; corporate tone; over-explaining.

**Design mistakes:** static hero; small/buried avatar; low-contrast neon-on-black; tap targets <48px / CTAs <56px.

**Retention mistakes:** all-or-nothing streaks (biggest killer); punishing failure language; no 24h
re-engagement hook; rewards that inflate without the avatar changing.

**Mobile UX mistakes:** >1 decision per screen; CTAs outside thumb zone; no reward haptics; forcing
navigation to reach today's action; nagging notifications.

## Retention Framework

**Teardown — steal & refuse:**
- *Duolingo:* steal streaks/freezes (as Kintsugi recovery), micro-quests, friend leagues.
  Refuse the guilt-trip notifications and streak-only progression.
- *Headspace:* steal emotional safety, "it's okay to miss," self-compassion (this IS Kintsugi recovery).
  Refuse the sleepy energy and gate-everything subscription.

**By horizon:**
- *First 5 min (activation):* complete the loop once (identity → avatar → onboarding quest → XP → streak → convert). North-star input = onboarding-quest completion rate.
- *First day:* one return notification timed to stated availability; cap day-1 quests so the day ends in a win.
- *First week (danger zone):* Day 2 is the most important day — build an explicit Day-2 return reward; introduce the Sidekick; first Kintsugi recovery if they miss; Day-7 evolution + milestone.
- *First month:* weekly milestones; first social layer (friend/circle); pillar-level evolutions; Day-30 identity-shift moment.
- *Long-term:* avatar as sunk-cost emotional asset; seasons/prestige; mentor mechanics; "Year in Ascent" recap.

**Systems:** per-pillar + overall Ascent streak; **Kintsugi recovery** (broken streak leaves a gold
seam + offers a Repair Quest; restore keeps the seam as proof of return); Sidekick (on-brand
companion, not a cutesy owl); XP that animates into the avatar; progress as a ring around the avatar;
character evolution at level breakpoints; opt-in friend circles (≤6); celebrate recoveries more than
perfect streaks.

## Gamemode System

Four modes, each mechanically distinct, each with a recovery path (no burnout).

| | DRIFT | MOMENTUM (default) | FORGE | ASCENDANT |
|---|---|---|---|---|
| Tagline | Begin gently | Build the habit | Discipline under load | This is who I am now |
| For | Burnout / anxious starters | Most users | Disciplined, wants pressure | Identity-driven, all-in |
| Daily req | 1 keystone | 3 (1 keystone) | 5 (keystone + spread) | 7 (keystone + 2 pillars + reflection) |
| XP mult | 1.0x | 1.25x | 1.5x | 2.0x |
| Streak | Never visibly breaks (3 banked rest days) | 1 auto-freeze/week | Earn freezes; else seam | No auto-freeze; same-day redemption only |
| Recovery | Automatic, no penalty | Repair Quest next day | Repair within 24h, else drop to 50% floor (never 0) | Kintsugi Recovery same-day; else reset → permanent gold seams |

Intent: upgrading a mode feels like accepting a challenge, not buying a punishment. Every tier has a
recovery path (Headspace forgiveness) while delivering intensity (Gen Z self-improvers).

## Task Preferences Redesign

Replace the time slider + 3 difficulty buttons + free-text goals with **"Choose Your Path"** cards:

- **DRIFT — Gentle re-entry.** "One small quest a day. No pressure, no breaking, no shame." 1 keystone/day, normal XP, streak never breaks. Hook: "The only way to fail is to quit — and we won't let you."
- **MOMENTUM — Build the habit (Recommended).** "Three quests a day. One free miss a week." 3/day (+25% XP), 1 freeze/week, Repair Quest tomorrow if missed. Hook: "The sweet spot between lazy and burnt out."
- **FORGE — Discipline under load.** "Five quests a day. Freezes are earned." 5/day (+50% XP), earned freezes, 24h repair window, never below 50%. Hook: "Pressure makes diamonds. Or pushups."
- **ASCENDANT — Identity-level commitment.** "Seven quests a day. Double XP. No safety net — but every scar turns to gold." 7/day + reflection (2x XP), no auto-freeze, same-day Kintsugi Recovery, fail → reset but keep permanent gold seams. Hook: "For people who want a transformation, not a habit."

UX: vertical cards on mobile; Momentum pre-selected + "Recommended" badge; expand on tap to show the
mechanical diff; satisfying confirm animation; switchable anytime (never a locked-in trap).

## Highest-Leverage Opportunities

**Single highest-leverage feature: the Living Future Self (evolving avatar).** It moves all four metrics:
- Activation: the Avatar Reveal is the first dopamine hit that makes users finish onboarding.
- Retention: months of evolution + gold seams = an emotional sunk cost no competitor can copy.
- Daily engagement: "watch yourself evolve" is a reason to open the app a checklist never gives.
- Emotional attachment: it renders the abstract promise visible. The avatar IS the aspiration.

Everything else (gamemodes, streaks, recovery) are inputs that feed the avatar's evolution.

**Runner-up: Kintsugi Streak Recovery** — defensible moat, attacks the #1 churn cause (all-or-nothing
streaks), cheap to build, brand-perfect.

## Priority Roadmap

| Phase | Build | Effort |
|---|---|---|
| 0 — Stop the bleeding | Kill weight-% step (auto-distribute); soft-cap pillars at 3; goal chips instead of free-text | S |
| 1 — Gamemodes + Task Prefs | 4 gamemodes in data/types; "Choose Your Path" selector | M |
| 2 — Kintsugi Recovery | Streak freeze + gold seam + Repair Quest logic | M |
| 3 — Onboarding 2.0 | Avatar reveal + onboarding quest + deferred-auth conversion | M–L |
| 4 — Living Future Self | Evolving avatar, level breakpoints, seam rendering, XP-into-avatar | L |
| 5 — Landing page | Real marketing landing (hero, demo loop, social proof) | M |
| 6 — Social + long-term | Friend circles, leagues, seasons, Year in Ascent | L |
