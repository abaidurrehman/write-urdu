// WU-INPUT-001B — shared semantic Urdu↔English translation endpoint.

import {
  INPUT_TRANSLATION_MAX_BODY_BYTES,
  normalizeTranslationRequest
} from '../lib/input-translation/contract.mjs';
import { translateInputText } from '../lib/input-translation/service.mjs';

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

function statusForServiceCode(code) {
  if (code === 'rate-limited') return 429;
  if (code === 'timeout') return 504;
  if (code === 'invalid-output') return 502;
  return 503;
}

function publicServiceError(code) {
  if (code === 'translation-disabled') return 'translation_service_not_enabled';
  if (code === 'rate-limited') return 'translation_rate_limited';
  if (code === 'timeout') return 'translation_timeout';
  if (code === 'invalid-output') return 'translation_invalid_response';
  if (code === 'refused') return 'translation_unavailable';
  return 'translation_unavailable';
}

function publicInputError(code) {
  if (code === 'text-too-large') return 'text_too_large';
  if (code === 'unsupported-direction') return 'unsupported_direction';
  if (code === 'unsupported-version') return 'unsupported_version';
  if (code === 'invalid-text') return 'invalid_text';
  return 'invalid_request';
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return json(415, { ok: false, error: 'json_required' });
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > INPUT_TRANSLATION_MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  const raw = await request.text().catch(() => '');
  if (!raw) {
    return json(400, { ok: false, error: 'invalid_request' });
  }
  if (new TextEncoder().encode(raw).length > INPUT_TRANSLATION_MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  const normalized = normalizeTranslationRequest(input);
  if (!normalized.ok) {
    const status = normalized.code === 'text-too-large' ? 413 : 400;
    return json(status, { ok: false, error: publicInputError(normalized.code) });
  }

  const result = await translateInputText(normalized.value, env);
  if (!result.ok) {
    return json(statusForServiceCode(result.code), {
      ok: false,
      error: publicServiceError(result.code)
    });
  }

  return json(200, {
    ok: true,
    version: normalized.value.version,
    from: normalized.value.from,
    to: normalized.value.to,
    translation: result.translation,
    meta: {
      providerAlias: result.providerAlias,
      modelAlias: result.modelAlias
    }
  });
}
