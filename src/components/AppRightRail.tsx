/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppRightRail — Desktop right rail with FutureSelf, pillar streaks, and quick stats.
 * Extracted from App.tsx Step 4.
 */

import { type FC } from "react";
import FutureSelf from "./FutureSelf";

interface PillarStreak {
  id: string;
  streak: number;
  freezes: number;
}

interface AppRightRailProps {
  profileLevel: number;
  profileXp: number;
  xpInLevel: number;
  totalSeams: number;
  pillarIds: string[];
  pillarStreaks: PillarStreak[];
  achievementCount: number;
}

const AppRightRail: FC<AppRightRailProps> = ({
  profileLevel,
  profileXp,
  xpInLevel,
  totalSeams,
  pillarIds,
  pillarStreaks,
  achievementCount,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-l border-neutral-850 bg-neutral-900/40 backdrop-blur-sm relative z-10 p-5 gap-5 overflow-y-auto">
      {/* Future Self avatar */}
      <div className="flex flex-col items-center">
        <FutureSelf
          level={profileLevel}
          xpInLevel={xpInLevel}
          seams={totalSeams}
          size={100}
        />
        <span className="text-[10px] text-neutral-500 font-mono mt-1">
          {xpInLevel}/100 XP to next level
        </span>
      </div>

      {/* Pillar streak cards */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-sans font-semibold text-neutral-500 uppercase tracking-wider">
          Pillar Streaks
        </h3>
        {pillarStreaks.map((ps) => (
          <div
            key={ps.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-850/50 border border-neutral-850"
          >
            <span className="text-xs font-mono text-neutral-300 capitalize">{ps.id}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-neon font-bold">
                {ps.streak}d
              </span>
              {ps.freezes > 0 && (
                <span className="text-[10px] font-mono text-cyan-400">
                  ❄️{ps.freezes}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-sans font-semibold text-neutral-500 uppercase tracking-wider">
          Stats
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 rounded-lg bg-neutral-850/50 border border-neutral-850">
            <span className="text-[10px] text-neutral-500 font-mono">Seams</span>
            <p className="text-sm font-mono text-yellow-400 font-bold">{totalSeams}</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-neutral-850/50 border border-neutral-850">
            <span className="text-[10px] text-neutral-500 font-mono">Pillars</span>
            <p className="text-sm font-mono text-neutral-200 font-bold">{pillarIds.length}</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-neutral-850/50 border border-neutral-850">
            <span className="text-[10px] text-neutral-500 font-mono">Level</span>
            <p className="text-sm font-mono text-brand-neon font-bold">{profileLevel}</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-neutral-850/50 border border-neutral-850">
            <span className="text-[10px] text-neutral-500 font-mono">Achieve</span>
            <p className="text-sm font-mono text-amber-400 font-bold">
              {achievementCount}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppRightRail;
