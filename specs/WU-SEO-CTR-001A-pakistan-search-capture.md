# WU-SEO-CTR-001A — Pakistan Search Capture

**Status:** Reconciled execution spec v3 — canonical action order for the 2026-10-04 exports
**Parent:** `WU-SEO-CTR-001-serp-intent-optimization.md`  
**Depends on:** implemented `WU-SEO-ETU-001`, current canonical/redirect system, current privacy-safe analytics  
**Primary market:** Pakistan  
**Primary routes:** `/`, `/roman-urdu-transliteration`, `/tools/inpage-unicode-converter`, `/urdu-keyboard`, `/urdu-typing-practice`  
**Area:** Search acquisition / intent ownership / existing-impression harvesting  
**Priority:** P0/P1

**Reconciliation inputs:**

- `d478724` — original Pakistan search-capture spec and implementation framing;
- `2d8205a` — independent analysis of the same exports;
- `9ee21cf` — raw/extracted evidence, reproducible analysis scripts and proposed amendment.

This file is the authoritative decision record. `WU-SEO-INTENT-001-second-opinion-investigation.md` remains a supporting analysis memo; where its recommendations differed from the original spec, the decisions below resolve the difference. The ordered execution checklist is `WU-SEO-CTR-001A-IMPLEMENTATION-CHECKLIST.md`.

## 1. Purpose

Turn the October 2026 Search Console, Pakistan Keyword Planner and product evidence into a small implementation program that captures more traffic from search demand Google is already exposing to Write Urdu.

This is **not** a broad SEO-content program and **not** a generic translation initiative.

The reconciled diagnosis is:

1. Google already knows and ranks Write Urdu.
2. Pakistan is the dominant search market.
3. Aggregate CTR fell while discovery expanded; that is not evidence of site-wide quality decline.
4. The largest impression family, `english to urdu*`, behaves like translation intent and may be only partly addressable by a typing product.
5. Narrow task pages and editor/brand queries already win materially stronger CTR, while many broad queries sit below the position 3–5 click cliff.
6. The highest-confidence work is measurement and host/owner consolidation first, then usefulness and rank-moving changes on existing routes. Snippet experiments come later. New keyword routes and broad link building are not supported.

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

India is the second market with 77,874 impressions (11.3%) and 3.71% CTR. This is context for later locale decisions, not scope for this program.

The 1,000-row query export covers 493,128 impressions (71% of the total) but only 13,635 clicks (53%). Do not treat it as the complete query set; use the Search Console API before making irreversible ownership decisions.

### 3.3 Device signal

| Device | Impressions | Clicks | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 421,010 | 11,651 | 2.77% | 6.34 |
| Desktop | 264,968 | 13,866 | 5.23% | 7.27 |

Mobile receives materially more impressions and a better average position, yet much lower CTR. This is an acquisition diagnostic, not proof that landing-page UX caused the CTR gap.

### 3.4 Highest-priority query/page opportunities

| Surface / query | Impressions | Clicks | CTR | Avg. position | Reconciled decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `english to urdu typing` | 164,935 | 135 | 0.08% | 7.02 | keep `/` as owner; treat 0.2–0.5% as plausible, not 1–2%; investigate before copy change |
| `urdu typing` | 27,294 | 471 | 1.73% | 6-range | rank-moving existing-route work after owner confirmation |
| `/roman-urdu-transliteration` apex row | 45,493 | 120 | 0.26% | 6.73 | first prove query mix; build the task for Roman demand, not all page impressions |
| Roman/transliteration query family | 8,083 | 144 | — | — | realistic market for the Roman tool in this export |
| `/tools/inpage-unicode-converter` | 82,953 | 450 | 0.54% | 6.72 | keep one route; identify the separate `online InPage` winner before changing framing |
| `unicode to inpage` | 38,135 | 85 | 0.22% | 7.59 | conditional rank/relevance bet, not a proven copy gap |
| `inpage to unicode` | 16,062 | 155 | 0.97% | 4.33 | retain as prominent reverse mode |
| `online InPage` family | ~9,000 | 896 | ~10.0% | 4.4 | find and protect current landing-page owner |
| keyboard cluster (4 queries) | 24,150 | 197 | 0.82% | — | resolve host split, then strengthen direct-keyboard task/reference |
| `/urdu-typing-practice` | 4,664 | 326 | 6.99% | 5.79 | preserve and extend; do not create `/urdu-typing-test` |
| stylish Urdu generator page | 35,367 | 3,459 | 9.78% | 5.18 | internal control: narrow task pages can convert well |
| `www` URLs | 105,172 | 4,946 | — | — | 14.1% of page impressions and 19.1% of clicks; investigate host trend before changing redirects |

