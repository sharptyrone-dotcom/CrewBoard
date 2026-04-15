import { useState, useMemo } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';
import Avatar from '../shared/Avatar';
import { ACTIVITY_ACTIONS } from '@/lib/activity';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'notices', label: 'Notices' },
  { id: 'docs', label: 'Documents' },
  { id: 'reminders', label: 'Reminders' },
];

const AdminActivityLog = ({ activity, activityLoading, crew, isDesktop }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [crewFilter, setCrewFilter] = useState('all');
  const [mode, setMode] = useState('timeline'); // 'timeline' | 'summary'
  // Relative time formatter local to this component to avoid another
  // shared util file. Mirrors the one in lib/notifications.js.
  const relTime = (iso) => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.round(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.round(days / 30);
    return `${months}mo ago`;
  };

  const crewById = Object.fromEntries(crew.map(c => [c.id, c]));

  // Collapses an activity row into {verb, detail, icon, color} so the
  // render loop stays tidy. Falls back to the metadata title when the
  // referenced notice/document no longer exists client-side.
  const describe = (row) => {
    const title = row.metadata?.title || '';
    switch (row.action) {
      case ACTIVITY_ACTIONS.NOTICE_POSTED:
        return {
          verb: 'posted notice',
          detail: title || 'a notice',
          icon: Icons.pin,
          color: row.metadata?.priority === 'critical' ? T.critical : T.accent,
        };
      case ACTIVITY_ACTIONS.NOTICE_ACKNOWLEDGED:
        return {
          verb: 'acknowledged',
          detail: title || 'a notice',
          icon: Icons.checkCircle,
          color: T.success,
        };
      case ACTIVITY_ACTIONS.NOTICE_DELETED:
        return {
          verb: 'deleted notice',
          detail: title || 'a notice',
          icon: Icons.trash,
          color: T.critical,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_POSTED:
        return {
          verb: 'uploaded document',
          detail: row.metadata?.version ? `${title} (v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.accent,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_REPLACED:
        return {
          verb: 'replaced document',
          detail: row.metadata?.version ? `${title} (now v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.accent,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_DELETED:
        return {
          verb: 'deleted document',
          detail: title || 'a document',
          icon: Icons.trash,
          color: T.critical,
        };
      case ACTIVITY_ACTIONS.DOCUMENT_ACKNOWLEDGED:
        return {
          verb: 'signed off',
          detail: row.metadata?.version ? `${title} (v${row.metadata.version})` : (title || 'a document'),
          icon: Icons.file,
          color: T.gold,
        };
      default:
        return { verb: row.action, detail: '', icon: Icons.bell, color: T.textMuted };
    }
  };

  // Apply filters/search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activity.filter(row => {
      if (crewFilter !== 'all' && String(row.crewMemberId) !== String(crewFilter)) return false;
      if (filter !== 'all') {
        const action = row.action || '';
        if (filter === 'notices' && !action.startsWith('notice_')) return false;
        if (filter === 'docs' && !action.startsWith('document_')) return false;
        if (filter === 'reminders' && action !== 'reminder_sent') return false;
      }
      if (q) {
        const title = (row.metadata?.title || '').toLowerCase();
        const actor = (crewById[row.crewMemberId]?.name || '').toLowerCase();
        if (!title.includes(q) && !actor.includes(q) && !(row.action || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activity, filter, search, crewFilter, crewById]);

  const exportCsv = () => {
    const rows = [['Date', 'Time', 'Crew', 'Action', 'Title']];
    filtered.forEach(row => {
      const d = new Date(row.createdAt);
      const actor = crewById[row.crewMemberId]?.name || 'Unknown';
      rows.push([
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        actor,
        row.action || '',
        row.metadata?.title || '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Daily summary: one row per day with counts by action type
  const summary = useMemo(() => {
    const byDay = new Map();
    filtered.forEach(row => {
      const d = new Date(row.createdAt);
      if (isNaN(d)) return;
      const key = d.toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, { date: d, notices: 0, docs: 0, reminders: 0, acks: 0, other: 0 });
      const bucket = byDay.get(key);
      const action = row.action || '';
      if (action === 'reminder_sent') bucket.reminders++;
      else if (action.endsWith('_acknowledged')) bucket.acks++;
      else if (action.startsWith('notice_')) bucket.notices++;
      else if (action.startsWith('document_')) bucket.docs++;
      else bucket.other++;
    });
    return Array.from(byDay.values()).sort((a, b) => b.date - a.date);
  }, [filtered]);

  // Group by date (Today, Yesterday, or an absolute date) for a cleaner
  // scanning experience on longer lists.
  const groups = [];
  let lastLabel = null;
  filtered.forEach(row => {
    const d = new Date(row.createdAt);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const rowDay = new Date(d); rowDay.setHours(0, 0, 0, 0);
    let label;
    if (rowDay.getTime() === today.getTime()) label = 'Today';
    else if (rowDay.getTime() === yesterday.getTime()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (label !== lastLabel) {
      groups.push({ label, rows: [] });
      lastLabel = label;
    }
    groups[groups.length - 1].rows.push(row);
  });

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Activity Log</h2>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Every notice posted and every acknowledgement across the vessel.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', padding: 2 }}>
            {['timeline', 'summary'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                  border: 'none', cursor: 'pointer',
                  background: mode === m ? T.accent : 'transparent',
                  color: mode === m ? '#fff' : T.textMuted,
                  borderRadius: 8,
                }}
              >{m}</button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            style={{
              padding: '8px 14px', borderRadius: 10,
              border: `1px solid ${T.border}`, background: T.bgCard,
              color: T.accentDark, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${filter === f.id ? T.accent : T.border}`,
              background: filter === f.id ? T.accentTint : T.bgCard,
              color: filter === f.id ? T.accentDark : T.textMuted,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >{f.label}</button>
        ))}
        <select
          value={crewFilter}
          onChange={(e) => setCrewFilter(e.target.value)}
          style={{
            padding: '6px 12px', borderRadius: 999,
            border: `1px solid ${T.border}`, background: T.bgCard,
            color: T.textMuted, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <option value="all">All crew</option>
          {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textDim }}>{Icons.search}</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity..."
          style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {activityLoading && <div style={{ color: T.textMuted, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Loading activity…</div>}
      {!activityLoading && activity.length === 0 && (
        <div style={{ color: T.textMuted, fontSize: 13, padding: '40px 20px', textAlign: 'center', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          No activity recorded yet.
        </div>
      )}
      {!activityLoading && activity.length > 0 && filtered.length === 0 && (
        <div style={{ color: T.textMuted, fontSize: 13, padding: '40px 20px', textAlign: 'center', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          No activity matches your filters.
        </div>
      )}

      {mode === 'summary' && summary.length > 0 && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: T.shadow, marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                {['Date', 'Notices', 'Docs', 'Acks', 'Reminders', 'Total'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((day, i) => {
                const total = day.notices + day.docs + day.acks + day.reminders + day.other;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: T.text }}>{day.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '12px 16px', color: T.accent, fontWeight: 700 }}>{day.notices}</td>
                    <td style={{ padding: '12px 16px', color: T.gold, fontWeight: 700 }}>{day.docs}</td>
                    <td style={{ padding: '12px 16px', color: T.success, fontWeight: 700 }}>{day.acks}</td>
                    <td style={{ padding: '12px 16px', color: T.textMuted, fontWeight: 700 }}>{day.reminders}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: T.text }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'timeline' && groups.map(group => (
        <div key={group.label} style={{ marginBottom: 22 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>{group.label}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.rows.map(row => {
              const actor = crewById[row.crewMemberId];
              const name = actor?.name || 'Unknown crew';
              const initials = actor?.avatar || '?';
              const { verb, detail, icon, color } = describe(row);
              return (
                <div key={row.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shadow }}>
                  <Avatar initials={initials} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{name}</span>
                      <span style={{ color: T.textMuted }}> {verb} </span>
                      <span style={{ fontWeight: 600 }}>{detail}</span>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>{relTime(row.createdAt)}</div>
                  </div>
                  <div style={{ color, marginTop: 2, flexShrink: 0 }}>{icon}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminActivityLog;
