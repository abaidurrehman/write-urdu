const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const core = require('../js/card-studio-core.js');

// WU-UXR-002 Slice A (CARD-UX-003): numbers and Latin words inside Urdu text are drawn in typed order.
// Canvas lines are drawn RTL; without isolation, digits after Urdu letters become Arabic numbers (bidi
// rule W2) and "0300-1234567" renders as "1234567-0300".
const LRI = '\u2066';
const PDI = '\u2069';
const isolate = core.isolateBidiRuns;

assert.equal(typeof isolate, 'function', 'card-studio-core must export isolateBidiRuns');

// Phone numbers and dates keep their separators inside one isolate.
assert.ok(isolate('رابطہ: 0300-1234567').includes(LRI + '0300-1234567' + PDI), 'a phone number after Urdu text must be one LTR isolate');
assert.ok(isolate('تاریخ 12/10/2026 کو').includes(LRI + '12/10/2026' + PDI), 'a date must be one LTR isolate');
assert.ok(isolate('رابطہ: ۰۳۰۰-۱۲۳۴۵۶۷').includes(LRI + '۰۳۰۰-۱۲۳۴۵۶۷' + PDI), 'Urdu digits must be isolated too');

// Latin phrases keep trailing punctuation with the phrase.
assert.ok(isolate('جمعہ مبارک Happy Friday!').includes(LRI + 'Happy Friday!' + PDI), 'the isolate must include trailing "!"');
assert.ok(isolate('ملیے write-urdu.com پر').includes(LRI + 'write-urdu.com' + PDI), 'a domain must stay in one isolate');
// Digits inside a Latin phrase belong to that phrase's isolate, not a nested one.
const room = isolate('کمرہ Room 12 میں');
assert.ok(room.includes(LRI + 'Room 12' + PDI), 'digits after a Latin word stay in the Latin isolate');
assert.equal(room.split(LRI).length - 1, 1, 'no nested isolates');

// Spaces between runs and Urdu stay outside the isolate so word wrapping is unchanged.
assert.equal(isolate('فون 0300 1234567 پر'), 'فون ' + LRI + '0300 1234567' + PDI + ' پر');
assert.equal(isolate('رابطہ: 0300-1234567').replace(/[\u2066\u2069]/g, ''), 'رابطہ: 0300-1234567', 'only isolate marks are added');

// Pure Urdu and pure Latin are returned unchanged, so existing renders stay identical.
for (const value of ['ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے', 'Happy Friday! Call 0300-1234567', '', 'صبح بخیر\nاللہ آپ کو خوش رکھے']) {
  assert.equal(isolate(value), value, 'unchanged: ' + JSON.stringify(value));
}
assert.equal(isolate(null), '');
assert.equal(isolate(undefined), '');

// Idempotent: isolating twice adds nothing.
for (const value of ['رابطہ: 0300-1234567', 'جمعہ مبارک Happy Friday!', 'کمرہ Room 12 میں ۵ بجے']) {
  assert.equal(isolate(isolate(value)), isolate(value), 'idempotent: ' + value);
}

// Wrapping measures the text as drawn but keeps the typed text in the layout.
const measured = [];
const ctx = { measureText(value) { measured.push(value); return { width: Array.from(String(value).replace(/[\u2066\u2069]/g, '')).length * 20 }; } };
const lines = core.wrapRtlText(ctx, 'رابطہ: 0300-1234567', 2000, {});
assert.equal(lines[0].text, 'رابطہ: 0300-1234567', 'layout lines hold the typed text, never the isolated text');
assert.ok(measured.some(value => value.includes(LRI)), 'mixed lines are measured with isolates, as drawn');

// Render-only: the drawing path isolates, project state does not.
const studio = read('js/card-studio.js');
assert.match(studio, /fillText\(core\.isolateBidiRuns\(line\.text\)/, 'drawTextObject must draw isolated lines');
const normalized = core.normalizeCardProject({ text: { value: 'رابطہ: 0300-1234567' } });
assert.equal(normalized.text.value, 'رابطہ: 0300-1234567', 'stored text is never isolated');
for (const file of ['js/card-studio-publish.js', 'js/card-studio-handoff-adapter.js', 'js/curated-card-share.js']) {
  assert.doesNotMatch(read(file), /isolateBidiRuns/, file + ' must not write isolated text into payloads');
}

console.log('card bidi render contract ok');
