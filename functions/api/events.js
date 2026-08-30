const EVENT_NAMES = new Set([
    'page_session_started',
    'editor_engaged',
    'tool_engaged',
    'session_summary',
    'copy_completed',
    'export_completed',
    'print_started',
    'share_clicked',
    'share_completed',
    'tool_handoff',
    'batch_transliteration',
    'input_mode_changed',
    'canvas_interaction',
    'template_used',
    'background_image_used',
    'share_publish_started',
    'share_publish_completed',
    'share_publish_failed',
    'share_page_viewed',
    'share_page_cta_clicked',
    'share_referred_creation_started',
    'share_republish_completed',
    'share_deleted',
    'share_reported',
    'voice_exposed',
    'voice_selected',
    'voice_started',
    'voice_final',
    'voice_switch_continued',
    'voice_error',
    'community_publish_prompt_shown',
    'community_publish_prompt_clicked',
    'community_publish_manual_clicked',
    'community_submission_started',
    'community_submission_completed',
    'community_submission_failed',
    'community_publication_viewed',
    'community_write_cta_clicked',
    'community_report_submitted',
    'community_my_publications_viewed',
    'community_revision_started',
    'community_revision_submitted',
    'community_publication_withdrawn',
    'writer_viewed',
    'writer_focused',
    'writer_first_input',
    'writer_first_urdu_success',
    'writer_depth_20',
    'writer_depth_100',
    'writer_depth_500',
    'writer_depth_1000',
    'writer_outcome_first'
]);

const TOOLS = new Set([
    'basic_editor', 'rich_editor', 'urdu_keyboard', 'card_studio', 'stylish_text',
    'name_art', 'whatsapp_status', 'instagram_post', 'invoice_generator', 'qr_generator',
    'public_share', 'voice_typing', 'content', 'community_writing'
]);

const FORMATS = new Set([
    'txt', 'png', 'png_transparent', 'jpeg', 'pdf', 'doc', 'svg',
    'print', 'clipboard', 'clipboard_image'
]);
const LENGTH_BUCKETS = new Set(['0', '1-20', '21-50', '51-100', '101-250', '251-500', '501-1000', '1001-2500', '2500+']);
const ACTIVE_BUCKETS = new Set(['0-10s', '11-30s', '31-60s', '61-180s', '181-600s', '600s+']);
const INPUT_MODES = new Set(['roman', 'direct', 'unknown', 'voice']);
const DEVICE_CLASSES = new Set(['mobile', 'tablet', 'desktop']);
const LOCALES = new Set(['en', 'ur']);
const ERROR_CATEGORIES = new Set(['permission-denied', 'audio-capture', 'no-speech', 'network', 'language-not-supported', 'unknown']);

const METRIC_COLUMNS = [
    'visits', 'engaged_visits', 'copies', 'exports',
    'export_pdf', 'export_png', 'export_png_transparent', 'export_jpeg', 'export_doc', 'export_txt', 'export_svg',
    'prints', 'shares', 'handoffs', 'batch_transliterations',
    'canvas_interactions', 'template_uses', 'background_image_uses', 'summary_count',
    'length_0', 'length_1_20', 'length_21_50', 'length_51_100', 'length_101_250',
    'length_251_500', 'length_501_1000', 'length_1001_2500', 'length_2500_plus',
    'active_0_10', 'active_11_30', 'active_31_60', 'active_61_180', 'active_181_600', 'active_600_plus',
    'input_roman', 'input_direct', 'input_unknown', 'input_voice',
    'device_mobile', 'device_tablet', 'device_desktop',
    'voice_exposed', 'voice_selected', 'voice_started', 'voice_final', 'voice_switch_continued',
    'voice_error_permission_denied', 'voice_error_audio_capture', 'voice_error_no_speech',
    'voice_error_network', 'voice_error_language_unsupported', 'voice_error_unknown',
    'community_views', 'community_cta_clicks',
    'writer_viewed', 'writer_focused', 'writer_first_input', 'writer_first_urdu_success',
    'writer_depth_20', 'writer_depth_100', 'writer_depth_500', 'writer_depth_1000', 'writer_outcome_first'
];

const SHARE_METRIC_COLUMNS = [
    'publish_started', 'publish_completed', 'publish_failed', 'page_views', 'cta_clicks',
    'referred_creation_starts', 'republish_completed', 'deletions', 'reports', 'link_share_actions',
    'device_mobile', 'device_tablet', 'device_desktop'
];

