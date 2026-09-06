# WU-HERITAGE-001 — Implementation Plan (2026-09-06)

**Epic:** `specs/WU-HERITAGE-001-ten-years-impact-stories.md`  
**Current slice:** `specs/WU-HERITAGE-001A-ten-year-impact-page.md`  
**State:** Slice A in progress

## Read order

1. `specs/WU-HERITAGE-001-ten-years-impact-stories.md`
2. `docs/WU-HERITAGE-001-EVIDENCE-2026-09-06.md`
3. `specs/WU-HERITAGE-001A-ten-year-impact-page.md`
4. `why-write-urdu.html`
5. `css/v3-trust.css`
6. `seo.config.js`
7. `scripts/static-seo-graph.js`
8. `scripts/static-shell.js` + `scripts/sync-static-shell.js`
9. `js/ads.js`
10. `docs/WU-PUBLIC-PAGE-REGISTRY.csv`
11. `tests/v3-trust-pages-contract.test.js`
12. `scripts/run-contract-tests.js`

## Slice A — implement now

### Step A1 — route and visual system

Create:

```text
/10-years-of-write-urdu
10-years-of-write-urdu.html
css/heritage-impact.css
assets/social/write-urdu-10-years.svg
```

The HTML should reuse the shared static shell and V3 trust foundation. Heritage CSS extends the shared tokens; it must not create a second global header/footer system.

### Step A2 — claim-safe content

Implement the content directly from the evidence ledger:

- July 2016 launch month;
- 1,067 derived recent non-zero sessions;
- 128 recent sessions above 2,500 characters;
- `tens of millions` lifetime word-equivalent estimate;
- `0.6–0.9 million characters` recent bucket estimate;
- no exact lifetime counter;
- no fake testimonials;
- use-case categories explicitly described as possible/supported writing, not observed private content.

### Step A3 — methodology

Add an accessible `<details>` section that makes the calculation understandable without reading internal docs.

The public methodology should be short enough to read but include:

1. recent bucket counts;
2. midpoint/open-bucket assumptions;
3. 0.6–0.9m character current-period range;
4. ten-year current-rate extrapolation;
5. rough word conversion;
6. why the public headline stays imprecise.

### Step A4 — SEO and discovery

Add the page to `seo.config.js` under the About section:

```text
id: heritage-10-years
path: /10-years-of-write-urdu
indexable: true
schema: [Article]
priority: 0.72
changefreq: yearly
lastmod/datePublished: 2026-09-06
```

Synchronize:

- static JSON-LD graph;
- sitemap.xml;
- static shell;
- Open Graph / Twitter metadata.

### Step A5 — ad-free trust classification

Add `/10-years-of-write-urdu` to the `trust` group in `js/ads.js` and the public page registry. Page source itself must contain no ad slots.

### Step A6 — contract test

Add `tests/heritage-impact-contract.test.js` and register it in `scripts/run-contract-tests.js`.

The test must fail if:

- the route loses trust/ad-free classification;
- exact unsupported `100 million words` wording appears;
- estimate labels disappear;
- the story invitation becomes fake seeded social proof;
- July 2016 origin wording disappears;
- the route falls out of SEO/public registry.

### Step A7 — validation

Run generators before checks:

```bash
npm run shell:sync
npm run seo:graph:sync
npm run seo:generate
npm run seo:sync-heads
```

Then:

```bash
npm run shell:check
npm run seo:graph:check
npm test
npm run seo:check
npm run governance:check
```

If CI supports Playwright, run the browser suite. Check responsive layouts at 360×800, 390×844 and a desktop width.

## Slice B — after visual review of A

1. Add a compact `Since July 2016` marker + heritage link to `/why-write-urdu`.
2. Update the human sitemap and `llms.txt` if the route is not already discoverable from their generated/curated structures.
3. Consider a homepage trust line only after confirming it does not displace the P0 mobile editor/first-input path.
4. No modal, sticky banner or pre-value anniversary promo.

## Slice C — moderated story collection

Do not implement as part of A.

### Data model

Use the existing D1 binding and add additive heritage-owned tables. Suggested shape:

```text
heritage_story_submissions
heritage_story_publications
```

Submission fields should include:

```text
id
created_at
first_use_period
purpose_category
story_text
public_display_name
publish_anonymously
country_optional
contact_email_optional
publish_consent_at
light_edit_consent_at
status
moderation_note
```

Do not reuse `writing_documents` or community publication rows.

### Security

- public submit endpoint only;
- server-side length/HTML/control-character validation;
- rate limit / duplicate/spam guards;
- email never returned publicly;
- only Product OS moderation can approve/reject/unpublish;
- story text never enters Product Pulse event payloads.

### Product OS

Reuse the authentication/authorization pattern used by existing community moderation rather than inventing a second admin boundary.

Queue should show:

- approximate first-use period;
- category;
- story;
- requested display name / anonymous state;
- optional country;
- consent state;
- moderation actions.

### Public rendering

Only approved publication snapshots render publicly. Every story must support unpublish/removal. Never automatically publish an edited submission.

## Sequence guardrail

Slice A is approved now as an isolated trust/content surface. Slice B is a small integration after visual acceptance. Slice C is meaningful new UGC functionality and must be coordinated with `WU-PLAT-002H` growth-request arbitration and existing `WU-COMMUNITY-001` launch/terms decisions before broad promotion.
