/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BugReport — lets test users file a bug / confusion / idea. Submissions go to
 * the Supabase `bug_reports` table (owner reads them in the dashboard), with a
 * localStorage fallback queue if the network/insert fails. Auto-captures
 * context (screen, version, device, viewport) so reports are actionable.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bug, Check } from "lucide-react";
import { UserProfile } from "../types";
import { APP_VERSION } from "../data";
import { submitBugReport, flushBugReports } from "../supabase";
import { haptic } from "../haptics";

interface BugReportProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  screen: string; // current tab/context
}

const CATEGORIES = [
  { id: "bug", label: "Something broke" },
  { id: "confusing", label: "Confusing" },
  { id: "idea", label: "Idea" },
  { id: "other", label: "Other" },
];

export default function BugReport({
  open,
  onClose,
  profile,
  screen,
}: BugReportProps) {
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "queued">(
    "idle",
  );

  useEffect(() => {
    if (open) {
      setCategory("bug");
      setMessage("");
      setState("idle");
      // opportunistically retry anything queued from a previous offline report
      flushBugReports();
    }
  }, [open]);

  const submit = async () => {
    if (!message.trim()) return;
    setState("sending");
    haptic("tap");
    const result = await submitBugReport({
      user_id: profile?.uid || "offline",
      email: profile?.email || undefined,
      category,
      message: message.trim(),
      screen,
      app_version: APP_VERSION,
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
    });
    setState(result);
    setTimeout(onClose, 1600);
  };

  const done = state === "sent" || state === "queued";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="system-card w-full max-w-lg rounded-t-3xl border border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
                <Bug className="h-4 w-4 text-brand-neon" />
                Report a bug
              </span>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  Thank you — got it.
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {state === "queued"
                    ? "Saved offline — it'll send automatically when you're back online."
                    : "Your report reached the team."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                        category === c.id
                          ? "border-brand-neon bg-brand/20 text-brand-neon"
                          : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  autoFocus
                  placeholder="What happened? What did you expect instead? (Steps help.)"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-neon/50 focus:outline-none"
                />

                <p className="mt-2 font-mono text-[10px] text-white/40">
                  Auto-attached: screen ({screen}) · v{APP_VERSION} · your device
                </p>

                <button
                  onClick={submit}
                  disabled={!message.trim() || state === "sending"}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-30"
                >
                  {state === "sending" ? "Sending…" : "Send report"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
