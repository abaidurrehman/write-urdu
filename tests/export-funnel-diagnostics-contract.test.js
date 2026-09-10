const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

// WU-PLAT-002H Slice 6: only export_completed existed anywhere, so a stalled
// or failing export was indistinguishable from a healthy one with no export
// attempt at all. This adds the missing selected/started -> error stages.

const events = read('functions', 'api', 'events.js');
const telemetry = read('js', 'product-telemetry.js');
const migration = read('migrations', '0021_export_funnel_diagnostics.sql');

assert.match(events, /'export_started',\s*\n\s*'export_completed',\s*\n\s*'export_error',/, 'export_started/export_error must join the event allowlist next to export_completed');
assert.match(events, /'exports', 'export_started', 'export_error',/, 'export_started/export_error must be bounded aggregate counters on the metric rollups, not a new sink');
assert.match(events, /if \(event\.eventName === 'export_started'\) delta\.export_started \+= 1;/, 'export_started must increment the rollup counter');
assert.match(events, /if \(event\.eventName === 'export_error'\) delta\.export_error \+= 1;/, 'export_error must increment the rollup counter');

// deviceMetricUpsert writes every METRIC_COLUMNS entry unconditionally, so the
// new columns must exist on all three rollup tables or writes break in prod.
assert.match(migration, /ALTER TABLE product_hourly_metrics ADD COLUMN export_started/, 'main hourly rollup needs export_started');
assert.match(migration, /ALTER TABLE product_hourly_metrics ADD COLUMN export_error/, 'main hourly rollup needs export_error');
assert.match(migration, /ALTER TABLE product_hourly_locale_metrics ADD COLUMN export_started/, 'locale hourly rollup needs export_started');
assert.match(migration, /ALTER TABLE product_hourly_locale_metrics ADD COLUMN export_error/, 'locale hourly rollup needs export_error');
assert.match(migration, /ALTER TABLE product_hourly_device_metrics ADD COLUMN export_started/, 'device hourly rollup needs export_started (deviceMetricUpsert writes it unconditionally)');
assert.match(migration, /ALTER TABLE product_hourly_device_metrics ADD COLUMN export_error/, 'device hourly rollup needs export_error (deviceMetricUpsert writes it unconditionally)');

// Client: every existing export wrapper must report started before attempting
// the real work and error if the underlying export throws/rejects, alongside
// the completed signal it already sent.
['downloadData', 'downloadWord', 'downloadPdf'].forEach((name) => {
    const start = telemetry.indexOf(`runtime.${name} = function`);
    assert.ok(start >= 0, `${name} must remain wrapped for export telemetry`);
    const end = telemetry.indexOf('\n        }\n\n', start);
    const block = telemetry.slice(start, end > start ? end : start + 900);
    assert.match(block, /trackOutcome\('export_started'/, `${name} wrapper must fire export_started before attempting the export`);
    assert.match(block, /trackOutcome\('export_error'/, `${name} wrapper must fire export_error on failure`);
});

assert.match(telemetry, /trackOutcome\('export_started', \{ format: 'txt' \}\);/, 'text export must also report export_started');
assert.match(telemetry, /trackOutcome\('export_error', \{ format: 'txt', success: false \}\);/, 'text export must also report export_error on failure');

console.log('Export funnel diagnostics contract (WU-PLAT-002H Slice 6) passed.');
