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

import { useState } from "react";
import {
  AVAILABLE_PILLARS,
  defaultPillarWeights,
  PILLAR_GOAL_CHIPS,
  GAMEMODES,
  getGameMode,
} from "../data";
import { QuestionnaireAnswers, GameMode } from "../types";
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
    opts?: { seedFirstQuest?: boolean },
  ) => void;
  /** Explore mode = user hasn't chosen auth yet; show the conversion at reveal. */
  exploreMode?: boolean;
  /** Finalize the auth choice at the dopamine peak (after onComplete persists). */
  onConvert?: (method: "google" | "offline") => void;
  /** Returning-user escape hatch from the first onboarding screen. */
  onRequestAuth?: () => void;
}

type Step = "pillars" | "questionnaire" | "reveal";

export default function OnboardingScreen({
  onComplete,
  exploreMode = false,
  onConvert,
  onRequestAuth,
}: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>("pillars");
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [timePerDay, setTimePerDay] = useState(60);
  const [gameMode, setGameMode] = useState<GameMode>("momentum");
  const [pillarGoals, setPillarGoals] = useState<Record<string, string>>({});
  const [firstQuestDone, setFirstQuestDone] = useState(false);

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
      { seedFirstQuest: firstQuestDone },
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "100dvh" }}>
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#0A84FF]/5 to-transparent pointer-events-none" />

      {/* Step indicator — breadcrumb */}
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <span className={`font-hud text-[11px] tracking-widest uppercase font-semibold ${step === "pillars" ? "text-brand" : "text-white/30"}`}>
          DOMAINS
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[11px] tracking-widest uppercase font-semibold ${step === "questionnaire" ? "text-brand" : "text-white/30"}`}>
          FOCUS
        </span>
        <span className="text-white/20 text-[10px]">·</span>
        <span className={`font-hud text-[11px] tracking-widest uppercase font-semibold ${step === "reveal" ? "text-brand" : "text-white/30"}`}>
          INITIALIZE
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "pillars" && (
          <motion.div
            key="pillars"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10"
          >
            <div className="text-center mb-6">
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br from-ios-blue/20 to-[#5E5CE6]/20 flex items-center justify-center mx-auto mb-3 ${selectedPillars.length === 3 ? "avatar-ready" : ""}`}
                style={{
                  filter: `brightness(${0.5 + selectedPillars.length * 0.167})`,
                  boxShadow: selectedPillars.length > 0
                    ? `0 0 ${20 + selectedPillars.length * 15}px rgba(148,52,230,${0.3 + selectedPillars.length * 0.133})`
                    : 'none',
                  transition: 'box-shadow 0.6s ease, filter 0.6s ease',
                }}
              >
                <KintsugiBrain size={24} />
              </div>
              <h1 className="text-[26px] font-display font-bold tracking-widest text-white">
                SELECT YOUR DOMAINS
              </h1>
              <p className="text-[13px] text-white/50 mt-1 leading-snug max-w-xs mx-auto">
                The System will build your quest board around these. Choose up to 3.
              </p>
              <span className={`inline-block mt-2.5 text-[12px] font-semibold px-3 py-1 rounded-full ${
                selectedPillars.length > 0
                  ? "bg-ios-blue/15 text-ios-blue"
                  : "bg-white/5 text-white/30"
              }`}>
                {selectedPillars.length} / {MAX_PILLARS} selected
              </span>
            </div>

            {/* Compact 2-column grid — mobile-first */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {AVAILABLE_PILLARS.map((pillar) => {
                const isSelected = selectedPillars.includes(pillar.id);
                const isLocked = atPillarCap && !isSelected;
                const Icon = PILLAR_ICONS[pillar.icon] || Flame;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => togglePillar(pillar.id)}
                    disabled={isLocked}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl text-center transition-all duration-200 active:scale-[0.96] ${
                      isSelected
                        ? "bg-ios-blue/10 border border-ios-blue/40 shadow-sm shadow-ios-blue/10"
                        : isLocked
                          ? "bg-[#1C1C1E]/40 border border-white/5 opacity-35"
                          : "bg-[#1C1C1E] border border-white/5 active:bg-[#2C2C2E]"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-ios-blue text-white shadow-sm shadow-ios-blue/30"
                        : "bg-[#2C2C2E] text-white/40"
                    }`}>
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-[13px] font-semibold leading-tight ${isSelected ? "text-white" : "text-white/75"}`}>
                        {pillar.label}
                      </h3>
                      <p className="text-[10px] text-white/35 mt-0.5 leading-snug line-clamp-2">
                        {pillar.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToQuestionnaire}
              disabled={selectedPillars.length === 0}
              className="ios-btn ios-btn-primary w-full text-[17px] font-semibold disabled:opacity-30 transition-opacity duration-300"
            >
              {selectedPillars.length === 0
                ? "Select at least 1 Domain to continue"
                : selectedPillars.length === 3
                  ? "INITIALIZE YOUR SYSTEM →"
                  : `INITIALIZE WITH ${selectedPillars.length} DOMAIN${selectedPillars.length > 1 ? "S" : ""} →`}
            </button>

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

        {step === "questionnaire" && (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md relative z-10"
          >
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setStep("pillars")}
                className="w-9 h-9 flex items-center justify-center rounded-full active:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 text-ios-blue" />
              </button>
              <div>
                <h2 className="text-[20px] font-display font-bold tracking-widest text-white">CHOOSE YOUR PROTOCOL</h2>
                <p className="text-[13px] text-white/40">This shapes your quest load and XP multiplier. You can evolve it later.</p>
              </div>
            </div>

            <div className="space-y-5 mb-6 max-h-[55vh] overflow-y-auto pr-1">
              {/* Gamemode selector */}
              <div className="space-y-2">
                {GAMEMODES.map((m) => {
                  const selected = gameMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setGameMode(m.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                        selected
                          ? "bg-ios-blue/10 border-ios-blue/40"
                          : "bg-[#1C1C1E] border-white/5 active:bg-[#2C2C2E]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-gradient-to-tr ${m.accent}`}>
                          {(() => {
                            const Icon = GAMEMODE_ICONS[m.emoji];
                            return Icon ? <Icon className="w-5 h-5 text-white" /> : m.emoji;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[15px] font-semibold text-white">{m.name}</span>
                            <span className="text-[11px] text-white/40">{m.tagline}</span>
                            {m.recommended && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-ios-blue/15 text-ios-blue">Recommended</span>
                            )}
                          </div>
                          <p className="text-[13px] text-white/40 mt-1 leading-snug">{m.subtext}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-white/30 flex-wrap">
                            <span>{m.dailyQuests} quest{m.dailyQuests > 1 ? "s" : ""}/day</span>
                            <span>·</span>
                            <span className="text-ios-blue">{m.xpLabel}</span>
                            <span>·</span>
                            <span>{m.streakShort}</span>
                          </div>
                          {selected && (
                            <p className="text-[12px] text-white/50 italic mt-2 pt-2 border-t border-white/10">
                              &ldquo;{m.hook}&rdquo;
                            </p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center ${
                          selected ? "border-ios-blue" : "border-white/20"
                        }`}>
                          {selected && <div className="w-2.5 h-2.5 rounded-full bg-ios-blue" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time slider */}
              <div className="ios-card p-4">
                <label className="text-[13px] font-medium text-white/80 block mb-3">
                  <Sparkles className="w-4 h-4 inline mr-1.5 text-ios-blue" />
                  DAILY TIME INVESTMENT
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={15}
                    max={240}
                    step={15}
                    value={timePerDay}
                    onChange={(e) => setTimePerDay(parseInt(e.target.value))}
                    className="flex-1 accent-ios-blue h-2"
                  />
                  <span className="text-[17px] font-semibold text-ios-blue w-14 text-right tabular-nums">
                    {timePerDay}m
                  </span>
                </div>
              </div>

              {/* Per-pillar goal chips */}
              <div className="ios-card p-4">
                <label className="text-[13px] font-medium text-white/80 block mb-3">
                  <Target className="w-4 h-4 inline mr-1.5 text-ios-blue" />
                  PRIMARY OBJECTIVE
                </label>
                <div className="space-y-3">
                  {selectedPillars.map((pid) => {
                    const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
                    const chips = PILLAR_GOAL_CHIPS[pid] || [];
                    return (
                      <div key={pid}>
                        <span className="text-[11px] text-white/40 block mb-1.5">{def?.label}</span>
                        <div className="flex flex-wrap gap-2">
                          {chips.map((chip) => {
                            const active = pillarGoals[pid] === chip;
                            return (
                              <button
                                key={chip}
                                onClick={() => setGoalChip(pid, chip)}
                                className={`ios-chip ${active ? "ios-chip-active" : ""}`}
                              >
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("reveal")}
              className="ios-btn ios-btn-primary w-full text-[17px] font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Reveal My Future Self
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
              onClick={() => setStep("questionnaire")}
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
                xpInLevel={firstQuestDone ? Math.min(99, firstQuestXp) : 0}
                seams={0}
                size={120}
              />
            </motion.div>

            <h2 className="text-[28px] font-bold tracking-tight text-white">
              Meet Your{" "}
              <span className="text-ascend">Future Self</span>
            </h2>
            <p className="text-[15px] text-white/40 mt-2 leading-snug max-w-xs mx-auto">
              Forged from {selectedPillars.length} pillar{selectedPillars.length !== 1 ? "s" : ""}. Every quest brings them closer.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
              {selectedPillars.map((pid) => {
                const def = AVAILABLE_PILLARS.find((p) => p.id === pid);
                return (
                  <span key={pid} className="ios-chip ios-chip-active text-[12px]">
                    {def?.label}
                  </span>
                );
              })}
            </div>

            {/* First quest */}
            <div className="relative mb-6">
              <AnimatePresence>
                {firstQuestDone && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.9 }}
                    animate={{ opacity: 0, y: -70, scale: 1.3 }}
                    transition={{ duration: 1 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-2 text-ios-blue font-bold text-lg pointer-events-none z-20"
                  >
                    +{firstQuestXp} XP
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setFirstQuestDone(true)}
                disabled={firstQuestDone}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 active:scale-[0.98] ${
                  firstQuestDone
                    ? "bg-[#30D158]/10 border-[#30D158]/30"
                    : "bg-[#1C1C1E] border-white/5 active:bg-[#2C2C2E]"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  firstQuestDone
                    ? "bg-[#30D158] text-white"
                    : "bg-[#2C2C2E] text-white/40"
                }`}>
                  {firstQuestDone ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Zap className="w-6 h-6" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-[15px] font-semibold text-white">
                    {firstQuestDone ? "First quest complete!" : "Complete your first act of commitment"}
                  </h4>
                  <p className="text-[13px] text-white/40 mt-0.5 leading-snug">
                    {firstQuestDone ? (
                      <span className="text-[#30D158] inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Streak ignited · +{firstQuestXp} XP earned
                      </span>
                    ) : (
                      "Do one thing right now for your chosen domain. Return here and claim your first XP."
                    )}
                  </p>
                </div>
              </button>
            </div>

            {exploreMode ? (
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    handleComplete();
                    onConvert?.("google");
                  }}
                  className="ios-btn ios-btn-primary w-full text-[17px] font-semibold"
                >
                  <Zap className="w-5 h-5" />
                  Save with Google
                </button>
                <button
                  onClick={() => {
                    handleComplete();
                    onConvert?.("offline");
                  }}
                  className="ios-btn ios-btn-ghost w-full text-[15px]"
                >
                  Keep exploring offline
                </button>
                <p className="text-[11px] text-white/30 text-center mt-1">
                  {firstQuestDone
                    ? "Don't lose your first win — save it."
                    : "Save to sync across devices."}
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleComplete}
                  className="text-white/40 text-sm underline bg-transparent border-none mt-4"
                >
                  {firstQuestDone ? "Enter Project Ascend" : "Enter Without Claiming"}
                </button>
                <p className="text-[11px] text-white/30 mt-3">
                  {firstQuestDone
                    ? "Your ascent begins now."
                    : "Claim your first quest above for a head start."}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
