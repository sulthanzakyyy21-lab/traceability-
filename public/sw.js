// Service Worker: PT. Santos Jaya Abadi Traceability Platform (SJA-PWA v3.0)
const CACHE_NAME = 'sja-traceability-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/images/coffee-beans-bg.jpg',
  '/flowSections.js?v=4',
  '/js/authStore.js?v=4',
  '/js/pipelineData.js?v=4',
  '/js/clusterTraceStore.js?v=4'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Caching failed on install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER intercept cross-origin requests (Tailwind CDN, Fonts, UNPKG)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Mandatory Single Source of Truth: API queries are ALWAYS network-first (NEVER serve stale/mock DB data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Koneksi jaringan terputus. Mohon periksa sambungan internet/server lokal.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // 3. Static application shell: Stale-While-Revalidate for instant load
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
