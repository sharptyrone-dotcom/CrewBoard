'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// useRealtime
// ---------------------------------------------------------------------------
// Subscribes to Supabase Realtime changes for the current vessel on a single
// websocket channel. The caller passes per-event handlers; the hook owns the
// channel lifecycle (subscribe on mount, teardown on unmount / identity
// change).
//
// Handlers are stored in a ref so parents can pass fresh inline callbacks on
// every render without forcing the hook to re-subscribe. The subscription
// only restarts when `vesselId` or `userId` changes.
//
// Scope:
//   - notices            — INSERT / UPDATE / DELETE, filtered by vessel_id
//   - notifications      — INSERT,   filtered by vessel_id, then caller-side
//                          filtered to broadcasts OR rows targeted at user
//   - notice_reads       — INSERT / UPDATE (no vessel_id column; RLS still
//                          gates delivery to the correct vessel)
//
// The hook does NOT own any state — it's an imperative bridge from the
// Realtime firehose to the caller's state setters. Typical consumers merge
// the payloads into local React state (optimistic-style) or call a refetch
// function to re-pull canonical data.
// ---------------------------------------------------------------------------
export function useRealtime({
  vesselId,
  userId,
  onNoticeInsert,
  onNoticeUpdate,
  onNoticeDelete,
  onNotificationInsert,
  onNoticeReadChange,
  onPollVoteChange,
} = {}) {
  // Latest-ref pattern: refresh on every render so the channel callbacks
  // always dereference the newest handler (and therefore the newest closure
  // over parent state like `tab`, `currentUser.id`, etc).
  const handlersRef = useRef({});
  handlersRef.current = {
    onNoticeInsert,
    onNoticeUpdate,
    onNoticeDelete,
    onNotificationInsert,
    onNoticeReadChange,
    onPollVoteChange,
  };

  useEffect(() => {
    if (!vesselId) return undefined;

    // Single channel per vessel keeps the websocket connection count low and
    // makes teardown a one-liner. Channel names must be unique per tab.
    const channel = supabase
      .channel(`crewboard:vessel:${vesselId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notices',
          filter: `vessel_id=eq.${vesselId}`,
        },
        (payload) => {
          handlersRef.current.onNoticeInsert?.(payload.new);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notices',
          filter: `vessel_id=eq.${vesselId}`,
        },
        (payload) => {
          handlersRef.current.onNoticeUpdate?.(payload.new, payload.old);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notices',
          filter: `vessel_id=eq.${vesselId}`,
        },
        (payload) => {
          handlersRef.current.onNoticeDelete?.(payload.old);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `vessel_id=eq.${vesselId}`,
        },
        (payload) => {
          // target_crew_id is null for broadcasts. Deliver the event only if
          // it's a broadcast OR it's explicitly targeted at this user — the
          // server filter can't express NULL-or-match in a single predicate.
          const row = payload.new || {};
          const targetIsBroadcast =
            row.target_crew_id === null || row.target_crew_id === undefined;
          const targetIsMe = userId && row.target_crew_id === userId;
          if (targetIsBroadcast || targetIsMe) {
            handlersRef.current.onNotificationInsert?.(row);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          // notice_reads has no vessel_id column so we can't filter server
          // side. RLS (notice_reads_select_same_vessel from 001) still gates
          // which rows the client is allowed to receive, so cross-vessel
          // payloads never arrive here.
          event: '*',
          schema: 'public',
          table: 'notice_reads',
        },
        (payload) => {
          handlersRef.current.onNoticeReadChange?.(payload);
        },
      )
      .on(
        'postgres_changes',
        {
          // poll_votes — same pattern as notice_reads: no vessel_id column,
          // RLS gates visibility to the correct vessel's crew.
          event: '*',
          schema: 'public',
          table: 'poll_votes',
        },
        (payload) => {
          handlersRef.current.onPollVoteChange?.(payload);
        },
      );

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        // Non-fatal — Supabase will attempt to re-join automatically. We log
        // so it's visible in devtools but never surface to the user.
        console.warn('[useRealtime] channel status', status);
      }
    });

    return () => {
      // removeChannel handles both unsubscribe + cleanup of the underlying
      // websocket listeners. Safe to call even if the channel never joined.
      supabase.removeChannel(channel);
    };
  }, [vesselId, userId]);
}

export default useRealtime;
