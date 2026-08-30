# WU-VOICE-PLAT-001D — Remaining Growth/Measurement Item

Use this skill only for the remaining non-code closeout under `WU-VOICE-PLAT-001D`. Slices A/B/C and the functional Slice D telemetry/reporting/WhatsApp items are already shipped — do not rebuild them.

## Mandatory reading

```text
specs/WU-VOICE-PLAT-001D-growth-measurement.md
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/BACKLOG.md   (P0.5 — Voice platform non-code closeout)
specs/archive/README.md
```

## Already done — do not rebuild

- Shared voice core and Roman/direct/voice editing integration across eligible writing/create workspaces.
- Voice adoption/final-speech/switch-continuation events (`voice_exposed`, `voice_selected`, `voice_started`, `voice_final`, `voice_switch_continued`) aggregated into `product_hourly_metrics` / `product_hourly_locale_metrics` via `migrations/0009_voice_input_mode.sql`.
- `input_voice` completion taxonomy through `js/product-telemetry.js`.
- Cross-workspace Product Pulse voice adoption/reporting in `functions/api/internal/product-pulse.js` + `os/product-pulse.html`, including bounded voice-error telemetry from migration 0010.
- WhatsApp voice-to-message outcome in `js/urdu-voice-typing.js`, kept distinct from the Status image flow.
- Owner-page discovery copy and the decision not to create bulk voice+outcome SEO pages without evidence.

Historical implementation slices A–C now live under `specs/archive/implemented/`. Their location change does not reopen them.

## Remaining item — short-form demonstration assets

This requires channel/creative production. When asked to proceed, produce the scripted demo/storyboard steps for the approved Instagram / WhatsApp Status / Card Studio / Rich Editor journeys, deliberately showing the correction step. Do not invent unsupported accuracy, privacy, offline or browser-support claims.

Further keyword/route expansion belongs to `WU-GROWTH-003` and must pass its Search Console evidence gate.

## Required checks for any code-adjacent follow-up

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Verify the current runtime before assuming something is missing. This repository has repeatedly had shipped functionality outlive stale planning text; code/tests are the source of truth for shipped behaviour.
