'use client';

import { useState } from 'react';

// ─── Data & Constants ────────────────────────────────────────────────
const CATEGORIES = ['All', 'Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental'];
const PRIORITIES = { critical: '#ef4444', important: '#f59e0b', routine: '#64748b' };
const DEPARTMENTS = ['All', 'Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General'];
const DOC_TYPES = ['All', 'SOPs', 'Risk Assessments', 'Manuals', 'MSDS/COSHH', 'Checklists', 'Policies'];

const MOCK_CREW = [
  { id: 1, name: 'James Ward', role: 'Bosun', dept: 'Deck', avatar: 'JW', online: true },
  { id: 2, name: 'Sophie Laurent', role: 'Chief Stewardess', dept: 'Interior', avatar: 'SL', online: true },
  { id: 3, name: 'Marco Rossi', role: '2nd Engineer', dept: 'Engine', avatar: 'MR', online: false },
  { id: 4, name: 'Emily Chen', role: 'Stewardess', dept: 'Interior', avatar: 'EC', online: true },
  { id: 5, name: 'Tom Hayes', role: 'Deckhand', dept: 'Deck', avatar: 'TH', online: true },
  { id: 6, name: 'Ana Petrova', role: '3rd Stewardess', dept: 'Interior', avatar: 'AP', online: false },
  { id: 7, name: "Ryan O'Brien", role: 'Junior Engineer', dept: 'Engine', avatar: 'RO', online: true },
  { id: 8, name: 'Lisa Müller', role: 'Head Chef', dept: 'Interior', avatar: 'LM', online: true },
];

