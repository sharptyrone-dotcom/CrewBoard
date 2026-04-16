import { useState, useEffect } from 'react';
import T from '../shared/theme';
import Icons from '../shared/Icons';

// Welcome flow shown to new crew members. Computes completion from
// existing app state (no DB) and persists dismissal in localStorage so
// crew who explicitly hide it don't see it again.
const OnboardingChecklist = ({ currentUser, notices = [], docs = [], trainingModules = [], setTab, setSelectedNotice, setSelectedDoc }) => {
  const storageKey = `onboarding-dismissed-${currentUser?.id}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { setDismissed(localStorage.getItem(storageKey) === 'true'); } catch {}
  }, [storageKey]);

  // Build step list with computed completion state.
  const profileComplete = !!(currentUser?.name && currentUser?.role);
  const firstNotice = notices[0];
  const firstNoticeRead = firstNotice ? (firstNotice.readBy || []).includes(currentUser?.id) : true;
  const requiredDocs = docs.filter(d => d.required);
  const firstRequiredDoc = requiredDocs[0];
  const firstDocAcked = firstRequiredDoc ? (firstRequiredDoc.acknowledgedBy || []).includes(currentUser?.id) : true;
  const firstTraining = trainingModules[0];
  const trainingCompleted = firstTraining ? (firstTraining.completedBy || firstTraining.completed_by || []).includes(currentUser?.id) : true;

  const steps = [
    {
      key: 'profile',
      title: 'Complete your profile',
      detail: 'Make sure your name, role, and avatar are set.',
      done: profileComplete,
      action: null,
    },
    {
      key: 'read-notice',
      title: 'Read your first notice',
      detail: firstNotice ? firstNotice.title : 'No notices yet',
      done: firstNoticeRead,
      action: firstNotice ? () => { setSelectedNotice && setSelectedNotice(firstNotice); setTab && setTab('notices'); } : null,
    },
    {
      key: 'ack-doc',
      title: 'Acknowledge a required document',
      detail: firstRequiredDoc ? firstRequiredDoc.title : 'No required docs',
      done: firstDocAcked,
      action: firstRequiredDoc ? () => { setSelectedDoc && setSelectedDoc(firstRequiredDoc); setTab && setTab('docs'); } : null,
    },
    {
      key: 'training',
      title: 'Start a training module',
      detail: firstTraining ? firstTraining.title : 'No training assigned',
      done: trainingCompleted,
      action: firstTraining ? () => { setTab && setTab('training'); } : null,
    },
  ];

  const completed = steps.filter(s => s.done).length;
  const total = steps.length;
  const pct = Math.round((completed / total) * 100);

  // Auto-hide once everything is done, or if user manually dismissed.
  if (dismissed || completed === total) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, 'true'); } catch {}
  };

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.accent}33`,
      borderLeft: `4px solid ${T.accent}`,
      borderRadius: 16,
      padding: '18px 20px',
      marginBottom: 20,
      boxShadow: T.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Getting Started</div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>Welcome aboard, {currentUser?.name?.split(' ')[0] || 'crew'} 👋</h3>
          <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>{completed} of {total} steps complete</p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss welcome"
          style={{ background: 'transparent', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          {Icons.x}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: T.bg, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${T.accent}, ${T.accentDark})`,
          transition: 'width 0.4s ease-out',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map(step => (
          <button
            key={step.key}
            onClick={step.action || undefined}
            disabled={!step.action || step.done}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              border: 'none',
              background: step.done ? T.successTint : T.bg,
              cursor: step.action && !step.done ? 'pointer' : 'default',
              textAlign: 'left',
              opacity: step.done ? 0.7 : 1,
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: step.done ? T.success : T.bgCard,
              border: `2px solid ${step.done ? T.success : T.border}`,
              display: 'grid', placeItems: 'center',
              color: '#fff', flexShrink: 0,
            }}>
              {step.done && Icons.check}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
              <div style={{ fontSize: 11, color: T.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.detail}</div>
            </div>
            {step.action && !step.done && (
              <span style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>Start →</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
