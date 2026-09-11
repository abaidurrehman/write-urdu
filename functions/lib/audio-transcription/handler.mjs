// WU-INPUT-001D — server-only uploaded-audio → text transcription boundary.

import {
  AUDIO_TRANSCRIPTION_MODEL,
  configuredMaxAudioBytes,
  isAudioTranscriptionEnabled,
  validateAudioRequestMeta
} from './contract.mjs';

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

function publicError(code) {
  if (code === 'transcription-disabled') return 'audio_transcription_not_enabled';
  if (code === 'unsupported-language') return 'unsupported_language';
  if (code === 'unsupported-audio-type') return 'unsupported_audio_type';
  if (code === 'audio-too-large') return 'audio_too_large';
  if (code === 'empty-audio') return 'empty_audio';
  if (code === 'invalid-output') return 'transcription_invalid_response';
  return 'transcription_unavailable';
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function cleanTranscript(response) {
  const value = response?.text ?? response?.transcription_info?.text;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function handleAudioTranscription(request, env) {
  if (!isAudioTranscriptionEnabled(env)) {
    return json(503, { ok: false, error: publicError('transcription-disabled') });
  }
  if (!env?.AI || typeof env.AI.run !== 'function') {
    return json(503, { ok: false, error: publicError('provider-unavailable') });
  }

  const url = new URL(request.url);
  const meta = validateAudioRequestMeta({
    language: url.searchParams.get('language'),
    contentType: request.headers.get('content-type'),
    declaredLength: request.headers.get('content-length')
  }, env);
  if (!meta.ok) {
    const status = meta.code === 'audio-too-large' ? 413 : 415;
    return json(status, { ok: false, error: publicError(meta.code), maxBytes: meta.maxBytes });
  }

  let audio;
  try {
    audio = await request.arrayBuffer();
  } catch {
    return json(400, { ok: false, error: publicError('empty-audio') });
  }

  const maxBytes = configuredMaxAudioBytes(env);
  if (!audio.byteLength) {
    return json(400, { ok: false, error: publicError('empty-audio') });
  }
  if (audio.byteLength > maxBytes) {
    return json(413, { ok: false, error: publicError('audio-too-large'), maxBytes });
  }

  let response;
  try {
    response = await env.AI.run(AUDIO_TRANSCRIPTION_MODEL, {
      audio: arrayBufferToBase64(audio),
      task: 'transcribe',
      language: meta.value.language,
      vad_filter: true,
      condition_on_previous_text: false
    });
  } catch {
    return json(503, { ok: false, error: publicError('provider-unavailable') });
  }

  const transcript = cleanTranscript(response);
  if (!transcript) {
    return json(502, { ok: false, error: publicError('invalid-output') });
  }

  return json(200, {
    ok: true,
    language: meta.value.language,
    transcript
  });
}
