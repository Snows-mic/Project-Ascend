/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useGameState — single source of truth for all app-level state.
 * Extracted from App.tsx to cut the 1006-line god component down to composition.
 */

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile, DailyLog, Quest, Achievement, NonNegotiableTemplate } from "../types";
import type { StreakEvent } from "../streak";

const todayString = new Date().toISOString().slice(0, 10);

// ── localStorage hydrators ──
function loadFromLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export type AppTab =
  | "today"
  | "schedule"
  | "quests"
  | "journal"
  | "stats";

export interface LevelUpPayload {
  fromLevel: number;
  toLevel: number;
}

export interface StreakToast {
  event: StreakEvent;
  pillar: string;
}

export function useGameState() {
  // ── Auth ──
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [offlineMode, setOfflineMode] = useState<boolean>(
    () => localStorage.getItem("projectff_offline") === "true",
  );

  // ── Core data ──
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    loadFromLocal<UserProfile | null>("projectff_profile", null),
  );

  const [todayLog, setTodayLog] = useState<DailyLog | null>(() =>
    loadFromLocal<DailyLog | null>(`projectff_log_${todayString}`, null),
  );

  const [quests, setQuests] = useState<Quest[]>(() =>
    loadFromLocal<Quest[]>("projectff_quests", []),
  );

  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    loadFromLocal<Achievement[]>("projectff_achievements", []),
  );

  const [nonNegotiableTemplates, setNonNegotiableTemplates] = useState<NonNegotiableTemplate[]>(() =>
    loadFromLocal<NonNegotiableTemplate[]>("projectff_nntemplates", []),
  );

  // ── UI ──
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [connectionTested, setConnectionTested] = useState(false);
  const [openCapture, setOpenCapture] = useState(false);

  // ── Feedback ──
  const [levelUpData, setLevelUpData] = useState<LevelUpPayload | null>(null);
  const [streakEvent, setStreakEvent] = useState<StreakToast | null>(null);

  return {
    // auth
    currentUser,
    setCurrentUser,
    authLoading,
    setAuthLoading,
    offlineMode,
    setOfflineMode,

    // core
    profile,
    setProfile,
    todayLog,
    setTodayLog,
    quests,
    setQuests,
    achievements,
    setAchievements,
    nonNegotiableTemplates,
    setNonNegotiableTemplates,

    // ui
    activeTab,
    setActiveTab,
    connectionTested,
    setConnectionTested,
    openCapture,
    setOpenCapture,

    // feedback
    levelUpData,
    setLevelUpData,
    streakEvent,
    setStreakEvent,

    // constants
    todayString,
  };
}
