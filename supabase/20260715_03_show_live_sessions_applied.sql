-- APPLIED TO PRODUCTION - 2026-07-15
-- Rise Radio live-show session foundation record.
--
-- Confirmed production outcome:
--   * public.show_live_sessions exists.
--   * All columns, constraints, and indexes below are present.
--   * created_by references public.profiles(id) on delete set null.
--   * RLS is enabled.
--   * No anon or authenticated policies exist.
--   * service_role is the intended server-side access path.
--   * public.set_embers_show_live_session_updated_at() uses
--     search_path = public, pg_temp.
--   * set_embers_show_live_session_updated_at trigger is present.
--
-- Purpose:
--   Durable, server-owned records for explicit hosted-show live sessions.
--   Zeno player presence or audio playback does not create rows and does not
--   imply that a hosted show is live.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.show_live_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  show_id text not null,
  platform text not null,
  external_session_id text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  notification_event_id text,
  notification_attempted_at timestamptz,
  notification_sent_at timestamptz,
  notification_summary jsonb,
  notification_last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint show_live_sessions_platform_check
    check (platform in ('manual', 'twitch', 'zeno')),
  constraint show_live_sessions_show_id_length_check
    check (char_length(show_id) between 1 and 80),
  constraint show_live_sessions_external_session_id_length_check
    check (external_session_id is null or char_length(external_session_id) <= 160),
  constraint show_live_sessions_notification_event_id_length_check
    check (notification_event_id is null or char_length(notification_event_id) <= 180),
  constraint show_live_sessions_notification_last_error_length_check
    check (notification_last_error is null or char_length(notification_last_error) <= 500),
  constraint show_live_sessions_end_after_start_check
    check (ended_at is null or ended_at >= started_at),
  constraint show_live_sessions_notification_sent_after_start_check
    check (notification_sent_at is null or notification_sent_at >= started_at),
  constraint show_live_sessions_notification_attempt_after_start_check
    check (notification_attempted_at is null or notification_attempted_at >= started_at)
);

create unique index if not exists show_live_sessions_one_active_show_uidx
  on public.show_live_sessions(show_id)
  where ended_at is null;

create unique index if not exists show_live_sessions_external_event_uidx
  on public.show_live_sessions(show_id, platform, external_session_id)
  where external_session_id is not null;

create index if not exists show_live_sessions_active_started_at_idx
  on public.show_live_sessions(started_at desc)
  where ended_at is null;

create index if not exists show_live_sessions_show_started_at_idx
  on public.show_live_sessions(show_id, started_at desc);

create index if not exists show_live_sessions_created_by_idx
  on public.show_live_sessions(created_by)
  where created_by is not null;

create or replace function public.set_embers_show_live_session_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_embers_show_live_session_updated_at on public.show_live_sessions;
create trigger set_embers_show_live_session_updated_at
before update on public.show_live_sessions
for each row
execute function public.set_embers_show_live_session_updated_at();

alter table public.show_live_sessions enable row level security;

revoke all on public.show_live_sessions from anon;
revoke all on public.show_live_sessions from authenticated;
grant all on public.show_live_sessions to service_role;

comment on table public.show_live_sessions is
  'Durable server-owned live sessions for explicit Rise Radio hosted-show start/end events.';
comment on column public.show_live_sessions.show_id is
  'Stable application show ID from src/utils/showRegistry.ts.';
comment on column public.show_live_sessions.platform is
  'Trusted source that started the session: manual admin control, Twitch webhook, or Zeno/admin event.';
comment on column public.show_live_sessions.external_session_id is
  'Optional upstream event/session identifier for webhook deduplication.';
comment on column public.show_live_sessions.notification_event_id is
  'Stable push event/tag identifier used to collapse duplicate client display.';
comment on index public.show_live_sessions_one_active_show_uidx is
  'Prevents two simultaneous active live sessions for the same show.';
comment on index public.show_live_sessions_external_event_uidx is
  'Deduplicates repeated provider events with the same external session identifier.';

-- Read-only verification queries for the applied schema:
--
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'show_live_sessions'
-- order by ordinal_position;
--
-- select indexname, indexdef
-- from pg_indexes
-- where schemaname = 'public'
--   and tablename = 'show_live_sessions'
-- order by indexname;
--
-- select relrowsecurity
-- from pg_class
-- where oid = 'public.show_live_sessions'::regclass;
--
-- select polname, polcmd, polroles, polqual, polwithcheck
-- from pg_policy
-- where polrelid = 'public.show_live_sessions'::regclass;
--
-- Rollback notes, if this applied migration must be removed:
--
-- drop trigger if exists set_embers_show_live_session_updated_at on public.show_live_sessions;
-- drop function if exists public.set_embers_show_live_session_updated_at();
-- drop table if exists public.show_live_sessions;
--
-- Destructive/potentially disruptive statements:
--   * drop trigger if exists set_embers_show_live_session_updated_at on public.show_live_sessions;
--     This only replaces the project-scoped trigger created by this migration.
--   * rollback drop table would remove all live-session history and should not
--     be run unless explicitly intended.
--
-- Rows deleted, consolidated, overwritten, or reassigned by this migration:
--   None. No data backfill, duplicate cleanup, reassignment, or deletion was performed.
--
-- Locking/disruption:
--   Creating this table and indexes did not require changes to existing chat or
--   push tables. The trigger drop/create only affects public.show_live_sessions.
