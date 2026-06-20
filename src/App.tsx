/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StreakEvent } from "./streak";
import { haptic } from "./haptics";
import {
  requestNotificationPermission,
  hasNotificationPermission,
  scheduleReminder,
  NotifVoice,
} from "./notifications";
import { getDailyQuestCap, generateRepairQuests, createDefaultProfile } from "./data";
import type { Quest, DailyLog, UserProfile } from "./types";

// Components
import AuthScreen from "./components/AuthScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import Dashboard from "./components/Dashboard";
import ScheduleView from "./components/ScheduleView";
import PillarTracker from "./components/PillarTracker";
import QuestsAchievements from "./components/QuestsAchievements";
import CaptureSheet from "./components/CaptureSheet";
import LevelUpNotification from "./components/LevelUpNotification";
import XpBurst from "./components/XpBurst";
import SystemToast from "./components/SystemToast";
import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppTabNav from "./components/AppTabNav";
import AppRightRail from "./components/AppRightRail";
import WeeklyInsights from "./components/WeeklyInsights";
import BugReport from "./components/BugReport";
import TodayHub from "./components/TodayHub";
import JournalView from "./components/JournalView";
import RadarChart from "./components/RadarChart";
import SkillTree from "./components/SkillTree";
import HunterCard from "./components/HunterCard";
import FocusRaid from "./components/FocusRaid";
import { flushBugReports, upsertProfile } from "./supabase";

// Icons
import { Calendar, Award, Activity, Flame, Plus, Bug, Home, BookOpen, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGameState } from "./hooks/useGameState";
import type { AppTab } from "./hooks/useGameState";
import { useAuth } from "./hooks/useAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { useQuestActions } from "./hooks/useQuestActions";
import { useJournalActions } from "./hooks/useJournalActions";
import { useNonNegotiables } from "./hooks/useNonNegotiables";
import { useRecurringTasks, markMaterialised } from "./hooks/useRecurringTasks";
import { useEffect, useMemo, useState } from "react";

/** Whole-day gap between two YYYY-MM-DD dates (UTC). */
function dayGap(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 99;
  return Math.round((b - a) / 86_400_000);
}

const STREAK_MESSAGES: Record<StreakEvent, string> = {
  started: "🔥 First light. The streak begins.",
  "same-day": "",
  extended: "🔥 Streak extended! The chain grows.",
  saved: "❄️ Freeze token consumed — streak preserved.",
  recovered: "🪡 Comeback recorded. A gold seam is born.",
  reset: "💛 The Kintsugi way: break, repair, grow stronger.",
};

