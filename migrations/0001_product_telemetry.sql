-- WU-ANALYTICS-001: privacy-safe product telemetry
-- Additive only. No editor text, IP address, email, referrer or user-agent fields.

CREATE TABLE IF NOT EXISTS product_events (
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
);

CREATE INDEX IF NOT EXISTS idx_product_events_received_at ON product_events(received_at);
CREATE INDEX IF NOT EXISTS idx_product_events_event_name ON product_events(event_name);
CREATE INDEX IF NOT EXISTS idx_product_events_tool ON product_events(tool);
CREATE INDEX IF NOT EXISTS idx_product_events_route ON product_events(route);
CREATE INDEX IF NOT EXISTS idx_product_events_session ON product_events(session_id);
