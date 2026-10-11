const assert = require('assert');
const fs = require('fs');
const path = require('path');

// WU-UXR-002 Slice C: never overwrite a saved card; Recent cards on this device (CARD-UX-002, CARD-UX-034).
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const studio = read('js/card-studio.js');
const adapter = read('js/card-studio-handoff-adapter.js');
const core = read('js/card-studio-core.js');
const html = read('urdu-card-studio.html');

// The app exposes the predicate and the fork.
assert.match(studio, /function hasUserWork\(/, 'card-studio.js must define hasUserWork()');
assert.match(studio, /function forkProject\(/, 'card-studio.js must define forkProject()');
assert.match(studio, /hasUserWork:\s*function/, 'the app must expose hasUserWork');
assert.match(studio, /forkProject:\s*forkProject/, 'the app must expose forkProject');

// The adapter forks before it writes into the running project, on every write path.
const forkGuard = /forkIfNeeded\(envelope|forkIfNeeded\(preview/;
assert.match(adapter, /function forkIfNeeded\(/, 'the adapter must define forkIfNeeded()');
['function applyToRunningApp', 'function applyGallerySeed'].forEach(name => {
  const start = adapter.indexOf(name);
  assert.ok(start >= 0, name + ' must exist');
  const body = adapter.slice(start, adapter.indexOf('\n    }\n', start));
  const fork = body.search(forkGuard);
  const write = body.search(/app\.(replaceState|updateObjectText)\(/);
  assert.ok(fork >= 0, name + ' must call forkIfNeeded');
  assert.ok(fork < write, name + ' must fork before replaceState/updateObjectText');
});

// A pending hand-off, template or incoming text must stop the latest-card restore from replacing the new card.
assert.match(studio, /if \(!latest \|\| userChanged \|\| startedFresh\)/, 'dbGetLatest() must not replace a fresh hand-off/template card');

// Retention cap and orphan asset cleanup.
assert.match(studio, /var RECENT_LIMIT = 20;/, 'cap Recent cards at 20 per scope');
assert.match(studio, /index\('projectId'\)/, 'pruning must delete the removed cards\' assets');

// Thumbnails are small JPEGs.
assert.match(studio, /toDataURL\('image\/jpeg', \.6\)/, 'thumbnails are JPEG at quality .6');
assert.match(studio, /12 \* 1024/, 'thumbnails are capped at 12 KB');

// Ids do not collide when two tabs create a card in the same millisecond.
assert.match(core, /'card_' \+ Date\.now\(\)\.toString\(36\) \+ /, 'project ids need a random suffix');

// UI and copy (en + ur).
assert.ok(/<section class="card-studio-recent" data-card-recent hidden aria-labelledby="cardRecentTitle">/.test(html), 'urdu-card-studio.html: ' + /<section class="card-studio-recent" data-card-recent hidden aria-labelledby="cardRecentTitle">/.source);
assert.ok(/<ul data-card-recent-list><\/ul>/.test(html), 'urdu-card-studio.html: ' + /<ul data-card-recent-list><\/ul>/.source);
assert.ok(/Saved only in this browser\. Other phones and cleared browsers won't have them\./.test(html), 'urdu-card-studio.html: ' + /Saved only in this browser\. Other phones and cleared browsers won't have them\./.source);
[
  "recentTitle:'Recent cards on this device'",
  "recentNote:'Saved only in this browser. Other phones and cleared browsers won\\'t have them.'",
  "recentOpen:'Open'",
  "recentOpen:'کھولیں'",
  "forked:'Started a new card. Your previous card is in Recent cards.'"
].forEach(fragment => assert.ok(studio.includes(fragment), 'missing copy: ' + fragment));
assert.match(studio, /recentTitle:'[^']*[؀-ۿ][^']*'/, 'Urdu recentTitle');
assert.match(studio, /recentNote:'[^']*[؀-ۿ][^']*'/, 'Urdu recentNote');
assert.match(studio, /forked:'[^']*[؀-ۿ][^']*'/, 'Urdu forked notice');

console.log('card-studio-recent contract passed');
