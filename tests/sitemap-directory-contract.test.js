const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'write-urdu-sitemap.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'sitemap-directory.css'), 'utf8');

assert.match(html, /<body class="content-page sitemap-directory-page">/, 'Sitemap must use the professional directory shell');
assert.match(html, /Everything you can do with Write Urdu/, 'Task-first sitemap hero missing');
assert.match(html, /id="write"/, 'Write directory section missing');
assert.match(html, /id="create"/, 'Create directory section missing');
assert.match(html, /id="learn"/, 'Learn directory section missing');
assert.match(html, /id="about"/, 'About/support directory section missing');
assert.match(html, /css\/sitemap-directory\.css/, 'Dedicated sitemap stylesheet missing');
assert.match(css, /\.sitemap-directory-grid/, 'Directory card grid styling missing');
assert.match(css, /@media\(max-width:620px\)/, 'Mobile directory layout missing');

for (const route of [
  '/', '/urdu-editor', '/urdu-keyboard', '/urdu-card-studio', '/urdu-templates',
  '/stylish-urdu-text-generator', '/urdu-name-art-maker', '/urdu-whatsapp-status-maker',
  '/urdu-instagram-post-maker', '/qr-code-generator', '/urdu-invoice-generator',
  '/roman-urdu-transliteration', '/english-urdu-typing-tutorial', '/urdu-alphabet',
  '/urdu-fonts-nastaliq-vs-naskh', '/how-to-write-urdu-on-photo', '/write-urdu-documentation',
  '/write-urdu-features', '/urdu-editor-features', '/urdu-faq', '/why-write-urdu',
  '/write-urdu-privacy', '/contact', '/changelog', '/feedback', '/write-urdu-search', '/write-urdu-sitemap'
]) {
  assert.ok(html.includes(`href="${route}"`), `Sitemap directory is missing ${route}`);
}

assert.doesNotMatch(html, /href="\/write-urdu-feedback"/, 'Human sitemap must not keep the retired feedback canonical route');
assert.doesNotMatch(html, /w3schools|bootstrap(?:\.min)?\.css|jquery(?:\.min)?\.js|font-awesome|google\.com\/cse|google\.com\/jsapi/i, 'Legacy framework/search dependencies must not return');
assert.doesNotMatch(html, /<table\b/i, 'Professional sitemap must not regress to the legacy route table');
assert.match(html, /<footer>/, 'Shared site footer placeholder missing');

console.log('Professional sitemap directory contract passed.');