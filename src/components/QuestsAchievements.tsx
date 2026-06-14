/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  Shield,
  Sparkles,
  PenTool,
  BookOpen,
  Users,
  Flame,
  Lock,
  CheckCircle2,
  Star,
  Calendar,
  RefreshCw,
  Target,
  Sun,
  Brain,
  DollarSign,
  Briefcase,
  Trophy,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import { UserProfile, Quest, Achievement, NonNegotiableTemplate } from "../types";
import { getPillarDef, AVAILABLE_PILLARS } from "../data";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface QuestsAchievementsProps {
  profile: UserProfile;
  quests: Quest[];
  achievements: Achievement[];
  onToggleQuest: (questId: string) => void;
  onAddQuest: (quest: Omit<Quest, "id" | "completed">) => void;
  onUpdateQuest: (questId: string, updates: Partial<Quest>) => void;
  onDeleteQuest: (questId: string) => void;
  // Non-negotiable handlers
  nonNegotiableTemplates?: NonNegotiableTemplate[];
  onAddNonNegotiable?: (overrides: Partial<NonNegotiableTemplate> & { title: string; pillar: string }) => void;
  onEditNonNegotiable?: (templateId: string, updates: Partial<NonNegotiableTemplate>) => void;
  onRemoveNonNegotiable?: (templateId: string) => void;
  nnCompletedToday?: number;
  nnTotalToday?: number;
  // Gamemode daily quest cap
  dailyQuestCap?: number;
  dailyActiveQuests?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve a pillar's gradient color, falling back to brand defaults */
function getPillarColor(pillarId: string): string {
  return getPillarDef(pillarId)?.color ?? "from-brand to-brand-neon";
}

/** Map an icon string → lucide component (covers pillar icons + achievement icons) */
function badgeIcon(iconName: string) {
  switch (iconName) {
    case "Award":
      return Award;
    case "Flame":
      return Flame;
    case "Brain":
      return Brain;
    case "Target":
      return Target;
    case "DollarSign":
      return DollarSign;
    case "Users":
      return Users;
    case "BookOpen":
      return BookOpen;
    case "Sun":
      return Sun;
    case "PenTool":
      return PenTool;
    case "Briefcase":
      return Briefcase;
    case "Sparkles":
      return Sparkles;
    default:
      return Shield;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QuestsAchievements({
  profile,
  quests,
  achievements,
  onToggleQuest,
  onAddQuest,
  onUpdateQuest,
  onDeleteQuest,
  nonNegotiableTemplates,
  onAddNonNegotiable,
  onEditNonNegotiable,
  onRemoveNonNegotiable,
  nnCompletedToday = 0,
  nnTotalToday = 0,
  dailyQuestCap = 3,
  dailyActiveQuests = 0,
}: QuestsAchievementsProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPillar, setFormPillar] = useState(AVAILABLE_PILLARS[0]?.id ?? "");
  const [formType, setFormType] = useState<Quest["type"]>("daily");
  const [formXp, setFormXp] = useState(15);
  const [formCore, setFormCore] = useState(false);
  const [formNN, setFormNN] = useState(false);

  const openEditor = (quest?: Quest) => {
    if (quest) {
      setEditingQuest(quest);
      setFormTitle(quest.title);
      setFormDesc(quest.description);
      setFormPillar(quest.pillar);
      setFormType(quest.type);
      setFormXp(quest.xpReward);
      setFormCore(quest.isCoreHabit ?? false);
      setFormNN(quest.isNonNegotiable ?? false);
    } else {
      setEditingQuest(null);
      setFormTitle("");
      setFormDesc("");
      setFormPillar(AVAILABLE_PILLARS[0]?.id ?? "");
      setFormType("daily");
      setFormXp(15);
      setFormCore(false);
      setFormNN(false);
    }
    setEditorOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const questData = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      pillar: formPillar,
      type: formType,
      xpReward: formXp,
      isCoreHabit: formCore,
    };

    // If marking as non-negotiable, use the NN handler chain
    if (formNN && onAddNonNegotiable) {
      if (editingQuest?.isNonNegotiable && editingQuest.id.startsWith("nn_")) {
        // Find the template ID from the quest ID (nn_{templateId}_{YYYYMMDD})
        const parts = editingQuest.id.split("_");
        parts.pop(); // remove date suffix (YYYYMMDD format)
        const templateId = parts.join("_"); // "nn_{templateId}"
        onEditNonNegotiable?.(templateId, questData);
      } else if (editingQuest) {
        // Existing quest being converted to non-negotiable
        onDeleteQuest(editingQuest.id);
        onAddNonNegotiable(questData);
      } else {
        // Brand new non-negotiable
        onAddNonNegotiable(questData);
      }
      setEditorOpen(false);
      setEditingQuest(null);
      return;
    }

    // If un-marking a previously non-negotiable quest
    if (!formNN && editingQuest?.isNonNegotiable && editingQuest.id.startsWith("nn_")) {
      const parts = editingQuest.id.split("_");
      parts.pop(); // remove date suffix
      const templateId = parts.join("_");
      onRemoveNonNegotiable?.(templateId);
      // Also add it as a regular quest
      onAddQuest({ ...questData, isCoreHabit: formCore });
      setEditorOpen(false);
      setEditingQuest(null);
      return;
    }

    if (editingQuest) {
      onUpdateQuest(editingQuest.id, { ...questData, isNonNegotiable: formNN || undefined });
    } else {
      onAddQuest({ ...questData, isNonNegotiable: formNN || undefined } as Omit<Quest, "id" | "completed">);
    }
    setEditorOpen(false);
    setEditingQuest(null);
  };

  const handleDelete = (questId: string) => {
    onDeleteQuest(questId);
    setDeleteConfirm(null);
  };

  /* ---- Derived data ---- */
  const nonNegotiables = useMemo(
    () => quests.filter((q) => q.isNonNegotiable),
    [quests],
  );

  const coreHabits = useMemo(
    () => quests.filter((q) => q.isCoreHabit && !q.isNonNegotiable),
    [quests],
  );

  const rotatingDailies = useMemo(
    () => quests.filter((q) => q.type === "daily" && !q.isCoreHabit && !q.isNonNegotiable),
    [quests],
  );

  const weeklies = useMemo(
    () => quests.filter((q) => q.type === "weekly"),
    [quests],
  );

  const milestones = useMemo(
    () => quests.filter((q) => q.type === "milestone"),
    [quests],
  );

  const unlockedIds = new Set(profile.achievements);
  const unlockedCount = profile.achievements.length;
  const totalCount = achievements.length;

  /* ---- Render helper ---- */
  const renderQuestRow = (quest: Quest) => {
    const isCompleted = quest.completed;
    const def = getPillarDef(quest.pillar);
    const PillarIcon = def ? badgeIcon(def.icon) : null;

    return (
      <motion.button
        key={quest.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onToggleQuest(quest.id)}
        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
          isCompleted
            ? "border-emerald-500/20 bg-emerald-500/[0.06]"
            : "border-white/5 bg-white/[0.02] hover:border-white/10"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {quest.title}
            </span>
            {PillarIcon && <PillarIcon className="h-3.5 w-3.5 text-white/25" />}
          </div>
          {quest.description && (
            <p
              className={`mt-0.5 text-xs ${
                isCompleted ? "text-emerald-300/60" : "text-white/40"
              }`}
            >
              {quest.description}
            </p>
          )}
        </div>

        <div
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            isCompleted
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-white/[0.06] text-white/40"
          }`}
        >
          +{quest.xpReward} XP
        </div>

        {/* Edit / Delete */}
        <div className="flex shrink-0 items-center gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
          <span
            onClick={() => openEditor(quest)}
            className="rounded p-1 text-white/25 hover:bg-white/[0.08] hover:text-white/60 transition-colors cursor-pointer"
            title="Edit quest"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") openEditor(quest); }}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </span>
          <span
            onClick={() => setDeleteConfirm(quest.id)}
            className="rounded p-1 text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete quest"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setDeleteConfirm(quest.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </motion.button>
    );
  };

  /* ---- Empty state ---- */
  if (quests.length === 0) {
    return (
      <div className="system-card rounded-2xl p-6 text-center">
        <p className="text-sm text-white/50">
          No quests yet. Complete onboarding to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Add Quest Button */}
      <div className="flex justify-end">
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-white/50 hover:border-brand-neon/40 hover:text-brand-neon transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Quest
        </button>
      </div>

      {/* ── Gamemode daily quest cap banner ── */}
      {dailyActiveQuests >= dailyQuestCap && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-mono text-amber-400/80">
            Daily cap reached ({dailyActiveQuests}/{dailyQuestCap}) — complete open quests to free slots.
          </span>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Non-Negotiable Daily Quests (auto-regenerating)                   */}
      {/* ================================================================ */}
      {nonNegotiables.length > 0 && (
        <div className="system-card rounded-2xl p-5 border-brand-neon/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-hud font-semibold uppercase tracking-widest text-brand-neon/70">
              <Shield className="h-3.5 w-3.5 text-brand-neon" />
              NON-NEGOTIABLE TODAY
            </div>
            <span className="text-[10px] font-mono text-brand-neon/50">
              {nnCompletedToday}/{nnTotalToday}
            </span>
          </div>
          {/* Progress bar */}
          {nnTotalToday > 0 && (
            <div className="mb-4 h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-neon to-brand"
                initial={{ width: 0 }}
                animate={{ width: `${(nnCompletedToday / nnTotalToday) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}
          <div className="space-y-2">
            <AnimatePresence>
              {nonNegotiables.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderQuestRow(q)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Core Habits                                                      */}
      {/* ================================================================ */}
      {coreHabits.length > 0 && (
        <div className="system-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-hud font-semibold uppercase tracking-widest text-white/40">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            DAILY PROTOCOLS
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {coreHabits.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderQuestRow(q)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Rotating Daily Quests                                            */}
      {/* ================================================================ */}
      {rotatingDailies.length > 0 && (
        <div className="system-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
            <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
            Daily Quests
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {rotatingDailies.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderQuestRow(q)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Weekly Quests                                                    */}
      {/* ================================================================ */}
      {weeklies.length > 0 && (
        <div className="system-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-hud font-semibold uppercase tracking-widest text-white/40">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            WEEKLY BOUNTIES
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {weeklies.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderQuestRow(q)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Milestones                                                       */}
      {/* ================================================================ */}
      {milestones.length > 0 && (
        <div className="system-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
            <Star className="h-3.5 w-3.5 text-purple-400" />
            Milestones
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {milestones.map((q) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderQuestRow(q)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Achievements / Badges                                            */}
      {/* ================================================================ */}
      <div className="system-card rounded-2xl p-5">
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-widest text-white/40"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            Achievements
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          {showAchievements ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {showAchievements && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {achievements.map((ach) => {
                  const unlocked = unlockedIds.has(ach.id);
                  const Icon = badgeIcon(ach.icon);
                  const color = getPillarColor(ach.pillar);

                  return (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.03 }}
                      className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                        unlocked
                          ? "border-yellow-500/20 bg-yellow-500/[0.05]"
                          : "border-white/5 bg-white/[0.02] opacity-50 grayscale-[60%]"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                          unlocked ? color : "from-white/10 to-white/5"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            unlocked ? "text-white" : "text-white/40"
                          }`}
                        />
                      </div>

                      {/* Title */}
                      <p
                        className={`text-[11px] font-semibold leading-tight ${
                          unlocked ? "text-white" : "text-white/40"
                        }`}
                      >
                        {ach.title}
                      </p>

                      {/* Description */}
                      <p className="mt-0.5 text-[10px] leading-tight text-white/30">
                        {ach.description}
                      </p>

                      {/* Lock / Unlock indicator */}
                      <div className="mt-2">
                        {unlocked ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Unlocked · +{ach.xpBonus} XP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-white/30">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================ */}
      {/*  Quest Editor Modal                                               */}
      {/* ================================================================ */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { setEditorOpen(false); setEditingQuest(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="system-card w-full max-w-md rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">
                  {editingQuest ? "Edit Quest" : "New Quest"}
                </h3>
                <button
                  onClick={() => { setEditorOpen(false); setEditingQuest(null); }}
                  className="rounded-lg p-1 text-white/30 hover:bg-white/[0.06] hover:text-white/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Morning Run"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-brand-neon/50 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Optional details..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-brand-neon/50 focus:outline-none"
                  />
                </div>

                {/* Pillar */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Pillar</label>
                  <select
                    value={formPillar}
                    onChange={(e) => setFormPillar(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-brand-neon/50 focus:outline-none appearance-none"
                  >
                    {AVAILABLE_PILLARS.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-800">
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type & XP row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as Quest["type"])}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-brand-neon/50 focus:outline-none appearance-none"
                    >
                      <option value="daily" className="bg-neutral-800">Daily</option>
                      <option value="weekly" className="bg-neutral-800">Weekly</option>
                      <option value="milestone" className="bg-neutral-800">Milestone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">XP Reward</label>
                    <input
                      type="number"
                      value={formXp}
                      onChange={(e) => setFormXp(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-brand-neon/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Core Habit toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setFormCore(!formCore)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      formCore ? "bg-orange-500" : "bg-white/[0.08]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        formCore ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-white/60">Core Habit</span>
                </label>

                {/* Non-Negotiable toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setFormNN(!formNN)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      formNN ? "bg-brand-neon" : "bg-white/[0.08]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        formNN ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-white/60">
                    Non-Negotiable{" "}
                    <span className="text-brand-neon/60">(auto-regenerates daily)</span>
                  </span>
                </label>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={!formTitle.trim()}
                    className="flex-1 rounded-lg bg-brand-neon px-4 py-2.5 text-sm font-semibold text-black hover:bg-brand-neon/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {editingQuest ? "Save Changes" : "Create Quest"}
                  </button>
                  <button
                    onClick={() => { setEditorOpen(false); setEditingQuest(null); }}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Delete Confirmation Modal                                        */}
      {/* ================================================================ */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="system-card w-full max-w-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">Delete Quest?</h3>
              <p className="text-sm text-white/40 mb-5">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
