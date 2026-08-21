# WU-I18N-001A — Locale Routing, Asset Safety & Static Generation

**Parent:** `WU-I18N-001`  
**Status:** Planned — Slice A  
**Priority:** P0 foundation for the Urdu locale  
**Primary output:** deterministic `/urdu/*` HTML generated from the existing product sources

## 1. Goal

Create the locale-aware runtime/build foundation required to serve `/urdu/*` without duplicating product behavior or breaking the existing static site.

This slice does **not** attempt the final Urdu SEO/content launch. It establishes the route, asset and generation contracts that later slices consume.

## 2. Source-of-truth decision

The repository remains static-first and deploys checked-in public HTML. Do not introduce a framework build solely for localization.

Use a deterministic generator comparable to the existing SEO generator:

```text
existing source HTML
+ locale route registry
+ reviewed Urdu locale content
            ↓
scripts/generate-urdu-locale.js
            ↓
checked-in /urdu/...html output
```

Generated files are derived artifacts. Humans edit source pages/catalogues, not the generated Urdu HTML directly.

Add commands conceptually equivalent to:

```json
{
  "locale:generate": "node scripts/generate-urdu-locale.js",
  "locale:check": "node scripts/generate-urdu-locale.js --check"
}
```

`npm test` / governance should fail when generated locale output is stale.

## 3. Locale route registry

Create one source of truth for locale availability rather than scattering prefix checks.

Recommended shape:

```js
{
  defaultLocale: 'en',
  locales: ['en', 'ur'],
  prefix: { en: '', ur: '/urdu' },
  routes: {
    '/': { ur: true, indexable: true },
    '/urdu-keyboard': { ur: true, indexable: true },
    ...
  }
}
```

The registry must be usable from Node build scripts and browser runtime code. A UMD/CommonJS-compatible `locale.config.js` or equivalent is acceptable.

Do not create a second independent route list if `seo.config.js` can safely provide the canonical product routes. Prefer explicit composition:

```text
seo.config.js = canonical/indexability ownership
locale.config.js = locale availability + localized metadata/content ownership
```

## 4. Shared route helper

Add a small shared helper that normalizes locale and product path.

Required behavior:

```text
/                         => en + /
/index.html               => en + /
/urdu                     => ur + /
/urdu/                    => ur + /
/urdu/index.html           => ur + /
/urdu/urdu-editor          => ur + /urdu-editor
/urdu/urdu-editor.html     => ur + /urdu-editor
/tools/urdu-voice-typing   => en + /tools/urdu-voice-typing
/urdu/tools/urdu-voice-typing
                          => ur + /tools/urdu-voice-typing
```

Recommended API:

```js
WriteUrduLocaleRoute.parse(pathname)
WriteUrduLocaleRoute.productPath(pathname)
WriteUrduLocaleRoute.locale(pathname)
WriteUrduLocaleRoute.href(productPath, locale)
WriteUrduLocaleRoute.counterpart(pathname, targetLocale)
WriteUrduLocaleRoute.hasLocale(productPath, locale)
```

### Route precedence

The URL is the source of truth for the currently rendered language.

```text
/urdu/...  => Urdu
non-/urdu  => English
```

`localStorage` may remember the last chosen locale for convenience, but it must not silently transform an English canonical URL into Urdu after load. A stable URL must have a stable language.

## 5. Migrate exact-path feature detection

Audit route checks and move them to the normalized `productPath` contract.

Known high-risk owners include:

- `site-header.js`;
- `js/site-header-core.js`;
- `js/v2-shell.js`;
- `js/outcome-navigation.js`;
- `js/core-workspace-convergence.js`;
- journey/continuity modules;
- product telemetry integrations;
- account/document entry points;
- voice discovery;
- Card Studio adapters;
- ad page-type classification.

Anti-pattern to reject:

```js
if (path === '/urdu-editor' || path === '/urdu/urdu-editor')
```

Required pattern:

```js
if (WriteUrduLocaleRoute.productPath(location.pathname) === '/urdu-editor')
```

This is a migration layer, not permission to rewrite stable feature code.

## 6. Asset safety audit

A locale prefix changes the resolution of every relative URL. Before generating Urdu pages, normalize public shared assets to root-absolute paths where safe.

### Must audit

HTML source:

- `<script src>`;
- `<link href>`;
- `<img src>`;
- favicon;
- manifest;
- iframe/media URLs that point to local assets;
- form actions/local route links where relevant.

Dynamic runtime:

- injected JS/CSS;
- dynamically created images/icons;
- module imports loaded by URL;
- export/preview logo paths;
- telemetry loaders;
- account/document loaders;
- journey/handoff scripts;
- PWA registration.

### PWA rules

Current relative registration patterns such as:

```js
navigator.serviceWorker.register('sw.js', { scope: './' })
```

are unsafe under `/urdu/`.

Target a single root worker contract such as:

```js
navigator.serviceWorker.register('/sw.js', { scope: '/' })
```

only after confirming the existing worker is safe at root scope and tests cover the change.

Manifest should similarly resolve to `/manifest.webmanifest`.

Do not create `/urdu/sw.js` or a locale-specific cache silo.

## 7. Static generator behavior

Phase 1 output:

