const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const authorityCss = read('css/v2-authority.css');
const roman = read('roman-urdu-transliteration.html');
const alphabet = read('urdu-alphabet.html');
const fonts = read('urdu-fonts-nastaliq-vs-naskh.html');
const tutorial = read('english-urdu-typing-tutorial.html');
const workflow = read('.github/workflows/quality.yml');

assert.match(authorityCss, /body\.v2-content-page\.authority-page/, 'authority system must extend the shared v2 content contract');
assert.match(authorityCss, /prefers-reduced-motion/, 'authority pages must respect reduced-motion preferences');
assert.match(authorityCss, /:focus-visible/, 'authority pages must preserve visible keyboard focus');
const authorityWeights = [...authorityCss.matchAll(/font-weight\s*:\s*(\d{3})\b/g)].map(match => Number(match[1]));
const disallowedAuthorityWeights = [...new Set(authorityWeights.filter(weight => ![400, 500, 600, 700].includes(weight)))];
assert.deepStrictEqual(
  disallowedAuthorityWeights,
  [],
  `authority system uses disallowed font weights: ${disallowedAuthorityWeights.join(', ')}`
);

assert.match(roman, /class="content-page guide-page v2-content-page authority-page roman-urdu-page"/, 'Roman Urdu guide must use the v2 authority page contract');
assert.match(roman, /css\/v2-content\.css/, 'Roman Urdu guide must load the shared v2 content system');
assert.match(roman, /css\/v2-authority\.css/, 'Roman Urdu guide must load the v2 authority system');
assert.match(roman, /https:\/\/www\.write-urdu\.com\/roman-urdu-transliteration/, 'Roman Urdu canonical changed unexpectedly');
assert.match(roman, /id="transliteration-title"/, 'Roman Urdu H1 contract changed');
assert.match(roman, /Transliteration is not translation/, 'Roman Urdu guide must keep the central language distinction');
assert.match(roman, /href="\/"[^>]*>Try Roman Urdu typing/, 'Roman Urdu guide must support the homepage writing workflow');
assert.doesNotMatch(roman, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Roman Urdu guide must use extensionless internal links');

assert.match(alphabet, /class="content-page guide-page v2-content-page authority-page alphabet-page"/, 'Urdu Alphabet must use the v2 authority page contract');
assert.match(alphabet, /css\/v2-content\.css/, 'Urdu Alphabet must load the shared v2 content system');
assert.match(alphabet, /css\/v2-authority\.css/, 'Urdu Alphabet must load the v2 authority system');
assert.match(alphabet, /https:\/\/www\.write-urdu\.com\/urdu-alphabet/, 'Urdu Alphabet canonical changed unexpectedly');
assert.match(alphabet, /id="alphabet-title"/, 'Urdu Alphabet H1 contract changed');
assert.ok((alphabet.match(/<tr><td lang="ur" dir="rtl">/g) || []).length >= 40, 'Urdu Alphabet must retain the complete standalone character chart');
assert.match(alphabet, />آ<\/td>/, 'Urdu Alphabet must retain alif madd');
assert.match(alphabet, />ے<\/td>/, 'Urdu Alphabet must retain baree ye');
assert.doesNotMatch(alphabet, /UA-80884320-1|google-analytics\.com\/analytics\.js/, 'Urdu Alphabet must not retain obsolete Universal Analytics');
assert.doesNotMatch(alphabet, /bootstrap|jquery|w3schools|font-awesome|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i, 'Urdu Alphabet must not retain obsolete framework dependencies');
assert.doesNotMatch(alphabet, /<meta name="Keywords"/i, 'Urdu Alphabet must not retain the legacy keywords meta tag');
assert.doesNotMatch(alphabet, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Urdu Alphabet must use extensionless internal links');

assert.match(fonts, /class="content-page guide-page v2-content-page authority-page font-guide-page"/, 'Urdu font guide must use the v2 authority page contract');
assert.match(fonts, /css\/v2-content\.css/, 'Urdu font guide must load the shared v2 content system');
assert.match(fonts, /css\/v2-authority\.css/, 'Urdu font guide must load the v2 authority system');
assert.match(fonts, /https:\/\/www\.write-urdu\.com\/urdu-fonts-nastaliq-vs-naskh/, 'Urdu font guide canonical changed unexpectedly');
assert.match(fonts, /id="font-guide-title"/, 'Urdu font guide H1 contract changed');
assert.match(fonts, /Nastaliq: traditional Urdu character/, 'Urdu font guide must retain practical Nastaliq guidance');
assert.match(fonts, /Naskh: compact and predictable/, 'Urdu font guide must retain practical Naskh guidance');
assert.match(fonts, /data-wu-ad-boundary="after-answer"/, 'Learn-page ad placement needs an explicit useful-content boundary');
assert.doesNotMatch(fonts, /bootstrap|jquery|UA-80884320-1|google-analytics\.com\/analytics\.js/i, 'Urdu font guide must not introduce legacy dependencies');
assert.doesNotMatch(fonts, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Urdu font guide must use extensionless internal links');

assert.match(tutorial, /class="content-page guide-page v2-content-page authority-page tutorial-page"/, 'Typing tutorial must use the v2 authority page contract');
assert.match(tutorial, /<title>Write Urdu Video Tutorial – Roman Urdu Typing & Rich Editor<\/title>/, 'Tutorial must own a product-walkthrough intent rather than broad Urdu typing');
assert.match(tutorial, /<h1 id="tutorial-title">Write Urdu video tutorials<\/h1>/, 'Tutorial H1 must preserve the product-tutorial job');
assert.match(tutorial, /\/roman-urdu-transliteration/, 'Tutorial must distinguish itself from the Roman Urdu language guide');
assert.ok((tutorial.match(/facebook\.com\/plugins\/video\.php/g) || []).length === 2, 'Tutorial must retain exactly the two useful video embeds');
assert.match(tutorial, /data-wu-ad-boundary="after-answer"/, 'Tutorial must expose the Learn-page ad boundary after useful content');
assert.doesNotMatch(tutorial, /<meta name="Keywords"|UA-80884320-1|google-analytics\.com\/analytics\.js|bootstrap|jquery|clipboard\.js|jspdf|html2canvas|fb-customerchat|adsbygoogle/i, 'Tutorial must not retain legacy SEO, analytics, framework, editor or manual-ad baggage');
assert.doesNotMatch(tutorial, /href="[^"]+\.html(?:[?#][^"]*)?"/, 'Tutorial must use extensionless internal links');

assert.match(workflow, /- 'agent\/\*\*'/, 'quality workflow must run for agent branches');
assert.match(workflow, /workflow_dispatch:/, 'quality workflow must support manual recovery runs');
assert.match(workflow, /ready_for_review/, 'quality workflow must run when a draft PR becomes ready');

console.log('WriteUrdu v2 S3 authority guide contract checks passed.');
