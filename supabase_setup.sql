-- ============================================================
-- CaloriePro v7 — Secure Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop old tables (migration path)
drop table if exists weight_logs cascade;
drop table if exists food_logs cascade;
drop table if exists profiles cascade;

-- ============================================================
-- PROFILES TABLE
-- Tied to auth.users via user_id FK
-- ============================================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  data jsonb not null default '{}',
  is_admin boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint unique_user_profile unique (user_id)
);

-- Indexes for performance
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_email on profiles(email);
create index idx_profiles_admin on profiles(is_admin) where is_admin = true;

-- Auto-update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- ============================================================
-- WEIGHT LOGS TABLE
-- ============================================================
create table weight_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null,
  date text not null,
  weight numeric not null check (weight > 0 and weight < 1000),
  note text,
  created_at timestamptz not null default now(),

  constraint unique_user_entry unique (user_id, entry_id)
);

create index idx_weight_logs_user_id on weight_logs(user_id);
create index idx_weight_logs_date on weight_logs(date);
create index idx_weight_logs_user_date on weight_logs(user_id, date);

-- ============================================================
-- FOOD LOGS TABLE
-- ============================================================
create table food_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null,
  date text not null,
  name text not null,
  icon text default '🍽️',
  meal text,
  grams numeric check (grams >= 0 and grams < 10000),
  calories int check (calories >= 0 and calories < 50000),
  protein numeric check (protein >= 0 and protein < 1000),
  carbs numeric check (carbs >= 0 and carbs < 1000),
  fat numeric check (fat >= 0 and fat < 1000),
  created_at timestamptz not null default now(),

  constraint unique_user_food_entry unique (user_id, entry_id)
);

create index idx_food_logs_user_id on food_logs(user_id);
create index idx_food_logs_date on food_logs(date);
create index idx_food_logs_user_date on food_logs(user_id, date);

-- ============================================================
-- ENABLE RLS
-- ============================================================
alter table profiles enable row level security;
alter table weight_logs enable row level security;
alter table food_logs enable row level security;

-- ============================================================
-- RLS POLICIES — SECURE: auth.uid() based ONLY
-- No anon access. No public access.
-- ============================================================

-- PROFILES: Users can only access their own row
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (user_id = auth.uid());

create policy "profiles_insert_own"
  on profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- NOTE: Admin panel does NOT read other users' profiles via the client/anon
-- key. It calls /api/admin/clients, which uses the server-side service role
-- key (bypasses RLS) after independently verifying the caller's JWT and
-- is_admin flag. Do NOT add a policy like "is_admin = true OR user_id =
-- auth.uid()" here — combined with profiles_select_own via OR, that would
-- let ANY authenticated user read every admin's profile row (email + data),
-- which is a data leak. profiles_select_own (above) is sufficient for the
-- client to check its own is_admin flag.

-- WEIGHT LOGS: Users can only access their own logs
create policy "weight_logs_select_own"
  on weight_logs for select
  to authenticated
  using (user_id = auth.uid());

create policy "weight_logs_insert_own"
  on weight_logs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "weight_logs_update_own"
  on weight_logs for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "weight_logs_delete_own"
  on weight_logs for delete
  to authenticated
  using (user_id = auth.uid());

-- FOOD LOGS: Users can only access their own logs
create policy "food_logs_select_own"
  on food_logs for select
  to authenticated
  using (user_id = auth.uid());

create policy "food_logs_insert_own"
  on food_logs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "food_logs_update_own"
  on food_logs for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "food_logs_delete_own"
  on food_logs for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- ADMIN SETUP FUNCTION
-- Call ONLY from Supabase SQL editor as project owner.
-- EXECUTE is revoked from public/anon/authenticated.
-- ============================================================
create or replace function set_admin_user(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_email is null or length(trim(target_email)) < 3 then
    raise exception 'Invalid email';
  end if;
  update profiles
  set is_admin = true
  where lower(email) = lower(trim(target_email));
  if not found then
    raise exception 'No profile found for %', target_email;
  end if;
end;
$$;

revoke all on function set_admin_user(text) from public;
revoke all on function set_admin_user(text) from anon;
revoke all on function set_admin_user(text) from authenticated;
