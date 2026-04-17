-- Document read tracking
--
-- Introduces a `document_reads` join table that mirrors the existing
-- `notice_reads` pattern, but for documents in the library. A read row is
-- inserted the first time a crew member opens a document — distinct from
-- `document_acknowledgements`, which only applies to documents marked
-- `is_required = true` and requires an explicit user action.
--
-- Semantic distinction:
--   • "Read"         — crew member opened the document detail view at
--                      least once (implicit, auto-recorded).
--   • "Acknowledged" — crew member explicitly tapped "Acknowledge" on a
--                      required document (already modelled by
--                      `document_acknowledgements`).
--
-- Why a dedicated `vessel_id` column (vs deriving it via a subquery on
-- `documents` like `document_acknowledgements` does) — the hot admin
-- query is "all reads for all documents on my vessel" when loading the
-- dashboard and exporting compliance reports. A direct
-- vessel_id = current_crew_vessel_id() predicate is an index-only
-- operation on document_reads instead of a join-back into documents on
-- every row.
--
-- Uniqueness: (document_id, crew_member_id) — one read per crew per
-- document. Re-opens are a no-op (we upsert with ON CONFLICT DO NOTHING
-- from the client so read_at stays pinned to the first view).
--
-- This migration has NOT yet been applied to the live DB — run it via
-- the Supabase SQL editor after reviewing it.

-- ---------------------------------------------------------------------------
-- 1. document_reads table
-- ---------------------------------------------------------------------------
create table if not exists document_reads (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  crew_member_id  uuid not null references crew_members(id) on delete cascade,
  vessel_id       uuid not null references vessels(id) on delete cascade,
  read_at         timestamptz not null default now(),
  unique (document_id, crew_member_id)
);

create index if not exists idx_document_reads_document_id
  on document_reads(document_id);
create index if not exists idx_document_reads_crew_member_id
  on document_reads(crew_member_id);
create index if not exists idx_document_reads_vessel_id
  on document_reads(vessel_id);

alter table document_reads enable row level security;

-- ---------------------------------------------------------------------------
-- 2. RLS policies
-- ---------------------------------------------------------------------------
-- Crew on the same vessel can see all read receipts for that vessel (so
-- admins can see who-read-what without a separate admin policy).
drop policy if exists document_reads_select_same_vessel on document_reads;
create policy document_reads_select_same_vessel on document_reads
  for select to authenticated
  using (vessel_id = current_crew_vessel_id());

-- A crew member can only create a read receipt for themselves on a
-- document from their own vessel. The double predicate matches the
-- pattern used by `doc_acks_insert_self`.
drop policy if exists document_reads_insert_own on document_reads;
create policy document_reads_insert_own on document_reads
  for insert to authenticated
  with check (
    crew_member_id = auth.uid()
    and vessel_id = current_crew_vessel_id()
  );

-- Deletes are not exposed. If a crew member is removed the cascade on
-- crew_members handles cleanup; if a document is removed the cascade on
-- documents does the same.
