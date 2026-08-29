import { validPrimaryCategory, normalizeTags } from './community-taxonomy.mjs';
import { excerpt } from '../_lib/share-artifacts.js';

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QUEUE_LIMIT = 50;
const MAX_REJECTION_NOTE_CHARS = 500;
const NULL_BYTE_PATTERN = new RegExp(String.fromCharCode(0), 'g');
const SLUG_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const ACCESS_EMAIL_HEADER = 'cf-access-authenticated-user-email';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REJECTION_CODES = Object.freeze([
  'incomplete_or_low_quality',
  'spam_or_promotion',
  'abusive_or_hateful',
  'sexual_or_unsafe',
  'personal_information',
  'copyright_or_ownership',
  'plagiarism_concern',
  'off_topic',
  'needs_writer_revision',
  'other'
]);
const REJECTION_CODE_SET = new Set(REJECTION_CODES);

const QUEUE_STATUSES = Object.freeze(['pending', 'approved', 'rejected', 'withdrawn']);

function hasD1Binding(database) {
  return Boolean(database && typeof database.prepare === 'function');
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

function error(status, code, extra = {}) {
  return json(status, { error: { code, ...extra } });
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function charLength(value) {
  return Array.from(typeof value === 'string' ? value : '').length;
}

function validId(value) {
  return ID_PATTERN.test(trimmedString(value));
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

function normalizedModeratorAllowlist(env) {
  const raw = stringValue(env?.COMMUNITY_MODERATOR_EMAILS);
  if (!raw.trim()) return null;
  return new Set(raw.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean));
}

// Fail-closed baseline per WU-COMMUNITY-001C: the repo has no Cloudflare Access
// JWT verification anywhere, so this trusts Cf-Access-Authenticated-User-Email
// the way product-pulse.js trusts hostname alone -- only sound because Access
// itself is configured on PRODUCT_OS_HOST at the Cloudflare edge and strips any
// client-supplied copy of this header before it reaches the Worker.
function allowedModerationHost(request, env) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  const configured = String(env.PRODUCT_OS_HOST || 'os.write-urdu.com').toLowerCase();
  return hostname === configured || hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function requireModerationContext(request, env = {}) {
  if (!allowedModerationHost(request, env)) return { response: error(404, 'not_found') };
  if (!hasD1Binding(env.METRICS_DB)) return { response: error(503, 'community_moderation_unavailable') };

  const moderatorEmail = trimmedString(request.headers.get(ACCESS_EMAIL_HEADER)).toLowerCase();
  if (!moderatorEmail || !EMAIL_PATTERN.test(moderatorEmail)) {
    return { response: error(401, 'moderator_identity_required') };
  }

  const allowlist = normalizedModeratorAllowlist(env);
  if (allowlist && !allowlist.has(moderatorEmail)) {
    return { response: error(403, 'moderator_not_authorized') };
  }

  return { db: env.METRICS_DB, moderatorEmail };
}

function normalizeRejectionNote(value) {
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== 'string') return { error: 'community_rejection_note_invalid' };
  const note = value.replace(NULL_BYTE_PATTERN, '').replace(/\r\n?/g, '\n').trim();
  if (!note) return { value: null };
  if (charLength(note) > MAX_REJECTION_NOTE_CHARS) return { error: 'community_rejection_note_too_long' };
  return { value: note };
}

function validRejectionCode(value) {
  return typeof value === 'string' && REJECTION_CODE_SET.has(value);
}

function slugFragment(source) {
  const ascii = String(source || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return ascii;
}

function randomSlugPrefix(length) {
  const result = [];
  const bytes = new Uint8Array(length * 2);
  while (result.length < length) {
    crypto.getRandomValues(bytes);
    for (let index = 0; index < bytes.length && result.length < length; index += 1) {
      const value = bytes[index];
      if (value >= 224) continue;
      result.push(SLUG_ALPHABET[value % SLUG_ALPHABET.length]);
    }
  }
  return result.join('');
}

function mapQueueRow(row) {
  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    editorKind: stringValue(row.editorKind ?? row.editor_kind),
    contentFormat: stringValue(row.contentFormat ?? row.content_format),
    plainTextPreview: excerpt(row.plainText ?? row.plain_text, 180),
    submissionRevision: Number(row.submissionRevision ?? row.submission_revision) || 1,
    status: stringValue(row.status),
    publicationId: row.publicationId ?? row.publication_id ?? null,
    isRevision: Boolean(row.publicationId ?? row.publication_id),
    reportCount: Number(row.reportCount ?? row.report_count ?? 0) || 0,
    lastReportAt: row.lastReportAt ?? row.last_report_at ?? null,
    submittedAt: stringValue(row.submittedAt ?? row.submitted_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at)
  };
}

function mapDetailRow(row) {
  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    editorKind: stringValue(row.editorKind ?? row.editor_kind),
    contentFormat: stringValue(row.contentFormat ?? row.content_format),
    content: stringValue(row.content),
    plainText: stringValue(row.plainText ?? row.plain_text),
    submissionRevision: Number(row.submissionRevision ?? row.submission_revision) || 1,
    status: stringValue(row.status),
    publicationId: row.publicationId ?? row.publication_id ?? null,
    isRevision: Boolean(row.publicationId ?? row.publication_id),
    submittedAt: stringValue(row.submittedAt ?? row.submitted_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at),
    reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
    reviewedBy: row.reviewedBy ?? row.reviewed_by ?? null,
    rejectionCode: row.rejectionCode ?? row.rejection_code ?? null,
    rejectionNote: row.rejectionNote ?? row.rejection_note ?? null
  };
}

