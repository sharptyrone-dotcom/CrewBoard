-- Seed activity_log + dev anon policies
--
-- Backfills historical audit rows so the admin Activity Log screen
-- isn't empty on first load. Each row mirrors one of the existing
-- document_acknowledgements or notice publications already seeded in
-- earlier migrations, keeping the timeline coherent.
--
-- `metadata` stores a denormalised title so the UI can still render
-- even if the referenced row gets hard-deleted later.
--
-- Also adds dev_anon select + insert policies so the frontend can read
-- and append activity without auth. Delete alongside the rest of the
-- dev_anon_* policies when Supabase Auth lands.

-- ---------------------------------------------------------------------------
-- Dev-only RLS
-- ---------------------------------------------------------------------------
drop policy if exists dev_anon_activity_select on activity_log;
create policy dev_anon_activity_select on activity_log
  for select to anon using (true);

drop policy if exists dev_anon_activity_insert on activity_log;
create policy dev_anon_activity_insert on activity_log
  for insert to anon with check (true);

-- ---------------------------------------------------------------------------
-- Historical activity rows
-- IDs use the 60000000-xxxx... prefix. Timestamps match the source rows
-- from migration 002/003 so the chronology is stable.
-- ---------------------------------------------------------------------------
insert into activity_log (
  id, vessel_id, crew_member_id, action, target_type, target_id, metadata, created_at
) values
  -- Notice publications (derived from notices.created_at + created_by)
  ('60000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'notice_posted', 'notice',
   '30000000-0000-0000-0000-000000000001',
   jsonb_build_object('title', 'Man Overboard Drill — 10 April', 'priority', 'critical'),
   '2026-04-09T08:00:00Z'),

  ('60000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', 'notice_posted', 'notice',
   '30000000-0000-0000-0000-000000000002',
   jsonb_build_object('title', 'Guest Arrival — 18 April', 'priority', 'important'),
   '2026-04-08T14:30:00Z'),

  ('60000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'notice_posted', 'notice',
   '30000000-0000-0000-0000-000000000003',
   jsonb_build_object('title', 'WiFi Maintenance — 12 April', 'priority', 'routine'),
   '2026-04-08T10:00:00Z'),

  ('60000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'notice_posted', 'notice',
   '30000000-0000-0000-0000-000000000004',
   jsonb_build_object('title', 'New Tender Operating SOP', 'priority', 'important'),
   '2026-04-07T16:00:00Z'),

  ('60000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003', 'notice_posted', 'notice',
   '30000000-0000-0000-0000-000000000006',
   jsonb_build_object('title', 'Port Side Hydraulic System — Restricted Area', 'priority', 'critical'),
   '2026-04-06T11:00:00Z'),

  -- Notice acknowledgements (from notice_reads in 002)
  ('60000000-0000-0000-0000-000000000010',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'notice_acknowledged', 'notice',
   '30000000-0000-0000-0000-000000000001',
   jsonb_build_object('title', 'Man Overboard Drill — 10 April'),
   '2026-04-09T08:30:00Z'),

  ('60000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000005', 'notice_acknowledged', 'notice',
   '30000000-0000-0000-0000-000000000001',
   jsonb_build_object('title', 'Man Overboard Drill — 10 April'),
   '2026-04-09T09:10:00Z'),

  ('60000000-0000-0000-0000-000000000012',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003', 'notice_acknowledged', 'notice',
   '30000000-0000-0000-0000-000000000006',
   jsonb_build_object('title', 'Port Side Hydraulic System — Restricted Area'),
   '2026-04-06T12:00:00Z'),

  ('60000000-0000-0000-0000-000000000013',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000007', 'notice_acknowledged', 'notice',
   '30000000-0000-0000-0000-000000000006',
   jsonb_build_object('title', 'Port Side Hydraulic System — Restricted Area'),
   '2026-04-06T12:30:00Z'),

  -- Document acknowledgements (from document_acknowledgements in 003)
  ('60000000-0000-0000-0000-000000000020',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000001',
   jsonb_build_object('title', 'Tender Operations SOP', 'version', '3.2'),
   '2026-04-07T18:00:00Z'),

  ('60000000-0000-0000-0000-000000000021',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000002',
   jsonb_build_object('title', 'Anchor Winch Risk Assessment', 'version', '2.1'),
   '2026-03-16T10:00:00Z'),

  ('60000000-0000-0000-0000-000000000022',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000005', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000002',
   jsonb_build_object('title', 'Anchor Winch Risk Assessment', 'version', '2.1'),
   '2026-03-17T11:30:00Z'),

  ('60000000-0000-0000-0000-000000000023',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000004',
   jsonb_build_object('title', 'COSHH — Cleaning Chemicals', 'version', '1.4'),
   '2026-03-21T10:00:00Z'),

  ('60000000-0000-0000-0000-000000000024',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000004', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000004',
   jsonb_build_object('title', 'COSHH — Cleaning Chemicals', 'version', '1.4'),
   '2026-03-22T14:30:00Z'),

  ('60000000-0000-0000-0000-000000000025',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000008',
   jsonb_build_object('title', 'Helicopter Operations SOP', 'version', '2.0'),
   '2026-03-11T08:00:00Z'),

  ('60000000-0000-0000-0000-000000000026',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000005', 'document_acknowledged', 'document',
   '40000000-0000-0000-0000-000000000008',
   jsonb_build_object('title', 'Helicopter Operations SOP', 'version', '2.0'),
   '2026-03-12T10:15:00Z')
on conflict (id) do nothing;
