// Lightweight service worker for PWA offline readiness and installability
const CACHE_NAME = 'nhealth-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-round-192x192.png',
  '/pwa-round-512x512.png',
  '/favicon-32x32.png',
  '/splash-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Non-GET requests should bypass caching
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // STRICT BYPASS: Never intercept or cache node_modules, Vite dev server modules, versioned scripts (?v=), or API calls
  if (
    url.pathname.includes('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.searchParams.has('v') ||
    url.search.includes('v=') ||
    url.pathname.startsWith('/api/') ||
    url.hostname === 'localhost' ||
    url.port === '3000'
  ) {
    return;
  }

  // Navigation requests: NetworkFirst with 404 & offline fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status === 404) {
            return caches.match('/index.html').then((cached) => {
              return cached || caches.match('/') || fetch('/');
            });
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets matching cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// ==========================================
// WEB PUSH NOTIFICATIONS EVENT LISTENERS
// ==========================================

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Nhealth Alert', body: event.data.text() };
    }
  }

  const title = data.title || 'Nhealth™ Healthcare Notification';
  const options = {
    body: data.body || 'You have an important healthcare notification from Nhealth.',
    icon: data.icon || '/splash-logo.png',
    badge: data.badge || '/favicon-32x32.png',
    image: data.imageUrl || data.image,
    vibrate: [100, 50, 100],
    data: {
      url: data.targetUrl || data.url || '/patient-dashboard#overview',
    },
    actions: [
      { action: 'open', title: 'Open Nhealth' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || client.url === targetUrl) {
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

