/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AppHeader — Desktop header (date + email) + Mobile header (logo + cloud status).
 * Extracted from App.tsx Step 4.
 */

import { type FC } from "react";
import KintsugiBrain from "./KintsugiBrain";

interface AppHeaderProps {
  offlineMode: boolean;
  hasCloudUser: boolean;
  currentEmail?: string | null;
  onGoogleLogin: () => void;
}

const AppHeader: FC<AppHeaderProps> = ({
  offlineMode,
  hasCloudUser,
  currentEmail,
  onGoogleLogin,
}) => {
  return (
    <>
      {/* Compact header (desktop) */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-neutral-850/60">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!offlineMode && hasCloudUser && (
            <span className="text-[10px] text-neutral-500 font-mono">{currentEmail}</span>
          )}
        </div>
      </header>

      {/* Mobile header (logo + status) */}
      <header className="md:hidden flex flex-col sm:flex-row items-center justify-between px-4 pt-4 pb-2 gap-3">
        <div className="flex items-center gap-3 self-start">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-neutral-100 font-bold border border-brand-neon/30 shadow-md shadow-brand/20 glow-purple">
            <KintsugiBrain size={22} />
          </div>
          <div>
            <h1 className="text-lg font-sans font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <span>PROJECT ASCEND</span>
            </h1>
            <span className="text-[10px] text-neutral-400 font-mono">RPG Self-Improvement System</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {!offlineMode && hasCloudUser ? (
            <div className="px-3 py-1.5 rounded-lg bg-purple-950/20 border border-brand/40 text-brand-neon flex items-center gap-2 text-[10px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold">SYNCED</span>
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 rounded-lg bg-orange-950/20 border border-orange-700/30 text-amber-500 flex items-center gap-2 text-[10px] font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="font-bold">OFFLINE</span>
              </div>
              <button onClick={onGoogleLogin} className="px-3 py-1.5 rounded-lg bg-brand text-neutral-200 text-[10px] font-sans font-bold">
                Sync Online
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default AppHeader;
