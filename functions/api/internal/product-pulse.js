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

async function hasProductEventsTable(db) {
  const result = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'product_events'"
  ).first();
  return Boolean(result && result.name === 'product_events');
}

async function summaryForWindow(db, startModifier, endModifier) {
  const endClause = endModifier ? 'AND received_at < strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\', ?2)' : '';
  const sql = `
    SELECT
      COUNT(DISTINCT CASE WHEN event_name = 'page_session_started' THEN session_id END) AS sessions,
      COUNT(DISTINCT CASE WHEN event_name = 'editor_engaged' THEN session_id END) AS engaged_sessions,
      SUM(CASE WHEN event_name = 'copy_completed' THEN 1 ELSE 0 END) AS copies,
      SUM(CASE WHEN event_name = 'export_completed' THEN 1 ELSE 0 END) AS exports,
      SUM(CASE WHEN event_name = 'print_started' THEN 1 ELSE 0 END) AS prints,
      SUM(CASE WHEN event_name = 'share_clicked' THEN 1 ELSE 0 END) AS shares,
      SUM(CASE WHEN event_name = 'tool_handoff' THEN 1 ELSE 0 END) AS handoffs,
      SUM(CASE WHEN event_name = 'batch_transliteration' THEN 1 ELSE 0 END) AS batch_transliterations,
      MAX(received_at) AS latest_event_at
    FROM product_events
    WHERE received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      ${endClause}
  `;
  const statement = db.prepare(sql);
  const result = endModifier
    ? await statement.bind(startModifier, endModifier).first()
    : await statement.bind(startModifier).first();
  return result || {};
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!allowedHost(request, env)) return json({ error: 'not_found' }, 404);
  if (!env.METRICS_DB) return json({ error: 'metrics_db_unavailable' }, 503);

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get('days') || 7);
  const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 7;
  const currentStart = `-${days} days`;
  const previousStart = `-${days * 2} days`;
  const previousEnd = `-${days} days`;
  const db = env.METRICS_DB;

  if (!(await hasProductEventsTable(db))) {
    return json({
      ready: false,
      days,
      generated_at: new Date().toISOString(),
      message: 'No product telemetry table exists yet. It will be created by the first valid /api/events request.'
    });
  }

  const [current, previous, exportResult, lengthResult, activeResult, modeResult, deviceResult, handoffResult, toolResult, dailyResult] = await Promise.all([
    summaryForWindow(db, currentStart),
    summaryForWindow(db, previousStart, previousEnd),
    db.prepare(`
      SELECT COALESCE(format, 'unknown') AS format, COUNT(*) AS events,
             COUNT(DISTINCT session_id) AS sessions
      FROM product_events
      WHERE event_name = 'export_completed'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY format
      ORDER BY events DESC
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT COALESCE(length_bucket, 'unknown') AS bucket, COUNT(*) AS summaries
      FROM product_events
      WHERE event_name = 'session_summary'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY length_bucket
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT COALESCE(active_time_bucket, 'unknown') AS bucket, COUNT(*) AS summaries
      FROM product_events
      WHERE event_name = 'session_summary'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY active_time_bucket
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT COALESCE(input_mode, 'unknown') AS input_mode, COUNT(*) AS summaries
      FROM product_events
      WHERE event_name = 'session_summary'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY input_mode
      ORDER BY summaries DESC
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT COALESCE(device_class, 'unknown') AS device_class,
             COUNT(DISTINCT session_id) AS sessions
      FROM product_events
      WHERE event_name = 'page_session_started'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY device_class
      ORDER BY sessions DESC
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT COALESCE(target_route, 'unknown') AS target_route,
             COUNT(*) AS events,
             COUNT(DISTINCT session_id) AS sessions
      FROM product_events
      WHERE event_name = 'tool_handoff'
        AND received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY target_route
      ORDER BY events DESC
      LIMIT 12
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT tool,
             COUNT(DISTINCT CASE WHEN event_name = 'page_session_started' THEN session_id END) AS sessions,
             COUNT(DISTINCT CASE WHEN event_name = 'editor_engaged' THEN session_id END) AS engaged_sessions,
             SUM(CASE WHEN event_name = 'copy_completed' THEN 1 ELSE 0 END) AS copies,
             SUM(CASE WHEN event_name = 'export_completed' THEN 1 ELSE 0 END) AS exports
      FROM product_events
      WHERE received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY tool
      HAVING sessions > 0 OR engaged_sessions > 0 OR copies > 0 OR exports > 0
      ORDER BY sessions DESC, engaged_sessions DESC
    `).bind(currentStart).all(),
    db.prepare(`
      SELECT substr(received_at, 1, 10) AS day,
             COUNT(DISTINCT CASE WHEN event_name = 'page_session_started' THEN session_id END) AS sessions,
             COUNT(DISTINCT CASE WHEN event_name = 'editor_engaged' THEN session_id END) AS engaged_sessions,
             SUM(CASE WHEN event_name = 'copy_completed' THEN 1 ELSE 0 END) AS copies,
             SUM(CASE WHEN event_name = 'export_completed' THEN 1 ELSE 0 END) AS exports
      FROM product_events
      WHERE received_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?1)
      GROUP BY substr(received_at, 1, 10)
      ORDER BY day ASC
    `).bind(currentStart).all()
  ]);

  const exportsByFormat = rows(exportResult);
  const exportMap = Object.fromEntries(exportsByFormat.map(item => [item.format, Number(item.events || 0)]));
  const sessions = Number(current.sessions || 0);
  const engagedSessions = Number(current.engaged_sessions || 0);

  return json({
    ready: true,
    days,
    generated_at: new Date().toISOString(),
    current: {
      sessions,
      engaged_sessions: engagedSessions,
      engagement_rate: sessions ? engagedSessions / sessions : 0,
      copies: Number(current.copies || 0),
      exports: Number(current.exports || 0),
      prints: Number(current.prints || 0),
      shares: Number(current.shares || 0),
      handoffs: Number(current.handoffs || 0),
      batch_transliterations: Number(current.batch_transliterations || 0),
      latest_event_at: current.latest_event_at || null,
      exports_by_format: {
        pdf: exportMap.pdf || 0,
        png: exportMap.png || 0,
        doc: exportMap.doc || 0,
        txt: exportMap.txt || 0
      }
    },
    previous: {
      sessions: Number(previous.sessions || 0),
      engaged_sessions: Number(previous.engaged_sessions || 0),
      copies: Number(previous.copies || 0),
      exports: Number(previous.exports || 0),
      prints: Number(previous.prints || 0),
      shares: Number(previous.shares || 0),
      handoffs: Number(previous.handoffs || 0)
    },
    exports: exportsByFormat,
    length_distribution: rows(lengthResult),
    active_time_distribution: rows(activeResult),
    input_modes: rows(modeResult),
    devices: rows(deviceResult),
    handoffs: rows(handoffResult),
    tools: rows(toolResult),
    daily: rows(dailyResult)
  });
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });
  }
  return onRequestGet(context);
}
