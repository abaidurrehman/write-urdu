# WU-SHAADI-001 — SVG Art Pack 01: Riwaayat

**Date:** 2026-09-18 (updated 2026-09-20 — Rukhsati/Engagement added)  
**Status:** Live in production. Wired into `js/wedding-template-selector.js`'s `suggestBackgroundCategory`/`resolveEventBackground` and rendered as DOM/CSS backgrounds (not Card Studio) on `/urdu-wedding-invitation-maker`'s design and preview/export steps.  
**Epic:** `WU-SHAADI-001 — Pakistan Wedding Invitation Platform`

## Purpose

Create the first coherent event-specific Pakistani wedding art suite for the structured wedding invitation system.

The pack follows the epic rule that a family chooses one visual identity, while individual functions remain visually appropriate to their own mood. It intentionally avoids a generic one-background-for-every-event approach.

## Pack

| Variant | Event | Direction |
|---|---|---|
| `riwaayat-nikah-ivory` | Nikah | Ivory/champagne, restrained Mughal arch, jasmine, fine geometry |
| `riwaayat-mehndi-marigold` | Mehndi | Marigold/saffron, teal + fuchsia accents, dholki, garland/gota energy |
| `riwaayat-baraat-emerald` | Baraat | Deep emerald, gold jali and arches, burgundy roses, formal scale |
| `riwaayat-walima-sage` | Walima | Sage/ivory, dusty rose botanicals, champagne details, softer reception mood |
| `riwaayat-mayun-saffron` | Mayun | Turmeric/saffron, genda flowers and mirror/gota rhythm |
| `riwaayat-dholki-fuchsia` | Dholki | Fuchsia/teal jewel palette, dholki and festive string lights |
| `riwaayat-rukhsati-dove` | Rukhsati | Dusty lilac/silver-blue, doves and jasmine, tender/bittersweet departure mood |
| `riwaayat-engagement-blush` | Engagement | Blush/champagne, ring and rose motifs, soft elegant mangni mood |

## Design contract

- Original SVG/vector compositions only; no copied vendor artwork.
- 1080×1350 (4:5), matching current social/card output conventions.
- Decoration stays at edges; the useful text zone remains approximately 60–70% calm.
- No bride/groom names, Quranic text, Bismillah, dates or venue text is baked into the artwork.
- Religious text remains a separate verified content layer as required by WU-SHAADI-001.
- Urdu/English/bilingual invitation content can be regenerated without touching the asset.
- No external fonts, raster images, URLs or remote dependencies.
- Motifs are event-specific while frame rhythm and spacing make the suite feel related.
- Artwork is intentionally separate from the generic Card Gallery registry until the wedding renderer/theme adapter is defined.

## Source direction

The event-to-mood mapping reflects current Pakistani invitation practice: Nikah is typically sacred/elegant, Baraat formal/grand, Mehndi bright/playful, and Walima softer/refined. The important product pattern is a coordinated invitation suite, not identical cards for every function.

## Next design round

Rukhsati and Engagement coverage (item 2 below) shipped 2026-09-20 — the pack now covers all 8 event types `wedding-project-core.js` knows about except `custom` (which intentionally never gets a fabricated suggestion).

Remaining, in order:

1. add a second suite with a different visual language rather than recolouring Riwaayat;
2. ~~cover Rukhsati and Engagement~~ — done;
3. add a minimal contemporary suite for families that do not want traditional florals;
4. add preview fixtures with real Urdu/English/bilingual wedding content.
