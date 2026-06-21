/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { loginWithGoogle } from "../supabase";
import { Shield, Ghost, Flame, Star, Lock, Zap } from "lucide-react";
import KintsugiBrain from "./KintsugiBrain";
import { motion } from "motion/react";

interface AuthScreenProps {
  onLogin: (user: any) => void;
  onContinueOffline: () => void;
}

const RANKS = ["E", "D", "C", "B", "A", "S", "SS"] as const;

export default function AuthScreen({
  onLogin,
  onContinueOffline,
}: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // signInWithOAuth redirects to Google; user is set via onAuthStateChange
    } catch (err: any) {
      console.error(err);
      setError(
        "Connection failed. Please check your config or use offline mode.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated multi-gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(148,52,230,0.12),transparent_70%)] -top-32 -left-32 animate-[drift1_18s_ease-in-out_infinite_alternate]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.07),transparent_70%)] -bottom-24 -right-16 animate-[drift2_22s_ease-in-out_infinite_alternate]" />
        <div className="absolute w-[800px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(148,52,230,0.06),transparent_60%)] top-0 left-1/2 -translate-x-1/2 animate-[drift3_15s_ease-in-out_infinite_alternate]" />
      </div>

      {/* Floating ambient reward chips — taste of the game */}
      <FloatingChips />

      {/* Outer Card */}
      <motion.div
        id="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md ios-card p-7 relative z-10 overflow-hidden"
      >
        {/* Gold seam — subtle accent line across the top */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />

        <div className="flex flex-col items-center text-center">
          {/* Kintsugi Brain Emblem with breathing aura */}
          <div className="relative mb-6">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.25, 0.55] }}
              transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(148,52,230,0.55),transparent_70%)] blur-md"
            />
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.32, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3.6, ease: "easeOut", repeat: Infinity, delay: 0.6 }}
              className="absolute inset-0 rounded-2xl ring-1 ring-brand-neon/50"
            />
            <div className="relative w-16 h-16 rounded-2xl bg-[#1C1C1E] flex items-center justify-center ring-1 ring-white/10">
              <KintsugiBrain size={32} className="opacity-90" />
            </div>
          </div>

          <h1 className="text-[32px] font-display font-bold tracking-widest text-white">
            <span className="text-ascend">Ascend</span>
          </h1>
          <p className="text-[15px] text-white/50 mt-3 max-w-xs leading-snug">
            Become who you keep saying you'll become.
          </p>
          <p className="text-[13px] text-white/30 mt-2 max-w-xs leading-relaxed">
            E-Rank → S-Rank. How far can you push your real self?
          </p>

          {/* Animated rank ladder — visual backing for the copy above */}
          <RankLadder />

          <div className="w-full border-b border-white/5 my-5" />

          {error && (
            <div className="w-full mb-5 p-3 bg-[#FF453A]/10 rounded-xl text-[13px] text-[#FF453A] text-left">
              {error}
            </div>
          )}

          <div className="space-y-3 w-full">
            {/* Google Authentication — shimmer + spring tap */}
            <motion.button
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="relative ios-btn ios-btn-primary w-full text-[17px] font-semibold overflow-hidden"
            >
              {/* Diagonal shimmer sweep */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                animate={{ left: ["-50%", "150%"] }}
                transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.6 }}
              />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield id="shield-icon" className="w-5 h-5" />
                  Sign in with Google
                </>
              )}
            </motion.button>

            {/* Ghost Protocol */}
            <div className="flex flex-col items-center gap-1">
              <motion.button
                id="offline-signin-btn"
                onClick={onContinueOffline}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="ios-btn ios-btn-secondary w-full text-[15px] relative"
              >
                <Ghost className="w-5 h-5" />
                Ghost Protocol
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/60">
                  <Lock className="h-2.5 w-2.5" /> SS LOCKED
                </span>
              </motion.button>
              <p className="text-[11px] text-white/25 max-w-xs text-center leading-snug mt-1">
                Ghosts can't expand beyond 3 domains or reach SS-Rank.
                Sync anytime to preserve your progress.
              </p>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-white/20 max-w-xs">
            No credit card. No commitment. Your data stays local until you're ready.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────────── helpers ───────────────────────────── */

function RankLadder() {
  return (
    <div className="mt-5 w-full">
      <div className="flex items-center justify-between gap-1">
        {RANKS.map((rank, i) => {
          const isFirst = i === 0;
          const isS = rank === "S";
          const isSS = rank === "SS";
          return (
            <motion.div
              key={rank}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06, type: "spring", stiffness: 220, damping: 20 }}
              className={`relative flex-1 flex flex-col items-center gap-1.5`}
            >
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold tracking-tight ring-1 ${
                  isFirst
                    ? "bg-white/10 text-white ring-white/30"
                    : isSS
                    ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-black ring-white/40 shadow-lg shadow-amber-500/30"
                    : isS
                    ? "bg-gradient-to-br from-brand to-brand-neon text-white ring-brand-neon/60 shadow-md shadow-brand/40"
                    : "bg-white/[0.04] text-white/35 ring-white/10"
                }`}
              >
                {rank}
                {isFirst && (
                  <motion.span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
                {isSS && (
                  <Lock className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-black/60 p-0.5 text-amber-200" />
                )}
              </div>
              {/* connector line to next rank */}
              {i < RANKS.length - 1 && (
                <div className="absolute left-[60%] right-[-40%] top-3.5 h-px overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.5 }}
                    className={`h-full origin-left ${
                      i < 4 ? "bg-white/15" : "bg-gradient-to-r from-brand-neon/60 via-gold/60 to-amber-300/60"
                    }`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
        Your rank ladder
      </p>
    </div>
  );
}

function FloatingChips() {
  const chips: { icon: typeof Flame; label: string; color: string; left: string; delay: number }[] = [
    { icon: Zap, label: "+15 XP", color: "from-amber-400 to-yellow-500 text-black", left: "8%", delay: 0 },
    { icon: Flame, label: "Day 1", color: "from-orange-400 to-rose-500 text-white", left: "72%", delay: 1.6 },
    { icon: Star, label: "LV 1", color: "from-brand to-brand-neon text-white", left: "18%", delay: 3.2 },
    { icon: Zap, label: "+25 XP", color: "from-amber-400 to-yellow-500 text-black", left: "82%", delay: 4.8 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {chips.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={i}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-15vh", opacity: [0, 0.6, 0.6, 0] }}
            transition={{
              duration: 9,
              delay: c.delay,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "linear",
              times: [0, 0.15, 0.85, 1],
            }}
            className="absolute"
            style={{ left: c.left }}
          >
            <div
              className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${c.color} px-2 py-0.5 text-[10px] font-bold shadow-md`}
            >
              <Icon className="h-2.5 w-2.5" />
              {c.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