let schemaReady = null;
let backfillReady = null;
let maintenanceDay = null;

const METRIC_DEFINITIONS = METRIC_COLUMNS.map((column) => `${column} INTEGER NOT NULL DEFAULT 0`).join(',\n        ');
const SHARE_METRIC_DEFINITIONS = SHARE_METRIC_COLUMNS.map((column) => `${column} INTEGER NOT NULL DEFAULT 0`).join(',\n        ');
const SCHEMA_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS product_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL UNIQUE,
        received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        session_id TEXT NOT NULL,
        route TEXT NOT NULL,
        tool TEXT NOT NULL,
        event_name TEXT NOT NULL,
        format TEXT,
        length_bucket TEXT,
        active_time_bucket TEXT,
        input_mode TEXT,
        success INTEGER,
        device_class TEXT,
        target_route TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS product_hourly_metrics (
        bucket_hour TEXT NOT NULL,
        tool TEXT NOT NULL,
        ${METRIC_DEFINITIONS},
        latest_event_at TEXT,
        PRIMARY KEY (bucket_hour, tool)
    )`,
    `CREATE TABLE IF NOT EXISTS product_hourly_locale_metrics (
        bucket_hour TEXT NOT NULL,
        locale TEXT NOT NULL,
        tool TEXT NOT NULL,
        ${METRIC_DEFINITIONS},
        latest_event_at TEXT,
        PRIMARY KEY (bucket_hour, locale, tool)
    )`,
    `CREATE TABLE IF NOT EXISTS product_hourly_handoffs (
        bucket_hour TEXT NOT NULL,
        tool TEXT NOT NULL,
        target_route TEXT NOT NULL,
        events INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (bucket_hour, tool, target_route)
    )`,
    `CREATE TABLE IF NOT EXISTS share_hourly_metrics (
        bucket_hour TEXT NOT NULL,
        tool TEXT NOT NULL,
        ${SHARE_METRIC_DEFINITIONS},
        latest_event_at TEXT,
        PRIMARY KEY (bucket_hour, tool)
    )`,
    `CREATE TABLE IF NOT EXISTS product_telemetry_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`,
    'CREATE INDEX IF NOT EXISTS idx_product_events_received_at ON product_events(received_at)',
    'DROP INDEX IF EXISTS idx_product_events_event_name',
    'DROP INDEX IF EXISTS idx_product_events_tool',
    'DROP INDEX IF EXISTS idx_product_events_route',
    'DROP INDEX IF EXISTS idx_product_events_session'
];

function json(status, payload) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

function cleanId(value, maxLength) {
    const text = String(value || '').trim();
    if (!text || text.length > maxLength || !/^[a-zA-Z0-9-]+$/.test(text)) return null;
    return text;
}

function cleanRoute(value) {
    const route = String(value || '').trim().split('?')[0].split('#')[0];
    if (!/^\/[a-z0-9\/:_-]*$/i.test(route) || route.length > 120) return null;
    return route.replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
}

function enumValue(value, allowed) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    const normalized = String(value);
    return allowed.has(normalized) ? normalized : null;
}

function cleanEvent(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    const eventId = cleanId(input.event_id, 80);
    const sessionId = cleanId(input.session_id, 80);
    const route = cleanRoute(input.route);
    const eventName = enumValue(input.event_name, EVENT_NAMES);
    const tool = enumValue(input.tool, TOOLS);
    const locale = enumValue(input.locale || 'en', LOCALES);
    if (!eventId || !sessionId || !route || !eventName || !tool || !locale) return null;

    const targetRoute = input.target_route ? cleanRoute(input.target_route) : null;
    if (input.target_route && !targetRoute) return null;

    return {
        eventId,
        sessionId,
        route,
        locale,
        tool,
        eventName,
        format: enumValue(input.format, FORMATS),
        lengthBucket: enumValue(input.length_bucket, LENGTH_BUCKETS),
        activeTimeBucket: enumValue(input.active_time_bucket, ACTIVE_BUCKETS),
        inputMode: enumValue(input.input_mode, INPUT_MODES),
        success: typeof input.success === 'boolean' ? (input.success ? 1 : 0) : null,
        deviceClass: enumValue(input.device_class, DEVICE_CLASSES),
        errorCategory: enumValue(input.error_category, ERROR_CATEGORIES),
        targetRoute
    };
}

async function ensureSchema(db) {
    if (!schemaReady) {
        schemaReady = db.batch(SCHEMA_STATEMENTS.map((sql) => db.prepare(sql))).catch((error) => {
            schemaReady = null;
            throw error;
        });
    }
    return schemaReady;
}

function legacyMetricSelect(toolExpression) {
    return `
        SELECT substr(received_at, 1, 13) || ':00:00Z' AS bucket_hour,
               ${toolExpression} AS tool,
               SUM(CASE WHEN event_name = 'page_session_started' THEN 1 ELSE 0 END) AS visits,
               SUM(CASE WHEN event_name = 'editor_engaged' THEN 1 ELSE 0 END) AS engaged_visits,
               SUM(CASE WHEN event_name = 'copy_completed' THEN 1 ELSE 0 END) AS copies,
               SUM(CASE WHEN event_name = 'export_completed' THEN 1 ELSE 0 END) AS exports,
               SUM(CASE WHEN event_name = 'export_completed' AND format = 'pdf' THEN 1 ELSE 0 END) AS export_pdf,
               SUM(CASE WHEN event_name = 'export_completed' AND format = 'png' THEN 1 ELSE 0 END) AS export_png,
               0 AS export_png_transparent,
               0 AS export_jpeg,
               SUM(CASE WHEN event_name = 'export_completed' AND format = 'doc' THEN 1 ELSE 0 END) AS export_doc,
               SUM(CASE WHEN event_name = 'export_completed' AND format = 'txt' THEN 1 ELSE 0 END) AS export_txt,
               0 AS export_svg,
               SUM(CASE WHEN event_name = 'print_started' THEN 1 ELSE 0 END) AS prints,
               SUM(CASE WHEN event_name = 'share_clicked' THEN 1 ELSE 0 END) AS shares,
               SUM(CASE WHEN event_name = 'tool_handoff' THEN 1 ELSE 0 END) AS handoffs,
               SUM(CASE WHEN event_name = 'batch_transliteration' THEN 1 ELSE 0 END) AS batch_transliterations,
               0 AS canvas_interactions,
               0 AS template_uses,
               0 AS background_image_uses,
               SUM(CASE WHEN event_name = 'session_summary' THEN 1 ELSE 0 END) AS summary_count,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '0' THEN 1 ELSE 0 END) AS length_0,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '1-20' THEN 1 ELSE 0 END) AS length_1_20,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '21-50' THEN 1 ELSE 0 END) AS length_21_50,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '51-100' THEN 1 ELSE 0 END) AS length_51_100,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '101-250' THEN 1 ELSE 0 END) AS length_101_250,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '251-500' THEN 1 ELSE 0 END) AS length_251_500,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '501-1000' THEN 1 ELSE 0 END) AS length_501_1000,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '1001-2500' THEN 1 ELSE 0 END) AS length_1001_2500,
               SUM(CASE WHEN event_name = 'session_summary' AND length_bucket = '2500+' THEN 1 ELSE 0 END) AS length_2500_plus,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '0-10s' THEN 1 ELSE 0 END) AS active_0_10,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '11-30s' THEN 1 ELSE 0 END) AS active_11_30,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '31-60s' THEN 1 ELSE 0 END) AS active_31_60,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '61-180s' THEN 1 ELSE 0 END) AS active_61_180,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '181-600s' THEN 1 ELSE 0 END) AS active_181_600,
               SUM(CASE WHEN event_name = 'session_summary' AND active_time_bucket = '600s+' THEN 1 ELSE 0 END) AS active_600_plus,
               SUM(CASE WHEN event_name = 'session_summary' AND input_mode = 'roman' THEN 1 ELSE 0 END) AS input_roman,
               SUM(CASE WHEN event_name = 'session_summary' AND input_mode = 'direct' THEN 1 ELSE 0 END) AS input_direct,
               SUM(CASE WHEN event_name = 'session_summary' AND input_mode = 'unknown' THEN 1 ELSE 0 END) AS input_unknown,
               0 AS input_voice,
               SUM(CASE WHEN event_name = 'page_session_started' AND device_class = 'mobile' THEN 1 ELSE 0 END) AS device_mobile,
               SUM(CASE WHEN event_name = 'page_session_started' AND device_class = 'tablet' THEN 1 ELSE 0 END) AS device_tablet,
               SUM(CASE WHEN event_name = 'page_session_started' AND device_class = 'desktop' THEN 1 ELSE 0 END) AS device_desktop,
               0 AS voice_exposed,
               0 AS voice_selected,
               0 AS voice_started,
               0 AS voice_final,
               0 AS voice_switch_continued,
               0 AS voice_error_permission_denied,
               0 AS voice_error_audio_capture,
               0 AS voice_error_no_speech,
               0 AS voice_error_network,
               0 AS voice_error_language_unsupported,
               0 AS voice_error_unknown,
               0 AS community_views,
               0 AS community_cta_clicks,
               0 AS writer_viewed,
               0 AS writer_focused,
               0 AS writer_first_input,
               0 AS writer_first_urdu_success,
               0 AS writer_depth_20,
               0 AS writer_depth_100,
               0 AS writer_depth_500,
               0 AS writer_depth_1000,
               0 AS writer_outcome_first,
               MAX(received_at) AS latest_event_at
        FROM product_events
        WHERE received_at < strftime('%Y-%m-%dT%H:00:00Z', 'now')
        GROUP BY bucket_hour${toolExpression === "'all'" ? '' : ', tool'}
    `;
}

function replaceFromSelect(selectSql) {
    const columns = ['bucket_hour', 'tool'].concat(METRIC_COLUMNS).concat(['latest_event_at']);
    const assignments = METRIC_COLUMNS.map((column) => `${column} = excluded.${column}`).concat(['latest_event_at = excluded.latest_event_at']);
    return `INSERT INTO product_hourly_metrics (${columns.join(', ')}) ${selectSql}
            ON CONFLICT(bucket_hour, tool) DO UPDATE SET ${assignments.join(', ')}`;
}

async function ensureBackfill(db) {
    if (!backfillReady) {
        backfillReady = (async () => {
            const marker = await db.prepare("SELECT value FROM product_telemetry_meta WHERE key = 'rollup_backfill_v1'").first();
            if (marker && marker.value === 'done') return;
            const perTool = replaceFromSelect(legacyMetricSelect('tool'));
            const global = replaceFromSelect(legacyMetricSelect("'all'"));
            const handoffsByTool = `
                INSERT INTO product_hourly_handoffs (bucket_hour, tool, target_route, events)
                SELECT substr(received_at, 1, 13) || ':00:00Z', tool, target_route, COUNT(*)
                FROM product_events
                WHERE event_name = 'tool_handoff' AND target_route IS NOT NULL
                  AND received_at < strftime('%Y-%m-%dT%H:00:00Z', 'now')
                GROUP BY substr(received_at, 1, 13), tool, target_route
                ON CONFLICT(bucket_hour, tool, target_route) DO UPDATE SET events = excluded.events`;
            const handoffsGlobal = `
                INSERT INTO product_hourly_handoffs (bucket_hour, tool, target_route, events)
                SELECT substr(received_at, 1, 13) || ':00:00Z', 'all', target_route, COUNT(*)
                FROM product_events
                WHERE event_name = 'tool_handoff' AND target_route IS NOT NULL
                  AND received_at < strftime('%Y-%m-%dT%H:00:00Z', 'now')
                GROUP BY substr(received_at, 1, 13), target_route
                ON CONFLICT(bucket_hour, tool, target_route) DO UPDATE SET events = excluded.events`;
            await db.batch([
                db.prepare(perTool),
                db.prepare(global),
                db.prepare(handoffsByTool),
                db.prepare(handoffsGlobal),
                db.prepare(`INSERT INTO product_telemetry_meta (key, value, updated_at)
                            VALUES ('rollup_backfill_v1', 'done', strftime('%Y-%m-%dT%H:%M:%fZ','now'))
                            ON CONFLICT(key) DO UPDATE SET value = 'done', updated_at = excluded.updated_at`)
            ]);
        })().catch((error) => {
            backfillReady = null;
            throw error;
        });
    }
    return backfillReady;
}

async function runMaintenance(db) {
    const today = new Date().toISOString().slice(0, 10);
    if (maintenanceDay === today) return;
    const marker = await db.prepare("SELECT value FROM product_telemetry_meta WHERE key = 'raw_cleanup_day'").first();
    if (marker && marker.value === today) {
        maintenanceDay = today;
        return;
    }
    await db.batch([
        db.prepare("DELETE FROM product_events WHERE received_at < strftime('%Y-%m-%dT%H:%M:%fZ','now','-7 days')"),
        db.prepare(`INSERT INTO product_telemetry_meta (key, value, updated_at)
                    VALUES ('raw_cleanup_day', ?1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`).bind(today)
    ]);
    maintenanceDay = today;
}

function originAllowed(request) {
    const origin = request.headers.get('origin');
    if (!origin) return true;
    try {
        const host = new URL(origin).hostname.toLowerCase();
        return host === 'www.write-urdu.com' || host === 'write-urdu.com' || host.endsWith('.pages.dev') || host === 'localhost' || host === '127.0.0.1';
    } catch (error) {
        return false;
    }
}

function hourBucket(date) {
    return date.toISOString().slice(0, 13) + ':00:00Z';
}

function emptyDelta(tool, now) {
    const delta = { tool, latest_event_at: now };
    METRIC_COLUMNS.forEach((column) => { delta[column] = 0; });
    return delta;
}

function emptyShareDelta(tool, now) {
    const delta = { tool, latest_event_at: now };
    SHARE_METRIC_COLUMNS.forEach((column) => { delta[column] = 0; });
    return delta;
}

function incrementBucket(delta, prefix, value, mapping) {
    if (!value || !mapping[value]) return;
    delta[prefix + mapping[value]] += 1;
}

function applyEvent(delta, event) {
    if (event.eventName === 'page_session_started') {
        delta.visits += 1;
        incrementBucket(delta, 'device_', event.deviceClass, { mobile: 'mobile', tablet: 'tablet', desktop: 'desktop' });
    }
    if (event.eventName === 'editor_engaged' || event.eventName === 'tool_engaged') delta.engaged_visits += 1;
    if (event.eventName === 'copy_completed') delta.copies += 1;
    if (event.eventName === 'export_completed') {
        delta.exports += 1;
        const exportColumns = {
            pdf: 'export_pdf', png: 'export_png', png_transparent: 'export_png_transparent', jpeg: 'export_jpeg',
            doc: 'export_doc', txt: 'export_txt', svg: 'export_svg'
        };
        if (exportColumns[event.format]) delta[exportColumns[event.format]] += 1;
    }
    if (event.eventName === 'print_started') delta.prints += 1;
    if (event.eventName === 'share_clicked' || event.eventName === 'share_completed') delta.shares += 1;
    if (event.eventName === 'tool_handoff') delta.handoffs += 1;
    if (event.eventName === 'batch_transliteration') delta.batch_transliterations += 1;
    if (event.eventName === 'canvas_interaction') delta.canvas_interactions += 1;
    if (event.eventName === 'template_used') delta.template_uses += 1;
    if (event.eventName === 'background_image_used') delta.background_image_uses += 1;
    if (event.eventName === 'session_summary') {
        delta.summary_count += 1;
        incrementBucket(delta, 'length_', event.lengthBucket, {
            '0': '0', '1-20': '1_20', '21-50': '21_50', '51-100': '51_100', '101-250': '101_250',
            '251-500': '251_500', '501-1000': '501_1000', '1001-2500': '1001_2500', '2500+': '2500_plus'
        });
        incrementBucket(delta, 'active_', event.activeTimeBucket, {
            '0-10s': '0_10', '11-30s': '11_30', '31-60s': '31_60', '61-180s': '61_180', '181-600s': '181_600', '600s+': '600_plus'
        });
        incrementBucket(delta, 'input_', event.inputMode, { roman: 'roman', direct: 'direct', unknown: 'unknown', voice: 'voice' });
    }
    if (event.eventName === 'voice_exposed') delta.voice_exposed += 1;
    if (event.eventName === 'voice_selected') delta.voice_selected += 1;
    if (event.eventName === 'voice_started') delta.voice_started += 1;
    if (event.eventName === 'voice_final') delta.voice_final += 1;
    if (event.eventName === 'voice_switch_continued') delta.voice_switch_continued += 1;
    if (event.eventName === 'voice_error') {
        incrementBucket(delta, 'voice_error_', event.errorCategory, {
            'permission-denied': 'permission_denied', 'audio-capture': 'audio_capture', 'no-speech': 'no_speech',
            network: 'network', 'language-not-supported': 'language_unsupported', unknown: 'unknown'
        });
    }
    if (event.eventName === 'community_publication_viewed') delta.community_views += 1;
    if (event.eventName === 'community_write_cta_clicked') delta.community_cta_clicks += 1;
    if (event.eventName === 'writer_viewed') delta.writer_viewed += 1;
    if (event.eventName === 'writer_focused') delta.writer_focused += 1;
    if (event.eventName === 'writer_first_input') delta.writer_first_input += 1;
    if (event.eventName === 'writer_first_urdu_success') delta.writer_first_urdu_success += 1;
    if (event.eventName === 'writer_depth_20') delta.writer_depth_20 += 1;
    if (event.eventName === 'writer_depth_100') delta.writer_depth_100 += 1;
    if (event.eventName === 'writer_depth_500') delta.writer_depth_500 += 1;
    if (event.eventName === 'writer_depth_1000') delta.writer_depth_1000 += 1;
    if (event.eventName === 'writer_outcome_first') delta.writer_outcome_first += 1;
}

function applyShareEvent(delta, event) {
    const mapping = {
        share_publish_started: 'publish_started',
        share_publish_completed: 'publish_completed',
        share_publish_failed: 'publish_failed',
        share_page_viewed: 'page_views',
        share_page_cta_clicked: 'cta_clicks',
        share_referred_creation_started: 'referred_creation_starts',
        share_republish_completed: 'republish_completed',
        share_deleted: 'deletions',
        share_reported: 'reports'
    };
    if (mapping[event.eventName]) delta[mapping[event.eventName]] += 1;
    if (event.eventName === 'share_clicked' && (event.tool === 'public_share' || event.tool === 'card_studio')) delta.link_share_actions += 1;
    if (event.eventName === 'share_page_viewed') {
        incrementBucket(delta, 'device_', event.deviceClass, { mobile: 'mobile', tablet: 'tablet', desktop: 'desktop' });
    }
}

function isShareLoopEvent(event) {
    return event.eventName.indexOf('share_') === 0 || (event.eventName === 'share_clicked' && (event.tool === 'public_share' || event.tool === 'card_studio'));
}

function aggregateEvents(events, now) {
    const byTool = new Map();
    const localeByTool = new Map();
    const shareByTool = new Map();
    const handoffs = new Map();
    const getDelta = (tool) => {
        if (!byTool.has(tool)) byTool.set(tool, emptyDelta(tool, now));
        return byTool.get(tool);
    };
    const getLocaleDelta = (locale, tool) => {
        const key = locale + '|' + tool;
        if (!localeByTool.has(key)) {
            const delta = emptyDelta(tool, now);
            delta.locale = locale;
            localeByTool.set(key, delta);
        }
        return localeByTool.get(key);
    };
    const getShareDelta = (tool) => {
        if (!shareByTool.has(tool)) shareByTool.set(tool, emptyShareDelta(tool, now));
        return shareByTool.get(tool);
    };

    events.forEach((event) => {
        applyEvent(getDelta(event.tool), event);
        applyEvent(getDelta('all'), event);
        applyEvent(getLocaleDelta(event.locale, event.tool), event);
        applyEvent(getLocaleDelta(event.locale, 'all'), event);
        if (isShareLoopEvent(event)) {
            applyShareEvent(getShareDelta(event.tool), event);
            applyShareEvent(getShareDelta('all'), event);
        }
        if (event.eventName === 'tool_handoff' && event.targetRoute) {
            [event.tool, 'all'].forEach((tool) => {
                const key = tool + '|' + event.targetRoute;
                handoffs.set(key, { tool, targetRoute: event.targetRoute, events: (handoffs.get(key)?.events || 0) + 1 });
            });
        }
    });
    return { byTool: Array.from(byTool.values()), localeByTool: Array.from(localeByTool.values()), shareByTool: Array.from(shareByTool.values()), handoffs: Array.from(handoffs.values()) };
}

function metricUpsert(db, bucket, delta) {
    const columns = ['bucket_hour', 'tool'].concat(METRIC_COLUMNS).concat(['latest_event_at']);
    const placeholders = columns.map(() => '?').join(', ');
    const assignments = METRIC_COLUMNS.map((column) => `${column} = ${column} + excluded.${column}`)
        .concat(['latest_event_at = MAX(COALESCE(latest_event_at, excluded.latest_event_at), excluded.latest_event_at)']);
    const values = [bucket, delta.tool].concat(METRIC_COLUMNS.map((column) => delta[column])).concat([delta.latest_event_at]);
    return db.prepare(`INSERT INTO product_hourly_metrics (${columns.join(', ')}) VALUES (${placeholders})
                       ON CONFLICT(bucket_hour, tool) DO UPDATE SET ${assignments.join(', ')}`).bind(...values);
}

function localeMetricUpsert(db, bucket, delta) {
    const columns = ['bucket_hour', 'locale', 'tool'].concat(METRIC_COLUMNS).concat(['latest_event_at']);
    const placeholders = columns.map(() => '?').join(', ');
    const assignments = METRIC_COLUMNS.map((column) => `${column} = ${column} + excluded.${column}`)
        .concat(['latest_event_at = MAX(COALESCE(latest_event_at, excluded.latest_event_at), excluded.latest_event_at)']);
    const values = [bucket, delta.locale, delta.tool].concat(METRIC_COLUMNS.map((column) => delta[column])).concat([delta.latest_event_at]);
    return db.prepare(`INSERT INTO product_hourly_locale_metrics (${columns.join(', ')}) VALUES (${placeholders})
                       ON CONFLICT(bucket_hour, locale, tool) DO UPDATE SET ${assignments.join(', ')}`).bind(...values);
}

function shareMetricUpsert(db, bucket, delta) {
    const columns = ['bucket_hour', 'tool'].concat(SHARE_METRIC_COLUMNS).concat(['latest_event_at']);
    const placeholders = columns.map(() => '?').join(', ');
    const assignments = SHARE_METRIC_COLUMNS.map((column) => `${column} = ${column} + excluded.${column}`)
        .concat(['latest_event_at = MAX(COALESCE(latest_event_at, excluded.latest_event_at), excluded.latest_event_at)']);
    const values = [bucket, delta.tool].concat(SHARE_METRIC_COLUMNS.map((column) => delta[column])).concat([delta.latest_event_at]);
    return db.prepare(`INSERT INTO share_hourly_metrics (${columns.join(', ')}) VALUES (${placeholders})
                       ON CONFLICT(bucket_hour, tool) DO UPDATE SET ${assignments.join(', ')}`).bind(...values);
}

function handoffUpsert(db, bucket, item) {
    return db.prepare(`INSERT INTO product_hourly_handoffs (bucket_hour, tool, target_route, events)
                       VALUES (?1, ?2, ?3, ?4)
                       ON CONFLICT(bucket_hour, tool, target_route) DO UPDATE SET events = events + excluded.events`)
        .bind(bucket, item.tool, item.targetRoute, item.events);
}

export async function onRequestPost(context) {
    const { request, env } = context;
    if (!originAllowed(request)) return json(403, { error: 'origin_not_allowed' });
    if (!env.METRICS_DB) return json(503, { error: 'metrics_db_unavailable' });

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 32768) return json(413, { error: 'payload_too_large' });

    let body;
    try {
        body = await request.json();
    } catch (error) {
        return json(400, { error: 'invalid_json' });
    }

    const incoming = Array.isArray(body && body.events) ? body.events : [];
    if (!incoming.length || incoming.length > 10) return json(400, { error: 'invalid_event_batch' });

    const events = incoming.map(cleanEvent);
    if (events.some((event) => !event)) return json(400, { error: 'invalid_event' });

    try {
        const db = env.METRICS_DB;
        await ensureSchema(db);
        await ensureBackfill(db);
        await runMaintenance(db);

        const now = new Date();
        const bucket = hourBucket(now);
        const aggregated = aggregateEvents(events, now.toISOString());
        const statements = aggregated.byTool.map((delta) => metricUpsert(db, bucket, delta))
            .concat(aggregated.localeByTool.map((delta) => localeMetricUpsert(db, bucket, delta)))
            .concat(aggregated.shareByTool.map((delta) => shareMetricUpsert(db, bucket, delta)))
            .concat(aggregated.handoffs.map((item) => handoffUpsert(db, bucket, item)));
        await db.batch(statements);
        return json(202, { accepted: events.length, rollup_rows: statements.length });
    } catch (error) {
        console.error('product telemetry rollup failed', error);
        return json(503, { error: 'metrics_write_failed' });
    }
}

export function onRequestGet() {
    return json(405, { error: 'method_not_allowed' });
}
