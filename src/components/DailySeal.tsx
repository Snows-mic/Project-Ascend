/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DailySeal — Solo-Leveling "sealed directives" header card for the Today tab.
 *
 * Behavior:
 *  - Picks up to 3 of today's daily/core-habit quests (priority then XP).
 *  - On first view of the day, shows a "[ SYSTEM ] // 3 directives sealed" ritual
 *    with an Accept CTA. Accepting saves to localStorage keyed by date.
 *  - Once accepted: reveals the 3 sealed quests with live progress + a
 *    countdown to midnight (loss-aversion).
 *  - Fully derived from existing quests + DailyLog — no data-model change.
 */

import { useEffect, useMemo, useState, type FC } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ShieldCheck, Check } from "lucide-react";
import { Quest, DailyLog } from "../types";
import { PRIORITY_META } from "../data";
import { haptic } from "../haptics";

interface DailySealProps {
  quests: Quest[];
  todayLog: DailyLog;
  onToggleQuest: (id: string) => void;
}

const SEAL_KEY = (date: string) => `projectff_seal_${date}`;

function pickSealedQuests(quests: Quest[]): Quest[] {
  // Daily quests + core habits, ordered by priority (high→low) then XP.
  const priorityRank: Record<string, number> = { high: 0, med: 1, low: 2 };
  return quests
    .filter((q) => q.type === "daily" || q.isCoreHabit)
    .sort((a, b) => {
      const pa = priorityRank[a.priority ?? "low"] ?? 3;
      const pb = priorityRank[b.priority ?? "low"] ?? 3;
      if (pa !== pb) return pa - pb;
      return (b.xpReward ?? 0) - (a.xpReward ?? 0);
    })
    .slice(0, 3);
}

const DailySeal: FC<DailySealProps> = ({ quests, todayLog, onToggleQuest }) => {
  const today = todayLog.date;
  const sealed = useMemo(() => pickSealedQuests(quests), [quests]);

  // Acceptance is stored as `{ acceptedAt }` in localStorage, scoped by date.
  const [acceptedAt, setAcceptedAt] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SEAL_KEY(today));
      if (!raw) return null;
      return JSON.parse(raw).acceptedAt ?? null;
    } catch {
      return null;
    }
  });

  // Live countdown to midnight, refreshed every minute.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const msToMidnight = useMemo(() => {
    const d = new Date(now);
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    return Math.max(0, m - now);
  }, [now]);
  const hLeft = Math.floor(msToMidnight / 3_600_000);
  const mLeft = Math.floor((msToMidnight % 3_600_000) / 60_000);

  // Nothing to seal? Hide entirely so the user isn't nagged.
  if (sealed.length === 0) return null;

  const isDone = (q: Quest) => todayLog.completedTasks[q.id] ?? q.completed;
  const cleared = sealed.filter(isDone).length;
  const allCleared = cleared === sealed.length;

  const acceptSeal = () => {
    haptic("streak");
    const stamp = new Date().toISOString();
    setAcceptedAt(stamp);
    try {
      localStorage.setItem(SEAL_KEY(today), JSON.stringify({ acceptedAt: stamp }));
    } catch {
      /* ignore */
    }
  };

  // ── PRE-ACCEPT STATE ────────────────────────────────────────────────
  if (!acceptedAt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative overflow-hidden rounded-2xl border border-brand-neon/40 bg-gradient-to-br from-brand/15 via-black/55 to-gold/10 p-4 shadow-lg shadow-brand/20"
      >
        {/* Gold seam */}
        <span aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

        <div className="flex items-center gap-2">
          <span className="font-hud text-[9px] tracking-[0.25em] text-brand-neon">[ SYSTEM ]</span>
          <span className="font-mono text-[9px] tracking-widest text-white/30">// DAILY CONTRACT</span>
        </div>
        <h3 className="mt-1.5 font-display text-[18px] font-bold tracking-tight text-white">
          {sealed.length} directive{sealed.length === 1 ? "" : "s"} sealed for today.
        </h3>
        <p className="mt-1 text-[12px] text-white/55 leading-snug">
          Contract closes in <span className="text-amber-300 tabular-nums">{hLeft}h {String(mLeft).padStart(2, "0")}m</span>. Accept to reveal.
        </p>

        {/* Sealed previews — locked, blurred */}
        <div className="mt-3 space-y-1.5">
          {sealed.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-2 rounded-lg bg-black/40 ring-1 ring-white/[0.05] px-3 py-2"
            >
              <Lock className="h-3.5 w-3.5 shrink-0 text-brand-neon/60" />
              <span className="select-none font-mono text-[11px] tracking-wider text-white/40 blur-[3px]">
                {q.title.replace(/./g, "▮")}
              </span>
              <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-white/40">
                +{q.xpReward} XP
              </span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={acceptSeal}
          whileTap={{ scale: 0.97 }}
          className="relative mt-3.5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand via-brand-neon to-gold py-3 text-[14px] font-semibold text-white shadow-md shadow-brand/30"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            animate={{ left: ["-50%", "150%"] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
          />
          <span className="relative inline-flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Accept the contract
          </span>
        </motion.button>
      </motion.div>
    );
  }

  // ── ACCEPTED STATE ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-brand-neon/30 bg-black/50 p-4"
    >
      <span aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-hud text-[9px] tracking-[0.25em] text-brand-neon">[ SYSTEM ]</span>
          <span className="font-mono text-[9px] tracking-widest text-white/30">// SEALED · ACCEPTED</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
          allCleared
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
            : hLeft < 3
              ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
              : "bg-white/[0.06] text-white/55"
        }`}>
          {allCleared ? "ALL CLEAR" : `${hLeft}h ${String(mLeft).padStart(2, "0")}m left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={false}
          animate={{ width: `${(cleared / sealed.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 24 }}
          className={`h-full ${
            allCleared
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-brand-neon via-amber-400 to-gold"
          }`}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-white/40">
        <span>{cleared} / {sealed.length} cleared</span>
        <span>Accepted {new Date(acceptedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
      </div>

      {/* Quest list — tap to mark complete inline */}
      <div className="mt-2.5 space-y-1.5">
        <AnimatePresence initial={false}>
          {sealed.map((q) => {
            const done = isDone(q);
            return (
              <motion.button
                key={q.id}
                onClick={() => onToggleQuest(q.id)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
                  done
                    ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                    : `bg-white/[0.03] ring-1 ring-white/[0.06] active:bg-white/[0.06] ${
                        q.priority ? PRIORITY_META[q.priority].border : ""
                      }`
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-emerald-500 text-white"
                      : "bg-white/[0.08] text-transparent group-active:bg-white/[0.12]"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className={`min-w-0 flex-1 truncate text-[13px] ${
                  done ? "text-white/45 line-through" : "text-white"
                }`}>
                  {q.title}
                </span>
                <span className={`shrink-0 font-mono text-[10px] ${
                  done ? "text-emerald-300" : "text-amber-300"
                }`}>
                  +{q.xpReward} XP
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailySeal;
