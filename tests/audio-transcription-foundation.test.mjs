import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AUDIO_TRANSCRIPTION_HARD_MAX_BYTES,
  AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES,
  AUDIO_TRANSCRIPTION_MODEL,
  configuredMaxAudioBytes,
  isAudioTranscriptionEnabled,
  validateAudioRequestMeta
} from '../functions/lib/audio-transcription/contract.mjs';
import { handleAudioTranscription } from '../functions/lib/audio-transcription/handler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('tools/audio-to-text-translator.html');
const client = read('js/audio-to-text-translator.js');
const endpoint = read('functions/api/audio-transcribe.js');
const browserCore = read('js/audio-transcription-core.js');

assert.equal(AUDIO_TRANSCRIPTION_HARD_MAX_BYTES, 8 * 1024 * 1024);
assert.equal(AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES, 6 * 1024 * 1024);
assert.equal(AUDIO_TRANSCRIPTION_MODEL, '@cf/openai/whisper-large-v3-turbo');
assert.equal(configuredMaxAudioBytes({ AUDIO_TRANSCRIBE_MAX_BYTES: String(99 * 1024 * 1024) }), AUDIO_TRANSCRIPTION_HARD_MAX_BYTES, 'Server cap must never exceed hard ceiling');
assert.equal(configuredMaxAudioBytes({ AUDIO_TRANSCRIBE_MAX_BYTES: '1048576' }), 1048576);
assert.equal(isAudioTranscriptionEnabled({}), false);
assert.equal(isAudioTranscriptionEnabled({ AUDIO_TRANSCRIBE_ENABLED: '1' }), true);

assert.equal(validateAudioRequestMeta({ language: 'ur', contentType: 'audio/mpeg', declaredLength: 100 }, {}).ok, true);
assert.equal(validateAudioRequestMeta({ language: 'en', contentType: 'audio/mp4; codecs=aac', declaredLength: 100 }, {}).ok, true);
assert.equal(validateAudioRequestMeta({ language: 'auto', contentType: 'audio/mpeg', declaredLength: 100 }, {}).code, 'unsupported-language');
assert.equal(validateAudioRequestMeta({ language: 'ur', contentType: 'application/octet-stream', declaredLength: 100 }, {}).code, 'unsupported-audio-type');
assert.equal(validateAudioRequestMeta({ language: 'ur', contentType: 'audio/mpeg', declaredLength: AUDIO_TRANSCRIPTION_DEFAULT_MAX_BYTES + 1 }, {}).code, 'audio-too-large');

const disabled = await handleAudioTranscription(new Request('https://example.test/api/audio-transcribe?language=ur', {
  method: 'POST',
  headers: { 'content-type': 'audio/mpeg' },
  body: new Uint8Array([1, 2, 3, 4])
}), {});
assert.equal(disabled.status, 503);
assert.equal((await disabled.json()).error, 'audio_transcription_not_enabled');

const wrongType = await handleAudioTranscription(new Request('https://example.test/api/audio-transcribe?language=ur', {
  method: 'POST',
  headers: { 'content-type': 'application/octet-stream' },
  body: new Uint8Array([1, 2, 3, 4])
}), {
  AUDIO_TRANSCRIBE_ENABLED: '1',
  AI: { run: async () => ({ text: 'should not run' }) }
});
assert.equal(wrongType.status, 415);
assert.equal((await wrongType.json()).error, 'unsupported_audio_type');

let capturedModel = null;
let capturedPayload = null;
const success = await handleAudioTranscription(new Request('https://example.test/api/audio-transcribe?language=ur', {
  method: 'POST',
  headers: { 'content-type': 'audio/mpeg' },
  body: new Uint8Array([1, 2, 3, 4])
}), {
  AUDIO_TRANSCRIBE_ENABLED: '1',
  AI: {
    run: async (model, payload) => {
      capturedModel = model;
      capturedPayload = payload;
      return { text: 'السلام علیکم، یہ ایک مختصر آواز ہے۔' };
    }
  }
});
assert.equal(success.status, 200);
assert.deepEqual(await success.json(), {
  ok: true,
  language: 'ur',
  transcript: 'السلام علیکم، یہ ایک مختصر آواز ہے۔'
});
assert.equal(capturedModel, AUDIO_TRANSCRIPTION_MODEL);
assert.equal(capturedPayload.audio, 'AQIDBA==');
assert.equal(capturedPayload.task, 'transcribe');
assert.equal(capturedPayload.language, 'ur');
assert.equal(capturedPayload.vad_filter, true);
assert.equal(capturedPayload.condition_on_previous_text, false);

