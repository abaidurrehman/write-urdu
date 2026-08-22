const ACQUISITION_CHANNELS = new Set([
  'google_search', 'other_search', 'direct_unknown', 'referral', 'campaign', 'internal'
]);
const PAGE_TYPES = new Set(['write', 'learn', 'create', 'trust', 'unclassified']);
const LOCALES = new Set(['en', 'ur']);

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS site_hourly_acquisition (
    bucket_hour TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    visits INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, acquisition_channel, page_type)
  )`,
  `CREATE TABLE IF NOT EXISTS site_hourly_entry_routes (
    bucket_hour TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    route TEXT NOT NULL,
    entries INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, acquisition_channel, page_type, route)
  )`,
  `CREATE TABLE IF NOT EXISTS site_hourly_locale_acquisition (
    bucket_hour TEXT NOT NULL,
    locale TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    visits INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, locale, acquisition_channel, page_type)
  )`,
  `CREATE TABLE IF NOT EXISTS site_hourly_locale_entry_routes (
    bucket_hour TEXT NOT NULL,
    locale TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    route TEXT NOT NULL,
    entries INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, locale, acquisition_channel, page_type, route)
  )`
];

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function cleanRoute(value) {
  const route = String(value || '').trim().split('?')[0].split('#')[0];
  if (!/^\/[a-z0-9\/-]*$/i.test(route) || route.length > 120) return null;
  return route.replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
}

function enumValue(value, allowed) {
  const normalized = String(value || '');
  return allowed.has(normalized) ? normalized : null;
}

function originAllowed(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === 'www.write-urdu.com' || host === 'write-urdu.com' || host.endsWith('.pages.dev') || host === 'localhost';
  } catch (error) {
    return false;
  }
}

function hourBucket(date) {
  return date.toISOString().slice(0, 13) + ':00:00Z';
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!originAllowed(request)) return json(403, { error: 'origin_not_allowed' });
  if (!env.METRICS_DB) return json(503, { error: 'metrics_db_unavailable' });

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) return json(413, { error: 'payload_too_large' });

  let input;
  try {
    input = await request.json();
  } catch (error) {
    return json(400, { error: 'invalid_json' });
  }

  const route = cleanRoute(input && input.route);
  const pageType = enumValue(input && input.page_type, PAGE_TYPES);
  const channel = enumValue(input && input.acquisition_channel, ACQUISITION_CHANNELS);
  const locale = enumValue((input && input.locale) || 'en', LOCALES);
  if (!route || !pageType || !channel || !locale) return json(400, { error: 'invalid_acquisition_event' });

  const now = new Date();
  const bucket = hourBucket(now);
  const latest = now.toISOString();
  const db = env.METRICS_DB;

  try {
    await db.batch(SCHEMA_STATEMENTS.map((sql) => db.prepare(sql)));
    const writes = [
      db.prepare(`INSERT INTO site_hourly_acquisition
        (bucket_hour, acquisition_channel, page_type, visits, latest_event_at)
        VALUES (?1, ?2, ?3, 1, ?4)
        ON CONFLICT(bucket_hour, acquisition_channel, page_type)
        DO UPDATE SET visits = visits + 1, latest_event_at = excluded.latest_event_at`)
        .bind(bucket, channel, pageType, latest),
      db.prepare(`INSERT INTO site_hourly_locale_acquisition
        (bucket_hour, locale, acquisition_channel, page_type, visits, latest_event_at)
        VALUES (?1, ?2, ?3, ?4, 1, ?5)
        ON CONFLICT(bucket_hour, locale, acquisition_channel, page_type)
        DO UPDATE SET visits = visits + 1, latest_event_at = excluded.latest_event_at`)
        .bind(bucket, locale, channel, pageType, latest)
    ];

    if (channel !== 'internal') {
      writes.push(
        db.prepare(`INSERT INTO site_hourly_entry_routes
          (bucket_hour, acquisition_channel, page_type, route, entries, latest_event_at)
          VALUES (?1, ?2, ?3, ?4, 1, ?5)
          ON CONFLICT(bucket_hour, acquisition_channel, page_type, route)
          DO UPDATE SET entries = entries + 1, latest_event_at = excluded.latest_event_at`)
          .bind(bucket, channel, pageType, route, latest),
        db.prepare(`INSERT INTO site_hourly_locale_entry_routes
          (bucket_hour, locale, acquisition_channel, page_type, route, entries, latest_event_at)
          VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6)
          ON CONFLICT(bucket_hour, locale, acquisition_channel, page_type, route)
          DO UPDATE SET entries = entries + 1, latest_event_at = excluded.latest_event_at`)
          .bind(bucket, locale, channel, pageType, route, latest)
      );
    }

    await db.batch(writes);
    return json(202, { accepted: 1 });
  } catch (error) {
    console.error('acquisition telemetry rollup failed', error);
    return json(503, { error: 'metrics_write_failed' });
  }
}

export function onRequestGet() {
  return json(405, { error: 'method_not_allowed' });
}
