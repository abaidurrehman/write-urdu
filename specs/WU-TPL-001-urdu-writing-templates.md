# WU-TPL-001 — Urdu Writing Templates

**Product:** Write Urdu  
**Feature ID:** `WU-TPL-001`  
**Status:** Implemented  
**Priority:** Quick-win product expansion  
**Date:** 2026-08-24  
**Primary route:** `/urdu-writing-templates`  
**Urdu sibling:** `/urdu/urdu-writing-templates`  
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

- reviewed Urdu body text kept in a dedicated catalog;
- clear placeholders such as `[آپ کا نام]`;
- English task label on the English route;
- category/search tags;
- editable preview;
- Copy;
- Use in WriteUrdu;
- Format in Rich Editor;
- reset to original template.

## 3. Product invariants

1. No AI is required.
2. No template-generation backend/database is required.
3. Template content is static, original Write Urdu content.
4. User edits remain browser-local until they explicitly use an existing save/share action in a downstream workspace.
5. Handoff uses the existing `WU-PLAT-002` session-only workspace transfer.
6. `/urdu-templates` keeps its existing Card Studio/design intent.
7. The writing-template route must not claim a template is an official form or guaranteed to be accepted.
8. Formal templates must tell users to verify recipient-specific rules and replace all placeholders.
9. Do not create one indexable page per template in Phase 1.
10. English and Urdu siblings must self-canonicalize and expose reciprocal `hreflang`.
11. Urdu handoffs must stay inside `/urdu/` when the destination has an Urdu counterpart.
12. Product telemetry must never contain the template body or the user's edited text.

## 4. Search / launch treatment

The editorial and SEO launch gates were completed on 2026-08-24.

The acquisition owner is:

```text
https://write-urdu.com/urdu-writing-templates
```

It is indexable and registered in `seo.config.js`, the XML sitemap and the human-readable sitemap. It is internally linked from the existing visual Urdu Template Library.

A reviewed Urdu sibling is also indexable:

```text
https://write-urdu.com/urdu/urdu-writing-templates
```

The two routes expose reciprocal English/Urdu `hreflang` and `x-default` points to the English acquisition owner.

The Urdu sibling is intentionally a bounded standalone localized sibling in this slice rather than expanding the generator-managed eight-route `WU-I18N-001` Phase 1 registry. `scripts/check-urdu-locale-seo.js` explicitly validates this standalone sitemap member while retaining exact checks for the generator-owned Urdu set.

Do not publish thin pages for every individual template merely to target query variants. Use Search Console and product telemetry to identify a template that merits a genuinely useful dedicated page first.

## 5. Handoff contract

The feature reuses the existing `templates` workspace identity for transfer compatibility.

```text
writing template
→ target basic-writer
→ plain-text

writing template
→ target rich-editor
→ plain-text
```

The source route reflects the current language:

```text
English: /urdu-writing-templates
Urdu:    /urdu/urdu-writing-templates
```

English users continue to `/` or `/urdu-editor`. Urdu users continue to `/urdu/` or `/urdu/urdu-editor` while preserving the same session handoff payload.

If writing templates later gain independent persistence/history or multiple downstream workflow rules, register `writing-templates` as its own workspace under `WU-PLAT-002`.

## 6. UX requirements

- Mobile-first card grid.
- Search matches English label, Urdu title and tags.
- Category filters work without navigation.
- Selecting a card opens one shared editable template workspace rather than 12 separate editors.
- Urdu editing uses RTL and an Urdu-safe font stack.
- Primary CTA: `Use in WriteUrdu` / `WriteUrdu میں استعمال کریں`.
- Secondary CTA: `Format in Rich Editor` / `رچ ایڈیٹر میں فارمیٹ کریں`.
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

## 8. Measurement

Reuse the bounded product telemetry already accepted by Write Urdu:

- `template_used` when the user explicitly selects a starter;
- `copy_completed` after a successful clipboard copy;
- `tool_handoff` when continuing to Basic Writer or Rich Editor;
- generic engagement signals for search/filter/editor interaction.

Do **not** send:

- template IDs as high-cardinality arbitrary text unless a future schema explicitly approves them;
- search terms;
- template body text;
- edited text;
- names, dates, addresses or other placeholder values.

This lets us measure whether the library is useful without collecting document content.

## 9. Files

```text
urdu-writing-templates.html
urdu/urdu-writing-templates.html
css/writing-templates.css
js/writing-template-catalog.js
js/writing-templates-runtime.js
tests/writing-templates-quick-win-contract.test.js

SEO / integration:
seo.config.js
sitemap.xml
write-urdu-sitemap.html
urdu-templates.html
_redirects
scripts/check-urdu-locale-seo.js
scripts/run-contract-tests.js
specs/README.md
```

The reviewed wording lives in `js/writing-template-catalog.js`; interaction/search/handoff behaviour lives in `js/writing-templates-runtime.js`. Keep content revisions separate from runtime changes.

## 10. Acceptance criteria

- [x] 12 useful original templates exist.
- [x] search/filter is deterministic and client-only.
- [x] selecting a template loads an editable Urdu document.
- [x] Copy works with browser fallback.
- [x] Basic Writer handoff uses existing workspace transfer.
- [x] Rich Editor handoff uses existing workspace transfer.
- [x] no AI/template backend call exists in the feature.
- [x] route is linked from the existing visual template library.
- [x] editorial language review completed 2026-08-24: Pakistani school-application conventions normalized; office/business wording modernized; unnecessary English-office jargon removed.
- [x] English route promoted to `index,follow`.
- [x] English route registered in canonical SEO config and XML sitemap.
- [x] human-readable sitemap contains a writing-template discovery card.
- [x] indexable Urdu sibling shipped with reciprocal `hreflang`.
- [x] clean-URL redirects exist for English and Urdu routes.
- [x] Urdu handoffs remain in the Urdu locale.
- [x] bounded product telemetry records use/copy/handoff without user text.
- [x] launch contract protects crawl, locale, content and telemetry invariants.
- [ ] long-term template expansion remains evidence-led from Search Console and usage data.

## 11. Verification

Run:

```bash
node tests/writing-templates-quick-win-contract.test.js
npm test
npm run seo:generate
npm run seo:check
npm run governance:check
npm run test:browser
```

After deployment, verify both language URLs return `200`, self-canonicalize and show the expected `hreflang` links. Then monitor Search Console impressions/clicks and bounded product telemetry before deciding whether to add more templates or dedicated intent pages.
