/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useCloudSync — Supabase two-way merge, realtime subscriptions, sync helper.
 * Extracted from App.tsx Step 2.
 */

import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  fetchProfile,
  upsertProfile,
  fetchDailyLog,
  upsertDailyLog,
  subscribeToProfile,
  subscribeToDailyLog,
} from "../supabase";
import { UserProfile, DailyLog, Quest } from "../types";
import {
  createDefaultProfile,
  createEmptyDailyLog,
} from "../data";

interface UseCloudSyncInput {
  currentUser: User | null;
  offlineMode: boolean;
  todayString: string;
  setProfile: (p: UserProfile) => void;
  setTodayLog: (l: DailyLog) => void;
  setQuests: (updater: (prev: Quest[]) => Quest[]) => void;
}

export function useCloudSync({
  currentUser,
  offlineMode,
  todayString,
  setProfile,
  setTodayLog,
  setQuests,
}: UseCloudSyncInput) {
  // ── Two-way Supabase merge + realtime subscriptions ──
  useEffect(() => {
    if (!currentUser || offlineMode) return;
    const uid = currentUser.id;
    let cleanupFns: (() => void)[] = [];
    let cancelled = false;

    const ensureDocsExist = async () => {
      const timeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
        Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

      const [cloudProfile, cloudLog] = await Promise.all([
        timeout(fetchProfile(uid), 8000),
        timeout(fetchDailyLog(uid, todayString), 8000),
      ]);

      const storedProfileStr = localStorage.getItem("projectff_profile");
      const storedLogStr = localStorage.getItem(
        `projectff_log_${todayString}`,
      );

      let profileToSave: UserProfile;
      let profileNeedsUpsert = false;
      if (!cloudProfile) {
        if (storedProfileStr) {
          const parsed = JSON.parse(storedProfileStr);
          parsed.uid = uid;
          parsed.email = currentUser.email || "";
          parsed.displayName =
            currentUser.user_metadata?.full_name || "User";
          profileToSave = parsed;
        } else {
          profileToSave = createDefaultProfile(
            uid,
            currentUser.email || "",
            currentUser.user_metadata?.full_name || "User",
          );
        }
        profileNeedsUpsert = true;
      } else {
        if (storedProfileStr) {
          const parsedLocal = JSON.parse(storedProfileStr);
          if ((parsedLocal.xp || 0) > (cloudProfile.xp || 0)) {
            parsedLocal.uid = uid;
            parsedLocal.email = currentUser.email || "";
            parsedLocal.displayName =
              currentUser.user_metadata?.full_name || "User";
            profileToSave = parsedLocal;
            profileNeedsUpsert = true;
          } else {
            profileToSave = cloudProfile;
          }
        } else {
          profileToSave = cloudProfile;
        }
      }

      let logToSave: DailyLog;
      let logNeedsUpsert = false;
      if (!cloudLog) {
        if (storedLogStr) {
          logToSave = JSON.parse(storedLogStr);
          logToSave.userId = uid;
        } else {
          logToSave = createEmptyDailyLog(uid, todayString);
        }
        logNeedsUpsert = true;
      } else {
        if (storedLogStr) {
          const parsedLocalLog = JSON.parse(storedLogStr);
          const mergedTasks = {
            ...cloudLog.completedTasks,
            ...parsedLocalLog.completedTasks,
          };
          logToSave = {
            ...cloudLog,
            ...parsedLocalLog,
            completedTasks: mergedTasks,
            userId: uid,
          };
          logNeedsUpsert = true;
        } else {
          logToSave = cloudLog;
        }
      }

      setProfile(profileToSave);
      setTodayLog(logToSave);
      localStorage.setItem(
        "projectff_profile",
        JSON.stringify(profileToSave),
      );
      localStorage.setItem(
        `projectff_log_${todayString}`,
        JSON.stringify(logToSave),
      );

      const writes: Promise<void>[] = [];
      if (profileNeedsUpsert) writes.push(upsertProfile(profileToSave));
      if (logNeedsUpsert) writes.push(upsertDailyLog(logToSave));
      if (writes.length) await Promise.all(writes);
    };

    ensureDocsExist()
      .then(() => {
        if (cancelled) return;

        const unsubProfile = subscribeToProfile(uid, (cloudData) => {
          if (cloudData) {
            setProfile(cloudData);
            localStorage.setItem("projectff_profile", JSON.stringify(cloudData));
          }
        });

        const unsubLog = subscribeToDailyLog(uid, todayString, (data) => {
          if (data) {
            setTodayLog(data);
            localStorage.setItem(
              `projectff_log_${todayString}`,
              JSON.stringify(data),
            );
            setQuests((prev) =>
              prev.map((q) => ({
                ...q,
                completed: data.completedTasks[q.id] || false,
              })),
            );
          }
        });

        cleanupFns.push(unsubProfile, unsubLog);
      })
      .catch((err) => {
        console.error("Supabase sync error:", err);
        if (cancelled) return;
        const fallbackProfile = createDefaultProfile(
          uid,
          currentUser.email || "",
          currentUser.user_metadata?.full_name || "User",
        );
        const fallbackLog = createEmptyDailyLog(uid, todayString);
        setProfile(fallbackProfile);
        setTodayLog(fallbackLog);
        localStorage.setItem("projectff_profile", JSON.stringify(fallbackProfile));
        localStorage.setItem(`projectff_log_${todayString}`, JSON.stringify(fallbackLog));
      });

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, offlineMode]);

  // ── Persist profile + log to localStorage and Supabase ──
  const syncProfileAndLog = async (
    updatedProfile: UserProfile,
    updatedLog: DailyLog,
  ) => {
    localStorage.setItem("projectff_profile", JSON.stringify(updatedProfile));
    localStorage.setItem(
      `projectff_log_${todayString}`,
      JSON.stringify(updatedLog),
    );
    setProfile(updatedProfile);
    setTodayLog(updatedLog);

    if (!offlineMode && currentUser) {
      try {
        await Promise.all([
          upsertProfile(updatedProfile),
          upsertDailyLog(updatedLog),
        ]);
      } catch (err) {
        console.error("Supabase sync failed:", err);
      }
    }
  };

  return { syncProfileAndLog };
}
