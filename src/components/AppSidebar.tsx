/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppSidebar — Desktop left sidebar with logo, nav, cloud status, level, sign out.
 * Extracted from App.tsx Step 4.
 */

import { type FC } from "react";
import { type LucideIcon, LogOut, Cloud } from "lucide-react";
import KintsugiBrain from "./KintsugiBrain";

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface AppSidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  offlineMode: boolean;
  hasCloudUser: boolean;
  profileLevel: number;
  profileXp: number;
  onGoogleLogin: () => void;
  onLogout: () => void;
}

const AppSidebar: FC<AppSidebarProps> = ({
  navItems,
  activeTab,
  onTabChange,
  offlineMode,
  hasCloudUser,
  profileLevel,
  profileXp,
  onGoogleLogin,
  onLogout,
}) => {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-neutral-850 bg-neutral-900/60 backdrop-blur-sm relative z-10">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-neutral-100 font-bold border border-brand-neon/30 shadow-md shadow-brand/20 glow-purple">
            <KintsugiBrain size={22} />
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold tracking-tight text-neutral-100">
              PROJECT ASCEND
            </h1>
            <span className="text-[10px] text-neutral-500 font-mono">RPG Self-Improvement</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all cursor-pointer ${
              activeTab === item.id
                ? "bg-brand/20 text-brand-neon border border-brand/30"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User + footer */}
      <div className="px-4 py-4 border-t border-neutral-850 space-y-3">
        {/* Cloud status */}
        {!offlineMode && hasCloudUser ? (
          <div className="px-3 py-2 rounded-lg bg-purple-950/20 border border-brand/40 flex items-center gap-2 text-[10px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-brand-neon font-bold">CLOUD SYNCED</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-orange-950/20 border border-orange-700/30 flex items-center gap-2 text-[10px] font-mono text-amber-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-bold">LOCAL (OFFLINE)</span>
            </div>
            <button
              onClick={onGoogleLogin}
              className="w-full px-3 py-2 rounded-lg bg-brand hover:bg-brand-dark text-neutral-200 text-xs font-sans font-bold transition-colors cursor-pointer border border-brand-neon/20"
            >
              <Cloud className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Sync Online
            </button>
          </div>
        )}

        {/* Level badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-850/50">
          <span className="text-[10px] text-neutral-500 font-mono">LV.{profileLevel}</span>
          <span className="text-[10px] text-neutral-400 font-mono ml-auto">{profileXp} XP</span>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-850/50 text-xs font-mono transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
