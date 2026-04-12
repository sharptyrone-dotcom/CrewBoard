import T from '../shared/theme';
import Icons from '../shared/Icons';

export default function CrewEventsScreen({ selectedEvent, setSelectedEvent, eventDetail, setEventDetail, eventDetailLoading, events, eventsLoading, eventFilter, setEventFilter, handleLoadEventDetail, handleMarkEventRead, getCountdown, EVENT_TYPE_ICONS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS }) {
  // Detail view
  if (selectedEvent && eventDetail) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => { setSelectedEvent(null); setEventDetail(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.accent, cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {Icons.arrowLeft} <span>Back to Events</span>
        </button>

        {eventDetailLoading ? (
          <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>Loading event...</p>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20, marginBottom: 12, boxShadow: T.shadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${EVENT_TYPE_COLORS[eventDetail.eventType] || T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: EVENT_TYPE_COLORS[eventDetail.eventType] || T.accent }}>
                  {EVENT_TYPE_ICONS[eventDetail.eventType] || Icons.calendar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: EVENT_TYPE_COLORS[eventDetail.eventType] || T.accent }}>
                    {EVENT_TYPE_LABELS[eventDetail.eventType] || 'Event'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{eventDetail.title}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '4px 10px', borderRadius: 6, background: eventDetail.status === 'active' ? T.successTint : eventDetail.status === 'upcoming' ? T.accentTint : T.bg, color: eventDetail.status === 'active' ? T.success : eventDetail.status === 'upcoming' ? T.accent : T.textMuted }}>
                  {eventDetail.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
                <span>{Icons.calendar} {new Date(eventDetail.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                {eventDetail.endDate && <span>to {new Date(eventDetail.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
              {eventDetail.description && <p style={{ fontSize: 13, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{eventDetail.description}</p>}

              {/* Restricted fields visible to this crew member */}
              {eventDetail.restrictedFields && Object.keys(eventDetail.restrictedFields).length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: T.goldTint, borderRadius: 10, border: `1px solid ${T.gold}30` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: T.gold, marginBottom: 6 }}>Restricted Information</div>
                  {Object.entries(eventDetail.restrictedFields).map(([key, config]) => (
                    <p key={key} style={{ fontSize: 13, color: T.text, margin: '4px 0' }}>{typeof config === 'object' ? config.value : config}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Briefings */}
            {(eventDetail.briefings || []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 8px' }}>Department Briefings</h3>
                {eventDetail.briefings.map((b) => (
                  <div key={b.id} style={{ background: T.bgCard, borderRadius: 14, border: `1px solid ${b.isMyDepartment ? T.accent + '40' : T.border}`, padding: 16, marginBottom: 8, boxShadow: T.shadow }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '3px 8px', borderRadius: 5, background: b.isMyDepartment ? T.accentTint : T.bg, color: b.isMyDepartment ? T.accent : T.textMuted }}>
                        {b.department}{b.isMyDepartment ? ' (You)' : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: T.text, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{b.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Attachments */}
            {(eventDetail.attachments || []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 8px' }}>Attachments</h3>
                {eventDetail.attachments.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: T.bgCard, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 6 }}>
                    {Icons.file}
                    <span style={{ fontSize: 13, color: T.text }}>{a.name || a}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Live Updates */}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 0 8px' }}>Live Updates</h3>
              {(eventDetail.updates || []).length === 0 ? (
                <p style={{ fontSize: 13, color: T.textDim, textAlign: 'center', padding: 20 }}>No updates yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {eventDetail.updates.map((u) => (
                    <div key={u.id} style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 14, boxShadow: T.shadow }}>
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

            {/* Mark as Read */}
            {!eventDetail.isRead && (
              <button onClick={() => handleMarkEventRead(eventDetail.id)} className="cb-btn-primary" style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                {Icons.check} Mark as Read
              </button>
            )}
            {eventDetail.isRead && (
              <div style={{ textAlign: 'center', padding: 12, color: T.success, fontSize: 13, fontWeight: 600 }}>
                {Icons.check} You have read this event
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Timeline list view
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Events</h2>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['upcoming', 'active', 'all'].map(f => (
          <button key={f} onClick={() => setEventFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${eventFilter === f ? T.accent : T.border}`, background: eventFilter === f ? T.accentTint : T.bgCard, color: eventFilter === f ? T.accent : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {eventsLoading && events.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>Loading events...</p>}
      {!eventsLoading && events.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 40 }}>No events found</p>}

      {/* Vertical timeline */}
      <div style={{ position: 'relative', paddingLeft: 24 }}>
        {/* Timeline line */}
        {events.length > 0 && <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: T.border }} />}

        {events.map((e) => {
          const countdown = getCountdown(e.startDate);
          const typeColor = EVENT_TYPE_COLORS[e.eventType] || T.accent;
          return (
            <div key={e.id} style={{ position: 'relative', marginBottom: 12 }}>
              {/* Timeline dot */}
              <div style={{ position: 'absolute', left: -20, top: 18, width: 12, height: 12, borderRadius: '50%', background: e.status === 'active' ? T.success : typeColor, border: '2px solid #fff', boxShadow: `0 0 0 2px ${e.status === 'active' ? T.success : typeColor}40` }} />

              <button onClick={() => { setSelectedEvent(e); handleLoadEventDetail(e); }} className="cb-card" style={{ display: 'block', width: '100%', textAlign: 'left', padding: 16, background: T.bgCard, border: `1px solid ${!e.isRead ? typeColor + '40' : T.border}`, borderRadius: 14, cursor: 'pointer', boxShadow: T.shadow }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor, flexShrink: 0 }}>
                    {EVENT_TYPE_ICONS[e.eventType] || Icons.calendar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>
                      {!e.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>
                      {new Date(e.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {e.endDate && ` \u2014 ${new Date(e.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {countdown && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: T.accentTint, color: T.accent }}>{countdown}</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${typeColor}15`, color: typeColor, textTransform: 'capitalize' }}>
                        {EVENT_TYPE_LABELS[e.eventType] || e.eventType}
                      </span>
                      {e.updateCount > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: T.textDim }}>{e.updateCount} update{e.updateCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {e.myBriefingPreview && (
                      <p style={{ fontSize: 12, color: T.textDim, margin: '6px 0 0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{e.myBriefingPreview}</p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
