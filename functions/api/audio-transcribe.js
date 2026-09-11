// WU-INPUT-001D — same-origin uploaded audio transcription endpoint.

import { handleAudioTranscription } from '../lib/audio-transcription/handler.mjs';

export async function onRequestPost(context) {
  return handleAudioTranscription(context.request, context.env);
}
