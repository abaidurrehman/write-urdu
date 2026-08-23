# WU-SEO-CTR-001 baseline — 2026-08-22

**Status:** Repository baseline captured; Search Console URL Inspection and dated export evidence pending.

This record separates facts available in the repository from external evidence that has not yet been supplied. It is not approval to start a homepage title or description experiment.

## Repository baseline

Base commit: `5949bb0656a80644b9eb457bef4a9467864a2ff6`

| Route | Search title | H1 | Canonical | Intended owner |
| --- | --- | --- | --- | --- |
| `/` | `English to Urdu Typing Online | WriteUrdu` | `English to Urdu Typing Online` | `https://write-urdu.com/` | English to Urdu typing, Urdu typing online and broad Urdu writing |
| `/urdu-keyboard` | `Online Urdu Keyboard – Type Urdu in Your Browser` | `Urdu Keyboard` | `https://write-urdu.com/urdu-keyboard` | Direct Urdu characters, on-screen Urdu keyboard and physical Urdu keyboard |

The Phase 1 implementation does not change either route's title, description, H1, canonical or URL.

## Supplied Search Console snapshot

The specification contains the following newer snapshot. Its observation date, query-to-page dimension, device and country were not supplied, so these figures are reference signals rather than a clean experiment baseline.

| Query | Impressions | Clicks | CTR | Position | Expected owner; observed owner pending |
| --- | ---: | ---: | ---: | ---: | --- |
| `english to urdu typing` | 31,966 | 25 | 0.1% | 7.4 | `/` |
| `urdu typing` | 10,309 | 199 | 1.9% | 6.5 | `/` |
| `urdu writing` | 5,290 | 82 | 1.6% | 6.4 | `/` |
| `urdu typing online` | 3,526 | 111 | 3.1% | 5.6 | `/` |
| `urdu keyboard online` | 3,403 | 26 | 0.8% | 8.1 | `/urdu-keyboard` |

The same observations are recorded in `docs/SEO-QUERY-TRACKING.csv` with their evidence limitations.

## Evidence required before a metadata experiment

- [ ] Verify successful production responses and initial HTML for `/` and `/urdu-keyboard`.
- [ ] Record Google-selected canonical and last-crawl date for both routes from URL Inspection.
- [ ] Record the indexed title and snippet with an observation date.
- [ ] Export Search Console Queries, Pages, Devices and Countries for a dated comparison window.
- [ ] Confirm the landing page receiving impressions and clicks for every priority query.
- [ ] Check for a competing selected `www` homepage canonical.
- [ ] Confirm the latest acquisition copy has been recrawled and reprocessed.

## Measurement and freeze decision

Search Console remains the source for query, landing-page, device, country, CTR, clicks, impressions and position. Existing privacy-safe Product Pulse and acquisition reporting can provide route entries, editor engagement, copy, export and handoff totals. These sources are compared by observation window; they are not joined at user level.

Homepage metadata remains frozen. The first allowed SERP experiment changes one title variable only after the evidence checklist above provides a stable baseline. Description and first-screen wording must remain stable during that later title observation window.
