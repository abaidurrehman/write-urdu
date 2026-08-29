-- WU-COMMUNITY-001A: private submission foundation for moderated Urdu Writers publishing.
-- Additive only. Reuses METRICS_DB. Must not alter telemetry, share-artifact, Auth.js or writing_documents tables.
-- community_writing_publications is created now but receives no rows until the WU-COMMUNITY-001C moderation slice.

CREATE TABLE IF NOT EXISTS "community_writing_submissions" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_document_id" TEXT,
    "publication_id" TEXT,
    "submission_revision" INTEGER NOT NULL DEFAULT 1 CHECK ("submission_revision" >= 1),
    "status" TEXT NOT NULL CHECK ("status" IN ('pending', 'rejected', 'approved', 'withdrawn')),
    "content_format" TEXT NOT NULL CHECK ("content_format" IN ('plain', 'rich')),
    "editor_kind" TEXT NOT NULL CHECK ("editor_kind" IN ('basic', 'rich', 'keyboard', 'voice')),
    "public_author_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "plain_text" TEXT NOT NULL,
    "primary_category" TEXT NOT NULL,
    "tags_json" TEXT NOT NULL,
    "rights_confirmed" INTEGER NOT NULL CHECK ("rights_confirmed" IN (0, 1)),
    "public_confirmed" INTEGER NOT NULL CHECK ("public_confirmed" IN (0, 1)),
    "guidelines_version" TEXT NOT NULL,
    "content_signature" TEXT NOT NULL,
    "submitted_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "reviewed_at" TEXT,
    "reviewed_by" TEXT,
    "rejection_code" TEXT,
    "rejection_note" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_community_submissions_status_submitted"
    ON "community_writing_submissions" ("status", "submitted_at");

CREATE INDEX IF NOT EXISTS "idx_community_submissions_user_submitted"
    ON "community_writing_submissions" ("user_id", "submitted_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_community_submissions_user_status_submitted"
    ON "community_writing_submissions" ("user_id", "status", "submitted_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_community_submissions_publication_revision"
    ON "community_writing_submissions" ("publication_id", "submission_revision" DESC);

CREATE INDEX IF NOT EXISTS "idx_community_submissions_signature_submitted"
    ON "community_writing_submissions" ("content_signature", "submitted_at" DESC);

CREATE TABLE IF NOT EXISTS "community_writing_publications" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "source_submission_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL CHECK ("status" IN ('published', 'unpublished')),
    "public_author_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "plain_text" TEXT NOT NULL,
    "content_format" TEXT NOT NULL CHECK ("content_format" IN ('plain', 'rich')),
    "primary_category" TEXT NOT NULL,
    "tags_json" TEXT NOT NULL,
    "published_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "last_report_at" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_community_publications_status_published"
    ON "community_writing_publications" ("status", "published_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_community_publications_status_category_published"
    ON "community_writing_publications" ("status", "primary_category", "published_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_community_publications_user_status_published"
    ON "community_writing_publications" ("user_id", "status", "published_at" DESC);

CREATE TABLE IF NOT EXISTS "community_writing_reports" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "publication_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL CHECK ("reason" IN ('spam', 'abuse', 'privacy', 'copyright', 'other')),
    "created_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_community_reports_publication_created"
    ON "community_writing_reports" ("publication_id", "created_at" DESC);