const malformed = await handleAudioTranscription(new Request('https://example.test/api/audio-transcribe?language=en', {
  method: 'POST',
  headers: { 'content-type': 'audio/wav' },
  body: new Uint8Array([5, 6, 7])
}), {
  AUDIO_TRANSCRIBE_ENABLED: '1',
  AI: { run: async () => ({ text: '   ' }) }
});
assert.equal(malformed.status, 502);
assert.equal((await malformed.json()).error, 'transcription_invalid_response');

assert.match(endpoint, /handleAudioTranscription/, 'Pages endpoint should remain a thin handler wrapper');
assert.match(page, /<meta name="robots" content="noindex,follow">/, 'Audio preview must remain noindex until acceptance');
assert.match(page, /data-audio-transcription/, 'Audio preview root is missing');
assert.match(page, /value="ur"/, 'Urdu source-language choice is missing');
assert.match(page, /value="en"/, 'English source-language choice is missing');
assert.match(page, /data-audio-preview/, 'Local audio preview is missing');
assert.match(page, /data-audio-transcribe/, 'Explicit Transcribe action is missing');
assert.match(page, /data-audio-translate/, 'Optional explicit Translate action is missing');
assert.match(page, /data-audio-transcript/, 'Editable transcript is missing');
assert.match(page, /data-audio-translation/, 'Editable translation is missing');
assert.doesNotMatch(page, /data-audio-transcript[^>]*readonly/, 'Transcript must remain editable');
assert.doesNotMatch(page, /data-audio-translation[^>]*readonly/, 'Translation must remain editable');
assert.doesNotMatch(page, /Continue editing in WriteUrdu/, 'Editor handoff is out of scope for this preview');
assert.doesNotMatch(page, /batch-transliteration/, 'Audio preview must not become another Roman Urdu surface');

assert.match(browserCore, /MAX_FILE_BYTES = 6 \* 1024 \* 1024/, 'Browser preview must keep the 6 MiB guard');
assert.match(browserCore, /MAX_DURATION_SECONDS = 5 \* 60/, 'Browser preview must keep the 5-minute guard');
assert.match(client, /fileInput\.addEventListener\('change',[\s\S]*handleSelectedFile/, 'File selection should only prepare local preview state');
assert.match(client, /transcribeButton\.addEventListener\('click',\s*transcribeSelectedAudio\)/, 'Upload must require explicit Transcribe action');
assert.match(client, /var languageCode = languageSelect\.value;[\s\S]*var audioFile = selectedFile;/, 'Transcription must snapshot language/file before async work');
assert.match(client, /fetch\(core\.transcriptionUrl\(languageCode\)/, 'Client must call the bounded transcription endpoint with the request snapshot');
assert.match(client, /languageSelect\.disabled = busy;/, 'Language selector must lock while a request is in flight');
assert.match(client, /fileInput\.disabled = busy;/, 'File selection must lock while a request is in flight');
assert.match(client, /clearButton\.disabled = busy \|\|/, 'Clear must lock while a request is in flight');
assert.match(client, /translateButton\.addEventListener\('click',\s*translateTranscript\)/, 'Translation must require a separate explicit action');
assert.match(client, /fetch\('\/api\/language-translate'/, 'Translation must reuse WU-INPUT-001B');
assert.doesNotMatch(client, /providerAlias|modelAlias|microsoft|cloudflare|whisper/i, 'Browser must not select or expose provider/model details');
assert.doesNotMatch(client, /console\.(log|info|warn|error)/, 'Client must not log audio/transcript content');
assert.doesNotMatch(client, /fetch\([^)]*selectedObjectUrl/, 'Client must never send the local object URL to a server');

console.log('WU-INPUT-001D audio transcription contract passed.');
