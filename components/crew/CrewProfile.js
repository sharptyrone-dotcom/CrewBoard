import T from '../shared/theme';
import Icons from '../shared/Icons';
import Avatar from '../shared/Avatar';

export default function CrewProfile({ currentUser, notices, docs, handleLogout, offlineCachedIds, offlineCacheSize, clearCachedDoc, clearAllCachedDocs }) {
  // Compliance score = (notices read + required docs acked) / (total notices
  // + total required docs). Matches the per-crew formula used in
  // AdminDashboard so the numbers line up across screens.
  const requiredDocs = docs.filter(d => d.required);
  const noticesRead = notices.filter(n => n.readBy.includes(currentUser.id)).length;
  const docsAcked = requiredDocs.filter(d => d.acknowledgedBy.includes(currentUser.id)).length;
  const totalItems = notices.length + requiredDocs.length;
  const complianceScore = totalItems > 0
    ? Math.round(((noticesRead + docsAcked) / totalItems) * 100)
    : 0;
  const myInitials = (currentUser.name || '')
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 24px' }}>Profile</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
        <Avatar initials={myInitials} size={72} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '12px 0 2px' }}>{currentUser.name}</h3>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>{currentUser.role} — {currentUser.dept} Department</p>
        <p style={{ fontSize: 12, color: T.textDim, margin: '4px 0 0' }}>M/Y Serenity</p>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow, marginBottom: 20 }}>
        {[['Notices Read', `${noticesRead}/${notices.length}`], ['Documents Acknowledged', `${docsAcked}/${requiredDocs.length}`], ['Compliance Score', `${complianceScore}%`]].map(([label, val], i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 14, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 14, color: i === 2 ? (complianceScore >= 70 ? T.success : T.gold) : T.text, fontWeight: 700, fontFamily: i === 2 ? "'JetBrains Mono', monospace" : undefined }}>{val}</span>
          </div>
        ))}
      </div>
      {/* Offline Documents section */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Offline Documents</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{offlineCachedIds.size} doc{offlineCachedIds.size !== 1 ? 's' : ''} cached ({offlineCacheSize})</div>
          </div>
          {offlineCachedIds.size > 0 && (
            <button onClick={() => { if (confirm('Clear all cached documents?')) clearAllCachedDocs(); }} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.critical}40`, background: T.criticalTint, color: T.critical, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              Clear All
            </button>
          )}
        </div>
        {offlineCachedIds.size === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: T.textDim, fontSize: 13 }}>
            No documents saved for offline access. Use the download icon in the Document Library to cache documents.
          </div>
        ) : (
          [...offlineCachedIds].map((docId, i) => {
            const cachedDoc = docs.find(d => d.id === docId);
            return (
              <div key={docId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < offlineCachedIds.size - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ width: 32, height: 36, borderRadius: 7, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark, flexShrink: 0 }}>{Icons.file}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cachedDoc?.title || 'Unknown document'}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{cachedDoc ? `v${cachedDoc.version}` : docId.slice(0, 8)}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.success, background: T.successTint, padding: '3px 6px', borderRadius: 4, flexShrink: 0 }}>OFFLINE</span>
                <button onClick={() => clearCachedDoc(docId)} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, flexShrink: 0 }} title="Remove from offline cache">
                  {Icons.x}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
        {['Notification Preferences', 'Dark Mode', 'Log Out'].map((item, i) => (
          <button
            key={item}
            onClick={item === 'Log Out' ? handleLogout : undefined}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', width: '100%', background: 'none', border: 'none', cursor: item === 'Log Out' ? 'pointer' : 'default', color: item === 'Log Out' ? T.critical : T.text, fontSize: 14 }}
          >
            {item}
            {item !== 'Log Out' && <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
