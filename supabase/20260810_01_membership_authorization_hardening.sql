-- Embers of Light membership authorization hardening
-- 2026-08-10
--
-- Goals:
--   1. Enable and harden RLS on public.profiles.
--   2. Prevent client-side mutation of billing/admin-controlled profile fields.
--   3. Make broadcast tier authorization hierarchical and payment-status aware.
--   4. Normalize legacy broadcast tier slugs and bind them to tier_definitions.
--   5. Lock down subscription writes to trusted server-side service-role code.
--   6. Harden trigger-function execution/search paths flagged by Supabase advisors.

begin;

-- Canonical slugs used by the application URLs/admin UI.
alter table public.tier_definitions
  add column if not exists tier_slug text;

update public.tier_definitions
set tier_slug = case tier_name
  when 'Seeker' then 'seeker'
  when 'Keepers of the Embers' then 'keepers-of-the-embers'
  when 'Flame Bearers' then 'flame-bearers'
  when 'Phoenix Circle' then 'phoenix-circle'
  when 'Wings of the Phoenix' then 'wings-of-the-phoenix'
  when 'Phoenix Ascending' then 'phoenix-ascending'
  else tier_slug
end
where tier_slug is null
   or tier_slug not in (
     'seeker',
     'keepers-of-the-embers',
     'flame-bearers',
     'phoenix-circle',
     'wings-of-the-phoenix',
     'phoenix-ascending'
   );

alter table public.tier_definitions
  alter column tier_slug set not null;

create unique index if not exists tier_definitions_tier_slug_key
  on public.tier_definitions(tier_slug);

-- Tier definitions are non-sensitive lookup data used by RLS decisions.
grant select on table public.tier_definitions to authenticated;
drop policy if exists "Tier definitions are readable" on public.tier_definitions;
create policy "Tier definitions are readable"
on public.tier_definitions
for select
to authenticated
using (true);

-- Normalize known legacy broadcast values before adding referential integrity.
update public.broadcasts
set target_tier = 'keepers-of-the-embers'
where target_tier = 'keepers';

-- Refuse future broadcasts that target an undefined membership tier slug.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'broadcasts_target_tier_fkey'
      and conrelid = 'public.broadcasts'::regclass
  ) then
    alter table public.broadcasts
      add constraint broadcasts_target_tier_fkey
      foreign key (target_tier)
      references public.tier_definitions(tier_slug);
  end if;
end
$$;

-- Profiles are security-sensitive because role/subscription fields control access.
alter table public.profiles enable row level security;

-- Replace broad legacy policies with explicit authenticated self-service policies.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Authenticated users can view own profile" on public.profiles;
drop policy if exists "Authenticated users can update own profile" on public.profiles;

create policy "Authenticated users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Authenticated users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Defense in depth: browser clients may edit identity/display fields only.
-- role/subscription_tier/subscription_status remain service-role controlled.
revoke insert, delete, truncate on table public.profiles from anon, authenticated;
revoke update on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (first_name, last_name, full_name, username) on table public.profiles to authenticated;

-- Subscription records are server-authoritative billing receipts.
revoke insert, update, delete, truncate on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;

-- Replace exact-tier broadcast read policy with hierarchical active-membership access.
drop policy if exists "Sanctuary View Access" on public.broadcasts;

create policy "Sanctuary View Access"
on public.broadcasts
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.profiles p
    join public.tier_definitions user_tier
      on user_tier.tier_name = p.subscription_tier
    join public.tier_definitions required_tier
      on required_tier.tier_slug = broadcasts.target_tier
    where p.id = auth.uid()
      and p.subscription_status in ('active', 'trialing')
      and user_tier.rank >= required_tier.rank
  )
);

-- Preserve existing admin-only broadcast creation semantics.
drop policy if exists "Sanctuary Broadcast Access" on public.broadcasts;
create policy "Sanctuary Broadcast Access"
on public.broadcasts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

-- Harden signup trigger functions that are invoked by auth.users triggers.
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.handle_new_user_subscription() set search_path = public, pg_temp;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_user_subscription() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

commit;
