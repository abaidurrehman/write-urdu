# WU-SHARE-001R — Recipient Start Continuity

**Status:** Active — P0 acceptance repair slice  
**Priority:** P0 under `WU-PLAT-002H`  
**Parent:** `WU-SHARE-001` Public Share Pages & Viral Publishing Loop  
**Activation owner:** `WU-PLAT-002H`  
**Area:** Distribution / referral activation  
**Decision date:** 2026-08-30

---

## 1. Why this slice exists

Current Product Pulse shows a tiny but important funnel:

`5 published links -> 9 public views -> 8 CTA clicks -> 0 referred starts`

This does not justify a statistical conversion target yet, but it is enough to identify an acceptance gap: the parent share contract is not successful merely because a public page renders and its CTA receives clicks.

The product must prove the recipient can actually reach a ready WriteUrdu workspace and begin creating.

Therefore this slice adds a hard end-to-end acceptance contract:

`reader -> CTA -> destination ready -> referred first action -> meaningful creation start`

It does **not** replace `WU-SHARE-001`'s storage, API, privacy, moderation, social-preview or deletion contracts. Those remain authoritative.

---

## 2. Primary question

For every recipient CTA click:

> Did the destination actually become ready for the promised task, and did the recipient begin creating?

A CTA click by itself is not success.

---

## 3. Supported recipient intents

At minimum support/measure the current public-page intents where present:

### Create your own

Promise: start a fresh relevant WriteUrdu creation/writing task.

Requirements:

- destination route is the correct owning workspace;
- workspace reaches ready state;
- focus/primary action is sensible for immediate start;
- authentication is not inserted before first value unless genuinely required by the destination action;
- referral context is recognized without exposing a public share ID in product telemetry.

### Use this text

Promise: continue with the intentionally public text.

Requirements:

- fetch/read the already-public source through the approved first-party share path;
- transfer through approved browser/session handoff;
- do not put full Urdu text into URL query/hash;
- target consumes/clears the handoff safely;
- an existing target draft is not silently overwritten;
- if exact restoration is not possible, the UI must not promise it.

### Community reader -> write your own

Where `WU-COMMUNITY-001` exposes a reader-to-writer CTA, apply the same destination-ready/meaningful-start acceptance, aggregated by source type rather than publication ID.

---

## 4. Referral state contract

The referral signal is bounded context, not user content.

Allowed logical state:

- source type: `share_page` / `community_reader`;
- intended destination workspace;
- intent: `create_own` / `use_public_text`;
- short expiry/version marker.

Do not place referral state in a public URL merely for analytics if a first-party session mechanism is sufficient.

Do not send:

- share/publication ID to Product Pulse;
- public text to analytics;
- author identity;
- management token;
- internal storage keys.

---

## 5. Required measurement

Reuse `WU-PLAT-002H-METRICS-CONTRACT.md`.

Required funnel:

1. public reader view;
2. recipient CTA impression;
3. CTA click;
4. destination response/load;
5. destination workspace ready;
6. referral context recognized;
7. first creation input/action;
8. meaningful referred start;
9. downstream outcome (copy/export/share/publish) when already measurable.

### Meaningful referred start

Use a bounded workspace-specific definition, e.g.:

- writing workspace: first input plus a minimal non-empty/useful state;
- Card/Name Art: text/import + first canvas change;
- another tool: its existing activation event.

Do not use dwell time alone.

---

## 6. Failure categories

Product Pulse/debugging should distinguish bounded failures such as:

- destination route failed;
- destination loaded but workspace not ready;
- referral context missing/expired;
- handoff payload rejected/conflict;
- user clicked but made no first action;
- telemetry gap/unknown.

Do not log uncontrolled error strings or user content.

---

## 7. UX rules

- Do not make the CTA larger/greener merely to solve the current 0-start number; current tiny sample already has high CTA clicks.
- The CTA label must match what the destination does.
- `Create your own` must not unexpectedly prefill private/local content.
- `Use this text` must not open an empty destination if the text transfer was promised and available.
- A failed/expired text handoff should show a calm recoverable state with an option to start fresh.
- Do not require account creation before beginning a normally anonymous WriteUrdu task.
- Keep account/save prompts governed by `WU-GROWTH-002` after value.

---

## 8. Browser acceptance

Test at minimum desktop + mobile:

### Share -> Create your own

- create/obtain a valid public share artifact;
- open public page;
- select CTA;
- verify exact destination route;
- verify destination ready marker/primary input;
- perform first creation action;
- verify referred-start telemetry contract without content.

### Share -> Use this text

- open public share with public text;
- select Use this text;
- verify no text in URL;
- verify target contains the approved public text through handoff;
- verify any existing target draft conflict is handled without silent loss;
- perform a meaningful target action.

### Community reader -> writer

When public community discovery is enabled:

- open a publication;
- select writer CTA;
- verify destination ready and first action measurable.

---

## 9. Product Pulse acceptance

The Share Loop card must stop at more than CTA clicks. It should expose at least:

`published -> public views -> CTA clicks -> destination ready -> referred starts -> meaningful referred starts -> republish`

If a denominator is too small, show counts and avoid strong conversion interpretation.

---

## 10. Success / closure

This slice can close when:

- [ ] CTA-to-destination trace exists for public Share and relevant community reader CTAs.
- [ ] Destination-ready is measured separately from CTA click.
- [ ] Referred start has a documented workspace-specific definition.
- [ ] `Create your own` end-to-end browser acceptance passes desktop/mobile.
- [ ] `Use this text` restores public text where promised without URL payload leakage.
- [ ] Existing draft conflicts do not silently destroy target work.
- [ ] No share/publication IDs or public text enter Product Pulse telemetry.
- [ ] Product Pulse displays destination-ready + referred-start steps.
- [ ] Production data can distinguish a true 0-start problem from a telemetry gap.
- [ ] No parent `WU-SHARE-001` storage/privacy/moderation behavior regresses.

Production referred starts should become non-zero with sufficient genuine traffic, but low sample size alone must not keep a technically correct path permanently open. The decisive acceptance is trustworthy measurement + functioning end-to-end behavior.

---

## 11. Non-goals

- redesigning public share-page branding;
- likes/comments/follows;
- account gates;
- changing share storage/API/data model;
- indexing arbitrary share pages;
- increasing CTA prominence without continuity evidence;
- using private user content for referral recommendations.
