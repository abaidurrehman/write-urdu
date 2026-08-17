# WriteUrdu — AdSense Revenue Growth Plan — 17 Aug 2026

**Status:** Active experiment plan  
**Owner:** `WU-GROWTH-001`  
**Target:** materially increase daily AdSense revenue from the current baseline; raw revenue figures remain private and outside the public repository.

## 1. Principle

The objective is not to multiply ad count. The objective is to increase useful monetizable opportunities while protecting the writing task that creates repeat value.

WriteUrdu uses three monetization postures:

- **Write:** keep the active editor clean; retain the approved post-workspace unit.
- **Learn:** primary AdSense experimentation surface.
- **Create:** protect active tool workspaces; monetize after the task and around explanatory content.

Trust/privacy pages stay ad-free.

## 2. Measurement before interpretation

Revenue experiments must be read alongside:

- AdSense estimated earnings and page RPM;
- page/ad impressions;
- device and country;
- ad format / placement method;
- Product Pulse engagement, copy/export outcomes and handoffs;
- coarse acquisition source from `WU-ANALYTICS-003`;
- Search Console clicks/impressions for organic pages.

Do not infer site traffic from AdSense pageviews alone.

## 3. Experiment ladder

### A1 — Learn-page desktop side rails

Use AdSense Auto ads side rails on Learn pages where the reading layout supports them. Keep core Write routes excluded. Run this before adding more in-task inventory.

### A2 — Learn-page content-end Multiplex

Test Multiplex at the true end of useful long-form Learn content. This creates a second monetization opportunity after the user has received the answer rather than before it.

### A3 — Learn-page in-page banner load

Use Auto ads advanced banner controls to test a conservative additional in-page opportunity on sufficiently long Learn pages. Avoid short pages and keep the answer/lede ahead of the first ad.

### A4 — Ad intents, Learn pages only

After baseline A1–A3, test Ad intents on informational pages only. Start with the least disruptive combination and inspect the preview. Write and Trust surfaces are marked with `google-anno-skip`; Create workspaces are also protected so intent-driven formats cannot invade active creation controls.

### A5 — Vignettes on non-workflow navigation

Only after the earlier experiments are understood, test a conservative vignette frequency. Navigation, download anchors, in-page anchors and core product handoff links are marked `data-google-vignette="false"` so a vignette cannot interrupt those high-value transitions.

## 4. Code-side safety added before account-side expansion

`js/ads.js` owns reusable Auto-ads safety markers:

- `google-anno-skip` on Write/Trust surfaces and active Create workspaces;
- `google-side-rail-overlap="false"` around surfaces where side rails must not overlap the task;
- `data-google-vignette="false"` on navigation, downloads, in-page anchors and product handoff links.

These markers do not enable Auto ads by themselves. They make account-side experiments safer.

## 5. Operating sequence

1. Capture a clean 7-day post-restoration AdSense baseline.
2. Enable/test A1 side rails on Learn pages.
3. Keep the winner only if revenue improves without a meaningful product/CWV regression.
4. Test A2 Multiplex.
5. Test A3 banner load.
6. Test A4 Ad intents only after reviewing the AdSense preview page-by-page.
7. Test A5 vignettes last and conservatively.
8. Re-rank SEO/content work using page RPM plus real acquisition/engagement evidence.

Change one major monetization variable at a time unless AdSense itself is running a controlled Auto-ads experiment.

## 6. Internal win/kill guardrails

A revenue change is not a win if it materially damages:

- editor engagement;
- copy/export completion;
- useful product handoffs;
- mobile task usability;
- Core Web Vitals/layout stability;
- organic search performance on important pages.

Never place ads so they can be mistaken for Copy, Export, Download, template choices, navigation or product controls.

## 7. What should drive the path to the revenue target

The target should be reached through a portfolio of gains rather than one aggressive placement:

- better monetization of existing Learn pageviews;
- desktop side-rail inventory where space exists;
- post-content inventory such as Multiplex;
- controlled intent-driven formats on informational content;
- selective overlay inventory that never interrupts core workflow transitions;
- SEO growth on pages with demonstrated user value and monetization potential;
- more useful internal journeys from Learn → Write/Create and Write → next useful tool.

The active editor remains protected. If reaching the target requires turning the writing surface into an ad surface, the experiment has failed the product strategy.
