import { useEffect } from 'react';
import T from './theme';
import Icons from './Icons';

// Hook: wires a set of keyboard shortcuts to window keydown. Handlers is
// an object keyed by shortcut definition. Modifier keys are not used —
// single-letter shortcuts only, ignored when a text input has focus.
export function useKeyboardShortcuts(handlers, options = {}) {
  const { enabled = true } = options;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      // Ignore when the user is typing in an input/textarea/contenteditable.
      const target = e.target;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )) return;
      // Ignore modifiers except shift (for '?')
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;
      if (handlers[key]) {
        e.preventDefault();
        handlers[key](e);
      } else if (key.toLowerCase && handlers[key.toLowerCase()]) {
        e.preventDefault();
        handlers[key.toLowerCase()](e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, enabled]);
}

// Overlay shown when the user presses '?'. Dismisses with Esc or click
// outside.
export const ShortcutsOverlay = ({ open, onClose, shortcuts = [] }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.55)',
        display: 'grid', placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bgCard,
          borderRadius: 16,
          padding: 24,
          maxWidth: 440,
          width: '100%',
          boxShadow: T.shadowLg,
          border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, display: 'flex' }}
          >{Icons.x}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shortcuts.map(s => (
            <div key={s.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 4px',
              borderBottom: `1px solid ${T.border}`,
            }}>
              <span style={{ fontSize: 13, color: T.text }}>{s.description}</span>
              <kbd style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderBottom: `2px solid ${T.borderLight}`,
                borderRadius: 6,
                color: T.textMuted,
                minWidth: 32,
                textAlign: 'center',
              }}>{s.key}</kbd>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: T.textMuted, textAlign: 'center' }}>
          Press <kbd style={{ fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4 }}>?</kbd> any time to show this.
        </div>
      </div>
    </div>
  );
};