const INITIAL_NOTICES = [
  { id: 1, title: 'Man Overboard Drill — 10 April', body: 'All crew to muster at 1000hrs on the aft deck for scheduled MOB drill. Full PPE required. Tender crew to have rescue boat prepped by 0945. This is a mandatory drill — all departments must ensure coverage.', category: 'Safety', priority: 'critical', dept: 'All', pinned: true, createdAt: '2026-04-09T08:00:00', readBy: [1, 2, 5, 8], acknowledgedBy: [1, 5] },
  { id: 2, title: 'Guest Arrival — 18 April', body: '6 guests arriving by helicopter transfer at approximately 1400hrs. Full welcome protocol. Interior to have welcome drinks and canapés prepared. Deck to ensure helipad is clear and secured from 1300hrs. Detailed guest preference sheets to follow.', category: 'Guest Info', priority: 'important', dept: 'All', pinned: true, createdAt: '2026-04-08T14:30:00', readBy: [1, 2, 8], acknowledgedBy: [2] },
  { id: 3, title: 'WiFi Maintenance — 12 April', body: 'Crew WiFi will be offline between 0200–0400 for firmware updates to the VSAT system. Bridge systems unaffected. Please download anything you need before 0200.', category: 'Operations', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-08T10:00:00', readBy: [1, 3, 7], acknowledgedBy: [] },
  { id: 4, title: 'New Tender Operating SOP', body: 'Updated tender operations SOP has been uploaded to the Document Library. All deck crew must review and acknowledge by 15 April. Key changes in Section 3.2 regarding passenger boarding procedures.', category: 'Safety', priority: 'important', dept: 'Deck', pinned: false, createdAt: '2026-04-07T16:00:00', readBy: [1, 5], acknowledgedBy: [1] },
  { id: 5, title: 'Crew BBQ — Saturday 12th', body: 'Crew BBQ on the crew mess aft deck from 1800hrs. Chef Lisa is doing her famous jerk chicken. BYO drinks. Off-watch crew only — check rota.', category: 'Social', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-07T09:00:00', readBy: [1, 2, 4, 5, 6, 8], acknowledgedBy: [] },
  { id: 6, title: 'Port Side Hydraulic System — Restricted Area', body: 'Port side hydraulic system under maintenance until further notice. Area cordoned off — no crew to enter without Chief Engineer authorisation. Risk assessment RA-2026-041 applies.', category: 'Safety', priority: 'critical', dept: 'Engine', pinned: false, createdAt: '2026-04-06T11:00:00', readBy: [1, 3, 5, 7], acknowledgedBy: [3, 7] },
];

const INITIAL_DOCS = [
  { id: 1, title: 'Tender Operations SOP', type: 'SOPs', dept: 'Deck', version: '3.2', updatedAt: '2026-04-07', reviewDate: '2026-10-07', acknowledgedBy: [1], required: true, pages: 12 },
  { id: 2, title: 'Anchor Winch Risk Assessment', type: 'Risk Assessments', dept: 'Deck', version: '2.1', updatedAt: '2026-03-15', reviewDate: '2026-09-15', acknowledgedBy: [1, 5], required: true, pages: 4 },
  { id: 3, title: 'Engine Room Safety Manual', type: 'Manuals', dept: 'Engine', version: '5.0', updatedAt: '2026-02-01', reviewDate: '2026-08-01', acknowledgedBy: [3, 7], required: true, pages: 48 },
  { id: 4, title: 'COSHH — Cleaning Chemicals', type: 'MSDS/COSHH', dept: 'Interior', version: '1.4', updatedAt: '2026-03-20', reviewDate: '2026-09-20', acknowledgedBy: [2, 4, 6], required: true, pages: 8 },
  { id: 5, title: 'Bridge Watchkeeping Procedures', type: 'SOPs', dept: 'Bridge', version: '4.1', updatedAt: '2026-01-10', reviewDate: '2026-07-10', acknowledgedBy: [1], required: true, pages: 22 },
  { id: 6, title: 'Guest Service Standards', type: 'Policies', dept: 'Interior', version: '2.0', updatedAt: '2026-03-01', reviewDate: '2026-09-01', acknowledgedBy: [2, 4], required: false, pages: 15 },
  { id: 7, title: 'Hot Work Permit Checklist', type: 'Checklists', dept: 'Engine', version: '1.2', updatedAt: '2026-02-28', reviewDate: '2026-08-28', acknowledgedBy: [], required: true, pages: 2 },
  { id: 8, title: 'Helicopter Operations SOP', type: 'SOPs', dept: 'Deck', version: '2.0', updatedAt: '2026-03-10', reviewDate: '2026-09-10', acknowledgedBy: [1, 5], required: true, pages: 18 },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'notice', title: 'New critical notice', body: 'Man Overboard Drill — 10 April', time: '1h ago', read: false, ref: 1 },
  { id: 2, type: 'document', title: 'Document updated', body: 'Tender Operations SOP updated to v3.2', time: '2h ago', read: false, ref: 1 },
  { id: 3, type: 'notice', title: 'New notice posted', body: 'Guest Arrival — 18 April', time: 'Yesterday', read: true, ref: 2 },
  { id: 4, type: 'reminder', title: 'Acknowledgement required', body: 'Please acknowledge: Port Side Hydraulic System notice', time: 'Yesterday', read: true, ref: 6 },
  { id: 5, type: 'notice', title: 'New notice posted', body: 'Crew BBQ — Saturday 12th', time: '2 days ago', read: true, ref: 5 },
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
};

// ─── Theme ───────────────────────────────────────────────────────────
const T = {
  bg: '#0a0f1a',
  bgCard: '#111827',
  bgHover: '#1a2236',
  bgModal: '#0d1322',
  border: '#1e293b',
  borderLight: '#2a3a52',
  text: '#e2e8f0',
  textMuted: '#8896ab',
  textDim: '#5a6a80',
  accent: '#3b82f6',
  accentGlow: 'rgba(59,130,246,0.15)',
  gold: '#f59e0b',
  critical: '#ef4444',
  success: '#10b981',
  navy: '#1e3a5f',
};

// ─── Shared Components ───────────────────────────────────────────────
function PriorityBadge({ priority }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: PRIORITIES[priority], background: `${PRIORITIES[priority]}18`, padding: '3px 8px', borderRadius: 4 }}>
      {priority}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: T.accent, background: T.accentGlow, padding: '3px 8px', borderRadius: 4 }}>
      {category}
    </span>
  );
}

