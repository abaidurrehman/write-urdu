# WU-PLAT-002 Slice G — Create / Publish / Work boundaries

**Status:** Implementation candidate  
**Date:** 2026-08-18  
**Parent:** `WU-PLAT-002` V2 Product Journey & Workspace Handoffs

## Purpose

Make creation, publishing and practical-work flows follow the same journey rules as Write/Fix/Capture without turning every completion action into another page hop.

## Boundary decisions

### Templates

- The current 46 library templates remain owned by **Card Studio** because their schema, styles and renderer are Card Studio-native today.
- A template choice is a `template-seed` handoff with bounded `templateId` metadata.
- If the user reaches Templates from Basic Writer, the current plain text is carried separately in browser-local state and applied after template selection.
- The selected template URL may contain its bounded slug for recognisable Card Studio state; user writing never enters the URL.
- Future WhatsApp/Instagram-specific templates must declare an explicit owner workspace instead of inferring ownership from dimensions or category names.

### Create / Publish completion

The following remain embedded in their owning workspace:

- Card Studio download / publish / caption actions;
- WhatsApp Status download;
- Instagram download / caption;
- QR download;
- Invoice export.

A useful completion action is not converted into navigation merely to increase page circulation.

### Public share continuation

The public snapshot has three distinct intents:

1. **Use this text** → Basic Writer with the published text.
2. **Create your own Urdu design** → Card Studio with the published text.
3. **Make QR for this link** → QR Generator with the public share URL.

All three use the v2 session-only handoff envelope. The published artifact itself is never mutated.

### QR

QR remains a Publish workspace. Slice G adds a v2 consumer adapter that bridges approved `plain-text` envelopes to the mature QR engine. Existing legacy entry points remain compatible during migration.

### Work / Invoice

Invoice remains a structured Work workspace:

- no generic Rich Editor → Invoice handoff;
- no unstructured editor text import into invoice data;
- payment QR remains embedded inside Invoice;
- download / print remain embedded.

## Compatibility architecture

Slice G deliberately avoids rewriting Card Studio, QR Generator, Template Library filtering/favorites, or the public-share backend.

Small adapters sit at the journey boundaries:

- `create-publish-boundaries-registry.js` — additive Slice G registry policy;
- `template-library-boundary.js` — template producer and optional staged-writing continuation;
- `card-studio-handoff-adapter.js` — race-safe template/plain-text seed consumer;
- `qr-handoff-adapter.js` — v2 plain-text consumer bridged to the proven QR state shape;
- `share-page.js` — public-share producer using governed actions rather than direct destination keys.

## Safety rules

- no user writing in URLs, query strings, telemetry or template metadata;
- no automatic navigation;
- no route/canonical/title ownership changes;
- no Card/QR renderer rewrite;
- no new ads or authoring/result-area ad changes;
- failed staged-text/template transfer stays on the source page instead of dropping the writing;
- one-time Card template seeds are peeked before consumption so early script timing cannot destroy unresolved state.

## Acceptance

- Basic Writer keeps three visible primary next steps and exposes Templates under `More options`;
- Basic text → Templates → selected Card Studio template preserves the text;
- QR consumes a v2 public-share URL handoff before the mature QR engine initializes;
- Public Share actions map to Basic / Card / QR according to user intent;
- Invoice QR remains embedded and Rich Editor has no Invoice edge;
- desktop and Pixel 5 acceptance remain green;
- SEO, route governance, InPage regression and V3 visual audit remain green.
