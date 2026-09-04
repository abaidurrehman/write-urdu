const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'os', 'product-pulse.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'js', 'product-pulse.js'), 'utf8');
const api = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'product-pulse.js'), 'utf8');
const telemetry = fs.readFileSync(path.join(root, 'js', 'product-telemetry.js'), 'utf8');
const events = fs.readFileSync(path.join(root, 'functions', 'api', 'events.js'), 'utf8');

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
assert.match(html, /Product usage by language/, 'Locale usage panel is missing');
assert.match(html, /id="localeUsageBars"/, 'Locale usage bars are missing');
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
assert.match(api, /product_hourly_locale_metrics/, 'Dashboard API must expose bounded locale rollups');
assert.match(api, /locale_breakdown/, 'Dashboard API must return locale breakdown');
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
assert.match(client, /localeUsageBars/, 'Dashboard client must render locale usage');

// WU-VOICE-PLAT-001D §7: extend the existing Product Pulse reporting with a
// cross-workspace Voice adoption/completion section (not a separate voice
// dashboard), sourced from the existing per-tool product_hourly_metrics
// counters (migrations 0009/0010) — no session-level or Search Console join.
assert.match(api, /function voiceSection\(/, 'Product Pulse API must build a cross-workspace voice section');
assert.match(api, /voice_switch_continued/, 'Voice section must expose the correction/continuation switch proxy');
assert.match(api, /voice_error_permission_denied/, 'Voice section must expose bounded voice failure categories');
assert.match(api, /by_workspace/, 'Voice section must break adoption down by workspace');
assert.match(api, /voice_led_share_of_concluded_sessions/, 'Voice section must compare voice-led sessions at the aggregate level only, never a per-session join');
assert.doesNotMatch(api, /searchconsole|search_console/i, 'Product Pulse must never join Search Console query data to product sessions');
assert.match(html, /id="voiceCrossWorkspacePanel"/, 'Dashboard must expose a cross-workspace Voice panel');
assert.match(html, /Voice adoption across workspaces/, 'Cross-workspace Voice panel must be labelled distinctly from the Voice Typing signup funnel panel');
assert.match(client, /function renderVoiceCrossWorkspace\(/, 'Dashboard client must render the cross-workspace Voice section');

// WU-PLAT-002H Gate A: extend the existing Product Pulse reporting with the
// H1 first-value funnel (visit -> focus -> first input -> first Urdu success
// -> outcome) so the zero-character session population can be explained more
// precisely than "abandoned" — sourced from the existing per-tool
// product_hourly_metrics counters (migration 0015), no session-level join.
assert.match(telemetry, /writer_viewed/, 'Telemetry collector must emit the writer_viewed first-value event');
assert.match(telemetry, /writer_focused/, 'Telemetry collector must emit the writer_focused first-value event');
assert.match(telemetry, /writer_first_input/, 'Telemetry collector must emit the writer_first_input first-value event');
assert.match(telemetry, /writer_first_urdu_success/, 'Telemetry collector must emit the writer_first_urdu_success first-value event');
assert.match(telemetry, /writer_depth_/, 'Telemetry collector must emit writer depth checkpoints');
assert.match(telemetry, /writer_outcome_first/, 'Telemetry collector must emit the writer_outcome_first first-value event');
assert.match(api, /function activationSection\(/, 'Product Pulse API must build a first-value funnel section');
assert.match(api, /session_classification/, 'First-value section must classify sessions instead of labelling all zero-char sessions abandoned');
assert.match(api, /visible_not_focused/, 'First-value section must expose the visible-but-unfocused session state');
assert.doesNotMatch(api, /editor_text|roman_urdu_text|urdu_text|filename|clipboard_content|user_agent|referrer/i, 'First-value funnel must not introduce content or identity fields');
assert.match(html, /id="activationFunnelPanel"/, 'Dashboard must expose a first-value funnel panel');
assert.match(html, /First value/, 'First-value panel must be labelled distinctly from other panels');
assert.match(client, /function renderActivation\(/, 'Dashboard client must render the first-value funnel section');

// WU-PLAT-002H Gate B2 M1: the base writer funnel (product_hourly_metrics)
// cannot answer the mobile-only primary metric because writer_viewed and
// device_mobile are independent counters on the same row, not cross-tabbed.
// A dedicated product_hourly_device_metrics rollup (device_class dimension,
// mirroring the existing locale rollup) closes that gap.
assert.match(api, /function deviceActivationSection\(/, 'Product Pulse API must build a mobile-specific first-value funnel section');
assert.match(api, /product_hourly_device_metrics/, 'Mobile activation section must read the device-class rollup');
assert.match(api, /mobile_writer_first_input_rate/, 'Mobile activation section must expose the Gate B2 9.2 primary metric');
assert.doesNotMatch(api, /FROM product_hourly_device_metrics[\s\S]{0,400}editor_text|roman_urdu_text|urdu_text|filename|clipboard_content/i, 'Device funnel query must not introduce content or identity fields');

// WU-PLAT-002H Gate A completion: Card Studio completion funnel, continuation
// funnel, share-referral trace for all three CTA destinations, and misleading
// rate-label fixes (event counts that can exceed starts must not render as a
// bounded percent).
for (const name of [
  'card_studio_export_step_reached', 'card_studio_export_attempted',
  'continuation_shown', 'continuation_stored', 'continuation_destination_ready', 'continuation_payload_restored',
  'continuation_destination_meaningful_start',
  'share_destination_ready', 'share_referral_recognized'
]) {
  assert.ok(events.includes(`'${name}'`), `EVENT_NAMES must include ${name}`);
}
assert.match(events, /card_studio_export_quick/, 'Card Studio export metric columns must split by quick/advanced mode');
assert.match(events, /destination_ready/, 'Share metric columns must include destination_ready');
assert.match(events, /referral_recognized/, 'Share metric columns must include referral_recognized');

assert.match(api, /function cardStudioSection\(/, 'Product Pulse API must build a Card Studio completion funnel section');
assert.match(api, /function continuationSection\(/, 'Product Pulse API must build a continuation funnel section');
assert.match(api, /card_studio_export_step_reached/, 'Card Studio section must expose the export-step-reached stage');
assert.match(api, /continuation_payload_restored/, 'Continuation section must expose the payload-restored stage');
assert.match(api, /continuation_destination_meaningful_start/, 'Continuation section must expose the destination-meaningful-start stage');
assert.doesNotMatch(api, /editor_text|roman_urdu_text|urdu_text|filename|clipboard_content|user_agent|referrer/i, 'Gate A completion sections must not introduce content or identity fields');

assert.match(html, /id="cardStudioFunnelPanel"/, 'Dashboard must expose a Card Studio completion funnel panel');
assert.match(html, /id="continuationFunnelPanel"/, 'Dashboard must expose a continuation funnel panel');
assert.match(client, /function renderCardStudioFunnel\(/, 'Dashboard client must render the Card Studio completion funnel');
assert.match(client, /function renderContinuationFunnel\(/, 'Dashboard client must render the continuation funnel');
assert.match(client, /meaningful_start_rate/, 'Continuation funnel client must render the meaningful-start stage');

// A "rate" built from an uncapped, repeatable-per-session numerator over a
// ~1-per-session denominator must not be displayed as a bounded percent.
assert.doesNotMatch(client, /cta\.textContent = percent/, 'CTA clicks-per-view is not a bounded rate and must not render as percent');
assert.doesNotMatch(client, /republish\.textContent = percent/, 'Referred-publish ratio must not render as a bounded percent');
assert.doesNotMatch(client, /final_rate\.textContent = percent/, 'Voice final-results-per-start must not render as a bounded percent');
assert.doesNotMatch(client, /percent\(item\.adoption_rate\)/, 'Voice tries-per-visit must not render as a bounded percent');
assert.match(html, /Final results per start/, 'Voice final rate must use the metrics-contract wording, not "rate"');
assert.match(html, /CTA clicks per view/, 'Share CTA metric must be labelled as a per-view ratio, not a rate');

assert.match(telemetry, /share_referred_creation_started/, 'Telemetry collector must reuse share_referred_creation_started for Basic Writer/QR referrals');
assert.match(telemetry, /continuation_shown/, 'Telemetry collector must emit continuation_shown');
const shareTransfers = fs.readFileSync(path.join(root, 'js', 'share-page.js'), 'utf8');
assert.doesNotMatch(shareTransfers, /transfer\('basic-writer', 'share-to-basic', publicText\(\), null\)/, 'Basic Writer CTA must preserve referral context, not drop it');
assert.doesNotMatch(shareTransfers, /transfer\('qr-generator', 'share-to-qr', publicUrl\(\), null\)/, 'QR generator CTA must preserve referral context, not drop it');

// Product Pulse itself must not load the public telemetry collector and create
// founder/admin visits in product metrics.
assert.doesNotMatch(html, /product-telemetry\.js/, 'Product Pulse must not measure its own founder usage');
assert.match(telemetry, /var ENDPOINT = '\/api\/events'/, 'Public telemetry collector contract unexpectedly changed');

console.log('Rollup-backed Product Pulse dashboard contracts passed.');
