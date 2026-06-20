# Phase 5: Design System — Cross-Platform Tokens, Component Library & Rollout

> **Kintsugi Principle**: Every token carries intention. Breaks are visible, repair is beautiful.  
> **Solo Levelling Philosophy**: The System rewards action. UI is a HUD, not a brochure.

---

## 1. Color System

### 1a. Semantic Color Map

The color system is named by *role*, not by hex value. Every token has a light-theme and dark-theme counterpart — we currently ship dark only, but the naming allows future theme switching with zero component changes.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER           │  TOKEN                │  DARK VALUE           │
├──────────────────┼───────────────────────┼───────────────────────┤
│  Background      │  --surface-root       │  #000000 (neutral-950)│
│                  │  --surface-card       │  #1C1C1E (neutral-900)│
│                  │  --surface-elevated   │  #2C2C2E (neutral-850)│
│                  │  --surface-overlay    │  rgba(0,0,0,0.70)     │
├──────────────────┼───────────────────────┼───────────────────────┤
│  Text            │  --text-primary       │  #FFFFFF              │
│                  │  --text-secondary     │  rgba(255,255,255,0.60)│
│                  │  --text-tertiary      │  rgba(255,255,255,0.30)│
│                  │  --text-placeholder   │  rgba(255,255,255,0.20)│
├──────────────────┼───────────────────────┼───────────────────────┤
│  Brand           │  --brand-primary      │  #4B0082 (indigo)     │
│                  │  --brand-glow         │  #9434E6 (violet)     │
│                  │  --brand-neon         │  #A855F7 (light violet)│
├──────────────────┼───────────────────────┼───────────────────────┤
│  Gold (Kintsugi) │  --gold-primary       │  #FF9500              │
│                  │  --gold-light         │  #FFCC00              │
│                  │  --gold-seam          │  #C9A84C (muted gold) │
├──────────────────┼───────────────────────┼───────────────────────┤
│  Semantic        │  --success            │  #30D158 (emerald)    │
│                  │  --warning            │  #FF9F0A              │
│                  │  --danger             │  #FF453A              │
│                  │  --info               │  #0A84FF (ios-blue)   │
├──────────────────┼───────────────────────┼───────────────────────┤
│  Pillar Accents  │  --pillar-health      │  from-orange-500      │
│                  │  --pillar-mental      │  from-teal-500        │
│                  │  --pillar-productivity│  from-blue-500        │
│                  │  --pillar-finance     │  from-emerald-500     │
│                  │  --pillar-relation    │  from-pink-500        │
│                  │  --pillar-learning    │  from-violet-500      │
│                  │  --pillar-faith       │  from-yellow-400      │
│                  │  --pillar-creativity  │  from-fuchsia-500     │
│                  │  --pillar-career      │  from-indigo-500      │
├──────────────────┼───────────────────────┼───────────────────────┤
│  Gamemode        │  --mode-drift        │  from-emerald-500     │
│  Accents         │  --mode-momentum      │  from-orange-500     │
│                  │  --mode-forge        │  from-red-500         │
│                  │  --mode-ascendant    │  from-amber-400       │
├──────────────────┼───────────────────────┼───────────────────────┤
│  System Chrome   │  --border-subtle      │  rgba(255,255,255,0.05)│
│                  │  --border-default     │  rgba(255,255,255,0.10)│
│                  │  --border-strong      │  rgba(255,255,255,0.15)│
│                  │  --border-brand       │  rgba(75,0,130,0.40)  │
└──────────────────┴───────────────────────┴───────────────────────┘
```

### 1b. Kintsugi Color Philosophy

| Concept | Color | Meaning |
|---------|-------|---------|
| **Gold Seam** | `--gold-seam` `#C9A84C` | Every comeback is visible proof of repair. Never hide the break. |
| **Freeze Token** | `--info` `#0A84FF` + ice-blue glow | A safety net, not a crutch. Frost preserves what you've built. |
| **Streak Reset** | `--danger` `#FF453A` → `--gold-seam` | The break is red. The repair is gold. The System celebrates the repair. |
| **XP Earned** | `--brand-neon` `#A855F7` | Moment of earned power. Brief, intense, fades. |
| **Harmony Bonus** | `--gold-primary` `#FF9500` | Balance across pillars = golden multiplier. |

