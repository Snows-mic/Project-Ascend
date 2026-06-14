/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PillarStats {
  level: number;
  xp: number;
  streak: number;
  weight: number; // 0-100, editable by user; determines contribution to overall progress
  // --- Kintsugi streak engine (all optional → backward compatible) ---
  lastActiveDate?: string; // YYYY-MM-DD of the last day a quest was completed here
  freezes?: number; // banked streak-freezes (gamemode dependent)
  seams?: number; // Kintsugi gold seams — count of comebacks after a break
  longestStreak?: number; // best streak ever reached
}

/** Pillars are now dynamic — keyed by pillar ID string, not hardcoded names */
export type UserPillars = Record<string, PillarStats>;

export interface LevelUpEntry {
  fromLevel: number;
  toLevel: number;
  date: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  level: number;
  xp: number;
  pillars: UserPillars;
  achievements: string[];
  levelUpHistory: LevelUpEntry[];
  onboardingComplete: boolean;
  questionnaire?: QuestionnaireAnswers; // captured during onboarding (incl. gameMode)
  participation?: Record<string, number>; // questId → cumulative completions (drives bounties)
  // --- Journaling habit (optional → backward compatible) ---
  journalStreak?: number;
  journalLastDate?: string; // YYYY-MM-DD of last journal entry
  journalLongest?: number;
  // --- Deep Focus raids ---
  focusMinutes?: number; // lifetime focused minutes
  focusSessions?: number; // lifetime cleared raids
  nonNegotiableTemplates?: NonNegotiableTemplate[]; // auto-regenerating daily quest blueprints
  vocabularyMode?: "simple" | "pro"; // terminology preference (default: "pro")
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  userId: string;
  date: string; // YYYY-MM-DD
  completedTasks: Record<string, boolean>;
  pillarNotes: Record<string, string>; // per-pillar journal / reflection
  journalEntry: string; // evening reflection / freeform
  // --- Bookend ritual + structured journal (optional → backward compatible) ---
  morningIntention?: string; // "what would make today a win?"
  mood?: string; // emoji mood tag
  gratitude?: string;
  win?: string;
}

export type Priority = "low" | "med" | "high";

export interface Quest {
  id: string;
  title: string;
  description: string;
  pillar: string; // pillar ID (string key, not hardcoded union)
  xpReward: number;
  completed: boolean;
  type: "daily" | "weekly" | "milestone";
  isCoreHabit?: boolean;
  isBoss?: boolean; // user-defined Boss Fight — the thing you've been avoiding
  isNonNegotiable?: boolean; // auto-regenerates fresh every day — must be done
  // --- Planner fields (optional → backward compatible, localStorage-only) ---
  priority?: Priority;
  pinned?: boolean; // "Top 3 Today"
  scheduledTime?: string; // HH:MM time-block on the day timeline
  scheduledDate?: string; // YYYY-MM-DD; set = one-off on that date, unset = recurs daily
  durationMin?: number; // block length in minutes
  // --- Recurring task engine ---
  recurrence?: Recurrence; // how often this quest regenerates
  recurrenceId?: string; // stable ID linking instances to their recurrence template
}

export type Recurrence =
  | { type: "none" }
  | { type: "daily" }
  | { type: "weekly"; day: number } // 0=Sun..6=Sat
  | { type: "weekdays" }
  | { type: "interval"; everyDays: number };

/** Non-negotiable quest template — blueprint that auto-regenerates every day */
export interface NonNegotiableTemplate {
  id: string; // stable ID, e.g. "nnt_1700000000000_abc123"
  title: string;
  description: string;
  pillar: string;
  xpReward: number;
  priority?: Priority;
  scheduledTime?: string; // HH:MM
  durationMin?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PillarDefinition {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pillar: string;
  xpBonus: number;
}

/** The four gamemodes — each a distinct daily rhythm + XP + streak ruleset. */
export type GameMode = "drift" | "momentum" | "forge" | "ascendant";

export interface GameModeDef {
  id: GameMode;
  name: string; // "Drift"
  emoji: string; // 🌱
  tagline: string; // "Gentle re-entry"
  subtext: string; // one-line pitch shown on the card
  whatChanges: string; // plain explanation of the mechanical change
  hook: string; // punchy line revealed when selected
  dailyQuests: number; // required quests per day
  xpMultiplier: number; // applied to all XP gains
  xpLabel: string; // display form, e.g. "+25% XP"
  streakShort: string; // compact streak descriptor for the stat row
  streakRule: string; // full streak rule
  recovery: string; // recovery / forgiveness mechanic
  intendedFor: string; // the player this mode is for
  accent: string; // tailwind gradient classes for the badge
  recommended?: boolean;
}

export interface QuestionnaireAnswers {
  timePerDay: number; // minutes available per day
  gameMode: GameMode; // chosen difficulty path
  pillarGoals: Record<string, string>; // per-pillar goal (chip selection)
}
