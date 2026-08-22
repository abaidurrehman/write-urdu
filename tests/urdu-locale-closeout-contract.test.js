const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const home = read('urdu/index.html');
const keyboard = read('urdu/urdu-keyboard.html');
const editor = read('urdu/urdu-editor.html');
const locale = read('locale/ur.js');
const generator = read('scripts/generate-urdu-locale.js');
const telemetry = read('js/product-telemetry.js');
const acquisition = read('js/acquisition-telemetry.js');
const journeyRuntime = read('js/card-studio-entry.js');
const events = read('functions/api/events.js');
const acquisitionApi = read('functions/api/acquisition.js');
const migration = read('migrations/0008_locale_metrics.sql');

assert.match(home, /aria-label="ایڈیٹر کے اقدامات"/, 'Urdu home toolbar aria label must be localized in emitted HTML');
assert.match(home, />\s*متن کاپی کریں\s*</, 'Urdu home copy action must be localized in emitted HTML');
assert.match(home, /برآمد کریں<\/summary>/, 'Urdu home export action must be localized in emitted HTML');
assert.doesNotMatch(home, /aria-label="(?:Editor actions|Common actions|Get started|Editor highlights)"/, 'Urdu home must not emit English critical aria labels');

assert.match(keyboard, /aria-label="ایڈیٹر کے اقدامات"/, 'Urdu keyboard action group must be localized');
assert.match(keyboard, />\s*متن کاپی کریں\s*</, 'Urdu keyboard copy action must be localized');
assert.match(keyboard, /اردو کی بورڈ استعمال کرنے کا طریقہ/, 'Urdu keyboard help must be present in initial HTML');
assert.match(keyboard, /موبائل پر اردو کی بورڈ کیسے استعمال کریں/, 'Urdu keyboard mobile guidance must be localized');
assert.doesNotMatch(keyboard, />\s*(?:Copy text|Share|Clear|Save)\s*</, 'Urdu keyboard critical actions must not remain English-only');

assert.match(editor, /aria-label="لکھنے کا طریقہ"/, 'Urdu rich editor writing-mode aria label must be localized');
assert.match(editor, />\s*اردو کارڈ بنائیں\s*</, 'Urdu rich editor Card Studio handoff must be localized');
assert.match(editor, /اردو لکھنے کے دو طریقے/, 'Urdu rich editor batch guidance must be localized');
assert.match(editor, /رچ ٹیکسٹ ایڈیٹر میں اردو لکھیں اور فارمیٹ کریں/, 'Urdu rich editor help must be localized');
assert.doesNotMatch(editor, />\s*(?:Basic editor|Create Urdu Card|Create QR Code|Export|Share|Clear)\s*</, 'Urdu rich editor critical actions must not remain English-only');

assert.match(locale, /literalReplacements/, 'Reviewed literal replacements must live in the locale catalogue');
assert.match(generator, /applyLiteralReplacements/, 'Static locale generator must own emitted Urdu command localization');
assert.match(journeyRuntime, /function isUrduLocale\(\)/, 'Dynamic journey runtime must derive locale from the URL-owned locale helper');
assert.match(journeyRuntime, /اس اردو کو کارڈ بنا کر شیئر کریں/, 'Dynamic Card Studio journey action must have reviewed Urdu copy');
assert.match(journeyRuntime, /اس اردو سے تصویر بنائیں اور شیئر کریں/, 'Dynamic header share action must have an Urdu accessible label');
assert.match(journeyRuntime, /صرف متن شیئر کریں/, 'Dynamic text-only share action must have Urdu copy');
assert.match(telemetry, /locale:\s*locale/, 'Product telemetry must emit a bounded locale dimension');
assert.match(acquisition, /locale:\s*currentLocale\(\)/, 'Acquisition telemetry must emit a bounded locale dimension');
assert.match(events, /LOCALES = new Set\(\['en', 'ur'\]\)/, 'Product events API must bound locale to en/ur');
assert.match(acquisitionApi, /LOCALES = new Set\(\['en', 'ur'\]\)/, 'Acquisition API must bound locale to en/ur');
assert.match(migration, /PRIMARY KEY \(bucket_hour, locale, tool\)/, 'Locale product rollup must remain bounded');
assert.match(migration, /PRIMARY KEY \(bucket_hour, locale, acquisition_channel, page_type, route\)/, 'Locale acquisition rollup must remain bounded');
assert.doesNotMatch(migration.replace(/^\s*--.*$/gm, ''), /\b(editor_text|transcript|filename|email|ip_address|user_agent|referrer)\b/i, 'Locale rollups must not store content or identity fields');

console.log('Urdu locale Phase 1 closeout contracts passed.');