function mapPublication(row) {
  if (!row) return null;
  return {
    id: stringValue(row.id),
    sourceSubmissionId: stringValue(row.sourceSubmissionId ?? row.source_submission_id),
    slug: stringValue(row.slug),
    status: stringValue(row.status),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    title: stringValue(row.title),
    content: stringValue(row.content),
    plainText: stringValue(row.plainText ?? row.plain_text),
    contentFormat: stringValue(row.contentFormat ?? row.content_format),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    publishedAt: stringValue(row.publishedAt ?? row.published_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at),
    reportCount: Number(row.reportCount ?? row.report_count ?? 0) || 0,
    lastReportAt: row.lastReportAt ?? row.last_report_at ?? null
  };
}

export function createModerationRepository(db) {
  if (!hasD1Binding(db)) throw new TypeError('Community moderation requires a D1 binding.');

  return Object.freeze({
    async listQueue(status, cursor) {
      const conditions = ['s.status = ?1'];
      const binds = [status];
      let bindIndex = 2;
      if (cursor && cursor.submittedAt && cursor.id) {
        conditions.push(`(s.submitted_at < ?${bindIndex} OR (s.submitted_at = ?${bindIndex} AND s.id < ?${bindIndex + 1}))`);
        binds.push(cursor.submittedAt, cursor.id);
        bindIndex += 2;
      }
      const sql = `SELECT
          s.id, s.title, s.public_author_name AS publicAuthorName, s.primary_category AS primaryCategory,
          s.tags_json AS tagsJson, s.editor_kind AS editorKind, s.content_format AS contentFormat,
          s.plain_text AS plainText, s.submission_revision AS submissionRevision, s.status,
          s.publication_id AS publicationId, s.submitted_at AS submittedAt, s.updated_at AS updatedAt,
          p.report_count AS reportCount, p.last_report_at AS lastReportAt
        FROM community_writing_submissions s
        LEFT JOIN community_writing_publications p ON p.id = s.publication_id
        WHERE ${conditions.join(' AND ')}
        ORDER BY s.submitted_at DESC, s.id DESC
        LIMIT ${QUEUE_LIMIT}`;
      const result = await db.prepare(sql).bind(...binds).all();
      const rows = Array.isArray(result?.results) ? result.results : [];
      return rows.map(mapQueueRow);
    },

    async getDetail(id) {
      const row = await db.prepare(`SELECT
          id, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, editor_kind AS editorKind, content_format AS contentFormat,
          content, plain_text AS plainText, submission_revision AS submissionRevision, status,
          publication_id AS publicationId, submitted_at AS submittedAt, updated_at AS updatedAt,
          reviewed_at AS reviewedAt, reviewed_by AS reviewedBy, rejection_code AS rejectionCode,
          rejection_note AS rejectionNote
        FROM community_writing_submissions WHERE id = ?1`)
        .bind(id)
        .first();
      return row ? mapDetailRow(row) : null;
    },

    async getSubmissionForModeration(id) {
      const row = await db.prepare(`SELECT
          id, user_id AS userId, status, submission_revision AS submissionRevision, publication_id AS publicationId,
          title, content, plain_text AS plainText, public_author_name AS publicAuthorName,
          content_format AS contentFormat, primary_category AS primaryCategory, tags_json AS tagsJson
        FROM community_writing_submissions WHERE id = ?1`)
        .bind(id)
        .first();
      return row || null;
    },

    async getPublication(id) {
      const row = await db.prepare(`SELECT
          id, source_submission_id AS sourceSubmissionId, slug, status,
          public_author_name AS publicAuthorName, title, content, plain_text AS plainText,
          content_format AS contentFormat, primary_category AS primaryCategory, tags_json AS tagsJson,
          published_at AS publishedAt, updated_at AS updatedAt, report_count AS reportCount,
          last_report_at AS lastReportAt
        FROM community_writing_publications WHERE id = ?1`)
        .bind(id)
        .first();
      return mapPublication(row);
    },

    async slugTaken(slug) {
      const row = await db.prepare('SELECT 1 AS found FROM community_writing_publications WHERE slug = ?1').bind(slug).first();
      return Boolean(row);
    },

    async claimApproval(id, expectedRevision, publicationId, moderatorEmail, now) {
      const result = await db.prepare(`UPDATE community_writing_submissions
        SET status = 'approved', reviewed_at = ?1, reviewed_by = ?2, publication_id = ?3
        WHERE id = ?4 AND status = 'pending' AND submission_revision = ?5`)
        .bind(now, moderatorEmail, publicationId, id, expectedRevision)
        .run();
      return resultChanges(result) > 0;
    },

    async insertPublication(publication) {
      await db.prepare(`INSERT INTO community_writing_publications (
          id, source_submission_id, user_id, slug, status, public_author_name, title, content,
          plain_text, content_format, primary_category, tags_json, published_at, updated_at,
          report_count, last_report_at
        ) VALUES (?1, ?2, ?3, ?4, 'published', ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?12, 0, NULL)`)
        .bind(
          publication.id, publication.sourceSubmissionId, publication.userId, publication.slug,
          publication.publicAuthorName, publication.title, publication.content, publication.plainText,
          publication.contentFormat, publication.primaryCategory, JSON.stringify(publication.tags),
          publication.now
        )
        .run();
    },

    async replacePublicationSnapshot(publicationId, snapshot) {
      await db.prepare(`UPDATE community_writing_publications
        SET public_author_name = ?1, title = ?2, content = ?3, plain_text = ?4, content_format = ?5,
            primary_category = ?6, tags_json = ?7, source_submission_id = ?8, updated_at = ?9
        WHERE id = ?10`)
        .bind(
          snapshot.publicAuthorName, snapshot.title, snapshot.content, snapshot.plainText,
          snapshot.contentFormat, snapshot.primaryCategory, JSON.stringify(snapshot.tags),
          snapshot.sourceSubmissionId, snapshot.now, publicationId
        )
        .run();
    },

    async revertClaimedApproval(id, publicationId) {
      await db.prepare(`UPDATE community_writing_submissions
        SET status = 'pending', reviewed_at = NULL, reviewed_by = NULL, publication_id = NULL
        WHERE id = ?1 AND status = 'approved' AND publication_id = ?2`)
        .bind(id, publicationId)
        .run();
    },

    async reject(id, expectedRevision, rejectionCode, rejectionNote, moderatorEmail, now) {
      const result = await db.prepare(`UPDATE community_writing_submissions
        SET status = 'rejected', reviewed_at = ?1, reviewed_by = ?2, rejection_code = ?3, rejection_note = ?4
        WHERE id = ?5 AND status = 'pending' AND submission_revision = ?6`)
        .bind(now, moderatorEmail, rejectionCode, rejectionNote, id, expectedRevision)
        .run();
      return resultChanges(result) > 0;
    },

    async unpublish(publicationId, now) {
      const result = await db.prepare(`UPDATE community_writing_publications
        SET status = 'unpublished', unpublished_by = 'moderator', updated_at = ?1 WHERE id = ?2 AND status = 'published'`)
        .bind(now, publicationId)
        .run();
      return resultChanges(result) > 0;
    }
  });
}

