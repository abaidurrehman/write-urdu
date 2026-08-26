# WU-SEO-CRAWL-001D — Static Collection Content

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** In progress

## Goal

Make high-value catalogue/collection content understandable from the initial HTML response without removing client-side filtering, editing, favorites, canvas rendering or personalized output.

## Routes

Primary:

- `/urdu-templates`
- `/urdu-writing-templates`
- `/urdu/urdu-writing-templates`
- `/stylish-urdu-text-generator`

Secondary review:

- `/urdu-name-art-maker`
- `/urdu-whatsapp-status-maker`
- `/urdu-instagram-post-maker`

## Principle

Pre-render the **catalogue**, not the user's interactive result.

Good static content:

- template/item name;
- Urdu title where relevant;
- category/use case;
- short description;
- representative preview/sample text;
- dimensions/type when useful;
- real link/button destination.

Keep dynamic:

- user-entered text;
- favorites/recent state;
- filters and sorting state;
- canvas rendering;
- generated personalized variations;
- local uploaded images;
- private draft state.

## Urdu Template Library

Current source contains an empty `data-template-grid` and loading state. Replace/augment this with generated static catalogue cards sourced from the same template registry used by the runtime.

Each static item should expose enough information to answer:

- what the template is for;
- what category it belongs to;
- what approximate format/size it uses;
- how the user opens/edits it.

Client JavaScript may hydrate/enhance the same cards or replace the interaction layer, but should not leave duplicate card sets in the rendered page.

## Urdu Writing Templates

The page already exposes static ItemList JSON-LD but visible item cards are runtime-created.

Static HTML should include the 12 existing reviewed template jobs and Urdu titles, with a short description/sample and category.

The selected editable textarea can remain runtime-populated.

Do not create 12 new canonical landing pages in this slice. Any future per-template URL requires a separate evidence/quality gate.

## Stylish Urdu Text

Do not attempt to pre-render every generated style for every possible input.

Instead statically expose:

- core use cases (name, caption, short phrase);
- style/category names that are meaningful to users;
- a bounded set of representative Urdu examples;
- explanation of copyable text versus image-based Name Art when relevant.

The personalized style output remains client-side.

## Urdu locale

Where `/urdu/urdu-writing-templates` is generated, static cards/content should be emitted in Urdu and must preserve current canonical/hreflang relationships.

Do not create Urdu siblings for collections that are not launched in the locale registry.

## Accessibility and performance

- Static cards must use semantic headings/links.
- Avoid shipping two full catalogues (one hidden static + one dynamic) to solve crawlability.
- Reuse one data source and progressively enhance.
- Keep initial HTML size bounded; omit decorative payloads that do not aid users/crawlers.
- Images should follow existing lazy-loading/performance rules.

## Implementation notes

- `scripts/static-collection-content.js` now renders source-visible cards from the existing design-template, writing-template and Stylish Urdu registries.
- The existing runtime renderers already replace their grid contents on initialization, so the source catalogue is replaced rather than duplicated after JavaScript runs.
- `/urdu-templates` targets all 46 existing design templates.
- English and Urdu writing-template pages target the same reviewed 12-item catalogue with locale-safe labels.
- Stylish Urdu is deliberately bounded to 10 representative examples; personalized results remain client-side.
- `scripts/sync-static-collection-content.js` provides deterministic write/check modes.
- `tests/static-collection-content-contract.test.js` verifies registry counts, representative source content and the no-duplicate progressive-enhancement contract before public HTML emission.

## Acceptance criteria

- [ ] `/urdu-templates` source HTML contains named template items rather than only `Loading templates…` + empty grid.
- [ ] `/urdu-writing-templates` source HTML contains the 12 visible catalogue items and Urdu titles.
- [ ] Urdu writing-template sibling contains equivalent locale-safe static catalogue content.
- [ ] `/stylish-urdu-text-generator` source contains bounded representative examples/categories.
- [ ] no private/user-entered content is emitted into build artifacts.
- [ ] filtering/favorites/recent/edit/handoff behavior still works.
- [ ] no duplicate visible catalogue appears after JavaScript runs.
- [ ] ItemList/Collection schema uses the same catalogue source as visible content.

## Tests

Add source-HTML contracts asserting representative item names exist without JavaScript.

Add runtime tests asserting:

- filtering still works;
- selecting/opening a template still works;
- favorites/recent state remains local and functional;
- writing-template editor still receives the selected item;
- Stylish Urdu personalized output still uses current runtime behavior.

## Verification

```bash
npm test
npm run collections:check
node scripts/check-seo.js
node scripts/check-urdu-locale-seo.js
```

Source-view production pages after deploy and verify named items are present before any script-generated DOM.
