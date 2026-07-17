# WU-SUA-001 — Stylish Urdu Text and Name Art Studio

**Product:** Write Urdu
**Feature ID:** `WU-SUA-001`
**Status:** Implementing
**Canonical routes:** `/stylish-urdu-text-generator`, `/urdu-name-art-maker`
**Delivery:** Browser-first; no account, backend, paid API or AI dependency

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

- [ ] Spec and feature ID are tracked in `specs/README.md`.
- [ ] Both canonical routes work without a backend.
- [ ] Release 1 has 80+ unique tested styles and local favourites/collections.
- [ ] Release 2 has 24+ original templates and imports Release 1 text locally.
- [ ] Urdu shaping, mixed direction text, grapheme safety and safe Kashida pass tests.
- [ ] Existing Card Studio and editor behaviour do not regress.
- [ ] PNG/transparent PNG export uses exact dimensions and waits for fonts/assets.
- [ ] Accessibility, responsive layout, privacy messaging and SEO content exist.
- [ ] Static, unit, integration/browser and production checks pass.

## Implementation map

Planned modules are `js/stylish-urdu-core.js`, `js/stylish-urdu-text.js`,
`css/stylish-urdu.css`, `stylish-urdu-text-generator.html`, and the Name Art
route/adapter that reuses `urdu-card-studio.html` and its shared Card Studio
modules. Add pure tests under `tests/` for normalization, script detection,
graphemes, generation, Kashida, storage and handoff.

## Deferred

Cloud projects, accounts, AI calligraphy, translation, batch CSV generation,
public design URLs, arbitrary SVG uploads, guaranteed platform compatibility,
and SVG export without verified Urdu fidelity remain out of scope.
