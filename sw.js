const CACHE_NAME = 'write-urdu-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './urdu-editor.html',
  './urdu-keyboard.html',
  './write-urdu-documentation.html',
  './css/site-header.css',
  './css/editor-tools.css',
  './css/modern-home.css',
  './css/tools-modern.css',
  './site-header.js',
  './js/site-runtime.js',
  './js/editor-tools.js',
  './js/content-locale.js',
  './main.js',
  './google_jsapi.js',
  './manifest.webmanifest',
  './image/logo10.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        const url = new URL(event.request.url);
        const extensionless = url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.');
        if (extensionless) {
          const fallback = new Request(url.origin + url.pathname + '.html', event.request);
          return caches.match(fallback);
        }
        return caches.match('./index.html');
      });
    })
  );
});
