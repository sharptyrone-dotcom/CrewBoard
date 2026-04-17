'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from '@/lib/auth';
import { fetchCrew } from '@/lib/crew';
import { acknowledgeDocument, deleteDocument, fetchDocuments, getDocumentSignedUrl, replaceDocument, uploadDocument } from '@/lib/documents';
import { acknowledgeNotice, archiveNotices, castPollVote, createNotice, deleteNotice, fetchNotices, markNoticeRead, rowToNotice, updateNoticesPinned } from '@/lib/notices';
import { createBroadcastNotification, createTargetedNotification, fetchNotifications, markNotificationRead, rowToNotification } from '@/lib/notifications';
import { ACTIVITY_ACTIONS, fetchActivity, logActivity } from '@/lib/activity';
import useRealtime from '@/hooks/useRealtime';
import usePresence from '@/hooks/usePresence';
import useMediaQuery from '@/hooks/useMediaQuery';
import useOfflineDocuments from '@/hooks/useOfflineDocuments';
import useCustomTaxonomies from '@/hooks/useCustomTaxonomies';
import { trackNoticeRead, trackDocumentAcknowledged, trackQuizCompleted, trackEventRead } from '@/lib/analytics';
import OfflineIndicator from '@/components/OfflineIndicator';
import { isPushSupported, getPushPermission, subscribeToPush, isSubscribed as checkPushSubscribed } from '@/lib/push';
import { sendReminderChannels } from '@/lib/send-reminder';
import { filterByPreference, getPreferenceKey } from '@/lib/notification-preferences';

// ─── Extracted component imports ────────────────────────────────────
import T from './shared/theme';
import Icons, { Icon } from './shared/Icons';

// Crew screens
import CrewHome from './crew/CrewHome';
import NoticesScreen from './crew/NoticesScreen';
import DocsScreen from './crew/DocsScreen';
import CrewProfile from './crew/CrewProfile';
import NotificationPreferences from './crew/NotificationPreferences';
import CrewTrainingScreen from './crew/CrewTrainingScreen';
import CrewEventsScreen from './crew/CrewEventsScreen';

// Admin screens
import AdminDashboard from './admin/AdminDashboard';
import CrewManagement from './admin/CrewManagement';
import AdminActivityLog from './admin/AdminActivityLog';
import AdminTrainingScreen from './admin/AdminTrainingScreen';
import AdminEventsScreen from './admin/AdminEventsScreen';
import TaxonomySettings from './admin/TaxonomySettings';

// Keyboard shortcuts
import { useKeyboardShortcuts, ShortcutsOverlay } from './shared/KeyboardShortcuts';

// Standalone detail components
import AdminNoticeDetail from './notices/AdminNoticeDetail';

// Modals
import NewNoticeModal from './modals/NewNoticeModal';
import NewDocumentModal from './modals/NewDocumentModal';
import ReplaceDocumentModal from './modals/ReplaceDocumentModal';
import ExportReportModal from './modals/ExportReportModal';
import ModuleBuilderModal from './modals/ModuleBuilderModal';
import NewEventModal from './modals/NewEventModal';
import NotificationsPanel from './modals/NotificationsPanel';

// Layout
import Sidebar from './layout/Sidebar';
import Avatar from './shared/Avatar';

// ─────────────────────────────────────────────────────────────────────

