#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const config = require('../locale.config.js');
const locale = require('../locale/ur.js');
const seo = require('../seo.config.js');
const Route = require('../js/locale-route.js');
const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

function outputPath(productPath) {
  if (productPath === '/') return 'urdu/index.html';
  return 'urdu' + productPath + '.html';
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function absolute(productPath, localeCode) {
  const href = Route.href(productPath, localeCode);
  if (!href) throw new Error('Missing ' + localeCode + ' counterpart for ' + productPath);
  return seo.SITE_ORIGIN + href;
}
function setHtmlLocale(html) {
  if (!/<html\b/i.test(html)) throw new Error('Missing <html> element');
  return html.replace(/<html\b([^>]*)>/i, function (_, attrs) {
    attrs = attrs.replace(/\s+lang=(?:"[^"]*"|'[^']*'|[^\s>]+)/ig, '').replace(/\s+dir=(?:"[^"]*"|'[^']*'|[^\s>]+)/ig, '');
    return '<html lang="ur" dir="rtl"' + attrs + '>';
  });
}
function setIndexableRobots(html) {
  const tag = '<meta name="robots" content="index,follow,max-image-preview:large">';
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, tag);
  else html = html.replace(/<head>/i, '<head>\n    ' + tag);
  html = html.replace(/\s+data-wu-urdu-slice-a=["']temporary-noindex["']/ig, '');
  return html;
}
function setTitle(html, value) { return html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + value + '</title>'); }
function setMeta(html, key, value, property) {
  const attr = property ? 'property' : 'name';
  const re = new RegExp('<meta\\b(?=[^>]*\\b' + attr + '=["\\\']' + escapeRegex(key) + '["\\\'])[^>]*>', 'i');
  const tag = '<meta ' + attr + '="' + key + '" content="' + value.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '">';
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, '    ' + tag + '\n</head>');
}
function setCanonical(html, href) {
  const tag = '<link rel="canonical" href="' + href + '">';
  if (/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i.test(html)) return html.replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i, tag);
  return html.replace(/<\/head>/i, '    ' + tag + '\n</head>');
}
function setAlternates(html, productPath) {
  html = html.replace(/\s*<link\b(?=[^>]*rel=["']alternate["'])(?=[^>]*hreflang=["'](?:en|ur|x-default)["'])[^>]*>/ig, '');
  const en = absolute(productPath, 'en');
  const ur = absolute(productPath, 'ur');
  const tags = [
    '<link rel="alternate" hreflang="en" href="' + en + '">',
    '<link rel="alternate" hreflang="ur" href="' + ur + '">',
    '<link rel="alternate" hreflang="x-default" href="' + en + '">'
  ].join('\n    ');
  const canonical = html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/i);
  if (!canonical) throw new Error('Missing canonical link for ' + productPath);
  return html.replace(canonical[0], canonical[0] + '\n    ' + tags);
}
function applyKey(html, key, value) {
  const re = new RegExp('(<([a-z0-9-]+)\\b[^>]*data-wu-l10n=["\\\']' + escapeRegex(key) + '["\\\'][^>]*>)([\\s\\S]*?)(<\\/\\2>)', 'i');
  if (!re.test(html)) throw new Error('Missing localization marker: ' + key);
  return html.replace(re, '$1' + value + '$4');
}
function rootSafeAssets(html) {
  return html.replace(/\b(src|href|action)=(['"])(?![a-z]+:|\/\/|\/|#|\?|mailto:|tel:)([^'"]+)\2/ig, function (_, attr, quote, value) {
    if (!value || value.startsWith('data:')) return _;
    return attr + '=' + quote + '/' + value.replace(/^\.\//, '') + quote;
  });
}
function localeInternalLinks(html) {
  return html.replace(/href=(['"])(\/[^'"?#]*)([^'"]*)\1/ig, function (full, quote, pathname, suffix) {
    if (pathname.startsWith('/urdu/')) return full;
    const target = Route.href(pathname, 'ur');
    return target ? 'href=' + quote + target + suffix + quote : full;
  });
}
function ensureLocaleScripts(html) {
  if (!/src=["']\/locale\.config\.js["']/i.test(html)) {
    html = html.replace(/<\/head>/i, '    <script src="/locale.config.js" defer></script>\n    <script src="/js/locale-route.js" defer></script>\n</head>');
  }
  return html;
}
function schemaNode(type, canonical, copy, page) {
  const common = { '@type': type, url: canonical, name: copy.h1, description: copy.description, inLanguage: 'ur' };
  if (type === 'WebApplication') return Object.assign(common, { operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a modern web browser', isAccessibleForFree: true, applicationCategory: page.id === 'urdu-card-studio' ? 'DesignApplication' : (page.id === 'home' || page.id === 'urdu-editor' ? 'WritingApplication' : 'UtilitiesApplication') });
  if (type === 'Article') return Object.assign(common, { headline: copy.h1, dateModified: copy.lastReviewed || page.lastmod });
  return common;
}
function setStaticSchema(html, productPath, copy) {
  const page = seo.byPath[productPath];
  if (!page) throw new Error('Missing SEO page record for ' + productPath);
  const canonical = absolute(productPath, 'ur');
  const graph = [{ '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: copy.title, description: copy.description, inLanguage: 'ur' }];
  (page.schema || []).forEach(function (type) { graph.push(schemaNode(type, canonical, copy, page)); });
  const payload = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  const tag = '<script type="application/ld+json" data-wu-urdu-schema>' + payload + '</script>';
  html = html.replace(/\s*<script\b[^>]*data-wu-urdu-schema[^>]*>[\s\S]*?<\/script>/ig, '');
  return html.replace(/<\/head>/i, '    ' + tag + '\n</head>');
}
function prepareEnglishSource(productPath, source) {
  return setAlternates(ensureLocaleScripts(source), productPath).replace(/\r\n/g, '\n');
}
function render(productPath, englishSource) {
  const record = config.routes[productPath];
  const copy = locale.routes[productPath];
  const page = seo.byPath[productPath];
  if (!record || !record.ur || !copy || !page || !page.indexable) throw new Error('Incomplete launched Urdu route ' + productPath);
  let html = englishSource;
  html = setHtmlLocale(html);
  html = setIndexableRobots(html);
  html = setTitle(html, copy.title);
  html = setMeta(html, 'description', copy.description, false);
  html = setMeta(html, 'googlebot', 'index,follow,max-image-preview:large', false);
  html = setCanonical(html, absolute(productPath, 'ur'));
  html = setAlternates(html, productPath);
  html = setMeta(html, 'og:title', copy.title, true);
  html = setMeta(html, 'og:description', copy.description, true);
  html = setMeta(html, 'og:url', absolute(productPath, 'ur'), true);
  html = setMeta(html, 'og:locale', locale.ogLocale || 'ur_PK', true);
  html = setMeta(html, 'og:locale:alternate', 'en_US', true);
  html = setMeta(html, 'twitter:title', copy.title, false);
  html = setMeta(html, 'twitter:description', copy.description, false);
  html = applyKey(html, productPath === '/' ? 'home.h1' : record.source.replace(/\.html$/, '').replace(/\//g, '.') + '.h1', copy.h1);
  html = applyKey(html, productPath === '/' ? 'home.lede' : record.source.replace(/\.html$/, '').replace(/\//g, '.') + '.lede', copy.lede);
  Object.keys(copy.strings || {}).forEach(function (key) { html = applyKey(html, key, copy.strings[key]); });
  html = rootSafeAssets(html);
  html = localeInternalLinks(html);
  html = setStaticSchema(html, productPath, copy);
  return html.replace(/\r\n/g, '\n');
}

let stale = false;
for (const productPath of config.phase1Routes) {
  const record = config.routes[productPath];
  const sourceFile = path.join(root, record.source);
  const original = fs.readFileSync(sourceFile, 'utf8').replace(/\r\n/g, '\n');
  const english = prepareEnglishSource(productPath, original);
  if (checkOnly) {
    if (original !== english) {
      console.error('Stale/missing English locale alternates: ' + record.source);
      stale = true;
    }
  } else if (original !== english) {
    fs.writeFileSync(sourceFile, english, 'utf8');
    console.log('Updated English locale alternates in ' + record.source);
  }

  const rel = outputPath(productPath);
  const destination = path.join(root, rel);
  const expected = render(productPath, english);
  if (checkOnly) {
    const actual = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8').replace(/\r\n/g, '\n') : null;
    if (actual !== expected) {
      console.error('Stale/missing generated Urdu page: ' + rel);
      stale = true;
    }
  } else {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, expected, 'utf8');
    console.log('Generated ' + rel);
  }
}
if (stale) process.exit(1);
if (checkOnly) console.log('Urdu locale generated output and reciprocal alternates are current.');
