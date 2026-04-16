import { useState, useEffect, useRef, useCallback } from 'react';
import T from '../shared/theme';
import Icons, { Icon } from '../shared/Icons';
import BackButton from '../shared/BackButton';
import { fetchMyPreferences, saveMyPreferences } from '@/lib/notification-preferences';

// ── Toggle Switch ──────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled, locked }) {
  return (
    <button
      onClick={() => !disabled && !locked && onChange(!checked)}
      disabled={disabled || locked}
      style={{
        width: 44, height: 24, borderRadius: 12, padding: 2,
        background: locked ? T.textDim : checked ? T.accent : T.border,
        transition: 'background 0.2s',
        display: 'flex', alignItems: 'center',
        cursor: locked ? 'not-allowed' : disabled ? 'default' : 'pointer',
        border: 'none', flexShrink: 0,
        opacity: disabled && !locked ? 0.5 : locked ? 0.6 : 1,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s',
      }} />
    </button>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
      <div style={{ width: '60%', height: 14, borderRadius: 6, background: T.border }} />
      <div style={{ width: 44, height: 24, borderRadius: 12, background: T.border }} />
    </div>
  );
}

// ── Preference Section ─────────────────────────────────────────────
function PreferenceSection({ title, items, preferences, onToggle, saving }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px', padding: '0 4px' }}>{title}</h3>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: T.shadow }}>
        {items.map((item, i) => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, color: item.locked ? T.textMuted : T.text, fontWeight: 500 }}>{item.label}</span>
                {item.locked && (
                  <span title="Critical safety notices cannot be muted" style={{ color: T.textDim, display: 'flex', alignItems: 'center', cursor: 'help' }}>
                    <Icon d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>} size={14} />
                  </span>
                )}
              </div>
              {item.description && (
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{item.description}</div>
              )}
            </div>
            <Toggle
              checked={preferences[item.key] ?? true}
              onChange={(val) => onToggle(item.key, val)}
              disabled={saving}
              locked={item.locked}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────���───────────────────────────
export default function NotificationPreferences({ currentUser, onBack }) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null
  const debounceRef = useRef(null);
  const pendingRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const prefs = await fetchMyPreferences(currentUser.id);
      if (!cancelled) {
        setPreferences(prefs || {
          critical_notices: true,
          important_notices: true,
          routine_notices: true,
          document_updates: true,
          training_assignments: true,
          training_reminders: true,
          event_briefings: true,
          event_updates: true,
          admin_reminders: true,
        });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  // Debounced save
  const debouncedSave = useCallback((nextPrefs) => {
    pendingRef.current = nextPrefs;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const toSave = pendingRef.current;
      if (!toSave) return;
      setSaving(true);
      setSaveStatus(null);
      try {
        const saved = await saveMyPreferences(currentUser.id, toSave);
        if (saved) setPreferences(saved);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [currentUser.id]);

  const handleToggle = (key, value) => {
    if (key === 'critical_notices') return; // can't toggle
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    debouncedSave(next);
  };

  const sections = [
    {
      title: 'Notices',
      items: [
        { key: 'critical_notices', label: 'Critical safety notices', description: 'Critical safety notices cannot be muted', locked: true },
        { key: 'important_notices', label: 'Important notices' },
        { key: 'routine_notices', label: 'Routine notices' },
      ],
    },
    {
      title: 'Documents',
      items: [
        { key: 'document_updates', label: 'Document updates & new versions' },
      ],
    },
    {
      title: 'Training',
      items: [
        { key: 'training_assignments', label: 'New training assignments' },
        { key: 'training_reminders', label: 'Training deadline reminders' },
      ],
    },
    {
      title: 'Events',
      items: [
        { key: 'event_briefings', label: 'Event briefings' },
        { key: 'event_updates', label: 'Live event updates' },
      ],
    },
    {
      title: 'Other',
      items: [
        { key: 'admin_reminders', label: 'Admin reminders' },
      ],
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <BackButton onClick={onBack} label="Profile" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 10 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>Notification Preferences</h2>
        {saveStatus === 'saved' && (
          <span style={{ fontSize: 12, fontWeight: 600, color: T.success, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {Icons.checkCircle} Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span style={{ fontSize: 12, fontWeight: 600, color: T.critical, flexShrink: 0 }}>
            Save failed — try again
          </span>
        )}
        {saving && !saveStatus && (
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, flexShrink: 0 }}>
            Saving...
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 20px', lineHeight: 1.5 }}>
        Choose which notifications you receive. Critical safety notices cannot be muted.
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: T.shadow }}>
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ))}
        </div>
      ) : (
        sections.map(section => (
          <PreferenceSection
            key={section.title}
            title={section.title}
            items={section.items}
            preferences={preferences}
            onToggle={handleToggle}
            saving={saving}
          />
        ))
      )}
    </div>
  );
}
