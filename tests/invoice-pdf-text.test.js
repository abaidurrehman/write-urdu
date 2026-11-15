const assert = require('assert');
const pdfText = require('../js/invoice-pdf-text.js');

// Typographic punctuation becomes plain ASCII so every PDF viewer copies it
// back the same way.
assert.equal(pdfText.toPdfText('Lawn fabric — 4 × 6,500'), 'Lawn fabric - 4 x 6,500');
assert.equal(pdfText.toPdfText('\u2066INV-2026-0001\u2069'), 'INV-2026-0001', 'Bidi isolates are removed');

// Urdu words are skipped; numbers and Latin words beside them are kept.
assert.deepEqual(pdfText.words('Lawn fabric — لان PKR 26,000').map((w) => w.text), ['Lawn', 'fabric', '-', 'PKR', '26,000']);
assert.equal(pdfText.words('احمد گارمنٹس').length, 0);
assert.deepEqual(pdfText.words('a  b').map((w) => [w.start, w.end]), [[0, 1], [3, 4]], 'Offsets point into the original text');

// Words on one line join into a single run; a wrapped line starts a new one.
const runs = pdfText.groupRuns([
  { text: 'Website', left: 10, right: 50, top: 100, height: 10 },
  { text: 'landing', left: 53, right: 90, top: 100.5, height: 10 },
  { text: 'page', left: 10, right: 32, top: 114, height: 10 }
]);
assert.deepEqual(runs.map((r) => r.text), ['Website landing', 'page']);
assert.equal(runs[0].width, 80);

// The text layer is written as invisible text, stretched to each run's width.
const calls = [];
const fakePdf = {
  setFont() {}, setFontSize(size) { this.size = size; },
  getTextWidth(text) { return text.length * 2; },
  text(text, x, y, options) { calls.push({ text, x, y, options }); }
};
pdfText.addTextLayer(fakePdf, [{ text: 'IBAN', x: 794 / 2, y: 0, width: 794 / 10, height: 12 }], 794, 210);
assert.equal(calls.length, 1);
assert.equal(calls[0].options.renderingMode, 'invisible', 'The text layer must never draw over the image');
assert.equal(calls[0].x, 105, 'Pixel positions map onto the A4 page in millimetres');
assert.ok(Math.abs(calls[0].options.horizontalScale - 21 / 8) < 1e-9, 'Runs are stretched to their on-image width');

console.log('Invoice PDF text layer tests passed.');
