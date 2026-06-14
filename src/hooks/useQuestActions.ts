/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useQuestActions — quest toggle (XP/streak/achievement/level-up) + quick-add.
 * Extracted from App.tsx Step 3.
 */

import { useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile, DailyLog, Quest, GameMode } from "../types";
import { haptic } from "../haptics";
import { registerCompletion, StreakEvent } from "../streak";
import { parseQuickAdd } from "../data";
import type { StreakToast, LevelUpPayload } from "./useGameState";

interface UseQuestActionsInput {
  profile: UserProfile | null;
  todayLog: DailyLog | null;
  quests: Quest[];
  todayString: string;
  setProfile: (p: UserProfile) => void;
  setTodayLog: (l: DailyLog) => void;
  setQuests: (q: Quest[]) => void;
  setStreakEvent: (s: StreakToast | null) => void;
  setLevelUpData: (l: LevelUpPayload | null) => void;
  syncProfileAndLog: (profile: UserProfile, log: DailyLog) => Promise<void>;
}

export function useQuestActions({
  profile,
  todayLog,
  quests,
  todayString,
  setProfile,
  setTodayLog,
  setQuests,
  setStreakEvent,
  setLevelUpData,
  syncProfileAndLog,
}: UseQuestActionsInput) {
  // ── Quest toggle with level-up detection ──
  const handleToggleQuest = (questId: string) => {
    if (!profile || !todayLog) return;
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    const isMarkedDone = !targetQuest.completed;
    const xpDifference = isMarkedDone
      ? targetQuest.xpReward
      : -targetQuest.xpReward;

    const updatedCompletedTasks = {
      ...todayLog.completedTasks,
      [questId]: isMarkedDone,
    };
    const nextLog: DailyLog = {
      ...todayLog,
      completedTasks: updatedCompletedTasks,
    };

    const pillarKey = targetQuest.pillar;
    const nextProfile = { ...profile };
    const currentPillarStats = nextProfile.pillars[pillarKey];
    if (!currentPillarStats) {
      nextProfile.pillars[pillarKey] = {
        level: 1,
        xp: 0,
        streak: 0,
        weight: 10,
      };
    }
    const pStats = nextProfile.pillars[pillarKey];
    const newPillarXp = Math.max(0, pStats.xp + xpDifference);
    const newPillarLvl = Math.floor(newPillarXp / 100) + 1;

    // Weighted overall XP: pillar XP * (pillar weight / 100)
    const weightMultiplier = (pStats.weight || 10) / 100;
    const overallXpDelta = Math.round(xpDifference * weightMultiplier);
    const oldLevel = nextProfile.level;
    nextProfile.xp = Math.max(0, nextProfile.xp + overallXpDelta);
    nextProfile.level = Math.floor(nextProfile.xp / 100) + 1;

    // ── Kintsugi streak engine (gamemode-aware) ──
    if (isMarkedDone) {
      const gameMode: GameMode =
        (profile.questionnaire?.gameMode as GameMode) || "momentum";
      const result = registerCompletion(pStats, gameMode, todayString);
      nextProfile.pillars[pillarKey] = {
        level: newPillarLvl,
        xp: newPillarXp,
        streak: result.streak,
        weight: pStats.weight,
        lastActiveDate: result.lastActiveDate,
        freezes: result.freezes,
        seams: result.seams,
        longestStreak: result.longestStreak,
      };
      if (result.event !== "same-day") {
        setStreakEvent({ event: result.event, pillar: pillarKey });
      }
    } else {
      // Undo — leave streak / freezes / seams untouched
      nextProfile.pillars[pillarKey] = {
        level: newPillarLvl,
        xp: newPillarXp,
        streak: pStats.streak,
        weight: pStats.weight,
        lastActiveDate: pStats.lastActiveDate,
        freezes: pStats.freezes,
        seams: pStats.seams,
        longestStreak: pStats.longestStreak,
      };
    }

    // Check achievements
    const updatedAchievements = [...nextProfile.achievements];
    if (isMarkedDone && !updatedAchievements.includes("first_steps")) {
      updatedAchievements.push("first_steps");
      nextProfile.xp += 10;
    }
    if (
      nextProfile.level > 1 &&
      !updatedAchievements.includes("general_first_level")
    ) {
      updatedAchievements.push("general_first_level");
      nextProfile.xp += 50;
    }
    const updatedStreak = nextProfile.pillars[pillarKey].streak;
    if (
      updatedStreak >= 7 &&
      !updatedAchievements.includes(`streak_7_${pillarKey}`)
    ) {
      updatedAchievements.push(`streak_7_${pillarKey}`);
      nextProfile.xp += 75;
    }
    if (
      updatedStreak >= 30 &&
      !updatedAchievements.includes(`streak_30_${pillarKey}`)
    ) {
      updatedAchievements.push(`streak_30_${pillarKey}`);
      nextProfile.xp += 200;
    }
    if (
      newPillarLvl >= 5 &&
      !updatedAchievements.includes(`level_5_${pillarKey}`)
    ) {
      updatedAchievements.push(`level_5_${pillarKey}`);
      nextProfile.xp += 100;
    }
    nextProfile.achievements = updatedAchievements;
    nextProfile.updatedAt = new Date().toISOString();

    // Detect level-up
    const newLevel = Math.floor(nextProfile.xp / 100) + 1;
    if (newLevel > oldLevel) {
      nextProfile.levelUpHistory = [
        ...(nextProfile.levelUpHistory || []),
        {
          fromLevel: oldLevel,
          toLevel: newLevel,
          date: new Date().toISOString(),
        },
      ];
      setLevelUpData({ fromLevel: oldLevel, toLevel: newLevel });
    }

    // Update quests
    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, completed: isMarkedDone } : q,
    );
    setQuests(updatedQuests);
    localStorage.setItem("projectff_quests", JSON.stringify(updatedQuests));

    syncProfileAndLog(nextProfile, nextLog);
  };

  // ── Quick-add from CaptureSheet ──
  const handleQuickAdd = useCallback(
    (raw: string) => {
      if (!profile) return;
      const parsed = parseQuickAdd(raw);
      const pid = Object.keys(profile.pillars)[0] || "health";
      const newQuest: Quest = {
        id: `quick_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: parsed.title,
        description: "",
        pillar: pid,
        xpReward: 15,
        completed: false,
        type: "daily",
        priority: parsed.priority,
        scheduledTime: parsed.scheduledTime,
        durationMin: parsed.durationMin,
      };
      const updated = [...quests, newQuest];
      setQuests(updated);
      localStorage.setItem("projectff_quests", JSON.stringify(updated));
    },
    [profile, quests, setQuests],
  );

  return { handleToggleQuest, handleQuickAdd };
}
