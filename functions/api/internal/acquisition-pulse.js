const ALLOWED_DAYS = new Set([1, 7, 30]);

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

function rows(result) {
  return result && Array.isArray(result.results) ? result.results : [];
}

function hourIso(date) {
  return date.toISOString().slice(0, 13) + ':00:00Z';
}

function windowBounds(days) {
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setUTCMinutes(0, 0, 0);
  const end = new Date(currentHour.getTime() + 60 * 60 * 1000);
  const start = new Date(currentHour.getTime() - days * 24 * 60 * 60 * 1000);
  const previousStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    currentStart: hourIso(start),
    currentEnd: hourIso(end),
    previousStart: hourIso(previousStart),
    previousEnd: hourIso(start)
  };
}

async function tablesReady(db) {
  const result = await db.prepare(`
    SELECT COUNT(*) AS table_count
    FROM sqlite_master
    WHERE type = 'table' AND name IN ('site_hourly_acquisition', 'site_hourly_entry_routes')
  `).first();
  return Number(result && result.table_count || 0) === 2;
}

async function entrySummary(db, start, end, productOnly) {
  const productClause = productOnly ? "AND page_type IN ('write', 'create')" : '';
  return (await db.prepare(`
    SELECT COALESCE(SUM(entries), 0) AS entries,
           MAX(latest_event_at) AS latest_event_at
    FROM site_hourly_entry_routes
    WHERE bucket_hour >= ?1 AND bucket_hour < ?2 ${productClause}
  `).bind(start, end).first()) || {};
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!allowedHost(request, env)) return json({ error: 'not_found' }, 404);
  if (!env.METRICS_DB) return json({ error: 'metrics_db_unavailable' }, 503);

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get('days') || 7);
  const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 7;
  const db = env.METRICS_DB;

  if (!(await tablesReady(db))) {
    return json({
      ready: false,
      days,
      generated_at: new Date().toISOString(),
      message: 'Acquisition rollups are waiting for the first public page entry after deployment.'
    });
  }

  const bounds = windowBounds(days);
  const [current, previous, productCurrent, productPrevious, channelResult, productChannelResult, routeResult] = await Promise.all([
    entrySummary(db, bounds.currentStart, bounds.currentEnd, false),
    entrySummary(db, bounds.previousStart, bounds.previousEnd, false),
    entrySummary(db, bounds.currentStart, bounds.currentEnd, true),
    entrySummary(db, bounds.previousStart, bounds.previousEnd, true),
    db.prepare(`
      SELECT acquisition_channel, SUM(entries) AS entries
      FROM site_hourly_entry_routes
      WHERE bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY acquisition_channel
      ORDER BY entries DESC
    `).bind(bounds.currentStart, bounds.currentEnd).all(),
    db.prepare(`
      SELECT acquisition_channel, SUM(entries) AS entries
      FROM site_hourly_entry_routes
      WHERE bucket_hour >= ?1 AND bucket_hour < ?2
        AND page_type IN ('write', 'create')
      GROUP BY acquisition_channel
      ORDER BY entries DESC
    `).bind(bounds.currentStart, bounds.currentEnd).all(),
    db.prepare(`
      SELECT route, SUM(entries) AS entries
      FROM site_hourly_entry_routes
      WHERE bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY route
      ORDER BY entries DESC
      LIMIT 10
    `).bind(bounds.currentStart, bounds.currentEnd).all()
  ]);

  return json({
    ready: true,
    storage: 'hourly_acquisition_rollups',
    days,
    generated_at: new Date().toISOString(),
    current: {
      site_entries: Number(current.entries || 0),
      product_entries: Number(productCurrent.entries || 0),
      latest_event_at: current.latest_event_at || productCurrent.latest_event_at || null
    },
    previous: {
      site_entries: Number(previous.entries || 0),
      product_entries: Number(productPrevious.entries || 0)
    },
    site_channels: rows(channelResult),
    product_channels: rows(productChannelResult),
    entry_routes: rows(routeResult)
  });
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });
  }
  return onRequestGet(context);
}
