(function (root, factory) {
  var config = root && root.WriteUrduLocaleConfig;
  if (typeof module === 'object' && module.exports) {
    try { config = require('../locale.config.js'); } catch (error) { config = config || null; }
    module.exports = factory(config);
  } else {
    root.WriteUrduLocaleRoute = factory(config);
  }
}(typeof self !== 'undefined' ? self : this, function (config) {
  'use strict';
  config = config || { prefix: { en: '', ur: '/urdu' }, routes: {} };

  function stripQueryHash(value) {
    return String(value || '/').split('?')[0].split('#')[0] || '/';
  }

  function cleanProductPath(value) {
    var path = stripQueryHash(value).replace(/\\+/g, '/');
    if (!path.startsWith('/')) path = '/' + path;
    if (path === '/index' || path === '/index.html') return '/';
    if (/\/index(?:\.html)?$/i.test(path)) path = path.replace(/\/index(?:\.html)?$/i, '') || '/';
    if (/\.html$/i.test(path)) path = path.slice(0, -5);
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  }

  function parse(pathname) {
    var raw = cleanProductPath(pathname);
    var locale = 'en';
    var product = raw;
    if (raw === '/urdu' || raw.indexOf('/urdu/') === 0) {
      locale = 'ur';
      product = raw === '/urdu' ? '/' : raw.slice('/urdu'.length) || '/';
      product = cleanProductPath(product);
    }
    return { locale: locale, productPath: product, pathname: raw };
  }

  function hasLocale(productPath, locale) {
    var route = config.routes && config.routes[cleanProductPath(productPath)];
    if (locale === 'en') return Boolean(route || cleanProductPath(productPath));
    return Boolean(route && route[locale]);
  }

  function href(productPath, locale) {
    var product = cleanProductPath(productPath);
    locale = locale === 'ur' ? 'ur' : 'en';
    if (locale === 'ur') {
      if (!hasLocale(product, 'ur')) return null;
      return product === '/' ? '/urdu/' : '/urdu' + product;
    }
    return product;
  }

  function counterpart(pathname, targetLocale) {
    var parsed = parse(pathname);
    return href(parsed.productPath, targetLocale);
  }

  return {
    parse: parse,
    productPath: function (pathname) { return parse(pathname).productPath; },
    locale: function (pathname) { return parse(pathname).locale; },
    href: href,
    counterpart: counterpart,
    hasLocale: hasLocale,
    normalizeProductPath: cleanProductPath
  };
}));
