# WU-INPUT-001D — Uploaded Audio / Voice Note → Text + Optional Translation

**Status:** Active implementation slice / preview acceptance  
**Parent:** `WU-INPUT-001`  
**Depends on:** `WU-INPUT-001B` bidirectional translation foundation  
**Follows:** `WU-INPUT-001C` standalone live Voice Translator  
**Public route:** `/tools/audio-to-text-translator`  
**Indexing while preview:** `noindex,follow`

## 1. Product job

A user already has a short spoken recording — for example a WhatsApp-style voice note, phone memo, meeting note or spoken draft — and wants usable written Urdu or English without re-speaking it live.

The first bounded journey is:

```text
short audio file
  → choose spoken language (Urdu or English)
  → review the selected file locally
  → explicit Transcribe action
  → editable source transcript
  → optional explicit Translate action
  → editable Urdu/English translation
  → copy
```

This is **not** the existing live Voice Typing experience and must not modify it.

## 2. Founder-directed boundary

This slice must not modify:

- homepage / Basic Writer transliteration;
- Rich Editor;
- `js/voice-input-core.js`;
- `/tools/urdu-voice-typing`;
- `/tools/urdu-english-voice-translator` behavior;
- `/api/document-translate`;
- Roman Urdu provider selection;
- global navigation, sitemap or homepage acquisition surfaces.

The new route stays isolated and `noindex` until quality/cost/privacy acceptance.

## 3. Input scope

Preview accepts:

- MP3;
- M4A / MP4 audio;
- WAV;
- WebM;
- OGG;
- AAC.

Client preview limit:

- maximum **6 MiB**;
- maximum **5 minutes**, checked from browser audio metadata;
- exactly one file at a time;
- explicit spoken-language choice: Urdu or English.

Server hard ceiling:

- configurable `AUDIO_TRANSCRIBE_MAX_BYTES`;
- default 6 MiB;
- cannot exceed 8 MiB even if misconfigured.

The server byte ceiling is authoritative. Browser duration validation is an additional UX/cost guard, not a claim that compressed audio duration can be proven from bytes alone.

## 4. Why no language auto-detection in v1

Do not spend an inference or add ambiguity before the core job is proven.

The user chooses:

- `Urdu` → Whisper receives `language: "ur"`;
- `English` → Whisper receives `language: "en"`.

Automatic detection may be tested later only if usage evidence shows that explicit selection causes meaningful abandonment.

## 5. Server architecture

Endpoint:

```text
POST /api/audio-transcribe?language=ur|en
Content-Type: audio/...
Body: raw audio bytes
```

Do not use multipart unless a later requirement needs additional file metadata. The first endpoint needs only the language query and audio body.

Implementation layers:

```text
functions/api/audio-transcribe.js
  → functions/lib/audio-transcription/handler.mjs
  → functions/lib/audio-transcription/contract.mjs
  → env.AI.run('@cf/openai/whisper-large-v3-turbo', ...)
```

Whisper request:

```js
{
  audio: '<base64 audio>',
  task: 'transcribe',
  language: 'ur' | 'en',
  vad_filter: true,
  condition_on_previous_text: false
}
```

The anti-loop setting is intentional for short user voice notes; quality review may change it later with evidence.

## 6. Compute / failure guardrails

The endpoint is disabled unless:

```text
AUDIO_TRANSCRIBE_ENABLED=1
```

Additional rules:

- one Workers AI inference per request;
- no server-side chunking in this preview;
- no automatic retries;
- no automatic provider fallback;
- no automatic translation after transcription;
- reject oversized declared bodies before reading them;
- re-check actual bytes after reading the body;
- no URL ingestion / remote file fetching;
- no batch uploads.

Large-audio chunking is a later slice. Cloudflare documents chunking for Whisper, but introducing multiple model calls would materially change cost and failure behavior and is therefore intentionally excluded here.

## 7. Privacy contract

Before upload, the page must state clearly:

- choosing a file does not upload it;
- local audio preview uses a browser object URL;
- pressing **Transcribe audio** sends the selected audio to the configured speech-recognition service;
- WriteUrdu does not save the audio as a document in this slice;
- translation is separate and sends only the reviewed transcript when the user explicitly presses Translate.

Do not:

- log file contents or transcripts;
- persist audio to D1/R2/KV;
- put transcripts in analytics;
- silently translate after transcription;
- upload on file-selection/change events.

## 8. Client behavior

Route: `/tools/audio-to-text-translator`

Required controls:

- spoken language select;
- local file picker;
- local `<audio controls>` preview;
- file name/size/duration summary;
- `Transcribe audio` button;
- editable transcript;
- optional `Translate to English/Urdu` button;
- editable translation;
- copy transcript;
- copy translation;
- clear/reset.

Changing language clears transcript/translation but may retain the selected local file so the user can retry with the correct language hint.

Editing the transcript invalidates/clears the previous translation so source and translation cannot silently drift apart.

## 9. Translation reuse

Do not create a new translation provider call.

After transcription, use:

```text
POST /api/language-translate
```

with the existing `WU-INPUT-001B` contract:

```json
{
  "version": 1,
  "from": "ur",
  "to": "en",
  "text": "reviewed transcript"
}
```

or the reverse.

Transcription remains useful even if translation is disabled or unavailable.

## 10. Current provider evidence

Revalidate before public indexing/marketing:

- Cloudflare Whisper Large V3 Turbo model: `https://developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo/`
- Cloudflare large-audio chunking guide: `https://developers.cloudflare.com/workers-ai/guides/tutorials/build-a-workers-ai-whisper-with-chunking/`
- Cloudflare Workers request-body limits: `https://developers.cloudflare.com/workers/platform/limits/`

As of 2026-09-11 the Whisper model supports speech transcription/translation, explicit language hints and VAD. This slice uses transcription only; semantic Urdu↔English translation stays owned by `WU-INPUT-001B`.

## 11. Acceptance tests

Automated acceptance must prove:

1. preview remains `noindex,follow`;
2. no sitemap/global-nav/homepage promotion is added;
3. source language is explicit `ur`/`en`;
4. file is not uploaded on selection;
5. browser enforces supported type, 6 MiB and 5-minute preview bounds;
6. server remains disabled by default;
7. server hard byte cap cannot exceed 8 MiB;
8. unsupported type/language fail closed;
9. one Whisper model call is made for a valid request;
10. Whisper receives `task: transcribe`, selected language, VAD and bounded settings;
11. output transcript is editable;
12. translation requires a separate explicit action;
13. translation reuses `/api/language-translate`;
14. no provider/model selector is exposed in the browser;
15. no transcript/audio logging is introduced;
16. existing editor/Voice/mobile browser suites remain green.

## 12. Release gate

Merging the code does **not** authorize compute by itself.

Before enabling production transcription:

- run real Urdu and English audio fixtures;
- review names, numbers, code-switching, background noise and silence hallucination behavior;
- confirm current Workers AI pricing/free-allocation headroom;
- set the feature byte cap intentionally;
- enable `AUDIO_TRANSCRIBE_ENABLED=1` only after acceptance.

Keep the route `noindex` until the feature has passed real-audio quality review and the owner intentionally decides its SEO/query role.

## 13. Next slice after acceptance

Only after real usage/quality evidence, consider:

- longer-audio chunking;
- automatic source-language detection;
- timestamps/subtitles;
- direct WhatsApp/share handoffs;
- audio recording inside this page;
- indexed acquisition route.

None of these are part of `WU-INPUT-001D`.
