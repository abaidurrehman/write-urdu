# WU-GROWTH-001 — Search Console + AdSense Growth System

**Product:** Write Urdu  
**Feature/strategy ID:** `WU-GROWTH-001`  
**Status:** Active — authority/revenue execution  
**Commercial model:** Google AdSense-funded, organic-search-led  
**Primary acquisition source:** Google Search and other organic discovery  
**Architecture constraint:** Preserve the static-first, no-account writing product and transliteration contract.  
**Current execution plan:** `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`

## 1. Commercial decision

WriteUrdu is not being optimized as a subscription SaaS. Its viable direct commercial model is advertising, currently Google AdSense.

Therefore the product roadmap must optimize for **durable useful organic traffic and monetizable pageviews** while protecting user trust, search quality, Core Web Vitals and the writing workflow.

The governing commercial equation is:

`AdSense revenue ≈ monetizable pageviews × page RPM / 1000`

Search Console explains where qualified organic visits can be gained. AdSense explains which traffic/page groups actually create revenue. Neither dataset should drive the roadmap alone.

WriteUrdu is a mature domain, so incomplete analytics data is not a reason to freeze low-risk authority-compounding work. Safe monetization normalization, internal-link improvements, existing-route SEO cleanup and feature acceptance closure may continue while the full opportunity map is assembled.

## 2. North-star and guardrails

### North-star

Grow **organic AdSense revenue** through useful Urdu writing/search experiences.

### Primary operating metrics

Track weekly and monthly:

- AdSense estimated earnings;
- page RPM;
- pageviews / ad impressions where available;
- organic clicks;
- organic impressions;
- organic CTR;
- average position;
- ranking page;
- country and device mix;
- pages per organic session or equivalent navigation-depth metric when available;
- Core Web Vitals / performance regressions on high-traffic surfaces.

### Guardrails

Do not increase revenue through:

- intrusive ad density around the active editor;
- layouts that cause accidental ad clicks;
- ads that displace the primary task above the fold;
- thin keyword pages;
- pagination or multi-step friction created only to manufacture pageviews;
- misleading navigation;
- blocking transliteration or export behind ads;
- sacrificing mobile usability or Core Web Vitals for ad inventory.

The editor remains the product. Advertising monetizes attention around a useful session; it must not become the task.

## 3. Evidence baseline required before reprioritizing the roadmap

The current repository records only two Search Console query baselines:

- `urdu typing` — 7,162 impressions, average position 7.21, CTR 1.79%, homepage owner;
- `urdu writing` — 3,705 impressions, average position 6.48, CTR 1.30%, homepage owner.

These are useful but insufficient for a commercial roadmap.

### 3.1 Search Console dataset

Capture at least the latest 3 months and, where available, a longer comparison window. Preserve raw exports rather than manually copying only winning rows.

Required dimensions/views:

1. Queries — clicks, impressions, CTR, average position.
2. Pages — clicks, impressions, CTR, average position.
3. Countries.
4. Devices.
5. Search appearance, when material.
6. Date trend.
7. Important query → landing-page relationships for candidate clusters.

Also capture comparison periods where available so we can distinguish growth from seasonality/noise.

### 3.2 AdSense dataset

Capture the same or closest comparable period. Required dimensions where available:

1. Estimated earnings by day.
2. Page RPM / impression RPM.
3. Pageviews and ad impressions.
4. Country.
5. Device.
6. Ad unit / placement.
7. URL or page group where AdSense reporting makes it available.

Do not store user-level or sensitive advertising data in the public repository. Aggregated commercial baselines may be stored; raw exports may remain private and only summarized into the repo.

### 3.3 Optional supporting analytics

If a reliable privacy-appropriate source exists, add:

- landing-page sessions;
- pages/session or navigation depth;
- outbound/tool handoffs;
- engagement time;
- return-user trend.

These are supporting metrics, not prerequisites for the first GSC/AdSense model.

## 4. Opportunity model

Every roadmap candidate should be classified into one of four commercial jobs.

### A. Defend and expand proven traffic

Existing high-impression queries/routes where ranking or CTR can realistically improve.

Typical actions:

- better title/snippet alignment;
- better task satisfaction;
- stronger supporting internal links;
- useful examples/FAQ;
- performance and mobile improvement;
- cannibalization prevention.

This category generally receives the highest priority because it works with demonstrated demand.

### B. Near-win expansion

Queries already receiving meaningful impressions around positions roughly 4–20.

These are candidates for focused page improvements or distinct pages only when intent is genuinely different.

Do not create a new URL merely because a query variation exists.

### C. Adjacent useful search surfaces

New guides/tools justified by recurring query clusters and a clear user job, especially where they can naturally lead into another useful WriteUrdu page.

Examples must come from actual Search Console evidence before promotion to P1.

### D. Product-quality / retention work

Work that may not create a new landing page but improves repeat use, second-page navigation, successful task completion or ad-safe session depth.

Examples include better tool handoffs, mobile ergonomics, and faster loading.

## 5. Revenue opportunity scoring

Use measured data where available rather than a vanity SEO score.

For an existing query/page opportunity, estimate:

`incremental organic clicks = impressions × (target CTR - current CTR)`

Then estimate:

`incremental monetizable pageviews = incremental clicks × expected useful pages per visit`

Then:

`incremental revenue ≈ incremental monetizable pageviews × relevant page RPM / 1000`

This is a directional prioritization model, not a revenue promise.

When page-level RPM is unavailable, use a conservative observed RPM for the closest page/country/device group and label the estimate low-confidence.

### Priority factors

Each candidate should record:

- current impressions;
- current clicks/CTR/position;
- ranking URL;
- query intent;
- country/device mix;
- observed or proxy page RPM;
- estimated CTR/ranking upside;
- ability to create a useful second pageview;
- implementation effort;
- SEO/cannibalization risk;
- UX/performance risk;
- evidence confidence.

