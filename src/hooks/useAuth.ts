/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useAuth — auth lifecycle, Google login/logout, offline mode, connection probe.
 * Extracted from App.tsx Step 2.
 */

import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  logoutUser,
  loginWithGoogle,
} from "../supabase";
import { UserProfile, DailyLog, Quest } from "../types";
import {
  createDefaultProfile,
  createEmptyDailyLog,
} from "../data";

interface UseAuthInput {
  setCurrentUser: (u: User | null) => void;
  setAuthLoading: (v: boolean) => void;
  setOfflineMode: (v: boolean) => void;
  setProfile: (p: UserProfile | null) => void;
  setTodayLog: (l: DailyLog | null) => void;
  setQuests: (q: Quest[]) => void;
  todayString: string;
}

export function useAuth({
  setCurrentUser,
  setAuthLoading,
  setOfflineMode,
  setProfile,
  setTodayLog,
  setQuests,
  todayString,
}: UseAuthInput) {
  // ── Connection validation — ping Supabase ──
  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);
        if (!error) {
          // connectionTested is handled via the caller, but the probe still runs
        }
      } catch (err) {
        console.warn("Supabase appears offline.", err);
      }
    }
    testConnection();
  }, []);

  // ── Load offline data from localStorage ──
  const loadOfflineData = () => {
    const storedProfile = localStorage.getItem("projectff_profile");
    let localProfile: UserProfile;
    if (storedProfile) {
      localProfile = JSON.parse(storedProfile);
    } else {
      localProfile = createDefaultProfile("offline-user", "", "User (Offline)");
      localStorage.setItem("projectff_profile", JSON.stringify(localProfile));
    }
    setProfile(localProfile);

    const storedLog = localStorage.getItem(`projectff_log_${todayString}`);
    let localLog: DailyLog;
    if (storedLog) {
      localLog = JSON.parse(storedLog);
    } else {
      localLog = createEmptyDailyLog("offline-user", todayString);
      localStorage.setItem(
        `projectff_log_${todayString}`,
        JSON.stringify(localLog),
      );
    }
    setTodayLog(localLog);

    const storedQuests = localStorage.getItem("projectff_quests");
    if (storedQuests) {
      const parsed: Quest[] = JSON.parse(storedQuests);
      setQuests(
        parsed.map((q) => ({
          ...q,
          completed: localLog.completedTasks[q.id] || false,
        })),
      );
    }
  };

  // ── Auth state listener (single source of truth) ──
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setOfflineMode(false);
        localStorage.setItem("projectff_offline", "false");
      } else {
        setCurrentUser(null);
        const offlineFlag =
          localStorage.getItem("projectff_offline") === "true";
        setOfflineMode(offlineFlag);
        if (offlineFlag) loadOfflineData();
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──
  const handleContinueOffline = () => {
    localStorage.setItem("projectff_offline", "true");
    setOfflineMode(true);
    loadOfflineData();
  };

  const handleGoogleLogin = async () => {
    try {
      // signInWithOAuth redirects to Google; user is set via onAuthStateChange
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("projectff_offline");
    localStorage.removeItem("projectff_profile");
    localStorage.removeItem(`projectff_log_${todayString}`);
    setOfflineMode(false);
    setProfile(null);
    setTodayLog(null);
    await logoutUser();
  };

  return {
    handleContinueOffline,
    handleGoogleLogin,
    handleLogout,
    loadOfflineData,
  };
}
