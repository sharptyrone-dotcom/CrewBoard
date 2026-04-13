// Custom service worker code injected by next-pwa alongside the
// generated Workbox runtime caching. This restores the push
// notification handlers that were previously in the hand-written
// public/sw.js before next-pwa took over SW generation.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'CrewNotice', body: event.data.text() };
  }

  const { title = 'CrewNotice', body = '', icon, badge, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: badge || '/icon-192.png',
      data: data || {},
      vibrate: [100, 200, 100],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlPath = '/app';
  const refData = event.notification.data || {};
  const hash = refData.refType && refData.refId
    ? `#${refData.refType}/${refData.refId}`
    : '';
  const targetUrl = new URL(urlPath + hash, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then((c) => c.navigate(targetUrl));
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
