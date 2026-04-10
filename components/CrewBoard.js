'use client';

import { useEffect, useState } from 'react';
import { CURRENT_USER_ID } from '@/lib/constants';
import { fetchCrew, touchLastSeen } from '@/lib/crew';
import { acknowledgeDocument, fetchDocuments } from '@/lib/documents';
import { acknowledgeNotice, createNotice, fetchNotices, markNoticeRead } from '@/lib/notices';
import { createBroadcastNotification, fetchNotifications, markNotificationRead } from '@/lib/notifications';
import { ACTIVITY_ACTIONS, fetchActivity, logActivity } from '@/lib/activity';

// ─── Data & Constants ────────────────────────────────────────────────
const CATEGORIES = ['All', 'Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental'];
const PRIORITIES = { critical: '#ef4444', important: '#f59e0b', routine: '#64748b' };
const DEPARTMENTS = ['All', 'Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General'];
const DOC_TYPES = ['All', 'SOPs', 'Risk Assessments', 'Manuals', 'MSDS/COSHH', 'Checklists', 'Policies'];

const INITIAL_NOTICES = [
  { id: 1, title: 'Man Overboard Drill — 10 April', body: 'All crew to muster at 1000hrs on the aft deck for scheduled MOB drill. Full PPE required. Tender crew to have rescue boat prepped by 0945. This is a mandatory drill — all departments must ensure coverage.', category: 'Safety', priority: 'critical', dept: 'All', pinned: true, createdAt: '2026-04-09T08:00:00', readBy: [1, 2, 5, 8], acknowledgedBy: [1, 5] },
  { id: 2, title: 'Guest Arrival — 18 April', body: '6 guests arriving by helicopter transfer at approximately 1400hrs. Full welcome protocol. Interior to have welcome drinks and canapés prepared. Deck to ensure helipad is clear and secured from 1300hrs. Detailed guest preference sheets to follow.', category: 'Guest Info', priority: 'important', dept: 'All', pinned: true, createdAt: '2026-04-08T14:30:00', readBy: [1, 2, 8], acknowledgedBy: [2] },
  { id: 3, title: 'WiFi Maintenance — 12 April', body: 'Crew WiFi will be offline between 0200–0400 for firmware updates to the VSAT system. Bridge systems unaffected. Please download anything you need before 0200.', category: 'Operations', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-08T10:00:00', readBy: [1, 3, 7], acknowledgedBy: [] },
  { id: 4, title: 'New Tender Operating SOP', body: 'Updated tender operations SOP has been uploaded to the Document Library. All deck crew must review and acknowledge by 15 April. Key changes in Section 3.2 regarding passenger boarding procedures.', category: 'Safety', priority: 'important', dept: 'Deck', pinned: false, createdAt: '2026-04-07T16:00:00', readBy: [1, 5], acknowledgedBy: [1] },
  { id: 5, title: 'Crew BBQ — Saturday 12th', body: 'Crew BBQ on the crew mess aft deck from 1800hrs. Chef Lisa is doing her famous jerk chicken. BYO drinks. Off-watch crew only — check rota.', category: 'Social', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-07T09:00:00', readBy: [1, 2, 4, 5, 6, 8], acknowledgedBy: [] },
  { id: 6, title: 'Port Side Hydraulic System — Restricted Area', body: 'Port side hydraulic system under maintenance until further notice. Area cordoned off — no crew to enter without Chief Engineer authorisation. Risk assessment RA-2026-041 applies.', category: 'Safety', priority: 'critical', dept: 'Engine', pinned: false, createdAt: '2026-04-06T11:00:00', readBy: [1, 3, 5, 7], acknowledgedBy: [3, 7] },
];

// ─── Icons ───────────────────────────────────────────────────────────
const Icon = ({ d, size = 22, color = 'currentColor', fill = 'none', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  home: <Icon d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />,
  notices: <Icon d={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>} />,
  docs: <Icon d={<><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>} />,
  bell: <Icon d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>} />,
  dashboard: <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} />,
  crew: <Icon d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>} />,
  checkCircle: <Icon d={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>} />,
  alert: <Icon d={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>} />,
  pin: <Icon d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1V2H8v4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" /></>} />,
  search: <Icon d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />,
  plus: <Icon d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />,
  eye: <Icon d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />,
  file: <Icon d={<><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>} />,
  x: <Icon d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />,
  arrowLeft: <Icon d={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />,
  anchor: <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} />,
  clock: <Icon d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />,
};