### 1c. Gamemode Color Identity

```
Drift     emerald → teal     Gentle. No pressure. The river.
Momentum  orange → amber     Steady fire. Build the chain.
Forge     red → rose         Heat. Pressure. Diamonds.
Ascendant amber → yellow     Crown. Pure gold. No safety net.
```

### 1d. Opacity Scale (Overlays & Disabled States)

```
--opacity-disabled:  0.30   (buttons, text when disabled)
--opacity-muted:     0.50   (completed quests, secondary info)
--opacity-subtle:    0.08   (hover backgrounds, inactive fills)
--opacity-overlay:   0.70   (modal backdrops)
--opacity-glass:     0.75   (frosted navigation bars)
```

---

## 2. Typography Scale

### 2a. Type Ramp (Mobile First, Desktop Overrides)

| Token | Mobile | Desktop (md:) | Weight | Usage |
|-------|--------|---------------|--------|-------|
| `--text-h1` | `22px` | `28px` | `700` | Page titles |
| `--text-h2` | `18px` | `22px` | `700` | Section headers |
| `--text-h3` | `15px` | `17px` | `600` | Card headers |
| `--text-h4` | `14px` | `15px` | `600` | Mini headers |
| `--text-body` | `15px` | `15px` | `400` | Body copy |
| `--text-body-sm` | `13px` | `13px` | `400` | Secondary body |
| `--text-caption` | `12px` | `12px` | `400` | Metadata, labels |
| `--text-caption-sm` | `11px` | `11px` | `400` | Auxiliary info |
| `--text-hud` | `13px` | `13px` | `600` | Monospace HUD text |
| `--text-hud-sm` | `10px` | `10px` | `500` | Status badges, chips |
| `--text-button` | `15px` | `14px` | `590` | Button labels |
| `--text-button-sm` | `13px` | `12px` | `500` | Small button labels |

### 2b. Font Stack (4 families)

| Role | Stack | Fallback Behavior |
|------|-------|-------------------|
| **Body / UI** | `"Inter", "SF Pro Display", "SF Pro Text", -apple-system, ...` | System sans-serif |
| **Display** | `"Orbitron", "SF Pro Display", -apple-system, ...` | Sci-fi RPG headings |
| **HUD / Data** | `"Rajdhani", "Inter", -apple-system, ...` | Numbers, timers, stats |
| **Mono / System** | `"Share Tech Mono", "SF Mono", "JetBrains Mono", "Menlo", monospace` | Protocol messages, logs |

### 2c. Line Height Scale

```
--leading-tight:   1.15   (headings, HUD numbers)
--leading-normal:  1.4    (body text)
--leading-relaxed: 1.6    (journal entries, long-form)
```

### 2d. Letter Spacing

```
--tracking-tight:   -0.02em  (large headings)
--tracking-normal:   0       (body)
--tracking-wide:     0.04em  (labels, uppercase HUD)
--tracking-widest:   0.08em  (SYSTEM MESSAGES, announcement banners)
```

---

## 3. Spacing Scale

### 3a. Core Spacing Tokens (4px base unit)

```
--space-0:   0px
--space-1:   4px
--space-2:   8px       (default gap between related elements)
--space-3:   12px      (gap between sections within a card)
--space-4:   16px      (card padding, default section gap)
--space-5:   20px      (larger section gap)
--space-6:   24px      (page-level section spacing)
--space-8:   32px      (major section breaks)
--space-10:  40px      (hero spacing)
--space-12:  48px      (page margin on desktop)
```

