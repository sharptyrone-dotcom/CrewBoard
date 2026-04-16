import { useState } from 'react';
import T, { DEPARTMENTS, DOC_TYPES, CATEGORIES } from '../shared/theme';
import Icons from '../shared/Icons';

const BUILTIN_DEPARTMENTS = DEPARTMENTS.filter(d => d !== 'All');
const BUILTIN_DOC_TYPES = DOC_TYPES.filter(d => d !== 'All');
const BUILTIN_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

// Reusable section for a single taxonomy kind
function TaxonomySection({ title, builtIn, customItems, onAdd, onDelete, showColor }) {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const allLabels = [...builtIn, ...customItems.map(c => c.label)];

  const handleAdd = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) { setError('Maximum 50 characters'); return; }
    if (allLabels.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      setError('This name already exists');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAdd(trimmed, showColor ? newColor : undefined);
      setNewLabel('');
      setNewColor('#64748b');
    } catch (err) {
      setError(err.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this custom option? Items using it will keep their current value but it won\'t appear in future dropdowns.')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, boxShadow: T.shadow }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>{title}</h3>

      {/* Built-in items */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Built-in</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {builtIn.map(label => (
            <span key={label} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: T.bg, color: T.textMuted, border: `1px solid ${T.border}`,
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Custom items */}
      {customItems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Custom</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10,
                background: T.accentTint, border: `1px solid ${T.accent}20`,
              }}>
                {showColor && item.color && (
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: item.color, flexShrink: 0,
                    border: `1px solid ${T.border}`,
                  }} />
                )}
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.text }}>{item.label}</span>
                <span style={{ fontSize: 10, color: T.textDim }}>
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    background: 'none', border: 'none', cursor: deletingId === item.id ? 'default' : 'pointer',
                    color: deletingId === item.id ? T.textDim : T.critical, padding: 4, flexShrink: 0,
                  }}
                  title="Delete custom option"
                >
                  {Icons.trash}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {showColor && (
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            style={{
              width: 36, height: 36, padding: 2, borderRadius: 8,
              border: `1px solid ${T.border}`, cursor: 'pointer', flexShrink: 0,
            }}
          />
        )}
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom option…"
          maxLength={50}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.bg,
            color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newLabel.trim()}
          style={{
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: newLabel.trim() && !saving ? T.accent : T.border,
            color: newLabel.trim() && !saving ? '#fff' : T.textDim,
            fontSize: 13, fontWeight: 700,
            cursor: newLabel.trim() && !saving ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && <div style={{ fontSize: 11, color: T.critical, marginTop: 6 }}>{error}</div>}
      <div style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>{newLabel.length}/50 characters</div>
    </div>
  );
}

const TaxonomySettings = ({ taxonomies, isDesktop, onBack }) => {
  if (!taxonomies?.loaded) {
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <p style={{ fontSize: 13, color: T.textMuted }}>Loading taxonomy settings…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: T.accent,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            padding: 0, marginBottom: 16,
          }}
        >
          {Icons.arrowLeft} Back
        </button>
      )}
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>Custom Taxonomies</h2>
      <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 24px', maxWidth: 560 }}>
        Add custom departments, document types, and notice categories. Custom options appear alongside the built-in options in forms and filters across the app.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
        <TaxonomySection
          title="Departments"
          builtIn={BUILTIN_DEPARTMENTS}
          customItems={taxonomies.customDepts}
          onAdd={taxonomies.addDepartment}
          onDelete={taxonomies.deleteDepartment}
        />
        <TaxonomySection
          title="Document Types"
          builtIn={BUILTIN_DOC_TYPES}
          customItems={taxonomies.customDocTypes}
          onAdd={taxonomies.addDocType}
          onDelete={taxonomies.deleteDocType}
        />
        <TaxonomySection
          title="Notice Categories"
          builtIn={BUILTIN_CATEGORIES}
          customItems={taxonomies.customCategories}
          onAdd={taxonomies.addCategory}
          onDelete={taxonomies.deleteCategory}
          showColor
        />
      </div>
    </div>
  );
};

export default TaxonomySettings;
