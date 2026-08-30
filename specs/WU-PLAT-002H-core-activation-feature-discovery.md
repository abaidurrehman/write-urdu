# WU-PLAT-002H — Core Activation & Feature Discovery Acceptance

**Status:** Active — P0 implementation/acceptance slice  
**Priority:** P0 — must be completed before any new major feature initiative  
**Parent:** `WU-PLAT-002` V2 Product Journey & Workspace Handoffs  
**Commercial owner:** `WU-GROWTH-001` Search Console + AdSense Growth System  
**Related:** `WU-PLAT-004`, `WU-GROWTH-002`, `WU-GROWTH-003`, `WU-SHARE-001`, `WU-ANALYTICS-003`, `WU-COMMUNITY-001`  
**Primary routes:** `/`, `/urdu-editor`, `/tools/urdu-voice-typing`, `/urdu-card-studio`, public share/read routes  
**Decision date:** 2026-08-30  
**Founder target:** progress toward a sustainable **$5/day AdSense** outcome without degrading the writing task

---

## 1. Executive decision

WriteUrdu has enough product breadth for the current growth phase. Product Pulse and Search Console now show that the next major opportunity is not another tool: it is reducing friction in the already-proven journey.

For this phase, the product is governed by one core loop:

`Search / direct return -> start Urdu -> first success -> useful completion -> relevant continuation -> save/share/publish -> return`

No major unrelated feature should move ahead of this slice unless it is a production/security/legal blocker or has materially stronger evidence than the findings recorded here.

This is a **measured UX convergence programme**, not a visual refresh. The implementation must not add another layer of controls, another generic tool grid, or another independent growth banner. Existing surfaces are simplified or made contextual before new ones are introduced.

---

## 2. Evidence baseline

The following evidence triggered this slice. These values are decision inputs, not permanent product claims; Product Pulse/GSC should retain dated baselines so future reviews can compare against them.

### 2.1 Product concentration

7-day Product Pulse:

- Product visits: **5,279**
- Engaged visits: **3,686**
- Engagement rate: **69.8%**
- Basic Editor: **3,597 visits / 2,573 engaged / 71.5% engagement**
- Rich Editor: **760 / 647 / 85.1%**
- Voice Typing: **300 / 164 / 54.7%**
- Stylish Urdu Text: **239 / 155 / 64.9%**

Basic + Rich + Voice + Stylish account for about **92.7%** of measured product visits. Product investment should therefore strengthen these proven jobs before expanding breadth.

### 2.2 First-value / writing-depth signal

Measured writing summaries:

- 0 chars: **1,000**
- 1–20: **211**
- 21–50: **101**
- 51–100: **71**
- 101–250: **44**
- 251–500: **46**
- 501–1,000: **91**
- 1,001–2,500: **109**
- 2,500+: **126**

The 0-character bucket is **55.6%** of the measured writing-summary population. This may represent genuine pre-input abandonment, telemetry classification, non-writing visits, or a mixture. We must not redesign on assumption alone; the implementation must first separate these cases.

Among sessions that wrote something, a meaningful long-form cohort exists: **326** measured sessions reached 500+ characters and **235** reached 1,000+ characters.

### 2.3 Session-time signal

Measured active-use buckets:

- 0–10s: **568**
- 11–30s: **690**
- 31–60s: **283**
- 61–180s: **239**
- 181–600s: **81**
- 600s+: **40**

Short sessions must not automatically be treated as failures. A 20-second successful typing/copy job can be excellent. The correct optimization target is **first successful Urdu + useful outcome**, not dwell time.

### 2.4 Voice signal

Dedicated voice funnel:

- Voice visitors: **238**
- Tried voice typing: **84**
- Produced Urdu text: **52**
- Try rate: **35.3%**
- Success after try: **61.9%**

Across voice-enabled workspaces:

- Voice started: **167**
- Rich Editor voice starts: **156 / 760 visits = 20.5% adoption**
- Basic Editor voice starts: **8 / 3,597 visits ~= 0.2% adoption**

Voice behaves like a valid **input method**, not merely an isolated utility. Basic Writer discovery is therefore suspect and should be tested in the input-choice layer.

