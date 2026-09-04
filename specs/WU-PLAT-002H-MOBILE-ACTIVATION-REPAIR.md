# WU-PLAT-002H — Mobile Editor Activation Repair

**Status:** Active — implementation shipped for M2–M4; evidence closeout pending  
**Priority:** P0 — hold hierarchy stable until post-change review  
**Parent programme:** `WU-PLAT-002H` Core Activation & Feature Discovery Acceptance  
**Route owner dependency:** `WU-PLAT-004` Basic Writer Adaptive Command Surface  
**Measurement owner:** `WU-PLAT-002H-METRICS-CONTRACT.md` / Product Pulse  
**SEO coordination:** `WU-SEO-CTR-001` — do not combine this UX repair with repeated SERP metadata experiments  
**Evidence:** `docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md` (refreshed 2026-09-04)  
**Acceptance matrix:** `WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`  
**Decision date:** 2026-09-03  
**Evidence refresh:** 2026-09-04

---

## 1. Why this repair exists

The broad Basic Writer simplification shipped under `WU-PLAT-002H` and the earlier implementation checklist recorded that the writing canvas was dominant on mobile. Fresh founder/user feedback then contradicted that acceptance assumption: **mobile users reported that they could not easily spot the editing area**.

This is a first-value defect, not a cosmetic preference.

The refreshed 2026-09-04 growth evidence makes the defect commercially important:

- mobile accounts for **148,783 of 221,081 Search Console impressions (67.3%)**;
- mobile average position is **6.43**, stronger than desktop at **8.66**, while mobile Search CTR is only **2.66%** versus **6.83%** desktop;
- `english to urdu typing` alone receives **52,768 impressions** at average position **7.12**;
- overall impressions in the latest 14 days are **+60.0%** versus the preceding 14 days, while clicks are **-10.2%**;
- the product's first value depends on the visitor finding the writing surface and producing Urdu immediately.

These Search Console numbers establish **exposure and opportunity**, not causality. Search CTR happens before landing-page interaction and is affected by query mix, snippet/intent fit, SERP layout and competitors. The editor repair must therefore be judged on **post-click activation**, not on Search CTR alone.

The previous generic mobile acceptance remains **reopened** until the Gate B2 post-release evidence closes it. A checked historical item saying the writer was mobile-primary does not override observed user difficulty.

---

## 2. Product decision

For mobile writing routes, the first usable viewport must make the primary writing surface unmistakable.

The required hierarchy is:

`intent -> one compact example -> input choice -> visible writing surface`

not:

`intent -> marketing -> tool discovery -> growth CTA -> voice promo -> instructions -> writing surface`

The editor is the product. A visitor must not need to hunt, scroll through promotional content, open a panel, or understand WriteUrdu's product taxonomy before starting.

This is a **hierarchy + viewport + focus/keyboard repair**, not a site redesign.

### 2.1 Implementation state as of 2026-09-04

The core repair is no longer only planned:

- **M2 / Basic Writer first viewport shipped 2026-09-03** in `155b0e84...`;
- **M3 focus/keyboard resilience + M4 Rich Editor hierarchy shipped 2026-09-04** in `d8763df...`.

The contract now protects the shipped hierarchy and governs remaining acceptance, `/urdu-keyboard` audit, real-device validation and post-change measurement.

---

## 3. Primary hypothesis

If the writing surface is visibly present and visually dominant in the initial mobile viewport, with secondary content demoted until after first value, then more eligible mobile visits will progress through:

`writer_visible -> writer_focused -> writer_first_input -> writer_first_urdu_success -> writer_first_outcome`

and median/bucketed time to first input will improve without harming successful completion, Core Web Vitals, SEO ownership, privacy, or desktop behavior.

### 3.1 Chronology guardrail

The 2026-09-04 Search Console export covers **2026-08-05 through 2026-09-01**. It ends before the M2–M4 implementation shipped.

Therefore:

- treat that export as a **pre-repair acquisition baseline**;
- do not claim the mobile repair caused the observed Search CTR gap;
- do not reopen the UI again because the pre-repair export still looks weak;
- first collect post-release Product Pulse activation evidence and a later GSC window that actually contains the new release.

---

## 4. Route priority

### P0 route A — `/`

The homepage/Basic Writer owns the highest-value acquisition journey. M2 implementation has shipped; preserve it long enough to measure.

### P0 route B — `/urdu-editor`

The Rich Editor has strong observed engagement and is the natural continuation for substantial writing. M4 implementation has shipped; completion controls must remain after the authoring surface on mobile.

### P1 route C — `/urdu-keyboard`

Audit after `/` and `/urdu-editor`. Apply the same first-action rule where the primary job is typing/writing. Do not assume a failure without reproducing it.

