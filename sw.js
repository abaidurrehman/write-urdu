const CACHE_NAME = 'write-urdu-shell-v6';
const APP_SHELL = [
  './',
  './index.html',
  './urdu-editor.html',
  './urdu-keyboard.html',
  './urdu-card-studio.html',
  './qr-code-generator.html',
  './write-urdu-documentation.html',
  './roman-urdu-transliteration.html',
  './urdu-fonts-nastaliq-vs-naskh.html',
  './css/site-header.css',
  './css/editor-tools.css',
  './css/modern-home.css',
  './css/tools-modern.css',
  './css/card-studio.css',
  './css/qr-generator.css',
  './assets/social/write-urdu-home.svg',
  './assets/social/urdu-rich-editor.svg',
  './assets/social/urdu-keyboard.svg',
  './assets/social/urdu-card-studio.svg',
  './assets/social/urdu-qr-generator.svg',
  './assets/social/write-urdu-documentation.svg',
  './assets/social/write-urdu-faq.svg',
  './assets/social/roman-urdu-transliteration.svg',
  './assets/social/urdu-font-comparison.svg',
  './site-header.js',
  './js/site-runtime.js',
  './js/editor-tools.js',
  './js/content-locale.js',
  './js/card-studio-core.js',
  './js/card-studio-interaction-core.js',
  './js/card-studio.js',
  './js/card-studio-interaction.js',
  './js/card-studio-entry.js',
  './js/qr-generator-core.js',
  './js/qr-generator-entry.js',
  './js/qr-generator.js',
  './js/vendor/qrcode.js',
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
