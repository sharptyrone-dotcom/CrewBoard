'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from '@/lib/auth';
import { fetchCrew } from '@/lib/crew';
import { acknowledgeDocument, deleteDocument, fetchDocuments, getDocumentSignedUrl, replaceDocument, uploadDocument } from '@/lib/documents';
import { acknowledgeNotice, castPollVote, createNotice, deleteNotice, fetchNotices, markNoticeRead, rowToNotice } from '@/lib/notices';
import { createBroadcastNotification, createTargetedNotification, fetchNotifications, markNotificationRead, rowToNotification } from '@/lib/notifications';
import { ACTIVITY_ACTIONS, fetchActivity, logActivity } from '@/lib/activity';
import useRealtime from '@/hooks/useRealtime';
import usePresence from '@/hooks/usePresence';
import useMediaQuery from '@/hooks/useMediaQuery';
import { isPushSupported, getPushPermission, subscribeToPush, isSubscribed as checkPushSubscribed } from '@/lib/push';
import { sendReminderChannels } from '@/lib/send-reminder';
// reportGenerator is dynamically imported in handleExport to keep the
// main bundle small — jspdf + autotable add ~140 kB that only admins
// who click "Export Report" ever need.

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
  poll: <Icon d={<><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="5" width="4" height="16" rx="1" /><rect x="17" y="8" width="4" height="13" rx="1" /></>} fill="currentColor" strokeWidth={0} />,
  minus: <Icon d={<line x1="5" y1="12" x2="19" y2="12" />} />,
  star: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />,
  starFilled: <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" fill="currentColor" />,
  training: <Icon d={<><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></>} />,
  award: <Icon d={<><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>} />,
  play: <Icon d="M5 3l14 9-14 9V3z" />,
  check: <Icon d={<polyline points="20 6 9 17 4 12" />} />,
  arrowUp: <Icon d={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />,
  arrowDown: <Icon d={<><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>} />,
  send: <Icon d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />,
  image: <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>} />,
  video: <Icon d={<><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></>} />,
  userPlus: <Icon d={<><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>} />,
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

// ─── Poll Results Bar ───────────────────────────────────────────────
function PollResultsBar({ option, voteCount, totalVotes, isSelected, percentage }) {
  return (
    <div style={{
      position: 'relative', padding: '14px 16px', borderRadius: 12, overflow: 'hidden',
      border: `2px solid ${isSelected ? T.accent : T.border}`,
      background: T.bgCard, transition: 'border-color 0.2s',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${percentage}%`, background: isSelected ? T.accentGlow : '#f1f5f9',
        transition: 'width 0.4s ease-out', borderRadius: 10,
      }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
          {isSelected && <span style={{ color: T.accent }}>{Icons.checkCircle}</span>}
          {option.text}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.accent : T.textMuted }}>
          {percentage}%
          <span style={{ fontWeight: 400, fontSize: 11, marginLeft: 4 }}>({voteCount})</span>
        </span>
      </div>
    </div>
  );
}

// ─── Notice Detail (Crew) ────────────────────────────────────────────
function NoticeDetail({ notice, currentUser, onBack, onAcknowledge, onMarkRead, onPollVote }) {
  const isRead = notice.readBy.includes(currentUser.id);
  const isAcked = notice.acknowledgedBy.includes(currentUser.id);
  const needsAck = notice.priority === 'critical';
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  const myVote = hasPoll ? (notice.pollVotes || []).find(v => v.crewMemberId === currentUser.id) : null;
  const totalVotes = hasPoll ? (notice.pollVotes || []).length : 0;

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        <ValidityPill validUntil={notice.validUntil} />
        {notice.pinned && <span style={{ fontSize: 10, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.pin} Pinned</span>}
        {hasPoll && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.poll} Poll</span>}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.3 }}>{notice.title}</h2>
      <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 20px' }}>
        {new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      <div style={{ fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: hasPoll ? 20 : 30, opacity: 0.9 }}>{notice.body}</div>

      {/* Poll voting / results */}
      {hasPoll && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.poll} {myVote ? 'Poll Results' : 'Cast Your Vote'}
            {totalVotes > 0 && <span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted }}>({totalVotes} vote{totalVotes !== 1 ? 's' : ''})</span>}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myVote ? (
              /* Show results with bars after voting */
              notice.pollOptions.map(opt => {
                const voteCount = (notice.pollVotes || []).filter(v => v.optionId === opt.id).length;
                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                return <PollResultsBar key={opt.id} option={opt} voteCount={voteCount} totalVotes={totalVotes} isSelected={myVote.optionId === opt.id} percentage={pct} />;
              })
            ) : (
              /* Show vote buttons before voting */
              notice.pollOptions.map(opt => (
                <button key={opt.id} onClick={() => onPollVote(notice.id, opt.id)} className="cb-card" style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${T.border}`,
                  background: T.bgCard, cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
                  color: T.text, transition: 'all 0.15s',
                }}>
                  {opt.text}
                </button>
              ))
            )}
          </div>
          {myVote && (
            <button onClick={() => onPollVote(notice.id, myVote.optionId === notice.pollOptions[0].id ? notice.pollOptions[1].id : notice.pollOptions[0].id)} style={{
              background: 'none', border: 'none', color: T.textMuted, fontSize: 12, cursor: 'pointer',
              marginTop: 8, padding: 4, textDecoration: 'underline',
            }}>
              Change my vote
            </button>
          )}
        </div>
      )}

      {!isRead && !needsAck && !hasPoll && (
        <button onClick={() => onMarkRead(notice.id)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Mark as Read
        </button>
      )}
      {needsAck && !isAcked && (
        <button onClick={() => onAcknowledge(notice.id)} style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
          I have read and understood
        </button>
      )}
      {(isRead || isAcked) && !hasPoll && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14 }}>
          {Icons.checkCircle} {isAcked ? 'Acknowledged' : 'Read'}
        </div>
      )}
    </div>
  );
}

// ─── Document Detail (Crew) ──────────────────────────────────────────
// Shows the doc metadata + an inline PDF viewer. We fetch a short-lived
// signed URL for the stored object and embed it in an iframe with the
// Chrome PDF viewer toolbar stripped via hash params (`#toolbar=0&
// navpanes=0`). The bucket is private so crew can't grab the URL out of
// the DOM and share it — and because we never render a link or a
// Download button, there's no obvious UI affordance to save the file.
// (A determined user with devtools can always still exfiltrate anything
// the browser renders — this is a UI "view-only" lock, not a DRM
// guarantee.)
//
// Legacy seeded rows still have `https://example.com/...` in their
// file_url and there's no real file behind them, so for those we fall
// back to the old "PDF document preview" placeholder tile.
function DocDetail({ doc, currentUser, onBack, onAcknowledge, role, onDelete, onReplace, isDesktop, isQuickAccess, onToggleQuickAccess }) {
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
    </div>
  );
}

