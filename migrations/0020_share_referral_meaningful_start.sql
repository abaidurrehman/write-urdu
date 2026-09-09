-- WU-SHARE-001R: distinguish meaningful referred start from mere first-touch
-- referred creation start. Follows the exact ALTER TABLE pattern of
-- 0016_gate_a_completion.sql -- no new tables/sinks, just a bounded
-- aggregate counter on the existing share hourly rollup table.

ALTER TABLE share_hourly_metrics ADD COLUMN referred_meaningful_starts INTEGER NOT NULL DEFAULT 0;
