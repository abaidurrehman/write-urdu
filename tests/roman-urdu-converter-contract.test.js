const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('roman-urdu-transliteration.html');
const runtime = read('js/roman-urdu-converter.js');
const registry = read('js/workspace-journey-registry.js');
const ads = require('../js/ads.js');

assert.match(page, /<h1 id="transliteration-title">Roman Urdu to Urdu Converter<\/h1>/, 'Roman page must explicitly own Roman Urdu conversion');
assert.match(page, /data-roman-urdu-converter/, 'Roman page must expose an in-page conversion task');
assert.ok(page.indexOf('data-roman-urdu-converter') < page.indexOf('id="what-it-does"'), 'Converter must appear before long-form guidance');
assert.ok(page.indexOf('js/batch-transliteration.js') < page.indexOf('js/roman-urdu-converter.js'), 'Shared transliteration engine must load before Roman task runtime');
assert.match(runtime, /WriteUrduBatchTransliteration/, 'Roman task must reuse the shared production transliteration engine');
assert.doesNotMatch(runtime, /inputtools\.google\.com|google\.elements\.transliteration/, 'Roman task must not duplicate a provider implementation');
assert.match(runtime, /navigator\.clipboard/, 'Roman output must support Copy');
assert.match(runtime, /sourceWorkspace:\s*'roman-converter'/, 'Continue Editing must identify the Roman task workspace');
assert.match(runtime, /targetWorkspace:\s*'basic-writer'/, 'Continue Editing must use the existing Basic Writer handoff');
assert.doesNotMatch(runtime, /[?&#](?:text|content|payload)=/, 'Roman text must not be placed in a URL');
assert.match(registry, /id:\s*'roman-converter'/, 'Workspace registry must own the Roman task');
assert.match(registry, /id:\s*'roman-to-basic'/, 'Roman task must expose one approved Basic Writer handoff');
assert.strictEqual(ads.resolvePageType('/roman-urdu-transliteration'), 'write', 'Roman task must receive write-surface ad protection');
assert.match(page, /kheriyat se hain[\s\S]*خیریت سے ہیں/, 'Published spelling-variant example must match the production provider');
assert.match(page, /does not translate an English sentence into Urdu/i, 'Roman task must retain the transliteration versus translation distinction');

console.log('Roman Urdu converter contract passed.');
