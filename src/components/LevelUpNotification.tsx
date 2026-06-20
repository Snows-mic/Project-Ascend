/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * LevelUpNotification — Full-screen celebratory modal when the user levels up.
 * Shows previous level → new level with animation and particle effects.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, X } from 'lucide-react';

interface LevelUpNotificationProps {
  fromLevel: number;
  toLevel: number;
  onDismiss: () => void;
}

export default function LevelUpNotification({ fromLevel, toLevel, onDismiss }: LevelUpNotificationProps) {
  const [visible, setVisible] = useState(true);
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      size: 4 + Math.random() * 8,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md"
          onClick={onDismiss}
        >
          {/* Floating particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-brand-neon pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: '50%',
              }}
              initial={{ opacity: 0.8, y: 0, scale: 0 }}
              animate={{ opacity: 0, y: -300 - Math.random() * 200, scale: 1.5 }}
              transition={{ delay: p.delay, duration: p.duration, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-neutral-950 border-2 border-brand-neon rounded-3xl p-10 md:p-14 max-w-md w-full text-center shadow-[0_0_80px_rgba(168,85,247,0.4)]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-850 transition cursor-pointer text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand to-brand-neon flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.5)] border-2 border-brand-neon/50"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-mono uppercase tracking-widest text-brand-neon mb-2"
            >
              Level Up!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <span className="text-4xl font-mono font-black text-neutral-500 line-through">
                Lv.{fromLevel}
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 400 }}
                className="text-5xl font-mono font-black text-brand-neon"
              >
                Lv.{toLevel}
              </motion.span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-xs text-neutral-400 font-sans"
            >
              Your dedication is paying off. Keep pushing forward.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6"
            >
              <button
                onClick={onDismiss}
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-neutral-100 font-sans font-semibold text-sm transition-colors cursor-pointer border border-brand-neon/30"
              >
                <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
