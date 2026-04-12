import { useEffect, useState } from 'react';
import T from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import { CategoryBadge } from '../shared/Badge';
import BackButton from '../shared/BackButton';
import { getDocumentSignedUrl } from '@/lib/documents';

export default function DocDetail({ doc, currentUser, onBack, onAcknowledge, role, onDelete, onReplace, isDesktop, isQuickAccess, onToggleQuickAccess, isOfflineCached, onCacheOffline, cachingOffline }) {
  const isAcked = doc.acknowledgedBy.includes(currentUser.id);
  const isRealFile = !!doc.fileUrl && !/^https?:\/\//i.test(doc.fileUrl);
  const isAdmin = role === 'admin';

  const [signedUrl, setSignedUrl] = useState(null);
  const [signedUrlError, setSignedUrlError] = useState(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState(isRealFile);

  useEffect(() => {
    if (!isRealFile) {
      setSignedUrl(null);
      setSignedUrlLoading(false);
      return;
    }
    let cancelled = false;
    setSignedUrlLoading(true);
    setSignedUrlError(null);
    getDocumentSignedUrl({ path: doc.fileUrl, expiresInSeconds: 300 })
      .then(url => {
        if (cancelled) return;
        setSignedUrl(url);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[DocDetail] signed url failed', err);
        setSignedUrlError(err?.message || 'Failed to load document');
      })
      .finally(() => {
        if (!cancelled) setSignedUrlLoading(false);
      });
    return () => { cancelled = true; };
  }, [doc.fileUrl, isRealFile]);

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <CategoryBadge category={doc.type} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, background: `${T.textMuted}18`, padding: '3px 8px', borderRadius: 4 }}>{doc.dept}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0, flex: 1 }}>{doc.title}</h2>
        {role === 'crew' && onToggleQuickAccess && (
          <button
            onClick={() => onToggleQuickAccess(doc.id)}
            title={isQuickAccess ? 'Remove from Quick Access' : 'Add to Quick Access'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, color: isQuickAccess ? '#f59e0b' : T.textDim, transition: 'color 0.2s' }}
          >
            {isQuickAccess ? Icons.starFilled : Icons.star}
          </button>
        )}
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
        {[['Version', `v${doc.version}`], ['Last Updated', doc.updatedAt], ['Review Date', doc.reviewDate], ['Pages', doc.pages], ['Required', doc.required ? 'Yes' : 'No']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
      {/* Version notes callout — shown whenever the admin supplied a
          "what changed" summary during replaceDocument(). Placed above
          the PDF viewer so crew read the changes before they open the
          file itself, and styled in the gold "requires attention" palette
          so it stands out from the regular metadata card. Hidden entirely
          on docs with no notes (i.e. first uploads) so the detail view
          stays tidy. */}
      {doc.versionNotes && (
        <div style={{ background: T.goldTint, border: `1px solid ${T.gold}40`, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: T.gold, display: 'flex' }}>{Icons.alert}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1 }}>
              What&apos;s new in v{doc.version}
            </span>
          </div>
          <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {doc.versionNotes}
          </p>
        </div>
      )}
      {isRealFile ? (
        <div
          onContextMenu={e => e.preventDefault()}
          style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20, boxShadow: T.shadow, position: 'relative' }}
        >
          {signedUrlLoading && (
            <div style={{ padding: 60, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
              Loading document…
            </div>
          )}
          {signedUrlError && !signedUrlLoading && (
            <div style={{ padding: 40, textAlign: 'center', color: T.critical, fontSize: 13 }}>
              Couldn&apos;t load the document.<br />
              <span style={{ color: T.textMuted, fontSize: 11 }}>{signedUrlError}</span>
            </div>
          )}
          {signedUrl && !signedUrlLoading && !signedUrlError && (
            <iframe
              title={doc.title}
              src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              // `download` attribute on iframe has no meaning, but setting
              // sandbox without allow-downloads blocks the built-in viewer
              // entirely in Chromium, so we leave sandbox off. The download
              // toolbar button is suppressed via the hash param above.
              style={{ width: '100%', height: 560, border: 'none', display: 'block', background: T.bgCard }}
            />
          )}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, background: T.bgCard, fontSize: 11, color: T.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.eye} View-only — downloads are disabled.
          </div>
        </div>
      ) : (
        <div style={{ background: T.accentTint, border: `1px solid ${T.border}`, borderRadius: 16, padding: 48, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: T.accent, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{Icons.file}</div>
          <p style={{ fontSize: 14, color: T.text, margin: 0, fontWeight: 600 }}>PDF document preview</p>
          <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>{doc.pages} pages</p>
        </div>
      )}
      {doc.required && !isAcked && !isAdmin && (
        <button onClick={() => onAcknowledge && onAcknowledge(doc.id)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Acknowledge Current Version
        </button>
      )}
      {isAcked && !isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14 }}>
          {Icons.checkCircle} Acknowledged — v{doc.version}
        </div>
      )}
      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {onReplace && (
            <button onClick={onReplace} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${T.accent}`, background: T.accentTint, color: T.accentDark, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
              {Icons.file} Replace with new version
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
              {Icons.trash} Delete document
            </button>
          )}
        </div>
      )}
      {/* Offline cache button — crew only */}
      {!isAdmin && isRealFile && onCacheOffline && (
        <div style={{ marginTop: 12 }}>
          {isOfflineCached ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: T.successTint, borderRadius: 10, border: `1px solid ${T.success}30` }}>
              <Icon d={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>} size={16} color={T.success} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>Available offline</span>
            </div>
          ) : (
            <button
              onClick={() => signedUrl && onCacheOffline(doc.id, signedUrl, doc.title)}
              disabled={!signedUrl || cachingOffline}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, color: !signedUrl || cachingOffline ? T.textDim : T.text, fontSize: 13, fontWeight: 600, cursor: !signedUrl || cachingOffline ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Icon d={<><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} size={16} />
              {cachingOffline ? 'Saving...' : 'Save for offline'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
