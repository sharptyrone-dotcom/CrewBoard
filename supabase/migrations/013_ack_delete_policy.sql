-- Missing DELETE policy on document_acknowledgements.
--
-- When an admin replaces a document (migration 012 + replaceDocument()), the
-- app tries to wipe all existing acknowledgement rows for that document so
-- crew have to re-acknowledge the new version. The table previously only
-- had INSERT and SELECT policies (from 001_initial_schema) — there was no
-- DELETE policy at all, so the wipe silently returned 0 rows affected and
-- stale acks remained in place. Symptom: crew opening a replaced document
-- saw "Acknowledged — v1.x" where x matched whatever the previous version
-- was, and no re-acknowledge button.
--
-- Fix: add an admin-gated DELETE policy scoped to the same-vessel constraint.
-- Only admins can drop ack rows, and only for documents on their own vessel.
-- This matches the admin-only write model we adopted for documents in
-- migration 012 — crew can still insert their own acks (doc_acks_insert_self)
-- but cannot delete anyone else's.

drop policy if exists doc_acks_delete_admin on document_acknowledgements;
create policy doc_acks_delete_admin on document_acknowledgements
  for delete to authenticated
  using (
    is_current_crew_admin()
    and exists (
      select 1 from documents d
      where d.id = document_acknowledgements.document_id
        and d.vessel_id = current_crew_vessel_id()
    )
  );
