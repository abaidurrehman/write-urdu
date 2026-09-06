const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const ui = read('js', 'community-publishing-ui.mjs');
const accountGrowth = read('js', 'account-growth-entry.mjs');
const basicToolbar = read('js', 'basic-writer-command-toolbar.js');
const telemetry = read('js', 'product-telemetry.js');
const v2Workspace = read('css', 'v2-workspace.css');
const richEditor = read('urdu-editor.html');
const keyboard = read('urdu-keyboard.html');
const voice = read('tools', 'urdu-voice-typing.html');
const css = read('css', 'community-publishing.css');

// --- The manual "Publish to Urdu Writers" executor lives in the primary toolbar,
// but Slice 2 arbitration owns whether that executor is promoted or hidden. ---
assert.match(ui, /const TOOLBAR_SLOT_SELECTOR = Object\.freeze\(/, 'UI must define per-editor toolbar slot selectors');
assert.match(ui, /const toolbarSlot = await waitFor\(TOOLBAR_SLOT_SELECTOR\[editorKind\]\)/, 'Start must resolve the toolbar slot');
assert.match(ui, /const toolbarButton = toolbarSlot \? addManualAction\(toolbarSlot\) : null/, 'Community toolbar executor must be mounted idempotently into the approved slot');
assert.match(ui, /const familyEligible = isMeaningfulWriting\(text\)/, 'Community eligibility must still reject empty or trivial E0 writing');
assert.match(ui, /owner\.current\(\) === 'community_publish'/, 'Community promotion must appear only when it wins shared arbitration');
assert.match(ui, /toolbarButton\.hidden = !wins \|\| promptEligible/, 'Community toolbar executor must be hidden when another request wins or the automatic prompt is active');
assert.match(ui, /owner\.subscribe\(evaluate\)/, 'Community visibility must react to the one shared growth-request owner');
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

// --- Share-label disambiguation remains unchanged. ---
assert.doesNotMatch(richEditor, /data-write-urdu-share[\s\S]{0,40}>\s*Share\s*</, 'Rich Editor share-text button must not reuse the bare generic "Share" label');
assert.match(richEditor, /Share text only/, 'Rich Editor share-text button must match the runtime-final disambiguated label');
assert.doesNotMatch(keyboard, /data-write-urdu-share[\s\S]{0,40}>\s*Share\s*</, 'Keyboard share-text button must not reuse the bare generic "Share" label');
assert.match(keyboard, /Share text only/, 'Keyboard share-text button must match the runtime-final disambiguated label');
assert.match(keyboard, /fas fa-share-alt/, 'Keyboard share-text button icon must match Rich Editor\'s');

// --- Outcome-driven promotion now enters through the shared arbiter owner instead of
// a second Community-owned outcome listener. ---
assert.match(telemetry, /document\.dispatchEvent\(new CustomEvent\('write-urdu:outcome'/, 'trackOutcome must dispatch a single outcome event other modules can listen for');
assert.match(accountGrowth, /document\.addEventListener\('write-urdu:outcome'/, 'Shared growth owner must listen for the outcome signal');
assert.match(accountGrowth, /meaningfulOutcome = true/, 'Shared growth owner must elevate post-outcome writer state');
assert.match(ui, /owner\.subscribe\(evaluate\)/, 'Community UI must derive promotion changes from shared arbitration rather than duplicate outcome logic');

// --- Rich Editor's toolbar deliberately reorders children via CSS `order`; the
// community slot must remain explicitly ordered into place. ---
assert.match(v2Workspace, /\.rich-editor-page \.home-actions-group-community \{ order: 2; \}/,
  'Community toolbar slot must be explicitly ordered between Export/Share (order 1) and Basic editor (order 3)');

// --- CSS: the community button must be visually distinct, not a 3rd share variant. ---
assert.match(css, /\.wu-community-toolbar-button/, 'Community toolbar button must have its own dedicated style');
assert.match(css, /\[data-wu-community-toolbar-slot\]:empty \{ display: none/, 'Empty slots must not reserve visible layout space before the module loads');

console.log('Community publishing toolbar promotion contracts passed.');
