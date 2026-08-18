const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'inpage-unicode-converter', 'index.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js', 'inpage-unicode-core.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'js', 'inpage-unicode-converter.js'), 'utf8');

assert.match(html, /<h1>InPage to Unicode Urdu Converter<\/h1>/, 'InPage converter needs a focused H1');
assert.match(html, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/inpage-unicode-converter"/, 'converter should self-canonicalize without a trailing slash');
assert.match(html, /data-inpage-mode="legacy-to-unicode"/, 'forward conversion mode is missing');
assert.match(html, /data-inpage-mode="unicode-to-legacy"/, 'reverse conversion mode is missing');
assert.match(html, /google-anno-skip/, 'converter workspace must be protected from annotation-style ads');
assert.match(html, /google-side-rail-overlap="false"/, 'converter workspace must protect side-rail overlap');
assert.match(html, /data-wu-ad-boundary="post-workspace"/, 'converter needs an explicit post-workspace monetization boundary');
assert.match(html, /does not open or generate complete <code>\.inp<\/code> document files/i, 'page must not claim generic .inp document support');
assert.match(html, /js\/inpage-unicode-core\.js/, 'mapping engine is missing');
assert.match(html, /js\/text-handoff\.js/, 'session-only Unicode handoff is missing');
assert.match(html, /\/urdu-text-cleaner/, 'Unicode output should lead to the cleaner');
assert.match(html, /Your source stays unchanged/, 'source-preservation promise is missing');

assert.match(core, /var PREFIX = '\\u0004'/, 'legacy prefix contract is missing');
assert.match(core, /81_BF/, 'composite-sequence handling is missing');
assert.match(core, /unsupported-byte/, 'unknown legacy bytes must be surfaced');
assert.match(core, /Preserve unsupported Unicode/, 'unsupported Unicode must not be guessed');
assert.doesNotMatch(core, /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\//, 'core converter must not upload text');

assert.match(ui, /Core\.decodeLegacyText/, 'UI should invoke forward conversion');
assert.match(ui, /Core\.encodeUnicodeText/, 'UI should invoke reverse conversion');
assert.match(ui, /Handoff\.store\(text, target\)/, 'Unicode result should use session-only handoff');
assert.doesNotMatch(ui, /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\//, 'converter UI must not upload source/result text');
assert.doesNotMatch(html, /<input[^>]+type=["']file["']/i, 'V1 must not imply .inp file upload support');

console.log('InPage Unicode page contract passed.');