-- PROPOSED — NOT EXECUTED
-- Phase 2B-1 correction note:
-- This file is documentation for a future reviewed Supabase migration. It has
-- not been executed locally or remotely. Review it in a disposable database
-- before applying it to production.
--
-- Compatibility goal:
--   * Works for a fresh database.
--   * Upgrades the inferred minimal table shape:
--       public.push_subscriptions(user_id uuid, subscription jsonb)
--   * Keeps the current API compatible by deriving endpoint from
--       subscription ->> 'endpoint'
--     in a trigger, so runtime inserts do not need to send an endpoint column.
--
-- Duplicate endpoint policy:
--   Before adding the unique endpoint index, duplicate endpoint rows are
--   deduplicated by keeping the most recently seen row by:
--     last_seen_at, then updated_at, then created_at, then id.
--   Older duplicate rows are deleted. Do not run this migration until that
--   policy is accepted for the target project.

create extension if not exists pgcrypto;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription jsonb not null,
  endpoint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

alter table public.push_subscriptions
  add column if not exists id uuid;

alter table public.push_subscriptions
  alter column id set default gen_random_uuid();

update public.push_subscriptions
set id = gen_random_uuid()
where id is null;

alter table public.push_subscriptions
  alter column id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and contype = 'p'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_pkey primary key (id);
  end if;
end;
$$;

alter table public.push_subscriptions
  add column if not exists user_id uuid,
  add column if not exists subscription jsonb,
  add column if not exists endpoint text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz;

do $$
begin
  if exists (
    select 1 from public.push_subscriptions where user_id is null
  ) then
    raise exception 'push_subscriptions.user_id contains nulls; repair before applying this migration';
  end if;

  if exists (
    select 1 from public.push_subscriptions where subscription is null
  ) then
    raise exception 'push_subscriptions.subscription contains nulls; repair before applying this migration';
  end if;
end;
$$;

alter table public.push_subscriptions
  alter column user_id set not null,
  alter column subscription set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and conname = 'push_subscriptions_user_id_fkey'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end;
$$;

update public.push_subscriptions
set endpoint = nullif(subscription ->> 'endpoint', '')
where endpoint is null
  and subscription ? 'endpoint';

do $$
begin
  if exists (
    select 1
    from public.push_subscriptions
    where endpoint is null
       or endpoint = ''
  ) then
    raise exception 'push_subscriptions has rows without endpoint values; repair before adding endpoint uniqueness';
  end if;
end;
$$;

with ranked_duplicates as (
  select
    id,
    row_number() over (
      partition by endpoint
      order by
        coalesce(last_seen_at, updated_at, created_at) desc,
        id desc
    ) as endpoint_rank
  from public.push_subscriptions
)
delete from public.push_subscriptions target
using ranked_duplicates ranked
where target.id = ranked.id
  and ranked.endpoint_rank > 1;

alter table public.push_subscriptions
  alter column endpoint set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and conname = 'push_subscriptions_has_subscription_endpoint'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_has_subscription_endpoint
      check (
        subscription ? 'endpoint'
        and subscription ? 'keys'
        and (subscription -> 'keys') ? 'p256dh'
        and (subscription -> 'keys') ? 'auth'
        and endpoint = subscription ->> 'endpoint'
      );
  end if;
end;
$$;

create unique index if not exists push_subscriptions_endpoint_unique_idx
  on public.push_subscriptions(endpoint);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

create or replace function public.set_push_subscription_endpoint_fields()
returns trigger
language plpgsql
as $$
begin
  new.endpoint := nullif(new.subscription ->> 'endpoint', '');
  new.updated_at := now();
  new.last_seen_at := now();

  if tg_op = 'INSERT' and new.created_at is null then
    new.created_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists set_push_subscription_endpoint_fields on public.push_subscriptions;
create trigger set_push_subscription_endpoint_fields
before insert or update on public.push_subscriptions
for each row
execute function public.set_push_subscription_endpoint_fields();

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can view own push subscriptions" on public.push_subscriptions;
create policy "Users can view own push subscriptions"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own push subscriptions" on public.push_subscriptions;
create policy "Users can insert own push subscriptions"
on public.push_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
create policy "Users can update own push subscriptions"
on public.push_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;
create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

-- Supabase service-role requests bypass RLS by design and remain available for
-- push sending plus expired-subscription cleanup jobs.
