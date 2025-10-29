/* cache.js (Service Worker) */
self.skipWaiting();
self.clientsClaim();

// 1) Spróbuj wczytać Workbox z CDN, ale nie zakładaj, że się uda
try {
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
} catch (e) {
    // np. blokada sieci / CDN — odpuść workbox, pojedź fallbackiem
    console.warn('Workbox import failed:', e);
}

// 2) Jeśli Workbox dostępny – konfiguruj cache zgodnie z planem
if (self.workbox) {
    const { routing, strategies, core, precaching, cacheableResponse, expiration } = self.workbox;

    core.setCacheNameDetails({ prefix: 'cv' });
    precaching.cleanupOutdatedCaches();

    // CSS/JS – stale-while-revalidate
    routing.registerRoute(
        ({ request }) => ['style', 'script'].includes(request.destination),
        new strategies.StaleWhileRevalidate({ cacheName: 'cv-static' })
    );

    // Fonty – cache-first na 1 rok
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

    // Obrazy – cache-first na 1 rok
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
    // 3) Fallback: „pusty” SW, żeby się zarejestrował i nie wywalał
    self.addEventListener('fetch', () => { });
}
