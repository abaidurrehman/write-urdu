# WU-JOURNEY-001C — Social, Copy & Card Outcome Continuity

**Status:** Planned / blocked by Card completion evidence  
**Priority:** P1 after `WU-PLAT-002H` P0.1F review  
**Parent:** `WU-JOURNEY-001`  
**Depends on:** `WU-PLAT-002H`, `WU-PLAT-002`, Card Studio completion telemetry  
**Related routes:** `/`, `/tools/urdu-voice-typing`, `/urdu-card-studio`, WhatsApp/Instagram social makers

---

## 1. Objective

Make the path from usable Urdu text to a social/messaging outcome feel like one journey instead of a set of unrelated tools.

This spec does **not** approve broader Card Studio promotion until its current edit→export leak has been diagnosed.

---

## 2. Existing strengths to preserve

WriteUrdu already supports:

- Copy from the Basic Writer;
- `Send to WhatsApp` from Voice Typing;
- contextual continuation/handoffs;
- Card Studio roles for quote/poetry, social post, status/story and greeting/announcement;
- dedicated WhatsApp Status and Instagram maker routes;
- Quick and Advanced Card Studio modes;
- caption copy and image export.

The missing layer is **intent-aware continuity and completion measurement**.

---

## 3. User jobs

### Message job

`input → usable Urdu → Copy / WhatsApp → leave successfully`

A short successful exit is a win. Do not add steps to increase dwell time.

### Social-text job

`input → usable Urdu → Copy/share text → destination app`

### Social-image job

`input → usable Urdu → choose image/status outcome → Card/social maker → export complete`

### Creative job

`poetry/quote text → attractive Nastaliq presentation → image → share`

---

## 4. Rules

1. Copy remains the fastest general-purpose completion action after first value.
2. Do not assume every short text is social content.
3. Social continuation may become prominent only after explicit intent or strong bounded context.
4. Do not claim WriteUrdu can directly post to platforms where it only prepares/downloads content.
5. Preserve text locally through existing handoff infrastructure; never place user content in URLs.
6. On mobile, social continuation must not cover the editor or keyboard-critical area.
7. No new account gate before Copy/download.

---

## 5. Card Studio dependency

Before expanding acquisition/continuation into Card Studio, close or materially progress `WU-PLAT-002H` P0.1F:

`visit → role/preset → content → canvas edit → export attempt → export complete`

If completion remains weak after Quick-path work, this spec must not compensate by sending more users into a leaking funnel.

---

## 6. Contextual continuation model

When `destination_intent = message`:

Primary:

- Copy

Secondary where supported/appropriate:

- WhatsApp
- More outputs

When `destination_intent = social`:

Primary should depend on the chosen social job, for example:

- Create status/image
- Copy caption/text

Secondary:

- other relevant image role
- More

When `destination_intent = creative` and text is short/moderate:

- Make poetry/quote image may become an eligible continuation after Card completion is healthy.

Do not expose all social makers simultaneously in the completion area.

---

## 7. Measurement

Required path measurements:

### Message

- intent selected;
- Copy / WhatsApp action;
- successful handoff where observable;
- no false requirement for a return event.

### Social image

- recommendation shown;
- recommendation selected;
- destination ready;
- text handoff restored;
- role/preset selected;
- export attempt;
- export complete.

### Guardrails

- first-value activation;
- Card Studio completion rate;
- mobile interaction/focus;
- handoff failures;
- accidental action rate where detectable.

---

## 8. Implementation slices

### C0 — Journey audit

- inventory every current Copy/share/social/Card continuation;
- identify duplicated or contradictory buttons;
- document which routes use Web Share, platform URLs, copy-only or download-only behaviour.

### C1 — Handoff correctness

- ensure Basic/Voice → Card/social destinations restore source text safely;
- instrument destination ready + meaningful start;
- do not change visual prominence yet.

### C2 — Card completion dependency review

- read current P0.1F data;
- only proceed with social-image recommendation if export completion is acceptable or has materially improved.

### C3 — One bounded intent-aware continuation experiment

- choose one source workspace and one social intent;
- one primary next action;
- compare downstream completed outcome, not click-through alone.

### C4 — Social role consolidation review

- assess whether users understand generic Card Studio vs specific WhatsApp/Instagram routes;
- preserve SEO routes even if product UI groups outcomes more simply;
- no URL deletion/merging solely for navigation simplicity.

---

## 9. Acceptance

1. Copy remains one-step after value.
2. No generic social tool grid is added to the active writer.
3. Card Studio recommendation does not expand before P0.1F evidence permits it.
4. Handoff never puts user text in the URL.
5. Destination-ready and export-complete are measured separately from clicks.
6. Platform claims match actual capability.
7. Mobile editor/keyboard acceptance remains green.
8. Dedicated SEO routes remain independently addressable.
9. Existing Voice `Send to WhatsApp` continues to work.
10. A short copy-and-leave session is counted as a valid successful outcome.