### 2.5 Output signal

7-day exports:

- PDF: **278**
- Word: **230**
- PNG: **102**
- TXT: **3**
- JPEG: **0**
- SVG: **0**

PDF + Word are about **82.9%** of exports. Completion UX must prioritize these proven outputs for substantial writing while avoiding a persistent command wall before users have created content.

### 2.6 Card completion signal

- Card Studio: **103 visits / 57 engaged / 40 canvas edits / 3 exports**
- Name Art: **62 visits / 37 engaged / 24 canvas edits / 11 exports**

Approximate edit-to-export rates are **7.5%** for Card Studio versus **45.8%** for Name Art. Card Studio has activation but weak completion. Do not increase Card Studio acquisition until this leak is investigated and the quick path is simplified if evidence supports it.

### 2.7 Share loop signal

- Publish attempts: **7**
- Published links: **5**
- Public views: **9**
- CTA clicks: **8**
- Referred starts: **0**
- Republishes: **0**

The current evidence does **not** point to CTA discoverability as the primary share problem; 8 of 9 readers clicked. The leak is after CTA click or in telemetry. Any work that merely makes the CTA larger without tracing destination continuity is out of scope.

### 2.8 Search / mobile signal

Recent GSC evidence reviewed on 2026-08-30:

- `english to urdu typing`: about **51k impressions**, avg position about **7.1**, CTR about **0.07%**
- Mobile impressions materially exceed desktop; mobile average position is better while CTR is much lower.

The product must protect simple search-intent language (`English to Urdu Typing`, `Urdu Typing Online`) and make the first mobile viewport immediately task-oriented. `Roman` and `transliteration` remain implementation/reference vocabulary, not the lead acquisition language.

### 2.9 Commercial constraint

The target is $5/day AdSense, but the repository does not yet contain a clean current post-restoration RPM/earnings baseline. Therefore this slice must improve useful activation, continuation and return **without inventing a revenue forecast**. `WU-GROWTH-001` remains the owner of page RPM, AdSense placement experiments and the authority/revenue map.

---

## 3. Product hypotheses

This slice tests the following hypotheses in order:

1. **First-value visibility:** some zero-character sessions are caused by not reaching or understanding the writing action quickly enough, especially on mobile.
2. **Choice overload:** exposing many completion/product commands before value is created increases cognitive load without improving useful discovery.
3. **Context beats directories:** users are more likely to take a relevant next action when recommendations depend on their current task/state than when they are shown generic tool lists.
4. **Voice is an input choice:** voice discovery improves when presented alongside English-letter and direct-Urdu input rather than as another promotional destination.
5. **Rich Editor is the natural long-writing escalation:** the 85.1% engagement rate justifies a stronger contextual handoff after substantial writing.
6. **Growth prompts need arbitration:** Save, Share and Publish compete when shown together; one value request at a time should produce clearer decisions.
7. **Share continuity is broken after click:** referral acquisition is more likely to improve by preserving/confirming the destination start than by further CTA promotion.
8. **Card Studio needs completion simplification:** a guided default path should be tested before additional acquisition investment.

These are hypotheses, not permission for a broad redesign. Each material UI change needs a specific hypothesis, event path and rollback criterion.

---

## 4. Core design principles

### 4.1 First value before feature breadth

Before the user creates useful text, the interface should primarily answer:

- What can I do here?
- Where do I type?
- How do I get Urdu?
- Can I speak instead?

It should not ask the user to choose among the whole WriteUrdu product catalog.

### 4.2 Progressive discovery, not hidden capability

Features are not removed simply because they are lower frequency. They are revealed when their prerequisite state exists or through a stable `More`/continuation surface.

Example progression:

`empty -> input choice + editor`

`first useful text -> Copy + contextual Continue`

`longer writing -> Rich Editor / Word / PDF / Keep`

`completion -> Share / Publish when relevant`

### 4.3 Maximum three visible continuation actions

Reuse the parent `WU-PLAT-002` rule: one primary and at most two secondary contextual continuations. A generic all-tools grid must not be inserted into the active/completion area.

### 4.4 One growth request at a time

