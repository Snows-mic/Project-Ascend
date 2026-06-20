/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JournalView — first-class journaling: guided prompts, mood, bookend ritual,
 * a journaling streak, and a searchable history of past entries.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { UserProfile, DailyLog } from "../types";
import {
  promptForDate,
  WEEKLY_REVIEW_PROMPTS,
} from "../data";
import {
  BookOpen,
  Flame,
  Sunrise,
  Moon,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Mic,
  Square,
  Zap,
  Smile,
  Meh,
  Frown,
  Angry,
  Sparkles,
  AlertTriangle,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/** Custom, on-brand mood glyphs — replaces OS-rendered emoji which look low-rent on mobile. */
interface MoodGlyph {
  key: string;       // canonical id (stored)
  label: string;     // shown under the glyph + in history
  icon: LucideIcon;
  fromColor: string; // tailwind gradient classes
  toColor: string;
  ringColor: string; // tailwind ring class for selected state
}

const MOOD_GLYPHS: MoodGlyph[] = [
  { key: "calm",      label: "Calm",      icon: Smile,          fromColor: "from-emerald-400",  toColor: "to-teal-500",   ringColor: "ring-emerald-400/70" },
  { key: "energized", label: "Energized", icon: Zap,            fromColor: "from-amber-400",    toColor: "to-yellow-500", ringColor: "ring-amber-400/70" },
  { key: "neutral",   label: "Neutral",   icon: Meh,            fromColor: "from-slate-400",    toColor: "to-zinc-500",   ringColor: "ring-slate-400/70" },
  { key: "frustrated",label: "Friction",  icon: Angry,          fromColor: "from-rose-500",     toColor: "to-red-600",    ringColor: "ring-rose-500/70" },
  { key: "low",       label: "Low",       icon: Frown,          fromColor: "from-sky-500",      toColor: "to-blue-600",   ringColor: "ring-sky-400/70" },
  { key: "tired",     label: "Tired",     icon: Moon,           fromColor: "from-indigo-500",   toColor: "to-purple-600", ringColor: "ring-indigo-400/70" },
  { key: "anxious",   label: "Anxious",   icon: AlertTriangle,  fromColor: "from-orange-500",   toColor: "to-amber-600",  ringColor: "ring-orange-400/70" },
  { key: "joyful",    label: "Joyful",    icon: Sparkles,       fromColor: "from-fuchsia-500",  toColor: "to-pink-500",   ringColor: "ring-fuchsia-400/70" },
];

const moodByKey = (k?: string) => MOOD_GLYPHS.find((m) => m.key === k);

interface JournalViewProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onSaveJournal: (fields: Partial<DailyLog>) => void;
}

interface PastEntry {
  date: string;
  mood?: string;
  text: string;
}

