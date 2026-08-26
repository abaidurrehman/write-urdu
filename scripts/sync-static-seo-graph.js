'use strict';

const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');
const { applyStaticSeoGraph } = require('./static-seo-graph.js');

const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check') || !write;

function sourceFileForRoute(route) {
  if (route === '/') return 'index.html';
  return route.replace(/^\//, '') + '.html';
}

function indexableEnglishPages() {
  const result = [];
  for (const page of seo.pages || []) {
    if (!page || page.indexable !== true || !page.path || page.path.startsWith('/urdu/')) continue;
    const relative = sourceFileForRoute(page.path);
    if (!fs.existsSync(path.join(root, relative))) continue;
    result.push({ page, relative });
  }
  return result.sort((a, b) => a.relative.localeCompare(b.relative));
}

let stale = false;
for (const entry of indexableEnglishPages()) {
  const filename = path.join(root, entry.relative);
  const source = fs.readFileSync(filename, 'utf8');
  const expected = applyStaticSeoGraph(source, entry.page, { language: 'en' });
  if (source === expected) continue;
  if (write) {
    fs.writeFileSync(filename, expected, 'utf8');
    console.log('Updated static SEO graph in ' + entry.relative);
  } else {
    console.error('Static SEO graph is stale in ' + entry.relative);
    stale = true;
  }
}

if (check && stale) process.exit(1);
if (check && !stale) console.log('Static English SEO graphs are current.');
