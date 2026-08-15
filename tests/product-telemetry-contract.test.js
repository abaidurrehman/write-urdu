const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const client = fs.readFileSync(path.join(root, 'js', 'product-telemetry.js'), 'utf8');
const endpoint = fs.readFileSync(path.join(root, 'functions', 'api', 'events.js'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'migrations', '0001_product_telemetry.sql'), 'utf8');
const writeMonetization = fs.readFileSync(path.join(root, 'js', 'write-monetization.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');

assert.match(writeMonetization, /js\/product-telemetry\.js/, 'Core Write runtime must load the first-party telemetry client');
assert.match(writeMonetization, /CORE_ROUTES\s*=\s*\['\/', '\/urdu-editor', '\/urdu-keyboard'\]/, 'Phase 1 telemetry must cover all three core writing routes');

assert.match(client, /sessionStorage/, 'Telemetry identity must be session-scoped rather than persistent local storage');
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*telemetry/i, 'Telemetry must not create a persistent cross-session identifier');
assert.match(client, /lengthBucket/, 'Client must reduce writing length to buckets');
assert.match(client, /activeTimeBucket/, 'Client must reduce active writing time to buckets');
assert.match(client, /editor_engaged/, 'Editor engagement event is missing');
assert.match(client, /session_summary/, 'Session summary event is missing');
assert.match(client, /copy_completed/, 'Copy outcome instrumentation is missing');
assert.match(client, /export_completed/, 'Export outcome instrumentation is missing');
assert.match(client, /batch_transliteration/, 'Batch transliteration instrumentation is missing');
assert.match(client, /tool_handoff/, 'Product handoff instrumentation is missing');
assert.match(client, /sendBeacon/, 'Exit-safe telemetry delivery is missing');
assert.match(client, /keepalive/, 'Keepalive fallback for exit delivery is missing');

// The network payload is an explicit object. It may contain buckets but never
// a free-form text/content/value/referrer/user-agent field that could carry
// what somebody wrote.
const payloadBlock = client.match(/function payload\([\s\S]*?\n    }\n\n    function scheduleFlush/);
assert.ok(payloadBlock, 'Could not locate the telemetry payload contract');
for (const forbidden of ['text:', 'content:', 'value:', 'filename:', 'referrer:', 'user_agent:', 'userAgent:', 'email:']) {
  assert.ok(!payloadBlock[0].includes(forbidden), `Telemetry payload must not include ${forbidden}`);
}

assert.match(endpoint, /env\.METRICS_DB/, 'Telemetry endpoint must use the existing METRICS_DB D1 binding');
assert.match(endpoint, /maximum 10|incoming\.length > 10|invalid_event_batch/, 'Telemetry endpoint needs a small event-batch limit');
assert.match(endpoint, /payload_too_large/, 'Telemetry endpoint needs a request-size guard');
assert.match(endpoint, /INSERT OR IGNORE INTO product_events/, 'Telemetry writes must be deduplicated by event id');
assert.match(endpoint, /EVENT_NAMES = new Set/, 'Telemetry endpoint must use an event allowlist');
assert.match(endpoint, /LENGTH_BUCKETS = new Set/, 'Telemetry endpoint must validate length buckets');
assert.match(endpoint, /ACTIVE_BUCKETS = new Set/, 'Telemetry endpoint must validate active-time buckets');
assert.match(endpoint, /originAllowed/, 'Telemetry endpoint must restrict browser origins');
assert.doesNotMatch(endpoint, /request\.headers\.get\(['"]user-agent|cf-connecting-ip|referer/i, 'Endpoint must not persist request identity/referrer metadata');

assert.match(migration, /CREATE TABLE IF NOT EXISTS product_events/, 'Additive product_events schema is missing');
assert.match(migration, /event_id TEXT NOT NULL UNIQUE/, 'Event deduplication key is missing from D1 schema');
assert.match(migration, /length_bucket TEXT/, 'Length bucket column is missing');
assert.match(migration, /active_time_bucket TEXT/, 'Active-time bucket column is missing');
for (const forbiddenColumn of ['editor_text', 'content TEXT', 'filename TEXT', 'email TEXT', 'ip_address', 'user_agent', 'referrer']) {
  assert.ok(!migration.toLowerCase().includes(forbiddenColumn.toLowerCase()), `D1 schema must not contain ${forbiddenColumn}`);
}

assert.match(privacy, /Product usage telemetry/, 'Privacy processing table must disclose first-party product telemetry');
assert.match(privacy, /never the Urdu or Roman Urdu text you write|does not transmit the Urdu or Roman Urdu text you write/, 'Privacy page must explicitly say writing content is not collected');
assert.match(privacy, /session storage|session identifier/i, 'Privacy page must explain the ephemeral telemetry session identifier');

console.log('Privacy-safe product telemetry contract passed.');
