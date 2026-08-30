const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const allHtml = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const infrastructureHtml = allHtml.filter(file => file.startsWith('google'));
const systemHtml = new Set(['404.html']);
const publicHtml = allHtml.filter(file => !infrastructureHtml.includes(file) && !systemHtml.has(file));

for (const file of publicHtml) {
  const html = read(file);
  assert.match(html, /<html[^>]*\blang=["']en["']/i, `${file} must declare English at the root locale`);
  assert.doesNotMatch(html, /GTM-M45V9FW|googletagmanager\.com\/gtm\.js/i, `${file} must not reload the retired GTM container`);
  assert.doesNotMatch(html, /javascript[\\/]main\.js/i, `${file} must not reference the obsolete javascript/main.js path`);
  assert.doesNotMatch(html, /menuscript|writting|lcass=|cwlass=|your to write|right write/i, `${file} contains a known retired copy/source typo`);

  for (const level of [1, 2, 3, 4, 5, 6]) {
    const opens = (html.match(new RegExp(`<h${level}(?:\\s|>)`, 'gi')) || []).length;
    const closes = (html.match(new RegExp(`</h${level}>`, 'gi')) || []).length;
    assert.equal(opens, closes, `${file} has an unbalanced h${level} heading`);
  }
}

for (const file of ['index.html', 'urdu-editor.html', 'urdu-keyboard.html']) {
  const html = read(file);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  assert.deepEqual(duplicateIds, [], `${file} contains duplicate IDs: ${duplicateIds.join(', ')}`);
}

for (const file of infrastructureHtml) {
  assert.match(read(file), /^google-site-verification:/, `${file} must remain an explicit search-verification resource`);
}

assert.ok(fs.existsSync(path.join(root, 'manifest.webmanifest')), 'Installable app manifest is missing');
assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'Offline service worker is missing');
assert.match(read('manifest.webmanifest'), /"start_url"\s*:\s*"\.\/"/, 'PWA start URL is missing');
assert.match(read('sw.js'), /CACHE_NAME|addEventListener\(['"]fetch['"]/, 'Offline service worker shell is incomplete');
assert.match(read('main.js'), /new Blob\(\[['"]\\ufeff['"],\s*textToSave\].*charset=utf-8/, 'Plain-text export must preserve Urdu as UTF-8 with BOM');

console.log(`Static HTML sanity checks passed for ${publicHtml.length} root pages.`);
