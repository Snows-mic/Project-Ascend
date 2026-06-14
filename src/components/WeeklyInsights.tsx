/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WeeklyInsights — end-of-week reflection dashboard.
 *
 * Shows: best pillar, consistency trend, streak milestones, XP summary,
 * and next-week recommendations. Pure rule-based — no AI needed.
 */

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Award,
  Flame,
  Star,
  Zap,
  Calendar,
  Target,
  Brain,
  DollarSign,
  Users,
  BookOpen,
  Sun,
  PenTool,
  Briefcase,
  Sparkles,
  Activity,
} from "lucide-react";
import type { UserProfile, DailyLog } from "../types";
import { getPillarDef, WEEKLY_REVIEW_PROMPTS } from "../data";

/** Map a pillar definition's icon string → lucide component. */
function pillarIcon(iconName?: string) {
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

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface WeeklyInsightsProps {
  profile: UserProfile;
  /** Logs from the past 14 days (current week + last week for comparison) */
  recentLogs: DailyLog[];
  /** Pillar IDs to show in the breakdown */
  pillarIds: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers (pure functions — no state)                                 */
/* ------------------------------------------------------------------ */

interface WeekSummary {
  daysLogged: number;
  totalXP: number;
  pillarCounts: Record<string, number>;
  bestPillar: string | null;
  bestPillarCount: number;
}

function summariseWeek(logs: DailyLog[], pillarIds: string[]): WeekSummary {
  const pillarCounts: Record<string, number> = {};
  for (const pid of pillarIds) pillarCounts[pid] = 0;

  let daysLogged = 0;
  let totalXP = 0;

  for (const log of logs) {
    if (log.completedTasks && Object.keys(log.completedTasks).length > 0) {
      daysLogged++;
      // Count per-pillar contributions from pillarNotes
      for (const pid of pillarIds) {
        if (log.pillarNotes?.[pid]) {
          pillarCounts[pid]++;
        }
      }
    }
  }

  let bestPillar: string | null = null;
  let bestPillarCount = 0;
  for (const [pid, count] of Object.entries(pillarCounts)) {
    if (count > bestPillarCount) {
      bestPillar = pid;
      bestPillarCount = count;
    }
  }

  return { daysLogged, totalXP, pillarCounts, bestPillar, bestPillarCount };
}

function dayLabel(logs: DailyLog[]): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return logs
    .map((l) => {
      const d = new Date(l.date + "T00:00:00");
      return days[d.getDay()];
    })
    .join(" → ");
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function WeeklyInsights({
  profile,
  recentLogs,
  pillarIds,
}: WeeklyInsightsProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun

  // Partition logs into this week (Mon-Sun) vs last week
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Monday
  const thisWeekKey = startOfThisWeek.toISOString().slice(0, 10);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const lastWeekKey = startOfLastWeek.toISOString().slice(0, 10);

  const thisWeekLogs = recentLogs.filter((l) => l.date >= thisWeekKey);
  const lastWeekLogs = recentLogs.filter(
    (l) => l.date >= lastWeekKey && l.date < thisWeekKey,
  );

  const thisWeek = useMemo(
    () => summariseWeek(thisWeekLogs, pillarIds),
    [thisWeekLogs, pillarIds],
  );
  const lastWeek = useMemo(
    () => summariseWeek(lastWeekLogs, pillarIds),
    [lastWeekLogs, pillarIds],
  );

  const consistencyDelta = thisWeek.daysLogged - lastWeek.daysLogged;
  const xpDelta = thisWeek.totalXP - lastWeek.totalXP;

  // Overall streak is derived from per-pillar streaks (max), matching the
  // convention used elsewhere in the app (see App.tsx longestPillarStreak).
  const pillarStats = Object.values(profile.pillars ?? {});
  const currentStreak = pillarStats.reduce(
    (m, p) => Math.max(m, p.streak ?? 0),
    0,
  );
  const longestStreak = pillarStats.reduce(
    (m, p) => Math.max(m, p.longestStreak ?? 0),
    0,
  );

  const bestPillarDef = thisWeek.bestPillar
    ? getPillarDef(thisWeek.bestPillar)
    : null;
  const BestPillarIcon = bestPillarDef ? pillarIcon(bestPillarDef.icon) : null;

  // Pick 2 weekly review prompts
  const prompts = useMemo(() => {
    const shuffled = [...WEEKLY_REVIEW_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-hud font-semibold uppercase tracking-widest text-white/60">
          Weekly Insights
        </h2>
        <span className="text-[10px] font-mono text-white/30">
          {dayLabel(thisWeekLogs)}
        </span>
      </div>

      {/* Stats row: Days, XP, Best Pillar */}
      <div className="grid grid-cols-3 gap-3">
        {/* Days Logged */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="system-card rounded-xl p-4 text-center"
        >
          <Calendar className="h-4 w-4 mx-auto mb-1 text-white/30" />
          <div className="text-xl font-bold text-white">
            {thisWeek.daysLogged}
            <span className="text-xs text-white/25">/7</span>
          </div>
          <div className="text-[10px] font-mono text-white/30">days logged</div>
          {consistencyDelta !== 0 && (
            <div
              className={`text-[10px] font-mono mt-0.5 ${consistencyDelta > 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {consistencyDelta > 0 ? "+" : ""}
              {consistencyDelta} vs last week
            </div>
          )}
        </motion.div>

        {/* XP Earned */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="system-card rounded-xl p-4 text-center"
        >
          <Zap className="h-4 w-4 mx-auto mb-1 text-amber-400/60" />
          <div className="text-xl font-bold text-amber-400">
            {thisWeek.totalXP}
          </div>
          <div className="text-[10px] font-mono text-white/30">XP earned</div>
          {xpDelta !== 0 && (
            <div
              className={`text-[10px] font-mono mt-0.5 ${xpDelta > 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {xpDelta > 0 ? "+" : ""}
              {xpDelta} vs last week
            </div>
          )}
        </motion.div>

        {/* Best Pillar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="system-card rounded-xl p-4 text-center"
        >
          <Award className="h-4 w-4 mx-auto mb-1 text-brand-neon/60" />
          <div className="text-xl font-bold text-brand-neon flex items-center justify-center h-7">
            {BestPillarIcon ? <BestPillarIcon className="h-6 w-6" /> : "—"}
          </div>
          <div className="text-[10px] font-mono text-white/30">
            {thisWeek.bestPillar
              ? getPillarDef(thisWeek.bestPillar)?.label ?? "best pillar"
              : "no data"}
          </div>
        </motion.div>
      </div>

      {/* Pillar breakdown bars */}
      <div className="system-card rounded-xl p-4 space-y-3">
        <h3 className="text-[10px] font-hud font-semibold uppercase tracking-widest text-white/40">
          Pillar Activity
        </h3>
        {pillarIds.map((pid) => {
          const def = getPillarDef(pid);
          const PillarIcon = pillarIcon(def?.icon);
          const count = thisWeek.pillarCounts[pid] ?? 0;
          const maxCount = Math.max(...Object.values(thisWeek.pillarCounts), 1);
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={pid} className="flex items-center gap-3">
              <span className="text-xs w-16 text-white/50 truncate flex items-center gap-1">
                <PillarIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{def?.label ?? pid}</span>
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${def?.color ?? "from-brand to-brand-neon"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/30 w-5 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Streak Milestones */}
      <div className="system-card rounded-xl p-4 space-y-3">
        <h3 className="text-[10px] font-hud font-semibold uppercase tracking-widest text-white/40">
          Streak Milestones
        </h3>
        <div className="flex items-center gap-3">
          <Flame className="h-4 w-4 text-orange-400" />
          <div className="flex-1">
            <div className="text-sm font-bold text-white">
              {currentStreak} days
            </div>
            <div className="text-[10px] font-mono text-white/30">
              Current streak
            </div>
          </div>
          {longestStreak > 0 && (
            <div className="text-right">
              <div className="text-sm font-bold text-amber-400">
                {longestStreak}
              </div>
              <div className="text-[10px] font-mono text-white/30">
                Longest
              </div>
            </div>
          )}
        </div>
        {/* Milestone tracker */}
        <div className="flex gap-1.5 pt-2">
          {[7, 14, 21, 30, 60, 90].map((ms) => {
            const current = currentStreak;
            const hit = current >= ms;
            const near = !hit && current >= ms - 3;
            return (
              <div
                key={ms}
                className={`flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  hit
                    ? "bg-brand-neon/15 text-brand-neon border border-brand-neon/30"
                    : near
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-white/[0.02] text-white/15 border border-white/5"
                }`}
              >
                {ms}d
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Review Prompts (from data.ts) */}
      <div className="system-card rounded-xl p-4 space-y-3">
        <h3 className="text-[10px] font-hud font-semibold uppercase tracking-widest text-white/40">
          Weekly Reflection
        </h3>
        {prompts.map((p) => (
          <div
            key={p.label}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/5"
          >
            <Target className="h-3.5 w-3.5 mt-0.5 text-brand-neon/50 shrink-0" />
            <div>
              <div className="text-[10px] font-hud text-white/50 uppercase tracking-wider mb-0.5">
                {p.label}
              </div>
              <div className="text-xs text-white/70 leading-relaxed">
                {p.prompt}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {consistencyDelta < 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
          <TrendingUp className="h-4 w-4 text-brand-neon shrink-0" />
          <span className="text-xs text-white/70">
            You logged fewer days this week. Try a{" "}
            <strong className="text-brand-neon">Top 3 Today</strong> to start
            each morning small.
          </span>
        </div>
      )}
      {thisWeek.daysLogged >= 6 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <Star className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-white/70">
            Incredible consistency! You logged{" "}
            <strong className="text-emerald-400">{thisWeek.daysLogged}/7</strong>{" "}
            days this week. Your Future Self is proud.
          </span>
        </div>
      )}
    </div>
  );
}
