import { validPrimaryCategory, normalizeTags } from './community-taxonomy.mjs';
import {
  validateContentFormat,
  validateTitle,
  validatePublicAuthorName,
  validatePlainText,
  contentSignature
} from './community-content.mjs';

const MAX_REQUEST_BYTES = 700 * 1024;
const MAX_PENDING_PER_USER = 5;
const MAX_SUBMISSIONS_PER_24H = 10;
const LIST_LIMIT = 200;
const ALLOWED_EDITOR_KINDS = Object.freeze(['basic', 'rich', 'keyboard', 'voice', 'card']);
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_GUIDELINES_VERSION_CHARS = 40;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const COMMUNITY_SUBMISSION_LIMITS = Object.freeze({
  maxPendingPerUser: MAX_PENDING_PER_USER,
  maxSubmissionsPer24h: MAX_SUBMISSIONS_PER_24H,
  allowedEditorKinds: ALLOWED_EDITOR_KINDS
});

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

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

function error(status, code, extra = {}, headers = {}) {
  return json(status, { error: { code, ...extra } }, headers);
}

function communitySubmissionsFeatureState(env = {}) {
  if (env.COMMUNITY_SUBMISSIONS_ENABLED !== 'true') return 'disabled';
  if (!hasD1Binding(env.METRICS_DB)) return 'unavailable';
  return 'ready';
}

function validId(value) {
  return ID_PATTERN.test(trimmedString(value));
}

function validEditorKind(value) {
  return ALLOWED_EDITOR_KINDS.includes(value);
}

function validGuidelinesVersion(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_GUIDELINES_VERSION_CHARS;
}

async function normalizeCreateInput(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'invalid_submission' };
  }

  const editorKind = trimmedString(payload.editorKind);
  if (!validEditorKind(editorKind)) return { error: 'community_editor_kind_invalid' };

  const contentFormatResult = validateContentFormat(trimmedString(payload.contentFormat));
  if (contentFormatResult.error) return { error: contentFormatResult.error };

  const titleResult = validateTitle(payload.title);
  if (titleResult.error) return { error: titleResult.error };

  const publicAuthorNameResult = validatePublicAuthorName(payload.publicAuthorName);
  if (publicAuthorNameResult.error) return { error: publicAuthorNameResult.error };

  const plainTextResult = validatePlainText(payload.plainText);
  if (plainTextResult.error) return { error: plainTextResult.error };

  if (!validPrimaryCategory(payload.primaryCategory)) return { error: 'community_primary_category_invalid' };

  const tagsResult = normalizeTags(payload.tags);
  if (tagsResult.error) return { error: tagsResult.error };

  if (payload.rightsConfirmed !== true) return { error: 'community_rights_confirmation_required' };
  if (payload.publicConfirmed !== true) return { error: 'community_public_confirmation_required' };
  if (!validGuidelinesVersion(payload.guidelinesVersion)) return { error: 'community_guidelines_version_invalid' };

  let sourceDocumentId = null;
  if (payload.sourceDocumentId !== undefined && payload.sourceDocumentId !== null) {
    if (typeof payload.sourceDocumentId !== 'string') return { error: 'community_source_document_invalid' };
    sourceDocumentId = trimmedString(payload.sourceDocumentId);
    if (!validId(sourceDocumentId)) return { error: 'community_source_document_invalid' };
  }

  const title = titleResult.value;
  const publicAuthorName = publicAuthorNameResult.value;
  const plainText = plainTextResult.value;
  const primaryCategory = payload.primaryCategory;
  const tags = tagsResult.value;

  const signature = await contentSignature({ title, publicAuthorName, plainText, primaryCategory, tags });

  return {
    value: {
      sourceDocumentId,
      editorKind,
      contentFormat: contentFormatResult.value,
      title,
      publicAuthorName,
      content: plainText,
      plainText,
      primaryCategory,
      tags,
      rightsConfirmed: true,
      publicConfirmed: true,
      guidelinesVersion: payload.guidelinesVersion.trim(),
      contentSignature: signature
    }
  };
}

