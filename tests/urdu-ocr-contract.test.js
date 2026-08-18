const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'urdu-ocr.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'urdu-ocr.js'), 'utf8');
const ads = fs.readFileSync(path.join(root, 'js', 'ads.js'), 'utf8');
const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');

assert.ok(html.includes('<link rel="canonical" href="https://write-urdu.com/urdu-ocr">'), 'Image-to-text page must self-canonicalize');
assert.ok(html.includes('<title>Urdu Image to Text'), 'search title must lead with the user task rather than the OCR acronym');
assert.ok(html.includes('<h1>Convert Urdu Images to Editable Text</h1>'), 'H1 must explain the outcome in plain language');
assert.ok(html.includes('Turn a screenshot or photo into Urdu text'), 'workspace heading must describe the user job');
assert.ok(html.includes('current testing is strongest on simple Naskh-style text'), 'font guidance must explain the strongest currently tested printed style');
assert.ok(html.includes('Nastaliq and decorative layouts can need more corrections'), 'font guidance must be honest about Nastaliq limitations');
assert.ok(html.includes('What does Urdu OCR mean?'), 'OCR may remain as a secondary explained technical/search synonym');
assert.ok(html.includes('data-urdu-ocr'), 'OCR implementation hook must remain stable');
assert.ok(html.includes('google-anno-skip'), 'OCR workspace must be excluded from ad-intent annotation');
assert.ok(html.includes('google-side-rail-overlap="false"'), 'OCR workspace must reject side-rail overlap');
assert.ok(html.includes('data-wu-ad-boundary="post-workspace"'), 'OCR ads must begin after the useful workspace boundary');
assert.ok(!/tesseract(?:\.min)?\.js[^"']*<\/script>/i.test(html), 'Tesseract runtime must not load eagerly from OCR HTML');
assert.ok(html.includes('image/png,image/jpeg,image/webp'), 'OCR upload must advertise only the supported image types');
assert.ok(html.includes('not saved by WriteUrdu'), 'image-to-text page must disclose browser-local content handling');

assert.ok(js.includes("TESSERACT_VERSION = '7.0.0'"), 'OCR runtime must be version-pinned');
assert.ok(js.includes("var MAX_FILE_BYTES = 12 * 1024 * 1024"), 'OCR must bound file size');
assert.ok(js.includes("var MAX_PIXELS = 20 * 1000 * 1000"), 'OCR must bound image pixels');
assert.ok(js.includes("Tesseract.createWorker('urd'"), 'OCR must request the Urdu recognition model');
assert.ok(js.includes('SPARSE_TEXT'), 'OCR MVP should use the benchmark-selected sparse-text segmentation mode');
assert.ok(js.includes("handoff('/urdu-text-cleaner')"), 'OCR result must hand off to the cleaner');
assert.ok(js.includes("handoff('/')"), 'OCR result must hand off to the basic editor');
assert.ok(!/fetch\s*\(\s*['"]\/api\//.test(js), 'OCR implementation must not upload image/text to a WriteUrdu API');
assert.ok(!/localStorage/.test(js), 'OCR implementation must not persist content in localStorage');

assert.ok(ads.includes("'/urdu-ocr'"), 'OCR route must have an explicit create-page monetization posture');
assert.ok(ads.includes("'[data-urdu-ocr]'"), 'OCR workspace must be in the protected create-area list');
assert.ok(redirects.includes('/urdu-ocr.html /urdu-ocr 301'), 'OCR legacy file route must redirect to canonical clean route');
assert.ok(registry.includes('urdu-ocr.html,/urdu-ocr,Create,Urdu image to text'), 'image-to-text route must be registered with user/search-friendly intent language');

console.log('Urdu image-to-text contract tests passed.');