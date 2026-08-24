const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'tools/english-to-urdu-document-translator.html'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions/api/document-translate.js'), 'utf8');
const client = require(path.join(root, 'js/document-translator.js'));

assert.match(page, /<meta name="robots" content="noindex,follow">/, 'Preview must stay out of search until quality is proven');
assert.match(page, /accept="\.txt,text\/plain"/, 'Quick win must accept TXT files');
assert.match(page, /data-document-result/, 'Editable Urdu result is missing');
assert.doesNotMatch(page, /data-document-result[^>]*readonly/, 'Urdu result must remain editable');
assert.match(page, /Continue editing in WriteUrdu/, 'Continuation action is missing');

assert.match(api, /@cf\/ai4bharat\/indictrans2-en-indic-1B/, 'Cloudflare IndicTrans2 model must remain explicit');
assert.match(api, /target_language:\s*TARGET_LANGUAGE/, 'Current Workers AI translation schema must use target_language');
assert.match(api, /urd_Arab/, 'Urdu Arabic-script target is missing');
assert.match(api, /if \(!env\.AI \|\| typeof env\.AI\.run !== 'function'\)/, 'Missing AI binding must fail safely');
assert.match(api, /MAX_TEXT_CHARS = 12000/, 'Bounded text limit is missing');
assert.doesNotMatch(api, /console\.(log|info|warn|error)/, 'Translation endpoint must not log user text or request bodies');

assert.equal(client.validateSource('Hello world').ok, true);
assert.equal(client.validateSource('   ').error, 'empty_text');
assert.equal(client.validateSource('x'.repeat(client.MAX_SOURCE_CHARS + 1)).error, 'text_too_long');
assert.equal(client.isTextFile({ name: 'letter.txt', type: '' }), true);
assert.equal(client.isTextFile({ name: 'letter.pdf', type: 'application/pdf' }), false);
assert.match(client.friendlyError('translation_service_not_configured'), /not enabled/i);

console.log('Document translator quick-win contract passed.');
