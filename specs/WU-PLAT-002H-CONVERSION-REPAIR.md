# WU-PLAT-002H — Post-Value Conversion Repair

**Status:** Active — P0 execution child of `WU-PLAT-002H`  
**Priority:** P0  
**Parent:** `WU-PLAT-002H — Core Activation & Feature Discovery Acceptance`  
**Evidence:** `docs/WU-CORE-ACTIVATION-EVIDENCE-2026-09-06.md`  
**Related:** `WU-PLAT-002`, `WU-PLAT-004`, `WU-GROWTH-002`, `WU-GROWTH-003`, `WU-SHARE-001R`, `WU-COMMUNITY-001`, `WU-ANALYTICS-003`  
**Decision date:** 2026-09-06

---

## 1. Executive decision

WriteUrdu now shows strong engagement inside its main writing products, but weak conversion from **first value → next meaningful action**.

This child contract turns the remaining `WU-PLAT-002H` gates into an implementation sequence that Claude/Codex can execute without broad UI churn.

The programme must improve this loop:

```text
arrive
→ get Urdu
→ complete the immediate job
→ see one relevant next action
→ continue without losing work
→ optionally keep/share/publish
→ return
```

The key constraint is sequencing: **fix measurement and continuity before changing promotion.** The latest Product Pulse contains impossible >100% funnel rates and inconsistent handoff step counts. UI optimization based on those ratios would be unsafe.

This is not a new feature epic. It is a focused closeout of existing P0 activation, continuation and growth-arbitration work.

---

## 2. Why this is P0 now

Latest current-period evidence:

- 5,323 product visits;
- 4,225 engaged visits;
- 79.4% engagement;
- Basic Editor engagement 88.9%;
- Rich Editor engagement 95.8%;
- 593 exports completed;
- 268 copy completions, +191% vs previous period;
- continuation shown 2,585 times but only 88 selections and 6 measured meaningful starts;
- 19 new accounts, including 3 voice-assisted sign-ups;
- 227 non-zero writing sessions reached 1,000+ characters;
- mobile is ~42% of product visits;
- Google Search contributes ~60% of measured product entries.

The product has enough value surfaces. The next gain should come from making successful sessions **compound**, not from adding another unrelated tool.

---

## 3. Scope

### In scope

1. telemetry denominator normalization for first-value, continuation and Card Studio funnels;
2. consolidation/diagnosis of continuation handoff paths;
3. contextual continuation ranking after value;
4. one shared growth-request arbiter for Keep / Share / Community Publish;
5. voice-success account/save experiment through that arbiter;
6. long-form state-based continuation;
7. progressive prioritization of proven output formats without removing existing capability;
8. Product Pulse reporting required to judge the above;
9. bounded browser/route tests and privacy checks;
10. 7-day+ post-release decision review.

### Explicitly out of scope

- another broad mobile redesign before the current B2 closeout;
- changing canonical URLs/H1/title ownership for growth messaging;
- a new voice engine or speech provider;
- paid voice APIs;
- a new DB;
- storing/uploading audio or writing content for telemetry;
- account gating before writing/voice value;
- new generic feature directories/carousels;
- removing export formats solely due one low-volume window;
- major Card Studio redesign before its normalized funnel is understood;
- share-page redesign before reader volume exists.

---

## 4. Product invariants

### 4.1 First value remains dominant

No account/share/publish request may displace the writing surface or input choices before useful Urdu/text exists.

### 4.2 One growth request at a time

At any one decision point, only one of these may be promoted:

- Keep / account save;
- Share;
- Community Publish.

Normal task commands such as Copy, PDF and Word are not growth requests and remain available according to the owning workspace rules.

### 4.3 Remove/demote before adding

Any new visible CTA must identify the existing control/promo it replaces, demotes or consolidates. This slice must not create another banner layer.

### 4.4 State, not content

Recommendation decisions may use:

- workspace;
- device class;
- signed-in state;
- unsaved/saved state;
- bounded length/depth bucket;
- input mode;
- successful outcome category;
- completion state;
- approved experiment marker.

They must not inspect semantic content, transcript words, names, filenames or document/share IDs.

### 4.5 No lost work

Any continuation that navigates away from a writing surface must either:

