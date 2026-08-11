# WriteUrdu — Agentic Product Review

**Date:** 2026-08-11  
**Scope:** Backlog grooming, status reconciliation, roadmap prioritization and product-strategy correction.  
**Authority:** Review record only. `specs/BACKLOG.md` remains the sole roadmap source of truth.

## Executive conclusion

WriteUrdu should be managed as a **mature organic product with accumulated authority**, not as a new-domain validation experiment.

The site already has query credibility, established URLs and a long operating history. The growth problem is that this authority has not been systematically converted into a coherent product/search portfolio. The next phase should therefore focus on **authority capture**: defending proven query ownership, expanding around adjacent Urdu-writing jobs, strengthening useful internal product journeys, completing existing tools, and consolidating overlapping pages.

## What was wrong with the backlog

1. **Strategy was too defensive.** The previous roadmap made the Search Console + AdSense baseline feel like a gate that could freeze product work. Data should rank opportunities, not block obvious low-risk compounding work.
2. **Implementation state was drifting.** `WU-SUA-001` was described as “Implementing” even though substantial production code and both routes already exist.
3. **Zombie specs existed.** `WU-SEO-001` remained “Planned” even though its requirements had been absorbed by later homepage/product and SEO authority work.
4. **Migration state and feature state were mixed.** A feature can be implemented while its visual v2 migration remains pending. Those are separate concerns.
5. **Too many ideas competed at the same level.** Creation tools, invoice work, content pages, SEO improvements and v2 migration were listed without a strong mature-domain decision framework.
6. **Existing authority was treated mainly as something to protect.** The roadmap did not explicitly make internal distribution, query clusters and authority expansion first-class growth work.

## Product thesis after grooming

The product flywheel should be:

**Established Urdu typing demand → successful writing task → contextual next tool/guide → useful second pageview → repeat use / stronger topic authority → more organic entrances → AdSense value.**

This is deliberately different from manufacturing pageviews. Every second action must be a plausible next user job.

## Priority framework

Every candidate should be judged on:

- existing search evidence;
- ability to defend or expand a real Urdu-writing query cluster;
- usefulness and differentiation;
- second-page/repeat-use potential;
- AdSense value without task degradation;
- cannibalization risk;
- implementation and maintenance cost;
- regression risk to transliteration and established URLs.

## Reconciled feature states

- `WU-GROWTH-001` — Active control plane.
- `WU-PLAT-001` — Implemented foundation.
- `WU-CS-UX-001/002` — Core implemented; v2 migration is separate follow-up work.
- `WU-SM-001` — Core implemented; v2 migration pending.
- `WU-SUA-001` — Core implemented; acceptance closure remains before v2 migration.
- `WU-IG-001/002/003` — Implemented; strategic value should be measured before investing in migration.
- `WU-SEO-001` — Superseded by later product/SEO work; retained only as historical context.

## Roadmap shape

### Now

- Build the full GSC + AdSense authority opportunity map.
- Close SEO-A1 production verification and recrawl work.
- Finish V2-S3 authority-page migration and resolve overlapping content intent.
- Close `WU-SUA-001` acceptance rather than redesigning it.
- Improve contextual internal journeys from writing demand into deeper tools/guides.

### Next

- Defend and expand high-impression near-win queries.
- Build coherent topic clusters around Urdu typing, Roman Urdu, keyboard/alphabet, fonts and Urdu creation jobs.
- Migrate creation tools to v2 based on usefulness/search evidence.
- Decide which creation tools deserve serious search investment.
- Review the WriteUrdu invoice route strategically before spending on migration.

### Later

- Finish v2 release closure.
- Run code/asset/performance cleanup weighted by traffic impact.
- Promote answer-ready content only when it has evidence and a clear standalone job.

## Explicitly deprioritized

- near-duplicate keyword doorway pages;
- unrelated generic tools;
- novelty AI translation/calligraphy work;
- account/cloud-storage architecture without demand;
- ad-density experiments inside active writing controls;
- deleting old URLs solely because they look redundant;
- large content publication batches without query evidence.

## Governance changes made in this review

- Rewrote the canonical backlog around mature-domain authority capture.
- Added a single status vocabulary so “implemented”, “migration pending” and “superseded” are no longer conflated.
- Reconciled the feature registry.
- Marked `WU-SEO-001` Superseded.
- Reclassified `WU-SUA-001` as core implemented / acceptance pending and recorded observed implementation evidence.
- Preserved `specs/BACKLOG.md` as the only priority source of truth.

## Next review trigger

Run another roadmap grooming pass after the first complete Authority Opportunity Map is available or after a material batch of v2/tool work merges—whichever changes the opportunity ordering first. Do not wait for an arbitrary calendar date if evidence clearly changes the queue.
