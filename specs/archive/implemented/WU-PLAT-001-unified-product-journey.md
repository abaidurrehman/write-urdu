# Write Urdu unified product journey

**Feature ID:** `WU-PLAT-001`  
**Version:** 1.4  
**Status:** Implemented — P0 homepage journey foundation  
**Primary route:** `/`  
**Related routes:** `/urdu-editor`, `/urdu-card-studio`, `/urdu-templates`, `/urdu-invoice-generator`  
**Successor:** `WU-PLAT-002` — V2 Product Journey & Workspace Handoffs

## Objective

Make Roman Urdu to Urdu-script conversion the obvious first task while keeping the
Card Studio, Template Library, Invoice Generator and Rich Editor useful as
standalone destinations. The homepage should explain the conversion flow above
the fold and provide clear, secondary paths into the other tools.

`WU-PLAT-001` remains the implemented acquisition/homepage foundation. The expanded
sitewide outcome taxonomy, shared handoff runtime, contextual next-step system and
new-tool continuity are governed by `WU-PLAT-002` rather than reopening this spec.

## Product contract

- Homepage headline communicates: “Type Roman Urdu and convert it to Urdu script”.
- Roman Urdu mode remains the default input mode.
- The editor keeps inline guidance for Space-to-commit, suggestions and bulk
  passage conversion.
- Start typing focuses the existing editor; it does not create a duplicate editor.
- Explore more tools and editor handoffs use crawlable links or the existing local
  session handoff controllers.
- No entered text, draft, or handoff payload is added to a URL or analytics event.
- Standalone tools retain their own routes and functionality.

## Scope

### P0 — implemented

- Search-intent-first homepage hero and calls to action.
- A concise “How it works” section near the editor.
- Visible secondary links for Card Studio, Templates, Invoice and Rich Editor.
- Preserve Roman Urdu default and existing inline/bulk transliteration behavior.

### Follow-up ownership

The former follow-up to align shared navigation and add richer cross-tool/mobile
journeys is superseded by `WU-PLAT-002`. Do not implement the old provisional
`Write / Design / Invoice / Learn / Support` taxonomy from this historical spec.

`WU-PLAT-002` owns the approved V2 model:

- `Write / Create / Work / Learn` outcome-led information architecture;
- contextual `Continue with…` progression;
- shared workspace handoff/capability contracts;
- new Capture/Fix tool integration;
- content-preservation/recovery rules;
- mobile and accessibility continuity.

## Acceptance criteria

- A new visitor can identify Roman Urdu conversion without scrolling.
- Start typing focuses `#transliterateTextarea`.
- Explore more tools reaches the featured tool links.
- Learn how it works reaches a visible three-step explanation.
- Roman mode is selected by default and direct mode still preserves entered text.
- Existing browser, static and SEO checks continue to pass.

## Implementation map

- `index.html`: hero hierarchy, actions, how-it-works content and handoff links.
- `css/modern-home.css`: compact, responsive hero/action styling.
- `site-header.js`: localized homepage hero copy and document title.
- `tests/static.test.js`: source-level journey contract checks.
- `tests/site.spec.js`: homepage CTA and Roman-mode smoke coverage.

## Verification

```text
npm test
npm run seo:check
npm run test:browser
```
