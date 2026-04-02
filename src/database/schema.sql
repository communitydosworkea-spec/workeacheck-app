-- ═══════════════════════════════════════════════════════════════════════════
-- WorkeaCheck™ — Supabase Database Schema
-- WorkeaCenter · Sortis Business Tower · Ciudad de Panamá
--
-- PURPOSE:
--   Stores anonymous diagnostic submissions for community intelligence.
--   No PII (personally identifiable information) is ever stored.
--   All fields map directly to the WorkeaCheck™ form structure.
--
-- INTEGRATION:
--   Phase 2 — use the Supabase JavaScript client:
--   import { createClient } from '@supabase/supabase-js'
--
-- NOTES:
--   - uuid_generate_v4() requires the pgcrypto extension (enabled by default
--     in Supabase projects).
--   - jsonb columns (area_scores, raw_answers) allow flexible querying
--     with Postgres JSON operators.
--   - Row Level Security (RLS) should be configured so only the service-role
--     key can INSERT, and the anon key can SELECT aggregated views.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- EXTENSION (already enabled in Supabase)
-- ─────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────────
-- TABLE: submissions
-- One row per completed WorkeaCheck™ session.
-- ─────────────────────────────────────────────
create table if not exists public.submissions (

  -- Primary key
  id                uuid        primary key default gen_random_uuid(),

  -- ── PROFILE ──────────────────────────────────────────────────────────────
  sector            text        not null,
  -- Values: 'tec' | 'srv' | 'leg' | 'sal' | 'fin' | 'com' | 'con' |
  --         'edu' | 'gas' | 'log' | 'mkt' | 'mfg' | 'oth'

  tenure            text        not null,
  -- Values: 'm1' (< 1 year) | '13' (1-3y) | '37' (3-7y) | 'm7' (> 7y)

  team_size         text        not null,
  -- Values: 's1' | '25' | '615' | 'm15'

  market            text        not null,
  -- Values: 'pan' | 'cam' | 'int'

  -- ── AREAS SELECTED ────────────────────────────────────────────────────────
  areas_selected    text[]      not null,
  -- Array of area IDs: ['fin', 'mar', 'ops', 'tal', 'leg', 'tec', 'est']

  -- ── SCORES ────────────────────────────────────────────────────────────────
  global_score      smallint    not null check (global_score between 0 and 100),
  -- Composite average of all selected area scores

  area_scores       jsonb       not null default '{}',
  -- Structured score object per area. Example:
  -- {
  --   "fin": { "score": 67, "level": "ascenso" },
  --   "mar": { "score": 42, "level": "pista" }
  -- }

  -- ── RAW ANSWERS (for drill-down analysis) ────────────────────────────────
  raw_answers       jsonb       not null default '{}',
  -- Flat map of questionId → answer value. Example:
  -- { "fv": "3", "fe": "par", "fc": "yo", "fd": "2", "ff": "no" }

  -- ── AI INTELLIGENCE CACHE ─────────────────────────────────────────────────
  ai_intelligence   jsonb       default null,
  -- Full response from generateAllIntelligence() per area.
  -- Cached here to avoid re-generating on page revisit.
  -- { "fin": { "criticalPoint": {...}, "checklist": [...], ... } }

  -- ── QR & CONVERSION TRACKING ─────────────────────────────────────────────
  qr_source         text        default 'unknown',
  -- Which QR was scanned: 'coffee_area' | 'recepcion' | 'entrada' | 'unknown'

  google_review     boolean     not null default false,
  -- Did the Workero claim the Google review incentive?

  incentive_claimed boolean     not null default false,
  -- Was the physical reward collected at reception?

  incentive_type    text        default null,
  -- 'snack' | 'sticker' | 'boligrafo' | null

  -- ── TIMESTAMPS ────────────────────────────────────────────────────────────
  submitted_at      timestamptz not null default now(),
  -- UTC timestamp of form completion

  claimed_at        timestamptz default null
  -- UTC timestamp of incentive claim at reception

);

-- ─────────────────────────────────────────────
-- INDEXES for dashboard queries
-- ─────────────────────────────────────────────

-- Most queried: area selection frequency analysis
create index if not exists idx_submissions_areas
  on public.submissions using gin (areas_selected);

-- Score range filtering for benchmark reports
create index if not exists idx_submissions_global_score
  on public.submissions (global_score);

-- Sector segmentation
create index if not exists idx_submissions_sector
  on public.submissions (sector);

