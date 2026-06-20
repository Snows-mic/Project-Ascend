/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PillarDefinition,
  Quest,
  Achievement,
  DailyLog,
  UserPillars,
  UserProfile,
  GameModeDef,
  NonNegotiableTemplate,
} from "./types";

/** Daily journal prompt based on the current date */
export function promptForDate(dateStr: string): string {
  const day = new Date(dateStr + "T00:00:00").getDay();
  const prompts: Record<number, string> = {
    0: "What are you most grateful for this week?",
    1: "What's one thing you want to accomplish today?",
    2: "What challenge are you facing right now?",
    3: "Midweek checkpoint — how are your goals tracking?",
    4: "What's something you learned this week?",
    5: "What went well today? What could be better?",
    6: "What are you looking forward to next week?",
  };
  return prompts[day] ?? "What's on your mind today?";
}

/** Weekly review prompts for deeper reflection */
export const WEEKLY_REVIEW_PROMPTS = [
  { label: "Wins", prompt: "What were your biggest wins this week?" },
  { label: "Lessons", prompt: "What did you learn?" },
  { label: "Struggles", prompt: "What held you back?" },
  { label: "Next Week", prompt: "What's your focus for next week?" },
  { label: "Gratitude", prompt: "Who or what are you grateful for?" },
];

/** App version — stamped onto bug reports so you can tie a report to a build. */
export const APP_VERSION = "0.9.0-beta";

/** All available pillars a user can choose from during onboarding */
export const AVAILABLE_PILLARS: PillarDefinition[] = [
  {
    id: "health",
    label: "Health & Fitness",
    icon: "Flame",
    color: "from-orange-500 to-amber-600",
    description: "Exercise, nutrition, sleep, and physical wellbeing.",
  },
  {
    id: "mental",
    label: "Mental Wellness",
    icon: "Brain",
    color: "from-teal-500 to-cyan-600",
    description: "Meditation, therapy, mindfulness, and emotional health.",
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: "Target",
    color: "from-blue-500 to-indigo-600",
    description: "Time management, focus, habits, and getting things done.",
  },
  {
    id: "finance",
    label: "Finance",
    icon: "DollarSign",
    color: "from-emerald-500 to-green-600",
    description: "Budgeting, saving, investing, and financial literacy.",
  },
  {
    id: "relationships",
    label: "Relationships",
    icon: "Users",
    color: "from-pink-500 to-rose-600",
    description: "Family, friends, romantic connections, and community.",
  },
  {
    id: "learning",
    label: "Learning & Education",
    icon: "BookOpen",
    color: "from-violet-500 to-purple-600",
    description:
      "Reading, courses, skills development, and intellectual growth.",
  },
  {
    id: "faith",
    label: "Faith / Religion",
    icon: "Sun",
    color: "from-yellow-400 to-amber-500",
    description: "Spiritual practice, prayer, meditation, and religious study.",
  },
  {
    id: "creativity",
    label: "Creativity",
    icon: "PenTool",
    color: "from-fuchsia-500 to-pink-600",
    description:
      "Writing, art, music, content creation, and creative expression.",
  },
  {
    id: "career",
    label: "Career & Leadership",
    icon: "Briefcase",
    color: "from-indigo-500 to-blue-600",
    description:
      "Professional growth, networking, side projects, and leadership.",
  },
];

/** Look up a pillar definition by ID */
export function getPillarDef(id: string): PillarDefinition | undefined {
  return AVAILABLE_PILLARS.find((p) => p.id === id);
}

/**
 * The four gamemodes — each a distinct daily rhythm + XP + streak ruleset.
 * Emoji values are icon keys (not Unicode) — rendered as Lucide icons.
 */
