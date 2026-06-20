/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SkillTree — consistency-gated skill trees, one per selected pillar.
 *
 * Design rules (from the habit blueprint):
 *  - Nodes are VISIBLE but locked (anticipation needs a target — never blank).
 *  - Unlocks are earned through repetition/streak milestones, never raw XP —
 *    consistency is the only currency (habit consolidation, not bingeing).
 *  - The Kintsugi node honors a comeback as a skill in its own right.
 *  - State is fully DERIVED from PillarStats + participation: no storage,
 *    no migration, retroactive by construction.
 */

import { UserProfile, Quest } from "../types";
import {
  getPillarDef,
  SKILL_NODES,
  pillarCompletions,
} from "../data";
import { Lock, Check } from "lucide-react";
import { motion } from "motion/react";

interface SkillTreeProps {
  profile: UserProfile;
  quests: Quest[];
}

export default function SkillTree({ profile, quests }: SkillTreeProps) {
  const pillarIds = Object.keys(profile.pillars);

  if (pillarIds.length === 0) {
    return (
      <div className="system-card rounded-2xl p-6 text-center">
        <p className="text-sm text-white/50">
          Choose your pillars in onboarding to grow your skill trees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="system-card relative overflow-hidden rounded-2xl p-5">
        <span aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-neon/60 to-transparent" />
        <div className="flex items-center gap-2">
          <span className="font-hud text-[9px] tracking-[0.25em] text-brand-neon">[ SYSTEM ]</span>
          <span className="font-mono text-[9px] tracking-widest text-white/30">// SKILL TREES</span>
        </div>
        <h3 className="mt-2 font-display text-[20px] font-bold tracking-tight text-neutral-100">
          Earned, never bought.
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-400">
          Skills unlock through <span className="text-brand-neon">consistency</span> —
          streaks, repetitions, and comebacks. XP can't buy them. Each tier
          rewires what you are, not what you can do.
        </p>
      </div>

      {pillarIds.map((pid) => {
        const def = getPillarDef(pid);
        const stats = profile.pillars[pid];
        const completions = pillarCompletions(pid, quests, profile.participation);
        const states = SKILL_NODES.map((n) => n.check(stats, completions));
        const unlockedCount = states.filter(Boolean).length;
        // The "next up" node = first locked node (the goal-gradient target)
        const nextIdx = states.findIndex((u) => !u);

        return (
          <div key={pid} className="system-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-sans font-bold text-neutral-100">
                  {def?.label ?? pid}
                </h4>
                <p className="font-mono text-[10px] text-neutral-500">
                  Lv {stats.level} · {completions} reps ·{" "}
                  {Math.max(stats.streak, stats.longestStreak ?? 0)}d best streak
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] ${
                  unlockedCount === SKILL_NODES.length
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-brand/40 bg-brand/10 text-brand-neon"
                }`}
              >
                {unlockedCount} / {SKILL_NODES.length}
              </span>
            </div>

            <div className="relative ml-5">
              {/* Spine */}
              <div className="absolute -left-[1px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-neon/50 via-neutral-800 to-neutral-850" />

              <div className="space-y-3">
                {SKILL_NODES.map((node, i) => {
                  const unlocked = states[i];
                  const isNext = i === nextIdx;
                  return (
                    <div key={node.id} className="relative flex items-start gap-3">
                      {/* Node dot */}
                      <motion.div
                        initial={false}
                        animate={
                          unlocked
                            ? { scale: 1, opacity: 1 }
                            : { scale: 0.92, opacity: isNext ? 1 : 0.6 }
                        }
                        className={`z-10 -ml-[18px] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm ${
                          unlocked
                            ? "border-amber-400/50 bg-gradient-to-tr from-brand/40 to-amber-500/30 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                            : isNext
                              ? "border-brand-neon/40 bg-neutral-900"
                              : "border-neutral-800 bg-neutral-950"
                        }`}
                      >
                        {unlocked ? (
                          <span>{node.emoji}</span>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-neutral-600" />
                        )}
                      </motion.div>

                      <div className={`min-w-0 pb-1 ${unlocked ? "" : isNext ? "" : "opacity-55"}`}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-xs font-sans font-bold ${
                              unlocked ? "text-amber-200" : "text-neutral-300"
                            }`}
                          >
                            {node.name}
                          </span>
                          {unlocked ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                              <Check className="h-2.5 w-2.5" /> Unlocked
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono ${
                                isNext
                                  ? "bg-brand/15 text-brand-neon"
                                  : "bg-white/[0.05] text-neutral-500"
                              }`}
                            >
                              {isNext ? "Next: " : ""}
                              {node.requirement}
                            </span>
                          )}
                        </div>
                        {/* Perk — System-voice description of what the unlock represents */}
                        {node.perk && (
                          <p
                            className={`mt-0.5 text-[11px] leading-relaxed ${
                              unlocked ? "text-amber-100/80 italic" : "text-neutral-400"
                            }`}
                          >
                            {node.perk}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500">
                          {node.science}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