A **growth request** is a product ask such as:

- create/sign in to an account;
- save/keep this writing;
- publish to Urdu Writers;
- create a public share link.

The user may still have normal task commands such as Copy/Download. But the interface must not simultaneously display multiple competing growth promotions in the same decision area.

### 4.5 Outcome-led language

Prefer:

- `Type English letters, get Urdu`
- `Speak Urdu`
- `Continue with formatting`
- `Keep this writing`
- `Publish your writing`

Avoid leading with internal/product taxonomy when a user outcome is clearer.

### 4.6 Mobile-first first screen

On a typical mobile viewport, the primary writing task and input choices must be visible with minimal competing chrome. Do not push the editor below large marketing, account, tool-directory or ad modules.

### 4.7 Do not optimize dwell time

Success is a useful outcome. A short successful session is valid. Never add steps, pagination or delayed actions to manufacture session duration/pageviews.

### 4.8 Ad-safe authoring

No experiment may place AdSense inside, over, between, or deceptively adjacent to active editor controls, input-mode choices, export/download controls, share/publish controls or the main writing result. Monetization experiments belong to `WU-GROWTH-001` and must preserve task completion/CWV.

---

## 5. State model for the Basic Writer

The Basic Writer should expose commands based on **capability state**, not arbitrary time delays.

### State E0 — empty

Condition: no meaningful text.

Dominant UI:

1. clear search-intent heading/short example;
2. input choice:
   - `English letters -> Urdu` (default / current proven mode)
   - `Type Urdu directly`
   - `Speak Urdu` when voice is available;
3. writing canvas;
4. compact help/status only as needed.

Rules:

- do not show a row of disabled Share/PDF/Word/PNG/Preview/Print actions as primary visual content;
- advanced settings remain discoverable through a quiet `More`/settings entry if required;
- no account/save/publish prompt;
- no contextual tool directory before first value;
- no interstitial ad before the editor.

### State E1 — first useful text

Suggested threshold for implementation evaluation: non-whitespace text with a successful input/change signal; do not wait for an arbitrary large character count.

Dominant completion:

- `Copy` becomes directly available;
- a compact `Continue` surface may appear;
- preserve direct access to current input choice;
- secondary exports remain progressive unless there is strong existing behavioral evidence for a direct command.

### State E2 — active short writing

Suggested measurement bucket: 20–499 characters. Exact thresholds may be adjusted after telemetry validation without changing the semantic state model.

Typical contextual actions:

- Copy;
- one relevant transformation such as Stylish/Card where source/job evidence supports it;
- `More` for additional outputs.

Do not automatically assume every short text is a design job.

### State E3 — substantial writing

Suggested measurement bucket: 500–999 characters.

Priority continuation:

- `Continue with formatting` -> Rich Editor, preserving text;
- PDF/Word become more prominent completion options;
- `Keep this writing` becomes eligible under the growth-arbitration rules.

### State E4 — long-form writing

Suggested measurement bucket: 1,000+ characters.

Priority continuation:

- Rich Editor / document formatting if still in Basic;
- Word/PDF;
- Save/Keep for signed-out or unsaved work;
- Publish to Urdu Writers only when community eligibility/rollout rules permit and when it does not compete with a higher-priority save/recovery request.

### State E5 — post-completion

Triggered by a meaningful successful outcome such as export/copy/save, not simply time spent.

Eligible next requests/actions may include:

- Share public link;
- Publish to Urdu Writers;
- create another derivative output;
- return/resume affordance.

The arbitration controller must choose the single most relevant growth request rather than stacking multiple banners.

---

## 6. H1 — First-value funnel instrumentation

### 6.1 Objective

Determine whether the 0-character population represents UX abandonment, telemetry noise, non-writing intent, or a mixture.

### 6.2 Required aggregate events/states

Use existing privacy-safe telemetry infrastructure. Do not send typed text, speech transcripts, filenames, share IDs or document content.

Logical event sequence (exact event names may align with current conventions):

- `writer_viewed`
- `writer_in_view` (optional if observable robustly)
- `writer_focused`
- `writer_first_input`
- `writer_first_urdu_success`
- `writer_depth_20`
- `writer_depth_100`
- `writer_depth_500`
- `writer_depth_1000`
- `writer_outcome_first`