-- Temporal trend analysis (monthly reviews)
create index if not exists idx_submissions_submitted_at
  on public.submissions (submitted_at desc);

-- QR effectiveness
create index if not exists idx_submissions_qr_source
  on public.submissions (qr_source);

-- JSONB area scores queries (e.g. WHERE area_scores->'fin'->>'level' = 'tierra')
create index if not exists idx_submissions_area_scores
  on public.submissions using gin (area_scores);


-- ─────────────────────────────────────────────
-- TABLE: qr_scans
-- Tracks raw scan events (before form completion).
-- Enables funnel analysis: scans → starts → completions.
-- ─────────────────────────────────────────────
create table if not exists public.qr_scans (

  id          uuid        primary key default gen_random_uuid(),
  qr_source   text        not null,
  scanned_at  timestamptz not null default now(),
  user_agent  text        default null,  -- Browser/device info (no PII)
  completed   boolean     not null default false
  -- Updated to true when the linked submission is persisted

);

create index if not exists idx_qr_scans_source
  on public.qr_scans (qr_source);

create index if not exists idx_qr_scans_date
  on public.qr_scans (scanned_at desc);


-- ─────────────────────────────────────────────
-- TABLE: incentive_redemptions
-- Tracks physical rewards claimed at reception.
-- Foreign key to submissions for conversion funnel.
-- ─────────────────────────────────────────────
create table if not exists public.incentive_redemptions (

  id              uuid        primary key default gen_random_uuid(),
  submission_id   uuid        not null references public.submissions(id) on delete cascade,
  incentive_type  text        not null,
  -- 'snack' | 'sticker' | 'boligrafo'
  redeemed_at     timestamptz not null default now(),
  staff_note      text        default null
  -- Optional reception team note

);

create index if not exists idx_redemptions_submission
  on public.incentive_redemptions (submission_id);

create index if not exists idx_redemptions_date
  on public.incentive_redemptions (redeemed_at desc);


-- ─────────────────────────────────────────────
-- VIEW: community_intelligence_summary
-- Pre-aggregated dashboard data for Looker Studio.
-- Refresh: Supabase materialized views or scheduled function.
-- ─────────────────────────────────────────────
create or replace view public.community_intelligence_summary as
select
  date_trunc('month', submitted_at)::date as month,
  sector,
  tenure,
  team_size,
  market,
  count(*)                                as total_submissions,
  round(avg(global_score))                as avg_global_score,
  count(*) filter (where google_review)   as google_reviews_generated,
  count(*) filter (where incentive_claimed) as incentives_claimed,
  qr_source
from public.submissions
group by 1, 2, 3, 4, 5, 10
order by 1 desc;


-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS after confirming service role access.
-- ─────────────────────────────────────────────

-- Enable RLS on submissions
alter table public.submissions enable row level security;

-- Allow anonymous INSERT (form submission — no auth required)
create policy "anon_can_insert_submissions"
  on public.submissions
  for insert
  to anon
  with check (true);

-- Only service role can SELECT individual rows (dashboard backend)
create policy "service_role_can_read_submissions"
  on public.submissions
  for select
  to service_role
  using (true);

-- Enable RLS on qr_scans
alter table public.qr_scans enable row level security;

create policy "anon_can_insert_qr_scans"
  on public.qr_scans
  for insert
  to anon
  with check (true);

-- ─────────────────────────────────────────────
-- SAMPLE DATA (for development/testing only)
-- Remove before production deployment.
-- ─────────────────────────────────────────────

/*
insert into public.submissions (
  sector, tenure, team_size, market,
  areas_selected, global_score, area_scores, raw_answers, qr_source
) values
(
  'srv', '13', '25', 'pan',
  ARRAY['fin', 'mar'],
  54,
  '{"fin": {"score": 62, "level": "ascenso"}, "mar": {"score": 46, "level": "pista"}}'::jsonb,
  '{"fv": "3", "fe": "par", "fc": "yo", "mp": "2", "mi": "par", "mc": "nada"}'::jsonb,
  'coffee_area'
),
(
  'tec', '37', '615', 'int',
  ARRAY['ops', 'tec', 'est'],
  71,
  '{"ops": {"score": 68, "level": "ascenso"}, "tec": {"score": 80, "level": "despegado"}, "est": {"score": 65, "level": "ascenso"}}'::jsonb,
  '{"oa": "par", "od": "4", "kd": "4", "kc": "si", "ev": "si", "es": "par"}'::jsonb,
  'entrada'
);
*/
