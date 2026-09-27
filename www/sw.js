const CACHE_NAME = 'etsuko-mobile-shell-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/mobile.css',
  './js/api.js',
  './js/player.js',
  './js/touch.js',
  './js/app.js',
  './assets/logo.png',
  './assets/default_cover.png',
  './assets/default_user.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('SW cache partial fail:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache static frontend assets, pass API and audio stream requests directly through to network
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