Allowed dimensions:

- workspace (`basic`, `rich`, etc.);
- route bucket;
- device class;
- locale;
- input mode (`english_letters`, `direct`, `voice`);
- acquisition bucket already supported by analytics;
- outcome category (`copy`, `export_pdf`, `export_word`, `share`, `save`, etc.);
- bounded experiment/version identifier.

Forbidden:

- typed strings;
- user-selected text;
- transcript content;
- filenames;
- document/share IDs;
- full referrer URLs containing uncontrolled query data;
- user identity in product-event payloads.

### 6.3 Session classification

Product Pulse must be able to distinguish at least:

- page visit but writer never visible/eligible;
- writer visible but never focused;
- focused but no input;
- input but no successful Urdu conversion where conversion is expected;
- successful Urdu but no measured outcome;
- successful outcome.

Do not label all zero-char sessions `abandonment`.

### 6.4 Acceptance

Before H2 is considered successful, Product Pulse must expose the first-value funnel by desktop/mobile at minimum and establish a 7-day post-release baseline.

---

## 7. H2 — Adaptive Basic Writer command/discovery model

### 7.1 Objective

Replace the always-visible pre-value command wall with a stable, progressive command architecture while preserving all existing capabilities.

### 7.2 Source ownership

`WU-PLAT-004` remains the Basic Writer command-surface owner but is amended by this slice. It must no longer require all content-dependent commands to be persistently visible while the editor is empty.

### 7.3 Empty state

Directly visible:

- input choice;
- editor;
- compact status/help;
- voice input choice when supported.

Do not present PDF, Word, PNG, Preview, Print and Share as a row of disabled primary commands before content exists.

### 7.4 After useful text

At minimum expose:

- Copy;
- one contextual Continue entry;
- a stable `More`/outputs entry where lower-frequency actions remain reachable.

### 7.5 Proven outputs

For substantial/long writing, PDF and Word should be promoted because they represent the dominant measured export behavior. PNG remains relevant but does not need equal visual priority for long-form text.

TXT/JPEG/SVG must not receive new primary UI investment without new evidence.

### 7.6 No duplicated controls

Implementation must remove/retire superseded legacy controls when the adaptive surface owns them. No runtime may result in two Share buttons, two Export menus, two input selectors, or a new toolbar plus the old home-action block.

### 7.7 Stability

Progressive reveal must not cause disruptive layout jumps over the writing canvas. Prefer a reserved compact command region, CSS state changes, or post-editor continuation placement that preserves focus and scroll position.

---

## 8. H3 — Mobile first-screen contract

### 8.1 Objective

Make the primary task obvious to mobile search visitors, where GSC shows high exposure and materially weaker CTR/engagement opportunity.

### 8.2 Target hierarchy

On a typical mobile entry to `/`, the user should encounter in this order:

1. concise intent-matched heading;
2. one short conversion example (`mera khayal hai -> میرا خیال ہے` or reviewed equivalent);
3. input choice (`English letters`, `اردو`, `Speak`);
4. writing canvas.

Secondary marketing, account prompts, feature directories, Learn content and ads must not displace this sequence.

### 8.3 Touch/accessibility

- touch targets >= practical 44px target size;
- input-mode labels remain understandable without icons alone;
- voice control is not icon-only;
- focus ring and screen-reader names required;
- no horizontal toolbar scroll for primary commands;
- Urdu output remains readable at mobile text sizes without zoom.

### 8.4 Search integrity

Do not change canonical ownership or create a new mobile URL. Preserve the established homepage query owner and progressive enhancement/source-visible content.

---

## 9. H4 — Contextual continuation

### 9.1 Objective

Increase useful second actions/page depth without generic product-directory overload.

### 9.2 Global rule

At most three visible continuation actions after the immediate outcome area.

### 9.3 Basic Writer recommendations

Recommendation logic should consider only bounded state, not user text content.

Examples:

