const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const ui = read('js', 'community-publishing-ui.mjs');
const basicToolbar = read('js', 'basic-writer-command-toolbar.js');
const telemetry = read('js', 'product-telemetry.js');
const v2Workspace = read('css', 'v2-workspace.css');
const richEditor = read('urdu-editor.html');
const keyboard = read('urdu-keyboard.html');
const voice = read('tools', 'urdu-voice-typing.html');
const css = read('css', 'community-publishing.css');

// --- The manual "Publish to Urdu Writers" action must live in the primary toolbar,
// not buried inside the signed-in account/My-Documents side panel. ---
assert.match(ui, /const TOOLBAR_SLOT_SELECTOR = Object\.freeze\(/, 'UI must define per-editor toolbar slot selectors');
assert.match(ui, /const toolbarSlot = await waitFor\(TOOLBAR_SLOT_SELECTOR\[editorKind\]\)/, 'Start must resolve the toolbar slot');
assert.match(ui, /if \(toolbarSlot\) addManualAction\(toolbarSlot\)/, 'Manual action must be inserted into the toolbar slot');
assert.doesNotMatch(ui, /actionsHostFor/, 'Manual action must no longer target the buried account-panel actions host');
assert.match(ui, /wu-community-toolbar-button/, 'Manual action must use the dedicated, disambiguated toolbar button style');

// --- Static toolbar slot markup on the three non-runtime-rebuilt surfaces ---
assert.match(richEditor, /data-wu-community-toolbar-slot/, 'Rich Editor must expose a static community toolbar slot');
assert.match(keyboard, /data-wu-community-toolbar-slot/, 'Urdu Keyboard must expose a static community toolbar slot');
assert.match(voice, /data-wu-community-toolbar-slot/, 'Voice Typing must expose a static community toolbar slot');

// --- Home surface: the runtime-rebuilt toolbar must own an idempotent slot mount ---
assert.match(basicToolbar, /function mountCommunitySlot\(surface\)/, 'Basic toolbar must own a community slot mounting function');
assert.match(basicToolbar, /data-wu-community-toolbar-slot/, 'Basic toolbar must create the community slot with the shared selector attribute');
assert.match(basicToolbar, /mountCommunitySlot\(existing\)/, 'Community slot must mount on the fast (existing-surface) rebuild path');
assert.match(basicToolbar, /mountCommunitySlot\(surface\)/, 'Community slot must mount on the fresh-build path');

// --- Share-label disambiguation: `card-studio-entry.js` (loaded dynamically via
// workspace-journey-registry.js, not a static <script> tag — verified live, not just by
// reading source) relabels [data-write-urdu-share] to "Share text only" at runtime on
// both Rich Editor and Keyboard, to disambiguate it from the "Create & Share" button it
// injects into the site header. Static markup must match that final state so there is no
// pre-hydration flash of a different label/icon. ---
assert.doesNotMatch(richEditor, /data-write-urdu-share[\s\S]{0,40}>\s*Share\s*</, 'Rich Editor share-text button must not reuse the bare generic "Share" label');
assert.match(richEditor, /Share text only/, 'Rich Editor share-text button must match the runtime-final disambiguated label');
assert.doesNotMatch(keyboard, /data-write-urdu-share[\s\S]{0,40}>\s*Share\s*</, 'Keyboard share-text button must not reuse the bare generic "Share" label');
assert.match(keyboard, /Share text only/, 'Keyboard share-text button must match the runtime-final disambiguated label');
assert.match(keyboard, /fas fa-share-alt/, 'Keyboard share-text button icon must match Rich Editor\'s (both are relabeled identically at runtime)');

// --- Post-export nudge: reuse the existing telemetry funnel, do not re-instrument every surface ---
assert.match(telemetry, /document\.dispatchEvent\(new CustomEvent\('write-urdu:outcome'/, 'trackOutcome must dispatch a single outcome event other modules can listen for');
assert.match(ui, /document\.addEventListener\('write-urdu:outcome'/, 'Community UI must listen for the shared outcome event');
assert.match(ui, /name !== 'export_completed' && name !== 'print_started'/, 'Nudge must trigger only on export/print outcomes, not every copy');

// --- Rich Editor's toolbar deliberately reorders children via CSS `order` (v2-workspace.css);
// a dynamically-inserted group with no explicit order defaults to 0 and jumps to the front,
// ahead of Export/Share. The community slot must be explicitly ordered into place. ---
assert.match(v2Workspace, /\.rich-editor-page \.home-actions-group-community \{ order: 2; \}/,
  'Community toolbar slot must be explicitly ordered between Export/Share (order 1) and Basic editor (order 3)');

// --- CSS: the community button must be visually distinct, not a 3rd share variant ---
assert.match(css, /\.wu-community-toolbar-button/, 'Community toolbar button must have its own dedicated style');
assert.match(css, /\[data-wu-community-toolbar-slot\]:empty \{ display: none/, 'Empty slots must not reserve visible layout space before the module loads');

console.log('Community publishing toolbar promotion contracts passed.');
