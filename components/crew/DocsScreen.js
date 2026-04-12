import T, { DEPARTMENTS, DOC_TYPES } from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import FilterChips from '../shared/FilterChips';
import ComplianceBar from '../shared/ComplianceBar';
import DocDetail from '../documents/DocDetail';

export default function DocsScreen({ selectedDoc, setSelectedDoc, currentUser, docs, docDeptFilter, docTypeFilter, setDocDeptFilter, setDocTypeFilter, quickAccessIds, toggleQuickAccess, handleAckDoc, handleDeleteDoc, handleReplaceDoc, role, isDesktop, crew, setReplaceDocState, setShowReplaceDoc, isDocCached, cachingDocId, setCachingDocId, cacheDocument, getDocumentSignedUrl }) {
  if (selectedDoc) return (
    <DocDetail
      doc={selectedDoc}
      currentUser={currentUser}
      onBack={() => setSelectedDoc(null)}
      onAcknowledge={handleAckDoc}
      role={role}
      isDesktop={isDesktop}
      isQuickAccess={quickAccessIds.includes(selectedDoc.id)}
      onToggleQuickAccess={toggleQuickAccess}
      onDelete={role === 'admin' ? () => handleDeleteDoc(selectedDoc.id) : undefined}
      onReplace={role === 'admin' ? () => {
        setReplaceDocState({
          file: null,
          version: selectedDoc.version || '',
          versionNotes: '',
          pageCount: '',
        });
        setShowReplaceDoc(true);
      } : undefined}
      isOfflineCached={isDocCached(selectedDoc.id)}
      cachingOffline={cachingDocId === selectedDoc.id}
      onCacheOffline={role !== 'admin' ? async (docId, url, title) => {
        setCachingDocId(docId);
        await cacheDocument(docId, url, title);
        setCachingDocId(null);
      } : undefined}
    />
  );
  const filtered = docs
    .filter(d => docDeptFilter === 'All' || d.dept === docDeptFilter)
    .filter(d => docTypeFilter === 'All' || d.type === docTypeFilter);
  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{role === 'admin' ? 'Document Management' : 'Document Library'}</h2>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Department</div>
        <FilterChips options={DEPARTMENTS} selected={docDeptFilter} onChange={setDocDeptFilter} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Type</div>
        <FilterChips options={DOC_TYPES} selected={docTypeFilter} onChange={setDocTypeFilter} />
      </div>
      {/* Quick Access section — crew only, shows when they have favourites */}
      {role === 'crew' && quickAccessIds.length > 0 && docDeptFilter === 'All' && docTypeFilter === 'All' && (() => {
        const favDocs = quickAccessIds.map(id => docs.find(d => d.id === id)).filter(Boolean);
        if (favDocs.length === 0) return null;
        return (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#f59e0b' }}>{Icons.starFilled}</span>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>Quick Access</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
              {favDocs.map(d => (
                <button key={d.id} onClick={() => setSelectedDoc(d)} className="cb-card" style={{
                  minWidth: 140, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.gold}30`,
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left', flexShrink: 0, boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark }}>{Icons.file}</div>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" size={12} fill="#f59e0b" /></span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>v{d.version}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: isDesktop ? 12 : 8 }}>
        {filtered.map(d => {
          const isAcked = d.acknowledgedBy.includes(currentUser.id);
          const ackRatio = `${d.acknowledgedBy.length}/${crew.length}`;
          const ackPercent = crew.length > 0 ? (d.acknowledgedBy.length / crew.length) * 100 : 0;
          return (
            <button key={d.id} onClick={() => setSelectedDoc(d)} className="cb-card" style={{ display: 'flex', gap: 14, padding: isDesktop ? '18px 22px' : '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: isDesktop ? 14 : 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
              <div style={{ width: 44, height: 50, borderRadius: 10, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark, flexShrink: 0 }}>{Icons.file}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{d.title}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
                  <span>v{d.version}</span><span>{d.dept}</span><span>{d.type}</span>
                </div>
                {role === 'admin' && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}><ComplianceBar value={ackPercent} /></div>
                    <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{ackRatio}</span>
                  </div>
                )}
              </div>
              {role === 'crew' && (
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, flexDirection: 'column' }}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleQuickAccess(d.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: quickAccessIds.includes(d.id) ? '#f59e0b' : T.textDim, transition: 'color 0.15s' }}
                    title={quickAccessIds.includes(d.id) ? 'Remove from Quick Access' : 'Add to Quick Access'}
                  >
                    {quickAccessIds.includes(d.id) ? Icons.starFilled : Icons.star}
                  </button>
                  {isDocCached(d.id) ? (
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.successTint, padding: '3px 6px', borderRadius: 4 }}>OFFLINE</span>
                  ) : (
                    <button
                      onClick={async (ev) => { ev.stopPropagation(); setCachingDocId(d.id); const url = await getDocumentSignedUrl({ path: d.fileUrl, expiresInSeconds: 300 }).catch(() => null); if (url) await cacheDocument(d.id, url, d.title); setCachingDocId(null); }}
                      disabled={cachingDocId === d.id || !d.fileUrl}
                      style={{ background: 'none', border: 'none', cursor: cachingDocId === d.id || !d.fileUrl ? 'default' : 'pointer', padding: 2, color: cachingDocId === d.id ? T.accent : T.textDim, transition: 'color 0.15s' }}
                      title="Save for offline"
                    >
                      <Icon d={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} size={16} />
                    </button>
                  )}
                  {d.required && (isAcked ? <span style={{ color: T.success }}>{Icons.checkCircle}</span> : <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, background: `${T.gold}18`, padding: '4px 8px', borderRadius: 4 }}>ACK</span>)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
