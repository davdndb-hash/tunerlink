-- 001_processed_stripe_events.sql
-- Idempotency table for Stripe webhook delivery. Stripe retries failed
-- deliveries; we record event IDs to avoid double-processing.

create table if not exists public.processed_stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- Auto-prune events older than 60 days (Stripe's max retry window is 3 days).
-- Run this as a scheduled job in Supabase, or via pg_cron if available.
-- Example pg_cron job (uncomment if pg_cron is enabled):
-- select cron.schedule(
--   'prune-processed-stripe-events',
--   '0 3 * * *', -- 3am daily
--   $$ delete from public.processed_stripe_events where processed_at < now() - interval '60 days' $$
-- );

-- Lock down: only the service role should ever touch this table.
alter table public.processed_stripe_events enable row level security;

-- No policies = no access for anon/authenticated roles. Service role bypasses RLS.
-- Explicitly revoke just to be safe.
revoke all on public.processed_stripe_events from anon, authenticated;
