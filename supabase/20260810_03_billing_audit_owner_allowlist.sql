-- Restrict the sensitive Stripe/Supabase billing audit to explicitly allowlisted users.
-- Browser roles receive no direct access; trusted server-side service-role code checks this table.

begin;

create table if not exists public.billing_audit_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_audit_access enable row level security;

revoke all on table public.billing_audit_access from anon, authenticated;

insert into public.billing_audit_access (user_id, enabled, label)
values (
  '5496605a-6c32-4ea7-a31a-ded270863b73',
  true,
  'Justin Cox / Michael J - billing audit owner'
)
on conflict (user_id) do update
set enabled = excluded.enabled,
    label = excluded.label,
    updated_at = now();

commit;