### 3b. Touch Target Minimums (Mobile)

| Target | Mobile Min | Desktop Min |
|--------|-----------|-------------|
| Button | `44px × 44px` | `36px × 36px` |
| Icon-only button | `44px × 44px` | `32px × 32px` |
| Chip / Pill | `32px height` | `32px height` |
| List row | `44px height` | `44px height` |
| Check circle | `44px × 44px` | `24px × 24px` |
| FAB | `56px × 56px` | `48px × 48px` |

### 3c. Content Width Constraints

```
--content-sm:    360px   (mobile portrait card)
--content-md:    480px   (tablet, modal max-width)
--content-lg:    640px   (centered content column)
--content-xl:    960px   (wide content area)
--content-full:  100%    (edge-to-edge)
```

---

## 4. Corner Radius Scale

### 4a. Why It Matters

Corner radius is the single strongest signal of **surface hierarchy**. Sharp corners say "I'm a sharp tool — a table, a data grid, a code editor." Rounded corners say "I'm a touch target — a card, a button, a human interaction point." Inconsistent radii across the same surface type is the fastest way to make an app feel amateur.

### 4b. The Scale

```
TOKEN              VALUE      PHYSICAL ANALOGY           USAGE
─────────────────────────────────────────────────────────────────────
--radius-none       0px       Paper edge                 Tables, split-pane dividers, code blocks
--radius-xs         4px       Business card corner       Subtle rounding on dense data rows
--radius-sm         6px       Post-it note               Inline tags, tiny badges, input hints
--radius-md        10px       Keyboard key               Inputs, textareas, small contained cards
--radius-lg        14px       iPhone app icon            Cards, sheets — THE PRIMARY RADIUS
--radius-xl        18px       Playing card               Modals, dialogs, prominent elevated cards
--radius-2xl       24px       Dinner plate edge          Panels, dashboard section containers
--radius-full    9999px       Pill / capsule             Chips, progress bars, FAB, segmented control
```

### 4c. The Primary Radius

`--radius-lg` (`14px`) is the **default card radius** for this system. It matches iOS's native card sheet radius. Every `ios-card` and `system-card` class uses this value. When in doubt, use this.

### 4d. Nesting Convention (Radius Harmony)

A child inside a parent should visually belong there. The rule:

| Parent | Child | Visual Result |
|--------|-------|---------------|
| `--radius-lg` (14px) card | `--radius-md` (10px) input | Input sits *inside* the card, not flush |
| `--radius-xl` (18px) modal | `--radius-lg` (14px) cards | Cards sit *inside* the modal |
| `--radius-lg` (14px) card | `--radius-full` (pill) chip | Chips are always pills regardless of parent |
| `--radius-none` (0px) table | `--radius-sm` (6px) tag | Tags break the grid intentionally |

**Formula**: `child-radius = parent-radius − 4px` (skip one step down the scale)

Exception: `--radius-full` children (pills, chips, progress bars) — these are always fully rounded regardless of parent, because their shape IS their identity.

### 4e. Platform Differences

| Surface | Mobile (<768px) | Desktop (≥768px) | Reason |
|---------|-----------------|------------------|--------|
| **Cards** | `14px` (`--radius-lg`) | `14px` (`--radius-lg`) | Same — cards are cards |
| **Modal/Sheet** | `24px` top, `0px` bottom | `18px` all sides (`--radius-xl`) | Mobile bottom sheets sit flush with screen bottom; desktop modals float centered |
| **FAB** | `28px` (half of 56px) | `24px` (half of 48px) | Always a circle — radius = half the size |
| **Segmented control** | `10px` (`--radius-md`) | N/A (hidden on desktop) | iOS native segmented control uses 10px |
| **Input fields** | `10px` (`--radius-md`) | `10px` (`--radius-md`) | Same — typing surfaces don't change |
| **Quest cards** | `18px` (`--radius-xl`) | `14px` (`--radius-lg`) | Mobile needs larger distinct touch zones; desktop cards are denser |

