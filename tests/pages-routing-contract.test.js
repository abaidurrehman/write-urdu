const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const redirectsPath = path.join(root, '_redirects');
const notFoundPath = path.join(root, '404.html');
const rows = fs.readFileSync(registryPath, 'utf8').trim().split(/\r?\n/).slice(1);
const redirectSource = fs.readFileSync(redirectsPath, 'utf8');
const redirects = new Set(
  redirectSource
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

assert.ok(fs.existsSync(notFoundPath), 'Cloudflare Pages must have a top-level 404.html so unknown routes do not fall back to index.html with 200');
const notFound = fs.readFileSync(notFoundPath, 'utf8');
assert.match(notFound, /<meta\s+name=["']robots["']\s+content=["']noindex,follow["']/i, '404 page must remain noindex,follow');
assert.match(notFound, /<h1\b[^>]*>[^<]*(?:couldn.t find|page not found)/i, '404 page must clearly explain that the page was not found');
assert.match(notFound, /href=["']\/["']/, '404 page must link back to the main Urdu writer');
assert.match(notFound, /href=["']\/write-urdu-search["']/, '404 page must offer site search');
assert.match(notFound, /href=["']\/write-urdu-sitemap["']/, '404 page must offer the human sitemap');
assert.doesNotMatch(notFound, /<link\b[^>]*rel=["']canonical["']/i, '404 page must not claim a canonical URL');
assert.doesNotMatch(redirectSource, /^\/\*\s+\/(?:index\.html)?\s+200\s*$/m, 'Pages routing must not reintroduce an SPA fallback that turns unknown paths into homepage 200s');

console.log('Cloudflare Pages routing contract passed.');
