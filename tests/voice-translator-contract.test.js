const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'tools/urdu-english-voice-translator.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js/urdu-english-voice-translator.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'css/voice-translator.css'), 'utf8');
const voiceCore = fs.readFileSync(path.join(root, 'js/voice-input-core.js'), 'utf8');
const core = require(path.join(root, 'js/voice-translator-core.js'));

assert.match(page, /<meta name="robots" content="noindex,follow">/, 'Voice translator preview must remain noindex until quality acceptance');
assert.match(page, /data-voice-translator/, 'Standalone voice translator root is missing');
assert.match(page, /value="ur-en"/, 'Urdu→English direction is missing');
assert.match(page, /value="en-ur"/, 'English→Urdu direction is missing');
assert.match(page, /\/js\/voice-input-core\.js/, 'Preview must reuse the shared Voice core');
assert.match(page, /\/js\/voice-translator-core\.js/, 'Preview must load its bounded pure core');
assert.match(page, /\/js\/urdu-english-voice-translator\.js/, 'Preview client script is missing');
assert.match(page, /data-voice-translate-source/, 'Editable source transcript is missing');
assert.match(page, /data-voice-translate-result/, 'Editable translation result is missing');
assert.doesNotMatch(page, /data-voice-translate-source[^>]*readonly/, 'Source transcript must remain editable');
assert.doesNotMatch(page, /data-voice-translate-result[^>]*readonly/, 'Translation result must remain editable');
assert.doesNotMatch(page, /batch-transliteration/, 'Voice translator must not become another Roman Urdu surface');
assert.doesNotMatch(page, /Continue editing in WriteUrdu/, 'Editor handoff is intentionally out of scope for this preview');

assert.equal(core.getDirection('ur-en').recognitionLang, 'ur-PK');
assert.equal(core.getDirection('en-ur').recognitionLang, 'en-US');
assert.equal(core.getDirection('ur-en').sourceDir, 'rtl');
assert.equal(core.getDirection('en-ur').sourceDir, 'ltr');
assert.equal(core.appendTranscript('السلام علیکم', 'آپ کیسے ہیں'), 'السلام علیکم آپ کیسے ہیں');
assert.equal(core.appendTranscript('', 'Hello there'), 'Hello there');
assert.equal(core.validateSource('   ').error, 'empty_text');
assert.equal(core.validateSource('x'.repeat(core.MAX_TEXT_CHARS + 1)).error, 'text_too_long');

const urEn = core.buildTranslationRequest('ur-en', 'مجھے کل لاہور جانا ہے');
assert.equal(urEn.ok, true);
assert.deepEqual(Object.keys(urEn.body).sort(), ['from', 'text', 'to', 'version']);
assert.deepEqual(urEn.body, {
  version: 1,
  from: 'ur',
  to: 'en',
  text: 'مجھے کل لاہور جانا ہے'
});
const enUr = core.buildTranslationRequest('en-ur', 'Please call me tomorrow.');
assert.equal(enUr.ok, true);
assert.equal(enUr.body.from, 'en');
assert.equal(enUr.body.to, 'ur');

assert.match(client, /fetch\('\/api\/language-translate'/, 'Client must use the shared WU-INPUT-001B endpoint');
assert.match(client, /lang:\s*config\.recognitionLang/, 'Recognition locale must come from the selected direction');
assert.match(client, /translateButton\.addEventListener\('click',\s*translateSource\)/, 'Translation must require an explicit button action');
assert.doesNotMatch(client, /providerAlias|modelAlias|microsoft|cloudflare/i, 'Client must not select or expose translation providers/models');
assert.match(client, /controller\.destroy\(\)/, 'Direction changes must recreate the recognition controller');
assert.match(client, /source\.value = ''[\s\S]*result\.value = ''/, 'Direction change/clear must prevent mislabeled carry-over');
assert.doesNotMatch(client, /console\.(log|info|warn|error)/, 'Voice translator must not log user transcript/translation content');
assert.match(styles, /\.urdu-tool-textarea\[dir="ltr"\]\s*\{[\s\S]*?direction:\s*ltr;[\s\S]*?text-align:\s*left;/, 'English textareas must render LTR and left-aligned');
assert.match(styles, /\.urdu-tool-textarea\[dir="rtl"\]\s*\{[\s\S]*?direction:\s*rtl;[\s\S]*?text-align:\s*right;/, 'Urdu textareas must render RTL and right-aligned');

assert.match(voiceCore, /options\.lang \|\| 'ur-PK'/, 'Shared Voice core must remain configurable by language');
assert.match(core.friendlyTranslationError('translation_service_not_enabled'), /not enabled/i);
assert.match(core.friendlyVoiceError('permission-denied'), /Microphone access was blocked/i);

console.log('WU-INPUT-001C voice translator contract passed.');
