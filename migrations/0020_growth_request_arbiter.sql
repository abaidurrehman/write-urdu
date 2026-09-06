-- WU-PLAT-002H Slice 2: bounded Keep / Share / Community Publish arbitration diagnostics.
-- Aggregate counters only. No writing text, transcript, filename, document/share ID, email, account ID or telemetry identity.
CREATE TABLE IF NOT EXISTS growth_hourly_requests (
    bucket_hour TEXT NOT NULL,
    request_family TEXT NOT NULL,
    growth_workspace TEXT NOT NULL,
    writer_state TEXT NOT NULL,
    account_state TEXT NOT NULL,
    release_marker TEXT NOT NULL,
    suppression_winner TEXT NOT NULL,
    suppression_reason TEXT NOT NULL,
    device_class TEXT NOT NULL,
    eligible INTEGER NOT NULL DEFAULT 0,
    shown INTEGER NOT NULL DEFAULT 0,
    opened INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    dismissed INTEGER NOT NULL DEFAULT 0,
    suppressed_due_to_arbitration INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, request_family, growth_workspace, writer_state, account_state, release_marker, suppression_winner, suppression_reason, device_class)
);