export const GAMEMODES: GameModeDef[] = [
  {
    id: "drift",
    name: "Drift",
    emoji: "Sprout",
    tagline: "Gentle re-entry",
    subtext: "No pressure. Just show up.",
    whatChanges: "XP gains are halved, but your streak never breaks. Missed days are rest days.",
    hook: "The river doesn't fight the stone.",
    dailyQuests: 1,
    xpMultiplier: 0.5,
    xpLabel: "½ XP",
    streakShort: "Never breaks",
    streakRule: "Missing a day never resets the streak.",
    recovery: "No recovery needed — missed days are rest days.",
    intendedFor: "Recovering from burnout, mental health focus, or life chaos.",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    id: "momentum",
    name: "Momentum",
    emoji: "Flame",
    tagline: "Keep the chain alive",
    subtext: "Consistent effort. Freeze tokens catch you when you fall.",
    whatChanges: "Standard XP. Earn freeze tokens at 7-day milestones (cap 2). Spend one to preserve streak on a missed day.",
    hook: "Build the chain. Protect it.",
    dailyQuests: 3,
    xpMultiplier: 1.0,
    xpLabel: "1× XP",
    streakShort: "Freeze-protected",
    streakRule: "Miss a day → spend 1 freeze or reset.",
    recovery: "Freeze token consumed on missed day. Earn new freezes at 7-day streak milestones (cap 2).",
    intendedFor: "Players who want structure with a safety net.",
    accent: "from-orange-500 to-amber-600",
    recommended: true,
  },
  {
    id: "forge",
    name: "Forge",
    emoji: "Hammer",
    tagline: "Pressure makes diamonds",
    subtext: "Higher XP, harder recovery. Missed days keep 50% of your streak.",
    whatChanges: "+25% XP. Miss a day → spend a freeze or keep 50% of streak + gold seam.",
    hook: "The hammer breaks what won't bend.",
    dailyQuests: 4,
    xpMultiplier: 1.25,
    xpLabel: "+25% XP",
    streakShort: "50% recovery",
    streakRule: "Miss a day → spend 1 freeze or keep 50% of your streak.",
    recovery: "Freeze tokens at 7-day milestones (cap 2). Without freeze: keep 50% of streak, record a gold seam.",
    intendedFor: "Disciplined players who want risk and reward.",
    accent: "from-red-500 to-rose-600",
  },
  {
    id: "ascendant",
    name: "Ascendant",
    emoji: "Crown",
    tagline: "No safety net. Only gold.",
    subtext: "Maximum XP. Every comeback leaves a gold seam — but there's no safety net.",
    whatChanges: "+50% XP. No freeze tokens. Missed day → reset to 1. Every reset records a gold seam.",
    hook: "Breaking is how the light gets in.",
    dailyQuests: 5,
    xpMultiplier: 1.5,
    xpLabel: "+50% XP",
    streakShort: "No safety net",
    streakRule: "Miss a day → reset to 1. Every comeback records a gold seam.",
    recovery: "No freezes. No partial recovery. Every reset leaves a gold seam — visible proof of every comeback.",
    intendedFor: "Purists who want maximum challenge. Every seam is a trophy.",
    accent: "from-amber-400 to-yellow-500",
  },
];

/** Look up a gamemode definition by ID. Falls back to Momentum (recommended default). */
export function getGameMode(id?: string): GameModeDef {
  return GAMEMODES.find((m) => m.id === id) ?? GAMEMODES[1]; // default: Momentum
}

/** Maximum daily quests allowed for a given gamemode */
export function getDailyQuestCap(gamemodeId?: string): number {
  return getGameMode(gamemodeId).dailyQuests;
}

/* ------------------------------------------------------------------ */
/*  Participation bounties — "do X N times → award" milestones         */
/* ------------------------------------------------------------------ */

export interface BountyTier {
  count: number;
  name: string;
  xp: number;
}

export const BOUNTY_TIERS: BountyTier[] = [
  { count: 5, name: "Starter", xp: 25 },
  { count: 10, name: "Dedicated", xp: 50 },
  { count: 25, name: "Devoted", xp: 120 },
  { count: 50, name: "Relentless", xp: 250 },
  { count: 100, name: "Legend", xp: 600 },
  { count: 250, name: "Mythic", xp: 1500 },
];

/** The next unearned bounty tier for a given count (null if all earned). */
export function nextBounty(count: number): BountyTier | null {
  return BOUNTY_TIERS.find((t) => count < t.count) || null;
}

/** All bounty tiers already earned at a given count. */
export function earnedBounties(count: number): BountyTier[] {
  return BOUNTY_TIERS.filter((t) => count >= t.count);
}

/** Kintsugi Repair Quest — generated when a streak resets to help rebuild */
export interface RepairQuest {
  title: string;
  description: string;
  pillar: string;
  xpReward: number;
  flavour: string; // character voice line
}

const REPAIR_FLAVOURS: string[] = [
  "A single gold seam makes it stronger.",
  "The porcelain doesn't hide its cracks.",
  "Every break is a new beginning.",
  "Kintsugi: the art of precious scars.",
  "You didn't fail — you gathered gold.",
];

