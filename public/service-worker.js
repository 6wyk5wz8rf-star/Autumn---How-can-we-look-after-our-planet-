const CACHE_PREFIX = 'our-planet-autumn-atlas-';
const CACHE_VERSION = `${CACHE_PREFIX}/* INJECT_CACHE_VERSION */`;
const PRECACHE_ASSETS = [/* INJECT_BUILD_ASSETS */];
const SHELL = [...new Set(['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', ...PRECACHE_ASSETS])];

self.addEventListener('install', (event) => {
  // A new worker waits when an older build is controlling an open page. This
  // prevents a mid-session cache swap from removing a lazily loaded old chunk.
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          const contentType = response.headers.get('content-type') || '';
          if (response.ok && contentType.includes('text/html')) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
            return response;
          }
          return (await caches.match('./index.html')) || response;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
