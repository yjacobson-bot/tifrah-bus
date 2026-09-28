// Service Worker — בדיקת עדכונים ל-tifrah-bus
const GH_REPO = 'yjacobson-bot/tifrah-bus';
const CHECK_INTERVAL = 60000; // כל דקה
let lastSha = null;

async function checkForUpdate() {
  try {
    const r = await fetch(
      `https://api.github.com/repos/${GH_REPO}/commits?per_page=1`,
      { headers: { Accept: 'application/vnd.github.v3+json' }, cache: 'no-store' }
    );
    if (!r.ok) return;
    const data = await r.json();
    const sha = data[0]?.sha;
    if (!sha) return;
    if (lastSha === null) { lastSha = sha; return; }
    if (sha !== lastSha) {
      lastSha = sha;
      // שלח הודעה לכל הטאבים הפתוחים
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(c => c.postMessage({ type: 'NEW_VERSION' }));
      // אם אין טאבים פתוחים — התראה של המערכת
      if (clients.length === 0) {
        self.registration.showNotification('מערכת הסעות תפרח', {
          body: 'עדכון חדש זמין — לחץ לפתיחה',
          icon: '/favicon.ico',
          tag: 'tifrah-update',
          renotify: true,
          dir: 'rtl'
        });
      }
    }
  } catch {}
}

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
  setInterval(checkForUpdate, CHECK_INTERVAL);
  checkForUpdate();
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length) { clients[0].focus(); clients[0].navigate(clients[0].url); }
      else self.clients.openWindow('/');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'INIT_SHA') lastSha = e.data.sha;
});