/** Generate 1-3 repair quests after a streak reset */
export function generateRepairQuests(
  streakBeforeReset: number,
  playerLevel: number,
): RepairQuest[] {
  const count = streakBeforeReset >= 30 ? 3 : streakBeforeReset >= 14 ? 2 : 1;
  const pillarPool = AVAILABLE_PILLARS.map((p) => p.id);

  const quests: RepairQuest[] = [];
  for (let i = 0; i < count; i++) {
    const xp = Math.round((50 + playerLevel * 15) * (1 + i * 0.5));
    const pillar = pillarPool[i % pillarPool.length];
    const flavour = REPAIR_FLAVOURS[Math.floor(Math.random() * REPAIR_FLAVOURS.length)];

    quests.push({
      title: i === 0 ? "First Gold Seam" : i === 1 ? "Kintsugi Repair" : "Gilded Comeback",
      description: `Complete one ${pillar} action to mend the break.`,
      pillar,
      xpReward: xp,
      flavour,
    });
  }
  return quests;
}

/**
 * Tappable goal suggestions per pillar — used in onboarding instead of free-text
 * inputs (phone typing is the highest-friction interaction). One can be selected
 * per pillar; the chosen chip text is stored as that pillar's goal.
 */
export const PILLAR_GOAL_CHIPS: Record<string, string[]> = {
  health: ["Get stronger", "Sleep better", "Move every day"],
  mental: ["Stress less", "Be more present", "Feel steadier"],
  productivity: ["Beat procrastination", "Deep focus", "Finish what I start"],
  finance: ["Save more", "Budget weekly", "Learn investing"],
  relationships: ["Stay connected", "Reach out more", "Be more present"],
  learning: ["Read daily", "Learn a new skill", "Finish a course"],
  faith: ["Pray consistently", "Study scripture", "Find stillness"],
  creativity: ["Create daily", "Ship a project", "Find my style"],
  career: ["Level up my skills", "Network more", "Build a side project"],
};

/** Pillars picker — maps old hardcoded IDs to new ones for migration */
export const PILLAR_MIGRATION_MAP: Record<string, string> = {
  fitness: "health",
  intellect: "learning",
  university: "learning",
  personalDev: "mental",
  social: "relationships",
  creative: "creativity",
  career: "career",
};

