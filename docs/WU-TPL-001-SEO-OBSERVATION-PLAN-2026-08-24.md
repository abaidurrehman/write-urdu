# WU-TPL-001 — SEO Observation and Promotion Plan

**Date:** 2026-08-24  
**Feature:** `WU-TPL-001` Urdu Writing Templates  
**English owner:** `/urdu-writing-templates`  
**Urdu sibling:** `/urdu/urdu-writing-templates`  
**Decision:** observe one strong collection page first; promote only evidence-backed individual writing jobs.

## 1. Why this plan exists

The writing-template library now has 12 useful starter templates and two crawlable language routes. The next risk is over-expansion: publishing one page per template before Search Console proves demand would create thin, overlapping pages and dilute the collection owner's authority.

The operating loop is therefore:

```text
collection launch
→ crawl/index observation
→ Search Console query discovery
→ score distinct writing jobs
→ strengthen collection OR promote one winner
→ observe again
```

Do not create synonym/doorway pages such as multiple variants of `leave application in urdu`, `urdu leave application`, and `application for leave in urdu`. One useful page owns one distinct job.

## 2. Day-zero state

Launch date: **2026-08-24**.

The latest Search Console ZIP previously supplied in another project thread is not available on the current repository/file surface, so this document intentionally records **no fabricated pre-launch impression count**.

The first post-launch Search Console export that includes 2026-08-24 becomes the baseline snapshot.

External SERP research on 2026-08-24 confirms clear existing Urdu-specific search/result ecosystems for at least:

- leave applications in Urdu;
- job applications in Urdu;
- fee-concession applications in Urdu;
- resignation letters in Urdu.

That is prioritization evidence only. It does **not** justify a dedicated WriteUrdu page until WriteUrdu's own Search Console data begins surfacing the job.

## 3. Query clusters to watch

Track English/Roman search wording and Urdu-script wording together when they express the same job.

### Tier 1 — watch first

#### Leave application

Examples:

- `leave application in urdu`
- `application for leave in urdu`
- `urdu leave application`
- `sick leave application in urdu`
- `urgent work leave application in urdu`
- `رخصت کی درخواست`
- `درخواست برائے رخصت`

Current collection templates:

- school sick leave;
- urgent-work school leave;
- office leave.

#### Job application

Examples:

- `job application in urdu`
- `urdu job application`
- `application for job in urdu`
- `نوکری کی درخواست`
- `درخواست برائے ملازمت`

Current collection template:

- job application.

### Tier 2 — observe

#### Fee concession

- `fee concession application in urdu`
- `fee maafi application in urdu`
- `fees mafi ki darkhwast`
- `فیس معافی کی درخواست`
- `فیس میں رعایت کی درخواست`

#### Resignation

- `resignation letter in urdu`
- `urdu resignation letter`
- `استعفیٰ کی درخواست`
- `استعفیٰ کا خط`

#### Complaint

- `complaint application in urdu`
- `complaint letter in urdu`
- `شکایت کی درخواست`

### Tier 3 — long-tail watch

- certificate request/application;
- general request application;
- payment reminder in Urdu;
- meeting notice in Urdu;
- invitation letter in Urdu.

Do not create pages for Tier 3 solely because the template exists.

## 4. Search Console collection procedure

At each checkpoint export **Queries, Pages, Countries, Devices and Dates** for Web search.

Use these views:

### A. Exact English collection route

Page filter:

```text
https://write-urdu.com/urdu-writing-templates
```

Capture:

- clicks;
- impressions;
- CTR;
- average position;
- queries;
- device split;
- country split.

### B. Exact Urdu sibling

Page filter:

```text
https://write-urdu.com/urdu/urdu-writing-templates
```

Capture the same fields separately. Do not merge the two routes until checking whether Google is serving different query language/user segments.

### C. Sitewide query discovery

Search sitewide Queries for the cluster terms in §3. This catches cases where Google initially assigns a query to `/`, `/urdu-editor`, `/urdu-templates`, or another established URL instead of the new collection owner.

If another route is earning a narrow application query, investigate intent ownership before adding a new page.

## 5. Checkpoint cadence

### Checkpoint 1 — crawl/index health: ~7 days

Purpose: technical observation only.

Check:

- URL indexed / impressions beginning;
- canonical selected correctly;
- English/Urdu pages not collapsing incorrectly;
- no unexpected competing WriteUrdu URL for broad writing-template intent.

**Do not approve an individual template page at this checkpoint.**

### Checkpoint 2 — early query discovery: ~14 days

Purpose: discover language and job clusters.

Classify every material query into:

- broad writing templates;
- leave;
- job application;
- fee concession;
- resignation;
- complaint;
- another distinct job;
- irrelevant/noise.

A cluster can enter `candidate` state, but normally should not ship yet.

### Checkpoint 3 — promotion decision: ~28 days

Use the gates in §6.

### Checkpoint 4 — confirmation: ~56 days

Re-score candidates that did not pass at day 28. Earlier promotion is allowed only for a very clear breakout with strong intent fit.

## 6. Dedicated-page promotion gates

