/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CaptureSheet — the second-brain entry point, reachable from every tab.
 * One input, two outcomes, zero friction:
 *   - "Task"  → parsed quick-add ("Gym 6pm 45m !!")
 *   - "Note"  → timestamped line appended to today's journal
 * And as you type, it live-searches everything you've stored — tasks and all
 * past journal entries — so a thought is never lost once it's captured.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ListTodo, BookOpen, CheckCircle2, Circle, Mic, MicOff, Shield } from "lucide-react";
import { Quest, DailyLog, NonNegotiableTemplate } from "../types";
import { haptic } from "../haptics";

interface CaptureSheetProps {
  open: boolean;
  onClose: () => void;
  quests: Quest[];
  onQuickAdd: (text: string) => void;
  onSaveNote: (text: string) => void;
  onToggleQuest: (id: string) => void;
  onAddNonNegotiable?: (overrides: Partial<NonNegotiableTemplate> & { title: string; pillar: string }) => void;
}

interface JournalHit {
  date: string;
  text: string;
}

export default function CaptureSheet({
  open,
  onClose,
  quests,
  onQuickAdd,
  onSaveNote,
  onToggleQuest,
  onAddNonNegotiable,
}: CaptureSheetProps) {
  const [text, setText] = useState("");
  const [nnMode, setNnMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Voice-to-text (on-device Web Speech API, no cloud/AI) ---
  const SR =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null;
  const voiceSupported = !!SR;
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoice = () => {
    if (!SR) return;
    haptic("tap");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setText((prev) => {
        const withoutInterim = prev.replace(/\s*…$/, "");
        const sep = withoutInterim ? " " : "";
        return withoutInterim + sep + transcript;
      });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setText("");
      // focus after the sheet animates in
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Live recall — search tasks + all stored journal entries while typing.
  const q = text.trim().toLowerCase();
  const taskHits = useMemo(
    () =>
      q.length < 2
        ? []
        : quests
            .filter((t) => t.title.toLowerCase().includes(q))
            .slice(0, 4),
    [q, quests],
  );
  const journalHits = useMemo<JournalHit[]>(() => {
    if (q.length < 2) return [];
    const out: JournalHit[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("projectff_log_")) continue;
      try {
        const log: DailyLog = JSON.parse(localStorage.getItem(key) || "{}");
        const body = [log.journalEntry, log.win, log.gratitude, log.morningIntention]
          .filter(Boolean)
          .join(" · ");
        if (body.toLowerCase().includes(q))
          out.push({ date: log.date, text: body });
      } catch {
        /* ignore */
      }
    }
    return out.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
  }, [q]);

  const saveTask = () => {
    if (!text.trim()) return;
    haptic("tap");
    if (nnMode && onAddNonNegotiable) {
      onAddNonNegotiable({ title: text.trim(), pillar: "health" });
    } else {
      onQuickAdd(text);
    }
    onClose();
  };
  const saveNote = () => {
    if (!text.trim()) return;
    haptic("tap");
    onSaveNote(text.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] border border-white/10 bg-[#1C1C1E]/95 backdrop-blur-2xl shadow-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            {/* iOS drag handle */}
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" />

            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Capture anything
              </span>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="rounded-full bg-white/[0.06] p-1.5 text-white/60 active:bg-white/[0.1]"
                aria-label="Close capture"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="relative">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTask();
                if (e.key === "Escape") onClose();
              }}
              placeholder={listening ? "Listening…" : "A task, a thought, anything…"}
              autoCapitalize="sentences"
              autoCorrect="on"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 pr-12 text-[17px] text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
            />
            {voiceSupported && (
              <button
                onClick={listening ? stopVoice : startVoice}
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
                  listening
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white"
                }`}
                aria-label={listening ? "Stop recording" : "Start voice input"}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={saveTask}
                disabled={!text.trim()}
                className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-30 ${
                  nnMode
                    ? "bg-brand-neon text-black hover:bg-brand-neon/80"
                    : "bg-brand hover:bg-brand-dark"
                }`}
              >
                {nnMode ? (
                  <>
                    <Shield className="h-4 w-4" />
                    Non-Negotiable
                  </>
                ) : (
                  <>
                    <ListTodo className="h-4 w-4" />
                    Add task
                  </>
                )}
              </button>
              <button
                onClick={saveNote}
                disabled={!text.trim()}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/80 hover:text-white disabled:opacity-30 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Save note
              </button>
            </div>
            {/* Non-Negotiable mode toggle */}
            {onAddNonNegotiable && (
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-white/30">Mode:</span>
                <button
                  onClick={() => setNnMode(false)}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                    !nnMode
                      ? "bg-white/[0.08] text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <ListTodo className="h-3 w-3 inline mr-1" />
                  Task
                </button>
                <button
                  onClick={() => setNnMode(true)}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                    nnMode
                      ? "bg-brand-neon/15 text-brand-neon border border-brand-neon/30"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <Shield className="h-3 w-3 inline mr-1" />
                  Non-Neg
                </button>
              </div>
            )}
            <p className="mt-2 text-center font-mono text-[10px] text-white/40">
              Tasks understand “6pm”, “45m”, “!!” · notes land in today's journal
            </p>

            {(taskHits.length > 0 || journalHits.length > 0) && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                  Already in your brain
                </span>
                {taskHits.map((t) => {
                  const done = t.completed;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        haptic("success");
                        onToggleQuest(t.id);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-white/40" />
                      )}
                      <span
                        className={`truncate text-sm ${done ? "text-white/40 line-through" : "text-white/90"}`}
                      >
                        {t.title}
                      </span>
                      {t.scheduledTime && (
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-brand-neon">
                          {t.scheduledTime}
                        </span>
                      )}
                    </button>
                  );
                })}
                {journalHits.map((h) => (
                  <div
                    key={h.date}
                    className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="font-mono text-[10px] text-white/40">
                      {new Date(h.date + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · journal
                    </span>
                    <p className="line-clamp-2 text-xs text-white/70">{h.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
