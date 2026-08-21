-- P0 Voice & Accounts Product Pulse metrics.
-- Aggregate-only by hour: no transcript/audio, email, account IDs, telemetry session IDs or voice/account identity linkage.

CREATE TABLE IF NOT EXISTS voice_account_hourly_metrics (
    bucket_hour TEXT PRIMARY KEY,
    voice_page_sessions INTEGER NOT NULL DEFAULT 0,
    voice_try_sessions INTEGER NOT NULL DEFAULT 0,
    voice_success_sessions INTEGER NOT NULL DEFAULT 0,
    account_signups INTEGER NOT NULL DEFAULT 0,
    voice_assisted_signups INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT
);