- use the existing safe handoff/draft system; or
- leave the source work recoverable if destination import fails.

Never place user text in URLs.

### 4.6 SEO and monetization guardrails

Protect existing query-owner routes, mobile first-value layout, CWV, and active authoring safety. No ad may be inserted into or deceptively adjacent to the writing/input/CTA decision area as part of this work.

---

# 5. Ordered implementation slices

The order below is mandatory unless a blocking defect forces a smaller preparatory change.

---

## Slice 0 — Funnel denominator and telemetry normalization

### Goal

Make Product Pulse rates trustworthy enough to drive the later slices.

### Problem

Current Product Pulse contains examples such as:

- first input / focus >100%;
- first outcome / Urdu success >100%;
- Card Studio export attempt / export step reached >100%;
- payload restored > destination ready;
- repeated final speech events represented next to unique session steps.

These are useful event counters but invalid funnel-conversion denominators.

### Requirements

1. Identify each event as one of:
   - unique session-state transition;
   - repeatable event count;
   - attempt count;
   - outcome count.
2. For metrics named `rate`, `conversion`, `success rate` or equivalent, use compatible unique eligible session/attempt denominators.
3. Keep repeated counters available separately where useful.
4. Re-label repeatable voice metrics as `final results per start` or equivalent.
5. Product Pulse must show numerator and denominator in the metric definition/tooltip/footnote.
6. Funnel rows must not imply sequence when a step is optional or belongs only to one branch (for example Quick vs Advanced Card Studio).
7. Continuation events emitted by legacy and v2 paths must share a bounded path/version dimension so they can be compared without double interpretation.
8. Add contract tests preventing a `success rate` / `conversion` metric from using a repeatable numerator.
9. Do not migrate historical aggregate data unless necessary; mark the new release boundary and compare post-release data cleanly.

### Acceptance

- no Product Pulse metric labelled success/conversion can mathematically exceed 100%;
- event-per-start ratios may exceed 1× only when explicitly named as frequency ratios;
- continuation and Card funnels expose branch/path meaning;
- no content is added to telemetry;
- a release marker is visible for post-change comparison.

### Stop rule

Do not begin continuation UI changes until this slice can produce a trustworthy source/destination recommendation funnel.

---

## Slice 1 — Continuation path consolidation and diagnostic

### Goal

Turn continuation from an opaque 2,585 shown → 6 meaningful-start aggregate into a debuggable product journey.

### Required funnel

Per stable recommendation ID and source/destination pair:

```text
eligible
→ shown
→ selected
→ handoff created/stored (when required)
→ destination response/ready
→ payload accepted/restored (when required)
→ meaningful start
→ destination outcome (when already available)
```

### Requirements

1. Reuse `WU-PLAT-002` handoff infrastructure; do not add a new ad-hoc storage mechanism.
2. Give every contextual recommendation a stable enum ID.
3. Record source workspace, destination workspace, path version and bounded release marker.
4. If a step is not applicable, model it as N/A rather than failure.
5. A destination is not `ready` merely because navigation started.
6. A click alone is never `handoff success`.
7. Meaningful start must represent interaction with the destination task, not page load.
8. Preserve consume-once handoff semantics where already implemented.
9. Preserve source recoverability if destination restore/import fails.
10. Build Product Pulse breakdowns for at least:
    - Basic → Rich;
    - Basic → relevant create/stylish destinations currently recommended;
    - completion → share/save destinations where governed;
    - legacy vs v2 path until legacy is safely retired/consolidated.

### Diagnostic phase before UI change

After normalized data is available, answer:

- which recommendations are shown most often?
- which have low `shown → selected`?
- which have healthy selection but poor destination readiness?
- which restore successfully but fail meaningful start?
- are mobile and desktop materially different?

### UI change rule

Only the identified failing stage may be changed.

Examples:

- low selection → test copy/relevance/placement;
- low destination ready → fix navigation/runtime;
- low restore → fix handoff/import contract;
- low meaningful start after restore → fix destination acknowledgement/focus/context.

Do not use a larger CTA to mask a transport defect.

---

## Slice 2 — Shared growth-request arbiter

### Goal

Complete the existing open `WU-PLAT-002H` / `WU-GROWTH-002` rule: **one growth request at a time**.

