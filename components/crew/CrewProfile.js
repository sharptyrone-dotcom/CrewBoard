import { useState, useEffect } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';
import Avatar from '../shared/Avatar';

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('crewnotice-theme', next ? 'dark' : 'light'); } catch (_) {}
  };
  return [dark, toggle];
}

export default function CrewProfile({ currentUser, notices, docs, trainingModules = [], handleLogout, offlineCachedIds, offlineCacheSize, clearCachedDoc, clearAllCachedDocs, onOpenNotifPrefs }) {
  const [isDark, toggleDark] = useDarkMode();
  // Compliance score = (notices read + required docs acked + training
  // completed) / (total notices + total required docs + total assigned
  // training). Matches the per-crew formula used in AdminDashboard so
  // the numbers line up across screens.
  const requiredDocs = docs.filter(d => d.required);
  const noticesRead = notices.filter(n => n.readBy.includes(currentUser.id)).length;
  const docsAcked = requiredDocs.filter(d => d.acknowledgedBy.includes(currentUser.id)).length;
  // Crew see their own assignments as flat module rows with a `status`
  // field (see /api/training/modules crew branch).
  const assignedTraining = trainingModules.length;
  const completedTraining = trainingModules.filter(m => m.status === 'completed').length;
  const totalItems = notices.length + requiredDocs.length + assignedTraining;
  const complianceScore = totalItems > 0
    ? Math.round(((noticesRead + docsAcked + completedTraining) / totalItems) * 100)
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
        {[
          ['Notices Read', `${noticesRead}/${notices.length}`],
          ['Documents Acknowledged', `${docsAcked}/${requiredDocs.length}`],
          ['Training Completed', `${completedTraining}/${assignedTraining}`],
          ['Compliance Score', `${complianceScore}%`],
        ].map(([label, val], i, arr) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 14, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 14, color: i === arr.length - 1 ? (complianceScore >= 70 ? T.success : T.gold) : T.text, fontWeight: 700, fontFamily: i === arr.length - 1 ? "'JetBrains Mono', monospace" : undefined }}>{val}</span>
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
        <button
          onClick={onOpenNotifPrefs}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${T.border}`, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: T.text, fontSize: 14 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.bell}
            Notification Preferences
          </span>
          <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>
        </button>
        <button
          onClick={toggleDark}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${T.border}`, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: T.text, fontSize: 14 }}
        >
          <span>Dark Mode</span>
          <div style={{
            width: 44, height: 24, borderRadius: 12, padding: 2,
            background: isDark ? T.accent : T.border,
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transform: isDark ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.2s',
            }} />
          </div>
        </button>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: T.critical, fontSize: 14 }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