### Audit-only routes

`/tools/urdu-voice-typing` and other input surfaces should be checked for the same anti-pattern, but this repair must not trigger an unrelated redesign or duplicate the existing Voice platform.

---

## 5. Mobile first-viewport contract

### 5.1 Required content before/with the writer

The first usable viewport may contain only what is necessary to answer:

1. What does this page do?
2. How do I enter Urdu?
3. Where do I type?

On `/`, this normally means:

- concise `English to Urdu Typing` intent language or approved equivalent;
- at most one compact conversion example such as `mera khayal hai -> میرا خیال ہے`;
- compact input choices (`English letters -> Urdu`, `Type Urdu directly`, `Speak Urdu` when supported);
- the writing surface itself.

### 5.2 Elements that must not displace the writer

The following must not sit above the writer in a way that pushes it out of the initial mobile viewport:

- large Voice Typing promotional cards;
- all-tools/product directories;
- account/sign-up promotion;
- Community publish promotion;
- Save/Share growth banners;
- export command walls;
- long how-to copy;
- SEO support sections;
- large ad units;
- redundant `Start typing` CTAs whose only purpose is to navigate to the actual editor.

These can remain available below the workspace or become contextual after first value according to `WU-PLAT-002H`.

### 5.3 Observable viewport acceptance

At each required test viewport:

- the writing surface begins within the first visual viewport without user scroll;
- at least **160 CSS px of usable editing surface** is visible at 375x667-class height;
- at least **220 CSS px of usable editing surface** is visible on common >=800px-tall mobile viewports, unless browser chrome/OS keyboard is already open;
- the visible editor area is not merely a thin border/sliver used to satisfy a test;
- no overlay, cookie/ad element, sticky navigation, promo, or toolbar masks the usable area;
- the editor is visually identifiable as interactive without relying only on placeholder text.

These are minimum acceptance floors, not layout targets. Prefer more visible workspace when it does not make intent/input choices ambiguous.

### 5.4 Editor visual prominence

The writer must have:

- a clear container boundary against the page background;
- a sufficiently large tap target and minimum working height;
- an obvious empty state/placeholder;
- a visible focus state;
- readable Urdu/English text at mobile zoom defaults;
- no competing card above it with substantially stronger visual weight.

Do not solve prominence by introducing unrelated brand/color changes.

---

## 6. Empty-state interaction contract

### 6.1 No forced discovery step

A mobile visitor must be able to tap the writer directly.

A `Start typing` action may exist for navigation/accessibility elsewhere, but on the primary mobile acquisition flow it must not be a required gateway to reveal the editor.

If retained above the fold, it must be secondary and must scroll/focus the real writer safely rather than create a second pseudo-input.

### 6.2 Do not autofocus on page load

Do not automatically focus the writing surface merely to improve the metric.

On mobile, autofocus can open the software keyboard before the user understands the page and can consume most of the visual viewport.

Required sequence:

`page ready -> writer visibly available -> user taps/focuses -> keyboard opens`

### 6.3 Input choices stay compact

English-letter typing remains the proven default acquisition/input path.

Direct Urdu and Voice remain discoverable, but they must not become large cards that push the writer away.

Reuse the existing Voice engine and input-mode architecture. No recognition/transliteration engine rewrite belongs in this repair.

---

## 7. Focus + software-keyboard contract

A page that looks correct before focus can still fail once iOS/Android opens the keyboard.

### 7.1 Required behavior

After the user taps the writer:

- the active line/caret remains within the effective visual viewport;
- the writer is not scrolled behind a sticky header;
- essential writing context remains visible;
- horizontal overflow is absent;
- input-mode controls do not unexpectedly cover the caret;
- transient browser viewport resize does not create a large blank gap or layout jump;
- dismissing the keyboard does not leave the page in a broken scroll position.

### 7.2 Writing-state simplification

While focused on small screens, non-essential chrome may be reduced/collapsed if needed, provided:

- the behavior is predictable;
- accessibility/navigation is preserved;
- normal actions remain reachable after writing;
- content is not removed from the document solely for analytics/SEO manipulation.

### 7.3 Implementation guidance

Use CSS/layout first. Use `visualViewport` or focus/resize JavaScript only where browser behavior genuinely requires it.

Do not add a fragile scroll loop or repeated forced `scrollIntoView()` behavior that fights the user's own scrolling.

---

## 8. Post-value hierarchy

This repair must preserve the state model already approved by `WU-PLAT-002H` / `WU-PLAT-004`.

### E0 — empty

Primary: input choice + writer.

### E1 — first useful text

Copy becomes obvious. Do not interrupt first success with account, publish, export, or promotional walls.

### E2 — short writing

Copy remains primary; contextual continuation stays bounded.

