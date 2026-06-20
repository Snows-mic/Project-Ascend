/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Kintsugi streak engine — gamemode-aware streak progression and recovery.
 *
 * Design: every streak change happens at completion time (action-driven), never
 * on load. This keeps it free of realtime-sync ping-pong. When a user returns
 * after missing days, the gap is evaluated at the moment of their next
 * completion and the gamemode's recovery rule is applied — which is exactly the
 * "coming back" moment Kintsugi is built to celebrate.
 *
 * Recovery by mode:
 *  - drift:     streak never breaks (missed days are rest days)
 *  - momentum:  spend a banked freeze if available, else break (record a seam)
 *  - forge:     spend a freeze if available, else keep 50% (record a seam)
 *  - ascendant: no safety net — reset to 1; every comeback leaves a gold seam
 *
 * Freezes accrue at each 7-day milestone for momentum & forge (cap 2);
 * momentum also starts with one.
 */

import { GameMode } from "./types";

export interface StreakState {
  streak: number;
  lastActiveDate: string;
  freezes: number;
  seams: number;
  longestStreak: number;
}

export type StreakEvent =
  | "started"
  | "same-day"
  | "extended"
  | "saved"
  | "recovered"
  | "reset";

/** Loose input — any subset of streak fields (e.g. an existing PillarStats). */
export interface StreakInput {
  streak?: number;
  lastActiveDate?: string;
  freezes?: number;
  seams?: number;
  longestStreak?: number;
}

const MS_PER_DAY = 86_400_000;
const FREEZE_CAP = 2;

/** Whole-day gap between two YYYY-MM-DD dates (UTC). */
function dayGap(fromDate: string, toDate: string): number {
  const a = Date.parse(`${fromDate}T00:00:00Z`);
  const b = Date.parse(`${toDate}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  return Math.round((b - a) / MS_PER_DAY);
}

function startingFreezes(mode: GameMode): number {
  return mode === "momentum" ? 1 : 0;
}

function done(
  state: StreakState,
  event: StreakEvent,
): StreakState & { event: StreakEvent } {
  return {
    ...state,
    longestStreak: Math.max(state.longestStreak, state.streak),
    event,
  };
}

/**
 * Register a quest completion on `today` and return the new streak state,
 * applying the gamemode's recovery rule if days were missed.
 */
export function registerCompletion(
  prev: StreakInput,
  mode: GameMode,
  today: string,
): StreakState & { event: StreakEvent } {
  const streak = prev.streak ?? 0;
  const freezes = prev.freezes ?? 0;
  const seams = prev.seams ?? 0;
  const longestStreak = prev.longestStreak ?? streak;
  const last = prev.lastActiveDate;

  // First completion ever in this pillar.
  if (!last) {
    return done(
      {
        streak: 1,
        lastActiveDate: today,
        freezes: startingFreezes(mode),
        seams,
        longestStreak: Math.max(longestStreak, 1),
      },
      "started",
    );
  }

  const gap = dayGap(last, today);

  // Already completed something today (or clock skew) — no streak change.
  if (gap <= 0) {
    return done(
      {
        streak: Math.max(streak, 1),
        lastActiveDate: last,
        freezes,
        seams,
        longestStreak,
      },
      "same-day",
    );
  }

  // Consecutive day — extend, accruing a freeze on each 7-day milestone.
  if (gap === 1) {
    const next = streak + 1;
    let nextFreezes = freezes;
    if ((mode === "momentum" || mode === "forge") && next % 7 === 0) {
      nextFreezes = Math.min(freezes + 1, FREEZE_CAP);
    }
    return done(
      {
        streak: next,
        lastActiveDate: today,
        freezes: nextFreezes,
        seams,
        longestStreak,
      },
      "extended",
    );
  }

  // gap >= 2 → one or more days missed. Apply recovery per gamemode.
  switch (mode) {
    case "drift":
      return done(
        {
          streak: streak + 1,
          lastActiveDate: today,
          freezes,
          seams,
          longestStreak,
        },
        "extended",
      );

    case "momentum":
      if (freezes > 0) {
        return done(
          {
            streak: streak + 1,
            lastActiveDate: today,
            freezes: freezes - 1,
            seams,
            longestStreak,
          },
          "saved",
        );
      }
      return done(
        {
          streak: 1,
          lastActiveDate: today,
          freezes,
          seams: seams + 1,
          longestStreak,
        },
        "reset",
      );

    case "forge":
      if (freezes > 0) {
        return done(
          {
            streak: streak + 1,
            lastActiveDate: today,
            freezes: freezes - 1,
            seams,
            longestStreak,
          },
          "saved",
        );
      }
      return done(
        {
          streak: Math.max(1, Math.floor(streak / 2)),
          lastActiveDate: today,
          freezes,
          seams: seams + 1,
          longestStreak,
        },
        "recovered",
      );

    case "ascendant":
    default:
      return done(
        {
          streak: 1,
          lastActiveDate: today,
          freezes,
          seams: seams + 1,
          longestStreak,
        },
        "reset",
      );
  }
}
