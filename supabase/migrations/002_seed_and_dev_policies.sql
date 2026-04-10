-- Seed data + POC anon policies
--
-- NOTE: this migration opens read/write to anonymous users so the app works
-- before Supabase Auth is wired up. Remove the "dev_anon_*" policies below
-- once real sign-in is in place and the frontend starts using auth.uid().

-- ---------------------------------------------------------------------------
-- Stable UUIDs so the frontend can reference rows directly
-- ---------------------------------------------------------------------------
-- Vessel:     10000000-0000-0000-0000-000000000001  (M/Y Serenity)
-- Crew 1..8:  20000000-0000-0000-0000-00000000000X
-- Notices:    30000000-0000-0000-0000-00000000000X

-- ---------------------------------------------------------------------------
-- Vessel
-- ---------------------------------------------------------------------------
insert into vessels (id, name, imo_number, flag_state, vessel_type, max_crew)
values (
  '10000000-0000-0000-0000-000000000001',
  'M/Y Serenity',
  'IMO9876543',
  'Cayman Islands',
  'Motor Yacht',
  14
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Crew members (mapping keeps the mock numeric ids as the last hex digit)
-- ---------------------------------------------------------------------------
insert into crew_members (id, vessel_id, email, full_name, role, department, is_admin, is_hod, avatar_initials, is_active)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'james.ward@serenity.yacht',     'James Ward',      'Bosun',              'Deck',     false, true,  'JW', true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'sophie.laurent@serenity.yacht', 'Sophie Laurent',  'Chief Stewardess',   'Interior', true,  true,  'SL', true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'marco.rossi@serenity.yacht',    'Marco Rossi',     '2nd Engineer',       'Engine',   false, false, 'MR', true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'emily.chen@serenity.yacht',     'Emily Chen',      'Stewardess',         'Interior', false, false, 'EC', true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'tom.hayes@serenity.yacht',      'Tom Hayes',       'Deckhand',           'Deck',     false, false, 'TH', true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'ana.petrova@serenity.yacht',    'Ana Petrova',     '3rd Stewardess',     'Interior', false, false, 'AP', true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'ryan.obrien@serenity.yacht',    'Ryan O''Brien',   'Junior Engineer',    'Engine',   false, false, 'RO', true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'lisa.muller@serenity.yacht',    'Lisa Müller',     'Head Chef',          'Interior', false, true,  'LM', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Notices (matches INITIAL_NOTICES in components/CrewBoard.js)
-- ---------------------------------------------------------------------------
insert into notices (
  id, vessel_id, created_by, title, body, category, priority,
  department_target, is_pinned, requires_acknowledgement, created_at
) values
  ('30000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Man Overboard Drill — 10 April',
   'All crew to muster at 1000hrs on the aft deck for scheduled MOB drill. Full PPE required. Tender crew to have rescue boat prepped by 0945. This is a mandatory drill — all departments must ensure coverage.',
   'Safety', 'critical', 'All', true, true, '2026-04-09T08:00:00Z'),

  ('30000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Guest Arrival — 18 April',
   '6 guests arriving by helicopter transfer at approximately 1400hrs. Full welcome protocol. Interior to have welcome drinks and canapés prepared. Deck to ensure helipad is clear and secured from 1300hrs. Detailed guest preference sheets to follow.',
   'Guest Info', 'important', 'All', true, false, '2026-04-08T14:30:00Z'),

  ('30000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'WiFi Maintenance — 12 April',
   'Crew WiFi will be offline between 0200–0400 for firmware updates to the VSAT system. Bridge systems unaffected. Please download anything you need before 0200.',
   'Operations', 'routine', 'All', false, false, '2026-04-08T10:00:00Z'),

  ('30000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'New Tender Operating SOP',
   'Updated tender operations SOP has been uploaded to the Document Library. All deck crew must review and acknowledge by 15 April. Key changes in Section 3.2 regarding passenger boarding procedures.',
   'Safety', 'important', 'Deck', false, true, '2026-04-07T16:00:00Z'),

  ('30000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000008',
   'Crew BBQ — Saturday 12th',
   'Crew BBQ on the crew mess aft deck from 1800hrs. Chef Lisa is doing her famous jerk chicken. BYO drinks. Off-watch crew only — check rota.',
   'Social', 'routine', 'All', false, false, '2026-04-07T09:00:00Z'),

  ('30000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000003',
   'Port Side Hydraulic System — Restricted Area',
   'Port side hydraulic system under maintenance until further notice. Area cordoned off — no crew to enter without Chief Engineer authorisation. Risk assessment RA-2026-041 applies.',
   'Safety', 'critical', 'Engine', false, true, '2026-04-06T11:00:00Z')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- DEV-ONLY permissive RLS policies for the anon role.
--
-- These live alongside the strict auth-based policies in 001. Because RLS
-- evaluates policies with OR, an anonymous browser session can read/write
-- the seeded data even though auth.uid() is null.
--
-- Delete everything below this line when Supabase Auth is wired up.
-- ---------------------------------------------------------------------------

drop policy if exists dev_anon_vessels on vessels;
create policy dev_anon_vessels on vessels
  for select to anon using (true);

drop policy if exists dev_anon_crew_select on crew_members;
create policy dev_anon_crew_select on crew_members
  for select to anon using (true);

drop policy if exists dev_anon_notices_select on notices;
create policy dev_anon_notices_select on notices
  for select to anon using (true);

drop policy if exists dev_anon_notices_insert on notices;
create policy dev_anon_notices_insert on notices
  for insert to anon with check (true);

drop policy if exists dev_anon_notices_update on notices;
create policy dev_anon_notices_update on notices
  for update to anon using (true) with check (true);

drop policy if exists dev_anon_notice_reads_select on notice_reads;
create policy dev_anon_notice_reads_select on notice_reads
  for select to anon using (true);

drop policy if exists dev_anon_notice_reads_insert on notice_reads;
create policy dev_anon_notice_reads_insert on notice_reads
  for insert to anon with check (true);

drop policy if exists dev_anon_notice_reads_update on notice_reads;
create policy dev_anon_notice_reads_update on notice_reads
  for update to anon using (true) with check (true);

drop policy if exists dev_anon_documents_select on documents;
create policy dev_anon_documents_select on documents
  for select to anon using (true);

drop policy if exists dev_anon_doc_acks_select on document_acknowledgements;
create policy dev_anon_doc_acks_select on document_acknowledgements
  for select to anon using (true);

drop policy if exists dev_anon_doc_acks_insert on document_acknowledgements;
create policy dev_anon_doc_acks_insert on document_acknowledgements
  for insert to anon with check (true);

drop policy if exists dev_anon_notifications_select on notifications;
create policy dev_anon_notifications_select on notifications
  for select to anon using (true);