```text
urdu/index.html
urdu/urdu-keyboard.html
urdu/urdu-editor.html
urdu/tools/urdu-voice-typing.html
urdu/urdu-alphabet.html
urdu/urdu-faq.html
urdu/urdu-card-studio.html
urdu/how-to-write-urdu-on-photo.html
```

The generator must:

1. read the canonical source file for the product route;
2. verify the route is registered for Urdu;
3. set `lang="ur"` and `dir="rtl"` in initial HTML;
4. apply localized search metadata from the locale registry;
5. apply reviewed Urdu page copy using stable localization keys/markers;
6. preserve live editor/control IDs and functional markup;
7. rewrite local asset references to safe root-absolute paths;
8. rewrite locale-eligible internal links to `/urdu/...`;
9. write to the deterministic output path;
10. produce byte-stable output when sources have not changed.

## 8. Translation source migration

Do not attempt to parse arbitrary JavaScript functions in `js/content-locale.js` at build time.

For Phase 1, migrate the required translated strings into a build-readable locale catalogue while preserving runtime compatibility.

Preferred direction:

```text
locale/ur.js or locale/ur.json
  - shared UI keys
  - route metadata
  - route content keys
```

Browser localization code and the build generator should consume the same reviewed source where practical.

A full rewrite of every historical localization selector is not required in Slice A. Only move the material necessary for the Phase 1 generated pages and leave compatibility shims for existing runtime localization until later cleanup.

## 9. Stable localization markers

Prefer explicit localization markers over selector-position coupling for newly migrated Phase 1 content.

Example:

```html
<h1 data-wu-l10n="home.h1">English to Urdu Typing Online</h1>
<p data-wu-l10n="home.lede">...</p>
```

The same key can be resolved at build time and, if still needed, at runtime.

Do not localize:

- user textareas/contenteditable contents;
- generated document contents;
- user filenames unless they are defaults;
- private saved drafts;
- public shared author content.

## 10. Locale-aware language control

Change the language control from a browser-only state button into a durable counterpart link.

Requirements:

- English page exposes Urdu counterpart URL when available;
- Urdu page exposes English counterpart URL;
- target exists in the locale route registry;
- active editor text is not lost solely because of locale navigation;
- accessibility label communicates the destination language;
- crawlers can discover the locale URL through normal anchor markup.

For Phase 1 pages, the counterpart must always exist.

For routes without an Urdu counterpart, do not manufacture an indexable `/urdu/...` page. Keep existing browser-only localization behavior only if it is safe and clearly outside the Phase 1 search corpus, or route the language control to `/urdu/` with explicit UX. Do not return a thin 200 page.

## 11. Local development server

Update `scripts/dev-server.js` if needed so local tests resolve:

```text
/urdu/
/urdu/urdu-keyboard
/urdu/tools/urdu-voice-typing
```

to the corresponding generated `.html` files using the same extensionless semantics as production.

Do not create development-only URL behavior that differs materially from Cloudflare Pages.

## 12. Redirect rules

Preserve existing clean URL rules.

If locale `.html` URLs are directly reachable, add permanent redirects to clean Urdu canonicals where required:

```text
/urdu/urdu-keyboard.html -> /urdu/urdu-keyboard
```

Do not redirect `/urdu/urdu-keyboard` to the English route.

`/urdu` may normalize to `/urdu/` if necessary, but avoid redirect chains.

## 13. Test contract

Add focused unit/static tests for:

### Route parser

- root and `/index.html`;
- `/urdu`, `/urdu/`, `/urdu/index.html`;
- nested tool paths;
- `.html` normalization;
- trailing slash normalization;
- counterpart generation;
- unavailable locale route behavior.

### Generated output

For each Phase 1 Urdu file:

- file exists;
- initial `<html>` is `lang=ur dir=rtl`;
- page contains expected Urdu H1/lede marker;
- no local asset accidentally points to `/urdu/js`, `/urdu/css`, `/urdu/image`, `/urdu/sw.js` or `/urdu/manifest.webmanifest`;
- critical editor IDs are preserved.

### Browser smoke

At minimum:

```text
/ -> /urdu/ -> /
/urdu-keyboard -> /urdu/urdu-keyboard -> /urdu-keyboard
/urdu/tools/urdu-voice-typing loads without local 404s
```

Verify one core workspace can accept text before and after locale navigation using the approved continuity method.

## 14. Acceptance criteria

- [ ] One shared route helper owns locale-prefix parsing.
- [ ] Exact-path feature checks needed by Phase 1 consume normalized product paths.
- [ ] Shared local assets are safe under `/urdu/`.
- [ ] Root PWA/service-worker behavior works from Urdu pages.
- [ ] Deterministic generator creates all eight Phase 1 files.
- [ ] Generated files are checked in and drift-checked.
- [ ] URL determines current locale; localStorage no longer overrides page language after load.
- [ ] Language control exposes real counterpart links.
- [ ] Existing English product behavior remains green.
- [ ] No user-authored content enters the localization catalogue or generator.

## 15. Verification

```text
npm run locale:generate
npm run locale:check
npm test
npm run governance:check
npm run test:browser
```

Do not start Slice B until generated Urdu pages load locally with zero locale-prefix asset 404s and the core English regression suite remains green.