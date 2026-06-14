/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TodayHub — the default home surface. Bookends the day:
 *   morning Plan (intention + Top 3 + quick capture) → execution → evening Reflect.
 */

import { useState } from "react";
import { UserProfile, DailyLog, Quest } from "../types";
import { getPillarDef, PRIORITY_META } from "../data";
import {
  Sunrise,
  Moon,
  Plus,
  Star,
  Check,
  Clock,
  BookOpen,
  ChevronRight,
  CalendarPlus,
  RotateCcw,
  Swords,
} from "lucide-react";
import { motion } from "motion/react";

interface TodayHubProps {
  profile: UserProfile;
  todayLog: DailyLog;
  quests: Quest[];
  onToggleQuest: (id: string) => void;
  onTogglePin: (id: string) => void;
  onQuickAdd: (text: string) => void;
  onSaveJournal: (fields: Partial<DailyLog>) => void;
  onGoToJournal: () => void;
  onGoToSchedule: () => void;
  onPlanTomorrow: () => void;
  onReset: () => void;
  onStartFocus: () => void;
}

export default function TodayHub({
  profile,
  todayLog,
  quests,
  onToggleQuest,
  onTogglePin,
  onQuickAdd,
  onSaveJournal,
  onGoToJournal,
  onGoToSchedule,
  onPlanTomorrow,
  onReset,
  onStartFocus,
}: TodayHubProps) {
  const [quick, setQuick] = useState("");
  const [intention, setIntention] = useState(todayLog.morningIntention || "");
  const [confirmReset, setConfirmReset] = useState(false);

  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isDone = (q: Quest) => todayLog.completedTasks[q.id] ?? q.completed;
  const actionable = quests.filter(
    (q) => q.type === "daily" || q.isCoreHabit,
  );
  const doneCount = actionable.filter(isDone).length;
  const totalCount = actionable.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const pinned = quests.filter((q) => q.pinned);
  const pinnable = quests
    .filter((q) => !q.pinned && !isDone(q) && (q.type === "daily" || q.isCoreHabit))
    .slice(0, 4);
  const scheduled = quests
    .filter((q) => q.scheduledTime)
    .sort((a, b) => (a.scheduledTime! < b.scheduledTime! ? -1 : 1));

  const bestStreak = Math.max(
    0,
    ...Object.values(profile.pillars).map((p) => p.streak || 0),
  );

  const submitQuick = () => {
    if (!quick.trim()) return;
    onQuickAdd(quick);
    setQuick("");
  };

  const allDone = totalCount > 0 && doneCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Greeting + day progress ring */}
      <div className="ios-card p-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] text-ios-blue font-medium">{dateLabel}</p>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight text-white truncate">
            {greeting}, {profile.displayName?.split(" ")[0] || "there"}.
          </h2>
          <p className="mt-1 text-[13px] text-white/40">
            {allDone
              ? "Everything's done. You showed up today. 🔥"
              : `${doneCount} of ${totalCount} done · ${bestStreak}-day best streak`}
          </p>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#2C2C2E" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke="#0A84FF" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15.5}
              strokeDashoffset={2 * Math.PI * 15.5 * (1 - pct / 100)}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[17px] font-semibold text-white">
            {pct}%
          </span>
        </div>
      </div>

      {/* Morning Plan (intention) */}
      <div className="ios-card p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-white/30">
          <Sunrise className="h-4 w-4 text-[#FFD60A]" />
          Morning Plan
        </div>
        <input
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          onBlur={() => onSaveJournal({ morningIntention: intention })}
          placeholder="What would make today a win?"
          className="ios-input w-full"
        />
      </div>

      {/* Quick add */}
      <div className="ios-card p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-white/30">
          <Plus className="h-4 w-4 text-ios-blue" />
          Quick Add
        </div>
        <div className="flex items-center gap-2">
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitQuick(); }}
            placeholder="e.g. Gym 6pm 45m !!"
            className="ios-input flex-1"
          />
          <button
            onClick={submitQuick}
            disabled={!quick.trim()}
            className="ios-btn ios-btn-primary shrink-0 text-[15px]"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/25">Tip: add a time (6pm), length (45m), or priority (! / !!)</p>
      </div>

      {/* Deep Focus raid */}
      <button
        onClick={onStartFocus}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1C1C1E] active:bg-[#2C2C2E] text-left transition-all"
      >
        <div className="flex items-center gap-3">
          <Swords className="h-5 w-5 text-ios-blue" />
          <div>
            <p className="text-[15px] font-semibold text-white">Deep Focus</p>
            <p className="text-[12px] text-white/30">Enter a focus raid — no distractions until it clears.</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/20" />
      </button>

      {/* Top 3 Today */}
      <div className="ios-card p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-white/30">
          <Star className="h-4 w-4 text-[#FFD60A]" />
          Top 3 Today
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/30">{pinned.length}/3</span>
        </div>

        {pinned.length === 0 && (
          <p className="mb-3 text-[13px] text-white/30">Pin up to 3 must-dos to focus your day.</p>
        )}

        <div className="space-y-2">
          {pinned.map((q) => {
            const done = isDone(q);
            const def = getPillarDef(q.pillar);
            return (
              <div
                key={q.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  done ? "bg-[#30D158]/5" : "bg-[#1C1C1E]"
                }`}
              >
                <button
                  onClick={() => onToggleQuest(q.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    done ? "border-[#30D158] bg-[#30D158] text-white" : "border-white/25 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[14px] font-medium ${done ? "text-white/30 line-through" : "text-white"}`}>
                    {q.title}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {def?.label}{q.scheduledTime ? ` · ${q.scheduledTime}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => onTogglePin(q.id)}
                  className="shrink-0 text-[#FFD60A]"
                  title="Unpin"
                >
                  <Star className="h-4 w-4 fill-[#FFD60A]" />
                </button>
              </div>
            );
          })}
        </div>

        {pinned.length < 3 && pinnable.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="mb-2 text-[11px] text-white/25">Pin from today</p>
            <div className="flex flex-wrap gap-2">
              {pinnable.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onTogglePin(q.id)}
                  className="ios-chip text-[12px]"
                >
                  <Star className="h-3 w-3" />
                  {q.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's agenda */}
      <button onClick={onGoToSchedule} className="ios-card w-full p-4 text-left block">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/30">
            <Clock className="h-4 w-4 text-ios-blue" />
            Today's Agenda
          </div>
          <ChevronRight className="h-4 w-4 text-white/20" />
        </div>
        {scheduled.length === 0 ? (
          <p className="text-[13px] text-white/30">Nothing time-blocked yet. Open Schedule to plan your day.</p>
        ) : (
          <div className="space-y-1.5">
            {scheduled.slice(0, 4).map((q) => (
              <div key={q.id} className="flex items-center gap-3 text-[14px]">
                <span className="w-12 shrink-0 text-[13px] text-ios-blue font-medium">{q.scheduledTime}</span>
                <span className={`truncate ${isDone(q) ? "text-white/30 line-through" : "text-white/70"}`}>{q.title}</span>
              </div>
            ))}
            {scheduled.length > 4 && <p className="text-[11px] text-white/20">+{scheduled.length - 4} more</p>}
          </div>
        )}
      </button>

      {/* Plan tomorrow */}
      <button onClick={onPlanTomorrow} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#1C1C1E] active:bg-[#2C2C2E] text-left">
        <div className="flex items-center gap-3">
          <CalendarPlus className="h-5 w-5 text-ios-blue" />
          <div>
            <p className="text-[15px] font-semibold text-white">Plan tomorrow</p>
            <p className="text-[12px] text-white/30">Set up tomorrow tonight — future-you wins.</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/20" />
      </button>

      {/* Evening Reflect */}
      <button onClick={onGoToJournal} className={`block w-full p-4 rounded-2xl text-left ${isEvening ? "bg-[#0A84FF]/10" : "bg-[#1C1C1E] active:bg-[#2C2C2E]"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEvening ? <Moon className="h-5 w-5 text-ios-blue" /> : <BookOpen className="h-5 w-5 text-white/30" />}
            <div>
              <p className="text-[15px] font-semibold text-white">{isEvening ? "Evening Reflect" : "Journal"}</p>
              <p className="text-[12px] text-white/30">
                {isEvening ? "Close the day — one line is enough." : `Journaling streak: ${profile.journalStreak || 0} 🔥`}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/20" />
        </div>
      </button>

      {/* Reset / start over */}
      <div className="pt-2 pb-1 text-center">
        {confirmReset ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-[13px] text-[#FF9F0A]">Reset everything?</span>
            <button
              onClick={() => { setConfirmReset(false); onReset(); }}
              className="px-3 py-1.5 rounded-lg text-[13px] text-[#FF453A] active:bg-[#FF453A]/10 font-medium"
            >
              Yes, reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded-lg text-[13px] text-white/60 active:bg-white/10 font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 text-[13px] text-white/25 active:text-[#FF9F0A] font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset progress
          </button>
        )}
      </div>
    </div>
  );
}
