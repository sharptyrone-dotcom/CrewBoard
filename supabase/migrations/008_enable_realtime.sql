-- Enable Supabase Realtime on the tables hooks/useRealtime.js listens to.
--
-- In newer Supabase projects most tables land in the supabase_realtime
-- publication automatically, but we're explicit here so fresh clones of the
-- database — and any project that predates the auto-inclusion default —
-- all end up in the same shape.
--
-- We also set REPLICA IDENTITY FULL on notice_reads so UPDATE payloads
-- include the previous row. Without this, UPDATE events emit only the
-- primary key, and the admin's live read-receipt view would have nothing
-- to merge into the notices state on acknowledgement toggles.
--
-- This migration was applied to the live DB via MCP during development.
-- It's committed here so fresh clones reproduce the realtime setup
-- deterministically.

-- 1. Add the relevant tables to the supabase_realtime publication. Use a
--    guarded DO block so re-running the migration (or running it against
--    a project where the tables are already published) is a no-op.
do $$
declare
  _tables text[] := array['notices', 'notifications', 'notice_reads'];
  _t text;
begin
  foreach _t in array _tables loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = _t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', _t);
    end if;
  end loop;
end $$;

-- 2. Full replica identity on notice_reads so UPDATE payloads include the
--    whole old/new row (needed so the admin read-receipts view can tell
--    which crew member's acknowledgement just flipped).
alter table notice_reads replica identity full;
