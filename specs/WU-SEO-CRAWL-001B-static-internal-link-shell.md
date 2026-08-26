# WU-SEO-CRAWL-001B — Static Internal-Link Shell

**Parent:** `WU-SEO-CRAWL-001`  
**Status:** Planned

## Goal

Ensure crawl-important navigation and footer links are present in the initial HTML response across public routes. Keep the existing v2 shell for responsive behavior, localization, active state and menu interaction.

## Current problem

The shared shell builds major link groups in JavaScript. Many source HTML files contain only a minimal home link and/or an empty footer. A browser-rendered DOM looks correct, but a plain HTML fetcher can miss most of the site's intended internal-link graph.

## Required architecture

Preferred model:

```text
single navigation/link registry
        ↓
build/source emission → meaningful HTML links
        ↓
client enhancement → dropdowns, locale labels, active state, mobile behavior
```

Do not maintain unrelated duplicate hard-coded link registries if a shared generator/helper can safely own them.

## Crawl-critical link set

At minimum the source-visible shell should expose paths to core outcome groups:

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

The exact primary-nav visual density remains owned by the v2 product/navigation spec. Source-visible links may be distributed between primary navigation and footer; this slice is not permission to place every route in the top bar.

## Locale behavior

- English pages must have valid English route links in source HTML.
- Urdu generated pages must retain their current localized/canonical route handling.
- Client localization may replace labels after load.
- Do not emit broken Urdu siblings for routes not launched in the Urdu locale.

## Progressive enhancement requirements

With JavaScript disabled:

- core navigation links remain usable;
- footer links remain usable;
- no duplicate visible navigation block should appear;
- markup remains semantic and accessible.

With JavaScript enabled:

- current v2 shell appearance/behavior remains functionally equivalent;
- active-route styling still works;
- dropdown/menu keyboard behavior remains valid;
- localization remains valid.

## Implementation constraints

- Reuse current route and navigation registries where practical.
- Avoid per-page manual copy/paste as the long-term source of truth.
- Do not turn header/footer generation into server-side request-time work if build-time/static generation suffices.
- Do not change canonical URLs or redirects.
- Do not inject user state into crawlable static shell content.

## Acceptance criteria

- [ ] Every indexable English route contains more than a home-only crawl path in source HTML.
- [ ] Core Write/Create/Learn destinations are discoverable from static source navigation/footer.
- [ ] Important collection pages are linked statically.
- [ ] JavaScript enhancement does not duplicate links or create conflicting menus.
- [ ] Urdu generated pages preserve locale-safe navigation behavior.
- [ ] Search/Feedback indexability remains unchanged.
- [ ] Header/footer visual behavior is unchanged or intentionally equivalent.

## Tests

Add source-HTML tests that parse representative page families without executing JavaScript:

- homepage;
- core editor;
- creation tool;
- authority guide;
- trust page;
- collection page;
- Urdu locale page.

Assert expected link destinations are present and do not depend on evaluating `v2-shell.js`.

Retain existing browser tests to prove enhancement still works.