#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');
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

let stale = false;
for (const relative of indexableEnglishSources()) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const expected = applyStaticShell(source, { locale: 'en' });
  if (source === expected) continue;
  if (write) {
    fs.writeFileSync(filename, expected, 'utf8');
    console.log('Updated static shell in ' + relative);
  } else {
    console.error('Static shell is stale in ' + relative);
    stale = true;
  }
}

if (check && stale) process.exit(1);
if (check && !stale) console.log('Static source navigation/footer shell is current.');
