/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StreakEvent } from "./streak";
import { haptic } from "./haptics";
import { requestNotificationPermission } from "./notifications";
import { getDailyQuestCap, generateRepairQuests } from "./data";
import type { Quest, DailyLog } from "./types";

// Components
import AuthScreen from "./components/AuthScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import Dashboard from "./components/Dashboard";
import ScheduleView from "./components/ScheduleView";
import PillarTracker from "./components/PillarTracker";
import QuestsAchievements from "./components/QuestsAchievements";
import CaptureSheet from "./components/CaptureSheet";
import LevelUpNotification from "./components/LevelUpNotification";
import AppSidebar from "./components/AppSidebar";
import AppHeader from "./components/AppHeader";
import AppTabNav from "./components/AppTabNav";
import AppRightRail from "./components/AppRightRail";
import WeeklyInsights from "./components/WeeklyInsights";

// Icons
import { Calendar, Award, Activity, Flame, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGameState } from "./hooks/useGameState";
import type { AppTab } from "./hooks/useGameState";
import { useAuth } from "./hooks/useAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { useQuestActions } from "./hooks/useQuestActions";
import { useJournalActions } from "./hooks/useJournalActions";
import { useNonNegotiables } from "./hooks/useNonNegotiables";
import { useRecurringTasks, markMaterialised } from "./hooks/useRecurringTasks";
import { useEffect, useMemo } from "react";

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
    { id: "dashboard" as const, icon: Activity, label: "Command" },
    { id: "schedule" as const, icon: Calendar, label: "Schedule" },
    { id: "tracker" as const, icon: Flame, label: "Pillar Labs" },
    { id: "quests" as const, icon: Award, label: "Bounties" },
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
        />
        <AppTabNav
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t as AppTab)}
        />

        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  profile={profile}
                  todayLog={todayLog}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onLogout={handleLogout}
                  onReset={() => {}}
                  onAddDomain={() => {}}
                  offlineMode={offlineMode}
                  onSyncAuth={handleGoogleLogin}
                />
              )}
              {activeTab === "schedule" && (
                <ScheduleView
                  profile={profile}
                  todayLog={todayLog}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onSchedule={handleSchedule}
                />
              )}
              {activeTab === "tracker" && (
                <PillarTracker
                  profile={profile}
                  todayLog={todayLog}
                  onUpdateLog={handleUpdatePillarLog}
                  pillarIds={pillarIds}
                  onUpdateWeight={handleUpdatePillarWeight}
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
                />
              )}
              {activeTab === "insights" && (
                <WeeklyInsights
                  profile={profile}
                  recentLogs={recentLogs}
                  pillarIds={pillarIds}
                />
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
        achievementCount={profile.achievements.length}
      />

      {/* ═══════════════ OVERLAYS ═══════════════ */}

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

      {/* FAB — global capture */}
      <button
        onClick={() => { haptic("tap"); setOpenCapture(true); }}
        className="fixed right-4 bottom-20 md:bottom-6 z-60 h-14 w-14 rounded-2xl bg-brand hover:bg-brand-dark text-white flex items-center justify-center shadow-lg shadow-brand/30 border border-brand-neon/30 transition-all active:scale-95 cursor-pointer"
        aria-label="Capture a task or thought"
      >
        <Plus className="h-6 w-6" />
      </button>

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

    </div>
  );
}