### 4f. Kintsugi & Radius

The gold seam concept extends to shape language:

- **Breaks are sharp**: Error states, streak resets, conflict indicators use `--radius-sm` (6px) — sharper, more angular. The break is visible.
- **Repair is round**: Recovery toasts, gold-seam pulses, harmony indicators use `--radius-full` (pill). Wholeness.
- **Normal state**: `--radius-lg` (14px). Neither broken nor celebrating — just present.

### 4g. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|------|
| Mix `--radius-lg` and `--radius-xl` cards in the same list | Pick one radius per surface type per view |
| Square buttons (`--radius-none`) — feels like a form field | Minimum `--radius-md` for any tappable element |
| Different radii on the same card's children | Follow the nesting convention consistently |
| `border-radius: 50%` on non-square elements | Use `--radius-full` (9999px) — it's always a pill, never an ellipse |

---

## 5. Shadow & Elevation System

### 5a. Shadow Tokens

```
--shadow-none:      none
--shadow-sm:        0 1px 3px rgba(0,0,0,0.3)        (subtle lift, active states)
--shadow-md:        0 2px 8px rgba(0,0,0,0.3)        (cards resting on surface)
--shadow-lg:        0 8px 24px rgba(0,0,0,0.5)       (elevated cards, dialogs)
--shadow-xl:        0 16px 40px rgba(0,0,0,0.6)      (modals, sheets)
--shadow-glow-sm:   0 0 12px rgba(148,52,230,0.3)    (subtle brand glow)
--shadow-glow-md:   0 0 20px rgba(148,52,230,0.4)    (active brand element)
--shadow-glow-lg:   0 0 30px rgba(148,52,230,0.5)    (primary CTA)
--shadow-gold:      0 0 24px rgba(201,168,76,0.5)    (gold seam pulse)
```

### 5b. Elevation Map

```
z-0     Base surface (neutral-950 background)
z-10    Cards, sidebars, navigation
z-20    Floating action buttons, sticky headers
z-30    Dropdowns, popovers, tooltips
z-40    Modals, sheets, dialogs
z-50    Toast notifications, system messages
z-9999  XP burst particles, scanline overlay
```

---

## 6. Motion & Animation Tokens

### 6a. Duration Scale

```
--duration-instant:   0ms       (color changes, toggle states)
--duration-fast:      150ms     (hover on/off, chip press, check toggle)
--duration-normal:    250ms     (page transitions, card enter/exit)
--duration-slow:      400ms     (modal open/close, level-up ceremony)
--duration-ritual:    800ms     (onboarding reveals, FutureSelf emergence)
```

### 6b. Easing Curves

```
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1)     (iOS standard)
--ease-enter:      cubic-bezier(0, 0, 0.2, 1)       (elements appearing)
--ease-exit:       cubic-bezier(0.4, 0, 1, 1)       (elements leaving)
--ease-bounce:     cubic-bezier(0.4, 0, 0.6, 1.4)   (XP burst, celebration)
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1) (stagger reveals)
```

### 6c. Preset Transitions

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `page-enter` | 300ms | `--ease-enter` | Tab switches, route changes |
| `card-appear` | 250ms | `--ease-default` | Cards entering viewport |
| `modal-open` | 350ms | `--ease-enter` | Modal/dialog appearance |
| `modal-close` | 200ms | `--ease-exit` | Modal/dialog dismissal |
| `xp-burst` | 600ms | `--ease-bounce` | Quest completion popup |
| `toast-in` | 350ms | `--ease-default` | System toast slide-in |
| `toast-out` | 250ms | `--ease-exit` | System toast dismissal |
| `pulse-gold` | 2000ms | `ease-out` | Domain unlock ceremony |
| `vignette-flash` | 300ms | `ease-out` | Quest completion feedback |

