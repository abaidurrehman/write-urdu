// WU-INPUT-001D — bounded uploaded-audio transcription contract.

export const AUDIO_TRANSCRIPTION_VERSION = 1;
export const AUDIO_TRANSCRIPTION_HARD_MAX_BYTES = 8 * 1024 * 1024;
export const AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES = 6 * 1024 * 1024;
export const AUDIO_TRANSCRIPTION_MODEL = '@cf/openai/whisper-large-v3-turbo';

const ALLOWED_LANGUAGES = new Set(['ur', 'en']);
const ALLOWED_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/aac'
]);

export function normalizeAudioLanguage(value) {
  const language = String(value || '').trim().toLowerCase();
  return ALLOWED_LANGUAGES.has(language) ? language : null;
}

export function normalizeAudioContentType(value) {
  return String(value || '').split(';', 1)[0].trim().toLowerCase();
}

export function isAllowedAudioContentType(value) {
  return ALLOWED_CONTENT_TYPES.has(normalizeAudioContentType(value));
}

export function configuredMaxAudioBytes(env) {
  const requested = Number(env?.AUDIO_TRANSCRIBE_MAX_BYTES || AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES);
  if (!Number.isFinite(requested) || requested <= 0) return AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES;
  return Math.min(Math.floor(requested), AUDIO_TRANSCRIPTION_HARD_MAX_BYTES);
}

export function isAudioTranscriptionEnabled(env) {
  return String(env?.AUDIO_TRANSCRIBE_ENABLED || '') === '1';
}

export function validateAudioRequestMeta({ language, contentType, declaredLength }, env) {
  const normalizedLanguage = normalizeAudioLanguage(language);
  if (!normalizedLanguage) return { ok: false, code: 'unsupported-language' };

  const normalizedContentType = normalizeAudioContentType(contentType);
  if (!isAllowedAudioContentType(normalizedContentType)) {
    return { ok: false, code: 'unsupported-audio-type' };
  }

  const maxBytes = configuredMaxAudioBytes(env);
  const length = Number(declaredLength || 0);
  if (Number.isFinite(length) && length > maxBytes) {
    return { ok: false, code: 'audio-too-large', maxBytes };
  }

  return {
    ok: true,
    value: {
      language: normalizedLanguage,
      contentType: normalizedContentType,
      maxBytes
    }
  };
}

export const AUDIO_TRANSCRIPTION_ALLOWED_CONTENT_TYPES = Object.freeze([...ALLOWED_CONTENT_TYPES]);
