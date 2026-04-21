create extension if not exists pgcrypto;

create table if not exists public.plugins (
  id text primary key,
  name text not null,
  publisher text not null,
  category text not null,
  app_profile text not null,
  rating numeric not null default 0,
  installs_count integer not null default 0,
  latest_version text not null,
  risk_level text not null default 'Low',
  description text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.plugin_versions (
  id uuid primary key default gen_random_uuid(),
  plugin_id text not null references public.plugins(id) on delete cascade,
  version text not null,
  status text not null default 'legacy',
  requires_review boolean not null default false,
  risk_level text not null default 'Low',
  changelog jsonb not null default '[]'::jsonb,
  permissions_added jsonb not null default '[]'::jsonb,
  permissions_removed jsonb not null default '[]'::jsonb,
  capabilities_added jsonb not null default '[]'::jsonb,
  capabilities_removed jsonb not null default '[]'::jsonb,
  compatibility_before text,
  compatibility_after text,
  risk_summary text,
  released_at timestamptz not null default now(),
  unique(plugin_id, version)
);

create table if not exists public.installs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plugin_id text not null references public.plugins(id) on delete cascade,
  installed_version text not null,
  status text not null default 'Active',
  auto_update boolean not null default true,
  pinned_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, plugin_id)
);

create table if not exists public.update_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plugin_id text not null references public.plugins(id) on delete cascade,
  from_version text not null,
  to_version text not null,
  summary text not null,
  stages_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  username_normalized text generated always as (lower(username)) stored unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (
    username ~ '^[A-Za-z0-9-]{3,24}$'
    and username !~ '(^-|-$|--)'
  )
);

alter table public.installs enable row level security;
alter table public.update_runs enable row level security;
alter table public.profiles enable row level security;
alter table public.installs force row level security;
alter table public.update_runs force row level security;
alter table public.profiles force row level security;

drop policy if exists installs_select_own on public.installs;
create policy installs_select_own on public.installs
for select using (auth.uid() = user_id);

drop policy if exists installs_insert_own on public.installs;
create policy installs_insert_own on public.installs
for insert with check (auth.uid() = user_id);

drop policy if exists installs_update_own on public.installs;
create policy installs_update_own on public.installs
for update using (auth.uid() = user_id);

drop policy if exists installs_delete_own on public.installs;
create policy installs_delete_own on public.installs
for delete using (auth.uid() = user_id);

drop policy if exists runs_select_own on public.update_runs;
create policy runs_select_own on public.update_runs
for select using (auth.uid() = user_id);

drop policy if exists runs_insert_own on public.update_runs;
create policy runs_insert_own on public.update_runs
for insert with check (auth.uid() = user_id);

alter table public.plugins enable row level security;
alter table public.plugin_versions enable row level security;

drop policy if exists plugins_read_all on public.plugins;
create policy plugins_read_all on public.plugins
for select using (true);

drop policy if exists versions_read_all on public.plugin_versions;
create policy versions_read_all on public.plugin_versions
for select using (true);

drop policy if exists profiles_read_authenticated on public.profiles;
create policy profiles_read_authenticated on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
for delete using (auth.uid() = id);
