const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const { loadOutcomeNavigationRegistry, allStaticHrefs } = require('../scripts/static-shell-registry.js');
const { renderStaticNav, renderStaticFooter, applyStaticShell } = require('../scripts/static-shell.js');

const registry = loadOutcomeNavigationRegistry();
const hrefs = new Set(allStaticHrefs(registry));
const crawlCritical = [
  '/',
  '/urdu-editor',
  '/urdu-keyboard',
  '/tools/urdu-voice-typing',
  '/urdu-card-studio',
  '/urdu-templates',
  '/stylish-urdu-text-generator',
  '/urdu-name-art-maker',
  '/urdu-whatsapp-status-maker',
  '/urdu-instagram-post-maker',
  '/qr-code-generator',
  '/urdu-invoice-generator',
  '/urdu-text-cleaner',
  '/urdu-ocr',
  '/tools/inpage-unicode-converter',
  '/urdu-writing-templates',
  '/write-urdu-documentation',
  '/urdu-faq',
  '/roman-urdu-transliteration',
  '/urdu-alphabet',
  '/urdu-fonts-nastaliq-vs-naskh',
  '/how-to-write-urdu-on-photo',
  '/why-write-urdu',
  '/contact',
  '/write-urdu-privacy',
  '/write-urdu-sitemap'
];

for (const route of crawlCritical) {
  assert.ok(hrefs.has(route), `static shell registry is missing crawl-critical route ${route}`);
}

const runtime = fs.readFileSync(path.join(root, 'js', 'outcome-navigation.js'), 'utf8');
assert.match(runtime, /root\.WriteUrduOutcomeNavigation\s*=\s*\{/, 'runtime outcome navigation must remain the governed registry source');
assert.match(runtime, /groups:\s*GROUPS/, 'runtime must expose primary outcome groups for the static build bridge');
assert.match(runtime, /footerGroups:\s*FOOTER_GROUPS/, 'runtime must expose footer groups for the static build bridge');

const englishNav = renderStaticNav({ registry, locale: 'en' });
const englishFooter = renderStaticFooter({ registry, locale: 'en' });
assert.match(englishNav, /data-wu-static-shell="nav"/, 'static source nav marker is missing');
assert.match(englishNav, /href="\/tools\/urdu-voice-typing"/, 'static nav must expose voice typing without JavaScript');
assert.match(englishNav, /href="\/urdu-card-studio"/, 'static nav must expose Card Studio without JavaScript');
assert.match(englishNav, /href="\/write-urdu-documentation"/, 'static nav must expose documentation without JavaScript');
assert.match(englishFooter, /data-wu-static-shell="footer"/, 'static source footer marker is missing');
assert.match(englishFooter, /href="\/urdu-writing-templates"/, 'static footer must expose writing templates');
assert.match(englishFooter, /href="\/contact"/, 'static footer must expose Contact');
assert.match(englishFooter, /href="\/write-urdu-sitemap"/, 'static footer must expose the human sitemap');

const urduNav = renderStaticNav({ registry, locale: 'ur', hrefFor(href) { return href; } });
assert.match(urduNav, /لکھیں/, 'Urdu static nav must use governed Urdu group labels');
assert.match(urduNav, /اردو براہِ راست ٹائپ کریں/, 'Urdu static nav must use governed Urdu destination labels');

const representatives = [
  'index.html',
  'urdu-editor.html',
  'urdu-card-studio.html',
  'roman-urdu-transliteration.html',
  'why-write-urdu.html',
  'write-urdu-sitemap.html'
];
for (const file of representatives) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const generated = applyStaticShell(source, { registry, locale: 'en' });
  assert.match(generated, /data-wu-static-shell="nav"/, `${file} must be able to receive source-visible navigation`);
  assert.match(generated, /data-wu-static-shell="footer"/, `${file} must be able to receive a source-visible footer`);
  assert.match(generated, /href="\/tools\/urdu-voice-typing"/, `${file} generated source shell must expose voice typing`);
  assert.match(generated, /href="\/urdu-card-studio"/, `${file} generated source shell must expose Card Studio`);
  assert.match(generated, /href="\/write-urdu-sitemap"/, `${file} generated source shell must expose the sitemap`);
  assert.strictEqual(applyStaticShell(generated, { registry, locale: 'en' }), generated, `${file} static shell generation must be idempotent`);
}

const urduSource = fs.readFileSync(path.join(root, 'urdu', 'how-to-write-urdu-on-photo.html'), 'utf8');
const urduGenerated = applyStaticShell(urduSource, {
  registry,
  locale: 'ur',
  hrefFor(href) { return href; }
});
assert.match(urduGenerated, /data-wu-static-shell="nav"/, 'Urdu locale source must support the same source shell');
assert.match(urduGenerated, /مدد اور اعتماد/, 'Urdu locale footer must use an Urdu trust-group label');

console.log('Static source navigation/footer shell foundation contracts passed.');
