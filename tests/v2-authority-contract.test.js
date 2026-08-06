const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const authorityCss = read('css/v2-authority.css');
const roman = read('roman-urdu-transliteration.html');
const alphabet = read('urdu-alphabet.html');
const workflow = read('.github/workflows/quality.yml');

assert.match(authorityCss, /body\.v2-content-page\.authority-page/, 'authority system must extend the shared v2 content contract');
assert.match(authorityCss, /prefers-reduced-motion/, 'authority pages must respect reduced-motion preferences');
assert.match(authorityCss, /:focus-visible/, 'authority pages must preserve visible keyboard focus');
assert.doesNotMatch(
  authorityCss,
  /font-weight\s*:\s*(?:[1-3]00|5[1-9]0|6[1-9]0|[89]00|[1-9][0-9]{2,})\b/,
  'authority system uses a disallowed font weight'
);

assert.match(roman, /class="content-page guide-page v2-content-page authority-page roman-urdu-page"/, 'Roman Urdu guide must use the v2 authority page contract');
assert.match(roman, /css\/v2-content\.css/, 'Roman Urdu guide must load the shared v2 content system');
assert.match(roman, /css\/v2-authority\.css/, 'Roman Urdu guide must load the v2 authority system');
assert.match(roman, /https:\/\/write-urdu\.com\/roman-urdu-transliteration/, 'Roman Urdu canonical changed unexpectedly');
assert.match(roman, /id="transliteration-title"/, 'Roman Urdu H1 contract changed');
assert.match(roman, /Transliteration is not translation/, 'Roman Urdu guide must keep the central language distinction');
assert.match(roman, /href="\/"[^>]*>Try Roman Urdu typing/, 'Roman Urdu guide must support the homepage writing workflow');
assert.doesNotMatch(roman, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Roman Urdu guide must use extensionless internal links');

assert.match(alphabet, /class="content-page guide-page v2-content-page authority-page alphabet-page"/, 'Urdu Alphabet must use the v2 authority page contract');
assert.match(alphabet, /css\/v2-content\.css/, 'Urdu Alphabet must load the shared v2 content system');
assert.match(alphabet, /css\/v2-authority\.css/, 'Urdu Alphabet must load the v2 authority system');
assert.match(alphabet, /https:\/\/write-urdu\.com\/urdu-alphabet/, 'Urdu Alphabet canonical changed unexpectedly');
assert.match(alphabet, /id="alphabet-title"/, 'Urdu Alphabet H1 contract changed');
assert.ok((alphabet.match(/<tr><td lang="ur" dir="rtl">/g) || []).length >= 40, 'Urdu Alphabet must retain the complete standalone character chart');
assert.match(alphabet, />آ<\/td>/, 'Urdu Alphabet must retain alif madd');
assert.match(alphabet, />ے<\/td>/, 'Urdu Alphabet must retain baree ye');
assert.doesNotMatch(alphabet, /UA-80884320-1|google-analytics\.com\/analytics\.js/, 'Urdu Alphabet must not retain obsolete Universal Analytics');
assert.doesNotMatch(alphabet, /bootstrap|jquery|w3schools|font-awesome|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i, 'Urdu Alphabet must not retain obsolete framework dependencies');
assert.doesNotMatch(alphabet, /<meta name="Keywords"/i, 'Urdu Alphabet must not retain the legacy keywords meta tag');
assert.doesNotMatch(alphabet, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Urdu Alphabet must use extensionless internal links');

assert.match(workflow, /- 'agent\/\*\*'/, 'quality workflow must run for agent branches');
assert.match(workflow, /workflow_dispatch:/, 'quality workflow must support manual recovery runs');
assert.match(workflow, /ready_for_review/, 'quality workflow must run when a draft PR becomes ready');

console.log('WriteUrdu v2 S3 authority guide contract checks passed.');
