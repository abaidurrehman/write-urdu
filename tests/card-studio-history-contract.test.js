const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// WU-UXR-002 Slice G (CARD-UX-018, 019, 020): safe editing.
const studio = read('js/card-studio.js');
const interaction = read('js/card-studio-interaction.js');
const library = read('js/card-studio-background-library.js');
const core = read('js/card-studio-core.js');
const page = read('urdu-card-studio.html');

// Undo for every edit: panel fields, one batch per designer background, pending typing flushed before Undo.
assert.match(studio, /function noteFieldEdit\(/, 'panel fields record history');
assert.match(studio, /historyTimer = window\.setTimeout\(flushHistory, typing \? 1000 : 600\)/, 'typing is grouped, not one step per key');
assert.match(library, /beginHistoryBatch\(\)/, 'a designer background apply opens one batch');
assert.match(library, /endHistoryBatch\(\)/, 'a failed apply never leaves the batch open');
assert.match(interaction, /function undo\(\) \{ flushPending\(\);/, 'Undo commits pending typing first');
assert.match(interaction, /history\.length > 50\) history\.shift\(\)/, 'history stays capped at 50');

// Reset is undoable and no longer asks with confirm().
const resetStart = studio.indexOf("querySelector('[data-card-action=\"reset\"]')");
const reset = studio.slice(resetStart, studio.indexOf("getElementById('cardPreset')", resetStart));
assert.doesNotMatch(reset, /window\.confirm/, 'Reset does not use confirm()');
assert.match(reset, /commitHistory\(before\)/, 'Reset is one undo step');
assert.match(reset, /data-card-reset-undo/, 'Reset offers Undo in the status line');

// Each upload keeps its own stored image, so undo can bring an earlier photo back.
assert.doesNotMatch(studio, /imageAssetId = state\.id \+ '_image';/, 'uploads no longer overwrite one shared image');
assert.match(studio, /function syncAssetToState\(/, 'undo restores the photo the state refers to');

// Templates keep the person's photo.
assert.match(core, /function hasUserPhoto\(/);
assert.match(core, /function keepUserPhoto\(/);
assert.match(studio, /data-card-template-background/, 'a kept photo offers the template background');

// Readable text on upload, and one Text readability slider outside Advanced.
assert.match(studio, /function makePhotoTextReadable\(/);
assert.match(studio, /contrastRatio\(textRgb, behind\) >= 4\.5/, 'the overlay is raised until text reaches 4.5:1');
const overlayBlock = page.slice(page.indexOf('id="cardOverlay"') - 400, page.indexOf('id="cardOverlay"'));
assert.doesNotMatch(overlayBlock.slice(overlayBlock.lastIndexOf('<div')), /data-card-advanced/, 'the readability slider is not Advanced-only');

// Both languages.
for (const key of ["resetDone:'Card reset.'", "templatePhotoKept:'Text style applied. Your photo was kept.'", "overlayLabel:'Text readability'", "resetDone:'کارڈ نئے سرے سے شروع ہو گیا۔'", "overlayLabel:'متن پڑھنے میں آسانی'"]) {
  assert.ok(studio.includes(key), 'copy: ' + key);
}

console.log('card studio history contract ok');
