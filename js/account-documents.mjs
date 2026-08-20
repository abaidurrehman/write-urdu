export const DOCUMENT_SYNC_DELAY_MS = 25_000;
export const DOCUMENT_METADATA_PREFIX = 'write-urdu:account-document:v1:';
export const BASIC_DOCUMENT_METADATA_KEY = 'write-urdu:account-document:v1:basic';
export const DOCUMENT_OPEN_HANDOFF_KEY = 'write-urdu:account-document-open:v1';
export const ACCOUNT_DOCUMENT_EDITOR_KINDS = Object.freeze(['basic', 'rich', 'keyboard']);

function stringValue(value) {
  return typeof value === 'string' ? value : '';
}

export function normaliseAccountDocumentEditorKind(value, fallback = 'basic') {
  const kind = stringValue(value).trim().toLowerCase();
  return ACCOUNT_DOCUMENT_EDITOR_KINDS.includes(kind) ? kind : fallback;
}

export function documentMetadataKey(editorKind = 'basic') {
  return `${DOCUMENT_METADATA_PREFIX}${normaliseAccountDocumentEditorKind(editorKind)}`;
}

function hashString(value) {
  let hash = 2166136261;
  const text = stringValue(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function documentSnapshot(snapshot = {}) {
  return Object.freeze({
    content: stringValue(snapshot.content),
    text: stringValue(snapshot.text)
  });
}

export function documentSnapshotSignature(snapshot = {}) {
  const clean = documentSnapshot(snapshot);
  return `${clean.content.length}:${clean.text.length}:${hashString(`${clean.content}\u0000${clean.text}`)}`;
}

export function deriveDocumentTitle(text) {
  const clean = stringValue(text).replace(/\s+/g, ' ').trim();
  if (!clean) return 'Urdu writing';
  return Array.from(clean).slice(0, 96).join('');
}

export class DocumentApiError extends Error {
  constructor(status, code, details = {}) {
    super(code || 'documents_unavailable');
    this.name = 'DocumentApiError';
    this.status = Number(status) || 0;
    this.code = code || 'documents_unavailable';
    this.currentRevision = Number(details.currentRevision) || 0;
    this.updatedAt = stringValue(details.updatedAt);
  }
}

async function errorFromResponse(response) {
  const payload = await response.json().catch(() => null);
  const error = payload && payload.error && typeof payload.error === 'object' ? payload.error : {};
  return new DocumentApiError(response.status, stringValue(error.code) || 'documents_unavailable', error);
}

function requestOptions(method, body) {
  const options = {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' }
  };
  if (body !== undefined) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  return options;
}

export function createDocumentsClient(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new TypeError('My Documents requires fetch.');

  async function request(url, method, body) {
    const response = await fetchImpl(url, requestOptions(method, body));
    if (!response.ok) throw await errorFromResponse(response);
    return response.json();
  }

  return Object.freeze({
    async probe() {
      const response = await fetchImpl('/api/documents', requestOptions('GET'));
      if (response.status === 200 || response.status === 401) {
        return Object.freeze({ available: true, authenticated: response.status === 200 });
      }
      if (response.status === 404) {
        const payload = await response.json().catch(() => null);
        if (payload?.error?.code === 'documents_not_enabled') {
          return Object.freeze({ available: false, authenticated: false });
        }
      }
      throw await errorFromResponse(response);
    },

    async list() {
      const payload = await request('/api/documents', 'GET');
      return Array.isArray(payload.documents) ? payload.documents : [];
    },

    async get(documentId) {
      const payload = await request(`/api/documents/${encodeURIComponent(documentId)}`, 'GET');
      return payload.document;
    },

    async create(snapshot, options = {}) {
      const clean = documentSnapshot(snapshot);
      const payload = await request('/api/documents', 'POST', {
        editorKind: normaliseAccountDocumentEditorKind(options.editorKind),
        title: options.title === undefined ? deriveDocumentTitle(clean.text) : options.title,
        content: clean.content,
        plainText: clean.text,
        formatVersion: Number(options.formatVersion) || 1
      });
      return payload.document;
    },

    async update(documentId, revision, snapshot, options = {}) {
      const clean = documentSnapshot(snapshot);
      const payload = await request(`/api/documents/${encodeURIComponent(documentId)}`, 'PATCH', {
        revision,
        content: clean.content,
        plainText: clean.text,
        formatVersion: Number(options.formatVersion) || 1
      });
      return payload.document;
    },

    async rename(documentId, revision, title) {
      const payload = await request(`/api/documents/${encodeURIComponent(documentId)}`, 'PATCH', {
        revision,
        title: stringValue(title).trim()
      });
      return payload.document;
    },

    async remove(documentId) {
      await request(`/api/documents/${encodeURIComponent(documentId)}`, 'DELETE');
      return true;
    },

    async copy(documentId, title) {
      const source = await this.get(documentId);
      if (!source) throw new DocumentApiError(404, 'document_not_found');
      return this.create({ content: source.content, text: source.plainText }, {
        editorKind: source.editorKind || 'basic',
        title: title || `Copy of ${source.title || deriveDocumentTitle(source.plainText)}`,
        formatVersion: source.formatVersion || 1
      });
    }
  });
}

export function readAccountDocumentMetadata(storage, key = BASIC_DOCUMENT_METADATA_KEY) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const documentId = stringValue(value.documentId).trim();
    const ownerUserId = stringValue(value.ownerUserId).trim();
    const revision = Number(value.revision);
    const lastSyncedSignature = stringValue(value.lastSyncedSignature);
    if (!documentId || !ownerUserId || !Number.isInteger(revision) || revision < 1 || !lastSyncedSignature) return null;
    return Object.freeze({ documentId, ownerUserId, revision, lastSyncedSignature });
  } catch {
    return null;
  }
}

