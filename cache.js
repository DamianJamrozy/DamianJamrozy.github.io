/* sw.js (root) */
self.skipWaiting();
self.clientsClaim();

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// porządek przy aktualizacjach
workbox.core.setCacheNameDetails({prefix: 'cv'});
workbox.precaching.cleanupOutdatedCaches();

// CSS/JS → szybko odświeżaj z tła
workbox.routing.registerRoute(
  ({request}) => ['style', 'script'].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'cv-static',
  })
);

// Fonty → trzymaj długo w cache
workbox.routing.registerRoute(
  ({request}) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'cv-fonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses: [0, 200]}),
      new workbox.expiration.ExpirationPlugin({maxEntries: 30, maxAgeSeconds: 31536000}) // 1 rok
    ]
  })
);

// Obrazy (AVIF/WEBP) → CacheFirst z limitem
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'cv-images',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({statuses: [0, 200]}),
      new workbox.expiration.ExpirationPlugin({maxEntries: 60, maxAgeSeconds: 31536000})
    ]
  })
);
