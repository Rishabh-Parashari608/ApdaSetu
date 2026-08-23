// Service Worker for ApdaSetu Offline Safety Guides and Critical Alerts
const CACHE_NAME = 'apdasetu-v1.4.0';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/state.js',
  './js/i18n.js',
  './js/ai-engine.js',
  './js/sound-engine.js',
  './js/offline-manager.js',
  './js/data/seed-data.js',
  './js/data/safety-guides-data.js',
  './js/components/navbar.js',
  './js/components/homepage.js',
  './js/components/auth-modal.js',
  './js/components/sos-modal.js',
  './js/components/live-alerts.js',
  './js/components/shelter-map.js',
  './js/components/my-requests.js',
  './js/components/family-checkin.js',
  './js/components/community-chat.js',
  './js/components/safety-guides.js',
  './js/components/community-updates.js',
  './js/components/profile-settings.js',
  './js/components/responder-dashboard.js',
  './js/components/emergency-call-modal.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ApdaSetu SW] Pre-caching offline critical assets');
      return cache.addAll(OFFLINE_URLS).catch(err => {
        console.warn('[ApdaSetu SW] Precache non-critical fetch issue (fallback enabled):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ApdaSetu SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache first, refresh in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline */});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Return fallback if applicable
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