export function writeAccountDocumentMetadata(storage, metadata, key = BASIC_DOCUMENT_METADATA_KEY) {
  if (!storage || typeof storage.setItem !== 'function' || !metadata) return false;
  const documentId = stringValue(metadata.documentId).trim();
  const ownerUserId = stringValue(metadata.ownerUserId).trim();
  const revision = Number(metadata.revision);
  const lastSyncedSignature = stringValue(metadata.lastSyncedSignature);
  if (!documentId || !ownerUserId || !Number.isInteger(revision) || revision < 1 || !lastSyncedSignature) return false;
  try {
    storage.setItem(key, JSON.stringify({ documentId, ownerUserId, revision, lastSyncedSignature }));
    return true;
  } catch {
    return false;
  }
}

export function clearAccountDocumentMetadata(storage, key = BASIC_DOCUMENT_METADATA_KEY) {
  if (!storage || typeof storage.removeItem !== 'function') return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function writeDocumentOpenHandoff(storage, document, key = DOCUMENT_OPEN_HANDOFF_KEY) {
  if (!storage || typeof storage.setItem !== 'function' || !document) return false;
  try {
    storage.setItem(key, JSON.stringify({
      id: stringValue(document.id),
      editorKind: normaliseAccountDocumentEditorKind(document.editorKind),
      title: document.title === null ? null : stringValue(document.title),
      content: stringValue(document.content),
      plainText: stringValue(document.plainText),
      formatVersion: Number(document.formatVersion) || 1,
      revision: Number(document.revision) || 1,
      queuedAt: Date.now()
    }));
    return true;
  } catch {
    return false;
  }
}

export function readDocumentOpenHandoff(storage, key = DOCUMENT_OPEN_HANDOFF_KEY) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    storage.removeItem(key);
    const value = JSON.parse(raw);
    if (!value || !stringValue(value.id) || !stringValue(value.editorKind)) return null;
    if (Date.now() - Number(value.queuedAt || 0) > 5 * 60 * 1000) return null;
    value.editorKind = normaliseAccountDocumentEditorKind(value.editorKind);
    return value;
  } catch {
    return null;
  }
}
