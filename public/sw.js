// public/sw.js — Service Worker (Offline First)
const CACHE_NAME = 'sender-immersive-v1';
const STATIC_ASSETS = [
  './',
  './en/',
  './productos/',
  './en/productos/',
  './favicon.svg',
  './apple-touch-icon.png',
  './manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => undefined)),
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// Fetch - network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Range requests (video streaming)
  if (request.method !== 'GET' || request.headers.has('range')) return;

  // Skip external origins
  if (url.origin !== location.origin) return;

  // HTML: network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Static assets: cache first
  if (
    url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/media/') ||
    url.pathname.includes('/og/') ||
    url.pathname.includes('/fonts/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Default: network first
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
