# WU-INPUT-001C — Urdu ↔ English Voice Translator

**Parent:** `WU-INPUT-001`  
**Depends on:** `WU-INPUT-001B`  
**Status:** Implementation slice — preview/noindex until translation quality + runtime enablement acceptance  
**Date:** 2026-09-11  
**Scope:** standalone live speech → editable transcript → explicit semantic translation

## 1. Product decision

Build a new standalone Urdu↔English Voice Translator without changing the current Write Urdu editor, homepage transliteration experience, or existing Urdu Voice Typing page.

The tool supports two explicit journeys:

```text
Urdu speech → Urdu transcript → review → Translate → English
English speech → English transcript → review → Translate → Urdu
```

This is **translation**, not Roman Urdu transliteration.

## 2. Non-negotiable boundaries

This slice must not modify:

- `/` Roman Urdu → Urdu behavior;
- Google Input Tools/transliteration candidates;
- Basic/Rich Editor UI;
- `js/voice-input-core.js` behavior;
- `/tools/urdu-voice-typing` behavior;
- `/api/document-translate`;
- public SEO ownership for `english to urdu typing`.

The new route remains `noindex,follow` until the quality/release gate explicitly promotes it.

## 3. Route

Preview route:

```text
/tools/urdu-english-voice-translator
```

Do not add it to the sitemap, homepage, global navigation, or acquisition schema in this slice.

## 4. User experience

The first usable version contains only:

1. direction selector (`Urdu → English` or `English → Urdu`);
2. Start / Stop microphone controls;
3. editable source transcript;
4. explicit Translate button;
5. editable translation result;
6. Copy source / Copy translation;
7. Clear;
8. visible browser-support and translation-service errors.

Do not add exports, account prompts, publishing, editor handoff, model/provider choice, dictionary lookup, or uploaded audio in this slice.

## 5. Privacy boundary

Live microphone capture stays with the browser speech-recognition mechanism already used by Write Urdu. The application does not upload microphone audio in this slice.

The source transcript is sent to `/api/language-translate` **only after the user explicitly selects Translate**.

The UI must say this plainly.

## 6. Shared speech engine

Reuse:

```text
/js/voice-input-core.js
```

Instantiate with:

- `ur-PK` for Urdu source speech;
- `en-US` for English source speech.

Do not change the shared voice core to implement this feature.

Changing direction must destroy/recreate the local controller with the new language. The transcript/result should be cleared on a direction switch so text cannot be mislabeled.

## 7. Translation API

Call the server-owned `WU-INPUT-001B` contract:

```http
POST /api/language-translate
Content-Type: application/json
```

Request:

```json
{
  "version": 1,
  "from": "ur",
  "to": "en",
  "text": "مجھے کل لاہور جانا ہے"
}
```

or the reverse direction.

The browser must never send provider/model aliases.

## 8. Failure behavior

Required user-visible states:

- speech recognition unsupported;
- microphone permission denied;
- no microphone;
- no speech detected;
- browser speech/network error;
- translation service not enabled;
- translation rate limited;
- translation timeout;
- translation unavailable;
- malformed/unexpected translation response.

Speech failure must not erase manually typed source text.

Translation failure must not erase either source or prior result text.

## 9. Editing model

Both textareas are editable.

Direction determines language metadata and directionality:

| Direction | Source | Result |
| --- | --- | --- |
| Urdu → English | `lang=ur`, `dir=rtl` | `lang=en`, `dir=ltr` |
| English → Urdu | `lang=en`, `dir=ltr` | `lang=ur`, `dir=rtl` |

Urdu surfaces use the site's Urdu font token where available.

## 10. Mobile acceptance

At narrow widths:

- direction choice + microphone CTA must remain visible before the user scrolls through long explanatory content;
- source/result stack vertically;
- buttons have touch-friendly height;
- no horizontal overflow;
- source transcript remains clearly distinguishable from translation.

This slice must not change any existing mobile editor code.

## 11. SEO gate

While preview/quality acceptance is open:

```html
<meta name="robots" content="noindex,follow">
```

No FAQ/schema expansion, sitemap entry, hreflang pair, internal-link campaign or keyword targeting is authorized yet.

Promotion requires:

1. human Urdu↔English quality benchmark;
2. production `INPUT_TRANSLATION_ENABLED=1` readiness;
3. privacy/terms review for chosen translation provider(s);
4. browser/device Voice acceptance;
5. evidence that a standalone route does not confuse existing English-to-Urdu typing intent.

## 12. Acceptance

The implementation passes when:

- current editor/voice/transliteration files are unchanged;
- new route is standalone and noindex;
- both directions configure the correct recognition locale;
- source is editable before translation;
- translation only occurs from an explicit user action;
- the browser calls `/api/language-translate` with only the canonical request fields;
- provider/model choice is absent from client UI/payload;
- source/result copy actions work;
- unsupported/error states are readable;
- contract tests and the repository quality workflow pass.

## 13. Next slice

After this preview is accepted, the next independent capability is uploaded Audio/Voice Note → source transcript → optional translation. It must reuse `WU-INPUT-001B` rather than coupling audio inference directly to a translation provider.