export function createDefaultProfile(
  uid: string,
  email: string,
  displayName: string,
): UserProfile {
  return {
    uid,
    email,
    displayName: displayName || "User",
    level: 1,
    xp: 0,
    pillars: {},
    achievements: [],
    levelUpHistory: [],
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyDailyLog(userId: string, date: string): DailyLog {
  return {
    userId,
    date,
    completedTasks: {},
    pillarNotes: {},
    journalEntry: "",
  };
}

/** Generate starter quests for a user's selected pillars. AI overrides these on first generation. */
export function generateStarterQuests(pillarIds: string[]): Quest[] {
  const quests: Quest[] = [];
  let counter = 0;

  for (const pid of pillarIds) {
    const def = getPillarDef(pid);
    if (!def) continue;

    quests.push({
      id: `starter_core_${pid}`,
      title: `Daily ${def.label} Practice`,
      description: `Spend time on your ${def.label.toLowerCase()} routine today.`,
      pillar: pid,
      xpReward: 15,
      completed: false,
      type: "daily",
      isCoreHabit: true,
    });

    quests.push({
      id: `starter_focus_${pid}`,
      title: `Deep Focus: ${def.label}`,
      description: `Dedicate focused effort toward your ${def.label.toLowerCase()} goal.`,
      pillar: pid,
      xpReward: 25,
      completed: false,
      type: "daily",
      isCoreHabit: false,
    });

    counter += 2;
  }

  // One weekly milestone per pillar
  for (const pid of pillarIds) {
    const def = getPillarDef(pid);
    if (!def) continue;
    quests.push({
      id: `starter_weekly_${pid}`,
      title: `Weekly ${def.label} Review`,
      description: `Reflect on your ${def.label.toLowerCase()} progress this week and set next week's intention.`,
      pillar: pid,
      xpReward: 50,
      completed: false,
      type: "weekly",
      isCoreHabit: false,
    });
  }

  return quests;
}

/** Dynamic achievements keyed by pillar. Users earn them by hitting streaks. */
export function generateAchievements(pillarIds: string[]): Achievement[] {
  const achievements: Achievement[] = [];

  achievements.push({
    id: "first_steps",
    title: "First Steps",
    description: "Complete your very first quest. Every journey begins with a single step.",
    icon: "Award",
    pillar: "general",
    xpBonus: 10,
  });

  achievements.push({
    id: "general_first_level",
    title: "First Awakening",
    description: "Reach Level 2 for the first time.",
    icon: "Award",
    pillar: "general",
    xpBonus: 50,
  });

  for (const pid of pillarIds) {
    const def = getPillarDef(pid);
    if (!def) continue;
    achievements.push({
      id: `streak_7_${pid}`,
      title: `${def.label} — 7-Day Streak`,
      description: `Maintain a 7-day streak in ${def.label}.`,
      icon: def.icon,
      pillar: pid,
      xpBonus: 75,
    });
    achievements.push({
      id: `streak_30_${pid}`,
      title: `${def.label} — 30-Day Streak`,
      description: `Maintain a 30-day streak in ${def.label}.`,
      icon: def.icon,
      pillar: pid,
      xpBonus: 200,
    });
    achievements.push({
      id: `level_5_${pid}`,
      title: `${def.label} — Level 5`,
      description: `Reach Level 5 in ${def.label}.`,
      icon: def.icon,
      pillar: pid,
      xpBonus: 100,
    });
  }

  return achievements;
}

/** Default weights — evenly distributed across selected pillars */
export function defaultPillarWeights(
  pillarIds: string[],
): Record<string, number> {
  if (pillarIds.length === 0) return {};
  const each = Math.floor(100 / pillarIds.length);
  const weights: Record<string, number> = {};
  for (const pid of pillarIds) weights[pid] = each;
  return weights;
}

// ═══════════════════════════════════════════
// XP CURVE — 3-phase graduated progression
// Phase 1: Levels 1–10  (lookup table — gentle ramp)
// Phase 2: Levels 11–50 (100 × level^1.65)
// Phase 3: Levels 51+   (150 × level^1.8)
// ═══════════════════════════════════════════

const PHASE1_XP: number[] = [0, 80, 100, 125, 150, 175, 210, 250, 300, 360, 430];

export function getXpForLevel(level: number): number {
  if (level <= 10) return PHASE1_XP[level] ?? 430;
  if (level <= 50) return Math.round(100 * Math.pow(level, 1.65));
  return Math.round(150 * Math.pow(level, 1.8));
}

export function getCumulativeXp(level: number): number {
  let total = 0;
  for (let l = 1; l <= level; l++) total += getXpForLevel(l);
  return total;
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let cumulative = 0;
  while (true) {
    const needed = getXpForLevel(level);
    if (cumulative + needed > totalXp) break;
    cumulative += needed;
    level++;
  }
  return Math.max(1, level);
}

export function getXpInLevel(totalXp: number, level: number): number {
  const cumBelow = level > 1 ? getCumulativeXp(level - 1) : 0;
  return Math.max(0, totalXp - cumBelow);
}

export function getXpProgress(totalXp: number, level: number): number {
  const needed = getXpForLevel(level);
  if (needed <= 0) return 100;
  const inLevel = getXpInLevel(totalXp, level);
  return Math.min(100, Math.round((inLevel / needed) * 100));
}

// ═══════════════════════════════════════════
// PRIORITY METADATA — visual indicators for quest priority levels
// ═══════════════════════════════════════════

export const PRIORITY_META: Record<string, { dot: string; border: string }> = {
  low:  { dot: "bg-blue-400",           border: "border-l-2 border-l-blue-400" },
  med:  { dot: "bg-amber-400",          border: "border-l-2 border-l-amber-400" },
  high: { dot: "bg-rose-400",           border: "border-l-2 border-l-rose-400" },
};

// ═══════════════════════════════════════════
// MOODS — emoji mood picker for journal entries
// ═══════════════════════════════════════════

export const MOODS = ["😊", "😐", "😤", "😢", "😴", "🤩", "😰", "🥳"];

// ═══════════════════════════════════════════
// SKILL TREE — consistency-gated nodes (one tree per pillar)
// ═══════════════════════════════════════════

export interface SkillNode {
  id: string;
  name: string;
  emoji: string;
  requirement: string;
  science: string;
  /** What the unlock represents — System-voice flavor describing the user's new capability. */
  perk?: string;
  check: (stats: { streak: number; longestStreak?: number; seams?: number }, completions: number) => boolean;
}

export const SKILL_NODES: SkillNode[] = [
  {
    id: "habit_seed",
    name: "Habit Seed",
    emoji: "🌱",
    requirement: "3-day streak",
    science: "Neuroplasticity begins after ~3 days of consistent action.",
    perk: "The first spark. Your brain has begun rewiring.",
    check: (s) => s.streak >= 3,
  },
  {
    id: "rhythm",
    name: "Rhythm",
    emoji: "🔄",
    requirement: "7-day streak",
    science: "7 days activates the basal ganglia — automaticity begins.",
    perk: "Doing has become wanting-to-do. Friction drops.",
    check: (s) => s.streak >= 7,
  },
  {
    id: "consolidation",
    name: "Consolidation",
    emoji: "🧱",
    requirement: "14-day streak",
    science: "Synaptic consolidation peaks around 2 weeks.",
    perk: "The pattern is load-bearing. Missing a day costs more.",
    check: (s) => s.streak >= 14,
  },
  {
    id: "identity",
    name: "Identity Shift",
    emoji: "🦋",
    requirement: "30-day streak",
    science: "30 days marks the transition from behaviour to identity.",
    perk: "You stop saying 'I'm trying to'. You say 'I am'.",
    check: (s) => s.streak >= 30 || (s.longestStreak ?? 0) >= 30,
  },
  {
    id: "kintsugi",
    name: "Kintsugi",
    emoji: "✨",
    requirement: "1+ gold seam",
    science: "Comebacks are skills. Every repair rewires resilience pathways.",
    perk: "Returning from a break is harder than never breaking. You did the hard thing.",
    check: (s) => (s.seams ?? 0) >= 1,
  },
  {
    id: "mastery",
    name: "Mastery",
    emoji: "👑",
    requirement: "100+ completions",
    science: "100 repetitions forms procedural memory — effortless action.",
    perk: "The act has gone from thought to instinct. Identity locked in.",
    check: (_s, completions) => completions >= 100,
  },
];

/**
 * Total completions of a pillar's quests across quest history.
 * Derived from participation counters — no stored state.
 */
export function pillarCompletions(
  pid: string,
  quests: { id: string; pillar: string }[],
  participation?: Record<string, number>,
): number {
  return quests
    .filter((q) => q.pillar === pid)
    .reduce((sum, q) => sum + (participation?.[q.id] ?? 0), 0);
}

// ═══════════════════════════════════════════
// ATTRIBUTES — six fixed axes for the radar chart ("The Shape of You")
// ═══════════════════════════════════════════

export interface AttributeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ATTRIBUTES: AttributeDef[] = [
  { id: "focus",     name: "Focus",     emoji: "🎯", description: "Deep work & concentration" },
  { id: "vitality",  name: "Vitality",  emoji: "💪", description: "Physical health & energy" },
  { id: "clarity",   name: "Clarity",   emoji: "🧠", description: "Mental wellness & emotional balance" },
  { id: "influence", name: "Influence", emoji: "🤝", description: "Relationships & social impact" },
  { id: "growth",    name: "Growth",    emoji: "📈", description: "Learning & skill development" },
  { id: "resolve",   name: "Resolve",   emoji: "⚔️", description: "Streaks, comebacks & persistence" },
];

/** Maps each pillar ID to the attribute it feeds on the radar chart. */
export const PILLAR_TO_ATTRIBUTE: Record<string, string> = {
  health:        "vitality",
  mental:        "clarity",
  productivity:  "focus",
  finance:       "growth",
  relationships: "influence",
  learning:      "growth",
  faith:         "clarity",
  creativity:    "focus",
  career:        "growth",
};

export interface AttributeStats {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  level: number;
}

/**
 * Derives attribute stats from pillar XP, streaks, and comebacks.
 * Pillar XP maps to attributes via PILLAR_TO_ATTRIBUTE.
 * Resolve gets bonuses from longest streaks and gold seams.
 */
export function computeAttributes(profile: {
  pillars: Record<string, { xp: number; longestStreak?: number; seams?: number }>;
}): AttributeStats[] {
  const buckets: Record<string, number> = {};
  for (const a of ATTRIBUTES) buckets[a.id] = 0;

  for (const [pid, stats] of Object.entries(profile.pillars)) {
    const attrId = PILLAR_TO_ATTRIBUTE[pid] ?? "focus";
    buckets[attrId] = (buckets[attrId] ?? 0) + stats.xp;
  }

  // Resolve bonus: streak endurance + comeback gold
  let resolveBonus = 0;
  for (const stats of Object.values(profile.pillars)) {
    resolveBonus += (stats.longestStreak ?? 0) * 5;
    resolveBonus += (stats.seams ?? 0) * 25;
  }
  buckets["resolve"] = (buckets["resolve"] ?? 0) + resolveBonus;

  return ATTRIBUTES.map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    xp: buckets[a.id] ?? 0,
    level: Math.floor((buckets[a.id] ?? 0) / 100) + 1,
  }));
}

