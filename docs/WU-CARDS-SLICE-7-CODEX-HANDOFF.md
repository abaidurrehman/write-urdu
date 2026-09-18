# Write-Urdu Cards — Slice 7 Sharing / Virality Loop — Codex Handoff

Repository:

`https://github.com/abaidurrehman/write-urdu/`

Start from:

`main`

Current baseline when this handoff was authored:

- Slice 5A: inline own-words composer on `/urdu-cards` — merged.
- Slice 5B: Speak Urdu in the same composer — merged.
- Slice 6A: Card / WhatsApp Status / Instagram Post destinations — merged.
- Slice 6B: shared creation continuity across Card Studio / WhatsApp / Instagram — merged.
- Slice 6B merge commit: `86e6a1a8df7484875b6c72c88e291995b18defec`.

Current status (refreshed 2026-09-18):

- Slice 7A shipped through PR `#226`.
- Slice 7A squash commit: `0c835ffe2d53dbbcf29c3c1b13daf84d8911d269`.
- The 7A sections below are now the regression contract, not an instruction to reimplement it.
- Slice 7B is the next unimplemented slice, but it still requires explicit product authorization before implementation.

Feature:

**Slice 7 — Sharing / Virality Loop**

Canonical execution skill:

`skills/wu-cards-slice-7-sharing-virality/SKILL.md`

---

## Mission

Close the natural product loop:

`creator -> share link -> recipient sees useful card -> recipient starts own card -> recipient creates -> recipient shares/publishes again`

Do this by extending the **existing** WriteUrdu public-share and workspace-handoff architecture.

Do **not** build another sharing backend, another public-page system, another card renderer, another referral store, or another social editor.

The public `/s/:id` page should become a stronger acquisition surface for Urdu Cards while remaining lightweight, privacy-safe, noindex, and clearly user-generated.

---

## Read first, in this order

1. `AGENTS.md` if present.
2. `specs/README.md`
3. `specs/BACKLOG.md`
4. `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md`
5. `specs/WU-SHARE-001R-recipient-start-continuity.md`
6. `docs/WU-CARD-RETENTION-001-CODEX-HANDOFF.md`
7. `skills/wu-card-retention-001/SKILL.md`
8. `js/share-page.js`
9. `functions/s/[id].js`
10. `functions/api/shares.js`
11. `js/card-studio-publish.js`
12. `js/curated-card-share.js` if present on current main
13. `js/urdu-cards.js`
14. `js/urdu-cards-own-words.js`
15. `js/urdu-cards-social-formats.js`
16. `js/create-format-continuity.js`
17. `js/workspace-handoff.js`
18. `js/workspace-journey-registry.js`
19. `js/product-telemetry.js`
20. `tests/share-loop-contract.test.js`
21. current share-page / Urdu Cards / Card Studio browser tests.

Search current main for the actual owners before coding. Filenames above are architecture clues, not permission to assume nothing moved.

---

## Existing architecture that is authoritative

### Public sharing already exists

`WU-SHARE-001` owns:

- `/api/shares`;
- D1 share metadata;
- R2 published media;
- `/s/:id` server-rendered public pages;
- social OG/Twitter metadata;
- deletion/manage tokens;
- reporting/moderation;
- public-share privacy language;
- `origin_share_id` lineage;
- Product Pulse share-loop reporting.

Slice 7 must extend this system rather than fork it.

### Recipient continuity already exists

`WU-SHARE-001R` owns the semantic contract:

`reader -> CTA -> destination ready -> first creation action -> meaningful referred start`

A CTA click alone is not success.

### Urdu Cards is now a real low-friction creation surface

After Slices 5A/5B/6A/6B, `/urdu-cards` supports:

- ready-made cards;
- own words inline;
- Roman Urdu -> Urdu;
- direct Urdu/English/paste;
- Speak Urdu;
- direct image share;
- WhatsApp Status export;
- personalization;
- Card Studio handoff;
- WhatsApp / Instagram format handoff;
- returning state for canonical ready-made card IDs.

Slice 7 should use this strength for recipient acquisition.

---

# Scope strategy — implement easy -> hard

Do not implement all of Slice 7 in one giant PR.

Use the following sub-slices. Finish each with focused tests and a green quality run before proceeding.

---

## Slice 7A — Public share recipient -> Urdu Cards start

