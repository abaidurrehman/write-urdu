const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools', 'urdu-voice-typing.html'), 'utf8');
const urduHtml = fs.readFileSync(path.join(root, 'urdu', 'tools', 'urdu-voice-typing.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js', 'urdu-voice-typing.js'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js', 'voice-input-core.js'), 'utf8');
const unified = fs.readFileSync(path.join(root, 'js', 'unified-urdu-input.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const myDocuments = fs.readFileSync(path.join(root, 'functions', 'my-documents.js'), 'utf8');
const discoveryCss = fs.readFileSync(path.join(root, 'css', 'voice-discovery.css'), 'utf8');

assert.match(html, /<h1[^>]*>Urdu Voice Typing<\/h1>/, 'voice page should expose a focused H1');
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
assert.match(html, /\/js\/voice-input-core\.js[\s\S]*\/js\/unified-urdu-input\.js[\s\S]*\/js\/urdu-voice-typing\.js/, 'English voice page should load shared core and adapter before route UI');
assert.match(urduHtml, /\/js\/voice-input-core\.js[\s\S]*\/js\/unified-urdu-input\.js[\s\S]*\/js\/urdu-voice-typing\.js/, 'Urdu voice page should load the same shared core and adapter');

assert.match(privacy, /id="voice-typing"/, 'privacy page should own the detailed Urdu Voice Typing disclosure');
assert.match(privacy, /provider-operated recognition service/, 'privacy page should explain possible provider-side speech processing');
assert.match(privacy, /does not create a separate audio recording/, 'privacy page should state the Write Urdu audio-processing boundary');

assert.match(shell, /function installVoiceDiscovery\(\)/, 'shared shell should install a reusable voice discovery entry');
assert.match(shell, /document\.querySelector\('\.home-hero-actions'\)/, 'homepage start area should surface voice typing before users reach the lower tool directory');
assert.match(shell, /document\.querySelector\('\.my-documents-hero'\)/, 'My Documents should surface the same voice entry');
assert.match(shell, /entry\.href = localeHref\('\/tools\/urdu-voice-typing'\)/, 'voice discovery entry must route through the locale-aware canonical tool helper');
assert.match(shell, /السلام علیکم، آج میں آواز سے اردو لکھ رہا ہوں۔/, 'discovery card should show the Urdu output users can expect');
assert.match(myDocuments, /<script src="\/site-header\.js" defer><\/script>/, 'My Documents must load the shared shell that installs voice discovery');
assert.match(discoveryCss, /\.wu-voice-entry-icon[\s\S]*width: 4\.5rem/, 'voice entry microphone should be visually prominent rather than tiny');

assert.match(core, /host\.SpeechRecognition \|\| host\.webkitSpeechRecognition/, 'shared voice core should own feature detection');
assert.match(core, /instance\.lang = options\.lang \|\| 'ur-PK'/, 'shared voice core should request Urdu by default');
assert.doesNotMatch(js, /SpeechRecognition|webkitSpeechRecognition|new Recognition/, 'dedicated route must not retain a duplicate speech engine');
assert.match(js, /WriteUrduVoiceInput\.create/, 'dedicated route should use shared voice core');
assert.match(js, /WriteUrduUnifiedInput\.createTextControlAdapter\(transcript\)/, 'dedicated route should use generic target adapter');
assert.match(unified, /target\.value[\s\S]*target\.selectionStart[\s\S]*target\.selectionEnd/, 'target adapter should read current value and selection');
assert.match(js, /startButton\.addEventListener\('click', startRecognition\)/, 'microphone should start only from an explicit action');
assert.match(js, /Ready when you are\. Press Start voice typing and speak Urdu\./, 'supported-browser copy should stay simple and action-led');
assert.doesNotMatch(js, /getUserMedia\s*\(/, 'voice typing should not create its own audio recording pipeline');
assert.doesNotMatch(js, /fetch\s*\(/, 'voice typing must not upload transcript or audio through product code');
assert.doesNotMatch(js, /XMLHttpRequest|sendBeacon|\/api\//, 'voice typing must not send transcript data to WriteUrdu endpoints');
assert.match(core, /pagehide[\s\S]*handlePageHide/, 'shared core should clean up recognition when the page is left');
assert.match(core, /visibilitychange[\s\S]*handleVisibilityChange/, 'shared core should stop recognition when the page becomes hidden');
assert.match(js, /handoff\('\/urdu-text-cleaner'\)/, 'voice transcript should hand off to the cleaner');
assert.match(js, /handoff\('\/'\)/, 'voice transcript should hand off to the core editor');

// WU-VOICE-PLAT-001D §4: Speak an Urdu message -> edit/correct -> Copy or Share
// to WhatsApp, distinct from the Status Maker's image outcome. Reuses the
// existing approved WhatsApp share pattern (navigator.share falling back to
// WhatsApp's own api.whatsapp.com intent) — no new backend, no new route.
assert.match(html, /data-voice-whatsapp data-write-urdu-share/, 'voice page should expose a Send to WhatsApp action wired into the existing share telemetry');
assert.match(urduHtml, /data-voice-whatsapp data-write-urdu-share/, 'Urdu voice page should expose the same Send to WhatsApp action');
assert.match(js, /function shareToWhatsApp/, 'voice page should implement the WhatsApp message share action');
assert.match(js, /navigator\.share/, 'WhatsApp share should prefer the native share sheet before falling back');
assert.match(js, /api\.whatsapp\.com\/send\?text=/, 'WhatsApp fallback must use the existing approved WhatsApp intent, not a WriteUrdu backend');
assert.doesNotMatch(js, /urdu-whatsapp-message-maker/, 'no dedicated WhatsApp message route should be created without evidence (WU-VOICE-PLAT-001D §4.3)');

console.log('Urdu voice typing product, discoverability and privacy contract passed.');
