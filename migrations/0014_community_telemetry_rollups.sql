-- WU-COMMUNITY-001F: bounded community-reading rollup counters.
-- community_publication_viewed/community_write_cta_clicked were already
-- allowlisted event names (js/community-writers.js already sends them) but
-- applyEvent() in functions/api/events.js had no branch to roll them into
-- product_hourly_metrics, so they were accepted and silently discarded.
-- Follows the exact pattern of migrations/0009_voice_input_mode.sql.

ALTER TABLE product_hourly_metrics ADD COLUMN community_views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN community_cta_clicks INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN community_views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN community_cta_clicks INTEGER NOT NULL DEFAULT 0;
