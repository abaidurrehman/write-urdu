import {
  requireCommunityContext,
  normalizeCreateInput,
  readJson,
  createSubmissionRepository,
  COMMUNITY_SUBMISSION_LIMITS
} from './community-submissions.mjs';
import { excerpt } from '../_lib/share-artifacts.js';

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIST_LIMIT = 200;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function hasD1Binding(database) {
  return Boolean(database && typeof database.prepare === 'function');
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function validId(value) {
  return ID_PATTERN.test(trimmedString(value));
}

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...extraHeaders
    }
  });
}

function error(status, code, extra = {}, headers = {}) {
  return json(status, { error: { code, ...extra } }, headers);
}

function resultChanges(result) {
  const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
  return Number.isFinite(changes) ? changes : 0;
}

function parseTags(value) {
  try {
    const parsed = JSON.parse(stringValue(value) || '[]');
    return Array.isArray(parsed) ? parsed.map(stringValue) : [];
  } catch {
    return [];
  }
}

// Flat per-submission rows, same shape as the moderation queue -- a published item with a
// pending revision shows up as two rows sharing publicationId. Grouping into one card is a
// client-side concern (js/community-my-publications-state.mjs), not this repository's job.
function mapMyPublicationRow(row) {
  return {
    submissionId: stringValue(row.submissionId),
    publicationId: row.publicationId ?? null,
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName),
    primaryCategory: stringValue(row.primaryCategory),
    tags: parseTags(row.tagsJson),
    submissionStatus: stringValue(row.submissionStatus),
    publicationStatus: row.publicationStatus ?? null,
    submissionRevision: Number(row.submissionRevision) || 1,
    isRevision: Boolean(row.publicationId),
    plainTextPreview: excerpt(row.plainText, 160),
    submittedAt: stringValue(row.submittedAt),
    updatedAt: stringValue(row.updatedAt),
    reviewedAt: row.reviewedAt ?? null,
    publishedAt: row.publishedAt ?? null,
    rejectionCode: row.rejectionCode ?? null,
    rejectionNote: row.rejectionNote ?? null,
    publicSlug: row.publicSlug ?? null,
    unpublishedBy: row.unpublishedBy ?? null,
    sourceDocumentId: row.sourceDocumentId ?? null
  };
}

export function createMyPublicationsRepository(db) {
  if (!hasD1Binding(db)) throw new TypeError('My Publications requires a D1 binding.');

  return Object.freeze({
    async list(userId) {
      const result = await db.prepare(`SELECT
          s.id AS submissionId, s.publication_id AS publicationId, s.title,
          s.public_author_name AS publicAuthorName, s.primary_category AS primaryCategory,
          s.tags_json AS tagsJson, s.status AS submissionStatus, s.submission_revision AS submissionRevision,
          s.plain_text AS plainText,
          s.submitted_at AS submittedAt, s.updated_at AS updatedAt, s.reviewed_at AS reviewedAt,
          s.rejection_code AS rejectionCode, s.rejection_note AS rejectionNote,
          s.source_document_id AS sourceDocumentId,
          p.status AS publicationStatus, p.slug AS publicSlug, p.published_at AS publishedAt,
          p.unpublished_by AS unpublishedBy
        FROM community_writing_submissions s
        LEFT JOIN community_writing_publications p ON p.id = s.publication_id
        WHERE s.user_id = ?1
        ORDER BY s.updated_at DESC
        LIMIT ${LIST_LIMIT}`)
        .bind(userId)
        .run();
      const rows = Array.isArray(result?.results) ? result.results : [];
      return rows.map(mapMyPublicationRow);
    },

    async getOwnedSubmission(userId, submissionId) {
      const row = await db.prepare(`SELECT id, publication_id AS publicationId
          FROM community_writing_submissions WHERE id = ?1 AND user_id = ?2`)
        .bind(submissionId, userId)
        .first();
      return row ? { id: stringValue(row.id), publicationId: row.publicationId ?? null } : null;
    },

    async getOwnedPublication(userId, publicationId) {
      const row = await db.prepare(`SELECT id, status, unpublished_by AS unpublishedBy
          FROM community_writing_publications WHERE id = ?1 AND user_id = ?2`)
        .bind(publicationId, userId)
        .first();
      return row
        ? { id: stringValue(row.id), status: stringValue(row.status), unpublishedBy: row.unpublishedBy ?? null }
        : null;
    },

    async nextRevisionNumber(publicationId) {
      const row = await db.prepare(`SELECT COALESCE(MAX(submission_revision), 0) AS maxRevision
          FROM community_writing_submissions WHERE publication_id = ?1`)
        .bind(publicationId)
        .first();
      return (Number(row?.maxRevision) || 0) + 1;
    },

    async createRevision(userId, publicationId, input, revisionNumber, now, id) {
      await db.prepare(`INSERT INTO community_writing_submissions (
          id, user_id, source_document_id, publication_id, submission_revision, status,
          content_format, editor_kind, public_author_name, title, content, plain_text,
          primary_category, tags_json, rights_confirmed, public_confirmed, guidelines_version,
          content_signature, submitted_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 1, 1, ?14, ?15, ?16, ?16)`)
        .bind(
          id, userId, input.sourceDocumentId, publicationId, revisionNumber, input.contentFormat,
          input.editorKind, input.publicAuthorName, input.title, input.content, input.plainText,
          input.primaryCategory, JSON.stringify(input.tags), input.guidelinesVersion,
          input.contentSignature, now
        )
        .run();

      const row = await db.prepare(`SELECT
          id, source_document_id AS sourceDocumentId, publication_id AS publicationId,
          submission_revision AS submissionRevision, status, content_format AS contentFormat,
          editor_kind AS editorKind, public_author_name AS publicAuthorName, title, content,
          plain_text AS plainText, primary_category AS primaryCategory, tags_json AS tagsJson,
          submitted_at AS submittedAt, updated_at AS updatedAt
        FROM community_writing_submissions WHERE id = ?1`)
        .bind(id)
        .first();

      return {
        id: stringValue(row.id),
        sourceDocumentId: row.sourceDocumentId ?? null,
        publicationId: row.publicationId ?? null,
        submissionRevision: Number(row.submissionRevision) || 1,
        status: stringValue(row.status),
        contentFormat: stringValue(row.contentFormat),
        editorKind: stringValue(row.editorKind),
        publicAuthorName: stringValue(row.publicAuthorName),
        title: stringValue(row.title),
        content: stringValue(row.content),
        plainText: stringValue(row.plainText),
        primaryCategory: stringValue(row.primaryCategory),
        tags: parseTags(row.tagsJson),
        submittedAt: stringValue(row.submittedAt),
        updatedAt: stringValue(row.updatedAt)
      };
    },

    async withdraw(userId, publicationId, now) {
      const result = await db.prepare(`UPDATE community_writing_publications
        SET status = 'unpublished', unpublished_by = 'author', updated_at = ?1
        WHERE id = ?2 AND user_id = ?3 AND status = 'published'`)
        .bind(now, publicationId, userId)
        .run();
      return resultChanges(result) > 0;
    }
  });
}

