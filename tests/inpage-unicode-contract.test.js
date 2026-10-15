const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'inpage-unicode-converter.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js', 'inpage-unicode-core.js'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'js', 'inpage-unicode-converter.js'), 'utf8');

assert.match(html, /<h1>InPage to Unicode Urdu Converter<\/h1>/, 'InPage converter needs a focused H1');
assert.match(html, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/inpage-unicode-converter"/, 'converter should self-canonicalize without a trailing slash');
assert.match(html, /data-inpage-mode="legacy-to-unicode"/, 'forward conversion mode is missing');
assert.match(html, /data-inpage-mode="unicode-to-legacy"/, 'reverse conversion mode is missing');
assert.match(html, /google-anno-skip/, 'converter workspace must be protected from annotation-style ads');
assert.match(html, /google-side-rail-overlap="false"/, 'converter workspace must protect side-rail overlap');
assert.match(html, /data-wu-ad-boundary="post-workspace"/, 'converter needs an explicit post-workspace monetization boundary');
assert.match(html, /Complete <code>\.inp<\/code> document files are not supported/i, 'page must clearly state that complete .inp document files are not supported');
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

// LLM citation audit 2026-10-12, Slice 2 (A-2): a quotable explainer, a real worked example and limits, in raw HTML.
assert.match(html, /<h3>Why older InPage text looks like symbols<\/h3>/, 'explainer heading is missing');
assert.match(html, /<figure class="inpage-example"/, 'static before/after example is missing');
const exampleUnicode = 'یہ ایک اردو متن ہے۔';
assert.ok(html.includes('<p lang="ur" dir="rtl">' + exampleUnicode + '</p>'), 'example must show the Unicode Urdu sample as Urdu text');
const CoreApi = require(path.join(root, 'js', 'inpage-unicode-core.js'));
const encoded = CoreApi.encodeUnicodeText(exampleUnicode);
assert.equal(encoded.unsupported, 0, 'example sample must convert without unsupported characters');
// Control characters are not printable; the page shows only the visible symbols the engine produces.
const visibleLegacy = encoded.text.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
const legacyMatch = html.match(/<code class="inpage-example-legacy" dir="ltr">([^<]*)<\/code>/);
assert.ok(legacyMatch, 'example must show the older InPage appearance');
assert.equal(legacyMatch[1], visibleLegacy, 'older InPage appearance must be real converter output, not invented glyphs');
assert.doesNotMatch(legacyMatch[1], /[\u0000-\u001f\u007f-\u009f]/, 'example must not publish raw control characters');
const limits = html.match(/<ul class="inpage-limits">([\s\S]*?)<\/ul>/);
assert.ok(limits, 'compatibility and limits list is missing');
assert.equal((limits[1].match(/<li>/g) || []).length, 4, 'limits list should have exactly four items');
assert.match(limits[1], /\.inp<\/code> files/, 'limits must say .inp files are not opened');

console.log('InPage Unicode page contract passed.');
