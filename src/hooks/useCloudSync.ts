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

    const ensureDocsExist = async () => {
      try {
        const cloudProfile = await fetchProfile(uid);
        const cloudLog = await fetchDailyLog(uid, todayString);

        const storedProfileStr = localStorage.getItem("projectff_profile");
        const storedLogStr = localStorage.getItem(
          `projectff_log_${todayString}`,
        );

        let profileToSave: UserProfile;
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
          await upsertProfile(profileToSave);
        } else {
          if (storedProfileStr) {
            const parsedLocal = JSON.parse(storedProfileStr);
            if ((parsedLocal.xp || 0) > (cloudProfile.xp || 0)) {
              parsedLocal.uid = uid;
              parsedLocal.email = currentUser.email || "";
              parsedLocal.displayName =
                currentUser.user_metadata?.full_name || "User";
              profileToSave = parsedLocal;
              await upsertProfile(profileToSave);
            } else {
              profileToSave = cloudProfile;
            }
          } else {
            profileToSave = cloudProfile;
          }
        }

        let logToSave: DailyLog;
        if (!cloudLog) {
          if (storedLogStr) {
            logToSave = JSON.parse(storedLogStr);
            logToSave.userId = uid;
            await upsertDailyLog(logToSave);
          } else {
            logToSave = createEmptyDailyLog(uid, todayString);
            await upsertDailyLog(logToSave);
          }
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
            await upsertDailyLog(logToSave);
          } else {
            logToSave = cloudLog;
          }
        }

        localStorage.setItem(
          "projectff_profile",
          JSON.stringify(profileToSave),
        );
        localStorage.setItem(
          `projectff_log_${todayString}`,
          JSON.stringify(logToSave),
        );
      } catch (error) {
        console.error("Supabase sync error:", error);
      }
    };

    ensureDocsExist()
      .then(() => {
        const unsubProfile = subscribeToProfile(uid, (cloudData) => {
          if (cloudData) {
            setProfile(cloudData);
            localStorage.setItem(
              "projectff_profile",
              JSON.stringify(cloudData),
            );
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

        return () => {
          unsubProfile();
          unsubLog();
        };
      })
      .catch((err) => console.error("Initialization failed:", err));
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
        await upsertProfile(updatedProfile);
        await upsertDailyLog(updatedLog);
      } catch (err) {
        console.error("Supabase sync failed:", err);
      }
    }
  };

  return { syncProfileAndLog };
}
