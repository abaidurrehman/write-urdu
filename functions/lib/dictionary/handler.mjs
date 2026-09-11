import {
  DICTIONARY_MAX_BODY_BYTES,
  isDictionaryEnabled,
  publicDictionaryError,
  validateDictionaryRequest
} from './contract.mjs';
import { lookupWithMicrosoft } from './providers/microsoft.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function statusFor(code) {
  if (code === 'dictionary_not_enabled' || code === 'dictionary_not_configured' || code === 'dictionary_unavailable') return 503;
  if (code === 'dictionary_rate_limited') return 429;
  if (code === 'dictionary_timeout') return 504;
  if (code === 'payload_too_large') return 413;
  if (code === 'dictionary_invalid_response') return 502;
  return 400;
}

export async function handleDictionaryLookup(request, env, options = {}) {
  if (!isDictionaryEnabled(env)) return json(503, { ok: false, error: 'dictionary_not_enabled' });

  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) return json(415, { ok: false, error: 'invalid_request' });

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > DICTIONARY_MAX_BODY_BYTES) return json(413, { ok: false, error: 'payload_too_large' });

  const raw = await request.text().catch(() => '');
  if (!raw) return json(400, { ok: false, error: 'invalid_request' });
  if (new TextEncoder().encode(raw).byteLength > DICTIONARY_MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  const checked = validateDictionaryRequest(input);
  if (!checked.ok) return json(statusFor(checked.code), { ok: false, error: checked.code });

  const lookup = options.lookupFn || lookupWithMicrosoft;
  const result = await lookup(checked.value, env, options.providerOptions || {});
  if (!result?.ok) {
    const code = publicDictionaryError(result?.code);
    return json(statusFor(code), { ok: false, error: code });
  }

  return json(200, {
    ok: true,
    from: checked.value.from,
    to: checked.value.to,
    source: result.source || checked.value.term,
    entries: Array.isArray(result.entries) ? result.entries : [],
    synonyms: [],
    synonymStatus: 'verified-source-not-configured'
  });
}
