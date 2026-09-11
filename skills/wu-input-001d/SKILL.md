# WU-INPUT-001D — Uploaded Audio / Voice Note Transcription Skill

Use this skill only for the bounded standalone audio/voice-note → text preview.

## Read order

1. `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`
2. `specs/WU-INPUT-001B-bidirectional-translation-foundation.md`
3. `specs/WU-INPUT-001C-urdu-english-voice-translator.md`
4. `specs/WU-INPUT-001D-uploaded-audio-voice-note-transcription.md`
5. `functions/lib/audio-transcription/contract.mjs`
6. `functions/lib/audio-transcription/handler.mjs`
7. `js/audio-transcription-core.js`
8. `js/audio-to-text-translator.js`
9. `tests/audio-transcription-foundation.test.mjs`

## Mission

Build and maintain one isolated workflow:

```text
short Urdu/English audio file
→ explicit Transcribe
→ editable transcript
→ optional explicit Urdu↔English Translate
→ copy
```

Do not reinterpret this as permission to redesign the editor or Voice platform.

## Protected files / surfaces

Do not modify unless the founder explicitly expands scope:

- `index.html` / Basic Writer input behavior;
- `urdu-editor.html` / Rich Editor;
- `js/voice-input-core.js`;
- `js/urdu-voice-typing.js`;
- `/tools/urdu-voice-typing`;
- `/tools/urdu-english-voice-translator`;
- Roman Urdu transliteration/provider behavior;
- global navigation;
- sitemap;
- homepage discovery/acquisition.

## Server contract

Endpoint:

```text
POST /api/audio-transcribe?language=ur|en
```

Body is raw audio bytes. `Content-Type` must be one of the approved audio types.

The endpoint must remain disabled unless:

```text
AUDIO_TRANSCRIBE_ENABLED=1
```

Hard rules:

- default max bytes: 6 MiB;
- absolute max bytes: 8 MiB even if configuration is larger;
- one `env.AI.run` call per request;
- model fixed server-side to `@cf/openai/whisper-large-v3-turbo`;
- task fixed to `transcribe`;
- explicit `ur` or `en` language only;
- `vad_filter: true`;
- `condition_on_previous_text: false`;
- no provider/model name in the browser contract;
- no chunking/retry/fallback in this slice;
- no URL ingestion;
- no persistence.

## Browser contract

The page must remain:

```text
/tools/audio-to-text-translator
noindex,follow
```

On file selection:

- create only a local object URL;
- read local audio metadata;
- show file name, bytes and duration;
- do **not** call `/api/audio-transcribe`;
- do **not** call `/api/language-translate`.

Browser preview bounds:

- max 6 MiB;
- max 5 minutes;
- one file;
- supported formats: MP3/M4A/MP4 audio/WAV/WebM/OGG/AAC.

Only the Transcribe button may upload the selected file.

## Translation contract

After the transcript exists, the user may edit it.

Only the Translate button may call:

```text
POST /api/language-translate
```

Use the existing version-1 body with `from`, `to`, and reviewed `text`.

Never call a translation provider directly from the browser.

If the transcript changes, clear the existing translation so the UI cannot present stale source/result pairs.

## Privacy / telemetry

Never log or persist:

- audio bytes;
- local object URL;
- transcript text;
- translated text;
- filenames in analytics.

Do not add content telemetry in this slice.

The page copy must distinguish:

- local file selection/preview;
- remote transcription after explicit Transcribe;
- remote text translation after explicit Translate.

## Validation

Before merge run the repository Quality workflow. At minimum the new contract must prove:

- server disabled-by-default;
- server hard byte cap;
- explicit language/type checks;
- one Whisper call and correct bounded payload;
- no auto upload on file selection;
- no auto translation;
- route remains noindex;
- transcript/result editable;
- existing editor/Voice/mobile browser acceptance stays green.

## Deployment gate

Merging does not authorize production inference.

Do not ask the founder to enable `AUDIO_TRANSCRIBE_ENABLED=1` until real Urdu/English audio quality has been tested for:

- clear speech;
- Pakistani Urdu accent;
- code-switching;
- names and places;
- numbers/dates;
- background noise;
- silence / low-speech clips;
- phone-compressed voice notes.

If quality or cost is unclear, leave compute disabled and keep the route noindex.
