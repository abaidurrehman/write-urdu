const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.match(home, /data-wu-voice-entry="home"/, 'Homepage must keep the large source-visible Voice entry.');
assert.match(home, /href="\/tools\/urdu-voice-typing"/, 'Homepage Voice entry must keep the canonical Voice owner link.');

assert.match(sw, /const CACHE_NAME = 'write-urdu-shell-v\d+'/, 'PWA shell must keep an explicit cache revision.');
assert.match(sw, /'\.\/css\/voice-discovery\.css'/, 'Voice discovery styling must be part of the offline shell.');
assert.match(sw, /event\.request\.mode === 'navigate' \|\| event\.request\.destination === 'document'/, 'Public HTML navigations must be detected explicitly.');
assert.match(
  sw,
  /if \(isNavigation\) \{[\s\S]*?event\.respondWith\([\s\S]*?fetch\(event\.request\)[\s\S]*?offlineNavigationFallback/,
  'Navigational HTML must be network-first with cache only as offline fallback.'
);

const navigationBlock = sw.match(/if \(isNavigation\) \{([\s\S]*?)\n  \}\n\n  event\.respondWith/);
assert.ok(navigationBlock, 'Navigation freshness branch must remain separate from static-asset cache-first handling.');
assert.ok(
  navigationBlock[1].indexOf('fetch(event.request)') < navigationBlock[1].indexOf('offlineNavigationFallback'),
  'Navigation must try the network before consulting offline HTML.'
);

console.log('Service worker navigation freshness contract passed.');
