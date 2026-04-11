'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { touchLastSeen } from '@/lib/crew';

// Heartbeat cadence for crew_members.last_seen_at writes. Kept well inside
// the ONLINE_WINDOW_MS (5 minutes) in lib/crew.js so rowToCrew() keeps
// showing the current user as online during quiet periods.
const HEARTBEAT_MS = 60 * 1000;

// ---------------------------------------------------------------------------
// usePresence
// ---------------------------------------------------------------------------
// Joins a vessel-scoped Supabase Realtime Presence channel so every
// connected client advertises { userId, name, joinedAt } under its own key
// (the crew_members.id). The hook exposes `onlineCrewIds` — a Set keyed by
// crew id — so the admin dashboard can render live "currently viewing"
// indicators without having to poll fetchCrew().
//
// Also takes care of heartbeating crew_members.last_seen_at on a 60-second
// timer. This is independent of presence so that even if the websocket
// drops, the fetchCrew()-derived `online` flag stays accurate while the tab
// is open. Before this hook existed the CrewBoard component was running its
// own 2-minute touchLastSeen + fetchCrew loop; that effect has been removed
// now that presence owns the liveness story end-to-end.
// ---------------------------------------------------------------------------
export function usePresence({ vesselId, user } = {}) {
  const [onlineCrewIds, setOnlineCrewIds] = useState(() => new Set());
  const channelRef = useRef(null);

  // Presence channel lifecycle. Restarts only when the identity changes.
  useEffect(() => {
    if (!vesselId || !user?.id) return undefined;

    // `key` scopes the presence entry to a stable crew id so joins/leaves
    // from the same user across tabs collapse into a single bucket.
    const channel = supabase.channel(`presence:vessel:${vesselId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    // 'sync' fires whenever the aggregated presence state changes (join,
    // leave, or track update). Collapsing it into a Set of crew ids is all
    // the UI needs today.
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setOnlineCrewIds(new Set(Object.keys(state)));
    });

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      // Announce our presence once we're on the channel. Supabase cleans
      // this up automatically on socket disconnect, so no LEAVE handler
      // needed.
      try {
        await channel.track({
          userId: user.id,
          name: user.name || '',
          joinedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[usePresence] track failed', err);
      }
    });

    return () => {
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
      channelRef.current = null;
      setOnlineCrewIds(new Set());
    };
  }, [vesselId, user?.id, user?.name]);

  // Heartbeat — runs on its own cadence, independent of presence, so the
  // DB-side `online` computation stays accurate even if the websocket
  // transiently drops.
  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      try {
        await touchLastSeen(user.id);
      } catch (err) {
        // helper logs; nothing to do here.
      }
    };

    tick();
    const interval = setInterval(tick, HEARTBEAT_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id]);

  return { onlineCrewIds };
}

export default usePresence;
