-- last_seen_at tracking for the online indicator
--
-- The `crew_members.last_seen_at` column already exists from migration 001,
-- but there's no policy allowing anon writes, and every seeded crew member
-- has NULL for it. This migration:
--
--   1. Adds a dev_anon update policy so the app can touch last_seen_at on
--      every page load. Delete this alongside the rest of the dev_anon_*
--      policies when Supabase Auth lands.
--
--   2. Backfills last_seen_at on the seeded crew using `now() - interval`
--      so the crew list has a realistic mix of online/offline members the
--      first time you load the app after migrating. The app then overwrites
--      Tom's value on every page load, and (eventually) other crew members
--      will be overwriting theirs the same way.

-- ---------------------------------------------------------------------------
-- Dev-only update policy for crew_members
-- ---------------------------------------------------------------------------
drop policy if exists dev_anon_crew_members_update on crew_members;
create policy dev_anon_crew_members_update on crew_members
  for update to anon using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Backfill last_seen_at on the seeded crew
-- ---------------------------------------------------------------------------
update crew_members set last_seen_at = now() - interval '30 seconds'
  where id = '20000000-0000-0000-0000-000000000001'; -- James  (online)

update crew_members set last_seen_at = now() - interval '1 minute'
  where id = '20000000-0000-0000-0000-000000000002'; -- Sophie (online)

update crew_members set last_seen_at = now() - interval '3 minutes'
  where id = '20000000-0000-0000-0000-000000000003'; -- Marco  (online, edge of threshold)

update crew_members set last_seen_at = now() - interval '8 minutes'
  where id = '20000000-0000-0000-0000-000000000004'; -- Emily  (offline, recently)

update crew_members set last_seen_at = now() - interval '2 minutes'
  where id = '20000000-0000-0000-0000-000000000005'; -- Tom    (online — will be overwritten on first page load anyway)

update crew_members set last_seen_at = now() - interval '45 minutes'
  where id = '20000000-0000-0000-0000-000000000006'; -- Ana    (offline)

update crew_members set last_seen_at = now() - interval '4 minutes'
  where id = '20000000-0000-0000-0000-000000000007'; -- Ryan   (online, right at threshold)

update crew_members set last_seen_at = now() - interval '2 hours'
  where id = '20000000-0000-0000-0000-000000000008'; -- Lisa   (offline)
