CREATE TABLE IF NOT EXISTS share_artifacts (
    id TEXT PRIMARY KEY,
    source_tool TEXT NOT NULL,
    public_text TEXT NOT NULL,
    attribution TEXT,
    image_key TEXT NOT NULL,
    image_mime TEXT NOT NULL,
    image_width INTEGER NOT NULL,
    image_height INTEGER NOT NULL,
    preset TEXT,
    remix_payload_json TEXT,
    remix_mode TEXT NOT NULL DEFAULT 'text_only',
    origin_share_id TEXT,
    manage_token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    deleted_at TEXT,
    FOREIGN KEY (origin_share_id) REFERENCES share_artifacts(id)
);

CREATE INDEX IF NOT EXISTS idx_share_artifacts_created_at ON share_artifacts(created_at);
CREATE INDEX IF NOT EXISTS idx_share_artifacts_origin_share_id ON share_artifacts(origin_share_id);
CREATE INDEX IF NOT EXISTS idx_share_artifacts_status ON share_artifacts(status);

CREATE TABLE IF NOT EXISTS share_hourly_metrics (
    bucket_hour TEXT NOT NULL,
    tool TEXT NOT NULL,
    publish_started INTEGER NOT NULL DEFAULT 0,
    publish_completed INTEGER NOT NULL DEFAULT 0,
    publish_failed INTEGER NOT NULL DEFAULT 0,
    page_views INTEGER NOT NULL DEFAULT 0,
    cta_clicks INTEGER NOT NULL DEFAULT 0,
    referred_creation_starts INTEGER NOT NULL DEFAULT 0,
    republish_completed INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    reports INTEGER NOT NULL DEFAULT 0,
    link_share_actions INTEGER NOT NULL DEFAULT 0,
    device_mobile INTEGER NOT NULL DEFAULT 0,
    device_tablet INTEGER NOT NULL DEFAULT 0,
    device_desktop INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, tool)
);
