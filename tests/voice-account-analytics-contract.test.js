const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('voice page records anonymous funnel signals without sending voice content', () => {
  const html = read('tools/urdu-voice-typing.html');
  const client = read('js/voice-account-analytics.js');

  assert.match(html, /\/js\/voice-account-analytics\.js/);
  assert.match(client, /voice_page_viewed/);
  assert.match(client, /voice_typing_started/);
  assert.match(client, /voice_transcript_received/);
  assert.match(client, /write-urdu:telemetry-session:v1/);
  assert.match(client, /event\.isTrusted/);
  assert.match(client, /wu_voice_tried/);
  assert.match(client, /Max-Age=86400/);
  assert.match(client, /SameSite=Lax/);
  assert.doesNotMatch(client, /(?:text|transcript|audio|email|user_id|account_id)\s*:/i);
});

test('voice event endpoint persists aggregate counters only', () => {
  const endpoint = read('functions/api/voice-account-events.js');
  const metrics = read('functions/lib/voice-account-metrics.mjs');
  const migration = read('migrations/0007_voice_account_metrics.sql');

  assert.match(endpoint, /new Set\(\['event_id', 'session_id', 'event_name'\]\)/);
  assert.match(endpoint, /Only anonymous hourly counters are persisted/);
  assert.match(metrics, /voice_account_hourly_metrics/);
  assert.match(metrics, /voice_page_sessions/);
  assert.match(metrics, /voice_try_sessions/);
  assert.match(metrics, /voice_success_sessions/);
  assert.match(migration, /aggregate-only by hour/i);
  assert.doesNotMatch(metrics, /\bsession_id\b|\bemail\b|\baccount_id\b/i);
});

test('new account creation is counted server-side and voice assistance uses only the short-lived marker', () => {
  const auth = read('functions/lib/auth.mjs');

  assert.match(auth, /incrementVoiceAccountMetrics/);
  assert.match(auth, /events:\s*\{/);
  assert.match(auth, /async createUser\(\)/);
  assert.match(auth, /accountSignups:\s*1/);
  assert.match(auth, /voiceAssistedSignups/);
  assert.match(auth, /wu_voice_tried/);
  assert.doesNotMatch(auth, /createUser\([^)]*user/i);
});

test('Product Pulse exposes Voice & Accounts for the shared reporting windows', () => {
  const html = read('os/product-pulse.html');
  const dashboard = read('js/voice-account-pulse.js');
  const endpoint = read('functions/api/internal/voice-account-pulse.js');

  assert.match(html, />Voice &amp; Accounts</);
  assert.match(html, /data-voice-kpi="voice_page_sessions"/);
  assert.match(html, /data-voice-kpi="voice_try_sessions"/);
  assert.match(html, /data-voice-kpi="voice_success_sessions"/);
  assert.match(html, /data-voice-kpi="account_signups"/);
  assert.match(html, /data-voice-kpi="voice_assisted_signups"/);
  assert.match(html, /\/js\/voice-account-pulse\.js/);
  assert.match(dashboard, /\/api\/internal\/voice-account-pulse\?days=/);
  assert.match(endpoint, /new Set\(\[1, 7, 30\]\)/);
  assert.match(endpoint, /SELECT COUNT\(\*\) AS total FROM users/);
});
