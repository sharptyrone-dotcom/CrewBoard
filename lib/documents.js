import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// Storage bucket for PDF uploads. Created in migration 012 with a 50 MB
// per-file limit, application/pdf MIME allowlist, and RLS that scopes
// reads to the current vessel and writes to admins of that vessel.
export const DOCUMENTS_BUCKET = 'vessel-documents';

// Maps a Supabase `documents` row (with joined document_acknowledgements) into
// the shape the existing CrewBoard UI expects: { id, title, type, dept,
// version, updatedAt, reviewDate, acknowledgedBy, required, pages }.
function rowToDoc(row) {
  const acks = Array.isArray(row.document_acknowledgements) ? row.document_acknowledgements : [];
  return {
    id: row.id,
    title: row.title,
    type: row.doc_type,
    dept: row.department,
    version: row.version,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : '',
    reviewDate: row.review_date || '',
    acknowledgedBy: acks.map(a => a.crew_member_id),
    required: row.is_required,
    pages: row.page_count,
    fileUrl: row.file_url,
  };
}

export async function fetchDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, document_acknowledgements(crew_member_id)')
    .eq('vessel_id', CURRENT_VESSEL_ID)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[documents] fetch failed', error);
    throw error;
  }
  return (data || []).map(rowToDoc);
}

// Uploads a PDF to the vessel-documents bucket and inserts a matching
// row into public.documents. The storage write and the table write are
// both admin-gated at the DB layer (see migration 012), so a non-admin
// caller will get a PostgREST/Storage permission error rather than a
// partially-committed state.
//
// We upload to `{vessel_id}/{uuid}-{sanitised-filename}` so the storage
// RLS policy can verify the first path segment against the caller's
// vessel. If the table insert fails after the upload we remove the
// orphaned object to keep the bucket tidy — best-effort; a leaked blob
// is worse than a leaked row but we don't want the whole call to blow up
// if cleanup fails.
export async function uploadDocument({
  file,
  title,
  docType,
  department,
  version,
  reviewDate,
  isRequired,
  pageCount,
  uploadedBy,
}) {
  if (!file) throw new Error('A PDF file is required.');
  if (file.type && file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported.');
  }
  const safeName = (file.name || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  const objectPath = `${CURRENT_VESSEL_ID}/${objectId}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(objectPath, file, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('[documents] storage upload failed', uploadError);
    throw uploadError;
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      vessel_id: CURRENT_VESSEL_ID,
      uploaded_by: uploadedBy,
      title,
      doc_type: docType,
      department: department || null,
      version: version || null,
      file_url: objectPath,
      file_size_bytes: file.size || null,
      page_count: pageCount || null,
      is_required: !!isRequired,
      review_date: reviewDate || null,
    })
    .select('*, document_acknowledgements(crew_member_id)')
    .single();

  if (error) {
    console.error('[documents] insert failed, cleaning up object', error);
    // Best-effort orphan cleanup — we'd rather have a leaked blob than
    // a half-committed row.
    try {
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([objectPath]);
    } catch (cleanupErr) {
      console.error('[documents] orphan cleanup failed (non-fatal)', cleanupErr);
    }
    throw error;
  }

  return rowToDoc(data);
}

// Generates a short-lived signed URL so crew can view a PDF inline in
// the browser without the storage bucket ever becoming public. The
// bucket is private (see migration 012) and SELECT is gated on the
// caller being on the same vessel, so the RLS check is applied at URL
// creation time. The returned URL is only valid for `expiresInSeconds`.
//
// We deliberately pass `download: false` (the default) so the Content-
// Disposition header is `inline`, meaning the browser renders the PDF
// rather than prompting a download. The UI never exposes this URL
// anywhere except the iframe src, so there's no "copy link" affordance
// for crew — they'd have to crack devtools open to exfiltrate it.
// That's the best practical "view-only" guarantee a browser can offer.
//
// `path` is whatever got written into documents.file_url — for uploaded
// files that's the vessel-scoped storage key. Legacy seeded rows store
// an example.com URL; callers should short-circuit those before calling
// this helper.
export async function getDocumentSignedUrl({ path, expiresInSeconds = 300 }) {
  if (!path || /^https?:\/\//i.test(path)) {
    // Legacy / external URLs — nothing to sign.
    return null;
  }
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error('[documents] createSignedUrl failed', error);
    throw error;
  }
  return data?.signedUrl || null;
}

export async function acknowledgeDocument({ documentId, crewMemberId, version }) {
  const { error } = await supabase
    .from('document_acknowledgements')
    .upsert(
      {
        document_id: documentId,
        crew_member_id: crewMemberId,
        version_at_acknowledgement: version,
        acknowledged_at: new Date().toISOString(),
      },
      { onConflict: 'document_id,crew_member_id' }
    );

  if (error) {
    console.error('[documents] acknowledge failed', error);
    throw error;
  }
}
