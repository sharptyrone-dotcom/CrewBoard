import T from '../shared/theme';
import Icons from '../shared/Icons';

const ReplaceDocumentModal = ({ selectedDoc, replaceDocState, setReplaceDocState, handleReplaceDoc, replacingDoc, setShowReplaceDoc }) => {
  if (!selectedDoc) return null;
  const canSubmit = !!replaceDocState.file && !replacingDoc;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: T.bgModal, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 -20px 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Replace Document</h2>
          <button onClick={() => setShowReplaceDoc(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: T.accentTint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Replacing</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{selectedDoc.title}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Currently v{selectedDoc.version} — {selectedDoc.type} / {selectedDoc.dept}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>New PDF file</label>
            <label htmlFor="cb-replace-doc-file" style={{ display: 'block', padding: 16, borderRadius: 10, border: `2px dashed ${replaceDocState.file ? T.accent : T.border}`, background: replaceDocState.file ? T.accentTint : T.bgCard, color: replaceDocState.file ? T.accentDark : T.textMuted, fontSize: 13, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>
              {replaceDocState.file
                ? `${replaceDocState.file.name} (${Math.round((replaceDocState.file.size / 1024 / 1024) * 10) / 10} MB)`
                : 'Click to choose a PDF (max 50 MB)'}
            </label>
            <input
              id="cb-replace-doc-file"
              type="file"
              accept="application/pdf"
              onChange={e => {
                const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                setReplaceDocState(p => ({ ...p, file }));
              }}
              style={{ display: 'none' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>New version</label>
              <input value={replaceDocState.version} onChange={e => setReplaceDocState(p => ({ ...p, version: e.target.value }))} placeholder="e.g. 1.1" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Pages</label>
              <input type="number" min="1" value={replaceDocState.pageCount} onChange={e => setReplaceDocState(p => ({ ...p, pageCount: e.target.value }))} placeholder="—" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Version notes (optional)</label>
            <textarea value={replaceDocState.versionNotes} onChange={e => setReplaceDocState(p => ({ ...p, versionNotes: e.target.value }))} placeholder="What changed in this version?" rows={3} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, padding: '10px 12px', background: T.goldTint, border: `1px solid ${T.gold}40`, borderRadius: 10, lineHeight: 1.5 }}>
            Replacing will wipe all existing acknowledgements for this document — crew will need to re-acknowledge the new version.
          </div>
          <button onClick={handleReplaceDoc} disabled={!canSubmit} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: canSubmit ? T.accent : T.border, color: canSubmit ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', transition: 'background 0.2s' }}>
            {replacingDoc ? 'Uploading new version…' : 'Replace Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplaceDocumentModal;
