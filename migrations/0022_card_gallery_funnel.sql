-- WU-CARD-GALLERY-001 Slice 2: bounded, content-free Gallery funnel.
-- Controlled IDs and buckets are validated by functions/api/events.js before
-- these hourly aggregates are written. User text is never stored here.

CREATE TABLE IF NOT EXISTS card_gallery_hourly_funnel (
    bucket_hour TEXT NOT NULL,
    event_name TEXT NOT NULL,
    background_id TEXT NOT NULL,
    category TEXT NOT NULL,
    text_length_bucket TEXT NOT NULL,
    device_class TEXT NOT NULL,
    success_state TEXT NOT NULL,
    events INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, event_name, background_id, category, text_length_bucket, device_class, success_state)
);
