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
  MOODS,
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

        {/* Mood */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/50">
            How are you feeling?
          </label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? "" : m)}
                className={`h-10 w-10 rounded-xl text-lg transition-all ${
                  mood === m
                    ? "bg-brand/25 ring-2 ring-brand-neon scale-105"
                    : "bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                {m}
              </button>
            ))}
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
                  {h.mood && <span className="text-sm">{h.mood}</span>}
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