### Required request families

- `keep`
- `share`
- `community_publish`

### Required eligibility order

1. **Recovery / value protection**
   - substantial unsaved signed-out writing → `Keep this writing` may win.
2. **Task completion**
   - Copy/PDF/Word/etc. remain normal commands and are not suppressed by growth arbitration.
3. **Distribution**
   - after a meaningful completion, Share may become eligible.
4. **Publishing**
   - Community Publish may become eligible only for supported writer/community states and only when it does not compete with higher-priority recovery/value protection.

### Signed-in behavior

- never show account-acquisition wording to signed-in users;
- if content is already safely saved, Keep is not eligible merely because writing is long;
- publishing may be offered according to community eligibility, not simply account status.

### Required arbiter API behavior

Exact code structure is implementation-owned, but there must be **one logical owner** that takes bounded state and returns either:

```text
none
keep
share
community_publish
```

It must not return multiple simultaneous promotional requests.

### Telemetry

For each request family:

- eligible;
- shown;
- clicked/opened;
- completed;
- dismissed when useful;
- suppressed_due_to_arbitration;
- suppression winner/reason as a bounded enum.

No content.

---

## Slice 2 implementation note — 2026-09-06

Implemented on branch `feature/product-pulse-slice2-growth-arbiter` for review. The shared owner now returns exactly one promoted family (`none`, `keep`, `share`, `community_publish`), keeps normal task commands independent, suppresses losing growth families, keeps signed-in copy free of account-acquisition wording, and emits aggregate-only Slice 2 diagnostics under release marker `wu-plat-002h-s2-2026-09-06-v1`. Voice-success Keep prompting remains explicitly deferred to Slice 3.

## Slice 3 — Voice-success → Keep/account experiment

### Goal

Test whether successful Voice users are a high-intent account/save cohort without gating Voice or creating a separate signup system.

### Evidence

Current period:

- 91 voice tries;
- 51 produced Urdu;
- 19 new accounts;
- 3 voice-assisted sign-ups.

This is a directional signal only.

### Eligibility

The experiment may show `Keep this writing` / account-save messaging only when all are true:

- user is signed out;
- Voice has actually produced/inserted Urdu text;
- meaningful user-owned text remains in the workspace;
- the work is not already safely account-saved;
- no higher-priority or currently active growth request exists;
- user has not just dismissed the same request within the bounded suppression period;
- normal Voice and writing functionality remains fully usable without signup.

### Timing

Never before microphone use. Never on permission request. Never while listening/interim recognition is active.

Preferred trigger: **after final Urdu has been successfully committed and the interface has returned to an idle/editable state**.

### Copy principles

Lead with retained value, not account bureaucracy.

Approved direction:

- English: `Keep this writing` / `Save this writing to your account`
- Urdu equivalent should communicate keeping/saving the writing clearly.

Do not promise cloud safety/sync behavior beyond the actual `WU-DRAFT-001` implementation.

### Continuity

If account navigation is used, preserve the current writing through the existing account-growth draft handoff. The user must return with their text intact according to the owning save/auth contract.

### Experiment measurement

At minimum compare:

```text
eligible successful voice sessions
→ prompt shown
→ account flow opened
→ account created/sign-in completed
→ writing restored/saved
```

The final success is restored/saved writing, not signup page navigation.

### Guardrails

- no drop in Voice completion caused by an intrusive prompt;
- no transcript/audio telemetry;
- no signup gate;
- no duplicate Keep banner from another component.

---

## Slice 4 — Long-form continuation and retention

### Goal

Use the real 1,000+ writing cohort to offer relevant next steps without turning length into a popup trigger.

### State model

#### E3 — substantial writing

Approximate existing state: 500–999 characters.

Eligible normal task continuations:

- Rich Editor / formatting;
- Word;
- PDF.

Signed-out unsaved work may make Keep eligible through the arbiter.

#### E4 — long-form writing

Approximate existing state: 1,000+ characters.

Priority logic:

1. protect unsaved work with Keep when eligible;
2. maintain Rich Editor/Word/PDF as normal task continuations;
3. after meaningful completion, Share may be eligible;
4. Community Publish may be eligible only under community rollout/state rules and arbitration.

