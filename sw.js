/* =============================================
   Campus AI — Service Worker  (sw.js)
   PWA shell caching for fast repeat loads.
   NOTE: AI API calls always go to network —
   only the app shell (HTML/CSS/JS) is cached.
   ============================================= */
'use strict';

const CACHE_NAME    = 'campus-ai-v3';
const CACHE_FOREVER = 'campus-ai-assets-v3';

// Shell files to cache on install
const SHELL_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/favicon-32.png',
    '/favicon-16.png',
    '/apple-touch-icon.png',
    '/404.html'
];

// External CDN assets to cache
const CDN_FILES = [
    'https://cdn.jsdelivr.net/npm/marked@9/marked.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ── INSTALL: cache shell ──────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching app shell');
            return cache.addAll(SHELL_FILES);
        }).then(() => {
            // Cache CDN assets separately (best effort)
            return caches.open(CACHE_FOREVER).then(cache =>
                Promise.allSettled(CDN_FILES.map(url => cache.add(url)))
            );
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: clean old caches ────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME && k !== CACHE_FOREVER)
                    .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH: strategy per request type ─────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // ① Never cache AI API calls — always network
    const API_HOSTS = [
        'api.groq.com',
        'openrouter.ai',
        'generativelanguage.googleapis.com',
        'image.pollinations.ai',
        'api-inference.huggingface.co',
        'www.google-analytics.com',
        'www.googletagmanager.com'
    ];
    if (API_HOSTS.some(h => url.hostname.includes(h))) {
        event.respondWith(fetch(request));
        return;
    }

    // ② CDN assets — cache first, fallback network
    if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(resp => {
                if (resp && resp.status === 200) {
                    const clone = resp.clone();
                    caches.open(CACHE_FOREVER).then(c => c.put(request, clone));
                }
                return resp;
            }))
        );
        return;
    }

    // ③ Same-origin static assets — cache first, then network
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(resp => {
                    if (resp && resp.status === 200 && request.method === 'GET') {
                        const clone = resp.clone();
                        caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    }
                    return resp;
                }).catch(() => {
                    // Offline fallback for navigation requests
                    if (request.mode === 'navigate') return caches.match('/index.html');
                });
            })
        );
        return;
    }

    // ④ Everything else — network only
    event.respondWith(fetch(request));
});

// ── MESSAGE: force update ─────────────────────────
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});
