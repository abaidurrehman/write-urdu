const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));

const cardPage = read('urdu-card-studio.html');
const guidePage = read('how-to-write-urdu-on-photo.html');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');
const redirects = read('_redirects');

const card = seo.byPath['/urdu-card-studio'];
const guide = seo.byPath['/how-to-write-urdu-on-photo'];

assert.ok(card && card.indexable, 'Card Studio must remain an indexable canonical product route');
assert.strictEqual(card.path, '/urdu-card-studio', 'Card Studio canonical route changed');
assert.match(card.searchTitle || '', /Urdu Text on Photo/i, 'Card Studio acquisition title must lead with Urdu text-on-photo intent');
assert.match(card.searchTitle || '', /Poetry|Post Maker/i, 'Card Studio acquisition title must retain poetry/post-maker intent');
assert.match(card.searchDescription || '', /photo/i, 'Card Studio acquisition description must explain photo creation');
assert.match(card.searchDescription || '', /Nastaliq|Naskh/i, 'Card Studio acquisition description should surface Urdu font differentiation');
assert.strictEqual(card.lastmod, '2026-08-17', 'Card Studio acquisition freshness date is missing');
assert.strictEqual(Boolean(seo.byPath['/urdu-post-maker']), false, 'Keyword-clone Card Studio doorway route must not exist');

const escapedCardTitle = (card.searchTitle || '').replace(/&/g, '&amp;');
assert.ok(cardPage.includes(`<title>${escapedCardTitle}</title>`), 'Initial Card Studio HTML must expose the acquisition title without waiting for JavaScript');
assert.ok(cardPage.includes(`<meta name="description" content="${card.searchDescription}">`), 'Initial Card Studio HTML must expose the acquisition description without waiting for JavaScript');
assert.ok(cardPage.includes(`<meta property="og:title" content="${escapedCardTitle}"`), 'Initial Card Studio Open Graph title must match acquisition ownership');
assert.ok(cardPage.includes(`<meta name="twitter:title" content="${escapedCardTitle}"`), 'Initial Card Studio Twitter title must match acquisition ownership');

assert.ok(guide && guide.indexable, 'Urdu-on-photo guide must be registered and indexable');
assert.strictEqual(guide.schema.includes('Article'), true, 'Urdu-on-photo guide must use Article schema');
assert.match(guidePage, /<h1[^>]*>How to write Urdu text or poetry on a photo online<\/h1>/i, 'Guide H1 changed away from informational intent');
assert.match(guidePage, /href="\/urdu-card-studio"/, 'Guide must hand off directly to Card Studio');
assert.match(guidePage, /changes the sound into Urdu letters; it does not translate English meaning/i, 'Guide must keep transliteration wording accurate');
assert.match(guidePage, /local JPG, PNG or WebP/i, 'Guide must explain local photo/background input');
assert.match(guidePage, /phone|mobile/i, 'Guide must include mobile readability guidance');
assert.match(guidePage, /1080 × 1080/, 'Guide must expose the square output contract');
assert.match(guidePage, /1080 × 1920/, 'Guide must expose the story/status output contract');
assert.doesNotMatch(guidePage, /<ins[^>]+adsbygoogle/i, 'Guide must not hard-code an ad inside its answer content');

assert.match(cardPage, /<main class="card-studio-shell" data-card-studio>/, 'Card Studio task root changed during SEO acquisition work');
assert.match(cardPage, /<section class="seo-content"/, 'Card Studio supporting content must remain after the active workspace');
assert.doesNotMatch(cardPage, /<ins[^>]+adsbygoogle/i, 'Card Studio must not gain a manual ad inside its markup');

assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/how-to-write-urdu-on-photo<\/loc>/, 'Guide is missing from sitemap');
assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/urdu-card-studio<\/loc>[\s\S]*?<lastmod>2026-08-17<\/lastmod>/, 'Card Studio sitemap freshness was not updated');
assert.match(redirects, /\/how-to-write-urdu-on-photo\/ \/how-to-write-urdu-on-photo 301/, 'Guide trailing-slash normalization is missing');
assert.match(llms, /How to write Urdu on a photo/i, 'Guide is missing from llms.txt');
assert.match(llms, /Urdu Card Studio[\s\S]*text or poetry on a photo/i, 'Card Studio acquisition role is missing from llms.txt');

console.log('Card Studio SEO acquisition contract passed.');
