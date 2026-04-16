import T, { PRIORITIES } from '../shared/theme';
import Icons from '../shared/Icons';
import SelectWithAddNew from '../shared/SelectWithAddNew';

const NewNoticeModal = ({ newNotice, setNewNotice, handlePostNotice, setShowNewNotice, isDesktop, taxonomies }) => {
  const categories = taxonomies?.categories || ['Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental'];
  return (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
    <div style={{ background: T.bgModal, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 -20px 40px rgba(15,23,42,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>New Notice</h2>
        <button onClick={() => setShowNewNotice(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Title</label>
          <input value={newNotice.title} onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))} placeholder="Notice title..." style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Body</label>
          <textarea value={newNotice.body} onChange={e => setNewNotice(p => ({ ...p, body: e.target.value }))} placeholder="Notice content..." rows={4} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Category</label>
            <SelectWithAddNew
              value={newNotice.category}
              onChange={val => setNewNotice(p => ({ ...p, category: val }))}
              options={categories}
              onAddNew={taxonomies?.addCategory}
              placeholder="New category…"
              showColorPicker
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Priority</label>
            <select value={newNotice.priority} onChange={e => setNewNotice(p => ({ ...p, priority: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none' }}>
              {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Valid until (optional)</label>
          <input
            type="datetime-local"
            value={newNotice.validUntil}
            onChange={e => setNewNotice(p => ({ ...p, validUntil: e.target.value }))}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>Leave blank if the notice doesn&apos;t expire.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={newNotice.pinned} onChange={e => setNewNotice(p => ({ ...p, pinned: e.target.checked }))} style={{ accentColor: T.accent }} /> Pin notice
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={newNotice.requireAck} onChange={e => setNewNotice(p => ({ ...p, requireAck: e.target.checked }))} style={{ accentColor: T.accent }} /> Require acknowledgement
          </label>
          {newNotice.category === 'Social' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={newNotice.pollEnabled} onChange={e => setNewNotice(p => ({ ...p, pollEnabled: e.target.checked }))} style={{ accentColor: '#7c3aed' }} /> Add Poll
            </label>
          )}
        </div>

        {/* Poll builder — only shows when category is Social and poll is enabled */}
        {newNotice.category === 'Social' && newNotice.pollEnabled && (
          <div style={{ padding: 16, background: '#f8f7ff', borderRadius: 12, border: '1px solid #e9e5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6' }}>Poll Options</label>
              {newNotice.pollOptions.length < 6 && (
                <button
                  onClick={() => setNewNotice(p => ({ ...p, pollOptions: [...p.pollOptions, ''] }))}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {Icons.plus} Add option
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {newNotice.pollOptions.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', width: 20, textAlign: 'center', flexShrink: 0 }}>{idx + 1}.</span>
                  <input
                    value={opt}
                    onChange={e => {
                      const updated = [...newNotice.pollOptions];
                      updated[idx] = e.target.value;
                      setNewNotice(p => ({ ...p, pollOptions: updated }));
                    }}
                    placeholder={`Option ${idx + 1}...`}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid #e9e5ff`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                  {newNotice.pollOptions.length > 2 && (
                    <button
                      onClick={() => setNewNotice(p => ({ ...p, pollOptions: p.pollOptions.filter((_, i) => i !== idx) }))}
                      style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, flexShrink: 0 }}
                    >
                      {Icons.minus}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 8 }}>
              Minimum 2 options, maximum 6. Crew can vote for one option.
            </div>
          </div>
        )}

        <button onClick={handlePostNotice} disabled={!newNotice.title.trim()} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: newNotice.title.trim() ? T.accent : T.border, color: newNotice.title.trim() ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: newNotice.title.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
          Post Notice
        </button>
      </div>
    </div>
  </div>
  );
};

export default NewNoticeModal;
