-- 003_book_a_dino.sql
-- Adds the "Book a Dino" feature: a separate service category for shops that
-- only do dyno pulls (no tuning). Dyno providers sign up through the same
-- /list-shop flow but pick the "Dyno Pull" category, which surfaces them in a
-- separate /dinos browse page and a simpler booking flow.

-- ---------------------------------------------------------------------------
-- 1) Add category to shops + applications
-- ---------------------------------------------------------------------------
-- 'tuner'     → traditional tuning shop (default; keeps backward compat)
-- 'dyno_pull' → dyno-pull-only provider (no tuning, just runs)
-- 'both'      → shop offers both services
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'shops' and column_name = 'category'
  ) then
    alter table public.shops
      add column category text not null default 'tuner'
        check (category in ('tuner', 'dyno_pull', 'both'));
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'shop_applications' and column_name = 'category'
  ) then
    alter table public.shop_applications
      add column category text not null default 'tuner'
        check (category in ('tuner', 'dyno_pull', 'both'));
  end if;
end$$;

create index if not exists shops_category_idx on public.shops (category) where is_approved = true;

-- ---------------------------------------------------------------------------
-- 2) Dyno-rig metadata on shops
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shops' and column_name = 'dyno_brand') then
    alter table public.shops add column dyno_brand text;        -- 'Dynojet', 'Mustang', 'Dynapack', etc.
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shops' and column_name = 'dyno_supports_awd') then
    alter table public.shops add column dyno_supports_awd boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shops' and column_name = 'dyno_max_hp') then
    alter table public.shops add column dyno_max_hp integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shops' and column_name = 'dyno_indoor') then
    alter table public.shops add column dyno_indoor boolean default false;
  end if;
end$$;

-- Same on shop_applications so we capture the info at apply-time.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shop_applications' and column_name = 'dyno_brand') then
    alter table public.shop_applications add column dyno_brand text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shop_applications' and column_name = 'dyno_supports_awd') then
    alter table public.shop_applications add column dyno_supports_awd boolean default false;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shop_applications' and column_name = 'dyno_max_hp') then
    alter table public.shop_applications add column dyno_max_hp integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'shop_applications' and column_name = 'dyno_indoor') then
    alter table public.shop_applications add column dyno_indoor boolean default false;
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- 3) Dyno packages (what a dino provider sells)
-- ---------------------------------------------------------------------------
create table if not exists public.dyno_packages (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,                 -- e.g. "3-Pull Power Run"
  description text,
  num_pulls integer not null default 1 check (num_pulls > 0),
  includes_afr_sweep boolean not null default false,
  includes_data_logging boolean not null default false,
  price_cents integer not null check (price_cents >= 0),
  duration_minutes integer not null default 30,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dyno_packages_shop_active_idx
  on public.dyno_packages (shop_id) where is_active = true;

alter table public.dyno_packages enable row level security;

drop policy if exists "dyno_packages_public_read_active" on public.dyno_packages;
create policy "dyno_packages_public_read_active"
  on public.dyno_packages for select
  using (
    is_active = true
    and shop_id in (select id from public.shops where is_approved = true)
  );

drop policy if exists "dyno_packages_owner_all" on public.dyno_packages;
create policy "dyno_packages_owner_all"
  on public.dyno_packages for all
  to authenticated
  using (shop_id in (select id from public.shops where owner_id = auth.uid()))
  with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 4) booking_type on bookings — distinguishes tune vs dyno-only
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'booking_type'
  ) then
    alter table public.bookings
      add column booking_type text not null default 'tune'
        check (booking_type in ('tune', 'dyno'));
  end if;

  -- Optional FK to a dyno package (nullable — only set on booking_type = 'dyno')
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'dyno_package_id'
  ) then
    alter table public.bookings
      add column dyno_package_id uuid references public.dyno_packages(id) on delete set null;
  end if;
end$$;
