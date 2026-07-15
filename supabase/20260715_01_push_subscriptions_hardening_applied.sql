-- APPLIED TO PRODUCTION - 2026-07-15
-- Push subscription hardening record.
--
-- Confirmed production outcome:
--   * public.push_subscriptions was upgraded in place.
--   * 9 existing rows were preserved.
--   * No duplicate-row deletion or consolidation was executed.
--   * Existing foreign key to public.profiles(id) was preserved.
--   * Existing RLS policies were preserved.
--   * endpoint, updated_at, and last_seen_at were added.
--   * endpoint values were backfilled from subscription ->> 'endpoint'.
--   * push_subscriptions_endpoint_unique_idx was added.
--   * push_subscriptions_user_id_idx was added.
--   * push_subscriptions_valid_payload_check was added.
--   * push_subscriptions_endpoint_format_check was added.
--   * public.set_embers_push_subscription_fields() was added.
--   * set_embers_push_subscription_fields trigger was added.
--
-- This file records the applied schema. Do not run it blindly against another
-- environment without a fresh preflight review of existing rows, constraints,
-- policies, and foreign keys.

alter table public.push_subscriptions
  add column if not exists endpoint text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz;

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
    raise exception 'push_subscriptions has rows without endpoint values; repair before enforcing endpoint constraints';
  end if;
end;
$$;

alter table public.push_subscriptions
  alter column endpoint set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and conname = 'push_subscriptions_valid_payload_check'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_valid_payload_check
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.push_subscriptions'::regclass
      and conname = 'push_subscriptions_endpoint_format_check'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_endpoint_format_check
      check (
        length(endpoint) between 9 and 2048
        and endpoint like 'https://%'
        and endpoint !~ '[[:space:]]'
      );
  end if;
end;
$$;

create unique index if not exists push_subscriptions_endpoint_unique_idx
  on public.push_subscriptions(endpoint);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

create or replace function public.set_embers_push_subscription_fields()
returns trigger
language plpgsql
as $$
begin
  new.endpoint := nullif(new.subscription ->> 'endpoint', '');
  new.updated_at := now();
  new.last_seen_at := now();

  return new;
end;
$$;

drop trigger if exists set_embers_push_subscription_fields on public.push_subscriptions;
create trigger set_embers_push_subscription_fields
before insert or update on public.push_subscriptions
for each row
execute function public.set_embers_push_subscription_fields();

-- Production preserved the existing public.push_subscriptions(user_id)
-- foreign key to public.profiles(id). No replacement FK to auth.users(id) was
-- applied.
--
-- Production preserved existing RLS policies. No policy replacement was
-- applied in this migration record.