### 3.5 Pakistan Keyword Planner interpretation

The supplied Pakistan export uses coarse volume buckets. Treat these as relative demand signals for queries already observed in Search Console, not exact obtainable traffic or independent demand discovery. Of 786 Planner keywords, 785 already appear in the GSC query export.

Important clusters include:

- `english to urdu typing` — 50k bucket;
- `urdu typing` — 50k bucket;
- `urdu keyboard` — 50k bucket;
- `unicode to inpage` — 50k bucket;
- `inpage to unicode` — 50k bucket;
- `urdu fonts` — 50k bucket;
- `urdu transliteration` — very large relative bucket, but translation-contaminated and not implementation evidence without a Pakistan SERP check;
- `urdu typing test` — 5k bucket.

Generic `english to urdu` volume must **not** be treated as addressable typing traffic because a large share is translation intent directly served by search engines and large translation products. The Planner export validates known-query scale; it does not justify new routes.

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

Do **not** change redirect architecture merely because GSC contains `www` impressions. First prove a live defect and export host-by-date data. The `www` share is too large to dismiss as harmless history, and changing direction without monitoring can cause a migration dip.

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

For the priority clusters, record which Write Urdu page actually receives impressions. Required first exports are:

- `/` and `/roman-urdu-transliteration` filtered to `english to urdu typing`;
- `urdu typing`, `urdu writing` and `urdu typing online` by landing page;
- the `online InPage` family by landing page;
- the keyboard family by apex/`www` landing page.

The ownership artifact must include:

- query cluster;
- observed landing page(s);
- intended owner;
- conflicting title/H1/anchor language;
- remediation.

If GSC query×page export is unavailable, record that limitation rather than guessing.

### P0.4 Baseline hygiene

- Exclude the 2026-09-26 one-day outlier (26,039 impressions) from experiment baselines.
- Record the 2026-08-18/19 impression step change as a known discontinuity and identify relevant releases before attributing later movement.
- Prefer a full Search Console API export because the UI export omits 47% of clicks.
- Protect `/`, `/stylish-urdu-text-generator` and `/urdu-editor` during host or metadata changes; together they account for about 91% of page-level clicks.

### P0 acceptance

- [ ] Live apex redirect contract verified.
- [ ] Host-by-date trend shows whether `www` is decaying, stable or growing.
- [ ] No mixed-host canonical defect on priority pages.
- [ ] Priority legacy URLs resolve in at most one redirect.
- [ ] Priority query ownership map exists.
- [ ] Roman-page query mix and `online InPage` landing-page owner are recorded.
- [ ] Baseline excludes 2026-09-26 and annotates the 2026-08-18/19 discontinuity.
- [ ] No new keyword-clone route introduced.
- [ ] Existing SEO contract tests still pass.

## 6. P1-A — Roman Urdu task conversion

**Route:** `/roman-urdu-transliteration`  
**Priority:** P1  
**Effort:** M  
**Expected impact:** Medium; bounded by verified Roman demand
**Primary evidence:** apex page row 45,493 impressions / 0.26% CTR / position 6.73, but all visible Roman/transliteration queries total only 8,083 impressions and 144 clicks

The page's title overlaps `english to urdu typing`, so most of its impressions may be non-Roman demand. The P0 query→page export gates scope and baseline attribution. The product change remains useful, but success must be measured against Roman queries rather than all page impressions.

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

The final title must move away from the exact broad phrase `English to Urdu Typing`, which remains homepage-owned.

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
- [ ] Success reporting separates Roman-query clicks from non-Roman impressions leaving the page.
- [ ] No duplicate transliteration engine introduced.
- [ ] Mobile first useful viewport contains the task, not a long article intro.
- [ ] Copy/editor next step works without sign-up.
- [ ] Translation distinction is accurate and non-promotional.
- [ ] Existing privacy rules are preserved.

