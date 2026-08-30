# WU-SEO-CS-001 — Card Studio SEO Acquisition

**Product:** Write-Urdu.com  
**Feature ID:** `WU-SEO-CS-001`  
**Status:** Implemented  
**Primary route:** `/urdu-card-studio`  
**Supporting guide:** `/how-to-write-urdu-on-photo`  
**Parent decision:** P1.5 Creation Tool SEO Investment Scorecard

## Purpose

Turn Urdu Card Studio into the primary search destination for the broad browser job of putting Urdu text, poetry, quotes and announcements on a photo or social image, without creating multiple keyword-variant doorway pages or changing the Card Studio renderer/workflow.

## Query ownership

`/urdu-card-studio` is the single product owner for the broad creation cluster:

- Urdu text on photo
- write Urdu on photo
- Urdu poetry on photo
- Urdu post maker
- Urdu poetry card maker
- Urdu quote maker
- Urdu poster maker online when the intent is a lightweight browser creator

`/how-to-write-urdu-on-photo` owns informational/how-to intent only. It explains the workflow and links into Card Studio; it is not a second generator page.

## Evidence basis

The P1.5 review found active mobile products centered on Urdu text/poetry on photos and Urdu post/poster making, including products with substantial install counts. These are used as observable demand proxies, not as monthly keyword-volume estimates. The corresponding browser opportunity is treated as an Urdu-first creation wedge adjacent to WriteUrdu's established writing authority.

## Implementation

- Keep `/urdu-card-studio` and all existing renderer/export/storage contracts unchanged.
- Give Card Studio a search-facing title and description centered on Urdu text/poetry on photos.
- Expose that acquisition title/description directly in the initial static HTML, Open Graph and Twitter metadata; JavaScript must not be required to discover the preferred search title.
- Keep `seo.config.js` as the metadata source of truth and enforce checked-in HTML synchronization through `scripts/sync-static-search-metadata.js`.
- Refresh Card Studio sitemap freshness/priority for the acquisition investment.
- Publish one substantive guide, `/how-to-write-urdu-on-photo`, covering:
  - Roman Urdu/direct Urdu input;
  - output-size choice;
  - local photo/background use;
  - Nastaliq vs Naskh readability;
  - mobile readability/safe-area considerations;
  - local processing/privacy boundaries;
  - direct handoff into Card Studio/Templates/WhatsApp Status Maker.
- Add the topic and guide to `llms.txt`.
- Preserve ads outside the active Card Studio workspace/result/action region.

## Mobile guardrail

Acquisition content must never move ahead of the Card Studio task on the product route. The current v2 mobile contract remains preview/task first. The supporting guide may be long-form because it is a separate Learn route; every major section provides context rather than duplicating the generator.

## Non-goals

- No `/urdu-post-maker`, `/urdu-poetry-card-maker`, `/urdu-quote-maker` or similar doorway clones.
- No poetry/content database.
- No generic Canva-style positioning.
- No change to Card Studio canvas/rendering, project state, local image processing, templates or export behavior.
- No ad inside the active workspace.
- No invented search-volume, GSC mobile-traffic or RPM claims.

## Acceptance

- [x] `/urdu-card-studio` remains canonical product owner.
- [x] Search-facing Card Studio metadata includes Urdu text/photo and poetry/post intent.
- [x] Preferred acquisition title/description are present in initial HTML, Open Graph and Twitter metadata.
- [x] One distinct informational guide exists and canonicalizes to `/how-to-write-urdu-on-photo`.
- [x] Guide keeps one H1, valid Article schema through the shared SEO system and extensionless links.
- [x] Guide explains transliteration accurately as sound-to-script, not translation.
- [x] Guide states local photo/background processing accurately.
- [x] Guide includes phone readability guidance without pushing content ahead of the Card Studio workspace.
- [x] Sitemap and redirects include the new canonical route.
- [x] `llms.txt` identifies Card Studio as the primary Urdu image-creation surface.
- [x] Initial metadata synchronization is protected by `npm run seo:check` and the production SEO audit.
- [ ] Re-score with route/query/device Search Console evidence after 8–12 comparable weeks.