A template becomes eligible for its own route only when **all** mandatory gates pass.

### Gate A — distinct user job — mandatory

The query must represent a meaningfully distinct writing task, not merely a wording variant of `Urdu writing templates`.

Good:

```text
leave application in urdu
```

Bad separate-page split:

```text
urdu leave application
application for leave in urdu
leave request urdu
```

Those belong to the same owner.

### Gate B — observed WriteUrdu demand — mandatory

Use a rolling 28-day window. A cluster qualifies for deeper review when **at least one** of these evidence paths is true:

1. **Near-win:** 100+ impressions with cluster-weighted average position roughly 4–20; or
2. **Click proof:** 25+ impressions and at least 3 organic clicks; or
3. **Breakout:** 20+ impressions in the latest 7 days and at least 100% growth versus the previous comparable 7 days, with the same intent remaining relevant.

These are prioritization thresholds, not ranking guarantees. If the site has unusually low/high exposure, re-score using relative evidence rather than mechanically publishing a page.

### Gate C — current owner fit — mandatory

Before creating a page, inspect which WriteUrdu URL Google currently ranks for the cluster.

- If `/urdu-writing-templates` ranks: candidate can be promoted if a dedicated page would answer the job materially better.
- If another established page ranks strongly: first decide whether that route should remain owner.
- If multiple WriteUrdu URLs split impressions: fix cannibalization before adding another URL.

### Gate D — unique product value — mandatory

A dedicated page must add more than the same template body.

Minimum useful page contract:

- one editable template/workspace or direct preselected template state;
- when this format is appropriate;
- what information the user must replace;
- 2–4 useful variations where genuinely different (for example school vs office leave);
- common mistakes/checklist;
- direct Basic Writer / Rich Editor continuation;
- truthful recipient-specific limitation;
- source-visible content in initial HTML;
- mobile acceptance.

If we cannot add this value, keep the job in the collection.

### Gate E — clean SEO ownership — mandatory

The dedicated page must have:

- one narrow canonical URL;
- unique title/description/H1;
- collection → detail internal link;
- detail → collection link;
- no synonym clones;
- no copied description blocks across multiple pages;
- sitemap inclusion only after the page is complete;
- appropriate English/Urdu locale treatment based on actual copy readiness.

## 7. Decision outcomes

At each 28-day review, every cluster receives exactly one state:

### HOLD

Not enough evidence. No code/content change.

### STRENGTHEN COLLECTION

The query is useful but does not justify a URL. Improve:

- collection heading/copy;
- category labels;
- source-visible template descriptions;
- internal links;
- wording around the relevant template.

### PROMOTE ONE WINNER

Create exactly one distinct owner page/spec for the strongest qualified job.

**Rate limit:** normally no more than one new dedicated writing-job SEO page per 28-day observation cycle. Observe its interaction with the collection before approving the next one.

## 8. Likely first candidates — not pre-approved pages

Based on current external result quality and the Phase 1 catalogue, the first clusters to watch most closely are:

1. leave application in Urdu;
2. job application in Urdu;
3. fee concession application in Urdu;
4. resignation letter in Urdu.

This ranking is only a monitoring priority. Search Console evidence can reorder it immediately.

## 9. Product telemetry used alongside Search Console

The current privacy-safe telemetry can answer:

- did users engage with the template collection? (`tool_engaged` / session summary where applicable);
- did users choose a template? (`template_used`);
- did users copy? (`copy_completed`);
- did users continue to an editor? (`tool_handoff`).

It intentionally does not record template body text, search terms or user-edited content.

Current telemetry does not identify an individual selected template. Do **not** expand the analytics schema solely for SEO unless route/query evidence proves that template-level product usage would materially change a promotion decision.

## 10. What not to do

Do not:

- create 12 indexable pages now;
- create English and Roman-Urdu synonym pages for the same task;
- publish generated filler around templates;
- add fake keyword-volume estimates;
- change collection ownership based on a few impressions;
- turn template content into a public UGC/data collection system;
- add ads inside the active template/editor workspace;
- collect users' template search text or edited application content for SEO analysis.

## 11. First review template

Use this table at each checkpoint:

| Cluster | 28d impressions | Clicks | CTR | Avg position | Current ranking URL | Trend | State | Action |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Leave application | — | — | — | — | — | — | HOLD | Observe |
| Job application | — | — | — | — | — | — | HOLD | Observe |
| Fee concession | — | — | — | — | — | — | HOLD | Observe |
| Resignation | — | — | — | — | — | — | HOLD | Observe |
| Complaint | — | — | — | — | — | — | HOLD | Observe |
| Other | — | — | — | — | — | — | HOLD | Observe |

Never replace `—` with an estimate. Only record exported Search Console evidence.

## 12. Next action

After the deployed routes have had time to crawl, provide the next Search Console Performance ZIP. Review the exact page-filtered and sitewide query data against this plan, update the table, and approve either:

```text
HOLD
STRENGTHEN COLLECTION
PROMOTE ONE WINNER
```

No dedicated writing-job route should be implemented before that decision is recorded.