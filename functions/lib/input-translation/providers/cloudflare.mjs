// WU-INPUT-001B — Cloudflare Workers AI translation adapter.

const INDIC_MODEL = '@cf/ai4bharat/indictrans2-en-indic-1B';
const M2M_MODEL = '@cf/meta/m2m100-1.2b';

function failure(code = 'provider-unavailable') {
  return { ok: false, code };
}

function cleanTranslation(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function translateWithCloudflare(request, env) {
  if (!env || !env.AI || typeof env.AI.run !== 'function') {
    return failure('provider-unavailable');
  }

  const started = Date.now();

  try {
    if (request.from === 'en' && request.to === 'ur') {
      const response = await env.AI.run(INDIC_MODEL, {
        text: [request.text],
        target_language: 'urd_Arab'
      });
      const translation = cleanTranslation(response?.translations?.[0]);
      if (!translation) return failure('invalid-output');
      return {
        ok: true,
        translation,
        providerAlias: 'cloudflare-indictrans2',
        modelAlias: 'indictrans2-en-indic-1B',
        durationMs: Date.now() - started
      };
    }

    if (request.from === 'ur' && request.to === 'en') {
      const response = await env.AI.run(M2M_MODEL, {
        text: request.text,
        source_lang: 'ur',
        target_lang: 'en'
      });
      const translation = cleanTranslation(response?.translated_text ?? response?.translation);
      if (!translation) return failure('invalid-output');
      return {
        ok: true,
        translation,
        providerAlias: 'cloudflare-m2m100',
        modelAlias: 'm2m100-1.2b',
        durationMs: Date.now() - started
      };
    }

    return failure('provider-unavailable');
  } catch (error) {
    if (error?.name === 'AbortError') return failure('timeout');
    return failure('provider-unavailable');
  }
}

export const CLOUDFLARE_INPUT_TRANSLATION_MODELS = Object.freeze({
  'en-ur': INDIC_MODEL,
  'ur-en': M2M_MODEL
});
