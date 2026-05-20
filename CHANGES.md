# Security hardening + Book-a-Dino feature

## Summary

Three logical changes bundled here:

1. **Security hardening** — webhook idempotency, rate limiting, CSP headers, RLS policies, scrubbed env example.
2. **Book-a-Dino feature** — new shop category for dyno-pull-only providers, with their own listing, booking flow, and packages model.
3. **Profile page stub** — minimal `/dashboard/profile` editor (no other "missing pages" — the rest already existed).

The 3 SQL migrations have already been applied to production Supabase.

## Files changed

### Security
- `.env.local.example` — replaced real Supabase URL, real admin email, and other live values with placeholders.
- `next.config.js` — full security header set (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Webhook route excluded from CSP since Stripe needs unrestricted reach.
- `lib/rate-limit.ts` — new, in-memory rate limiter for API routes.
- `app/api/stripe/webhook/route.ts` — added idempotency via `processed_stripe_events` table; rolls back the dedup row on handler failure so Stripe retries.
- `app/api/email/waitlist/route.ts` — rate-limited (10/min/IP).
- `app/api/email/shop-application/route.ts` — rate-limited (5/min/IP).

### Migrations (already run)
- `migrations/001_processed_stripe_events.sql` — webhook idempotency table, RLS-locked, service-role only.
- `migrations/002_rls_policies.sql` — RLS + least-privilege policies on `shops`, `shop_applications`, `vehicles`, `bookings`, `payments`, `profiles`, `customer_waitlist`.
- `migrations/003_book_a_dino.sql` — `category` column on shops/applications; dyno-rig metadata (`dyno_brand`, `dyno_supports_awd`, `dyno_max_hp`, `dyno_indoor`); new `dyno_packages` table with RLS; `booking_type` and `dyno_package_id` on bookings.

### Book-a-Dino
- `app/list-shop/page.tsx` — segmented "Tuner / Dyno Pull / Both" toggle at the top; dyno-rig fields appear conditionally.
- `app/dinos/page.tsx` — new dyno-only listing page with brand / AWD / indoor filters.
- `app/book/dino/[shopId]/page.tsx` — new dyno booking flow with package selector, date/time, notes.
- `app/page.tsx` — added "Book a Dyno" to nav and hero CTAs.

### Other
- `app/dashboard/profile/page.tsx` — basic profile editor (didn't exist).

## Why

- The PAT in `.git/config` was a clear-text leak. With the env example + admin email also exposed, a copy of this folder = full repo write access. Token revoked, env scrubbed.
- The webhook had no idempotency. Stripe retries non-2xx responses; without dedup, transient errors would double-insert payment rows.
- RLS was implicit. Anon key + no policies = full read/write on every table. Now locked down to least-privilege.
- Book-a-Dino addresses the original ask: separate category for dyno-only providers, surfaced through the same `list my shop` flow but routed through their own browse + booking experience.

## Rollback

Migrations are idempotent (`if not exists` / `drop policy if exists`) so re-running is safe. To roll back the schema:

```sql
drop table if exists public.dyno_packages cascade;
alter table public.bookings drop column if exists booking_type, drop column if exists dyno_package_id;
alter table public.shops drop column if exists category, drop column if exists dyno_brand, drop column if exists dyno_supports_awd, drop column if exists dyno_max_hp, drop column if exists dyno_indoor;
alter table public.shop_applications drop column if exists category, drop column if exists dyno_brand, drop column if exists dyno_supports_awd, drop column if exists dyno_max_hp, drop column if exists dyno_indoor;
drop table if exists public.processed_stripe_events;
```

RLS policies can be removed by dropping policies individually — but think twice; turning RLS off again re-opens the data.