// ═══════════════════════════════════════════
// RANK SYSTEM — 8 ranks: E → D → C → B → A → S → SS → SSS
// ═══════════════════════════════════════════

export interface RankDef {
  rank: string;
  title: string;
  minLevel: number;
  flavour: string;
}

export const RANKS: RankDef[] = [
  { rank: "E-Rank",  title: "Beginner",     minLevel: 1,  flavour: "Every master was once a novice. The System sees your potential." },
  { rank: "D-Rank",  title: "Apprentice",    minLevel: 6,  flavour: "Your first cracks in the stone. Consistency is forming." },
  { rank: "C-Rank",  title: "Adept",         minLevel: 12, flavour: "The forge is lit. Gold glimmers in the fractures." },
  { rank: "B-Rank",  title: "Specialist",    minLevel: 20, flavour: "Depth over breadth. Your seams are becoming art." },
  { rank: "A-Rank",  title: "Expert",        minLevel: 30, flavour: "The vessel is strong. Few reach this far." },
  { rank: "S-Rank",  title: "Master",        minLevel: 45, flavour: "You are what you kept saying you'd become." },
  { rank: "SS-Rank", title: "Grandmaster",   minLevel: 65, flavour: "The System bows. You are the proof of the design." },
  { rank: "SSS-Rank",title: "Ascendant",     minLevel: 90, flavour: "Legendary. A vessel of pure gold." },
];

