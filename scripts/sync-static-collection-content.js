'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { applyStaticCollectionContent } = require('./static-collection-content.js');

const root = path.resolve(__dirname, '..');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check') || !write;
const routes = [
  ['urdu-templates.html', '/urdu-templates'],
  ['urdu-writing-templates.html', '/urdu-writing-templates'],
  ['urdu/urdu-writing-templates.html', '/urdu/urdu-writing-templates'],
  ['stylish-urdu-text-generator.html', '/stylish-urdu-text-generator']
];

let stale = false;
for (const [relative, route] of routes) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  const expected = applyStaticCollectionContent(source, route);
  if (source === expected) continue;
  if (write) {
    fs.writeFileSync(filename, expected, 'utf8');
    console.log('Updated static collection content in ' + relative);
  } else {
    console.error('Static collection content is stale in ' + relative);
    stale = true;
  }
}

if (check && stale) process.exit(1);
if (check && !stale) console.log('Static collection content is current.');
