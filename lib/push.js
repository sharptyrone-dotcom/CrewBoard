import { supabase } from './supabase';
import { CURRENT_VESSEL_ID } from './constants';

// The VAPID public key is exposed to the client so the browser can
// verify push payloads came from our server. The private key stays
// server-side in the API route.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Converts a base64url VAPID key to the Uint8Array the Push API wants.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Returns true when the browser supports push and we have a VAPID key.
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY
  );
}

// Returns the current push permission state: 'granted', 'denied', or
// 'default' (not yet asked). Returns 'unsupported' when the browser
// doesn't support push.
export function getPushPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Registers the service worker and subscribes to push notifications.
// Stores the subscription in Supabase so the API route can look it up
// later. Returns the PushSubscription on success, null on failure.
//
// This triggers the browser's native permission prompt if the user
// hasn't already granted/denied. Call it from a user-initiated event
// (button click) so browsers don't block the prompt.
export async function subscribeToPush(crewMemberId) {
  if (!isPushSupported()) {
    console.warn('[push] Push not supported in this browser');
    return null;
  }

  try {
    // 1. Register (or retrieve) the service worker.
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 2. Subscribe to push — this triggers the browser permission prompt
    //    if the user hasn't responded yet.
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // 3. Extract the keys the server needs to encrypt payloads.
    const json = subscription.toJSON();
    const { endpoint } = json;
    const p256dh = json.keys?.p256dh || '';
    const auth = json.keys?.auth || '';

    // 4. Persist to Supabase (upsert on crew+endpoint to avoid dupes
    //    when the user revisits the permission flow).
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          crew_member_id: crewMemberId,
          vessel_id: CURRENT_VESSEL_ID,
          endpoint,
          p256dh,
          auth,
        },
        { onConflict: 'crew_member_id,endpoint' }
      );

    if (error) {
      console.error('[push] Failed to save subscription', error);
      // Don't throw — the browser is subscribed even if storage failed.
      // Next time they visit we'll try to save again.
    }

    console.log('[push] Subscribed successfully');
    return subscription;
  } catch (err) {
    console.error('[push] Subscription failed', err);
    return null;
  }
}

// Unsubscribes from push and removes the stored subscription.
export async function unsubscribeFromPush(crewMemberId) {
  if (!isPushSupported()) return;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    // Remove from Supabase first.
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('crew_member_id', crewMemberId)
      .eq('endpoint', subscription.endpoint);

    // Then unsubscribe from the browser.
    await subscription.unsubscribe();
    console.log('[push] Unsubscribed');
  } catch (err) {
    console.error('[push] Unsubscribe failed', err);
  }
}

// Checks whether the current browser is already subscribed. Useful for
// rendering a toggle or banner without triggering the permission prompt.
export async function isSubscribed() {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
