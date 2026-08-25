-- WU-VOICE-PLAT-001D: voice adoption/completion telemetry columns.
-- Adds a 'voice' input_mode value and per-workspace voice funnel counters
-- to the existing hourly rollup tables. No new tables/sinks are introduced;
-- these columns follow the exact pattern of the existing input_roman/
-- input_direct/input_unknown and other bounded counters.

ALTER TABLE product_hourly_metrics ADD COLUMN input_voice INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_exposed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_selected INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_started INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_final INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_switch_continued INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN input_voice INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_exposed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_selected INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_started INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_final INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_switch_continued INTEGER NOT NULL DEFAULT 0;