### Interaction requirements

- do not fire a modal exactly at character 1,000;
- depth crossing changes eligibility/state, not forced interruption;
- surface the request at a natural idle/completion/continuation point;
- preserve at most three visible continuation actions;
- no semantic inspection of the writing;
- no generic tool directory.

### Basic → Rich

Rich Editor remains the preferred formatting escalation because its measured engagement is 95.8% in the current period.

The handoff must:

- preserve text;
- not overwrite a conflicting Rich draft silently;
- acknowledge restored/imported state;
- preserve source recovery on failure;
- measure destination meaningful start.

---

## Slice 5 — Proven-output prioritization

### Goal

Reduce completion clutter by reflecting actual output usage while preserving capability.

Current output evidence:

- PDF 278;
- Word 176;
- PNG 138;
- JPEG 1;
- TXT 0;
- SVG 0.

### Rules

1. PDF/Word may receive stronger prominence for substantial/long writing.
2. PNG remains relevant where visual/image jobs make sense.
3. JPEG/TXT/SVG may be placed under an existing `More`/additional outputs surface where not already so.
4. Do not delete lower-frequency export code in this slice.
5. Do not reorder outputs on routes where the owning task has different evidence (for example image/design tools) without route-specific validation.
6. Copy/export functionality must stay account-free.
7. No new dropdown framework if an existing accessible progressive surface can be reused.

### Measurement

Observe:

- export-start rate after first useful text;
- export completion by format;
- abandonment/error changes;
- mobile command discoverability.

Do not optimize for more clicks at the expense of completion.

---

## Slice 6 — Share loop continuity only

### Goal

Keep `WU-SHARE-001R` correct and measurable without overreacting to tiny reader volume.

Current period has 2 published links and 0 public views.

### Requirements

- verify publish → public page → CTA → destination ready → referral recognized → first input → meaningful start;
- preserve `Use this text` restore behavior without text in URL;
- preserve `Create your own` ready-state behavior;
- keep privacy and public snapshot semantics unchanged;
- no CTA redesign solely because current referred-start count is zero.

### Evidence gate for UX optimization

Do not judge reader CTA design until at least **20 human public views** or a longer observation window exists. This is a pragmatic minimum sample gate, not a statistical-significance claim.

---

## Slice 7 — Post-change review and backlog decision

### Minimum review window

- 7 days after the last material conversion/telemetry release where traffic supports it;
- longer for low-volume share/community paths.

### Required review

For each slice, record:

```text
Keep
Iterate
Rollback
Insufficient evidence
```

### Metrics to review

- first-value funnel by device/workspace;
- continuation shown → selected → ready → meaningful start by recommendation;
- Keep/Share/Publish eligible/shown/completed/suppressed;
- Voice-success → Keep/account → restored/saved;
- Basic → Rich meaningful continuation;
- output completion by format;
- Card Studio normalized completion funnel;
- share/referral continuity when volume exists;
- any CWV/mobile/SEO regression indicators available in the current control planes.

### Roadmap rule

Only after this review should the feature-breadth freeze be reconsidered.

---

# 6. Acceptance guardrails

## 6.1 Core task protection

A conversion experiment fails acceptance if it:

- obscures the writer/input mode before first value;
- requires signup to copy/export/voice/type;
- causes text loss on navigation/auth/handoff;
- creates duplicate promotional CTAs;
- introduces forced scroll/focus loops on mobile;
- breaks TinyMCE or Basic Writer behavior;
- degrades accessibility of primary commands.

## 6.2 Quantitative guardrail policy

Do not invent absolute conversion targets from one snapshot.

For rollout decisions, compare the post-change cohort against the nearest clean release-marked baseline. A material regression in first Urdu success, first outcome, Voice success, export completion, CWV or mobile usability blocks expansion even if the target CTA itself receives more clicks.

Where an automated rollback threshold is useful, the implementation PR must state the chosen threshold and why the current sample volume supports it. Do not silently bake speculative percentages into shared code.

## 6.3 Privacy

Forbidden telemetry includes:

- typed Urdu/English text;
- speech transcript/audio;
- selected text;
- filenames;
- document/share/community IDs;
- emails/account IDs in product telemetry;
- raw uncontrolled referrer/query data.

