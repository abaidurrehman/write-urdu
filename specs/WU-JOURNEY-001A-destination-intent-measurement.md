# WU-JOURNEY-001A — Destination Intent Measurement

**Status:** Planned — evidence foundation  
**Priority:** P1; telemetry design may proceed earlier only if isolated from core UI  
**Parent:** `WU-JOURNEY-001`  
**Depends on:** `WU-PLAT-002H-METRICS-CONTRACT`, `WU-ANALYTICS-003`  
**Primary systems:** product telemetry, Product Pulse, optional post-value prompt controller

---

## 1. Objective

Learn the intended destination/job behind Urdu-writing sessions without reading or storing user text.

This spec exists because current first-value telemetry can answer questions such as:

- did the writer become visible?
- did the user type?
- did Urdu conversion succeed?
- did they copy/export/share?

But it cannot reliably answer:

> **Why did the user need Urdu in the first place?**

That missing context makes roadmap decisions unnecessarily speculative.

---

## 2. Product rule

Intent measurement must never block writing.

Preferred trigger:

- after first useful value or first successful outcome;
- once per bounded session/eligibility window;
- only when no higher-priority growth request is active;
- dismissible;
- no modal takeover on mobile.

Do not ask on page load.

---

## 3. Prompt concept

English example:

**Where will you use this Urdu?**

- Message / WhatsApp
- Social post or status
- School / college
- Work or formal document
- Poetry / creative writing
- Print / design
- Typing practice / test
- Other

Urdu equivalent must be reviewed by a fluent Urdu speaker before release.

The exact visual treatment is implementation-owned by the shared design system. This spec does not approve a new design language.

---

## 4. Event contract

Use bounded enums only.

Suggested logical events:

- `destination_prompt_eligible`
- `destination_prompt_shown`
- `destination_prompt_selected`
- `destination_prompt_dismissed`
- `destination_outcome_first`

Suggested bounded properties:

- `destination_intent`: `message|social|school|formal_work|creative|print_design|practice|other`
- `workspace`: existing bounded workspace id
- `input_mode`: `english_letters|direct|voice|imported|unknown`
- `device_class`: existing bounded class
- `locale`: existing bounded locale
- `experiment_id`: bounded release/experiment id
- `outcome_category`: existing/approved bounded outcome category

Do **not** send arbitrary strings.

---

## 5. Eligibility/arbitration

The prompt is a **product research request**, and therefore competes with growth requests for attention.

Rules:

1. Never show before first useful text/value.
2. Never stack with `Keep this writing`, signup, Share or Publish prompts.
3. Do not show after every copy/export.
4. Respect a session/local cooldown.
5. Signed-in state must not change the question wording except where a separate approved experiment requires it.
6. A user who dismisses it must be able to continue the task normally.
7. The prompt must not cover editor text or mobile keyboard-critical controls.

---

## 6. Aggregation / Product Pulse

Product Pulse should eventually expose:

### Destination mix

- selected intents by count/share;
- by route/workspace;
- by device class;
- by input mode.

### Destination completion

For each intent:

- selected intent;
- first measured outcome category;
- destination-ready/meaningful-start where a handoff exists;
- conversion rate with a clearly defined denominator.

Example questions Product Pulse should answer:

- Are Voice users disproportionately messaging/social users?
- Do school-intent users reach Rich Editor or templates?
- Do print/design users actually export PDF/Word or use InPage?
- Do social-intent users reach an image maker and complete export?

---

## 7. Denominator discipline

Do not calculate misleading rates from repeatable events.

At minimum distinguish:

- eligible sessions/users/cohorts;
- prompt shown;
- selected;
- first destination outcome.

If the current aggregate architecture cannot support a clean same-grain denominator, add a dedicated bounded rollup rather than dividing unrelated counters.

---

## 8. Privacy / safety

Forbidden payloads:

- typed content;
- voice transcript;
- selected/pasted text;
- template content;
- search text typed inside template library;
- document title/filename;
- phone numbers/contact information;
- arbitrary destination names;
- URL query strings.

`other` must remain a category only. Do not ask the user to type a free-text explanation into telemetry.

---

## 9. Implementation slices

### A0 — Schema / event audit

- inspect current event allowlist and Product Pulse rollups;
- reuse existing bounded dimensions where possible;
- identify whether a new D1 migration is actually required;
- write tests before schema mutation.

### A1 — Telemetry support

- add approved event types/properties;
- enforce server-side allowlist validation;
- add tests proving arbitrary destination strings/content are rejected;
- no visible UI yet.

### A2 — Bounded experiment

After P0.1 allows core UI experimentation:

- ship to one appropriate route/cohort;
- show only after first value;
- instrument eligible/shown/selected/dismissed;
- preserve existing CTA arbitration.

### A3 — Product Pulse destination report

- destination mix;
- destination outcome table;
- device/input splits;
- bounded date/release comparisons.

### A4 — Decision review

After sufficient volume:

- keep/iterate/remove prompt;
- decide which destination categories justify contextual continuation;
- do not infer national Pakistan market shares from WriteUrdu traffic alone.

---

## 10. Acceptance tests

1. User can write/copy/export without ever answering the intent question.
2. Prompt never appears before first value.
3. Prompt never overlaps the active editor or mobile software keyboard action area.
4. No typed text reaches event payloads.
5. Server rejects unapproved destination values/properties.
6. `other` sends only the enum `other`.
7. Growth CTA arbitration prevents prompt stacking.
8. Product Pulse uses a defensible denominator for response rate.
9. Existing `writer_first_input / writer_eligible` and first-outcome funnels remain comparable across the release marker.
10. Feature can be disabled without affecting writing/input/export.

---

## 11. Success criteria

The first release succeeds if it provides **actionable destination evidence without hurting first-value activation**.

Do not set an arbitrary selection-rate target before baseline. The main decision is whether the response volume and downstream differences are large enough to improve roadmap prioritization.