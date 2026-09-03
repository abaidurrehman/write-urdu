# WriteUrdu Mobile Activation Evidence — 2026-09-03

**Programme:** `WU-PLAT-002H` Core Activation & Feature Discovery Acceptance  
**Repair contract:** `specs/WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`  
**Evidence date:** 2026-09-03  
**Sources:** Google Search Console export through 2026-09-02; founder/user feedback; existing Product Pulse activation programme.

---

## 1. Trigger

Fresh direct user feedback reports a concrete mobile usability problem:

> users cannot easily spot the editing area on mobile.

This contradicts the earlier broad implementation acceptance that the Basic Writer canvas was already mobile-primary. The correct response is to reopen mobile first-screen acceptance rather than treat the prior checklist state as authoritative over observed user difficulty.

The runtime implementation and regression tests remain the source of truth for what shipped; this evidence note records why a new acceptance repair is necessary.

---

## 2. Search Console mobile context

The 2026-09-02 Search Console export shows:

| Device | Impressions | Clicks | CTR | Avg position |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 148,248 | 3,971 | 2.68% | 6.42 |
| Desktop | 68,089 | 4,844 | 7.11% | 8.71 |

Interpretation:

- mobile represents about **68% of search impressions**;
- Google ranks WriteUrdu **better on mobile on average**, yet mobile CTR is much lower;
- query mix explains part of the CTR difference, so this is not proof that the editor UI alone causes search CTR loss;
- nevertheless, the product cannot afford a first-value mobile defect when most search exposure is mobile.

This repair therefore optimizes **activation after arrival**, not just SERP CTR.

---

## 3. English-to-Urdu demand context

The same export shows very large exposure around the core English-to-Urdu typing intent, including:

- `english to urdu typing`: 53,673 impressions, 37 clicks, ~0.07% CTR, avg position ~7.13;
- `english to urdu`: 5,484 impressions, 5 clicks, avg position ~4.52;
- `english to urdu text`: 3,393 impressions, 1 click, avg position ~9.64;
- adjacent English-to-Urdu writing/typing variants add further exposure.

The commercial/product implication is sequencing:

1. make the mobile writing task unmistakable and usable;
2. validate first-value activation;
3. then intensify SERP CTR experiments against this already-earned demand.

Driving materially more clicks before fixing the first mobile action risks pouring more acquisition traffic into a confusing entry experience.

---

## 4. Proven product pattern

The Search Console export also shows that dedicated, exact-intent tools can perform very well when the page/task match is clear. Examples include high CTR for Urdu Editor query families and strong Stylish Urdu intent.

The product lesson is not “add more pages.” It is:

> when WriteUrdu exposes a clear owner for a clear job, users respond.

The mobile repair applies that lesson to the site's highest-volume core job: find the writer, type English letters, receive Urdu.

---

## 5. Why the prior acceptance is reopened

The existing `WU-PLAT-002H` checklist recorded items such as:

- keep writing canvas dominant on mobile;
- browser-test keyboard/touch/focus behavior.

Those implementation checks were valid for the shipped simplification at that time. They are now insufficient as a closure claim because direct user observation reports that the writing area is still difficult to spot.

This is not treated as a contradiction to erase from history. Instead:

- earlier Gate B remains evidence that command-wall simplification shipped;
- `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR` becomes a **new B2 acceptance repair**;
- the new repair has harder geometry, visual-hierarchy, keyboard, device and telemetry gates.

---

## 6. Evidence-informed hypotheses

### H1 — Below-fold/displacement

On some mobile viewport combinations, pre-editor content or runtime-injected chrome may consume enough height that the real writing surface is not sufficiently visible.

### H2 — Weak affordance

The editor may technically be present but visually blend into the surrounding page, causing users not to recognize it as the primary interactive surface.

### H3 — Keyboard/focus degradation

The editor may look acceptable before focus but become difficult to use after iOS/Android software keyboard resize/scroll behavior.

### H4 — Too much pre-value choice

Voice/tool/export/growth surfaces may compete with the core writing job before first Urdu success.

These are hypotheses to verify in Slice M1. The implementation must not assume all four are true.

---

## 7. Baseline to capture before repair

From Product Pulse / existing `WU-PLAT-002H` metrics, capture mobile route-level counts for:

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

---

## 8. Decision rule

The repair should be judged primarily on **mobile first-value activation**, not aesthetics.

Strong evidence to keep the change:

- user-reported editor discoverability issue no longer reproduces on required mobile viewports;
- mobile first-input activation improves, with >=10% relative uplift considered a strong result when volume/mix are comparable;
- first-Urdu-success and first-outcome conversion remain stable or improve;
- no meaningful CWV/input-engine/desktop regression.

A smaller measured uplift can still justify keeping the repair when qualitative/acceptance evidence clearly removes a severe discoverability defect and downstream guardrails remain healthy.

---

## 9. Strategic sequencing

Until the mobile repair passes its first release review:

- do not introduce another major homepage feature;
- do not add another pre-editor promo/tool directory;
- do not rebuild Voice/transliteration engines;
- avoid bundling repeated homepage title/meta tests with layout changes;
- preserve the existing P0 activation programme and commercial measurement work.

After the mobile repair is stable, the next high-leverage acquisition work remains the existing English-to-Urdu SERP intent/CTR opportunity under `WU-SEO-CTR-001` / `WU-GROWTH-001`.