async function normalizePatchInput(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'invalid_submission_patch' };
  }

  const revision = Number(payload.submissionRevision);
  if (!Number.isInteger(revision) || revision < 1) return { error: 'community_submission_revision_required' };

  const created = await normalizeCreateInput(payload);
  if (created.error) return { error: created.error };

  return { value: { revision, patch: created.value } };
}

async function readJson(request) {
  const contentType = trimmedString(request.headers.get('content-type')).toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return { response: error(415, 'content_type_not_supported') };
  }

  const declared = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    return { response: error(413, 'request_too_large') };
  }

  if (!request.body) return { response: error(400, 'invalid_json') };

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      try { await reader.cancel(); } catch {}
      return { response: error(413, 'request_too_large') };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { payload: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { response: error(400, 'invalid_json') };
  }
}

async function requireCommunityContext(request, env, getSession) {
  const featureState = communitySubmissionsFeatureState(env);
  if (featureState === 'disabled') return { response: error(404, 'community_submissions_not_enabled') };
  if (featureState === 'unavailable') return { response: error(503, 'community_submissions_unavailable') };
  if (typeof getSession !== 'function') return { response: error(503, 'community_submissions_unavailable') };

  let session;
  try {
    session = await getSession(request, env);
  } catch {
    return { response: error(503, 'community_submissions_unavailable') };
  }

  const userId = trimmedString(session?.user?.id);
  if (!userId) return { response: error(401, 'authentication_required') };
  return { userId, db: env.METRICS_DB };
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

function mapSubmission(row) {
  if (!row) return null;
  return {
    id: stringValue(row.id),
    sourceDocumentId: row.sourceDocumentId ?? row.source_document_id ?? null,
    publicationId: row.publicationId ?? row.publication_id ?? null,
    submissionRevision: Number(row.submissionRevision ?? row.submission_revision) || 1,
    status: stringValue(row.status),
    contentFormat: stringValue(row.contentFormat ?? row.content_format),
    editorKind: stringValue(row.editorKind ?? row.editor_kind),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    title: stringValue(row.title),
    content: stringValue(row.content),
    plainText: stringValue(row.plainText ?? row.plain_text),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    submittedAt: stringValue(row.submittedAt ?? row.submitted_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at),
    reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
    rejectionCode: row.rejectionCode ?? row.rejection_code ?? null,
    rejectionNote: row.rejectionNote ?? row.rejection_note ?? null
  };
}

function mapSubmissionMetadata(row) {
  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    publicAuthorName: stringValue(row.publicAuthorName ?? row.public_author_name),
    primaryCategory: stringValue(row.primaryCategory ?? row.primary_category),
    tags: parseTags(row.tagsJson ?? row.tags_json),
    status: stringValue(row.status),
    submissionRevision: Number(row.submissionRevision ?? row.submission_revision) || 1,
    publicationId: row.publicationId ?? row.publication_id ?? null,
    submittedAt: stringValue(row.submittedAt ?? row.submitted_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at),
    reviewedAt: row.reviewedAt ?? row.reviewed_at ?? null,
    rejectionCode: row.rejectionCode ?? row.rejection_code ?? null,
    rejectionNote: row.rejectionNote ?? row.rejection_note ?? null
  };
}

