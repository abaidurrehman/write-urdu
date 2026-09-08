# WU-JOURNEY-001C — Messaging, Social, Copy & Card Outcome Continuity

**Status:** Planned / message work evidence-gated; Card acquisition blocked by Card completion evidence  
**Priority:** P1 after `WU-PLAT-002H` review; handoff audits may proceed earlier if isolated  
**Parent:** `WU-JOURNEY-001`  
**Depends on:** `WU-PLAT-002H`, `WU-PLAT-002`, Card Studio completion telemetry  
**Related:** `WU-VOICE-PLAT-001D`, `WU-JOURNEY-001G`  
**Related routes:** `/`, `/tools/urdu-voice-typing`, `/urdu-card-studio`, `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker`

---

## 1. Objective

Make the path from usable Urdu text to a messaging/social outcome feel like one journey instead of a set of unrelated tools.

The central distinction is:

> **A WhatsApp message is a text/copy/share job. A WhatsApp Status is an image-design job.**

WriteUrdu already supports both pieces in different places. This spec connects them without forcing users into image creation when they only need a line of Urdu text.

This spec does **not** approve broader Card Studio promotion until its current edit→export leak has been diagnosed.

---

## 2. Existing strengths to preserve

WriteUrdu already supports:

- Copy from the Basic Writer;
- `Send to WhatsApp` from Voice Typing;
- a dedicated Voice→WhatsApp message outcome contract in `WU-VOICE-PLAT-001D`;
- contextual continuation/handoffs;
- Card Studio roles for quote/poetry, social post, status/story and greeting/announcement;
- dedicated WhatsApp Status and Instagram maker routes;
- Facebook-oriented Card Studio role;
- Quick and Advanced Card Studio modes;
- caption copy and image export.

The missing layer is **intent-aware continuity, message-vs-image clarity, and completion measurement**.

---

## 3. User jobs

### 3.1 Message job

`input → usable Urdu → Copy / WhatsApp share intent → leave successfully`

Examples:

- family message;
- customer/shop reply;
- group message;
- short announcement sent as text.

A short successful exit is a win. Do not add steps to increase dwell time.

### 3.2 Social-text job

`input → usable Urdu → Copy/share caption or post text → destination app`

### 3.3 WhatsApp Status / Story job

`input → usable Urdu → Status image maker → export complete → user uploads to WhatsApp`

Do not label this as “send a WhatsApp message.”

### 3.4 Social-image job

`input → usable Urdu → choose image outcome → Card/social maker → export complete`

### 3.5 Creative job

`poetry/quote text → attractive Nastaliq presentation → image → share`

---

## 4. Rules

1. **Copy remains the fastest general-purpose completion action after first value.**
2. Do not assume every short text is social content.
3. Messaging and Status/image are separate destinations.
4. Social continuation may become prominent only after explicit intent or strong bounded context.
5. Do not claim WriteUrdu can directly post/upload to platforms where it only prepares, copies or downloads content.
6. Preserve text through existing safe handoff infrastructure; never put WriteUrdu-internal handoff text into URLs.
7. External platform share URLs/intents may encode the text only when the user explicitly invokes the platform share action and the existing privacy/product contract permits it.
8. On mobile, continuation must not cover the editor or keyboard-critical area.
9. No new account gate before Copy/download/platform-share.
10. A new SEO route is not justified merely because a destination exists.

---

## 5. Existing route gate for a dedicated WhatsApp message page

`WU-VOICE-PLAT-001D` already establishes a useful rule: do **not** create a dedicated WhatsApp-message maker route until evidence shows a distinct acquisition/product job that existing writing + share surfaces cannot serve cleanly.

Therefore this programme follows:

### Stage 1 — in-product message outcome

Use existing surfaces first:

- Basic Writer Copy;
- Voice result Copy / Send to WhatsApp;
- destination-aware continuation after P0 permits it;
- optional message preview experiment only if it helps users validate mixed RTL content.

### Stage 2 — evidence check

A dedicated route such as `/whatsapp-urdu-message` requires at least one of:

- meaningful GSC/search demand with a distinct query owner opportunity; or
- strong product usage showing repeat message-specific behaviour;

and must have a materially distinct user experience from the homepage and Status Maker.

### Stage 3 — route only if justified

If justified, the route should reuse the existing writer/transliteration engine rather than fork conversion logic.

Do not create it in this spec by default.

---

## 6. Candidate WhatsApp message experience

This is an **experiment design**, not automatic scope.

Potential message-specific support:

- compact chat-bubble preview;
- Copy message;
- platform share/open action on compatible devices;
- mixed-direction preview for English names/numbers/URLs;
- optional `Show English letters` companion from `WU-JOURNEY-001G`;
- clear link to `Make a WhatsApp Status image` for the separate visual job.

