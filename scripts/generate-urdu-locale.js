#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const config = require('../locale.config.js');
const locale = require('../locale/ur.js');
const Route = require('../js/locale-route.js');
const root = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');

function outputPath(productPath) {
  if (productPath === '/') return 'urdu/index.html';
  return 'urdu' + productPath + '.html';
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function setHtmlLocale(html) {
  if (!/<html\b/i.test(html)) throw new Error('Missing <html> element');
  return html.replace(/<html\b([^>]*)>/i, function (_, attrs) {
    attrs = attrs.replace(/\s+lang=(?:"[^"]*"|'[^']*'|[^\s>]+)/ig, '').replace(/\s+dir=(?:"[^"]*"|'[^']*'|[^\s>]+)/ig, '');
    return '<html lang="ur" dir="rtl"' + attrs + '>';
  });
}

function setTemporaryRobots(html) {
  const tag = '<meta name="robots" content="noindex,follow,max-image-preview:large" data-wu-urdu-slice-a="temporary-noindex">';
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, tag);
  return html.replace(/<head>/i, '<head>\n    ' + tag);
}

function setTitle(html, value) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + value + '</title>');
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

function render(productPath) {
  const record = config.routes[productPath];
  if (!record || !record.ur) throw new Error('Unregistered Urdu route ' + productPath);
  const copy = locale.routes[productPath];
  if (!copy) throw new Error('Missing Urdu catalogue entry ' + productPath);
  let html = fs.readFileSync(path.join(root, record.source), 'utf8');
  html = setHtmlLocale(html);
  html = setTemporaryRobots(html);
  html = setTitle(html, copy.title);
  html = applyKey(html, productPath === '/' ? 'home.h1' : record.source.replace(/\.html$/, '').replace(/\//g, '.') + '.h1', copy.h1);
  html = applyKey(html, productPath === '/' ? 'home.lede' : record.source.replace(/\.html$/, '').replace(/\//g, '.') + '.lede', copy.lede);
  html = rootSafeAssets(html);
  html = localeInternalLinks(html);
  html = ensureLocaleScripts(html);
  return html.replace(/\r\n/g, '\n');
}

let stale = false;
for (const productPath of config.phase1Routes) {
  const rel = outputPath(productPath);
  const destination = path.join(root, rel);
  const expected = render(productPath);
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
if (checkOnly) console.log('Urdu locale generated output is current.');
