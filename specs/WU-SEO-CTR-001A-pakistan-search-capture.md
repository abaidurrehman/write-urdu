# WU-SEO-CTR-001A — Pakistan Search Capture

**Status:** Active child implementation spec — evidence locked to 2026-10-04 exports  
**Parent:** `WU-SEO-CTR-001-serp-intent-optimization.md`  
**Depends on:** implemented `WU-SEO-ETU-001`, current canonical/redirect system, current privacy-safe analytics  
**Primary market:** Pakistan  
**Primary routes:** `/`, `/roman-urdu-transliteration`, `/tools/inpage-unicode-converter`, `/urdu-keyboard`, `/urdu-typing-practice`  
**Area:** Search acquisition / intent ownership / existing-impression harvesting  
**Priority:** P0/P1

## 1. Purpose

Turn the October 2026 Search Console, Pakistan Keyword Planner, competitor, and product evidence into a small implementation program that captures more traffic from search demand Google is already exposing to Write Urdu.

This is **not** a broad SEO-content program and **not** a generic translation initiative.

The working diagnosis is:

1. Google already knows and ranks Write Urdu.
2. Pakistan is the dominant search market.
3. Several high-impression pages rank around positions 4–9 but convert impressions to clicks very poorly.
4. Some Write Urdu pages with clearer, narrower jobs already achieve materially stronger CTR at similar positions.
5. The highest-confidence opportunity is therefore to improve intent ownership, SERP promise, task completion on the ranking URL, and historical URL consolidation before creating many new pages or pursuing broad link building.

## 2. Why this child spec exists

The parent `WU-SEO-CTR-001` was correct to protect the homepage from keyword-clone pages and repeated metadata churn. New evidence now justifies one targeted amendment:

> `/roman-urdu-transliteration` must no longer remain guide-only. It has enough distinct Roman-Urdu/transliteration intent and enough existing Google exposure to become a real task page with a working Roman Urdu → Urdu interaction.

This child spec **does not** reopen homepage ownership for broad `english to urdu typing`.

It keeps the parent discipline:

- one canonical owner per user job;
- no keyword-clone routes;
- no repeated title/H1/canonical churn without measurement;
- tool-first acquisition pages;
- no semantic-translation product merely to chase `english to urdu` volume.

## 3. Evidence snapshot — 2026-10-04

The following values come from the supplied Search Console export and Pakistan-targeted Keyword Planner export. They are evidence for prioritization, not traffic guarantees.

### 3.1 Site-level signal

Latest 28 days versus preceding 28 days:

| Metric | Previous 28d | Latest 28d | Change |
| --- | ---: | ---: | ---: |
| Impressions | 221,081 | 358,529 | +62.2% |
| Clicks | 8,831 | 10,975 | +24.3% |
| CTR | 3.99% | 3.06% | down while discovery expanded |
| Avg. position | 7.15 | 6.34 | improved |

Interpretation: Google is exposing the domain to materially more queries while average position improves. Falling aggregate CTR must not be treated as proof of site-wide quality decline.

### 3.2 Pakistan dominance

Three-month export totals:

| Market | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| Pakistan | 20,217 | 515,526 | 3.92% | 6.36 |
| Total export | 25,626 | 690,234 | — | — |

Pakistan accounts for roughly **78.9% of clicks** and **74.7% of impressions** in the supplied export.

Implementation and QA must therefore treat Pakistani mobile users as the primary acquisition audience.

### 3.3 Device signal

| Device | Impressions | Clicks | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 421,010 | 11,651 | 2.77% | 6.34 |
| Desktop | 264,968 | 13,866 | 5.23% | 7.27 |

Mobile receives materially more impressions and a better average position, yet much lower CTR. This is an acquisition diagnostic, not proof that landing-page UX caused the CTR gap.

### 3.4 Highest-priority query/page opportunities