Avoid:

- recreating WhatsApp UI in detail;
- implying affiliation with WhatsApp/Meta;
- auto-opening WhatsApp without user action;
- making a phone mockup heavier than the writing job itself.

---

## 7. Card Studio dependency

Before expanding acquisition/continuation into Card Studio, close or materially progress `WU-PLAT-002H` P0.1F:

`visit → role/preset → content → canvas edit → export attempt → export complete`

If completion remains weak after Quick-path work, this spec must not compensate by sending more users into a leaking funnel.

---

## 8. Contextual continuation model

When `destination_intent = message`:

Primary:

- Copy

Secondary where supported/appropriate:

- WhatsApp share/open action
- optional message preview / More

Do **not** default to Status Maker.

When `destination_intent = social`:

Primary should depend on the chosen social job, for example:

- Create status/image
- Copy caption/text

Secondary:

- one other relevant image role
- More

When `destination_intent = creative` and text is short/moderate:

- Make poetry/quote image may become an eligible continuation after Card completion is healthy.

Do not expose all social makers simultaneously in the completion area.

---

## 9. Mixed-direction reliability

Messaging is where Urdu + Latin + numbers most visibly collide.

Browser/manual QA must include synthetic examples containing:

- English/Pakistani names;
- phone-number-shaped strings;
- PKR/amounts;
- links;
- emoji;
- multi-line messages.

If the copy is correct but preview rendering is confusing, fix preview/bidi handling rather than changing transliteration semantics.

A warning such as `Check numbers and English names after paste` may be tested only if it is genuinely useful and not permanently alarming users about a rare problem.

---

## 10. Measurement

Required path measurements:

### Message

- intent selected;
- Copy / WhatsApp action;
- optional preview opened;
- platform action invoked where observable;
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
- Copy outcome rate;
- Card Studio completion rate;
- mobile interaction/focus;
- handoff failures;
- accidental action rate where detectable.

Do not log message text or destination contact data.

---

## 11. Implementation slices

### C0 — Journey audit

- inventory every current Copy/share/WhatsApp/social/Card continuation;
- identify duplicated or contradictory buttons;
- document which routes use Web Share, platform URLs, copy-only or download-only behaviour;
- explicitly distinguish text-message and Status-image owners.

### C1 — Handoff/action correctness

- ensure Basic/Voice → Card/social destinations restore source text safely;
- verify Voice→WhatsApp action behaviour across supported mobile/desktop contexts;
- instrument destination ready + meaningful start where applicable;
- do not change visual prominence yet.

### C2 — Message evidence baseline

- measure existing Copy and Voice→WhatsApp usage;
- inspect GSC for distinct WhatsApp-message vs WhatsApp-status intent;
- decide whether a dedicated message experience needs a new route or can live as a bounded post-value panel/action.

### C3 — Card completion dependency review

- read current P0.1F data;
- only proceed with social-image recommendation if export completion is acceptable or has materially improved.

### C4 — One bounded intent-aware continuation experiment

- choose one source workspace and one message/social intent;
- one primary next action;
- compare downstream completed outcome, not click-through alone.

### C5 — Optional message preview experiment

Only if C2 indicates a real need:

- compact preview;
- correct RTL/mixed-direction rendering;
- Copy remains primary;
- Status Maker link remains secondary;
- no new route required for first experiment.

### C6 — Dedicated route decision

Only after product/search evidence:

- approve or reject a separate WhatsApp message route;
- if approved, reuse the existing writer engine;
- protect homepage query ownership and avoid combination-page SEO expansion.

### C7 — Social role consolidation review

- assess whether users understand generic Card Studio vs specific WhatsApp/Instagram routes;
- preserve SEO routes even if product UI groups outcomes more simply;
- no URL deletion/merging solely for navigation simplicity.

---

## 12. Acceptance

1. Copy remains one-step after value.
2. WhatsApp message and WhatsApp Status are visibly/semantically distinct outcomes.
3. No generic social tool grid is added to the active writer.
4. Card Studio recommendation does not expand before P0.1F evidence permits it.
5. Internal handoff never puts user text in the URL.
6. External share actions occur only after explicit user action and match the current privacy contract.
7. Destination-ready and export-complete are measured separately from clicks.
8. Platform claims match actual capability.
9. Mixed Urdu/Latin/numbers have browser/manual QA coverage.
10. Mobile editor/keyboard acceptance remains green.
11. Dedicated SEO routes remain independently addressable.
12. Existing Voice `Send to WhatsApp` continues to work.
13. No dedicated message route ships without its evidence gate.
14. A short copy-and-leave session is counted as a valid successful outcome.