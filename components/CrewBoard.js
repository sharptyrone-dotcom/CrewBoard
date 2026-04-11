'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from '@/lib/auth';
import { fetchCrew } from '@/lib/crew';
import { acknowledgeDocument, fetchDocuments, uploadDocument } from '@/lib/documents';
import { acknowledgeNotice, createNotice, deleteNotice, fetchNotices, markNoticeRead, rowToNotice } from '@/lib/notices';
import { createBroadcastNotification, fetchNotifications, markNotificationRead, rowToNotification } from '@/lib/notifications';
import { ACTIVITY_ACTIONS, fetchActivity, logActivity } from '@/lib/activity';
import useRealtime from '@/hooks/useRealtime';
import usePresence from '@/hooks/usePresence';

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
  calendar: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />,
  trash: <Icon d={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>} />,
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

// Returns metadata about a notice's expiry state so callers can render a
// consistent "Valid until" / "Expired" pill without re-doing the date math.
// null => no expiry set; active => not yet expired; expired => past the date.
function getValidityInfo(validUntil) {
  if (!validUntil) return null;
  const expiry = new Date(validUntil);
  if (Number.isNaN(expiry.getTime())) return null;
  const expired = expiry.getTime() <= Date.now();
  const label = expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return { expired, label, expiry };
}

