// WU-INPUT-001B — canonical bidirectional Urdu↔English translation request contract.

export const INPUT_TRANSLATION_VERSION = 1;
export const INPUT_TRANSLATION_MAX_TEXT_CHARS = 5000;
export const INPUT_TRANSLATION_MAX_BODY_BYTES = 20000;

const ALLOWED_LANGUAGES = new Set(['en', 'ur']);
const ALLOWED_KEYS = new Set(['version', 'from', 'to', 'text']);

export function directionKey(from, to) {
  return `${from}-${to}`;
}

export function isSupportedDirection(from, to) {
  return (
    (from === 'en' && to === 'ur') ||
    (from === 'ur' && to === 'en')
  );
}

export function normalizeTranslationRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, code: 'invalid-request' };
  }

  const keys = Object.keys(input);
  if (keys.some((key) => !ALLOWED_KEYS.has(key))) {
    return { ok: false, code: 'invalid-request' };
  }

  const version = input.version == null ? INPUT_TRANSLATION_VERSION : Number(input.version);
  if (version !== INPUT_TRANSLATION_VERSION) {
    return { ok: false, code: 'unsupported-version' };
  }

  const from = String(input.from || '').trim().toLowerCase();
  const to = String(input.to || '').trim().toLowerCase();
  if (!ALLOWED_LANGUAGES.has(from) || !ALLOWED_LANGUAGES.has(to) || !isSupportedDirection(from, to)) {
    return { ok: false, code: 'unsupported-direction' };
  }

  const text = String(input.text || '').replace(/\u0000/g, '').trim();
  if (!text) {
    return { ok: false, code: 'invalid-text' };
  }
  if (text.length > INPUT_TRANSLATION_MAX_TEXT_CHARS) {
    return { ok: false, code: 'text-too-large' };
  }

  return {
    ok: true,
    value: {
      version: INPUT_TRANSLATION_VERSION,
      from,
      to,
      text,
      direction: directionKey(from, to)
    }
  };
}
