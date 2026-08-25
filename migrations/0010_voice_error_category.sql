-- WU-VOICE-PLAT-001D: bounded voice failure-category counters.
-- Answers spec §7 ("which bounded failure categories suppress activation")
-- using the same errorCategory taxonomy already computed client-side in
-- js/voice-input-core.js. No new tables/sinks; follows the exact pattern of
-- migrations/0009_voice_input_mode.sql. 'aborted' (user-initiated stop) is
-- intentionally excluded — it is not a failure.

ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_permission_denied INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_audio_capture INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_no_speech INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_network INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_language_unsupported INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_metrics ADD COLUMN voice_error_unknown INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_permission_denied INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_audio_capture INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_no_speech INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_network INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_language_unsupported INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN voice_error_unknown INTEGER NOT NULL DEFAULT 0;
