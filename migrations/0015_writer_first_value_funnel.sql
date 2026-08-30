-- WU-PLAT-002H Gate A: first-value funnel counters for the core activation
-- programme. Follows the exact ALTER TABLE pattern of 0009_voice_input_mode.sql
-- -- no new tables/sinks, just bounded aggregate counters on the existing
-- hourly rollup tables.

ALTER TABLE product_hourly_metrics ADD COLUMN writer_viewed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_focused INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_first_input INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_first_urdu_success INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_depth_20 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_depth_100 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_depth_500 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_depth_1000 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN writer_outcome_first INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_viewed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_focused INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_first_input INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_first_urdu_success INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_depth_20 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_depth_100 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_depth_500 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_depth_1000 INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN writer_outcome_first INTEGER NOT NULL DEFAULT 0;
