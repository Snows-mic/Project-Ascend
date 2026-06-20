/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FocusRaid — a deep-work session reframed as a raid you can "fail" by leaving.
 * Kintsugi-branded (purple → gold), not the Solo Leveling cyan. The ring drains
 * over the session; clearing it forges focus into gold. Leaving early is handled
 * gently (brand = forgiveness): "the gate closes, come back when ready" — no
 * shame, but no reward either (the commitment device that makes it work).
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Swords, Target } from "lucide-react";
import KintsugiBrain from "./KintsugiBrain";
import { haptic } from "../haptics";

interface FocusRaidProps {
  open: boolean;
  sessionsCleared: number;
  onComplete: (minutes: number) => void;
  onClose: () => void;
}

type Phase = "setup" | "active" | "cleared";

const DURATIONS = [25, 60, 90];
const FOCUS_PREF_KEY = "projectff_focus_minutes";

/** Last-used focus duration (persisted), default 25. */
function loadFocusPref(): number {
  const n = Number(localStorage.getItem(FOCUS_PREF_KEY));
  return DURATIONS.includes(n) ? n : 25;
}
const RING_R = 130;
const CIRC = 2 * Math.PI * RING_R;

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusRaid({
  open,
  sessionsCleared,
  onComplete,
  onClose,
}: FocusRaidProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(loadFocusPref);
  const [objective, setObjective] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const firedRef = useRef(false);

  // Reset everything each time the overlay opens.
  useEffect(() => {
    if (open) {
      setPhase("setup");
      setObjective("");
      setMinutes(loadFocusPref());
      setConfirmLeave(false);
      firedRef.current = false;
    }
  }, [open]);

  // Countdown.
  useEffect(() => {
    if (phase !== "active") return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Fire completion exactly once when the timer empties.
  useEffect(() => {
    if (phase === "active" && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      haptic("levelup");
      setPhase("cleared");
      onComplete(minutes);
    }
  }, [phase, remaining, minutes, onComplete]);

  const enter = () => {
    haptic("tap");
    setRemaining(minutes * 60);
    setPhase("active");
  };

  const total = minutes * 60;
  const progress = total > 0 ? 1 - remaining / total : 0; // 0 → 1
  const dashOffset = CIRC * (1 - progress);
  const isCleared = phase === "cleared";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-neutral-950 px-6 text-center"
        >
          {/* Atmosphere — brand purple, calm */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(53,6,238,0.16),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* Close (setup only — leaving mid-raid uses Retreat) */}
          {phase === "setup" && (
            <button
              onClick={onClose}
              className="absolute right-5 top-[calc(1.25rem+env(safe-area-inset-top))] z-10 rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* ───────────── SETUP ───────────── */}
          {phase === "setup" && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 w-full max-w-sm"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-neon/40 bg-gradient-to-tr from-brand/30 to-neutral-900 glow-purple">
                <Target className="h-7 w-7 text-brand-neon" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ascend">
                Deep Focus
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Enter the gate. No distractions until it clears — leave early and
                it won't count.
              </p>
              {sessionsCleared > 0 && (
                <p className="mt-2 font-mono text-[10px] text-amber-300/80">
                  ⚔ {sessionsCleared} raids cleared
                </p>
              )}

              <input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What are you focusing on?"
                className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
              />

              <div className="mt-4 flex justify-center gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setMinutes(d);
                      localStorage.setItem(FOCUS_PREF_KEY, String(d));
                    }}
                    className={`rounded-xl border px-4 py-2.5 font-mono text-sm transition-all ${
                      minutes === d
                        ? "border-brand-neon bg-brand/20 text-brand-neon"
                        : "border-neutral-850 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>

              <button
                onClick={enter}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-display font-bold uppercase tracking-wide text-white hover:bg-brand-dark transition-colors glow-purple"
              >
                <Swords className="h-4 w-4" />
                Enter the Gate
              </button>
            </motion.div>
          )}

          {/* ───────────── ACTIVE / CLEARED ───────────── */}
          {(phase === "active" || phase === "cleared") && (
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative h-72 w-72">
                <svg viewBox="0 0 300 300" className="h-72 w-72 -rotate-90">
                  <defs>
                    <linearGradient id="raid-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isCleared ? "#f5d061" : "#3506ee"} />
                      <stop offset="100%" stopColor={isCleared ? "#d4af37" : "#a855f7"} />
                    </linearGradient>
                  </defs>
                  <circle cx="150" cy="150" r={RING_R} fill="none" stroke="#1c1c20" strokeWidth="6" />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r={RING_R}
                    fill="none"
                    stroke="url(#raid-ring)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    animate={{ strokeDashoffset: isCleared ? 0 : dashOffset }}
                    transition={{ duration: 0.9, ease: "linear" }}
                    style={{
                      filter: isCleared
                        ? "drop-shadow(0 0 10px rgba(245,208,97,0.6))"
                        : "drop-shadow(0 0 6px rgba(168,85,247,0.4))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isCleared ? (
                    <>
                      <KintsugiBrain size={44} />
                      <span className="mt-2 font-display text-lg font-bold uppercase tracking-tight text-ascend">
                        Cleared
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-5xl font-bold tabular-nums text-neutral-100">
                      {fmt(remaining)}
                    </span>
                  )}
                </div>
              </div>

              {objective && !isCleared && (
                <p className="mt-6 max-w-xs text-sm text-neutral-300">{objective}</p>
              )}

              {isCleared ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex flex-col items-center"
                >
                  <p className="font-mono text-xs text-amber-300">
                    +{minutes} XP · focus forged into gold
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 h-12 rounded-xl bg-brand px-8 text-sm font-display font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
                  >
                    Return
                  </button>
                </motion.div>
              ) : (
                <div className="mt-8">
                  {confirmLeave ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-mono text-[11px] text-neutral-400">
                        Leave the raid? This session won't count.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={onClose}
                          className="rounded-lg border border-neutral-800 px-4 py-2 text-xs text-neutral-300 hover:text-white"
                        >
                          The gate closes
                        </button>
                        <button
                          onClick={() => setConfirmLeave(false)}
                          className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white"
                        >
                          Keep going
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmLeave(true)}
                      className="font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70"
                    >
                      Retreat
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