**Status:** shipped baseline; preserve and regression-test.

### Goal

Make `/s/:id` lead naturally into the simplest card-creation journey.

### Public-page hierarchy

Keep the shared visual as the hero.

Immediately after the shared artifact, show a compact recipient block with at most:

1. **Primary:** `Make your own Urdu card`
2. **Secondary:** `Use these words`
3. **Tertiary / lower emphasis:** existing deeper-edit route only where useful, e.g. `Edit in Card Studio`

Do not add a grid of many competing tools above the fold.

### Primary CTA semantics — Make your own Urdu card

Promise: start fresh.

Preferred destination: `/urdu-cards` inline own-words mode.

Requirements:

- no public text prefilled;
- own-words composer opens ready for typing/speech;
- focus is sensible for immediate start;
- Roman Urdu, Urdu, paste and Speak Urdu remain available;
- no account gate;
- no share ID or text in the URL;
- referral context is recognized through the existing bounded first-party/session mechanisms;
- public page stays unchanged if handoff fails.

### Secondary CTA semantics — Use these words

Promise: reuse the intentionally public Urdu text.

Preferred destination: `/urdu-cards` own-words mode with the public text restored through `WriteUrduWorkspaceHandoff` or another already-approved first-party handoff primitive.

Requirements:

- full Urdu text never appears in query/hash;
- `/urdu-cards` consumes and clears the incoming payload;
- the text enters the same `#urduCardsOwnText` state used by typing, voice and transliteration;
- the existing unique-background custom-message view is used;
- no duplicate renderer or alternate composer;
- handoff failure degrades to a fresh own-words start with calm status copy;
- no personalized/public text goes to telemetry.

### Workspace registry

If `/urdu-cards` is not currently a valid target workspace, make the **smallest explicit registry change** needed to support this exact recipient flow.

Do not make `/urdu-cards` accept arbitrary sources.

Prefer an explicit source/intent contract such as public-share -> urdu-cards.

### 7A acceptance

Desktop + mobile browser coverage must prove:

- `/s/:id` primary CTA reaches `/urdu-cards`;
- own-words mode is visibly active;
- fresh CTA does not copy the source text;
- `Use these words` restores the exact public text;
- URL remains clean;
- incoming payload is consumed;
- typing still works;
- voice fallback still works when unsupported;
- existing `/s/:id` Share / Copy / Download / Report behaviors remain intact;
- page has no horizontal overflow at 360px.

Stop after 7A and report before continuing to 7B.

---

## Slice 7B — Safe “Make your own version” / design remix

Implement only after 7A is green.

### Goal

Where the share artifact contains an approved reconstructible remix payload, let the recipient continue from the shared look without pretending unavailable assets are editable.

### UX

Expose a secondary action such as:

`Edit this design`

Only show/enable this promise when the share payload can genuinely reconstruct it.

### Rules

- reuse the existing sanitized `remix_payload_json` / `remix_mode` contract from `WU-SHARE-001`;
- fetch/read only bounded public data from the first-party share endpoint;
- restore through existing Card Studio project/handoff primitives;
- do not copy the public screenshot as if it were an editable background;
- local uploaded images that were not persisted as reconstructible assets must remain text-only fallback;
- never expose R2 object keys or management tokens;
- no share text/project in URL;
- Card Studio must validate the source explicitly;
- if exact design cannot be reconstructed, hide the exact-design promise rather than silently degrading after click.

### Preserve Slice 6B

Once the recipient is in Card Studio, the shared project must continue through the existing 6B shell:

`Card Studio -> WhatsApp -> Instagram -> Card Studio`

Do not create a second social-format continuity mechanism for remixes.

---

## Slice 7C — Republish lineage closure

Implement only after 7A/7B behavior is stable.

### Goal

Prove that a recipient-origin creation can become a new public share artifact linked to its origin through the **existing** `origin_share_id` mechanism.

### Existing behavior to audit first

Current Card Studio publish code already reads `writeUrdu.shareReferral.v1` and can submit `origin_share_id`.

Verify before changing anything.

### Requirements

- preserve the bounded share referral marker as users move through `/urdu-cards`, Card Studio and the 6B social-format shell;
- do not persist public text merely to keep lineage;
- do not leak the share ID to Product Pulse event payloads;
- do not put `origin_share_id` in destination URLs;
- if `/urdu-cards` has a public-link publishing path, audit whether it already attaches origin lineage; reuse the same helper rather than creating parallel logic;
- if own-words mode intentionally hides public publishing for privacy, do not casually re-enable it. Any new public publish action must retain an explicit publish disclosure/confirmation.