| Surface / query | Impressions | Clicks | CTR | Avg. position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `english to urdu typing` | 164,935 | 135 | 0.08% | 7.02 | homepage SERP/ownership investigation |
| `/roman-urdu-transliteration` | 45,493 | 120 | 0.26% | 6.73 | convert guide-first page into task-first tool |
| `/tools/inpage-unicode-converter` | 82,953 | 450 | 0.54% | 6.72 | align first intent with Unicode → InPage demand |
| `unicode to inpage` | 38,135 | 85 | 0.22% | 7.59 | stronger top-level framing |
| `inpage to unicode` | 16,062 | 155 | 0.97% | 4.33 | retain as prominent reverse mode |
| `urdu keyboard online` | 9,360 | 79 | 0.84% | 7.42 | strengthen direct-keyboard task/reference |
| `urdu keyboard` | 8,126 | 50 | 0.62% | 8.91 | same owner; no clone route |
| `/urdu-typing-practice` | 4,664 | 326 | 6.99% | 5.79 | preserve and extend; do not create `/urdu-typing-test` |
| stylish Urdu generator page | 35,367 | 3,459 | 9.78% | 5.18 | internal control: narrow task pages can convert well |

### 3.5 Pakistan Keyword Planner interpretation

The supplied Pakistan export uses coarse volume buckets. Treat these as relative demand signals, not exact obtainable traffic.

Important clusters include:

- `english to urdu typing` — 50k bucket;
- `urdu typing` — 50k bucket;
- `urdu keyboard` — 50k bucket;
- `unicode to inpage` — 50k bucket;
- `inpage to unicode` — 50k bucket;
- `urdu fonts` — 50k bucket;
- `urdu transliteration` — very large relative bucket;
- `urdu typing test` — 5k bucket.

Generic `english to urdu` volume must **not** be treated as addressable typing traffic because a large share is translation intent directly served by search engines and large translation products.

## 4. Governing decisions

### 4.1 Canonical intent ownership

| User job / query family | Canonical owner | Product role |
| --- | --- | --- |
| English to Urdu typing; Urdu typing online; type Urdu using English letters | `/` | broad live writing/transliteration entry |
| Roman Urdu to Urdu; Roman Urdu converter; Urdu transliteration; English-to-Urdu transliteration | `/roman-urdu-transliteration` | explicit Roman Urdu → Urdu conversion task |
| Urdu keyboard online; direct Urdu typing; physical/on-screen Urdu keyboard | `/urdu-keyboard` | direct-character keyboard task |
| Rich formatting/export | `/urdu-editor` | document editing task |
| Unicode to InPage; InPage to Unicode | `/tools/inpage-unicode-converter` | one bidirectional converter, no duplicate direction pages yet |
| Urdu typing practice; Urdu typing test; speed/WPM | `/urdu-typing-practice` | existing practice + test owner |
| Urdu stylish text | existing stylish-text route | preserve successful owner |
| Urdu cards | existing Card Studio/gallery owners | downstream creation workflow |

### 4.2 Explicit amendment to parent contract

The parent currently treats `/roman-urdu-transliteration` as supporting explanation only.

For implementation after this spec, that clause is superseded as follows:

- `/` remains the broad owner of `english to urdu typing`;
- `/roman-urdu-transliteration` becomes the distinct owner of **Roman Urdu → Urdu / transliteration** intent;
- the Roman page must contain an actual working task, not merely a guide linking back to `/`;
- copy and metadata must keep the two jobs distinguishable so this amendment does not create homepage cannibalization.

No new `/roman-urdu-to-urdu` route is allowed for this program.

### 4.3 Generic translation boundary

Do not build or optimize a generic English→Urdu semantic translator as part of this spec.

The product distinction must remain explicit:

- transliteration: `mera naam Ali hai` → `میرا نام علی ہے`;
- translation: English meaning → Urdu meaning.

The former is in scope. The latter is not a primary acquisition bet.

### 4.4 Existing-route-first rule

Do not create a new route when an existing ranking route already owns the user job and can be strengthened.

