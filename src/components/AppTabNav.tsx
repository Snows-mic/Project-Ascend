/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppTabNav — Mobile pill tab nav + Bottom fixed mobile nav bar.
 * Extracted from App.tsx Step 4.
 */

import { type FC } from "react";
import { type LucideIcon } from "lucide-react";

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
    <>
      {/* Pill tab nav — visible on mobile & tablet, hidden when sidebar is present */}
      <nav className="md:hidden flex mx-4 mt-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-850/80 overflow-x-auto select-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
              activeTab === item.id
                ? "bg-brand text-neutral-100 border border-brand-neon/30 shadow shadow-brand/20"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Fixed bottom mobile nav bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-855 backdrop-blur-md flex items-center justify-around px-4 md:hidden z-55 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 text-center select-none cursor-pointer ${activeTab === item.id ? "text-brand-neon" : "text-neutral-400"}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-sans font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};

export default AppTabNav;