export function getRankForLevel(level: number): RankDef {
  let rank: RankDef | undefined;
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
    else break;
  }
  return rank ?? RANKS[0];
}

// ═══════════════════════════════════════════
// TITLES — auto-awarded identity badges (Solo-Leveling flavor)
// Derived from profile state, never stored — retroactive by construction.
// ═══════════════════════════════════════════

export interface TitleDef {
  id: string;
  name: string;
  description: string;
  check: (input: {
    pillars: Record<string, { streak?: number; longestStreak?: number; seams?: number; xp?: number }>;
    seamsTotal: number;
    maxStreak: number;
    maxLongest: number;
    journalStreak: number;
    focusSessions: number;
    level: number;
  }) => boolean;
}

export const TITLES: TitleDef[] = [
  // Streak archetypes
  { id: "ignited",      name: "Ignited",       description: "First spark — a 3-day streak.",          check: (s) => s.maxStreak >= 3 },
  { id: "iron_willed",  name: "Iron-Willed",   description: "Two weeks unbroken.",                    check: (s) => s.maxLongest >= 14 },
  { id: "unstoppable",  name: "Unstoppable",   description: "A 30-day streak — identity made real.", check: (s) => s.maxLongest >= 30 },
  { id: "centurion",    name: "Centurion",     description: "100 days of consistency.",               check: (s) => s.maxLongest >= 100 },
  // Comeback / Kintsugi
  { id: "kintsugi",     name: "Kintsugi",      description: "Repaired with gold. 1+ comeback seam.", check: (s) => s.seamsTotal >= 1 },
  { id: "phoenix",      name: "Phoenix",       description: "Five comebacks. Failure is your forge.", check: (s) => s.seamsTotal >= 5 },
  // Journal
  { id: "scribe",       name: "Scribe",        description: "7-day journaling streak.",               check: (s) => s.journalStreak >= 7 },
  { id: "chronicler",   name: "Chronicler",    description: "30-day journaling streak.",              check: (s) => s.journalStreak >= 30 },
  // Focus
  { id: "deep_diver",   name: "Deep Diver",    description: "10 focus raids cleared.",                check: (s) => s.focusSessions >= 10 },
  { id: "monk_mind",    name: "Monk Mind",     description: "50 focus raids cleared.",                check: (s) => s.focusSessions >= 50 },
  // Progression
  { id: "ascended",     name: "Ascended",      description: "Level 25. The System notices.",          check: (s) => s.level >= 25 },
];

/** Returns all titles the user has earned, in award order. */
export function earnedTitles(input: Parameters<TitleDef["check"]>[0]): TitleDef[] {
  return TITLES.filter((t) => t.check(input));
}

/** The user's currently-displayed title = the most recent earned (last in the list). */
export function activeTitle(input: Parameters<TitleDef["check"]>[0]): TitleDef | undefined {
  const earned = earnedTitles(input);
  return earned[earned.length - 1];
}

// ═══════════════════════════════════════════
// HARMONY MULTIPLIER — rewards balanced pillars
// ═══════════════════════════════════════════