// ─── Admin Notice Read Receipts ──────────────────────────────────────
function AdminNoticeDetail({ notice, onBack, crew, onDelete, onSendReminder, isDesktop }) {
  const [reminderState, setReminderState] = useState('idle'); // idle | sending | sent | error
  const totalCrew = crew.length;
  const nonReaderCount = crew.filter(cm => !notice.readBy.includes(cm.id)).length;
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  const totalVotes = hasPoll ? (notice.pollVotes || []).length : 0;

  const handleReminder = async () => {
    if (reminderState !== 'idle' || !onSendReminder) return;
    setReminderState('sending');
    try {
      await onSendReminder(notice);
      setReminderState('sent');
    } catch (err) {
      console.error('[AdminNoticeDetail] reminder failed', err);
      setReminderState('error');
      setTimeout(() => setReminderState('idle'), 3000);
    }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <BackButton onClick={onBack} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <PriorityBadge priority={notice.priority} />
        <CategoryBadge category={notice.category} />
        <ValidityPill validUntil={notice.validUntil} />
        {hasPoll && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.poll} Poll</span>}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: '0 0 20px' }}>{notice.title}</h2>

      {/* Poll results section for admin */}
      {hasPoll && (
        <div style={{ marginBottom: 24, padding: 20, background: '#f8f7ff', borderRadius: 16, border: '1px solid #e9e5ff' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.poll} Poll Results
            <span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted }}>({totalVotes}/{totalCrew} voted)</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notice.pollOptions.map(opt => {
              const voters = (notice.pollVotes || []).filter(v => v.optionId === opt.id);
              const voteCount = voters.length;
              const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isWinning = voteCount > 0 && voteCount === Math.max(...notice.pollOptions.map(o => (notice.pollVotes || []).filter(v => v.optionId === o.id).length));
              return (
                <div key={opt.id}>
                  <div style={{
                    position: 'relative', padding: '12px 16px', borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${isWinning ? '#7c3aed' : T.border}`, background: T.bgCard,
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${pct}%`, background: isWinning ? '#ede9fe' : '#f1f5f9',
                      transition: 'width 0.4s ease-out', borderRadius: 8,
                    }} />
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: isWinning ? 700 : 500, color: T.text }}>{opt.text}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isWinning ? '#7c3aed' : T.textMuted }}>
                        {pct}% <span style={{ fontWeight: 400, fontSize: 11 }}>({voteCount})</span>
                      </span>
                    </div>
                  </div>
                  {/* Show voter names under each option */}
                  {voters.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, paddingLeft: 8 }}>
                      {voters.map(v => {
                        const cm = crew.find(c => c.id === v.crewMemberId);
                        return cm ? (
                          <span key={v.crewMemberId} style={{ fontSize: 11, color: T.textMuted, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 6, padding: '2px 8px' }}>
                            {cm.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Non-voters list */}
          {totalVotes < totalCrew && (
            <div style={{ marginTop: 12, fontSize: 12, color: T.textMuted }}>
              <span style={{ fontWeight: 600 }}>Haven&apos;t voted:</span>{' '}
              {crew.filter(cm => !(notice.pollVotes || []).some(v => v.crewMemberId === cm.id)).map(cm => cm.name).join(', ')}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: isDesktop ? 400 : undefined }}>
        <StatCard label="Read" value={`${notice.readBy.length}/${totalCrew}`} color={T.accent} icon={Icons.eye} />
        <StatCard label="Acknowledged" value={`${notice.acknowledgedBy.length}/${totalCrew}`} color={notice.priority === 'critical' ? T.critical : T.success} icon={Icons.checkCircle} />
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Status</h3>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 6 }}>
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
      <div style={{ display: 'flex', gap: 10, marginTop: 16, maxWidth: isDesktop ? 500 : undefined }}>
        {nonReaderCount > 0 && (
          <button
            onClick={handleReminder}
            disabled={reminderState !== 'idle'}
            style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: `1px solid ${reminderState === 'sent' ? T.success : reminderState === 'error' ? T.critical : T.gold}`,
              background: reminderState === 'sent' ? '#f0fdf4' : reminderState === 'error' ? T.criticalTint : T.goldTint,
              color: reminderState === 'sent' ? T.success : reminderState === 'error' ? T.critical : '#b45309',
              fontSize: 14, fontWeight: 700,
              cursor: reminderState === 'idle' ? 'pointer' : 'default',
              opacity: reminderState === 'sending' ? 0.7 : 1,
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {reminderState === 'sending' ? 'Sending...' :
             reminderState === 'sent' ? `${Icons.checkCircle} Sent to ${nonReaderCount} crew` :
             reminderState === 'error' ? 'Failed — try again' :
             `Send Reminder to ${nonReaderCount} Non-Reader${nonReaderCount > 1 ? 's' : ''}`}
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.critical}`, background: T.criticalTint, color: T.critical, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
            {Icons.trash} Delete Notice
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Notice Card ─────────────────────────────────────────────────────
function NoticeCard({ notice, currentUser, role, onClick, isPinned, crewCount, isDesktop }) {
  const isRead = notice.readBy.includes(currentUser.id);
  const isAdminDesktop = role === 'admin' && isDesktop;
  const hasPoll = notice.pollOptions && notice.pollOptions.length >= 2;
  return (
    <button onClick={onClick} className="cb-card" style={{ display: 'flex', gap: isAdminDesktop ? 18 : 14, padding: isAdminDesktop ? '16px 22px' : '18px 20px', background: T.bgCard, border: `1px solid ${isPinned ? T.gold : T.border}`, borderRadius: isAdminDesktop ? 12 : 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow, alignItems: isAdminDesktop ? 'center' : 'stretch' }}>
      <div style={{ width: 4, borderRadius: 2, background: PRIORITIES[notice.priority], flexShrink: 0, alignSelf: 'stretch' }} />
      {isAdminDesktop ? (
        /* Desktop admin: single-row layout with columns */
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, minWidth: 120 }}>
            <PriorityBadge priority={notice.priority} />
            <CategoryBadge category={notice.category} />
            {hasPoll && <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 6px', borderRadius: 4 }}>{Icons.poll}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPinned && <span style={{ color: T.gold, display: 'flex', flexShrink: 0 }}><Icon d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1V2H8v4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24z" /></>} size={14} /></span>}
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notice.title}</span>
            <ValidityPill validUntil={notice.validUntil} />
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, flexShrink: 0, minWidth: 70, textAlign: 'right' }}>{new Date(notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, flexShrink: 0, minWidth: 150, justifyContent: 'flex-end' }}>
            <span style={{ color: T.accent, fontWeight: 600 }}>{notice.readBy.length}/{crewCount} read</span>
            <span style={{ color: T.success, fontWeight: 600 }}>{notice.acknowledgedBy.length} ack</span>
          </div>
        </>
      ) : (
        /* Mobile: original stacked layout */
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <PriorityBadge priority={notice.priority} />
              <CategoryBadge category={notice.category} />
              <ValidityPill validUntil={notice.validUntil} />
              {hasPoll && <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>{Icons.poll} Poll</span>}
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
        </>
      )}
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
  // Quick Access — per-crew-member document favorites stored in localStorage.
  // Keyed by crew member id so multiple crew sharing a device each get their
  // own list. Lazy-initialised from storage on first render.
  const [quickAccessIds, setQuickAccessIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(`crewboard_quickaccess_${user?.id}`) || '[]');
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNotice, setShowNewNotice] = useState(false);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [adminNoticeView, setAdminNoticeView] = useState(null);
  // Dashboard "Send Reminder" button state: idle → sending → sent/empty → idle
  const [dashReminderState, setDashReminderState] = useState('idle');
  const [dashReminderSentCount, setDashReminderSentCount] = useState(0);
  const [newNotice, setNewNotice] = useState({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '', pollEnabled: false, pollOptions: ['', ''] });
  // New document upload form state. `file` holds a browser File object
  // picked via <input type="file">; the rest are plain text inputs.
  // Shape matches what uploadDocument() expects.
  const [newDoc, setNewDoc] = useState({ file: null, title: '', docType: 'SOPs', department: 'General', version: '1.0', reviewDate: '', isRequired: false, pageCount: '' });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  // Replace-document modal state. `replaceDocState` holds the in-flight form
  // (new file + bumped version + optional notes); `showReplaceDoc` is the
  // visibility flag so the modal can mount/unmount cleanly and `replacingDoc`
  // drives the button disabled/label while the upload is running. The modal
  // always acts on `selectedDoc`, which is the document currently being
  // viewed in DocDetail — there's no independent "pick a doc to replace"
  // affordance, so we can tie its lifecycle to the detail view.
  const [showReplaceDoc, setShowReplaceDoc] = useState(false);
  const [replaceDocState, setReplaceDocState] = useState({ file: null, version: '', versionNotes: '', pageCount: '' });
  const [replacingDoc, setReplacingDoc] = useState(false);
  // Toast shown when a new notice arrives while the user is looking at a
  // different tab. Shape: { id, title, priority } | null. Auto-clears after
  // a few seconds or when the user clicks through to the notice.
  const [noticeToast, setNoticeToast] = useState(null);
  // Export report modal state.
  const [showExportReport, setShowExportReport] = useState(false);
  const [exportType, setExportType] = useState('compliance_pdf');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  // Push notification state: tracks whether the user has subscribed to
  // Web Push so we can show an opt-in banner to those who haven't yet.
  const [pushState, setPushState] = useState('loading'); // loading | subscribed | prompt | denied | unsupported
  const [pushDismissed, setPushDismissed] = useState(false);

  // ── Training system state ──
  const [trainingModules, setTrainingModules] = useState([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  // 'dashboard' | 'module' | 'quiz' | 'results' | 'builder' | 'adminResults'
  const [trainingView, setTrainingView] = useState('dashboard');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCurrent, setQuizCurrent] = useState(0);
  const [quizResults, setQuizResults] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizTimerLeft, setQuizTimerLeft] = useState(null);
  const [adminTrainingResults, setAdminTrainingResults] = useState(null);
  const [adminTrainDeptFilter, setAdminTrainDeptFilter] = useState('All');
  const [showModuleBuilder, setShowModuleBuilder] = useState(false);
  const [moduleBuilderData, setModuleBuilderData] = useState({
    title: '', description: '', content: [], passMark: 80, timeLimitMinutes: '',
    randomiseQuestions: false, isPublished: false,
    questions: [], assignTo: 'none', assignDept: 'All', assignIds: [], deadline: '',
  });
  const [moduleBuilderSaving, setModuleBuilderSaving] = useState(false);
  const [trainingReminderState, setTrainingReminderState] = useState('idle');

  // Derived from the authenticated session via fetchCurrentCrewMember in
  // app/app/page.js. Falls back to an empty object so destructuring stays
  // safe during the initial paint (the page gate never actually renders
  // CrewBoard without a user, but belt-and-braces).
  const currentUser = user || { id: null, name: '', role: '', dept: '', avatar: '', isAdmin: false, vesselId: null };

  // Desktop breakpoint: only admin role gets the wide layout. Crew always
  // stays in the 480px mobile shell regardless of screen size.
  const mqDesktop = useMediaQuery('(min-width: 768px)');
  const isDesktop = role === 'admin' && mqDesktop;

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

  // Keep detail-view snapshots in sync with the canonical notices array so
  // poll votes, read receipts, etc. update in real-time while the user is
  // looking at a notice detail view.
  useEffect(() => {
    if (selectedNotice) {
      const fresh = notices.find(n => n.id === selectedNotice.id);
      if (fresh && fresh !== selectedNotice) setSelectedNotice(fresh);
    }
    if (adminNoticeView) {
      const fresh = notices.find(n => n.id === adminNoticeView.id);
      if (fresh && fresh !== adminNoticeView) setAdminNoticeView(fresh);
    }
  }, [notices]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Training data fetch ──
  useEffect(() => {
    if (!currentUser.id || !currentUser.vesselId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/training/modules?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}`);
        const data = await res.json();
        if (!cancelled) setTrainingModules(data.modules || []);
      } catch (err) {
        console.error('[training] fetch failed', err);
      } finally {
        if (!cancelled) setTrainingLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id, currentUser.vesselId, role]);

  // Check whether the user has subscribed to push notifications. We run
  // this once on mount so the opt-in banner can decide whether to show.
  useEffect(() => {
    if (!currentUser.id) return;
    if (!isPushSupported()) { setPushState('unsupported'); return; }
    const perm = getPushPermission();
    if (perm === 'denied') { setPushState('denied'); return; }
    checkPushSubscribed().then(sub => {
      setPushState(sub ? 'subscribed' : 'prompt');
    });
  }, [currentUser.id]);

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
    onPollVoteChange: (payload) => {
      const row = payload.new || payload.old;
      if (!row) return;
      setNotices(prev => prev.map(n => {
        if (n.id !== row.notice_id) return n;
        if (payload.eventType === 'DELETE') {
          return { ...n, pollVotes: (n.pollVotes || []).filter(v => v.crewMemberId !== row.crew_member_id) };
        }
        // INSERT or UPDATE — upsert the vote
        const existing = (n.pollVotes || []).filter(v => v.crewMemberId !== row.crew_member_id);
        return { ...n, pollVotes: [...existing, { crewMemberId: row.crew_member_id, optionId: row.option_id }] };
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

  const handlePollVote = async (noticeId, optionId) => {
    // Optimistic update — upsert vote in local state
    setNotices(prev => prev.map(n => {
      if (n.id !== noticeId) return n;
      const filtered = (n.pollVotes || []).filter(v => v.crewMemberId !== currentUser.id);
      return { ...n, pollVotes: [...filtered, { crewMemberId: currentUser.id, optionId }] };
    }));
    // Also mark as read if not already
    if (!notices.find(n => n.id === noticeId)?.readBy.includes(currentUser.id)) {
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
      markNoticeRead({ noticeId, crewMemberId: currentUser.id }).catch(() => {});
    }
    try {
      await castPollVote({ noticeId, crewMemberId: currentUser.id, optionId });
    } catch (err) {
      console.error('pollVote failed, reverting', err);
      setNotices(prev => prev.map(n => {
        if (n.id !== noticeId) return n;
        return { ...n, pollVotes: (n.pollVotes || []).filter(v => v.crewMemberId !== currentUser.id) };
      }));
    }
  };

  const toggleQuickAccess = (docId) => {
    setQuickAccessIds(prev => {
      const next = prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId];
      try { localStorage.setItem(`crewboard_quickaccess_${currentUser.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
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
      // Documents aren't on the realtime channel yet (only notices +
      // notifications + notice_reads are), so if an admin replaced a doc
      // while the crew was idle our local `docs` state could have stale
      // version metadata and a stale acknowledgedBy array. Refetch the
      // whole library from Supabase before navigating so the DocDetail
      // view shows the new version + empty acks (= the re-acknowledge
      // button) instead of a ghost v1.0 from cache.
      //
      // We still navigate to the last-known row first (for instant
      // feedback), then swap in the fresh row once the fetch lands —
      // gives us best of both worlds.
      const stale = findItem(docs);
      if (stale) {
        navigateToDocument(stale);
      } else {
        setSelectedNotice(null);
        setAdminNoticeView(null);
        setSelectedDoc(null);
        setTab('docs');
      }
      (async () => {
        try {
          const fresh = await fetchDocuments();
          setDocs(fresh);
          // Re-resolve the target from the freshly fetched list and
          // replace the in-view doc so version / acks / file_url all
          // reflect the latest state.
          const freshDoc = (() => {
            if (notification.ref) {
              const byRef = fresh.find(i => i.id === notification.ref);
              if (byRef) return byRef;
            }
            const body = (notification.body || '').toLowerCase();
            const title = (notification.title || '').toLowerCase();
            return (
              fresh.find(i => i.title && body.includes(i.title.toLowerCase())) ||
              fresh.find(i => i.title && title.includes(i.title.toLowerCase())) ||
              null
            );
          })();
          if (freshDoc) {
            setSelectedDoc(freshDoc);
          }
        } catch (err) {
          console.error('[notification] document refetch failed', err);
        }
      })();
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
      // Build poll options array if the admin enabled a poll and provided
      // at least 2 non-empty options. Each gets a short unique id.
      let pollOpts = null;
      if (newNotice.pollEnabled && newNotice.category === 'Social') {
        const validOpts = newNotice.pollOptions.filter(o => o.trim());
        if (validOpts.length >= 2) {
          pollOpts = validOpts.map((text, i) => ({
            id: `opt_${i}_${Date.now()}`,
            text: text.trim(),
          }));
        }
      }
      const posted = await createNotice({
        ...newNotice,
        validUntil: validUntilIso,
        createdBy: currentUser.id,
        pollOptions: pollOpts,
      });
      setNotices(prev => [posted, ...prev]);
      setNewNotice({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '', pollEnabled: false, pollOptions: ['', ''] });
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

  // Admin-only: sends a targeted 'reminder' notification to every crew
  // member who hasn't read the given notice. Delivers via three channels:
  //   1. In-app notification (Supabase insert, immediate)
  //   2. Email via Resend (API route, best-effort)
  //   3. Push notification via Web Push (API route, best-effort)
  // Email+push are fire-and-forget — a failure there doesn't block the
  // in-app notification or surface an error to the admin.
  const handleSendNoticeReminder = async (notice) => {
    const nonReaders = liveCrew.filter(cm => !notice.readBy.includes(cm.id));
    if (nonReaders.length === 0) return;
    const reminderTitle = `Reminder: ${notice.priority === 'critical' ? 'CRITICAL — ' : ''}Please read "${notice.title}"`;
    const reminderBody = `You have an unread ${notice.priority} notice that requires your attention.`;

    // 1. In-app notifications (primary channel)
    const results = await Promise.allSettled(
      nonReaders.map(cm =>
        createTargetedNotification({
          targetCrewId: cm.id,
          type: 'reminder',
          title: reminderTitle,
          body: reminderBody,
          referenceType: 'notice',
          referenceId: notice.id,
        })
      )
    );
    const sent = results.filter(r => r.status === 'fulfilled').length;
    if (sent === 0) throw new Error('All reminder sends failed — check your connection.');

    // 2. Email + Push (supplementary, fire-and-forget)
    sendReminderChannels({
      crewMemberIds: nonReaders.map(cm => cm.id),
      title: reminderTitle,
      body: reminderBody,
      refType: 'notice',
      refId: notice.id,
    }).catch(err => console.error('[reminder] email+push failed (non-fatal)', err));

    recordActivity({
      action: 'reminder_sent',
      targetType: 'notice',
      targetId: notice.id,
      metadata: { title: notice.title, recipientCount: sent },
    });
  };

  // Admin-only: sends a compliance reminder to every crew member who has
  // outstanding items — unread critical notices and/or unacknowledged
  // required documents. Each crew member gets a single summary notification
  // listing what they need to action, plus email + push. Skips crew who
  // are fully caught up.
  const handleSendDashboardReminder = async () => {
    const targetData = []; // { cm, title, body }
    for (const cm of liveCrew) {
      const unreadCritical = notices.filter(n => n.priority === 'critical' && !n.readBy.includes(cm.id));
      const unackedDocs = docs.filter(d => d.required && !d.acknowledgedBy.includes(cm.id));
      if (unreadCritical.length === 0 && unackedDocs.length === 0) continue;
      const parts = [];
      if (unreadCritical.length > 0) parts.push(`${unreadCritical.length} unread critical notice${unreadCritical.length > 1 ? 's' : ''}`);
      if (unackedDocs.length > 0) parts.push(`${unackedDocs.length} document${unackedDocs.length > 1 ? 's' : ''} pending acknowledgement`);
      targetData.push({
        cm,
        body: `You have ${parts.join(' and ')} requiring your attention.`,
      });
    }
    if (targetData.length === 0) return { targeted: 0, sent: 0 };

    // 1. In-app notifications
    const results = await Promise.allSettled(
      targetData.map(({ cm, body }) =>
        createTargetedNotification({
          targetCrewId: cm.id,
          type: 'reminder',
          title: 'Compliance Reminder',
          body,
          referenceType: null,
          referenceId: null,
        })
      )
    );
    const sent = results.filter(r => r.status === 'fulfilled').length;

    // 2. Email + Push (fire-and-forget)
    sendReminderChannels({
      crewMemberIds: targetData.map(({ cm }) => cm.id),
      title: 'Compliance Reminder',
      body: 'You have outstanding notices or documents requiring your attention. Please open CrewBoard to review.',
      refType: null,
      refId: null,
    }).catch(err => console.error('[reminder] email+push failed (non-fatal)', err));

    if (sent > 0) {
      recordActivity({
        action: 'reminder_sent',
        targetType: 'compliance',
        targetId: null,
        metadata: { recipientCount: sent },
      });
    }
    return { targeted: targetData.length, sent };
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

  // Admin-only: delete a document (and its backing PDF in storage). Gated
  // behind a confirm() for the same reason as handleDeleteNotice — the
  // action is destructive and irreversible. On success we drop the row
  // from local state, clear the selectedDoc so we bounce out of the detail
  // view, and write an activity entry. The helper itself handles the
  // storage cleanup (best-effort — a leaked blob is better than a
  // half-committed delete).
  const handleDeleteDoc = async (docId) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    const confirmed = window.confirm(
      `Delete "${doc.title}"? This cannot be undone and will remove the document for everyone on board.`
    );
    if (!confirmed) return;
    try {
      await deleteDocument({ documentId: docId, fileUrl: doc.fileUrl });
      setDocs(prev => prev.filter(d => d.id !== docId));
      setSelectedDoc(curr => (curr && curr.id === docId ? null : curr));
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_DELETED,
        targetType: 'document',
        targetId: docId,
        metadata: { title: doc.title, version: doc.version },
      });
    } catch (err) {
      alert(`Failed to delete document: ${err?.message || err}`);
    }
  };

  // Admin-only: replace a document with a new version. The helper uploads
  // the new PDF, updates the documents row in place, removes the old file,
  // and wipes the document_acknowledgements rows so crew have to re-ack the
  // new version. We then splice the returned row into local state (with
  // empty acknowledgedBy since the wipe just ran) and broadcast a
  // notification so the bell badge lights up for everyone. Errors keep the
  // modal open so the admin can retry without re-filling the form.
  const handleReplaceDoc = async () => {
    if (!selectedDoc || !replaceDocState.file) return;
    setReplacingDoc(true);
    try {
      const replaced = await replaceDocument({
        documentId: selectedDoc.id,
        oldFileUrl: selectedDoc.fileUrl,
        file: replaceDocState.file,
        version: replaceDocState.version || selectedDoc.version,
        versionNotes: replaceDocState.versionNotes || null,
        pageCount: replaceDocState.pageCount ? Number(replaceDocState.pageCount) : null,
      });
      setDocs(prev => prev.map(d => (d.id === replaced.id ? replaced : d)));
      // Refresh the detail view so the version / metadata / iframe all
      // re-render against the new file URL.
      setSelectedDoc(replaced);
      setShowReplaceDoc(false);
      setReplaceDocState({ file: null, version: '', versionNotes: '', pageCount: '' });
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_REPLACED,
        targetType: 'document',
        targetId: replaced.id,
        metadata: { title: replaced.title, version: replaced.version },
      });
      try {
        // Include the admin's version notes in the body so the bell preview
        // already hints at what changed. Truncated to ~160 chars with an
        // ellipsis so a long release note doesn't balloon the notification
        // panel. Falls back to the plain "<title> — v<version>" line for
        // replaces where the admin skipped the notes field.
        const notes = (replaced.versionNotes || '').trim();
        const truncatedNotes = notes.length > 160 ? `${notes.slice(0, 157)}…` : notes;
        const body = notes
          ? `${replaced.title} — v${replaced.version}: ${truncatedNotes}`
          : `${replaced.title} — now v${replaced.version}`;
        const notif = await createBroadcastNotification({
          type: 'document',
          title: replaced.required ? 'Required document updated' : 'Document updated',
          body,
          referenceType: 'document',
          referenceId: replaced.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to replace document: ${err?.message || err}`);
    } finally {
      setReplacingDoc(false);
    }
  };

  const resetNav = () => {
    setSelectedNotice(null);
    setSelectedDoc(null);
    setAdminNoticeView(null);
    setSelectedCrewMember(null);
    setSelectedModule(null);
    setTrainingView('dashboard');
    setQuizResults(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizCurrent(0);
    setAdminTrainingResults(null);
  };

  // Training badge: count of pending (non-completed) assignments for crew
  const pendingTraining = role === 'crew'
    ? trainingModules.filter(m => m.status && m.status !== 'completed').length
    : 0;

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
    { id: 'training', label: 'Training', icon: Icons.training, badge: pendingTraining },
  ];

  const adminTabs = [
    { id: 'home', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'notices', label: 'Notices', icon: Icons.notices },
    { id: 'docs', label: 'Documents', icon: Icons.docs },
    { id: 'training', label: 'Training', icon: Icons.training },
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
      {/* Quick Access docs on crew home */}
      {quickAccessIds.length > 0 && (() => {
        const favDocs = quickAccessIds.map(id => docs.find(d => d.id === id)).filter(Boolean);
        if (favDocs.length === 0) return null;
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#f59e0b' }}>{Icons.starFilled}</span>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: 0 }}>Quick Access</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 24, WebkitOverflowScrolling: 'touch' }}>
              {favDocs.map(d => (
                <button key={d.id} onClick={() => { setSelectedDoc(d); setTab('docs'); }} className="cb-card" style={{
                  minWidth: 130, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.gold}30`,
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left', flexShrink: 0, boxShadow: T.shadow,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accentTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accentDark }}><Icon d={<><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>} size={14} /></div>
                    <span style={{ color: '#f59e0b' }}><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" size={12} fill="#f59e0b" /></span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>v{d.version}</div>
                </button>
              ))}
            </div>
          </>
        );
      })()}
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
    if (selectedNotice) return <NoticeDetail notice={selectedNotice} currentUser={currentUser} onBack={() => setSelectedNotice(null)} onAcknowledge={handleAcknowledge} onMarkRead={handleMarkRead} onPollVote={handlePollVote} />;
    const filtered = notices
      .filter(n => noticeFilter === 'All' || n.category === noticeFilter)
      .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const pinned = filtered.filter(n => n.pinned);
    const unpinned = filtered.filter(n => !n.pinned);
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Notices</h2>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textDim }}>{Icons.search}</div>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notices..." style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', boxShadow: T.shadow }} />
        </div>
        <FilterChips options={CATEGORIES} selected={noticeFilter} onChange={setNoticeFilter} />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} isPinned isDesktop={isDesktop} />)}
          {unpinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} isDesktop={isDesktop} />)}
          {noticesLoading && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>Loading notices…</p>}
          {noticesError && <p style={{ fontSize: 13, color: T.critical, textAlign: 'center', padding: 30 }}>Error loading notices: {noticesError}</p>}
          {!noticesLoading && !noticesError && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No notices found</p>}
        </div>
      </div>
    );
  };

  // ─── Documents Screen ──────────────────────────────────────────────
  const DocsScreen = () => {
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
          // Prime the form with the current version so the admin can bump it
          // without having to retype the whole string. `pageCount` starts
          // empty so we don't accidentally carry over the old page count
          // for a totally different file — admin has to re-enter if they
          // want to track it.
          setReplaceDocState({
            file: null,
            version: selectedDoc.version || '',
            versionNotes: '',
            pageCount: '',
          });
          setShowReplaceDoc(true);
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
                    {d.required && (isAcked ? <span style={{ color: T.success }}>{Icons.checkCircle}</span> : <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, background: `${T.gold}18`, padding: '4px 8px', borderRadius: 4 }}>ACK</span>)}
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

    const requiredDocs = docs.filter(d => d.required);

    // Per-crew compliance rows, computed once and shared between the
    // mobile card list and the desktop table.
    const crewRows = liveCrew.map(cm => {
      const read = notices.filter(n => n.readBy.includes(cm.id)).length;
      const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
      const total = notices.length + requiredDocs.length;
      const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
      return { cm, read, acked, total, score };
    });

    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 800, color: T.text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>M/Y Serenity — {liveCrew.length} crew on board</p>
        </div>
        {/* Stat cards: 2x2 mobile, 4-column desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: isDesktop ? 16 : 10, marginBottom: isDesktop ? 24 : 20 }}>
          <StatCard label="Active Notices" value={notices.length} icon={Icons.notices} />
          <StatCard label="Crew Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.crew} />
          <StatCard label="Critical Unack." value={criticalUnacked} color={T.critical} icon={Icons.alert} />
          <StatCard label="Doc. Pending Ack." value={docsUnacked} color={T.gold} icon={Icons.docs} />
        </div>
        {/* Compliance + Quick Actions: stacked mobile, side-by-side desktop */}
        <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: isDesktop ? '1fr 1fr' : undefined, gap: isDesktop ? 20 : undefined, marginBottom: isDesktop ? 28 : 20 }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, marginBottom: isDesktop ? 0 : 20, boxShadow: T.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Overall Compliance</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: overallCompliance > 70 ? T.success : T.gold, fontFamily: "'JetBrains Mono', monospace" }}>{overallCompliance}%</span>
            </div>
            <ComplianceBar value={overallCompliance} />
            <p style={{ fontSize: 11, color: T.textMuted, margin: '8px 0 0' }}>Based on notice reads and document acknowledgements across all crew</p>
          </div>
          <div>
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Quick Actions</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['New Notice', () => setShowNewNotice(true)],
                ['Upload Doc', () => setShowNewDoc(true)],
                [dashReminderState === 'sending' ? 'Sending...' :
                 dashReminderState === 'sent' ? `Sent to ${dashReminderSentCount} crew` :
                 dashReminderState === 'empty' ? 'All crew compliant!' :
                 dashReminderState === 'error' ? 'Failed — try again' :
                 'Send Reminder',
                 async () => {
                   if (dashReminderState !== 'idle') return;
                   setDashReminderState('sending');
                   try {
                     const { targeted, sent } = await handleSendDashboardReminder();
                     if (targeted === 0) {
                       setDashReminderState('empty');
                     } else if (sent === 0) {
                       setDashReminderState('error');
                     } else {
                       setDashReminderSentCount(sent);
                       setDashReminderState('sent');
                     }
                   } catch (err) {
                     console.error('[dashboard] reminder failed', err);
                     setDashReminderState('error');
                   }
                   setTimeout(() => { setDashReminderState('idle'); setDashReminderSentCount(0); }, 3000);
                 }],
                ['Invite Crew', () => { window.location.href = '/admin/invites'; }],
                ['Export Report', () => setShowExportReport(true)],
              ].map(([label, fn]) => {
                const isReminder = label.startsWith('Send') || label.startsWith('Sent') || label === 'Sending...' || label.startsWith('All crew') || label.startsWith('Failed');
                const reminderDone = isReminder && (dashReminderState === 'sent' || dashReminderState === 'empty');
                const reminderError = isReminder && dashReminderState === 'error';
                return (
                  <button key={isReminder ? 'reminder' : label} onClick={fn} className="cb-btn-secondary" style={{
                    flex: '1 1 140px', padding: '14px 10px', borderRadius: 12,
                    border: `1px solid ${reminderError ? T.critical : reminderDone ? T.success : T.border}`,
                    background: reminderError ? T.criticalTint : reminderDone ? '#f0fdf4' : T.bgCard,
                    color: reminderError ? T.critical : reminderDone ? T.success : T.accentDark,
                    fontSize: 12, fontWeight: 700,
                    cursor: (isReminder && dashReminderState !== 'idle') ? 'default' : 'pointer',
                    opacity: (isReminder && dashReminderState === 'sending') ? 0.7 : 1,
                    boxShadow: T.shadow, transition: 'all 0.2s',
                  }}>{label}</button>
                );
              })}
            </div>
          </div>
        </div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Crew Compliance</h3>
        {/* Desktop: proper table. Mobile: stacked cards. */}
        {isDesktop ? (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                  {['Name', 'Role', 'Department', 'Notices Read', 'Docs Ack.', 'Compliance'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crewRows.map(({ cm, read, acked, score }) => (
                  <tr key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-table-row" style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={cm.avatar} online={cm.online} size={32} />
                        <span style={{ fontWeight: 700, color: T.text }}>{cm.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.role}</td>
                    <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.dept}</td>
                    <td style={{ padding: '14px 16px', color: T.accent, fontWeight: 600 }}>{read}/{notices.length}</td>
                    <td style={{ padding: '14px 16px', color: T.gold, fontWeight: 600 }}>{acked}/{requiredDocs.length}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}><ComplianceBar value={score} /></div>
                        <span style={{ fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, minWidth: 36, textAlign: 'right' }}>{score}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          crewRows.map(({ cm, score }) => (
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
          ))
        )}
      </div>
    );
  };

  // ─── Crew Management ───────────────────────────────────────────────
  const CrewManagement = () => {
    if (selectedCrewMember) {
      const cm = liveCrew.find(c => c.id === selectedCrewMember.id) || selectedCrewMember;
      const noticeCol = (
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Notice Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
        </div>
      );
      const docCol = (
        <div>
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
      return (
        <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
          <BackButton onClick={() => setSelectedCrewMember(null)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar initials={cm.avatar} online={cm.online} size={56} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{cm.name}</h2>
              <p style={{ fontSize: 13, color: T.textMuted, margin: '2px 0 0' }}>{cm.role} — {cm.dept}</p>
            </div>
          </div>
          {/* Desktop: notice + doc columns side by side. Mobile: stacked. */}
          {isDesktop ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              {noticeCol}
              {docCol}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>{noticeCol}</div>
              {docCol}
            </>
          )}
        </div>
      );
    }

    // Crew roster
    const requiredDocs = docs.filter(d => d.required);
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Crew Management</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: isDesktop ? 320 : undefined }}>
          <StatCard label="On Board" value={liveCrew.length} icon={Icons.crew} />
          <StatCard label="Online" value={liveCrew.filter(c => c.online).length} color={T.success} icon={Icons.checkCircle} />
        </div>
        {/* Desktop: table. Mobile: cards. */}
        {isDesktop ? (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadow }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                  {['Name', 'Role', 'Department', 'Status', 'Compliance'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveCrew.map(cm => {
                  const read = notices.filter(n => n.readBy.includes(cm.id)).length;
                  const acked = docs.filter(d => d.required && d.acknowledgedBy.includes(cm.id)).length;
                  const total = notices.length + requiredDocs.length;
                  const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
                  return (
                    <tr key={cm.id} onClick={() => setSelectedCrewMember(cm)} style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar initials={cm.avatar} online={cm.online} size={32} />
                          <span style={{ fontWeight: 700, color: T.text }}>{cm.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.role}</td>
                      <td style={{ padding: '14px 16px', color: T.textMuted }}>{cm.dept}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cm.online ? T.success : T.textDim, background: cm.online ? T.successTint : '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                          {cm.online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1 }}><ComplianceBar value={score} /></div>
                          <span style={{ fontWeight: 800, color: score > 70 ? T.success : score > 40 ? T.gold : T.critical, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, minWidth: 36, textAlign: 'right' }}>{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          liveCrew.map(cm => (
            <button key={cm.id} onClick={() => setSelectedCrewMember(cm)} className="cb-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, width: '100%', cursor: 'pointer', textAlign: 'left', marginBottom: 10, boxShadow: T.shadow }}>
              <Avatar initials={cm.avatar} online={cm.online} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{cm.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{cm.role} — {cm.dept}</div>
              </div>
              <span style={{ color: T.textDim, fontSize: 18 }}>&rsaquo;</span>
            </button>
          ))
        )}
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
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Activity Log</h2>
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

  // Admin PDF replace modal. Triggered from DocDetail's "Replace with new
  // version" button, always acts on `selectedDoc`. Mirrors NewDocumentModal
  // but locks the title/type/department (those shouldn't change across
  // versions — if they do, delete + re-upload instead), and puts version
  // bumping front-and-centre. Like the other modals, it's a factory called
  // as a function rather than rendered as JSX to avoid the inline-component
  // remount trap (see the renderScreen comment for the full explanation).
  const ReplaceDocumentModal = () => {
    if (!selectedDoc) return null;
    const canSubmit = !!replaceDocState.file && !replacingDoc;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ background: T.bgModal, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 -20px 40px rgba(15,23,42,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Replace Document</h2>
            <button onClick={() => setShowReplaceDoc(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.accentTint, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Replacing</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{selectedDoc.title}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Currently v{selectedDoc.version} — {selectedDoc.type} / {selectedDoc.dept}</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>New PDF file</label>
              <label htmlFor="cb-replace-doc-file" style={{ display: 'block', padding: 16, borderRadius: 10, border: `2px dashed ${replaceDocState.file ? T.accent : T.border}`, background: replaceDocState.file ? T.accentTint : T.bgCard, color: replaceDocState.file ? T.accentDark : T.textMuted, fontSize: 13, textAlign: 'center', cursor: 'pointer', fontWeight: 600 }}>
                {replaceDocState.file
                  ? `${replaceDocState.file.name} (${Math.round((replaceDocState.file.size / 1024 / 1024) * 10) / 10} MB)`
                  : 'Click to choose a PDF (max 50 MB)'}
              </label>
              <input
                id="cb-replace-doc-file"
                type="file"
                accept="application/pdf"
                onChange={e => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setReplaceDocState(p => ({ ...p, file }));
                }}
                style={{ display: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>New version</label>
                <input value={replaceDocState.version} onChange={e => setReplaceDocState(p => ({ ...p, version: e.target.value }))} placeholder="e.g. 1.1" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Pages</label>
                <input type="number" min="1" value={replaceDocState.pageCount} onChange={e => setReplaceDocState(p => ({ ...p, pageCount: e.target.value }))} placeholder="—" style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>Version notes (optional)</label>
              <textarea value={replaceDocState.versionNotes} onChange={e => setReplaceDocState(p => ({ ...p, versionNotes: e.target.value }))} placeholder="What changed in this version?" rows={3} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, padding: '10px 12px', background: T.goldTint, border: `1px solid ${T.gold}40`, borderRadius: 10, lineHeight: 1.5 }}>
              Replacing will wipe all existing acknowledgements for this document — crew will need to re-acknowledge the new version.
            </div>
            <button onClick={handleReplaceDoc} disabled={!canSubmit} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: canSubmit ? T.accent : T.border, color: canSubmit ? '#fff' : T.textDim, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default', transition: 'background 0.2s' }}>
              {replacingDoc ? 'Uploading new version…' : 'Replace Document'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Admin export handler — generates the selected report client-side
  // using data already in state. No API round-trip needed; the API
  // route exists for programmatic / automated access.
  const handleExport = async () => {
    setExporting(true);
    const dateRange = { from: exportDateFrom || undefined, to: exportDateTo || undefined };
    const reportData = { crew: liveCrew, notices, docs, activity, dateRange };
    try {
      // Dynamic import keeps jspdf out of the main bundle (~140 kB).
      const { generateComplianceReport, generateCSVExport, downloadPDF, downloadCSV } = await import('@/lib/reportGenerator');
      const csvMap = {
        notice_csv: { key: 'notice_read_receipts', filename: 'notice-read-receipts' },
        document_csv: { key: 'document_acknowledgements', filename: 'document-acknowledgements' },
        training_csv: { key: 'training_records', filename: 'training-records' },
        activity_csv: { key: 'activity_log', filename: 'activity-log' },
      };
      if (exportType === 'compliance_pdf') {
        const doc = generateComplianceReport({ vesselName: 'M/Y Serenity', ...reportData });
        downloadPDF(doc, `compliance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      } else if (csvMap[exportType]) {
        const { key, filename } = csvMap[exportType];
        const csv = generateCSVExport(key, reportData);
        downloadCSV(csv, `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error('[export] generation failed', err);
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setExporting(false);
    }
  };

  const ExportReportModal = () => {
    const reportTypes = [
      { value: 'compliance_pdf', label: 'Full Compliance Report (PDF)', desc: 'Crew roster, notice & document compliance, individual summaries, activity log' },
      { value: 'notice_csv', label: 'Notice Read Receipts (CSV)', desc: 'All notices with read/acknowledged status per crew member' },
      { value: 'document_csv', label: 'Document Acknowledgements (CSV)', desc: 'All documents with acknowledgement status per crew member' },
      { value: 'training_csv', label: 'Training Records (CSV)', desc: 'Training module completion and scores' },
      { value: 'activity_csv', label: 'Activity Log (CSV)', desc: 'Timestamped log of all crew actions' },
    ];
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: isDesktop ? 'center' : 'flex-end', justifyContent: 'center' }}>
        <div style={{ background: T.bgModal, borderRadius: isDesktop ? 20 : '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: isDesktop ? '0 20px 60px rgba(15,23,42,0.2)' : '0 -20px 40px rgba(15,23,42,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Export Report</h2>
            <button onClick={() => setShowExportReport(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Report type selector */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 8 }}>Report Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reportTypes.map(rt => (
                  <label key={rt.value} onClick={() => setExportType(rt.value)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1.5px solid ${exportType === rt.value ? T.accent : T.border}`,
                    background: exportType === rt.value ? T.accentTint : T.bgCard,
                  }}>
                    <input type="radio" name="reportType" value={rt.value} checked={exportType === rt.value} onChange={() => setExportType(rt.value)} style={{ accentColor: T.accent, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{rt.label}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{rt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {/* Date range picker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>From (optional)</label>
                <input
                  type="date"
                  value={exportDateFrom}
                  onChange={e => setExportDateFrom(e.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 }}>To (optional)</label>
                <input
                  type="date"
                  value={exportDateTo}
                  onChange={e => setExportDateTo(e.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: -8 }}>Leave blank to include all data.</div>
            {/* Generate button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="cb-btn-primary"
              style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: exporting ? T.border : T.accent, color: exporting ? T.textDim : '#fff', fontSize: 15, fontWeight: 700, cursor: exporting ? 'default' : 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {exporting ? 'Generating...' : `Generate ${exportType.endsWith('pdf') ? 'PDF' : 'CSV'}`}
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

  // ─── Training: helpers ────────────────────────────────────────────
  const refreshTraining = async () => {
    try {
      const res = await fetch(`/api/training/modules?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}`);
      const data = await res.json();
      setTrainingModules(data.modules || []);
    } catch (err) { console.error('[training] refresh failed', err); }
  };

  const handleStartQuiz = async (mod) => {
    try {
      const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}/quiz?crew_member_id=${currentUser.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.quiz.questions || []);
      setQuizAnswers({});
      setQuizCurrent(0);
      setQuizResults(null);
      setQuizSubmitting(false);
      setQuizTimerLeft(data.quiz.timeLimitMinutes ? data.quiz.timeLimitMinutes * 60 : null);
      setTrainingView('quiz');
    } catch (err) { console.error('[quiz] start failed', err); alert('Failed to load quiz: ' + err.message); }
  };

  const handleSubmitQuiz = async (mod) => {
    if (quizSubmitting) return;
    setQuizSubmitting(true);
    try {
      const answersArr = quizQuestions.map(q => ({
        question_id: q.id,
        selected_option_id: quizAnswers[q.id] || null,
      }));
      const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: currentUser.id, answers: answersArr }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizResults(data.result);
      setTrainingView('results');
      refreshTraining();
    } catch (err) {
      console.error('[quiz] submit failed', err);
      alert('Failed to submit quiz: ' + err.message);
    } finally { setQuizSubmitting(false); }
  };

  const handleSaveModule = async () => {
    if (moduleBuilderSaving) return;
    setModuleBuilderSaving(true);
    const b = moduleBuilderData;
    try {
      const modulePayload = {
        crew_member_id: currentUser.id,
        vessel_id: currentUser.vesselId,
        title: b.title,
        description: b.description,
        content: b.content,
        pass_mark: b.passMark,
        time_limit_minutes: b.timeLimitMinutes ? parseInt(b.timeLimitMinutes) : null,
        randomise_questions: b.randomiseQuestions,
        is_published: b.isPublished,
        questions: b.questions.map((q, i) => ({
          question_text: q.questionText,
          question_type: q.questionType,
          options: q.options,
          explanation: q.explanation || null,
          sort_order: i,
        })),
      };
      const res = await fetch('/api/training/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modulePayload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Assign if selected
      if (b.assignTo !== 'none' && b.isPublished) {
        let assignIds = b.assignTo === 'all' ? 'all'
          : b.assignTo === 'department' ? `department:${b.assignDept}`
          : b.assignIds;
        await fetch(`/api/training/modules/${data.module.id}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crew_member_id: currentUser.id, crew_member_ids: assignIds, deadline: b.deadline || null }),
        });
      }
      setShowModuleBuilder(false);
      setModuleBuilderData({ title: '', description: '', content: [], passMark: 80, timeLimitMinutes: '', randomiseQuestions: false, isPublished: false, questions: [], assignTo: 'none', assignDept: 'All', assignIds: [], deadline: '' });
      refreshTraining();
    } catch (err) {
      console.error('[module-builder] save failed', err);
      alert('Failed to save module: ' + err.message);
    } finally { setModuleBuilderSaving(false); }
  };

  const handleLoadAdminModuleResults = async (mod) => {
    setSelectedModule(mod);
    setTrainingView('adminResults');
    try {
      const res = await fetch(`/api/training/modules/${mod.id}?crew_member_id=${currentUser.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdminTrainingResults(data.module);
    } catch (err) {
      console.error('[admin-training] load results failed', err);
      setAdminTrainingResults(null);
    }
  };

  const handleSendTrainingReminder = async (mod, crewIds) => {
    try {
      await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewMemberIds: crewIds,
          vesselId: currentUser.vesselId,
          title: 'Training Reminder',
          body: `Please complete the training module "${mod.title || mod.moduleTitle}".`,
          refType: 'training_module',
          refId: mod.id || mod.moduleId,
        }),
      });
      // Create in-app notifications too
      for (const cid of crewIds) {
        createTargetedNotification({
          targetCrewId: cid,
          type: 'system',
          title: 'Training Reminder',
          body: `Please complete "${mod.title || mod.moduleTitle}".`,
          referenceType: 'training_module',
          referenceId: mod.id || mod.moduleId,
        }).catch(() => {});
      }
    } catch (err) { console.error('[training] reminder failed', err); }
  };

  // ─── Quiz Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (quizTimerLeft === null || trainingView !== 'quiz') return;
    if (quizTimerLeft <= 0) {
      handleSubmitQuiz(selectedModule);
      return;
    }
    const t = setTimeout(() => setQuizTimerLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [quizTimerLeft, trainingView]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Crew Training Screen ────────────────────────────────────────
  const CrewTrainingScreen = () => {
    // ── Module Viewer ──
    if (trainingView === 'module' && selectedModule) {
      const mod = selectedModule;
      const hasFailed = mod.totalAttempts > 0 && !mod.passed;
      return (
        <div style={{ padding: 20 }}>
          <BackButton onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); }} label="Training" />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.3 }}>{mod.title || mod.moduleTitle}</h2>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>{mod.description || mod.moduleDescription}</p>
          {/* Content blocks */}
          {(mod.content || []).map((block, i) => {
            if (block.type === 'text') return (
              <div key={i} style={{ fontSize: 14, color: T.text, lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{block.value}</div>
            );
            if (block.type === 'image') return (
              <div key={i} style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <img src={block.value} alt={block.caption || 'Training image'} style={{ width: '100%', display: 'block' }} />
                {block.caption && <div style={{ fontSize: 12, color: T.textMuted, padding: '10px 14px', background: T.bg }}>{block.caption}</div>}
              </div>
            );
            if (block.type === 'video') return (
              <div key={i} style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg, padding: 40, textAlign: 'center' }}>
                <div style={{ color: T.accent, marginBottom: 8 }}>{Icons.video}</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>{block.value || 'Video content'}</div>
              </div>
            );
            return null;
          })}
          {/* Attachments */}
          {(mod.attachments || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Attachments</h3>
              {mod.attachments.map((att, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 6, boxShadow: T.shadow }}>
                  {Icons.file}
                  <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{att.name || att.url || `Attachment ${i + 1}`}</span>
                </div>
              ))}
            </div>
          )}
          {/* Quiz button */}
          {(mod.questionCount || 0) > 0 && (
            <button onClick={() => handleStartQuiz(mod)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {Icons.play} {hasFailed ? 'Retake Quiz' : 'Start Quiz'}
            </button>
          )}
          {mod.passed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14, marginTop: 8 }}>
              {Icons.checkCircle} Completed — Score: {mod.bestScore}%
            </div>
          )}
        </div>
      );
    }

    // ── Quiz Screen ──
    if (trainingView === 'quiz' && quizQuestions.length > 0) {
      const q = quizQuestions[quizCurrent];
      const progress = ((quizCurrent + 1) / quizQuestions.length) * 100;
      const isLast = quizCurrent === quizQuestions.length - 1;
      const hasAnswer = !!quizAnswers[q.id];
      const timerMins = quizTimerLeft !== null ? Math.floor(quizTimerLeft / 60) : null;
      const timerSecs = quizTimerLeft !== null ? quizTimerLeft % 60 : null;
      return (
        <div style={{ padding: 20 }}>
          {/* Header with counter and optional timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>Question {quizCurrent + 1} of {quizQuestions.length}</span>
            {quizTimerLeft !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: quizTimerLeft < 60 ? T.critical : T.text, fontFamily: "'JetBrains Mono', monospace" }}>
                {Icons.clock} {timerMins}:{String(timerSecs).padStart(2, '0')}
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: T.accent, borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
          {/* Question */}
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: '0 0 20px', lineHeight: 1.4 }}>{q.questionText}</h3>
          {/* Answer options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {(q.options || []).map(opt => {
              const selected = quizAnswers[q.id] === opt.id;
              return (
                <button key={opt.id} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))} className="cb-card" style={{
                  width: '100%', padding: '16px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${selected ? T.accent : T.border}`,
                  background: selected ? T.accentTint : T.bgCard,
                  color: T.text, fontSize: 15, fontWeight: selected ? 700 : 500,
                  transition: 'all 0.15s', boxShadow: selected ? `0 0 0 3px ${T.accentGlow}` : T.shadow,
                }}>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10 }}>
            {quizCurrent > 0 && (
              <button onClick={() => setQuizCurrent(prev => prev - 1)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Previous
              </button>
            )}
            {isLast ? (
              <button onClick={() => handleSubmitQuiz(selectedModule)} disabled={!hasAnswer || quizSubmitting} className="cb-btn-primary" style={{
                flex: 1, padding: 14, borderRadius: 12, border: 'none',
                background: !hasAnswer || quizSubmitting ? T.border : T.accent,
                color: !hasAnswer || quizSubmitting ? T.textDim : '#fff',
                fontSize: 14, fontWeight: 700, cursor: !hasAnswer || quizSubmitting ? 'default' : 'pointer',
              }}>
                {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button onClick={() => setQuizCurrent(prev => prev + 1)} disabled={!hasAnswer} style={{
                flex: 1, padding: 14, borderRadius: 12, border: 'none',
                background: hasAnswer ? T.accent : T.border,
                color: hasAnswer ? '#fff' : T.textDim,
                fontSize: 14, fontWeight: 700, cursor: hasAnswer ? 'pointer' : 'default',
              }}>
                Next Question
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── Results Screen ──
    if (trainingView === 'results' && quizResults) {
      const r = quizResults;
      const passed = r.passed;
      return (
        <div style={{ padding: 20 }}>
          {/* Score */}
          <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
              background: passed ? T.successTint : T.criticalTint,
              border: `4px solid ${passed ? T.success : T.critical}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, color: passed ? T.success : T.critical,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {r.score}%
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>
              {passed ? 'You passed!' : 'Not quite \u2014 try again'}
            </h2>
            <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
              {r.correctCount} of {r.totalQuestions} correct \u00b7 Pass mark: {r.passMark}%
            </p>
          </div>
          {/* Answer breakdown */}
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Question Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {(r.answers || []).map((a, i) => (
              <div key={a.questionId || i} style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${a.isCorrect ? T.success : T.critical}30`, background: a.isCorrect ? '#f0fdf4' : '#fef2f2', boxShadow: T.shadow }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: a.isCorrect ? T.success : T.critical, flexShrink: 0, marginTop: 1 }}>
                    {a.isCorrect ? Icons.checkCircle : Icons.x}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>
                    {a.questionText || `Question ${i + 1}`}
                  </span>
                </div>
                {!a.isCorrect && a.correctOptionId && (
                  <div style={{ fontSize: 12, color: T.textMuted, marginLeft: 30, marginBottom: 4 }}>
                    Correct answer: {quizQuestions.find(q => q.id === a.questionId)?.options?.find(o => o.id === a.correctOptionId)?.text || a.correctOptionId}
                  </div>
                )}
                {a.explanation && (
                  <div style={{ fontSize: 12, color: T.textMuted, marginLeft: 30, fontStyle: 'italic', lineHeight: 1.4 }}>
                    {a.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!passed && (
              <button onClick={() => handleStartQuiz(selectedModule)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Retake Quiz
              </button>
            )}
            <button onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); setQuizResults(null); }} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Back to Training
            </button>
          </div>
        </div>
      );
    }

    // ── Training Dashboard ──
    const active = trainingModules.filter(m => m.status !== 'completed');
    const completed = trainingModules.filter(m => m.status === 'completed');
    const handleOpenModule = async (mod) => {
      try {
        const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}?crew_member_id=${currentUser.id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setSelectedModule({ ...mod, ...data.module });
        setTrainingView('module');
      } catch (err) {
        console.error('[training] module load failed', err);
        setSelectedModule(mod);
        setTrainingView('module');
      }
    };

    const statusColor = (s) => s === 'overdue' ? T.critical : s === 'in_progress' ? T.gold : T.accent;
    const statusBg = (s) => s === 'overdue' ? T.criticalTint : s === 'in_progress' ? T.goldTint : T.accentGlow;
    const statusLabel = (s) => s === 'overdue' ? 'Overdue' : s === 'in_progress' ? 'In Progress' : s === 'completed' ? 'Completed' : 'Assigned';

    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Training</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatCard label="Assigned" value={active.length} icon={Icons.training} />
          <StatCard label="Completed" value={completed.length} color={T.success} icon={Icons.award} />
        </div>
        {/* Active assignments */}
        {active.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Active</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {active.map(m => (
                <button key={m.id || m.assignmentId} onClick={() => handleOpenModule(m)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
                  <div style={{ width: 44, height: 50, borderRadius: 10, background: `${statusColor(m.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor(m.status), flexShrink: 0 }}>
                    {Icons.training}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>{m.title || m.moduleTitle}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: statusColor(m.status), background: statusBg(m.status), padding: '3px 8px', borderRadius: 6 }}>
                        {statusLabel(m.status)}
                      </span>
                      {m.deadline && (
                        <span style={{ fontSize: 11, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {Icons.calendar} {new Date(m.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      {m.questionCount > 0 && <span style={{ fontSize: 11, color: T.textDim }}>{m.questionCount} questions</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {/* Completed */}
        {completed.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Completed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.map(m => (
                <button key={m.id || m.assignmentId} onClick={() => handleOpenModule(m)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '16px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
                  <div style={{ width: 40, height: 44, borderRadius: 8, background: T.successTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success, flexShrink: 0 }}>
                    {Icons.award}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{m.title || m.moduleTitle}</div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: T.textMuted }}>
                      <span style={{ color: T.success, fontWeight: 700 }}>Score: {m.bestScore ?? '—'}%</span>
                      {m.completedAt && <span>{new Date(m.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                  </div>
                  <span style={{ color: T.success, flexShrink: 0 }}>{Icons.checkCircle}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {trainingLoading && trainingModules.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>Loading training modules...</p>}
        {!trainingLoading && trainingModules.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No training modules assigned yet</p>}
      </div>
    );
  };

  // ─── Admin Training Screen ─────────────────────────────────────────
  const AdminTrainingScreen = () => {
    // ── Module Results Dashboard ──
    if (trainingView === 'adminResults' && adminTrainingResults) {
      const r = adminTrainingResults;
      const deptFilteredAssignments = (r.assignments || []).filter(a => adminTrainDeptFilter === 'All' || a.department === adminTrainDeptFilter);
      const incompleteCrew = deptFilteredAssignments.filter(a => a.status !== 'completed');

      const sendReminder = async () => {
        if (trainingReminderState !== 'idle') return;
        const ids = incompleteCrew.map(a => a.crewMemberId);
        if (ids.length === 0) return;
        setTrainingReminderState('sending');
        try {
          await handleSendTrainingReminder(r, ids);
          setTrainingReminderState('sent');
          setTimeout(() => setTrainingReminderState('idle'), 3000);
        } catch { setTrainingReminderState('idle'); }
      };

      const departments = [...new Set((r.assignments || []).map(a => a.department).filter(Boolean))];

      return (
        <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
          <BackButton onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); setAdminTrainingResults(null); }} label="Training" />
          <h2 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{r.title}</h2>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: isDesktop ? 14 : 10, marginBottom: 20 }}>
            <StatCard label="Completion" value={`${r.stats?.completionRate ?? 0}%`} icon={Icons.checkCircle} color={T.success} />
            <StatCard label="Avg Score" value={r.stats?.averageScore != null ? `${r.stats.averageScore}%` : '—'} icon={Icons.award} color={T.accent} />
            <StatCard label="Pass Rate" value={r.stats?.passRate != null ? `${r.stats.passRate}%` : '—'} icon={Icons.training} color={T.gold} />
            <StatCard label="Assigned" value={r.stats?.totalAssigned ?? 0} icon={Icons.crew} />
          </div>
          {/* Department filter */}
          {departments.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <FilterChips options={['All', ...departments]} selected={adminTrainDeptFilter} onChange={setAdminTrainDeptFilter} />
            </div>
          )}
          {/* Per-crew results */}
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Crew Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {deptFilteredAssignments.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
                <Avatar initials={(a.crewName || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{a.crewName}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{a.role} — {a.department}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {a.bestScore != null && (
                    <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: a.passed ? T.success : T.critical }}>{a.bestScore}%</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '3px 8px', borderRadius: 6, color: a.status === 'completed' ? T.success : a.status === 'overdue' ? T.critical : a.status === 'in_progress' ? T.gold : T.accent, background: a.status === 'completed' ? T.successTint : a.status === 'overdue' ? T.criticalTint : a.status === 'in_progress' ? T.goldTint : T.accentGlow }}>
                    {a.status === 'in_progress' ? 'In Prog.' : a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Send reminder */}
          {incompleteCrew.length > 0 && (
            <button onClick={sendReminder} disabled={trainingReminderState !== 'idle'} style={{
              width: '100%', padding: 14, borderRadius: 12,
              border: `1px solid ${trainingReminderState === 'sent' ? T.success : T.gold}`,
              background: trainingReminderState === 'sent' ? '#f0fdf4' : T.goldTint,
              color: trainingReminderState === 'sent' ? T.success : '#b45309',
              fontSize: 14, fontWeight: 700,
              cursor: trainingReminderState === 'idle' ? 'pointer' : 'default',
              opacity: trainingReminderState === 'sending' ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {trainingReminderState === 'sending' ? 'Sending...' :
               trainingReminderState === 'sent' ? `${Icons.checkCircle} Reminder Sent` :
               `${Icons.send} Send Reminder to ${incompleteCrew.length} Crew`}
            </button>
          )}
        </div>
      );
    }

    // ── Admin Training Dashboard ──
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Manage Training</h2>
        {trainingModules.length === 0 && !trainingLoading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textMuted }}>
            <div style={{ color: T.accent, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{Icons.training}</div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No training modules yet</p>
            <p style={{ fontSize: 12, margin: 0 }}>Tap + to create your first module</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trainingModules.map(m => {
            const stats = m.stats || {};
            return (
              <button key={m.id} onClick={() => handleLoadAdminModuleResults(m)} className="cb-card" style={{ display: 'flex', gap: isDesktop ? 18 : 14, padding: isDesktop ? '18px 22px' : '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: isDesktop ? 14 : 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow, alignItems: isDesktop ? 'center' : 'stretch' }}>
                <div style={{ width: 44, height: 50, borderRadius: 10, background: m.isPublished ? T.accentTint : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.isPublished ? T.accentDark : T.textDim, flexShrink: 0 }}>
                  {Icons.training}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.title}</span>
                    {!m.isPublished && <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>DRAFT</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textMuted }}>
                    <span>{m.questionCount || 0} questions</span>
                    {stats.totalAssigned > 0 && (
                      <>
                        <span style={{ color: T.success }}>{stats.completed}/{stats.totalAssigned} completed</span>
                        {stats.completionRate !== undefined && <span>({stats.completionRate}%)</span>}
                      </>
                    )}
                    {stats.totalAssigned === 0 && <span>Not assigned</span>}
                  </div>
                  {stats.totalAssigned > 0 && (
                    <div style={{ marginTop: 8 }}><ComplianceBar value={stats.completionRate || 0} /></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Module Builder Modal ─────────────────────────────────────────
  const ModuleBuilderModal = () => {
    const b = moduleBuilderData;
    const setB = (key, val) => setModuleBuilderData(prev => ({ ...prev, [key]: val }));
    const addContentBlock = (type) => setB('content', [...b.content, { type, value: '', caption: '' }]);
    const updateContentBlock = (idx, field, val) => {
      const next = [...b.content];
      next[idx] = { ...next[idx], [field]: val };
      setB('content', next);
    };
    const removeContentBlock = (idx) => setB('content', b.content.filter((_, i) => i !== idx));
    const moveContentBlock = (idx, dir) => {
      const next = [...b.content];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      setB('content', next);
    };

    const addQuestion = () => setB('questions', [...b.questions, {
      questionText: '', questionType: 'multiple_choice', explanation: '',
      options: [{ id: `o_${Date.now()}_0`, text: '', is_correct: false }, { id: `o_${Date.now()}_1`, text: '', is_correct: false }],
    }]);
    const updateQuestion = (qi, field, val) => {
      const next = [...b.questions];
      next[qi] = { ...next[qi], [field]: val };
      setB('questions', next);
    };
    const removeQuestion = (qi) => setB('questions', b.questions.filter((_, i) => i !== qi));
    const addOption = (qi) => {
      const next = [...b.questions];
      next[qi].options = [...next[qi].options, { id: `o_${Date.now()}_${next[qi].options.length}`, text: '', is_correct: false }];
      setB('questions', next);
    };
    const removeOption = (qi, oi) => {
      const next = [...b.questions];
      next[qi].options = next[qi].options.filter((_, i) => i !== oi);
      setB('questions', next);
    };
    const updateOption = (qi, oi, field, val) => {
      const next = [...b.questions];
      if (field === 'is_correct' && val) {
        next[qi].options = next[qi].options.map((o, i) => ({ ...o, is_correct: i === oi }));
      } else {
        next[qi].options = next[qi].options.map((o, i) => i === oi ? { ...o, [field]: val } : o);
      }
      setB('questions', next);
    };

    const inputStyle = { width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
    const labelStyle = { fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', overflow: 'auto' }} onClick={() => setShowModuleBuilder(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.bgModal, borderRadius: 20, width: '100%', maxWidth: 600, boxShadow: T.shadowLg, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>New Training Module</h2>
            <button onClick={() => setShowModuleBuilder(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
          </div>
          <div style={{ padding: 24, maxHeight: 'calc(100vh - 180px)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title & Description */}
            <div>
              <label style={labelStyle}>Module Title *</label>
              <input value={b.title} onChange={e => setB('title', e.target.value)} placeholder="e.g. Fire Safety Procedures" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={b.description} onChange={e => setB('description', e.target.value)} rows={3} placeholder="Brief overview of the module..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {/* Content Blocks */}
            <div>
              <label style={labelStyle}>Content Blocks</label>
              {b.content.map((block, i) => (
                <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 8, background: T.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 }}>{block.type === 'text' ? 'Text' : block.type === 'image' ? 'Image URL' : 'Video URL'}</span>
                    <button onClick={() => moveContentBlock(i, -1)} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 2 }}>{Icons.arrowUp}</button>
                    <button onClick={() => moveContentBlock(i, 1)} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 2 }}>{Icons.arrowDown}</button>
                    <button onClick={() => removeContentBlock(i)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2 }}>{Icons.x}</button>
                  </div>
                  {block.type === 'text' ? (
                    <textarea value={block.value} onChange={e => updateContentBlock(i, 'value', e.target.value)} rows={4} placeholder="Enter text content..." style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }} />
                  ) : (
                    <input value={block.value} onChange={e => updateContentBlock(i, 'value', e.target.value)} placeholder={block.type === 'image' ? 'https://...' : 'https://...'} style={{ ...inputStyle, fontSize: 13 }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => addContentBlock('text')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.plus} Text</button>
                <button onClick={() => addContentBlock('image')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.image} Image</button>
                <button onClick={() => addContentBlock('video')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.video} Video</button>
              </div>
            </div>
            {/* Quiz Questions */}
            <div>
              <label style={labelStyle}>Quiz Questions</label>
              {b.questions.map((q, qi) => (
                <div key={qi} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10, background: T.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>Q{qi + 1}</span>
                    <select value={q.questionType} onChange={e => updateQuestion(qi, 'questionType', e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, background: T.bgCard }}>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="scenario">Scenario</option>
                    </select>
                    <button onClick={() => removeQuestion(qi)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2 }}>{Icons.x}</button>
                  </div>
                  <input value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} placeholder="Question text..." style={{ ...inputStyle, marginBottom: 8, fontSize: 13 }} />
                  {/* Options */}
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <input type="radio" name={`correct_${qi}`} checked={opt.is_correct} onChange={() => updateOption(qi, oi, 'is_correct', true)} style={{ cursor: 'pointer', accentColor: T.accent }} title="Mark as correct" />
                      <input value={opt.text} onChange={e => updateOption(qi, oi, 'text', e.target.value)} placeholder={`Option ${oi + 1}`} style={{ ...inputStyle, fontSize: 12, padding: 8, flex: 1 }} />
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(qi, oi)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2, flexShrink: 0 }}>{Icons.minus}</button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <button onClick={() => addOption(qi)} style={{ fontSize: 11, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{Icons.plus} Add Option</button>
                  )}
                  <input value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} placeholder="Explanation (shown after quiz)" style={{ ...inputStyle, marginTop: 8, fontSize: 12, padding: 8 }} />
                </div>
              ))}
              <button onClick={addQuestion} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px dashed ${T.accent}`, background: T.accentTint, color: T.accentDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>{Icons.plus} Add Question</button>
            </div>
            {/* Settings */}
            <div>
              <label style={labelStyle}>Settings</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 13, color: T.text, flex: 1 }}>Pass Mark</label>
                  <input type="range" min={0} max={100} value={b.passMark} onChange={e => setB('passMark', parseInt(e.target.value))} style={{ flex: 1, accentColor: T.accent }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.accent, minWidth: 36, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{b.passMark}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 13, color: T.text, flex: 1 }}>Time Limit (minutes)</label>
                  <input type="number" min={1} value={b.timeLimitMinutes} onChange={e => setB('timeLimitMinutes', e.target.value)} placeholder="None" style={{ ...inputStyle, width: 80, padding: 8, textAlign: 'center' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={b.randomiseQuestions} onChange={e => setB('randomiseQuestions', e.target.checked)} style={{ accentColor: T.accent }} />
                  <span style={{ fontSize: 13, color: T.text }}>Randomise question order</span>
                </label>
              </div>
            </div>
            {/* Assign */}
            <div>
              <label style={labelStyle}>Assign To</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ v: 'none', l: 'None' }, { v: 'all', l: 'All Crew' }, { v: 'department', l: 'Department' }].map(o => (
                  <button key={o.v} onClick={() => setB('assignTo', o.v)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${b.assignTo === o.v ? T.accent : T.border}`, background: b.assignTo === o.v ? T.accentTint : T.bgCard, color: b.assignTo === o.v ? T.accentDark : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{o.l}</button>
                ))}
              </div>
              {b.assignTo === 'department' && (
                <div style={{ marginTop: 8 }}>
                  <FilterChips options={DEPARTMENTS.filter(d => d !== 'All')} selected={b.assignDept} onChange={v => setB('assignDept', v)} />
                </div>
              )}
              {b.assignTo !== 'none' && (
                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Deadline (optional)</label>
                  <input type="date" value={b.deadline} onChange={e => setB('deadline', e.target.value)} style={{ ...inputStyle, width: 180 }} />
                </div>
              )}
            </div>
            {/* Publish & Save */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
              <button onClick={() => { setB('isPublished', false); setTimeout(handleSaveModule, 50); }} disabled={!b.title.trim() || moduleBuilderSaving} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Save Draft
              </button>
              <button onClick={() => { setB('isPublished', true); setTimeout(handleSaveModule, 50); }} disabled={!b.title.trim() || moduleBuilderSaving} className="cb-btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: !b.title.trim() || moduleBuilderSaving ? T.border : T.accent, color: !b.title.trim() || moduleBuilderSaving ? T.textDim : '#fff', fontSize: 14, fontWeight: 700, cursor: !b.title.trim() || moduleBuilderSaving ? 'default' : 'pointer' }}>
                {moduleBuilderSaving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    if (role === 'admin' && adminNoticeView) return <AdminNoticeDetail notice={adminNoticeView} onBack={() => setAdminNoticeView(null)} crew={liveCrew} onDelete={() => handleDeleteNotice(adminNoticeView.id)} onSendReminder={handleSendNoticeReminder} isDesktop={isDesktop} />;
    if (role === 'admin') {
      switch (tab) {
        case 'home': return AdminDashboard();
        case 'notices': return NoticesScreen();
        case 'docs': return DocsScreen();
        case 'training': return AdminTrainingScreen();
        case 'crew': return CrewManagement();
        case 'activity': return AdminActivityLog();
        default: return AdminDashboard();
      }
    }
    switch (tab) {
      case 'home': return CrewHome();
      case 'notices': return NoticesScreen();
      case 'docs': return DocsScreen();
      case 'training': return CrewTrainingScreen();
      case 'profile': return CrewProfile();
      default: return CrewHome();
    }
  };

  // ─── Sidebar (admin desktop only) ──────────────────────────────────
  const Sidebar = () => (
    <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: '#fff', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', zIndex: 60 }}>
      {/* Sidebar header / logo */}
      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentDark} 100%)`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.35)' }}>
          <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} size={18} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>CrewBoard</span>
      </div>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); resetNav(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: 'none', background: active ? T.accentTint : 'transparent', color: active ? T.accent : T.textMuted, cursor: 'pointer', fontSize: 14, fontWeight: active ? 700 : 500, transition: 'all 0.15s', width: '100%', textAlign: 'left' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge > 0 && <span style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10, background: T.critical, fontSize: 11, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{t.badge}</span>}
            </button>
          );
        })}
      </nav>
      {/* Sidebar footer: user info */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={currentUser.avatar} online size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>{currentUser.role}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', maxWidth: isDesktop ? undefined : 480, margin: isDesktop ? undefined : '0 auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: isDesktop ? 'none' : '0 0 80px rgba(15,23,42,0.06)' }}>

      {/* Desktop sidebar — admin only */}
      {isDesktop && Sidebar()}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isDesktop ? '14px 36px' : '16px 22px', borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.85)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', position: 'sticky', top: 0, zIndex: 50, marginLeft: isDesktop ? 240 : 0 }}>
        {/* On desktop, the sidebar already shows the logo — so we show nothing on the left */}
        {isDesktop ? <div /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentDark} 100%)`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.35)' }}>
              <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} size={18} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>CrewBoard</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
          {role === 'crew' && (
            <button onClick={() => { setTab('profile'); resetNav(); }} style={{ background: T.bg, border: `1px solid ${tab === 'profile' ? T.accent : T.border}`, color: tab === 'profile' ? T.accent : T.textMuted, cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
              {Icons.crew}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: isDesktop ? 24 : 88, marginLeft: isDesktop ? 240 : 0, maxWidth: isDesktop ? 1200 : undefined, width: isDesktop ? 'calc(100% - 240px)' : undefined }}>
        {/* Push notification opt-in banner — shown once until the user
            subscribes or dismisses it. Only appears when the browser
            supports push and hasn't already granted/denied. */}
        {pushState === 'prompt' && !pushDismissed && (
          <div style={{ margin: isDesktop ? '16px 36px' : '12px 20px', padding: '14px 18px', background: T.accentTint, border: `1px solid ${T.accent}33`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>Enable push notifications</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Get notified about new notices, documents, and reminders even when the app is closed.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  const sub = await subscribeToPush(currentUser.id);
                  setPushState(sub ? 'subscribed' : 'denied');
                }}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Enable
              </button>
              <button
                onClick={() => setPushDismissed(true)}
                style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Later
              </button>
            </div>
          </div>
        )}
        {renderScreen()}
      </div>

      {/* Bottom Navigation — mobile only (on desktop the sidebar replaces it) */}
      {!isDesktop && (
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
      )}

      {/* Admin FAB — mobile only (notices + training) */}
      {role === 'admin' && !isDesktop && tab === 'notices' && !adminNoticeView && (
        <button onClick={() => setShowNewNotice(true)} className="cb-btn-primary" style={{ position: 'fixed', bottom: 100, right: 'calc(50% - 214px)', width: 56, height: 56, borderRadius: '50%', background: T.accent, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          {Icons.plus}
        </button>
      )}
      {role === 'admin' && tab === 'training' && trainingView === 'dashboard' && (
        <button onClick={() => setShowModuleBuilder(true)} className="cb-btn-primary" style={{ position: 'fixed', bottom: isDesktop ? 32 : 100, right: isDesktop ? 48 : 'calc(50% - 214px)', width: 56, height: 56, borderRadius: '50%', background: T.accent, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
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
      {showReplaceDoc && ReplaceDocumentModal()}
      {showExportReport && ExportReportModal()}
      {showModuleBuilder && ModuleBuilderModal()}
    </div>
  );
}
