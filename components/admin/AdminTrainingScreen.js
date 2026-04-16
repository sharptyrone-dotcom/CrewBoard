import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';
import ComplianceBar from '../shared/ComplianceBar';
import FilterChips from '../shared/FilterChips';
import Avatar from '../shared/Avatar';
import BackButton from '../shared/BackButton';

const AdminTrainingScreen = ({ trainingView, setTrainingView, selectedModule, setSelectedModule, adminTrainingResults, setAdminTrainingResults, trainingModules, trainingLoading, adminTrainDeptFilter, setAdminTrainDeptFilter, trainingReminderState, setTrainingReminderState, handleLoadAdminModuleResults, handleEditModule, handleSendTrainingReminder, isDesktop, currentUser }) => {
  // ── Module Results Dashboard ──
  if (trainingView === 'adminResults' && adminTrainingResults) {
    const r = adminTrainingResults;
    const deptFilteredAssignments = (r.assignments || []).filter(a => adminTrainDeptFilter === 'All' || a.department === adminTrainDeptFilter);
    const incompleteCrew = deptFilteredAssignments.filter(a => a.status !== 'completed');

    const sendReminder = async () => {
      if (trainingReminderState !== 'idle') return;
      const ids = incompleteCrew.map(a => a.crewMemberId);
      if (ids.length === 0) return;
      setTrainingReminderState('sending');
      try {
        await handleSendTrainingReminder(r, ids);
        setTrainingReminderState('sent');
        setTimeout(() => setTrainingReminderState('idle'), 3000);
      } catch { setTrainingReminderState('idle'); }
    };

    const departments = [...new Set((r.assignments || []).map(a => a.department).filter(Boolean))];

    return (
      <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
        <BackButton onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); setAdminTrainingResults(null); }} label="Training" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <h2 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: T.text, margin: 0, flex: 1, minWidth: 0 }}>{r.title}</h2>
          <button onClick={() => handleEditModule(r)} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${T.accent}`, background: T.accentTint, color: T.accentDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {Icons.file} Edit Module
          </button>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: isDesktop ? 14 : 10, marginBottom: 20 }}>
          <StatCard label="Completion" value={`${r.stats?.completionRate ?? 0}%`} icon={Icons.checkCircle} color={T.success} />
          <StatCard label="Avg Score" value={r.stats?.averageScore != null ? `${r.stats.averageScore}%` : '—'} icon={Icons.award} color={T.accent} />
          <StatCard label="Pass Rate" value={r.stats?.passRate != null ? `${r.stats.passRate}%` : '—'} icon={Icons.training} color={T.gold} />
          <StatCard label="Assigned" value={r.stats?.totalAssigned ?? 0} icon={Icons.crew} />
        </div>
        {/* Department filter */}
        {departments.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <FilterChips options={['All', ...departments]} selected={adminTrainDeptFilter} onChange={setAdminTrainDeptFilter} />
          </div>
        )}
        {/* Per-crew results */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Crew Results</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {deptFilteredAssignments.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, boxShadow: T.shadow }}>
              <Avatar initials={(a.crewName || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{a.crewName}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{a.role} — {a.department}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {a.bestScore != null && (
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: a.passed ? T.success : T.critical }}>{a.bestScore}%</span>
                )}
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '3px 8px', borderRadius: 6, color: a.status === 'completed' ? T.success : a.status === 'overdue' ? T.critical : a.status === 'in_progress' ? T.gold : T.accent, background: a.status === 'completed' ? T.successTint : a.status === 'overdue' ? T.criticalTint : a.status === 'in_progress' ? T.goldTint : T.accentGlow }}>
                  {a.status === 'in_progress' ? 'In Prog.' : a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Send reminder */}
        {incompleteCrew.length > 0 && (
          <button onClick={sendReminder} disabled={trainingReminderState !== 'idle'} style={{
            width: '100%', padding: 14, borderRadius: 12,
            border: `1px solid ${trainingReminderState === 'sent' ? T.success : T.gold}`,
            background: trainingReminderState === 'sent' ? T.successTint : T.goldTint,
            color: trainingReminderState === 'sent' ? T.success : '#b45309',
            fontSize: 14, fontWeight: 700,
            cursor: trainingReminderState === 'idle' ? 'pointer' : 'default',
            opacity: trainingReminderState === 'sending' ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {trainingReminderState === 'sending' ? 'Sending...' :
             trainingReminderState === 'sent' ? `${Icons.checkCircle} Reminder Sent` :
             `${Icons.send} Send Reminder to ${incompleteCrew.length} Crew`}
          </button>
        )}
      </div>
    );
  }

  // ── Admin Training Dashboard ──
  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Manage Training</h2>
      {trainingModules.length === 0 && !trainingLoading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: T.textMuted }}>
          <div style={{ color: T.accent, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{Icons.training}</div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>No training modules yet</p>
          <p style={{ fontSize: 12, margin: 0 }}>Tap + to create your first module</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trainingModules.map(m => {
          const stats = m.stats || {};
          return (
            <button key={m.id} onClick={() => handleLoadAdminModuleResults(m)} className="cb-card" style={{ display: 'flex', gap: isDesktop ? 18 : 14, padding: isDesktop ? '18px 22px' : '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: isDesktop ? 14 : 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow, alignItems: isDesktop ? 'center' : 'stretch' }}>
              <div style={{ width: 44, height: 50, borderRadius: 10, background: m.isPublished ? T.accentTint : T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.isPublished ? T.accentDark : T.textDim, flexShrink: 0 }}>
                {Icons.training}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.title}</span>
                  {!m.isPublished && <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, background: T.bg, padding: '2px 6px', borderRadius: 4 }}>DRAFT</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textMuted }}>
                  <span>{m.questionCount || 0} questions</span>
                  {stats.totalAssigned > 0 && (
                    <>
                      <span style={{ color: T.success }}>{stats.completed}/{stats.totalAssigned} completed</span>
                      {stats.completionRate !== undefined && <span>({stats.completionRate}%)</span>}
                    </>
                  )}
                  {stats.totalAssigned === 0 && <span>Not assigned</span>}
                </div>
                {stats.totalAssigned > 0 && (
                  <div style={{ marginTop: 8 }}><ComplianceBar value={stats.completionRate || 0} /></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTrainingScreen;