- short text -> Copy / Stylish / Card may be reasonable if prior usage supports it;
- substantial text -> Rich Editor / PDF / Word;
- long unsaved text -> Rich Editor / Keep / document outputs;
- completed export -> Share/Publish may become eligible.

Do not infer topic/meaning from private writing to choose recommendations.

### 9.4 Rich Editor escalation

Because Rich Editor currently shows strong engagement, Basic -> Rich is the preferred continuation for substantial writing. The handoff must preserve current text without URL query payloads and without overwriting an existing Rich draft silently.

### 9.5 Measurement

Track:

- continuation impression by recommendation ID;
- click/handoff;
- destination accepted/restored;
- destination first meaningful action;
- destination outcome where already measurable.

Do not count a handoff click alone as success.

---

## 10. H5 — Share referral continuity repair

### 10.1 Objective

Resolve the measured `8 CTA clicks -> 0 referred starts` leak.

### 10.2 Required trace

For a share/community reader CTA:

`reader CTA impression -> CTA click -> destination response -> handoff/referral context available -> target workspace ready -> first creation input -> meaningful start`

The instrumentation should aggregate by source type, not public share ID.

### 10.3 UX contract

- CTA destination must open the correct workspace, not a generic directory page;
- where the action promises `Use this text`, the public text handoff must be restored predictably;
- where it promises `Create your own`, the target should be ready/focused for creation;
- do not make recipients authenticate before beginning unless the target action genuinely requires identity;
- preserve existing privacy and anti-abuse constraints.

### 10.4 Acceptance

The slice is not closed merely because events fire. Production evidence must show referred starts are measurable and non-zero after sufficient traffic, or a documented reason must explain why the current sample is too small and the end-to-end path must pass browser acceptance.

---

## 11. H6 — Growth CTA arbitration

### 11.1 Objective

Prevent `Create account`, `Keep`, `Share`, and `Publish` from competing at the same time.

### 11.2 Priority model

The controller may use authenticated state, save state, character-depth bucket and most recent completion outcome. It must not inspect the semantic content of writing.

Default ordering:

1. **Recovery/value protection** — if substantial unsaved writing exists, `Keep this writing` has priority.
2. **Task completion** — normal Copy/Download/Word/PDF remain commands, not growth promotions.
3. **Distribution** — after completion, public Share may be suggested.
4. **Community publishing** — eligible long-form/creative work may receive Publish after the user has demonstrated completion/value and rollout rules allow it.

This ordering can be evidence-adjusted later, but multiple growth banners must not stack.

### 11.3 Signed-in behavior

Do not promote account creation. Prefer useful Save/My Documents state, then Share/Publish when appropriate.

### 11.4 Community distinction

`Share link` and `Publish to Urdu Writers` are different jobs and must be labelled distinctly:

- Share link: public snapshot/link intended for direct sharing;
- Publish to Urdu Writers: moderated community submission/discovery.

Do not use generic `Publish` in a context where the destination/status is unclear.

---

## 12. H7 — Card Studio completion investigation and quick path

### 12.1 Gate

No major Card Studio acquisition expansion until this work establishes whether the current edit-to-export gap is caused by UI complexity, output quality, export discoverability, telemetry, or another factor.

### 12.2 First investigation

Add/verify funnel states:

`studio loaded -> role/preset chosen -> text entered/imported -> canvas changed -> export control viewed -> export clicked -> export completed`

Include Quick vs Advanced mode if already available.

### 12.3 Quick-path design hypothesis

Default journey to test:

`What are you making? -> enter/import text -> choose a visual/preset -> preview -> Download`

Advanced typography/position/gradient/overlay controls stay available under explicit customization rather than competing with first completion.

### 12.4 Reference pattern

Name Art's stronger completion ratio suggests that an outcome-first role/preset choice may be useful. This is a product hypothesis only; do not blindly copy Name Art UI.

### 12.5 Acceptance

A Card Studio UI change requires before/after completion evidence or, at minimum, browser task tests showing a first-time mobile/desktop user can complete a common card in materially fewer decisions without losing existing advanced capability.

---

## 13. H8 — Revenue UX acceptance

### 13.1 Ownership

`WU-GROWTH-001` owns AdSense baseline, RPM and placement experiments. This slice owns the UX guardrails and product signals those experiments must not degrade.

