-- APPLIED TO PRODUCTION - 2026-07-15
-- Durable chat push delivery tracking record.
--
-- Confirmed production outcome:
--   * public.chat_push_deliveries was created.
--   * All applied columns and constraints are present.
--   * All applied indexes are present.
--   * RLS is enabled.
--   * No anon/authenticated policies exist.
--   * service_role has access.
--   * public.set_embers_chat_push_delivery_updated_at() is present.
--   * set_embers_chat_push_delivery_updated_at trigger is present.
--
-- Runtime behavior:
--   * pending rows older than 5 minutes may be reclaimed by the server route.
--   * attempts counts provider-send claims, not reads or skips.
--   * runtime caps attempts at 3.
--   * delivery is at-least-once, not exactly-once.
--   * old sent/expired/failed rows need future reviewed retention cleanup.

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

create or replace function public.set_embers_chat_push_delivery_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_embers_chat_push_delivery_updated_at on public.chat_push_deliveries;
create trigger set_embers_chat_push_delivery_updated_at
before update on public.chat_push_deliveries
for each row
execute function public.set_embers_chat_push_delivery_updated_at();

alter table public.chat_push_deliveries enable row level security;

revoke all on public.chat_push_deliveries from anon;
revoke all on public.chat_push_deliveries from authenticated;
grant all on public.chat_push_deliveries to service_role;

-- No anon/authenticated RLS policies are created intentionally. With RLS
-- enabled and no client policies, ordinary users cannot read, insert, update,
-- or delete delivery rows. Service-role server code remains the trusted writer.
--
-- Future cleanup examples for a reviewed scheduled job; do not execute as part
-- of this applied migration record:
--
-- delete from public.chat_push_deliveries
-- where status in ('sent', 'expired')
--   and updated_at < now() - interval '90 days';
--
-- delete from public.chat_push_deliveries
-- where status = 'failed'
--   and attempts >= 3
--   and updated_at < now() - interval '30 days';
