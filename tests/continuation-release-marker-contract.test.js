const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// `continuation_path_shown` changed meaning (in-viewport instead of present in
// the DOM) and Basic Writer / Text Cleaner gained destination events, so the
// funnel rows must be separable from earlier data by release marker.
const CURRENT = 'wu-plat-002h-s1-2026-10-09-v2';
const PREVIOUS = 'wu-plat-002h-s1-2026-09-06-v1';

const telemetry = read('js/product-telemetry.js');
const handoff = read('js/workspace-handoff.js');
const continuity = read('js/core-continuity.js');
const events = read('functions/api/events.js');

assert.match(telemetry, new RegExp("CONTINUATION_RELEASE_MARKER = '" + CURRENT + "'"), 'telemetry client must stamp the current marker');
assert.match(handoff, new RegExp("CONTINUATION_RELEASE_MARKER = '" + CURRENT + "'"), 'handoff runtime must stamp the current marker so source and destination events share it');
assert.match(continuity, new RegExp("Handoff\\.CONTINUATION_RELEASE_MARKER \\|\\| '" + CURRENT + "'"), 'core continuity fallback must match the handoff marker');
assert.ok(!telemetry.includes(PREVIOUS) && !handoff.includes(PREVIOUS) && !continuity.includes(PREVIOUS), 'no client file may still stamp the previous marker');

const allowlist = events.match(/CONTINUATION_RELEASE_MARKERS = new Set\(\[([^\]]+)\]\)/);
assert.ok(allowlist, 'server must keep a bounded release-marker allowlist');
assert.ok(allowlist[1].includes("'" + CURRENT + "'"), 'server must accept the current marker or every continuation event is dropped');
assert.ok(allowlist[1].includes("'" + PREVIOUS + "'"), 'server must keep accepting the previous marker for cached clients and in-flight handoffs');

// Two marker generations of the same path coexist for the review window, so
// the dashboard must label them instead of showing indistinguishable rows.
const pulse = read('js/product-pulse.js');
assert.match(pulse, /pathLabel = [^;]*item\.release_marker/, 'Pulse path rows must show the release marker');

console.log('continuation release marker contract passed');
