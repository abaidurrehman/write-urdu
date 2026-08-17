const assert = require('assert');
const core = require('../js/urdu-text-cleaner-core.js');

const dirty = 'يہ  اردو كا\u00a0متن ، ہے\ufeff';
const report = core.analyze(dirty);
assert.ok(report.issueCount >= 5, 'dirty fixture should expose multiple independent issues');
assert.ok(report.issues.some(issue => issue.id === 'arabic-yeh' && issue.safety === 'safe'));
assert.ok(report.issues.some(issue => issue.id === 'arabic-kaf' && issue.safety === 'safe'));
assert.ok(report.issues.some(issue => issue.id === 'duplicate-spaces' && issue.safety === 'safe'));
assert.ok(report.issues.some(issue => issue.id === 'nbsp' && issue.safety === 'safe'));

const cleaned = core.applySafeFixes(dirty);
assert.strictEqual(cleaned, 'یہ اردو کا متن، ہے', 'safe fixes should normalize common Urdu characters and spacing');
assert.strictEqual(dirty, 'يہ  اردو كا\u00a0متن ، ہے\ufeff', 'core transforms must not mutate source strings');

const paragraphs = 'پہلی  سطر\n\nدوسری  سطر';
assert.strictEqual(core.applySafeFixes(paragraphs), 'پہلی سطر\n\nدوسری سطر', 'safe spacing fixes must preserve line breaks');

const tatweel = 'ســلام';
const tatweelReport = core.analyze(tatweel);
assert.ok(tatweelReport.issues.some(issue => issue.id === 'tatweel' && issue.safety === 'review'), 'kashida must be review-only');
assert.strictEqual(core.applySafeFixes(tatweel), tatweel, 'Fix Safe Issues must not remove kashida');
assert.strictEqual(core.applyRule(tatweel, 'tatweel'), 'سلام', 'explicit kashida action should remove tatweel');

const controls = 'سلام\u200f\u200f دنیا\u200c';
const controlsCleaned = core.applySafeFixes(controls);
assert.strictEqual((controlsCleaned.match(/\u200f/g) || []).length, 1, 'duplicate bidi controls should collapse conservatively');
assert.ok(controlsCleaned.includes('\u200c'), 'single join controls must not be blindly removed');
const controlsReport = core.analyze(controlsCleaned);
assert.ok(controlsReport.issues.some(issue => issue.id === 'bidi-controls' && issue.safety === 'review'));
assert.ok(controlsReport.issues.some(issue => issue.id === 'suspicious-join-controls' && issue.safety === 'review'));

const duplicatedJoin = 'ا\u200c\u200cب';
assert.strictEqual(core.applySafeFixes(duplicatedJoin), 'ا\u200cب', 'only redundant repeated join controls should collapse');

assert.strictEqual(core.convertNumerals('2026 / ۱۲۳ / ٤٥', 'western'), '2026 / 123 / 45');
assert.strictEqual(core.convertNumerals('2026', 'eastern-arabic'), '۲۰۲۶');
assert.strictEqual(core.convertNumerals('2026', 'arabic-indic'), '٢٠٢٦');
assert.deepStrictEqual(core.digitStylesPresent('1 ۲ ٣').sort(), ['arabic-indic', 'eastern-arabic', 'western'].sort());

const mixed = core.analyze('رقم: 2500 / روپے?');
assert.ok(mixed.issues.some(issue => issue.id === 'mixed-direction-sequence'), 'mixed Urdu/number separators should be surfaced for review');
assert.ok(mixed.issues.some(issue => issue.id === 'latin-punctuation-near-urdu'), 'Latin punctuation beside Urdu should be surfaced, not rewritten');

assert.strictEqual(core.countUnmatchedBrackets('سلام (دنیا'), 1);
assert.strictEqual(core.countUnmatchedBrackets('سلام (دنیا)'), 0);
assert.strictEqual(core.issueCountBucket(0), '0');
assert.strictEqual(core.issueCountBucket(2), '1-2');
assert.strictEqual(core.issueCountBucket(5), '3-5');
assert.strictEqual(core.issueCountBucket(10), '6-10');
assert.strictEqual(core.issueCountBucket(11), '11+');

console.log('Urdu text cleaner core tests passed.');
