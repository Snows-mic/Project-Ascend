/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useJournalActions — onboarding, journal, pillar weight/log, streak toast.
 * Extracted from App.tsx Step 3.
 */

import { useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { upsertProfile, upsertDailyLog } from "../supabase";
import { UserProfile, DailyLog, Quest, Achievement, QuestionnaireAnswers } from "../types";
import { generateAchievements } from "../data";
import type { StreakToast, LevelUpPayload } from "./useGameState";

interface UseJournalActionsInput {
  profile: UserProfile | null;
  todayLog: DailyLog | null;
  offlineMode: boolean;
  currentUser: User | null;
  todayString: string;
  streakEvent: StreakToast | null;
  setProfile: (p: UserProfile) => void;
  setTodayLog: (l: DailyLog) => void;
  setQuests: (q: any[]) => void;
  setAchievements: (a: Achievement[]) => void;
  setStreakEvent: (s: StreakToast | null) => void;
  setLevelUpData: (l: LevelUpPayload | null) => void;
  syncProfileAndLog: (profile: UserProfile, log: DailyLog) => Promise<void>;
}

export function useJournalActions({
  profile,
  todayLog,
  offlineMode,
  currentUser,
  todayString,
  streakEvent,
  setProfile,
  setTodayLog,
  setQuests,
  setAchievements,
  setStreakEvent,
  setLevelUpData,
  syncProfileAndLog,
}: UseJournalActionsInput) {
  // ── Auto-dismiss streak toast after 3s ──
  useEffect(() => {
    if (!streakEvent) return;
    const t = setTimeout(() => setStreakEvent(null), 3000);
    return () => clearTimeout(t);
  }, [streakEvent, setStreakEvent]);

  // ── Onboarding completion ──
  const handleOnboardingComplete = useCallback(
    async (
      pillarIds: string[],
      weights: Record<string, number>,
      questionnaire: QuestionnaireAnswers,
      opts?: { seedFirstQuest?: boolean; customQuests?: Quest[]; systemName?: string },
    ) => {
      if (!profile) return;
      const pillars: Record<
        string,
        { level: number; xp: number; streak: number; weight: number }
      > = {};
      for (const pid of pillarIds) {
        pillars[pid] = {
          level: 1,
          xp: 0,
          streak: 0,
          weight: weights[pid] || 10,
        };
      }

      const newQuests: Quest[] = opts?.customQuests?.length ? opts.customQuests : [];
      const newAchievements = generateAchievements(pillarIds);

      const updatedProfile: UserProfile = {
        ...profile,
        pillars,
        onboardingComplete: true,
        questionnaire: questionnaire as any,
        ...(opts?.systemName ? { systemName: opts.systemName } : {}),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("projectff_profile", JSON.stringify(updatedProfile));
      localStorage.setItem("projectff_quests", JSON.stringify(newQuests));
      localStorage.setItem(
        "projectff_achievements",
        JSON.stringify(newAchievements),
      );
      setProfile(updatedProfile);
      setQuests(newQuests);
      setAchievements(newAchievements);

      if (!offlineMode && currentUser) {
        try {
          await upsertProfile(updatedProfile);
        } catch (err) {
          console.error("Supabase onboard sync failed:", err);
        }
      }
    },
    [profile, offlineMode, currentUser, setProfile, setQuests, setAchievements],
  );

  // ── Save note from CaptureSheet ──
  const handleSaveNote = useCallback(
    (text: string) => {
      if (!todayLog) return;
      const ts = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const line = `\u2022 ${text} — ${ts}`;
      const prev = todayLog.journalEntry || "";
      const nextLog = {
        ...todayLog,
        journalEntry: prev ? `${prev}\n${line}` : line,
      };
      setTodayLog(nextLog);
      localStorage.setItem(
        `projectff_log_${todayString}`,
        JSON.stringify(nextLog),
      );
      if (!offlineMode && currentUser) {
        upsertDailyLog(nextLog).catch(() => {});
      }
    },
    [todayLog, todayString, offlineMode, currentUser, setTodayLog],
  );

  // ── Pillar weight update (from PillarTracker) ──
  const handleUpdatePillarWeight = (pillarKey: string, newWeight: number) => {
    if (!profile || !todayLog) return;
    const nextProfile = { ...profile };
    const pStats = nextProfile.pillars[pillarKey];
    if (pStats) {
      nextProfile.pillars = {
        ...nextProfile.pillars,
        [pillarKey]: { ...pStats, weight: newWeight },
      };
      nextProfile.updatedAt = new Date().toISOString();
      syncProfileAndLog(nextProfile, todayLog);
    }
  };

  // ── Pillar log update (from PillarTracker) ──
  const handleUpdatePillarLog = (
    fields: Partial<DailyLog>,
    pillarKey: string,
    xpEarned: number,
  ) => {
    if (!profile || !todayLog) return;
    const nextLog = { ...todayLog, ...fields };
    const nextProfile = { ...profile };
    nextProfile.xp += xpEarned;
    const oldLevel = nextProfile.level;
    nextProfile.level = Math.floor(nextProfile.xp / 100) + 1;

    const pStats = nextProfile.pillars[pillarKey];
    if (pStats) {
      const newPillarXp = pStats.xp + xpEarned;
      const newPillarLvl = Math.floor(newPillarXp / 100) + 1;
      nextProfile.pillars[pillarKey] = {
        level: newPillarLvl,
        xp: newPillarXp,
        streak: pStats.streak === 0 ? 1 : pStats.streak,
        weight: pStats.weight,
      };
    }

    const newLevel = nextProfile.level;
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

    nextProfile.updatedAt = new Date().toISOString();
    syncProfileAndLog(nextProfile, nextLog);
  };

  return {
    handleOnboardingComplete,
    handleSaveNote,
    handleUpdatePillarWeight,
    handleUpdatePillarLog,
  };
}
