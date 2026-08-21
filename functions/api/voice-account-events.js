import { incrementVoiceAccountMetrics } from '../lib/voice-account-metrics.mjs';

const EVENT_METRICS = Object.freeze({
  voice_page_viewed: Object.freeze({ voicePageSessions: 1 }),
  voice_typing_started: Object.freeze({ voiceTrySessions: 1 }),
  voice_transcript_received: Object.freeze({ voiceSuccessSessions: 1 })
});

const ALLOWED_FIELDS = new Set(['event_id', 'session_id', 'event_name']);
const MAX_BODY_BYTES = 2048;

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

function cleanId(value, maxLength) {
  const text = String(value || '').trim();
  if (!text || text.length > maxLength || !/^[a-zA-Z0-9-]+$/.test(text)) return null;
  return text;
}

function cleanEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (Object.keys(input).some((key) => !ALLOWED_FIELDS.has(key))) return null;

  const eventId = cleanId(input.event_id, 80);
  const sessionId = cleanId(input.session_id, 80);
  const eventName = String(input.event_name || '').trim();
  if (!eventId || !sessionId || !Object.prototype.hasOwnProperty.call(EVENT_METRICS, eventName)) return null;

  return { eventId, sessionId, eventName };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.METRICS_DB) return json(503, { error: 'metrics_db_unavailable' });

  const contentType = String(request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) return json(415, { error: 'json_required' });

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return json(413, { error: 'payload_too_large' });

  const raw = await request.text().catch(() => '');
  if (!raw || raw.length > MAX_BODY_BYTES) return json(raw ? 413 : 400, { error: raw ? 'payload_too_large' : 'invalid_event' });

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { error: 'invalid_event' });
  }

  const event = cleanEvent(input);
  if (!event) return json(400, { error: 'invalid_event' });

  try {
    // Identifiers are validated for request hygiene and deliberately discarded.
    // Only anonymous hourly counters are persisted.
    await incrementVoiceAccountMetrics(env.METRICS_DB, EVENT_METRICS[event.eventName]);
    return json(202, { accepted: true });
  } catch {
    return json(503, { error: 'metrics_unavailable' });
  }
}
