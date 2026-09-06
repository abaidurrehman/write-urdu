const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const events = read('functions/api/events.js');
const pulse = read('functions/api/internal/product-pulse.js');
const telemetry = read('js/product-telemetry.js');
const handoff = read('js/workspace-handoff.js');
const continuity = read('js/core-continuity.js');
const rich = read('js/card-studio-entry.js');
const card = read('js/card-studio-handoff-adapter.js');
const qrAdapter = read('js/qr-handoff-adapter.js');
const qr = read('js/qr-generator.js');
const html = read('os/product-pulse.html');
const client = read('js/product-pulse.js');
const migration = read('migrations/0019_continuation_path_diagnostics.sql');

['eligible','shown','selected','handoff_created','destination_ready','payload_restored','meaningful_start','destination_outcome'].forEach((stage) => {
  assert.ok(events.includes("'continuation_path_" + stage + "'"), 'Missing bounded continuation path event: ' + stage);
});
assert.ok(events.includes('CONTINUATION_RECOMMENDATIONS = new Set'), 'Recommendation IDs must be server-bounded enums');
assert.ok(events.includes('CONTINUATION_WORKSPACES = new Set'), 'Source/destination workspace IDs must be bounded enums');
assert.ok(events.includes('CONTINUATION_RELEASE_MARKERS = new Set'), 'Release marker must be bounded');
assert.ok(events.includes('continuation_hourly_paths'), 'Path diagnostics must use a dedicated same-D1 aggregate rollup');
assert.ok(!/INSERT(?: OR IGNORE)? INTO product_events/i.test(events), 'Routine Slice 1 telemetry must not reintroduce raw event writes');
assert.ok(!/^\s*(editor_text|roman_urdu_text|urdu_text|transcript|audio|filename|document_id|share_id|email|account_id)\s+/im.test(migration), 'Path rollup must not declare content or identity columns');

['recommendation_id','source_workspace','destination_workspace','path_version','release_marker','handoff_required','restore_required'].forEach((field) => {
  assert.ok(telemetry.includes(field), 'Client payload must include bounded path field ' + field);
});
assert.ok(telemetry.includes('data-wu-next-step-action'), 'Recommendation identity must come from the stable registry-backed action ID');
assert.ok(telemetry.includes('details.open'), 'Hidden overflow recommendations must not count as shown until disclosed');
assert.ok(telemetry.includes("trackContinuationPath('selected'"), 'Selection must be attributed to the stable recommendation');
assert.ok(telemetry.includes("trackContinuationPath('handoff_created'"), 'Handoff creation must be a distinct path stage');
assert.ok(telemetry.includes('trackContinuationMeaningfulInteraction'), 'Meaningful start must require destination interaction');

assert.ok(handoff.includes('CONTINUATION_RELEASE_MARKER'), 'Handoff envelope diagnostics must carry a bounded release marker');
assert.ok(handoff.includes('recommendationId'), 'Handoff telemetry detail must preserve stable recommendation identity');
assert.ok(continuity.includes('actionId: actionId(sourceWorkspace, targetWorkspace)'), 'v2 handoffs must retain registry action ownership');
assert.ok(continuity.includes('recommendationId: recommendationId || actionId(sourceWorkspace, targetWorkspace)'), 'v2 transfer must carry the selected stable recommendation as diagnostic context');
assert.ok(continuity.includes("pathVersion: 'v2'"), 'v2 transfer must carry explicit path version');

assert.ok(rich.includes("handoff.peek('rich-editor')"), 'Rich destination must inspect v2 state before falling back to legacy');
assert.ok(rich.includes("continuationPath('destination_ready'"), 'Rich destination ready cannot be page load alone');
assert.ok(rich.includes('if (!replace) return'), 'Rich draft conflict must remain user-controlled');
assert.ok(rich.includes("continuationPath('payload_restored'"), 'Rich restore must fire only after setContent succeeds');
assert.ok(card.includes("if (!app || !core || typeof app.getState !== 'function') return null"), 'Card destination must wait for an accept-capable app');
const applyIndex = card.indexOf('applyToRunningApp(preview, template)');
const takeAfterApply = card.indexOf('handoff.take(TARGET)', applyIndex);
assert.ok(applyIndex >= 0 && takeAfterApply > applyIndex, 'Card v2 state must remain retryable until live apply succeeds');
assert.ok(qrAdapter.includes('data-wu-qr-incoming-restored'), 'QR adapter must wait for actual generator import');
assert.ok(qr.includes('write-urdu:qr-generator-imported'), 'QR generator must announce actual import after state is applied');

assert.ok(pulse.includes('function continuationPathSection('), 'Product Pulse must expose a path diagnostic model');
assert.ok(pulse.includes('dominant_loss'), 'Product Pulse must identify the dominant bounded loss stage');
assert.ok(pulse.includes('continuation_hourly_paths'), 'Product Pulse must read the path rollup rather than raw events');
assert.ok(html.includes('id="continuationLossBars"'), 'Founder dashboard must render aggregate loss stages');
assert.ok(html.includes('id="continuationPathRows"'), 'Founder dashboard must render per-recommendation paths');
assert.ok(client.includes('continuation_paths'), 'Dashboard client must consume Slice 1 diagnostics');
assert.ok(client.includes('Largest aggregate loss'), 'Dashboard must name the observed dominant loss before public CTA changes');

console.log('Product Pulse Slice 1 continuation diagnostic contracts passed.');