### Product Pulse acceptance

The funnel should be observable as counts, not personal identities:

`published -> public view -> CTA -> destination ready -> meaningful referred start -> republish`

When sample size is tiny, show counts and avoid over-interpreting percentages.

---

## Slice 7D — Lightweight return / repeat hooks

Implement only after the core recipient + republish loop is working.

### Goal

After a user completes a share/publish action, avoid a dead end without adding noisy growth UI.

Good candidates:

- `Make another card`
- `Browse more Urdu cards`
- `Create WhatsApp Status`
- `Create Instagram Post`

Rules:

- reuse existing routes and 6A/6B handoffs;
- max one primary + one or two secondary return actions per completion state;
- no forced modal after every share;
- no account gate;
- no streak/gamification system in this slice;
- no personalized recommendation based on private editor text;
- returning-state persistence may store canonical card IDs only, following Slice 4 privacy rules.

---

# Non-negotiable architecture rules

## 1. One public-share backend

Never create:

- `/api/card-shares-v2`;
- another D1 share table;
- another R2 bucket contract;
- another public `/card/:id` route.

Use `WU-SHARE-001`.

## 2. No duplicate recipient state

Do not invent a second referral/localStorage scheme if `writeUrdu.shareReferral.v1` / workspace handoff already covers the need.

If abstraction is needed, extract a shared helper and migrate existing callers.

## 3. No private content telemetry

Never send:

- Urdu text;
- Roman Urdu text;
- recipient identity;
- author identity;
- share ID/publication ID;
- management token;
- arbitrary URL;
- uploaded asset names;
- clipboard content.

Telemetry may use bounded dimensions such as:

- source type = public_share;
- destination workspace = urdu-cards/card-studio;
- intent = create_own/use_public_text/remix_design;
- stage = impression/click/destination_ready/meaningful_start/republish;
- success/failure enum.

## 4. Public pages remain noindex

Do not change `WU-SHARE-001` SEO safety:

- `noindex,follow`;
- no sitemap inclusion;
- no UGC discovery feed;
- no arbitrary structured-data endorsement;
- deleted/blocked content unavailable.

## 5. No AdSense in Slice 7

The public share page remains a product-led distribution surface, not an ad landing page.

Do not introduce AdSense in this implementation unless a later explicit product decision changes `WU-SHARE-001`.

## 6. No social-network mechanics

Do not add:

- likes;
- comments;
- follows;
- public profiles;
- follower counts;
- public card feed;
- public engagement counters.

## 7. Public publishing remains explicit

Never publish because the user:

- downloads PNG;
- shares an image file;
- opens a social maker;
- enters own-words mode.

Public URL creation must remain an explicit action with the existing disclosure model.

---

# UX principles

## Recipient page

The recipient should answer three questions immediately:

1. What did someone share with me?
2. Can I make something like this?
3. What is the easiest next step?

Do not make them understand WriteUrdu's internal tool taxonomy first.

## CTA wording must match state

Examples:

- `Make your own Urdu card` = fresh start.
- `Use these words` = public text is copied into the next workspace.
- `Edit this design` = reconstructible design is restored.

Never label a text-only fallback as “edit this exact design.”

## Mobile first

The public share link will commonly be opened from WhatsApp/social apps.

At 360px:

- hero image fits;
- primary CTA is obvious;
- no horizontal overflow;
- actions are thumb-friendly;
- no giant multi-row toolbar before the content;
- report/help remains lower emphasis.

---

# Expected implementation direction

Do not treat these filenames as mandatory. Search current main first.

Likely files to inspect/update for 7A:

```text
functions/s/[id].js
js/share-page.js
js/workspace-journey-registry.js
js/workspace-handoff.js
js/urdu-cards-own-words.js
js/urdu-cards-returning-state.js or the current Urdu Cards boot owner
js/product-telemetry.js
share-page CSS owner
```

Prefer one small recipient adapter such as:

```text
js/urdu-cards-public-share-entry.js
```

only if there is not already a suitable generic destination adapter.

Do not bury public-share import logic inside the main card renderer.

