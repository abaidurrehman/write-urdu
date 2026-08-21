---
name: wu-urdu-locale-build
description: Implement WU-I18N-001A only: locale-aware routing, path normalization, root-safe assets, deterministic static Urdu page generation, counterpart navigation, and local test-server support. Preserve one shared product codebase and do not begin broad Urdu SEO/content rollout from this skill.
---

# WU-I18N-001A implementation skill

Read:

1. `specs/WU-I18N-001A-locale-routing-static-generation.md`
2. parent `specs/WU-I18N-001-crawlable-urdu-locale.md`
3. `seo.config.js`
4. `js/site-header-core.js`
5. `site-header.js`
6. `js/v2-shell.js`
7. `scripts/dev-server.js`
8. current static/browser tests.

## Mission

Make `/urdu/*` technically possible without duplicating product implementations.

Do not treat translation copy or hreflang as the first problem. First prove:

```text
locale URL
→ normalized product route
→ shared runtime/features
→ correct root assets
→ deterministic generated HTML
```

## Step 1 — establish locale registry

Create one registry that can answer:

```text
which locales exist?
which prefix belongs to each locale?
which product routes have an Urdu counterpart?
is the counterpart indexable/launched?
```

Avoid copying the entire SEO registry. Reference/compose `seo.config.js` where possible.

Phase 1 registry contains exactly the approved eight Urdu routes.

## Step 2 — shared route helper

Implement and unit-test normalization before migrating feature modules.

Required parser outputs:

```text
/urdu/urdu-editor        -> locale ur, productPath /urdu-editor
/urdu/urdu-editor.html   -> locale ur, productPath /urdu-editor
/urdu/tools/urdu-voice-typing -> locale ur, productPath /tools/urdu-voice-typing
/urdu/                   -> locale ur, productPath /
/urdu                    -> locale ur, productPath /
/urdu-editor             -> locale en, productPath /urdu-editor
```

The helper must also build counterpart URLs.

## Step 3 — migrate route-sensitive runtime carefully

Search for direct reads of `location.pathname`, route arrays and exact path comparisons.

Prioritize only code needed for Phase 1 correctness.

Likely owners:

- `site-header.js`;
- `js/site-header-core.js`;
- `js/v2-shell.js`;
- `js/outcome-navigation.js`;
- `js/core-workspace-convergence.js`;
- voice discovery;
- journey/continuity;
- telemetry integration;
- account growth entry points;
- ad route classification.

Do not churn unrelated feature code.

## Step 4 — normalize local asset URLs

Search source/runtime for relative local URLs.

Convert shared public assets to root-absolute where safe.

Test dynamically injected assets, not just literal HTML.

Special attention:

```text
site-header.js
css/v2-shell.css
js/product-telemetry*.js
image/logo10.png
manifest.webmanifest
sw.js
```

Do not blindly rewrite third-party absolute/CDN URLs.

## Step 5 — PWA correctness

Ensure Urdu pages use the same root manifest/service worker.

Do not create locale-specific workers.

If changing service-worker scope to `/`, inspect `sw.js` first for assumptions about scope and cache keys. Add regression coverage before broadening scope.

## Step 6 — build-readable Urdu catalogue

Migrate only the Phase 1 translation data needed by static generation into a Node-readable source.

Do not duplicate text in:

```text
build catalogue
AND js/content-locale.js
```

without a compatibility plan.

Prefer one shared catalogue with browser compatibility or a generated browser bundle.

Use stable localization keys for newly migrated source content.

## Step 7 — generator

Add a deterministic generator that:

- reads the English source page;
- applies locale metadata/content by stable keys;
- sets `lang=ur dir=rtl`;
- preserves functional element IDs/data attributes;
- rewrites eligible internal links;
- emits safe root assets;
- writes the expected `/urdu/...html` artifact;
- supports `--check` without modifying files.

Do not use network access during generation.

Do not depend on Google transliteration, fonts, speech APIs or browser vendor APIs to generate HTML.

## Step 8 — generated artifact policy

Generated Urdu files are checked in for the current static Cloudflare Pages deployment model.

Add a stale-output test/check so source changes cannot silently leave `/urdu/` outdated.

Do not ask developers to hand-edit generated locale files.

## Step 9 — counterpart language link

Make the language control expose a real link to the exact counterpart route.

The URL owns current locale.

Do not automatically redirect `/` to `/urdu/` based on localStorage.

Preserve active writer state using existing local/session persistence; never put document content into the locale URL.

## Step 10 — local dev support

Ensure extensionless Urdu routes map to generated files in `npm start`.

Test nested `/urdu/tools/...` paths.

## Test order

Run focused tests repeatedly while migrating:

```text
route-helper unit tests
locale-generator tests
asset-path tests
local server route tests
```

Then:

```text
npm run locale:generate
npm run locale:check
npm test
npm run governance:check
npm run test:browser
```

## Required evidence before handing off to Slice B

Provide evidence that:

- eight generated files exist;
- at least homepage + keyboard + voice nested route load locally;
- no critical asset requests resolve under unintended `/urdu/js`, `/urdu/css`, `/urdu/image` paths;
- a Phase 1 product feature sees the normalized English product path under an Urdu URL;
- English routes remain green;
- locale switch counterpart URL is correct.

Do not claim SEO launch complete from this skill.