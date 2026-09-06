import { decodeLegacyText, encodeUnicodeText } from './inpage-unicode.mjs';
import { timingSafeEqualString } from './timing-safe-equal.mjs';

const MAX_BODY_BYTES = 200000;
const MAX_TEXT_CHARS = 100000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, authorization'
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...CORS_HEADERS
    }
  });
}

function extractBearerToken(request) {
  const header = request.headers.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
}

export function handleInPageUnicodeOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function handleInPageUnicodeConvert(request, env) {
  if (env.INPAGE_API_ENABLED !== 'true') {
    return json(503, { ok: false, error: 'conversion_service_not_configured' });
  }

  const expectedSecret = String(env.INPAGE_API_BETA_SECRET || '');
  const presentedSecret = extractBearerToken(request);
  if (!expectedSecret || !timingSafeEqualString(presentedSecret, expectedSecret)) {
    return json(401, { ok: false, error: 'authentication_failed' });
  }

  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return json(415, { ok: false, error: 'json_required' });
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  const raw = await request.text().catch(() => '');
  if (!raw) {
    return json(400, { ok: false, error: 'invalid_request' });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' });
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  const { direction, text } = input;
  if (direction !== 'legacy-to-unicode' && direction !== 'unicode-to-legacy') {
    return json(400, { ok: false, error: 'invalid_direction' });
  }

  if (typeof text !== 'string' || !text || text.length > MAX_TEXT_CHARS) {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  const result = direction === 'legacy-to-unicode'
    ? decodeLegacyText(text)
    : encodeUnicodeText(text);

  return json(200, { ok: true, ...result });
}
