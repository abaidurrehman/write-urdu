# WU-VOICE-PLAT-001 — Unified Urdu Input Platform

**Status:** Implemented core / acceptance pending  
**Reconciled:** 2026-08-30 against shipped A/B/C code and Slice D telemetry/reporting  
**Area:** Shared input architecture / voice / English-letter-to-Urdu / direct Urdu / creation workflows  
**Growth owner:** `WU-GROWTH-003`  
**Remaining closeout slice:** `WU-VOICE-PLAT-001D`

## Current contract

Voice is a reusable Urdu input method across eligible WriteUrdu workspaces, not a destination-only transcript utility. Roman/English-letter input, direct input and voice all feed the same user-owned editable text state.

The platform build is no longer Planned. Slices A, B and C are shipped and green; the functional Slice D telemetry/reporting and WhatsApp-message outcome are also shipped. Remaining work is non-code demonstration/acceptance plus evidence-gated growth owned elsewhere.

## Shipped platform behaviour

- shared speech core and generic input/textarea insertion adapter;
- the dedicated Urdu Voice Typing page migrated to the shared core;
- Basic Writer, Rich Editor and Urdu Keyboard voice input;
- My Documents voice entry point;
- Card Studio, WhatsApp Status, Instagram Post, Stylish Urdu Text and Name Art voice input on their real text fields;
- one editable text state while switching between voice, Roman/English-letter and direct input;
- final speech insertion without destructive interim rewriting;
- explicit-user-action microphone permission model;
- privacy-safe voice adoption/final/switch/completion telemetry;
- cross-workspace Product Pulse reporting;
- bounded voice error categories;
- distinct voice-to-WhatsApp-message outcome from the Status image workflow.

Representative runtime evidence:

- `js/voice-input-core.js`
- `js/unified-urdu-input.js`
- `js/writer-voice-input.js`
- `js/basic-writer-command-toolbar.js`
- `js/urdu-voice-typing.js`
- `js/product-telemetry.js`
- `functions/api/internal/product-pulse.js`
- `migrations/0009_voice_input_mode.sql`
- `migrations/0010_voice_error_category.sql`
- `tests/create-social-voice-input-contract.test.js`

## Enduring invariants

1. Voice inserts into the same editable state the owning workspace already uses.
2. Switching input methods never clears or replaces existing text.
3. Final recognition, not interim hypotheses, becomes committed document content.
4. Where caret/selection is supported, final speech inserts/replaces at the active logical insertion point.
5. Manual corrections are preserved and must not be overwritten by stale speech hypotheses.
6. Microphone permission may be requested only after an explicit user action.
7. Unsupported/failed speech recognition must degrade to ordinary Roman/direct editing without losing text.
8. No audio, transcript text, recognized words or user edits go into telemetry.
9. No paid/new speech backend is introduced by this platform contract.
10. Browser/recognition limitations must be described truthfully; do not claim universal support, offline operation or guaranteed on-device recognition.

## What remains

The only explicit closeout item in [`WU-VOICE-PLAT-001D`](WU-VOICE-PLAT-001D-growth-measurement.md) is the short-form demonstration/creative asset work. Further keyword/route expansion is governed by [`WU-GROWTH-003`](WU-GROWTH-003-urdu-voice-typing-growth-seo.md) and its Search Console evidence gate, not by rebuilding this platform.

## Historical implementation contracts

- [`archive/implemented/WU-VOICE-PLAT-001A-shared-input-engine.md`](archive/implemented/WU-VOICE-PLAT-001A-shared-input-engine.md)
- [`archive/implemented/WU-VOICE-PLAT-001B-core-writing-rollout.md`](archive/implemented/WU-VOICE-PLAT-001B-core-writing-rollout.md)
- [`archive/implemented/WU-VOICE-PLAT-001C-create-social-rollout.md`](archive/implemented/WU-VOICE-PLAT-001C-create-social-rollout.md)
- The original dedicated speech behaviour contract is preserved at [`archive/implemented/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`](archive/implemented/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md); current behaviour is governed by the shipped code/tests above.

The pre-reconciliation parent is preserved at [`archive/snapshots/WU-VOICE-PLAT-001-2026-08-30-pre-reconciliation.md`](archive/snapshots/WU-VOICE-PLAT-001-2026-08-30-pre-reconciliation.md).

## Closure rule

Archive this parent after the remaining acceptance/creative closeout is resolved and there is no platform-level open decision. Ongoing acquisition experiments may remain active under `WU-GROWTH-003` independently.
