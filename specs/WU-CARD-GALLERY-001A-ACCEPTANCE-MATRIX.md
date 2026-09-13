# WU-CARD-GALLERY-001A — Acceptance Matrix

**Parent:** `WU-CARD-GALLERY-001A-social-background-collection-expansion.md`

This matrix is a release gate. A background is not accepted merely because it renders.

| Area | Acceptance requirement |
| --- | --- |
| Ownership | Asset is original to Write Urdu or has explicit usable rights/provenance. No scraped, traced, watermarked or hotlinked social/stock art. |
| Shared registry | Every new background is registered in the canonical shared registry; no page-local duplicate background lists. |
| ID stability | Existing shipped IDs remain unchanged and resolvable. New IDs are unique and stable. |
| Visual distinctness | New family differs materially in composition/motif/mood, not just colour/gradient. |
| Text-safe region | `safeArea` reflects the actual composition and keeps Urdu away from focal decoration. |
| Short Urdu | 1–2 line fixture is readable and balanced. |
| Medium Urdu | 3–4 line fixture is readable and balanced. |
| Long Urdu | Only designs claiming long capacity must pass 6–8 line fixture without clipping or visual deception. |
| RTL/Nastaliq | Urdu shaping, line-height and alignment remain visually correct. |
| Mixed content | Urdu plus Latin/numbers does not materially break the design. |
| Contrast | Default text colour + overlay is readable on mobile without user repair. |
| Art hierarchy | Urdu message remains the primary focal element; decoration is secondary. |
| No baked text | Background contains no decorative pseudo-text or embedded Urdu/Arabic/English wording presented as part of the message. |
| Card Gallery | Lightweight DOM preview works; no canvas-per-tile regression and no typing lag introduced. |
| Card Studio | Background loads by ID, edits correctly and exports through the existing authoritative renderer. |
| Ready-made cards | `WU-CARD-CONTENT-001/001A` can pair messages with the new design using IDs; no second renderer/data fork. |
| Homepage | `WU-CARD-RETENTION-001A` can consume an eligible ready-made card using the design; no homepage picker/carousel is added. |
| Share output | Representative exported/shared image remains attractive and legible at phone size. |
| Compression resilience | Representative compressed/downscaled output remains readable. |
| Asset size | Source and thumbnail formats are deliberate; no avoidable multi-megabyte asset or uncompressed production raster. |
| Loading | Offscreen rich assets are lazy-loaded and first viewport does not fetch the entire full-resolution collection. |
| Caching | No unbounded service-worker precache expansion. |
| Accessibility | Decorative art does not create noisy alt text; actual Urdu remains accessible DOM text on browse surfaces. |
| Privacy | No user Urdu, rendered image or arbitrary asset URL is sent to telemetry. |
| Telemetry | Any background ID measurement uses bounded public registry IDs through approved telemetry. |
| SEO | No new thin/indexable routes are created solely for background families. |
| Mobile | 360–430px browse/selection experience remains usable with no page-level overflow. |
| Regression | Current backgrounds, `/urdu-card-studio`, `/urdu-card-gallery`, `/urdu-cards` and existing handoffs remain functional. |

## Batch-specific gates

### Batch A — Daily/Jumma

Must provide strong approved coverage for at least:

- morning;
- night;
- Jumma;
- dua/reflection.

A batch should normally contain 6–8 backgrounds, but quality outranks count.

### Batch B — Poetry/emotional/family

Must provide visibly distinct approved coverage for at least:

- minimal poetry/literary;
- love/affection;
- reflection/longing;
- self-respect/life;
- family/friendship.

### Batch C — Cultural/seasonal

Must provide original, culturally respectful coverage for the approved subset of:

- Ajrak-inspired modern frame;
- Pakistani folk/truck-art-inspired frame;
- Ramadan;
- Eid;
- Pakistan heritage.

Do not directly reproduce a recognisable third-party textile/artwork pattern.

## Required manual review set

For each batch, capture or inspect representative outputs for:

1. short Urdu on a light design;
2. medium Urdu on a dark design;
3. medium Urdu on a visually rich design;
4. longest supported Urdu fixture;
5. one prepared message from `WU-CARD-CONTENT-001A`;
6. Card Gallery thumbnail/preview;
7. Card Studio exported image;
8. mobile-size receiver view.

## Release blockers

Do not release a background if any of these are true:

- text collides with art;
- safe area is guessed rather than validated;
- default contrast requires manual fixing;
- design is effectively a recolour of an existing design;
- asset provenance is unclear;
- asset contains copied/watermarked content;
- exported result differs materially from the gallery promise;
- Card Studio cannot restore it by ID;
- first-load performance regresses materially;
- Urdu text becomes decorative rather than readable.

## Overall success condition

The expansion passes when Write Urdu has a meaningfully broader original visual vocabulary for recurring social sharing, while the existing shared registry, fast browser-local workflow, Card Studio export path and homepage simplicity remain intact.