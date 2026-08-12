# WU-SUA-001 — Stylish Urdu Text and Name Art Studio

**Product:** Write Urdu
**Feature ID:** `WU-SUA-001`
**Status:** Implemented
**Canonical routes:** `/stylish-urdu-text-generator`, `/urdu-name-art-maker`
**Delivery:** Browser-first; no account, backend, paid API or AI dependency

## Governance note — 2026-08-12

Acceptance closure is complete. The existing feature was audited rather than redesigned, and the audit found a small set of real gaps that are now covered by implementation and regression tests: the Popular filter no longer leaks the full catalogue, result cards include the required Share action, Name Art has its promised 24-template/12-pack layer on top of the existing Card Studio renderer, and the transparent-name export contract is implemented at 1600×900 with font waiting and exact-dimension verification.

The feature remains a browser-local product. Later v2 creation-shell migration is visual/product-shell work and does not reopen this feature contract.

## Purpose

Add two connected tools:

1. **Stylish Urdu Text Generator** creates curated, copyable Unicode-decorated
   Urdu, Roman Urdu and mixed Urdu-English text.
2. **Urdu Name Art Studio** creates exact-appearance name images with real Urdu
   fonts, backgrounds, templates and local PNG export.

The tools must explain the difference clearly: copied text uses Unicode symbols
and the destination app controls font rendering; Name Art renders the selected
font into an image.

## Shared rules

- Reuse existing transliteration, clipboard, sharing, local-storage, fonts,
  Card Studio rendering and export utilities.
- Normalize input with NFC, preserve Urdu-specific letters, remove dangerous
  bidi overrides, and count grapheme clusters where supported.
- Never reverse Urdu strings or apply Latin font maps to Arabic-script runs.
- Keep text, favourites, projects and uploaded images local; never send names or
  raw text to analytics and never place user text in URLs.
- Use stable catalog/template IDs, versioned storage, corrupt-state recovery,
  accessible controls and mobile-safe layouts.

## Release 1 — Stylish Urdu Text Generator

### Required behaviour

- Route: `/stylish-urdu-text-generator`; optional legacy route redirects to it.
- Direct Urdu, pasted text and the existing Roman Urdu input mode are supported.
- Generate deterministically after explicit Generate, examples, committed
  transliteration or debounced live input.
- Provide at least 80 original styles in data, with categories All, Popular,
  Minimal, Royal, Hearts, Islamic, Gaming, Social, Kashida, Urdu + English and
  Decorative, plus Light/Medium/Strong intensity filters.
- Initially show 24 results and load 24 more at a time.
- Result cards provide RTL preview, label, compatibility tier, Copy, Favourite,
  Collection, Share and Open in Name Art actions.
- Favourites, collections and the latest ten inputs use versioned local storage.
- Explain “Works widely”, “May vary by app” and “Best as an image” accurately.
- Include visible SEO introduction, instructions, use cases, accuracy note, FAQ,
  metadata, schema and related-tool links.

### Core transforms

Implement pure, tested transforms: identity, word separators, Latin-only bold
or small-caps maps where tested, and conservative safe Kashida insertion. Never
split graphemes, combining marks, punctuation or non-joining characters.

## Release 2 — Urdu Name Art Studio

### Required behaviour

- Route: `/urdu-name-art-maker`.
- Read a short-lived `sessionStorage` handoff from Release 1, the main editor or
  Card Studio; expire it after 30 minutes and remove it after import.
- Reuse Card Studio’s renderer, fonts, local image handling, direct editing,
  interaction layer, drafts, sharing and export pipeline rather than creating a
  second canvas engine.
- Provide at least 24 original data-driven templates across Minimal, Royal,
  Islamic, Gaming, Love, Floral, Neon, Traditional, Modern, Pakistan, Wedding
  and Social Profile packs.
- Support profile square (1080×1080), portrait (1080×1350), landscape
  (1280×720), wide social (1200×630), story (1080×1920) and transparent name
  (1600×900) presets where the shared renderer supports them.
