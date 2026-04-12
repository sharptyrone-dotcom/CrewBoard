import T, { DEPARTMENTS } from '../shared/theme';
import Icons from '../shared/Icons';
import FilterChips from '../shared/FilterChips';

const ModuleBuilderModal = ({ moduleBuilderData, setModuleBuilderData, moduleBuilderSaving, editingModuleId, handleSaveModule, resetModuleBuilder, compressImage, crew, isDesktop }) => {
  const b = moduleBuilderData;
  const setB = (key, val) => setModuleBuilderData(prev => ({ ...prev, [key]: val }));
  const addContentBlock = (type) => setB('content', [...b.content, { type, value: '', caption: '' }]);
  const updateContentBlock = (idx, field, val) => {
    const next = [...b.content];
    next[idx] = { ...next[idx], [field]: val };
    setB('content', next);
  };
  const removeContentBlock = (idx) => setB('content', b.content.filter((_, i) => i !== idx));
  const moveContentBlock = (idx, dir) => {
    const next = [...b.content];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setB('content', next);
  };

  const addQuestion = () => setB('questions', [...b.questions, {
    questionText: '', questionImage: '', questionType: 'multiple_choice', explanation: '',
    options: [{ id: `o_${Date.now()}_0`, text: '', is_correct: false }, { id: `o_${Date.now()}_1`, text: '', is_correct: false }],
  }]);
  const updateQuestion = (qi, field, val) => {
    const next = [...b.questions];
    next[qi] = { ...next[qi], [field]: val };
    setB('questions', next);
  };
  const removeQuestion = (qi) => setB('questions', b.questions.filter((_, i) => i !== qi));
  const addOption = (qi) => {
    const next = [...b.questions];
    next[qi].options = [...next[qi].options, { id: `o_${Date.now()}_${next[qi].options.length}`, text: '', is_correct: false }];
    setB('questions', next);
  };
  const removeOption = (qi, oi) => {
    const next = [...b.questions];
    next[qi].options = next[qi].options.filter((_, i) => i !== oi);
    setB('questions', next);
  };
  const updateOption = (qi, oi, field, val) => {
    const next = [...b.questions];
    if (field === 'is_correct' && val) {
      next[qi].options = next[qi].options.map((o, i) => ({ ...o, is_correct: i === oi }));
    } else {
      next[qi].options = next[qi].options.map((o, i) => i === oi ? { ...o, [field]: val } : o);
    }
    setB('questions', next);
  };

  const inputStyle = { width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', overflow: 'auto' }} onClick={resetModuleBuilder}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bgModal, borderRadius: 20, width: '100%', maxWidth: 600, boxShadow: T.shadowLg, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0 }}>{editingModuleId ? 'Edit Training Module' : 'New Training Module'}</h2>
          <button onClick={resetModuleBuilder} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}>{Icons.x}</button>
        </div>
        <div style={{ padding: 24, maxHeight: 'calc(100vh - 180px)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title & Description */}
          <div>
            <label style={labelStyle}>Module Title *</label>
            <input value={b.title} onChange={e => setB('title', e.target.value)} placeholder="e.g. Fire Safety Procedures" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={b.description} onChange={e => setB('description', e.target.value)} rows={3} placeholder="Brief overview of the module..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          {/* Content Blocks */}
          <div>
            <label style={labelStyle}>Content Blocks</label>
            {b.content.map((block, i) => (
              <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, marginBottom: 8, background: T.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 }}>{block.type === 'text' ? 'Text' : block.type === 'image' ? 'Image' : 'Video URL'}</span>
                  <button onClick={() => moveContentBlock(i, -1)} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 2 }}>{Icons.arrowUp}</button>
                  <button onClick={() => moveContentBlock(i, 1)} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 2 }}>{Icons.arrowDown}</button>
                  <button onClick={() => removeContentBlock(i)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2 }}>{Icons.x}</button>
                </div>
                {block.type === 'text' ? (
                  <textarea value={block.value} onChange={e => updateContentBlock(i, 'value', e.target.value)} rows={4} placeholder="Enter text content..." style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }} />
                ) : block.type === 'image' ? (
                  block.value ? (
                    <div>
                      <img src={block.value} alt="Preview" style={{ width: '100%', borderRadius: 8, marginBottom: 8, display: 'block' }} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: T.success, flex: 1, fontWeight: 600 }}>{Icons.checkCircle} Image uploaded</span>
                        <button onClick={() => { const next = [...b.content]; next[i] = { ...next[i], value: '', previewUrl: '' }; setB('content', next); }} style={{ fontSize: 11, color: T.critical, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                      </div>
                      <input value={block.caption || ''} onChange={e => updateContentBlock(i, 'caption', e.target.value)} placeholder="Caption (optional)" style={{ ...inputStyle, fontSize: 12, padding: 8, marginTop: 8 }} />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 16px', border: `2px dashed ${T.border}`, borderRadius: 10, cursor: 'pointer', background: T.bgCard, transition: 'border-color 0.2s' }}>
                        <span style={{ color: T.accent, display: 'flex' }}>{Icons.image}</span>
                        <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>Choose image file</span>
                        <span style={{ fontSize: 11, color: T.textDim }}>JPG, PNG, or WebP</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImage(file);
                            const next = [...b.content];
                            next[i] = { ...next[i], value: dataUrl };
                            setB('content', next);
                          } catch (err) {
                            console.error('[training] image read failed', err);
                            alert('Failed to load image: ' + err.message);
                          }
                        }} />
                      </label>
                    </div>
                  )
                ) : (
                  <input value={block.value} onChange={e => updateContentBlock(i, 'value', e.target.value)} placeholder="https://..." style={{ ...inputStyle, fontSize: 13 }} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => addContentBlock('text')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.plus} Text</button>
              <button onClick={() => addContentBlock('image')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.image} Image</button>
              <button onClick={() => addContentBlock('video')} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px dashed ${T.border}`, background: 'none', color: T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{Icons.video} Video</button>
            </div>
          </div>
          {/* Quiz Questions */}
          <div>
            <label style={labelStyle}>Quiz Questions</label>
            {b.questions.map((q, qi) => (
              <div key={qi} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 10, background: T.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>Q{qi + 1}</span>
                  <select value={q.questionType} onChange={e => updateQuestion(qi, 'questionType', e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, background: T.bgCard }}>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="scenario">Scenario</option>
                  </select>
                  <button onClick={() => removeQuestion(qi)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2 }}>{Icons.x}</button>
                </div>
                <input value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} placeholder="Question text..." style={{ ...inputStyle, marginBottom: 8, fontSize: 13 }} />
                {/* Question image */}
                {q.questionImage ? (
                  <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}>
                    <img src={q.questionImage} alt="Question" style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
                    <button onClick={() => updateQuestion(qi, 'questionImage', '')} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{Icons.x}</button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: `1px dashed ${T.border}`, borderRadius: 8, cursor: 'pointer', marginBottom: 8, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
                    {Icons.image} <span>Add image</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await compressImage(file);
                        updateQuestion(qi, 'questionImage', dataUrl);
                      } catch (err) { alert('Failed to load image: ' + err.message); }
                    }} />
                  </label>
                )}
                {/* Options */}
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <input type="radio" name={`correct_${qi}`} checked={opt.is_correct} onChange={() => updateOption(qi, oi, 'is_correct', true)} style={{ cursor: 'pointer', accentColor: T.accent }} title="Mark as correct" />
                    <input value={opt.text} onChange={e => updateOption(qi, oi, 'text', e.target.value)} placeholder={`Option ${oi + 1}`} style={{ ...inputStyle, fontSize: 12, padding: 8, flex: 1 }} />
                    {q.options.length > 2 && (
                      <button onClick={() => removeOption(qi, oi)} style={{ background: 'none', border: 'none', color: T.critical, cursor: 'pointer', padding: 2, flexShrink: 0 }}>{Icons.minus}</button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button onClick={() => addOption(qi)} style={{ fontSize: 11, color: T.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{Icons.plus} Add Option</button>
                )}
                <input value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} placeholder="Explanation (shown after quiz)" style={{ ...inputStyle, marginTop: 8, fontSize: 12, padding: 8 }} />
              </div>
            ))}
            <button onClick={addQuestion} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px dashed ${T.accent}`, background: T.accentTint, color: T.accentDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>{Icons.plus} Add Question</button>
          </div>
          {/* Settings */}
          <div>
            <label style={labelStyle}>Settings</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 13, color: T.text, flex: 1 }}>Pass Mark</label>
                <input type="range" min={0} max={100} value={b.passMark} onChange={e => setB('passMark', parseInt(e.target.value))} style={{ flex: 1, accentColor: T.accent }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.accent, minWidth: 36, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{b.passMark}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: 13, color: T.text, flex: 1 }}>Time Limit (minutes)</label>
                <input type="number" min={1} value={b.timeLimitMinutes} onChange={e => setB('timeLimitMinutes', e.target.value)} placeholder="None" style={{ ...inputStyle, width: 80, padding: 8, textAlign: 'center' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={b.randomiseQuestions} onChange={e => setB('randomiseQuestions', e.target.checked)} style={{ accentColor: T.accent }} />
                <span style={{ fontSize: 13, color: T.text }}>Randomise question order</span>
              </label>
            </div>
          </div>
          {/* Assign */}
          <div>
            <label style={labelStyle}>Assign To</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ v: 'none', l: 'None' }, { v: 'all', l: 'All Crew' }, { v: 'department', l: 'Department' }].map(o => (
                <button key={o.v} onClick={() => setB('assignTo', o.v)} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${b.assignTo === o.v ? T.accent : T.border}`, background: b.assignTo === o.v ? T.accentTint : T.bgCard, color: b.assignTo === o.v ? T.accentDark : T.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{o.l}</button>
              ))}
            </div>
            {b.assignTo === 'department' && (
              <div style={{ marginTop: 8 }}>
                <FilterChips options={DEPARTMENTS.filter(d => d !== 'All')} selected={b.assignDept} onChange={v => setB('assignDept', v)} />
              </div>
            )}
            {b.assignTo !== 'none' && (
              <div style={{ marginTop: 10 }}>
                <label style={labelStyle}>Deadline (optional)</label>
                <input type="date" value={b.deadline} onChange={e => setB('deadline', e.target.value)} style={{ ...inputStyle, width: 180 }} />
              </div>
            )}
          </div>
          {/* Publish & Save */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button onClick={() => handleSaveModule(false)} disabled={!b.title.trim() || moduleBuilderSaving} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {editingModuleId ? 'Save Changes' : 'Save Draft'}
            </button>
            <button onClick={() => handleSaveModule(true)} disabled={!b.title.trim() || moduleBuilderSaving} className="cb-btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: !b.title.trim() || moduleBuilderSaving ? T.border : T.accent, color: !b.title.trim() || moduleBuilderSaving ? T.textDim : '#fff', fontSize: 14, fontWeight: 700, cursor: !b.title.trim() || moduleBuilderSaving ? 'default' : 'pointer' }}>
              {moduleBuilderSaving ? 'Saving...' : editingModuleId ? 'Save & Publish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleBuilderModal;