### E3/E4 — substantial/long writing

Rich Editor, PDF/Word, and Keep may become relevant under existing continuation/arbitration rules.

### E5 — post-completion

Share/Publish/other continuation may be promoted under the one-growth-request rule.

The mobile repair must **not** regress the adaptive command work by restoring a permanent toolbar wall.

---

## 9. Measurement contract

Reuse `WU-PLAT-002H-METRICS-CONTRACT.md`. Do not invent a parallel analytics vocabulary where equivalent events already exist.

Minimum mobile funnel:

1. `writer_eligible`
2. `writer_visible`
3. `writer_focused`
4. `writer_first_input`
5. `writer_first_urdu_success` where applicable
6. `writer_first_outcome`

Required dimensions:

- workspace/route;
- mobile/desktop device class;
- input mode;
- locale;
- acquisition bucket;
- release/experiment marker.

### 9.1 Additional diagnostic

Measure time-to-first-input as a bounded aggregate/bucket, not as user content:

- <=2s
- 3–5s
- 6–10s
- 11–20s
- >20s
- no first input

If equivalent timing already exists, reuse it.

### 9.2 Primary metric

`mobile writer_first_input / mobile writer_eligible`

Secondary:

- `writer_focused / writer_visible`;
- `writer_first_urdu_success / writer_first_input`;
- `writer_first_outcome / writer_first_input`;
- time-to-first-input distribution.

### 9.3 Acquisition diagnostics — not causal acceptance

Record Search Console alongside the activation review, but keep ownership clear.

Pre-repair GSC baseline from the 2026-09-04 export:

| Device | Impressions | Clicks | CTR | Avg position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 148,783 | 3,960 | 2.66% | 6.43 |
| Desktop | 70,878 | 4,839 | 6.83% | 8.66 |

Additional context:

- mobile = **67.3% of impressions**;
- latest 14 days: **136,065 impressions / 4,178 clicks / 3.07% CTR**;
- prior 14 days: **85,016 impressions / 4,653 clicks / 5.47% CTR**;
- `english to urdu typing`: **52,768 impressions / 35 clicks / 0.07% CTR / position 7.12**.

These figures justify keeping mobile first-value work at P0 and make future CTR work high leverage. They do **not** establish that editor UX caused Search CTR, and they cannot measure the M2–M4 release because they predate it.

### 9.4 Success/guardrail decision

A strong result is a **>=10% relative improvement** in mobile first-input activation with stable downstream success. Lower uplift can still be kept when direct user testing clearly resolves the visibility defect and guardrails are neutral; do not fabricate statistical certainty from low volume.

Guardrails:

- no material degradation (>5% relative without an understood mix change) in first-Urdu-success or first-outcome conversion;
- no new content leakage;
- no meaningful CLS/INP/LCP regression on the affected routes;
- no desktop regression;
- no loss of input-mode/Voice accessibility;
- no change to search ownership/metadata bundled into the same experiment unless explicitly coordinated with `WU-SEO-CTR-001`.

### 9.5 Required causal discipline

- Product Pulse activation = primary Gate B2 verdict.
- Viewport/manual acceptance = required qualitative/functional verdict.
- Search Console = exposure/acquisition context and later cross-check.
- Do not use Search CTR alone to Keep / Iterate / Rollback the editor layout.

---

## 10. Implementation slices

### Slice M1 — Baseline + DOM/layout audit

**State:** substantially completed for Basic/Rich implementation; Product Pulse baseline reconciliation still open.

- confirm the actual DOM order and CSS for `/`, `/urdu-editor`, `/urdu-keyboard`;
- identify every block that appears before the first editable surface at mobile breakpoints;
- map sticky/fixed elements and runtime-injected growth/tool UI;
- capture current first-value funnel by mobile/route;
- take reference screenshots at required viewports;
- identify whether user feedback is caused by below-fold position, weak visual affordance, keyboard behavior, or multiple causes.

**Exit:** evidence identifies the concrete displacement/affordance problem. No speculative redesign.

### Slice M2 — Homepage first viewport

**State:** **shipped 2026-09-03** (`155b0e84...`).

- reorder/demote above-editor content as needed;
- keep intent + one example + compact input choice;
- make the real writer visible and unmistakable;
- preserve source-owned adaptive command architecture;
- do not add a second mobile editor or cloned controls;
- preserve crawlable support content below the task.

**Exit:** `/` passes the acceptance matrix before keyboard opens.

### Slice M3 — Focus/keyboard behavior

**State:** **implementation shipped 2026-09-04** (`d8763df...`); manual real-device closeout remains.

- verify iOS Safari and Android Chrome behavior;
- fix sticky-header/caret/visual-viewport conflicts;
- avoid forced-scroll loops;
- keep first converted Urdu visible during normal typing where practical;
- verify keyboard dismiss/restore.