### 6d. Kintsugi Motion Philosophy

- **Streak extended**: Quick, sharp, upward — like a spark catching. `--duration-fast`, `ease-bounce`.
- **Streak saved** (freeze): Cool, smooth fade. Frosty relief, not celebration. `--duration-normal`.
- **Streak recovered** (gold seam): Slow reveal. Visible gold pulse. `--duration-ritual`. This is the most important animation in the system.
- **Streak reset**: No animation at all. The break is real. The gold seam that follows IS the animation.

### 6e. Reduced Motion

All animations respect `prefers-reduced-motion: reduce` — durations collapse to `0.01ms`, transforms are skipped, opacity-only transitions remain.

---

## 7. Component Library

Every component adheres to: **one component = one .tsx file = one export = documented props**.

### 7a. Primitive Components

#### Button
```
Variants: primary | secondary | ghost | danger
Sizes: sm (32px) | md (44px) | lg (56px FAB)
States: default | hover | active (scale 0.97) | disabled | loading
Icon: optional left/right icon slot
Mobile: min 44px touch target, active scale feedback
Desktop: min 36px, hover color shift, no scale feedback
```

#### Chip (Pill)
```
Variants: default | active | muted
Content: icon (optional) + label
Mobile: 32px height, flex-wrap in containers, text-[11px] px-2
Desktop: 32px height, overflow-x-auto in containers, text-[12px] px-3
```

#### Input (Text)
```
Height: 44px
Radius: 10px
States: default | focus (brand border + ring) | error (danger border) | disabled
Placeholder: --text-placeholder
```

#### Textarea
```
Min rows: 2 | Default: 3 | Journal: 4
Radius: 12px
Mobile: max-height 40vh, character counter at bottom-right
Desktop: max-height 50vh
Auto-save: 800ms debounce to localStorage draft
```

#### Progress Bar
```
Height: 6px (default) | 4px (inline) | 8px (hero)
Radius: full
Fill: gradient brand → brand-neon
Animation: width transition 500ms
```

#### Check Circle
```
Size: 24px (default) | 44px (mobile quest card)
States: unchecked (border) | checked (filled emerald + checkmark)
Animation: 250ms scale + fill
```

#### Toast
```
Position: fixed top-20, centered
Duration: 2000ms (info/quest) | 3500ms (ceremony)
Animation: slide-in from top, fade-out
Max width: 360px mobile, 480px desktop
```

### 7b. Composite Components

#### Card
```
Base: --surface-card, --radius-lg, --shadow-md
Padding: --space-4 (mobile), --space-5 (desktop)
Variants: default | elevated (--shadow-lg) | glass (frosted)
Sections: header (title + action), body, footer (optional)
```

#### QuestCard
```
Layout: horizontal (icon + content + XP badge)
States: default | completed (muted opacity, line-through, emerald glow)
Interactions: tap (toggle complete) | swipe-right (complete, mobile only) | swipe-left (snooze, mobile only)
Haptic: success pattern on complete, tap pattern on toggle
Animation: check circle transition + XP burst + vignette flash
```

#### PillarStatsCard
```
Content: icon + label + level + XP bar + weight + streak chips
States: default | pulse-gold (unlock ceremony)
```

#### CharacterCard
```
Content: FutureSelf avatar + name + tier + rank + gamemode + XP bar + pillar distribution + harmony indicator
States: default | level-up (scale pulse)
```

#### TabBar (Mobile Only)
```
Height: 50px + safe-area-inset-bottom
Items: 4 (Command, Schedule, Pillar Labs, Bounties)
Active: --info color + scale indicator
Background: frosted glass (--opacity-glass)
Hidden: md:hidden (never on desktop)
```

#### BottomSheet / Modal
```
Backdrop: --surface-overlay + blur
Content: --surface-elevated, --radius-2xl, --shadow-xl
Animation: slide-up from bottom on mobile, scale-in center on desktop
Dismiss: tap backdrop, swipe down (mobile only)
Max height: 85vh mobile, 75vh desktop
```

