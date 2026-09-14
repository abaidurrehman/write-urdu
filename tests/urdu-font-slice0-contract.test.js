const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));

const candidates = json('fixtures/urdu-fonts/slice0-font-candidates.json');
const shaping = json('fixtures/urdu-fonts/shaping-fixtures.json');
const designTokens = read('css/design-tokens.css');
const cardStudio = read('urdu-card-studio.html');
const nameArt = read('urdu-name-art-maker.html');
const editor = read('urdu-editor.html');
const editorFeatures = read('urdu-editor-features.html');
const cardStudioJs = read('js/card-studio.js');
const cardStudioCore = read('js/card-studio-core.js');
const documentShare = read('js/document-share.mjs');

const allowedStatuses = new Set(candidates.licenseStatuses);
const ids = new Set();
for (const record of candidates.candidates) {
  assert.match(record.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `stable font id required: ${record.id}`);
  assert.ok(!ids.has(record.id), `duplicate font id: ${record.id}`);
  ids.add(record.id);
  assert.ok(record.family && record.style && record.delivery, `${record.id} missing required metadata`);
  assert.ok(allowedStatuses.has(record.licenseStatus), `${record.id} has unsupported license state`);
  assert.ok(Array.isArray(record.capabilities), `${record.id} capabilities must be an array`);
  if (record.licenseStatus === 'approved-web') {
    assert.ok(record.authoritativeSource, `${record.id} approved-web needs authoritative source`);
    assert.ok(record.licenseFamily, `${record.id} approved-web needs license family`);
  }
  if (record.licenseStatus === 'license-review') {
    assert.doesNotMatch(record.delivery, /^bundled-webfont$/, `${record.id} cannot be bundled while license-review`);
  }
}

assert.ok(shaping.fixtures.length >= 9, 'canonical shaping corpus must cover all required classes');
for (const fixture of shaping.fixtures) {
  assert.ok(fixture.id && fixture.label && fixture.text, 'shaping fixture must be complete');
  assert.match(fixture.text, /[\u0600-\u06FF]/, `${fixture.id} must contain real Arabic/Urdu script`);
}

assert.match(designTokens, /--wu-font-urdu:\s*"Noto Nastaliq Urdu",\s*"Noto Naskh Arabic",\s*serif/, 'global Urdu fallback stack changed unexpectedly');

const sixCreationFonts = [
  'Noto Nastaliq Urdu',
  'Noto Naskh Arabic',
  'Amiri',
  'Lateef',
  'Scheherazade New',
  'Tajawal'
];
for (const family of sixCreationFonts) {
  assert.match(cardStudio, new RegExp(`<option>${family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</option>`), `Card Studio missing ${family}`);
  assert.match(nameArt, new RegExp(`<option>${family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</option>`), `Name Art missing ${family}`);
}

assert.match(cardStudio, /fonts\.googleapis\.com\/css2\?family=Amiri[^"']+Noto\+Nastaliq\+Urdu[^"']+Scheherazade\+New[^"']+Tajawal/, 'Card Studio Google Fonts bundle changed');
assert.match(editor, /font_formats:\s*"Noto Nastaliq Urdu;Noto Naskh Arabic;Amiri;Harmattan;Katibeh;Lateef;Scheherazade;Tajawal;/, 'Rich Editor active Urdu font list changed');
assert.doesNotMatch(editor.match(/tinymce\.init\(\{[\s\S]*?setup:/)?.[0] || '', /Qadreeregular/, 'Qadreeregular must not be treated as active runtime font');
assert.match(editorFeatures, /Qadreeregular/, 'documented Qadreeregular inconsistency should remain visible until reconciled in Slice 1B');

assert.match(cardStudioJs, /document\.fonts\.load\(/, 'Card Studio must explicitly load selected fonts');
assert.match(cardStudioJs, /ensureProjectFonts\(\)\.then\(function \(\) \{ return drawCard\(\{ export: true \}\); \}\)/, 'Card Studio export must await project fonts before draw');
assert.match(cardStudioCore, /ctx\.font = size \+ 'px \\"' \+ \(text\.fontFamily \|\| 'Noto Nastaliq Urdu'\) \+ '\\"'/, 'Card Studio core font assignment changed');
assert.match(documentShare, /ctx\.font = `600 \$\{fontSize\}px \\"Noto Nastaliq Urdu\\", \\"Noto Naskh Arabic\\", serif`/, 'document share preview Urdu stack changed');

const googleFontLinks = html => [...html.matchAll(/https:\/\/fonts\.googleapis\.com\/[^"']+/g)].map(match => match[0]);
const baseline = {
  cardStudioSourceBytes: Buffer.byteLength(cardStudio),
  cardStudioGoogleFontStylesheets: googleFontLinks(cardStudio).length,
  nameArtSourceBytes: Buffer.byteLength(nameArt),
  nameArtGoogleFontStylesheets: googleFontLinks(nameArt).length,
  richEditorSourceBytes: Buffer.byteLength(editor),
  richEditorGoogleFontReferences: googleFontLinks(editor).length
};

console.log('WU-FONT-001 Slice 0 baseline:', JSON.stringify(baseline));
console.log('WU-FONT-001 Slice 0 contract passed: inventory, licensing schema, shaping fixtures and current font-loading invariants are explicit.');
