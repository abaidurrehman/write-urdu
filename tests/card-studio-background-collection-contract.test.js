const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const registry = require('../js/card-background-registry.js');
const library = require('../js/card-studio-background-library.js');
const source = fs.readFileSync(path.join(root, 'js', 'card-studio-background-library.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const previousIds = [
  'emerald-mughal', 'moonlit-lanterns', 'vintage-floral', 'burgundy-arch',
  'emerald-jasmine-lanterns', 'midnight-crescent-city', 'emerald-eid-lanterns',
  'blush-rose-lanterns', 'rose-garden-frame', 'heritage-mughal-garden',
  'teal-gold-botanical', 'ivory-arabesque'
];
const newIds = [
  'ajrak-heritage', 'truck-art-bloom', 'peacock-festival', 'ink-wash-poetry',
  'moon-paper', 'old-lahore-journal', 'moonlit-lakeside', 'lantern-sunrise',
  'pastel-glass', 'black-gold-classic', 'maroon-wedding', 'regal-gold-arabesque'
];
const categoryIds = ['all', 'classic', 'pakistan', 'truck-art', 'poetry', 'nature', 'modern', 'wedding', 'luxury'];

assert.strictEqual(library.backgrounds.length, 24, 'collection must include 12 existing and 12 new backgrounds');
assert.strictEqual(library.backgrounds, registry.backgrounds, 'Card Studio must consume the shared background registry');
assert.deepStrictEqual(library.categories.map((item) => item.id), categoryIds, 'category order changed');
assert.deepStrictEqual(library.filterBackgrounds('all'), library.backgrounds, 'All must return every background');
assert.strictEqual(new Set(library.backgrounds.map((item) => item.id)).size, 24, 'background IDs must be unique');
previousIds.forEach((id) => assert.ok(library.backgrounds.some((item) => item.id === id), `existing background removed: ${id}`));

let fullBytes = 0;
let thumbnailBytes = 0;
newIds.forEach((id) => {
  const background = library.backgrounds.find((item) => item.id === id);
  assert.ok(background, `new background missing: ${id}`);
  assert.ok(background.name && background.nameUr, `${id} needs English and Urdu labels`);
  assert.ok(categoryIds.includes(background.category) && background.category !== 'all', `${id} has invalid category`);
  assert.match(background.textColor, /^#[0-9a-f]{6}$/i, `${id} needs a text colour`);
  assert.match(background.overlayColor, /^#[0-9a-f]{6}$/i, `${id} needs an overlay colour`);
  assert.ok(background.overlayOpacity >= 0 && background.overlayOpacity <= 0.8, `${id} has invalid overlay opacity`);
  assert.match(background.src, new RegExp(`/backgrounds/${id}\\.webp$`));
  assert.match(background.thumbnailSrc, new RegExp(`/backgrounds/thumbs/${id}\\.webp$`));
  assert.strictEqual(background.textCapacity, 'long', `${id} must support long Urdu samples`);
  assert.strictEqual(background.preferredAlign, 'center', `${id} needs a controlled preferred alignment`);
  assert.ok(Array.isArray(background.goodFor) && background.goodFor.length > 0, `${id} needs controlled suitability metadata`);
  Object.values(background.safeArea).forEach((value) => assert.ok(value >= 0 && value <= 1, `${id} has invalid safe-area metadata`));

  const full = path.join(root, background.src.replace(/^\//, ''));
  const thumb = path.join(root, background.thumbnailSrc.replace(/^\//, ''));
  assert.ok(fs.existsSync(full), `${id} full asset missing`);
  assert.ok(fs.existsSync(thumb), `${id} thumbnail missing`);
  const fullSize = fs.statSync(full).size;
  const thumbSize = fs.statSync(thumb).size;
  assert.ok(fullSize < 350 * 1024, `${id} full asset exceeds 350 KB`);
  assert.ok(thumbSize < 50 * 1024, `${id} thumbnail exceeds 50 KB`);
  fullBytes += fullSize;
  thumbnailBytes += thumbSize;
  assert.strictEqual(library.filterBackgrounds(background.category).some((item) => item.id === id), true, `${id} missing from filter`);
});

categoryIds.slice(1).forEach((category) => {
  assert.ok(library.filterBackgrounds(category).length > 0, `${category} category must not be empty`);
});
assert.ok(fullBytes < 2 * 1024 * 1024, 'new full assets must stay below 2 MB total');
assert.ok(thumbnailBytes < 200 * 1024, 'new thumbnails must stay below 200 KB total');
assert.match(source, /image\.loading = 'lazy'/, 'thumbnails must remain lazy-loaded');
assert.strictEqual(registry.getBackgroundById('ajrak-heritage').nameUr, 'اجرک ورثہ', 'registry lookup must return the controlled record');
assert.strictEqual(registry.getBackgroundById('missing-background'), null, 'registry lookup must fail safely');
assert.match(source, /background\.thumbnailSrc \|\| background\.src/, 'gallery must use lightweight thumbnails');
assert.match(source, /fetch\(background\.src/, 'full artwork must load only when selected');
assert.match(source, /dispatchField\('text\.color', background\.textColor\)/, 'applying a background must set its text colour');
assert.match(source, /input\.dispatchEvent\(new Event\('change'/, 'background must enter existing editable/exportable image pipeline');
assert.strictEqual(library.mount({ location: { pathname: '/urdu-editor' }, document: {} }), false, 'library must not mount on unrelated routes');
assert.doesNotMatch(sw, /ajrak-heritage|truck-art-bloom|moonlit-lakeside/, 'large new artwork must not be eagerly precached');
assert.match(sw, /\.\/js\/card-background-registry\.js/, 'shared registry must remain available offline with Card Studio');
assert.match(sw, /write-urdu-shell-v49/, 'PWA cache revision must refresh changed collection code');

console.log(`Card Studio background collection contract passed: ${library.backgrounds.length} backgrounds, ${Math.round(fullBytes / 1024)} KB full, ${Math.round(thumbnailBytes / 1024)} KB thumbnails.`);