export default function JournalView({
  profile,
  todayLog,
  onSaveJournal,
}: JournalViewProps) {
  const today = todayLog.date;
  const prompt = promptForDate(today);

  const [mood, setMood] = useState(todayLog.mood || "");
  const [morning, setMorning] = useState(todayLog.morningIntention || "");
  const [reflection, setReflection] = useState(todayLog.journalEntry || "");
  const [gratitude, setGratitude] = useState(todayLog.gratitude || "");
  const [win, setWin] = useState(todayLog.win || "");
  const [saved, setSaved] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [query, setQuery] = useState("");

  // --- Voice-to-text (on-device Web Speech API, no cloud/AI) ---
  const SR =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;
  const voiceSupported = !!SR;
  const recogRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!SR) return;
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const r = new SR();
    r.lang = navigator.language || "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      }
      if (finalText.trim()) {
        setReflection((prev) =>
          (prev ? prev.trimEnd() + " " : "") + finalText.trim(),
        );
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };

  const save = () => {
    onSaveJournal({
      mood,
      morningIntention: morning,
      journalEntry: reflection,
      gratitude,
      win,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const canSave =
    !!(reflection.trim() || morning.trim() || gratitude.trim() || win.trim());

  // History — read all locally stored daily logs (offline + cached cloud).
  const history = useMemo<PastEntry[]>(() => {
    const out: PastEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("projectff_log_")) continue;
      try {
        const log: DailyLog = JSON.parse(localStorage.getItem(key) || "{}");
        const text = [log.journalEntry, log.win, log.gratitude, log.morningIntention]
          .filter(Boolean)
          .join(" · ");
        if (log.date && log.date !== today && text)
          out.push({ date: log.date, mood: log.mood, text });
      } catch {
        /* ignore */
      }
    }
    return out.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [today, saved]);

  const filteredHistory = history.filter((h) =>
    query.trim() ? h.text.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="system-card flex items-center justify-between rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <BookOpen className="h-4 w-4 text-brand-neon" />
          Journal
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-mono text-orange-300">
          <Flame className="h-3.5 w-3.5" />
          {profile.journalStreak || 0}-day streak
        </div>
      </div>

      {/* Today's entry */}
      <div className="system-card rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-white/40">
          {new Date(today + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Mood — custom glyphs (no OS emoji) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-white/50">
              How are you feeling?
            </label>
            <AnimatePresence mode="wait">
              {mood && (
                <motion.span
                  key={mood}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="text-[11px] font-semibold tracking-wide text-white/80"
                >
                  {moodByKey(mood)?.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {MOOD_GLYPHS.map((m) => {
              const Icon = m.icon;
              const selected = mood === m.key;
              return (
                <motion.button
                  key={m.key}
                  onClick={() => setMood(selected ? "" : m.key)}
                  whileTap={{ scale: 0.88 }}
                  animate={selected ? { scale: 1.06 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 22 }}
                  aria-pressed={selected}
                  aria-label={m.label}
                  className={`relative aspect-square w-full rounded-2xl bg-gradient-to-br ${m.fromColor} ${m.toColor} flex items-center justify-center transition-shadow ${
                    selected
                      ? `ring-2 ${m.ringColor} shadow-lg`
                      : "opacity-60 ring-1 ring-white/5 hover:opacity-90"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" strokeWidth={2.4} />
                  {selected && (
                    <motion.span
                      aria-hidden
                      layoutId="mood-active-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Morning intention */}
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/50">
            <Sunrise className="h-3.5 w-3.5 text-amber-400" />
            Morning intention
          </label>
          <input
            value={morning}
            onChange={(e) => setMorning(e.target.value)}
            placeholder="What would make today a win?"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
          />
        </div>

        {/* Tonight's prompt → reflection */}
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/50">
            <Moon className="h-3.5 w-3.5 text-brand-neon" />
            {prompt}
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            placeholder="One line is enough… or tap the mic and just talk."
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
          />
          {voiceSupported && (
            <button
              onClick={toggleVoice}
              className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                listening
                  ? "border-red-500/50 bg-red-500/10 text-red-300"
                  : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {listening ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <Square className="h-3.5 w-3.5" />
                  Listening… tap to stop
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  Tap to speak
                </>
              )}
            </button>
          )}
        </div>

        {/* Gratitude + win */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              Grateful for
            </label>
            <input
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Something small…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">
              Today's win
            </label>
            <input
              value={win}
              onChange={(e) => setWin(e.target.value)}
              placeholder="One thing that went right"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-30 transition-colors"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Save entry"
          )}
        </button>
      </div>

      {/* Weekly review (guided) */}
      <div className="system-card rounded-2xl p-5">
        <button
          onClick={() => setShowWeekly(!showWeekly)}
          className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-widest text-white/40"
        >
          <span>Weekly Review</span>
          {showWeekly ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {showWeekly && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {WEEKLY_REVIEW_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() =>
                      setReflection((r) => (r ? `${r}\n\n${p.prompt}\n` : `${p.prompt}\n`))
                    }
                    className="block w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left text-sm text-white/70 hover:border-brand-neon/30 hover:text-white"
                  >
                    <span className="font-semibold text-white/90">{p.label}</span>
                    <span className="ml-2 text-white/40">{p.prompt}</span>
                  </button>
                ))}
                <p className="text-[10px] text-white/45">
                  Tap a prompt to add it to tonight's reflection.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <div className="system-card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
          <Search className="h-3.5 w-3.5" />
          Past entries
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your journal…"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
        />
        {filteredHistory.length === 0 ? (
          <p className="text-xs text-white/50">
            {history.length === 0
              ? "Your past entries will appear here."
              : "No entries match your search."}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.slice(0, 30).map((h) => (
              <div
                key={h.date}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
              >
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-white/40">
                    {new Date(h.date + "T00:00:00").toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {h.mood && (() => {
                    const g = moodByKey(h.mood);
                    if (!g) return null;
                    const Icon = g.icon;
                    return (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${g.fromColor} ${g.toColor}`}
                        title={g.label}
                      >
                        <Icon className="h-3 w-3 text-white" strokeWidth={2.4} />
                      </span>
                    );
                  })()}
                </div>
                <p className="line-clamp-2 text-xs text-white/60">{h.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
