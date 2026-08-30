# WU-SEO-CRAWL-001B — Static Internal-Link Shell

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** Complete

## Goal

Ensure crawl-important navigation and footer links are present in the initial HTML response across public routes. Keep the existing v2 shell for responsive behavior, localization, active state and menu interaction.

## Current problem

The shared shell builds major link groups in JavaScript. Many source HTML files contained only a minimal home link and/or an empty footer. A browser-rendered DOM looked correct, but a plain HTML fetcher could miss most of the site's intended internal-link graph.

## Required architecture

Implemented model:

```text
js/outcome-navigation.js (governed runtime taxonomy)
        ↓
Node build bridge / static-shell renderer
        ↓
source HTML navigation + footer links
        ↓
client enhancement → dropdowns, locale labels, active state, mobile behavior
```

The implementation does not maintain a second primary navigation taxonomy. Build-time code reads the governed outcome-navigation registry and emits source-visible HTML from it.

## Crawl-critical link set

The source-visible shell exposes the required outcome groups.

### Write

- `/`
- `/urdu-editor`
- `/urdu-keyboard`
- `/tools/urdu-voice-typing`

### Create

- `/urdu-card-studio`
- `/urdu-templates`
- `/stylish-urdu-text-generator`
- `/urdu-name-art-maker`
- `/urdu-whatsapp-status-maker`
- `/urdu-instagram-post-maker`
- `/qr-code-generator`

### Work

- `/urdu-invoice-generator`
- `/urdu-text-cleaner`
- `/urdu-ocr`
- `/tools/inpage-unicode-converter`
- `/urdu-writing-templates`

### Learn / trust

- `/write-urdu-documentation`
- `/urdu-faq`
- `/roman-urdu-transliteration`
- `/urdu-alphabet`
- `/urdu-fonts-nastaliq-vs-naskh`
- `/how-to-write-urdu-on-photo`
- `/why-write-urdu`
- `/contact`
- `/write-urdu-privacy`
- `/write-urdu-sitemap`

The exact primary-nav visual density remains owned by the v2 product/navigation spec. Source-visible links are distributed between navigation and footer; this slice does not require every route to appear in the rendered top bar.

## Locale behavior

- English indexable pages have valid English route links in source HTML.
- Launched generated Urdu pages receive Urdu labels and localized sibling routes where those siblings exist.
- Routes without a launched Urdu sibling deliberately retain the valid English route rather than inventing a broken `/urdu/` URL.
- Standalone `/urdu/urdu-writing-templates` is included in static-shell synchronization.
- Client localization continues to enhance labels after load.

## Progressive enhancement behavior

With JavaScript disabled:

- core navigation links remain usable;
- footer links remain usable;
- the crawl-important internal-link graph is present in source HTML;
- markup remains semantic and accessible.

With JavaScript enabled:

- the governed v2 outcome navigation replaces/enhances the source shell;
- active-route styling remains functional;
- dropdown/menu behavior remains functional;
- locale behavior remains functional;
- browser acceptance shows no conflicting duplicate navigation.

## Implementation constraints

- Reuses `js/outcome-navigation.js` as the primary route/navigation taxonomy.
- Uses deterministic build/source generation rather than request-time server rendering.
- Does not change canonical URLs or redirects.
- Does not inject user/account state into the crawlable static shell.
- Search and Feedback remain deliberate `noindex,follow` utility pages and are not enrolled in the indexable static-shell synchronizer.

## Implementation progress

- [x] Build-time code reads the governed `js/outcome-navigation.js` groups without creating a second primary navigation registry.
- [x] Static source-shell renderer covers the required crawl-critical route set and supports English/Urdu labels.
- [x] Idempotent shell synchronizer and representative source-family contract added.
- [x] Generated shell applied to every registered indexable English source page with a physical HTML source file.
- [x] Launched Urdu locale pages regenerated with locale-safe static links.
- [x] Standalone Urdu writing-template route included in locale-safe shell sync.
- [x] `shell:check` added to the read-only Quality Checks gate after generated source was committed.
- [x] Browser regression proves the enhanced v2 shell remains functionally equivalent.
- [x] V3 visual-quality audit remains green.

## Acceptance criteria

- [x] Every registered indexable English route with a source HTML file contains more than a home-only crawl path in source HTML.
- [x] Core Write/Create/Learn destinations are discoverable from static source navigation/footer.
- [x] Important collection pages are linked statically.
- [x] JavaScript enhancement does not create conflicting menus.
- [x] Urdu generated pages preserve locale-safe navigation behavior.
- [x] Search/Feedback indexability remains unchanged.
- [x] Header/footer rendered behavior remains functionally and visually compatible.

## Deterministic tests and gates

Source-level contracts cover representative page families without executing JavaScript:

- homepage;
- core editor;
- creation tool;
- authority guide;
- trust page;
- collection page;
- Urdu locale page.

The final Slice B Quality Checks run passed:

- `npm run shell:check`;
- full Node contract suite;
- SEO validation;
- route/product-governance validation;
- InPage browser acceptance;
- focused product/browser acceptance including outcome navigation and Urdu locale;
- V3 production visual-quality audit.

The static generator is idempotent: rerunning it does not stack duplicate nav/footer blocks, and CI now fails if committed source drifts from the governed navigation registry.