export async function handleMyPublicationsList(request, env = {}, dependencies = {}) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed', {}, { Allow: 'GET' });

  const context = await requireCommunityContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createMyPublicationsRepository;
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_submissions_unavailable');
  }

  try {
    return json(200, { items: await repository.list(context.userId) });
  } catch {
    return error(503, 'community_submissions_unavailable');
  }
}

export async function handleSubmissionRevise(request, env = {}, submissionId, dependencies = {}) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', {}, { Allow: 'POST' });
  if (!validId(submissionId)) return error(404, 'community_submission_not_found');

  const context = await requireCommunityContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const myRepositoryFactory = dependencies.myRepositoryFactory || createMyPublicationsRepository;
  const submissionRepositoryFactory = dependencies.submissionRepositoryFactory || createSubmissionRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  const randomUUID = dependencies.randomUUID || (() => crypto.randomUUID());
  let myRepository;
  let submissionRepository;
  try {
    myRepository = myRepositoryFactory(context.db);
    submissionRepository = submissionRepositoryFactory(context.db);
  } catch {
    return error(503, 'community_submissions_unavailable');
  }

  try {
    const owned = await myRepository.getOwnedSubmission(context.userId, submissionId);
    if (!owned || !owned.publicationId) return error(404, 'community_submission_not_found');

    const publication = await myRepository.getOwnedPublication(context.userId, owned.publicationId);
    if (!publication || publication.status !== 'published') {
      return error(409, 'community_publication_not_revisable');
    }

    const parsed = await readJson(request);
    if (parsed.response) return parsed.response;
    const normalized = await normalizeCreateInput(parsed.payload);
    if (normalized.error) return error(400, normalized.error);

    if (normalized.value.sourceDocumentId) {
      const owns = await submissionRepository.verifyDocumentOwnership(context.userId, normalized.value.sourceDocumentId);
      if (!owns) return error(400, 'community_source_document_invalid');
    }

    const duplicate = await submissionRepository.findPendingDuplicate(context.userId, normalized.value.contentSignature);
    if (duplicate && duplicate.publicationId === publication.id) return json(200, { submission: duplicate });

    if (await submissionRepository.countPending(context.userId) >= COMMUNITY_SUBMISSION_LIMITS.maxPendingPerUser) {
      return error(409, 'community_pending_quota_reached', { limit: COMMUNITY_SUBMISSION_LIMITS.maxPendingPerUser });
    }

    const sinceIso = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString();
    if (await submissionRepository.countSince(context.userId, sinceIso) >= COMMUNITY_SUBMISSION_LIMITS.maxSubmissionsPer24h) {
      return error(429, 'community_submission_rate_limited', { limit: COMMUNITY_SUBMISSION_LIMITS.maxSubmissionsPer24h });
    }

    const revisionNumber = await myRepository.nextRevisionNumber(publication.id);
    const id = randomUUID();
    if (!validId(id)) return error(503, 'community_submissions_unavailable');
    const submission = await myRepository.createRevision(context.userId, publication.id, normalized.value, revisionNumber, now(), id);
    return json(201, { submission });
  } catch {
    return error(503, 'community_submissions_unavailable');
  }
}

export async function handlePublicationWithdraw(request, env = {}, publicationId, dependencies = {}) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', {}, { Allow: 'POST' });
  if (!validId(publicationId)) return error(404, 'community_publication_not_found');

  const context = await requireCommunityContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createMyPublicationsRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_submissions_unavailable');
  }

  try {
    const publication = await repository.getOwnedPublication(context.userId, publicationId);
    if (!publication) return error(404, 'community_publication_not_found');

    if (publication.status === 'unpublished') {
      return json(200, { status: 'unpublished', withdrawnByAuthor: publication.unpublishedBy === 'author' });
    }

    const changed = await repository.withdraw(context.userId, publicationId, now());
    if (!changed) {
      const current = await repository.getOwnedPublication(context.userId, publicationId);
      return json(200, { status: current?.status || 'unpublished', withdrawnByAuthor: current?.unpublishedBy === 'author' });
    }

    return json(200, { status: 'unpublished', withdrawnByAuthor: true });
  } catch {
    return error(503, 'community_submissions_unavailable');
  }
}

export const COMMUNITY_MY_PUBLICATIONS_INTERNALS = Object.freeze({
  validId
});
