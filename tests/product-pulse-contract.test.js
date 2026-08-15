const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'os', 'product-pulse.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js', 'product-pulse.js'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'product-pulse.js'), 'utf8');
const telemetry = fs.readFileSync(path.join(root, 'js', 'product-telemetry.js'), 'utf8');

assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/, 'Product Pulse must remain out of public search');
assert.match(html, /Product Pulse/, 'Product Pulse heading is missing');
assert.match(html, /Product visits/, 'Product Pulse must use visit semantics after aggregation');
assert.match(html, /Engaged visits/, 'Engaged visit KPI is missing');
assert.match(html, /data-kpi="sessions"/, 'Visit KPI is missing');
assert.match(html, /data-kpi="engaged_sessions"/, 'Engaged KPI is missing');
for (const format of ['pdf', 'png', 'jpeg', 'doc', 'txt', 'svg']) {
  assert.ok(html.includes(`data-format="${format}"`), `${format} export KPI is missing`);
}
assert.match(html, /How much people write/, 'Writing-length panel is missing');
assert.match(html, /Active usage time/, 'Active-time panel is missing');
assert.match(html, /Tool usage/, 'Tool-usage table is missing');
assert.match(html, /Canvas/, 'Tool table must expose canvas interaction breadth');
assert.doesNotMatch(html, /adsbygoogle|googlesyndication|google-analytics|gtag\(/i, 'Founder dashboard must not load ads or public analytics');
assert.doesNotMatch(html, /seo\.config\.js|js\/seo\.js|site-header\.js/, 'Founder dashboard must stay outside the public SEO/product shell');

assert.match(api, /PRODUCT_OS_HOST\s*\|\|\s*'os\.write-urdu\.com'/, 'Product Pulse API must default to the protected OS host');
assert.match(api, /return json\(\{ error: 'not_found' \}, 404\)/, 'Non-OS hosts must not receive product telemetry');
assert.match(api, /env\.METRICS_DB/, 'Product Pulse must use the existing METRICS_DB binding');
assert.match(api, /product_hourly_metrics/, 'Product Pulse must read bounded hourly rollups');
assert.doesNotMatch(api, /FROM product_events/i, 'Product Pulse must not scan the raw event table');
assert.match(api, /ALLOWED_DAYS = new Set\(\[1, 7, 30\]\)/, 'Dashboard reporting windows must stay bounded');
assert.match(api, /SUM\(exports\)/, 'Dashboard must report successful exports from rollups');
assert.match(api, /SUM\(engaged_visits\)/, 'Dashboard must report engaged visits from rollups');
assert.match(api, /length_1_20/, 'Dashboard must use coarse text-length rollups');
assert.match(api, /active_0_10/, 'Dashboard must use coarse active-time rollups');
assert.match(api, /canvas_interactions/, 'Dashboard must report canvas interaction breadth');
assert.match(api, /template_uses/, 'Dashboard must report template usage');
assert.match(api, /background_image_uses/, 'Dashboard must report local image usage');
assert.doesNotMatch(api, /editor_text|roman_urdu_text|urdu_text|filename|clipboard_content|user_agent|referrer/i, 'Aggregate API must not introduce content or identity fields');

assert.match(client, /\/api\/internal\/product-pulse\?days=/, 'Dashboard client must use the internal aggregate API');
assert.match(client, /exports_by_format/, 'Dashboard client must render export format counts');
assert.match(client, /length_distribution/, 'Dashboard client must render writing-length distribution');
assert.match(client, /active_time_distribution/, 'Dashboard client must render active-time distribution');
assert.match(client, /input_modes/, 'Dashboard client must render input mode usage');
assert.match(client, /devices/, 'Dashboard client must render device usage');
assert.match(client, /handoffs/, 'Dashboard client must render product handoffs');
assert.match(client, /Canvas edit/, 'Dashboard client must render canvas interactions');
assert.match(client, /Template use/, 'Dashboard client must render template usage');
assert.match(client, /Local image/, 'Dashboard client must render local image usage');

// Product Pulse itself must not load the public telemetry collector and create
// founder/admin visits in product metrics.
assert.doesNotMatch(html, /product-telemetry\.js/, 'Product Pulse must not measure its own founder usage');
assert.match(telemetry, /var ENDPOINT = '\/api\/events'/, 'Public telemetry collector contract unexpectedly changed');

console.log('Rollup-backed Product Pulse dashboard contracts passed.');
