import { track } from '@vercel/analytics';

// ── Custom event helpers ─────────────────────────────────────────────
// Thin wrappers around Vercel Analytics' `track()` so callers don't need
// to know the event names or property shapes.  Each function is a no-op
// in environments where the Analytics script hasn't loaded (local dev,
// SSR, tests) — `track` silently drops events when the SDK isn't active.

export function trackNoticeRead(noticeId, category, priority) {
  track('notice_read', { noticeId, category, priority });
}

export function trackDocumentAcknowledged(docId, docType) {
  track('document_acknowledged', { docId, docType });
}

export function trackQuizCompleted(moduleId, score, passed) {
  track('quiz_completed', { moduleId, score, passed });
}

export function trackCrewLogin(crewId, department) {
  track('crew_login', { crewId, department });
}

export function trackEventRead(eventId) {
  track('event_read', { eventId });
}

export function trackTrainingAssigned(moduleId, assigneeCount) {
  track('training_assigned', { moduleId, assigneeCount });
}
