-- Per-user notification read tracking
--
-- Introduces a `notification_reads` join table so that marking a broadcast
-- notification (target_crew_id IS NULL) as "read" only affects the current
-- user instead of flipping `notifications.is_read` for the entire vessel.
--
-- Model after this migration:
--   • Targeted notifications (target_crew_id = <user>) continue to use the
--     existing `notifications.is_read` column. That's fine because only one
--     user can ever read a targeted row, so the boolean isn't shared.
--   • Broadcast notifications (target_crew_id IS NULL) no longer consult
--     `notifications.is_read` at all. Per-user read state lives exclusively
--     in `notification_reads`.
--
-- lib/notifications.js encodes this merge: a notification is considered
-- read iff (targeted AND is_read) OR (row exists in notification_reads for
-- the current user).
--
-- This migration has NOT yet been applied to the live DB — run it via the
-- Supabase SQL editor after reviewing it.

-- ---------------------------------------------------------------------------
-- 1. notification_reads table
-- ---------------------------------------------------------------------------
create table if not exists notification_reads (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid not null references notifications(id) on delete cascade,
  crew_member_id  uuid not null references crew_members(id) on delete cascade,
  read_at         timestamptz not null default now(),
  unique (notification_id, crew_member_id)
);

-- The hot query in fetchNotifications is "all reads for this user" (so we
-- can fold them into the notifications result). Index on crew_member_id
-- keeps that cheap regardless of how many notifications the vessel has.
create index if not exists idx_notification_reads_crew_member_id
  on notification_reads(crew_member_id);

alter table notification_reads enable row level security;

-- ---------------------------------------------------------------------------
-- 2. RLS policies — crew manage their own reads only
-- ---------------------------------------------------------------------------
-- A crew member can see, create, and delete their own read receipts. They
-- cannot see anyone else's, and they can't forge a read-receipt on behalf
-- of another user (the `with check (crew_member_id = auth.uid())` clause
-- blocks that).
drop policy if exists notification_reads_select_own on notification_reads;
create policy notification_reads_select_own on notification_reads
  for select to authenticated
  using (crew_member_id = auth.uid());

drop policy if exists notification_reads_insert_own on notification_reads;
create policy notification_reads_insert_own on notification_reads
  for insert to authenticated
  with check (crew_member_id = auth.uid());

drop policy if exists notification_reads_delete_own on notification_reads;
create policy notification_reads_delete_own on notification_reads
  for delete to authenticated
  using (crew_member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Backfill for the seeded notifications
-- ---------------------------------------------------------------------------
-- Two of the seeded broadcast notifications were originally marked
-- `is_read = true` in migration 004 — back when read state was a vessel-
-- wide boolean. Under the new per-user model, that state needs to be
-- re-attributed to a specific crew member so the UI doesn't flap from
-- "read" to "unread" the moment this migration lands.
--
-- The seeded data represents Tom Hayes' view (he's the non-admin dev
-- account), so the two previously-read broadcasts are re-attributed to him
-- via notification_reads rows. The targeted reminder (id …0004) is already
-- owned by Tom and keeps its `is_read = true` on the notifications row
-- itself — no notification_reads row needed for targeted notifications.
--
-- Tom Hayes: crew_members.id = 20000000-0000-0000-0000-000000000005
insert into notification_reads (notification_id, crew_member_id, read_at)
values
  -- Guest Arrival broadcast (previously is_read = true)
  ('50000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000005',
   '2026-04-09T10:30:00Z'),
  -- Crew BBQ broadcast (previously is_read = true)
  ('50000000-0000-0000-0000-000000000005',
   '20000000-0000-0000-0000-000000000005',
   '2026-04-08T10:30:00Z')
on conflict (notification_id, crew_member_id) do nothing;

-- Zero out the now-meaningless `is_read = true` flag on those broadcast
-- rows so the notifications table represents the new model cleanly. The
-- merge logic in lib/notifications.js ignores is_read for broadcasts, so
-- this is cosmetic — but it prevents future maintainers from assuming the
-- column still means anything for target_crew_id IS NULL rows.
update notifications
set is_read = false
where target_crew_id is null
  and id in (
    '50000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000005'
  );
