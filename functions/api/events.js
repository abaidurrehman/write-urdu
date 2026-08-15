const EVENT_NAMES = new Set([
    'page_session_started',
    'editor_engaged',
    'session_summary',
    'copy_completed',
    'export_completed',
    'print_started',
    'share_clicked',
    'tool_handoff',
    'batch_transliteration',
    'input_mode_changed'
]);

const TOOLS = new Set([
    'basic_editor', 'rich_editor', 'urdu_keyboard', 'card_studio', 'stylish_text',
    'name_art', 'whatsapp_status', 'instagram_post', 'invoice_generator', 'qr_generator', 'content'
]);

const FORMATS = new Set(['txt', 'png', 'pdf', 'doc', 'print', 'clipboard']);
const LENGTH_BUCKETS = new Set(['0', '1-20', '21-50', '51-100', '101-250', '251-500', '501-1000', '1001-2500', '2500+']);
const ACTIVE_BUCKETS = new Set(['0-10s', '11-30s', '31-60s', '61-180s', '181-600s', '600s+']);
const INPUT_MODES = new Set(['roman', 'direct', 'unknown']);
const DEVICE_CLASSES = new Set(['mobile', 'tablet', 'desktop']);

let schemaReady = null;

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
    'CREATE INDEX IF NOT EXISTS idx_product_events_received_at ON product_events(received_at)',
    'CREATE INDEX IF NOT EXISTS idx_product_events_event_name ON product_events(event_name)',
    'CREATE INDEX IF NOT EXISTS idx_product_events_tool ON product_events(tool)',
    'CREATE INDEX IF NOT EXISTS idx_product_events_route ON product_events(route)',
    'CREATE INDEX IF NOT EXISTS idx_product_events_session ON product_events(session_id)'
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
    if (!/^\/[a-z0-9\/-]*$/i.test(route) || route.length > 120) return null;
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
    if (!eventId || !sessionId || !route || !eventName || !tool) return null;

    const targetRoute = input.target_route ? cleanRoute(input.target_route) : null;
    if (input.target_route && !targetRoute) return null;

    return {
        eventId,
        sessionId,
        route,
        tool,
        eventName,
        format: enumValue(input.format, FORMATS),
        lengthBucket: enumValue(input.length_bucket, LENGTH_BUCKETS),
        activeTimeBucket: enumValue(input.active_time_bucket, ACTIVE_BUCKETS),
        inputMode: enumValue(input.input_mode, INPUT_MODES),
        success: typeof input.success === 'boolean' ? (input.success ? 1 : 0) : null,
        deviceClass: enumValue(input.device_class, DEVICE_CLASSES),
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
        await ensureSchema(env.METRICS_DB);
        const statements = events.map((event) => env.METRICS_DB.prepare(`
            INSERT OR IGNORE INTO product_events (
                event_id, session_id, route, tool, event_name, format,
                length_bucket, active_time_bucket, input_mode, success,
                device_class, target_route
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            event.eventId,
            event.sessionId,
            event.route,
            event.tool,
            event.eventName,
            event.format,
            event.lengthBucket,
            event.activeTimeBucket,
            event.inputMode,
            event.success,
            event.deviceClass,
            event.targetRoute
        ));
        await env.METRICS_DB.batch(statements);
        return json(202, { accepted: events.length });
    } catch (error) {
        console.error('product telemetry insert failed', error);
        return json(503, { error: 'metrics_write_failed' });
    }
}

export function onRequestGet() {
    return json(405, { error: 'method_not_allowed' });
}
