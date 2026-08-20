-- WU-DRAFT-001 DOC-A: account-backed writing in WriteUrdu's existing D1 database.
-- Additive only. This migration must not alter telemetry, share-artifact, or Auth.js tables.

CREATE TABLE IF NOT EXISTS "writing_documents" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "user_id" TEXT NOT NULL,
    "editor_kind" TEXT NOT NULL CHECK ("editor_kind" IN ('basic', 'rich', 'keyboard')),
    "title" TEXT,
    "content" TEXT NOT NULL,
    "plain_text" TEXT,
    "format_version" INTEGER NOT NULL DEFAULT 1 CHECK ("format_version" >= 1),
    "revision" INTEGER NOT NULL DEFAULT 1 CHECK ("revision" >= 1),
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_writing_documents_user_updated"
    ON "writing_documents" ("user_id", "updated_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_writing_documents_user_id"
    ON "writing_documents" ("user_id", "id");
