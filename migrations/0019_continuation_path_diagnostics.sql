-- WU-PLAT-002H Slice 1: bounded continuation path diagnostics.
-- Aggregate hourly counters only; no editor text, transcript, audio, file, document/share ID or account identity.
CREATE TABLE IF NOT EXISTS continuation_hourly_paths (
    bucket_hour TEXT NOT NULL,
    recommendation_id TEXT NOT NULL,
    source_workspace TEXT NOT NULL,
    destination_workspace TEXT NOT NULL,
    path_version TEXT NOT NULL,
    release_marker TEXT NOT NULL,
    device_class TEXT NOT NULL,
    handoff_required INTEGER NOT NULL DEFAULT 1,
    restore_required INTEGER NOT NULL DEFAULT 1,
    eligible INTEGER NOT NULL DEFAULT 0,
    shown INTEGER NOT NULL DEFAULT 0,
    selected INTEGER NOT NULL DEFAULT 0,
    handoff_created INTEGER NOT NULL DEFAULT 0,
    destination_ready INTEGER NOT NULL DEFAULT 0,
    payload_restored INTEGER NOT NULL DEFAULT 0,
    meaningful_start INTEGER NOT NULL DEFAULT 0,
    destination_outcome INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, recommendation_id, source_workspace, destination_workspace, path_version, release_marker, device_class)
);
