const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const api = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'product-pulse.js'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js', 'product-pulse.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'os', 'product-pulse.html'), 'utf8');

assert.match(api, /METRICS_SEMANTICS_VERSION = 'wu-plat-002h-s0-2026-09-06-v1'/, 'Slice 0 must expose a bounded release marker');
assert.match(api, /function boundedRate\(/, 'Slice 0 must distinguish bounded conversion from generic ratios');
assert.match(api, /first_input_rate: boundedRate\(firstInput, viewed\)/, 'First input must use writer-viewed as the compatible denominator');
assert.doesNotMatch(api, /first_input_rate: ratio\(firstInput, focused\)/, 'First input must not be divided by focus');
assert.match(api, /outcome_rate: boundedRate\(outcomeFirst, firstInput\)/, 'First outcome must use first-input as the compatible denominator');
assert.doesNotMatch(api, /outcome_rate: ratio\(outcomeFirst, firstUrduSuccess\)/, 'First outcome must not use Urdu-success as a universal denominator');
assert.match(api, /export_attempted_rate: boundedRate\(attempted, textEntered\)/, 'Card export attempt must use the common text-entered population');
assert.match(api, /export_step_reached_rate: null/, 'Optional Card export-step must not masquerade as a universal conversion');
assert.match(api, /path_version: 'mixed_legacy_v2_pre_slice1'/, 'Mixed continuation paths must be explicitly versioned');
assert.match(api, /payload_restored_rate: null/, 'Mixed-path restore count must not be emitted as conversion');
assert.match(api, /meaningful_start_rate: null/, 'Mixed-path meaningful-start count must not be divided by a path-optional step');
assert.match(api, /metrics_version: METRICS_SEMANTICS_VERSION/, 'Product Pulse response must carry the release marker');
assert.doesNotMatch(api, /FROM product_events/i, 'Slice 0 must stay on aggregate rollups and not scan raw events');

assert.match(client, /function boundedPercent\(/, 'Dashboard must render unavailable incompatible conversions explicitly');
assert.match(html, /First input ÷ writer viewed/, 'Dashboard must explain the corrected first-input denominator');
assert.match(html, /Attempted ÷ text entered · export step is optional/, 'Dashboard must explain the Card branch denominator');
assert.match(html, /downstream raw counts until path consolidation/i, 'Continuation panel must not imply a false strict funnel');
assert.match(html, /No text content in any step/, 'Privacy boundary must remain explicit');

console.log('Product Pulse Slice 0 denominator semantics contracts passed.');
