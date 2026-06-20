/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * XpBurst — global overlay that listens for "ascend:xp-burst" events and
 * shows a [ SYSTEM ] ticker line announcing the quest clear + attribute raised.
 * Solo-Leveling System-voice flavor on top of the existing dopamine hit.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PILLAR_TO_ATTRIBUTE, ATTRIBUTES } from "../data";

type Burst = {
  id: number;
  amount: number;
  isBoss: boolean;
  attrName: string;
  attrDelta: number;
};

const SHARDS = 10;

function attrFromPillar(pillar?: string): { name: string; delta: number } {
  const attrId = (pillar && PILLAR_TO_ATTRIBUTE[pillar]) || "focus";
  const a = ATTRIBUTES.find((x) => x.id === attrId);
  return { name: (a?.name ?? "Focus").toUpperCase(), delta: 1 };
}

export default function XpBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number; pillar?: string; isBoss?: boolean }>).detail;
      if (!detail || !detail.amount) return;
      const { name, delta } = attrFromPillar(detail.pillar);
      const id = ++counter;
      setBursts((prev) => [
        ...prev,
        {
          id,
          amount: detail.amount,
          isBoss: !!detail.isBoss,
          attrName: name,
          attrDelta: delta,
        },
      ]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1900);
    };
    window.addEventListener("ascend:xp-burst", handler);
    return () => window.removeEventListener("ascend:xp-burst", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2"
      style={{ top: "calc(env(safe-area-inset-top) + 5rem)" }}
    >
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative"
          >
            <div
              className={`relative overflow-hidden rounded-2xl border px-4 py-2.5 backdrop-blur-xl ${
                b.isBoss
                  ? "border-rose-400/40 bg-rose-950/70 shadow-lg shadow-rose-500/30"
                  : "border-brand-neon/40 bg-black/70 shadow-lg shadow-brand/30"
              }`}
            >
              {/* SYSTEM tag */}
              <div className="flex items-center gap-2">
                <span
                  className={`font-hud text-[9px] tracking-[0.25em] ${
                    b.isBoss ? "text-rose-300" : "text-brand-neon"
                  }`}
                >
                  [ SYSTEM ]
                </span>
                <span className="font-mono text-[9px] tracking-widest text-white/35">//</span>
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 }}
                  className="font-mono text-[10px] tracking-wider text-white/70"
                >
                  {b.isBoss ? "Boss slain." : "Quest complete."}
                </motion.span>
              </div>

              {/* +XP and attribute delta */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="mt-1 flex items-baseline gap-3"
              >
                <span
                  className={`text-[20px] font-extrabold tabular-nums tracking-tight ${
                    b.isBoss
                      ? "bg-gradient-to-br from-rose-200 to-rose-400 bg-clip-text text-transparent"
                      : "bg-gradient-to-br from-amber-200 to-gold bg-clip-text text-transparent"
                  }`}
                >
                  +{b.amount} XP
                </span>
                <span className="font-mono text-[10px] text-white/40">•</span>
                <span className="font-mono text-[12px] font-bold tracking-wider text-white/90">
                  <span className="text-brand-neon">{b.attrName}</span>{" "}
                  <span className="text-emerald-300">+{b.attrDelta}</span>
                </span>
              </motion.div>

              {/* Scanline */}
              <motion.span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 ${
                  b.isBoss
                    ? "bg-gradient-to-r from-transparent via-rose-300/20 to-transparent"
                    : "bg-gradient-to-r from-transparent via-brand-neon/25 to-transparent"
                } skew-x-[-20deg]`}
                animate={{ left: ["-50%", "150%"] }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </div>

            {/* Radial shard burst — original celebration */}
            {Array.from({ length: SHARDS }).map((_, i) => {
              const angle = (i / SHARDS) * Math.PI * 2;
              const dist = 60;
              const dx = Math.cos(angle) * dist;
              const dy = Math.sin(angle) * dist;
              return (
                <motion.span
                  key={i}
                  className={`absolute left-1/2 top-1/2 h-1 w-1 rounded-full ${
                    b.isBoss ? "bg-rose-300" : "bg-brand-neon"
                  }`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: dx, y: dy, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
