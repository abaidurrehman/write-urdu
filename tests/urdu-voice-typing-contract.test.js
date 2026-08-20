const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'urdu-voice-typing.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'urdu-voice-typing.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const discoveryCss = fs.readFileSync(path.join(root, 'css', 'voice-discovery.css'), 'utf8');

assert.match(html, /<h1>Urdu Voice Typing<\/h1>/, 'voice page should expose a focused H1');
assert.match(html, /rel="canonical" href="https:\/\/write-urdu\.com\/tools\/urdu-voice-typing"/, 'voice page should self-canonicalize without a trailing slash');
assert.match(html, /Speak Urdu → Urdu text/, 'voice page should market the user outcome in plain language');
assert.match(html, /Tap the mic, speak naturally in Urdu/, 'voice page should lead with the simple voice-to-text job');
assert.match(html, /السلام علیکم، آج میں آواز سے اردو لکھ رہا ہوں۔/, 'voice page should visually demonstrate Urdu output');
assert.match(html, /data-urdu-voice-typing/, 'voice page should expose its protected workspace hook');
assert.match(html, /google-anno-skip/, 'voice workspace should be excluded from annotation-style auto ads');
assert.match(html, /google-side-rail-overlap="false"/, 'voice workspace should protect side-rail overlap');
assert.match(html, /data-wu-ad-boundary="post-workspace"/, 'voice page should expose a post-workspace monetization boundary');
assert.match(html, /href="\/write-urdu-privacy#voice-typing"/, 'detailed voice processing disclosure should live on the privacy page');
assert.doesNotMatch(html, /speech-recognition interface|browser-vendor|vendor service|session-only browser storage/i, 'voice landing page should avoid implementation-heavy privacy copy');
assert.match(html, /\/js\/text-handoff\.js/, 'voice page should use session-only tool handoff support');

assert.match(privacy, /id="voice-typing"/, 'privacy page should own the detailed Urdu Voice Typing disclosure');
assert.match(privacy, /provider-operated recognition service/, 'privacy page should explain possible provider-side speech processing');
assert.match(privacy, /does not create a separate audio recording/, 'privacy page should state the Write Urdu audio-processing boundary');

assert.match(shell, /function installVoiceDiscovery\(\)/, 'shared shell should install a reusable voice discovery entry');
assert.match(shell, /document\.querySelector\('\.tool-promo-grid'\)/, 'homepage tool discovery should surface voice typing visually');
assert.match(shell, /document\.querySelector\('\.my-documents-hero'\)/, 'My Documents should surface the same voice entry');
assert.match(shell, /entry\.href = '\/tools\/urdu-voice-typing'/, 'voice discovery entry must route to the canonical tool');
assert.match(shell, /السلام علیکم، آج میں آواز سے اردو لکھ رہا ہوں۔/, 'discovery card should show the Urdu output users can expect');
assert.match(discoveryCss, /\.wu-voice-entry-icon[\s\S]*width: 4\.5rem/, 'voice entry microphone should be visually prominent rather than tiny');

assert.match(js, /window\.SpeechRecognition \|\| window\.webkitSpeechRecognition/, 'voice typing should use feature detection');
assert.match(js, /instance\.lang = 'ur-PK'/, 'voice recognition should request Urdu');
assert.match(js, /startButton\.addEventListener\('click', startRecognition\)/, 'microphone should start only from an explicit action');
assert.match(js, /Ready when you are\. Press Start voice typing and speak Urdu\./, 'supported-browser copy should stay simple and action-led');
assert.doesNotMatch(js, /getUserMedia\s*\(/, 'voice typing should not create its own audio recording pipeline');
assert.doesNotMatch(js, /fetch\s*\(/, 'voice typing must not upload transcript or audio through product code');
assert.doesNotMatch(js, /XMLHttpRequest|sendBeacon|\/api\//, 'voice typing must not send transcript data to WriteUrdu endpoints');
assert.match(js, /pagehide', abortRecognition/, 'recognition should stop when the page is left');
assert.match(js, /visibilitychange/, 'recognition should stop when the page becomes hidden');
assert.match(js, /handoff\('\/urdu-text-cleaner'\)/, 'voice transcript should hand off to the cleaner');
assert.match(js, /handoff\('\/'\)/, 'voice transcript should hand off to the core editor');

console.log('Urdu voice typing product and privacy contract passed.');