### 13.2 Required joint view

Product Pulse / commercial review should be able to compare by high-traffic page type:

- visits;
- first-value success;
- outcome completion;
- useful continuation rate;
- returning signal when available;
- pageviews/monetizable pageviews where available;
- RPM/earnings from AdSense reporting;
- CWV/performance.

### 13.3 Revenue guardrail

Do not accept an ad experiment as a win if revenue rises while primary task completion, accidental-click risk, mobile usability or CWV materially worsens.

### 13.4 $5/day decision framework

Once a comparable RPM baseline exists:

`required monetizable pageviews/day = 5 * 1000 / observed page RPM`

Use the real observed RPM. Do not bake an assumed RPM into public/product acceptance criteria.

---

## 14. Product Pulse v2 requirements

Add or extend the dashboard so a founder review can answer these questions without reconstructing events manually:

### 14.1 First value

- writer eligible/visible;
- focused;
- first input;
- first Urdu success;
- 20/100/500/1,000+ depth;
- first outcome;
- split by mobile/desktop and key workspace.

### 14.2 Continuation

- continuation shown;
- handoff clicked;
- destination restored/ready;
- destination meaningful start;
- destination outcome.

### 14.3 Growth requests

- Keep shown/clicked/saved;
- Share suggested/opened/completed;
- Publish suggested/opened/submitted;
- suppressions due to CTA arbitration.

### 14.4 Voice

- exposed;
- clicked/tried;
- permission granted/denied;
- listening;
- speech heard;
- final text;
- Urdu inserted;
- bounded failure reason;
- success rate.

Rename any misleading ratio currently labelled as a `rate` when repeated final-result events can exceed starts.

### 14.5 Card Studio

- start;
- first content;
- first canvas edit;
- export attempt;
- export completion;
- Quick/Advanced segmentation.

### 14.6 Share referral

- public views;
- CTA clicks;
- destination ready;
- referred starts;
- meaningful referred starts;
- republish.

---

## 15. Experiment governance

### 15.1 One material question per experiment

Do not combine homepage heading changes, command hierarchy changes, voice positioning, account prompts and ad-placement changes into one unmeasurable release unless a production bug forces it.

### 15.2 Baseline window

Capture at least a 7-day baseline when volume supports it. Use longer windows for lower-volume surfaces such as Card Studio/community.

### 15.3 Minimum evidence

Record:

- hypothesis;
- affected routes/devices;
- exact UI change;
- primary metric;
- guardrail metrics;
- launch date/commit;
- decision after observation: keep / iterate / rollback.

### 15.4 Rollback

Every substantial UI experiment must be straightforward to revert without changing the underlying transliteration, export, auth, share or persistence engines.

### 15.5 No vanity wins

Do not call an experiment successful solely because:

- more buttons were clicked;
- time on page rose;
- pages/session rose without a meaningful task;
- a promo was seen more often;
- ad impressions increased while task completion fell.

---

## 16. Implementation sequence

### Phase H0 — spec alignment / no UI code

1. Register this slice.
2. Amend `WU-PLAT-004` so its empty-state command contract no longer conflicts with progressive discovery.
3. Amend `WU-GROWTH-002` with value thresholds/CTA arbitration.
4. Amend `WU-SHARE-001` with recipient-start continuity acceptance.
5. Reorder `BACKLOG.md` so this work precedes new major features.

### Phase H1 — measurement foundation

Implement/validate first-value, contextual-continuation and referral-continuity telemetry and Product Pulse reporting before relying on inferred abandonment.

### Phase H2 — Basic Writer empty/early state

Run the smallest meaningful UX intervention:

- simplify pre-value command surface;
- preserve intent-matched heading/example;
- present the three input choices coherently;
- keep editor dominant on mobile;
- reveal Copy/Continue only after useful content.

### Phase H3 — contextual continuation / Rich escalation

Introduce state-appropriate continuation and instrument destination success.

### Phase H4 — growth CTA arbitration

Coordinate Keep / Share / Publish on core writing surfaces.

### Phase H5 — share referral repair

