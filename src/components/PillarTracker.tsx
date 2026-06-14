/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Activity,
  Star,
  Zap,
  ArrowUp,
  Book,
  CheckCircle2,
  TrendingUp,
  Minus,
  Plus,
  Save,
} from "lucide-react";
import { UserProfile, DailyLog } from "../types";
import { getPillarDef } from "../data";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PillarTrackerProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onUpdateLog: (
    fields: Partial<DailyLog>,
    pillarKey: string,
    xpEarned: number,
  ) => void;
  pillarIds: string[];
  /** Called when the user adjusts a pillar's weight slider */
  onUpdateWeight?: (pillarKey: string, newWeight: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Map a pillar definition's icon string → lucide component */
function pillarIcon(iconName: string) {
  switch (iconName) {
    case "Flame":
      return Flame;
    case "Brain":
      return Brain;
    case "Target":
      return Target;
    case "DollarSign":
      return DollarSign;
    case "Users":
      return Users;
    case "BookOpen":
      return BookOpen;
    case "Sun":
      return Sun;
    case "PenTool":
      return PenTool;
    case "Briefcase":
      return Briefcase;
    case "Sparkles":
      return Sparkles;
    case "Star":
      return Star;
    default:
      return Activity;
  }
}

/** XP needed to reach the next pillar level */
function xpForLevel(level: number): number {
  return 100 * level;
}

/** Format streak for display */
function streakLabel(streak: number): string {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PillarTracker({
  profile,
  todayLog,
  onUpdateLog,
  pillarIds,
  onUpdateWeight,
}: PillarTrackerProps) {
  const [activePillar, setActivePillar] = useState<string>(pillarIds[0] ?? "");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastLoggedPillar, setLastLoggedPillar] = useState("");
  const [journalDraft, setJournalDraft] = useState(todayLog.journalEntry);
  const [journalSaved, setJournalSaved] = useState(
    todayLog.completedTasks["journal_entry"] === true,
  );

  const def = getPillarDef(activePillar);
  const pillar = activePillar ? profile.pillars[activePillar] : undefined;
  const notes = activePillar ? (todayLog.pillarNotes[activePillar] ?? "") : "";

  /* ---- handlers ---- */

  const handleLogProgress = useCallback(() => {
    if (!activePillar || !pillar) return;

    const xpEarned = 10 + Math.floor(pillar.level * 2);
    const currentNotes = todayLog.pillarNotes[activePillar] ?? "";
    onUpdateLog(
      {
        pillarNotes: { ...todayLog.pillarNotes, [activePillar]: currentNotes },
      },
      activePillar,
      xpEarned,
    );

    setLastLoggedPillar(def?.label ?? activePillar);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2200);
  }, [activePillar, pillar, todayLog.pillarNotes, onUpdateLog, def]);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!activePillar) return;
      onUpdateLog(
        {
          pillarNotes: {
            ...todayLog.pillarNotes,
            [activePillar]: e.target.value,
          },
        },
        activePillar,
        0,
      );
    },
    [activePillar, todayLog.pillarNotes, onUpdateLog],
  );

  const handleJournalChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJournalDraft(e.target.value);
    },
    [],
  );

  const handleJournalSave = useCallback(() => {
    if (!journalDraft.trim() || journalDraft.trim().length < 10) return;
    const xpEarned = journalSaved ? 0 : 8;
    const updatedTasks = {
      ...todayLog.completedTasks,
      journal_entry: true,
    };
    onUpdateLog(
      { journalEntry: journalDraft, completedTasks: updatedTasks },
      "",
      xpEarned,
    );
    setJournalSaved(true);
    if (!journalSaved) {
      setLastLoggedPillar("Journal Entry");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
    }
  }, [journalDraft, journalSaved, todayLog.completedTasks, onUpdateLog]);

  const handleWeightChange = useCallback(
    (delta: number) => {
      if (!activePillar || !pillar || !onUpdateWeight) return;
      const newWeight = Math.max(0, Math.min(100, pillar.weight + delta));
      onUpdateWeight(activePillar, newWeight);
    },
    [activePillar, pillar, onUpdateWeight],
  );

  /* ---- render ---- */

  if (pillarIds.length === 0) {
    return (
      <div className="system-card rounded-2xl p-6 text-center">
        <p className="text-white/60 text-sm">
          No pillars selected yet. Complete onboarding to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ---- Success toast ---- */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Logged progress in{" "}
              <span className="font-semibold">{lastLoggedPillar}</span> — XP
              earned!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Pillar tabs ---- */}
      <div className="system-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
          <TrendingUp className="h-3.5 w-3.5" />
          Pillars
        </div>

        <div className="flex flex-wrap gap-2">
          {pillarIds.map((pid) => {
            const d = getPillarDef(pid);
            const Icon = d ? pillarIcon(d.icon) : Activity;
            const isActive = pid === activePillar;
            return (
              <motion.button
                key={pid}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActivePillar(pid)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand/20 border border-brand/40 text-white shadow-[0_0_10px_rgba(53,6,238,0.2)]"
                    : "border border-white/5 bg-white/[0.03] text-white/50 hover:border-white/10 hover:text-white/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {d?.label ?? pid}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ---- Active pillar panel ---- */}
      <AnimatePresence mode="wait">
        {def && pillar && (
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="system-card rounded-2xl p-6"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${def.color}`}
                >
                  {React.createElement(pillarIcon(def.icon), {
                    className: "h-5 w-5 text-white",
                  })}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {def.label}
                  </h3>
                  <p className="text-xs text-white/50">{def.description}</p>
                </div>
              </div>

              {/* Weight slider */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1">
                  <button
                    onClick={() => handleWeightChange(-5)}
                    disabled={!onUpdateWeight || pillar.weight <= 0}
                    className="rounded p-0.5 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease weight"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[3.5ch] text-center text-xs font-semibold text-white tabular-nums">
                    {pillar.weight}%
                  </span>
                  <button
                    onClick={() => handleWeightChange(5)}
                    disabled={!onUpdateWeight || pillar.weight >= 100}
                    className="rounded p-0.5 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase weight"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[10px] text-white/30">Weight</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-white/30">
                  <Zap className="h-3 w-3" />
                  Level
                </div>
                <div className="text-xl font-bold text-white">
                  {pillar.level}
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-white/30">
                  <ArrowUp className="h-3 w-3" />
                  XP
                </div>
                <div className="text-xl font-bold text-white">{pillar.xp}</div>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-white/30">
                  <Flame className="h-3 w-3" />
                  Streak
                </div>
                <div className="text-xl font-bold text-white">
                  {streakLabel(pillar.streak)}
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/40">
                <span>XP to Level {pillar.level + 1}</span>
                <span>
                  {pillar.xp} / {xpForLevel(pillar.level)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-neon"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (pillar.xp / xpForLevel(pillar.level)) * 100,
                      100,
                    )}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Pillar journal */}
            <div className="mb-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/40">
                <Book className="h-3 w-3" />
                Pillar Notes & Reflection
              </label>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                rows={3}
                placeholder={`What did you do for ${def.label.toLowerCase()} today?`}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
            </div>

            {/* Log Effort button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogProgress}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-neon px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(53,6,238,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(53,6,238,0.45)]"
            >
              <Sparkles className="h-4 w-4" />
              Log Effort
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Overall journal ---- */}
      <div className="system-card rounded-2xl p-6">
        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/40">
          <BookOpen className="h-3 w-3" />
          Daily Journal
          {journalSaved && (
            <span className="text-emerald-400 ml-1 text-[10px]">• +8 XP earned</span>
          )}
        </label>
        <textarea
          value={journalDraft}
          onChange={handleJournalChange}
          rows={4}
          placeholder="How was your day? What went well? What could be better?"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/30"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJournalSave}
          disabled={journalDraft.trim().length < 10}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            journalDraft.trim().length >= 10
              ? "bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-white/5 text-white/25 cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4" />
          {journalSaved ? "Update Journal " : "Save Journal  (+8 XP)"}
        </motion.button>
      </div>
    </div>
  );
}