// Small pill-shaped validity indicator shared by NoticeCard / NoticeDetail /
// AdminNoticeDetail. Returns null when there's no validUntil so the caller
// can drop it in unconditionally.
function ValidityPill({ validUntil, size = 'sm' }) {
  const info = getValidityInfo(validUntil);
  if (!info) return null;
  const { expired, label } = info;
  const fontSize = size === 'lg' ? 12 : 10;
  const padding = size === 'lg' ? '5px 10px' : '3px 8px';
  return (
    <span style={{
      fontSize,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: expired ? T.critical : T.textMuted,
      background: expired ? T.criticalTint : '#f1f5f9',
      padding,
      borderRadius: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {expired ? 'Expired' : `Valid until ${label}`}
    </span>
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
        <ValidityPill validUntil={notice.validUntil} />
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
function AdminNoticeDetail({ notice, onBack, crew, onDelete }) {
  const totalCrew = crew.length;
  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        <ValidityPill validUntil={notice.validUntil} />
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
      {onDelete && (
        <button onClick={onDelete} style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 12, border: `1px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
          {Icons.trash} Delete Notice
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
          <ValidityPill validUntil={notice.validUntil} />
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
export default function CrewBoard({ user }) {
  // Admins default to the admin view but can flip to the crew view to
  // preview what their crew sees. Non-admins are locked to 'crew'.
  const [role, setRole] = useState(user?.isAdmin ? 'admin' : 'crew');
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
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [adminNoticeView, setAdminNoticeView] = useState(null);
  const [newNotice, setNewNotice] = useState({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '' });
  // New document upload form state. `file` holds a browser File object
  // picked via <input type="file">; the rest are plain text inputs.
  // Shape matches what uploadDocument() expects.
  const [newDoc, setNewDoc] = useState({ file: null, title: '', docType: 'SOPs', department: 'General', version: '1.0', reviewDate: '', isRequired: false, pageCount: '' });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  // Toast shown when a new notice arrives while the user is looking at a
  // different tab. Shape: { id, title, priority } | null. Auto-clears after
  // a few seconds or when the user clicks through to the notice.
  const [noticeToast, setNoticeToast] = useState(null);

  // Derived from the authenticated session via fetchCurrentCrewMember in
  // app/app/page.js. Falls back to an empty object so destructuring stays
  // safe during the initial paint (the page gate never actually renders
  // CrewBoard without a user, but belt-and-braces).
  const currentUser = user || { id: null, name: '', role: '', dept: '', avatar: '', isAdmin: false, vesselId: null };

  // Realtime presence: websocket channel keyed on the crew id, exposes a Set
  // of crew ids that are currently connected so the online dots update
  // instantly (instead of waiting for the 5-minute last_seen_at window). The
  // hook also owns the last_seen_at heartbeat now that the old 2-minute
  // touchLastSeen loop has been removed.
  const { onlineCrewIds } = usePresence({ vesselId: currentUser.vesselId, user: currentUser });

  // Fold presence into the crew list so every Avatar that reads `cm.online`
  // reacts to join/leave events without having to know about presence. We
  // OR with the DB-derived flag so quick disconnects don't flap the dot.
  const liveCrew = useMemo(
    () => crew.map(c => ({ ...c, online: onlineCrewIds.has(c.id) || c.online })),
    [crew, onlineCrewIds],
  );

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

  // Initial crew fetch. With usePresence handling both the last_seen_at
  // heartbeat and the live online/offline deltas, there's no need to poll
  // fetchCrew anymore — the websocket keeps the UI in sync, and anything
  // that changes out-of-band (role swaps, new joiners) will be picked up
  // on the next sign-in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCrew();
        if (!cancelled) setCrew(rows);
      } catch (err) {
        console.error('crew fetch failed', err);
      } finally {
        if (!cancelled) setCrewLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

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
        const rows = await fetchNotifications(currentUser.id);
        if (!cancelled) setNotifications(rows);
      } catch (err) {
        console.error('notifications fetch failed', err);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

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

  // Realtime fan-out: listens to Postgres changes on notices, notifications
  // and notice_reads for the current vessel, then merges each payload into
  // local state. All handlers are idempotent (Set-style dedupe on ids) so
  // the optimistic updates we do inside handlePostNotice / handleAcknowledge
  // / handleMarkRead don't double-insert when the realtime echo lands.
  useRealtime({
    vesselId: currentUser.vesselId,
    userId: currentUser.id,
    onNoticeInsert: (row) => {
      const mapped = rowToNotice(row);
      setNotices(prev => (prev.some(n => n.id === mapped.id) ? prev : [mapped, ...prev]));
      // Only surface a toast if the user didn't post it themselves and isn't
      // already looking at the notices tab. Keeps self-writes quiet.
      if (tab !== 'notices' && row.created_by && row.created_by !== currentUser.id) {
        const toast = { id: mapped.id, title: mapped.title, priority: mapped.priority };
        setNoticeToast(toast);
        setTimeout(() => {
          setNoticeToast(curr => (curr && curr.id === toast.id ? null : curr));
        }, 6000);
      }
    },
    onNoticeUpdate: (row) => {
      const mapped = rowToNotice(row);
      setNotices(prev => prev.map(n => (
        n.id === mapped.id
          // Preserve readBy/acknowledgedBy from local state — the raw row
          // from the realtime payload doesn't include the joined notice_reads
          // so we'd otherwise wipe the read-receipt arrays on every UPDATE.
          ? { ...n, ...mapped, readBy: n.readBy, acknowledgedBy: n.acknowledgedBy }
          : n
      )));
    },
    onNoticeDelete: (row) => {
      setNotices(prev => prev.filter(n => n.id !== row.id));
      setNoticeToast(curr => (curr && curr.id === row.id ? null : curr));
      // If another admin deleted the notice we're currently viewing, bounce
      // back to the list so we don't render a stale detail view.
      setSelectedNotice(curr => (curr && curr.id === row.id ? null : curr));
      setAdminNoticeView(curr => (curr && curr.id === row.id ? null : curr));
    },
    onNotificationInsert: (row) => {
      const mapped = rowToNotification(row);
      setNotifications(prev => (prev.some(n => n.id === mapped.id) ? prev : [mapped, ...prev]));
    },
    onNoticeReadChange: (payload) => {
      const row = payload.new || payload.old;
      if (!row) return;
      setNotices(prev => prev.map(n => {
        if (n.id !== row.notice_id) return n;
        if (payload.eventType === 'DELETE') {
          return {
            ...n,
            readBy: n.readBy.filter(id => id !== row.crew_member_id),
            acknowledgedBy: n.acknowledgedBy.filter(id => id !== row.crew_member_id),
          };
        }
        const readBy = Array.from(new Set([...n.readBy, row.crew_member_id]));
        const acknowledgedBy = row.acknowledged_at
          ? Array.from(new Set([...n.acknowledgedBy, row.crew_member_id]))
          : n.acknowledgedBy.filter(id => id !== row.crew_member_id);
        return { ...n, readBy, acknowledgedBy };
      }));
    },
  });

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
      // Pass both the current user's id (so broadcasts write to
      // notification_reads) and the targetCrewId from the UI shape (so the
      // helper can skip a roundtrip to look it up on the server).
      await markNotificationRead(id, currentUser.id, { targetCrewId: target.targetCrewId });
    } catch (err) {
      console.error('markNotificationRead failed, reverting', err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  // Shared navigation helpers. Any entry-point that wants to jump the user
  // into a notice or document detail view should go through these so the
  // routing quirks (admin vs crew, competing detail states) are in one
  // place instead of re-derived at every call site.
  //
  //   • Notice detail for a crew user lives behind `selectedNotice` +
  //     tab === 'notices' (the NoticesScreen early-returns on selectedNotice).
  //   • Notice detail for an admin lives behind `adminNoticeView` — the
  //     top-level renderScreen() short-circuits on that state regardless
  //     of the current tab, so we still set the tab for nav-bar highlight
  //     consistency but the detail view would render either way.
  //   • Document detail is the same for both roles: `selectedDoc` + tab.
  //
  // Each helper also clears any *other* detail state so you can't end up
  // with a stale overlay (e.g. navigating from a doc detail straight into
  // a notice via a notification click).
  const navigateToNotice = (notice) => {
    if (!notice) return;
    setSelectedDoc(null);
    if (role === 'admin') {
      setSelectedNotice(null);
      setAdminNoticeView(notice);
    } else {
      setAdminNoticeView(null);
      setSelectedNotice(notice);
    }
    setTab('notices');
  };

  const navigateToDocument = (doc) => {
    if (!doc) return;
    setSelectedNotice(null);
    setAdminNoticeView(null);
    setSelectedDoc(doc);
    setTab('docs');
  };

  // Clicking a notification in the bell panel should both mark it read AND
  // jump the user into the relevant detail view — Facebook-style. Dispatch
  // is keyed on the notification's `type`:
  //
  //   • 'notice'   → notice detail
  //   • 'reminder' → notice detail (a reminder is just a nudge to ack a
  //                  specific notice, so it routes to the same place)
  //   • 'document' → document detail
  //   • 'system' / unknown → close the panel, don't navigate
  //
  // The item-matching strategy inside `findItem` tries three fallbacks
  // before giving up, so a single click always lands the user somewhere
  // useful instead of silently doing nothing:
  //
  //   1. `reference_id` (exposed as `.ref` on the UI shape). Fast, exact,
  //      and every notification created by the app carries it.
  //   2. Case-insensitive substring match on `notification.body` against
  //      each item's title. Seeded data follows a pattern like
  //      "Man Overboard Drill — 10 April" / "Tender Operations SOP updated
  //      to v3.2", where the referenced item's title is embedded verbatim
  //      in the body, so substring lookups are usually enough.
  //   3. Same substring match against `notification.title` (some rows
  //      embed the target title in the title, not the body).
  //
  // If all three fallbacks miss — e.g. a realtime notification arrives
  // before the corresponding notice/document has been folded into local
  // state — we still flip the active tab to `notices` or `docs`. That way
  // the user at minimum lands on the right screen and can find the item
  // themselves, rather than seeing the click do nothing. Setting `null`
  // on the detail state also clears any stale overlay from a previous
  // navigation.
  //
  // The panel is closed immediately so navigation feels snappy, and
  // handleReadNotif runs in the background — we deliberately don't await
  // it so a slow network doesn't stall the screen change.
  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    handleReadNotif(notification.id);

    const routesToNotice = notification.type === 'notice' || notification.type === 'reminder';
    const routesToDocument = notification.type === 'document';
    if (!routesToNotice && !routesToDocument) return;

    const findItem = (items) => {
      if (!Array.isArray(items) || items.length === 0) return null;
      if (notification.ref) {
        const byRef = items.find(i => i.id === notification.ref);
        if (byRef) return byRef;
      }
      const body = (notification.body || '').toLowerCase();
      const title = (notification.title || '').toLowerCase();
      const byBody = body
        ? items.find(i => i.title && body.includes(i.title.toLowerCase()))
        : null;
      if (byBody) return byBody;
      const byTitle = title
        ? items.find(i => i.title && title.includes(i.title.toLowerCase()))
        : null;
      return byTitle || null;
    };

    if (routesToNotice) {
      const notice = findItem(notices);
      if (notice) {
        navigateToNotice(notice);
      } else {
        // Couldn't resolve the exact notice — at least land the user on
        // the notices tab so the click isn't a dead-end. Clear any stale
        // detail overlays first.
        setSelectedDoc(null);
        setSelectedNotice(null);
        setAdminNoticeView(null);
        setTab('notices');
      }
      return;
    }

    if (routesToDocument) {
      const doc = findItem(docs);
      if (doc) {
        navigateToDocument(doc);
      } else {
        // Same fallback for documents — flip to the library tab so the
        // user sees the list even if we can't pick out the exact row.
        setSelectedNotice(null);
        setAdminNoticeView(null);
        setSelectedDoc(null);
        setTab('docs');
      }
    }
  };

  const handlePostNotice = async () => {
    if (!newNotice.title.trim()) return;
    try {
      // Convert the datetime-local string (e.g. "2026-04-20T18:00") into an
      // ISO string so Supabase interprets it in the user's local zone.
      // Empty string → null so the notice never auto-expires.
      const validUntilIso = newNotice.validUntil
        ? new Date(newNotice.validUntil).toISOString()
        : null;
      const posted = await createNotice({
        ...newNotice,
        validUntil: validUntilIso,
        createdBy: currentUser.id,
      });
      setNotices(prev => [posted, ...prev]);
      setNewNotice({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '' });
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

  // Admin-only: delete a notice the user selected in the admin detail view.
  // Gated behind a confirm() so a stray click doesn't nuke an announcement.
  // On success we:
  //   • optimistically drop the row from local state so the list updates
  //     immediately (the realtime DELETE event will echo back and be a
  //     no-op thanks to the filter dedupe in onNoticeDelete),
  //   • clear both admin and crew detail states so the user lands back on
  //     the notices list instead of an empty detail view,
  //   • log an activity entry so the audit trail captures who deleted
  //     what.
  // Errors surface as a blocking alert — deletion is destructive and we
  // want the admin to know if the server refused the request (e.g. they
  // weren't actually admin, or the row was already gone).
  const handleDeleteNotice = async (noticeId) => {
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) return;
    const confirmed = window.confirm(
      `Delete "${notice.title}"? This cannot be undone and will remove the notice for everyone on board.`
    );
    if (!confirmed) return;
    try {
      await deleteNotice({ noticeId });
      setNotices(prev => prev.filter(n => n.id !== noticeId));
      setAdminNoticeView(null);
      setSelectedNotice(null);
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_DELETED,
        targetType: 'notice',
        targetId: noticeId,
        metadata: { title: notice.title },
      });
    } catch (err) {
      alert(`Failed to delete notice: ${err?.message || err}`);
    }
  };

  // Admin-only: upload a PDF to the vessel-documents storage bucket and
  // insert the matching metadata row. Both writes are admin-gated at the
  // database layer (see migration 012), so the catch here covers RLS
  // refusals just as much as network errors. We keep the modal open on
  // failure so the admin can see the alert and retry without retyping
  // their form.
  const handleUploadDoc = async () => {
    if (!newDoc.file || !newDoc.title.trim()) return;
    setUploadingDoc(true);
    try {
      const uploaded = await uploadDocument({
        file: newDoc.file,
        title: newDoc.title.trim(),
        docType: newDoc.docType,
        department: newDoc.department,
        version: newDoc.version || null,
        reviewDate: newDoc.reviewDate || null,
        isRequired: newDoc.isRequired,
        pageCount: newDoc.pageCount ? Number(newDoc.pageCount) : null,
        uploadedBy: currentUser.id,
      });
      setDocs(prev => [uploaded, ...prev]);
      setNewDoc({ file: null, title: '', docType: 'SOPs', department: 'General', version: '1.0', reviewDate: '', isRequired: false, pageCount: '' });
      setShowNewDoc(false);
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_POSTED,
        targetType: 'document',
        targetId: uploaded.id,
        metadata: { title: uploaded.title, version: uploaded.version },
      });
      // Broadcast a notification so the bell badge lights up for every
      // crew member who needs to acknowledge the new doc. Non-fatal if it
      // fails — the document itself is already persisted.
      try {
        const notif = await createBroadcastNotification({
          type: 'document',
          title: uploaded.required ? 'New required document' : 'New document',
          body: uploaded.title,
          referenceType: 'document',
          referenceId: uploaded.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to upload document: ${err?.message || err}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const resetNav = () => {
    setSelectedNotice(null);
    setSelectedDoc(null);
    setAdminNoticeView(null);
    setSelectedCrewMember(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The page gate's onAuthStateChange listener swaps back to LoginScreen.
    } catch (err) {
      alert(`Sign out failed: ${err?.message || err}`);
    }
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
          <button
            key={item}
            onClick={item === 'Log Out' ? handleLogout : undefined}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', width: '100%', background: 'none', border: 'none', cursor: item === 'Log Out' ? 'pointer' : 'default', color: item === 'Log Out' ? T.critical : T.text, fontSize: 14 }}
          >
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
    const criticalUnacked = notices.filter(n => n.priority === 'critical').reduce((sum, n) => sum + (liveCrew.length - n.acknowledgedBy.length), 0);
    const docsUnacked = docs.filter(d => d.required).reduce((sum, d) => sum + (liveCrew.length - d.acknowledgedBy.length), 0);
    const overallCompliance = Math.round(
      liveCrew.reduce((sum, cm) => {
        const read = notices.filter(n => n.readBy.includes(cm.id)).length;
        const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
        const total = notices.length + docs.filter(d => d.required).length;
        return sum + (total > 0 ? ((read + acked) / total) * 100 : 0);
      }, 0) / (liveCrew.length || 1)
    );

    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {liveCrew.length} crew on board</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <StatCard label="Active Notices" value={notices.length} icon={Icons.notices} />
          <StatCard label="Crew Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.crew} />
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            ['New Notice', () => setShowNewNotice(true)],
            ['Upload Doc', () => setShowNewDoc(true)],
            ['Send Reminder', () => {}],
            // Navigates via window.location.href rather than next/link so we
            // get a full page load — the admin invites page owns its own
            // AuthProvider and a hard navigation keeps the two trees
            // cleanly separated.
            ['Invite Crew', () => { window.location.href = '/admin/invites'; }],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn} className="cb-btn-secondary" style={{ flex: '1 1 140px', padding: '14px 10px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.accentDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadow }}>{label}</button>
          ))}
        </div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Compliance</h3>
        {liveCrew.map(cm => {
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
      // Re-hydrate from liveCrew so the detail view's online dot reacts to
      // presence changes even while this screen is open. Falls back to the
      // captured snapshot if the row is no longer on the roster.
      const cm = liveCrew.find(c => c.id === selectedCrewMember.id) || selectedCrewMember;
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
          <StatCard label="On Board" value={liveCrew.length} icon={Icons.crew} />
          <StatCard label="Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
        </div>
        {liveCrew.map(cm => (
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

  // Admin PDF upload modal. File picker + metadata fields that get sent
  // straight through to uploadDocument() -> storage + documents insert.
  // Mirrors NewNoticeModal styling so the two feel like part of the same
  // admin surface. Like the notice modal, this is a factory called as a
  // function at render time (NOT as a JSX component) to avoid the inline-
  // component remount / focus-loss trap.
  const NewDocumentModal = () => {
    const canSubmit = !!newDoc.file && newDoc.title.trim() && !uploadingDoc;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ background: T.bgModal, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 -20px 40px rgba(15,23,42,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Upload Document</h2>
            <button onClick={() => setShowNewDoc(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>PDF file</label>
              <label htmlFor="cb-doc-file" style={{ display: 'block', padding: 16, borderRadius: 10, border: `2px dashed ${newDoc.file ? T.accent : T.border}`, background: newDoc.file ? T.accentTint : T.bgCard, color: newDoc.file ? T.accentDark : T.textMuted, fontSize: 13, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>
                {newDoc.file
                  ? `${newDoc.file.name} (${Math.round((newDoc.file.size / 1024 / 1024) * 10) / 10} MB)`
                  : 'Click to choose a PDF (max 50 MB)'}
              </label>
              <input
                id="cb-doc-file"
                type="file"
                accept="application/pdf"
                onChange={e => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setNewDoc(p => ({
                    ...p,
                    file,
                    // Auto-fill title from filename if the user hasn't typed anything yet.
                    title: p.title || (file ? file.name.replace(/\.pdf$/i, '') : ''),
                  }));
                }}
                style={{ display: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Title</label>
              <input value={newDoc.title} onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))} placeholder="Document title..." style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Type</label>
                <select value={newDoc.docType} onChange={e => setNewDoc(p => ({ ...p, docType: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none' }}>
                  {DOC_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Department</label>
                <select value={newDoc.department} onChange={e => setNewDoc(p => ({ ...p, department: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none' }}>
                  {DEPARTMENTS.filter(d => d !== 'All').concat('General').filter((v, i, a) => a.indexOf(v) === i).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Version</label>
                <input value={newDoc.version} onChange={e => setNewDoc(p => ({ ...p, version: e.target.value }))} placeholder="1.0" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Pages</label>
                <input type="number" min="1" value={newDoc.pageCount} onChange={e => setNewDoc(p => ({ ...p, pageCount: e.target.value }))} placeholder="—" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Review date</label>
                <input type="date" value={newDoc.reviewDate} onChange={e => setNewDoc(p => ({ ...p, reviewDate: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, cursor: 'pointer' }}>
              <input type="checkbox" checked={newDoc.isRequired} onChange={e => setNewDoc(p => ({ ...p, isRequired: e.target.checked }))} style={{ accentColor: T.accent }} /> Required acknowledgement
            </label>
            <button onClick={handleUploadDoc} disabled={!canSubmit} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: canSubmit ? T.accent : T.border, color: canSubmit ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', transition: 'background 0.2s' }}>
              {uploadingDoc ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const NotificationsPanel = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100 }} onClick={() => setShowNotifications(false)}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: 380, height: '100%', background: T.bgModal, borderLeft: `1px solid ${T.border}`, overflow: 'auto', padding: 24, boxShadow: '-20px 0 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Notifications</h2>
          <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        {notifications.map(n => (
          <button key={n.id} onClick={() => handleNotificationClick(n)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '16px 18px', background: n.read ? T.bgCard : T.accentTint, border: `1px solid ${n.read ? T.border : T.accent}`, borderRadius: 14, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10 }}>
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
  // Screen factories are defined above as arrow functions that close over
  // local state instead of taking props. We intentionally CALL them here
  // (e.g. `NoticesScreen()`) instead of rendering them as JSX elements
  // (`<NoticesScreen />`). The distinction matters: rendering them as
  // `<Component />` would make React treat the factory as a new component
  // type on every parent re-render — because an arrow function declared
  // inside `CrewBoard` is a fresh function reference each render — which
  // forces an unmount/remount of the entire subtree. That, in turn, steals
  // focus from inputs (you could only type one character before the field
  // unmounted) and resets scroll position.
  //
  // By calling them as plain functions we splice their returned JSX
  // directly into `CrewBoard`'s tree, so React reconciles the DOM nodes
  // in place and focus is preserved. This only works because none of the
  // factories use hooks of their own; they just read from the CrewBoard
  // closure.
  //
  // AdminNoticeDetail is a genuine component (defined outside CrewBoard)
  // with its own hooks, so it stays as `<AdminNoticeDetail ... />`.
  const renderScreen = () => {
    if (role === 'admin' && adminNoticeView) return <AdminNoticeDetail notice={adminNoticeView} onBack={() => setAdminNoticeView(null)} crew={liveCrew} onDelete={() => handleDeleteNotice(adminNoticeView.id)} />;
    if (role === 'admin') {
      switch (tab) {
        case 'home': return AdminDashboard();
        case 'notices': return NoticesScreen();
        case 'docs': return DocsScreen();
        case 'crew': return CrewManagement();
        case 'activity': return AdminActivityLog();
        default: return AdminDashboard();
      }
    }
    switch (tab) {
      case 'home': return CrewHome();
      case 'notices': return NoticesScreen();
      case 'docs': return DocsScreen();
      case 'profile': return CrewProfile();
      default: return CrewHome();
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
          {/* Role toggle only appears for admins so non-admin crew can't
              pretend to be admins. The RLS policies would block most admin
              actions anyway, but hiding the toggle removes the confusion. */}
          {currentUser.isAdmin && (
            <div style={{ display: 'flex', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', padding: 2 }}>
              {['crew', 'admin'].map(r => (
                <button key={r} onClick={() => { setRole(r); setTab('home'); resetNav(); }} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, border: 'none', cursor: 'pointer', background: role === r ? T.accent : 'transparent', color: role === r ? '#fff' : T.textMuted, transition: 'all 0.2s', borderRadius: 8 }}>{r}</button>
              ))}
            </div>
          )}
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

      {/* Realtime toast — slides in when a new notice lands while the user
          is on a different tab. Clicks through to the notice detail;
          auto-dismisses after 6 seconds via the useRealtime handler. */}
      {noticeToast && (
        <div
          role="status"
          onClick={() => {
            // Route through the shared helper so admin and crew both land
            // in the right detail view. navigateToNotice is a no-op when
            // the notice can't be found (e.g. deleted between the toast
            // firing and the click), so we can call it unconditionally.
            navigateToNotice(notices.find(n => n.id === noticeToast.id));
            setNoticeToast(null);
          }}
          className="cb-toast"
          style={{
            position: 'fixed',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 448,
            background: T.bgCard,
            border: `1px solid ${noticeToast.priority === 'critical' ? T.critical : T.accent}`,
            borderLeft: `4px solid ${noticeToast.priority === 'critical' ? T.critical : T.accent}`,
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: T.shadowLg,
            zIndex: 120,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ color: noticeToast.priority === 'critical' ? T.critical : T.accent, display: 'flex', flexShrink: 0 }}>
            {Icons.notices}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              New {noticeToast.priority === 'critical' ? 'critical ' : ''}notice
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {noticeToast.title}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setNoticeToast(null); }}
            aria-label="Dismiss"
            style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            {Icons.x}
          </button>
        </div>
      )}

      {/* Modals — called as functions, not rendered as <Component />, for
          the same reason as the screen factories in renderScreen: it keeps
          React from remounting the subtree on every parent re-render and
          preserves input focus while typing. See the comment above
          renderScreen for the full explanation. */}
      {showNotifications && NotificationsPanel()}
      {showNewNotice && NewNoticeModal()}
      {showNewDoc && NewDocumentModal()}
    </div>
  );
}
