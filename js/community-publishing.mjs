export const COMMUNITY_MEANINGFUL_THRESHOLDS = Object.freeze({
  minNonWhitespaceChars: 600,
  minWhitespaceDelimitedWords: 90
});

export const COMMUNITY_EDITOR_KINDS = Object.freeze(['basic', 'rich', 'keyboard', 'voice']);

export const COMMUNITY_TAXONOMY = Object.freeze({
  primaryCategories: Object.freeze(['poetry', 'essay', 'prose', 'thought', 'story']),
  tags: Object.freeze([
    'ghazal', 'nazm', 'shayari', 'essay', 'prose', 'critical-thinking',
    'personal-reflection', 'society', 'culture', 'education', 'story', 'other'
  ]),
  maxTags: 5
});

export const COMMUNITY_CONTENT_LIMITS = Object.freeze({
  maxTitleChars: 180,
  maxPublicAuthorChars: 80,
  minPlainTextChars: 80
});

export const COMMUNITY_PROMPT_SUPPRESSION_KEY = 'write-urdu:community-prompt-suppressed:v1';
export const COMMUNITY_PROMPT_SUPPRESSION_LIMIT = 20;
export const COMMUNITY_PUBLISH_INTENT_KEY = 'write-urdu:community-publish-intent:v1';
export const COMMUNITY_PUBLISH_INTENT_MAX_AGE_MS = 30 * 60 * 1000;
export const COMMUNITY_GUIDELINES_VERSION = '2026-08-25';

