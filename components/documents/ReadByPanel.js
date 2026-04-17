import { useState } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';
import ComplianceBar from '../shared/ComplianceBar';

// Admin-only panel shown inside DocDetail. Mirrors the "who has read
// this notice" view but for documents. We collapse three states into
// one row per crew member so the list reads top-to-bottom instead of
// forcing the admin to cross-reference two tables:
//   • green check  → crew member explicitly acknowledged (trumps read)
//   • blue dot     → crew member opened the doc at least once
//   • grey dash    → no activity recorded
//
// The progress bar uses reads (not acks) because every required doc
// needs to be *read* first; acks are a subset. For non-required docs,
// the ack tally is still useful context but reads are the main signal.
function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

export default function ReadByPanel({ doc, crew = [] }) {
  const [expanded, setExpanded] = useState(false);

  const readReceipts = Array.isArray(doc.readReceipts) ? doc.readReceipts : [];
  const ackReceipts = Array.isArray(doc.ackReceipts) ? doc.ackReceipts : [];
  // Build quick-lookup maps so the per-crew render below is O(1).
  const readMap = new Map(readReceipts.map(r => [r.crewMemberId, r.readAt]));
  const ackMap = new Map(ackReceipts.map(a => [a.crewMemberId, a.acknowledgedAt]));

  const totalCrew = crew.length;
  const readCount = crew.filter(c => readMap.has(c.id) || ackMap.has(c.id)).length;
  const ackCount = crew.filter(c => ackMap.has(c.id)).length;
  const readPercent = totalCrew > 0 ? (readCount / totalCrew) * 100 : 0;

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Read by {readCount} of {totalCrew} crew
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
            {ackCount} acknowledged{doc.required ? '' : ' (optional for this doc)'}
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', color: T.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide list' : 'Show crew'}
        </button>
      </div>
      <ComplianceBar value={readPercent} />

      {/* Legend — keeps the meaning of each marker obvious without hover */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: T.success, display: 'inline-flex' }}>{Icons.checkCircle}</span>
          Acknowledged
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
          Read
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: T.textDim, fontWeight: 800 }}>—</span>
          Not yet
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${T.border}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {crew.length === 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>No crew on this vessel.</div>
          )}
          {crew.map(c => {
            const ackAt = ackMap.get(c.id);
            const readAt = readMap.get(c.id);
            const status = ackAt ? 'ack' : readAt ? 'read' : 'none';
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: `1px dashed ${T.border}` }}>
                <span style={{ flexShrink: 0, width: 20, display: 'inline-flex', justifyContent: 'center' }}>
                  {status === 'ack' && <span style={{ color: T.success, display: 'inline-flex' }}>{Icons.checkCircle}</span>}
                  {status === 'read' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent }} />}
                  {status === 'none' && <span style={{ color: T.textDim, fontWeight: 800 }}>—</span>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name || c.fullName || 'Unknown crew'}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>
                    {[c.role, c.dept || c.department].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: status === 'none' ? T.textDim : T.textMuted, flexShrink: 0 }}>
                  {status === 'ack' && formatWhen(ackAt)}
                  {status === 'read' && formatWhen(readAt)}
                  {status === 'none' && 'Not opened'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