#### DomainPicker
```
Type: Modal
Content: grid of available pillars (2-col mobile, 3-col desktop)
Each: icon + label + description
Gate: locked items show lock icon + requirement text
Ceremony: gold pulse on newly unlocked slot
```

#### StreakToast
```
Content: streak event icon + pillar name + message
Duration: 3000ms
Variants by event: started (green) | extended (gold) | saved (blue) | recovered (gold pulse) | reset (amber)
```

---

## 8. Cross-Platform Adaptation Rules

### 8a. Breakpoint System

```
--bp-sm:   640px    (large phones landscape)
--bp-md:   768px    (tablets, small laptops — DESKTOP GATE)
--bp-lg:   1024px   (laptops, desktop — SIDEBAR GATE)
--bp-xl:   1280px   (large desktop — MULTI-COLUMN GATE)
--bp-2xl:  1536px   (ultrawide — MAX WIDTH GATE)
```

### 8b. Adaptation Map

| Feature | Mobile (<768px) | Desktop (≥768px) |
|---------|-----------------|------------------|
| Navigation | Bottom TabBar | Left sidebar (w-60) |
| Content width | 100% (edge-to-edge) | max-w-3xl centered |
| Pill filter tabs | `flex-wrap` 11px chips | `overflow-x-auto` 12px chips |
| Quest cards | Single column, 44px check | Single column, 24px check |
| Pillar cards | Accordion (collapsed → tap → expand) | Always visible grid |
| Quest interactions | Tap + swipe + long-press + haptic | Tap + hover |
| Forms | Sticky buttons, large inputs | Inline buttons, standard inputs |
| Textareas | 3 rows, char counter visible | 4 rows, char counter on focus |
| FAB | 56px × 56px, bottom-right | 48px × 48px, bottom-right |
| Weight ± buttons | 48px × 48px | 28px height, hybrid stepper |
| Modals | Full bottom sheet | Centered dialog |
| Pillar selector | Segmented control (iOS style) | Horizontal chip row |
| Right rail | Hidden | w-72 (FutureSelf + streak cards + stats) |
| Draft auto-save | 800ms debounce to localStorage | Same, plus cloud sync queue |
| Haptic feedback | Yes (navigator.vibrate) | No |

### 8c. Mobile-Only Features (md:hidden on desktop)
- Bottom TabBar
- Swipe gestures on quest cards
- Long-press context menus
- Haptic feedback patterns
- Full-width bottom sheets
- Segmented controls for pillar switching
- Accordion-collapsed pillar cards
- Sticky bottom action buttons

### 8d. Desktop-Only Features (hidden md:block or md:flex)
- Left sidebar navigation
- Right rail (FutureSelf + streak + stats)
- Hover-reveal action buttons
- Keyboard shortcuts (Ctrl+1-4 tab switch, Ctrl+K capture, Ctrl+Enter log)
- Multi-column quest grid (≥1280px)
- Pillar Labs 3-column layout (selector + main + analytics)

---

## 9. Icon System

### 9a. Icon Library: lucide-react (exclusively)

No raw emoji in UI. Every concept that previously used emoji maps to a Lucide icon:

| Concept | Icon | Class |
|---------|------|-------|
| Streak | `Flame` | `text-[#FF9F0A]` |
| XP | `Sparkles` | `text-brand-neon` |
| Gold seam | `Zap` | `text-[#C9A84C]` |
| Freeze token | `Shield` | `text-ios-blue` |
| Level | `TrendingUp` | `text-white` |
| Weight | `Gauge` | `text-white/50` |
| Journal | `BookOpen` | `text-white/40` |
| Notes | `Book` | `text-white/40` |
| Save | `Save` | `text-current` |
| Add | `Plus` | `text-current` |
| Close | `X` | `text-current` |
| Lock | `Lock` | `text-white/20` |
| Cloud | `Cloud` | `text-brand-neon` |
| Offline | `CloudOff` | `text-amber-500` |
| Capture (FAB) | `Plus` | `text-white` |
| Reset | `RotateCcw` | `text-white/60` |
| Sign out | `LogOut` | `text-white/60` |