export default function App() {
  const {
    currentUser, setCurrentUser,
    authLoading, setAuthLoading,
    offlineMode, setOfflineMode,
    profile, setProfile,
    todayLog, setTodayLog,
    quests, setQuests,
    achievements, setAchievements,
    activeTab, setActiveTab,
    connectionTested, setConnectionTested,
    openCapture, setOpenCapture,
    levelUpData, setLevelUpData,
    streakEvent, setStreakEvent,
    nonNegotiableTemplates, setNonNegotiableTemplates,
    todayString,
  } = useGameState();

  // Bug-report modal (test-user feedback)
  const [bugOpen, setBugOpen] = useState(false);
  // Deep Focus raid overlay + Stats sub-view + Plan-tomorrow deep-link
  const [focusOpen, setFocusOpen] = useState(false);
  const [statsView, setStatsView] = useState<
    "overview" | "radar" | "skills" | "pillars" | "insights"
  >("overview");
  const [scheduleStartDate, setScheduleStartDate] = useState<string | undefined>(
    undefined,
  );
  // Deep-link from Today → Bounties section inside the Quests tab
  const [questsScrollTarget, setQuestsScrollTarget] = useState<string | null>(
    null,
  );
  const goToBounties = () => {
    setQuestsScrollTarget("bounties");
    setActiveTab("quests");
  };

  // Best-effort: flush any bug reports queued while offline, once on load.
  useEffect(() => {
    flushBugReports();
  }, []);

  // ── Auth lifecycle + offline/login/logout ──
  const {
    handleContinueOffline,
    handleGoogleLogin,
    handleLogout,
  } = useAuth({
    setCurrentUser,
    setAuthLoading,
    setOfflineMode,
    setProfile,
    setTodayLog,
    setQuests,
    todayString,
  });

  // ── Supabase cloud sync + realtime subscriptions ──
  const { syncProfileAndLog } = useCloudSync({
    currentUser,
    offlineMode,
    todayString,
    setProfile,
    setTodayLog,
    setQuests,
  });

  // ── Quest toggle + quick-add ──
  const { handleToggleQuest, handleQuickAdd } = useQuestActions({
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
  });

  // ── Non-negotiable daily quests (auto-regenerate) ──
  const {
    addNonNegotiable,
    editNonNegotiable,
    removeNonNegotiable,
    todayNonNegotiables,
    nnCompletedToday,
    nnTotalToday,
  } = useNonNegotiables({
    quests,
    nonNegotiableTemplates,
    todayString,
    setQuests,
    setNonNegotiableTemplates,
    onToggleQuest: handleToggleQuest,
  });

  // ── Recurring task engine ──
  const { pendingInstances } = useRecurringTasks(quests);
  // Merge pending instances into the quest list exactly once
  useEffect(() => {
    if (pendingInstances.length === 0) return;
    setQuests((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const trulyNew = pendingInstances.filter((q) => !existingIds.has(q.id));
      if (trulyNew.length === 0) return prev;
      const merged = [...prev, ...trulyNew];
      localStorage.setItem("projectff_quests", JSON.stringify(merged));
      return merged;
    });
    // Mark templates as materialised
    for (const instance of pendingInstances) {
      if (instance.recurrenceId) {
        markMaterialised(instance.recurrenceId, todayString);
      }
    }
  }, [pendingInstances, setQuests, todayString]);

  // ── Quest CRUD handlers (for QuestsAchievements) ──
  const handleAddQuest = (questData: Omit<Quest, "id" | "completed">) => {
    const newQuest: Quest = {
      ...questData,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      completed: false,
    };
    const updated = [...quests, newQuest];
    setQuests(updated);
    localStorage.setItem("projectff_quests", JSON.stringify(updated));
  };

  const handleUpdateQuest = (questId: string, updates: Partial<Quest>) => {
    const updated = quests.map((q) =>
      q.id === questId ? { ...q, ...updates } : q,
    );
    setQuests(updated);
    localStorage.setItem("projectff_quests", JSON.stringify(updated));
  };

  const handleDeleteQuest = (questId: string) => {
    const updated = quests.filter((q) => q.id !== questId);
    setQuests(updated);
    localStorage.setItem("projectff_quests", JSON.stringify(updated));
  };

  // ── Schedule handler (for ScheduleView) ──
  const handleSchedule = (questId: string, time: string | null, date?: string | null) => {
    const updated = quests.map((q) =>
      q.id === questId
        ? { ...q, scheduledTime: time ?? undefined, scheduledDate: date ?? undefined }
        : q,
    );
    setQuests(updated);
    localStorage.setItem("projectff_quests", JSON.stringify(updated));
  };

  // ── Today/Journal/Focus handlers (re-merged feature set) ──
  const handleTogglePin = (questId: string) => {
    const q = quests.find((x) => x.id === questId);
    if (!q) return;
    if (!q.pinned && quests.filter((x) => x.pinned).length >= 3) return;
    haptic("tap");
    handleUpdateQuest(questId, { pinned: !q.pinned });
  };

  const handleReset = async () => {
    // Wipe ALL local app state (profile, quests, every daily log + history,
    // templates, queues) so derived stats — radar, skills, insights, streaks,
    // participation — reset too. Keep only the offline-mode flag.
    Object.keys(localStorage)
      .filter((k) => k.startsWith("projectff_") && k !== "projectff_offline")
      .forEach((k) => localStorage.removeItem(k));

    // Signed-in: reset the cloud profile too, or realtime sync restores old stats.
    if (currentUser && !offlineMode) {
      try {
        await upsertProfile(
          createDefaultProfile(
            currentUser.id,
            currentUser.email || "",
            currentUser.user_metadata?.full_name || "User",
          ),
        );
      } catch (e) {
        console.error("Cloud reset failed:", e);
      }
    }
    location.reload();
  };

  const handleSaveJournal = (fields: Partial<DailyLog>) => {
    if (!profile || !todayLog) return;
    const nextLog: DailyLog = { ...todayLog, ...fields };
    const hasContent = !!(
      nextLog.journalEntry?.trim() ||
      nextLog.morningIntention?.trim() ||
      nextLog.gratitude?.trim() ||
      nextLog.win?.trim()
    );
    let nextProfile = profile;
    if (hasContent && profile.journalLastDate !== todayString) {
      const gap = profile.journalLastDate
        ? dayGap(profile.journalLastDate, todayString)
        : 99;
      const newStreak = gap === 1 ? (profile.journalStreak || 0) + 1 : 1;
      nextProfile = {
        ...profile,
        journalStreak: newStreak,
        journalLastDate: todayString,
        journalLongest: Math.max(profile.journalLongest || 0, newStreak),
        updatedAt: new Date().toISOString(),
      };
    }
    syncProfileAndLog(nextProfile, nextLog);
  };

  const handlePlanTomorrow = () => {
    setScheduleStartDate(
      new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    );
    setActiveTab("schedule");
  };

  const handleFocusComplete = (mins: number) => {
    if (!profile || !todayLog) return;
    const pillarKey = profile.pillars["productivity"]
      ? "productivity"
      : Object.keys(profile.pillars)[0];
    const xpEarned = mins;
    const nextProfile: UserProfile = { ...profile };
    const oldLevel = nextProfile.level;
    nextProfile.xp += xpEarned;
    nextProfile.level = Math.floor(nextProfile.xp / 100) + 1;
    nextProfile.focusMinutes = (nextProfile.focusMinutes ?? 0) + mins;
    nextProfile.focusSessions = (nextProfile.focusSessions ?? 0) + 1;
    if (pillarKey && nextProfile.pillars[pillarKey]) {
      const ps = nextProfile.pillars[pillarKey];
      const nx = ps.xp + xpEarned;
      nextProfile.pillars[pillarKey] = {
        ...ps,
        xp: nx,
        level: Math.floor(nx / 100) + 1,
      };
    }
    if (nextProfile.level > oldLevel) {
      nextProfile.levelUpHistory = [
        ...(nextProfile.levelUpHistory || []),
        {
          fromLevel: oldLevel,
          toLevel: nextProfile.level,
          date: new Date().toISOString(),
        },
      ];
      setLevelUpData({ fromLevel: oldLevel, toLevel: nextProfile.level });
    }
    nextProfile.updatedAt = new Date().toISOString();
    haptic("levelup");
    syncProfileAndLog(nextProfile, todayLog);
  };

  // ── Onboarding, journal, pillar weight/log, streak toast ──
  const {
    handleOnboardingComplete,
    handleSaveNote,
    handleUpdatePillarWeight,
    handleUpdatePillarLog,
  } = useJournalActions({
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
  });

  // ── Request notification permission on first level-up ──
  useEffect(() => {
    if (levelUpData) {
      requestNotificationPermission();
    }
  }, [levelUpData]);

  // ── Auto-schedule today's streak-save reminder on app open ──
  // If notifications are granted AND user has an active streak AND nothing
  // is done yet today, schedule an 8pm "don't break the chain" notification.
  useEffect(() => {
    if (!profile || !todayLog) return;
    if (!hasNotificationPermission()) return;

    const lastScheduled = localStorage.getItem("projectff_notif_last");
    if (lastScheduled === todayString) return; // already scheduled today

    const pillarKeys = Object.keys(profile.pillars);
    const activeStreaks = pillarKeys.filter(
      (k) => (profile.pillars[k].streak || 0) > 0,
    );
    if (activeStreaks.length === 0) return;

    const doneToday = Object.values(todayLog.completedTasks || {}).some(
      (v) => v === true,
    );
    if (doneToday) return;

    const now = new Date();
    const target = new Date(now);
    target.setHours(20, 0, 0, 0); // 8pm
    const delay = target.getTime() - now.getTime();
    if (delay <= 0 || delay > 86_400_000) return;

    const pillarLabel = activeStreaks[0];
    scheduleReminder(NotifVoice.streakAtRisk(pillarLabel), delay);
    localStorage.setItem("projectff_notif_last", todayString);
  }, [profile, todayLog, todayString]);

  // ── Generate repair quests on streak reset ──
  const longestPillarStreak = Math.max(
    ...Object.keys(profile?.pillars ?? {}).map(
      (pid) => profile?.pillars?.[pid]?.longestStreak ?? 0,
    ),
    7,
  );
  useEffect(() => {
    if (streakEvent?.event === "reset") {
      const repairQuests = generateRepairQuests(
        longestPillarStreak,
        profile?.level ?? 1,
      );
      setQuests((prev) => {
        const merged = [
          ...prev,
          ...repairQuests.map((rq) => ({
            id: `repair_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title: rq.title,
            description: `${rq.description} ${rq.flavour}`,
            pillar: rq.pillar,
            xpReward: rq.xpReward,
            completed: false,
            type: "daily" as const,
          })),
        ];
        localStorage.setItem("projectff_quests", JSON.stringify(merged));
        return merged;
      });
    }
  }, [streakEvent?.event, longestPillarStreak, profile?.level, setQuests]);

  // ── Daily quest cap ──
  const questCap = getDailyQuestCap(profile?.questionnaire?.gameMode);
  const dailyActiveQuests = quests.filter(
    (q) => q.type === "daily" && !q.completed,
  ).length;
  const capWarning = dailyActiveQuests >= questCap;

  // ── Recent logs for WeeklyInsights (last 14 days from localStorage) ──
  const recentLogs = useMemo(() => {
    try {
      const raw = localStorage.getItem("projectff_daily_logs");
      const logs: DailyLog[] = raw ? JSON.parse(raw) : [];
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return logs.filter((l) => l.date >= cutoffStr).sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }, []);

  // --- Render gates ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-brand-neon border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400 font-mono mt-4">
          Loading...
        </span>
      </div>
    );
  }

  if (!currentUser && !offlineMode) {
    return (
      <AuthScreen
        onLogin={setCurrentUser}
        onContinueOffline={handleContinueOffline}
      />
    );
  }

  if (!profile || !todayLog) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-brand-neon border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-neutral-400 font-mono mt-4">
          Synchronizing...
        </span>
      </div>
    );
  }

  // Onboarding gate
  if (!profile.onboardingComplete) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const pillarIds = Object.keys(profile.pillars);

  // ── Derived stats for right rail ──
  const totalSeams = pillarIds.reduce((sum, pid) => sum + (profile.pillars[pid].seams || 0), 0);
  const pillarStreaks = pillarIds.map((pid) => ({
    id: pid,
    streak: profile.pillars[pid].streak || 0,
    freezes: profile.pillars[pid].freezes || 0,
  }));
  const xpInLevel = profile.xp % 100;

  const navItems = [
    { id: "today" as const, icon: Home, label: "Today" },
    { id: "schedule" as const, icon: Calendar, label: "Schedule" },
    { id: "quests" as const, icon: Award, label: "Quests" },
    { id: "journal" as const, icon: BookOpen, label: "Journal" },
    { id: "stats" as const, icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex relative selection:bg-brand selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(53,6,238,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Desktop left sidebar */}
      <AppSidebar
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as AppTab)}
        offlineMode={offlineMode}
        hasCloudUser={!!currentUser}
        profileLevel={profile.level}
        profileXp={profile.xp}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
      />

      {/* Center content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <AppHeader
          offlineMode={offlineMode}
          hasCloudUser={!!currentUser}
          currentEmail={currentUser?.email}
          onGoogleLogin={handleGoogleLogin}
          profileLevel={profile.level}
          xpInLevel={xpInLevel}
          totalSeams={totalSeams}
          maxStreak={Math.max(0, ...Object.values(profile.pillars).map((p) => p.streak || 0))}
          activeStreakCount={Object.values(profile.pillars).filter((p) => (p.streak || 0) > 0).length}
        />
        <AppTabNav
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t as AppTab)}
        />

        <main className="flex-1 px-4 md:px-6 pt-4 md:pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "today" && (
                <TodayHub
                  profile={profile}
                  todayLog={todayLog}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onTogglePin={handleTogglePin}
                  onQuickAdd={handleQuickAdd}
                  onSaveJournal={handleSaveJournal}
                  onGoToJournal={() => setActiveTab("journal")}
                  onGoToSchedule={() => setActiveTab("schedule")}
                  onGoToBounties={goToBounties}
                  onPlanTomorrow={handlePlanTomorrow}
                  onStartFocus={() => setFocusOpen(true)}
                />
              )}
              {activeTab === "schedule" && (
                <ScheduleView
                  profile={profile}
                  todayLog={todayLog}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onSchedule={handleSchedule}
                  initialDate={scheduleStartDate}
                  onConsumeInitialDate={() => setScheduleStartDate(undefined)}
                />
              )}
              {activeTab === "quests" && (
                <QuestsAchievements
                  profile={profile}
                  quests={quests}
                  achievements={achievements}
                  onToggleQuest={handleToggleQuest}
                  onAddQuest={handleAddQuest}
                  onUpdateQuest={handleUpdateQuest}
                  onDeleteQuest={handleDeleteQuest}
                  nonNegotiableTemplates={nonNegotiableTemplates}
                  onAddNonNegotiable={addNonNegotiable}
                  onEditNonNegotiable={editNonNegotiable}
                  onRemoveNonNegotiable={removeNonNegotiable}
                  nnCompletedToday={nnCompletedToday}
                  nnTotalToday={nnTotalToday}
                  dailyQuestCap={questCap}
                  dailyActiveQuests={dailyActiveQuests}
                  scrollTarget={questsScrollTarget}
                  onScrolled={() => setQuestsScrollTarget(null)}
                />
              )}
              {activeTab === "journal" && (
                <JournalView
                  profile={profile}
                  todayLog={todayLog}
                  onSaveJournal={handleSaveJournal}
                />
              )}
              {activeTab === "stats" && (
                <div className="space-y-5">
                  <div className="flex w-fit flex-wrap gap-1 rounded-xl border border-neutral-850/80 bg-neutral-900 p-1">
                    {(["overview", "radar", "skills", "pillars", "insights"] as const).map(
                      (v) => (
                        <button
                          key={v}
                          onClick={() => setStatsView(v)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold capitalize transition-all cursor-pointer ${
                            statsView === v
                              ? "bg-brand/80 text-white"
                              : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {v}
                        </button>
                      ),
                    )}
                  </div>
                  {statsView === "overview" && (
                    <>
                      <HunterCard
                        profile={profile}
                        quests={quests}
                        journalStreak={profile.journalStreak ?? 0}
                        focusSessions={profile.focusSessions ?? 0}
                      />
                      <Dashboard
                        profile={profile}
                        todayLog={todayLog}
                        quests={quests}
                        onToggleQuest={handleToggleQuest}
                        onLogout={handleLogout}
                        onReset={handleReset}
                        onAddDomain={() => {}}
                        offlineMode={offlineMode}
                        onSyncAuth={handleGoogleLogin}
                      />
                    </>
                  )}
                  {statsView === "radar" && (
                    <RadarChart profile={profile} quests={quests} />
                  )}
                  {statsView === "skills" && (
                    <SkillTree profile={profile} quests={quests} />
                  )}
                  {statsView === "pillars" && (
                    <PillarTracker
                      profile={profile}
                      todayLog={todayLog}
                      onUpdateLog={handleUpdatePillarLog}
                      pillarIds={pillarIds}
                      onUpdateWeight={handleUpdatePillarWeight}
                    />
                  )}
                  {statsView === "insights" && (
                    <WeeklyInsights
                      profile={profile}
                      recentLogs={recentLogs}
                      pillarIds={pillarIds}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Desktop right rail */}
      <AppRightRail
        profileLevel={profile.level}
        profileXp={profile.xp}
        xpInLevel={xpInLevel}
        totalSeams={totalSeams}
        pillarIds={pillarIds}
        pillarStreaks={pillarStreaks}
        achievementCount={profile.achievements?.length ?? 0}
      />

      {/* ═══════════════ OVERLAYS ═══════════════ */}

      {/* XP burst on every completion */}
      <XpBurst />
      {/* System voice toasts for non-completion events */}
      <SystemToast />

      {/* Level-up notification */}
      {levelUpData && (
        <LevelUpNotification
          fromLevel={levelUpData.fromLevel}
          toLevel={levelUpData.toLevel}
          onDismiss={() => setLevelUpData(null)}
        />
      )}

      {/* Streak event toast */}
      <AnimatePresence>
        {streakEvent && (
          <motion.div
            key={streakEvent.event + streakEvent.pillar}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-70 px-5 py-3 rounded-2xl bg-neutral-800 border border-brand/40 text-neutral-100 text-sm font-mono shadow-2xl backdrop-blur-md whitespace-nowrap"
          >
            {STREAK_MESSAGES[streakEvent.event]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Focus raid overlay */}
      <FocusRaid
        open={focusOpen}
        sessionsCleared={profile.focusSessions ?? 0}
        onComplete={handleFocusComplete}
        onClose={() => setFocusOpen(false)}
      />

      {/* FAB — global capture */}
      <motion.button
        onClick={() => { haptic("tap"); setOpenCapture(true); }}
        whileTap={{ scale: 0.9, rotate: 90 }}
        transition={{ type: "spring", stiffness: 360, damping: 20 }}
        className="fixed right-4 z-[55] h-14 w-14 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center shadow-2xl shadow-brand/40 ring-2 ring-brand-neon/40 cursor-pointer md:bottom-6"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.25rem)" }}
        aria-label="Capture a task or thought"
      >
        <span aria-hidden className="absolute inset-0 rounded-full bg-brand-neon/30 blur-xl pointer-events-none" />
        <Plus className="relative h-7 w-7" strokeWidth={2.4} />
      </motion.button>

      {/* Capture Sheet */}
      <CaptureSheet
        open={openCapture}
        onClose={() => setOpenCapture(false)}
        quests={quests}
        onQuickAdd={handleQuickAdd}
        onSaveNote={handleSaveNote}
        onToggleQuest={handleToggleQuest}
        onAddNonNegotiable={addNonNegotiable}
      />

      {/* Beta — report a bug (testers) */}
      <button
        onClick={() => setBugOpen(true)}
        className="fixed left-4 bottom-20 md:bottom-6 z-60 flex h-11 items-center gap-1.5 rounded-2xl border border-neutral-700 bg-neutral-900/90 px-3.5 text-xs font-semibold text-neutral-300 shadow-lg backdrop-blur-md transition-all hover:bg-neutral-800 hover:text-white active:scale-95 cursor-pointer"
        aria-label="Report a bug"
      >
        <Bug className="h-4 w-4 text-brand-neon" />
        <span className="hidden sm:inline">Report a bug</span>
      </button>

      <BugReport
        open={bugOpen}
        onClose={() => setBugOpen(false)}
        profile={profile}
        screen={activeTab}
      />

    </div>
  );
}
