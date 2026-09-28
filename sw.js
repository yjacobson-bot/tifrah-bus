// Service Worker — התראות רקע ל-tifrah-bus
// בדיקת גרסה נעשית מהדף עצמו; ה-SW רק מעביר הודעות ומציג התראות

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// קבל הודעת עדכון מהדף → הצג התראת מערכת אם אין טאבים פתוחים
self.addEventListener('message', async e => {
  if (e.data?.type === 'SHOW_UPDATE_NOTIFICATION') {
    const clients = await self.clients.matchAll({ type: 'window' });
    if (clients.length === 0) {
      self.registration.showNotification('מערכת הסעות תפרח', {
        body: 'עדכון חדש זמין — לחץ לפתיחה',
        tag: 'tifrah-update',
        renotify: true,
        dir: 'rtl'
      });
    }
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) { clients[0].focus(); }
      else self.clients.openWindow('/');
    })
  );
});
