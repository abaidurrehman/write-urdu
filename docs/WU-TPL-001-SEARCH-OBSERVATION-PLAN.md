# WU-TPL-001 — Search observation and promotion plan

**Feature:** Urdu Writing Templates  
**Owner route:** `/urdu-writing-templates`  
**Urdu sibling:** `/urdu/urdu-writing-templates`  
**Status:** Observe first; do not create individual template landing pages without evidence  
**Started:** 2026-08-24

## Decision

The collection page is the search owner at launch. Individual template pages are not created in advance.

The expansion loop is:

```text
collection page
→ observe real Search Console queries
→ identify one distinct, repeatable user intent
→ confirm which page Google currently ranks
→ promote only the strongest useful winner
→ measure the new route against the collection baseline
```

This prevents twelve near-identical pages from competing with one another or diluting WriteUrdu's existing authority.

## Intent clusters to watch

The first observation set is intentionally small:

1. `leave application in urdu`
2. `job application in urdu`
3. `resignation letter in urdu`
4. `complaint application in urdu`
5. `invitation letter in urdu`
6. broad `urdu application` / `application in urdu` / `درخواست`

The scorer also recognizes selected Urdu-script variants such as `چھٹی کی درخواست`, `ملازمت کی درخواست`, `شکایت کی درخواست`, `استعفیٰ` and `دعوت نامہ`.

Do not add a new cluster simply because a keyword tool suggests it. Add one when Search Console or product usage shows a real writing job that the current collection does not represent well.

## How to score a Search Console export

Export **Performance → Search results → Queries** from Google Search Console as CSV, then run:

```bash
npm run templates:gsc -- path/to/Queries.csv
```

For machine-readable output:

```bash
npm run templates:gsc -- path/to/Queries.csv --json
```

The scorer aggregates clicks, impressions, CTR and impression-weighted average position by the six approved intent clusters.

### Signal labels

- **HOLD** — fewer than 100 impressions and no clicks in the exported period.
- **OBSERVE** — at least 100 impressions or at least one click.
- **CANDIDATE** — at least 500 impressions or at least five clicks.
- **PROMOTION REVIEW** — at least 1,000 impressions and average position 20 or better.

`PROMOTION REVIEW` is deliberately not `SHIP`.

The thresholds are triage thresholds, not SEO guarantees. They answer "is this intent now large enough to investigate?" rather than "will a dedicated page rank?".

## Required checks before a dedicated page is approved

A cluster that crosses `PROMOTION REVIEW` still needs all of the following:

1. In Search Console, inspect the query together with **Pages** and confirm whether `/urdu-writing-templates`, another WriteUrdu route, or an unexpected page is currently receiving the impressions.
2. Confirm the intent is materially distinct from the collection page and from another existing route.
3. Confirm a dedicated page can provide substantially more user value than copying the same template into a new URL.
4. Define a useful product action on the page: editable template, clear placeholders, Basic Writer/Rich Editor continuation, and relevant guidance.
5. Keep the collection page linked as the parent library.
6. Do not create multiple pages for spelling/plural/query variants of the same job.
7. Recheck cannibalization after launch.

## What a promoted page should contain

A promoted route should be a real task page, not a keyword wrapper. A strong page can include:

- one reviewed editable Urdu template;
- explanation of when the template is appropriate;
- which placeholders the user must replace;
- a few meaningful wording variants where the situation genuinely changes;
- common mistakes or recipient-specific checks;
- one-click Basic Writer and Rich Editor continuation;
- related templates from the parent collection;
- truthful FAQ only where there are real user questions.

The page must not claim the template is an official form or guaranteed to be accepted.

## Observation cadence

Use a 28-day Search Console window for the main decision view once the page has had enough time to be crawled. A 7-day view can be used for early discovery, but do not promote a page from a short spike alone.

Recommended checkpoints:

- after first confirmed indexing/crawl;
- around 14 days after indexing for early query discovery;
- around 28 days for the first meaningful promotion review;
- monthly afterward while the collection is still gaining search visibility.

If the collection receives little or no search visibility, first diagnose indexing, internal links, query ownership and SERP fit. Do not respond by publishing more template URLs.

## Product telemetry to read alongside Search Console

The template library already records bounded events without storing user text:

- `template_used` — user chose a template;
- `copy_completed` — copied an edited template;
- `tool_handoff` — continued into Basic Writer or Rich Editor.

Use Search Console for acquisition demand and these events for product usefulness. A template with search impressions but no meaningful use may need better content or intent matching before it deserves its own route.

## Observation log

Add dated findings below; do not overwrite previous observations.

### 2026-08-24 — launch baseline

- English and Urdu collection routes launched as indexable search surfaces.
- Search/web crawl snapshots had not yet surfaced the new routes at the time of this check.
- No individual template landing pages approved.
- Next decision requires post-launch Search Console query evidence.