## 7. P1-B — InPage demand alignment

**Route:** `/tools/inpage-unicode-converter`  
**Priority:** P1  
**Effort:** S–M  
**Expected impact:** Medium; direction emphasis is conditional
**Primary evidence:** page 82,953 impressions / 0.54% CTR; `unicode to inpage` has materially more impressions than `inpage to unicode`, while the separate `online InPage` family already earns about 896 clicks at about 10% CTR on an unknown page

### 7.1 Decision

Keep one bidirectional route in this cycle. Identify and protect the current landing-page owner for `online InPage` before changing shared copy or internal links.

Lead the search/task framing with **Unicode → InPage**, while retaining an obvious reverse mode.

Do not create `/unicode-to-inpage` and `/inpage-to-unicode` pages yet.

### 7.2 Required UI

At the top of the converter, expose an explicit two-mode control:

- `Unicode to InPage`;
- `InPage to Unicode`.

Default to Unicode → InPage only if a fresh query/page export and Pakistan SERP review do not materially contradict the 2026-10-04 evidence.

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
- [ ] The current `online InPage` owner and its traffic are not displaced.

## 8. P1-C — Homepage CTR investigation, not redesign

**Route:** `/`  
**Priority:** P1  
**Effort:** S per experiment  
**Expected impact:** Bounded; query appears translation-like
**Primary evidence:** `english to urdu typing` — 164,935 impressions, 0.08% CTR, avg. position 7.02

The broader `english to urdu*` family has 193,003 impressions and 290 clicks. Bare variants perform like translation queries, while variants containing `online`, `roman` or `google` earn 3–5% CTR. Treat the head term as partially outside Write Urdu's control.

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

| CTR | Clicks | Increment vs 135 current clicks | Interpretation |
| ---: | ---: | ---: | --- |
| 0.2% | 330 | +195 | lower plausible bound |
| 0.5% | 825 | +690 | upper plausible bound |
| 1.0% | 1,649 | +1,514 | aspirational; requires new SERP evidence |

These are **scenario calculations, not forecasts**. Do not plan against 2% or treat impressions as obtainable clicks.

### 8.5 Homepage acceptance

- [ ] Broad English-to-Urdu typing ownership remains on `/`.
- [ ] No clone landing page created.
- [ ] Any metadata change has a recorded baseline and deployment date.
- [ ] One variable changes per experiment, after owner and indexed-state evidence exists.
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
**Priority:** P1 after P0 host/owner evidence
**Effort:** M  
**Expected impact:** Medium–High; 24,150 cluster impressions and 197 clicks in the scenario set

### 10.1 Product boundary

The keyboard page must remain direct-character input, not become another Roman Urdu converter.

Resolve or explain the apex/`www` split before judging the page or changing metadata. Historical `www/urdu-keyboard` exposure ranks materially worse than apex.

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

## 11. P3 — Preserve and strengthen typing practice

**Existing route:** `/urdu-typing-practice`  
**Decision:** do not create `/urdu-typing-test`.

The existing route already has strong behavior for its rank and contains lessons/speed-test capability. It should own:

- Urdu typing practice;
- Urdu typing test;
- Urdu typing speed test;
- WPM/accuracy intent.

Enhancement work may include clearer title/H1/test entry, but only after checking current query ownership and existing product contracts. This is a small lever: the visible practice/test family is about 2,560 impressions across 22 queries.

Pakistan job/exam-specific copy such as PPSC/FPSC must be evidence-backed and must not make stale or unverifiable claims about official requirements.

## 12. P2 — Extend proven font demand before a new product

**First owner:** `/stylish-urdu-text-generator`
**Decision:** strengthen the proven owner for font copy/paste and preview intent before considering `/urdu-fonts`.

The visible fonts cluster already produces 16,691 impressions, 1,205 clicks and 7.2% CTR, largely through the stylish page. The head term `urdu fonts` has only 80 impressions at position 37.5 in the GSC export. Protect the winning page; do not split its authority for a speculative new route.

A future standalone surface becomes eligible only when it can provide a genuine product job:

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

### Slice A — Attribution and baseline gate

