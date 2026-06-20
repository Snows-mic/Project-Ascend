/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppTabNav — Mobile bottom nav with iOS frosted-blur feel + animated active pill.
 */

import { type FC } from "react";
import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface AppTabNavProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppTabNav: FC<AppTabNavProps> = ({
  navItems,
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Gradient fade above the bar so content doesn't visually clip into it */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-black/70 to-transparent"
      />
      <div className="relative backdrop-blur-2xl bg-black/65 border-t border-white/[0.06] px-1 pt-1.5 pb-1.5 flex items-stretch justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-1 min-h-[54px] flex-col items-center justify-center gap-1 py-1.5 px-1 select-none cursor-pointer rounded-xl transition-colors ${
                isActive
                  ? "text-brand-neon"
                  : "text-white/45 active:text-white/65"
              }`}
              aria-pressed={isActive}
            >
              {/* Active pill — shared layout id smoothly slides between tabs */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-1 rounded-xl bg-brand/15 ring-1 ring-brand/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <motion.span
                className="relative flex items-center justify-center"
                animate={isActive ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} />
              </motion.span>
              <span
                className={`relative text-[10px] font-semibold leading-none tracking-wide ${
                  isActive ? "text-brand-neon" : "text-white/55"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default AppTabNav;
