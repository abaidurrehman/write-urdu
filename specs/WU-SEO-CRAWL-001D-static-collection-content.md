# WU-SEO-CRAWL-001D — Static Collection Content

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** Complete

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

The source now contains the complete 46-item design catalogue generated from `js/template-library-core.js`. Each card exposes its name, Urdu preview, category, short description, dimensions and Card Studio action before JavaScript runs.

The existing browser runtime replaces the static grid when interactive filtering, sorting, favorites and recent state initialize, so users do not receive two visible catalogues.

## Urdu Writing Templates

Both English and Urdu source pages now contain the same 12 reviewed writing jobs from `js/writing-template-catalog.js`, including Urdu titles, categories, short sample text and the existing selection action.

The selected editable textarea remains runtime-populated. No per-template canonical landing pages were added.

## Stylish Urdu Text

The source exposes 10 unique representative style families using the fixed sample `آپ کا اردو نام`, including the actual Popular family. The personalized result grid still runs client-side and clears/replaces these representatives when the page initializes or the user changes text/filters.

This deliberately does not attempt to pre-render every possible generated style or user input.

## Urdu locale

`/urdu/urdu-writing-templates` receives the same 12-item catalogue with Urdu category labels, Urdu calls to action and existing canonical/hreflang ownership unchanged.

No new Urdu siblings were created for unlaunched collection routes.

## Secondary route review

No additional static catalogue emission is required for the three secondary routes in this slice:

- `/urdu-name-art-maker` already source-renders its user task, four output purposes, output sizes, 24-design positioning, guidance and FAQs. Its individual style choices are editor state tied to the user's name and remain dynamic.
- `/urdu-whatsapp-status-maker` and `/urdu-instagram-post-maker` are direct creation workspaces rather than browseable collection landing pages. Their acquisition/use-case guidance is already in source HTML; canvas and personalized design state remain dynamic.

This keeps the slice focused on genuinely crawl-important collections instead of pre-rendering editor controls as pseudo-content.

## Accessibility and performance

- Static items use the existing semantic card headings/actions.
- Design thumbnails remain external lightweight assets and use lazy loading/async decoding.
- One product registry owns each collection; no second SEO-only catalogue was introduced.
- Runtime replacement prevents duplicate visible card sets.
- Only representative Stylish output is emitted, keeping that generated surface bounded.

## Implementation notes

- `scripts/static-collection-content.js` renders source-visible cards from the existing design-template, writing-template and Stylish Urdu registries.
- Marker-delimited, depth-aware container replacement makes generation deterministic even with nested card markup.
- `scripts/sync-static-collection-content.js` provides deterministic write/check modes.
- `package.json` exposes `collections:sync` and `collections:check`.
- `.github/workflows/quality.yml` runs `collections:check` with read-only repository permissions.
- `tests/static-collection-content-contract.test.js` verifies catalogue counts, representative content, unique Stylish examples and progressive-enhancement replacement behavior.
- Slice C `ItemList`/`CollectionPage` generation consumes the same catalogue modules, so visible source and schema stay aligned.

## Acceptance criteria

- [x] `/urdu-templates` source HTML contains named template items rather than only `Loading templates…` + empty grid.
- [x] `/urdu-writing-templates` source HTML contains the 12 visible catalogue items and Urdu titles.
- [x] Urdu writing-template sibling contains equivalent locale-safe static catalogue content.
- [x] `/stylish-urdu-text-generator` source contains bounded representative examples/categories.
- [x] no private/user-entered content is emitted into build artifacts.
- [x] filtering/favorites/recent/edit/handoff behavior still works.
- [x] no duplicate visible catalogue appears after JavaScript runs.
- [x] ItemList/Collection schema uses the same catalogue source as visible content.

## Verification

Final frozen implementation head before this documentation closeout: `d519b9792b11547d59c71349358c7d0677e5661a`.

GitHub Actions run `32966586624` passed:

- static source-shell drift;
- static SEO-graph drift;
- static collection-content drift;
- complete Node/contract suite;
- SEO checks;
- route/product governance;
- InPage browser acceptance;
- focused product browser acceptance;
- V3 production visual-quality audit.

Manual source review additionally confirmed:

- 46 design cards with real names, Urdu previews, categories, dimensions and edit actions;
- 12 English writing-template cards with Urdu titles;
- 12 locale-safe Urdu writing-template cards;
- 10 unique Stylish examples including `popular-01`.

Production source-view validation remains a post-deploy observation, while repository source and browser tests are the deterministic merge gate.
