/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppHeader — Desktop header (date + email) + Mobile header (logo + level + status).
 * Mobile: sticky, blurred, compact iOS-style with level/XP badge.
 */

import { type FC } from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";
import KintsugiBrain from "./KintsugiBrain";

interface AppHeaderProps {
  offlineMode: boolean;
  hasCloudUser: boolean;
  currentEmail?: string | null;
  onGoogleLogin: () => void;
  profileLevel?: number;
  xpInLevel?: number;
  totalSeams?: number;
  maxStreak?: number;
  activeStreakCount?: number;
}

const AppHeader: FC<AppHeaderProps> = ({
  offlineMode,
  hasCloudUser,
  currentEmail,
  onGoogleLogin,
  profileLevel = 1,
  xpInLevel = 0,
  totalSeams = 0,
  maxStreak = 0,
  activeStreakCount = 0,
}) => {
  const xpPct = Math.max(0, Math.min(100, xpInLevel));
  // Streak is hot when ≥3 days. Pulse animation pulled from index.css.
  const streakHot = maxStreak >= 3;

  return (
    <>
      {/* Compact header (desktop) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-neutral-850/60">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!offlineMode && hasCloudUser && (
            <span className="text-[10px] text-neutral-500 font-mono">{currentEmail}</span>
          )}
        </div>
      </header>

      {/* Mobile header — sticky, blurred, compact iOS-style */}
      <header
        className="md:hidden sticky top-0 z-40 backdrop-blur-xl bg-black/55 border-b border-white/[0.06] px-4 pb-2.5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.6rem)" }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo + LV badge */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 rounded-[10px] bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-md shadow-brand/30 shrink-0"
            >
              <KintsugiBrain size={20} />
            </motion.div>

            {/* Compact level + XP progress */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">LV</span>
                <span className="text-[15px] font-bold text-white tabular-nums leading-none">{profileLevel}</span>
                {/* Streak chip — pulses gold when hot (≥3 days) */}
                {maxStreak > 0 && (
                  <motion.span
                    animate={streakHot ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={streakHot ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
                    className={`ml-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      streakHot
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                        : "bg-white/[0.07] text-white/55"
                    }`}
                    title={`${activeStreakCount} active streak${activeStreakCount === 1 ? "" : "s"}`}
                  >
                    <Flame className="h-2.5 w-2.5" />
                    <span className="tabular-nums">{maxStreak}d</span>
                  </motion.span>
                )}
                {totalSeams > 0 && (
                  <span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold" title="Gold seams">
                    <span aria-hidden>✦</span>
                    {totalSeams}
                  </span>
                )}
              </div>
              <div className="mt-1 relative h-1 w-full max-w-[140px] rounded-full overflow-hidden bg-white/[0.07]">
                <motion.div
                  initial={false}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 24 }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-neon via-gold to-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Status pill */}
          {!offlineMode && hasCloudUser ? (
            <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              SYNCED
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 ring-1 ring-amber-500/40 px-2.5 py-1 text-[10px] font-bold text-amber-300 tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
                OFFLINE
              </div>
              <motion.button
                onClick={onGoogleLogin}
                whileTap={{ scale: 0.94 }}
                className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
              >
                Sync
              </motion.button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default AppHeader;
