const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'urdu-voice-typing.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'urdu-voice-typing.js'), 'utf8');

assert.match(html, /<h1>Urdu Voice Typing<\/h1>/, 'voice page should expose a focused H1');
assert.match(html, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/urdu-voice-typing"/, 'voice page should self-canonicalize without a trailing slash');
assert.match(html, /data-urdu-voice-typing/, 'voice page should expose its protected workspace hook');
assert.match(html, /google-anno-skip/, 'voice workspace should be excluded from annotation-style auto ads');
assert.match(html, /google-side-rail-overlap="false"/, 'voice workspace should protect side-rail overlap');
assert.match(html, /data-wu-ad-boundary="post-workspace"/, 'voice page should expose a post-workspace monetization boundary');
assert.match(html, /Speech recognition is provided by your browser or platform and may use a vendor service\./, 'voice page should disclose browser/vendor processing');
assert.match(html, /\/js\/text-handoff\.js/, 'voice page should use session-only tool handoff support');

assert.match(js, /window\.SpeechRecognition \|\| window\.webkitSpeechRecognition/, 'voice typing should use feature detection');
assert.match(js, /instance\.lang = 'ur-PK'/, 'voice recognition should request Urdu');
assert.match(js, /startButton\.addEventListener\('click', startRecognition\)/, 'microphone should start only from an explicit action');
assert.doesNotMatch(js, /getUserMedia\s*\(/, 'voice typing should not create its own audio recording pipeline');
assert.doesNotMatch(js, /fetch\s*\(/, 'voice typing must not upload transcript or audio through product code');
assert.doesNotMatch(js, /XMLHttpRequest|sendBeacon|\/api\//, 'voice typing must not send transcript data to WriteUrdu endpoints');
assert.match(js, /pagehide', abortRecognition/, 'recognition should stop when the page is left');
assert.match(js, /visibilitychange/, 'recognition should stop when the page becomes hidden');
assert.match(js, /handoff\('\/urdu-text-cleaner'\)/, 'voice transcript should hand off to the cleaner');
assert.match(js, /handoff\('\/'\)/, 'voice transcript should hand off to the core editor');

console.log('Urdu voice typing contract passed.');