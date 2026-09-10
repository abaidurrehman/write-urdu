-- WU-PLAT-002H Slice 6: export funnel stage repair. Today only the terminal
-- export_completed event exists, so a stalled or failing export is invisible
-- next to a healthy one. Adds the missing started/error stages so the
-- selected -> started -> completed/error funnel can actually be diagnosed.
-- Follows the exact ALTER TABLE pattern of 0017_gate_c_continuation.sql --
-- no new tables/sinks, just bounded aggregate counters on the existing
-- hourly rollup tables.

-- All three rollup tables get every METRIC_COLUMNS entry (deviceMetricUpsert
-- in functions/api/events.js writes the full column set unconditionally),
-- unlike 0017 which could skip product_hourly_device_metrics only because
-- that table did not exist yet at the time (it was created fresh by
-- 0018_writer_device_funnel.sql, already including 0017's column).

ALTER TABLE product_hourly_metrics ADD COLUMN export_started INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN export_error INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN export_started INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN export_error INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_device_metrics ADD COLUMN export_started INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_device_metrics ADD COLUMN export_error INTEGER NOT NULL DEFAULT 0;