export function createSubmissionRepository(db) {
  if (!hasD1Binding(db)) throw new TypeError('Community submissions require a D1 binding.');

  return Object.freeze({
    async list(userId) {
      const result = await db.prepare(`SELECT
          id, title, public_author_name AS publicAuthorName, primary_category AS primaryCategory,
          tags_json AS tagsJson, status, submission_revision AS submissionRevision,
          publication_id AS publicationId, submitted_at AS submittedAt, updated_at AS updatedAt,
          reviewed_at AS reviewedAt, rejection_code AS rejectionCode, rejection_note AS rejectionNote
        FROM community_writing_submissions
        WHERE user_id = ?1
        ORDER BY updated_at DESC
        LIMIT ${LIST_LIMIT}`)
        .bind(userId)
        .run();
      return Array.isArray(result?.results) ? result.results.map(mapSubmissionMetadata) : [];
    },

    async get(userId, id) {
      const row = await db.prepare(`SELECT
          id, source_document_id AS sourceDocumentId, publication_id AS publicationId,
          submission_revision AS submissionRevision, status, content_format AS contentFormat,
          editor_kind AS editorKind, public_author_name AS publicAuthorName, title, content,
          plain_text AS plainText, primary_category AS primaryCategory, tags_json AS tagsJson,
          submitted_at AS submittedAt, updated_at AS updatedAt, reviewed_at AS reviewedAt,
          rejection_code AS rejectionCode, rejection_note AS rejectionNote
        FROM community_writing_submissions
        WHERE id = ?1 AND user_id = ?2`)
        .bind(id, userId)
        .first();
      return mapSubmission(row);
    },

    async countPending(userId) {
      const row = await db.prepare(`SELECT COUNT(*) AS count FROM community_writing_submissions
          WHERE user_id = ?1 AND status = 'pending'`)
        .bind(userId)
        .first();
      return Number(row?.count) || 0;
    },

    async countSince(userId, sinceIso) {
      const row = await db.prepare(`SELECT COUNT(*) AS count FROM community_writing_submissions
          WHERE user_id = ?1 AND submitted_at >= ?2`)
        .bind(userId, sinceIso)
        .first();
      return Number(row?.count) || 0;
    },

    async findPendingDuplicate(userId, signature) {
      const row = await db.prepare(`SELECT
          id, source_document_id AS sourceDocumentId, publication_id AS publicationId,
          submission_revision AS submissionRevision, status, content_format AS contentFormat,
          editor_kind AS editorKind, public_author_name AS publicAuthorName, title, content,
          plain_text AS plainText, primary_category AS primaryCategory, tags_json AS tagsJson,
          submitted_at AS submittedAt, updated_at AS updatedAt, reviewed_at AS reviewedAt,
          rejection_code AS rejectionCode, rejection_note AS rejectionNote
        FROM community_writing_submissions
        WHERE user_id = ?1 AND content_signature = ?2 AND status = 'pending'
        ORDER BY submitted_at DESC
        LIMIT 1`)
        .bind(userId, signature)
        .first();
      return mapSubmission(row);
    },

    async verifyDocumentOwnership(userId, documentId) {
      const row = await db.prepare('SELECT 1 AS found FROM writing_documents WHERE id = ?1 AND user_id = ?2')
        .bind(documentId, userId)
        .first();
      return Boolean(row);
    },

    async create(userId, input, now, id) {
      await db.prepare(`INSERT INTO community_writing_submissions (
          id, user_id, source_document_id, publication_id, submission_revision, status,
          content_format, editor_kind, public_author_name, title, content, plain_text,
          primary_category, tags_json, rights_confirmed, public_confirmed, guidelines_version,
          content_signature, submitted_at, updated_at
        ) VALUES (?1, ?2, ?3, NULL, 1, 'pending', ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 1, 1, ?12, ?13, ?14, ?14)`)
        .bind(
          id, userId, input.sourceDocumentId, input.contentFormat, input.editorKind,
          input.publicAuthorName, input.title, input.content, input.plainText,
          input.primaryCategory, JSON.stringify(input.tags), input.guidelinesVersion,
          input.contentSignature, now
        )
        .run();
      return this.get(userId, id);
    },

    async updatePending(userId, id, revision, patch, now) {
      const result = await db.prepare(`UPDATE community_writing_submissions
        SET content_format = ?1, editor_kind = ?2, public_author_name = ?3, title = ?4,
            content = ?5, plain_text = ?6, primary_category = ?7, tags_json = ?8,
            guidelines_version = ?9, content_signature = ?10, submission_revision = ?11, updated_at = ?12
        WHERE id = ?13 AND user_id = ?14 AND status = 'pending' AND submission_revision = ?15`)
        .bind(
          patch.contentFormat, patch.editorKind, patch.publicAuthorName, patch.title,
          patch.content, patch.plainText, patch.primaryCategory, JSON.stringify(patch.tags),
          patch.guidelinesVersion, patch.contentSignature, revision + 1, now,
          id, userId, revision
        )
        .run();

      if (resultChanges(result) > 0) {
        return { status: 'updated', submission: await this.get(userId, id) };
      }

      const current = await db.prepare(`SELECT submission_revision AS submissionRevision, status
          FROM community_writing_submissions WHERE id = ?1 AND user_id = ?2`)
        .bind(id, userId)
        .first();
      if (!current) return { status: 'not_found' };
      return {
        status: 'conflict',
        currentRevision: Number(current.submissionRevision) || 1,
        currentStatus: stringValue(current.status)
      };
    }
  });
}

