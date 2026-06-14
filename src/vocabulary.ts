/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * vocabulary — Simple ↔ Pro terminology toggle.
 *
 * Maps RPG terms to plain English equivalents so users who prefer
 * non-game language can switch. The toggle is stored in UserProfile.vocabularyMode.
 */

/** Maps "pro" terminology to simple English equivalents */
export const VOCABULARY_MAP: Record<string, { pro: string; simple: string }> = {
  // Levels & XP
  level:    { pro: "Level",         simple: "Milestone" },
  xp:       { pro: "XP",           simple: "Points" },
  rank:     { pro: "Rank",         simple: "Stage" },
  // Streaks
  streak:   { pro: "Streak",       simple: "Chain" },
  freeze:   { pro: "Freeze Token", simple: "Skip Day" },
  seam:     { pro: "Gold Seam",    simple: "Comeback" },
  // Quests
  quest:    { pro: "Quest",        simple: "Task" },
  bounty:   { pro: "Bounty",       simple: "Reward" },
  boss:     { pro: "Boss Fight",   simple: "Big Task" },
  // Gamemodes
  gamemode: { pro: "Gamemode",     simple: "Pace" },
  // Areas
  pillar:   { pro: "Pillar",       simple: "Area" },
  domain:   { pro: "Domain",       simple: "Focus" },
  tracker:  { pro: "Pillar Labs",  simple: "Progress" },
  // General
  kintsugi: { pro: "Kintsugi",     simple: "Gold Repair" },
  harmony:  { pro: "Harmony",      simple: "Balance" },
  attributes:{ pro: "Attributes",  simple: "Strengths" },
  raid:     { pro: "Focus Raid",   simple: "Deep Work" },
};

/** Resolve a term based on the user's vocabulary preference */
export function term(key: string, mode?: "simple" | "pro"): string {
  const entry = VOCABULARY_MAP[key];
  if (!entry) return key;
  return mode === "simple" ? entry.simple : entry.pro;
}
