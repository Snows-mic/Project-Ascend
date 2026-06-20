/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RadarChart — "The Shape of You". Six fixed attribute axes (Option B):
 * pillars are domains, attributes are stats, so every player's shape is
 * comparable on identical axes (the foundation for the future social layer).
 *
 * Pure presentational: everything is derived live from profile + quests
 * (computeAttributes) — no stored state, no migration. Stroke color follows
 * the Future Self tier ramp so the chart levels up with the avatar.
 */

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Swords } from "lucide-react";
import { UserProfile, Quest } from "../types";
import {
  computeAttributes,
  ATTRIBUTES,
  PILLAR_TO_ATTRIBUTE,
  getPillarDef,
} from "../data";
import { futureSelfTier } from "./FutureSelf";

interface RadarChartProps {
  profile: UserProfile;
  quests: Quest[];
}

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 102; // outer radius
const RINGS = [0.33, 0.66, 1];

/** Point on axis i (of 6) at radius fraction f. */
function pt(i: number, f: number): [number, number] {
  const ang = (Math.PI / 3) * i - Math.PI / 2; // start at top, clockwise
  return [CX + Math.cos(ang) * R * f, CY + Math.sin(ang) * R * f];
}

function pathFrom(fractions: number[]): string {
  return (
    fractions
      .map((f, i) => {
        const [x, y] = pt(i, Math.max(0.02, f));
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export default function RadarChart({ profile, quests }: RadarChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [showLegend, setShowLegend] = useState(false);

  const attrs = useMemo(() => computeAttributes(profile), [profile]);
  const maxXp = Math.max(300, ...attrs.map((a) => a.xp));
  const fractions = attrs.map((a) => a.xp / maxXp);
  const isEmpty = attrs.every((a) => a.xp === 0);
  const topAttr = attrs.reduce((best, a) => (a.xp > best.xp ? a : best), attrs[0]);

  const { tier } = futureSelfTier(profile.level);

  const bossesDefeated = useMemo(
    () =>
      quests
        .filter((q) => q.isBoss)
        .reduce((sum, q) => sum + (profile.participation?.[q.id] ?? 0), 0),
    [quests, profile.participation],
  );

  // Active pillars grouped by the attribute they feed (for the legend)
  const legendRows = ATTRIBUTES.map((a) => {
    const feeders = Object.keys(profile.pillars)
      .filter((pid) => (PILLAR_TO_ATTRIBUTE[pid] ?? "focus") === a.id)
      .map((pid) => getPillarDef(pid)?.label ?? pid);
    if (a.id === "resolve") feeders.push("Streaks & comebacks");
    return { ...a, feeders };
  });

  return (
    <div className="system-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-tight text-neutral-100">
            The Shape of You
          </h3>
          <p className="mt-0.5 font-mono text-[10px] text-neutral-500">
            {isEmpty
              ? "Your shape begins with your first quest."
              : `Strongest: ${topAttr.emoji} ${topAttr.name} · Lv ${topAttr.level}`}
          </p>
        </div>
        {bossesDefeated > 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 font-mono text-[10px] text-rose-300">
            <Swords className="h-3 w-3" />
            {bossesDefeated} boss{bossesDefeated !== 1 ? "es" : ""} slain
          </span>
        )}
      </div>

      <div className="mt-2 flex justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-[320px]"
          role="img"
          aria-label={`Attribute radar: ${attrs.map((a) => `${a.name} level ${a.level}`).join(", ")}`}
        >
          <defs>
            <linearGradient id={`${uid}-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3506ee" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.ring[0]} />
              <stop offset="100%" stopColor={tier.ring[1]} />
            </linearGradient>
          </defs>

          {/* Grid rings */}
          {RINGS.map((f) => (
            <path
              key={f}
              d={pathFrom([f, f, f, f, f, f])}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          ))}
          {/* Axis spokes */}
          {ATTRIBUTES.map((_, i) => {
            const [x, y] = pt(i, 1);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
            );
          })}

          {/* The shape */}
          <motion.path
            initial={{ d: pathFrom([0.02, 0.02, 0.02, 0.02, 0.02, 0.02]) }}
            animate={{ d: pathFrom(fractions) }}
            transition={{ type: "spring", stiffness: 80, damping: 16 }}
            fill={`url(#${uid}-fill)`}
            stroke={`url(#${uid}-stroke)`}
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.35))" }}
          />

          {/* Vertices — gold for the strongest attribute */}
          {fractions.map((f, i) => {
            const [x, y] = pt(i, Math.max(0.02, f));
            const isTop = !isEmpty && attrs[i].id === topAttr.id;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={isTop ? 4 : 2.5}
                fill={isTop ? "#f5d061" : "#a855f7"}
                style={
                  isTop
                    ? { filter: "drop-shadow(0 0 5px rgba(245,208,97,0.7))" }
                    : undefined
                }
              />
            );
          })}

          {/* Labels */}
          {attrs.map((a, i) => {
            const [x, y] = pt(i, 1.22);
            return (
              <text
                key={a.id}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-neutral-400"
                style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              >
                <tspan x={x} dy="-0.45em">
                  {a.emoji} {a.name}
                </tspan>
                <tspan
                  x={x}
                  dy="1.25em"
                  style={{ fontSize: 9 }}
                  className={a.xp > 0 ? "fill-brand-neon" : "fill-neutral-600"}
                >
                  Lv {a.level}
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>

      {/* Transparent mapping — how stats grow */}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="mt-1 flex w-full items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white/70"
      >
        <span>How stats grow</span>
        {showLegend ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {showLegend && (
        <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2">
          {legendRows.map((row) => (
            <div key={row.id} className="flex items-baseline justify-between gap-3">
              <span className="shrink-0 text-[11px] font-semibold text-neutral-200">
                {row.emoji} {row.name}
              </span>
              <span className="text-right font-mono text-[10px] text-neutral-500">
                {row.feeders.length > 0 ? row.feeders.join(" · ") : "—"}
              </span>
            </div>
          ))}
          <p className="pt-1 text-[10px] leading-relaxed text-neutral-500">
            Resolve is the Kintsugi stat — every streak day and every comeback
            makes it stronger.
          </p>
        </div>
      )}
    </div>
  );
}
