const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const redirectsPath = path.join(root, '_redirects');
const rows = fs.readFileSync(registryPath, 'utf8').trim().split(/\r?\n/).slice(1);
const redirects = new Set(
  fs.readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
);

const registry = rows.map((row) => {
  const columns = row.split(',');
  return { sourceFile: columns[0].trim(), canonicalRoute: columns[1].trim() };
});

for (const page of registry) {
  assert.ok(fs.existsSync(path.join(root, page.sourceFile)), `registered source file ${page.sourceFile} must exist`);
  if (page.canonicalRoute === '/' || page.canonicalRoute.endsWith('/')) continue;
  assert.ok(
    !page.sourceFile.endsWith('/index.html'),
    `${page.canonicalRoute} uses a no-slash canonical URL and must not be backed by ${page.sourceFile}; Cloudflare Pages canonicalizes nested index.html files to a trailing slash`
  );
}

for (const route of ['/tools/urdu-voice-typing', '/tools/inpage-unicode-converter']) {
  const page = registry.find((entry) => entry.canonicalRoute === route);
  assert.ok(page, `${route} must stay in the public page registry`);
  assert.strictEqual(page.sourceFile, `${route.slice(1)}.html`, `${route} must be served by a flat .html source file`);
  assert.ok(redirects.has(`${route}/ ${route} 301`), `${route}/ must normalize once to the canonical no-slash URL`);
}

console.log('Cloudflare Pages routing contract passed.');