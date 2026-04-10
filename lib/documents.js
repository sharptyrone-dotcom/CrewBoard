import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

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
