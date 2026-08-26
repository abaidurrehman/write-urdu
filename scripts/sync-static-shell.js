#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');
const localeConfig = require('../locale.config.js');
const Route = require('../js/locale-route.js');
const { applyStaticShell } = require('./static-shell.js');

const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check') || !write;

function sourceFileForRoute(route) {
  if (route === '/') return 'index.html';
  return route.replace(/^\//, '') + '.html';
}

function indexableEnglishSources() {
  const files = [];
  for (const page of seo.pages || []) {
    if (!page || page.indexable !== true || !page.path || page.path.startsWith('/urdu/')) continue;
    const relative = sourceFileForRoute(page.path);
    if (!fs.existsSync(path.join(root, relative))) continue;
    if (!files.includes(relative)) files.push(relative);
  }
  return files.sort();
}

function urduHrefFor(href) {
  const value = String(href || '');
  if (!value.startsWith('/')) return value;
  const match = value.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return value;
  const pathname = match[1] || '/';
  if (pathname.startsWith('/urdu/')) return value;
  const target = Route.href(pathname, 'ur');
  return target ? target + (match[2] || '') : value;
}

function standaloneUrduSources() {
  const files = [];
  for (const [productPath, record] of Object.entries(localeConfig.routes || {})) {
    if (!record || !record.ur || !record.standalone) continue;
    const relative = productPath === '/' ? 'urdu/index.html' : 'urdu' + productPath + '.html';
    if (fs.existsSync(path.join(root, relative))) files.push(relative);
  }
  return files.sort();
}

let stale = false;
function syncFile(relative, options) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const expected = applyStaticShell(source, options);
  if (source === expected) return;
  if (write) {
    fs.writeFileSync(filename, expected, 'utf8');
    console.log('Updated static shell in ' + relative);
  } else {
    console.error('Static shell is stale in ' + relative);
    stale = true;
  }
}

for (const relative of indexableEnglishSources()) {
  syncFile(relative, { locale: 'en' });
}
for (const relative of standaloneUrduSources()) {
  syncFile(relative, { locale: 'ur', hrefFor: urduHrefFor });
}

if (check && stale) process.exit(1);
if (check && !stale) console.log('Static source navigation/footer shell is current.');
