const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const loaderJs = fs.readFileSync(path.join(root, 'google_jsapi.js'), 'utf8');

function expect(source, pattern, message) {
  assert.match(source, pattern, message);
}

function count(source, pattern) {
  return (source.match(pattern) || []).length;
}

assert.equal(
  count(indexHtml, /id=["']transliterateTextarea["']/g),
  1,
  'The production transliteration textarea must exist exactly once.'
);

expect(
  indexHtml,
  /<textarea[^>]+id=["']transliterateTextarea["'][^>]*>/i,
  'The transliteration target must remain a textarea.'
);
expect(
  indexHtml,
  /<script[^>]+src=["']google_jsapi\.js["'][^>]*><\/script>/i,
  'The local Google loader must remain present.'
);
expect(
  indexHtml,
  /<script[^>]+src=["']main\.js["'][^>]*><\/script>/i,
  'The core editor helpers must remain present.'
);
expect(
  indexHtml,
  /data-copy-target=["']#transliterateTextarea["']/i,
  'Copy must continue to target the production textarea.'
);
expect(
  indexHtml,
  /saveTextAsFile\(['"]transliterateTextarea['"]/i,
  'Text export must continue to read from the production textarea.'
);
expect(
  mainJs,
  /document\.getElementById\(control\)\.value/,
  'Text export must continue to read the requested editor control.'
);
expect(
  loaderJs,
  /google\.load=function/,
  'The bundled Google loader API must remain available.'
);
expect(
  loaderJs,
  /google\.setOnLoadCallback/,
  'The loader callback API must remain available.'
);

console.log('Transliteration contract checks passed.');