1. Export query→page ownership for homepage/Roman, generic typing, keyboard and InPage clusters.
2. Export host-by-date data for apex versus `www`.
3. Identify the landing page winning `online InPage` queries.
4. Produce a dated baseline excluding 2026-09-26 and annotating the 2026-08-18/19 step change.
5. Use the Search Console API when possible to recover the UI export's missing long tail.

**Stop:** no traffic-facing change begins until its owner and baseline are known.

### Slice B — Authority consolidation and winner protection

1. Run live apex/`www`, canonical and priority legacy-path checks.
2. Change redirects only when a live defect is proven.
3. If a defect exists, ship the narrow redirect/canonical repair and monitor `/`, `/stylish-urdu-text-generator` and `/urdu-editor` first.
4. Record one-hop results and before/after host shares.

### Slice C — Generic Urdu typing rank work

1. Confirm `/` owns `urdu typing`, `urdu writing` and `urdu typing online`.
2. Inspect current task copy, static metadata, crawlable supporting content and internal anchors for relevance gaps.
3. Choose one bounded rank-moving hypothesis, such as stronger task proof or intent-specific internal links; do not combine it with a title experiment.
4. Measure rank, clicks and editor activation over a comparable window.

### Slice D — Keyboard task/reference enhancement

1. Resolve the apex/`www` split and confirm query ownership.
2. Reuse current mappings to add a physical-key/Shift reference, punctuation/numeral help and mobile guidance.
3. Keep direct-character input primary and link Roman users to the Roman owner.
4. Measure the keyboard cluster, not one query alone.

### Slice E — Roman task conversion

1. Proceed only after Slice A confirms the Roman page's query mix.
2. Convert `/roman-urdu-transliteration` to a working task-first surface using the existing transliteration engine.
3. Retitle/reframe it around Roman Urdu, away from the homepage's broad phrase.
4. Measure Roman-query clicks separately from non-Roman impressions that leave the page.

### Slice F — Conditional InPage alignment

1. Preserve the current `online InPage` winner.
2. Keep one bidirectional converter route and shared conversion core.
3. Emphasize Unicode→InPage only when fresh owner/SERP evidence supports it.
4. Measure direction-specific clicks and conversion use.

### Slice G — Proven fonts extension

1. Protect `/stylish-urdu-text-generator` metadata and core job.
2. Test a bounded font copy/paste or preview enhancement on that route.
3. Keep standalone `/urdu-fonts` blocked until licensing, performance and product gates pass.

### Slice H — Homepage SERP experiment

1. Confirm Google is processing the current homepage state.
2. Select one SERP-message hypothesis supported by a Pakistan-localised SERP review.
3. Log baseline, deploy one variable and evaluate after a comparable window.
4. Use 0.2–0.5% as the plausible head-query scenario; protect broader homepage/editor traffic.

### Slice I — Small-lever hold

Typing practice refinement may follow after higher-value slices are stable. Do not create a typing-test route. Voice acquisition, a backlink campaign and a generic translator remain unsupported by this evidence.

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
- [ ] Host-by-date trend and migration risk are recorded before redirect changes.
- [ ] Priority legacy redirects are single-hop.
- [ ] Intent registry/internal links reinforce canonical owners.
- [ ] Query→page ownership exists for every implemented slice.

### Roman Urdu

- [ ] Roman page is a working task page.
- [ ] Roman/transliteration queries increasingly resolve to the Roman page while broad English-to-Urdu typing remains on `/`.
- [ ] Roman-query clicks and activation improve over a comparable window without material ranking loss; total page CTR is not used as the sole baseline.

### InPage

- [ ] The current `online InPage` landing-page owner is identified and protected.
- [ ] Unicode→InPage is clearly discoverable as the primary mode only if fresh evidence supports that emphasis.
- [ ] Reverse mode remains strong.
- [ ] Direction-specific query CTR improves without splitting the route.

### Homepage

- [ ] `english to urdu typing` remains homepage-owned.
- [ ] Every SERP experiment has a dated baseline/change record.
- [ ] Scenario planning uses 0.2–0.5% unless new SERP evidence supports a higher range.
- [ ] CTR improvement does not come with a material decline in actual editor use.

### Keyboard / practice

- [ ] Keyboard page is more useful for direct-keyboard intent without absorbing Roman intent.
- [ ] Keyboard host split is resolved or documented before judging the page change.
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
---

