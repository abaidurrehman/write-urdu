# WriteUrdu — AdSense Operating Contract

**Status:** Active implementation support for GROWTH-A1  
**Runtime source:** `js/ads.js`  
**Commercial strategy:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`

This file records the AdSense account/reporting setup that cannot safely be invented in source code. It does not replace the canonical backlog.

## 1. Runtime page types

`js/ads.js` classifies every route in `docs/WU-PUBLIC-PAGE-REGISTRY.csv` into one monetization posture:

- **Write** — `/`, `/urdu-editor`, `/urdu-keyboard`; no shared in-task unit. A future manual unit requires an explicit `data-wu-ad-boundary="post-workspace"` boundary.
- **Learn** — guides/reference/help pages; shared responsive unit is moved from the old post-header location to the first useful answer/content boundary and labelled internally as `guide_after_answer`.
- **Create** — design/business tools; shared responsive unit is moved after a safe workspace boundary where one exists and labelled internally as `tool_post_workspace`.
- **Trust** — Privacy, Feedback, Search, Sitemap and About/Why; runtime advertising is removed.

The runtime adds `data-wu-monetization-type` to `<body>` and `data-wu-ad-placement` / `data-wu-ad-page-type` to managed slots. These attributes are internal diagnostics only; they do not send user content anywhere.

## 2. Legacy normalization

`/english-urdu-typing-tutorial` previously contained repeated manual right-rail units while also receiving the shared shell unit. GROWTH-A1 retires those repeated legacy units at runtime before AdSense initialization and expands the article out of the empty Bootstrap side rail.

The source-level legacy markup should be removed when V2-S3 makes the final keep/narrow/merge/redirect decision for that route. Runtime cleanup prevents duplicate serving in the meantime without coupling the monetization slice to the SEO consolidation decision.

## 3. AdSense custom channels to create

Create these channels in the AdSense publisher account before adding any `data-ad-channel` values to source:

| Channel name | Runtime placement | Purpose |
| --- | --- | --- |
| `guide_after_answer` | Learn shared unit | Baseline guide placement |
| `guide_mid_content` | Future experiment | Long-guide second unit only |
| `guide_content_end` | Future experiment | Long-guide end placement / Multiplex candidate |
| `tool_post_workspace` | Create shared unit | Post-workspace tool monetization |
| `tool_content_end` | Future experiment | Tool explanatory-content end |
| `write_post_workspace` | Future explicit boundary only | Conservative core-writing experiment |

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

## 6. Baseline report before experiments

Capture one comparable baseline period before the first new ad-format or ad-load experiment. Keep raw revenue exports private; only aggregated findings belong in the public repository.

Record:

- estimated earnings;
- page RPM;
- pageviews and ad impressions;
- device/platform;
- country;
- top pages / URL channels;
- manual placement/custom channel where available;
- dates and any major site changes during the period.

The first experiment should compare the old guide post-header placement with `guide_after_answer`, not add a second variable at the same time.

## 7. Release guardrails

Do not ship or call an experiment a win if it causes any of the following:

- ads inside the active editor/canvas/result/action region;
- ads close enough to Copy, Export, Download, template choices or navigation to create confusion;
- visible layout shift around the primary task;
- a material mobile usability regression;
- a material organic click/CTR/ranking regression attributable to the change;
- weaker task completion or high-value product handoff that outweighs the revenue gain.

Only the labels **Advertisement** or **Sponsored Links** may be used if a publisher-supplied label is shown above a Google ad.
