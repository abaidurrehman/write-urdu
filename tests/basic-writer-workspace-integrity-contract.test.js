const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const monetization = read('js/write-monetization.js');
assert.match(monetization, /if \(path === '\/'\) return document\.querySelector\('#demo ~ \.editor-productivity'\) \|\| document\.getElementById\('demo'\);/, 'The Basic Writer ad boundary must include the editor tools panel when it exists');

const editorTools = read('js/editor-tools.js');
assert.match(editorTools, /function keepAdAfterPanel\(mount, panel\)/, 'Editor tools must extend an existing post-workspace ad boundary to their panel');
assert.match(editorTools, /adapter\.mount\.insertAdjacentElement\('afterend', panel\);\s*keepAdAfterPanel\(adapter\.mount, panel\);/, 'The ad boundary must move as soon as the tools panel mounts');

const batch = read('js/batch-transliteration.js');
assert.match(batch, /if \(prompt\) prompt\.hidden = true;\s*action\.hidden = true;/, 'A successful passage conversion must retire its prompt and button');
assert.doesNotMatch(batch, /if \(status && !status\.textContent\) status\.textContent = text\('done'\);/, 'Passage success must not be announced a second time from the finally step');

console.log('Basic Writer workspace integrity contract passed.');
