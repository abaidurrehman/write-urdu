const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const runtime = read('js', 'site-runtime.js');
const toolbar = read('js', 'basic-writer-command-toolbar.js');
const css = read('css', 'basic-writer-command-toolbar.css');

// WU-PLAT-002H-VOICE-MOBILE-COMPLETION-UX Slice 4: turn the bare "Copied" toast
// into a bounded completion moment offering one relevant continuation.

assert.match(runtime, /document\.dispatchEvent\(new CustomEvent\('write-urdu:copy-completed', \{ detail: \{ target: selector \} \}\)\)/,
  'copyText() must announce a successful copy so other owners can react without polling the toast');
assert.doesNotMatch(runtime, /detail:\s*\{[^}]*text/i, 'Copy-completed event must not carry copied text/content');

assert.match(toolbar, /data-wu-basic-copy-completion['"]?,\s*''/, 'Copy completion strip is missing its owner marker');
assert.match(toolbar, /data-wu-basic-copy-completion-share/, 'Copy completion must offer a Share continuation');
assert.match(toolbar, /data-wu-basic-copy-completion-dismiss/, 'Copy completion must be dismissible');
assert.match(toolbar, /runAuthoringShare\(\);\s*\}\);/, 'Copy completion Share action must reuse the existing authoring share flow, not a second share implementation');

assert.match(toolbar, /function growthRequestActive/, 'Copy completion must check the existing Keep\\/Share growth-request panel before showing');
assert.match(toolbar, /if \(!strip \|\| strip\.hidden === false \|\| copyCompletionSeen\(\) \|\| growthRequestActive\(\)\) return;/,
  'Copy completion must not stack with an active growth request and must not repeat once shown');
assert.match(toolbar, /sessionStorage\.setItem\(COPY_COMPLETION_SEEN_KEY/, 'Copy completion must not nag on every Copy click within a session');

assert.match(toolbar, /event\.detail\.target !== '#transliterateTextarea'/, 'Copy completion must only react to Basic Writer\'s own copy target');

assert.match(toolbar, /telemetry\('copy-continuation-shown'\)/, 'Copy completion shown state must be measurable');
assert.match(toolbar, /telemetry\('copy-continuation-share-selected'\)/, 'Copy completion Share selection must be measurable');
assert.match(toolbar, /telemetry\('copy-continuation-dismissed'\)/, 'Copy completion dismissal must be measurable');
// These route through the existing bounded basic_toolbar_action outcome (action/hasContent only),
// not a new event name or a new Product Pulse pipeline.
assert.doesNotMatch(toolbar, /copy[-_]continuation[-_]\w+['"]\s*:\s*['"]copy_continuation/, 'Copy completion must not introduce a second telemetry event vocabulary');

assert.match(css, /\.wu-basic-copy-completion\s*\{/, 'Copy completion styling is missing');
assert.doesNotMatch(css, /\.wu-basic-copy-completion[^{]*\{[^}]*position:\s*(?:fixed|sticky)/, 'Copy completion must not overlay the writer or software keyboard');

console.log('Basic Writer copy-completion contract (WU-PLAT-002H Slice 4) passed.');