## 6. Roadmap implications

Until the first full baseline is completed:

- continue low-risk authority, monetization-normalization and completion work already justified by repository evidence;
- do not create major new tools solely because they are interesting;
- do not publish the SEO content backlog in bulk;
- do not repeatedly rewrite the homepage title while the current experiment is unmeasured;
- do not assume every v2 migration has equal commercial priority.

After the baseline, reorder V2-S3/S4/S5 and content work according to measured opportunity.

A visually unfinished low-traffic tool may rank below a high-impression guide or page with a clear CTR/ranking opportunity. Conversely, a product feature that significantly improves repeat usage or useful page depth may outrank a content page even if direct query volume is modest.

## 7. Ad placement strategy

The page-type implementation contract is defined in `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`.

### Writing/editor surfaces

- Keep the active writing area and immediate controls ad-light.
- Do not insert ads between a label/instruction and its writing control.
- Avoid layout shift during ad loading.
- Prefer placements after task completion, supporting guidance, or natural section boundaries.
- Do not default to a universal post-header ad on core writing routes.

### Guide/content surfaces

- These can support more conventional in-content inventory, but reading quality and Core Web Vitals remain release gates.
- Long-form content should be useful enough to justify its length independently of advertising.
- Show the page answer/lede before the first monetization unit.
- Test side rails, anchors or end-of-content formats rather than enabling them site-wide without evidence.

### Creation/business tools

- Treat the workspace as primary.
- Monetize around supporting sections or natural transitions rather than inside dense control clusters.
- Keep ads distinct from templates, result cards, export/share buttons and other selectable product UI.

### Trust/utility pages

- Privacy, feedback, search and sitemap pages do not need to maximize RPM.

## 8. Search Console analysis outputs

The first full review must produce:

1. Top 50 query opportunities by impressions.
2. Top 25 near-win queries by realistic click upside.
3. Top pages by current organic clicks.
4. Pages with high impressions but weak CTR.
5. Pages ranking positions 4–10 with material impressions.
6. Pages ranking positions 11–20 with strong relevance.
7. Query cannibalization pairs where multiple WriteUrdu URLs compete.
8. Device-specific CTR gaps.
9. Country-level traffic concentration and monetization differences.
10. Query clusters that justify a new or substantially improved product/content surface.

Each finding must map to one of:

- defend;
- improve;
- consolidate;
- create;
- observe;
- reject.

## 9. AdSense analysis outputs

The first commercial review must produce:

1. Current monthly/weekly earnings baseline.
2. Overall page RPM trend.
3. Country/device RPM differences where volume supports interpretation.
4. Highest-value page groups or placements where measurable.
5. High-traffic but low-RPM surfaces.
6. High-RPM but low-traffic surfaces that may justify acquisition investment.
7. Ad placements causing UX, CLS or task-flow concerns.
8. A conservative revenue-impact estimate for the top search opportunities.
9. Top-pages / Page URL breakdown for strategic routes where available.
10. Ad-format and placement-method comparison for manual vs automatic inventory.

## 10. Backlog gate

After the baseline, every P0/P1 backlog item must include a **Commercial rationale** field with one of:

- protects proven organic revenue;
- increases clicks on proven impressions;
- expands a demonstrated query cluster;
- increases useful session depth/pageviews;
- improves page RPM without harming UX;
- required technical/quality infrastructure;
- no direct revenue case — strategic/maintenance only.

Items without an evidence-backed commercial rationale should normally remain P2/HOLD.

## 11. Acceptance criteria

`WU-GROWTH-001` reaches Implemented when:

- [ ] Full Search Console exports have been reviewed beyond the two current baseline queries.
- [ ] A comparable AdSense aggregate baseline has been reviewed.
- [ ] Query/page/country/device opportunities are documented.
- [ ] At least the top 10 roadmap candidates have a commercial rationale and confidence level.
- [ ] The canonical `specs/BACKLOG.md` has been reordered from evidence.
- [ ] Page types have explicit monetization rules and legacy duplicate placements are normalized.
- [ ] Ad placement guardrails are documented and checked on major v2 surfaces.
- [ ] URL/custom-channel measurement conventions are documented for strategic pages/placements.
- [ ] Weekly/monthly measurement cadence is defined.
- [ ] No raw sensitive advertising/user data is committed publicly.

## 12. Immediate execution sequence

### Growth Slice A — Page-type AdSense architecture + measurement baseline

Normalize current placements before increasing ad load:

- classify routes as Write / Learn / Create / Trust for monetization purposes;
- remove duplicate legacy units as pages migrate;
- replace universal content-page post-header placement with page-type-aware hooks;
- protect editor/canvas/action regions from in-page automatic placements;
- preserve the existing AdSense client and single-loader contract;
- establish URL/custom-channel naming and capture pre-change reports.

### Growth Slice B — Authority Opportunity Map

Obtain Search Console exports for Queries, Pages, Countries, Devices and Dates for a useful recent period, plus a comparable AdSense aggregate report with earnings/page RPM/pageviews by the dimensions available. Join query → route → page type → RPM/proxy RPM and rank defend / near-win / CTR / expansion / consolidation work.

### Growth Slice C — Existing-route SEO wins

Implement the highest-confidence changes on existing query owners before creating a new content family.

### Growth Slice D — First evidence-backed how-to cluster

Choose one strong adjacent cluster (for example WhatsApp, Word, Google Docs or punctuation/numerals) and publish only genuinely useful pages with reviewed examples and live product handoffs.

The detailed page ownership, AdSense format policy, experiment queue and release gates are maintained in `docs/WU-SEO-ADSENSE-AUTHORITY-PLAN-2026-08-11.md`.
