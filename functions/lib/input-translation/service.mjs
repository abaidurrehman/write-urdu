// WU-INPUT-001B — provider-neutral translation service/router.

import { directionKey } from './contract.mjs';
import { translateWithCloudflare } from './providers/cloudflare.mjs';
import { translateWithMicrosoft } from './providers/microsoft.mjs';

const ALLOWED_PROVIDERS = new Set(['cloudflare', 'microsoft']);

export function isInputTranslationEnabled(env) {
  return String(env?.INPUT_TRANSLATION_ENABLED || '') === '1';
}

export function providerForDirection(request, env) {
  const key = directionKey(request.from, request.to);
  const configured = key === 'en-ur'
    ? env?.INPUT_TRANSLATION_PROVIDER_EN_UR
    : env?.INPUT_TRANSLATION_PROVIDER_UR_EN;
  const provider = String(configured || 'cloudflare').trim().toLowerCase();
  return ALLOWED_PROVIDERS.has(provider) ? provider : null;
}

export async function translateInputText(request, env, options = {}) {
  if (!isInputTranslationEnabled(env)) {
    return { ok: false, code: 'translation-disabled' };
  }

  const provider = providerForDirection(request, env);
  if (!provider) {
    return { ok: false, code: 'provider-unavailable' };
  }

  if (provider === 'microsoft') {
    return translateWithMicrosoft(request, env, options.microsoft || {});
  }

  return translateWithCloudflare(request, env);
}
