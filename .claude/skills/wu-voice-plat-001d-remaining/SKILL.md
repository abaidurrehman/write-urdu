# WU-VOICE-PLAT-001D — Remaining Growth/Measurement Items

Use this skill to finish the 3 open items under Slice D of `WU-VOICE-PLAT-001`. Slices A/B/C and most of Slice D are already done — do not redo them.

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

## Pending item 1 — Cross-workspace Product Pulse section (spec §7)

Extend existing Product Pulse reporting (do not build a separate voice dashboard) to answer:

1. How many eligible workspace sessions expose/support Voice?
2. How many users start Voice by workspace?
3. What percentage receive at least one final result?
4. Which workspaces have highest Voice adoption?
5. Which workspaces see useful completion after Voice?
6. How often do users switch Voice → Roman/direct before completion?
7. Which bounded failure categories suppress activation?
8. Is mobile usage materially different from desktop?

Source data: `product_hourly_metrics` / `product_hourly_locale_metrics` counters from migration 0009. Do not join Search Console query data to user-level product sessions. Do not conflate with `functions/api/internal/voice-account-pulse.js` / `voice_account_hourly_metrics` — that is a separate, route-scoped signup-attribution system for `/tools/urdu-voice-typing` only, from a different epic.

## Pending item 2 — WhatsApp voice-to-message outcome (spec §4) + Status-vs-message distinction (spec §13 items 9–10)

Job: `Speak an Urdu message → edit/correct it → Copy or Share to WhatsApp`, distinct from the existing `Speak Urdu Status → design image → download/share image` flow.

Rules:
- Use existing compatible text/share surfaces (Voice Typing successful-result actions, Basic Writer share flow, an approved `Send to WhatsApp` / `Copy message` action, or a `Make WhatsApp Status` transform into Status Maker).
- Do not create a new backend.
- Do not put user text in a GET URL to hand it between Write Urdu pages.
- Do **not** create `/urdu-whatsapp-message-maker` or similar — no new route without Search Console demand evidence or strong product usage evidence showing a repeatable message-specific workflow distinct from Status Maker/Basic Writer (spec §4.3).
- Keep the Status outcome and the message outcome measurably distinct (§13 items 9–10), not merged into one completion bucket.

## Pending item 3 — Short-form demonstration assets (spec §9)

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
