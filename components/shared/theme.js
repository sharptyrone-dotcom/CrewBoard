// ─── Data & Constants ────────────────────────────────────────────────
export const CATEGORIES = ['All', 'Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental'];
export const PRIORITIES = { critical: '#ef4444', important: '#f59e0b', routine: '#64748b' };
export const DEPARTMENTS = ['All', 'Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General'];
export const DOC_TYPES = ['All', 'SOPs', 'Risk Assessments', 'Manuals', 'MSDS/COSHH', 'Checklists', 'Policies'];

export const INITIAL_NOTICES = [
  { id: 1, title: 'Man Overboard Drill — 10 April', body: 'All crew to muster at 1000hrs on the aft deck for scheduled MOB drill. Full PPE required. Tender crew to have rescue boat prepped by 0945. This is a mandatory drill — all departments must ensure coverage.', category: 'Safety', priority: 'critical', dept: 'All', pinned: true, createdAt: '2026-04-09T08:00:00', readBy: [1, 2, 5, 8], acknowledgedBy: [1, 5] },
  { id: 2, title: 'Guest Arrival — 18 April', body: '6 guests arriving by helicopter transfer at approximately 1400hrs. Full welcome protocol. Interior to have welcome drinks and canapés prepared. Deck to ensure helipad is clear and secured from 1300hrs. Detailed guest preference sheets to follow.', category: 'Guest Info', priority: 'important', dept: 'All', pinned: true, createdAt: '2026-04-08T14:30:00', readBy: [1, 2, 8], acknowledgedBy: [2] },
  { id: 3, title: 'WiFi Maintenance — 12 April', body: 'Crew WiFi will be offline between 0200–0400 for firmware updates to the VSAT system. Bridge systems unaffected. Please download anything you need before 0200.', category: 'Operations', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-08T10:00:00', readBy: [1, 3, 7], acknowledgedBy: [] },
  { id: 4, title: 'New Tender Operating SOP', body: 'Updated tender operations SOP has been uploaded to the Document Library. All deck crew must review and acknowledge by 15 April. Key changes in Section 3.2 regarding passenger boarding procedures.', category: 'Safety', priority: 'important', dept: 'Deck', pinned: false, createdAt: '2026-04-07T16:00:00', readBy: [1, 5], acknowledgedBy: [1] },
  { id: 5, title: 'Crew BBQ — Saturday 12th', body: 'Crew BBQ on the crew mess aft deck from 1800hrs. Chef Lisa is doing her famous jerk chicken. BYO drinks. Off-watch crew only — check rota.', category: 'Social', priority: 'routine', dept: 'All', pinned: false, createdAt: '2026-04-07T09:00:00', readBy: [1, 2, 4, 5, 6, 8], acknowledgedBy: [] },
  { id: 6, title: 'Port Side Hydraulic System — Restricted Area', body: 'Port side hydraulic system under maintenance until further notice. Area cordoned off — no crew to enter without Chief Engineer authorisation. Risk assessment RA-2026-041 applies.', category: 'Safety', priority: 'critical', dept: 'Engine', pinned: false, createdAt: '2026-04-06T11:00:00', readBy: [1, 3, 5, 7], acknowledgedBy: [3, 7] },
];

// ─── Theme ───────────────────────────────────────────────────────────
// Values reference CSS variables defined in globals.css so dark mode
// works automatically when [data-theme="dark"] is set on <html>.
const T = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  bgHover: 'var(--bg-hover)',
  bgModal: 'var(--bg-modal)',
  border: 'var(--border)',
  borderLight: 'var(--border-light)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  accent: '#3b82f6',
  accentDark: 'var(--accent-dark)',
  accentGlow: 'var(--accent-glow)',
  accentTint: 'var(--accent-tint)',
  gold: '#f59e0b',
  goldTint: 'var(--gold-tint)',
  critical: '#ef4444',
  criticalTint: 'var(--critical-tint)',
  success: '#10b981',
  successTint: 'var(--success-tint)',
  navy: 'var(--navy)',
  shadow: 'var(--shadow)',
  shadowLg: 'var(--shadow-lg)',
};

export default T;
