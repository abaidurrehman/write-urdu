const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const inputMode = read('js/input-mode.js');
assert.match(inputMode, /unavailableAlert: 'Urdu conversion is not responding/, 'Input mode must explain a failed English-letter conversion');
assert.match(inputMode, /unavailableAlert: 'اردو میں تبدیلی جواب نہیں دے رہی/, 'The unavailable notice must have Urdu copy');
assert.match(inputMode, /observe\(document\.head, \{ childList: true \}\)/, 'Word requests must be watched where the Google control appends them, not across the whole document');
assert.match(inputMode, /addEventListener\('error', function \(\) \{ setProviderAvailability\(false\); \}\)/, 'A failed word request must mark conversion unavailable');
assert.match(inputMode, /addEventListener\('load', function \(\) \{ setProviderAvailability\(true\); \}\)/, 'A successful word request must clear the notice');
assert.match(inputMode, /write-urdu:transliteration-status/, 'Input mode must accept provider health from passage conversion');
assert.match(inputMode, /keepFocusedTargetInPlace\(root, function \(\) \{\s*alert.hidden = hidden;/, 'Every alert size change must keep the focused editor in place');
assert.match(inputMode, /behavior: 'instant'/, 'Editor position correction must not animate under smooth page scrolling');

const batch = read('js/batch-transliteration.js');
assert.match(batch, /reportAvailability\(true\);\s*writeValue\(target, result\)/, 'Successful passage conversion must report provider availability');
assert.match(batch, /\.catch\(function \(\) \{\s*reportAvailability\(false\);/, 'Failed passage conversion must report provider unavailability');

console.log('Transliteration availability contract passed.');
