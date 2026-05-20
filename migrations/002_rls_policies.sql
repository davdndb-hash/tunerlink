-- 002_rls_policies.sql
-- Enables Row Level Security on every public table and adds least-privilege
-- policies. Run in order (idempotent — safe to re-run).
--
-- Roles:
--   anon          → unauthenticated browser visitor
--   authenticated → logged-in user (browser using anon key + JWT)
--   service_role  → server-side only (bypasses RLS automatically)
--
-- Verify after running:
--   select schemaname, tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public';

-- ---------------------------------------------------------------------------
-- shops
-- ---------------------------------------------------------------------------
alter table public.shops enable row level security;

drop policy if exists "shops_public_read_approved" on public.shops;
create policy "shops_public_read_approved"
  on public.shops for select
  using (is_approved = true);

drop policy if exists "shops_owner_read_own" on public.shops;
create policy "shops_owner_read_own"
  on public.shops for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "shops_owner_update_own" on public.shops;
create policy "shops_owner_update_own"
  on public.shops for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Insert is admin-only (via service_role) — applications are the public path.

-- ---------------------------------------------------------------------------
-- shop_applications
-- ---------------------------------------------------------------------------
alter table public.shop_applications enable row level security;

-- Anyone can submit an application (anon + authenticated).
drop policy if exists "shop_applications_public_insert" on public.shop_applications;
create policy "shop_applications_public_insert"
  on public.shop_applications for insert
  to anon, authenticated
  with check (true);

-- Applicants can read only their own (matched by email of authed user).
drop policy if exists "shop_applications_self_read" on public.shop_applications;
create policy "shop_applications_self_read"
  on public.shop_applications for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
alter table public.vehicles enable row level security;

drop policy if exists "vehicles_owner_all" on public.vehicles;
create policy "vehicles_owner_all"
  on public.vehicles for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
alter table public.bookings enable row level security;

-- Customer can see their own bookings; shop owner can see bookings for their shop.
drop policy if exists "bookings_customer_read" on public.bookings;
create policy "bookings_customer_read"
  on public.bookings for select
  to authenticated
  using (customer_id = auth.uid());

drop policy if exists "bookings_shop_read" on public.bookings;
create policy "bookings_shop_read"
  on public.bookings for select
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));

drop policy if exists "bookings_customer_insert" on public.bookings;
create policy "bookings_customer_insert"
  on public.bookings for insert
  to authenticated
  with check (customer_id = auth.uid());

drop policy if exists "bookings_customer_update_own" on public.bookings;
create policy "bookings_customer_update_own"
  on public.bookings for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

drop policy if exists "bookings_shop_update" on public.bookings;
create policy "bookings_shop_update"
  on public.bookings for update
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
alter table public.payments enable row level security;

-- Customers and shop owners can read their own payment rows. All writes are
-- service_role-only (Stripe webhook).
drop policy if exists "payments_customer_read" on public.payments;
create policy "payments_customer_read"
  on public.payments for select
  to authenticated
  using (customer_id = auth.uid());

drop policy if exists "payments_shop_read" on public.payments;
create policy "payments_shop_read"
  on public.payments for select
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_all" on public.profiles;
create policy "profiles_self_all"
  on public.profiles for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Public read for shop owner profiles is OK — exposes only role + display info.
-- (Adjust below if profile contains PII you don't want exposed.)
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- ---------------------------------------------------------------------------
-- customer_waitlist
-- ---------------------------------------------------------------------------
alter table public.customer_waitlist enable row level security;

-- Anyone can sign up (no read access for anon — prevents email harvesting).
drop policy if exists "customer_waitlist_public_insert" on public.customer_waitlist;
create policy "customer_waitlist_public_insert"
  on public.customer_waitlist for insert
  to anon, authenticated
  with check (true);

-- Authenticated user can verify their own row (used by the email endpoint flow).
drop policy if exists "customer_waitlist_self_read" on public.customer_waitlist;
create policy "customer_waitlist_self_read"
  on public.customer_waitlist for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));
