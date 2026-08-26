-- WU-AI-001B AI writing budget pacing.
-- Aggregate-only by calendar month: no request text, IP, or account identity.

CREATE TABLE IF NOT EXISTS ai_writing_monthly_usage (
    month TEXT PRIMARY KEY,
    requests_count INTEGER NOT NULL DEFAULT 0,
    estimated_tokens INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT
);
