# WriteUrdu Mobile Activation Evidence — 2026-09-03

**Programme:** `WU-PLAT-002H` Core Activation & Feature Discovery Acceptance  
**Repair contract:** `specs/WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`  
**Initial evidence date:** 2026-09-03  
**Latest evidence refresh:** 2026-09-04  
**Sources:** Google Search Console export downloaded 2026-09-04 covering 2026-08-05 through 2026-09-01; founder/user feedback; existing Product Pulse activation programme; shipped Gate B2 implementation history.

---

## 1. Trigger

Fresh direct user feedback reports a concrete mobile usability problem:

> users cannot easily spot the editing area on mobile.

This contradicts the earlier broad implementation acceptance that the Basic Writer canvas was already mobile-primary. The correct response is to reopen mobile first-screen acceptance rather than treat the prior checklist state as authoritative over observed user difficulty.

The runtime implementation and regression tests remain the source of truth for what shipped; this evidence note records why a new acceptance repair is necessary and how it should be measured.

---

## 2. Search Console mobile context — refreshed 2026-09-04

The 2026-09-04 Search Console export shows:

| Device | Impressions | Clicks | CTR | Avg position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 148,783 | 3,960 | 2.66% | 6.43 |
| Desktop | 70,878 | 4,839 | 6.83% | 8.66 |
| Tablet | 1,420 | 32 | 2.25% | 6.36 |

Interpretation:

- mobile represents **67.3% of all search impressions** in the export;
- mobile contributes only **44.8% of clicks** despite the majority of exposure;
- Google ranks WriteUrdu **better on mobile on average** than on desktop;
- mobile Search CTR is materially lower than desktop Search CTR;
- query mix and SERP presentation can explain a substantial part of the CTR gap, so this is **not proof that landing-page editor UX causes low Search CTR**;
- nevertheless, the product cannot afford a first-value mobile defect when roughly two-thirds of search exposure is mobile.

The mobile repair therefore optimizes **activation after arrival**. Search CTR is an acquisition diagnostic/guardrail owned with `WU-SEO-CTR-001`, not the primary success metric of this editor repair.

### 2.1 Exposure is accelerating

Comparing the latest 14 days in the export (2026-08-19 through 2026-09-01) with the preceding 14 days (2026-08-05 through 2026-08-18):

| Metric | Previous 14d | Latest 14d | Change |
| --- | ---: | ---: | ---: |
| Impressions | 85,016 | 136,065 | **+60.0%** |
| Clicks | 4,653 | 4,178 | **-10.2%** |
| CTR | 5.47% | 3.07% | lower |
| Impression-weighted avg position | 6.89 | 7.31 | slightly weaker |

This means the cost of unresolved mobile first-value friction is increasing because Google is exposing the site much more often. It does **not** mean the newly shipped Gate B2 repair caused the CTR decline: the GSC period ends before those changes shipped.

---

## 3. Critical chronology — this is a pre-repair baseline

The Search Console export ends on **2026-09-01**.

The main Gate B2 implementation shipped later:

- **2026-09-03:** Basic Writer first-viewport repair (`155b0e84...`) — demoted pre-editor mobile clutter, strengthened the real writing surface and added viewport acceptance coverage;
- **2026-09-04:** focus/keyboard + Rich Editor hierarchy repair (`d8763df...`) — improved mobile focus resilience and moved Rich Editor completion actions after the authoring surface.

Therefore the 2026-09-04 GSC export must be treated as an **acquisition/exposure baseline from before the mobile repair**, not as post-change evaluation.

Do not reopen or redesign the mobile UI again merely because this export still shows weak mobile Search CTR. First collect post-release Product Pulse activation evidence and a later GSC window that actually contains the new release.

---

## 4. English-to-Urdu demand context — refreshed

The same export shows very large exposure around the core English-to-Urdu typing intent:

- `english to urdu typing`: **52,768 impressions**, 35 clicks, **0.07% CTR**, avg position **7.12**;
- `english to urdu`: **5,575 impressions**, 5 clicks, 0.09% CTR, avg position 4.68;
- `english to urdu text`: **3,722 impressions**, 1 click, 0.03% CTR, avg position 9.72;
- adjacent English-to-Urdu writing/typing variants add further exposure.

`english to urdu typing` alone is roughly one quarter of all impressions in the export. That makes the homepage/mobile first-value journey commercially important, but the CTR issue itself belongs to the SERP-intent programme.

The correct sequencing is:

1. make the mobile writing task unmistakable and usable;
2. validate first-value activation after the Gate B2 release;
3. then intensify SERP CTR experiments against the already-earned demand under `WU-SEO-CTR-001`.

Driving materially more clicks before verifying first-value activation risks pouring more acquisition traffic into a confusing entry experience.

---

## 5. Proven product pattern

The Search Console export also shows that dedicated, exact-intent tools can perform very well when the page/task match is clear. Examples include high CTR for Urdu Editor query families and strong Stylish Urdu intent.

