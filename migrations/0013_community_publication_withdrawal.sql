-- WU-COMMUNITY-001E: distinguish writer withdrawal from moderator removal.
-- Additive only. NULL rows (all pre-existing published/unpublished rows) satisfy this CHECK
-- because SQLite treats a NULL comparison in a CHECK as non-failing.

ALTER TABLE "community_writing_publications"
    ADD COLUMN "unpublished_by" TEXT CHECK ("unpublished_by" IN ('author', 'moderator'));
