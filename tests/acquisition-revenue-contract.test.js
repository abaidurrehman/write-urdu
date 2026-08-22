const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const acquisitionClient = fs.readFileSync(path.join(root, 'js', 'acquisition-telemetry.js'), 'utf8');
const acquisitionEndpoint = fs.readFileSync(path.join(root, 'functions', 'api', 'acquisition.js'), 'utf8');
const acquisitionPulse = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'acquisition-pulse.js'), 'utf8');
const acquisitionDashboard = fs.readFileSync(path.join(root, 'js', 'acquisition-pulse.js'), 'utf8');
const dashboardHtml = fs.readFileSync(path.join(root, 'os', 'product-pulse.html'), 'utf8');
const adsSource = fs.readFileSync(path.join(root, 'js', 'ads.js'), 'utf8');
const privacy = fs.readFileSync(path.join(root, 'write-urdu-privacy.html'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'migrations', '0003_acquisition_telemetry.sql'), 'utf8');
const localeMigration = fs.readFileSync(path.join(root, 'migrations', '0008_locale_metrics.sql'), 'utf8');
const analyticsSpec = fs.readFileSync(path.join(root, 'specs', 'WU-ANALYTICS-003-acquisition-and-returning-signal.md'), 'utf8');
const revenuePlan = fs.readFileSync(path.join(root, 'docs', 'WU-ADSENSE-REVENUE-GROWTH-PLAN-2026-08-17.md'), 'utf8');

assert.match(acquisitionClient, /document\.referrer/, 'Acquisition classifier must inspect the browser referrer locally');
assert.match(acquisitionClient, /google_search/, 'Google Search acquisition bucket is missing');
assert.match(acquisitionClient, /direct_unknown/, 'Direct/unknown acquisition bucket is missing');
assert.match(acquisitionClient, /campaign/, 'Campaign acquisition bucket is missing');
assert.doesNotMatch(acquisitionClient, /localStorage|sessionStorage/, 'Acquisition measurement must not add persistent/session analytics storage');
const payloadBlock = acquisitionClient.match(/JSON\.stringify\(\{[\s\S]*?\}\);/);
assert.ok(payloadBlock, 'Could not locate acquisition payload');
assert.doesNotMatch(payloadBlock[0], /referrer|utm_|gclid|search_term|query_string/i, 'Network payload must contain only coarse acquisition fields');
assert.match(payloadBlock[0], /locale:\s*currentLocale\(\)/, 'Acquisition payload must include bounded locale context');

assert.match(acquisitionEndpoint, /ACQUISITION_CHANNELS = new Set/, 'Acquisition endpoint needs a strict channel allowlist');
assert.match(acquisitionEndpoint, /site_hourly_acquisition/, 'Acquisition endpoint must write hourly rollups');
assert.match(acquisitionEndpoint, /site_hourly_entry_routes/, 'Acquisition endpoint must write bounded entry-route rollups');
assert.match(acquisitionEndpoint, /LOCALES = new Set\(\['en', 'ur'\]\)/, 'Acquisition endpoint must bound locale to en/ur');
assert.match(acquisitionEndpoint, /site_hourly_locale_entry_routes/, 'Acquisition endpoint must write locale-aware entry rollups in the existing database');
assert.doesNotMatch(acquisitionEndpoint, /request\.headers\.get\(['"]referer|cf-connecting-ip|user-agent/i, 'Acquisition endpoint must not persist request identity/referrer metadata');
assert.match(acquisitionEndpoint, /www\.write-urdu\.com/, 'Acquisition endpoint must accept the legacy www host during canonical migration');
assert.match(acquisitionEndpoint, /host === 'write-urdu\.com'/, 'Acquisition endpoint must accept the canonical apex host');

assert.match(migration, /PRIMARY KEY \(bucket_hour, acquisition_channel, page_type\)/, 'Acquisition rollups need bounded primary keys');
assert.doesNotMatch(migration, /\b(referrer|user_agent|ip_address|query_string)\s+(TEXT|INTEGER|BLOB|REAL)\b/i, 'Acquisition schema must not store identifying/free-form traffic columns');
assert.match(localeMigration, /PRIMARY KEY \(bucket_hour, locale, acquisition_channel, page_type, route\)/, 'Locale acquisition routes need bounded cardinality');
assert.doesNotMatch(localeMigration, /\b(referrer|user_agent|ip_address|query_string|editor_text|transcript|filename)\s+(TEXT|INTEGER|BLOB|REAL)\b/i, 'Locale measurement schema must stay content-free');

assert.match(acquisitionPulse, /PRODUCT_OS_HOST\s*\|\|\s*'os\.write-urdu\.com'/, 'Acquisition Pulse API must stay on the protected OS host');
assert.match(acquisitionPulse, /page_type IN \('write', 'create'\)/, 'Product entry source must be separable from site-wide entry traffic');
assert.match(acquisitionPulse, /locale_entries/, 'Acquisition Pulse must expose locale entry totals');
assert.match(acquisitionDashboard, /Direct \/ saved \/ unknown/, 'Dashboard must label direct traffic conservatively');
assert.match(dashboardHtml, /id="productEntryBars"/, 'Product Pulse needs a product-entry source panel');
assert.match(dashboardHtml, /id="entryRouteBars"/, 'Product Pulse needs a top-entry-routes panel');
assert.match(dashboardHtml, /id="localeEntryBars"/, 'Product Pulse needs a locale-entry panel');
assert.match(dashboardHtml, /js\/acquisition-pulse\.js/, 'Product Pulse must load acquisition rollup rendering');

assert.match(adsSource, /acquisition-telemetry\.js/, 'Public monetized surfaces must load coarse acquisition measurement');
assert.match(adsSource, /google-anno-skip/, 'Ad intents need protected product surfaces');
assert.match(adsSource, /google-side-rail-overlap/, 'Side rail experiments need workspace overlap protection');
assert.match(adsSource, /data-google-vignette/, 'Vignette experiments need protected workflow links');

assert.match(privacy, /coarse arrival|arrival signal|arrival classification/i, 'Privacy page must disclose coarse acquisition classification');
assert.match(privacy, /full referrer URL/i, 'Privacy page must state that full referrer URLs are not sent');
assert.match(analyticsSpec, /not bookmark detection/i, 'Analytics spec must not overclaim direct traffic as bookmark detection');
assert.match(analyticsSpec, /consent-compatible/i, 'Returning-browser persistence must stay consent-gated');
assert.match(revenuePlan, /side rail/i, 'Revenue plan must include side rail testing');
assert.match(revenuePlan, /Multiplex/i, 'Revenue plan must include content-end Multiplex testing');
assert.match(revenuePlan, /Ad intents/i, 'Revenue plan must include controlled Ad intents testing');
assert.match(revenuePlan, /vignette/i, 'Revenue plan must include controlled vignette testing');

console.log('Acquisition measurement and AdSense revenue-growth contracts passed.');
