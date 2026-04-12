import T, { CATEGORIES } from '../shared/theme';
import Icons from '../shared/Icons';
import FilterChips from '../shared/FilterChips';
import NoticeDetail from '../notices/NoticeDetail';
import NoticeCard from '../notices/NoticeCard';

export default function NoticesScreen({ selectedNotice, currentUser, notices, noticeFilter, searchQuery, setSearchQuery, setNoticeFilter, setSelectedNotice, setAdminNoticeView, handleAcknowledge, handleMarkRead, handlePollVote, role, crew, isDesktop, noticesLoading, noticesError }) {
  if (selectedNotice) return <NoticeDetail notice={selectedNotice} currentUser={currentUser} onBack={() => setSelectedNotice(null)} onAcknowledge={handleAcknowledge} onMarkRead={handleMarkRead} onPollVote={handlePollVote} />;
  const filtered = notices
    .filter(n => noticeFilter === 'All' || n.category === noticeFilter)
    .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);
  return (
    <div style={{ padding: isDesktop ? '28px 36px' : 20 }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 800, color: T.text, margin: '0 0 16px' }}>Notices</h2>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textDim }}>{Icons.search}</div>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notices..." style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', boxShadow: T.shadow }} />
      </div>
      <FilterChips options={CATEGORIES} selected={noticeFilter} onChange={setNoticeFilter} />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} isPinned isDesktop={isDesktop} />)}
        {unpinned.map(n => <NoticeCard key={n.id} notice={n} currentUser={currentUser} role={role} onClick={() => role === 'admin' ? setAdminNoticeView(n) : setSelectedNotice(n)} crewCount={crew.length} isDesktop={isDesktop} />)}
        {noticesLoading && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>Loading notices\u2026</p>}
        {noticesError && <p style={{ fontSize: 13, color: T.critical, textAlign: 'center', padding: 30 }}>Error loading notices: {noticesError}</p>}
        {!noticesLoading && !noticesError && filtered.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: 30 }}>No notices found</p>}
      </div>
    </div>
  );
}