Specifically:

- no `/english-to-urdu-typing`;
- no `/urdu-typing`;
- no `/roman-urdu-to-urdu`;
- no `/urdu-typing-test`;
- no direction-specific InPage routes in the first implementation cycle;
- no thin font page before a real font-preview product exists.

## 5. P0 — Technical authority and ownership audit

**Goal:** verify that ten years of URL history feed the intended canonical routes instead of assuming infrastructure is broken or fixed.

The repository already contains canonical/legacy machinery, including `.htaccess`, `_redirects`, SEO generation/check scripts, route metadata, and existing CTR contract tests. Reuse and verify these systems rather than adding a parallel redirect layer.

### P0.1 Live hostname contract

Canonical host remains:

`https://write-urdu.com/`

Required verification:

- `http://write-urdu.com/*` → one permanent hop to HTTPS apex;
- `http://www.write-urdu.com/*` → one permanent hop to HTTPS apex equivalent;
- `https://www.write-urdu.com/*` → one permanent hop to HTTPS apex equivalent;
- canonical tags use apex URLs;
- sitemap uses apex URLs only;
- Open Graph/structured-data URLs use apex URLs;
- internal links do not introduce `www` variants.

Do **not** change redirect architecture merely because GSC still contains historical `www` impressions. First prove a live defect.

### P0.2 Legacy path audit

Audit priority historical patterns:

- `.html` variants;
- old editor/keyboard/tutorial URLs;
- trailing-slash variants where the platform treats them separately;
- obsolete parameters;
- known legacy pages still receiving GSC impressions.

Requirements:

- closest-equivalent 301 destination;
- no unrelated mass redirects to `/`;
- no redirect chains on priority URLs;
- canonical 200 URLs only in sitemap;
- preserve genuinely distinct legacy content only when it still has a unique user job.

### P0.3 Query ownership audit

For the priority clusters, record which Write Urdu page actually receives impressions.

The ownership artifact must include:

- query cluster;
- observed landing page(s);
- intended owner;
- conflicting title/H1/anchor language;
- remediation.

If GSC query×page export is unavailable, record that limitation rather than guessing.

### P0 acceptance

- [ ] Live apex redirect contract verified.
- [ ] No mixed-host canonical defect on priority pages.
- [ ] Priority legacy URLs resolve in at most one redirect.
- [ ] Priority query ownership map exists.
- [ ] No new keyword-clone route introduced.
- [ ] Existing SEO contract tests still pass.

## 6. P1-A — Roman Urdu task conversion

**Route:** `/roman-urdu-transliteration`  
**Priority:** P1  
**Effort:** M  
**Expected impact:** Very High  
**Primary evidence:** 45,493 impressions, 0.26% CTR, avg. position 6.73

### 6.1 Product job

The page must answer:

> I have Roman Urdu written with English/Latin letters. Convert it to Urdu script, let me review it, then let me continue using the result.

This is narrower than the homepage's general English-letter Urdu writing entry.

### 6.2 Required first-screen experience

- H1 clearly identifies the Roman Urdu conversion job.
- Working input/output interaction appears before long explanation.
- A user can type/paste Roman Urdu and obtain Urdu output without navigating back to `/`.
- Use the existing transliteration engine/provider; do not create a duplicate transliteration implementation.
- Initial failure/loading states must degrade gracefully to usable text input and clear retry guidance.

Recommended H1 direction:

`Roman Urdu to Urdu Converter`

Recommended title direction:

`Roman Urdu to Urdu Converter – Urdu Transliteration Online | WriteUrdu`

These are implementation directions; preserve title-length and existing SEO conventions.

### 6.3 Required examples

At least three concise, tested examples near the tool, including common spelling ambiguity.

Example shapes:

- `mera naam Ali hai` → Urdu script;
- `mera khayal hai` → Urdu script;
- one variant demonstrating alternative suggestion/review behavior.

Do not hard-code examples that the production transliteration engine cannot reproduce reliably.

