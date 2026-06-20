/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------ */
/*  Auth Helpers                                                       */
/* ------------------------------------------------------------------ */

/** Sign in with Google OAuth via Supabase */
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Bug reports — test-user feedback → owner reads them in the          */
/*  Supabase dashboard (bug_reports table). Falls back to a localStorage*/
/*  queue if the network/insert fails, then flushes on next open.       */
/* ------------------------------------------------------------------ */

export interface BugReport {
  user_id?: string;
  email?: string;
  category: string;
  message: string;
  screen?: string;
  app_version?: string;
  user_agent?: string;
  viewport?: string;
}

const BUG_QUEUE_KEY = "projectff_bugqueue";

function queueBugReport(r: BugReport) {
  try {
    const q: BugReport[] = JSON.parse(
      localStorage.getItem(BUG_QUEUE_KEY) || "[]",
    );
    q.push(r);
    localStorage.setItem(BUG_QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
}

/** Insert a bug report. Returns "sent" if it reached Supabase, "queued" if it
 *  was stored locally to retry later (offline / table missing / RLS). */
export async function submitBugReport(r: BugReport): Promise<"sent" | "queued"> {
  try {
    const { error } = await supabase.from("bug_reports").insert(r);
    if (error) throw error;
    return "sent";
  } catch {
    queueBugReport(r);
    return "queued";
  }
}

/** Best-effort flush of any locally queued reports (call on app/modal open). */
export async function flushBugReports(): Promise<void> {
  let q: BugReport[];
  try {
    q = JSON.parse(localStorage.getItem(BUG_QUEUE_KEY) || "[]");
  } catch {
    return;
  }
  if (!q.length) return;
  const remaining: BugReport[] = [];
  for (const r of q) {
    const { error } = await supabase.from("bug_reports").insert(r);
    if (error) remaining.push(r);
  }
  localStorage.setItem(BUG_QUEUE_KEY, JSON.stringify(remaining));
}

/* ------------------------------------------------------------------ */
/*  Database helpers (Supabase → typed wrappers)                       */
/* ------------------------------------------------------------------ */

import type { UserProfile, DailyLog } from "./types";

export async function fetchProfile(
  uid: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return supabaseRowToProfile(data);
}

export async function upsertProfile(profile: UserProfile): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(profileToSupabaseRow(profile));
  if (error) throw error;
}

export async function fetchDailyLog(
  uid: string,
  date: string,
): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", uid)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return supabaseRowToLog(data);
}

export async function upsertDailyLog(log: DailyLog): Promise<void> {
  const { error } = await supabase
    .from("daily_logs")
    .upsert(logToSupabaseRow(log), { onConflict: "user_id,date" });
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Real-time subscriptions (replaces Firestore onSnapshot)            */
/* ------------------------------------------------------------------ */

export function subscribeToProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
) {
  const channel = supabase
    .channel(`profile-${uid}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${uid}`,
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          callback(null);
        } else {
          callback(supabaseRowToProfile(payload.new as any));
        }
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToDailyLog(
  uid: string,
  date: string,
  callback: (log: DailyLog | null) => void,
) {
  const channel = supabase
    .channel(`log-${uid}-${date}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "daily_logs",
        filter: `user_id=eq.${uid}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (payload.eventType === "DELETE" || !row) {
          callback(null);
        } else if (row.date === date) {
          callback(supabaseRowToLog(row));
        }
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/* ------------------------------------------------------------------ */
/*  Row ↔ App-type conversion                                          */
/* ------------------------------------------------------------------ */

interface SupabaseProfileRow {
  id: string;
  email: string;
  display_name: string;
  level: number;
  xp: number;
  pillars: Record<string, any>;
  achievements: string[];
  level_up_history: any[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseLogRow {
  id?: number;
  user_id: string;
  date: string;
  completed_tasks: Record<string, boolean>;
  pillar_notes: Record<string, string>;
  journal_entry: string;
}

function supabaseRowToProfile(row: SupabaseProfileRow): UserProfile {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    level: row.level,
    xp: row.xp,
    pillars: row.pillars || {},
    achievements: row.achievements || [],
    levelUpHistory: row.level_up_history || [],
    onboardingComplete: row.onboarding_complete,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function profileToSupabaseRow(p: UserProfile): SupabaseProfileRow {
  return {
    id: p.uid,
    email: p.email,
    display_name: p.displayName || "User",
    level: p.level,
    xp: p.xp,
    pillars: p.pillars,
    achievements: p.achievements,
    level_up_history: p.levelUpHistory,
    onboarding_complete: p.onboardingComplete,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// Structured journal fields (morning/mood/etc.) are packed into the existing
// pillar_notes JSONB under a reserved "__journal" key — no DB migration needed.
function supabaseRowToLog(row: SupabaseLogRow): DailyLog {
  const pn: Record<string, string> = { ...(row.pillar_notes || {}) };
  let extras: Partial<DailyLog> = {};
  if (pn.__journal) {
    try {
      extras = JSON.parse(pn.__journal);
    } catch {
      /* ignore */
    }
    delete pn.__journal;
  }
  return {
    userId: row.user_id,
    date: row.date,
    completedTasks: row.completed_tasks || {},
    pillarNotes: pn,
    journalEntry: row.journal_entry || "",
    morningIntention: extras.morningIntention,
    mood: extras.mood,
    gratitude: extras.gratitude,
    win: extras.win,
  };
}

function logToSupabaseRow(log: DailyLog): SupabaseLogRow {
  return {
    user_id: log.userId,
    date: log.date,
    completed_tasks: log.completedTasks,
    pillar_notes: {
      ...log.pillarNotes,
      __journal: JSON.stringify({
        morningIntention: log.morningIntention || "",
        mood: log.mood || "",
        gratitude: log.gratitude || "",
        win: log.win || "",
      }),
    },
    journal_entry: log.journalEntry,
  };
}
