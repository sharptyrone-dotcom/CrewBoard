import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';

const AdminEventsScreen = ({ adminEventView, setAdminEventView, adminEventDetail, setAdminEventDetail, adminEventDetailLoading, events, eventsLoading, eventFilter, setEventFilter, isDesktop, handleLoadEventDetail, handleArchiveEvent, handleDeleteEvent, handlePostEventUpdate, newUpdateText, setNewUpdateText, postingUpdate, setShowNewEvent, getCountdown, EVENT_TYPE_ICONS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS }) => {
  // Admin event detail view
  if (adminEventView === 'detail' && adminEventDetail) {
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <button onClick={() => { setAdminEventView(null); setAdminEventDetail(null); setNewUpdateText(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.accent, cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {Icons.arrowLeft} <span>Back to Events</span>
        </button>

        {adminEventDetailLoading ? (
          <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>Loading event...</p>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, marginBottom: 16, boxShadow: T.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${EVENT_TYPE_COLORS[adminEventDetail.eventType] || T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: EVENT_TYPE_COLORS[adminEventDetail.eventType] || T.accent }}>
                  {EVENT_TYPE_ICONS[adminEventDetail.eventType] || Icons.calendar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: EVENT_TYPE_COLORS[adminEventDetail.eventType] || T.accent }}>
                    {EVENT_TYPE_LABELS[adminEventDetail.eventType] || 'Event'}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{adminEventDetail.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {adminEventDetail.status !== 'completed' && adminEventDetail.status !== 'cancelled' && (
                    <button onClick={() => handleArchiveEvent(adminEventDetail.id)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Archive</button>
                  )}
                  <button onClick={() => handleDeleteEvent(adminEventDetail.id)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${T.critical}40`, background: T.criticalTint, color: T.critical, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.textMuted, marginBottom: 8, flexWrap: 'wrap' }}>
                <span>{Icons.calendar} {new Date(adminEventDetail.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                {adminEventDetail.endDate && <span>to {new Date(adminEventDetail.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '3px 8px', borderRadius: 5, background: adminEventDetail.status === 'active' ? T.successTint : adminEventDetail.status === 'upcoming' ? T.accentTint : T.bg, color: adminEventDetail.status === 'active' ? T.success : adminEventDetail.status === 'upcoming' ? T.accent : T.textMuted }}>
                  {adminEventDetail.status}
                </span>
              </div>
              {adminEventDetail.description && <p style={{ fontSize: 13, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{adminEventDetail.description}</p>}

              {/* Restricted fields (admin sees all) */}
              {adminEventDetail.restrictedFields && Object.keys(adminEventDetail.restrictedFields).length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: T.goldTint, borderRadius: 10, border: `1px solid ${T.gold}30` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.gold, marginBottom: 6 }}>Restricted Fields</div>
                  {Object.entries(adminEventDetail.restrictedFields).map(([key, config]) => (
                    <div key={key} style={{ fontSize: 13, color: T.text, marginBottom: 4 }}>
                      <strong>{typeof config === 'object' ? `Visible to: ${(config.roles || []).join(', ')}` : key}:</strong>{' '}
                      {typeof config === 'object' ? config.value : config}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Read receipts */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, marginBottom: 16, boxShadow: T.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Read Receipts</h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: adminEventDetail.readCount === adminEventDetail.totalCrew ? T.success : T.accent }}>
                  {adminEventDetail.readCount || 0} / {adminEventDetail.totalCrew || 0}
                </span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: T.bg, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 3, background: adminEventDetail.readCount === adminEventDetail.totalCrew ? T.success : T.accent, width: `${adminEventDetail.totalCrew ? (adminEventDetail.readCount / adminEventDetail.totalCrew) * 100 : 0}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 6 }}>
                {(adminEventDetail.reads || []).map((r) => (
                  <div key={r.crewMemberId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: T.bg, borderRadius: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{r.crewName}</div>
                      <div style={{ fontSize: 10, color: T.textDim }}>{new Date(r.readAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Briefings */}
            {(adminEventDetail.briefings || []).length > 0 && (
              <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, marginBottom: 16, boxShadow: T.shadow }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 12px' }}>Department Briefings</h3>
                {adminEventDetail.briefings.map((b) => (
                  <div key={b.id} style={{ padding: 12, background: T.bg, borderRadius: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: T.accent, display: 'inline-block', marginBottom: 6 }}>{b.department}</span>
                    <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{b.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Post live update */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, marginBottom: 16, boxShadow: T.shadow }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 12px' }}>Post Live Update</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newUpdateText} onChange={e => setNewUpdateText(e.target.value)} placeholder='e.g. "ETA changed to 1400"' onKeyDown={e => e.key === 'Enter' && handlePostEventUpdate(adminEventDetail.id)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13, outline: 'none' }} />
                <button onClick={() => handlePostEventUpdate(adminEventDetail.id)} disabled={!newUpdateText.trim() || postingUpdate} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: !newUpdateText.trim() || postingUpdate ? T.border : T.accent, color: !newUpdateText.trim() || postingUpdate ? T.textDim : '#fff', fontSize: 13, fontWeight: 700, cursor: !newUpdateText.trim() || postingUpdate ? 'default' : 'pointer' }}>
                  {postingUpdate ? '...' : 'Post'}
                </button>
              </div>

              {/* Existing updates */}
              {(adminEventDetail.updates || []).length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {adminEventDetail.updates.map((u) => (
                    <div key={u.id} style={{ padding: 12, background: T.bg, borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{u.createdBy}</span>
                        <span style={{ fontSize: 11, color: T.textDim }}>{new Date(u.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>{u.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Admin events list
  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'active');
  const pastEvents = events.filter(e => e.status === 'completed' || e.status === 'cancelled');

  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: 0 }}>Events</h2>
        {isDesktop && (
          <button onClick={() => setShowNewEvent(true)} className="cb-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {Icons.plus} New Event
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Upcoming" value={events.filter(e => e.status === 'upcoming').length} icon={Icons.calendar} />
        <StatCard label="Active" value={events.filter(e => e.status === 'active').length} color={T.success} icon={Icons.play} />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['upcoming', 'active', 'all', 'past'].map(f => (
          <button key={f} onClick={() => setEventFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${eventFilter === f ? T.accent : T.border}`, background: eventFilter === f ? T.accentTint : T.bgCard, color: eventFilter === f ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {f === 'past' ? 'Archived' : f}
          </button>
        ))}
      </div>

      {eventsLoading && events.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>Loading events...</p>}
      {!eventsLoading && events.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>No events found</p>}

      {/* Events list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((e) => {
          const countdown = getCountdown(e.startDate);
          const typeColor = EVENT_TYPE_COLORS[e.eventType] || T.accent;
          const readPct = e.totalCrew ? Math.round((e.readCount / e.totalCrew) * 100) : 0;
          return (
            <button key={e.id} onClick={() => { setAdminEventView('detail'); handleLoadEventDetail(e, true); }} className="cb-card" style={{ display: 'block', width: '100%', textAlign: 'left', padding: isDesktop ? 20 : 16, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', boxShadow: T.shadow }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor, flexShrink: 0 }}>
                  {EVENT_TYPE_ICONS[e.eventType] || Icons.calendar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{e.title}</span>
                    {countdown && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: T.accentTint, color: T.accent }}>{countdown}</span>}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '3px 8px', borderRadius: 5, background: e.status === 'active' ? T.successTint : e.status === 'upcoming' ? T.accentTint : T.bg, color: e.status === 'active' ? T.success : e.status === 'upcoming' ? T.accent : T.textMuted }}>{e.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
                    {new Date(e.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {e.endDate && ` — ${new Date(e.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: T.textDim }}>Read: {e.readCount || 0}/{e.totalCrew || 0}</span>
                      <div style={{ flex: 1, maxWidth: 120, height: 4, borderRadius: 2, background: T.bg, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: readPct === 100 ? T.success : T.accent, width: `${readPct}%` }} />
                      </div>
                    </div>
                    {e.updateCount > 0 && <span style={{ fontSize: 11, color: T.textDim }}>{e.updateCount} update{e.updateCount !== 1 ? 's' : ''}</span>}
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${typeColor}15`, color: typeColor, textTransform: 'capitalize' }}>{EVENT_TYPE_LABELS[e.eventType] || e.eventType}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminEventsScreen;