// ─── Theme ───────────────────────────────────────────────────────────
const T = {
  bg: '#f8fafc',
  bgCard: '#ffffff',
  bgHover: '#f0f7ff',
  bgModal: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#475569',
  textDim: '#94a3b8',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentGlow: '#dbeafe',
  accentTint: '#f0f7ff',
  gold: '#f59e0b',
  goldTint: '#fef3c7',
  critical: '#ef4444',
  criticalTint: '#fef2f2',
  success: '#10b981',
  successTint: '#d1fae5',
  navy: '#1e3a5f',
  shadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)',
  shadowLg: '0 10px 30px rgba(15,23,42,0.08)',
};

// ─── Shared Components ───────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const bg = priority === 'critical' ? T.criticalTint : priority === 'important' ? T.goldTint : '#f1f5f9';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: PRIORITIES[priority], background: bg, padding: '4px 9px', borderRadius: 6 }}>
      {priority}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: T.accentDark, background: T.accentGlow, padding: '4px 9px', borderRadius: 6 }}>
      {category}
    </span>
  );
}

function Avatar({ initials, online, size = 36 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${T.navy}, ${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(59,130,246,0.25)' }}>
      {initials}
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: online ? T.success : T.textDim, border: `2px solid #fff` }} />
      )}
    </div>
  );
}

function StatCard({ label, value, color = T.accent, icon }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 18px', flex: 1, minWidth: 0, boxShadow: T.shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{value}</span>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function ComplianceBar({ value }) {
  return (
    <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${value}%`, background: value > 80 ? T.success : value > 50 ? T.gold : T.critical, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function FilterChips({ options, selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${selected === opt ? T.accent : T.border}`, background: selected === opt ? T.accentTint : T.bgCard, color: selected === opt ? T.accentDark : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function BackButton({ onClick, label = 'Back' }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.accent, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
      {Icons.arrowLeft} {label}
    </button>
  );
}

// ─── Notice Detail (Crew) ────────────────────────────────────────────
function NoticeDetail({ notice, currentUser, onBack, onAcknowledge, onMarkRead }) {
  const isRead = notice.readBy.includes(currentUser.id);
  const isAcked = notice.acknowledgedBy.includes(currentUser.id);
  const needsAck = notice.priority === 'critical';

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        {notice.pinned && <span style={{ fontSize: 10, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.pin} Pinned</span>}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.3 }}>{notice.title}</h2>
      <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 20px' }}>
        {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <div style={{ fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: 30, opacity: 0.9 }}>{notice.body}</div>
      {!isRead && !needsAck && (
        <button onClick={() => onMarkRead(notice.id)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Mark as Read
        </button>
      )}
      {needsAck && !isAcked && (
        <button onClick={() => onAcknowledge(notice.id)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
          I have read and understood
        </button>
      )}
      {(isRead || isAcked) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14 }}>
          {Icons.checkCircle} {isAcked ? 'Acknowledged' : 'Read'}
        </div>
      )}
    </div>
  );
}

