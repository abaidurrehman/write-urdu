# WriteUrdu P0.2 — Production & Indexing Closure

**Date:** 2026-08-12  
**Status:** Implementation ready; production verification runs after merge  
**Priority URLs:** `/`, `/urdu-card-studio`, `/how-to-write-urdu-on-photo`

## Why this closure exists

The English-to-Urdu typing and Card Studio acquisition upgrades introduced explicit `searchTitle` / `searchDescription` metadata in `seo.config.js`. During production-oriented verification, two lifecycle risks were found:

1. the preferred acquisition metadata was initially available only after JavaScript, while the checked-in static HTML still exposed older titles; and
2. the asynchronous v2 shell could re-apply localized page copy after the SEO script and overwrite the final English document title (and the homepage task H1).

Both issues are now covered by source, browser and post-deploy checks.

## Implemented closure controls

### Initial HTML metadata

For routes with explicit acquisition metadata, `seo.config.js` is the source of truth and the checked-in HTML now exposes the same values in:

- `<title>`;
- meta description;
- `og:title` / `og:description`;
- `twitter:title` / `twitter:description`.

`scripts/sync-static-search-metadata.js` can update these fields and `npm run seo:heads:check` fails when they drift.

### Shared-shell lifecycle

The SEO runtime listens for the existing `write-urdu:locale-change` event emitted after shell page copy is applied. English page applications restore the registry search metadata; an explicitly selected Urdu locale remains free to use localized document/UI copy.

The homepage English shell copy also preserves the established H1:

`Type Roman Urdu and convert it to Urdu script`

### Browser acceptance

`tests/seo-acquisition.spec.js` is part of the focused desktop/mobile CI gate and verifies:

- homepage final acquisition title, canonical and description;
- homepage WebSite / WebPage / WebApplication / Organization schema graph;
- Card Studio final acquisition title, canonical and WebApplication schema;
- Urdu-on-photo guide canonical Article + Breadcrumb schema.

### Post-deploy verification

`.github/workflows/production-seo.yml` runs after successful `main` quality checks and retries while Cloudflare deploys. It checks the real public site for:

- priority route 2xx responses;
- initial HTML title/description/canonical/OG/Twitter alignment;
- homepage task H1;
- removal of the legacy Urdu Keyboard claim that would compete for English-to-Urdu typing ownership;
- `robots.txt` crawler policy and sitemap declaration;
- sitemap presence for priority canonicals;
- `llms.txt` acquisition ownership;
- `security.txt` contact/canonical;
- `ads.txt` publisher declaration;
- canonical-host redirects via the existing live canonical audit.

## Query ownership protected

- `/` — English to Urdu typing / Urdu typing online / Roman Urdu with English letters.
- `/urdu-card-studio` — Urdu text or poetry on a photo / Urdu post maker.
- `/how-to-write-urdu-on-photo` — informational how-to support only.
- `/urdu-keyboard` — direct Urdu-character input, not the English-to-Urdu product owner.
- `/urdu-editor` — rich formatting/export.
- `/roman-urdu-transliteration` — mechanics and transliteration-vs-translation explanation.

## Still manual / evidence-gated

This engineering closure does **not** claim that Google has recrawled or reindexed the pages. After production verification is green:

1. request recrawl in Google Search Console for `/`, `/urdu-card-studio`, and `/how-to-write-urdu-on-photo` first;
2. inspect supporting historical ranking routes if the prime query still maps to them;
3. validate representative structured data with Google's Rich Results Test / Schema.org Validator when useful;
4. continue weekly Search Console tracking for `urdu typing`, `urdu writing`, and `English to Urdu typing` query-to-page ownership;
5. avoid another title/route change until enough post-recrawl evidence is available.

## Verification commands

```bash
npm test
npm run seo:check
npm run governance:check
npx playwright test tests/seo-acquisition.spec.js
npm run seo:production
npm run seo:live
```
