# WriteUrdu — AdSense Operating Contract

**Status:** Active implementation support for GROWTH-A1  
**Runtime source:** `js/ads.js`  
**Commercial strategy:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`

This file records the AdSense account/reporting setup that cannot safely be invented in source code. It does not replace the canonical backlog.

## 1. Runtime page types

`js/ads.js` classifies every route in `docs/WU-PUBLIC-PAGE-REGISTRY.csv` into one monetization posture:

- **Write** — `/`, `/urdu-editor`, `/urdu-keyboard`; one approved responsive unit after the active workspace, restored by PR #15 after the July 2026 serving regression. No ad is allowed inside or before the active writing task. The placement is labelled internally as `write_post_workspace`.
- **Learn** — guides/reference/help pages; shared responsive unit is moved from the old post-header location to the first useful answer/content boundary and labelled internally as `guide_after_answer`.
- **Create** — design/business tools; shared responsive unit is moved after a safe workspace boundary where one exists and labelled internally as `tool_post_workspace`.
- **Trust** — Privacy, Feedback, Search, Sitemap and About/Why; runtime advertising is removed.

The runtime adds `data-wu-monetization-type` to `<body>` and `data-wu-ad-placement` / `data-wu-ad-page-type` to managed slots. These attributes are internal diagnostics only; they do not send user content anywhere.

## 2. Legacy normalization

`/english-urdu-typing-tutorial` previously contained repeated manual right-rail units while also receiving the shared shell unit. GROWTH-A1 retires those repeated legacy units at runtime before AdSense initialization and expands the article out of the empty Bootstrap side rail.

The source-level legacy markup should be removed when V2-S3 makes the final keep/narrow/merge/redirect decision for that route. Runtime cleanup prevents duplicate serving in the meantime without coupling the monetization slice to the SEO consolidation decision.

The July 2026 monetization incident is now part of the permanent contract: removing the only approved post-workspace placement from core Write routes is a commercial behavior change and requires explicit review plus a comparable baseline. AdSense pageviews must never be used alone to infer site-traffic loss after ad-code or route-classification changes.

## 3. AdSense custom channels to create

Create these channels in the AdSense publisher account before adding any `data-ad-channel` values to source:

| Channel name | Runtime placement | Purpose |
| --- | --- | --- |
| `write_post_workspace` | Write shared unit | Conservative core-writing baseline |
| `guide_after_answer` | Learn shared unit | Baseline guide placement |
| `guide_mid_content` | Future experiment | Long-guide second unit only |
| `guide_content_end` | Future experiment | Long-guide end placement / Multiplex candidate |
| `tool_post_workspace` | Create shared unit | Post-workspace tool monetization |
| `tool_content_end` | Future experiment | Tool explanatory-content end |

After each channel exists, record its real numeric channel ID privately and add it to code only in a dedicated, reviewed monetization change. Never guess IDs.

## 4. URL reporting groups

Use AdSense URL channels / Top pages reporting to separate page economics from placement economics. Track at minimum:

- homepage `/`;
- `/urdu-editor`;
- `/urdu-keyboard`;
- `/roman-urdu-transliteration`;
- `/urdu-alphabet`;
- `/urdu-fonts-nastaliq-vs-naskh`;
- `/urdu-card-studio`;
- `/stylish-urdu-text-generator`;
- `/urdu-name-art-maker`;
- social-maker routes;
- `/urdu-invoice-generator`;
- each new high-intent guide individually once launched.

## 5. Auto ads account configuration

The code-level manual placement policy does not by itself stop Auto ads from choosing unsafe regions. In AdSense, configure the site so that Auto ads cannot compete with the product task.

### Page exclusions

Prefer Auto-ads page exclusions for:

- `/`;
- `/urdu-editor`;
- `/urdu-keyboard`;
- `/write-urdu-privacy`;
- `/write-urdu-feedback`;
- `/write-urdu-search`;
- `/write-urdu-sitemap`;
- `/why-write-urdu` while it remains primarily a trust/About surface.

Core Write routes still keep their explicit approved manual/shared post-workspace unit; excluding them from Auto ads prevents automatic formats from entering the task region.

### Excluded areas on tool pages

Use stable existing selectors in the AdSense preview where possible so in-page Auto ads cannot enter active workspaces, result grids or action regions. Candidate protected roots include:

- `[data-card-studio]`;
- `[data-invoice-generator]`;
- `[data-stylish-generator]`;
- `.name-art-workspace`;
- `.social-maker-workspace`;
- QR generator workspace/root;
- editor textarea/control regions.

Recheck exclusions after major DOM/shell migrations because selector changes can invalidate an account-side excluded area.

## 6. Production authorization and serving checks

Before treating a monetization baseline as trustworthy, verify the complete account/runtime chain:

- WriteUrdu is present and approved/ready in the AdSense Sites view;
- the production publisher/client ID matches the intended AdSense account;
- the AdSense loader initializes once per page;
- approved Write/Learn/Create placements actually request/serve ads when inventory and consent permit;
- no legacy duplicate units remain on migrated pages;
- protected editor/workspace/result/action areas remain ad-free;
- `/ads.txt` returns HTTP 200 at the production root;
- `ads.txt` contains the correct Google seller/publisher entry and relationship type;
- stale or unauthorized seller entries are removed;
- AdSense reports the `ads.txt` authorization state as healthy after normal processing time.

A missing visible ad in a spot check is not, by itself, evidence that AdSense is unimplemented. Diagnose account state, consent, inventory, route classification, runtime loading and placement eligibility before drawing that conclusion.

## 7. Baseline report before experiments

Capture one comparable baseline period before the first new ad-format or ad-load experiment. Keep raw revenue exports private; only aggregated findings belong in the public repository.

Record:

- estimated earnings;
- page RPM;
- pageviews and ad impressions;
- device/platform;
- country;
- top pages / URL channels;
- manual placement/custom channel where available;
- ad format / placement method where available;
- dates and any major site/ad-serving changes during the period.

For the current system, establish a clean post-PR-#15 baseline before interpreting core Write-route economics. Treat 12 July–11 August 2026 AdSense volume as structurally non-comparable with the earlier series unless reconciled with independent traffic data.

The first new format/load experiment should change one meaningful variable at a time. Learn pages are the default experiment surface before core editors.

## 8. Experiment queue

Run only after account-side channels/exclusions and the clean baseline exist:

1. Learn pages — `guide_after_answer` baseline versus a controlled alternative.
2. Learn pages — desktop side rail where the reading layout supports it.
3. Long Learn pages — Multiplex at the true content end.
4. Learn pages — mobile bottom anchor.
5. Core Write routes — only a tightly bounded placement/format change around the existing post-workspace boundary, never inside the task.

Hold initially:

- vignettes;
- Ad intents;
- site-wide maximum Auto ads load;
- additional in-task inventory on core editors.

Do not plan around Related search for Auto ads; it is discontinued.

## 9. Release guardrails

Do not ship or call an experiment a win if it causes any of the following:

- ads inside the active editor/canvas/result/action region;
- ads close enough to Copy, Export, Download, template choices or navigation to create confusion;
- visible layout shift around the primary task;
- a material mobile usability regression;
- a material organic click/CTR/ranking regression attributable to the change;
- weaker task completion or high-value product handoff that outweighs the revenue gain.

Only the labels **Advertisement** or **Sponsored Links** may be used if a publisher-supplied label is shown above a Google ad.

## 10. Strategy boundaries carried forward

The following are explicitly **not** default WriteUrdu monetization strategy:

- a universal banner above the core writing workspace;
- enabling every Auto ads format site-wide without page-type rules;
- a fixed arbitrary ad-unit-count target as the primary density rule;
- broad low-paying-category blocking as a generic RPM tactic;
- bulk content production solely to manufacture ad inventory;
- speculative RPM/pageview revenue projections used as roadmap evidence;
- unrelated tool expansion justified only by additional ad impressions.

External audits are hypothesis sources. The canonical backlog and `WU-GROWTH-001` remain the roadmap owners.
