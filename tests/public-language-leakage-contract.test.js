const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const firewall = spawnSync(process.execPath, [path.join(root, 'scripts', 'public-language-firewall.js'), '--check'], {
  cwd: root,
  encoding: 'utf8'
});
assert.strictEqual(
  firewall.status,
  0,
  `site-wide public product language firewall must pass:\n${firewall.stdout || ''}${firewall.stderr || ''}`
);

const pages = {
  homepage: read('index.html'),
  about: read('why-write-urdu.html'),
  documentation: read('write-urdu-documentation.html'),
  features: read('write-urdu-features.html'),
  faq: read('urdu-faq.html'),
  cardStudio: read('urdu-card-studio.html'),
  nameArt: read('urdu-name-art-maker.html'),
  cleaner: read('urdu-text-cleaner.html'),
  ocr: read('urdu-ocr.html'),
  inpage: read('tools/inpage-unicode-converter.html'),
  typingGuide: read('roman-urdu-transliteration.html'),
  sharing: read('how-to-share-urdu-writing-online.html'),
  sitemap: read('write-urdu-sitemap.html'),
  privacy: read('write-urdu-privacy.html')
};

const navigation = read('js/outcome-navigation.js');
assert.match(navigation, /Fix broken or messy Urdu text/,
  'governed navigation must describe the text-cleaning job in user language');
assert.match(navigation, /Convert older InPage Urdu/,
  'governed navigation must describe InPage conversion in user language');
assert.ok(!navigation.includes('Fix spacing, RTL and Unicode issues'),
  'old implementation-oriented text-cleaner navigation label must not return');
assert.ok(!navigation.includes('Convert legacy InPage text'),
  'old implementation-oriented InPage navigation label must not return');

assert.ok(!pages.about.includes('not a signup funnel'),
  'About must not expose product-management rationale');
assert.ok(!pages.about.includes('static and browser tests'),
  'About must not expose implementation validation language');
assert.match(pages.about, /GOOD TO KNOW/i,
  'About should frame important caveats as useful user guidance');

assert.ok(!pages.inpage.includes('Mapping profile:'),
  'InPage converter must not expose internal mapping-profile identifiers');
assert.ok(!pages.inpage.includes('Generic product telemetry'),
  'InPage converter must not expose telemetry requirements');
assert.ok(!pages.inpage.includes('runs locally in JavaScript'),
  'InPage converter must not explain its JavaScript implementation');
assert.match(pages.inpage, /Paste older InPage Urdu text|Paste text copied from InPage/i,
  'InPage converter should explain the user action directly');

assert.match(pages.cleaner, /Review the cleaned result/i,
  'text cleaner should lead with a useful review step rather than a privacy defence');
assert.match(pages.ocr, /first use may take a little longer|clear image/i,
  'OCR should describe useful first-use or image-quality guidance without implementation detail');
assert.match(pages.documentation, /Working drafts|Save a working draft/i,
  'documentation should describe draft capability in user language');
assert.match(pages.features, /Saved drafts|Recover saved drafts/i,
  'features page should describe saved drafts without browser-storage architecture');
assert.match(pages.sharing, /What becomes public when you publish/i,
  'sharing guide should explain the publication boundary as a user decision');
assert.match(pages.privacy, /Your data use depends on the feature you choose/i,
  'privacy policy should explain data handling in human language');
assert.ok(!pages.privacy.includes('hash of the private management token'),
  'privacy policy must disclose behavior without leaking token/hash implementation mechanics');
assert.ok(!pages.privacy.includes('ephemeral tab-session identifier'),
  'privacy policy must not publish internal telemetry field names');

assert.match(pages.typingGuide, /<title>English to Urdu Typing with English Letters \| WriteUrdu<\/title>/,
  'typing guide should use the user/search-intent phrase while retaining its existing URL');
assert.match(pages.typingGuide, /<h1[^>]*>English to Urdu Typing with English Letters<\/h1>/,
  'typing guide H1 should avoid specialist transliteration terminology');
assert.ok(!pages.cardStudio.includes('Can I create a card from Roman Urdu?'),
  'Card Studio should use English-letter typing language in user-facing FAQ copy');

for (const [name, html] of Object.entries(pages)) {
  assert.match(html, /<link rel="canonical" href="https:\/\/write-urdu\.com\//,
    `${name} must retain an explicit canonical URL`);
}

assert.match(pages.homepage, /<title>English to Urdu Typing Online \| WriteUrdu<\/title>/,
  'P0 language cleanup must not change the homepage search title');
assert.match(pages.homepage, /<h1[^>]*>English to Urdu Typing Online<\/h1>/,
  'P0 language cleanup must not change the homepage H1');

console.log('Public-language leakage contract checks passed.');
