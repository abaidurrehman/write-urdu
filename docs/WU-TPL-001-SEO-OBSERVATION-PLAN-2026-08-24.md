# WU-TPL-001 — SEO Observation and Promotion Plan

**Date:** 2026-08-24  
**Feature:** `WU-TPL-001` Urdu Writing Templates  
**English owner:** `/urdu-writing-templates`  
**Urdu sibling:** `/urdu/urdu-writing-templates`  
**Decision:** observe one strong collection page first; promote only evidence-backed individual writing jobs.

## 1. Why this plan exists

The writing-template library has 12 useful starter templates and two crawlable language routes. The next risk is over-expansion: publishing one page per template before Search Console proves demand would create thin, overlapping pages and dilute the collection owner's authority.

The operating loop is:

```text
collection launch
→ crawl/index observation
→ Search Console query discovery
→ score distinct writing jobs
→ strengthen collection OR promote one winner
→ observe again
```

Do not create synonym/doorway pages such as separate routes for `leave application in urdu`, `urdu leave application`, and `application for leave in urdu`. One useful page owns one distinct job.

## 2. Day-zero state

Launch date: **2026-08-24**.

No post-launch Search Console baseline has been recorded yet. Never substitute an external keyword estimate for WriteUrdu's own query evidence.

The first post-launch Search Console export that includes 2026-08-24 becomes the baseline snapshot.

Current crawl observation on launch day: external search snapshots had not yet surfaced the new writing-template routes. Treat this as an indexing/crawl observation only; it is not a reason to create more URLs.

No individual writing-job page is approved at launch.

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

- invitation letter / `دعوت نامہ`;
- broad `application in urdu` / `urdu application` / `درخواست`;
- certificate request/application;
- payment reminder in Urdu;
- meeting notice in Urdu.

Do not create Tier 3 pages solely because the template exists.

## 4. Search Console scorer

The repository includes a deterministic scorer for the approved query clusters:

```text
scripts/analyze-writing-template-gsc.js
```

Export **Performance → Search results → Queries** as CSV and run:

```bash
npm run templates:gsc -- path/to/Queries.csv
```

Machine-readable output:

```bash
npm run templates:gsc -- path/to/Queries.csv --json
```

The scorer:

- recognizes the governed English/Roman/Urdu query variants;
- assigns each query to one specific job before the broad application bucket;
- sums clicks and impressions;
- calculates CTR from aggregate clicks/impressions;
- calculates impression-weighted average position;
- shows the leading matched queries;
- marks clusters `HOLD`, `OBSERVE`, `CANDIDATE`, or `PROMOTION REVIEW`.

It intentionally does **not** publish pages or change SEO configuration.

### Promotion-review gates implemented by the scorer

The scorer implements the two gates that can be safely evaluated from one Queries CSV:

1. **Near-win:** 100+ impressions and cluster-weighted average position 4–20; or
2. **Click proof:** 25+ impressions and at least 3 organic clicks.

The third gate from §7 — a 7-day breakout versus the previous comparable 7-day period — requires comparable Dates exports and is intentionally not inferred from a single query CSV.

`PROMOTION REVIEW` means investigate the cluster. It does not mean ship a page.

## 5. Search Console collection procedure

At each checkpoint export **Queries, Pages, Countries, Devices and Dates** for Web search.

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

Capture the same fields separately. Do not merge the two routes until checking whether Google serves different language/user segments.

### C. Sitewide query discovery

Search sitewide Queries for the clusters in §3. This catches cases where Google initially assigns a query to `/`, `/urdu-editor`, `/urdu-templates`, or another established URL instead of the new collection owner.

If another route earns a narrow application query, investigate intent ownership before adding a new page.

## 6. Checkpoint cadence

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

A cluster can enter `CANDIDATE` state, but normally should not ship yet.

### Checkpoint 3 — promotion decision: ~28 days

Run `templates:gsc` on the 28-day Queries export, then apply every mandatory gate in §7.

### Checkpoint 4 — confirmation: ~56 days

Re-score candidates that did not pass at day 28. Earlier promotion is allowed only for a very clear breakout with strong intent fit.

## 7. Dedicated-page promotion gates

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

Use a rolling 28-day window. A cluster qualifies for deeper review when **at least one** evidence path is true:

1. **Near-win:** 100+ impressions with cluster-weighted average position roughly 4–20; or
2. **Click proof:** 25+ impressions and at least 3 organic clicks; or
3. **Breakout:** 20+ impressions in the latest 7 days and at least 100% growth versus the previous comparable 7 days, with the same intent remaining relevant.

These are prioritization thresholds, not ranking guarantees. If the site has unusually low/high exposure, use relative evidence rather than mechanically publishing a page.

### Gate C — current owner fit — mandatory

Before creating a page, inspect which WriteUrdu URL Google currently ranks for the cluster.

- If `/urdu-writing-templates` ranks: candidate can be promoted if a dedicated page answers the job materially better.
- If another established page ranks strongly: first decide whether that route should remain owner.
- If multiple WriteUrdu URLs split impressions: fix cannibalization before adding another URL.

### Gate D — unique product value — mandatory

A dedicated page must add more than the same template body.

Minimum useful page contract:

- one editable template/workspace or direct preselected template state;
- when the format is appropriate;
- what information the user must replace;
- 2–4 useful variations where genuinely different;
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

## 8. Decision outcomes

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

## 11. Review table

Use this table at each checkpoint:

| Cluster | 28d impressions | Clicks | CTR | Avg position | Current ranking URL | Trend | State | Action |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Leave application | — | — | — | — | — | — | HOLD | Observe |
| Job application | — | — | — | — | — | — | HOLD | Observe |
| Fee concession | — | — | — | — | — | — | HOLD | Observe |
| Resignation | — | — | — | — | — | — | HOLD | Observe |
| Complaint | — | — | — | — | — | — | HOLD | Observe |
| Invitation / other | — | — | — | — | — | — | HOLD | Observe |

Never replace `—` with an estimate. Only record exported Search Console evidence.

## 12. Observation log

### 2026-08-24 — launch baseline

- English and Urdu collection routes launched as indexable search surfaces in repository source.
- External crawl/search snapshots had not yet surfaced the new routes at the time of observation.
- No post-launch Search Console baseline available on the current file surface.
- No individual template landing pages approved.
- Deterministic query-cluster scorer added as `npm run templates:gsc -- <Queries.csv>`.
- Next meaningful decision requires post-launch Search Console evidence.

## 13. Next action

After the deployed routes have had time to crawl, provide the next Search Console Performance ZIP/CSV. Review exact page-filtered and sitewide query data against this plan, update the review table, and approve exactly one of:

```text
HOLD
STRENGTHEN COLLECTION
PROMOTE ONE WINNER
```

No dedicated writing-job route should be implemented before that decision is recorded.