- Support main text, optional secondary text, Urdu-safe font controls, auto-fit,
  word spacing, alignment, colour, stroke, shadow/glow, opacity, conservative
  rotation, ornaments, solid/gradient/transparent/local-image backgrounds,
  cover/contain positioning, overlay and blur.
- Provide layer selection, drag/resize, keyboard/touch movement, centre/reset
  controls, undo/redo, debounced local drafts and reset confirmation.
- Ship PNG and transparent PNG. Keep SVG disabled unless Urdu fidelity is
  verified; PNG is the exact-appearance recommendation.
- Include visible SEO guidance, privacy copy, FAQ and related links. Explain
  that users download and share manually; there is no social-account connection.

## Privacy and resilience

- Uploaded images are MIME-validated, decoded locally, downscaled when needed,
  re-rendered for export and object URLs are revoked.
- Storage failures, unavailable transliteration, invalid images, font failures,
  export failures and corrupt drafts preserve current work and show recoverable
  user-facing messages.
- Analytics, if present, may receive only IDs, categories, format, script kind,
  length buckets and error codes—never user text, names, filenames or images.

## Acceptance checklist

- [x] Spec and feature ID are tracked in `specs/README.md`.
- [x] Both canonical routes exist without a backend.
- [x] Release 1 has 80 unique tested styles and local favourites/collections/recents verified end-to-end.
- [x] Release 2 has 24 original templates across 12 packs and imports Release 1 text locally through an expiring one-time handoff.
- [x] Urdu shaping, mixed direction text, grapheme safety and safe Kashida pass tests.
- [x] Existing Card Studio and editor behaviour remain on the shared renderer/contracts; no second canvas engine was introduced.
- [x] PNG/transparent PNG export uses exact dimensions and waits for fonts/assets; transparent-name export verifies a 1600×900 alpha canvas.
- [x] Accessibility, responsive layout, privacy messaging and SEO content are covered by source and browser acceptance checks.
- [x] Static, unit, integration/browser and repository quality checks pass, including targeted desktop/mobile `WU-SUA-001` Playwright acceptance in CI.

## Acceptance evidence — 2026-08-12

- Stylish core tests verify 80 unique IDs/outputs, pure Urdu and mixed-script generation, category/intensity combinations, grapheme preservation and conservative Kashida behavior.
- The Popular category regression is locked to featured results instead of the full 80-style catalogue.
- Browser acceptance verifies favourites, collections, recent input recovery and result sharing.
- Browser acceptance verifies Stylish Text → Name Art handoff without putting user text in the URL and confirms the handoff is removed after import.
- Name Art exposes 24 templates across 12 packs while installing those definitions into the existing Card Studio core at runtime.
- Name Art output presets include 1080×1080, 1080×1350, 1280×720, 1200×630, 1080×1920 and transparent 1600×900.
- Transparent export waits for project fonts, verifies exact canvas dimensions, exports PNG locally and restores the original design state.
- The focused acceptance browser suite runs on desktop and mobile Chromium in the repository quality workflow.

## Implementation map

Core modules are `js/stylish-urdu-core.js`, `js/stylish-urdu-text.js`,
`css/stylish-urdu.css`, `stylish-urdu-text-generator.html`, `js/name-art-core.js`,
`js/name-art.js`, `css/name-art.css` and `urdu-name-art-maker.html`. Name Art remains
an adapter over Card Studio/shared modules rather than a separate renderer.

Acceptance coverage lives in `tests/stylish-urdu-core.test.js`,
`tests/sua-acceptance-contract.test.js` and `tests/sua.spec.js`.

## Deferred

Cloud projects, accounts, AI calligraphy, translation, batch CSV generation,
public design URLs, arbitrary SVG uploads, guaranteed platform compatibility,
and SVG export without verified Urdu fidelity remain out of scope.
