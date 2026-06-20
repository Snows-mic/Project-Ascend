/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SystemToast — top-of-screen System-voice messages for non-completion events
 * (quest registration, achievement unlock, title earned, etc).
 * Sibling to XpBurst (which handles completions).
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Scroll, Check } from "lucide-react";

type Toast = {
  id: number;
  kind: "registered" | "title";
  text: string;
  sub?: string;
};

export default function SystemToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;

    const push = (t: Omit<Toast, "id">) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, ...t }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 2400);
    };

    const onRegistered = (e: Event) => {
      const d = (e as CustomEvent<{ title: string; xpReward?: number }>).detail;
      if (!d?.title) return;
      push({
        kind: "registered",
        text: "Directive registered.",
        sub: `${d.title}${d.xpReward ? ` · +${d.xpReward} XP on clear` : ""}`,
      });
    };

    const onTitle = (e: Event) => {
      const d = (e as CustomEvent<{ name: string }>).detail;
      if (!d?.name) return;
      push({ kind: "title", text: "Title earned.", sub: d.name });
    };

    window.addEventListener("ascend:quest-registered", onRegistered);
    window.addEventListener("ascend:title-earned", onTitle);
    return () => {
      window.removeEventListener("ascend:quest-registered", onRegistered);
      window.removeEventListener("ascend:title-earned", onTitle);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[65] flex flex-col items-center gap-2"
      style={{ top: "calc(env(safe-area-inset-top) + 5rem)" }}
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.kind === "title" ? Check : Scroll;
          const accent = t.kind === "title" ? "text-gold border-gold/40 shadow-gold/30" : "text-brand-neon border-brand-neon/40 shadow-brand/30";
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`relative overflow-hidden rounded-2xl border bg-black/75 px-4 py-2.5 backdrop-blur-xl shadow-lg ${accent}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-hud text-[9px] tracking-[0.25em]">[ SYSTEM ]</span>
                <span className="font-mono text-[9px] tracking-widest text-white/35">//</span>
                <Icon className="h-3 w-3" />
                <span className="font-mono text-[10px] tracking-wider text-white/80">{t.text}</span>
              </div>
              {t.sub && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-1 max-w-[260px] truncate text-[13px] font-semibold text-white"
                >
                  {t.sub}
                </motion.div>
              )}
              <motion.span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 ${t.kind === "title" ? "bg-gradient-to-r from-transparent via-gold/25 to-transparent" : "bg-gradient-to-r from-transparent via-brand-neon/25 to-transparent"} skew-x-[-20deg]`}
                animate={{ left: ["-50%", "150%"] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
