// WU-AI-001B — request contract + server validation (spec §13).

import { isValidAction } from './actions.mjs';

export const MAX_BODY_BYTES = 20000;
export const MAX_TEXT_CHARS = 6000;

const SOURCE_SURFACES = new Set(['basic', 'rich', 'keyboard']);
const LANGUAGE_HINTS = new Set(['ur', 'en', 'roman-ur', 'mixed']);
const OUTPUT_FORMATS = new Set(['text', 'bullets']);

function fail(code, message) {
  return { ok: false, code, message };
}

export function validateRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('invalid-input', 'Request body must be a JSON object.');
  }
  if (input.version !== 1) {
    return fail('invalid-input', 'Unsupported request version.');
  }
  if (!isValidAction(input.action)) {
    return fail('invalid-input', 'Unknown or unsupported action.');
  }
  if (typeof input.text !== 'string') {
    return fail('invalid-input', 'Text is required.');
  }
  const text = input.text.trim();
  if (!text) {
    return fail('invalid-input', 'Text must not be empty.');
  }
  if (text.length > MAX_TEXT_CHARS) {
    return fail('too-large', `Text exceeds the ${MAX_TEXT_CHARS} character limit.`);
  }

  let context;
  if (input.context !== undefined) {
    if (!input.context || typeof input.context !== 'object' || Array.isArray(input.context)) {
      return fail('invalid-input', 'Context must be an object.');
    }
    const { sourceSurface, sourceLanguageHint, outputFormat } = input.context;
    if (sourceSurface !== undefined && !SOURCE_SURFACES.has(sourceSurface)) {
      return fail('invalid-input', 'Unknown sourceSurface.');
    }
    if (sourceLanguageHint !== undefined && !LANGUAGE_HINTS.has(sourceLanguageHint)) {
      return fail('invalid-input', 'Unknown sourceLanguageHint.');
    }
    if (outputFormat !== undefined && !OUTPUT_FORMATS.has(outputFormat)) {
      return fail('invalid-input', 'Unknown outputFormat.');
    }
    context = { sourceSurface, sourceLanguageHint, outputFormat };
  }

  return { ok: true, value: { action: input.action, text, context } };
}
