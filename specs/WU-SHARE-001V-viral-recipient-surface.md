# WU-SHARE-001V — Viral Recipient Surface & Discoverability Policy

**Status:** Active implementation slice  
**Parent:** `WU-SHARE-001-public-share-pages-viral-publishing-loop.md`  
**Priority:** P0 growth  
**Route:** `/s/:id`  
**Date:** 2026-09-14

## 1. Why this slice exists

The public share page is now receiving paid/social distribution traffic. Its job is no longer only to display an immutable public snapshot. It must turn recipients into useful actions without becoming a heavy landing page.

Target loop:

`Facebook / WhatsApp / direct share -> view card -> share or save -> create/remix -> publish -> new recipient`

The card remains the hero. Everything else must be small, fast and subordinate to the artwork.

## 2. Slice 1 implementation

Ship without adding a framework, external UI package, ad script, font bundle, or client-side renderer.

### Card-level actions

Immediately beside/below the artwork:

- native Share;
- direct Download PNG;
- Copy Urdu text.

PNG download reuses the existing same-site `/share-media/:id` object. No client-side re-render is allowed.

### Creation acquisition

The strongest recipient CTA is:

`اپنا خوبصورت اردو کارڈ بنائیں`

with supporting English copy:

`Create your own Urdu card — free, no account`

Keep:

- `Use this text`;
- `Try this text with another design` -> `/urdu-card-gallery` through browser-local handoff;
- QR generation;
- Copy link.

The recipient must never place the Urdu text or the share ID into a destination query string.

### Social preview

Use a bounded plain-text excerpt from the already-public Urdu as the page/social title when available. Keep the published card as the `og:image`.

No arbitrary HTML is permitted in metadata.

## 3. Performance contract

The `/s/:id` route is a lightweight viral surface.

Slice 1 may add:

- HTML;
- CSS;
- a few event listeners;
- same-site navigation/downloads.

Slice 1 must not add:

- AdSense or another third-party ad script;
- a PDF library in the initial bundle;
- a template carousel asset payload above the fold;
- a client framework;
- another font catalog request;
- analytics containing share IDs or public text.

PDF, if added later, must be lazy/on-demand and must not affect first paint.

## 4. Indexability: correct product model

`noindex` is **not a permanent architectural rule** for every public card.

It is currently the correct default for existing `/s/:id` links because the publishing contract told creators that the page is public to **anyone with the link** and that share pages are not intended to appear in search results. Retroactively exposing those existing links to search would broaden the audience without an explicit publisher decision.

Therefore public sharing has two distinct visibility modes.

### A. Unlisted public share — current/default

- anyone with the URL can open/forward it;
- `noindex,follow`;
- not in XML sitemap or public discovery feed;
- no retroactive promotion into search;
- appropriate for arbitrary anonymous UGC.

All existing share artifacts remain in this mode.

### B. Discoverable public share — future opt-in

A later slice may allow a publisher to explicitly choose something equivalent to:

`Allow this public card to be discoverable in Write Urdu and search engines`

This is a separate consent from simply creating a public link.

Discoverable eligibility must require all of:

- explicit publisher opt-in recorded at publication/update time;
- active moderation state;
- no unresolved reports;
- bounded, meaningful public text;
- duplicate/spam controls;
- stable canonical;
- ability to remove the item from discovery promptly after delete/block/opt-out;
- sitemap inclusion only for eligible items.

Do not infer consent from traffic, Facebook campaign usage, the age of a link, or the fact that the URL is technically public.

## 5. First-party / curated cards

Write Urdu-owned or explicitly curated cards are different from arbitrary anonymous UGC.

They may be made indexable through a governed curated-card route or an explicitly discoverable share state because Write Urdu controls the content and quality. This is the preferred first place to test search demand before opening discoverability broadly.

Do not turn the random `/s/:id` namespace into an uncontrolled indexable content farm.

## 6. AdSense decision

Do not add AdSense in this slice.

Reason:

- the conversion value of a card recipient is currently unknown and may exceed a display-ad impression;
- anonymous UGC creates policy/moderation exposure;
- third-party ad JavaScript works against the lightweight-page goal.

First measure:

- share-page views;
- share completions;
- PNG downloads;
- recipient creation handoffs;
- card-gallery handoffs;
- referred publish/re-publish.

After sufficient traffic, a later experiment may add **one** below-content AdSense placement against the first-party-only control. The card and creation actions must remain above it.

First-party promotion of Card Studio is allowed and preferred.

## 7. Follow-up slices

### Slice 2 — discoverability data contract

Add a visibility field such as:

`visibility = 'unlisted' | 'discoverable'`

with `unlisted` as the migration/default value.

Add publisher consent UI and management controls. Do not migrate old rows to `discoverable`.

### Slice 3 — curated/search pilot

Pilot indexing with Write Urdu-owned or explicitly opted-in reviewed cards. Measure:

- indexed pages;
- impressions/clicks;
- duplicate/soft-404 signals;
- report rate;
- recipient-to-creator conversion.

Only expand if search quality and conversion are healthy.

### Slice 4 — monetization experiment

If the share surface has enough volume, test one lazy/below-content AdSense placement against the first-party-only control. Optimize for revenue **and** creator conversion, not ad RPM alone.

## 8. Acceptance for Slice 1

- artwork remains first in document/mobile flow;
- PNG can be downloaded without client re-render;
- native share remains available with copy-link fallback;
- public Urdu can be copied;
- Card Studio is the strongest acquisition CTA;
- the same Urdu can be sent to Card Gallery without URL leakage;
- dynamic social title uses only escaped bounded public text;
- current existing share links remain `noindex`;
- no AdSense/third-party script added;
- current reporting/deletion/privacy controls remain intact.
