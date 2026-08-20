const MAX_TITLE_CHARS = 160;
const MAX_CONTENT_BYTES = 750 * 1024;
const MAX_REQUEST_BYTES = 1600 * 1024;
const MAX_DOCUMENTS_PER_USER = 100;
const LIST_LIMIT = 100;
const ALLOWED_EDITOR_KINDS = Object.freeze(['basic', 'rich', 'keyboard']);
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();

export const DOCUMENT_LIMITS = Object.freeze({
  maxTitleChars: MAX_TITLE_CHARS,
  maxContentBytes: MAX_CONTENT_BYTES,
  maxRequestBytes: MAX_REQUEST_BYTES,
  maxDocumentsPerUser: MAX_DOCUMENTS_PER_USER,
  allowedEditorKinds: ALLOWED_EDITOR_KINDS
});

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function byteLength(value) {
  return encoder.encode(stringValue(value)).byteLength;
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

function documentFeatureState(env = {}) {
  if (env.DOCUMENTS_ENABLED !== 'true') return 'disabled';
  if (!hasD1Binding(env.METRICS_DB)) return 'unavailable';
  return 'ready';
}

function validId(value) {
  return ID_PATTERN.test(trimmedString(value));
}

function validTitle(value) {
  return value === null || (typeof value === 'string' && Array.from(value).length <= MAX_TITLE_CHARS);
}

function validEditorKind(value) {
  return ALLOWED_EDITOR_KINDS.includes(value);
}

function validFormatVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

function validateContent(value) {
  if (typeof value !== 'string') return 'document_content_required';
  if (byteLength(value) > MAX_CONTENT_BYTES) return 'document_content_too_large';
  return '';
}

function validatePlainText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return 'document_plain_text_invalid';
  if (byteLength(value) > MAX_CONTENT_BYTES) return 'document_plain_text_too_large';
  return '';
}

function normalizeCreateInput(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'invalid_document' };
  }

  const editorKind = trimmedString(payload.editorKind);
  if (!validEditorKind(editorKind)) return { error: 'document_editor_kind_invalid' };

  if (payload.title !== undefined && payload.title !== null && typeof payload.title !== 'string') {
    return { error: 'document_title_invalid' };
  }
  const title = payload.title === undefined || payload.title === null ? null : payload.title.trim();
  if (!validTitle(title)) return { error: 'document_title_too_long' };

  const contentError = validateContent(payload.content);
  if (contentError) return { error: contentError };

  const plainTextError = validatePlainText(payload.plainText);
  if (plainTextError) return { error: plainTextError };

  const formatVersion = payload.formatVersion === undefined ? 1 : Number(payload.formatVersion);
  if (!validFormatVersion(formatVersion)) return { error: 'document_format_version_invalid' };

  return {
    value: {
      editorKind,
      title: title || null,
      content: payload.content,
      plainText: typeof payload.plainText === 'string'
        ? payload.plainText
        : (editorKind === 'rich' ? '' : payload.content),
      formatVersion
    }
  };
}

function normalizePatchInput(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'invalid_document_patch' };
  }

  const revision = Number(payload.revision);
  if (!Number.isInteger(revision) || revision < 1) return { error: 'document_revision_required' };

  const patch = {};
  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    if (payload.title !== null && typeof payload.title !== 'string') return { error: 'document_title_invalid' };
    const title = payload.title === null ? null : payload.title.trim();
    if (!validTitle(title)) return { error: 'document_title_too_long' };
    patch.title = title || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'content')) {
    const contentError = validateContent(payload.content);
    if (contentError) return { error: contentError };
    patch.content = payload.content;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'plainText')) {
    const plainTextError = validatePlainText(payload.plainText);
    if (plainTextError) return { error: plainTextError };
    patch.plainText = payload.plainText === null ? '' : payload.plainText;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'formatVersion')) {
    const formatVersion = Number(payload.formatVersion);
    if (!validFormatVersion(formatVersion)) return { error: 'document_format_version_invalid' };
    patch.formatVersion = formatVersion;
  }

  if (Object.keys(patch).length === 0) return { error: 'document_patch_empty' };
  return { value: { revision, patch } };
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

