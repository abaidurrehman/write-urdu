/* Shared locale availability configuration for build-time and browser routing. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WriteUrduLocaleConfig = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  var routes = {
    '/': { source: 'index.html', ur: true, indexable: true },
    '/urdu-keyboard': { source: 'urdu-keyboard.html', ur: true, indexable: true },
    '/urdu-editor': { source: 'urdu-editor.html', ur: true, indexable: true },
    '/tools/urdu-voice-typing': { source: 'tools/urdu-voice-typing.html', ur: true, indexable: true },
    '/urdu-alphabet': { source: 'urdu-alphabet.html', ur: true, indexable: true },
    '/urdu-faq': { source: 'urdu-faq.html', ur: true, indexable: true },
    '/urdu-card-studio': { source: 'urdu-card-studio.html', ur: true, indexable: true },
    '/how-to-write-urdu-on-photo': { source: 'how-to-write-urdu-on-photo.html', ur: true, indexable: true }
  };
  return {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    prefix: { en: '', ur: '/urdu' },
    routes: routes,
    phase1Routes: Object.keys(routes)
  };
}));