export function getHarmonyMultiplier(pillars: Record<string, { xp: number }>): number {
  const values = Object.values(pillars).map((p) => p.xp);
  if (values.length <= 1) return 1.0;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max === 0) return 1.0;
  const ratio = min / max;
  if (ratio >= 0.85) return 1.2;
  if (ratio <= 0.5) return 0.85;
  return 1.0;
}

export function getDominantPillar(pillars: Record<string, { xp: number }>): string | null {
  const entries = Object.entries(pillars);
  if (entries.length === 0) return null;
  let dominant = entries[0][0];
  let maxXp = entries[0][1].xp;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1].xp > maxXp) {
      maxXp = entries[i][1].xp;
      dominant = entries[i][0];
    }
  }
  return dominant;
}

// ═══════════════════════════════════════════
// DOMAIN UNLOCK GATING
// ═══════════════════════════════════════════

/**
 * Checks whether the player qualifies to unlock a domain slot.
 * Slots 1–3 are always free. Slots 4–6 are gated.
 */
export function canUnlockSlot(
  slot: number,
  playerLevel: number,
  streakDays: number,
  maxPillarLevel: number
): { unlocked: boolean; reason?: string } {
  if (slot === 4) {
    if (playerLevel >= 10 && streakDays >= 7) return { unlocked: true };
    return {
      unlocked: false,
      reason: `Reach Level 10 and a 7-day streak. (Current: Level ${playerLevel}, ${streakDays}-day streak)`
    };
  }
  if (slot === 5) {
    if (playerLevel >= 25 && streakDays >= 14) return { unlocked: true };
    return {
      unlocked: false,
      reason: `Reach Level 25 and a 14-day streak. (Current: Level ${playerLevel}, ${streakDays}-day streak)`
    };
  }
  if (slot === 6) {
    if (playerLevel >= 50 && streakDays >= 30 && maxPillarLevel >= 5) return { unlocked: true };
    return {
      unlocked: false,
      reason: `Reach Level 50, a 30-day streak, and Pillar Level 5. (Current: Level ${playerLevel}, ${streakDays}-day streak, max pillar level ${maxPillarLevel})`
    };
  }
  return { unlocked: true };
}

/** Ceremony messages triggered when a domain slot is unlocked. */
export function getUnlockCeremonyMessage(slot: number): string | null {
  switch (slot) {
    case 4: return "THE SYSTEM HAS DETECTED CAPACITY FOR GROWTH. FIRST EXPANSION UNLOCKED.";
    case 5: return "THE SECOND SEAM IS FORGED. YOUR VESSEL EXPANDS.";
    case 6: return "FULL VESSEL ACHIEVED. THE SYSTEM RECOGNISES YOUR DESIGN.";
    default: return null;
  }
}

// ═══════════════════════════════════════════
// QUICK-ADD PARSER — rule-based, no AI
// ═══════════════════════════════════════════

/** Parsed result from a quick-add string like "Gym 6pm 45m !!" */
export interface QuickAddParsed {
  title: string;
  scheduledTime?: string; // HH:MM
  durationMin?: number;
  priority?: "low" | "med" | "high";
}

/**
 * Rule-based natural-language parser for task quick-add.
 * Pulls time (6pm / 18:00), duration (45m / 1h), priority (! / !! ).
 * Everything else becomes the title.
 */
export function parseQuickAdd(raw: string): QuickAddParsed {
  let text = raw.trim();
  let scheduledTime: string | undefined;
  let durationMin: number | undefined;
  let priority: "low" | "med" | "high" | undefined;

  // Priority: !! or ! at end
  const prioMatch = text.match(/!!+\s*$/);
  if (prioMatch) {
    priority = prioMatch[0].length >= 3 ? "high" : "med";
    text = text.slice(0, prioMatch.index).trim();
  }

  // Duration: e.g. 45m, 1h, 1.5h, 90min
  const durMatch = text.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours?|m|min|mins|minutes?)\s*$/i);
  if (durMatch) {
    const val = parseFloat(durMatch[1]);
    const unit = durMatch[2].toLowerCase();
    durationMin = unit.startsWith("h") ? Math.round(val * 60) : Math.round(val);
    text = text.slice(0, durMatch.index).trim();
  }

  // Time: e.g. 6pm, 18:00, 6:30pm, 6am
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?\s*$/i,
    /(\d{1,2})\s*(am|pm)\s*$/i,
    /at\s+(\d{1,2})\s*(am|pm)\s*$/i,
  ];
  for (const pat of timePatterns) {
    const m = text.match(pat);
    if (m) {
      let hour = parseInt(m[1]);
      const min = m[2] && m[2].length === 2 ? parseInt(m[2]) : 0;
      const ampm = (m[2] || m[3] || "").toLowerCase();
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
      scheduledTime = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      text = text.slice(0, m.index).trim();
      break;
    }
  }

  // Clean title
  text = text.replace(/[,;.]+$/, "").trim();
  if (!text) text = "Untitled quest";

  return { title: text, scheduledTime, durationMin, priority };
}

