export const DICTIONARY_MAX_BODY_BYTES = 4096;
export const DICTIONARY_MAX_TERM_CHARS = 100;
export const DICTIONARY_MAX_ENTRIES = 8;
export const DICTIONARY_MAX_BACK_TRANSLATIONS = 6;

const ALLOWED_PAIRS = new Set(['en:ur', 'ur:en']);

export function isDictionaryEnabled(env = {}) {
  return String(env.DICTIONARY_LOOKUP_ENABLED || '') === '1';
}

export function cleanDictionaryTerm(value) {
  return String(value == null ? '' : value).replace(/\u0000/g, '').trim();
}

export function validateDictionaryRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, code: 'invalid_request' };
  const keys = Object.keys(input);
  if (keys.some(key => !['version', 'from', 'to', 'term'].includes(key))) return { ok: false, code: 'invalid_request' };
  if (input.version !== 1) return { ok: false, code: 'invalid_request' };

  const from = String(input.from || '').toLowerCase();
  const to = String(input.to || '').toLowerCase();
  if (!ALLOWED_PAIRS.has(`${from}:${to}`)) return { ok: false, code: 'unsupported_language_pair' };

  const term = cleanDictionaryTerm(input.term);
  if (!term || term.length > DICTIONARY_MAX_TERM_CHARS) return { ok: false, code: 'invalid_term' };

  return { ok: true, value: { version: 1, from, to, term } };
}

export function publicDictionaryError(code) {
  const allowed = new Set([
    'dictionary_not_enabled',
    'dictionary_not_configured',
    'invalid_request',
    'invalid_term',
    'unsupported_language_pair',
    'payload_too_large',
    'dictionary_rate_limited',
    'dictionary_timeout',
    'dictionary_unavailable',
    'dictionary_invalid_response'
  ]);
  return allowed.has(code) ? code : 'dictionary_unavailable';
}
