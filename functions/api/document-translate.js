const MODEL = '@cf/ai4bharat/indictrans2-en-indic-1B';
const TARGET_LANGUAGE = 'urd_Arab';
const MAX_BODY_BYTES = 50000;
const MAX_TEXT_CHARS = 12000;
const MAX_SEGMENT_CHARS = 1200;
const MAX_SEGMENTS = 24;

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

function chunkBlock(block) {
  const chunks = [];
  let rest = String(block || '').trim();
  while (rest.length > MAX_SEGMENT_CHARS) {
    let cut = rest.lastIndexOf(' ', MAX_SEGMENT_CHARS);
    if (cut < Math.floor(MAX_SEGMENT_CHARS * 0.6)) cut = MAX_SEGMENT_CHARS;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

function segmentText(value) {
  const normalized = String(value || '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];
  const blocks = normalized.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean);
  const segments = [];
  for (const block of blocks) {
    for (const chunk of chunkBlock(block)) {
      segments.push(chunk);
      if (segments.length > MAX_SEGMENTS) return [];
    }
  }
  return segments;
}

function cleanInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (Object.keys(input).some((key) => key !== 'text')) return null;
  const text = String(input.text || '').replace(/\u0000/g, '').trim();
  if (!text || text.length > MAX_TEXT_CHARS) return null;
  const segments = segmentText(text);
  if (!segments.length) return null;
  return { text, segments };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.AI || typeof env.AI.run !== 'function') {
    return json(503, { ok: false, error: 'translation_service_not_configured' });
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
  if (!raw || raw.length > MAX_BODY_BYTES) {
    return json(raw ? 413 : 400, { ok: false, error: raw ? 'payload_too_large' : 'invalid_request' });
  }

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: 'invalid_request' });
  }

  const cleaned = cleanInput(input);
  if (!cleaned) {
    return json(400, { ok: false, error: 'invalid_text' });
  }

  try {
    const response = await env.AI.run(MODEL, {
      text: cleaned.segments,
      target_language: TARGET_LANGUAGE
    });
    const translations = response && Array.isArray(response.translations) ? response.translations : null;
    if (!translations || translations.length !== cleaned.segments.length || translations.some((item) => typeof item !== 'string')) {
      return json(502, { ok: false, error: 'unexpected_translation_response' });
    }

    return json(200, {
      ok: true,
      translation: translations.map((item) => item.trim()).join('\n\n'),
      segment_count: translations.length
    });
  } catch {
    return json(503, { ok: false, error: 'translation_unavailable' });
  }
}
