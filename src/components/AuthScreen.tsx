/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { loginWithGoogle } from "../supabase";
import { Shield, Sparkles, User, Ghost } from "lucide-react";
import KintsugiBrain from "./KintsugiBrain";
import { motion } from "motion/react";

interface AuthScreenProps {
  onLogin: (user: any) => void;
  onContinueOffline: () => void;
}

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
      const user = await loginWithGoogle();
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        "Connection failed. Please check your config or use offline mode.",
      );
    } finally {
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

      {/* Outer Card */}
      <motion.div
        id="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md ios-card p-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          {/* Kintsugi Brain Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E] flex items-center justify-center mb-6">
            <KintsugiBrain size={32} className="opacity-90" />
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

          <div className="w-full border-b border-white/5 my-6" />

          {error && (
            <div className="w-full mb-6 p-3 bg-[#FF453A]/10 rounded-xl text-[13px] text-[#FF453A] text-left">
              {error}
            </div>
          )}

          <div className="space-y-3 w-full">
            {/* Google Authentication */}
            <button
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="ios-btn ios-btn-primary w-full text-[17px] font-semibold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield id="shield-icon" className="w-5 h-5" />
                  Sign in with Google
                </>
              )}
            </button>

            {/* Ghost Protocol */}
            <div className="flex flex-col items-center gap-1">
              <button
                id="offline-signin-btn"
                onClick={onContinueOffline}
                disabled={loading}
                className="ios-btn ios-btn-secondary w-full text-[15px]"
              >
                <Ghost className="w-5 h-5" />
                Ghost Protocol
              </button>
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
