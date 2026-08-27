const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));

const html = read('changelog.html');
const css = read('css/changelog.css');
const navigation = read('js/outcome-navigation.js');
const sitemap = read('sitemap.xml');
const humanSitemap = read('write-urdu-sitemap.html');
const redirects = read('_redirects');
const llms = read('llms.txt');
const spec = read('specs/WU-CHANGELOG-001-customer-facing-product-updates.md');
const page = seo.byPath['/changelog'];

assert.ok(page && page.indexable, 'Customer changelog must be a registered indexable public page');
assert.strictEqual(page.path, '/changelog', 'Customer changelog canonical owner changed');
assert.strictEqual(page.h1, 'New in Write Urdu', 'Customer changelog H1 changed');
assert.match(page.title, /What.s New in Write Urdu/i, 'Customer-facing changelog title missing');
assert.match(page.description, /simple language/i, 'Changelog description must promise plain-language updates');
assert.ok((page.schema || []).includes('WebPage'), 'Changelog should use WebPage schema');

assert.ok(html.includes(`<title>${page.title}</title>`), 'Static changelog title must match SEO registry');
assert.ok(html.includes(`<meta name="description" content="${page.description}">`), 'Static changelog description must match SEO registry');
assert.ok(html.includes(`<meta property="og:description" content="${page.description}"`), 'Open Graph changelog description must match SEO registry');
assert.ok(html.includes(`<meta name="twitter:description" content="${page.description}"`), 'Twitter changelog description must match SEO registry');
assert.match(html, /<link rel="canonical" href="https:\/\/write-urdu\.com\/changelog">/, 'Changelog canonical link missing');
assert.match(html, /<h1[^>]*>New in Write Urdu<\/h1>/, 'Customer changelog H1 missing');

const releases = html.match(/<article class="changelog-release"/g) || [];
assert.ok(releases.length >= 8, 'Changelog must contain the verified customer-facing release history');
const aug24 = html.indexOf('datetime="2026-08-24"');
const aug22 = html.indexOf('datetime="2026-08-22"');
const aug20 = html.indexOf('datetime="2026-08-20"');
const aug19 = html.indexOf('datetime="2026-08-19"');
const aug18 = html.indexOf('datetime="2026-08-18"');
const aug17 = html.indexOf('datetime="2026-08-17"');
assert.ok(
    aug24 >= 0 && aug22 > aug24 && aug20 > aug22 && aug19 > aug20 && aug18 > aug19 && aug17 > aug18,
    'Changelog releases must appear newest first'
);
assert.match(html, /What changed/i, 'Changelog must explain what changed');
assert.match(html, /Why it helps/i, 'Changelog must explain customer benefit');
assert.match(html, /How to use it/i, 'Changelog must explain how to use shipped changes');
assert.match(html, /href="\/"[^>]*>Try English to Urdu typing/, 'Changelog must link directly to the main typing experience');
assert.match(html, /href="\/urdu-writing-templates"/, 'Writing Templates release link missing');
assert.match(html, /href="\/urdu\/"/, 'Urdu-language release link missing');
assert.match(html, /href="\/sign-in"[^>]*>Sign in to use My Documents/, 'My Documents account entry link missing');
assert.match(html, /Voice input now works inside the main writing and design tools/, 'Expanded Voice input release missing');
assert.match(html, /href="\/urdu-text-cleaner"/, 'Text Cleaner release link missing');
assert.match(html, /href="\/urdu-ocr"/, 'Image-to-text release link missing');
assert.match(html, /href="\/tools\/urdu-voice-typing"/, 'Voice Typing release link missing');
assert.match(html, /href="\/tools\/inpage-unicode-converter"/, 'InPage release link missing');
assert.doesNotMatch(html, /PR\s*#|GitHub Actions|telemetry|contract test|\bD1\b|\bR2\b/i, 'Public changelog must not expose implementation/release-engineering language');
assert.doesNotMatch(html, /adsbygoogle|js\/ads\.js/i, 'Customer changelog must remain ad-free');

assert.match(navigation, /href: '\/changelog'[\s\S]*What.s new/, 'Shared footer must expose What’s new');
assert.match(humanSitemap, /href="\/changelog"/, 'Human-readable sitemap must expose changelog');
assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/changelog<\/loc>/, 'XML sitemap must include changelog');
assert.match(redirects, /^\/changelog\.html \/changelog 301$/m, 'Legacy .html changelog route must normalize to canonical route');
assert.match(redirects, /^\/changelog\/ \/changelog 301$/m, 'Trailing-slash changelog route must normalize to canonical route');
assert.match(llms, /What.s new in Write Urdu[\s\S]*\/changelog/i, 'llms.txt must expose customer changelog');

assert.match(spec, /What changed\?/i, 'Changelog policy must require what changed');
assert.match(spec, /Why does it help\?/i, 'Changelog policy must require customer benefit');
assert.match(spec, /How do I use it\?/i, 'Changelog policy must require usage instructions');
assert.match(spec, /internal architecture/i, 'Changelog policy must explicitly exclude internal architecture');
assert.match(spec, /has not shipped|unreleased/i, 'Changelog policy must exclude work that has not shipped');
assert.match(css, /@media \(max-width: 560px\)/, 'Changelog must include phone-responsive layout');

console.log('Customer-facing changelog contract passed.');
