const ALLOWED_DAYS = new Set([1, 7, 30]);
const METRIC_COLUMNS = [
  'visits', 'engaged_visits', 'copies', 'exports',
  'export_pdf', 'export_png', 'export_png_transparent', 'export_jpeg', 'export_doc', 'export_txt', 'export_svg',
  'prints', 'shares', 'handoffs', 'batch_transliterations',
  'canvas_interactions', 'template_uses', 'background_image_uses', 'summary_count',
  'length_0', 'length_1_20', 'length_21_50', 'length_51_100', 'length_101_250',
  'length_251_500', 'length_501_1000', 'length_1001_2500', 'length_2500_plus',
  'active_0_10', 'active_11_30', 'active_31_60', 'active_61_180', 'active_181_600', 'active_600_plus',
  'input_roman', 'input_direct', 'input_unknown',
  'device_mobile', 'device_tablet', 'device_desktop'
];
const SHARE_METRIC_COLUMNS = [
  'publish_started', 'publish_completed', 'publish_failed', 'page_views', 'cta_clicks',
  'referred_creation_starts', 'republish_completed', 'deletions', 'reports', 'link_share_actions',
  'device_mobile', 'device_tablet', 'device_desktop'
];

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

async function tableExists(db, table) {
  const result = await db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?1").bind(table).first();
  return Boolean(result && result.name === table);
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

async function summaryForWindow(db, start, end) {
  const sums = METRIC_COLUMNS.map((column) => `SUM(${column}) AS ${column}`).join(',\n      ');
  return (await db.prepare(`
    SELECT ${sums}, MAX(latest_event_at) AS latest_event_at
    FROM product_hourly_metrics
    WHERE tool = 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
  `).bind(start, end).first()) || {};
}

async function shareSummaryForWindow(db, start, end) {
  const sums = SHARE_METRIC_COLUMNS.map((column) => `SUM(${column}) AS ${column}`).join(',\n      ');
  return (await db.prepare(`
    SELECT ${sums}, MAX(latest_event_at) AS latest_event_at
    FROM share_hourly_metrics
    WHERE tool = 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
  `).bind(start, end).first()) || {};
}

function n(row, key) {
  return Number(row && row[key] || 0);
}

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function distribution(items) {
  return items.filter((item) => Number(item.summaries || 0) > 0);
}

function exportRows(summary) {
  return [
    { format: 'pdf', events: n(summary, 'export_pdf') },
    { format: 'png', events: n(summary, 'export_png') + n(summary, 'export_png_transparent') },
    { format: 'jpeg', events: n(summary, 'export_jpeg') },
    { format: 'doc', events: n(summary, 'export_doc') },
    { format: 'txt', events: n(summary, 'export_txt') },
    { format: 'svg', events: n(summary, 'export_svg') },
    { format: 'png_transparent', events: n(summary, 'export_png_transparent') }
  ].filter((item) => item.events > 0);
}

async function shareLoopForWindow(db, bounds) {
  const [hasMetrics, hasArtifacts] = await Promise.all([
    tableExists(db, 'share_hourly_metrics'),
    tableExists(db, 'share_artifacts')
  ]);
  if (!hasMetrics && !hasArtifacts) return { ready: false };

  const metrics = hasMetrics ? await shareSummaryForWindow(db, bounds.currentStart, bounds.currentEnd) : {};
  let artifacts = {};
  let parentCohort = {};
  let sourceRows = [];
  if (hasArtifacts) {
    [artifacts, parentCohort, sourceRows] = await Promise.all([
      db.prepare(`
        SELECT COUNT(*) AS published_links,
               SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_links,
               SUM(CASE WHEN status = 'deleted' THEN 1 ELSE 0 END) AS deleted_links,
               SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_links
        FROM share_artifacts
        WHERE created_at >= ?1 AND created_at < ?2
      `).bind(bounds.currentStart, bounds.currentEnd).first(),
      db.prepare(`
        SELECT COUNT(*) AS eligible_parents,
               SUM(CASE WHEN EXISTS (
                 SELECT 1 FROM share_artifacts child
                 WHERE child.origin_share_id = parent.id
                   AND child.created_at >= ?1 AND child.created_at < ?2
               ) THEN 1 ELSE 0 END) AS activated_parents,
               SUM((
                 SELECT COUNT(*) FROM share_artifacts child
                 WHERE child.origin_share_id = parent.id
                   AND child.created_at >= ?1 AND child.created_at < ?2
               )) AS child_share_artifacts
        FROM share_artifacts parent
        WHERE parent.created_at >= ?1 AND parent.created_at < ?2
      `).bind(bounds.currentStart, bounds.currentEnd).first(),
      db.prepare(`
        SELECT source_tool, COUNT(*) AS published_links
        FROM share_artifacts
        WHERE created_at >= ?1 AND created_at < ?2
        GROUP BY source_tool
        ORDER BY published_links DESC
      `).bind(bounds.currentStart, bounds.currentEnd).all().then(rows)
    ]);
  }

  const attempts = n(metrics, 'publish_started');
  const completed = n(metrics, 'publish_completed');
  const pageViews = n(metrics, 'page_views');
  const ctaClicks = n(metrics, 'cta_clicks');
  const referredStarts = n(metrics, 'referred_creation_starts');
  const republishes = n(metrics, 'republish_completed');
  const publishedLinks = n(artifacts, 'published_links');
  const eligibleParents = n(parentCohort, 'eligible_parents');
  const activatedParents = n(parentCohort, 'activated_parents');
  const childShares = n(parentCohort, 'child_share_artifacts');

  return {
    ready: true,
    publish_attempts: attempts,
    publish_completed_events: completed,
    publish_failures: n(metrics, 'publish_failed'),
    publish_success_rate: ratio(completed, attempts),
    published_links: publishedLinks,
    active_links: n(artifacts, 'active_links'),
    public_page_views: pageViews,
    views_per_published_link: ratio(pageViews, publishedLinks),
    link_share_actions: n(metrics, 'link_share_actions'),
    cta_clicks: ctaClicks,
    cta_rate: ratio(ctaClicks, pageViews),
    referred_creation_starts: referredStarts,
    referred_creation_rate: ratio(referredStarts, ctaClicks),
    republish_completed: republishes,
    republish_rate: ratio(republishes, referredStarts),
    eligible_parent_shares: eligibleParents,
    activated_parent_shares: activatedParents,
    parent_activation_rate: ratio(activatedParents, eligibleParents),
    child_share_artifacts: childShares,
    reproduction_ratio: ratio(childShares, eligibleParents),
    deletions: n(metrics, 'deletions'),
    reports: n(metrics, 'reports'),
    report_rate_per_1000_views: pageViews ? n(metrics, 'reports') * 1000 / pageViews : 0,
    blocked_artifacts: n(artifacts, 'blocked_links'),
    latest_event_at: metrics.latest_event_at || null,
    devices: [
      { device_class: 'desktop', views: n(metrics, 'device_desktop') },
      { device_class: 'mobile', views: n(metrics, 'device_mobile') },
      { device_class: 'tablet', views: n(metrics, 'device_tablet') }
    ].filter((item) => item.views > 0),
    by_source_tool: sourceRows
  };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!allowedHost(request, env)) return json({ error: 'not_found' }, 404);
  if (!env.METRICS_DB) return json({ error: 'metrics_db_unavailable' }, 503);

  const url = new URL(request.url);
  const requestedDays = Number(url.searchParams.get('days') || 7);
  const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 7;
  const db = env.METRICS_DB;

  if (!(await tableExists(db, 'product_hourly_metrics'))) {
    return json({
      ready: false,
      days,
      generated_at: new Date().toISOString(),
      message: 'Product rollups are not initialized yet. The first valid /api/events request after deployment will initialize them.'
    });
  }

  const bounds = windowBounds(days);
  const localeReady = await tableExists(db, 'product_hourly_locale_metrics');
  const localePromise = localeReady ? db.prepare(`
      SELECT locale, SUM(visits) AS sessions, SUM(engaged_visits) AS engaged_sessions,
             SUM(copies) AS copies, SUM(exports) AS exports
      FROM product_hourly_locale_metrics
      WHERE tool = 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY locale
      ORDER BY sessions DESC
    `).bind(bounds.currentStart, bounds.currentEnd).all() : Promise.resolve({ results: [] });
  const [current, previous, handoffResult, toolResult, dailyResult, shareLoop, localeResult] = await Promise.all([
    summaryForWindow(db, bounds.currentStart, bounds.currentEnd),
    summaryForWindow(db, bounds.previousStart, bounds.previousEnd),
    db.prepare(`
      SELECT target_route, SUM(events) AS events
      FROM product_hourly_handoffs
      WHERE tool = 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY target_route
      ORDER BY events DESC
      LIMIT 12
    `).bind(bounds.currentStart, bounds.currentEnd).all(),
    db.prepare(`
      SELECT tool,
             SUM(visits) AS sessions,
             SUM(engaged_visits) AS engaged_sessions,
             SUM(copies) AS copies,
             SUM(exports) AS exports,
             SUM(canvas_interactions) AS canvas_interactions,
             SUM(template_uses) AS template_uses,
             SUM(background_image_uses) AS background_image_uses
      FROM product_hourly_metrics
      WHERE tool <> 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY tool
      HAVING SUM(visits) > 0 OR SUM(engaged_visits) > 0 OR SUM(copies) > 0 OR SUM(exports) > 0
      ORDER BY sessions DESC, engaged_sessions DESC
    `).bind(bounds.currentStart, bounds.currentEnd).all(),
    db.prepare(`
      SELECT substr(bucket_hour, 1, 10) AS day,
             SUM(visits) AS sessions,
             SUM(engaged_visits) AS engaged_sessions,
             SUM(copies) AS copies,
             SUM(exports) AS exports
      FROM product_hourly_metrics
      WHERE tool = 'all' AND bucket_hour >= ?1 AND bucket_hour < ?2
      GROUP BY substr(bucket_hour, 1, 10)
      ORDER BY day ASC
    `).bind(bounds.currentStart, bounds.currentEnd).all(),
    shareLoopForWindow(db, bounds),
    localePromise
  ]);

  const sessions = n(current, 'visits');
  const engagedSessions = n(current, 'engaged_visits');
  const pngTotal = n(current, 'export_png') + n(current, 'export_png_transparent');

  return json({
    ready: true,
    storage: 'hourly_rollups',
    days,
    generated_at: new Date().toISOString(),
    current: {
      sessions,
      engaged_sessions: engagedSessions,
      engagement_rate: sessions ? engagedSessions / sessions : 0,
      copies: n(current, 'copies'),
      exports: n(current, 'exports'),
      prints: n(current, 'prints'),
      shares: n(current, 'shares'),
      handoffs: n(current, 'handoffs'),
      batch_transliterations: n(current, 'batch_transliterations'),
      canvas_interactions: n(current, 'canvas_interactions'),
      template_uses: n(current, 'template_uses'),
      background_image_uses: n(current, 'background_image_uses'),
      latest_event_at: current.latest_event_at || null,
      exports_by_format: {
        pdf: n(current, 'export_pdf'),
        png: pngTotal,
        png_transparent: n(current, 'export_png_transparent'),
        jpeg: n(current, 'export_jpeg'),
        doc: n(current, 'export_doc'),
        txt: n(current, 'export_txt'),
        svg: n(current, 'export_svg')
      }
    },
    previous: {
      sessions: n(previous, 'visits'),
      engaged_sessions: n(previous, 'engaged_visits'),
      copies: n(previous, 'copies'),
      exports: n(previous, 'exports'),
      prints: n(previous, 'prints'),
      shares: n(previous, 'shares'),
      handoffs: n(previous, 'handoffs'),
      canvas_interactions: n(previous, 'canvas_interactions'),
      template_uses: n(previous, 'template_uses'),
      background_image_uses: n(previous, 'background_image_uses')
    },
    exports: exportRows(current),
    length_distribution: distribution([
      { bucket: '0', summaries: n(current, 'length_0') },
      { bucket: '1-20', summaries: n(current, 'length_1_20') },
      { bucket: '21-50', summaries: n(current, 'length_21_50') },
      { bucket: '51-100', summaries: n(current, 'length_51_100') },
      { bucket: '101-250', summaries: n(current, 'length_101_250') },
      { bucket: '251-500', summaries: n(current, 'length_251_500') },
      { bucket: '501-1000', summaries: n(current, 'length_501_1000') },
      { bucket: '1001-2500', summaries: n(current, 'length_1001_2500') },
      { bucket: '2500+', summaries: n(current, 'length_2500_plus') }
    ]),
    active_time_distribution: distribution([
      { bucket: '0-10s', summaries: n(current, 'active_0_10') },
      { bucket: '11-30s', summaries: n(current, 'active_11_30') },
      { bucket: '31-60s', summaries: n(current, 'active_31_60') },
      { bucket: '61-180s', summaries: n(current, 'active_61_180') },
      { bucket: '181-600s', summaries: n(current, 'active_181_600') },
      { bucket: '600s+', summaries: n(current, 'active_600_plus') }
    ]),
    input_modes: distribution([
      { input_mode: 'roman', summaries: n(current, 'input_roman') },
      { input_mode: 'direct', summaries: n(current, 'input_direct') },
      { input_mode: 'unknown', summaries: n(current, 'input_unknown') }
    ]),
    devices: [
      { device_class: 'desktop', sessions: n(current, 'device_desktop') },
      { device_class: 'mobile', sessions: n(current, 'device_mobile') },
      { device_class: 'tablet', sessions: n(current, 'device_tablet') }
    ].filter((item) => item.sessions > 0),
    handoffs: rows(handoffResult),
    tools: rows(toolResult),
    daily: rows(dailyResult),
    locale_breakdown: rows(localeResult),
    share_loop: shareLoop
  });
}

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });
  }
  return onRequestGet(context);
}
