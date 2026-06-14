/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { UserProfile, DailyLog, Quest } from "../types";
import { getPillarDef, getGameMode, getRankForLevel, getXpForLevel, getXpInLevel, getXpProgress, getHarmonyMultiplier, canUnlockSlot, getUnlockCeremonyMessage, AVAILABLE_PILLARS } from "../data";
import {
  Flame,
  Brain,
  Target,
  DollarSign,
  Users,
  BookOpen,
  Sun,
  PenTool,
  Briefcase,
  Sparkles,
  LogOut,
  Star,
  Trophy,
  RotateCcw,
  Plus,
  X,
  Lock,
  Cloud,
  Sprout,
  Hammer,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FutureSelf, { futureSelfTier } from "./FutureSelf";

interface DashboardProps {
  profile: UserProfile;
  todayLog: DailyLog;
  quests: Quest[];
  onToggleQuest: (questId: string) => void;
  onLogout: () => void;
  onReset: () => void;
  onAddDomain: (pillarId: string) => void;
  offlineMode: boolean;
  onSyncAuth: () => void;
}

export default function Dashboard({
  profile,
  todayLog,
  quests = [],
  onToggleQuest,
  onLogout,
  onReset,
  onAddDomain,
  offlineMode,
  onSyncAuth,
}: DashboardProps) {
  const [bursts, setBursts] = useState<
    { id: number; text: string; x: number; y: number }[]
  >([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [confirmReset, setConfirmReset] = useState(false);
  const [systemToast, setSystemToast] = useState<string | null>(null);
  const [vignetteFlash, setVignetteFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // --- Domain unlock gating ---
  const [domainPickerOpen, setDomainPickerOpen] = useState(false);
  const [gateRejection, setGateRejection] = useState<{
    reason: string;
  } | null>(null);
  const [goldPulseSlot, setGoldPulseSlot] = useState<string | null>(null);

  // Countdown to midnight
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleQuestToggle = (e: React.MouseEvent, qId: string) => {
    e.stopPropagation();
    const item = quests.find((q) => q.id === qId);
    if (!item) return;

    onToggleQuest(qId);

    if (!item.completed) {
      const newBurst = {
        id: Date.now() + Math.random(),
        text: `+${item.xpReward} XP`,
        x: e.clientX || window.innerWidth / 2,
        y: e.clientY || window.innerHeight / 2,
      };
      setBursts((prev) => [...prev, newBurst]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
      }, 600);

      // System toast
      setSystemToast("PROTOCOL EXECUTED — THE SYSTEM ACKNOWLEDGES");
      setTimeout(() => setSystemToast(null), 2000);

      // Vignette flash
      setVignetteFlash(true);
      setTimeout(() => setVignetteFlash(false), 300);
    }
  };

  // --- Domain unlock gating logic ---
  const domainCount = Object.keys(profile.pillars).length;
  const maxPillarStreak = Object.values(profile.pillars).reduce(
    (max, p) => Math.max(max, p.streak || 0), 0,
  );
  const maxPillarLevel = Object.values(profile.pillars).reduce(
    (max, p) => Math.max(max, p.level || 1), 0,
  );

  const handleAddDomainTap = () => {
    if (domainCount < 3) {
      setDomainPickerOpen(true);
      return;
    }

    // Ghost Protocol: hard cap at 3
    if (offlineMode) {
      setGateRejection({
        reason: "Domain expansion requires a permanent identity. Sync your progress to unlock the Expansion Protocol.",
      });
      return;
    }

    // Check gating for slot 4-6
    const slot = domainCount + 1;
    const result = canUnlockSlot(slot, profile.level, maxPillarStreak, maxPillarLevel);
    if (result.unlocked) {
      setDomainPickerOpen(true);
    } else {
      setGateRejection({
        reason: result.reason || "Requirements not met.",
      });
    }
  };

  const handleSelectDomain = (pillarId: string) => {
    const slot = domainCount + 1;
    setDomainPickerOpen(false);
    onAddDomain(pillarId);

    if (slot >= 4) {
      // Unlock ceremony
      const msg = getUnlockCeremonyMessage(slot);
      if (msg) {
        setSystemToast(msg);
        setTimeout(() => setSystemToast(null), 3500);
      }
      setVignetteFlash(true);
      setTimeout(() => setVignetteFlash(false), 400);
      setGoldPulseSlot(pillarId);
      setTimeout(() => setGoldPulseSlot(null), 2000);
    }
  };

  const currentRank = getRankForLevel(profile.level);
  const mode = getGameMode(profile.questionnaire?.gameMode);
  const totalSeams = Object.values(profile.pillars).reduce(
    (sum, p) => sum + (p.seams ?? 0),
    0,
  );
  const { tier: selfTier, next: nextEvolution } = futureSelfTier(profile.level);

  const getPillarIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Flame: <Flame className="w-5 h-5 text-[#FF9F0A]" />,
      Brain: <Brain className="w-5 h-5 text-[#30D158]" />,
      Target: <Target className="w-5 h-5 text-ios-blue" />,
      DollarSign: <DollarSign className="w-5 h-5 text-[#30D158]" />,
      Users: <Users className="w-5 h-5 text-[#FF375F]" />,
      BookOpen: <BookOpen className="w-5 h-5 text-[#BF5AF2]" />,
      Sun: <Sun className="w-5 h-5 text-[#FFD60A]" />,
      PenTool: <PenTool className="w-5 h-5 text-[#FF375F]" />,
      Briefcase: <Briefcase className="w-5 h-5 text-[#5E5CE6]" />,
    };
    return iconMap[iconName] || <Star className="w-5 h-5 text-white/30" />;
  };

  /** Resolve gamemode emoji key → Lucide icon (avoids raw text rendering on mobile) */
  const getGameModeIcon = (emojiKey: string) => {
    const size = "w-3.5 h-3.5";
    switch (emojiKey) {
      case "Sprout": return <Sprout className={size} />;
      case "Flame":  return <Flame className={`${size} text-[#FF9F0A]`} />;
      case "Hammer": return <Hammer className={size} />;
      case "Crown":  return <Crown className={`${size} text-[#FFD60A]`} />;
      default:        return null;
    }
  };

  const pillarEntries = Object.entries(profile.pillars);
  const totalPillarWeight = pillarEntries.reduce(
    (sum, [, stats]) => sum + stats.weight,
    0,
  );

  // Collect distinct pillar IDs from quests for filter tabs
  const questPillarIds = [...new Set(quests.map((q) => q.pillar))];

  // --- XP curve helpers (aliased for brevity) ---
  const ovXpProgress = getXpProgress(profile.xp, profile.level);
  const ovXpInLevel = getXpInLevel(profile.xp, profile.level);
  const ovXpNeeded = getXpForLevel(profile.level);

  return (
    <div id="war-room-dashboard" className={`space-y-4 ${vignetteFlash ? "vignette-flash" : ""}`}>
      {/* Top Announcement Banner */}
      <div className="ios-card p-5 relative overflow-hidden">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[11px] text-ios-blue font-medium inline-block mb-1">
              [THE SYSTEM] AWAITS YOUR COMMITMENT, PLAYER
            </span>
            <h2 className="text-[22px] font-bold tracking-tight text-white">
              <span className="text-ios-blue">{currentRank.rank}</span> — {currentRank.title}
            </h2>
            <p className="text-[13px] text-white/40 mt-1">
              {currentRank.flavour}
            </p>
            <p className="text-[13px] text-white/40 mt-1">
              Level {profile.level} · {profile.achievements.length} Achievements · {pillarEntries.length} Pillars
            </p>
          </div>

          <div className="flex items-center gap-2">
            {confirmReset ? (
              <>
                <span className="text-[13px] text-[#FF9F0A] mr-1">Reset all progress?</span>
                <button
                  onClick={() => { setConfirmReset(false); onReset(); }}
                  className="px-3 py-2 rounded-xl text-[13px] text-[#FF453A] active:bg-[#FF453A]/10 font-medium"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-2 rounded-xl text-[13px] text-white/60 active:bg-white/10 font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  id="reset-btn"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-white/60 active:bg-white/10 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-white/60 active:bg-white/10 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats / Character Card */}
      <div className="grid grid-cols-1 gap-4">
        {/* Character Profile & XP */}
        <div id="character-card" className="ios-card p-5">
          <div className="flex items-center gap-4 pb-4 border-b border-white/5">
            <FutureSelf
              level={profile.level}
              xpInLevel={ovXpProgress}
              seams={totalSeams}
              size={72}
            />
            <div>
              <h3 className="text-[20px] font-display font-bold text-white">{profile.displayName}</h3>
              <p className="text-[13px] text-ios-blue mt-0.5">
                {selfTier.name}{nextEvolution ? ` · Evolves at Lv.${nextEvolution}` : " · Max Form"}
                {totalSeams > 0 ? ` · ✦${totalSeams} seams` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="ios-chip ios-chip-active text-[11px]">{currentRank.rank} · {currentRank.title}</span>
                <span className="ios-chip text-[11px] flex items-center gap-1" title={mode.subtext}>{getGameModeIcon(mode.emoji)} {mode.name} · {mode.xpLabel}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2 my-4">
            <div className="flex justify-between text-[13px] font-hud">
              <span className="text-white/50">Experience</span>
              <span className="text-ios-blue font-semibold">{ovXpInLevel} / {ovXpNeeded} XP</span>
            </div>
            <div className="ios-progress-bar">
              <div className="ios-progress-fill" style={{ width: `${ovXpProgress}%` }} />
            </div>
          </div>

          {/* Pillar Weight Summary */}
          {pillarEntries.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[11px] text-white/30 block">Pillar Distribution</span>
              {pillarEntries.map(([pillarKey, stats]) => {
                const def = getPillarDef(pillarKey);
                const weightPct = totalPillarWeight > 0 ? (stats.weight / totalPillarWeight) * 100 : 0;
                return (
                  <div key={pillarKey} className="space-y-1">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/50">{def?.label ?? pillarKey}</span>
                      <span className="text-white/80">{stats.weight}%</span>
                    </div>
                    <div className="ios-progress-bar" style={{ height: 4 }}>
                      <div className="ios-progress-fill" style={{ width: `${weightPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Harmony indicator */}
          {pillarEntries.length > 1 && (() => {
            const h = getHarmonyMultiplier(profile.pillars);
            if (h >= 1.2) return (
              <p className="text-xs mt-3 font-hud" style={{ color: "#C9A84C" }}>
                ✦ HARMONY BONUS ACTIVE · +20% XP
              </p>
            );
            if (h <= 0.85) return (
              <p className="text-xs mt-3 font-hud text-amber-400">
                ⚠ IMBALANCE DETECTED · Equalise your pillars to restore full XP
              </p>
            );
            return null;
          })()}

          <div className="pt-4 mt-4 border-t border-white/5 flex justify-between text-[12px] text-white/30">
            <span>Achievements: {profile.achievements.length}</span>
            <span>Total XP: {profile.xp}</span>
          </div>
        </div>

        {/* Pillar Stats Cards */}
        <div className="ios-card p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4 pb-3 border-b border-white/5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-ios-blue" />
              Pillar Attributes
            </span>
            <button
              onClick={handleAddDomainTap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2C2C2E] hover:bg-[#3C3C3E] active:scale-95 text-[11px] text-ios-blue font-semibold transition-all border border-white/5"
              aria-label="Add domain"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </h3>

          {pillarEntries.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-white/20">
              No pillars configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pillarEntries.map(([pillarKey, stats]) => {
                const def = getPillarDef(pillarKey);
                const pXpProgress = getXpProgress(stats.xp, stats.level);
                const pXpInLevel = getXpInLevel(stats.xp, stats.level);
                const pXpNeeded = getXpForLevel(stats.level);
                return (
                  <div key={pillarKey} className={`bg-[#1C1C1E] p-4 rounded-xl ${goldPulseSlot === pillarKey ? "domain-gold-pulse" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#2C2C2E] flex items-center justify-center">
                          {def ? getPillarIcon(def.icon) : getPillarIcon("")}
                        </div>
                        <div>
                          <h4 className="text-[14px] font-semibold text-white">{def?.label ?? pillarKey}</h4>
                          <p className="text-[12px] text-white/30">Lvl {stats.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {stats.streak > 0 && (
                          <div className="ios-chip ios-chip-active text-[11px]">
                            <Flame className="w-3 h-3" />{stats.streak}d
                          </div>
                        )}
                        {(stats.freezes ?? 0) > 0 && (
                          <div className="ios-chip text-[11px]">❄️{stats.freezes}</div>
                        )}
                        {(stats.seams ?? 0) > 0 && (
                          <div className="ios-chip text-[11px]">✦{stats.seams}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/40">XP Progress</span>
                        <span className="text-ios-blue font-semibold">{stats.xp} XP</span>
                      </div>
                      <div className="ios-progress-bar" style={{ height: 4 }}>
                        <div className="ios-progress-fill" style={{ width: `${pXpProgress}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/20">
                        <span>Weight: {stats.weight}%</span>
                        <span>{pXpInLevel} / {pXpNeeded}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Quest Directives */}
      <div className="ios-card p-5 space-y-4">
        <div className="flex flex-col gap-3 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-ios-blue" />
                Daily Quests
              </h3>
              <p className="text-[13px] text-white/30 mt-0.5">Complete quests to earn XP and level up your pillars.</p>
            </div>
            <span className="text-[11px] text-white/25 font-mono tracking-wider shrink-0 ml-3 mt-0.5">
              {quests.length > 0 && quests.every((q) => q.completed)
                ? "ALL PROTOCOLS EXECUTED TODAY — THE SYSTEM IS SATISFIED."
                : `DIRECTIVES EXPIRE IN ${timeLeft}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-white/40">
              {quests.filter((q) => q.completed).length} / {quests.length} Completed
            </span>
            <div className="ios-progress-bar flex-1">
              <div
                className="ios-progress-fill"
                style={{ width: `${quests.length ? (quests.filter((q) => q.completed).length / quests.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pillar Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`ios-chip text-[11px] md:text-[12px] px-2 md:px-3 ${activeFilter === "all" ? "ios-chip-active" : ""}`}
          >
            All Quests
          </button>
          {questPillarIds.map((pillarId) => {
            const def = getPillarDef(pillarId);
            const isActive = activeFilter === pillarId;
            return (
              <button
                key={pillarId}
                onClick={() => setActiveFilter(pillarId)}
                className={`ios-chip text-[11px] md:text-[12px] px-2 md:px-3 ${isActive ? "ios-chip-active" : ""}`}
              >
                {def?.label ?? pillarId}
              </button>
            );
          })}
        </div>

        {/* Quest Cards */}
        {quests.filter((q) => {
          if (activeFilter === "all") return true;
          return q.pillar === activeFilter;
        }).length === 0 ? (
          <div className="py-12 text-center text-[13px] text-white/20">
            No quests available for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {quests
              .filter((q) => {
                if (activeFilter === "all") return true;
                return q.pillar === activeFilter;
              })
              .sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 0 : 1))
              .map((quest) => {
                const def = getPillarDef(quest.pillar);
                return (
                  <div
                    key={quest.id}
                    onClick={(e) => handleQuestToggle(e, quest.id)}
                    className={`p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all ${
                      quest.completed
                        ? "bg-[#30D158]/5 opacity-70"
                        : "bg-[#1C1C1E] active:bg-[#2C2C2E]"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleQuestToggle(e, quest.id)}
                        className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 ${
                          quest.completed
                            ? "bg-[#30D158] text-white"
                            : "bg-[#2C2C2E] text-white/30"
                        }`}
                      >
                        {quest.completed ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-[14px] font-semibold leading-snug truncate ${quest.completed ? "text-white/30 line-through" : "text-white"}`}>
                            {quest.title}
                          </h4>
                          <span className="ios-chip text-[10px] shrink-0">{def?.label?.split(" ")[0] ?? quest.pillar}</span>
                        </div>
                        <p className="text-[12px] text-white/30 leading-snug mt-0.5 line-clamp-2">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[14px] font-semibold ${quest.completed ? "text-white/20" : "text-ios-blue"}`}>
                        +{quest.xpReward} XP
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* System Protocol Toast */}
      <AnimatePresence>
        {systemToast && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9998] px-5 py-2.5 rounded-xl bg-neutral-900/95 border border-brand/40 text-[13px] font-mono font-semibold tracking-wide text-brand-neon shadow-lg shadow-brand/10 backdrop-blur-md"
          >
            {systemToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating XP Burst Animation */}
      <div className="fixed inset-0 pointer-events-none z-[9999]" id="xp-burst-portal">
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 1, y: b.y - 15, x: b.x - 20, scale: 0.8 }}
              animate={{ opacity: 0, y: b.y - 130, x: b.x + (Math.random() * 60 - 30), scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute text-ios-blue font-bold text-[15px] flex items-center gap-1.5 ios-animate-scale"
            >
              <Sparkles className="w-4 h-4" />
              {b.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Domain Picker Modal */}
      <AnimatePresence>
        {domainPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9997] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setDomainPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-md ios-card p-6 max-h-[75vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-display font-bold tracking-widest text-white">
                  EXPAND YOUR DOMAINS
                </h2>
                <button
                  onClick={() => setDomainPickerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <p className="text-[13px] text-white/40 mb-5 leading-snug">
                The System will generate quests for your new domain. Choose wisely — each domain deepens your vessel.
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {AVAILABLE_PILLARS.filter((p) => !profile.pillars[p.id]).map((pillar) => {
                  const Icon = (() => {
                    const m: Record<string, React.ReactNode> = {
                      Flame: <Flame className="w-5 h-5 text-[#FF9F0A]" />,
                      Brain: <Brain className="w-5 h-5 text-[#30D158]" />,
                      Target: <Target className="w-5 h-5 text-ios-blue" />,
                      DollarSign: <DollarSign className="w-5 h-5 text-[#30D158]" />,
                      Users: <Users className="w-5 h-5 text-[#FF375F]" />,
                      BookOpen: <BookOpen className="w-5 h-5 text-[#BF5AF2]" />,
                      Sun: <Sun className="w-5 h-5 text-[#FFD60A]" />,
                      PenTool: <PenTool className="w-5 h-5 text-[#FF375F]" />,
                      Briefcase: <Briefcase className="w-5 h-5 text-[#5E5CE6]" />,
                    };
                    return m[pillar.icon] || <Star className="w-5 h-5 text-white/30" />;
                  })();
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => handleSelectDomain(pillar.id)}
                      className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/5 active:bg-[#2C2C2E] transition-all active:scale-[0.96] text-center"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#2C2C2E] flex items-center justify-center">
                        {Icon}
                      </div>
                      <div>
                        <h3 className="text-[13px] font-semibold text-white/75 leading-tight">
                          {pillar.label}
                        </h3>
                        <p className="text-[10px] text-white/35 mt-0.5 leading-snug line-clamp-2">
                          {pillar.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {AVAILABLE_PILLARS.filter((p) => !profile.pillars[p.id]).length === 0 && (
                <p className="text-center text-[13px] text-white/30 py-8">
                  All domains are active. Your vessel is full.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gate Rejection Modal */}
      <AnimatePresence>
        {gateRejection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9997] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setGateRejection(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-md ios-card p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-[16px] font-display font-bold tracking-widest text-amber-400 uppercase">
                  EXPANSION PROTOCOL
                </h2>
              </div>

              <p className="text-[14px] text-white/70 mb-2 font-semibold">
                [THE SYSTEM] {gateRejection.reason}
              </p>

              <p className="text-[12px] text-white/30 mt-4 leading-snug">
                Complete your existing domains. The System rewards depth before breadth.
              </p>

              {offlineMode && (
                <button
                  onClick={() => { setGateRejection(null); onSyncAuth(); }}
                  className="ios-btn ios-btn-primary w-full mt-5 text-[15px] font-semibold"
                >
                  <Cloud className="w-4 h-4" />
                  Sync Now
                </button>
              )}

              <button
                onClick={() => setGateRejection(null)}
                className="ios-btn ios-btn-ghost w-full mt-3 text-[14px]"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