function Avatar({ initials, online, size = 36 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${T.navy}, ${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: online ? T.success : T.textDim, border: `2px solid ${T.bgCard}` }} />
      )}
    </div>
  );
}

function StatCard({ label, value, color = T.accent, icon }) {
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 14px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
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
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${selected === opt ? T.accent : T.border}`, background: selected === opt ? T.accentGlow : 'transparent', color: selected === opt ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
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
        <button onClick={() => onMarkRead(notice.id)} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Mark as Read
        </button>
      )}
      {needsAck && !isAcked && (
        <button onClick={() => onAcknowledge(notice.id)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${T.critical}`, background: `${T.critical}15`, color: T.critical, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
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
function DocDetail({ doc, currentUser, onBack }) {
  const isAcked = doc.acknowledgedBy.includes(currentUser.id);

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <CategoryBadge category={doc.type} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, background: `${T.textMuted}18`, padding: '3px 8px', borderRadius: 4 }}>{doc.dept}</span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{doc.title}</h2>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        {[['Version', `v${doc.version}`], ['Last Updated', doc.updatedAt], ['Review Date', doc.reviewDate], ['Pages', doc.pages], ['Required', doc.required ? 'Yes' : 'No']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ background: `${T.navy}40`, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ color: T.textDim, marginBottom: 8 }}>{Icons.file}</div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>PDF document preview</p>
        <p style={{ fontSize: 11, color: T.textDim, margin: '4px 0 0' }}>{doc.pages} pages</p>
      </div>
      {doc.required && !isAcked && (
        <button style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
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
function AdminNoticeDetail({ notice, onBack }) {
  const totalCrew = MOCK_CREW.length;
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
        {MOCK_CREW.map(cm => {
          const hasRead = notice.readBy.includes(cm.id);
          const hasAcked = notice.acknowledgedBy.includes(cm.id);
          const status = hasAcked ? 'Acknowledged' : hasRead ? 'Read' : 'Not read';
          const statusColor = hasAcked ? T.success : hasRead ? T.accent : T.critical;
          return (
            <div key={cm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: T.bgCard, borderRadius: 10, border: `1px solid ${T.border}` }}>
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
        <button style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 12, border: `1px solid ${T.gold}`, background: `${T.gold}15`, color: T.gold, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Send Reminder to Non-Readers
        </button>
      )}
    </div>
  );
}

// ─── Notice Card ─────────────────────────────────────────────────────
function NoticeCard({ notice, currentUser, role, onClick, isPinned }) {
  const isRead = notice.readBy.includes(currentUser.id);
  return (
    <button onClick={onClick} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.bgCard, border: `1px solid ${isPinned ? `${T.gold}40` : T.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.2s' }}>
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
            <span style={{ color: T.accent }}>{notice.readBy.length}/{MOCK_CREW.length} read</span>
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
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [docs] = useState(INITIAL_DOCS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
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

  const currentUser = { id: 5, name: 'Tom Hayes', role: 'Deckhand', dept: 'Deck' };

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadNotices = notices.filter(n => !n.readBy.includes(currentUser.id)).length;
  const pendingAcks = notices.filter(n => n.priority === 'critical' && !n.acknowledgedBy.includes(currentUser.id)).length;
  const pendingDocAcks = docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).length;

  const handleAcknowledge = (noticeId) => {
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedBy: [...n.acknowledgedBy, currentUser.id], readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
  };

  const handleMarkRead = (noticeId) => {
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
  };

  const handleReadNotif = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handlePostNotice = () => {
    if (!newNotice.title.trim()) return;
    const posted = { ...newNotice, id: notices.length + 1, createdAt: new Date().toISOString(), readBy: [], acknowledgedBy: [] };
    setNotices(prev => [posted, ...prev]);
    setNewNotice({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false });
    setShowNewNotice(false);
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
          <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: `${T.critical}08`, border: `1px solid ${T.critical}30`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: T.critical, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: T.critical, fontWeight: 600 }}>Acknowledgement required</div>
            </div>
          </button>
        ))}
        {docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).map(d => (
          <button key={d.id} onClick={() => { setSelectedDoc(d); setTab('docs'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: `${T.gold}08`, border: `1px solid ${T.gold}30`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div style={{ width: 4, height: 36, borderRadius: 2, background: T.gold, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{d.title}</div>
              <div style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>Document acknowledgement pending — v{d.version}</div>
            </div>
          </button>
        ))}
      </div>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 10px' }}>Recent Notices</h3>
      {notices.slice(0, 3).map(n => (
        <button key={n.id} onClick={() => { setSelectedNotice(n); setTab('notices'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: 6 }}>
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
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notices..." style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <FilterChips options={CATEGORIES} selected={noticeFilter} onChange={setNoticeFilter} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} isPinned />)}
          {unpinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} />)}
          {filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No notices found</p>}
        </div>
      </div>
    );
  };

  // ─── Documents Screen ──────────────────────────────────────────────
  const DocsScreen = () => {
    if (selectedDoc) return <DocDetail doc={selectedDoc} currentUser={currentUser} onBack={() => setSelectedDoc(null)} />;
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
            const ackRatio = `${d.acknowledgedBy.length}/${MOCK_CREW.length}`;
            return (
              <button key={d.id} onClick={() => setSelectedDoc(d)} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 40, height: 46, borderRadius: 8, background: `${T.navy}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, flexShrink: 0 }}>{Icons.file}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{d.title}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: T.textMuted, flexWrap: 'wrap' }}>
                    <span>v{d.version}</span><span>{d.dept}</span><span>{d.type}</span>
                  </div>
                  {role === 'admin' && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Acknowledged: {ackRatio}</div>
                      <ComplianceBar value={(d.acknowledgedBy.length / MOCK_CREW.length) * 100} />
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
  const CrewProfile = () => (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 24px' }}>Profile</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
        <Avatar initials="TH" size={72} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '12px 0 2px' }}>{currentUser.name}</h3>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>{currentUser.role} — {currentUser.dept} Department</p>
        <p style={{ fontSize: 12, color: T.textDim, margin: '4px 0 0' }}>M/Y Serenity</p>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {[['Notices Read', `${notices.filter(n => n.readBy.includes(currentUser.id)).length}/${notices.length}`], ['Documents Acknowledged', `${docs.filter(d => d.acknowledgedBy.includes(currentUser.id)).length}/${docs.filter(d => d.required).length}`], ['Compliance Score', '72%']].map(([label, val], i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 14, color: T.textMuted }}>{label}</span>
            <span style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {['Notification Preferences', 'Dark Mode', 'Offline Documents', 'Log Out'].map((item, i) => (
          <button key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: item === 'Log Out' ? T.critical : T.text, fontSize: 14 }}>
            {item}
            {item !== 'Log Out' && <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Admin Dashboard ───────────────────────────────────────────────
  const AdminDashboard = () => {
    const criticalUnacked = notices.filter(n => n.priority === 'critical').reduce((sum, n) => sum + (MOCK_CREW.length - n.acknowledgedBy.length), 0);
    const docsUnacked = docs.filter(d => d.required).reduce((sum, d) => sum + (MOCK_CREW.length - d.acknowledgedBy.length), 0);
    const overallCompliance = Math.round(
      MOCK_CREW.reduce((sum, cm) => {
        const read = notices.filter(n => n.readBy.includes(cm.id)).length;
        const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
        const total = notices.length + docs.filter(d => d.required).length;
        return sum + (total > 0 ? ((read + acked) / total) * 100 : 0);
      }, 0) / MOCK_CREW.length
    );

    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {MOCK_CREW.length} crew on board</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label="Active Notices" value={notices.length} icon={Icons.notices} />
          <StatCard label="Crew Online" value={MOCK_CREW.filter(c => c.online).length} color={T.success} icon={Icons.crew} />
          <StatCard label="Critical Unack." value={criticalUnacked} color={T.critical} icon={Icons.alert} />
          <StatCard label="Doc. Pending Ack." value={docsUnacked} color={T.gold} icon={Icons.docs} />
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
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
            <button key={label} onClick={fn} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Compliance</h3>
        {MOCK_CREW.map(cm => {
          const read = notices.filter(n => n.readBy.includes(cm.id)).length;
          const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
          const total = notices.length + docs.filter(d => d.required).length;
          const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
          return (
            <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 6 }}>
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
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8 }}>
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
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8 }}>
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
          <StatCard label="On Board" value={MOCK_CREW.length} icon={Icons.crew} />
          <StatCard label="Online" value={MOCK_CREW.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
        </div>
        {MOCK_CREW.map(cm => (
          <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 8 }}>
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

  // ─── Modals ────────────────────────────────────────────────────────
  const NewNoticeModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: T.bgModal, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
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
          <button onClick={handlePostNotice} disabled={!newNotice.title.trim()} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: newNotice.title.trim() ? T.accent : T.border, color: '#fff', fontSize: 15, fontWeight: 700, cursor: newNotice.title.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
            Post Notice
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationsPanel = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} onClick={() => setShowNotifications(false)}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: 380, height: '100%', background: T.bgModal, borderLeft: `1px solid ${T.border}`, overflow: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h2>
          <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        {notifications.map(n => (
          <button key={n.id} onClick={() => { handleReadNotif(n.id); setShowNotifications(false); }} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: n.read ? 'transparent' : T.accentGlow, border: `1px solid ${n.read ? T.border : `${T.accent}30`}`, borderRadius: 12, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 8, transition: 'background 0.2s' }}>
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
    if (role === 'admin' && adminNoticeView) return <AdminNoticeDetail notice={adminNoticeView} onBack={() => setAdminNoticeView(null)} />;
    if (role === 'admin') {
      switch (tab) {
        case 'home': return <AdminDashboard />;
        case 'notices': return <NoticesScreen />;
        case 'docs': return <DocsScreen />;
        case 'crew': return <CrewManagement />;
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
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: T.accent }}>{Icons.anchor}</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>CrewBoard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', background: T.bgCard, borderRadius: 8, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            {['crew', 'admin'].map(r => (
              <button key={r} onClick={() => { setRole(r); setTab('home'); resetNav(); }} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, border: 'none', cursor: 'pointer', background: role === r ? T.accent : 'transparent', color: role === r ? '#fff' : T.textMuted, transition: 'all 0.2s' }}>{r}</button>
            ))}
          </div>
          <button onClick={() => setShowNotifications(true)} style={{ position: 'relative', background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 4 }}>
            {Icons.bell}
            {unreadNotifs > 0 && <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadNotifs}</div>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 80 }}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: T.bgModal, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 50, backdropFilter: 'blur(20px)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); resetNav(); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 8px', border: 'none', background: 'none', cursor: 'pointer', position: 'relative', color: tab === t.id ? T.accent : T.textDim, transition: 'color 0.2s' }}>
            {tab === t.id && <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: T.accent, borderRadius: '0 0 2px 2px' }} />}
            <div style={{ position: 'relative' }}>
              {t.icon}
              {t.badge > 0 && <div style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{t.badge}</div>}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Admin FAB */}
      {role === 'admin' && tab === 'notices' && !adminNoticeView && (
        <button onClick={() => setShowNewNotice(true)} style={{ position: 'fixed', bottom: 90, right: 'calc(50% - 210px)', width: 52, height: 52, borderRadius: '50%', background: T.accent, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          {Icons.plus}
        </button>
      )}

      {/* Modals */}
      {showNotifications && <NotificationsPanel />}
      {showNewNotice && <NewNoticeModal />}
    </div>
  );
}