function stringValue(value) {
  return typeof value === 'string' ? value : '';
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

export function normalizeForPredicate(text) {
  return stringValue(text).replace(/\r\n?/g, '\n').trim();
}

export function countNonWhitespaceChars(text) {
  return Array.from(normalizeForPredicate(text).replace(/\s+/g, '')).length;
}

export function countWhitespaceDelimitedWords(text) {
  const normalized = normalizeForPredicate(text);
  if (!normalized) return 0;
  return normalized.split(/\s+/).filter(Boolean).length;
}

export function isMeaningfulWriting(text) {
  const normalized = normalizeForPredicate(text);
  if (!normalized) return false;
  return countNonWhitespaceChars(normalized) >= COMMUNITY_MEANINGFUL_THRESHOLDS.minNonWhitespaceChars
    || countWhitespaceDelimitedWords(normalized) >= COMMUNITY_MEANINGFUL_THRESHOLDS.minWhitespaceDelimitedWords;
}

export function promptSignature(workspaceKind, text) {
  const normalized = normalizeForPredicate(text);
  const lengthBucket = Math.min(50, Math.floor(normalized.length / 200));
  return `${stringValue(workspaceKind) || 'unknown'}:${lengthBucket}:${hashString(normalized)}`;
}

function readSignatureSet(storage) {
  if (!storage || typeof storage.getItem !== 'function') return [];
  try {
    const raw = storage.getItem(COMMUNITY_PROMPT_SUPPRESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeSignatureSet(storage, signatures) {
  if (!storage || typeof storage.setItem !== 'function') return;
  try {
    storage.setItem(COMMUNITY_PROMPT_SUPPRESSION_KEY, JSON.stringify(signatures.slice(-COMMUNITY_PROMPT_SUPPRESSION_LIMIT)));
  } catch {}
}

export function isPromptSuppressed(storage, signature) {
  return readSignatureSet(storage).includes(signature);
}

export function suppressPrompt(storage, signature) {
  const current = readSignatureSet(storage);
  if (current.includes(signature)) return;
  writeSignatureSet(storage, [...current, signature]);
}

export function shouldShowPrompt(storage, workspaceKind, text) {
  if (!isMeaningfulWriting(text)) return false;
  return !isPromptSuppressed(storage, promptSignature(workspaceKind, text));
}

export function writePublishIntent(storage, { workspaceKind, editorKind, entryPoint } = {}) {
  if (!storage || typeof storage.setItem !== 'function') return false;
  try {
    storage.setItem(COMMUNITY_PUBLISH_INTENT_KEY, JSON.stringify({
      workspaceKind: stringValue(workspaceKind),
      editorKind: stringValue(editorKind),
      entryPoint: stringValue(entryPoint) || 'manual',
      queuedAt: Date.now()
    }));
    return true;
  } catch {
    return false;
  }
}

export function readPublishIntent(storage) {
  if (!storage || typeof storage.getItem !== 'function') return null;
  try {
    const raw = storage.getItem(COMMUNITY_PUBLISH_INTENT_KEY);
    if (!raw) return null;
    storage.removeItem(COMMUNITY_PUBLISH_INTENT_KEY);
    const value = JSON.parse(raw);
    if (!value || !stringValue(value.editorKind)) return null;
    if (Date.now() - Number(value.queuedAt || 0) > COMMUNITY_PUBLISH_INTENT_MAX_AGE_MS) return null;
    return value;
  } catch {
    return null;
  }
}

export function validateSubmissionForm(fields = {}) {
  const errors = {};
  const title = stringValue(fields.title).trim();
  if (!title) errors.title = 'title_required';
  else if (Array.from(title).length > COMMUNITY_CONTENT_LIMITS.maxTitleChars) errors.title = 'title_too_long';

  const publicAuthorName = stringValue(fields.publicAuthorName).trim();
  if (!publicAuthorName) errors.publicAuthorName = 'public_author_name_required';
  else if (Array.from(publicAuthorName).length > COMMUNITY_CONTENT_LIMITS.maxPublicAuthorChars) errors.publicAuthorName = 'public_author_name_too_long';

  const plainText = normalizeForPredicate(fields.plainText);
  if (Array.from(plainText).length < COMMUNITY_CONTENT_LIMITS.minPlainTextChars) errors.plainText = 'plain_text_too_short';

  if (!COMMUNITY_TAXONOMY.primaryCategories.includes(fields.primaryCategory)) errors.primaryCategory = 'primary_category_required';

  const tags = Array.isArray(fields.tags) ? fields.tags : [];
  const uniqueTags = new Set(tags);
  if (tags.length === 0 || tags.length > COMMUNITY_TAXONOMY.maxTags || uniqueTags.size !== tags.length
    || tags.some((tag) => !COMMUNITY_TAXONOMY.tags.includes(tag))) {
    errors.tags = 'tags_invalid';
  }

  if (fields.rightsConfirmed !== true) errors.rightsConfirmed = 'rights_confirmation_required';
  if (fields.publicConfirmed !== true) errors.publicConfirmed = 'public_confirmation_required';
  if (fields.guidelinesConfirmed !== true) errors.guidelinesConfirmed = 'guidelines_confirmation_required';

  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildSubmissionPayload(fields = {}) {
  return {
    sourceDocumentId: fields.sourceDocumentId || undefined,
    editorKind: fields.editorKind,
    contentFormat: 'plain',
    title: stringValue(fields.title).trim(),
    publicAuthorName: stringValue(fields.publicAuthorName).trim(),
    content: normalizeForPredicate(fields.plainText),
    plainText: normalizeForPredicate(fields.plainText),
    primaryCategory: fields.primaryCategory,
    tags: Array.isArray(fields.tags) ? fields.tags : [],
    rightsConfirmed: fields.rightsConfirmed === true,
    publicConfirmed: fields.publicConfirmed === true,
    guidelinesVersion: COMMUNITY_GUIDELINES_VERSION
  };
}

export class CommunityApiError extends Error {
  constructor(status, code, extra = {}) {
    super(code || 'community_submissions_unavailable');
    this.name = 'CommunityApiError';
    this.status = Number(status) || 0;
    this.code = code || 'community_submissions_unavailable';
    this.extra = extra;
  }
}

async function errorFromResponse(response) {
  const payload = await response.json().catch(() => null);
  const error = payload && payload.error && typeof payload.error === 'object' ? payload.error : {};
  return new CommunityApiError(response.status, stringValue(error.code) || 'community_submissions_unavailable', error);
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

export function createCommunityClient(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Community publishing requires fetch.');

  async function request(url, method, body) {
    const response = await fetchImpl(url, requestOptions(method, body));
    if (!response.ok && response.status !== 200) throw await errorFromResponse(response);
    return response.json();
  }

  return Object.freeze({
    async probe() {
      const response = await fetchImpl('/api/community/submissions', requestOptions('GET'));
      if (response.status === 200 || response.status === 401) {
        return Object.freeze({ available: true, authenticated: response.status === 200 });
      }
      if (response.status === 404) {
        const payload = await response.json().catch(() => null);
        if (payload?.error?.code === 'community_submissions_not_enabled') {
          return Object.freeze({ available: false, authenticated: false });
        }
      }
      throw await errorFromResponse(response);
    },

    async submit(payload) {
      const response = await fetchImpl('/api/community/submissions', requestOptions('POST', payload));
      if (!response.ok && response.status !== 200) throw await errorFromResponse(response);
      const body = await response.json();
      return { submission: body.submission, reused: response.status === 200 };
    },

    async list() {
      const payload = await request('/api/community/submissions', 'GET');
      return Array.isArray(payload.submissions) ? payload.submissions : [];
    },

    async get(id) {
      const payload = await request(`/api/community/submissions/${encodeURIComponent(id)}`, 'GET');
      return payload.submission;
    },

    async revise(id, revision, fields) {
      const payload = await request(`/api/community/submissions/${encodeURIComponent(id)}`, 'PATCH', {
        submissionRevision: revision,
        ...buildSubmissionPayload(fields)
      });
      return payload.submission;
    },

    async myPublicationsList() {
      const payload = await request('/api/community/my-publications', 'GET');
      return Array.isArray(payload.items) ? payload.items : [];
    },

    async submitPublicationRevision(submissionId, fields) {
      const payload = await request(`/api/community/submissions/${encodeURIComponent(submissionId)}/revise`, 'POST', buildSubmissionPayload(fields));
      return payload.submission;
    },

    async withdrawPublication(publicationId) {
      return request(`/api/community/publications/${encodeURIComponent(publicationId)}/withdraw`, 'POST');
    }
  });
}

export const COMMUNITY_PUBLISHING_CONTRACT = Object.freeze({
  thresholds: COMMUNITY_MEANINGFUL_THRESHOLDS,
  editorKinds: COMMUNITY_EDITOR_KINDS,
  taxonomy: COMMUNITY_TAXONOMY,
  contentLimits: COMMUNITY_CONTENT_LIMITS,
  publishIntentMaxAgeMs: COMMUNITY_PUBLISH_INTENT_MAX_AGE_MS
});