// ─── Document Detail (Crew) ──────────────────────────────────────────
function DocDetail({ doc, currentUser, onBack, onAcknowledge }) {
  const isAcked = doc.acknowledgedBy.includes(currentUser.id);

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <CategoryBadge category={doc.type} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, background: `${T.textMuted}18`, padding: '3px 8px', borderRadius: 4 }}>{doc.dept}</span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{doc.title}</h2>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
        {[['Version', `v${doc.version}`], ['Last Updated', doc.updatedAt], ['Review Date', doc.reviewDate], ['Pages', doc.pages], ['Required', doc.required ? 'Yes' : 'No']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ background: T.accentTint, border: `1px solid ${T.border}`, borderRadius: 16, padding: 48, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ color: T.accent, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{Icons.file}</div>
        <p style={{ fontSize: 14, color: T.text, margin: 0, fontWeight: 600 }}>PDF document preview</p>
        <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>{doc.pages} pages</p>
      </div>
      {doc.required && !isAcked && (
        <button onClick={() => onAcknowledge && onAcknowledge(doc.id)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Acknowledge Current Version
        </button>
      )}
      {isAcked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14 }}>
          {Icons.checkCircle} Acknowledged — v{doc.version}
        </div>
      )}
    </div>
  );
}

// ─── Admin Notice Read Receipts ──────────────────────────────────────
function AdminNoticeDetail({ notice, onBack, crew }) {
  const totalCrew = crew.length;
  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 20px' }}>{notice.title}</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <StatCard label="Read" value={`${notice.readBy.length}/${totalCrew}`} color={T.accent} icon={Icons.eye} />
        <StatCard label="Acknowledged" value={`${notice.acknowledgedBy.length}/${totalCrew}`} color={notice.priority === 'critical' ? T.critical : T.success} icon={Icons.checkCircle} />
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Status</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {crew.map(cm => {
          const hasRead = notice.readBy.includes(cm.id);
          const hasAcked = notice.acknowledgedBy.includes(cm.id);
          const status = hasAcked ? 'Acknowledged' : hasRead ? 'Read' : 'Not read';
          const statusColor = hasAcked ? T.success : hasRead ? T.accent : T.critical;
          return (
            <div key={cm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <Avatar initials={cm.avatar} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cm.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{cm.role}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{status}</span>
            </div>
          );
        })}
      </div>
      {notice.readBy.length < totalCrew && (
        <button style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 12, border: `1px solid ${T.gold}`, background: T.goldTint, color: '#b45309', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
          Send Reminder to Non-Readers
        </button>
      )}
    </div>
  );
}