Validate/fix CTA-to-start end-to-end.

### Phase H6 — Card Studio quick completion

Only after funnel instrumentation identifies the failure location.

### Phase H7 — commercial review

Join UX results with the current AdSense/RPM baseline under `WU-GROWTH-001`, then decide which traffic/retention improvements most directly move the $5/day target.

---

## 17. Explicit non-goals / freeze list

Until H1–H5 are materially underway, do not prioritize:

- new unrelated mini-tools;
- broad Invoice/QR expansion;
- new export formats;
- bulk Urdu-locale expansion;
- social-network mechanics such as follows/likes/comments merely for engagement;
- another homepage tools directory;
- a new toolbar layered over the current toolbar/actions;
- site-wide ad-density increases;
- AI novelty features that do not solve the measured loop;
- Card Studio acquisition expansion before completion diagnosis.

Existing maintenance/security/legal/production reliability work is not blocked.

---

## 18. Acceptance criteria

`WU-PLAT-002H` can close only when:

- [ ] First-value funnel distinguishes visible/focus/input/Urdu-success/outcome instead of treating all zero-char sessions as abandonment.
- [ ] Product Pulse reports the first-value funnel by mobile/desktop for Basic Writer.
- [ ] Basic Writer empty state no longer presents a primary wall of disabled content-dependent commands.
- [ ] English-letter, direct-Urdu and Voice input choices are coherently discoverable without making Voice a mandatory dependency.
- [ ] Copy becomes obvious after useful text exists.
- [ ] Substantial writing receives a strong, state-preserving Rich Editor continuation.
- [ ] PDF/Word are promoted for substantial writing based on measured export behavior without cluttering the pre-value state.
- [ ] Contextual continuation shows no more than three visible next actions.
- [ ] No generic all-tools grid is inserted into the active/completion area as a substitute for context.
- [ ] Growth CTA arbitration prevents simultaneous competing Save/Share/Publish acquisition banners.
- [ ] Share/community reader CTA flow is instrumented through destination ready + referred start.
- [ ] Browser acceptance proves the CTA destination can start creation without a broken handoff.
- [ ] Card Studio completion funnel identifies where users drop before any acquisition expansion.
- [ ] Mobile first-screen acceptance confirms editor + input choices remain primary and usable.
- [ ] No writing content enters telemetry or URLs.
- [ ] Existing transliteration, direct input, voice, export, drafts, auth, sharing and community behavior remain regression-covered.
- [ ] AdSense remains outside active editor/control/result regions and any revenue experiment is owned by `WU-GROWTH-001`.
- [ ] A post-change Product Pulse comparison is recorded with keep/iterate/rollback decisions.
- [ ] `specs/BACKLOG.md` is re-evaluated after evidence rather than immediately resuming frozen feature breadth.

---

## 19. Success metrics

Do not set unsupported numeric promises for metrics that currently lack a clean denominator. Establish baselines first.

### Primary

- Basic Writer visible -> first input conversion;
- input -> first successful Urdu conversion;
- successful Urdu -> first useful outcome;
- substantial Basic writing -> Rich handoff -> destination meaningful start;
- share CTA -> referred meaningful start;
- Card Studio first content/edit -> export completion.

### Secondary

- Voice exposure -> try -> Urdu success;
- substantial writing -> Keep/save conversion;
- successful outcome -> useful continuation;
- returning-browser signal when available.

### Commercial

- organic clicks on proven queries;
- useful monetizable pageviews/session;
- observed page RPM/earnings;
- daily AdSense revenue trend toward $5/day;
- CWV/task-completion guardrails.

---

## 20. Release discipline

This slice exists specifically to prevent another round of random UI changes.

Any proposed change to the core writing UI must answer, in its PR:

1. Which evidence/hypothesis from this spec does it address?
2. What exact state is changing (empty, first value, short, substantial, long, post-completion)?
3. What existing control/promo is being removed, demoted or replaced so density does not only increase?
4. What is the primary success event?
5. What are the guardrails?
6. How will Product Pulse identify the release/experiment?
7. What is the rollback path?

If those questions cannot be answered, the UI change should not be merged as part of this phase.
