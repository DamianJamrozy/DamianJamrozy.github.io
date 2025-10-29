/* cache.js (Service Worker) */
self.skipWaiting();
self.clients.claim(); // <-- poprawka: NATYWNE clients.claim()

// Spróbuj wczytać Workbox z CDN
try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
} catch (e) {
    console.warn('Workbox import failed:', e);
}

if (self.workbox) {
    const { routing, strategies, core, precaching, cacheableResponse, expiration } = self.workbox;

    core.setCacheNameDetails({ prefix: 'cv' });
    precaching.cleanupOutdatedCaches();

    // CSS/JS – stale-while-revalidate
    routing.registerRoute(
        ({ request }) => ['style', 'script'].includes(request.destination),
        new strategies.StaleWhileRevalidate({ cacheName: 'cv-static' })
    );

    // Fonty – cache-first (1 rok)
    routing.registerRoute(
        ({ request }) => request.destination === 'font',
        new strategies.CacheFirst({
            cacheName: 'cv-fonts',
            plugins: [
                new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
                new expiration.ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 31536000 })
            ]
        })
    );

    // Obrazy – cache-first (1 rok)
    routing.registerRoute(
        ({ request }) => request.destination === 'image',
        new strategies.CacheFirst({
            cacheName: 'cv-images',
            plugins: [
                new cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
                new expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 31536000 })
            ]
        })
    );
} else {
    // fallback – „pusty” SW, żeby rejestracja nie wybuchała
    self.addEventListener('fetch', () => { });
}
