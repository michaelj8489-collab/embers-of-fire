-- Embers of Light retired chat database cleanup
-- 2026-08-10
--
-- This migration preserves a data-only snapshot in a locked archive schema,
-- then removes the retired chat feature from the live public schema.
-- The chat_uploads bucket is made private and its upload policy is removed,
-- but physical Storage objects are intentionally NOT deleted by SQL.

begin;

create schema if not exists archive;
revoke all on schema archive from public, anon, authenticated;

-- Snapshot retired chat data before dropping the live tables.
drop table if exists archive.chat_messages_20260810;
create table archive.chat_messages_20260810 as
select * from public.chat_messages;

drop table if exists archive.chat_commands_20260810;
create table archive.chat_commands_20260810 as
select * from public.chat_commands;

drop table if exists archive.chat_push_deliveries_20260810;
create table archive.chat_push_deliveries_20260810 as
select * from public.chat_push_deliveries;

-- Preserve Storage metadata for the four retired uploads. This does not copy binary objects.
drop table if exists archive.chat_uploads_metadata_20260810;
create table archive.chat_uploads_metadata_20260810 as
select id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata
from storage.objects
where bucket_id = 'chat_uploads';

revoke all on all tables in schema archive from public, anon, authenticated;

-- Remove old chat messages from Supabase Realtime before dropping the table.
do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime drop table public.chat_messages;
  end if;
end
$$;

-- Retire the upload surface. Keep the bucket/data quarantined for manual Storage deletion.
drop policy if exists "Allow authenticated users to upload" on storage.objects;
update storage.buckets
set public = false
where id = 'chat_uploads';

-- Drop child table first because it references chat_messages.
drop table if exists public.chat_push_deliveries cascade;
drop table if exists public.chat_messages cascade;
drop table if exists public.chat_commands cascade;

drop function if exists public.set_embers_chat_push_delivery_updated_at();

commit;
