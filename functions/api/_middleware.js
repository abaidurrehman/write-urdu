let exportFunnelSchemaReady = null;

const EXPORT_FUNNEL_TABLES = [
    'product_hourly_metrics',
    'product_hourly_locale_metrics',
    'product_hourly_device_metrics'
];
const EXPORT_FUNNEL_COLUMNS = ['export_started', 'export_error'];

async function tableColumns(db, table) {
    const result = await db.prepare(`PRAGMA table_info(${table})`).all();
    return new Set((result && result.results ? result.results : []).map((row) => row.name));
}

async function addColumnIfMissing(db, table, column, columns) {
    if (columns.has(column)) return;
    try {
        await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`).run();
    } catch (error) {
        // Multiple fresh isolates can race on the same first request. If another
        // isolate already repaired the schema, the duplicate-column error is safe.
        if (!/duplicate column name/i.test(String(error && (error.message || error)))) throw error;
    }
}

async function ensureExportFunnelSchema(db) {
    if (!db) return;
    if (!exportFunnelSchemaReady) {
        exportFunnelSchemaReady = (async () => {
            for (const table of EXPORT_FUNNEL_TABLES) {
                const columns = await tableColumns(db, table);
                // A missing table is still owned by events.js ensureSchema(); once
                // created it already includes these columns via METRIC_DEFINITIONS.
                if (!columns.size) continue;
                for (const column of EXPORT_FUNNEL_COLUMNS) {
                    await addColumnIfMissing(db, table, column, columns);
                }
            }
        })().catch((error) => {
            exportFunnelSchemaReady = null;
            throw error;
        });
    }
    return exportFunnelSchemaReady;
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    if (context.request.method === 'POST' && url.pathname === '/api/events' && context.env && context.env.METRICS_DB) {
        try {
            await ensureExportFunnelSchema(context.env.METRICS_DB);
        } catch (error) {
            console.error('[product-telemetry] export funnel schema compatibility repair failed', error);
            return new Response(JSON.stringify({ error: 'telemetry_schema_unavailable' }), {
                status: 503,
                headers: {
                    'content-type': 'application/json; charset=utf-8',
                    'cache-control': 'no-store'
                }
            });
        }
    }
    return context.next();
}
