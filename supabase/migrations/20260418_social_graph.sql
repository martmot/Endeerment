create extension if not exists pgcrypto;

create table if not exists public.profiles_public (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  points integer not null default 0,
  forest_level integer not null default 1,
  streak integer not null default 0,
  last_check_in timestamptz,
  garden jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_public_email_lower_idx
  on public.profiles_public (lower(email));

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  sender_email text not null,
  receiver_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friend_requests_not_self check (sender_id <> receiver_id)
);

create unique index if not exists friend_requests_pending_unique_idx
  on public.friend_requests (sender_id, receiver_id)
  where status = 'pending';

create table if not exists public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  constraint friendships_not_self check (user_id <> friend_id)
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

drop trigger if exists profiles_public_set_updated_at on public.profiles_public;
create trigger profiles_public_set_updated_at
before update on public.profiles_public
for each row execute procedure public.set_updated_at();

alter table public.profiles_public enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "profiles public read" on public.profiles_public;
create policy "profiles public read"
  on public.profiles_public
  for select
  to authenticated
  using (true);

drop policy if exists "profiles public write own row" on public.profiles_public;
create policy "profiles public write own row"
  on public.profiles_public
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "friend requests read own" on public.friend_requests;
create policy "friend requests read own"
  on public.friend_requests
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "friend requests insert own sender" on public.friend_requests;
create policy "friend requests insert own sender"
  on public.friend_requests
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop policy if exists "friend requests update participants" on public.friend_requests;
create policy "friend requests update participants"
  on public.friend_requests
  for update
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id)
  with check (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "friendships read own" on public.friendships;
create policy "friendships read own"
  on public.friendships
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "friendships insert own" on public.friendships;
create policy "friendships insert own"
  on public.friendships
  for insert
  to authenticated
  with check (auth.uid() = user_id);
