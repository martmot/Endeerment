create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  points integer not null default 0,
  forest_level integer not null default 1,
  streak integer not null default 0,
  last_check_in timestamptz,
  last_daily_gift_at timestamptz,
  onboarded boolean not null default false,
  inventory jsonb not null default '[]'::jsonb,
  garden jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  check_ins jsonb not null default '[]'::jsonb,
  todos jsonb not null default '[]'::jsonb,
  pet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists app_state_set_updated_at on public.app_state;
create trigger app_state_set_updated_at
before update on public.app_state
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles write own" on public.profiles;
create policy "profiles write own"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "app_state read own" on public.app_state;
create policy "app_state read own"
  on public.app_state
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "app_state write own" on public.app_state;
create policy "app_state write own"
  on public.app_state
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
