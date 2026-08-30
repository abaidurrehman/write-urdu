# WU-CS-UX-001 — Urdu Card Studio Guided Workflow

**Product:** Write-Urdu.com  
**Feature ID:** `WU-CS-UX-001`  
**Status:** Implemented  
**Owner:** Product / Frontend  
**Source:** Product Manager Card Studio Improvement Specification (2026-07-17)  
**Route:** `/urdu-card-studio`

## Purpose

Reduce Card Studio cognitive load by making the preview the primary focus and
guiding users through a clear task-based flow. This is a UX reorganisation of
the existing browser-only renderer, direct editing, templates, local images,
autosave, and PNG export; it does not add a backend or a new rendering engine.

## User flow

1. **Content** — enter, paste, transliterate, clear, or use sample Urdu text.
2. **Format** — choose a use case and receive a recommended preset/template.
3. **Style** — refine template, background, text style, and layout.
4. **Export** — review dimensions, download PNG, or share.

The preview remains visible during every step. Empty card text keeps the user
on Content with a clear prompt instead of allowing a confusing blank export.

## UX modes

- **Quick mode (default):** essential controls and strong defaults only.
- **Advanced mode:** exact layout, line-height, shadow, image positioning, and
  watermark-position controls.

The mode is presentation state and must not mutate document content. Advanced
controls are hidden with both state-driven `hidden` attributes and a CSS
fallback so normal field synchronisation cannot accidentally reveal them.

## State contract

The existing serializable card project remains the source of truth for
document content and rendering. The workflow controller owns:

```js
{
  activeStep: "content" | "format" | "style" | "export",
  mode: "quick" | "advanced"
}
```

The project stores the selected use case (`quote`, `social`, `story`, or
`announcement`) alongside its existing preset, template, text, transforms,
background, watermark, and asset references. Template and preset changes keep
the existing text and migration-safe geometry behavior.

## Use-case defaults

| Use case | Preset | Template |
| --- | --- | --- |
| Quote / Poetry | Square | Classic Nastaliq |
| Social post | Square | Minimal White |
| Status / Story | Story | Midnight |
| Greeting / Announcement | Landscape | Botanical Frame |

Use-case selection is undoable and only changes recommended styling/layout;
the user’s text is preserved.

## Layout requirements

- Desktop: grouped top command bar, step-based inspector, dominant canvas,
  contextual text toolbar.
- Mobile: large preview, active-step controls, fixed four-step bottom bar,
  touch-sized direct-edit handles, no dense all-controls sidebar.
- Export UI is visually separated from editing controls.
- Privacy reassurance appears near local image upload and export:
  “Processed in your browser. Your text and images stay on this device.”

## Non-goals

- No backend, accounts, cloud projects, or remote image processing.
- No replacement of the Canvas 2D renderer.
- No new object/layer system in this UX pass.
- No dynamic QR, analytics, or network transmission of card content.

## Acceptance checklist

- [x] Four visible Content / Format / Style / Export steps.
- [x] Preview remains visible while changing steps.
- [x] Quick mode is the default.
- [x] Advanced controls are progressively disclosed.
- [x] Use-case cards apply recommended preset and template defaults.
- [x] Text is preserved when changing use case, template, or preset.
- [x] Empty text prevents progression with an instructive message.
- [x] Mobile has a compact bottom step bar.
- [x] Direct selection/editing remains native and export-safe.
- [x] Local-image and browser-processing privacy copy remains visible.
- [x] Static and browser regression tests cover the workflow.

## Implementation map

- `urdu-card-studio.html` — step shell, grouped inspector panels, use cases,
  export panel, and mobile step navigation.
- `css/card-studio.css` — workflow hierarchy, Quick/Advanced disclosure,
  responsive mobile presentation, and fixed step bar.
- `js/card-studio-ui.js` — workflow state, step transitions, use-case defaults,
  content actions, and history controls.
- `js/card-studio-core.js` — serializable `useCase` project field and existing
  normalization/template/preset behavior.
- `js/card-studio-interaction.js` — direct editing, object history, and undo /
  redo bridge.
- `tests/site.spec.js` — desktop/mobile guided-flow and use-case tests.
- `tests/static.test.js` — static contract checks for the new UI surface.

## Verification commands

```text
npm test
npm run seo:check
npx playwright test tests/site.spec.js -g "Card Studio|guided steps|use-case cards" --project=desktop-chromium --project=mobile-chromium
```