### 6.4 Completion actions

After conversion, expose logical next steps without forcing sign-up:

- Copy;
- Continue editing;
- Open direct Urdu keyboard;
- Create a card when text exists;
- export/share only where the existing workflow already supports it safely.

### 6.5 Content requirements

Keep supporting copy concise and task-specific:

- Roman Urdu spelling variation;
- transliteration versus translation;
- mobile use;
- correcting suggestions;
- copy/use in WhatsApp, documents and cards.

Do not duplicate the homepage's full generic typing copy.

### 6.6 Route/system integration

The route is currently treated as a learning/content surface in parts of the shell/ads/navigation code. Moving it to tool-first behavior requires auditing at least:

- `roman-urdu-transliteration.html`;
- `js/v2-shell.js` route grouping;
- `js/ads.js` page classification;
- `js/seo.js` intent registry;
- `llms.txt` description;
- sitemap/static SEO generation where relevant;
- service-worker precache reference if behavior/assets change;
- continuity/handoff behavior to editor/Card Studio.

Do not place a disruptive ad inside the active conversion workspace.

### 6.7 Roman-page acceptance

- [ ] Conversion works on the page itself.
- [ ] `/` still owns broad English-to-Urdu typing language.
- [ ] Roman page title/H1 explicitly own Roman Urdu/transliteration intent.
- [ ] No duplicate transliteration engine introduced.
- [ ] Mobile first useful viewport contains the task, not a long article intro.
- [ ] Copy/editor next step works without sign-up.
- [ ] Translation distinction is accurate and non-promotional.
- [ ] Existing privacy rules are preserved.

## 7. P1-B — InPage demand alignment

**Route:** `/tools/inpage-unicode-converter`  
**Priority:** P1  
**Effort:** S–M  
**Expected impact:** High  
**Primary evidence:** page 82,953 impressions / 0.54% CTR; `unicode to inpage` has materially more impressions than `inpage to unicode`

### 7.1 Decision

Keep one bidirectional route in this cycle.

Lead the search/task framing with **Unicode → InPage**, while retaining an obvious reverse mode.

Do not create `/unicode-to-inpage` and `/inpage-to-unicode` pages yet.

### 7.2 Required UI

At the top of the converter, expose an explicit two-mode control:

- `Unicode to InPage`;
- `InPage to Unicode`.

Default to Unicode → InPage unless a fresh query/page export before implementation materially contradicts the 2026-10-04 evidence.

### 7.3 Metadata direction

Title direction:

`Unicode to InPage & InPage to Unicode Urdu Converter | WriteUrdu`

H1 direction:

`Unicode to InPage Urdu Converter`

The reverse direction must remain visible near the H1/tool so the page still satisfies its stronger-ranking InPage→Unicode audience.

### 7.4 Capability accuracy

Do not overclaim complete `.inp` file support if the implementation converts pasted text/encoding rather than full proprietary document structure.

State compatibility limits clearly.

The existing conversion core/package is the implementation owner. This spec must not duplicate mapping tables or fork conversion logic.

### 7.5 Completion flow

After conversion:

- copy result;
- download where already supported;
- open/edit Unicode result in the relevant editor when meaningful;
- show compatibility help only after the primary task.

### 7.6 InPage acceptance

- [ ] Unicode→InPage is an explicit primary mode.
- [ ] InPage→Unicode remains one action away and clearly visible.
- [ ] No second conversion implementation is created.
- [ ] Metadata reflects both directions without keyword stuffing.
- [ ] Compatibility wording matches actual capability.
- [ ] Existing package/API contracts remain intact.

## 8. P1-C — Homepage CTR investigation, not redesign

**Route:** `/`  
**Priority:** P1  
**Effort:** S per experiment  
**Expected impact:** Very High if CTR improves  
**Primary evidence:** `english to urdu typing` — 164,935 impressions, 0.08% CTR, avg. position 7.02

### 8.1 Do not reopen the core ownership decision

