const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'product-pulse.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js', 'product-pulse.js'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'product-pulse.js'), 'utf8');
const telemetry = fs.readFileSync(path.join(root, 'js', 'product-telemetry.js'), 'utf8');

assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/, 'Product Pulse must remain out of public search');
assert.match(html, /Product Pulse/, 'Product Pulse heading is missing');
assert.match(html, /data-kpi="sessions"/, 'Session KPI is missing');
assert.match(html, /data-kpi="engaged_sessions"/, 'Engaged writers KPI is missing');
assert.match(html, /data-format="pdf"/, 'PDF export KPI is missing');
assert.match(html, /data-format="png"/, 'PNG export KPI is missing');
assert.match(html, /How much people write/, 'Writing-length panel is missing');
assert.match(html, /Active writing time/, 'Active-time panel is missing');
assert.match(html, /Tool usage/, 'Tool-usage table is missing');
assert.doesNotMatch(html, /adsbygoogle|googlesyndication|google-analytics|gtag\(/i, 'Founder dashboard must not load ads or public analytics');
assert.doesNotMatch(html, /seo\.config\.js|js\/seo\.js|site-header\.js/, 'Founder dashboard must stay outside the public SEO/product shell');

assert.match(api, /PRODUCT_OS_HOST\s*\|\|\s*'os\.write-urdu\.com'/, 'Product Pulse API must default to the protected OS host');
assert.match(api, /return json\(\{ error: 'not_found' \}, 404\)/, 'Non-OS hosts must not receive product telemetry');
assert.match(api, /env\.METRICS_DB/, 'Product Pulse must use the existing METRICS_DB binding');
assert.match(api, /product_events/, 'Product Pulse must query the privacy-safe product_events table');
assert.match(api, /ALLOWED_DAYS = new Set\(\[1, 7, 30\]\)/, 'Dashboard reporting windows must stay bounded');
assert.match(api, /event_name = 'export_completed'/, 'Dashboard must report successful exports');
assert.match(api, /event_name = 'editor_engaged'/, 'Dashboard must report engaged writing sessions');
assert.match(api, /length_bucket/, 'Dashboard must use coarse text-length buckets');
assert.match(api, /active_time_bucket/, 'Dashboard must use coarse active-time buckets');
assert.doesNotMatch(api, /editor_text|roman_urdu_text|urdu_text|filename|clipboard_content|user_agent|referrer/i, 'Aggregate API must not introduce content or identity fields');

assert.match(client, /\/api\/internal\/product-pulse\?days=/, 'Dashboard client must use the internal aggregate API');
assert.match(client, /exports_by_format/, 'Dashboard client must render export format counts');
assert.match(client, /length_distribution/, 'Dashboard client must render writing-length distribution');
assert.match(client, /active_time_distribution/, 'Dashboard client must render active-time distribution');
assert.match(client, /input_modes/, 'Dashboard client must render input mode usage');
assert.match(client, /devices/, 'Dashboard client must render device usage');
assert.match(client, /handoffs/, 'Dashboard client must render product handoffs');

// Product Pulse itself must not load the public telemetry collector and create
// founder/admin sessions in product metrics.
assert.doesNotMatch(html, /product-telemetry\.js/, 'Product Pulse must not measure its own founder usage');
assert.match(telemetry, /var ENDPOINT = '\/api\/events'/, 'Public telemetry collector contract unexpectedly changed');

console.log('Product Pulse dashboard contracts passed.');
