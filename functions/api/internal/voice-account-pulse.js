import { ensureVoiceAccountMetrics } from '../../lib/voice-account-metrics.mjs';

const ALLOWED_DAYS = new Set([1, 7, 30]);
const HOUR_MS = 60 * 60 * 1000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function allowedHost(request, env) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  const configured = String(env.PRODUCT_OS_HOST || 'os.write-urdu.com').toLowerCase();
  return hostname === configured || hostname === 'localhost' || hostname === '127.0.0.1';
}

function hourIso(date) {
  return date.toISOString().slice(0, 13) + ':00:00Z';
}

function windowBounds(days) {
  const currentHour = new Date();
  currentHour.setUTCMinutes(0, 0, 0);
  const end = new Date(currentHour.getTime() + HOUR_MS);
  const start = new Date(end.getTime() - days * 24 * HOUR_MS);
  const previousStart = new Date(start.getTime() - days * 24 * HOUR_MS);
  return {
    currentStart: hourIso(start),
    currentEnd: hourIso(end),
    previousStart: hourIso(previousStart),
    previousEnd: hourIso(start)
  };
}

function n(row, key) {
  return Number(row && row[key] || 0);
}

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

async function summaryForWindow(db, start, end) {
  return (await db.prepare(`
    SELECT
      SUM(voice_page_sessions) AS voice_page_sessions,
      SUM(voice_try_sessions) AS voice_try_sessions,
      SUM(voice_success_sessions) AS voice_success_sessions,
      SUM(account_signups) AS account_signups,
      SUM(voice_assisted_signups) AS voice_assisted_signups,
      MAX(latest_event_at) AS latest_event_at
    FROM voice_account_hourly_metrics
    WHERE bucket_hour >= ?1 AND bucket_hour < ?2
  `).bind(start, end).first()) || {};
}

async function totalAccounts(db) {
  const table = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'").first();
  if (!table || table.name !== 'users') return 0;
  const result = await db.prepare('SELECT COUNT(*) AS total FROM users').first();
  return n(result, 'total');
}

function shape(row) {
  const tries = n(row, 'voice_try_sessions');
  const successes = n(row, 'voice_success_sessions');
  const voiceSignups = n(row, 'voice_assisted_signups');
  return {
    voice_page_sessions: n(row, 'voice_page_sessions'),
    voice_try_sessions: tries,
    voice_success_sessions: successes,
    voice_success_rate: ratio(successes, tries),
    account_signups: n(row, 'account_signups'),
    voice_assisted_signups: voiceSignups,
    voice_signup_rate: ratio(voiceSignups, tries),
    latest_event_at: row && row.latest_event_at || null
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!allowedHost(request, env)) return json({ error: 'not_found' }, 404);
  if (!env.METRICS_DB) return json({ error: 'metrics_db_unavailable' }, 503);

  const requestedDays = Number(new URL(request.url).searchParams.get('days') || 7);
  const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 7;
  const bounds = windowBounds(days);

  try {
    await ensureVoiceAccountMetrics(env.METRICS_DB);
    const [current, previous, total] = await Promise.all([
      summaryForWindow(env.METRICS_DB, bounds.currentStart, bounds.currentEnd),
      summaryForWindow(env.METRICS_DB, bounds.previousStart, bounds.previousEnd),
      totalAccounts(env.METRICS_DB)
    ]);

    return json({
      ready: true,
      storage: 'hourly_aggregate_only',
      days,
      generated_at: new Date().toISOString(),
      total_accounts: total,
      current: shape(current),
      previous: shape(previous)
    });
  } catch {
    return json({ error: 'metrics_unavailable' }, 503);
  }
}
