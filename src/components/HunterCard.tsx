/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * HunterCard — Solo-Leveling-style identity card that headers the Stats tab.
 *  - Codename + active title + rank badge
 *  - 6 attributes (Focus / Vitality / Clarity / Influence / Growth / Resolve)
 *    with RAW values, rendered as a tight stat block (no chart, no fluff)
 *  - Renders ABOVE the existing Overview (Dashboard) so the original design stays intact.
 */

import { type FC } from "react";
import { motion } from "motion/react";
import { UserProfile, Quest } from "../types";
import {
  computeAttributes,
  getRankForLevel,
  activeTitle,
} from "../data";
import KintsugiBrain from "./KintsugiBrain";

interface HunterCardProps {
  profile: UserProfile;
  quests: Quest[];
  journalStreak?: number;
  focusSessions?: number;
}

const HunterCard: FC<HunterCardProps> = ({ profile, journalStreak = 0, focusSessions = 0 }) => {
  const attrs = computeAttributes({ pillars: profile.pillars });
  const rank = getRankForLevel(profile.level);

  // Aggregate signals used by Titles
  const seamsTotal = Object.values(profile.pillars).reduce((s, p) => s + (p.seams ?? 0), 0);
  const maxStreak = Math.max(0, ...Object.values(profile.pillars).map((p) => p.streak ?? 0));
  const maxLongest = Math.max(
    0,
    ...Object.values(profile.pillars).map((p) => p.longestStreak ?? 0),
  );

  const title = activeTitle({
    pillars: profile.pillars,
    seamsTotal,
    maxStreak,
    maxLongest,
    journalStreak,
    focusSessions,
    level: profile.level,
  });

  const codename = profile.systemName?.trim() || profile.displayName?.split(" ")[0] || "Hunter";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="ios-card relative overflow-hidden p-5"
    >
      {/* Top gold seam */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />

      {/* SYSTEM tag row */}
      <div className="mb-3 flex items-center gap-2">
        <span className="font-hud text-[9px] tracking-[0.25em] text-brand-neon">
          [ SYSTEM ]
        </span>
        <span className="font-mono text-[9px] tracking-widest text-white/30">// HUNTER PROFILE</span>
      </div>

      {/* Identity row */}
      <div className="flex items-center gap-3">
        {/* Emblem with pulsing aura */}
        <div className="relative shrink-0">
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.18, 0.5] }}
            transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(148,52,230,0.55),transparent_70%)] blur-md"
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1C1C1E] ring-1 ring-brand-neon/40">
            <KintsugiBrain size={28} />
          </div>
        </div>

        {/* Codename + title */}
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[22px] font-bold tracking-wide text-white">
            {codename}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 font-hud text-[10px] font-bold tracking-wider text-brand-neon ring-1 ring-brand-neon/30">
              {rank.rank}
            </span>
            {title && (
              <span
                title={title.description}
                className="rounded-full bg-gold/15 px-2 py-0.5 font-hud text-[10px] font-bold tracking-wider text-gold ring-1 ring-gold/40"
              >
                {title.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attribute stat block */}
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {attrs.map((a) => (
          <div
            key={a.id}
            className="rounded-xl bg-white/[0.03] ring-1 ring-white/[0.05] px-2.5 py-2"
          >
            <div className="font-hud text-[9px] uppercase tracking-widest text-white/40 truncate">
              {a.name}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-[18px] font-extrabold tabular-nums leading-none text-white">
                {a.level}
              </span>
              <span className="font-mono text-[10px] text-white/30 tabular-nums">
                / {a.xp}
              </span>
            </div>
            {/* Mini progress within current level (xp % 100) */}
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={false}
                animate={{ width: `${a.xp % 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
                className={`h-full rounded-full ${
                  a.id === "resolve"
                    ? "bg-gradient-to-r from-gold to-amber-300"
                    : "bg-gradient-to-r from-brand to-brand-neon"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Flavor */}
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-white/35">
        Rank evaluated by The System. Level = floor(attribute XP / 100) + 1.
      </p>
    </motion.div>
  );
};

export default HunterCard;
