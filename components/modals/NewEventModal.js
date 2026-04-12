import T, { DEPARTMENTS } from '../shared/theme';
import Icons from '../shared/Icons';

const NewEventModal = ({ newEventData, setNewEventData, handleCreateEvent, eventSaving, setShowNewEvent, isDesktop, EVENT_TYPE_ICONS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS }) => {
  const d = newEventData;
  const setD = (key, val) => setNewEventData(prev => ({ ...prev, [key]: val }));
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  const addBriefing = () => {
    setD('briefings', [...d.briefings, { department: '', content: '' }]);
  };
  const updateBriefing = (idx, field, val) => {
    const updated = [...d.briefings];
    updated[idx] = { ...updated[idx], [field]: val };
    setD('briefings', updated);
  };
  const removeBriefing = (idx) => {
    setD('briefings', d.briefings.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: isDesktop ? 'center' : 'flex-end' }}>
      <div style={{ background: T.bgModal, borderRadius: isDesktop ? 20 : '20px 20px 0 0', width: '100%', maxWidth: isDesktop ? 640 : 480, maxHeight: isDesktop ? '85vh' : '92vh', overflow: 'auto', boxShadow: T.shadowLg }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, background: T.bgModal, zIndex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>Create Event</h2>
          <button onClick={() => setShowNewEvent(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', padding: 4 }}>{Icons.x}</button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Event Type */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>Event Type</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setD('event_type', key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${d.event_type === key ? EVENT_TYPE_COLORS[key] : T.border}`, background: d.event_type === key ? `${EVENT_TYPE_COLORS[key]}15` : T.bgCard, color: d.event_type === key ? EVENT_TYPE_COLORS[key] : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {EVENT_TYPE_ICONS[key]} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>Title</label>
            <input value={d.title} onChange={e => setD('title', e.target.value)} placeholder="e.g. Monaco Grand Prix Passage" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>General Description</label>
            <textarea value={d.description} onChange={e => setD('description', e.target.value)} placeholder="General briefing for all crew..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>Start Date</label>
              <input type="date" value={d.start_date} onChange={e => setD('start_date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>Start Time</label>
              <input type="time" value={d.start_time} onChange={e => setD('start_time', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>End Date</label>
              <input type="date" value={d.end_date} onChange={e => setD('end_date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>End Time</label>
              <input type="time" value={d.end_time} onChange={e => setD('end_time', e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Department Briefings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Department Briefings</label>
              <button onClick={addBriefing} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: `1px solid ${T.accent}40`, background: T.accentTint, color: T.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {Icons.plus} Add
              </button>
            </div>
            {d.briefings.map((b, i) => (
              <div key={i} style={{ padding: 14, background: T.bg, borderRadius: 12, marginBottom: 8, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select value={b.department} onChange={e => updateBriefing(i, 'department', e.target.value)} style={{ ...inputStyle, flex: 1, padding: 8 }}>
                    <option value="">Select department...</option>
                    {DEPARTMENTS.filter(d => d !== 'All').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <button onClick={() => removeBriefing(i)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 4 }}>{Icons.trash}</button>
                </div>
                <textarea value={b.content} onChange={e => updateBriefing(i, 'content', e.target.value)} placeholder={`Briefing for ${b.department || 'this department'}...`} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            ))}
          </div>

          {/* Notification Schedule */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, display: 'block' }}>Notification Schedule</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.notification_schedule.map((n, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: 8, background: T.accentTint, color: T.accent, fontSize: 12, fontWeight: 600 }}>
                  {n.days_before}d before
                </span>
              ))}
            </div>
          </div>

          {/* Restricted Fields */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
              <input type="checkbox" checked={d.restrictedEnabled} onChange={e => setD('restrictedEnabled', e.target.checked)} style={{ accentColor: T.accent }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Add restricted information</span>
            </label>
            {d.restrictedEnabled && (
              <div style={{ padding: 14, background: T.goldTint, borderRadius: 12, border: `1px solid ${T.gold}30` }}>
                <p style={{ fontSize: 11, color: T.gold, margin: '0 0 8px', fontWeight: 600 }}>This info will only be visible to selected roles</p>
                <textarea value={d.restrictedValue} onChange={e => setD('restrictedValue', e.target.value)} placeholder="e.g. Guest names: Mr & Mrs Smith" rows={2} style={{ ...inputStyle, marginBottom: 8, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Captain', 'Chief Officer', 'Chief Stewardess', 'Chef', 'Engineer', 'Bosun'].map(r => (
                    <button key={r} onClick={() => {
                      const roles = d.restrictedRoles.includes(r) ? d.restrictedRoles.filter(x => x !== r) : [...d.restrictedRoles, r];
                      setD('restrictedRoles', roles);
                    }} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${d.restrictedRoles.includes(r) ? T.gold : T.border}`, background: d.restrictedRoles.includes(r) ? T.goldTint : T.bgCard, color: d.restrictedRoles.includes(r) ? '#b45309' : T.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={() => setShowNewEvent(false)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleCreateEvent} disabled={!d.title.trim() || !d.start_date || eventSaving} className="cb-btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: !d.title.trim() || !d.start_date || eventSaving ? T.border : T.accent, color: !d.title.trim() || !d.start_date || eventSaving ? T.textDim : '#fff', fontSize: 14, fontWeight: 700, cursor: !d.title.trim() || !d.start_date || eventSaving ? 'default' : 'pointer' }}>
              {eventSaving ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEventModal;