### 9b. Icon Sizing

```
--icon-sm:   14px   (inline, chips, badges)
--icon-md:   18px   (button leading, list items)
--icon-lg:   24px   (tab bar, card headers)
--icon-xl:   32px   (hero, empty states)
--icon-2xl:  48px   (FAB, primary CTAs)
```

---

## 10. Haptic Feedback Map

| Event | Pattern | Duration | Mobile Only |
|-------|---------|----------|-------------|
| Tap / Select | `[8]` | 8ms | Yes |
| Quest Complete | `[12, 40, 18]` | 70ms | Yes |
| Streak Extend | `[10, 30, 10, 30, 24]` | 104ms | Yes |
| Level Up | `[16, 50, 16, 50, 16, 50, 40]` | 238ms | Yes |
| Gold Seam | `[10, 60, 10, 60, 30]` | 170ms | Yes |
| Capture Save | `[8, 30, 8]` | 46ms | Yes |

---

## 11. Implementation Rollout Strategy

### Phase 5a: Core Tokens (immediate)
1. Extract all hardcoded colors in `index.css` → Tailwind `@theme` variables
2. Apply semantic color tokens to all components (no visual change)
3. Define typography scale as Tailwind `@theme` variables
4. Add spacing scale variables
5. **Desktop stays frozen** — all changes are token-level, not layout-level

### Phase 5b: Component Standardization (next)
1. Create `src/components/ui/` folder
2. Extract `Button` variant logic into a shared helper
3. Standardize all card markup to use `ios-card` / `system-card` classes consistently
4. Audit every component for minimum touch targets on mobile
5. Add `aria-label` to all icon-only buttons

### Phase 5c: Motion Audit (following)
1. Verify all `motion/react` usage uses the preset durations/easings
2. Add `prefers-reduced-motion` checks to custom animations
3. Standardize `AnimatePresence` usage across all toasts/modals

### Phase 5d: Mobile Polish Sprint
1. Accordion-collapse pillar cards on Dashboard (mobile only)
2. Swipe gestures on quest cards
3. Long-press context menu on quests
4. Sticky bottom action buttons in Pillar Labs
5. Draft auto-save for textareas (800ms debounce)
6. Character counters on textareas
7. iOS segmented control for pillar switching
8. Large ± buttons for weight adjustment (48×48px)

### Phase 5e: Desktop Enhancement (PHASE 3a DESKTOP — DEFERRED)
Note: The current desktop layout is **frozen** per user directive. Phase 3a desktop redesign (multi-column zones, analytics sidebar, hover-revealed actions) will only be implemented once explicitly requested.

---

## 12. Design System Governance

### 12a. When to add a new token
- A color or spacing value appears in **3+ components** → tokenize it
- A one-off value stays inline (it's intentional, not inconsistent)

### 12b. When to create a new component
- A UI pattern appears in **2+ places** → extract to `src/components/ui/`
- Single-use patterns stay co-located with their parent component

### 12c. Commit ceremony
- Design system changes are committed with prefix `design:`
- Example: `design: extract button tokens, standardize card radii`
- Never mix design system changes with feature work

### 12d. Desktop freeze boundary
- **Any class with `md:` or `lg:` prefix is a mobile-only or responsive adaptation**
- Classes without a breakpoint prefix are shared (desktop + mobile)
- The desktop layout (`hidden md:flex` sidebar, single-column content) must remain visually identical after every change
- Verify: after every change, open `http://localhost:3000/` at ≥1024px width and confirm no visual difference
