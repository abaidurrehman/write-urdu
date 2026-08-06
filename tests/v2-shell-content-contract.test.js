const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const seoRuntime = read('js/seo.js');
const shellRuntime = read('js/v2-shell.js');
const shellCss = read('css/v2-shell.css');
const contentCss = read('css/v2-content.css');
const documentation = read('write-urdu-documentation.html');
const faq = read('urdu-faq.html');

function assertApprovedWeights(source, label) {
    const weights = Array.from(source.matchAll(/font-weight\s*:\s*(\d+)\b/g), (match) => Number(match[1]));
    weights.forEach((weight) => {
        assert.ok([400, 500, 600, 700].includes(weight), `${label} uses disallowed font weight ${weight}`);
    });
}

new vm.Script(seoRuntime, { filename: 'js/seo.js' });
new vm.Script(shellRuntime, { filename: 'js/v2-shell.js' });

assert.match(seoRuntime, /js\/v2-shell\.js/, 'SEO runtime must load the global v2 application shell');
assert.match(shellRuntime, /data-wu-v2-navigation/, 'v2 shell must mark upgraded navigation');
assert.match(shellRuntime, /data-wu-v2-footer/, 'v2 shell must mark upgraded footer');
assert.match(shellRuntime, /Rich Text Editor/, 'v2 navigation must retain the Rich Editor route');
assert.match(shellRuntime, /Urdu Keyboard/, 'v2 navigation must retain the Urdu Keyboard route');
assert.match(shellRuntime, /Invoice Generator/, 'v2 navigation must retain the business workflow');
assert.match(shellRuntime, /Help and learning/, 'v2 navigation must provide a focused learning menu');
assert.match(shellRuntime, /Roman Urdu guide/, 'v2 navigation must expose the Roman Urdu guide');

assert.match(documentation, /class="documentation-page v2-content-page"/, 'Documentation must use the shared v2 content page contract');
assert.match(documentation, /css\/v2-content\.css/, 'Documentation must load the v2 content system');
assert.match(documentation, /class="v2-page-nav"/, 'Documentation must expose in-page task navigation');
assert.match(documentation, /https:\/\/write-urdu\.com\/write-urdu-documentation/, 'Documentation canonical changed unexpectedly');
assert.match(documentation, /id="docs-title"/, 'Documentation H1 contract changed');
assert.match(documentation, /Roman Urdu/, 'Documentation must retain Roman Urdu guidance');

assert.match(faq, /class="faq-page v2-content-page"/, 'FAQ must use the shared v2 content page contract');
assert.match(faq, /css\/v2-content\.css/, 'FAQ must load the v2 content system');
assert.match(faq, /class="v2-page-nav"/, 'FAQ must expose category navigation');
assert.match(faq, /https:\/\/write-urdu\.com\/urdu-faq/, 'FAQ canonical changed unexpectedly');
assert.match(faq, /id="faq-title"/, 'FAQ H1 contract changed');
assert.ok((faq.match(/<details class="faq-item"/g) || []).length >= 8, 'FAQ should expose all core answers as accessible details');
assert.doesNotMatch(faq, /UA-80884320-1|google-analytics\.com\/analytics\.js/, 'FAQ must not retain obsolete Universal Analytics');
assert.doesNotMatch(faq, /maxcdn\.bootstrapcdn\.com|font-awesome|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/i, 'FAQ must not retain obsolete framework dependencies');
assert.doesNotMatch(faq, /<meta name="Keywords"/i, 'FAQ must not retain legacy keyword meta tags');

assertApprovedWeights(shellCss, 'v2 shell');
assertApprovedWeights(contentCss, 'v2 content system');
assert.match(shellCss, /prefers-reduced-motion/, 'v2 shell must respect reduced-motion preferences');
assert.match(contentCss, /prefers-reduced-motion/, 'v2 content system must respect reduced-motion preferences');
assert.match(contentCss, /summary/, 'v2 content system must retain interactive disclosure treatment');

console.log('WriteUrdu v2 S2 shell and content contract checks passed.');