Likely tests:

```text
tests/share-loop-contract.test.js
existing share-page browser spec
existing urdu-cards-own-words.spec.js
existing urdu-cards-social-formats.spec.js
new focused recipient->cards spec only if the existing protected suite cannot own it cleanly
```

Before creating a new Playwright file, inspect `.github/workflows/quality.yml` and the contract test runner. Register every new test in the repo's existing governance paths.

---

# Test-first requirements

Before 7A UI changes, add failing coverage for:

```text
fresh public-share CTA -> /urdu-cards own-words active
fresh CTA does not prefill public text
Use these words -> exact public text restored
no text in URL
handoff consumed
source explicitly bounded to public-share
no new localStorage text persistence
mobile 360px no overflow
existing share/copy/download/report preserved
```

For 7B add:

```text
reconstructible design -> Card Studio restoration
text-only artifact -> exact-design CTA absent
uploaded/non-reconstructible source -> no false exact-remix promise
management token/internal keys never exposed
Slice 6B format switching still works after remix
```

For 7C add:

```text
referral recognized after destination load
meaningful creation start event contains no text/share ID
republish submits origin_share_id server-side where already approved
origin lineage absent from public URL
expired referral fails closed
```

Never weaken or remove an existing regression test to get green.

---

# Required validation

Use focused tests during development.

Before each PR is considered complete, run the repository's authoritative checks, including at least:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Run focused Playwright for:

- public share page;
- recipient -> `/urdu-cards`;
- own-words typing + voice fallback;
- public-text restoration;
- Card Studio handoff where touched;
- 360px mobile layout.

Before merge, prefer the protected GitHub **Quality checks** workflow as the authoritative result, including the full focused product browser matrix and V3 production visual-quality audit.

A cancelled/timed-out run is not green.

If main has an unrelated failure, reproduce it on clean main and document it. Do not weaken the threshold to make this PR pass.

---

# PR discipline

One sub-slice per PR.

Suggested branches:

```text
ux/urdu-cards-virality-7a-recipient-start
ux/urdu-cards-virality-7b-safe-remix
ux/urdu-cards-virality-7c-republish-lineage
ux/urdu-cards-virality-7d-return-hooks
```

For every PR report:

1. **Changed** — exact files and behavior.
2. **Preserved** — public API/storage/moderation/SEO safety and existing share actions.
3. **Handoff** — source -> target, payload kind, explicit source validation.
4. **Privacy** — confirm URL/telemetry/storage constraints.
5. **Tests** — exact commands and browser results.
6. **Mobile** — 360px result.
7. **Risk** — known edge cases.
8. **Rollback** — how to disable the slice without breaking public shares.

---

# Definition of success

Slice 7 is not successful because the public share page has prettier buttons.

It is successful when a recipient can open a real shared card, understand the next action, start a fresh card or intentionally reuse the public words without URL leakage, reach a ready workspace on desktop/mobile, continue through the existing card/social creation architecture, and—when they explicitly publish—produce a new share whose lineage can be measured without exposing content or identity.

The product loop should be technically trustworthy before we optimize its conversion rate.

---

# Codex execution prompt

Use this exact prompt when starting Codex:

> Work in `abaidurrehman/write-urdu` on **Write-Urdu Cards Slice 7 — Sharing / Virality Loop**. Start from current `main`. Read `docs/WU-CARDS-SLICE-7-CODEX-HANDOFF.md` and `skills/wu-cards-slice-7-sharing-virality/SKILL.md` in full, then read the authoritative parent specs `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md` and `specs/WU-SHARE-001R-recipient-start-continuity.md`. Inspect current runtime/tests before editing because Slice 7A shipped through PR `#226`. Treat 7A as a protected regression baseline: fresh recipient starts remain fresh, `Use these words` restores only intentionally public text through the approved handoff, URLs stay clean, sources remain bounded to `public-share`, Share/Copy/Download/Report remain intact, and telemetry contains no text or share IDs. Do not reimplement 7A. Continue only the explicitly authorized remaining sub-slice, beginning with 7B when requested. Reuse the existing WU-SHARE-001 backend, 5A/5B own-words and voice path, and 6A/6B card/social architecture. Add focused contract and browser coverage for the selected slice, run the authoritative Quality workflow, and stop at that slice's acceptance gate. Do not bundle 7B/7C/7D together.
