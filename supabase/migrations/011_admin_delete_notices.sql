-- Admin-only notice deletion + helper for admin role checks
--
-- Two changes:
--
-- 1. Introduces a SECURITY DEFINER helper `is_current_crew_admin()` that
--    returns true if the caller's crew_members row has is_admin = true.
--    Mirrors the existing `current_crew_vessel_id()` helper pattern so
--    policies stay readable and avoid recursive lookups against
--    crew_members inside its own policy.
--
-- 2. Replaces the existing `notices_delete_same_vessel` policy with an
--    admin-only equivalent. The old policy let any crew member on the
--    same vessel delete notices, which was fine for dev-anon but is
--    unsafe now that real auth is live. Non-admin crew should never be
--    able to delete someone else's announcement.
--
-- The UI already uses notices.expires_at (added in 001) as the "valid
-- until" field, so no column changes are needed — this migration only
-- tightens who can DELETE.
--
-- Roll-forward notes: the frontend's `deleteNotice()` call in
-- lib/notices.js assumes an admin session, and the realtime hook
-- already has an onNoticeDelete callback that fans the DELETE event
-- out to every connected client via postgres_changes, so deletions
-- disappear from the notice board live.

-- ---------------------------------------------------------------------------
-- 1. Admin-check helper
-- ---------------------------------------------------------------------------
create or replace function is_current_crew_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from crew_members where id = auth.uid() limit 1),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Replace the existing DELETE policy with an admin-only one
-- ---------------------------------------------------------------------------
drop policy if exists notices_delete_same_vessel on notices;
drop policy if exists notices_delete_admin on notices;
create policy notices_delete_admin on notices
  for delete to authenticated
  using (
    vessel_id = current_crew_vessel_id()
    and is_current_crew_admin()
  );
