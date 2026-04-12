// Service worker for CrewBoard push notifications.
//
// Handles incoming push events from the Web Push API and displays
// native OS notifications. Clicking a notification navigates the
// user to the relevant screen in the app.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'CrewBoard', body: event.data.text() };
  }

  const { title = 'CrewBoard', body = '', icon, badge, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-192x192.png',
      data: data || {},
      // Vibrate pattern: short-long-short, noticeable but not annoying.
      vibrate: [100, 200, 100],
      // Keep the notification around until the user interacts with it.
      requireInteraction: true,
    })
  );
});

// When the user taps/clicks a notification, focus the existing tab or
// open a new one pointed at the app. If the notification carries a
// reference (notice or document), we append a hash so the app can
// deep-link to it on load.
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
      // If the app is already open in a tab, focus it.
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then((c) => c.navigate(targetUrl));
        }
      }
      // Otherwise open a new tab.
      return clients.openWindow(targetUrl);
    })
  );
});

// Activate immediately so we don't need a page refresh after first
// service worker installation.
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