The product lesson is not “add more pages.” It is:

> when WriteUrdu exposes a clear owner for a clear job, users respond.

The mobile repair applies that lesson to the site's highest-volume core job: find the writer, type English letters, receive Urdu.

---

## 6. Why the prior acceptance is reopened

The existing `WU-PLAT-002H` checklist recorded items such as:

- keep writing canvas dominant on mobile;
- browser-test keyboard/touch/focus behavior.

Those implementation checks were valid for the shipped simplification at that time. They became insufficient as a closure claim because direct user observation reported that the writing area was still difficult to spot.

This is not treated as a contradiction to erase from history. Instead:

- earlier Gate B remains evidence that command-wall simplification shipped;
- `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR` became a **new B2 acceptance repair**;
- Basic Writer first-viewport and Rich Editor/focus repairs have now shipped;
- the gate remains open for remaining route audit plus post-change evidence.

---

## 7. Evidence-informed hypotheses

### H1 — Below-fold/displacement

On some mobile viewport combinations, pre-editor content or runtime-injected chrome consumed enough height that the real writing surface was not sufficiently visible.

**Status:** implementation response shipped on Basic Writer; verify with post-release evidence rather than assuming success.

### H2 — Weak affordance

The editor may technically be present but visually blend into the surrounding page, causing users not to recognize it as the primary interactive surface.

**Status:** implementation response shipped; acceptance still requires user/viewport validation.

### H3 — Keyboard/focus degradation

The editor may look acceptable before focus but become difficult to use after iOS/Android software keyboard resize/scroll behavior.

**Status:** M3 focus/viewport response shipped 2026-09-04; real-browser and post-release validation remain authoritative.

### H4 — Too much pre-value choice

Voice/tool/export/growth surfaces may compete with the core writing job before first Urdu success.

**Status:** Basic/Rich pre-value hierarchy was reduced under Gate B2; monitor for regressions and do not layer new pre-editor promotions back in.

---

## 8. Measurement ownership: acquisition vs activation

Do not conflate Search Console CTR with editor usability.

### Acquisition / Search Console

Useful diagnostics:

- mobile impression share;
- mobile/desktop Search CTR;
- query/page ownership;
- ranking position;
- `english to urdu typing` CTR and position.

These tell us how much traffic opportunity exists and whether SERP work is needed.

### Activation / Product Pulse

Primary mobile UX funnel:

1. writer eligible;
2. writer visible;
3. writer focused;
4. first input;
5. first Urdu success;
6. first outcome.

Also capture:

- route (`/`, `/urdu-editor`, `/urdu-keyboard` where supported);
- input mode;
- acquisition bucket;
- release marker;
- time-to-first-input bucket if available/added under the repair contract.

Do not collect writing content.

The primary Gate B2 success metric remains:

`mobile writer_first_input / mobile writer_eligible`

Search CTR may improve or worsen independently and must not be used to claim that the mobile editor repair succeeded or failed.

---

## 9. Decision rule

The repair should be judged primarily on **mobile first-value activation**, not aesthetics or Search CTR alone.

Strong evidence to keep the change:

- user-reported editor discoverability issue no longer reproduces on required mobile viewports;
- mobile first-input activation improves, with >=10% relative uplift considered a strong result when volume/mix are comparable;
- first-Urdu-success and first-outcome conversion remain stable or improve;
- no meaningful CWV/input-engine/desktop regression.

A smaller measured uplift can still justify keeping the repair when qualitative/acceptance evidence clearly removes a severe discoverability defect and downstream guardrails remain healthy.

Do not claim a causal uplift from the 2026-09-04 GSC export because its data predates the implementation.

---

## 10. Commercial interpretation

At the current 28-day mobile exposure, raising mobile Search CTR from 2.66% to 3.5% would mathematically correspond to roughly **1,247 additional clicks** over an equivalent impression volume.

This is an opportunity-size illustration, **not a forecast and not a Gate B2 success target**. Search CTR depends on query mix, snippet/intent fit, SERP layout and competitors. The mobile editor repair should make those future clicks more valuable by improving post-click activation; `WU-SEO-CTR-001` owns the separate CTR recovery work.

---

## 11. Strategic sequencing after the 2026-09-04 refresh

Until the mobile repair passes its first post-release review:

- do not introduce another major homepage feature;
- do not add another pre-editor promo/tool directory;
- do not rebuild Voice/transliteration engines;
- avoid bundling homepage title/meta experiments with layout changes;
- preserve the current Basic/Rich mobile hierarchy long enough to measure it;
- complete the `/urdu-keyboard` audit and any reproduced shared-contract violation;
- collect Product Pulse post-release activation evidence before making another broad UI move.

After the mobile repair is stable, the next high-leverage acquisition work remains the existing English-to-Urdu SERP intent/CTR opportunity under `WU-SEO-CTR-001` / `WU-GROWTH-001`.
