const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const home = read('index.html');
const urduHome = read('urdu', 'index.html');
const mobileCss = read('css', 'mobile-home-task-first.css');
const shellCss = read('css', 'v2-shell.css');
const serviceWorker = read('sw.js');
const mobileSpec = read('specs', 'WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md');

for (const page of [home, urduHome]) {
  assert.match(page, /<label class="sr-only"\s+for="transliterateTextarea"[\s\S]*?<textarea[\s\S]*?id="transliterateTextarea"/, 'Homepage variants must retain one semantic label bound to the real Basic Writer textarea');
  assert.match(page, /data-wu-voice-entry="home"/, 'Voice discovery must remain source-visible for desktop/other governed layouts');
  assert.match(page, /data-start-typing/, 'Desktop/accessibility Start typing entry must remain source-owned');
}

assert.match(shellCss, /@import url\("\.\/mobile-home-task-first\.css"\)/, 'V2 shell must continue to load the mobile task-first layer');
assert.match(mobileCss, /\.home-hero-meta,[\s\S]*\.home-hero-actions,[\s\S]*\.wu-voice-entry-home,[\s\S]*hr\.solid\s*\{\s*display:\s*none !important;/, 'Phone first viewport must demote duplicate hero/discovery blocks before the writer');
assert.match(mobileCss, /:not\(\[data-wu-basic-command-toolbar="true"\]\) \.home-actions\s*\{\s*display:\s*none !important;/, 'Legacy command wall must not flash before the adaptive toolbar mounts');
assert.match(mobileCss, /#demo > label\.sr-only\[for="transliterateTextarea"\][\s\S]*position:\s*static !important;[\s\S]*display:\s*flex !important;/, 'The existing editor label must become visibly recognizable on phones');
assert.match(mobileCss, /#demo:focus-within[\s\S]*border-color:\s*var\(--wu-color-brand\) !important;/, 'Real editor container needs an unmistakable focus state');
assert.match(mobileCss, /#transliterateTextarea\s*\{[\s\S]*min-height:\s*clamp\(280px, 48vh, 420px\) !important;/, 'Common phone viewports need a substantial real writing canvas');
assert.match(mobileCss, /@media \(max-width: 767px\) and \(max-height: 700px\)[\s\S]*#transliterateTextarea\s*\{[\s\S]*min-height:\s*300px !important;/, '375x667-class phones need an explicit small-height acceptance floor');
assert.match(mobileCss, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/, 'English letters, direct Urdu and Voice must remain one compact input-choice row');
assert.match(mobileCss, /min-height:\s*44px !important/, 'Mobile input methods must keep accessible touch targets');

assert.match(serviceWorker, /write-urdu-shell-v42/, 'Mobile activation release must advance the app-shell cache generation');
assert.match(serviceWorker, /\.\/css\/mobile-home-task-first\.css/, 'Mobile activation CSS must be explicitly precached for a deterministic rollout');
assert.match(mobileSpec, /375x667[\s\S]*160 CSS px/i, 'Repair spec must retain the hardest first-viewport acceptance floor');
assert.match(mobileSpec, /Do not autofocus on page load/i, 'Repair must not game activation by forcing the software keyboard open');

console.log('Mobile editor activation source contract passed.');
