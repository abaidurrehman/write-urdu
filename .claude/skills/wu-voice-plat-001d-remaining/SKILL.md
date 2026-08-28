# WU-VOICE-PLAT-001D — Remaining Growth/Measurement Items

Use this skill to finish the 1 open item under Slice D of `WU-VOICE-PLAT-001`. Slices A/B/C and Slice D items 1-2 below are already done as of commit `7e66f54` (2026-08-25) — do not redo them. This file was corrected 2026-08-28 after being found stale (it still called items 1-2 "pending" three days after they shipped).

## Mandatory reading

```text
specs/WU-VOICE-PLAT-001D-growth-measurement.md
specs/WU-VOICE-PLAT-001-unified-urdu-input-platform.md
specs/BACKLOG.md   (P0.8 section)
```

## Already done — do not rebuild

- Voice adoption/final-speech/switch-continuation events (`voice_exposed`, `voice_selected`, `voice_started`, `voice_final`, `voice_switch_continued`) wired end-to-end into `functions/api/events.js`, aggregated into `product_hourly_metrics` / `product_hourly_locale_metrics` (`migrations/0009_voice_input_mode.sql`, applied to production D1).
- `input_voice` outcome taxonomy value in `session_summary` via `js/product-telemetry.js`'s `trackOutcome()`.
- Owner-page copy (`DISCOVERY_COPY` in `js/writer-voice-input.js`) already matches spec §3 approved language.
- No bulk voice+outcome SEO pages — correctly held behind evidence gate per `WU-GROWTH-003`.

These counters are the data source the pending items below must read/extend — don't create a second telemetry path.

## Done — item 1, Cross-workspace Product Pulse section (spec §7)

Shipped in `functions/api/internal/product-pulse.js` (voice adoption panel) + `os/product-pulse.html`, reading `product_hourly_metrics` / `product_hourly_locale_metrics` from migration 0009 plus `voice_error` telemetry from migration 0010. Answers all 8 questions from spec §7. Do not conflate with `functions/api/internal/voice-account-pulse.js` / `voice_account_hourly_metrics` — that is a separate, route-scoped signup-attribution system for `/tools/urdu-voice-typing` only, from a different epic.

## Done — item 2, WhatsApp voice-to-message outcome (spec §4) + Status-vs-message distinction (spec §13 items 9–10)

Shipped: `shareToWhatsApp()` in `js/urdu-voice-typing.js:190` opens `api.whatsapp.com/send?text=` for the `Speak an Urdu message → edit/correct → Send to WhatsApp` job, kept measurably distinct from the Status image flow.

## Pending item — Short-form demonstration assets (spec §9)

Outside normal tooling/code access (needs channel/creative production) — flag to user rather than attempting to fabricate video/creative assets. If asked to proceed, produce only the scripted demo steps (already drafted in spec §9 for Instagram/WhatsApp Status/Card Studio/Rich Editor) as text/storyboard, showing the correction step deliberately, no unsupported accuracy/privacy/browser claims.

## Required checks

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

For analytics/reporting changes also run current telemetry/Product Pulse contract tests. For SEO copy, verify canonical/title/H1 ownership unchanged unless an explicit evidence-backed experiment says otherwise.

## Verify live before building

Per project governance: this repo hides shipped work behind runtime JS injection. Render the actual Product Pulse page and target workspaces live before assuming what exists vs. what's missing.
