-- Menő Manó leaderboard table.
-- Stores scores for all three difficulties in a single table, keyed by the
-- `difficulty` column so each category has its own leaderboard view.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL editor → New query
-- → paste → Run). Safe to re-run: every statement is idempotent.

create table if not exists menomano_scores (
  id bigint generated always as identity primary key,
  name varchar(5) not null,
  score integer not null check (score >= 0 and score <= 99999),
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard')),
  created_at timestamptz not null default now()
);

create index if not exists menomano_scores_difficulty_score_created_idx
  on menomano_scores (difficulty, score desc, created_at asc);

-- Row Level Security: the server-side API uses the service role key,
-- which bypasses RLS, so we can leave RLS enabled with no policies to
-- block any direct client access.
alter table menomano_scores enable row level security;
