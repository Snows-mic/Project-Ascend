/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FutureSelf — the Living Future Self avatar.
 *
 * The emotional centerpiece: a visible character that evolves as the user
 * progresses. It shows
 *   - an XP-progress ring that fills toward the next level,
 *   - a visual TIER that changes at level breakpoints (color, aura, title),
 *   - accumulating gold Kintsugi SEAMS — one golden crack per comeback after a
 *     broken streak, literally rendering the "repair with gold" philosophy.
 */

import KintsugiBrain from "./KintsugiBrain";
import { motion } from "motion/react";

export interface FutureSelfTier {
  name: string;
  min: number;
  ring: [string, string];
  aura: string;
}

export const FUTURE_SELF_TIERS: FutureSelfTier[] = [
  { name: "Vessel", min: 1, ring: ["#6b7280", "#a855f7"], aura: "rgba(168,85,247,0.22)" },
  { name: "Kindled", min: 5, ring: ["#3506ee", "#a855f7"], aura: "rgba(168,85,247,0.34)" },
  { name: "Forged", min: 10, ring: ["#a855f7", "#f5d061"], aura: "rgba(245,208,97,0.30)" },
  { name: "Gilded", min: 25, ring: ["#f5d061", "#d4af37"], aura: "rgba(212,175,55,0.42)" },
  { name: "Ascendant", min: 50, ring: ["#d4af37", "#ffffff"], aura: "rgba(245,208,97,0.55)" },
];

/** Resolve the tier for a level, plus the level of the next evolution (if any). */
export function futureSelfTier(level: number): {
  tier: FutureSelfTier;
  index: number;
  next: number | null;
} {
  let index = 0;
  for (let i = 0; i < FUTURE_SELF_TIERS.length; i++) {
    if (level >= FUTURE_SELF_TIERS[i].min) index = i;
  }
  const next =
    index < FUTURE_SELF_TIERS.length - 1
      ? FUTURE_SELF_TIERS[index + 1].min
      : null;
  return { tier: FUTURE_SELF_TIERS[index], index, next };
}

interface FutureSelfProps {
  level: number;
  xpInLevel: number; // 0–100, progress toward next level
  seams: number; // total Kintsugi gold seams (comebacks)
  size?: number;
}

const RING_R = 44;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

export default function FutureSelf({
  level,
  xpInLevel,
  seams,
  size = 76,
}: FutureSelfProps) {
  const { tier, index } = futureSelfTier(level);
  const progress = Math.max(0, Math.min(100, xpInLevel));
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const uid = `fs-${index}`;

  // Deterministic gold seams fanned across the avatar (cap the visual count).
  const seamCount = Math.min(seams, 8);
  const seamLines = Array.from({ length: seamCount }).map((_, i) => {
    const ang = ((i * 47 + 20) * Math.PI) / 180;
    return {
      x1: 50 + Math.cos(ang) * 15,
      y1: 50 + Math.sin(ang) * 15,
      x2: 50 + Math.cos(ang) * 39,
      y2: 50 + Math.sin(ang) * 39,
    };
  });

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`${tier.name} · Level ${level}`}
    >
      {/* Aura */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl pointer-events-none"
        style={{ background: tier.aura }}
        animate={{ opacity: [0.55, 0.9, 0.55], scale: [0.92, 1.04, 0.92] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* XP ring */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id={`${uid}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.ring[0]} />
            <stop offset="100%" stopColor={tier.ring[1]} />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke="#1c1c20"
          strokeWidth="5"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={RING_R}
          fill="none"
          stroke={`url(#${uid}-ring)`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>

      {/* Center disc + emblem */}
      <div
        className="absolute rounded-full flex items-center justify-center border"
        style={{
          inset: size * 0.16,
          background: `radial-gradient(circle at 35% 30%, ${tier.ring[1]}33, #0a0a0c)`,
          borderColor: `${tier.ring[1]}55`,
        }}
      >
        <KintsugiBrain size={size * 0.42} />
      </div>

      {/* Gold Kintsugi seams (over the disc) */}
      {seamCount > 0 && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 pointer-events-none"
          width={size}
          height={size}
        >
          <defs>
            <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d061" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
          </defs>
          {seamLines.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={`url(#${uid}-gold)`}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.9"
            />
          ))}
        </svg>
      )}

      {/* Level badge */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-neutral-100 border shadow-md"
        style={{
          background: "#0a0a0c",
          borderColor: `${tier.ring[1]}66`,
        }}
      >
        {level}
      </div>
    </div>
  );
}