The homepage remains the broad owner for English-to-Urdu typing.

The September acquisition changes are already much clearer than the historical site. Do not perform another broad homepage rewrite merely because CTR is low.

### 8.2 Required investigation before another metadata change

Record:

- live title/description/H1/canonical;
- Google-selected title/snippet if observable;
- query landing page;
- country/device segment;
- whether `www` or a legacy URL is still appearing;
- competitor result wording for the same task where observable;
- date of observation.

### 8.3 Experiment discipline

Use the existing `docs/SEO-SERP-EXPERIMENTS.csv` process.

Change one primary SERP variable at a time where practical.

Do not combine:

- title rewrite;
- H1 rewrite;
- canonical change;
- major hero redesign;
- route ownership change

into one unmeasurable release.

### 8.4 CTR scenario guardrail

At fixed impressions, 164,935 impressions produce approximately:

| CTR | Clicks | Increment vs ~135 current clicks |
| ---: | ---: | ---: |
| 0.5% | 825 | +690 |
| 1.0% | 1,649 | +1,514 |
| 2.0% | 3,299 | +3,164 |

These are **scenario calculations, not forecasts**.

### 8.5 Homepage acceptance

- [ ] Broad English-to-Urdu typing ownership remains on `/`.
- [ ] No clone landing page created.
- [ ] Any metadata change has a recorded baseline and deployment date.
- [ ] Editor remains the primary first-screen product.
- [ ] Roman-page strengthening does not replace homepage acquisition wording.

## 9. P1-D — Mobile acquisition diagnostic

**Priority:** P1  
**Effort:** S–M  
**Expected impact:** High  
**Evidence:** mobile CTR 2.77% vs desktop 5.23% despite better mobile average position

Do not infer causality from this aggregate alone.

Required checks on `/`, Roman page, InPage page and keyboard page:

- search snippet truncation on common mobile SERP widths where observable;
- first useful content visible on small screens;
- editor/tool initialization time;
- layout shift around fonts/ads;
- input usable before enhancement finishes;
- no blocking overlay before first task;
- low-end Android viewport/slow-network smoke test.

Coordinate with existing mobile activation contracts. This spec owns **search acquisition diagnostics**, not a second broad mobile redesign.

## 10. P2 — Urdu keyboard strengthening

**Route:** `/urdu-keyboard`  
**Priority:** P2  
**Effort:** M  
**Expected impact:** High

### 10.1 Product boundary

The keyboard page must remain direct-character input, not become another Roman Urdu converter.

### 10.2 First implementation slice

Do **not** build four separate keyboard engines.

Reuse existing mappings and add a useful interactive reference around the current keyboard:

- physical key → Urdu character map;
- normal/Shift states where supported;
- concise explanation of phonetic/CRULP-style mapping;
- punctuation, numerals and common special characters;
- mobile/touch instructions;
- clear link to Roman Urdu conversion for users who actually want English-letter transliteration.

Only add full layout switching (Standard/CRULP/InPage/etc.) later if real query/usage evidence supports it.

### 10.3 Keyboard acceptance

- [ ] Direct Urdu typing remains the primary task.
- [ ] Interactive key reference is usable on mobile and desktop.
- [ ] Existing mapping source is reused.
- [ ] No duplicate keyboard engine added.
- [ ] Roman Urdu/transliteration links to its canonical owner instead of being explained as the keyboard's main function.

## 11. P2 — Preserve and strengthen typing practice

**Existing route:** `/urdu-typing-practice`  
**Decision:** do not create `/urdu-typing-test`.

The existing route already has strong behavior for its rank and contains lessons/speed-test capability. It should own:

- Urdu typing practice;
- Urdu typing test;
- Urdu typing speed test;
- WPM/accuracy intent.

Enhancement work may include clearer title/H1/test entry, but only after checking current query ownership and existing product contracts.

Pakistan job/exam-specific copy such as PPSC/FPSC must be evidence-backed and must not make stale or unverifiable claims about official requirements.