// ═══════════════════════════════════════════
// NON-NEGOTIABLE DAILY QUESTS — auto-regenerating must-do rituals
// ═══════════════════════════════════════════

/** Themed starter names for non-negotiable quests — users can pick or write their own */
export const NON_NEGOTIABLE_STARTERS: Record<string, string[]> = {
  health: ["Iron Body Ritual", "Move or Rust", "Feed the Machine"],
  mental: ["Stillness Protocol", "Mind Anchor", "Clear the Static"],
  productivity: ["Deep Work Block", "Eat the Frog", "Ship Something"],
  finance: ["Check the Vault", "Track the Gold", "No-Spend Guard"],
  relationships: ["Signal Boost", "Check the Flare", "Anchor Call"],
  learning: ["Daily Download", "Skill Grind", "Read the Scroll"],
  faith: ["First Light", "Sacred Pause", "Evening Vespers"],
  creativity: ["Daily Create", "Bleed Ink", "Make Something Ugly"],
  career: ["Level Up Move", "Network Ping", "Side Quest Hour"],
};

/**
 * Generates fresh Quest instances from non-negotiable templates for a given date.
 * Each instance gets a unique ID: `nn_{templateId}_{YYYYMMDD}`.
 */
export function generateDailyNonNegotiables(
  templates: NonNegotiableTemplate[],
  dateString: string, // YYYY-MM-DD
): Quest[] {
  const dateSuffix = dateString.replace(/-/g, "");
  return templates.map((t) => ({
    id: `nn_${t.id}_${dateSuffix}`,
    title: t.title,
    description: t.description,
    pillar: t.pillar,
    xpReward: t.xpReward,
    completed: false,
    type: "daily" as const,
    isNonNegotiable: true,
    priority: t.priority,
    scheduledTime: t.scheduledTime,
    durationMin: t.durationMin,
  }));
}

/**
 * Splits quests into non-negotiable vs. everything else.
 * Non-negotiables have IDs matching `nn_*_YYYYMMDD`.
 */
export function partitionNonNegotiables(quests: Quest[], todaySuffix: string): {
  nonNegotiables: Quest[];
  rest: Quest[];
} {
  const nonNegotiables: Quest[] = [];
  const rest: Quest[] = [];
  for (const q of quests) {
    if (q.isNonNegotiable || q.id.startsWith("nn_")) {
      nonNegotiables.push(q);
    } else {
      rest.push(q);
    }
  }
  return { nonNegotiables, rest };
}

/**
 * Reconciles daily non-negotiables: removes stale (non-today) NN quests
 * and generates fresh ones for today from templates.
 * Returns the merged quest list: [fresh NN quests, ...other quests].
 */
export function reconcileDailyNonNegotiables(
  existingQuests: Quest[],
  templates: NonNegotiableTemplate[],
  todayString: string,
): Quest[] {
  const todaySuffix = todayString.replace(/-/g, "");
  const nnPrefix = `nn_`;

  // Remove ALL existing non-negotiable quests (yesterday's + today's stale)
  const nonNN = existingQuests.filter(
    (q) => !q.isNonNegotiable && !q.id.startsWith(nnPrefix),
  );

  // Generate today's fresh non-negotiables
  const freshNN = generateDailyNonNegotiables(templates, todayString);

  return [...freshNN, ...nonNN];
}

/**
 * Creates a new NonNegotiableTemplate from a quest-like shape.
 */
export function createNonNegotiableTemplate(
  overrides: Partial<NonNegotiableTemplate> & { title: string; pillar: string },
): NonNegotiableTemplate {
  const now = new Date().toISOString();
  return {
    id: `nnt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title,
    description: overrides.description ?? "",
    pillar: overrides.pillar,
    xpReward: overrides.xpReward ?? 20,
    priority: overrides.priority,
    scheduledTime: overrides.scheduledTime,
    durationMin: overrides.durationMin,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}
