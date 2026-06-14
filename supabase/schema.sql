-- Project Ascend — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- Creates the two tables the app reads/writes (profiles, daily_logs),
-- enables Row Level Security, and restricts every row to its owner.

-- ─────────────────────────────────────────────────────────────
-- profiles  (one row per user, keyed by the Supabase auth user id)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  display_name        text default 'User',
  level               integer default 1,
  xp                  integer default 0,
  pillars             jsonb   default '{}'::jsonb,
  achievements        jsonb   default '[]'::jsonb,
  level_up_history    jsonb   default '[]'::jsonb,
  onboarding_complete boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles
  for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- daily_logs  (one row per user per day)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.daily_logs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  date            text not null,
  completed_tasks jsonb default '{}'::jsonb,
  pillar_notes    jsonb default '{}'::jsonb,
  journal_entry   text  default '',
  unique (user_id, date)   -- required for upsert-by-(user,date) to update instead of duplicate
);

alter table public.daily_logs enable row level security;

drop policy if exists "Users manage their own daily logs" on public.daily_logs;
create policy "Users manage their own daily logs"
  on public.daily_logs
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
