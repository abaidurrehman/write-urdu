# WU-TPL-001 — Urdu Writing Templates

**Product:** Write Urdu  
**Feature ID:** `WU-TPL-001`  
**Status:** Implemented core — acceptance pending  
**Priority:** Quick-win product expansion  
**Date:** 2026-08-24  
**Primary route:** `/urdu-writing-templates`  
**Related route:** `/urdu-templates` remains the visual-design template owner  
**Journey dependency:** `WU-PLAT-002`

---

## 1. Decision

Ship a distinct Urdu writing-template library for common writing jobs such as applications, leave letters, notices, office letters and business messages.

Do not repurpose `/urdu-templates`. That route already owns visual design templates that open in Card Studio.

The product split is:

```text
/urdu-templates
visual design starters
→ Card Studio

/urdu-writing-templates
writing/document starters
→ Basic Writer or Rich Editor
```

This avoids mixing two materially different user jobs under one implementation.

## 2. Phase 1 scope

Phase 1 contains 12 original editable starter templates:

### School
- illness/sick leave;
- urgent-work leave;
- fee concession request;
- certificate request.

### Office
- office leave;
- job application;
- resignation.

### Applications
- complaint;
- general request.

### Business
- payment reminder;
- meeting notice.

### Personal
- invitation letter.

Each template provides:

- Urdu body text;
- clear placeholders such as `[آپ کا نام]`;
- English task label;
- category/search tags;
- editable preview;
- Copy;
- Use in WriteUrdu;
- Format in Rich Editor;
- reset to original template.

## 3. Product invariants

1. No AI is required.
2. No backend/database is required.
3. Template content is static, original Write Urdu content.
4. User edits remain browser-local until they explicitly use an existing save/share action in a downstream workspace.
5. Handoff uses the existing `WU-PLAT-002` session-only workspace transfer.
6. `/urdu-templates` keeps its existing Card Studio/design intent.
7. The writing-template route must not claim a template is an official form or guaranteed to be accepted.
8. Formal templates must tell users to verify recipient-specific rules and replace all placeholders.
9. Do not create one indexable page per template in Phase 1.

## 4. Search / launch treatment

The first runtime ships as `noindex,follow`.

Reason: this is a product quick win before a separate SEO promotion pass. The route can be indexed after:

- template wording is reviewed;
- internal search/usage shows which templates matter;
- route title/description/schema are registered in `seo.config.js`;
- sitemap and human sitemap are generated;
- a decision is made whether any single template deserves its own useful page.

Do not publish thin pages for every template merely to target query variants.

## 5. Handoff contract

The first slice reuses the existing `templates` workspace identity for transfer compatibility.

```text
writing template
→ target basic-writer
→ plain-text

writing template
→ target rich-editor
→ plain-text
```

The source route remains `/urdu-writing-templates`, so telemetry/handoff events can still identify the public origin without creating a parallel transport.

If writing templates later gain independent persistence/history or multiple downstream workflow rules, register `writing-templates` as its own workspace under `WU-PLAT-002`.

## 6. UX requirements

- Mobile-first card grid.
- Search must match English label, Urdu title and tags.
- Category filters must work without navigation.
- Selecting a card opens one shared editable template workspace rather than 12 separate editors.
- Urdu editing uses RTL and an Urdu-safe font stack.
- Primary CTA: `Use in WriteUrdu`.
- Secondary CTA: `Format in Rich Editor`.
- Copy remains available without navigation.
- Reset restores only the selected static template, not another user's state.
- Do not put ads inside the template selection/editor region.

## 7. Accessibility

- Search has a visible label.
- Category state uses `aria-pressed`.
- Result count uses a live region.
- The selected template editor has a clear accessible name.
- Buttons use text labels rather than icon-only controls.
- RTL is explicit for Urdu preview/editor content.
- Mobile actions remain full-width where needed.

## 8. Files

```text
urdu-writing-templates.html
css/writing-templates.css
js/writing-templates.js
tests/writing-templates-quick-win-contract.test.js

existing integration:
/urdu-templates.html
_redirects
scripts/run-contract-tests.js
specs/README.md
```

## 9. Acceptance criteria

- [x] 12 useful original templates exist.
- [x] search/filter is deterministic and client-only.
- [x] selecting a template loads an editable Urdu document.
- [x] Copy works with browser fallback.
- [x] Basic Writer handoff uses existing workspace transfer.
- [x] Rich Editor handoff uses existing workspace transfer.
- [x] no AI or backend call exists in the feature.
- [x] route is linked from the existing visual template library.
- [x] route is `noindex,follow` for the initial acceptance period.
- [x] clean-URL redirects are defined.
- [ ] mobile browser acceptance recorded.
- [ ] founder/content review of all Urdu templates recorded.
- [ ] decide promotion/indexing from initial usage/search evidence.

## 10. Verification

Run:

```bash
node tests/writing-templates-quick-win-contract.test.js
npm test
npm run governance:check
npm run test:browser
```

Before indexing, additionally run:

```bash
npm run seo:generate
npm run seo:check
```

after adding the route to `seo.config.js`.
