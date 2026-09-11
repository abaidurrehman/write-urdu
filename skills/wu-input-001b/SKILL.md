# WU-INPUT-001B — Bidirectional Translation Foundation Skill

Use this skill only for the server-side Urdu↔English semantic translation foundation.

## Read order

1. `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`
2. `docs/WU-INPUT-001A-ROADMAP-RECONCILIATION-2026-09-11.md`
3. `specs/WU-INPUT-001A-standalone-language-voice-capability-benchmark.md`
4. `specs/WU-INPUT-001B-bidirectional-translation-foundation.md`
5. `docs/WU-INPUT-001A-CAPABILITY-RESEARCH-2026-09-11.md`
6. `benchmarks/wu-input-001a/README.md`
7. current implementation/tests under `functions/lib/input-translation/`, `functions/api/language-translate.js`, and `tests/input-translation-foundation.test.mjs`

## Core invariant

`WU-INPUT-001B` is **not an editor feature**.

Do not modify:

- homepage Roman Urdu → Urdu behavior;
- Google Input Tools/transliteration;
- Basic/Rich editor UI;
- `js/voice-input-core.js` or current writer voice mounting;
- `english to urdu typing` acquisition ownership;
- `/api/document-translate`.

The output of this slice is reusable server infrastructure for future standalone Voice/Audio/Text translation jobs.

## Approved directions

Exactly:

```text
en → ur
ur → en
```

Do not add auto-detection or additional languages without a new contract.

## Provider rules

Default when explicitly enabled:

- `en→ur`: Cloudflare IndicTrans2;
- `ur→en`: Cloudflare M2M100.

Microsoft Translator is an optional server-configured adapter. Never let the browser pick providers. Never silently fail over into a provider with different cost/privacy behavior.

## Release configuration

The route must remain disabled unless:

```text
INPUT_TRANSLATION_ENABLED=1
```

Optional direction-specific routing:

```text
INPUT_TRANSLATION_PROVIDER_EN_UR=cloudflare|microsoft
INPUT_TRANSLATION_PROVIDER_UR_EN=cloudflare|microsoft
```

Microsoft selection additionally requires its server credentials.

## Privacy rules

- no request/translation text in logs;
- no user text in Product Pulse;
- no cache of translation bodies owned by Write Urdu;
- `cache-control: no-store`;
- no account/profile context to providers;
- normalize provider errors before returning them.

## Validation

Run the focused contract:

```bash
node tests/input-translation-foundation.test.mjs
```

Then the full contract suite:

```bash
npm test
```

Do not enable the service in production merely because tests pass. Provider quality is still benchmark-gated by `WU-INPUT-001A`.

## Next slice boundary

After `001B` passes CI and the benchmark supports a provider choice, the next product surface should be a **standalone Urdu↔English Voice Translator** using:

```text
browser speech recognition
        ↓
source transcript
        ↓
/api/language-translate
        ↓
translated text
```

That future surface must remain separate from the current editor unless a later explicit contract approves integration.
