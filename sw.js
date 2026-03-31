// sw.js — AquaSense Service Worker
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 AquaSense Alert!';
  const body  = data.body  || 'Water quality is UNSAFE!';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
      tag:   'aquasense-alert',
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        { action: 'view', title: '👁 View Dashboard' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