**Exit:** focused writing remains stable and usable.

### Slice M4 — Rich Editor hierarchy

**State:** **shipped 2026-09-04** (`d8763df...`).

- ensure the editable TinyMCE/workspace surface is immediately recognizable;
- demote toolbar/export/help/discovery chrome that obscures first action on small screens;
- preserve formatting/export capability through progressive/stable controls;
- preserve Basic -> Rich handoff and draft protection.

**Exit:** `/urdu-editor` passes mobile first-action and keyboard acceptance.

### Slice M5 — Remaining input surfaces

**State:** open.

- audit `/urdu-keyboard` and other writing-first routes;
- fix only confirmed violations of the shared mobile contract;
- do not broaden into unrelated tool redesign.

### Slice M6 — Post-change evidence review

**State:** open and now the principal Gate B2 closure task.

- hold a stable release marker from the M2–M4 implementation;
- compare at least 7 days where volume supports it;
- review mobile first-input, first-Urdu-success, first-outcome, time-to-first-input and CWV;
- review device Search CTR only as contextual acquisition evidence, not the causal editor verdict;
- record Keep / Iterate / Rollback decision;
- only then proceed to the next major acquisition/CTR experiment.

---

## 11. Required viewport/browser acceptance

Automated/mobile-emulation coverage must include at minimum:

- 360 x 800 Android-class viewport;
- 375 x 667 small iPhone-class viewport;
- 390 x 844 modern iPhone-class viewport;
- 412 x 915 Android-class viewport.

Manual/real-browser acceptance must cover, where available:

- iOS Safari;
- Android Chrome.

Desktop smoke tests remain required to ensure the mobile repair does not regress the established writer.

---

## 12. Accessibility requirements

- the editor has an accessible name/instruction relationship;
- input choices have textual accessible names;
- focus order follows visual/task order;
- no control becomes keyboard-inaccessible due to mobile-only DOM relocation;
- focus indication is visible;
- touch targets meet the project's existing mobile accessibility standard;
- zoom is not disabled to make layout easier;
- RTL/LTR behavior remains correct for Urdu and English-letter input.

---

## 13. SEO/content boundary

This repair is allowed to **move** support/SEO content below the primary workspace while keeping it crawlable and semantically structured.

It must not:

- delete useful search-intent content solely to gain vertical space;
- hide SEO text with deceptive techniques;
- create new near-duplicate English-to-Urdu doorway routes;
- combine a major title/meta rewrite with the UX experiment unless the change has a separate release marker and measurement plan.

The first mobile viewport is product UI; crawlable supporting depth can live after first value.

The large Search CTR opportunity around `english to urdu typing` belongs to `WU-SEO-CTR-001`; do not turn this mobile contract into an unbounded metadata experiment.

---

## 14. Non-goals

This repair does **not** authorize:

- a full visual rebrand;
- new typography/color systems;
- a new editor engine;
- transliteration-provider changes;
- a second Voice implementation;
- a new global tool directory;
- new monetization inside the writing surface;
- large account/community promotion;
- a desktop redesign merely for symmetry;
- mass changes to unrelated tool pages;
- new product features.

---

## 15. PR discipline

Every implementation PR under this repair must state:

1. route/state being repaired;
2. observed user/evidence problem;
3. what existing UI is removed, moved, collapsed, or demoted;
4. primary metric;
5. guardrails;
6. release marker;
7. screenshots at required viewports;
8. keyboard/focus validation where applicable;
9. rollback path.

A PR that only **adds another mobile card/control/promo** without removing or demoting competing pre-value UI fails this contract.

For any follow-up after 2026-09-04, the PR must also explain why the existing M2–M4 implementation is insufficient using post-release evidence. Do not churn the hierarchy from pre-release GSC numbers.

---

## 16. Definition of done

This mobile acceptance repair can close only when:

- `/` clearly exposes the real writing surface in the initial required mobile viewports;
- a first-time user can focus/type without opening another UI layer;
- software-keyboard behavior is stable on target mobile browsers;
- `/urdu-editor` exposes its primary editable surface without a pre-editor command wall;
- confirmed violations on `/urdu-keyboard` are resolved or explicitly documented as non-blocking;
- Product Pulse can compare `eligible -> visible -> focus -> first input -> first Urdu -> first outcome` by device/route/release;
- a comparable post-2026-09-04 mobile activation window is reviewed;
- no writing content enters telemetry/URLs;
- CWV/desktop/input-engine guardrails pass;
- a post-change evidence review records Keep / Iterate / Rollback;
- the founder/user-reported “cannot spot the editing area on mobile” problem can no longer be reproduced in the acceptance matrix.
