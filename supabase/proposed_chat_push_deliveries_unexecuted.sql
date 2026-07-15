-- PROPOSED — NOT EXECUTED
-- Phase 2B-2 durable chat-push delivery tracking proposal.
-- This file documents a future reviewed Supabase migration. It has not been
-- executed locally or remotely. Review and test it in a disposable database
-- before applying it to production.
--
-- Security model:
--   * Clients must not read or manipulate chat push delivery rows.
--   * Push endpoints remain server/service-role only.
--   * Supabase service-role workflows bypass RLS and are responsible for
--     creating, claiming, retrying, and finalizing delivery rows.
--
-- Runtime behavior documented for reviewers:
--   * Runtime treats pending delivery rows older than 5 minutes as stale and
--     may reclaim them with a conditional update.
--   * attempts counts provider-send claims, not reads or skips. Runtime caps
--     attempts at 3.
--   * Delivery is at-least-once, not exactly-once. If provider delivery
--     succeeds but the later sent update fails, a future stale reclaim can
--     retry the stable eventId/tag.
--   * Future retention should delete old delivery rows after an accepted
--     audit window, for example sent/expired rows older than 30-90 days and
--     permanently failed rows older than the operational support window.

create extension if not exists pgcrypto;

create table if not exists public.chat_push_deliveries (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null
    references public.chat_messages(id)
    on delete cascade,
  recipient_id uuid not null
    references auth.users(id)
    on delete cascade,
  purpose text not null,
  endpoint text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_push_deliveries_purpose_check
    check (purpose in ('whisper', 'mention', 'all')),
  constraint chat_push_deliveries_status_check
    check (status in ('pending', 'sent', 'failed', 'expired')),
  constraint chat_push_deliveries_attempts_nonnegative_check
    check (attempts >= 0),
  constraint chat_push_deliveries_endpoint_length_check
    check (length(btrim(endpoint)) > 0 and length(endpoint) <= 2048),
  constraint chat_push_deliveries_last_error_length_check
    check (last_error is null or length(last_error) <= 128)
);

create unique index if not exists chat_push_deliveries_identity_uidx
  on public.chat_push_deliveries(message_id, recipient_id, purpose, endpoint);

create index if not exists chat_push_deliveries_recipient_id_idx
  on public.chat_push_deliveries(recipient_id);

create index if not exists chat_push_deliveries_retryable_idx
  on public.chat_push_deliveries(status, updated_at)
  where status in ('pending', 'failed');

create or replace function public.set_chat_push_deliveries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_chat_push_delivery_updated_at on public.chat_push_deliveries;
create trigger set_chat_push_delivery_updated_at
before update on public.chat_push_deliveries
for each row
execute function public.set_chat_push_deliveries_updated_at();

alter table public.chat_push_deliveries enable row level security;

revoke all on public.chat_push_deliveries from anon;
revoke all on public.chat_push_deliveries from authenticated;
grant all on public.chat_push_deliveries to service_role;

-- No anon/authenticated RLS policies are created intentionally. With RLS
-- enabled and no client policies, ordinary users cannot read, insert, update,
-- or delete delivery rows. Service-role server code remains the trusted writer.
--
-- Future cleanup examples for a reviewed scheduled job; do not execute as part
-- of this proposed migration:
--
-- delete from public.chat_push_deliveries
-- where status in ('sent', 'expired')
--   and updated_at < now() - interval '90 days';
--
-- delete from public.chat_push_deliveries
-- where status = 'failed'
--   and attempts >= 3
--   and updated_at < now() - interval '30 days';
--
-- Dead push subscriptions that could not be deleted during provider 404/410
-- handling need a separate reviewed cleanup job against public.push_subscriptions.
