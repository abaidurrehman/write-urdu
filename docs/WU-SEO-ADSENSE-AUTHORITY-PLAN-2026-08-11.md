# WriteUrdu — SEO-backed AdSense Authority Plan

**Date:** 2026-08-11  
**Status:** Active supporting plan  
**Roadmap owner:** `specs/BACKLOG.md`  
**Commercial strategy owner:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`

This document is evidence and execution guidance. It does **not** replace the canonical backlog.

## 1. Executive decision

WriteUrdu should be run as a mature organic-search asset whose commercial engine is Google AdSense.

The growth model is not “publish more pages and add more ads.” It is:

1. protect the search authority already earned by a 10+ year domain;
2. improve CTR/rank/task satisfaction on proven Urdu-writing demand;
3. expand only into adjacent Urdu-writing jobs with distinct intent;
4. create useful second-page journeys into editors, creation tools and guides;
5. monetize page types differently so ads never compete with the core task;
6. measure route-level search value and route/placement-level AdSense value before scaling.

The product equation is:

`organic revenue = qualified organic entrances × useful pageviews per entrance × monetizable-view rate × page RPM / 1000`

The roadmap should improve this equation without manufacturing pageviews or weakening the writing experience.

## 2. New findings that change the plan

### 2.1 Current search position is an authority-capture problem

The repository already records meaningful Search Console exposure for the homepage:

- `urdu typing`: 7,162 impressions, average position 7.21, CTR 1.79%;
- `urdu writing`: 3,705 impressions, average position 6.48, CTR 1.30%.

Those are not “new site” signals. They are near-win signals on a mature domain. The first growth job is to turn existing impressions into more clicks while preserving the homepage as the broad transactional owner.

A current qualitative SERP review also shows strong competition around four recurring patterns:

- phonetic/direct Urdu keyboard tools;
- Roman Urdu → Urdu typing;
- typing practice/test products;
- social/stylish Urdu creation tools.

WriteUrdu already spans writing, rich editing, direct keyboard input, cards/templates, stylish text/name art and supporting guides. Its strategic advantage should therefore be the **integrated Urdu writing journey**, not cloning every competitor page.

### 2.2 Current monetization architecture is inconsistent

Repository inspection found:

- the homepage intentionally disables a legacy workspace-side ad;
- `site-header.js` injects a responsive AdSense unit immediately after the shared header on most `content-page` routes;
- Card Studio and QR Generator are excluded from that shared header unit;
- legacy pages can still contain their own manual units in addition to the shared unit;
- the typing tutorial currently contains two repeated right-panel units using the same slot ID while also becoming a shared `content-page` at runtime.

This means the first monetization task is **normalization**, not increasing raw ad count. We need page-type-aware placement rules and a clean baseline before testing additional formats.

### 2.3 Google guidance reinforces the same direction

Current Google Search guidance rewards people-first content and an overall good page experience, explicitly including avoiding excessive ads that distract from or interfere with primary content. Google recommends good Core Web Vitals and currently defines “good” as LCP ≤ 2.5s, INP < 200ms and CLS < 0.1.

Current AdSense guidance emphasizes placing ads without getting in the user’s way, preventing accidental clicks, keeping ads distinct from navigation/download controls, and using experiments rather than assuming a layout will perform better.

Important current-product note: **Related search for Auto ads was discontinued on 2026-08-06**, so it must not appear in the forward plan.

## 3. Strategic rules

1. The homepage remains the broad owner for transactional `urdu typing` / `urdu writing` demand unless Search Console proves otherwise.
2. One distinct intent = one primary route. Do not create doorway variants for synonyms.
3. Existing ranking pages are improved before new pages are invented.
4. New content must answer a real Urdu-writing job and hand off naturally to a live WriteUrdu tool.
5. Active editors/canvases/control regions are protected from automatic in-page ad insertion.
6. Guide/reference pages carry the highest monetization load because reading is the task.
7. Creation tools monetize after or around the workspace, never between input and result controls.
8. Trust/legal/feedback pages do not need to maximize RPM.
9. AdSense configuration changes are experiments with explicit UX/search guardrails.
10. Revenue growth that harms task completion, Core Web Vitals, search clicks or user trust is rejected.

## 4. Search intent ownership map

This is the default ownership model. Search Console data can change it, but pages should not compete casually.

| Route | Primary intent owner | Role | Action |
| --- | --- | --- | --- |
| `/` | Urdu typing online; Urdu writing online; transactional Roman Urdu typing | Primary acquisition + writing tool | Defend / improve |
| `/urdu-keyboard` | Urdu keyboard online; direct Urdu keyboard | Distinct input job | Defend / improve |
| `/urdu-editor` | Urdu text editor; rich Urdu editor; format Urdu text | Advanced writing job | Improve |
| `/roman-urdu-transliteration` | What Roman Urdu transliteration is; transliteration vs translation; spelling guidance | Informational authority | Improve + handoff to `/` |
| `/urdu-alphabet` | Urdu alphabet / Urdu letters reference | Evergreen learning entry | Improve + handoff to keyboard |
| `/urdu-fonts-nastaliq-vs-naskh` | Nastaliq vs Naskh / Urdu font readability | Typography authority | Migrate + improve |
| `/stylish-urdu-text-generator` | Stylish Urdu text / copyable decorated Urdu | Creation search destination | Validate + invest if evidence |
| `/urdu-name-art-maker` | Urdu name art image maker | Distinct image job | Validate |
| `/urdu-card-studio` | Urdu card / poetry card maker | Creation destination | Validate / strengthen |
| `/urdu-templates` | Urdu card/design templates | Creation discovery | Strengthen handoff |
| `/urdu-whatsapp-status-maker` | Urdu WhatsApp status maker | Social creation | Validate |
| `/urdu-instagram-post-maker` | Urdu Instagram post maker | Social creation | Validate |
| `/urdu-invoice-generator` | Urdu invoice generator | Business workflow | Measure before further investment |
| `/qr-code-generator` | Static QR creation including Urdu text | Supporting utility | Maintain; not a core authority cluster unless evidence appears |

### Overlap decisions

- `/english-urdu-typing-tutorial` should not own the same broad transactional intent as `/` or the Roman Urdu guide. Keep only if it can own a distinct tutorial/video/how-to job; otherwise merge/redirect.
- `write-urdu-features` and `urdu-editor-features` should not survive as generic SEO landing pages if Documentation/editor pages satisfy the same intent better.

## 5. SEO opportunity tiers

### Tier A — Improve proven owners first

These should receive effort before speculative content:

1. **Homepage — `urdu typing` / `urdu writing`**
   - preserve current broad query ownership;
   - improve the first-screen explanation and snippet alignment based on Search Console query language;
   - keep the typing task immediately available;
   - strengthen contextual paths to keyboard, rich editor and creation tools;
   - do not repeatedly change the title while the latest title experiment is unmeasured.

2. **Urdu Keyboard**
   - clearly differentiate direct/native input from Roman Urdu transliteration;
   - include a useful keyboard/reference explanation below the task;
   - link to Alphabet and Roman Urdu only where the user intent warrants it.

3. **Roman Urdu guide**
   - become the definitive explanation of transliteration versus translation;
   - include reviewed examples and common spelling ambiguity;
   - route transactional users directly into `/`.

4. **Urdu Alphabet**
   - strengthen as a complete reference rather than a thin support page;
   - connect letters/typing guidance directly into the keyboard tool.

5. **Urdu fonts guide**
   - finish v2 migration;
   - own the readability/usage comparison rather than competing with font-download sites.

### Tier B — Build monetizable how-to content around real jobs

These are strong candidates because the user job is clear, the content can be genuinely useful, and each page naturally hands off into an existing tool:

1. How to type Urdu in WhatsApp.
2. How to type Urdu in Microsoft Word.
3. How to type Urdu in Google Docs.
4. Urdu punctuation, numerals and RTL writing direction — start as one authoritative guide unless Search Console proves separate intents.
5. Common Roman Urdu phrases / alternate spellings with reviewed Urdu output.
6. How to create an Urdu WhatsApp status / poetry card using Card Studio.

Promotion gate for every page:

- query evidence from Search Console or external query research;
- distinct intent from existing routes;
- original reviewed Urdu examples/screenshots;
- immediate answer near the top;
- a real product handoff;
- enough standalone value that the page deserves to exist without ads.

### Tier C — Product candidates, evidence required

#### Urdu typing practice / typing test

A current SERP sample shows dedicated typing-practice/test products targeting exam and skills intent. This is distinct from WriteUrdu’s current transliteration/editor job and could create repeat sessions.

Do **not** build it from SERP observation alone. First check Search Console for typing-practice/test impressions and perform explicit query research. If evidence is strong, create a separate product spec with WPM/accuracy/lesson requirements rather than forcing the intent into the existing editor.

#### Expanded stylish Urdu/name/status cluster

Current SERPs contain multiple multilingual stylish-name generators, so the opportunity exists but competition is active. Invest only if `/stylish-urdu-text-generator`, Name Art or social-maker pages begin earning impressions/clicks. The product should differentiate on correct Urdu handling and exact-image output, not merely “hundreds of fonts.”

## 6. Internal authority distribution

Treat internal linking as product navigation and search architecture at the same time.

### Required journeys

- `/` → `/urdu-editor` when the next job is formatting.
- `/` → `/urdu-keyboard` when the user wants direct Urdu input.
- `/` → Card Studio / Stylish Text / Name Art when the next job is visual creation.
- Roman Urdu guide → `/` with explicit “type this now” examples.
- Alphabet → Keyboard.
- Font guide → Rich Editor / Card Studio where font choice becomes actionable.
- WhatsApp/Word/Docs guides → the exact editor/keyboard workflow used in the instructions.
- Card Studio ↔ Templates.
- Stylish Text → Name Art for exact font appearance.

### Link rules

- use crawlable `<a href>` links for primary journeys;
- use concise descriptive anchor text;
- avoid generic “click here” clusters;
- keep links contextual rather than creating large SEO-only blocks;
- measure only high-value handoffs, not every navigation click.

## 7. AdSense page-type architecture

### Page type A — Core writing surfaces

Routes: `/`, `/urdu-editor`, `/urdu-keyboard`.

**Monetization posture: conservative.** These pages acquire the core search demand and must optimize task completion first.

Allowed:

- no ad before or inside the active writing workspace;
- one responsive/manual unit after the primary workspace or after a genuine supporting section;
- optional content-end unit if the page has substantial guidance;
- desktop side-rail or anchor only as a later controlled experiment if it does not cover controls/content.

Not allowed by product policy:

- ads between input-mode controls and textarea;
- ads beside Copy/Export/Download buttons;
- ads that shift the writing surface;
- vignette as the default for core task transitions.

### Page type B — Learn / guide / reference pages

Routes: Roman Urdu, Alphabet, Fonts, future WhatsApp/Word/Docs/punctuation guides.

**Monetization posture: strongest.** Reading is the task, so these pages are the safest place to improve RPM.

Default placement model:

1. H1 + answer/lede + first useful section;
2. first responsive in-page unit;
3. article content;
4. optional second in-page unit only on sufficiently long pages;
5. contextual related-tools module;
6. optional Multiplex unit at the true end of content.

Experiments:

- desktop side rails;
- bottom anchor on guide pages;
- Multiplex end-of-content;
- moderate Auto ads in-page load using minimum-distance controls.

Do not place an ad immediately after the global header before the user sees the page answer.

### Page type C — Creation / business tools

Routes: Card Studio, Templates, Stylish Text, Name Art, social makers, Invoice, QR.

**Monetization posture: medium.** The workspace/result is primary.

Allowed:

- one unit after the active workspace/result area;
- one content-end unit where useful explanatory content exists;
- side rail on wide desktop only if it does not compress the workspace.

Do not insert ads inside template grids, result grids or near export/share buttons where ads could be mistaken for selectable content or actions.

### Page type D — Trust / utility

Routes: Privacy, Feedback, internal Search, human Sitemap, potentially About.

**Monetization posture: none or minimal.** These pages exist for trust/navigation, not RPM.

## 8. Immediate ad architecture cleanup

Before adding formats:

1. Replace the universal “content page → ad immediately after header” rule with page-type-aware placement.
2. Remove duplicate legacy manual units on pages migrated into the shared shell.
3. Protect stable editor/canvas/control containers as Auto-ads excluded areas.
4. Reserve ad container space where practical to reduce layout shift.
5. Keep ad labels policy-safe (`Advertisement` or `Sponsored Links` only if labels are used).
6. Ensure ads cannot visually resemble navigation, templates, downloads or tool actions.
7. Ensure `js/ads.js` remains a single-loader and no page initializes the same slot redundantly.

The old tutorial is the first cleanup candidate because it currently combines legacy manual units with shared content-page monetization.

## 9. AdSense format policy for WriteUrdu

### In-page banner

**Default format.** Use controlled placements on guides and after tool workspaces.

### Side rail

**Experiment on wide desktop guide pages.** It can add inventory without occupying the central reading/task column. Reject if the page becomes visually cramped.

### Anchor ads

**Experiment, not default.** Start on guide/reference pages. Do not automatically extend to core editors.

### Vignette ads

**Hold until the basic placement system is stable.** Full-screen transition ads can disrupt product handoffs. If tested later, use AdSense experiments and conservative frequency; reject any configuration that damages task journeys or user trust.

### Multiplex

**End-of-content experiment on long guides only.** Never place it where users could confuse it with WriteUrdu templates, related tools or search results.

### Ad intents

**Hold.** They insert monetized links/anchors/chips into content. WriteUrdu’s own contextual internal navigation is strategically more important, and we should not let an ad format compete with it until page-level economics are understood.

### Related search for Auto ads

**Do not plan or implement.** Google discontinued this Auto ads format on 2026-08-06.

## 10. Measurement architecture

### Search Console scorecard

For 28-day, 3-month and comparison periods capture:

- query;
- landing page;
- clicks;
- impressions;
- CTR;
- average position;
- country;
- device;
- date trend.

Classify every meaningful query/page into:

- defend;
- near-win;
- CTR opportunity;
- consolidate;
- expand;
- observe;
- reject.

### AdSense scorecard

Capture:

- estimated earnings;
- page RPM;
- pageviews / ad impressions;
- ad format;
- placement method;
- platform/device;
- country;
- top page / Page URL breakdown where available.

Use **URL channels** for strategic routes/page groups and **custom channels** for manual placement families so we can distinguish “which page earns” from “which placement earns.”

Suggested URL-channel groups:

- `WU_HOME` — `/`;
- `WU_WRITE` — `/`, `/urdu-editor`, `/urdu-keyboard` as individually tracked routes;
- `WU_LEARN_ROMAN`;
- `WU_LEARN_ALPHABET`;
- `WU_LEARN_FONTS`;
- `WU_CREATE_CARD`;
- `WU_CREATE_STYLISH`;
- `WU_CREATE_NAME_ART`;
- `WU_CREATE_SOCIAL`;
- `WU_BUSINESS_INVOICE`;
- new how-to pages individually once launched.

Suggested custom channels for manual units:

- `guide_after_answer`;
- `guide_mid_content`;
- `guide_content_end`;
- `tool_post_workspace`;
- `tool_content_end`.

### Product/navigation scorecard

Where privacy-appropriate measurement exists, record:

- editor start / first meaningful typing action;
- copy/export completion;
- high-value internal handoff;
- second-page rate from organic entrances;
- return-use trend.

Never send user-entered text, names, invoice data or generated content to analytics.

## 11. Experiment discipline

AdSense supports traffic-split experiments. Use them instead of changing multiple monetization variables at once.

Rules:

1. one major monetization variable per experiment;
2. define primary revenue metric and UX/search guardrails before launch;
3. do not auto-apply winners initially — review results manually;
4. annotate meaningful site/SEO changes so revenue shifts are not misattributed;
5. do not run a title/snippet experiment and major ad-layout experiment on the same high-value route unless attribution remains clear.

### Initial experiment queue

1. **Guide placement:** current post-header ad vs ad after answer/first useful section.
2. **Guide side rail:** control vs desktop side rail.
3. **Guide end unit:** control vs Multiplex at true content end.
4. **Guide mobile anchor:** control vs bottom anchor.
5. **Homepage post-workspace unit:** no in-task ad; test one unit after the writing workspace/support boundary.

Vignettes and Ad intents are not in the first experiment queue.

## 12. Search + revenue opportunity model

For each candidate:

`search upside = current impressions × realistic CTR/rank improvement`

`commercial upside = incremental organic entrances × expected useful pageviews per entrance × relevant page RPM / 1000`

Then evaluate:

- authority fit;
- distinct intent;
- product usefulness;
- second-page potential;
- observed/proxy RPM;
- implementation effort;
- cannibalization risk;
- performance/UX risk;
- evidence confidence.

Do not use a single vanity “SEO score.” A lower-volume guide with strong RPM and a natural tool handoff may beat a broad low-intent page; a high-impression core query can beat both even with lower RPM because the acquisition upside is large.

## 13. Execution sequence

### Growth Slice A — Monetization normalization + instrumentation (P0)

- define route → page-type mapping;
- remove/retire duplicate legacy units on migrated pages;
- replace universal post-header placement with page-type-aware slots;
- protect task/workspace areas;
- establish URL/custom-channel naming;
- record baseline AdSense reports before material placement changes;
- add regression checks for prohibited ad adjacency where feasible.

**Why first:** current placement inconsistency makes revenue data harder to interpret and can create unnecessary UX risk.

### Growth Slice B — Authority Opportunity Map (P0)

- ingest complete GSC exports;
- ingest comparable aggregate AdSense data;
- map query → route → page type → RPM/proxy RPM;
- rank top defend / near-win / CTR / expansion / consolidation opportunities;
- update `specs/BACKLOG.md` with evidence.

### Growth Slice C — Existing-owner SEO wins (P0/P1)

Optimize the highest-value existing routes first, likely beginning with homepage, Keyboard, Roman Urdu, Alphabet and Fonts subject to the Authority Opportunity Map.

### Growth Slice D — First high-intent content cluster (P1)

Select **one** cluster from WhatsApp / Word / Google Docs / punctuation+numerals based on query evidence. Build 1–3 strong pages, not a bulk content farm. Each page must include tested steps, screenshots/examples and a live tool handoff.

### Growth Slice E — Creation-search investment (P1)

Use GSC evidence to choose which of Stylish Text, Name Art, Card Studio/Templates or social makers deserves focused search content and v2 investment.

### Growth Slice F — Controlled AdSense expansion (P1)

Scale only placements/formats that win experiments without crossing UX/search guardrails.

## 14. Release gates

A monetization/SEO change does not ship as a “win” merely because RPM rises.

Protect:

- Core Web Vitals: LCP ≤ 2.5s, INP < 200ms, CLS < 0.1 at the 75th percentile where field data is available;
- no ad-induced layout shift around primary tasks;
- no ad adjacency that risks accidental clicks near navigation/download/export controls;
- no regression in transliteration/editor behavior;
- no material loss of organic clicks/CTR/position attributable to the change;
- no decline in the primary task or high-value internal handoff that outweighs revenue gains.

## 15. Things we explicitly will not do

- keyword doorway pages for `urdu typing`, `urdu writing`, `online urdu typing`, etc.;
- bulk AI-generated Urdu content;
- pagination created only to generate impressions;
- ads inside active editor/canvas/result controls;
- misleading ad labels or ads styled like tool/template cards;
- a site-wide “maximum ad load” rollout without page-type controls;
- a new generic tool unrelated to the Urdu-writing authority cluster solely for pageviews;
- build around Related search for Auto ads, because the format has been discontinued;
- chase RPM while ignoring country/device mix and query quality.

## 16. Current recommended next implementation PR

**`GROWTH-A1 — Page-type AdSense architecture + measurement baseline`**

Scope should stay narrow:

1. classify public routes into Write / Learn / Create / Trust monetization groups;
2. stop using one universal content-page header placement;
3. remove duplicated legacy units from the first migrated legacy page(s), beginning with the typing tutorial during its V2-S3 overlap decision;
4. create stable placement hooks after answer/workspace/content boundaries;
5. preserve the existing AdSense client and single-loader behavior;
6. add tests that prevent ads from entering core editor/canvas/action regions;
7. document the AdSense URL/custom channels to create in the account;
8. validate layout at desktop + 320px mobile and check CWV/CLS risk in preview.

This can be executed while the full Search Console + AdSense opportunity map is assembled; it is low-risk infrastructure that improves both UX and commercial measurement.

## 17. Research references

Primary Google references used for this plan:

- Google Search Central — Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Central — Page experience: https://developers.google.com/search/docs/appearance/page-experience
- Google Search Central — Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google Search Central — Link best practices: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google Search Central — Snippets/meta descriptions: https://developers.google.com/search/docs/appearance/snippet
- Google AdSense — Ad placement policies: https://support.google.com/adsense/answer/1346295
- Google AdSense — Best practices for ad placement: https://support.google.com/adsense/answer/1282097
- Google AdSense — Auto ads settings / excluded areas / page exclusions: https://support.google.com/adsense/answer/9305577 , https://support.google.com/adsense/answer/12626543 , https://support.google.com/adsense/answer/9262311
- Google AdSense — Experiments: https://support.google.com/adsense/answer/6321879
- Google AdSense — URL channels and custom channels: https://support.google.com/adsense/answer/10075505 , https://support.google.com/adsense/answer/10078316
- Google AdSense — Ad formats / Top pages: https://support.google.com/adsense/answer/9974244 , https://support.google.com/adsense/answer/11988479
- Google AdSense — Related search for Auto ads discontinuation: https://support.google.com/adsense/answer/12999250

External SERP observations are qualitative discovery only and must not be treated as keyword-volume or ranking data. Search Console remains the source of truth for WriteUrdu’s own query performance.