## 12. P3 — Urdu fonts product, evidence gated

**Candidate route:** `/urdu-fonts`  
**Do not ship as a thin article.**

A future surface becomes eligible only when it can provide a genuine product job:

`type/paste Urdu → preview across licensed/allowed fonts → choose → continue to editor/card workflow`

Minimum gate before implementation:

- font licensing/distribution review;
- source/provenance inventory;
- performance plan for font loading;
- useful preview filters/categories;
- clear integration with existing Card Studio/editor.

The existing Nastaliq-vs-Naskh article remains informational support and must not be repurposed into a fake font library.

## 13. Internal-link contract

Preferred ownership anchors:

- `English to Urdu typing` → `/`;
- `type Urdu with English letters` → `/`;
- `Roman Urdu to Urdu` → `/roman-urdu-transliteration`;
- `Urdu transliteration` → `/roman-urdu-transliteration`;
- `Urdu keyboard online` → `/urdu-keyboard`;
- `Urdu typing test` / `Urdu typing practice` → `/urdu-typing-practice`;
- `Unicode to InPage` / `InPage to Unicode` → `/tools/inpage-unicode-converter`;
- `Urdu Rich Text Editor` → `/urdu-editor`.

Supporting tutorials may target informational modifiers, but their title/H1/first paragraph must not impersonate the canonical task owner.

## 14. Measurement contract

### 14.1 Primary reporting cuts

For every P1 release, capture:

- query;
- page;
- clicks;
- impressions;
- CTR;
- average position;
- Pakistan versus non-Pakistan;
- mobile versus desktop;
- search appearance where available.

Use 28-day and 84-day comparison windows when enough post-release data exists.

### 14.2 Product-quality guardrails

Search CTR is not sufficient on its own.

Use existing privacy-safe telemetry where available to compare:

- tool start;
- successful conversion/input;
- copy;
- editor handoff;
- card handoff;
- export where applicable.

Never log raw typed Urdu/Roman Urdu text, user identity, IP address, full referrer/query string, or document contents for this initiative.

### 14.3 Release annotations

Every material title/H1/task-ownership change must record:

- deployment date;
- affected route;
- old value;
- new value;
- target cluster;
- baseline window;
- confounding product changes;
- keep/revert/follow-up decision.

## 15. Implementation sequence

### Slice A — Authority and ownership verification

1. Verify live host redirects/canonicals rather than assuming GSC historical variants mean a live defect.
2. Audit priority legacy paths and redirect chains.
3. Record query→page ownership for the P1 clusters.
4. Update the SEO intent registry/internal anchors only where evidence shows overlap.
5. Produce a dated October baseline artifact.

**No broad metadata rewrite in Slice A.**

### Slice B — Roman task conversion

1. Convert `/roman-urdu-transliteration` to a working task-first surface using the existing transliteration engine.
2. Update route classification/navigation/ads/SEO metadata/llms description as required.
3. Keep homepage broad typing ownership intact.
4. Add tests for page ownership and task presence.

### Slice C — InPage demand alignment

1. Make conversion direction explicit.
2. Default/lead with Unicode→InPage.
3. Keep reverse mode equally reachable.
4. Preserve the shared conversion core/package/API contract.

### Slice D — Homepage CTR experiment

1. Confirm Google is processing the current homepage state.
2. Select one SERP-message hypothesis.
3. Log baseline.
4. Deploy one controlled change.
5. Evaluate after a comparable window.

### Slice E — Keyboard reference enhancement

1. Reuse existing mappings.
2. Add interactive physical-key/Shift reference.
3. Clarify direct keyboard versus Roman transliteration.
4. Avoid speculative multi-engine layout work.

### Slice F — Existing typing-practice refinement

Only after the earlier slices are stable. Strengthen `/urdu-typing-practice`; do not create a new test route.

### Slice G — Fonts discovery/product research

Research/licensing/architecture only until the product gate is met.