async function createUniqueSlug(repository, title, primaryCategory) {
  const fragment = slugFragment(title) || slugFragment(primaryCategory) || 'writing';
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = `${randomSlugPrefix(4)}-${fragment}`;
    if (!(await repository.slugTaken(slug))) return slug;
  }
  throw new Error('slug_generation_failed');
}

export async function handleModerationQueue(request, env = {}, dependencies = {}) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed');
  const context = await requireModerationContext(request, env);
  if (context.response) return context.response;

  const url = new URL(request.url);
  const status = trimmedString(url.searchParams.get('status')) || 'pending';
  if (!QUEUE_STATUSES.includes(status)) return error(400, 'community_moderation_status_invalid');

  let cursor = null;
  const cursorParam = trimmedString(url.searchParams.get('cursor'));
  if (cursorParam) {
    const [submittedAt, id] = cursorParam.split('|');
    if (!submittedAt || !validId(id)) return error(400, 'community_moderation_cursor_invalid');
    cursor = { submittedAt, id };
  }

  const repositoryFactory = dependencies.repositoryFactory || createModerationRepository;
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_moderation_unavailable');
  }

  try {
    const items = await repository.listQueue(status, cursor);
    const nextCursor = items.length === QUEUE_LIMIT
      ? `${items[items.length - 1].submittedAt}|${items[items.length - 1].id}`
      : null;
    return json(200, { items, nextCursor });
  } catch {
    return error(503, 'community_moderation_unavailable');
  }
}

