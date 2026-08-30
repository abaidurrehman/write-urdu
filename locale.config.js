/* Shared locale availability configuration for build-time and browser routing. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WriteUrduLocaleConfig = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  var phase1Routes = [
    '/',
    '/urdu-keyboard',
    '/urdu-editor',
    '/tools/urdu-voice-typing',
    '/urdu-alphabet',
    '/urdu-faq',
    '/urdu-card-studio',
    '/how-to-write-urdu-on-photo'
  ];
  var routes = {
    '/': { source: 'index.html', ur: true, indexable: true },
    '/urdu-keyboard': { source: 'urdu-keyboard.html', ur: true, indexable: true },
    '/urdu-editor': { source: 'urdu-editor.html', ur: true, indexable: true },
    '/tools/urdu-voice-typing': { source: 'tools/urdu-voice-typing.html', ur: true, indexable: true },
    '/urdu-alphabet': { source: 'urdu-alphabet.html', ur: true, indexable: true },
    '/urdu-faq': { source: 'urdu-faq.html', ur: true, indexable: true },
    '/urdu-card-studio': { source: 'urdu-card-studio.html', ur: true, indexable: true },
    '/how-to-write-urdu-on-photo': { source: 'how-to-write-urdu-on-photo.html', ur: true, indexable: true },
    '/urdu-writing-templates': { source: 'urdu-writing-templates.html', ur: true, indexable: true, standalone: true },
    // No `source` -- /urdu-writers is a Cloudflare Pages Function (functions/urdu-writers/),
    // not static HTML, so it is deliberately absent from phase1Routes (the static-mirror
    // generator loop). Its /urdu counterpart is a hand-written function mirror instead
    // (functions/urdu/urdu-writers/). This entry only teaches Route.href/hasLocale that
    // the ur counterpart exists, so nav/footer links self-localize.
    '/urdu-writers': { ur: true, indexable: true }
  };
  return {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    prefix: { en: '', ur: '/urdu' },
    routes: routes,
    phase1Routes: phase1Routes
  };
}));