Account-system operational data remains governed by the auth/draft contracts and must not be copied into anonymous Product Pulse events.

---

# 7. Product Pulse requirements

Product Pulse should support these views after Slice 0/1:

### 7.1 First value

```text
eligible/viewed
→ visible
→ focus
→ first input
→ first Urdu success
→ first outcome
```

Unique session-state conversion, desktop/mobile split.

### 7.2 Continuation

Per recommendation/source/destination:

```text
eligible
shown
selected
ready
restored/accepted (when applicable)
meaningful start
outcome
```

### 7.3 Growth arbitration

For Keep / Share / Publish:

```text
eligible
shown
completed
suppressed by arbiter
```

### 7.4 Voice retention

```text
voice produced Urdu
→ Keep eligible
→ Keep shown
→ account flow completed
→ writing restored/saved
```

### 7.5 Data quality

Every rate must identify:

- numerator;
- denominator;
- unique vs repeatable semantics;
- release/path marker where relevant.

---

# 8. Likely implementation surfaces to inspect

The agent must inspect the repository before assuming exact ownership. Likely relevant surfaces include:

```text
js/product-telemetry.js
js/workspace-next-step.js
js/workspace-journey-registry.js
js/workspace-handoff.js
js/text-handoff.js
js/account-growth-entry.mjs
js/input-mode.js
js/writer-voice-input.js
main.js

functions/api/* product-pulse / telemetry rollup paths
functions/os/* Product Pulse UI paths

specs/WU-PLAT-002H-METRICS-CONTRACT.md
specs/WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md
specs/WU-PLAT-002H-UX-STATE-MATRIX.md
specs/WU-GROWTH-002-account-save-share-entry-points.md
specs/WU-SHARE-001R-recipient-start-continuity.md
```

Search for current owner filenames when paths have moved. Runtime code + tests are authoritative for shipped behavior.

---

# 9. Testing contract

Every implementation slice must add/update focused regression tests before broad refactoring.

At minimum preserve/run the repository's applicable checks, including where available:

```bash
npm test
npm run seo:check
npm run locale:check
npm run governance:check
npm run test:browser
```

Focused coverage must include:

- rate denominators cannot use repeatable numerators as success/conversion;
- recommendation IDs are bounded enums;
- no content in telemetry;
- continuation destination-ready and meaningful-start semantics;
- handoff consume-once/recovery behavior;
- one growth request at a time;
- signed-in user does not see account acquisition;
- signed-out substantial unsaved work prioritizes Keep;
- Voice works fully without account prompt acceptance;
- Voice Keep prompt occurs only after successful final commit;
- account navigation preserves/restores writing;
- long-form depth changes eligibility without forced modal interruption;
- Copy/PDF/Word remain normal commands;
- lower-frequency exports remain reachable;
- mobile first screen/editor hierarchy is not regressed;
- share reader CTA preserves no-text-in-URL behavior.

Physical/mobile validation remains governed by the existing mobile acceptance matrix; do not claim B2 complete from desktop browser tests alone.

---

# 10. PR / slice discipline for coding agents

Implement **one slice per PR** unless two slices are inseparable at code level and the PR explains why.

Every PR must state:

1. slice implemented;
2. evidence/problem being addressed;
3. owner modules inspected;
4. existing UI removed/demoted/consolidated;
5. telemetry numerator/denominator semantics;
6. privacy review;
7. handoff/text-recovery behavior;
8. routes/devices affected;
9. automated checks run;
10. manual/mobile checks still required;
11. release/experiment marker;
12. next slice explicitly left out.

Do not mark `WU-PLAT-002H` complete merely because one CTA experiment ships.

---

# 11. Recommended first implementation PR

The first coding PR after this spec should be **Slice 0 only**:

> Normalize Product Pulse funnel denominators and path semantics without materially changing user-visible CTA/layout behavior.

Reason: the current continuation and Card Studio ratios are not trustworthy enough to choose the correct UI repair.

After that PR has clean post-release data, execute Slice 1 diagnostic/consolidation, then Slice 2 arbiter, then Slice 3/4 experiments.

The execution skill is `skills/core-activation-conversion/SKILL.md`.