// ─── Notice Card ─────────────────────────────────────────────────────
function NoticeCard({ notice, currentUser, role, onClick, isPinned, crewCount }) {
  const isRead = notice.readBy.includes(currentUser.id);
  return (
    <button onClick={onClick} className="cb-card" style={{ display: 'flex', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${isPinned ? T.gold : T.border}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
      <div style={{ width: 4, borderRadius: 2, background: PRIORITIES[notice.priority], flexShrink: 0, alignSelf: 'stretch' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <PriorityBadge priority={notice.priority} />
          <CategoryBadge category={notice.category} />
          {isPinned && <span style={{ color: T.gold, display: 'flex' }}><Icon d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1V2H8v4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" /></>} size={14} /></span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>{notice.title}</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11 }}>
            <span style={{ color: T.accent }}>{notice.readBy.length}/{crewCount} read</span>
            <span style={{ color: T.success }}>{notice.acknowledgedBy.length} acknowledged</span>
          </div>
        )}
      </div>
      {role === 'crew' && !isRead && <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.accent, flexShrink: 0, marginTop: 4 }} />}
    </button>
  );
}

// ─── Main App Component ──────────────────────────────────────────────
export default function CrewBoard() {
  const [role, setRole] = useState('crew');
  const [tab, setTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState(null);
  const [crew, setCrew] = useState([]);
  const [crewLoading, setCrewLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [noticeFilter, setNoticeFilter] = useState('All');
  const [docDeptFilter, setDocDeptFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNotice, setShowNewNotice] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [adminNoticeView, setAdminNoticeView] = useState(null);
  const [newNotice, setNewNotice] = useState({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false });

  const currentUser = { id: CURRENT_USER_ID, name: 'Tom Hayes', role: 'Deckhand', dept: 'Deck' };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchNotices();
        if (!cancelled) {
          setNotices(rows);
          setNoticesError(null);
        }
      } catch (err) {
        if (!cancelled) setNoticesError(err.message || 'Failed to load notices');
      } finally {
        if (!cancelled) setNoticesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Online heartbeat: on mount (and every 2 minutes thereafter) write `now()`
  // to our own `last_seen_at`, then re-fetch the crew list so the online dots
  // for everyone else also refresh as they cross the 5-minute threshold.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        await touchLastSeen(currentUser.id);
      } catch (err) {
        console.error('touchLastSeen failed (non-fatal)', err);
      }
      try {
        const rows = await fetchCrew();
        if (!cancelled) setCrew(rows);
      } catch (err) {
        console.error('crew fetch failed', err);
      } finally {
        if (!cancelled) setCrewLoading(false);
      }
    };
    tick();
    const interval = setInterval(tick, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchDocuments();
        if (!cancelled) setDocs(rows);
      } catch (err) {
        console.error('documents fetch failed', err);
      } finally {
        if (!cancelled) setDocsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchNotifications();
        if (!cancelled) setNotifications(rows);
      } catch (err) {
        console.error('notifications fetch failed', err);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchActivity({ limit: 100 });
        if (!cancelled) setActivity(rows);
      } catch (err) {
        console.error('activity fetch failed', err);
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadNotices = notices.filter(n => !n.readBy.includes(currentUser.id)).length;
  const pendingAcks = notices.filter(n => n.priority === 'critical' && !n.acknowledgedBy.includes(currentUser.id)).length;
  const pendingDocAcks = docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).length;

  // Fire-and-forget audit writer. Inserts into activity_log via the helper
  // and also prepends an optimistic row to local state so the admin's
  // Activity Log screen reflects the change without a refetch.
  const recordActivity = async ({ action, targetType, targetId, metadata }) => {
    const optimistic = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      crewMemberId: currentUser.id,
      action,
      targetType,
      targetId,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
    };
    setActivity(prev => [optimistic, ...prev]);
    try {
      await logActivity({ crewMemberId: currentUser.id, action, targetType, targetId, metadata });
    } catch (err) {
      // helper already logs — nothing to do here.
    }
  };

  const handleAcknowledge = async (noticeId) => {
    const notice = notices.find(n => n.id === noticeId);
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedBy: [...n.acknowledgedBy, currentUser.id], readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
    try {
      await acknowledgeNotice({ noticeId, crewMemberId: currentUser.id });
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_ACKNOWLEDGED,
        targetType: 'notice',
        targetId: noticeId,
        metadata: notice ? { title: notice.title } : null,
      });
    } catch (err) {
      console.error('acknowledge failed, reverting', err);
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedBy: n.acknowledgedBy.filter(id => id !== currentUser.id) } : n));
    }
  };

  const handleAckDoc = async (docId) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, acknowledgedBy: [...new Set([...d.acknowledgedBy, currentUser.id])] } : d));
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(prev => ({ ...prev, acknowledgedBy: [...new Set([...prev.acknowledgedBy, currentUser.id])] }));
    }
    try {
      await acknowledgeDocument({ documentId: docId, crewMemberId: currentUser.id, version: doc.version });
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_ACKNOWLEDGED,
        targetType: 'document',
        targetId: docId,
        metadata: { title: doc.title, version: doc.version },
      });
    } catch (err) {
      console.error('acknowledgeDocument failed, reverting', err);
      setDocs(prev => prev.map(d => d.id === docId ? { ...d, acknowledgedBy: d.acknowledgedBy.filter(id => id !== currentUser.id) } : d));
    }
  };

  const handleMarkRead = async (noticeId) => {
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
    try {
      await markNoticeRead({ noticeId, crewMemberId: currentUser.id });
    } catch (err) {
      console.error('markRead failed', err);
    }
  };

  const handleReadNotif = async (id) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('markNotificationRead failed, reverting', err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const handlePostNotice = async () => {
    if (!newNotice.title.trim()) return;
    try {
      const posted = await createNotice({ ...newNotice, createdBy: currentUser.id });
      setNotices(prev => [posted, ...prev]);
      setNewNotice({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false });
      setShowNewNotice(false);
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_POSTED,
        targetType: 'notice',
        targetId: posted.id,
        metadata: { title: posted.title, priority: posted.priority },
      });
      // Fan out a broadcast notification so the bell badge updates for every
      // crew member. Failures are non-fatal — the notice itself is already
      // safely persisted at this point.
      try {
        const notif = await createBroadcastNotification({
          type: 'notice',
          title: posted.priority === 'critical' ? 'New critical notice' : 'New notice posted',
          body: posted.title,
          referenceType: 'notice',
          referenceId: posted.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to post notice: ${err.message || err}`);
    }
  };

  const resetNav = () => {
    setSelectedNotice(null);
    setSelectedDoc(null);
    setAdminNoticeView(null);
    setSelectedCrewMember(null);
  };

  const crewTabs = [
    { id: 'home', label: 'Home', icon: Icons.home },
    { id: 'notices', label: 'Notices', icon: Icons.notices, badge: unreadNotices },
    { id: 'docs', label: 'Library', icon: Icons.docs, badge: pendingDocAcks },
    { id: 'profile', label: 'Profile', icon: Icons.crew },
  ];

  const adminTabs = [
    { id: 'home', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'notices', label: 'Notices', icon: Icons.notices },
    { id: 'docs', label: 'Documents', icon: Icons.docs },
    { id: 'crew', label: 'Crew', icon: Icons.crew },
    { id: 'activity', label: 'Activity', icon: Icons.clock },
  ];

  const tabs = role === 'admin' ? adminTabs : crewTabs;

  // ─── Crew Home ─────────────────────────────────────────────────────
  const CrewHome = () => (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Welcome, {currentUser.name.split(' ')[0]}</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="Unread Notices" value={unreadNotices} icon={Icons.notices} />
        <StatCard label="Pending Ack." value={pendingAcks + pendingDocAcks} color={T.critical} icon={Icons.alert} />
      </div>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 10px' }}>Requires Your Attention</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {notices.filter(n => n.priority === 'critical' && !n.acknowledgedBy.includes(currentUser.id)).map(n => (
          <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.criticalTint, border: `1px solid ${T.critical}40`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: T.critical, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: T.critical, fontWeight: 600 }}>Acknowledgement required</div>
            </div>
          </button>
        ))}
        {docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).map(d => (
          <button key={d.id} onClick={() => { setSelectedDoc(d); setTab('docs'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.goldTint, border: `1px solid ${T.gold}40`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: T.gold, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>Document acknowledgement pending — v{d.version}</div>
            </div>
          </button>
        ))}
      </div>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 10px' }}>Recent Notices</h3>
      {notices.slice(0, 3).map(n => (
        <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 8, boxShadow: T.shadow }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: PRIORITIES[n.priority], flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>{n.category}</div>
          </div>
          {!n.readBy.includes(currentUser.id) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />}
        </button>
      ))}
    </div>
  );

  // ─── Notices Screen ────────────────────────────────────────────────
  const NoticesScreen = () => {
    if (selectedNotice) return <NoticeDetail notice={selectedNotice} currentUser={currentUser} onBack={() => setSelectedNotice(null)} onAcknowledge={handleAcknowledge} onMarkRead={handleMarkRead} />;
    const filtered = notices
      .filter(n => noticeFilter === 'All' || n.category === noticeFilter)
      .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const pinned = filtered.filter(n => n.pinned);
    const unpinned = filtered.filter(n => !n.pinned);
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Notices</h2>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textDim }}>{Icons.search}</div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notices..." style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', boxShadow: T.shadow }} />
        </div>
        <FilterChips options={CATEGORIES} selected={noticeFilter} onChange={setNoticeFilter} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} isPinned />)}
          {unpinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} />)}
          {noticesLoading && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>Loading notices…</p>}
          {noticesError && <p style={{ fontSize: 13, color: T.critical, textAlign: 'center', padding: 30 }}>Error loading notices: {noticesError}</p>}
          {!noticesLoading && !noticesError && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No notices found</p>}
        </div>
      </div>
    );
  };

  // ─── Documents Screen ──────────────────────────────────────────────
  const DocsScreen = () => {
    if (selectedDoc) return <DocDetail doc={selectedDoc} currentUser={currentUser} onBack={() => setSelectedDoc(null)} onAcknowledge={handleAckDoc} />;
    const filtered = docs
      .filter(d => docDeptFilter === 'All' || d.dept === docDeptFilter)
      .filter(d => docTypeFilter === 'All' || d.type === docTypeFilter);
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{role === 'admin' ? 'Document Management' : 'Document Library'}</h2>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Department</div>
          <FilterChips options={DEPARTMENTS} selected={docDeptFilter} onChange={setDocDeptFilter} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Type</div>
          <FilterChips options={DOC_TYPES} selected={docTypeFilter} onChange={setDocTypeFilter} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(d => {
            const isAcked = d.acknowledgedBy.includes(currentUser.id);
            const ackRatio = `${d.acknowledgedBy.length}/${crew.length}`;
            return (
              <button key={d.id} onClick={() => setSelectedDoc(d)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
                <div style={{ width: 44, height: 50, borderRadius: 10, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark, flexShrink: 0 }}>{Icons.file}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
                    <span>v{d.version}</span><span>{d.dept}</span><span>{d.type}</span>
                  </div>
                  {role === 'admin' && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Acknowledged: {ackRatio}</div>
                      <ComplianceBar value={(d.acknowledgedBy.length / crew.length) * 100} />
                    </div>
                  )}
                </div>
                {role === 'crew' && d.required && (
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {isAcked ? <span style={{ color: T.success }}>{Icons.checkCircle}</span> : <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, background: `${T.gold}18`, padding: '4px 8px', borderRadius: 4 }}>ACK</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Crew Profile ──────────────────────────────────────────────────
  const CrewProfile = () => {
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
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
        {['Notification Preferences', 'Dark Mode', 'Offline Documents', 'Log Out'].map((item, i) => (
          <button key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: item === 'Log Out' ? T.critical : T.text, fontSize: 14 }}>
            {item}
            {item !== 'Log Out' && <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>}
          </button>
        ))}
      </div>
    </div>
    );
  };

  // ─── Admin Dashboard ───────────────────────────────────────────────
  const AdminDashboard = () => {
    const criticalUnacked = notices.filter(n => n.priority === 'critical').reduce((sum, n) => sum + (crew.length - n.acknowledgedBy.length), 0);
    const docsUnacked = docs.filter(d => d.required).reduce((sum, d) => sum + (crew.length - d.acknowledgedBy.length), 0);
    const overallCompliance = Math.round(
      crew.reduce((sum, cm) => {
        const read = notices.filter(n => n.readBy.includes(cm.id)).length;
        const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
        const total = notices.length + docs.filter(d => d.required).length;
        return sum + (total > 0 ? ((read + acked) / total) * 100 : 0);
      }, 0) / crew.length
    );

    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {crew.length} crew on board</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label="Active Notices" value={notices.length} icon={Icons.notices} />
          <StatCard label="Crew Online" value={crew.filter(c => c.online).length} color={T.success} icon={Icons.crew} />
          <StatCard label="Critical Unack." value={criticalUnacked} color={T.critical} icon={Icons.alert} />
          <StatCard label="Doc. Pending Ack." value={docsUnacked} color={T.gold} icon={Icons.docs} />
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Overall Compliance</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: overallCompliance > 70 ? T.success : T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{overallCompliance}%</span>
          </div>
          <ComplianceBar value={overallCompliance} />
          <p style={{ fontSize: 11, color: T.textMuted, margin: '8px 0 0' }}>Based on notice reads and document acknowledgements across all crew</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['New Notice', () => setShowNewNotice(true)], ['Upload Doc', () => {}], ['Send Reminder', () => {}]].map(([label, fn]) => (
            <button key={label} onClick={fn} className="cb-btn-secondary" style={{ flex: 1, padding: '14px 10px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.accentDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadow }}>{label}</button>
          ))}
        </div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Compliance</h3>
        {crew.map(cm => {
          const read = notices.filter(n => n.readBy.includes(cm.id)).length;
          const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
          const total = notices.length + docs.filter(d => d.required).length;
          const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
          return (
            <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 8, boxShadow: T.shadow }}>
              <Avatar initials={cm.avatar} online={cm.online} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cm.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace" }}>{score}%</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>{cm.role} — {cm.dept}</div>
                <ComplianceBar value={score} />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // ─── Crew Management ───────────────────────────────────────────────
  const CrewManagement = () => {
    if (selectedCrewMember) {
      const cm = selectedCrewMember;
      return (
        <div style={{ padding: 20 }}>
          <BackButton onClick={() => setSelectedCrewMember(null)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar initials={cm.avatar} online={cm.online} size={56} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{cm.name}</h2>
              <p style={{ fontSize: 13, color: T.textMuted, margin: '2px 0 0' }}>{cm.role} — {cm.dept}</p>
            </div>
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Notice Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {notices.map(n => {
              const hasRead = n.readBy.includes(cm.id);
              const hasAcked = n.acknowledgedBy.includes(cm.id);
              const status = hasAcked ? 'Acknowledged' : hasRead ? 'Read' : 'Not read';
              const color = hasAcked ? T.success : hasRead ? T.accent : T.critical;
              return (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
                  <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{n.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginLeft: 8 }}>{status}</span>
                </div>
              );
            })}
          </div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Document Acknowledgements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {docs.filter(d => d.required).map(d => {
              const hasAcked = d.acknowledgedBy.includes(cm.id);
              return (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
                  <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{d.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: hasAcked ? T.success : T.critical, flexShrink: 0, marginLeft: 8 }}>{hasAcked ? 'Acknowledged' : 'Pending'}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Crew Management</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatCard label="On Board" value={crew.length} icon={Icons.crew} />
          <StatCard label="Online" value={crew.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
        </div>
        {crew.map(cm => (
          <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10, boxShadow: T.shadow }}>
            <Avatar initials={cm.avatar} online={cm.online} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{cm.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{cm.role} — {cm.dept}</div>
            </div>
            <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>
          </button>
        ))}
      </div>
    );
  };

  // ─── Admin Activity Log ────────────────────────────────────────────
  const AdminActivityLog = () => {
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

    // Group by date (Today, Yesterday, or an absolute date) for a cleaner
    // scanning experience on longer lists.
    const groups = [];
    let lastLabel = null;
    activity.forEach(row => {
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
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Activity Log</h2>
        <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 20px' }}>Every notice posted and every acknowledgement across the vessel.</p>

        {activityLoading && <div style={{ color: T.textMuted, fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Loading activity…</div>}
        {!activityLoading && activity.length === 0 && (
          <div style={{ color: T.textMuted, fontSize: 13, padding: '40px 20px', textAlign: 'center', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
            No activity recorded yet.
          </div>
        )}

        {groups.map(group => (
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

  // ─── Modals ────────────────────────────────────────────────────────
  const NewNoticeModal = () => (
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
              <select value={newNotice.category} onChange={e => setNewNotice(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Priority</label>
              <select value={newNotice.priority} onChange={e => setNewNotice(p => ({ ...p, priority: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none' }}>
                {Object.keys(PRIORITIES).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
              <input type="checkbox" checked={newNotice.pinned} onChange={e => setNewNotice(p => ({ ...p, pinned: e.target.checked }))} style={{ accentColor: T.accent }} /> Pin notice
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
              <input type="checkbox" checked={newNotice.requireAck} onChange={e => setNewNotice(p => ({ ...p, requireAck: e.target.checked }))} style={{ accentColor: T.accent }} /> Require acknowledgement
            </label>
          </div>
          <button onClick={handlePostNotice} disabled={!newNotice.title.trim()} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: newNotice.title.trim() ? T.accent : T.border, color: newNotice.title.trim() ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: newNotice.title.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
            Post Notice
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100 }} onClick={() => setShowNotifications(false)}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: 380, height: '100%', background: T.bgModal, borderLeft: `1px solid ${T.border}`, overflow: 'auto', padding: 24, boxShadow: '-20px 0 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h2>
          <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        {notifications.map(n => (
          <button key={n.id} onClick={() => { handleReadNotif(n.id); setShowNotifications(false); }} className="cb-card" style={{ display: 'flex', gap: 14, padding: '16px 18px', background: n.read ? T.bgCard : T.accentTint, border: `1px solid ${n.read ? T.border : T.accent}`, borderRadius: 14, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: n.type === 'notice' ? `${T.accent}20` : n.type === 'document' ? `${T.gold}20` : `${T.critical}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: n.type === 'notice' ? T.accent : n.type === 'document' ? T.gold : T.critical }}>
              {n.type === 'notice' ? Icons.notices : n.type === 'document' ? Icons.file : Icons.bell}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>{n.body}</div>
              <div style={{ fontSize: 11, color: T.textDim }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, flexShrink: 0, marginTop: 6 }} />}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Router ────────────────────────────────────────────────────────
  const renderScreen = () => {
    if (role === 'admin' && adminNoticeView) return <AdminNoticeDetail notice={adminNoticeView} onBack={() => setAdminNoticeView(null)} crew={crew} />;
    if (role === 'admin') {
      switch (tab) {
        case 'home': return <AdminDashboard />;
        case 'notices': return <NoticesScreen />;
        case 'docs': return <DocsScreen />;
        case 'crew': return <CrewManagement />;
        case 'activity': return <AdminActivityLog />;
        default: return <AdminDashboard />;
      }
    }
    switch (tab) {
      case 'home': return <CrewHome />;
      case 'notices': return <NoticesScreen />;
      case 'docs': return <DocsScreen />;
      case 'profile': return <CrewProfile />;
      default: return <CrewHome />;
    }
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 0 80px rgba(15,23,42,0.06)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.85)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentDark} 100%)`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.35)' }}>
            <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>CrewBoard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', padding: 2 }}>
            {['crew', 'admin'].map(r => (
              <button key={r} onClick={() => { setRole(r); setTab('home'); resetNav(); }} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, border: 'none', cursor: 'pointer', background: role === r ? T.accent : 'transparent', color: role === r ? '#fff' : T.textMuted, transition: 'all 0.2s', borderRadius: 8 }}>{r}</button>
            ))}
          </div>
          <button onClick={() => setShowNotifications(true)} style={{ position: 'relative', background: T.bg, border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
            {Icons.bell}
            {unreadNotifs > 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unreadNotifs}</div>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 88 }}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.92)', borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 50, backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)', boxShadow: '0 -8px 24px rgba(15,23,42,0.04)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); resetNav(); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 4px 14px', border: 'none', background: 'none', cursor: 'pointer', position: 'relative', color: tab === t.id ? T.accent : T.textDim, transition: 'color 0.2s' }}>
            {tab === t.id && <div style={{ position: 'absolute', top: 0, left: '30%', right: '30%', height: 3, background: T.accent, borderRadius: '0 0 3px 3px' }} />}
            <div style={{ position: 'relative' }}>
              {t.icon}
              {t.badge > 0 && <div style={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff' }}>{t.badge}</div>}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Admin FAB */}
      {role === 'admin' && tab === 'notices' && !adminNoticeView && (
        <button onClick={() => setShowNewNotice(true)} className="cb-btn-primary" style={{ position: 'fixed', bottom: 100, right: 'calc(50% - 214px)', width: 56, height: 56, borderRadius: '50%', background: T.accent, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          {Icons.plus}
        </button>
      )}

      {/* Modals */}
      {showNotifications && <NotificationsPanel />}
      {showNewNotice && <NewNoticeModal />}
    </div>
  );
}
