# WU-HERITAGE-001A — Ten-Year Heritage & Impact Page

**Parent:** `WU-HERITAGE-001`  
**Status:** Active — implementation started 2026-09-06  
**Route:** `/10-years-of-write-urdu`  
**Evidence:** `docs/WU-HERITAGE-001-EVIDENCE-2026-09-06.md`

## Goal

Ship the first polished, crawlable, ad-free Write Urdu heritage page using only defensible history, current aggregate Product Pulse evidence and transparently labelled estimates.

This slice does **not** build the dedicated user-story database/API/moderation flow. It may invite stories through the existing feedback route as an interim channel, while clearly stating that publication requires review and permission.

## Required public narrative

### Hero

- Eyebrow: `2016 → 2026`
- H1: `10 years of writing Urdu together`
- Clear line: `Write Urdu has been online since July 2016.`
- Supporting Urdu line with `lang="ur" dir="rtl"`, for example: `دس سال، لاکھوں الفاظ، بے شمار کہانیاں`
- Primary CTA back to writing.
- Secondary CTA to the methodology section.

### Impact

Show a small set of strong, carefully labelled facts rather than a dashboard wall.

Required:

- `10+ years` — measured history statement;
- `1,067` — derived recent non-zero writing sessions;
- `128` — recent sessions over 2,500 characters;
- `Tens of millions` — estimated lifetime word-equivalent scale.

Every estimated/derived card must contain a visible label such as `Recent measured sample`, `Derived`, or `Estimated`.

### Human meaning

Use editorial blocks for:

- school & university;
- applications & formal letters;
- poetry & literature;
- family & personal messages;
- work & business;
- the social internet.

Required disclaimer:

`These are the kinds of writing Write Urdu supports, not a tracked breakdown of people's private text.`

### Trust statement

Prominently communicate the principle:

`We can estimate how much was written. We cannot tell you what was written.`

Explain that Write Urdu's current aggregate telemetry does not contain the private writing itself.

### Methodology

A visible `How we estimated this` disclosure must explain:

- the recent writing-length buckets;
- 1,067 non-zero session arithmetic;
- the bounded open-ended `2500+` assumption;
- recent character range roughly 0.6–0.9m;
- current-rate ten-year extrapolation;
- the rough six-characters-per-word editorial conversion;
- why the headline stays `tens of millions` rather than an exact lifetime counter;
- that historical traffic may have differed and is not reconstructed as fact.

Link to no private/internal dashboard. Public copy must be understandable on its own.

### Timeline

Use only defensible milestones:

- **July 2016** — Write Urdu begins online;
- **The early years** — simple paths from English-letter input to Urdu writing;
- **Over the years** — richer editing, formatting and export become part of the product;
- **2026** — a broader writing platform including voice input, Urdu-language surfaces and moderated community publishing;
- **The next decade** — continue making Urdu easy to write, keep and share.

Do not invent exact intermediate release dates in this slice.

### Story invitation

Heading:

`Were you here sometime in the last 10 years?`

The copy may mention school, applications, poetry, social posts, letters or something completely different.

Required privacy sentence:

`Please do not paste the private document, message, application or letter you wrote. Tell us the story around it instead.`

Interim CTA:

`Share your Write Urdu story` → existing `/feedback` route.

Required expectation:

`We review stories before anything is published.`

Do not render sample testimonials.

## UI acceptance

- ad-free anniversary/editorial visual system;
- compatible with the existing V3 trust shell;
- a richer heritage-specific stylesheet may extend, not fork, the design system;
- no Bootstrap/jQuery/social SDK restoration;
- no remote decorative font dependency required for the page to work;
- Urdu typography uses existing font fallbacks and generous line height;
- 360px width: no horizontal scroll;
- timeline collapses cleanly to one column;
- impact cards remain readable without giant numbers dominating mobile;
- methodology `details` works with keyboard and screen readers;
- no animation required; decorative motion must respect `prefers-reduced-motion`.

## SEO acceptance

- indexable `/10-years-of-write-urdu` registry entry;
- extensionless canonical;
- title: `10 Years of Write Urdu — A Decade of Urdu Writing`;
- H1: `10 years of writing Urdu together`;
- description references July 2016, transparent impact estimate and user stories without keyword stuffing;
- `Article` in shared SEO schema graph;
- `datePublished` / `lastmod` reflect the heritage-page publication date, not the original 2016 product launch;
- XML sitemap includes the route;
- Open Graph/Twitter preview uses a first-party anniversary asset;
- no aggregateRating/review schema.

## Ad/privacy acceptance

- no `ins.adsbygoogle`, AdSense loader or ad slot in page source;
- route is classified as trust/ad-free when added to the public route registry;
- no editor/user text is transmitted by this page;
- no tracking specific story content;
- methodology refers only to aggregate counters.

## Code/file expectations

Expected implementation footprint:

```text
10-years-of-write-urdu.html
css/heritage-impact.css
assets/social/write-urdu-10-years.svg
seo.config.js
sitemap.xml
js/ads.js
docs/WU-PUBLIC-PAGE-REGISTRY.csv
tests/heritage-impact-contract.test.js
scripts/run-contract-tests.js
```

Do not touch:

```text
index.html writer UI
main.js transliteration behavior
urdu-editor runtime
urdu-keyboard runtime
WU-PLAT-002H mobile activation code
community submission/publication tables
```

## Contract tests

Add a dedicated contract test that proves at minimum:

- correct H1 and July 2016 wording;
- evidence labels exist;
- 1,067 and 128 current figures are present;
- `tens of millions` is explicitly estimated;
- unsupported exact `100 million words` claim is absent;
- human-purpose disclaimer exists;
- no fake testimonial block is seeded;
- methodology disclosure exists;
- story CTA points to feedback only in this slice;
- route is indexable in SEO config;
- route is classified `trust` in ads policy;
- no ad markup or legacy framework/social embeds;
- public page registry contains the route.

## Validation commands

Implementation should run:

```bash
npm run shell:sync
npm run seo:graph:sync
npm run seo:generate
npm run seo:sync-heads
npm run shell:check
npm run seo:graph:check
npm test
npm run seo:check
npm run governance:check
```

Run browser checks if the repository CI/environment supports them. At minimum manually inspect 360×800, 390×844 and desktop layout before merge.

## Done when

- [ ] Page is polished and visually coherent on desktop/mobile.
- [ ] Claims match the evidence ledger.
- [ ] Route is ad-free and indexable.
- [ ] Shared shell/SEO generators are synchronized.
- [ ] Contract tests are green.
- [ ] No core writer or community-publication runtime changed.
