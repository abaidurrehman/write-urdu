const assert = require('assert');
const fs = require('fs');
const config = require('../seo.config.js');
const ads = require('../js/ads.js');

const html = fs.readFileSync('stylish-urdu-text-generator.html', 'utf8');
const page = config.byPath['/stylish-urdu-text-generator'];

assert(page, 'Stylish Urdu Text route must remain registered');
assert.strictEqual(page.h1, 'Stylish Urdu Text and Name Generator');
assert.deepStrictEqual(page.schema, ['WebApplication', 'FAQPage']);
assert.strictEqual(ads.resolvePageType('/stylish-urdu-text-generator'), 'create');

assert.match(html, /Stylish Urdu Text Generator – Urdu Name Styles Copy and Paste/);
assert.match(html, /data-wu-ad-boundary="post-workspace"/);
assert.ok(html.indexOf('data-stylish-results') < html.indexOf('class="stylish-seo"'), 'Results must remain before supporting acquisition content');
assert.match(html, /Copyable stylish Urdu text, not a fake font promise/);
assert.match(html, /How to make stylish Urdu text for WhatsApp, Instagram and profiles/);
assert.match(html, /destination app controls the font/i);
assert.match(html, /No universal compatibility guarantee is possible/);
assert.match(html, /exact Nastaliq or Naskh look/);
assert.match(html, /href="\/urdu-name-art-maker"/);
assert.match(html, /href="\/urdu-card-studio"/);
assert.match(html, /href="\/urdu-templates"/);

assert.doesNotMatch(html, /guaranteed to work in every app|works on every phone|all apps support/i);

console.log('Stylish Urdu SEO acquisition contract passed.');
