-- WU-PLAT-002H Gate A completion: Card Studio completion funnel, continuation
-- funnel, and share-referral trace counters. Follows the exact ALTER TABLE
-- pattern of 0015_writer_first_value_funnel.sql -- no new tables/sinks, just
-- bounded aggregate counters on the existing hourly rollup tables.

ALTER TABLE product_hourly_metrics ADD COLUMN card_studio_export_step_reached INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN card_studio_export_attempted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN card_studio_export_quick INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN card_studio_export_advanced INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN continuation_shown INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN continuation_stored INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN continuation_destination_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN continuation_payload_restored INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN card_studio_export_step_reached INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN card_studio_export_attempted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN card_studio_export_quick INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN card_studio_export_advanced INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN continuation_shown INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN continuation_stored INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN continuation_destination_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN continuation_payload_restored INTEGER NOT NULL DEFAULT 0;

ALTER TABLE share_hourly_metrics ADD COLUMN destination_ready INTEGER NOT NULL DEFAULT 0;
ALTER TABLE share_hourly_metrics ADD COLUMN referral_recognized INTEGER NOT NULL DEFAULT 0;
