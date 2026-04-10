-- Seed notifications
--
-- Matches INITIAL_NOTIFICATIONS from components/CrewBoard.js so the bell
-- badge and notifications panel look identical before/after the refactor.
-- Notification IDs use the 50000000-xxxx... prefix for discoverability.
--
-- Broadcast notifications use target_crew_id = NULL. The one reminder that
-- is personal (ack required on Port Side Hydraulic) targets Tom (CURRENT_USER_ID)
-- so future per-user notification logic has a working example to copy.
--
-- Also tops up the anon RLS policies with insert/update for notifications so
-- handlePostNotice can emit broadcast rows. Delete these alongside the rest
-- of the dev_anon_* policies when Supabase Auth is live.

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
insert into notifications (
  id, vessel_id, target_crew_id, type, title, body,
  reference_type, reference_id, is_read, created_at
) values
  -- 1h ago — unread critical notice (MOB drill)
  ('50000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   null,
   'notice',
   'New critical notice',
   'Man Overboard Drill — 10 April',
   'notice', '30000000-0000-0000-0000-000000000001',
   false, '2026-04-10T09:00:00Z'),

  -- 2h ago — unread document update (Tender Ops SOP)
  ('50000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   null,
   'document',
   'Document updated',
   'Tender Operations SOP updated to v3.2',
   'document', '40000000-0000-0000-0000-000000000001',
   false, '2026-04-10T08:00:00Z'),

  -- Yesterday — read notice (Guest Arrival)
  ('50000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   null,
   'notice',
   'New notice posted',
   'Guest Arrival — 18 April',
   'notice', '30000000-0000-0000-0000-000000000002',
   true, '2026-04-09T10:00:00Z'),

  -- Yesterday — read reminder targeted at Tom (Port Side Hydraulic)
  ('50000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000005', -- Tom Hayes
   'reminder',
   'Acknowledgement required',
   'Please acknowledge: Port Side Hydraulic System notice',
   'notice', '30000000-0000-0000-0000-000000000006',
   true, '2026-04-09T09:00:00Z'),

  -- 2 days ago — read notice (Crew BBQ)
  ('50000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000001',
   null,
   'notice',
   'New notice posted',
   'Crew BBQ — Saturday 12th',
   'notice', '30000000-0000-0000-0000-000000000005',
   true, '2026-04-08T10:00:00Z')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Top up dev_anon policies so the frontend can insert (when a notice is
-- posted) and update (mark-as-read) notifications without auth. Matches the
-- dev-only pattern from migration 002.
-- ---------------------------------------------------------------------------
drop policy if exists dev_anon_notifications_insert on notifications;
create policy dev_anon_notifications_insert on notifications
  for insert to anon with check (true);

drop policy if exists dev_anon_notifications_update on notifications;
create policy dev_anon_notifications_update on notifications
  for update to anon using (true) with check (true);
