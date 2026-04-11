-- Document uploads: storage bucket + RLS for the vessel-documents bucket +
-- admin-only write policies on the public.documents table.
--
-- Prior to this migration:
--   • no storage bucket existed, so the Upload Doc button was a no-op;
--   • public.documents had wide-open same-vessel INSERT/UPDATE/DELETE
--     policies, so any crew member on the vessel could clobber the
--     library. Fine for dev, not fine now that auth is live.
--
-- Changes:
--
-- 1. Create a private storage bucket `vessel-documents` with a 50 MB
--    per-object limit and a PDF-only MIME allowlist. Files are namespaced
--    by vessel so storage RLS can enforce tenant isolation with a simple
--    path check: objects live at `{vessel_id}/{uuid}-{filename}`.
--
-- 2. Storage RLS (on storage.objects):
--      • SELECT — any authenticated crew member whose vessel matches the
--        first path segment. This lets non-admin crew download the PDFs
--        they're required to acknowledge.
--      • INSERT/UPDATE/DELETE — same vessel AND is_current_crew_admin().
--        Only admins can push changes into the library.
--
-- 3. Tighten public.documents writes to admins only. The existing
--    *_same_vessel INSERT/UPDATE/DELETE policies are replaced with
--    *_admin variants that additionally call is_current_crew_admin()
--    (added in migration 011). SELECT stays wide — crew need to read.
--
-- The frontend's uploadDocument() helper (added alongside this migration)
-- uploads the file to storage first, then inserts the metadata row; the
-- combination of storage+table policies means both halves of the write
-- are admin-gated at the database layer, not just in the UI.

-- ---------------------------------------------------------------------------
-- 1. Create the bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vessel-documents',
  'vessel-documents',
  false,
  52428800, -- 50 MB
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Storage RLS for the bucket
-- ---------------------------------------------------------------------------
-- SELECT: any authenticated crew on the same vessel (first path segment
-- must match their vessel_id).
drop policy if exists vessel_documents_select on storage.objects;
create policy vessel_documents_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'vessel-documents'
    and (storage.foldername(name))[1] = current_crew_vessel_id()::text
  );

-- INSERT: admins only, into their own vessel's folder.
drop policy if exists vessel_documents_insert on storage.objects;
create policy vessel_documents_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'vessel-documents'
    and (storage.foldername(name))[1] = current_crew_vessel_id()::text
    and is_current_crew_admin()
  );

-- UPDATE: admins only, same-vessel constraint on both old and new rows.
drop policy if exists vessel_documents_update on storage.objects;
create policy vessel_documents_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'vessel-documents'
    and (storage.foldername(name))[1] = current_crew_vessel_id()::text
    and is_current_crew_admin()
  )
  with check (
    bucket_id = 'vessel-documents'
    and (storage.foldername(name))[1] = current_crew_vessel_id()::text
    and is_current_crew_admin()
  );

-- DELETE: admins only.
drop policy if exists vessel_documents_delete on storage.objects;
create policy vessel_documents_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'vessel-documents'
    and (storage.foldername(name))[1] = current_crew_vessel_id()::text
    and is_current_crew_admin()
  );

-- ---------------------------------------------------------------------------
-- 3. Tighten public.documents write policies to admin-only
-- ---------------------------------------------------------------------------
drop policy if exists documents_insert_same_vessel on documents;
drop policy if exists documents_insert_admin on documents;
create policy documents_insert_admin on documents
  for insert to authenticated
  with check (
    vessel_id = current_crew_vessel_id()
    and is_current_crew_admin()
  );

drop policy if exists documents_update_same_vessel on documents;
drop policy if exists documents_update_admin on documents;
create policy documents_update_admin on documents
  for update to authenticated
  using (
    vessel_id = current_crew_vessel_id()
    and is_current_crew_admin()
  )
  with check (
    vessel_id = current_crew_vessel_id()
    and is_current_crew_admin()
  );

drop policy if exists documents_delete_same_vessel on documents;
drop policy if exists documents_delete_admin on documents;
create policy documents_delete_admin on documents
  for delete to authenticated
  using (
    vessel_id = current_crew_vessel_id()
    and is_current_crew_admin()
  );
