import T from '../shared/theme';
import Icons from '../shared/Icons';
import SelectWithAddNew from '../shared/SelectWithAddNew';

const NewDocumentModal = ({ newDoc, setNewDoc, handleUploadDoc, uploadingDoc, setShowNewDoc, taxonomies }) => {
  const docTypes = taxonomies?.docTypes || ['SOPs', 'Risk Assessments', 'Manuals', 'MSDS/COSHH', 'Checklists', 'Policies'];
  const departments = taxonomies?.departments || ['Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General'];
  const canSubmit = !!newDoc.file && newDoc.title.trim() && !uploadingDoc;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: T.bgModal, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 -20px 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Upload Document</h2>
          <button onClick={() => setShowNewDoc(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>PDF file</label>
            <label htmlFor="cb-doc-file" style={{ display: 'block', padding: 16, borderRadius: 10, border: `2px dashed ${newDoc.file ? T.accent : T.border}`, background: newDoc.file ? T.accentTint : T.bgCard, color: newDoc.file ? T.accentDark : T.textMuted, fontSize: 13, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>
              {newDoc.file
                ? `${newDoc.file.name} (${Math.round((newDoc.file.size / 1024 / 1024) * 10) / 10} MB)`
                : 'Click to choose a PDF (max 50 MB)'}
            </label>
            <input
              id="cb-doc-file"
              type="file"
              accept="application/pdf"
              onChange={e => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setNewDoc(p => ({
                  ...p,
                  file,
                  // Auto-fill title from filename if the user hasn't typed anything yet.
                  title: p.title || (file ? file.name.replace(/\.pdf$/i, '') : ''),
                }));
              }}
              style={{ display: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Title</label>
            <input value={newDoc.title} onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))} placeholder="Document title..." style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Type</label>
              <SelectWithAddNew
                value={newDoc.docType}
                onChange={val => setNewDoc(p => ({ ...p, docType: val }))}
                options={docTypes}
                onAddNew={taxonomies?.addDocType}
                placeholder="New document type…"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Department</label>
              <SelectWithAddNew
                value={newDoc.department}
                onChange={val => setNewDoc(p => ({ ...p, department: val }))}
                options={departments}
                onAddNew={taxonomies?.addDepartment}
                placeholder="New department…"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Version</label>
              <input value={newDoc.version} onChange={e => setNewDoc(p => ({ ...p, version: e.target.value }))} placeholder="1.0" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Pages</label>
              <input type="number" min="1" value={newDoc.pageCount} onChange={e => setNewDoc(p => ({ ...p, pageCount: e.target.value }))} placeholder="—" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Review date</label>
              <input type="date" value={newDoc.reviewDate} onChange={e => setNewDoc(p => ({ ...p, reviewDate: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={newDoc.isRequired} onChange={e => setNewDoc(p => ({ ...p, isRequired: e.target.checked }))} style={{ accentColor: T.accent }} /> Required acknowledgement
          </label>
          <button onClick={handleUploadDoc} disabled={!canSubmit} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: canSubmit ? T.accent : T.border, color: canSubmit ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', transition: 'background 0.2s' }}>
            {uploadingDoc ? 'Uploading…' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentModal;