async function requireDocumentContext(request, env, getSession) {
  const featureState = documentFeatureState(env);
  if (featureState === 'disabled') return { response: error(404, 'documents_not_enabled') };
  if (featureState === 'unavailable') return { response: error(503, 'documents_unavailable') };
  if (typeof getSession !== 'function') return { response: error(503, 'documents_unavailable') };

  let session;
  try {
    session = await getSession(request, env);
  } catch {
    return { response: error(503, 'documents_unavailable') };
  }

  const userId = trimmedString(session?.user?.id);
  if (!userId) return { response: error(401, 'authentication_required') };
  return { userId, db: env.METRICS_DB };
}

function resultChanges(result) {
  const changes = Number(result?.meta?.changes ?? result?.changes ?? 0);
  return Number.isFinite(changes) ? changes : 0;
}

function mapDocument(row) {
  if (!row) return null;
  return {
    id: stringValue(row.id),
    editorKind: stringValue(row.editorKind ?? row.editor_kind),
    title: row.title === null || row.title === undefined ? null : stringValue(row.title),
    content: stringValue(row.content),
    plainText: stringValue(row.plainText ?? row.plain_text),
    formatVersion: Number(row.formatVersion ?? row.format_version) || 1,
    revision: Number(row.revision) || 1,
    createdAt: stringValue(row.createdAt ?? row.created_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at)
  };
}

function mapDocumentMetadata(row) {
  return {
    id: stringValue(row.id),
    editorKind: stringValue(row.editorKind ?? row.editor_kind),
    title: row.title === null || row.title === undefined ? null : stringValue(row.title),
    preview: stringValue(row.preview),
    revision: Number(row.revision) || 1,
    createdAt: stringValue(row.createdAt ?? row.created_at),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at)
  };
}

export function createDocumentRepository(db) {
  if (!hasD1Binding(db)) throw new TypeError('Documents require a D1 binding.');

  return Object.freeze({
    async list(userId) {
      const result = await db.prepare(`SELECT
          id,
          editor_kind AS editorKind,
          title,
          substr(COALESCE(NULLIF(plain_text, ''), CASE WHEN editor_kind IN ('basic','keyboard') THEN content ELSE '' END), 1, 180) AS preview,
          revision,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM writing_documents
        WHERE user_id = ?1
        ORDER BY updated_at DESC
        LIMIT ${LIST_LIMIT}`)
        .bind(userId)
        .run();
      return Array.isArray(result?.results) ? result.results.map(mapDocumentMetadata) : [];
    },

    async count(userId) {
      const row = await db.prepare('SELECT COUNT(*) AS count FROM writing_documents WHERE user_id = ?1')
        .bind(userId)
        .first();
      return Number(row?.count) || 0;
    },

    async create(userId, input, now, id) {
      await db.prepare(`INSERT INTO writing_documents (
          id, user_id, editor_kind, title, content, plain_text,
          format_version, revision, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1, ?8, ?8)`)
        .bind(id, userId, input.editorKind, input.title, input.content, input.plainText, input.formatVersion, now)
        .run();
      return this.get(userId, id);
    },

    async get(userId, id) {
      const row = await db.prepare(`SELECT
          id,
          editor_kind AS editorKind,
          title,
          content,
          plain_text AS plainText,
          format_version AS formatVersion,
          revision,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM writing_documents
        WHERE id = ?1 AND user_id = ?2`)
        .bind(id, userId)
        .first();
      return mapDocument(row);
    },

    async update(userId, id, revision, patch, now) {
      const assignments = [];
      const values = [];
      const add = (column, value) => {
        values.push(value);
        assignments.push(`${column} = ?${values.length}`);
      };

      if (Object.prototype.hasOwnProperty.call(patch, 'title')) add('title', patch.title);
      if (Object.prototype.hasOwnProperty.call(patch, 'content')) add('content', patch.content);
      if (Object.prototype.hasOwnProperty.call(patch, 'plainText')) add('plain_text', patch.plainText);
      if (Object.prototype.hasOwnProperty.call(patch, 'formatVersion')) add('format_version', patch.formatVersion);
      add('revision', revision + 1);
      add('updated_at', now);

      values.push(id);
      const idParam = values.length;
      values.push(userId);
      const userParam = values.length;
      values.push(revision);
      const revisionParam = values.length;

      const result = await db.prepare(`UPDATE writing_documents
        SET ${assignments.join(', ')}
        WHERE id = ?${idParam} AND user_id = ?${userParam} AND revision = ?${revisionParam}`)
        .bind(...values)
        .run();

      if (resultChanges(result) > 0) {
        return { status: 'updated', document: await this.get(userId, id) };
      }

      const current = await db.prepare('SELECT revision, updated_at AS updatedAt FROM writing_documents WHERE id = ?1 AND user_id = ?2')
        .bind(id, userId)
        .first();
      if (!current) return { status: 'not_found' };
      return {
        status: 'conflict',
        currentRevision: Number(current.revision) || 1,
        updatedAt: stringValue(current.updatedAt)
      };
    },

    async delete(userId, id) {
      const result = await db.prepare('DELETE FROM writing_documents WHERE id = ?1 AND user_id = ?2')
        .bind(id, userId)
        .run();
      return resultChanges(result) > 0;
    }
  });
}