## 21. Reconciliation ledger — source decisions (2026-10-04)

**Status:** Integrated. Sections 1–20 now contain the reconciled decisions and execution order. This ledger preserves why the original and independent branches were resolved that way; it is not a second execution plan.
**Full write-up:** `specs/WU-SEO-INTENT-001-second-opinion-investigation.md`
**Scripts:** `docs/evidence/WU-SEO-CTR-001A/analysis/`
**Limits:** no Pakistan-localised live SERP, competitor or backlink review was available; those items remain hypotheses. The earlier US-targeted Planner export is preserved only in the raw bundle and is not implementation evidence.

### 21.1 What was verified unchanged

All figures in §3 were reproduced from the CSVs: 28-day windows (221,081 → 358,529 impressions; 8,831 → 10,975 clicks), Pakistan share (74.7% impressions / 78.9% clicks), device split, and every query/page row in §3.4.

### 21.2 Corrections and additions to the evidence

| # | Finding | Evidence | Effect on this spec |
| --- | --- | --- | --- |
| A1 | The `english to urdu*` family looks like a translation SERP | Family = 193,003 impressions (39% of the queries export), 290 clicks (2.1%). `english to urdu typing` 0.08% vs plain `english to urdu` 0.07% at similar positions. Variants with "online", "roman", "google" get 3–5% | §8.4 scenarios (0.5/1/2%) are optimistic; plan for 0.2–0.5%. Not a reason to change ownership |
| A2 | Homepage CTR is mostly one query | If the family sat on `/`, the rest of the page runs ≈6.2% CTR. Query→page split not exported, so this is a bound | Reframe §8: investigation, not redesign (already the stated posture) |
| A3 | Roman page impressions likely are not Roman demand | Page: 45,523 impressions. All Roman/transliteration queries in the export: 8,083 impressions / 144 clicks. Page title matches `english to urdu typing` | §6 "Very High" impact is overstated; expected ceiling ≈ Roman demand (≈8k impressions; ≈400 clicks per 3 months at 5% CTR). Diagnosis is "mismatched to the query supplying its impressions", not only "guide-first" |
| A4 | InPage clicks mostly do not come from the converter | InPage/Unicode-term queries: 1,278 clicks on 83,655 impressions; converter page: 450 clicks. "online InPage" queries: ≈9,000 impressions, 896 clicks, 10% CTR at pos 4.4. `inpage to unicode` ranks 4.5 but gets 0.97% | §7: "lead with Unicode→InPage" is a reasonable bet on 51.7k impressions at pos 7.6 / 0.29% but not as well supported as stated; add owner identification for the "online InPage" cluster |
| A5 | `www` is a live quantity, not only history | `www` = 14.1% of page impressions and 19.1% of clicks. `www/` 86,686 imps at 4.79% CTR vs apex 3.19%; `www/urdu-editor` 12,956 imps at pos 10.44 vs apex pos 7.38; `www/urdu-keyboard` 1,772 imps at pos 22 | §5 P0.1: keep "verify before changing" but add a host×date export; flag migration-dip risk (see 21.4) |
| A6 | Planner is not independent demand evidence | 785 of 786 Planner keywords are queries already in GSC; buckets are coarse; YoY/3-month fields are bucket artefacts | §3.5: use Planner for volume validation of known queries only; do not cite it as new-demand discovery |
| A7 | Ranking dominates snippet effects | CTR by position (excl. `english to urdu` family): 1 → 41.6%, 2 → 28.0%, 3 → 15.6%, 4 → 6.2%, 5 → 4.8%, 6 → 2.4%, 7 → 1.0% | Prioritise rank-moving work for `urdu typing` / `urdu writing` / keyboard over copy tweaks |
| A8 | Click concentration | `/`, `/stylish-urdu-text-generator`, `/urdu-editor` ≈ 91% of page-level clicks; ≈50 navigational/editor queries = 28% of queries-export clicks | Protect these pages when changing host or metadata |
| A9 | Fonts partly captured already | Fonts cluster 16,691 impressions, 1,205 clicks, 7.2% CTR (stylish page); head term `urdu fonts` = 80 impressions at pos 37.5 | §12: if pursued, extend the winning stylish page first |
| A10 | Impression step change from 18–19 Aug | Daily impressions 5,711 → 9,549 → 12,805; daily clicks 306 → 304 → 392. 26 Sep is an outlier (26,039 impressions) | Exclude 26 Sep from baselines; identify what shipped around 18 Aug |
| A11 | Queries export is partial | 1,000 rows = 71% of impressions but 53% of clicks; unlisted impressions convert ≈6.1% | Use the Search Console API for fuller attribution before final decisions |
| A12 | Second market | India: 77,874 impressions (11.3%), CTR 3.71% | Note for any future locale work; no change now |

