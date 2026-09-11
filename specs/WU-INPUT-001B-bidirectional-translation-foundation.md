# WU-INPUT-001B — Bidirectional Urdu ↔ English Translation Foundation

**Parent:** `WU-INPUT-001`  
**Predecessor:** `WU-INPUT-001A`  
**Status:** Implementation slice  
**Date:** 2026-09-11  
**Scope:** server-side semantic Urdu↔English translation foundation only; no current editor/client UX changes

---

## 1. Decision

Build one provider-neutral semantic translation service that supports exactly:

```text
en → ur
ur → en
```

The service is intended to become shared infrastructure for later standalone features:

- Urdu ↔ English Voice Translator;
- uploaded Audio/Voice Note → transcript → optional translation;
- standalone text translation;
- later bounded integrations approved by their owning specs.

This slice **must not** change the current Roman Urdu typing/editor experience.

Translation and transliteration remain distinct product jobs.

---

## 2. Non-negotiable boundaries

Do not modify in this slice:

- `index.html` or homepage writer behavior;
- Google Input Tools/transliteration behavior;
- Basic/Rich editor controls;
- `js/voice-input-core.js` or current editor voice mounting;
- current acquisition copy/query ownership for `english to urdu typing`;
- the existing `/api/document-translate` contract.

`/api/document-translate` remains the document translator's bounded English→Urdu endpoint. `WU-INPUT-001B` introduces a separate shared language service instead of stretching that route into unrelated jobs.

No public translation page is required for this slice.

---

## 3. API contract

New endpoint:

```text
POST /api/language-translate
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

or:

```json
{
  "version": 1,
  "from": "en",
  "to": "ur",
  "text": "I need to go to Lahore tomorrow."
}
```

Rules:

- only `version`, `from`, `to`, `text` are accepted;
- `from`/`to` must be one of the two approved opposite directions;
- no automatic language detection in this slice;
- no browser/provider selector in the request;
- bounded input length;
- no text in logs, telemetry, URLs or cache keys owned by Write Urdu.

Success response:

```json
{
  "ok": true,
  "version": 1,
  "from": "ur",
  "to": "en",
  "translation": "I need to go to Lahore tomorrow.",
  "meta": {
    "providerAlias": "cloudflare-m2m100",
    "modelAlias": "m2m100-1.2b"
  }
}
```

Failure codes are stable application codes, not raw provider responses.

---

## 4. Provider architecture

Presentation/client code must never know provider credentials or model request schemas.

```text
/api/language-translate
        ↓
input contract + validation
        ↓
translation service/router
        ↓
provider adapter
   ├── Cloudflare Workers AI
   └── Microsoft Translator (optional)
```

### 4.1 Cloudflare defaults

Use the existing Workers AI binding when enabled.

Default model routing:

- English → Urdu: `@cf/ai4bharat/indictrans2-en-indic-1B`;
- Urdu → English: `@cf/meta/m2m100-1.2b`.

Rationale:

- IndicTrans2 is purpose-built for English→Indic translation and supports `urd_Arab`;
- M2M100 supports both English (`en`) and Urdu (`ur`) and is suitable for the reverse direction;
- this gives Write Urdu a complete Cloudflare-native path without requiring a new external secret.

Model/provider routing remains configuration-owned and is not product copy.

### 4.2 Microsoft adapter

Implement Microsoft Translator as an optional provider adapter so real benchmark results can later select it per direction without rewriting callers.

Required env configuration when selected:

```text
AZURE_TRANSLATOR_KEY
AZURE_TRANSLATOR_REGION (when required by the resource)
AZURE_TRANSLATOR_ENDPOINT (optional; defaults to standard Translator endpoint)
```

Do not silently move to Microsoft merely because credentials exist. Provider selection is explicit server configuration.

### 4.3 No automatic paid fallback

This slice does not silently fail over from one provider to another. A future fallback policy must explicitly define cost and privacy behavior.

---

## 5. Configuration and release gate

The endpoint must be disabled by default.

Production enablement requires:

```text
INPUT_TRANSLATION_ENABLED=1
```

Direction-specific provider configuration may use:

```text
INPUT_TRANSLATION_PROVIDER_EN_UR=cloudflare | microsoft
INPUT_TRANSLATION_PROVIDER_UR_EN=cloudflare | microsoft
```

Default when enabled and unset:

```text
en→ur = cloudflare
ur→en = cloudflare
```

No user can select a provider through request JSON.

---

## 6. Limits

Initial server limits:

- maximum text: 5,000 characters;
- JSON request only;
- maximum body: 20 KB;
- one source text per request;
- no file/audio payloads in this endpoint;
- no streaming in this slice.

The audio slice will transcribe first and submit bounded text to this service.

---

## 7. Privacy/security contract

- `cache-control: no-store` on endpoint responses;
- no `console.*` logging of user content;
- no Product Pulse payload content;
- no account/profile data passed to providers;
- Microsoft receives only the requested text when its adapter is selected;
- Cloudflare receives only the requested text through the existing Workers AI binding;
- endpoint has an explicit kill switch;
- provider errors are normalized before returning to callers.

No claim such as “everything stays on your device” may be attached to future server-backed translation UX.

---

## 8. Stable internal result contract

Provider adapters return conceptually:

```ts
type TranslationProviderResult = {
  ok: true;
  translation: string;
  providerAlias: string;
  modelAlias: string;
  durationMs?: number;
} | {
  ok: false;
  code:
    | 'provider-unavailable'
    | 'rate-limited'
    | 'timeout'
    | 'invalid-output'
    | 'refused';
};
```

The service owns provider selection. The API route owns HTTP validation/response mapping.

---

## 9. Acceptance criteria

### Contract

- [ ] accepts only `en→ur` and `ur→en`;
- [ ] rejects same-language/unsupported pairs;
- [ ] rejects unknown request fields;
- [ ] rejects empty and >5,000-character text;
- [ ] endpoint disabled unless explicitly enabled;
- [ ] provider cannot be chosen by client payload.

### Cloudflare

- [ ] English→Urdu calls IndicTrans2 with `urd_Arab`;
- [ ] Urdu→English calls M2M100 with `source_lang: ur`, `target_lang: en`;
- [ ] missing AI binding fails safely;
- [ ] malformed provider output fails closed.

### Microsoft

- [ ] adapter sends `from`/`to` explicitly;
- [ ] key never appears in response/error text;
- [ ] optional region header supported;
- [ ] malformed/error responses fail closed;
- [ ] adapter is not production-selected without server configuration.

### Regression/security

- [ ] no current editor/client files changed;
- [ ] `/api/document-translate` remains unchanged;
- [ ] no user content logging;
- [ ] existing contract suite remains green;
- [ ] focused `WU-INPUT-001B` tests cover both directions and failure cases.

---

## 10. What comes next

After this foundation is green, the preferred order is:

1. run the human-reviewed translation benchmark from `WU-INPUT-001A`;
2. select/configure the winning provider per direction;
3. build `WU-INPUT-001C` standalone Voice Translator using browser speech recognition → this translation service;
4. build uploaded Audio/Voice Note transcription → this translation service;
5. keep dictionary/synonym work separate because it has a lexical-data/provenance contract rather than a translation contract.

No current editor integration is implied by completing this slice.
