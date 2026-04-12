import T from '../shared/theme';
import Icons from '../shared/Icons';
import StatCard from '../shared/StatCard';
import BackButton from '../shared/BackButton';

export default function CrewTrainingScreen({ trainingView, selectedModule, setTrainingView, setSelectedModule, quizQuestions, quizCurrent, quizAnswers, setQuizAnswers, setQuizCurrent, quizResults, setQuizResults, quizSubmitting, quizTimerLeft, handleStartQuiz, handleSubmitQuiz, trainingModules, trainingLoading, currentUser, resolveContentUrls, isDesktop }) {
  // ── Module Viewer ──
  if (trainingView === 'module' && selectedModule) {
    const mod = selectedModule;
    const hasFailed = mod.totalAttempts > 0 && !mod.passed;
    return (
      <div style={{ padding: 20 }}>
        <BackButton onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); }} label="Training" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 8px', lineHeight: 1.3 }}>{mod.title || mod.moduleTitle}</h2>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>{mod.description || mod.moduleDescription}</p>
        {/* Content blocks */}
        {(mod.content || []).map((block, i) => {
          if (block.type === 'text') return (
            <div key={i} style={{ fontSize: 14, color: T.text, lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>{block.value}</div>
          );
          if (block.type === 'image') return (
            <div key={i} style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <img src={block.resolvedUrl || block.value} alt={block.caption || 'Training image'} style={{ width: '100%', display: 'block' }} />
              {block.caption && <div style={{ fontSize: 12, color: T.textMuted, padding: '10px 14px', background: T.bg }}>{block.caption}</div>}
            </div>
          );
          if (block.type === 'video') return (
            <div key={i} style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}`, background: T.bg, padding: 40, textAlign: 'center' }}>
              <div style={{ color: T.accent, marginBottom: 8 }}>{Icons.video}</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>{block.value || 'Video content'}</div>
            </div>
          );
          return null;
        })}
        {/* Attachments */}
        {(mod.attachments || []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Attachments</h3>
            {mod.attachments.map((att, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 6, boxShadow: T.shadow }}>
                {Icons.file}
                <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{att.name || att.url || `Attachment ${i + 1}`}</span>
              </div>
            ))}
          </div>
        )}
        {/* Quiz button */}
        {(mod.questionCount || 0) > 0 && (
          <button onClick={() => handleStartQuiz(mod)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {Icons.play} {hasFailed ? 'Retake Quiz' : 'Start Quiz'}
          </button>
        )}
        {mod.passed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 16, color: T.success, fontWeight: 600, fontSize: 14, marginTop: 8 }}>
            {Icons.checkCircle} Completed — Score: {mod.bestScore}%
          </div>
        )}
      </div>
    );
  }

  // ── Quiz Screen ──
  if (trainingView === 'quiz' && quizQuestions.length > 0) {
    const q = quizQuestions[quizCurrent];
    const progress = ((quizCurrent + 1) / quizQuestions.length) * 100;
    const isLast = quizCurrent === quizQuestions.length - 1;
    const hasAnswer = !!quizAnswers[q.id];
    const timerMins = quizTimerLeft !== null ? Math.floor(quizTimerLeft / 60) : null;
    const timerSecs = quizTimerLeft !== null ? quizTimerLeft % 60 : null;
    return (
      <div style={{ padding: 20 }}>
        {/* Header with counter and optional timer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>Question {quizCurrent + 1} of {quizQuestions.length}</span>
          {quizTimerLeft !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: quizTimerLeft < 60 ? T.critical : T.text, fontFamily: "'JetBrains Mono', monospace" }}>
              {Icons.clock} {timerMins}:{String(timerSecs).padStart(2, '0')}
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: T.accent, borderRadius: 3, transition: 'width 0.3s ease' }} />
        </div>
        {/* Question image */}
        {q.questionImage && (
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            <img src={q.questionImage} alt="Question" style={{ width: '100%', display: 'block' }} />
          </div>
        )}
        {/* Question */}
        <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: '0 0 20px', lineHeight: 1.4 }}>{q.questionText}</h3>
        {/* Answer options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {(q.options || []).map(opt => {
            const selected = quizAnswers[q.id] === opt.id;
            return (
              <button key={opt.id} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))} className="cb-card" style={{
                width: '100%', padding: '16px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${selected ? T.accent : T.border}`,
                background: selected ? T.accentTint : T.bgCard,
                color: T.text, fontSize: 15, fontWeight: selected ? 700 : 500,
                transition: 'all 0.15s', boxShadow: selected ? `0 0 0 3px ${T.accentGlow}` : T.shadow,
              }}>
                {opt.text}
              </button>
            );
          })}
        </div>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10 }}>
          {quizCurrent > 0 && (
            <button onClick={() => setQuizCurrent(prev => prev - 1)} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Previous
            </button>
          )}
          {isLast ? (
            <button onClick={() => handleSubmitQuiz(selectedModule)} disabled={!hasAnswer || quizSubmitting} className="cb-btn-primary" style={{
              flex: 1, padding: 14, borderRadius: 12, border: 'none',
              background: !hasAnswer || quizSubmitting ? T.border : T.accent,
              color: !hasAnswer || quizSubmitting ? T.textDim : '#fff',
              fontSize: 14, fontWeight: 700, cursor: !hasAnswer || quizSubmitting ? 'default' : 'pointer',
            }}>
              {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button onClick={() => setQuizCurrent(prev => prev + 1)} disabled={!hasAnswer} style={{
              flex: 1, padding: 14, borderRadius: 12, border: 'none',
              background: hasAnswer ? T.accent : T.border,
              color: hasAnswer ? '#fff' : T.textDim,
              fontSize: 14, fontWeight: 700, cursor: hasAnswer ? 'pointer' : 'default',
            }}>
              Next Question
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (trainingView === 'results' && quizResults) {
    const r = quizResults;
    const passed = r.passed;
    return (
      <div style={{ padding: 20 }}>
        {/* Score */}
        <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 16px',
            background: passed ? T.successTint : T.criticalTint,
            border: `4px solid ${passed ? T.success : T.critical}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: passed ? T.success : T.critical,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {r.score}%
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>
            {passed ? 'You passed!' : 'Not quite \u2014 try again'}
          </h2>
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
            {r.correctCount} of {r.totalQuestions} correct {'\u00b7'} Pass mark: {r.passMark}%
          </p>
        </div>
        {/* Answer breakdown */}
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>Question Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {(r.answers || []).map((a, i) => (
            <div key={a.questionId || i} style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${a.isCorrect ? T.success : T.critical}30`, background: a.isCorrect ? '#f0fdf4' : '#fef2f2', boxShadow: T.shadow }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <span style={{ color: a.isCorrect ? T.success : T.critical, flexShrink: 0, marginTop: 1 }}>
                  {a.isCorrect ? Icons.checkCircle : Icons.x}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>
                  {a.questionText || `Question ${i + 1}`}
                </span>
              </div>
              {!a.isCorrect && a.correctOptionId && (
                <div style={{ fontSize: 12, color: T.textMuted, marginLeft: 30, marginBottom: 4 }}>
                  Correct answer: {quizQuestions.find(q => q.id === a.questionId)?.options?.find(o => o.id === a.correctOptionId)?.text || a.correctOptionId}
                </div>
              )}
              {a.explanation && (
                <div style={{ fontSize: 12, color: T.textMuted, marginLeft: 30, fontStyle: 'italic', lineHeight: 1.4 }}>
                  {a.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!passed && (
            <button onClick={() => handleStartQuiz(selectedModule)} className="cb-btn-primary" style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Retake Quiz
            </button>
          )}
          <button onClick={() => { setTrainingView('dashboard'); setSelectedModule(null); setQuizResults(null); }} style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  // ── Training Dashboard ──
  const active = trainingModules.filter(m => m.status !== 'completed');
  const completed = trainingModules.filter(m => m.status === 'completed');
  const handleOpenModule = async (mod) => {
    try {
      const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}?crew_member_id=${currentUser.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const resolvedContent = await resolveContentUrls(data.module.content || []);
      setSelectedModule({ ...mod, ...data.module, content: resolvedContent });
      setTrainingView('module');
    } catch (err) {
      console.error('[training] module load failed', err);
      setSelectedModule(mod);
      setTrainingView('module');
    }
  };

  const statusColor = (s) => s === 'overdue' ? T.critical : s === 'in_progress' ? T.gold : T.accent;
  const statusBg = (s) => s === 'overdue' ? T.criticalTint : s === 'in_progress' ? T.goldTint : T.accentGlow;
  const statusLabel = (s) => s === 'overdue' ? 'Overdue' : s === 'in_progress' ? 'In Progress' : s === 'completed' ? 'Completed' : 'Assigned';

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Training</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="Assigned" value={active.length} icon={Icons.training} />
        <StatCard label="Completed" value={completed.length} color={T.success} icon={Icons.award} />
      </div>
      {/* Active assignments */}
      {active.length > 0 && (
        <>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Active</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {active.map(m => (
              <button key={m.id || m.assignmentId} onClick={() => handleOpenModule(m)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '18px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
                <div style={{ width: 44, height: 50, borderRadius: 10, background: `${statusColor(m.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor(m.status), flexShrink: 0 }}>
                  {Icons.training}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>{m.title || m.moduleTitle}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: statusColor(m.status), background: statusBg(m.status), padding: '3px 8px', borderRadius: 6 }}>
                      {statusLabel(m.status)}
                    </span>
                    {m.deadline && (
                      <span style={{ fontSize: 11, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {Icons.calendar} {new Date(m.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {m.questionCount > 0 && <span style={{ fontSize: 11, color: T.textDim }}>{m.questionCount} questions</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {/* Completed */}
      {completed.length > 0 && (
        <>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>Completed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completed.map(m => (
              <button key={m.id || m.assignmentId} onClick={() => handleOpenModule(m)} className="cb-card" style={{ display: 'flex', gap: 14, padding: '16px 18px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: T.shadow }}>
                <div style={{ width: 40, height: 44, borderRadius: 8, background: T.successTint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success, flexShrink: 0 }}>
                  {Icons.award}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{m.title || m.moduleTitle}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: T.textMuted }}>
                    <span style={{ color: T.success, fontWeight: 700 }}>Score: {m.bestScore ?? '\u2014'}%</span>
                    {m.completedAt && <span>{new Date(m.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
                <span style={{ color: T.success, flexShrink: 0 }}>{Icons.checkCircle}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {trainingLoading && trainingModules.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>Loading training modules...</p>}
      {!trainingLoading && trainingModules.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No training modules assigned yet</p>}
    </div>
  );
}
