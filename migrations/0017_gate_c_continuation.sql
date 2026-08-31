-- WU-PLAT-002H Gate C: Basic -> Rich contextual continuation. Adds the
-- Funnel 3 terminal step (destination meaningful start) so continuation
-- can be measured end-to-end, not only by click/payload-restore. Follows
-- the exact ALTER TABLE pattern of 0016_gate_a_completion.sql -- no new
-- tables/sinks, just one bounded aggregate counter on the existing hourly
-- rollup tables.

ALTER TABLE product_hourly_metrics ADD COLUMN continuation_destination_meaningful_start INTEGER NOT NULL DEFAULT 0;
ALTER TABLE product_hourly_locale_metrics ADD COLUMN continuation_destination_meaningful_start INTEGER NOT NULL DEFAULT 0;
