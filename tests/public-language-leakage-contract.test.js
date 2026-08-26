const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const pages = {
  tutorial: read('english-urdu-typing-tutorial.html'),
  photo: read('how-to-write-urdu-on-photo.html'),
  nameArt: read('urdu-name-art-maker.html'),
  sharing: read('how-to-share-urdu-writing-online.html'),
  inpage: read('tools/inpage-unicode-converter.html'),
  ocr: read('urdu-ocr.html'),
  instagram: read('urdu-instagram-post-maker.html'),
  sitemap: read('write-urdu-sitemap.html'),
  privacy: read('write-urdu-privacy.html')
};

const leakedPublicPhrases = [
  'Existing tutorial URL retained for continuity',
  'competing for the same broad Urdu-typing intent',
  'without creating a different tool for every phrase people search',
  'There is no second WriteUrdu tool embedded inside Name Art',
  'Loading the direct Name Art canvas',
  'Live Urdu Name Art canvas and design controls',
  'server-rendered social metadata',
  'Write Urdu provenance',
  'browser-first workflow',
  'only the selected public snapshot crosses it',
  'small operational metadata',
  'private management token',
  'immutable snapshot',
  'discovery feeds',
  'inpage-v1v2-clipboard-2026-08-17',
  'preferred legacy byte',
  'configured CDN',
  'safe-area guide',
  'purpose-built sizes and safe areas',
  'Product documentation',
  'Writing operations',
  'ephemeral tab-session identifier',
  'hash of the private management token',
  'source-tool/preset information',
  'limited operational/moderation fields',
  'same-origin Write Urdu Pages Function',
  'private service-bound mailer',
  'product-telemetry database',
  'Write-Urdu.com provenance footer',
  'search-content program'
];

const publicCorpus = Object.values(pages).join('\n');
for (const phrase of leakedPublicPhrases) {
  assert.ok(!publicCorpus.includes(phrase), `public copy must not expose implementation/SEO wording: ${phrase}`);
}

assert.match(pages.photo, /same Card Studio workflow for Urdu poetry, quote images, greetings, announcements and social posts/i,
  'photo guide should explain reusable outcomes in user language');
assert.match(pages.nameArt, /Create your Urdu name design here/i,
  'Name Art hero should describe the user task');
assert.match(pages.nameArt, /Loading your Name Art editor/i,
  'Name Art loading copy should describe the user-facing editor');
assert.match(pages.sharing, /A published link keeps the version you shared at that time/i,
  'sharing guide should explain publication version behavior in user language');
assert.match(pages.sharing, /private deletion access/i,
  'sharing guide should explain deletion capability without exposing token mechanics');
assert.match(pages.inpage, /Check the result before using it/i,
  'InPage converter should present compatibility risk as a user review step');
assert.match(pages.ocr, /first time you use the tool, your browser may download the files it needs to read Urdu text/i,
  'OCR should describe first-use loading without CDN implementation language');
assert.match(pages.instagram, /optional guide while editing/i,
  'Instagram maker should explain the visual guide in user language');
assert.match(pages.sitemap, /Speak in Urdu and turn your voice into editable text/i,
  'human sitemap should describe voice typing by outcome');
assert.match(pages.privacy, /Basic usage analytics/i,
  'privacy policy should explain analytics in user language');
assert.match(pages.privacy, /private deletion key/i,
  'privacy policy should explain share deletion access without token/hash implementation language');
assert.match(pages.privacy, /Write Urdu form service/i,
  'privacy policy should describe form handling by user-visible purpose rather than function architecture');

for (const [name, html] of Object.entries(pages)) {
  assert.match(html, /<link rel="canonical" href="https:\/\/write-urdu\.com\//,
    `${name} must retain an explicit canonical URL`);
}

const homepage = read('index.html');
assert.match(homepage, /<title>English to Urdu Typing Online \| WriteUrdu<\/title>/,
  'Slice A must not change the homepage search title');
assert.match(homepage, /<h1[^>]*>English to Urdu Typing Online<\/h1>/,
  'Slice A must not change the homepage H1');

console.log('Public-language leakage contract checks passed.');
