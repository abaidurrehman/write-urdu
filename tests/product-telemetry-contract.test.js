const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const client = fs.readFileSync(path.join(root, 'js', 'product-telemetry.js'), 'utf8');
const integrations = fs.readFileSync(path.join(root, 'js', 'product-telemetry-integrations.js'), 'utf8');
const endpoint = fs.readFileSync(path.join(root, 'functions', 'api', 'events.js'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'migrations', '0001_product_telemetry.sql'), 'utf8');
const rollupMigration = fs.readFileSync(path.join(root, 'migrations', '0002_product_telemetry_rollups.sql'), 'utf8');
const localeMigration = fs.readFileSync(path.join(root, 'migrations', '0008_locale_metrics.sql'), 'utf8');
const writeMonetization = fs.readFileSync(path.join(root, 'js', 'write-monetization.js'), 'utf8');
const v2Shell = fs.readFileSync(path.join(root, 'js', 'v2-shell.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');

assert.match(writeMonetization, /js\/product-telemetry\.js/, 'Core Write runtime must load the first-party telemetry client');
assert.match(writeMonetization, /CORE_ROUTES\s*=\s*\['\/', '\/urdu-editor', '\/urdu-keyboard'\]/, 'Core telemetry must cover all three writing routes');
assert.match(v2Shell, /telemetryRoutes/, 'Shared product shell must define the bounded creation-tool telemetry allowlist');
for (const route of ['/urdu-card-studio', '/stylish-urdu-text-generator', '/urdu-name-art-maker', '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker', '/urdu-invoice-generator', '/qr-code-generator']) {
  assert.ok(v2Shell.includes(`'${route}'`), `${route} must be included in creation-tool telemetry`);
}
assert.match(v2Shell, /product-telemetry-integrations\.js/, 'Creation-tool outcome integration loader is missing');

assert.match(client, /sessionStorage/, 'Telemetry identity must be session-scoped rather than persistent local storage');
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*telemetry/i, 'Telemetry must not create a persistent cross-session identifier');
assert.match(client, /lengthBucket/, 'Client must reduce writing length to buckets');
assert.match(client, /activeTimeBucket/, 'Client must reduce active usage time to buckets');
assert.match(client, /editor_engaged/, 'Editor engagement event is missing');
assert.match(client, /tool_engaged/, 'Creation-tool engagement event is missing');
assert.match(client, /canvas_interaction/, 'Canvas interaction signal is missing');
assert.match(client, /template_used/, 'Template-use signal is missing');
assert.match(client, /background_image_used/, 'Local-background signal is missing');
assert.match(client, /session_summary/, 'Session summary event is missing');
assert.match(client, /locale:\s*locale/, 'Telemetry payload must include bounded locale context');
assert.match(client, /copy_completed/, 'Copy outcome instrumentation is missing');
assert.match(client, /export_completed/, 'Export outcome instrumentation is missing');
assert.match(client, /batch_transliteration/, 'Batch transliteration instrumentation is missing');
assert.match(client, /tool_handoff/, 'Product handoff instrumentation is missing');
assert.match(client, /summarySent \|\| !engaged/, 'Unengaged page views must not create empty session-summary events');
assert.doesNotMatch(client, /track\('input_mode_changed'/, 'Input-mode toggles should stay local and be summarized once per engaged visit');
assert.match(client, /sendBeacon/, 'Exit-safe telemetry delivery is missing');
assert.match(client, /keepalive/, 'Keepalive fallback for exit delivery is missing');

// The network payload is an explicit object. It may contain buckets but never
// a free-form text/content/value/referrer/user-agent field that could carry
// what somebody wrote.
const payloadBlock = client.match(/function payload\([\s\S]*?\r?\n    }\r?\n\r?\n    function scheduleFlush/);
assert.ok(payloadBlock, 'Could not locate the telemetry payload contract');
for (const forbidden of ['text:', 'content:', 'value:', 'filename:', 'referrer:', 'user_agent:', 'userAgent:', 'email:']) {
  assert.ok(!payloadBlock[0].includes(forbidden), `Telemetry payload must not include ${forbidden}`);
}

assert.match(endpoint, /env\.METRICS_DB/, 'Telemetry endpoint must use the existing METRICS_DB D1 binding');
assert.match(endpoint, /incoming\.length > 10|invalid_event_batch/, 'Telemetry endpoint needs a small event-batch limit');
assert.match(endpoint, /payload_too_large/, 'Telemetry endpoint needs a request-size guard');
assert.match(endpoint, /product_hourly_metrics/, 'Routine telemetry must write bounded hourly rollups');
assert.match(endpoint, /aggregateEvents/, 'Browser event batches must be consolidated before D1 writes');
assert.doesNotMatch(endpoint, /INSERT OR IGNORE INTO product_events/, 'Routine telemetry must not append one raw D1 row per browser event');
assert.match(endpoint, /DELETE FROM product_events[^\n]*-7 days/, 'Legacy raw telemetry must have seven-day cleanup');
for (const index of ['idx_product_events_event_name', 'idx_product_events_tool', 'idx_product_events_route', 'idx_product_events_session']) {
  assert.ok(endpoint.includes(`DROP INDEX IF EXISTS ${index}`), `${index} must be removed to avoid raw-write/index amplification`);
}
assert.match(endpoint, /tool_engaged/, 'Telemetry endpoint must accept creation-tool engagement');
assert.match(endpoint, /share_completed/, 'Telemetry endpoint must accept confirmed share outcomes');
assert.match(endpoint, /canvas_interaction/, 'Telemetry endpoint must accept canvas interaction');
assert.match(endpoint, /png_transparent/, 'Telemetry endpoint must support transparent Name Art PNGs');
assert.match(endpoint, /jpeg/, 'Telemetry endpoint must support JPEG social exports');
assert.match(endpoint, /svg/, 'Telemetry endpoint must support QR SVG exports');
assert.match(endpoint, /EVENT_NAMES = new Set/, 'Telemetry endpoint must use an event allowlist');
assert.match(endpoint, /LENGTH_BUCKETS = new Set/, 'Telemetry endpoint must validate length buckets');
assert.match(endpoint, /ACTIVE_BUCKETS = new Set/, 'Telemetry endpoint must validate active-time buckets');
assert.match(endpoint, /LOCALES = new Set\(\['en', 'ur'\]\)/, 'Telemetry endpoint must bound locale to en/ur');
assert.match(endpoint, /product_hourly_locale_metrics/, 'Telemetry endpoint must maintain locale rollups in the existing METRICS_DB');
assert.match(endpoint, /originAllowed/, 'Telemetry endpoint must restrict browser origins');
assert.match(endpoint, /www\.write-urdu\.com/, 'Telemetry endpoint must keep accepting the legacy www origin during canonical-host migration');
assert.match(endpoint, /host === 'write-urdu\.com'/, 'Telemetry endpoint must accept the canonical apex origin');
assert.doesNotMatch(endpoint, /request\.headers\.get\(['"]user-agent|cf-connecting-ip|referer/i, 'Endpoint must not persist request identity/referrer metadata');

assert.match(migration, /CREATE TABLE IF NOT EXISTS product_events/, 'Legacy diagnostic product_events schema is missing');
assert.match(migration, /event_id TEXT NOT NULL UNIQUE/, 'Legacy event deduplication key is missing from D1 schema');
assert.match(rollupMigration, /CREATE TABLE IF NOT EXISTS product_hourly_metrics/, 'Hourly rollup schema is missing');
assert.match(rollupMigration, /PRIMARY KEY \(bucket_hour, tool\)/, 'Hourly rollups must have bounded hour/tool cardinality');
assert.match(rollupMigration, /DROP INDEX IF EXISTS idx_product_events_session/, 'Rollup migration must remove raw session index amplification');
assert.match(localeMigration, /PRIMARY KEY \(bucket_hour, locale, tool\)/, 'Locale product rollups need bounded hour/locale/tool cardinality');
const sqlWithoutComments = (sql) => sql.replace(/^\s*--.*$/gm, '');
const rollupSchema = sqlWithoutComments(rollupMigration).toLowerCase();
const localeSchema = sqlWithoutComments(localeMigration).toLowerCase();
for (const forbiddenColumn of ['editor_text', 'content TEXT', 'filename TEXT', 'email TEXT', 'ip_address', 'user_agent', 'referrer']) {
  assert.ok(!rollupSchema.includes(forbiddenColumn.toLowerCase()), `D1 rollup schema must not contain ${forbiddenColumn}`);
  assert.ok(!localeSchema.includes(forbiddenColumn.toLowerCase()), `Locale D1 rollup schema must not contain ${forbiddenColumn}`);
}

assert.match(integrations, /\[data-card-status\]/, 'Card Studio/social export outcomes must be observed');
assert.match(integrations, /png_transparent/, 'Name Art transparent export telemetry is missing');
assert.match(integrations, /\[data-invoice-fit-status\]/, 'Invoice output telemetry is missing');
assert.match(integrations, /\[data-qr-status\]/, 'QR output telemetry is missing');
assert.match(integrations, /\[data-stylish-status\]/, 'Stylish Text output telemetry is missing');
assert.match(integrations, /clipboard_image/, 'QR image-copy completion must be distinguishable');

assert.match(privacy, /Product usage telemetry/, 'Privacy processing table must disclose first-party product telemetry');
assert.match(privacy, /never the Urdu or Roman Urdu text you write|does not transmit the Urdu or Roman Urdu text you write/, 'Privacy page must explicitly say writing content is not collected');
assert.match(privacy, /session storage|session identifier/i, 'Privacy page must explain the ephemeral telemetry session identifier');

console.log('Privacy-safe scalable product telemetry contract passed.');
