# WU-CARD-GALLERY-001 — Slice 0 Baseline

**Captured:** 2026-09-13  
**Branch:** `feat/card-studio-rich-background-collection`  
**Public route state:** gated; `/urdu-card-gallery` does not exist and must not be indexed or promoted without a recorded roadmap exception.

## Current background inventory

- 24 controlled backgrounds: 12 SVG and 12 WebP.
- Full-source assets: 1,901,171 bytes total.
- WebP preview thumbnails: 12 assets, 154,748 bytes total.
- The 12 IDs shipped before the rich-background expansion remain covered by contract tests.
- Card Studio reads the neutral `js/card-background-registry.js`; no background array is copied into Gallery code.
- Rich WebP full sources are not precached. Card Studio uses lazy thumbnails and fetches full artwork only after selection.

## Metadata audit

Every record currently has a controlled ID, bilingual label, declared category, source, text and overlay defaults, normalized safe area, text-capacity value, preferred alignment and bounded suitability tags.

All records currently resolve to `textCapacity: long` through the registry default. Treat this as existing collection metadata, not completed receiver-quality proof. Before Slice 1 exposes any background, visual fixture review must confirm its short, medium and long suitability or assign a more restrictive capacity.

## Text fixtures and preview rules

`tests/fixtures/card-gallery-text-fixtures.js` owns seven stable cases: short, medium, long, mixed Urdu/Latin/numbers, explicit newlines, whitespace-only and long unbroken content.

`js/card-gallery-core.js` provides browser-local pure logic for normalization, deterministic length buckets, a 600-character preview limit, safe-area validation/style conversion and capacity checks. It has no DOM, canvas, network, storage or telemetry side effects.

## Performance baseline and Slice 1 targets

No Gallery DOM route exists in Slice 0, so browser typing latency and Gallery network waterfalls are not yet runnable. They remain required Slice 1 evidence; source-level timing is not a substitute.

Targets for the first Gallery implementation:

- render each preview shell once and batch text-node/class writes with at most one `requestAnimationFrame` update per input frame;
- 24-card preview update: no long task above 50 ms on the agreed mid-range mobile profile and no visible input lag;
- zero preview canvases and zero layout reads inside the per-card update loop;
- zero repeated background requests while typing;
- lazy thumbnail loading, with no eager fetch of all 1,901,171 full-source bytes;
- no page-level horizontal overflow at 360x800, 375x667, 390x844, 412x915 or 768x1024.

## Handoff map

Gallery must extend the existing session-scoped workspace handoff. Required controlled payload is text, `backgroundId`, source `card-gallery`, and optional preset/intent. Text must never enter path, query, hash or telemetry. Card Studio must resolve the ID through the shared registry, apply existing background defaults through its current image pipeline, and preserve normal editing/export.

## Slice 0 stop state

Foundation may merge independently if focused and full regression gates pass. Stop before Gallery route, navigation, sitemap, `llms.txt`, public registry or SEO promotion until backlog permission is explicit.
