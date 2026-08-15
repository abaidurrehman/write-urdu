-- WU-ANALYTICS-002: scalable hourly product telemetry rollups
-- New browser events are aggregated into these bounded-cardinality tables.
-- The legacy product_events table remains only as a short-lived migration/diagnostic buffer.

CREATE TABLE IF NOT EXISTS product_hourly_metrics (
    bucket_hour TEXT NOT NULL,
    tool TEXT NOT NULL,
    visits INTEGER NOT NULL DEFAULT 0,
    engaged_visits INTEGER NOT NULL DEFAULT 0,
    copies INTEGER NOT NULL DEFAULT 0,
    exports INTEGER NOT NULL DEFAULT 0,
    export_pdf INTEGER NOT NULL DEFAULT 0,
    export_png INTEGER NOT NULL DEFAULT 0,
    export_png_transparent INTEGER NOT NULL DEFAULT 0,
    export_jpeg INTEGER NOT NULL DEFAULT 0,
    export_doc INTEGER NOT NULL DEFAULT 0,
    export_txt INTEGER NOT NULL DEFAULT 0,
    export_svg INTEGER NOT NULL DEFAULT 0,
    prints INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    handoffs INTEGER NOT NULL DEFAULT 0,
    batch_transliterations INTEGER NOT NULL DEFAULT 0,
    canvas_interactions INTEGER NOT NULL DEFAULT 0,
    template_uses INTEGER NOT NULL DEFAULT 0,
    background_image_uses INTEGER NOT NULL DEFAULT 0,
    summary_count INTEGER NOT NULL DEFAULT 0,
    length_0 INTEGER NOT NULL DEFAULT 0,
    length_1_20 INTEGER NOT NULL DEFAULT 0,
    length_21_50 INTEGER NOT NULL DEFAULT 0,
    length_51_100 INTEGER NOT NULL DEFAULT 0,
    length_101_250 INTEGER NOT NULL DEFAULT 0,
    length_251_500 INTEGER NOT NULL DEFAULT 0,
    length_501_1000 INTEGER NOT NULL DEFAULT 0,
    length_1001_2500 INTEGER NOT NULL DEFAULT 0,
    length_2500_plus INTEGER NOT NULL DEFAULT 0,
    active_0_10 INTEGER NOT NULL DEFAULT 0,
    active_11_30 INTEGER NOT NULL DEFAULT 0,
    active_31_60 INTEGER NOT NULL DEFAULT 0,
    active_61_180 INTEGER NOT NULL DEFAULT 0,
    active_181_600 INTEGER NOT NULL DEFAULT 0,
    active_600_plus INTEGER NOT NULL DEFAULT 0,
    input_roman INTEGER NOT NULL DEFAULT 0,
    input_direct INTEGER NOT NULL DEFAULT 0,
    input_unknown INTEGER NOT NULL DEFAULT 0,
    device_mobile INTEGER NOT NULL DEFAULT 0,
    device_tablet INTEGER NOT NULL DEFAULT 0,
    device_desktop INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, tool)
);

CREATE TABLE IF NOT EXISTS product_hourly_handoffs (
    bucket_hour TEXT NOT NULL,
    tool TEXT NOT NULL,
    target_route TEXT NOT NULL,
    events INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (bucket_hour, tool, target_route)
);

CREATE TABLE IF NOT EXISTS product_telemetry_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Raw-event rows are no longer the reporting source. Keep only the timestamp
-- index for the seven-day diagnostic cleanup and remove write-amplifying indexes.
CREATE INDEX IF NOT EXISTS idx_product_events_received_at ON product_events(received_at);
DROP INDEX IF EXISTS idx_product_events_event_name;
DROP INDEX IF EXISTS idx_product_events_tool;
DROP INDEX IF EXISTS idx_product_events_route;
DROP INDEX IF EXISTS idx_product_events_session;
