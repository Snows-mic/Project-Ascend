/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * OnboardingScreen — Identity (pillar) selection + Choose Your Path.
 *
 * Phase 0 friction refactor:
 *  - Removed the weight-% step (weights now auto-distribute evenly).
 *  - Soft-capped pillar selection at 3 ("focus on 3 to start").
 *  - Replaced free-text goal inputs with tappable goal chips.
 * Phase 1:
 *  - Replaced the 3 difficulty buttons with the 4-gamemode "Choose Your Path" selector.
 */

import { useEffect, useState } from "react";
import {
  AVAILABLE_PILLARS,
  defaultPillarWeights,
  PILLAR_GOAL_CHIPS,
  GAMEMODES,
  getGameMode,
} from "../data";
import { QuestionnaireAnswers, GameMode, Quest } from "../types";
import {
  Check,
  ArrowLeft,
  Target,
  Sparkles,
  Flame,
  Zap,
  Brain,
  DollarSign,
  Users,
  BookOpen,
  Sun,
  PenTool,
  Briefcase,
  Sprout,
  Hammer,
  Crown,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import KintsugiBrain from "./KintsugiBrain";
import FutureSelf from "./FutureSelf";

const MAX_PILLARS = 3;

const PILLAR_ICONS: Record<string, LucideIcon> = {
  Flame,
  Brain,
  Target,
  DollarSign,
  Users,
  BookOpen,
  Sun,
  PenTool,
  Briefcase,
};

/** Map gamemode emoji → lucide icon so glyphs never render as raw text on mobile */
const GAMEMODE_ICONS: Record<string, LucideIcon> = {
  Sprout: Sprout,
  Flame: Flame,
  Hammer: Hammer,
  Crown: Crown,
};

interface OnboardingScreenProps {
  onComplete: (
    pillarIds: string[],
    weights: Record<string, number>,
    questionnaire: QuestionnaireAnswers,
    opts?: { seedFirstQuest?: boolean; customQuests?: Quest[]; systemName?: string },
  ) => void;
  /** Explore mode = user hasn't chosen auth yet; show the conversion at reveal. */
  exploreMode?: boolean;
  /** Finalize the auth choice at the dopamine peak (after onComplete persists). */
  onConvert?: (method: "google" | "offline") => void;
  /** Returning-user escape hatch from the first onboarding screen. */
  onRequestAuth?: () => void;
}

type Step = "naming" | "trial" | "pillars" | "questionnaire" | "forge" | "reveal";

type QuestDraft = { title: string; type: "daily" | "weekly" };

export default function OnboardingScreen({
  onComplete,
  exploreMode = false,
  onConvert,
  onRequestAuth,
}: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>("naming");
  const [systemName, setSystemName] = useState("");
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [timePerDay, setTimePerDay] = useState(60);
  const [gameMode, setGameMode] = useState<GameMode>("momentum");
  const [pillarGoals, setPillarGoals] = useState<Record<string, string>>({});
  const [questDrafts, setQuestDrafts] = useState<Record<string, QuestDraft>>({});

  const setDraftTitle = (pid: string, title: string) => {
    setQuestDrafts((prev) => ({
      ...prev,
      [pid]: { title, type: prev[pid]?.type ?? "daily" },
    }));
  };
  const setDraftType = (pid: string, type: "daily" | "weekly") => {
    setQuestDrafts((prev) => ({
      ...prev,
      [pid]: { title: prev[pid]?.title ?? "", type },
    }));
  };

  const allDraftsReady =
    selectedPillars.length > 0 &&
    selectedPillars.every((pid) => (questDrafts[pid]?.title ?? "").trim().length > 0);

  const buildQuestsFromDrafts = (): Quest[] =>
    selectedPillars.map((pid) => {
      const draft = questDrafts[pid] ?? { title: "", type: "daily" as const };
      const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
      const isWeekly = draft.type === "weekly";
      return {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${pid}`,
        title: draft.title.trim(),
        description: `Your ${def?.label ?? pid} ${isWeekly ? "weekly" : "daily"} quest.`,
        pillar: pid,
        xpReward: isWeekly ? 50 : 15,
        completed: false,
        type: draft.type,
      };
    });

  const firstPillarDef = AVAILABLE_PILLARS.find(
    (p) => p.id === selectedPillars[0],
  );
  const firstQuestXp = Math.round(15 * getGameMode(gameMode).xpMultiplier);

  const atPillarCap = selectedPillars.length >= MAX_PILLARS;

  const togglePillar = (id: string) => {
    setSelectedPillars((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= MAX_PILLARS) return prev; // soft cap — focus on 3
      return [...prev, id];
    });
  };

  const goToQuestionnaire = () => {
    if (selectedPillars.length === 0) return;
    const goals: Record<string, string> = {};
    for (const pid of selectedPillars) goals[pid] = pillarGoals[pid] || "";
    setPillarGoals(goals);
    setStep("questionnaire");
  };

  const setGoalChip = (pid: string, chip: string) => {
    setPillarGoals((prev) => ({
      ...prev,
      [pid]: prev[pid] === chip ? "" : chip, // tap again to clear
    }));
  };

  const handleComplete = () => {
    // Weights auto-distribute evenly — no manual weighting step anymore.
    onComplete(
      selectedPillars,
      defaultPillarWeights(selectedPillars),
      { timePerDay, gameMode, pillarGoals },
      {
        seedFirstQuest: true,
        customQuests: buildQuestsFromDrafts(),
        systemName: systemName.trim() || undefined,
      },
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "100dvh" }}>
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#0A84FF]/5 to-transparent pointer-events-none" />

      {/* Step indicator — breadcrumb */}
      <div className="relative z-10 mb-8 flex items-center gap-2 flex-wrap justify-center">
        <span className={`font-hud text-[10px] tracking-widest uppercase font-semibold ${step === "naming" || step === "trial" ? "text-brand" : "text-white/30"}`}>
          IDENTIFY
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[10px] tracking-widest uppercase font-semibold ${step === "pillars" ? "text-brand" : "text-white/30"}`}>
          DOMAINS
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[10px] tracking-widest uppercase font-semibold ${step === "questionnaire" ? "text-brand" : "text-white/30"}`}>
          FOCUS
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[10px] tracking-widest uppercase font-semibold ${step === "forge" ? "text-brand" : "text-white/30"}`}>
          FORGE
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[10px] tracking-widest uppercase font-semibold ${step === "reveal" ? "text-brand" : "text-white/30"}`}>
          INIT
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "naming" && (
          <motion.div
            key="naming"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="ios-card w-full max-w-md p-6 sm:p-7 relative z-10 overflow-hidden"
          >
            {/* Top gold seam */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="absolute top-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            />

            {/* SYSTEM badge with scanning aura */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <motion.div
                  aria-hidden
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(148,52,230,0.55),transparent_70%)] blur-md"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1C1C1E] ring-1 ring-brand-neon/50">
                  <Terminal className="h-7 w-7 text-brand-neon" />
                </div>
              </div>

              {/* Typewriter-style SYSTEM line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg bg-black/40 ring-1 ring-brand-neon/30 px-3 py-1.5 mb-3"
              >
                <span className="font-hud text-[10px] tracking-[0.2em] text-brand-neon">
                  [ SYSTEM ] // IDENTIFICATION REQUIRED
                </span>
              </motion.div>

              <h2 className="text-[22px] font-display font-bold tracking-wider text-white">
                Designate your codename.
              </h2>
              <p className="mt-2 text-[13px] text-white/55 leading-relaxed max-w-xs">
                The System will address you by this name from now on.
                Pick something that sounds like you — when you've Ascended.
              </p>

              {/* Input + animated caret */}
              <div className="mt-6 w-full">
                <div className="relative">
                  <input
                    autoFocus
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value.slice(0, 24))}
                    placeholder="e.g. Shadow, Raven, Arcline…"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-brand-neon/30 bg-black/40 px-4 py-4 pr-12 text-center text-[20px] font-display font-bold tracking-wider text-white placeholder:font-sans placeholder:font-normal placeholder:text-[14px] placeholder:tracking-normal placeholder:text-white/30 focus:border-brand-neon focus:outline-none focus:ring-2 focus:ring-brand-neon/30"
                  />
                  <motion.span
                    aria-hidden
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-brand-neon"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
                  <span>2–24 characters</span>
                  <span className="tabular-nums">{systemName.length}/24</span>
                </div>
              </div>

              {/* Live preview — SYSTEM addressing the user */}
              <AnimatePresence mode="wait">
                {systemName.trim().length >= 2 && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 w-full rounded-xl bg-brand/10 ring-1 ring-brand-neon/40 px-4 py-3 text-left"
                  >
                    <div className="font-hud text-[9px] tracking-[0.2em] text-brand-neon mb-1">
                      [ PREVIEW ]
                    </div>
                    <p className="text-[13px] text-white/85 leading-relaxed">
                      <span className="text-brand-neon">Welcome, </span>
                      <span className="font-display font-bold tracking-wide text-white">
                        {systemName.trim()}
                      </span>
                      <span className="text-white/70">. Your ascension begins.</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => setStep("trial")}
                disabled={systemName.trim().length < 2}
                whileTap={systemName.trim().length >= 2 ? { scale: 0.97 } : {}}
                className={`mt-6 w-full relative overflow-hidden rounded-xl py-3.5 text-[15px] font-semibold transition-colors ${
                  systemName.trim().length >= 2
                    ? "bg-gradient-to-r from-brand via-brand-neon to-gold text-white shadow-lg shadow-brand/30"
                    : "bg-white/[0.05] text-white/30"
                }`}
              >
                {systemName.trim().length >= 2 && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                    animate={{ left: ["-50%", "150%"] }}
                    transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }}
                  />
                )}
                <span className="relative">Confirm identity →</span>
              </motion.button>

              {onRequestAuth && (
                <button
                  onClick={onRequestAuth}
                  className="mt-3 text-[12px] text-white/30 underline-offset-4 hover:text-white/60 hover:underline"
                >
                  Already have an account?
                </button>
              )}
            </div>
          </motion.div>
        )}

        {step === "trial" && (
          <TrialStep
            codename={systemName.trim()}
            onComplete={() => setStep("pillars")}
            onSkip={() => setStep("pillars")}
          />
        )}

        {step === "pillars" && (
          <motion.div
            key="pillars"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10"
          >
            <div className="text-center mb-5">
              {/* Hero emblem with animated progress arc */}
              <div className="relative mx-auto mb-3 w-20 h-20">
                <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <motion.circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke="url(#domainProgressGrad)" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15.5}
                    initial={false}
                    animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - selectedPillars.length / MAX_PILLARS) }}
                    transition={{ type: "spring", stiffness: 110, damping: 22 }}
                  />
                  <defs>
                    <linearGradient id="domainProgressGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#9434E6" />
                      <stop offset="100%" stopColor="#C9A84C" />
                    </linearGradient>
                  </defs>
                </svg>
                <motion.div
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-brand/25 to-gold/15 flex items-center justify-center"
                  animate={
                    selectedPillars.length === MAX_PILLARS
                      ? { scale: [1, 1.08, 1], boxShadow: [
                          "0 0 0 0 rgba(201,168,76,0.5)",
                          "0 0 0 14px rgba(201,168,76,0)",
                          "0 0 0 0 rgba(201,168,76,0)",
                        ] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.8, repeat: selectedPillars.length === MAX_PILLARS ? Infinity : 0 }}
                >
                  <KintsugiBrain size={28} />
                </motion.div>
              </div>

              <h1 className="text-[26px] font-display font-bold tracking-widest text-white">
                SELECT YOUR DOMAINS
              </h1>
              <p className="text-[13px] text-white/50 mt-1 leading-snug max-w-xs mx-auto">
                The System will build your quest board around these. Choose up to 3.
              </p>

              {/* Slot indicators — RPG character-slot style */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: MAX_PILLARS }).map((_, i) => {
                  const filled = i < selectedPillars.length;
                  const pillarId = selectedPillars[i];
                  const def = pillarId ? AVAILABLE_PILLARS.find((p) => p.id === pillarId) : null;
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={filled ? { scale: [0.6, 1.15, 1] } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 360, damping: 18 }}
                      className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                        filled
                          ? `bg-gradient-to-r ${def?.color ?? "from-brand to-brand-neon"} text-white ring-white/30 shadow-md`
                          : "bg-white/[0.04] text-white/30 ring-white/10"
                      }`}
                    >
                      <span className="opacity-90">SLOT {i + 1}</span>
                      {filled && <Check className="h-3 w-3" />}
                    </motion.div>
                  );
                })}
              </div>

              <span className={`inline-block mt-2.5 text-[11px] font-semibold px-3 py-0.5 rounded-full ${
                selectedPillars.length === MAX_PILLARS
                  ? "bg-gold/15 text-gold"
                  : selectedPillars.length > 0
                  ? "bg-ios-blue/15 text-ios-blue"
                  : "bg-white/5 text-white/30"
              }`}>
                {selectedPillars.length} / {MAX_PILLARS} selected
              </span>
            </div>

            {/* Compact 2-column grid — mobile-first */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {AVAILABLE_PILLARS.map((pillar, idx) => {
                const isSelected = selectedPillars.includes(pillar.id);
                const isLocked = atPillarCap && !isSelected;
                const Icon = PILLAR_ICONS[pillar.icon] || Flame;
                return (
                  <motion.button
                    key={pillar.id}
                    onClick={() => togglePillar(pillar.id)}
                    disabled={isLocked}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * idx, type: "spring", stiffness: 220, damping: 22 }}
                    whileTap={{ scale: isLocked ? 1 : 0.94 }}
                    className={`relative overflow-hidden flex flex-col items-center gap-2 p-3.5 rounded-2xl text-center transition-all duration-200 ${
                      isSelected
                        ? "border border-white/20 shadow-lg"
                        : isLocked
                          ? "bg-[#1C1C1E]/40 border border-white/5 opacity-35"
                          : "bg-[#1C1C1E] border border-white/5 active:bg-[#2C2C2E]"
                    }`}
                    style={
                      isSelected
                        ? {
                            background:
                              "linear-gradient(140deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%)",
                          }
                        : undefined
                    }
                  >
                    {/* Selected — pillar gradient halo behind icon */}
                    {isSelected && (
                      <motion.div
                        aria-hidden
                        className={`absolute inset-0 opacity-25 bg-gradient-to-br ${pillar.color}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                      />
                    )}

                    <motion.div
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
                      animate={isSelected ? { rotate: [0, -6, 0] } : { rotate: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 14 }}
                    >
                      <div
                        className={`absolute inset-0 rounded-xl ${
                          isSelected ? `bg-gradient-to-br ${pillar.color} shadow-lg` : "bg-[#2C2C2E]"
                        }`}
                      />
                      {isSelected && (
                        <motion.div
                          aria-hidden
                          className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${pillar.color} blur-md opacity-60`}
                          animate={{ opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                        />
                      )}
                      <span className="relative">
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white drop-shadow" />
                        ) : (
                          <Icon className="w-5 h-5 text-white/40" />
                        )}
                      </span>
                    </motion.div>

                    {/* "+1 SLOT" reward chip when selected — top-right */}
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, y: -4, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        className="absolute top-1.5 right-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-extrabold text-black"
                      >
                        +SLOT
                      </motion.span>
                    )}

                    {isLocked && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-white/40">
                        FULL
                      </span>
                    )}

                    <div className="relative">
                      <h3 className={`text-[13px] font-semibold leading-tight ${isSelected ? "text-white" : "text-white/75"}`}>
                        {pillar.label}
                      </h3>
                      <p className="text-[10px] text-white/35 mt-0.5 leading-snug line-clamp-2">
                        {pillar.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={goToQuestionnaire}
              disabled={selectedPillars.length === 0}
              whileTap={{ scale: 0.97 }}
              className={`relative w-full overflow-hidden rounded-2xl py-3.5 text-[17px] font-semibold text-white shadow-xl disabled:opacity-30 transition-opacity duration-300 ${
                selectedPillars.length === MAX_PILLARS
                  ? "bg-gradient-to-r from-brand via-brand-neon to-gold"
                  : "bg-brand"
              }`}
            >
              {selectedPillars.length === MAX_PILLARS && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                  animate={{ left: ["-50%", "150%"] }}
                  transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
                />
              )}
              <span className="relative">
                {selectedPillars.length === 0
                  ? "Select at least 1 Domain to continue"
                  : selectedPillars.length === 3
                    ? "INITIALIZE YOUR SYSTEM →"
                    : `INITIALIZE WITH ${selectedPillars.length} DOMAIN${selectedPillars.length > 1 ? "S" : ""} →`}
              </span>
            </motion.button>

            {onRequestAuth && (
              <button
                onClick={onRequestAuth}
                className="w-full mt-4 text-[15px] text-ios-blue font-medium active:opacity-60"
              >
                Already ascending? Sign in
              </button>
            )}
          </motion.div>
        )}

        {step === "questionnaire" && (() => {
          const activeMode = GAMEMODES.find((m) => m.id === gameMode) ?? GAMEMODES[1];
          const ActiveIcon = GAMEMODE_ICONS[activeMode.emoji] ?? Flame;
          const timeLabel =
            timePerDay <= 30 ? "Quick"
            : timePerDay <= 60 ? "Standard"
            : timePerDay <= 120 ? "Deep"
            : "Marathon";
          const timePct = Math.min(100, ((timePerDay - 15) / (240 - 15)) * 100);
          const intensityPct = Math.round((activeMode.xpMultiplier / 1.5) * 100);
          const questPct = (activeMode.dailyQuests / 5) * 100;
          return (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep("pillars")}
                className="w-9 h-9 flex items-center justify-center rounded-full active:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 text-ios-blue" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-hud text-[9px] tracking-[0.2em] text-brand-neon">[ SYSTEM ]</span>
                  <span className="font-mono text-[9px] tracking-widest text-white/30">// PROTOCOL SELECT</span>
                </div>
                <h2 className="text-[20px] font-display font-bold tracking-widest text-white">CHOOSE YOUR PROTOCOL</h2>
                <p className="text-[12px] text-white/40 leading-tight">How hard should The System push you? Tap to preview.</p>
              </div>
            </div>

            <div className="space-y-4 mb-5 max-h-[60vh] overflow-y-auto pr-1 -mr-1 pb-1">
              {/* ── Hero card — animated gradient stage for the selected mode ── */}
              <motion.div
                key={activeMode.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${activeMode.accent} p-5 shadow-2xl`}
              >
                {/* subtle radial highlight */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black/30 to-transparent" />

                <div className="relative flex items-start gap-4">
                  <motion.div
                    initial={{ rotate: -8, scale: 0.85 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 ring-1 ring-white/30 shadow-lg"
                  >
                    <ActiveIcon className="w-8 h-8 text-white drop-shadow" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    {activeMode.recommended && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white tracking-wider uppercase mb-1.5 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Recommended
                      </span>
                    )}
                    <h3 className="text-[28px] font-display font-bold tracking-tight text-white leading-none">
                      {activeMode.name}
                    </h3>
                    <p className="text-[13px] text-white/80 mt-1">{activeMode.tagline}</p>
                  </div>
                </div>

                {/* Stat grid */}
                <div className="relative mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-black/25 backdrop-blur-sm px-2.5 py-2 ring-1 ring-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">XP</div>
                    <div className="text-[15px] font-bold text-white tabular-nums">{activeMode.xpLabel}</div>
                  </div>
                  <div className="rounded-xl bg-black/25 backdrop-blur-sm px-2.5 py-2 ring-1 ring-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Quests</div>
                    <div className="text-[15px] font-bold text-white tabular-nums">{activeMode.dailyQuests}/day</div>
                  </div>
                  <div className="rounded-xl bg-black/25 backdrop-blur-sm px-2.5 py-2 ring-1 ring-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Streak</div>
                    <div className="text-[12px] font-bold text-white leading-tight">{activeMode.streakShort}</div>
                  </div>
                </div>

                {/* Hook */}
                <div className="relative mt-4 pt-3 border-t border-white/15">
                  <p className="text-[13px] italic text-white/90 leading-snug">&ldquo;{activeMode.hook}&rdquo;</p>
                </div>

                {/* Intensity meters */}
                <div className="relative mt-3 space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                      <span>Intensity</span><span>{Math.round(activeMode.xpMultiplier * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <motion.div
                        key={`int-${activeMode.id}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${intensityPct}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 22, delay: 0.08 }}
                        className="h-full rounded-full bg-white/85"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                      <span>Volume</span><span>{activeMode.dailyQuests}/5</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                      <motion.div
                        key={`vol-${activeMode.id}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${questPct}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 22, delay: 0.14 }}
                        className="h-full rounded-full bg-white/85"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Mode picker strip — horizontal snap-scroll ── */}
              <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                {GAMEMODES.map((m) => {
                  const selected = gameMode === m.id;
                  const Icon = GAMEMODE_ICONS[m.emoji] ?? Flame;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setGameMode(m.id)}
                      whileTap={{ scale: 0.94 }}
                      className={`relative shrink-0 snap-start rounded-2xl p-2.5 w-[78px] flex flex-col items-center gap-1.5 transition-all duration-200 ${
                        selected
                          ? "bg-white/10 ring-1 ring-white/40 shadow-lg"
                          : "bg-[#1C1C1E] ring-1 ring-white/5"
                      }`}
                    >
                      <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${m.accent} flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                        {selected && (
                          <motion.div
                            layoutId="mode-active-dot"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                          />
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold leading-none ${selected ? "text-white" : "text-white/55"}`}>
                        {m.name}
                      </span>
                      {m.recommended && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-ios-blue ring-2 ring-black"></span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* ── Daily time investment — gamified slider ── */}
              <div className="ios-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[12px] font-semibold text-white/80 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-ios-blue" />
                    Daily Time
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ios-blue/15 text-ios-blue">
                      {timeLabel}
                    </span>
                    <span className="text-[18px] font-bold text-white tabular-nums">{timePerDay}m</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.05] mb-2">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-ios-blue to-amber-400"
                    style={{ width: `${timePct}%` }}
                  />
                  <input
                    type="range"
                    min={15}
                    max={240}
                    step={15}
                    value={timePerDay}
                    onChange={(e) => setTimePerDay(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-lg ring-2 ring-ios-blue pointer-events-none"
                    style={{ left: `${timePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] uppercase tracking-wider text-white/30 font-semibold">
                  <span>15m</span><span>1h</span><span>2h</span><span>4h</span>
                </div>
                {timePerDay >= 90 && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-amber-400 mt-2.5 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Deep-work bonus unlocked
                  </motion.p>
                )}
              </div>

              {/* ── Primary objective chips ── */}
              <div className="ios-card p-4">
                <label className="text-[12px] font-semibold text-white/80 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                  <Target className="w-3.5 h-3.5 text-ios-blue" />
                  Primary Objective
                </label>
                <div className="space-y-3">
                  {selectedPillars.map((pid, pidx) => {
                    const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
                    const chips = PILLAR_GOAL_CHIPS[pid] || [];
                    return (
                      <motion.div
                        key={pid}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * pidx }}
                      >
                        <span className="text-[11px] text-white/40 block mb-1.5 font-medium">{def?.label}</span>
                        <div className="flex flex-wrap gap-2">
                          {chips.map((chip) => {
                            const active = pillarGoals[pid] === chip;
                            return (
                              <motion.button
                                key={chip}
                                onClick={() => setGoalChip(pid, chip)}
                                whileTap={{ scale: 0.93 }}
                                className={`ios-chip ${active ? "ios-chip-active" : ""}`}
                              >
                                {chip}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setStep("forge")}
              whileTap={{ scale: 0.97 }}
              className={`relative w-full overflow-hidden rounded-2xl py-3.5 text-[17px] font-semibold text-white shadow-xl bg-gradient-to-r ${activeMode.accent} flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-5 h-5" />
              Forge Your First Quests
            </motion.button>
          </motion.div>
          );
        })()}

        {step === "forge" && (
          <motion.div
            key="forge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10"
          >
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setStep("questionnaire")}
                className="w-9 h-9 flex items-center justify-center rounded-full active:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 text-ios-blue" />
              </button>
              <div>
                <h2 className="text-[20px] font-display font-bold tracking-widest text-white">
                  FORGE YOUR FIRST QUESTS
                </h2>
                <p className="text-[13px] text-white/40">
                  One quest per domain ({selectedPillars.length} total). These become your starting board.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-[55vh] overflow-y-auto pr-1">
              {selectedPillars.map((pid) => {
                const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
                const Icon = PILLAR_ICONS[def?.icon || "Flame"] || Flame;
                const draft = questDrafts[pid] ?? { title: "", type: "daily" as const };
                const ready = draft.title.trim().length > 0;
                return (
                  <div
                    key={pid}
                    className={`ios-card p-4 transition-colors ${
                      ready ? "border border-ios-blue/40" : "border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-ios-blue/15 text-ios-blue flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-semibold text-white block leading-tight">
                          {def?.label}
                        </span>
                        <span className="text-[11px] text-white/40 block leading-tight">
                          {pillarGoals[pid] || "What's one move you'll repeat?"}
                        </span>
                      </div>
                      {ready && <Check className="w-4 h-4 text-ios-blue shrink-0" />}
                    </div>

                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraftTitle(pid, e.target.value)}
                      placeholder={`e.g. ${({
                        health: "30-minute run before work",
                        mental: "10-minute morning meditation",
                        productivity: "Deep work block — no phone for 2hrs",
                        finance: "Track every expense today",
                        relationships: "Call someone I've been meaning to",
                        learning: "Study one chapter of current book",
                        faith: "Morning prayer + reflection",
                        creativity: "Sketch or write for 20 minutes",
                        career: "Ship one task from the backlog",
                      } as Record<string, string>)[def?.id ?? ""] ?? "Complete one focused task"}`}
                      maxLength={80}
                      className="w-full bg-[#0f0f12] border border-white/10 rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-ios-blue/60 mb-2.5"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDraftType(pid, "daily")}
                        className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                          draft.type === "daily"
                            ? "bg-ios-blue/15 text-ios-blue border border-ios-blue/40"
                            : "bg-[#1C1C1E] text-white/40 border border-white/5"
                        }`}
                      >
                        Daily · +15 XP
                      </button>
                      <button
                        onClick={() => setDraftType(pid, "weekly")}
                        className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                          draft.type === "weekly"
                            ? "bg-gold/15 text-gold border border-gold/40"
                            : "bg-[#1C1C1E] text-white/40 border border-white/5"
                        }`}
                      >
                        Weekly · +50 XP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep("reveal")}
              disabled={!allDraftsReady}
              className="ios-btn ios-btn-primary w-full text-[17px] font-semibold disabled:opacity-30 transition-opacity duration-300"
            >
              <Sparkles className="w-5 h-5" />
              {allDraftsReady
                ? "Reveal My Future Self"
                : `Name a quest for each domain (${
                    selectedPillars.filter((pid) => (questDrafts[pid]?.title ?? "").trim().length > 0).length
                  }/${selectedPillars.length})`}
            </button>
          </motion.div>
        )}

        {step === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10 text-center"
          >
            <button
              onClick={() => setStep("forge")}
              className="w-9 h-9 flex items-center justify-center rounded-full active:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-5 h-5 text-ios-blue" />
            </button>

            {/* Future Self avatar */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="mx-auto mb-5 flex justify-center"
            >
              <FutureSelf
                level={1}
                xpInLevel={Math.min(99, firstQuestXp)}
                seams={0}
                size={120}
              />
            </motion.div>

            <div className="mb-1 rounded-lg bg-black/40 px-3 py-1.5 ring-1 ring-brand-neon/30 inline-flex">
              <span className="font-hud text-[10px] tracking-[0.2em] text-brand-neon">
                [ SYSTEM ] // INITIALIZATION COMPLETE
              </span>
            </div>

            <h2 className="text-[28px] font-bold tracking-tight text-white mt-3">
              Meet Your{" "}
              <span className="text-ascend">Future Self</span>
            </h2>
            <p className="text-[15px] text-white/40 mt-2 leading-snug max-w-xs mx-auto">
              {selectedPillars.length} domain{selectedPillars.length !== 1 ? "s" : ""} locked in. {Object.values(questDrafts).filter(d => d.title.trim()).length} quest{Object.values(questDrafts).filter(d => d.title.trim()).length !== 1 ? "s" : ""} forged. The System is ready.
            </p>

            {/* Forged quest summary */}
            <div className="mt-5 mb-6 w-full space-y-2">
              {selectedPillars.map((pid, i) => {
                const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
                const draft = questDrafts[pid];
                const Icon = PILLAR_ICONS[def?.icon || "Flame"] || Flame;
                return (
                  <motion.div
                    key={pid}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 200, damping: 22 }}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] px-3 py-2.5 text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-brand-neon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-white block truncate">
                        {draft?.title || "—"}
                      </span>
                      <span className="text-[10px] text-white/40 block">
                        {def?.label} · {draft?.type === "weekly" ? "Weekly · +50 XP" : "Daily · +15 XP"}
                      </span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  </motion.div>
                );
              })}
            </div>

            {exploreMode ? (
              <div className="space-y-2.5">
                <motion.button
                  onClick={() => {
                    handleComplete();
                    onConvert?.("google");
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-neon to-gold py-3.5 text-[17px] font-semibold text-white shadow-xl flex items-center justify-center gap-2"
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                    animate={{ left: ["-50%", "150%"] }}
                    transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <Zap className="w-5 h-5" />
                  Begin Ascent — Save with Google
                </motion.button>
                <button
                  onClick={() => {
                    handleComplete();
                    onConvert?.("offline");
                  }}
                  className="ios-btn ios-btn-ghost w-full text-[15px]"
                >
                  Continue offline
                </button>
                <p className="text-[11px] text-white/30 text-center mt-1">
                  Save to sync across devices.
                </p>
              </div>
            ) : (
              <motion.button
                onClick={handleComplete}
                whileTap={{ scale: 0.97 }}
                className="relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-neon to-gold py-3.5 text-[17px] font-semibold text-white shadow-xl flex items-center justify-center gap-2"
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                  animate={{ left: ["-50%", "150%"] }}
                  transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
                />
                <Zap className="w-5 h-5" />
                Begin Ascent
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────── TrialStep ───────────────────────────── */
/**
 * First Trial — the System hands the user one sealed directive RIGHT after
 * they pick a codename, BEFORE pillar selection. Generic, instantly clearable
 * (a 60-second breathing exercise), so the user's first real interaction is
 * a quest completion with a System voice line + +XP burst.
 */
function TrialStep({
  codename,
  onComplete,
  onSkip,
}: {
  codename: string;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Once accepted, start a 60-second breathing timer; user can complete early.
  useEffect(() => {
    if (!accepted || completed) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [accepted, completed]);

  const fireComplete = () => {
    setCompleted(true);
    // Fire the same XP burst event the real loop uses — first real win.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ascend:xp-burst", {
          detail: { amount: 10, pillar: "mental", isBoss: false },
        }),
      );
    }
    // Brief celebration before continuing.
    setTimeout(onComplete, 1500);
  };

  return (
    <motion.div
      key="trial"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      className="ios-card relative z-10 w-full max-w-md overflow-hidden p-6 sm:p-7"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute top-0 left-0 right-0 h-px origin-left bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />

      <div className="flex flex-col items-center text-center">
        {/* SYSTEM banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-3 rounded-lg bg-black/40 px-3 py-1.5 ring-1 ring-brand-neon/30"
        >
          <span className="font-hud text-[10px] tracking-[0.2em] text-brand-neon">
            [ SYSTEM ] // FIRST DIRECTIVE
          </span>
        </motion.div>

        <h2 className="font-display text-[22px] font-bold tracking-wider text-white">
          Your trial begins, {codename || "Hunter"}.
        </h2>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/55">
          Before The System grants you domains, prove you can answer when called.
          One quest. Sixty seconds. Tap when ready.
        </p>

        {/* Quest panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 22 }}
          className="mt-5 w-full overflow-hidden rounded-2xl border border-brand-neon/30 bg-gradient-to-br from-brand/15 via-black/40 to-gold/10 p-4"
        >
          <div className="flex items-center gap-1.5 font-hud text-[9px] tracking-[0.2em] text-brand-neon">
            <span className="rounded bg-brand-neon/15 px-1.5 py-0.5">SEALED</span>
            <span className="text-white/40">·</span>
            <span className="text-white/50">+10 XP on clear</span>
          </div>
          <h3 className="mt-2 text-left font-display text-[18px] font-bold tracking-wide text-white">
            Three Breaths.
          </h3>
          <p className="mt-1 text-left text-[12px] leading-relaxed text-white/55">
            Inhale slowly for 4 counts. Hold for 4. Exhale for 6. Repeat three times.
            Notice that you are here.
          </p>

          {!accepted && !completed && (
            <motion.button
              onClick={() => setAccepted(true)}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand via-brand-neon to-gold py-3 text-[14px] font-semibold text-white shadow-lg shadow-brand/30"
            >
              Accept directive
            </motion.button>
          )}

          {accepted && !completed && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-black/30 px-3 py-2 text-left font-mono text-[11px] tracking-wider text-brand-neon">
                ▸ DIRECTIVE ACTIVE — {String(Math.floor(secondsLeft / 60)).padStart(1, "0")}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </div>
              <motion.button
                onClick={fireComplete}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-500/30"
              >
                Mark complete →
              </motion.button>
            </div>
          )}

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 rounded-xl bg-emerald-500/10 px-3 py-3 text-center ring-1 ring-emerald-500/30"
            >
              <div className="font-hud text-[9px] tracking-[0.2em] text-emerald-300">
                [ SYSTEM ] // FIRST QUEST CLEARED
              </div>
              <div className="mt-1 text-[13px] font-semibold text-white">
                +10 XP · Welcome to the loop.
              </div>
            </motion.div>
          )}
        </motion.div>

        <button
          onClick={onSkip}
          className="mt-4 text-[11px] text-white/30 underline-offset-4 hover:text-white/60 hover:underline"
        >
          Skip first directive
        </button>
      </div>
    </motion.div>
  );
}
