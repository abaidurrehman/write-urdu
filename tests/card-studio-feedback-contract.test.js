const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const core = require('../js/card-studio-core.js');

// WU-UXR-002 Slice B: truthful feedback and copy (CARD-UX-004, 015, 021, 022, 030, 031).
const studio = read('js/card-studio.js');
const ui = read('js/card-studio-ui.js');
const publish = read('js/card-studio-publish.js');
const page = read('urdu-card-studio.html');
const urduPage = read('urdu/urdu-card-studio.html');
const locale = read('locale/ur.js');

// CARD-UX-004: "Use sample text" inserts a real, exportable greeting, never the empty placeholder.
assert.ok(core.SAMPLE_TEXTS && typeof core.SAMPLE_TEXTS.default === 'string', 'core must export SAMPLE_TEXTS.default');
for (const [key, value] of Object.entries(core.SAMPLE_TEXTS)) {
  assert.ok(value.trim().length > 10, 'sample ' + key + ' must be real text');
  assert.notEqual(value, core.DEFAULT_TEXT, 'sample ' + key + ' must not be the empty placeholder');
}
for (const useCase of ['quote', 'social', 'story', 'announcement']) assert.ok(core.SAMPLE_TEXTS[useCase], 'a sample for ' + useCase);
assert.doesNotMatch(ui, /updateObjectText\('text', core\.DEFAULT_TEXT\)/, 'sample action must not insert DEFAULT_TEXT');
assert.match(ui, /SAMPLE_TEXTS/, 'sample action uses SAMPLE_TEXTS');

// CARD-UX-004: autosave has its own quiet indicator and never writes to the status line.
assert.match(page, /data-card-save-indicator/, 'Card Studio has a save indicator');
const saveFunctions = studio.slice(studio.indexOf('function saveProject'), studio.indexOf('function applyLocale'));
assert.doesNotMatch(saveFunctions, /setStatus\(t\('saved'\)\)|setStatus\(t\('saving'\)\)/, 'autosave must not overwrite [data-card-status]');
assert.match(studio, /dataset\.sticky/, 'errors are sticky');

// CARD-UX-021: the button says what it does.
assert.match(studio, /removeImage:'Remove image'/, 'English removeImage label');
assert.match(studio, /removeImage:'تصویر ہٹائیں'/, 'Urdu removeImage label');

// CARD-UX-015: no absolute "not uploaded" claim and no promise of posting straight to Instagram.
for (const [name, source] of [['card-studio.js', studio], ['urdu-card-studio.html', page], ['urdu/urdu-card-studio.html', urduPage]]) {
  assert.doesNotMatch(source, /stay in this browser and are not uploaded/, name + ': no unconditional not-uploaded claim');
  assert.doesNotMatch(source, /straight to[^.]*Instagram/, name + ': no direct-to-Instagram claim');
  assert.doesNotMatch(source, /keeps your writing safe/, name + ': no "safe" claim for a public link');
}
assert.match(studio, /Nothing is uploaded unless you choose Publish & Share/, 'privacy copy names the exception');
assert.match(studio, /makes a public link/, 'export copy says the link is public');
assert.match(locale, /'urdu-card-studio\.exportPrivacy': '[^']*عوامی لنک/, 'Urdu locale export copy says the link is public');

// CARD-UX-031: plain publish errors with a download alternative.
assert.doesNotMatch(publish, /connected to this deployment/, 'no deployment jargon');
assert.match(publish, /Links can't be created right now/, 'plain error copy');
assert.match(publish, /data-wu-share-download/, 'the error dialog offers Download picture');

// CARD-UX-030: no "Untitled" or spaces in download names.
assert.match(studio, /'urdu-' \+ \(state\.useCase \|\| 'card'\)/, 'unnamed cards download as urdu-<use case>-<date>');

// CARD-UX-022: the convert button follows the text field on Card Studio and both makers.
const after = (source, label) => {
  const field = source.indexOf('id="cardText"');
  const panel = source.indexOf('data-batch-transliteration');
  assert.ok(field > 0 && panel > field, label + ': the batch panel must come after #cardText');
};
after(page, 'urdu-card-studio.html');
after(read('js/social-direct-workspace.js'), 'WhatsApp Status maker');
after(read('js/social-direct-instagram.js'), 'Instagram maker');
assert.match(studio, /data-input-mode-alert-state|inputModeAlertState/, 'Card Studio follows the input-mode outage alert');

console.log('card studio feedback contract ok');