export async function handleModerationDetail(request, env = {}, id, dependencies = {}) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed');
  if (!validId(id)) return error(404, 'community_submission_not_found');
  const context = await requireModerationContext(request, env);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createModerationRepository;
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_moderation_unavailable');
  }

  try {
    const submission = await repository.getDetail(id);
    if (!submission) return error(404, 'community_submission_not_found');
    let publication = null;
    if (submission.publicationId) publication = await repository.getPublication(submission.publicationId);
    return json(200, { submission, publication });
  } catch {
    return error(503, 'community_moderation_unavailable');
  }
}

export async function handleModerationApprove(request, env = {}, id, dependencies = {}) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed');
  if (!validId(id)) return error(404, 'community_submission_not_found');
  const context = await requireModerationContext(request, env);
  if (context.response) return context.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return error(400, 'invalid_json');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return error(400, 'invalid_json');

  const expectedRevision = Number(payload.submissionRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return error(400, 'community_submission_revision_required');
  }

  let adjustedCategory;
  let adjustedTags;
  if (payload.primaryCategory !== undefined) {
    if (!validPrimaryCategory(payload.primaryCategory)) return error(400, 'community_primary_category_invalid');
    adjustedCategory = payload.primaryCategory;
  }
  if (payload.tags !== undefined) {
    const tagsResult = normalizeTags(payload.tags);
    if (tagsResult.error) return error(400, tagsResult.error);
    adjustedTags = tagsResult.value;
  }

  const repositoryFactory = dependencies.repositoryFactory || createModerationRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  const randomUUID = dependencies.randomUUID || (() => crypto.randomUUID());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_moderation_unavailable');
  }

  try {
    const submission = await repository.getSubmissionForModeration(id);
    if (!submission) return error(404, 'community_submission_not_found');

    if (submission.status === 'approved' && Number(submission.submissionRevision) === expectedRevision && submission.publicationId) {
      const publication = await repository.getPublication(submission.publicationId);
      if (publication) return json(200, { status: 'already_approved', submission: await repository.getDetail(id), publication });
    }

    if (submission.status !== 'pending') {
      return error(409, 'community_moderation_conflict', {
        currentStatus: submission.status,
        currentRevision: Number(submission.submissionRevision) || 1
      });
    }
    if (Number(submission.submissionRevision) !== expectedRevision) {
      return error(409, 'community_moderation_stale_review', {
        currentRevision: Number(submission.submissionRevision) || 1
      });
    }

    const category = adjustedCategory !== undefined ? adjustedCategory : submission.primaryCategory;
    const tags = adjustedTags !== undefined ? adjustedTags : parseTags(submission.tagsJson);
    const timestamp = now();

    if (!submission.publicationId) {
      const publicationId = randomUUID();
      const slug = await createUniqueSlug(repository, submission.title, category);

      const claimed = await repository.claimApproval(id, expectedRevision, publicationId, context.moderatorEmail, timestamp);
      if (!claimed) {
        const current = await repository.getSubmissionForModeration(id);
        return error(409, 'community_moderation_stale_review', {
          currentRevision: Number(current?.submissionRevision) || expectedRevision,
          currentStatus: current?.status || 'pending'
        });
      }

      try {
        await repository.insertPublication({
          id: publicationId,
          sourceSubmissionId: id,
          userId: submission.userId,
          slug,
          publicAuthorName: submission.publicAuthorName,
          title: submission.title,
          content: submission.content,
          plainText: submission.plainText,
          contentFormat: submission.contentFormat,
          primaryCategory: category,
          tags,
          now: timestamp
        });
      } catch {
        await repository.revertClaimedApproval(id, publicationId);
        return error(503, 'community_moderation_approval_failed');
      }

      return json(201, { status: 'approved', submission: await repository.getDetail(id), publication: await repository.getPublication(publicationId) });
    }

    const publicationId = submission.publicationId;
    const claimed = await repository.claimApproval(id, expectedRevision, publicationId, context.moderatorEmail, timestamp);
    if (!claimed) {
      const current = await repository.getSubmissionForModeration(id);
      return error(409, 'community_moderation_stale_review', {
        currentRevision: Number(current?.submissionRevision) || expectedRevision,
        currentStatus: current?.status || 'pending'
      });
    }

    await repository.replacePublicationSnapshot(publicationId, {
      publicAuthorName: submission.publicAuthorName,
      title: submission.title,
      content: submission.content,
      plainText: submission.plainText,
      contentFormat: submission.contentFormat,
      primaryCategory: category,
      tags,
      sourceSubmissionId: id,
      now: timestamp
    });

    return json(200, { status: 'approved', submission: await repository.getDetail(id), publication: await repository.getPublication(publicationId) });
  } catch {
    return error(503, 'community_moderation_unavailable');
  }
}

