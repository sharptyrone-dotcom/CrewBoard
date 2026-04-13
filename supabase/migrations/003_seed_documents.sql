-- Seed documents + document_acknowledgements
--
-- Matches INITIAL_DOCS from components/CrewNotice.js so the visual state
-- before/after the refactor looks the same. Document IDs use the
-- 40000000-xxxx... prefix for discoverability.
--
-- Also tops up the anon RLS policies with insert/update/delete for
-- documents so admins can upload later. Delete these alongside the rest
-- of the dev_anon_* policies when Supabase Auth is live.

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------
insert into documents (
  id, vessel_id, uploaded_by, title, doc_type, department, version,
  file_url, file_size_bytes, page_count, is_required, review_date, updated_at
) values
  ('40000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', -- Sophie (admin)
   'Tender Operations SOP', 'SOPs', 'Deck', '3.2',
   'https://example.com/docs/tender-ops-sop-v3.2.pdf', 512000, 12, true, '2026-10-07', '2026-04-07T16:00:00Z'),

  ('40000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Anchor Winch Risk Assessment', 'Risk Assessments', 'Deck', '2.1',
   'https://example.com/docs/anchor-winch-ra-v2.1.pdf', 180000, 4, true, '2026-09-15', '2026-03-15T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Engine Room Safety Manual', 'Manuals', 'Engine', '5.0',
   'https://example.com/docs/engine-room-safety-v5.0.pdf', 2400000, 48, true, '2026-08-01', '2026-02-01T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'COSHH — Cleaning Chemicals', 'MSDS/COSHH', 'Interior', '1.4',
   'https://example.com/docs/coshh-cleaning-v1.4.pdf', 340000, 8, true, '2026-09-20', '2026-03-20T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Bridge Watchkeeping Procedures', 'SOPs', 'Bridge', '4.1',
   'https://example.com/docs/bridge-watchkeeping-v4.1.pdf', 920000, 22, true, '2026-07-10', '2026-01-10T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Guest Service Standards', 'Policies', 'Interior', '2.0',
   'https://example.com/docs/guest-service-v2.0.pdf', 620000, 15, false, '2026-09-01', '2026-03-01T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Hot Work Permit Checklist', 'Checklists', 'Engine', '1.2',
   'https://example.com/docs/hot-work-permit-v1.2.pdf', 85000, 2, true, '2026-08-28', '2026-02-28T09:00:00Z'),

  ('40000000-0000-0000-0000-000000000008',
   '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Helicopter Operations SOP', 'SOPs', 'Deck', '2.0',
   'https://example.com/docs/heli-ops-v2.0.pdf', 780000, 18, true, '2026-09-10', '2026-03-10T09:00:00Z')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed acknowledgements matching the original mock data
-- Crew UUIDs: 20000000-...-00000000000X where X matches the mock numeric id.
-- ---------------------------------------------------------------------------
insert into document_acknowledgements (document_id, crew_member_id, version_at_acknowledgement, acknowledged_at) values
  -- Doc 1 (Tender Ops SOP) ack'd by James
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '3.2', '2026-04-07T18:00:00Z'),
  -- Doc 2 (Anchor Winch RA) ack'd by James, Tom
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2.1', '2026-03-16T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', '2.1', '2026-03-17T11:30:00Z'),
  -- Doc 3 (Engine Room Safety) ack'd by Marco, Ryan
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '5.0', '2026-02-02T08:00:00Z'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', '5.0', '2026-02-03T13:15:00Z'),
  -- Doc 4 (COSHH) ack'd by Sophie, Emily, Ana
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '1.4', '2026-03-21T10:00:00Z'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '1.4', '2026-03-22T14:30:00Z'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006', '1.4', '2026-03-23T09:45:00Z'),
  -- Doc 5 (Bridge Watchkeeping) ack'd by James
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '4.1', '2026-01-11T08:30:00Z'),
  -- Doc 6 (Guest Service Standards) ack'd by Sophie, Emily
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', '2.0', '2026-03-02T09:00:00Z'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', '2.0', '2026-03-03T11:00:00Z'),
  -- Doc 7 (Hot Work Permit) — no acknowledgements yet
  -- Doc 8 (Helicopter Ops) ack'd by James, Tom
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', '2.0', '2026-03-11T08:00:00Z'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '2.0', '2026-03-12T10:15:00Z')
on conflict (document_id, crew_member_id) do nothing;

-- ---------------------------------------------------------------------------
-- Top up dev_anon policies for documents (insert/update/delete) so admins
-- can upload and edit before auth is wired. Matches the dev-only pattern
-- from migration 002.
-- ---------------------------------------------------------------------------
drop policy if exists dev_anon_documents_insert on documents;
create policy dev_anon_documents_insert on documents
  for insert to anon with check (true);

drop policy if exists dev_anon_documents_update on documents;
create policy dev_anon_documents_update on documents
  for update to anon using (true) with check (true);

drop policy if exists dev_anon_documents_delete on documents;
create policy dev_anon_documents_delete on documents
  for delete to anon using (true);

drop policy if exists dev_anon_doc_acks_update on document_acknowledgements;
create policy dev_anon_doc_acks_update on document_acknowledgements
  for update to anon using (true) with check (true);
