'use client';

import { useState } from 'react';
import T from './theme';

/**
 * A <select> dropdown with an "+ Add new…" option that opens an inline
 * creation form. When the user creates a new item, it's persisted via the
 * `onAddNew` callback and automatically selected.
 *
 * Props:
 *   value        — current selected value
 *   onChange      — (newValue) => void
 *   options       — string[] of available options (no 'All')
 *   onAddNew      — async (label, color?) => item — called to persist
 *   placeholder   — optional, shown in the add-new input
 *   showColorPicker — if true, shows a color input in the add-new form
 */
export default function SelectWithAddNew({ value, onChange, options, onAddNew, placeholder, showColorPicker }) {
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      setShowForm(true);
      setError('');
    } else {
      onChange(val);
    }
  };

  const handleCreate = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) {
      setError('Maximum 50 characters');
      return;
    }
    // Check case-insensitive duplicate in current options
    if (options.some(o => o.toLowerCase() === trimmed.toLowerCase())) {
      setError('This option already exists');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAddNew(trimmed, showColorPicker ? newColor : undefined);
      onChange(trimmed);
      setNewLabel('');
      setNewColor('#64748b');
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewLabel('');
    setNewColor('#64748b');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
    if (e.key === 'Escape') { handleCancel(); }
  };

  return (
    <div>
      <select
        value={value}
        onChange={handleSelectChange}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${T.border}`,
          background: T.bgCard,
          color: T.text,
          fontSize: 13,
          outline: 'none',
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="__add_new__">+ Add new…</option>
      </select>

      {showForm && (
        <div style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${T.accent}40`,
          background: T.accentTint,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {showColorPicker && (
              <input
                type="color"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                style={{
                  width: 36,
                  height: 36,
                  padding: 2,
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="Pick a colour for this category"
              />
            )}
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || 'New option name…'}
              maxLength={50}
              autoFocus
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bgCard,
                color: T.text,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleCreate}
              disabled={saving || !newLabel.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: newLabel.trim() && !saving ? T.accent : T.border,
                color: newLabel.trim() && !saving ? '#fff' : T.textDim,
                fontSize: 12,
                fontWeight: 700,
                cursor: newLabel.trim() && !saving ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              {saving ? '…' : 'Add'}
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bgCard,
                color: T.textMuted,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
          {error && (
            <div style={{ fontSize: 11, color: T.critical, marginTop: 6 }}>{error}</div>
          )}
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>
            {newLabel.length}/50 characters
          </div>
        </div>
      )}
    </div>
  );
}