## 16. Tests and validation

Extend existing tests rather than creating an unrelated SEO test framework.

Required automated/static checks where practical:

- canonical apex URLs;
- no new keyword-clone route in sitemap;
- expected title/H1 ownership for `/`, Roman, keyboard, InPage and typing-practice pages;
- Roman page contains actual task container/required assets after Slice B;
- InPage page exposes both directions after Slice C;
- internal intent registry maps clusters to expected owners;
- legacy routes remain redirects where already governed;
- `scripts/check-seo.js` passes;
- existing `tests/serp-intent-optimization-contract.test.js` is updated only where this child spec intentionally changes the Roman-page contract.

Manual QA:

- low-end mobile viewport;
- keyboard-only desktop use;
- RTL caret/input behavior;
- transliteration provider failure state;
- copy/handoff behavior;
- InPage round-trip fixtures already covered by the converter package/tests.

## 17. Out of scope

This implementation must not include:

- generic English→Urdu semantic translation;
- dozens of new SEO articles;
- one route per keyword variation;
- purchased/broad backlink campaigns;
- a new transliteration engine;
- a second InPage mapping implementation;
- a new database;
- raw user text/query telemetry;
- new ad units inside active writing/conversion workspaces;
- `/urdu-typing-test` while `/urdu-typing-practice` remains the established owner;
- a font download library without licensing/provenance approval.

## 18. Success criteria

This program succeeds when it produces clearer ownership and measurable traffic improvement **without sacrificing product use or creating new cannibalization**.

### Technical

- [ ] Apex/non-www canonical contract verified and documented.
- [ ] Priority legacy redirects are single-hop.
- [ ] Intent registry/internal links reinforce canonical owners.

### Roman Urdu

- [ ] Roman page is a working task page.
- [ ] Roman/transliteration queries increasingly resolve to the Roman page while broad English-to-Urdu typing remains on `/`.
- [ ] CTR improves from the 0.26% baseline over a comparable window without material ranking loss.

### InPage

- [ ] Unicode→InPage is clearly discoverable as the primary mode.
- [ ] Reverse mode remains strong.
- [ ] Direction-specific query CTR improves without splitting the route.

### Homepage

- [ ] `english to urdu typing` remains homepage-owned.
- [ ] Every SERP experiment has a dated baseline/change record.
- [ ] CTR improvement does not come with a material decline in actual editor use.

### Keyboard / practice

- [ ] Keyboard page is more useful for direct-keyboard intent without absorbing Roman intent.
- [ ] `/urdu-typing-practice` remains the single test/practice owner.

## 19. Stop / rollback rules

Pause or revert an experiment when a comparable GSC window shows one of the following without a compensating product-quality gain:

- material loss of the intended query owner;
- sustained ranking decline after the recrawl/reprocessing period;
- CTR improvement caused by a misleading promise that produces worse task activation;
- new cannibalization between `/` and the Roman page;
- broken transliteration/input behavior on mobile;
- InPage copy implying capabilities the converter does not have.

Do not react to one or two days of Search Console movement.

## 20. Agent execution contract

Before coding any slice:

1. Read this spec in full.
2. Read parent `WU-SEO-CTR-001-serp-intent-optimization.md`.
3. Read implemented `WU-SEO-ETU-001` for homepage ownership history.
4. Inspect current repository state; do not trust filenames/assumptions in old research over current code.
5. Read relevant product owner specs before changing shared engines:
   - Roman/transliteration journey/input contracts;
   - InPage converter/package contracts;
   - mobile activation contracts;
   - analytics/privacy contracts.
6. Reuse existing engines, mappings, routing, telemetry and SEO generation systems.
7. Implement one slice at a time.
8. Add/update tests with each slice.
9. Record evidence and release annotations before moving to the next SERP experiment.

The objective is not to make every page mention every keyword. The objective is to make **one established Write Urdu URL the clearest, most useful answer to each distinct Urdu-writing job**.