export default function CrewNotice({ user }) {
  // Admins default to the admin view but can flip to the crew view to
  // preview what their crew sees. Non-admins are locked to 'crew'.
  const [role, setRole] = useState(user?.isAdmin ? 'admin' : 'crew');
  const [tab, setTab] = useState('home');
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesError, setNoticesError] = useState(null);
  const [crew, setCrew] = useState([]);
  const [crewLoading, setCrewLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [noticeFilter, setNoticeFilter] = useState('All');
  const [docDeptFilter, setDocDeptFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  // Quick Access — per-crew-member document favorites stored in localStorage.
  const [quickAccessIds, setQuickAccessIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(`crewnotice_quickaccess_${user?.id}`) || '[]');
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  // Document library search is independent from the notices search so that
  // switching tabs doesn't wipe what the crew member was looking for.
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [showNewNotice, setShowNewNotice] = useState(false);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [selectedCrewMember, setSelectedCrewMember] = useState(null);
  const [adminNoticeView, setAdminNoticeView] = useState(null);
  // Dashboard "Send Reminder" button state: idle → sending → sent/empty → idle
  const [dashReminderState, setDashReminderState] = useState('idle');
  const [dashReminderSentCount, setDashReminderSentCount] = useState(0);
  const [newNotice, setNewNotice] = useState({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '', pollEnabled: false, pollOptions: ['', ''] });
  const [newDoc, setNewDoc] = useState({ file: null, title: '', docType: 'SOPs', department: 'General', version: '1.0', reviewDate: '', isRequired: false, pageCount: '' });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showReplaceDoc, setShowReplaceDoc] = useState(false);
  const [replaceDocState, setReplaceDocState] = useState({ file: null, version: '', versionNotes: '', pageCount: '' });
  const [replacingDoc, setReplacingDoc] = useState(false);
  const [noticeToast, setNoticeToast] = useState(null);
  // Export report modal state.
  const [showExportReport, setShowExportReport] = useState(false);
  const [exportType, setExportType] = useState('compliance_pdf');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  // Push notification state
  const [pushState, setPushState] = useState('loading');
  const [pushDismissed, setPushDismissed] = useState(false);
  const [showNotifPrefs, setShowNotifPrefs] = useState(false);

  // ── Training system state ──
  const [trainingModules, setTrainingModules] = useState([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [trainingView, setTrainingView] = useState('dashboard');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCurrent, setQuizCurrent] = useState(0);
  const [quizResults, setQuizResults] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizTimerLeft, setQuizTimerLeft] = useState(null);
  const [adminTrainingResults, setAdminTrainingResults] = useState(null);
  const [adminTrainDeptFilter, setAdminTrainDeptFilter] = useState('All');
  const [showModuleBuilder, setShowModuleBuilder] = useState(false);
  const [moduleBuilderData, setModuleBuilderData] = useState({
    title: '', description: '', content: [], passMark: 80, timeLimitMinutes: '',
    randomiseQuestions: false, isPublished: false,
    questions: [], assignTo: 'none', assignDept: 'All', assignIds: [], deadline: '',
  });
  const [moduleBuilderSaving, setModuleBuilderSaving] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [trainingReminderState, setTrainingReminderState] = useState('idle');

  // ── Events system state ──
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [adminEventView, setAdminEventView] = useState(null);
  const [adminEventDetail, setAdminEventDetail] = useState(null);
  const [adminEventDetailLoading, setAdminEventDetailLoading] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [eventFilter, setEventFilter] = useState('upcoming');
  const [newEventData, setNewEventData] = useState({
    title: '', description: '', event_type: 'custom', start_date: '', start_time: '',
    end_date: '', end_time: '', attachments: [], restricted_fields: {},
    notification_schedule: [
      { days_before: 7, sent: false },
      { days_before: 3, sent: false },
      { days_before: 1, sent: false },
    ],
    briefings: [],
    restrictedEnabled: false,
    restrictedValue: '',
    restrictedRoles: [],
  });
  const [eventSaving, setEventSaving] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  const currentUser = user || { id: null, name: '', role: '', dept: '', avatar: '', isAdmin: false, vesselId: null };

  // Desktop breakpoint: only admin role gets the wide layout.
  const mqDesktop = useMediaQuery('(min-width: 768px)');
  const isDesktop = role === 'admin' && mqDesktop;

  const { onlineCrewIds } = usePresence({ vesselId: currentUser.vesselId, user: currentUser });

  const {
    cacheDocument, isCached: isDocCached, getCachedUrl, clearCached: clearCachedDoc,
    clearAll: clearAllCachedDocs, cachedIds: offlineCachedIds, formattedSize: offlineCacheSize,
  } = useOfflineDocuments(currentUser.id);

  const [cachingDocId, setCachingDocId] = useState(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Custom taxonomies (departments, doc types, notice categories)
  const taxonomies = useCustomTaxonomies(currentUser);

  const liveCrew = useMemo(
    () => crew.map(c => ({ ...c, online: onlineCrewIds.has(c.id) || c.online })),
    [crew, onlineCrewIds],
  );

  // Keep detail-view snapshots in sync with the canonical notices array
  useEffect(() => {
    if (selectedNotice) {
      const fresh = notices.find(n => n.id === selectedNotice.id);
      if (fresh && fresh !== selectedNotice) setSelectedNotice(fresh);
    }
    if (adminNoticeView) {
      const fresh = notices.find(n => n.id === adminNoticeView.id);
      if (fresh && fresh !== adminNoticeView) setAdminNoticeView(fresh);
    }
  }, [notices]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchNotices();
        if (!cancelled) {
          setNotices(rows);
          setNoticesError(null);
        }
      } catch (err) {
        if (!cancelled) setNoticesError(err.message || 'Failed to load notices');
      } finally {
        if (!cancelled) setNoticesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCrew();
        if (!cancelled) setCrew(rows);
      } catch (err) {
        console.error('crew fetch failed', err);
      } finally {
        if (!cancelled) setCrewLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchDocuments();
        if (!cancelled) setDocs(rows);
      } catch (err) {
        console.error('documents fetch failed', err);
      } finally {
        if (!cancelled) setDocsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchNotifications(currentUser.id);
        if (!cancelled) setNotifications(rows);
      } catch (err) {
        console.error('notifications fetch failed', err);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchActivity({ limit: 100 });
        if (!cancelled) setActivity(rows);
      } catch (err) {
        console.error('activity fetch failed', err);
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Training data fetch ──
  useEffect(() => {
    if (!currentUser.id || !currentUser.vesselId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/training/modules?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}&role=${role}`);
        const data = await res.json();
        if (!cancelled) setTrainingModules(data.modules || []);
      } catch (err) {
        console.error('[training] fetch failed', err);
      } finally {
        if (!cancelled) setTrainingLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id, currentUser.vesselId, role]);

  // ── Events data fetch ──
  useEffect(() => {
    if (!currentUser.id || !currentUser.vesselId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/events?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}&role=${role}&include_past=${eventFilter === 'past' ? 'true' : 'false'}${eventFilter !== 'past' && eventFilter !== 'all' ? `&status=${eventFilter}` : eventFilter === 'all' ? '&include_past=true' : ''}`);
        const data = await res.json();
        if (!cancelled) setEvents(data.events || []);
      } catch (err) {
        console.error('[events] fetch failed', err);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id, currentUser.vesselId, role, eventFilter]);

  // Push notification check
  useEffect(() => {
    if (!currentUser.id) return;
    if (!isPushSupported()) { setPushState('unsupported'); return; }
    const perm = getPushPermission();
    if (perm === 'denied') { setPushState('denied'); return; }
    checkPushSubscribed().then(sub => {
      setPushState(sub ? 'subscribed' : 'prompt');
    });
  }, [currentUser.id]);

  // Realtime fan-out
  useRealtime({
    vesselId: currentUser.vesselId,
    userId: currentUser.id,
    onNoticeInsert: (row) => {
      const mapped = rowToNotice(row);
      setNotices(prev => (prev.some(n => n.id === mapped.id) ? prev : [mapped, ...prev]));
      if (tab !== 'notices' && row.created_by && row.created_by !== currentUser.id) {
        const toast = { id: mapped.id, title: mapped.title, priority: mapped.priority };
        setNoticeToast(toast);
        setTimeout(() => {
          setNoticeToast(curr => (curr && curr.id === toast.id ? null : curr));
        }, 6000);
      }
    },
    onNoticeUpdate: (row) => {
      const mapped = rowToNotice(row);
      setNotices(prev => prev.map(n => (
        n.id === mapped.id
          ? { ...n, ...mapped, readBy: n.readBy, acknowledgedBy: n.acknowledgedBy }
          : n
      )));
    },
    onNoticeDelete: (row) => {
      setNotices(prev => prev.filter(n => n.id !== row.id));
      setNoticeToast(curr => (curr && curr.id === row.id ? null : curr));
      setSelectedNotice(curr => (curr && curr.id === row.id ? null : curr));
      setAdminNoticeView(curr => (curr && curr.id === row.id ? null : curr));
    },
    onNotificationInsert: (row) => {
      const mapped = rowToNotification(row);
      setNotifications(prev => (prev.some(n => n.id === mapped.id) ? prev : [mapped, ...prev]));
    },
    onNoticeReadChange: (payload) => {
      const row = payload.new || payload.old;
      if (!row) return;
      setNotices(prev => prev.map(n => {
        if (n.id !== row.notice_id) return n;
        if (payload.eventType === 'DELETE') {
          return {
            ...n,
            readBy: n.readBy.filter(id => id !== row.crew_member_id),
            acknowledgedBy: n.acknowledgedBy.filter(id => id !== row.crew_member_id),
          };
        }
        const readBy = Array.from(new Set([...n.readBy, row.crew_member_id]));
        const acknowledgedBy = row.acknowledged_at
          ? Array.from(new Set([...n.acknowledgedBy, row.crew_member_id]))
          : n.acknowledgedBy.filter(id => id !== row.crew_member_id);
        return { ...n, readBy, acknowledgedBy };
      }));
    },
    onPollVoteChange: (payload) => {
      const row = payload.new || payload.old;
      if (!row) return;
      setNotices(prev => prev.map(n => {
        if (n.id !== row.notice_id) return n;
        if (payload.eventType === 'DELETE') {
          return { ...n, pollVotes: (n.pollVotes || []).filter(v => v.crewMemberId !== row.crew_member_id) };
        }
        const existing = (n.pollVotes || []).filter(v => v.crewMemberId !== row.crew_member_id);
        return { ...n, pollVotes: [...existing, { crewMemberId: row.crew_member_id, optionId: row.option_id }] };
      }));
    },
    onEventUpdateInsert: (row) => {
      if (!row || !row.event_id) return;
      // Append the update to the currently-open event detail (if viewing it).
      const mapped = {
        id: row.id,
        eventId: row.event_id,
        content: row.content,
        createdAt: row.created_at,
        createdBy: '',
        createdByRole: '',
      };
      setAdminEventDetail(prev => {
        if (!prev || prev.id !== row.event_id) return prev;
        const exists = (prev.updates || []).some(u => u.id === row.id);
        return exists ? prev : { ...prev, updates: [mapped, ...(prev.updates || [])] };
      });
      setEventDetail(prev => {
        if (!prev || prev.id !== row.event_id) return prev;
        const exists = (prev.updates || []).some(u => u.id === row.id);
        return exists ? prev : { ...prev, updates: [mapped, ...(prev.updates || [])] };
      });
    },
  });

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadNotices = notices.filter(n => !n.readBy.includes(currentUser.id)).length;
  const pendingAcks = notices.filter(n => n.priority === 'critical' && !n.acknowledgedBy.includes(currentUser.id)).length;
  const pendingDocAcks = docs.filter(d => d.required && !d.acknowledgedBy.includes(currentUser.id)).length;

  const recordActivity = async ({ action, targetType, targetId, metadata }) => {
    const optimistic = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      crewMemberId: currentUser.id,
      action,
      targetType,
      targetId,
      metadata: metadata || null,
      createdAt: new Date().toISOString(),
    };
    setActivity(prev => [optimistic, ...prev]);
    try {
      await logActivity({ crewMemberId: currentUser.id, action, targetType, targetId, metadata });
    } catch (err) {
      // helper already logs
    }
  };

  const handleAcknowledge = async (noticeId) => {
    const notice = notices.find(n => n.id === noticeId);
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedBy: [...n.acknowledgedBy, currentUser.id], readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
    try {
      await acknowledgeNotice({ noticeId, crewMemberId: currentUser.id });
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_ACKNOWLEDGED,
        targetType: 'notice',
        targetId: noticeId,
        metadata: notice ? { title: notice.title } : null,
      });
    } catch (err) {
      console.error('acknowledge failed, reverting', err);
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, acknowledgedBy: n.acknowledgedBy.filter(id => id !== currentUser.id) } : n));
    }
  };

  const handleAckDoc = async (docId) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, acknowledgedBy: [...new Set([...d.acknowledgedBy, currentUser.id])] } : d));
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(prev => ({ ...prev, acknowledgedBy: [...new Set([...prev.acknowledgedBy, currentUser.id])] }));
    }
    try {
      await acknowledgeDocument({ documentId: docId, crewMemberId: currentUser.id, version: doc.version });
      trackDocumentAcknowledged(docId, doc.docType);
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_ACKNOWLEDGED,
        targetType: 'document',
        targetId: docId,
        metadata: { title: doc.title, version: doc.version },
      });
    } catch (err) {
      console.error('acknowledgeDocument failed, reverting', err);
      setDocs(prev => prev.map(d => d.id === docId ? { ...d, acknowledgedBy: d.acknowledgedBy.filter(id => id !== currentUser.id) } : d));
    }
  };

  // Fired by DocDetail *after* a fresh read row is successfully inserted
  // on the server. The network write already happened — this handler's
  // only job is to push the current user into the local docs/selectedDoc
  // state so the UI reflects the new read without a refetch. If the
  // upsert collapsed (row already existed) DocDetail won't call us.
  const handleDocumentRead = (docId) => {
    if (!currentUser?.id) return;
    setDocs(prev => prev.map(d => {
      if (d.id !== docId) return d;
      const existing = Array.isArray(d.readBy) ? d.readBy : [];
      if (existing.includes(currentUser.id)) return d;
      const existingReceipts = Array.isArray(d.readReceipts) ? d.readReceipts : [];
      return {
        ...d,
        readBy: [...existing, currentUser.id],
        readReceipts: [...existingReceipts, { crewMemberId: currentUser.id, readAt: new Date().toISOString() }],
      };
    }));
    setSelectedDoc(prev => {
      if (!prev || prev.id !== docId) return prev;
      const existing = Array.isArray(prev.readBy) ? prev.readBy : [];
      if (existing.includes(currentUser.id)) return prev;
      const existingReceipts = Array.isArray(prev.readReceipts) ? prev.readReceipts : [];
      return {
        ...prev,
        readBy: [...existing, currentUser.id],
        readReceipts: [...existingReceipts, { crewMemberId: currentUser.id, readAt: new Date().toISOString() }],
      };
    });
  };

  const handleMarkRead = async (noticeId) => {
    const notice = notices.find(n => n.id === noticeId);
    setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
    try {
      await markNoticeRead({ noticeId, crewMemberId: currentUser.id });
      if (notice) trackNoticeRead(noticeId, notice.category, notice.priority);
    } catch (err) {
      console.error('markRead failed', err);
    }
  };

  const handlePollVote = async (noticeId, optionId) => {
    setNotices(prev => prev.map(n => {
      if (n.id !== noticeId) return n;
      const filtered = (n.pollVotes || []).filter(v => v.crewMemberId !== currentUser.id);
      return { ...n, pollVotes: [...filtered, { crewMemberId: currentUser.id, optionId }] };
    }));
    if (!notices.find(n => n.id === noticeId)?.readBy.includes(currentUser.id)) {
      setNotices(prev => prev.map(n => n.id === noticeId ? { ...n, readBy: [...new Set([...n.readBy, currentUser.id])] } : n));
      markNoticeRead({ noticeId, crewMemberId: currentUser.id }).catch(() => {});
    }
    try {
      await castPollVote({ noticeId, crewMemberId: currentUser.id, optionId });
    } catch (err) {
      console.error('pollVote failed, reverting', err);
      setNotices(prev => prev.map(n => {
        if (n.id !== noticeId) return n;
        return { ...n, pollVotes: (n.pollVotes || []).filter(v => v.crewMemberId !== currentUser.id) };
      }));
    }
  };

  const toggleQuickAccess = (docId) => {
    setQuickAccessIds(prev => {
      const next = prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId];
      try { localStorage.setItem(`crewnotice_quickaccess_${currentUser.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleReadNotif = async (id) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markNotificationRead(id, currentUser.id, { targetCrewId: target.targetCrewId });
    } catch (err) {
      console.error('markNotificationRead failed, reverting', err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const navigateToNotice = (notice) => {
    if (!notice) return;
    setSelectedDoc(null);
    if (role === 'admin') {
      setSelectedNotice(null);
      setAdminNoticeView(notice);
    } else {
      setAdminNoticeView(null);
      setSelectedNotice(notice);
    }
    setTab('notices');
  };

  const navigateToDocument = (doc) => {
    if (!doc) return;
    setSelectedNotice(null);
    setAdminNoticeView(null);
    setSelectedDoc(doc);
    setTab('docs');
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    handleReadNotif(notification.id);

    const routesToNotice = notification.type === 'notice' || notification.type === 'reminder';
    const routesToDocument = notification.type === 'document';
    const routesToEvent = notification.refType === 'event';
    if (!routesToNotice && !routesToDocument && !routesToEvent) return;

    const findItem = (items) => {
      if (!Array.isArray(items) || items.length === 0) return null;
      if (notification.ref) {
        const byRef = items.find(i => i.id === notification.ref);
        if (byRef) return byRef;
      }
      const body = (notification.body || '').toLowerCase();
      const title = (notification.title || '').toLowerCase();
      const byBody = body
        ? items.find(i => i.title && body.includes(i.title.toLowerCase()))
        : null;
      if (byBody) return byBody;
      const byTitle = title
        ? items.find(i => i.title && title.includes(i.title.toLowerCase()))
        : null;
      return byTitle || null;
    };

    if (routesToEvent) {
      setSelectedNotice(null);
      setSelectedDoc(null);
      setAdminNoticeView(null);
      setTab('events');
      // Open the event detail. handleLoadEventDetail expects { id }.
      if (notification.ref) {
        const isAdmin = role === 'admin';
        if (isAdmin) { setAdminEventView('detail'); }
        else { setSelectedEvent(notification.ref); }
        handleLoadEventDetail({ id: notification.ref }, isAdmin);
      }
      return;
    }

    if (routesToNotice) {
      const notice = findItem(notices);
      if (notice) {
        navigateToNotice(notice);
      } else {
        setSelectedDoc(null);
        setSelectedNotice(null);
        setAdminNoticeView(null);
        setTab('notices');
      }
      return;
    }

    if (routesToDocument) {
      const stale = findItem(docs);
      if (stale) {
        navigateToDocument(stale);
      } else {
        setSelectedNotice(null);
        setAdminNoticeView(null);
        setSelectedDoc(null);
        setTab('docs');
      }
      (async () => {
        try {
          const fresh = await fetchDocuments();
          setDocs(fresh);
          const freshDoc = (() => {
            if (notification.ref) {
              const byRef = fresh.find(i => i.id === notification.ref);
              if (byRef) return byRef;
            }
            const body = (notification.body || '').toLowerCase();
            const title = (notification.title || '').toLowerCase();
            return (
              fresh.find(i => i.title && body.includes(i.title.toLowerCase())) ||
              fresh.find(i => i.title && title.includes(i.title.toLowerCase())) ||
              null
            );
          })();
          if (freshDoc) {
            setSelectedDoc(freshDoc);
          }
        } catch (err) {
          console.error('[notification] document refetch failed', err);
        }
      })();
    }
  };

  const handlePostNotice = async () => {
    if (!newNotice.title.trim()) return;
    try {
      const validUntilIso = newNotice.validUntil
        ? new Date(newNotice.validUntil).toISOString()
        : null;
      let pollOpts = null;
      if (newNotice.pollEnabled && newNotice.category === 'Social') {
        const validOpts = newNotice.pollOptions.filter(o => o.trim());
        if (validOpts.length >= 2) {
          pollOpts = validOpts.map((text, i) => ({
            id: `opt_${i}_${Date.now()}`,
            text: text.trim(),
          }));
        }
      }
      const posted = await createNotice({
        ...newNotice,
        validUntil: validUntilIso,
        createdBy: currentUser.id,
        pollOptions: pollOpts,
      });
      setNotices(prev => [posted, ...prev]);
      setNewNotice({ title: '', body: '', category: 'Safety', priority: 'routine', dept: 'All', pinned: false, requireAck: false, validUntil: '', pollEnabled: false, pollOptions: ['', ''] });
      setShowNewNotice(false);
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_POSTED,
        targetType: 'notice',
        targetId: posted.id,
        metadata: { title: posted.title, priority: posted.priority },
      });
      try {
        const notif = await createBroadcastNotification({
          type: 'notice',
          title: posted.priority === 'critical' ? 'New critical notice' : 'New notice posted',
          body: posted.title,
          referenceType: 'notice',
          referenceId: posted.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to post notice: ${err.message || err}`);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) return;
    const confirmed = window.confirm(
      `Delete "${notice.title}"? This cannot be undone and will remove the notice for everyone on board.`
    );
    if (!confirmed) return;
    try {
      await deleteNotice({ noticeId });
      setNotices(prev => prev.filter(n => n.id !== noticeId));
      setAdminNoticeView(null);
      setSelectedNotice(null);
      recordActivity({
        action: ACTIVITY_ACTIONS.NOTICE_DELETED,
        targetType: 'notice',
        targetId: noticeId,
        metadata: { title: notice.title },
      });
    } catch (err) {
      alert(`Failed to delete notice: ${err?.message || err}`);
    }
  };

  const handleSendNoticeReminder = async (notice) => {
    const nonReaders = liveCrew.filter(cm => !notice.readBy.includes(cm.id));
    if (nonReaders.length === 0) return;
    const reminderTitle = `Reminder: ${notice.priority === 'critical' ? 'CRITICAL — ' : ''}Please read "${notice.title}"`;
    const reminderBody = `You have an unread ${notice.priority} notice that requires your attention.`;

    // Filter by notification preferences (critical always sends)
    const prefKey = getPreferenceKey({ type: 'notice', priority: notice.priority, refType: 'notice' });
    const eligibleIds = await filterByPreference(nonReaders.map(cm => cm.id), prefKey);
    const eligibleCrew = nonReaders.filter(cm => eligibleIds.includes(cm.id));
    if (eligibleCrew.length === 0) throw new Error('All targeted crew have muted this notification type.');

    const results = await Promise.allSettled(
      eligibleCrew.map(cm =>
        createTargetedNotification({
          targetCrewId: cm.id,
          type: 'reminder',
          title: reminderTitle,
          body: reminderBody,
          referenceType: 'notice',
          referenceId: notice.id,
        })
      )
    );
    const sent = results.filter(r => r.status === 'fulfilled').length;
    if (sent === 0) throw new Error('All reminder sends failed — check your connection.');

    sendReminderChannels({
      crewMemberIds: eligibleCrew.map(cm => cm.id),
      title: reminderTitle,
      body: reminderBody,
      refType: 'notice',
      refId: notice.id,
    }).catch(err => console.error('[reminder] email+push failed (non-fatal)', err));

    recordActivity({
      action: 'reminder_sent',
      targetType: 'notice',
      targetId: notice.id,
      metadata: { title: notice.title, recipientCount: sent },
    });
  };

  const handleBulkCrewAction = async (action, crewIds) => {
    const targets = liveCrew.filter(c => crewIds.includes(c.id));
    if (targets.length === 0) return;
    try {
      if (action === 'remind') {
        // Per-crew reminder rollup: find each target's outstanding items and
        // send a single notification with the summary.
        // Filter by admin_reminders preference
        const eligibleIds = await filterByPreference(targets.map(c => c.id), 'admin_reminders');
        const eligibleTargets = targets.filter(c => eligibleIds.includes(c.id));
        const results = await Promise.allSettled(eligibleTargets.map(async (cm) => {
          const unreadCritical = notices.filter(n => n.priority === 'critical' && !n.readBy.includes(cm.id));
          const unackedDocs = docs.filter(d => d.required && !d.acknowledgedBy.includes(cm.id));
          if (unreadCritical.length === 0 && unackedDocs.length === 0) return;
          const parts = [];
          if (unreadCritical.length > 0) parts.push(`${unreadCritical.length} unread critical notice${unreadCritical.length > 1 ? 's' : ''}`);
          if (unackedDocs.length > 0) parts.push(`${unackedDocs.length} document${unackedDocs.length > 1 ? 's' : ''} pending ack`);
          return createTargetedNotification({
            targetCrewId: cm.id,
            type: 'reminder',
            title: 'Outstanding compliance items',
            body: `You have ${parts.join(' and ')}.`,
            referenceType: 'bulk_reminder',
            referenceId: null,
          });
        }));
        const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
        setNoticeToast({ id: targets[0].id, title: `Reminder sent to ${sent} crew`, priority: 'routine' });
        setTimeout(() => setNoticeToast(null), 2500);
      } else if (action === 'export') {
        // Simple CSV export — captures current compliance snapshot.
        const rows = [['Name', 'Role', 'Department', 'Notices Read', 'Docs Acked', 'Compliance %']];
        const requiredDocs = docs.filter(d => d.required);
        targets.forEach(cm => {
          const read = notices.filter(n => n.readBy.includes(cm.id)).length;
          const acked = requiredDocs.filter(d => d.acknowledgedBy.includes(cm.id)).length;
          const total = notices.length + requiredDocs.length;
          const score = total > 0 ? Math.round(((read + acked) / total) * 100) : 0;
          rows.push([cm.name, cm.role, cm.dept, `${read}/${notices.length}`, `${acked}/${requiredDocs.length}`, `${score}%`]);
        });
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crew-compliance-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('[bulk crew action] failed', err);
      alert(`Bulk action failed: ${err?.message || err}`);
    }
  };

  const handleBulkNoticeAction = async (action, noticeIds) => {
    const targets = notices.filter(n => noticeIds.includes(n.id));
    if (targets.length === 0) return;
    try {
      if (action === 'delete') {
        await Promise.all(targets.map(n => deleteNotice({ noticeId: n.id })));
        setNotices(prev => prev.filter(n => !noticeIds.includes(n.id)));
        targets.forEach(n => recordActivity({
          action: ACTIVITY_ACTIONS.NOTICE_DELETED,
          targetType: 'notice',
          targetId: n.id,
          metadata: { title: n.title, bulk: true },
        }));
      } else if (action === 'remind') {
        const results = await Promise.allSettled(targets.map(n => handleSendNoticeReminder(n)));
        const sent = results.filter(r => r.status === 'fulfilled').length;
        setNoticeToast({ id: targets[0].id, title: `Reminder sent for ${sent} notice${sent > 1 ? 's' : ''}`, priority: 'routine' });
        setTimeout(() => setNoticeToast(null), 2500);
      } else if (action === 'pin' || action === 'unpin') {
        const isPin = action === 'pin';
        await updateNoticesPinned({ noticeIds, pinned: isPin });
        setNotices(prev => prev.map(n => noticeIds.includes(n.id) ? { ...n, pinned: isPin } : n));
      } else if (action === 'archive') {
        const now = await archiveNotices({ noticeIds });
        setNotices(prev => prev.map(n => noticeIds.includes(n.id) ? { ...n, validUntil: now } : n));
      }
    } catch (err) {
      console.error('[bulk notice action] failed', err);
      alert(`Bulk action failed: ${err?.message || err}`);
    }
  };

  const handleSendDashboardReminder = async () => {
    const targetData = [];
    for (const cm of liveCrew) {
      const unreadCritical = notices.filter(n => n.priority === 'critical' && !n.readBy.includes(cm.id));
      const unackedDocs = docs.filter(d => d.required && !d.acknowledgedBy.includes(cm.id));
      if (unreadCritical.length === 0 && unackedDocs.length === 0) continue;
      const parts = [];
      if (unreadCritical.length > 0) parts.push(`${unreadCritical.length} unread critical notice${unreadCritical.length > 1 ? 's' : ''}`);
      if (unackedDocs.length > 0) parts.push(`${unackedDocs.length} document${unackedDocs.length > 1 ? 's' : ''} pending acknowledgement`);
      targetData.push({
        cm,
        body: `You have ${parts.join(' and ')} requiring your attention.`,
      });
    }
    if (targetData.length === 0) return { targeted: 0, sent: 0 };

    // Filter by admin_reminders preference
    const eligibleIds = await filterByPreference(targetData.map(({ cm }) => cm.id), 'admin_reminders');
    const eligibleData = targetData.filter(({ cm }) => eligibleIds.includes(cm.id));
    if (eligibleData.length === 0) return { targeted: targetData.length, sent: 0 };

    const results = await Promise.allSettled(
      eligibleData.map(({ cm, body }) =>
        createTargetedNotification({
          targetCrewId: cm.id,
          type: 'reminder',
          title: 'Compliance Reminder',
          body,
          referenceType: null,
          referenceId: null,
        })
      )
    );
    const sent = results.filter(r => r.status === 'fulfilled').length;

    sendReminderChannels({
      crewMemberIds: eligibleData.map(({ cm }) => cm.id),
      title: 'Compliance Reminder',
      body: 'You have outstanding notices or documents requiring your attention. Please open CrewNotice to review.',
      refType: null,
      refId: null,
    }).catch(err => console.error('[reminder] email+push failed (non-fatal)', err));

    if (sent > 0) {
      recordActivity({
        action: 'reminder_sent',
        targetType: 'compliance',
        targetId: null,
        metadata: { recipientCount: sent },
      });
    }
    return { targeted: targetData.length, sent };
  };

  const handleUploadDoc = async () => {
    if (!newDoc.file || !newDoc.title.trim()) return;
    setUploadingDoc(true);
    try {
      const uploaded = await uploadDocument({
        file: newDoc.file,
        title: newDoc.title.trim(),
        docType: newDoc.docType,
        department: newDoc.department,
        version: newDoc.version || null,
        reviewDate: newDoc.reviewDate || null,
        isRequired: newDoc.isRequired,
        pageCount: newDoc.pageCount ? Number(newDoc.pageCount) : null,
        uploadedBy: currentUser.id,
      });
      setDocs(prev => [uploaded, ...prev]);
      setNewDoc({ file: null, title: '', docType: 'SOPs', department: 'General', version: '1.0', reviewDate: '', isRequired: false, pageCount: '' });
      setShowNewDoc(false);
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_POSTED,
        targetType: 'document',
        targetId: uploaded.id,
        metadata: { title: uploaded.title, version: uploaded.version },
      });
      try {
        const notif = await createBroadcastNotification({
          type: 'document',
          title: uploaded.required ? 'New required document' : 'New document',
          body: uploaded.title,
          referenceType: 'document',
          referenceId: uploaded.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to upload document: ${err?.message || err}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    const doc = docs.find(d => d.id === docId);
    if (!doc) return;
    const confirmed = window.confirm(
      `Delete "${doc.title}"? This cannot be undone and will remove the document for everyone on board.`
    );
    if (!confirmed) return;
    try {
      await deleteDocument({ documentId: docId, fileUrl: doc.fileUrl });
      setDocs(prev => prev.filter(d => d.id !== docId));
      setSelectedDoc(curr => (curr && curr.id === docId ? null : curr));
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_DELETED,
        targetType: 'document',
        targetId: docId,
        metadata: { title: doc.title, version: doc.version },
      });
    } catch (err) {
      alert(`Failed to delete document: ${err?.message || err}`);
    }
  };

  const handleReplaceDoc = async () => {
    if (!selectedDoc || !replaceDocState.file) return;
    setReplacingDoc(true);
    try {
      const replaced = await replaceDocument({
        documentId: selectedDoc.id,
        oldFileUrl: selectedDoc.fileUrl,
        file: replaceDocState.file,
        version: replaceDocState.version || selectedDoc.version,
        versionNotes: replaceDocState.versionNotes || null,
        pageCount: replaceDocState.pageCount ? Number(replaceDocState.pageCount) : null,
      });
      setDocs(prev => prev.map(d => (d.id === replaced.id ? replaced : d)));
      setSelectedDoc(replaced);
      setShowReplaceDoc(false);
      setReplaceDocState({ file: null, version: '', versionNotes: '', pageCount: '' });
      recordActivity({
        action: ACTIVITY_ACTIONS.DOCUMENT_REPLACED,
        targetType: 'document',
        targetId: replaced.id,
        metadata: { title: replaced.title, version: replaced.version },
      });
      try {
        const notes = (replaced.versionNotes || '').trim();
        const truncatedNotes = notes.length > 160 ? `${notes.slice(0, 157)}\u2026` : notes;
        const body = notes
          ? `${replaced.title} \u2014 v${replaced.version}: ${truncatedNotes}`
          : `${replaced.title} \u2014 now v${replaced.version}`;
        const notif = await createBroadcastNotification({
          type: 'document',
          title: replaced.required ? 'Required document updated' : 'Document updated',
          body,
          referenceType: 'document',
          referenceId: replaced.id,
        });
        setNotifications(prev => [notif, ...prev]);
      } catch (notifErr) {
        console.error('broadcast notification failed (non-fatal)', notifErr);
      }
    } catch (err) {
      alert(`Failed to replace document: ${err?.message || err}`);
    } finally {
      setReplacingDoc(false);
    }
  };

  const resetNav = () => {
    setSelectedNotice(null);
    setSelectedDoc(null);
    setAdminNoticeView(null);
    setSelectedCrewMember(null);
    setSelectedModule(null);
    setTrainingView('dashboard');
    setQuizResults(null);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizCurrent(0);
    setAdminTrainingResults(null);
    setSelectedEvent(null);
    setEventDetail(null);
    setAdminEventView(null);
    setAdminEventDetail(null);
    setNewUpdateText('');
    setShowNotifPrefs(false);
  };

  const pendingTraining = role === 'crew'
    ? trainingModules.filter(m => m.status && m.status !== 'completed').length
    : 0;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      alert(`Sign out failed: ${err?.message || err}`);
    }
  };

  const unreadEvents = role === 'crew'
    ? events.filter(e => !e.isRead && (e.status === 'upcoming' || e.status === 'active')).length
    : 0;

  const crewTabs = [
    { id: 'home', label: 'Home', icon: Icons.home },
    { id: 'notices', label: 'Notices', icon: Icons.notices, badge: unreadNotices },
    { id: 'docs', label: 'Library', icon: Icons.docs, badge: pendingDocAcks },
    { id: 'training', label: 'Training', icon: Icons.training, badge: pendingTraining },
    { id: 'events', label: 'Events', icon: Icons.calendar, badge: unreadEvents },
  ];

  const adminTabs = [
    { id: 'home', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'notices', label: 'Notices', icon: Icons.notices },
    { id: 'docs', label: 'Documents', icon: Icons.docs },
    { id: 'training', label: 'Training', icon: Icons.training },
    { id: 'events', label: 'Events', icon: Icons.calendar },
    { id: 'crew', label: 'Crew', icon: Icons.crew },
    { id: 'activity', label: 'Activity', icon: Icons.clock },
    { id: 'settings', label: 'Settings', icon: Icons.settings },
  ];

  const tabs = role === 'admin' ? adminTabs : crewTabs;

  // ── Training helpers ──────────────────────────────────────────────
  const refreshTraining = async () => {
    try {
      const res = await fetch(`/api/training/modules?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}&role=${role}`);
      const data = await res.json();
      setTrainingModules(data.modules || []);
    } catch (err) { console.error('[training] refresh failed', err); }
  };

  const compressImage = (file, maxDim = 1200, quality = 0.8) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });

  const resolveContentUrls = async (content) => {
    return content || [];
  };

  const resetModuleBuilder = () => {
    setShowModuleBuilder(false);
    setEditingModuleId(null);
    setModuleBuilderData({ title: '', description: '', content: [], passMark: 80, timeLimitMinutes: '', randomiseQuestions: false, isPublished: false, questions: [], assignTo: 'none', assignDept: 'All', assignIds: [], deadline: '' });
    setModuleBuilderSaving(false);
  };

  const handleStartQuiz = async (mod) => {
    try {
      const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}/quiz?crew_member_id=${currentUser.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.quiz.questions || []);
      setQuizAnswers({});
      setQuizCurrent(0);
      setQuizResults(null);
      setQuizSubmitting(false);
      setQuizTimerLeft(data.quiz.timeLimitMinutes ? data.quiz.timeLimitMinutes * 60 : null);
      setTrainingView('quiz');
    } catch (err) { console.error('[quiz] start failed', err); alert('Failed to load quiz: ' + err.message); }
  };

  const handleSubmitQuiz = async (mod) => {
    if (quizSubmitting) return;
    setQuizSubmitting(true);
    try {
      const answersArr = quizQuestions.map(q => ({
        question_id: q.id,
        selected_option_id: quizAnswers[q.id] || null,
      }));
      const res = await fetch(`/api/training/modules/${mod.id || mod.moduleId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: currentUser.id, answers: answersArr }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuizResults(data.result);
      trackQuizCompleted(mod.id || mod.moduleId, data.result.score, data.result.passed);
      setTrainingView('results');
      refreshTraining();
    } catch (err) {
      console.error('[quiz] submit failed', err);
      alert('Failed to submit quiz: ' + err.message);
    } finally { setQuizSubmitting(false); }
  };

  const handleSaveModule = async (publish = false) => {
    if (moduleBuilderSaving) return;
    setModuleBuilderSaving(true);
    const b = moduleBuilderData;
    try {
      const cleanContent = (b.content || []).map(({ previewUrl, resolvedUrl, ...rest }) => rest);
      const questions = b.questions.map((q, i) => ({
        question_text: q.questionImage
          ? JSON.stringify({ text: q.questionText, image: q.questionImage })
          : q.questionText,
        question_type: q.questionType,
        options: q.options,
        explanation: q.explanation || null,
        sort_order: i,
      }));

      let moduleId = editingModuleId;

      if (editingModuleId) {
        const res = await fetch(`/api/training/modules/${editingModuleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crew_member_id: currentUser.id,
            title: b.title,
            description: b.description,
            content: cleanContent,
            pass_mark: b.passMark,
            time_limit_minutes: b.timeLimitMinutes ? parseInt(b.timeLimitMinutes) : null,
            randomise_questions: b.randomiseQuestions,
            is_published: publish,
            questions,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        const res = await fetch('/api/training/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crew_member_id: currentUser.id,
            vessel_id: currentUser.vesselId,
            title: b.title,
            description: b.description,
            content: cleanContent,
            pass_mark: b.passMark,
            time_limit_minutes: b.timeLimitMinutes ? parseInt(b.timeLimitMinutes) : null,
            randomise_questions: b.randomiseQuestions,
            is_published: publish,
            questions,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        moduleId = data.module.id;
      }

      if (b.assignTo !== 'none' && publish && moduleId) {
        let assignTarget;
        if (b.assignTo === 'all') {
          assignTarget = crew.filter(c => c.id !== currentUser.id).map(c => c.id);
        } else if (b.assignTo === 'department') {
          assignTarget = crew.filter(c => c.dept === b.assignDept && c.id !== currentUser.id).map(c => c.id);
        } else {
          assignTarget = (b.assignIds || []).filter(id => id !== currentUser.id);
        }

        if (assignTarget.length === 0) {
          alert('Module saved but no crew members found to assign.');
        } else {
          const assignRes = await fetch(`/api/training/modules/${moduleId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              crew_member_id: currentUser.id,
              crew_member_ids: assignTarget,
              vessel_id: currentUser.vesselId,
              deadline: b.deadline || null,
            }),
          });
          const assignData = await assignRes.json();
          if (assignData.error) {
            console.error('[module-builder] assign failed', assignData.error);
            alert(`Module saved but assignment failed: ${assignData.error}`);
          } else if (assignData.error) {
            // assignment failed — already logged above
          }
        }
      }

      resetModuleBuilder();
      refreshTraining();
    } catch (err) {
      console.error('[module-builder] save failed', err);
      alert('Failed to save module: ' + err.message);
    } finally { setModuleBuilderSaving(false); }
  };

  const handleLoadAdminModuleResults = async (mod) => {
    setSelectedModule(mod);
    setTrainingView('adminResults');
    try {
      const res = await fetch(`/api/training/modules/${mod.id}?crew_member_id=${currentUser.id}&role=admin`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdminTrainingResults(data.module);
    } catch (err) {
      console.error('[admin-training] load results failed', err);
      setAdminTrainingResults(null);
    }
  };

  const handleEditModule = async (mod) => {
    try {
      const modId = mod.id || mod.moduleId;
      const res = await fetch(`/api/training/modules/${modId}?crew_member_id=${currentUser.id}&role=admin`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const m = data.module;
      setEditingModuleId(m.id);
      setModuleBuilderData({
        title: m.title || '',
        description: m.description || '',
        content: (m.content || []).map(c => ({ type: c.type, value: c.value || '', caption: c.caption || '' })),
        passMark: m.passMark || 80,
        timeLimitMinutes: m.timeLimitMinutes || '',
        randomiseQuestions: m.randomiseQuestions || false,
        isPublished: m.isPublished || false,
        questions: (m.questions || []).map(q => {
          let qText = q.question_text, qImage = '';
          try { const p = JSON.parse(q.question_text); if (p?.text) { qText = p.text; qImage = p.image || ''; } } catch {}
          return { questionText: qText, questionImage: qImage, questionType: q.question_type, explanation: q.explanation || '', options: (q.options || []).map(o => ({ ...o })) };
        }),
        assignTo: 'none',
        assignDept: 'All',
        assignIds: [],
        deadline: '',
      });
      setShowModuleBuilder(true);
      setTrainingView('dashboard');
      setAdminTrainingResults(null);
    } catch (err) {
      console.error('[training] edit load failed', err);
      alert('Failed to load module for editing');
    }
  };

  const handleSendTrainingReminder = async (mod, crewIds) => {
    try {
      await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crewMemberIds: crewIds,
          vesselId: currentUser.vesselId,
          title: 'Training Reminder',
          body: `Please complete the training module "${mod.title || mod.moduleTitle}".`,
          refType: 'training_module',
          refId: mod.id || mod.moduleId,
          createNotification: true,
          notificationType: 'training_reminder',
        }),
      });
    } catch (err) { console.error('[training] reminder failed', err); }
  };

  // ─── Quiz Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (quizTimerLeft === null || trainingView !== 'quiz') return;
    if (quizTimerLeft <= 0) {
      handleSubmitQuiz(selectedModule);
      return;
    }
    const t = setTimeout(() => setQuizTimerLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [quizTimerLeft, trainingView]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Event type constants ──
  const EVENT_TYPE_ICONS = {
    passage: Icons.anchor,
    guest_visit: Icons.crew,
    maintenance: Icons.file,
    social: Icons.star,
    custom: Icons.calendar,
  };
  const EVENT_TYPE_COLORS = {
    passage: '#3b82f6',
    guest_visit: '#8b5cf6',
    maintenance: '#f59e0b',
    social: '#10b981',
    custom: '#64748b',
  };
  const EVENT_TYPE_LABELS = {
    passage: 'Passage',
    guest_visit: 'Guest Visit',
    maintenance: 'Maintenance',
    social: 'Social',
    custom: 'Custom',
  };

  // ── Event handlers ──
  const refreshEvents = async () => {
    try {
      const res = await fetch(`/api/events?crew_member_id=${currentUser.id}&vessel_id=${currentUser.vesselId}&role=${role}&include_past=${eventFilter === 'past' || eventFilter === 'all' ? 'true' : 'false'}${eventFilter !== 'past' && eventFilter !== 'all' ? `&status=${eventFilter}` : ''}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) { console.error('[events] refresh failed', err); }
  };

  const handleLoadEventDetail = async (eventSummary, forAdmin = false) => {
    const setter = forAdmin ? setAdminEventDetail : setEventDetail;
    const loadSetter = forAdmin ? setAdminEventDetailLoading : setEventDetailLoading;
    loadSetter(true);
    try {
      const res = await fetch(`/api/events/${eventSummary.id}?crew_member_id=${currentUser.id}&role=${forAdmin ? 'admin' : 'crew'}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setter(data.event);
    } catch (err) {
      console.error('[events] load detail failed', err);
      setter(null);
    } finally { loadSetter(false); }
  };

  const handleMarkEventRead = async (eventId) => {
    try {
      await fetch(`/api/events/${eventId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: currentUser.id }),
      });
      trackEventRead(eventId);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isRead: true } : e));
      if (eventDetail?.id === eventId) setEventDetail(prev => prev ? { ...prev, isRead: true } : prev);
    } catch (err) { console.error('[events] mark read failed', err); }
  };

  const handlePostEventUpdate = async (eventId) => {
    if (!newUpdateText.trim() || postingUpdate) return;
    setPostingUpdate(true);
    try {
      const res = await fetch(`/api/events/${eventId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: currentUser.id, content: newUpdateText.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNewUpdateText('');
      const isAdminRole = role === 'admin';
      const detail = isAdminRole ? adminEventDetail : eventDetail;
      if (detail) {
        const setter = isAdminRole ? setAdminEventDetail : setEventDetail;
        setter(prev => prev ? { ...prev, updates: [data.update, ...(prev.updates || [])] } : prev);
      }
    } catch (err) {
      console.error('[events] post update failed', err);
      alert('Failed to post update: ' + err.message);
    } finally { setPostingUpdate(false); }
  };

  const handleCreateEvent = async () => {
    if (eventSaving) return;
    setEventSaving(true);
    const d = newEventData;
    try {
      const startDate = d.start_date && d.start_time
        ? new Date(`${d.start_date}T${d.start_time}`).toISOString()
        : d.start_date ? new Date(d.start_date).toISOString() : null;
      const endDate = d.end_date && d.end_time
        ? new Date(`${d.end_date}T${d.end_time}`).toISOString()
        : d.end_date ? new Date(d.end_date).toISOString() : null;

      if (!startDate) { alert('Start date is required'); setEventSaving(false); return; }

      let restricted_fields = null;
      if (d.restrictedEnabled && d.restrictedValue.trim() && d.restrictedRoles.length > 0) {
        restricted_fields = {
          confidentialInfo: { value: d.restrictedValue.trim(), roles: d.restrictedRoles },
        };
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crew_member_id: currentUser.id,
          vessel_id: currentUser.vesselId,
          event_type: d.event_type,
          title: d.title,
          description: d.description,
          start_date: startDate,
          end_date: endDate,
          restricted_fields,
          notification_schedule: d.notification_schedule,
          briefings: d.briefings.filter(b => b.department && b.content.trim()),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Notifications are now created server-side by the events POST endpoint.

      setShowNewEvent(false);
      setNewEventData({
        title: '', description: '', event_type: 'custom', start_date: '', start_time: '',
        end_date: '', end_time: '', attachments: [], restricted_fields: {},
        notification_schedule: [
          { days_before: 7, sent: false },
          { days_before: 3, sent: false },
          { days_before: 1, sent: false },
        ],
        briefings: [],
        restrictedEnabled: false, restrictedValue: '', restrictedRoles: [],
      });
      refreshEvents();
    } catch (err) {
      console.error('[events] create failed', err);
      alert('Failed to create event: ' + err.message);
    } finally { setEventSaving(false); }
  };

  const handleArchiveEvent = async (eventId) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_member_id: currentUser.id, status: 'completed' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      refreshEvents();
      setAdminEventView(null);
      setAdminEventDetail(null);
    } catch (err) {
      console.error('[events] archive failed', err);
      alert('Failed to archive event: ' + err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}?crew_member_id=${currentUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      refreshEvents();
      setAdminEventView(null);
      setAdminEventDetail(null);
    } catch (err) {
      console.error('[events] delete failed', err);
      alert('Failed to delete event: ' + err.message);
    }
  };

  const getCountdown = (dateStr) => {
    const now = new Date();
    const target = new Date(dateStr);
    const diffMs = target - now;
    if (diffMs < 0) return null;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `in ${days}d`;
    if (hours > 0) return `in ${hours}h`;
    return 'soon';
  };

  // ── Export handler ──
  const handleExport = async () => {
    setExporting(true);
    const dateRange = { from: exportDateFrom || undefined, to: exportDateTo || undefined };
    const reportData = { crew: liveCrew, notices, docs, activity, dateRange };
    try {
      const { generateComplianceReport, generateCSVExport, downloadPDF, downloadCSV } = await import('@/lib/reportGenerator');
      const csvMap = {
        notice_csv: { key: 'notice_read_receipts', filename: 'notice-read-receipts' },
        document_csv: { key: 'document_acknowledgements', filename: 'document-acknowledgements' },
        training_csv: { key: 'training_records', filename: 'training-records' },
        activity_csv: { key: 'activity_log', filename: 'activity-log' },
      };
      if (exportType === 'compliance_pdf') {
        const doc = generateComplianceReport({ vesselName: 'M/Y Serenity', ...reportData });
        downloadPDF(doc, `compliance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      } else if (csvMap[exportType]) {
        const { key, filename } = csvMap[exportType];
        const csv = generateCSVExport(key, reportData);
        downloadCSV(csv, `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error('[export] generation failed', err);
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setExporting(false);
    }
  };

  // ─── Keyboard shortcuts (admin only) ─────────────────────────────
  const isAdminRole = role === 'admin';
  useKeyboardShortcuts({
    '?': () => setShortcutsOpen(true),
    'Escape': () => {
      if (shortcutsOpen) setShortcutsOpen(false);
      else if (adminNoticeView) setAdminNoticeView(null);
      else if (selectedNotice) setSelectedNotice(null);
      else if (selectedDoc) setSelectedDoc(null);
      else if (showNewNotice) setShowNewNotice(false);
      else if (showNewDoc) setShowNewDoc(false);
      else if (showExportReport) setShowExportReport(false);
    },
    'n': () => { if (isAdminRole) setShowNewNotice(true); },
    'd': () => { if (isAdminRole) setShowNewDoc(true); },
    'r': () => {
      if (isAdminRole && adminNoticeView) {
        handleSendNoticeReminder(adminNoticeView).catch(err => console.error(err));
      }
    },
    '/': (e) => {
      const search = document.querySelector('input[placeholder^="Search"]');
      if (search) { e.preventDefault(); search.focus(); }
    },
    'g': () => { if (isAdminRole) setTab('home'); else setTab('home'); },
  });

  const shortcutDefs = isAdminRole ? [
    { key: '?', description: 'Show this help' },
    { key: 'N', description: 'New notice' },
    { key: 'D', description: 'Upload document' },
    { key: 'R', description: 'Send reminder (on notice detail)' },
    { key: '/', description: 'Focus search' },
    { key: 'G', description: 'Go to dashboard' },
    { key: 'Esc', description: 'Close modal / go back' },
  ] : [
    { key: '?', description: 'Show this help' },
    { key: '/', description: 'Focus search' },
    { key: 'G', description: 'Go home' },
    { key: 'Esc', description: 'Close modal / go back' },
  ];

  // ─── Render screen ────────────────────────────────────────────────
  const renderScreen = () => {
    if (role === 'admin' && adminNoticeView) return <AdminNoticeDetail notice={adminNoticeView} onBack={() => setAdminNoticeView(null)} crew={liveCrew} onDelete={() => handleDeleteNotice(adminNoticeView.id)} onSendReminder={handleSendNoticeReminder} activity={activity} isDesktop={isDesktop} />;
    if (role === 'admin') {
      switch (tab) {
        case 'home': return <AdminDashboard notices={notices} docs={docs} liveCrew={liveCrew} isDesktop={isDesktop} setSelectedCrewMember={setSelectedCrewMember} setShowNewNotice={setShowNewNotice} setShowNewDoc={setShowNewDoc} setShowExportReport={setShowExportReport} dashReminderState={dashReminderState} setDashReminderState={setDashReminderState} dashReminderSentCount={dashReminderSentCount} setDashReminderSentCount={setDashReminderSentCount} handleSendDashboardReminder={handleSendDashboardReminder} trainingModules={trainingModules} events={events} setTab={setTab} setAdminNoticeView={setAdminNoticeView} setSelectedDoc={setSelectedDoc} setTrainingView={setTrainingView} setSelectedModule={setSelectedModule} setAdminEventView={setAdminEventView} handleLoadEventDetail={handleLoadEventDetail} />;
        case 'notices': return <NoticesScreen selectedNotice={selectedNotice} currentUser={currentUser} notices={notices} noticeFilter={noticeFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setNoticeFilter={setNoticeFilter} setSelectedNotice={setSelectedNotice} setAdminNoticeView={setAdminNoticeView} handleAcknowledge={handleAcknowledge} handleMarkRead={handleMarkRead} handlePollVote={handlePollVote} handleBulkNoticeAction={handleBulkNoticeAction} role={role} crew={crew} isDesktop={isDesktop} noticesLoading={noticesLoading} noticesError={noticesError} categoryOptions={taxonomies.categoriesWithAll} />;
        case 'docs': return <DocsScreen selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} currentUser={currentUser} docs={docs} docDeptFilter={docDeptFilter} docTypeFilter={docTypeFilter} setDocDeptFilter={setDocDeptFilter} setDocTypeFilter={setDocTypeFilter} quickAccessIds={quickAccessIds} toggleQuickAccess={toggleQuickAccess} handleAckDoc={handleAckDoc} handleDeleteDoc={handleDeleteDoc} handleReplaceDoc={handleReplaceDoc} role={role} isDesktop={isDesktop} crew={crew} setReplaceDocState={setReplaceDocState} setShowReplaceDoc={setShowReplaceDoc} isDocCached={isDocCached} cachingDocId={cachingDocId} setCachingDocId={setCachingDocId} cacheDocument={cacheDocument} getDocumentSignedUrl={getDocumentSignedUrl} departmentOptions={taxonomies.departmentsWithAll} docTypeOptions={taxonomies.docTypesWithAll} docSearchQuery={docSearchQuery} setDocSearchQuery={setDocSearchQuery} onDocumentRead={handleDocumentRead} />;
        case 'training': return <AdminTrainingScreen trainingView={trainingView} setTrainingView={setTrainingView} selectedModule={selectedModule} setSelectedModule={setSelectedModule} adminTrainingResults={adminTrainingResults} setAdminTrainingResults={setAdminTrainingResults} trainingModules={trainingModules} trainingLoading={trainingLoading} adminTrainDeptFilter={adminTrainDeptFilter} setAdminTrainDeptFilter={setAdminTrainDeptFilter} trainingReminderState={trainingReminderState} setTrainingReminderState={setTrainingReminderState} handleLoadAdminModuleResults={handleLoadAdminModuleResults} handleEditModule={handleEditModule} handleSendTrainingReminder={handleSendTrainingReminder} isDesktop={isDesktop} currentUser={currentUser} />;
        case 'events': return <AdminEventsScreen adminEventView={adminEventView} setAdminEventView={setAdminEventView} adminEventDetail={adminEventDetail} setAdminEventDetail={setAdminEventDetail} adminEventDetailLoading={adminEventDetailLoading} events={events} eventsLoading={eventsLoading} eventFilter={eventFilter} setEventFilter={setEventFilter} isDesktop={isDesktop} handleLoadEventDetail={handleLoadEventDetail} handleArchiveEvent={handleArchiveEvent} handleDeleteEvent={handleDeleteEvent} handlePostEventUpdate={handlePostEventUpdate} newUpdateText={newUpdateText} setNewUpdateText={setNewUpdateText} postingUpdate={postingUpdate} setShowNewEvent={setShowNewEvent} getCountdown={getCountdown} EVENT_TYPE_ICONS={EVENT_TYPE_ICONS} EVENT_TYPE_COLORS={EVENT_TYPE_COLORS} EVENT_TYPE_LABELS={EVENT_TYPE_LABELS} />;
        case 'crew': return <CrewManagement liveCrew={liveCrew} selectedCrewMember={selectedCrewMember} setSelectedCrewMember={setSelectedCrewMember} notices={notices} docs={docs} trainingModules={trainingModules} isDesktop={isDesktop} handleBulkCrewAction={handleBulkCrewAction} categoryOptions={taxonomies.categoriesWithAll} />;
        case 'activity': return <AdminActivityLog activity={activity} activityLoading={activityLoading} crew={crew} isDesktop={isDesktop} />;
        case 'settings': return <TaxonomySettings taxonomies={taxonomies} isDesktop={isDesktop} />;
        default: return <AdminDashboard notices={notices} docs={docs} liveCrew={liveCrew} isDesktop={isDesktop} setSelectedCrewMember={setSelectedCrewMember} setShowNewNotice={setShowNewNotice} setShowNewDoc={setShowNewDoc} setShowExportReport={setShowExportReport} dashReminderState={dashReminderState} setDashReminderState={setDashReminderState} dashReminderSentCount={dashReminderSentCount} setDashReminderSentCount={setDashReminderSentCount} handleSendDashboardReminder={handleSendDashboardReminder} trainingModules={trainingModules} events={events} setTab={setTab} setAdminNoticeView={setAdminNoticeView} setSelectedDoc={setSelectedDoc} setTrainingView={setTrainingView} setSelectedModule={setSelectedModule} setAdminEventView={setAdminEventView} handleLoadEventDetail={handleLoadEventDetail} />;
      }
    }
    switch (tab) {
      case 'home': return <CrewHome currentUser={currentUser} unreadNotices={unreadNotices} pendingAcks={pendingAcks} pendingDocAcks={pendingDocAcks} notices={notices} docs={docs} trainingModules={trainingModules} quickAccessIds={quickAccessIds} setSelectedNotice={setSelectedNotice} setSelectedDoc={setSelectedDoc} setTab={setTab} />;
      case 'notices': return <NoticesScreen selectedNotice={selectedNotice} currentUser={currentUser} notices={notices} noticeFilter={noticeFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setNoticeFilter={setNoticeFilter} setSelectedNotice={setSelectedNotice} setAdminNoticeView={setAdminNoticeView} handleAcknowledge={handleAcknowledge} handleMarkRead={handleMarkRead} handlePollVote={handlePollVote} handleBulkNoticeAction={handleBulkNoticeAction} role={role} crew={crew} isDesktop={isDesktop} noticesLoading={noticesLoading} noticesError={noticesError} categoryOptions={taxonomies.categoriesWithAll} />;
      case 'docs': return <DocsScreen selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} currentUser={currentUser} docs={docs} docDeptFilter={docDeptFilter} docTypeFilter={docTypeFilter} setDocDeptFilter={setDocDeptFilter} setDocTypeFilter={setDocTypeFilter} quickAccessIds={quickAccessIds} toggleQuickAccess={toggleQuickAccess} handleAckDoc={handleAckDoc} handleDeleteDoc={handleDeleteDoc} handleReplaceDoc={handleReplaceDoc} role={role} isDesktop={isDesktop} crew={crew} setReplaceDocState={setReplaceDocState} setShowReplaceDoc={setShowReplaceDoc} isDocCached={isDocCached} cachingDocId={cachingDocId} setCachingDocId={setCachingDocId} cacheDocument={cacheDocument} getDocumentSignedUrl={getDocumentSignedUrl} departmentOptions={taxonomies.departmentsWithAll} docTypeOptions={taxonomies.docTypesWithAll} docSearchQuery={docSearchQuery} setDocSearchQuery={setDocSearchQuery} onDocumentRead={handleDocumentRead} />;
      case 'training': return <CrewTrainingScreen trainingView={trainingView} selectedModule={selectedModule} setTrainingView={setTrainingView} setSelectedModule={setSelectedModule} quizQuestions={quizQuestions} quizCurrent={quizCurrent} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} setQuizCurrent={setQuizCurrent} quizResults={quizResults} setQuizResults={setQuizResults} quizSubmitting={quizSubmitting} quizTimerLeft={quizTimerLeft} handleStartQuiz={handleStartQuiz} handleSubmitQuiz={handleSubmitQuiz} trainingModules={trainingModules} trainingLoading={trainingLoading} currentUser={currentUser} resolveContentUrls={resolveContentUrls} isDesktop={isDesktop} />;
      case 'events': return <CrewEventsScreen selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} eventDetail={eventDetail} setEventDetail={setEventDetail} eventDetailLoading={eventDetailLoading} events={events} eventsLoading={eventsLoading} eventFilter={eventFilter} setEventFilter={setEventFilter} handleLoadEventDetail={handleLoadEventDetail} handleMarkEventRead={handleMarkEventRead} getCountdown={getCountdown} EVENT_TYPE_ICONS={EVENT_TYPE_ICONS} EVENT_TYPE_COLORS={EVENT_TYPE_COLORS} EVENT_TYPE_LABELS={EVENT_TYPE_LABELS} />;
      case 'profile': return showNotifPrefs
            ? <NotificationPreferences currentUser={currentUser} onBack={() => setShowNotifPrefs(false)} />
            : <CrewProfile currentUser={currentUser} notices={notices} docs={docs} trainingModules={trainingModules} handleLogout={handleLogout} offlineCachedIds={offlineCachedIds} offlineCacheSize={offlineCacheSize} clearCachedDoc={clearCachedDoc} clearAllCachedDocs={clearAllCachedDocs} onOpenNotifPrefs={() => setShowNotifPrefs(true)} />;
      default: return <CrewHome currentUser={currentUser} unreadNotices={unreadNotices} pendingAcks={pendingAcks} pendingDocAcks={pendingDocAcks} notices={notices} docs={docs} trainingModules={trainingModules} quickAccessIds={quickAccessIds} setSelectedNotice={setSelectedNotice} setSelectedDoc={setSelectedDoc} setTab={setTab} />;
    }
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh', maxWidth: isDesktop ? undefined : 480, margin: isDesktop ? undefined : '0 auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: isDesktop ? 'none' : '0 0 80px rgba(15,23,42,0.06)' }}>

      {/* Offline indicator */}
      <OfflineIndicator />

      {/* Desktop sidebar — admin only */}
      {isDesktop && <Sidebar tabs={tabs} tab={tab} setTab={setTab} resetNav={resetNav} currentUser={currentUser} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isDesktop ? '14px 36px' : '16px 22px', borderBottom: `1px solid ${T.border}`, background: 'var(--header-bg)', backdropFilter: 'saturate(180%) blur(12px)', WebkitBackdropFilter: 'saturate(180%) blur(12px)', position: 'sticky', top: 0, zIndex: 50, marginLeft: isDesktop ? 240 : 0 }}>
        {isDesktop ? <div /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accentDark} 100%)`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.35)' }}>
              <Icon d={<><circle cx="12" cy="5" r="3" /><line x1="12" y1="22" x2="12" y2="8" /><path d="M5 12H2a10 10 0 0020 0h-3" /></>} size={18} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>CrewNotice</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {currentUser.isAdmin && (
            <div style={{ display: 'flex', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden', padding: 2 }}>
              {['crew', 'admin'].map(r => (
                <button key={r} onClick={() => { setRole(r); setTab('home'); resetNav(); }} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, border: 'none', cursor: 'pointer', background: role === r ? T.accent : 'transparent', color: role === r ? '#fff' : T.textMuted, transition: 'all 0.2s', borderRadius: 8 }}>{r}</button>
              ))}
            </div>
          )}
          <button onClick={() => setShowNotifications(true)} style={{ position: 'relative', background: T.bg, border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
            {Icons.bell}
            {unreadNotifs > 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.bgCard}` }}>{unreadNotifs}</div>}
          </button>
          {role === 'crew' && (
            <button onClick={() => { setTab('profile'); resetNav(); }} style={{ background: T.bg, border: `1px solid ${tab === 'profile' ? T.accent : T.border}`, color: tab === 'profile' ? T.accent : T.textMuted, cursor: 'pointer', padding: 8, borderRadius: 10, display: 'flex' }}>
              {Icons.crew}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: isDesktop ? 24 : 88, marginLeft: isDesktop ? 240 : 0, maxWidth: isDesktop ? 1200 : undefined, width: isDesktop ? 'calc(100% - 240px)' : undefined }}>
        {pushState === 'prompt' && !pushDismissed && (
          <div style={{ margin: isDesktop ? '16px 36px' : '12px 20px', padding: '14px 18px', background: T.accentTint, border: `1px solid ${T.accent}33`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>Enable push notifications</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Get notified about new notices, documents, and reminders even when the app is closed.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  const sub = await subscribeToPush(currentUser.id);
                  setPushState(sub ? 'subscribed' : 'denied');
                }}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Enable
              </button>
              <button
                onClick={() => setPushDismissed(true)}
                style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgCard, color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Later
              </button>
            </div>
          </div>
        )}
        {renderScreen()}
      </div>

      {/* Bottom Navigation — mobile only */}
      {!isDesktop && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--tab-bar-bg)', borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 50, backdropFilter: 'saturate(180%) blur(14px)', WebkitBackdropFilter: 'saturate(180%) blur(14px)', boxShadow: 'var(--shadow)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); resetNav(); }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 4px 14px', border: 'none', background: 'none', cursor: 'pointer', position: 'relative', color: tab === t.id ? T.accent : T.textDim, transition: 'color 0.2s' }}>
              {tab === t.id && <div style={{ position: 'absolute', top: 0, left: '30%', right: '30%', height: 3, background: T.accent, borderRadius: '0 0 3px 3px' }} />}
              <div style={{ position: 'relative' }}>
                {t.icon}
                {t.badge > 0 && <div style={{ position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: T.critical, fontSize: 10, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: `2px solid ${T.bgCard}` }}>{t.badge}</div>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Admin FAB — notices, docs, training, events */}
      {role === 'admin' && (() => {
        let fabAction = null;
        if (tab === 'notices' && !adminNoticeView) fabAction = () => setShowNewNotice(true);
        else if (tab === 'docs' && !selectedDoc) fabAction = () => setShowNewDoc(true);
        else if (tab === 'training' && trainingView === 'dashboard') fabAction = () => setShowModuleBuilder(true);
        else if (tab === 'events' && !adminEventView) fabAction = () => setShowNewEvent(true);
        if (!fabAction) return null;
        return (
          <button onClick={fabAction} className="cb-btn-primary" style={{ position: 'fixed', bottom: isDesktop ? 32 : 100, right: isDesktop ? 48 : 'calc(50% - 214px)', width: 56, height: 56, borderRadius: '50%', background: T.accent, border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            {Icons.plus}
          </button>
        );
      })()}

      {/* Realtime toast */}
      {noticeToast && (
        <div
          role="status"
          onClick={() => {
            navigateToNotice(notices.find(n => n.id === noticeToast.id));
            setNoticeToast(null);
          }}
          className="cb-toast"
          style={{
            position: 'fixed',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 448,
            background: T.bgCard,
            border: `1px solid ${noticeToast.priority === 'critical' ? T.critical : T.accent}`,
            borderLeft: `4px solid ${noticeToast.priority === 'critical' ? T.critical : T.accent}`,
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: T.shadowLg,
            zIndex: 120,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ color: noticeToast.priority === 'critical' ? T.critical : T.accent, display: 'flex', flexShrink: 0 }}>
            {Icons.notices}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              New {noticeToast.priority === 'critical' ? 'critical ' : ''}notice
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {noticeToast.title}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setNoticeToast(null); }}
            aria-label="Dismiss"
            style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            {Icons.x}
          </button>
        </div>
      )}

      {/* Modals */}
      {showNotifications && <NotificationsPanel notifications={notifications} setShowNotifications={setShowNotifications} handleNotificationClick={handleNotificationClick} />}
      {showNewNotice && <NewNoticeModal newNotice={newNotice} setNewNotice={setNewNotice} setShowNewNotice={setShowNewNotice} handlePostNotice={handlePostNotice} taxonomies={taxonomies} />}
      {showNewDoc && <NewDocumentModal newDoc={newDoc} setNewDoc={setNewDoc} setShowNewDoc={setShowNewDoc} handleUploadDoc={handleUploadDoc} uploadingDoc={uploadingDoc} taxonomies={taxonomies} />}
      {showReplaceDoc && <ReplaceDocumentModal selectedDoc={selectedDoc} replaceDocState={replaceDocState} setReplaceDocState={setReplaceDocState} setShowReplaceDoc={setShowReplaceDoc} handleReplaceDoc={handleReplaceDoc} replacingDoc={replacingDoc} />}
      {showExportReport && <ExportReportModal exportType={exportType} setExportType={setExportType} exportDateFrom={exportDateFrom} setExportDateFrom={setExportDateFrom} exportDateTo={exportDateTo} setExportDateTo={setExportDateTo} exporting={exporting} handleExport={handleExport} setShowExportReport={setShowExportReport} isDesktop={isDesktop} />}
      {showModuleBuilder && <ModuleBuilderModal moduleBuilderData={moduleBuilderData} setModuleBuilderData={setModuleBuilderData} moduleBuilderSaving={moduleBuilderSaving} editingModuleId={editingModuleId} handleSaveModule={handleSaveModule} resetModuleBuilder={resetModuleBuilder} compressImage={compressImage} isDesktop={isDesktop} crew={crew} currentUser={currentUser} taxonomies={taxonomies} />}
      {showNewEvent && <NewEventModal newEventData={newEventData} setNewEventData={setNewEventData} eventSaving={eventSaving} handleCreateEvent={handleCreateEvent} setShowNewEvent={setShowNewEvent} isDesktop={isDesktop} EVENT_TYPE_ICONS={EVENT_TYPE_ICONS} EVENT_TYPE_COLORS={EVENT_TYPE_COLORS} EVENT_TYPE_LABELS={EVENT_TYPE_LABELS} taxonomies={taxonomies} />}
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} shortcuts={shortcutDefs} />
    </div>
  );
}