export async function handleModerationReject(request, env = {}, id, dependencies = {}) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed');
  if (!validId(id)) return error(404, 'community_submission_not_found');
  const context = await requireModerationContext(request, env);
  if (context.response) return context.response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return error(400, 'invalid_json');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return error(400, 'invalid_json');

  const expectedRevision = Number(payload.submissionRevision);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    return error(400, 'community_submission_revision_required');
  }
  if (!validRejectionCode(payload.rejectionCode)) return error(400, 'community_rejection_code_invalid');
  const noteResult = normalizeRejectionNote(payload.rejectionNote);
  if (noteResult.error) return error(400, noteResult.error);

  const repositoryFactory = dependencies.repositoryFactory || createModerationRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_moderation_unavailable');
  }

  try {
    const submission = await repository.getSubmissionForModeration(id);
    if (!submission) return error(404, 'community_submission_not_found');

    if (submission.status !== 'pending') {
      return error(409, 'community_moderation_conflict', {
        currentStatus: submission.status,
        currentRevision: Number(submission.submissionRevision) || 1
      });
    }

    const rejected = await repository.reject(id, expectedRevision, payload.rejectionCode, noteResult.value, context.moderatorEmail, now());
    if (!rejected) {
      const current = await repository.getSubmissionForModeration(id);
      return error(409, 'community_moderation_stale_review', {
        currentRevision: Number(current?.submissionRevision) || expectedRevision,
        currentStatus: current?.status || 'pending'
      });
    }

    return json(200, { status: 'rejected', submission: await repository.getDetail(id) });
  } catch {
    return error(503, 'community_moderation_unavailable');
  }
}

export async function handlePublicationUnpublish(request, env = {}, id, dependencies = {}) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed');
  if (!validId(id)) return error(404, 'community_publication_not_found');
  const context = await requireModerationContext(request, env);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createModerationRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_moderation_unavailable');
  }

  try {
    const publication = await repository.getPublication(id);
    if (!publication) return error(404, 'community_publication_not_found');
    if (publication.status === 'unpublished') {
      return json(200, { status: 'unpublished', publication });
    }

    const changed = await repository.unpublish(id, now());
    if (!changed) return error(409, 'community_moderation_conflict', { currentStatus: publication.status });

    return json(200, { status: 'unpublished', publication: await repository.getPublication(id) });
  } catch {
    return error(503, 'community_moderation_unavailable');
  }
}

export const COMMUNITY_MODERATION_INTERNALS = Object.freeze({
  validId,
  slugFragment,
  normalizeRejectionNote,
  validRejectionCode,
  allowedModerationHost,
  QUEUE_LIMIT,
  MAX_REJECTION_NOTE_CHARS
});
