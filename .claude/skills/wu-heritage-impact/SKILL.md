---
name: wu-heritage-impact
description: Implement or review WU-HERITAGE-001 one slice at a time: the 10-year Write Urdu heritage/impact page, claim-safe evidence methodology, About/home heritage integration, and moderated real user stories without fake testimonials or private-writing telemetry.
---

# Write Urdu Heritage & Impact — implementation skill

Use this skill for `WU-HERITAGE-001` work only.

## Mandatory read order

1. `specs/WU-HERITAGE-001-ten-years-impact-stories.md`
2. `docs/WU-HERITAGE-001-EVIDENCE-2026-09-06.md`
3. exact slice spec, currently `specs/WU-HERITAGE-001A-ten-year-impact-page.md`
4. `docs/WU-HERITAGE-001-IMPLEMENTATION-PLAN-2026-09-06.md`
5. current `why-write-urdu.html`
6. current `css/v3-trust.css`
7. current `seo.config.js`
8. current `js/ads.js`
9. current public page registry and SEO/shell generators
10. current contract-test runner

Do not implement from this skill alone. The epic and evidence ledger own public claims.

## Core invariant

**History must be compelling without becoming fictional.**

Preserve this distinction:

```text
measured telemetry
  ≠ historical telemetry
  ≠ estimated lifetime scale
  ≠ illustrative book/page equivalent
  ≠ observed purpose of private writing
  ≠ approved real user story
```

Never collapse those categories in copy, schema or UI.

## Approved launch-history wording

Founder-confirmed launch month:

```text
July 2016
```

Safe:

```text
Write Urdu has been online since July 2016.
Helping people write Urdu online since 2016.
2016 → 2026: 10 years of Write Urdu.
```

Unsafe without more evidence:

```text
Launched on 15 July 2016.
```

A domain registration date is not automatically the public product launch date.

## Current evidence anchors

The first heritage release may use:

```text
5,323 product visits
4,225 engaged visits
1,067 derived non-zero writing sessions
128 writing sessions in the 2500+ character bucket
~0.6–0.9m characters represented by the recent writing buckets
tens of millions of lifetime word-equivalents — estimated, not counted
```

Do not upgrade `tens of millions` to an exact lifetime counter unless the evidence ledger is explicitly updated first.

## HERITAGE-A implementation boundary

Allowed:

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

Do not change:

```text
index.html writer hierarchy
main.js transliteration behavior
Rich Editor runtime
Urdu Keyboard runtime
mobile first-value code
community writing tables or moderation behavior
```

The anniversary page is additive and ad-free.

## Copy firewall

### Never publish as fact

```text
100 million words written
thousands of books were written
hundreds of thousands of homework hours
most users wrote school work
Write Urdu was definitely more popular before AI
```

### Allowed human framing

```text
What might those millions of words have been?
The kinds of writing Write Urdu supports include...
Enough text to fill hundreds of full-length books — an illustrative equivalent.
We can estimate how much was written. We cannot tell you what was written.
```

### No fake testimonials

Do not add placeholder quotes that look real. Do not invent:

```text
names
countries
years first used
user quotations
ratings
review counts
```

Until real stories are approved, render invitation/design placeholders that are clearly not testimonials.

## Visual direction

Aim for an editorial anniversary/museum feeling, not a KPI dashboard:

- 2016 → 2026 visual anchor;
- warm off-white/paper surfaces;
- existing Write Urdu green as accent;
- Urdu phrase with `lang="ur" dir="rtl"` and existing Urdu-safe fallback fonts;
- oversized year/number typography balanced by readable explanations;
- timeline that works without its decorative line;
- methodology disclosure visually quieter but easy to find;
- no stock-photo dependency;
- no new remote framework/font dependency;
- mobile-first reading order.

## SEO workflow

When adding the page:

1. register it in `seo.config.js`;
2. use `section: 'about'`;
3. use `schema: ['Article']`;
4. use the page publication date for `datePublished` / `lastmod`;
5. generate/sync static SEO graph;
6. regenerate sitemap;
7. sync static shell;
8. add first-party OG image;
9. update public page registry;
10. classify the route as `trust` in ads policy.

Do not add review/rating schema.

## Interim story CTA

HERITAGE-A may use:

```text
/feedback
```

with copy that says publication requires review/permission.

Required privacy reminder:

```text
Please do not paste the private document, message, application or letter you wrote. Tell us the story around it instead.
```

Do not create a fake form that silently emails/publishes without the HERITAGE-C contract.

## HERITAGE-C architecture guardrails

When the dedicated story system is authorized:

- reuse existing D1 binding;
- create heritage-owned tables rather than overloading Urdu Writers/public documents;
- public submission cannot set moderation state;
- email is optional and never public;
- explicit publish consent is required;
- optional light-edit consent is separate;
- Product OS human review is the only approval boundary;
- public rendering reads only approved publication snapshots;
- unpublish/removal must exist;
- story text must never be sent through Product Pulse analytics.

## Validation

Before declaring HERITAGE-A complete:

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

Inspect at least:

```text
360×800
390×844
desktop >= 1280px
```

Fail the slice if the page is beautiful but any claim becomes less defensible.