export async function handleDocumentsCollection(request, env = {}, dependencies = {}) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return error(405, 'method_not_allowed', {}, { Allow: 'GET, POST' });
  }

  const context = await requireDocumentContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createDocumentRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  const randomUUID = dependencies.randomUUID || (() => crypto.randomUUID());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'documents_unavailable');
  }

  try {
    if (request.method === 'GET') {
      return json(200, { documents: await repository.list(context.userId) });
    }

    const parsed = await readJson(request);
    if (parsed.response) return parsed.response;
    const normalized = normalizeCreateInput(parsed.payload);
    if (normalized.error) return error(400, normalized.error);

    if (await repository.count(context.userId) >= MAX_DOCUMENTS_PER_USER) {
      return error(409, 'document_quota_reached', { limit: MAX_DOCUMENTS_PER_USER });
    }

    const id = randomUUID();
    if (!validId(id)) return error(503, 'documents_unavailable');
    const document = await repository.create(context.userId, normalized.value, now(), id);
    return json(201, { document });
  } catch {
    return error(503, 'documents_unavailable');
  }
}

export async function handleDocumentItem(request, env = {}, id, dependencies = {}) {
  if (!['GET', 'PATCH', 'DELETE'].includes(request.method)) {
    return error(405, 'method_not_allowed', {}, { Allow: 'GET, PATCH, DELETE' });
  }
  if (!validId(id)) return error(404, 'document_not_found');

  const context = await requireDocumentContext(request, env, dependencies.getSession);
  if (context.response) return context.response;

  const repositoryFactory = dependencies.repositoryFactory || createDocumentRepository;
  const now = dependencies.now || (() => new Date().toISOString());
  let repository;
  try {
    repository = repositoryFactory(context.db);
  } catch {
    return error(503, 'documents_unavailable');
  }

  try {
    if (request.method === 'GET') {
      const document = await repository.get(context.userId, id);
      return document ? json(200, { document }) : error(404, 'document_not_found');
    }

    if (request.method === 'DELETE') {
      return await repository.delete(context.userId, id)
        ? json(200, { ok: true })
        : error(404, 'document_not_found');
    }

    const parsed = await readJson(request);
    if (parsed.response) return parsed.response;
    const normalized = normalizePatchInput(parsed.payload);
    if (normalized.error) return error(400, normalized.error);

    const result = await repository.update(
      context.userId,
      id,
      normalized.value.revision,
      normalized.value.patch,
      now()
    );
    if (result.status === 'not_found') return error(404, 'document_not_found');
    if (result.status === 'conflict') {
      return error(409, 'document_revision_conflict', {
        currentRevision: result.currentRevision,
        updatedAt: result.updatedAt
      });
    }
    return json(200, { document: result.document });
  } catch {
    return error(503, 'documents_unavailable');
  }
}

export const DOCUMENTS_INTERNALS = Object.freeze({
  normalizeCreateInput,
  normalizePatchInput,
  validId,
  byteLength,
  documentFeatureState
});