export async function handleSubmissionsCollection(request, env = {}, dependencies = {}) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return error(405, 'method_not_allowed', {}, { Allow: 'GET, POST' });
  }

  const context = await requireCommunityContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createSubmissionRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  const randomUUID = dependencies.randomUUID || (() => crypto.randomUUID());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_submissions_unavailable');
  }

  try {
    if (request.method === 'GET') {
      return json(200, { submissions: await repository.list(context.userId) });
    }

    const parsed = await readJson(request);
    if (parsed.response) return parsed.response;
    const normalized = await normalizeCreateInput(parsed.payload);
    if (normalized.error) return error(400, normalized.error);

    if (normalized.value.sourceDocumentId) {
      const owns = await repository.verifyDocumentOwnership(context.userId, normalized.value.sourceDocumentId);
      if (!owns) return error(400, 'community_source_document_invalid');
    }

    const duplicate = await repository.findPendingDuplicate(context.userId, normalized.value.contentSignature);
    if (duplicate) return json(200, { submission: duplicate });

    if (await repository.countPending(context.userId) >= MAX_PENDING_PER_USER) {
      return error(409, 'community_pending_quota_reached', { limit: MAX_PENDING_PER_USER });
    }

    const sinceIso = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString();
    if (await repository.countSince(context.userId, sinceIso) >= MAX_SUBMISSIONS_PER_24H) {
      return error(429, 'community_submission_rate_limited', { limit: MAX_SUBMISSIONS_PER_24H });
    }

    const id = randomUUID();
    if (!validId(id)) return error(503, 'community_submissions_unavailable');
    const submission = await repository.create(context.userId, normalized.value, now(), id);
    return json(201, { submission });
  } catch {
    return error(503, 'community_submissions_unavailable');
  }
}

export async function handleSubmissionItem(request, env = {}, id, dependencies = {}) {
  if (!['GET', 'PATCH'].includes(request.method)) {
    return error(405, 'method_not_allowed', {}, { Allow: 'GET, PATCH' });
  }
  if (!validId(id)) return error(404, 'community_submission_not_found');

  const context = await requireCommunityContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createSubmissionRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'community_submissions_unavailable');
  }

  try {
    if (request.method === 'GET') {
      const submission = await repository.get(context.userId, id);
      return submission ? json(200, { submission }) : error(404, 'community_submission_not_found');
    }

    const parsed = await readJson(request);
    if (parsed.response) return parsed.response;
    const normalized = await normalizePatchInput(parsed.payload);
    if (normalized.error) return error(400, normalized.error);

    if (normalized.value.patch.sourceDocumentId) {
      const owns = await repository.verifyDocumentOwnership(context.userId, normalized.value.patch.sourceDocumentId);
      if (!owns) return error(400, 'community_source_document_invalid');
    }

    const result = await repository.updatePending(
      context.userId,
      id,
      normalized.value.revision,
      normalized.value.patch,
      now()
    );
    if (result.status === 'not_found') return error(404, 'community_submission_not_found');
    if (result.status === 'conflict') {
      return error(409, 'community_submission_revision_conflict', {
        currentRevision: result.currentRevision,
        currentStatus: result.currentStatus
      });
    }
    return json(200, { submission: result.submission });
  } catch {
    return error(503, 'community_submissions_unavailable');
  }
}

export const COMMUNITY_SUBMISSIONS_INTERNALS = Object.freeze({
  normalizeCreateInput,
  normalizePatchInput,
  validId,
  communitySubmissionsFeatureState
});

export { requireCommunityContext, normalizeCreateInput, readJson };
