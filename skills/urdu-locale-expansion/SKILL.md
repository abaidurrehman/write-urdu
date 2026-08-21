# Urdu Locale Expansion Implementation Skill

Use this skill to implement the `WU-I18N-001` specification family safely with Codex or another repository agent.

## Read first

- `specs/WU-I18N-001-crawlable-urdu-locale.md`
- `specs/WU-I18N-001A-locale-routing-static-generation.md`
- `specs/WU-I18N-001B-urdu-seo-hreflang-sitemaps.md`
- `specs/WU-I18N-001C-phase1-urdu-content-qa-measurement.md`
- `specs/WU-GROWTH-001-search-adsense-growth-system.md`
- `seo.config.js`
- `docs/WU-PUBLIC-PAGE-REGISTRY.csv`

## Core decision

The locale boundary is:

```text
English/default: /
Urdu:            /urdu/
```

Use `ur` as the language code.

Do not replace this with `/pk/`, IP-based localization, automatic browser-language redirects, query-string locale parameters or a separate Urdu application.

## Non-negotiable architecture

1. Keep one product codebase.
2. Existing English canonical routes remain in place.
3. Urdu pages return Urdu in initial HTML, not only after JavaScript hydration.
4. Urdu pages self-canonicalize.
5. English/Urdu hreflang is reciprocal.
6. Locale prefix is stripped before product-route feature logic.
7. User-authored text is never translated or sent through locale analytics.
8. No new D1/KV/R2/backend is needed for static localization.
9. Urdu pages inherit the same AdSense page-type/protected-workspace rules.
10. Do not bulk-generate thin Urdu pages.

## Implementation order

### Slice A — foundation first

Implement `WU-I18N-001A` before broad SEO/content work.

Required outputs:

- shared locale registry;
- shared route parser/counterpart builder;
- normalized product path for route-sensitive runtime;
- root-safe local asset loading under `/urdu/*`;
- one site-level PWA/service-worker contract;
- build-readable Urdu catalogue for the Phase 1 routes;
- deterministic generator with `--check` mode;
- checked-in generated Phase 1 Urdu HTML;
- extensionless local dev routing;
- real English ↔ Urdu counterpart links.

Do not add repeated conditions such as:

```js
path === '/urdu-editor' || path === '/urdu/urdu-editor'
```

Use the shared normalized product route.

### Slice B — search semantics

Implement `WU-I18N-001B` only after Slice A is green.

Required outputs:

- reviewed Urdu title/description/H1 metadata;
- self canonical;
- reciprocal `en`, `ur`, `x-default` alternates;
- locale-correct OG URL/title/description;
- schema URL + `inLanguage` updates where valid;
- generated Urdu sitemap membership;
- `.html` → clean URL normalization;
- SEO checks that fail on broken locale pairs.

Protect existing English metadata. Do not rewrite the English homepage merely because `/urdu/` exists.

### Slice C — product/content launch

Implement `WU-I18N-001C` for the approved first eight routes:

```text
/urdu/
/urdu/urdu-keyboard
/urdu/urdu-editor
/urdu/tools/urdu-voice-typing
/urdu/urdu-alphabet
/urdu/urdu-faq
/urdu/urdu-card-studio
/urdu/how-to-write-urdu-on-photo
```

Review the whole primary task, not only metadata.

Check:

- H1/lede;
- primary controls;
- help/instructions;
- loading/error/empty states;
- navigation/footer;
- next-step actions;
- aria labels;
- RTL desktop/mobile layout;
- mixed Urdu/English product terms;
- page-type ad boundaries.

## Language rule

Use natural user intent.

Prefer phrases such as:

```text
انگریزی حروف میں اردو لکھیں
آن لائن اردو لکھیں
اردو کی بورڈ
بولیں اور اردو میں لکھیں
تصویر پر اردو لکھیں
```

Do not force technical words such as transliteration into primary copy when simpler Urdu explains the task.

Familiar product terms such as PDF, Word, QR, WhatsApp and browser may stay as familiar borrowed terms when clearer.

## Static-generation rule

The current repository is static-first. Generated Urdu pages are derived artifacts checked into the repo unless the deployment architecture is explicitly changed by a separate approved decision.

Human changes belong in:

```text
source HTML
locale registry/catalogue
SEO registry
shared runtime
```

Do not hand-edit generated `/urdu/*.html` as the source of truth.

## Asset-prefix audit

Before closing Slice A, prove there are no accidental locale-relative requests such as:

```text
/urdu/js/...
/urdu/css/...
/urdu/image/...
/urdu/sw.js
/urdu/manifest.webmanifest
```

unless explicitly intended.

Audit both static HTML and dynamically inserted assets.

## Search contract

For a pair such as Keyboard:

```text
/urdu-keyboard
  canonical: /urdu-keyboard
  hreflang en: /urdu-keyboard
  hreflang ur: /urdu/urdu-keyboard
  x-default: /urdu-keyboard

/urdu/urdu-keyboard
  canonical: /urdu/urdu-keyboard
  hreflang en: /urdu-keyboard
  hreflang ur: /urdu/urdu-keyboard
  x-default: /urdu-keyboard
```

Never point the Urdu canonical to English.

## AdSense/revenue rule

`WU-I18N-001` supports the existing `$5/day` growth objective but does not create a separate monetization system.

Use `WU-GROWTH-001`:

```text
revenue contribution ≈ monetizable Urdu pageviews × relevant page RPM / 1000
```

Do not add extra ads to Urdu pages just to increase RPM.

Write/creation workspaces keep their protected task boundaries. Learn pages use existing content-page rules.

## Measurement rule

Use aggregate data and existing telemetry only.

Permitted locale dimension:

```text
en | ur
```

Never log:

- editor contents;
- voice transcript;
- filenames;
- draft contents;
- user-authored Card Studio text.

After production launch, report manual Search Console/AdSense observations separately from code completion.

## Testing gates

Add focused tests for:

- locale route parsing;
- counterpart URL generation;
- generator drift;
- generated asset paths;
- Urdu `lang/dir`;
- self canonicals;
- hreflang reciprocity;
- sitemap membership;
- schema language/URL;
- English metadata protection;
- representative Urdu product flows;
- RTL mobile layout.

Run the full baseline:

```text
npm run locale:generate
npm run locale:check
npm run seo:generate
npm run seo:check
npm run governance:check
npm test
npm run test:browser
```

If `locale:*` commands do not yet exist, Slice A owns adding them.

## PR discipline

Prefer separate implementation PRs for:

1. Slice A foundation;
2. Slice B SEO semantics;
3. Slice C content/launch;

unless the actual diff is small enough to review safely together.

Do not mix unrelated auth, sharing, design-system or product-tool work into the locale PRs.

## Completion gates

Do not mark the parent implemented when only the route generator exists.

Phase 1 requires:

```text
foundation green
+ SEO pair integrity green
+ eight-page content/RTL QA green
+ production smoke recorded
+ Search Console launch steps started
```

Full-site Urdu expansion remains Phase 2 and should follow the same registry/generator architecture rather than page-by-page duplication.