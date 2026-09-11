# WU-INPUT-001C — Urdu ↔ English Voice Translator Skill

Use this skill only for the standalone live Voice Translator preview.

## Read first

1. `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`
2. `docs/WU-INPUT-001A-ROADMAP-RECONCILIATION-2026-09-11.md`
3. `specs/WU-INPUT-001B-bidirectional-translation-foundation.md`
4. `specs/WU-INPUT-001C-urdu-english-voice-translator.md`
5. `js/voice-input-core.js`
6. `functions/api/language-translate.js`

## Protected surfaces

Do not modify for this slice:

```text
index.html
js/voice-input-core.js
js/urdu-voice-typing.js
tools/urdu-voice-typing.html
functions/api/document-translate.js
Roman Urdu / Google Input Tools behavior
Basic/Rich Editor UI
```

## Product invariant

This flow is:

```text
speech → source transcript → user review → explicit Translate → translated text
```

It is not:

```text
speech → hidden upload → automatic translation
```

The user must see/edit the transcript before the semantic translation request is sent.

## Recognition locales

Use the existing shared Voice core with:

```text
Urdu source: ur-PK
English source: en-US
```

Changing direction must destroy/recreate the recognition controller.

## Translation request

Only send:

```json
{
  "version": 1,
  "from": "ur|en",
  "to": "en|ur",
  "text": "reviewed source transcript"
}
```

Never send provider/model IDs from the browser.

## Preview route

```text
/tools/urdu-english-voice-translator
```

Keep:

```html
<meta name="robots" content="noindex,follow">
```

until quality and runtime enablement acceptance explicitly promote it.

Do not add sitemap/global navigation/homepage acquisition links in this slice.

## Tests

At minimum run:

```bash
node tests/voice-translator-contract.test.js
npm test
```

Then rely on the repository Quality workflow for shell/SEO/governance/browser/visual regressions.

## Release gate

Merging the preview does not authorize enabling translation compute. Production translation still requires the `WU-INPUT-001B` runtime gate and provider acceptance.

## Next slice

After acceptance, move to uploaded Audio/Voice Note → transcript → optional translation. Do not bolt uploaded audio into the live microphone controller.
