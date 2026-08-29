const CACHE_NAME = 'write-urdu-shell-v35';
const APP_SHELL = [
  './',
  './index.html',
  './urdu-editor.html',
  './urdu-keyboard.html',
  './urdu-card-studio.html',
  './urdu-templates.html',
  './stylish-urdu-text-generator.html',
  './urdu-name-art-maker.html',
  './urdu-whatsapp-status-maker.html',
  './urdu-instagram-post-maker.html',
  './qr-code-generator.html',
  './write-urdu-documentation.html',
  './roman-urdu-transliteration.html',
  './urdu-fonts-nastaliq-vs-naskh.html',
  './css/site-header.css',
  './css/v3-production-polish.css',
  './css/account.css',
  './css/account-documents.css',
  './css/my-documents.css',
  './css/outcome-navigation.css',
  './css/workspace-next-step.css',
  './css/core-workspace-convergence.css',
  './css/basic-writer-command-toolbar.css',
  './css/writer-voice-input.css',
  './css/voice-discovery.css',
  './css/card-studio-publish.css',
  './css/community-publishing.css',
  './css/editor-tools.css',
  './css/input-mode.css',
  './css/modern-home.css',
  './css/tools-modern.css',
  './css/card-studio.css',
  './css/template-library.css',
  './css/stylish-urdu.css',
  './css/name-art.css',
  './css/name-art-task-first.css',
  './css/social-maker.css',
  './css/social-direct-workspace.css',
  './css/instagram-direct-workspace.css',
  './css/journey-handoffs.css',
  './css/v2-creation.css',
  './css/v2-creation-tools.css',
  './css/v2-publish-tools.css',
  './css/qr-generator.css',
  './assets/social/write-urdu-home.svg',
  './assets/social/urdu-rich-editor.svg',
  './assets/social/urdu-keyboard.svg',
  './assets/social/urdu-card-studio.svg',
  './assets/social/urdu-template-library.svg',
  './assets/social/urdu-qr-generator.svg',
  './assets/social/write-urdu-documentation.svg',
  './assets/social/write-urdu-faq.svg',
  './assets/social/roman-urdu-transliteration.svg',
  './assets/social/urdu-font-comparison.svg',
  './assets/templates/poetry.svg',
  './assets/templates/social.svg',
  './assets/templates/religious.svg',
  './assets/templates/education.svg',
  './assets/templates/business.svg',
  './assets/templates/events.svg',
  './site-header.js',
  './js/site-header-core.js',
  './locale.config.js',
  './js/locale-route.js',
  './js/account-session.mjs',
  './js/account-control.mjs',
  './js/account-documents.mjs',
  './js/basic-account-documents.mjs',
  './js/editor-account-documents.mjs',
  './js/account-growth-entry.mjs',
  './js/community-publishing.mjs',
  './js/community-publishing-ui.mjs',
  './js/document-share.mjs',
  './js/my-documents-ui.mjs',
  './js/my-documents.mjs',
  './js/outcome-navigation.js',
  './js/core-workspace-convergence.js',
  './js/basic-writer-command-toolbar.js',
  './js/basic-writer-publish.js',
  './js/ai-writing-age-gate.js',
  './js/ai-writing-assistant.js',
  './css/ai-writing-assistant.css',
  './js/share-loop-telemetry.js',
  './js/workspace-journey-registry.js',
  './js/create-publish-boundaries-registry.js',
  './js/workspace-handoff.js',
  './js/core-continuity.js',
  './js/workspace-next-step.js',
  './js/card-studio-handoff-adapter.js',
  './js/qr-handoff-adapter.js',
  './js/template-library-boundary.js',
  './js/share-page.js',
  './js/site-runtime.js',
  './js/editor-tools.js',
  './js/input-mode.js',
  './js/voice-input-core.js',
  './js/unified-urdu-input.js',
  './js/writer-voice-input.js',
  './js/batch-transliteration.js',
  './js/content-locale.js',
  './js/social-maker-core.js',
  './js/card-studio-core.js',
  './js/template-library-core.js',
  './js/card-studio-interaction-core.js',
  './js/card-studio.js',
  './js/card-studio-interaction.js',
  './js/card-studio-entry.js',
  './js/social-direct-workspace.js',
  './js/social-direct-instagram.js',
  './js/template-library.js',
  './js/stylish-urdu-core.js',
  './js/stylish-urdu-text.js',
  './js/name-art-core.js',
  './js/name-art.js',
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

function cacheSuccessfulResponse(request, response) {
  if (response && response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
  }
  return response;
}

function offlineNavigationFallback(request, url) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    const extensionless = url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.');
    if (extensionless) {
      const fallback = new Request(url.origin + url.pathname + '.html', request);
      return caches.match(fallback).then(extensionlessCached => extensionlessCached || caches.match('./index.html'));
    }
    return caches.match('./index.html');
  });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Auth/session/document API responses and account workspace shells are
  // request-specific or account-state-sensitive and must remain network-owned.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/sign-in' ||
    url.pathname === '/sign-in.html' ||
    url.pathname === '/my-documents' ||
    url.pathname === '/my-documents/'
  ) return;

  // Public HTML is acquisition/product content. Always ask the network first
  // so homepage, SEO and discovery releases cannot remain hidden behind an
  // old app-shell snapshot. The cached document is only an offline fallback.
  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => cacheSuccessfulResponse(event.request, response))
        .catch(() => offlineNavigationFallback(event.request, url))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => cacheSuccessfulResponse(event.request, response));
    })
  );
});