### 21.3 Decisions applied to the execution order

Gating measurements first (all XS, no engineering):

1. **Query→page export** for `/` and `/roman-urdu-transliteration`, filtered to `english to urdu typing`. Result decides whether A3 holds. Gates Slice B scope.
2. **Host×date export** (`www` vs apex) plus a live `npm run seo:live` check. Decides whether consolidation is progressing and whether it explains the 18 Aug step change. Gates Slice A conclusions.
3. **Identify the landing page for "online InPage" queries** and record the intended owner. Gates Slice C copy.
4. **Baseline hygiene:** exclude 26 Sep; record 18–19 Aug as a known discontinuity.

The following resolution table explains the integrated spec. Use §15 and `WU-SEO-CTR-001A-IMPLEMENTATION-CHECKLIST.md` for actual order.

| Slice | Change |
| --- | --- |
| A | Add items 1–4 above to P0 acceptance. Keep "no redirect changes without a proven live defect" but treat the `www` share as evidence to investigate, not as noise |
| B | Keep the working Roman tool. Re-scope success to Roman demand (≈8k impressions), retitle away from the `english to urdu typing` phrase, and measure movement of the Roman page's non-Roman impressions separately |
| C | Keep one bidirectional route. Softer claim: Unicode→InPage emphasis is a bet on a large query at pos 7.6, not a confirmed gap. Do not disturb whatever page currently wins "online InPage" |
| D | Plan for 0.2–0.5% on `english to urdu typing`. Treat ≥1% as outside Write Urdu's control until SERP evidence shows otherwise |
| E | Keyboard reference proceeds as specified; resolve the `www/urdu-keyboard` split first |
| F | Unchanged. Typing practice/test ≈2,560 impressions across 22 queries is a small lever |
| G | Start from the stylish page's font demand; no standalone fonts product yet |

Not supported by this evidence: voice as an acquisition lever (≈57 impressions across 3 queries), a standalone typing-test route, a backlink campaign, and generic translation (agrees with §17).

### 21.4 Risks not previously recorded

- **Migration dip:** consolidating `www` → apex requires the ≈19% click share currently on `www` to move. An incomplete or slow move could reduce clicks, and may partly explain the impression pattern since 18 Aug. Monitor the three high-click pages first.
- **Optimising the unwinnable:** the largest impression numbers belong to a query family that returns almost no clicks at any position. Success criteria should be defined on clicks and activation, not impressions or average position.

### 21.5 Revised scenarios (constant impressions, per 3 months)

| Query / cluster | Impressions | Now | Plausible | Basis |
| --- | ---: | ---: | ---: | --- |
| english to urdu typing | 164,935 | 135 (0.08%) | 330–825 (0.2–0.5%) | Translation-like SERP (A1) |
| unicode to inpage | 38,135 | 85 (0.22%) | ≈380 (1%) | Requires rank ≈5–6 |
| urdu typing | 27,294 | 471 (1.73%) | 819–1,365 (3–5%) | Requires rank ≈4–5 |
| keyboard (4 queries) | 24,150 | 197 (0.82%) | 483–725 (2–3%) | Needs rank and `www` fix |
| roman urdu to urdu | 4,862 | 47 (0.97%) | 146–243 (3–5%) | Roman demand only |

These are arithmetic scenarios, not forecasts.

### 21.6 Evidence still needed

Query→page data; host×date data; Pakistan-localised SERP review for `english to urdu typing`, `unicode to inpage` and `urdu keyboard online`; competitor age, authority and whether small domains outrank Write Urdu (needed to test the authority hypothesis, which this evidence neither supports nor rules out); the full-fidelity query set via the Search Console API.
