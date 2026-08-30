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
**SEO observation:** `docs/WU-TPL-001-SEO-OBSERVATION-PLAN-2026-08-24.md`

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
13. Dedicated template/job pages remain blocked until the observation plan records an evidence-backed promotion decision.
14. Search Console promotion scoring must remain deterministic and must not turn a threshold crossing into automatic page creation.

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

Do not publish thin pages for every individual template merely to target query variants. Expansion is governed by `docs/WU-TPL-001-SEO-OBSERVATION-PLAN-2026-08-24.md`.

The observation sequence is:

```text
~7 days  → crawl/index health only
~14 days → query-cluster discovery
~28 days → first promotion decision
~56 days → confirmation/re-score
```

A dedicated writing-job page must pass all of these gates:

1. distinct user job rather than a synonym variant;
2. observed WriteUrdu Search Console demand;
3. clean current route ownership / no unresolved cannibalization;
4. unique product value beyond repeating the template body;
5. clean canonical/internal-link/locale ownership.

The initial monitoring priority is:

1. leave application in Urdu;
2. job application in Urdu;
3. fee concession application in Urdu;
4. resignation letter in Urdu;
5. complaint application in Urdu;
6. invitation/general application only as long-tail observation.

This order is not pre-approval. Search Console evidence can reorder it immediately.

Normally promote no more than one dedicated writing-job page in a 28-day observation cycle, then observe its interaction with the collection before approving another.

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

Search Console remains the source of truth for individual query/job promotion decisions. Current product telemetry intentionally measures collection usefulness rather than identifying which private writing job a user selected.

### Search Console scoring

Use the deterministic repository scorer on a Search Console `Queries.csv` export:

```bash
npm run templates:gsc -- path/to/Queries.csv
```

or:

```bash
npm run templates:gsc -- path/to/Queries.csv --json
```

The scorer aggregates approved query variants into job clusters and implements the canonical observation plan's two single-export promotion-review gates:

- **Near-win:** 100+ impressions with weighted average position 4–20;
- **Click proof:** 25+ impressions and at least 3 clicks.

The 7-day breakout gate requires comparable Dates exports and is intentionally not inferred from one Queries CSV.

A `PROMOTION REVIEW` result is triage only. Before shipping a page, confirm current ranking URL/ownership and unique product value using the full observation plan.

## 9. Files

```text
urdu-writing-templates.html
urdu/urdu-writing-templates.html
css/writing-templates.css
js/writing-template-catalog.js
js/writing-templates-runtime.js
tests/writing-templates-quick-win-contract.test.js
tests/writing-template-gsc-observation-contract.test.js

SEO / integration:
seo.config.js
sitemap.xml
write-urdu-sitemap.html
urdu-templates.html
_redirects
scripts/check-urdu-locale-seo.js
scripts/analyze-writing-template-gsc.js
scripts/run-contract-tests.js
package.json
specs/README.md
docs/WU-TPL-001-SEO-OBSERVATION-PLAN-2026-08-24.md
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
- [x] evidence-led SEO observation/promotion plan recorded with 7/14/28/56-day checkpoints.
- [x] deterministic Search Console cluster scorer added and covered by the normal contract runner.
- [ ] first Search Console baseline for the launched collection routes recorded.
- [ ] first 28-day cluster review records HOLD / STRENGTHEN COLLECTION / PROMOTE ONE WINNER.

## 11. Verification

Run:

```bash
node tests/writing-templates-quick-win-contract.test.js
node tests/writing-template-gsc-observation-contract.test.js
npm test
npm run seo:generate
npm run seo:check
npm run governance:check
npm run test:browser
```

When a Search Console export is available:

```bash
npm run templates:gsc -- path/to/Queries.csv
```

After deployment, verify both language URLs return `200`, self-canonicalize and show the expected `hreflang` links. Then use the observation plan for Search Console impressions/clicks and bounded product telemetry before deciding whether to add more templates or dedicated intent pages.
