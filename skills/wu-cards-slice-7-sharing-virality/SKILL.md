# Write-Urdu Cards Slice 7 — Sharing / Virality Loop

Use this skill whenever implementing, reviewing or continuing **Slice 7 — Sharing / Virality Loop** for Write-Urdu Cards.

This skill is intentionally strict because the work touches public user-generated pages, anonymous publishing, referral state, Urdu Cards, Card Studio, social makers, Product Pulse and privacy-sensitive handoffs.

---

## Mission

Strengthen the product-led loop:

`creator -> public share -> recipient -> new creation -> explicit republish`

while reusing the existing WriteUrdu platform.

The first executable child is **7A — Public share recipient -> Urdu Cards start**.

Do not implement 7B/7C/7D in the same PR unless explicitly instructed after 7A is accepted.

---

## Mandatory read order

Read these in full before coding:

```text
AGENTS.md                                         # if present
specs/README.md
specs/BACKLOG.md
specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md
specs/WU-SHARE-001R-recipient-start-continuity.md
docs/WU-CARDS-SLICE-7-CODEX-HANDOFF.md
docs/WU-CARD-RETENTION-001-CODEX-HANDOFF.md
skills/wu-card-retention-001/SKILL.md
js/share-page.js
functions/s/[id].js
functions/api/shares.js
js/card-studio-publish.js
js/urdu-cards.js
js/urdu-cards-own-words.js
js/urdu-cards-social-formats.js
js/create-format-continuity.js
js/workspace-handoff.js
js/workspace-journey-registry.js
js/product-telemetry.js
tests/share-loop-contract.test.js
```

Then search current main for the active share-page, Urdu Cards, handoff and Playwright owners.

Do not trust stale filenames or old assumptions.

---

## Founder/product intent

The public share page is not a social network and not an ad landing page.

Its job is:

1. show the thing someone shared;
2. make it obvious that the recipient can create something similar;
3. make the next creation step very easy;
4. preserve user trust and local-first behavior;
5. create a measurable referral loop without tracking content or identity.

The strongest current creation entry for casual card users is `/urdu-cards`, not a brand-new editor.

---

# Slice 7A — execution contract

## Public share page

Keep the shared visual dominant.

Immediately after it, provide a compact recipient-start section.

Preferred hierarchy:

```text
Make your own Urdu card        # primary
Use these words                # secondary
Edit in Card Studio            # lower emphasis only if still useful
```

Do not add a large tool chooser.

Do not move report/help into the hero hierarchy.

### Make your own Urdu card

Semantics: **fresh start**.

Destination: `/urdu-cards` own-words mode.

Required result:

- own-words composer is open;
- no public text prefilled;
- input is ready for typing;
- Roman Urdu/direct Urdu/paste still work;
- Speak Urdu remains available through the existing 5B enhancement;
- recipient can continue to card previews and existing share/social actions;
- no account required.

### Use these words

Semantics: intentionally reuse public text.

Destination: `/urdu-cards` own-words mode.

Required result:

- exact public Unicode text enters the same existing own-words textarea/state;
- custom-message unique-background previews appear normally;
- existing Share image / WhatsApp / personalization / social-format behavior remains available according to current privacy rules;
- no alternate textarea, card renderer or transliteration pipeline.

---

## Handoff rules

Use `WriteUrduWorkspaceHandoff` unless current main has an even more canonical approved primitive.

### Fresh start

Referral context may be carried, but public text must not be copied.

### Use these words

Use a bounded `plain-text` handoff.

The source must be explicitly `public-share`.

If `/urdu-cards` needs target registration, add only the minimum intended acceptance path.

Do not make it a generic open target for every workspace.

The destination must consume/clear the payload.

### Never put content in the URL

Forbidden examples:

```text
/urdu-cards?text=...
/urdu-cards#text=...
/urdu-cards?share=...
/urdu-cards?origin_share_id=...
```

---

## Referral state

Reuse the existing share referral contract.

Current architecture includes `writeUrdu.shareReferral.v1` and `origin_share_id` support in Card Studio publishing.

Audit current behavior before modifying it.

Do not create:

```text
writeUrdu.cardsReferral.v1
writeUrdu.viralSource.v1
writeUrdu.publicShareSource.v2
```

unless the existing platform cannot represent the state and the change has been explicitly justified.

Referral state must remain bounded metadata, not user content.

---

## Privacy invariants

Never write private/custom card text into localStorage for this slice.

Never send to telemetry:

- public/private Urdu text;
- Roman Urdu input;
- share ID;
- origin share ID;
- author name;
- recipient identity;
- clipboard data;
- management token;
- arbitrary URLs or error strings.

Allowed telemetry dimensions are bounded enums/IDs such as:

```text
source_type = public_share
intent = create_own | use_public_text | remix_design
destination_workspace = urdu-cards | card-studio
stage = cta_impression | cta_click | destination_ready | meaningful_start | republish
success = true | false
failure_reason = approved enum
```

Follow the existing telemetry allowlist/normalizer.

---

## WU-SHARE-001 invariants

Do not regress:

- `/api/shares` ownership;
- D1/R2 storage contract;
- immutable public snapshot semantics;
- report/delete behavior;
- manage-token secrecy;
- opaque public IDs;
- dynamic social metadata;
- `noindex,follow`;
- sitemap exclusion;
- blocked/deleted handling;
- explicit public publishing disclosure.

No new public share backend is allowed.

---

## SEO safety

Public UGC share pages remain distribution-only.

Do not:

- index them;
- add them to sitemap;
- add them to llms.txt discovery;
- create a public share feed;
- add schema implying editorial endorsement.

The existing canonical/social metadata behavior remains authoritative.

---

## Ads / monetization

Do not add AdSense to `/s/:id` in Slice 7.

The parent share spec explicitly keeps Phase 1 public UGC pages ad-free.

A monetization change requires a separate explicit product decision and privacy/UX review.

---

## No social-network expansion

Out of scope:

- likes;
- comments;
- followers;
- public profiles;
- public counters;
- ranking/feed/discovery;
- public reaction APIs;
- account-required publishing.

---

# Slice 7B — safe visual remix guardrails

Only work on this after 7A is accepted.

If a public share has a fully reconstructible sanitized remix payload, an `Edit this design` path may restore it into Card Studio.

Rules:

- reuse `remix_payload_json` / `remix_mode` semantics;
- fetch only bounded first-party public share data;
- never expose storage keys/manage tokens;
- do not pretend a screenshot or unavailable uploaded background is editable;
- hide the exact-design CTA when reconstruction is not supported;
- reuse Card Studio's existing project model/renderer;
- after restore, Slice 6B remains the only Card Studio <-> WhatsApp <-> Instagram continuity shell.

Never add a second remix renderer.

---

# Slice 7C — republish lineage guardrails

Only work on this after recipient start is proven.

Audit first:

- `js/card-studio-publish.js` referral handling;
- existing `origin_share_id` submission;
- Product Pulse share-loop aggregation;
- any `/urdu-cards` public-link publishing helper.

Do not duplicate lineage logic.

Success means an explicitly republished child can be linked server-side to its parent while analytics remain aggregated and content-free.

The public share ID may exist where required for server-side lineage, but it must not be emitted into Product Pulse telemetry or destination URLs.

---

# Slice 7D — return/repeat hooks guardrails

Keep completion states lightweight.

Good options:

```text
Make another card
Browse more Urdu cards
Create WhatsApp Status
Create Instagram Post
```

Max one primary and one/two secondary actions per completion state.

Do not force a popup after every share.

Do not add streaks/gamification in this slice.

Do not infer recommendations from private text.

---

## Existing feature contracts that must survive

Slice 5A:

- own-words inline on `/urdu-cards`;
- one representative card per unique design;
- custom text not persisted;
- public shareable link remains hidden where current privacy rules require it.

Slice 5B:

- Speak Urdu uses shared voice stack;
- unsupported/denied voice never blocks typing;
- no voice transcript persistence.

Slice 6A:

- Card / WhatsApp Status / Instagram destinations;
- existing direct Share image + one-tap WhatsApp remain distinct;
- selected design is preserved.

Slice 6B:

- one shared Card Studio project model;
- Card Studio <-> WhatsApp <-> Instagram continuity;
- no second social editor.

Slice 4:

- returning persistence stores canonical card IDs only;
- never persist personalized text.

---

## Implementation discipline

Work in this order:

1. inspect current main and open PRs;
2. map `/s/:id` server HTML + client behavior;
3. map `public-share` workspace descriptor and current recipient CTAs;
4. map `/urdu-cards` boot / own-words activation API;
5. map workspace handoff target/source validation;
6. write/update contract tests;
7. write browser tests;
8. implement the smallest 7A adapter/UI change;
9. test desktop + 360px mobile;
10. run repository quality gates;
11. stop and report.

Do not begin 7B during cleanup because “it is nearby.”

---

## Preferred implementation shape

Keep concerns isolated.

A clean implementation may involve:

```text
functions/s/[id].js                    # recipient CTA hierarchy/copy
js/share-page.js                       # source action/handoff
js/urdu-cards-public-share-entry.js    # destination adapter if needed
js/workspace-journey-registry.js       # minimal explicit target acceptance
js/urdu-cards-own-words.js             # expose/reuse current activation API, not duplicate UI
```

If current main already has a generic destination adapter that fits, use it instead of adding `urdu-cards-public-share-entry.js`.

Do not put 7A logic inside `urdu-cards.js` image renderer if it can remain a small entry adapter.

---

## Test-first requirements for 7A

Protect these before or with implementation:

```text
public page contains primary fresh-start CTA
public page contains Use these words CTA
fresh start -> /urdu-cards
fresh start activates own-words mode
fresh start does NOT prefill source public text
Use these words -> /urdu-cards
Use these words restores exact public text
no public text in URL
no share/origin id in destination URL
handoff consumed after restore
source validation rejects unrelated source
no localStorage custom-text persistence
typing still works after restore
voice unsupported path still leaves typing usable
existing share/copy/download/report controls still work
360px no horizontal overflow
```

If the share page has server-rendered tests, preserve SSR metadata/noindex assertions.

---

## Test-first requirements for 7B

```text
exact remix CTA only appears for reconstructible share
reconstructible payload restores expected Card Studio style
non-reconstructible uploaded asset does not claim exact remix
no internal R2/manage fields exposed
6B social format switching works after remix
```

---

## Test-first requirements for 7C

```text
referral recognized at destination
meaningful referred start measured separately from click
telemetry contains no text/share id
republish uses existing origin_share_id backend contract
expired referral fails closed
```

---

## Required checks

Use focused commands while working.

Before handoff/merge run at least:

```bash
npm test
npm run shell:check
npm run locale:check
npm run seo:graph:check
npm run collections:check
```

Run relevant Playwright tests for desktop and mobile.

The authoritative merge signal is the repository **Quality checks** workflow on the exact PR head, including:

- static/contracts;
- SEO/governance;
- InPage acceptance;
- focused product browser matrix;
- V3 production visual-quality audit.

A cancelled, skipped-after-failure or timed-out gate is not green.

Never weaken an existing assertion merely to pass a flaky run. Re-run unchanged first if evidence indicates an unrelated timing blip.

---

## Accessibility

Recipient CTAs must:

- have real button/link semantics;
- expose descriptive accessible names;
- preserve visible focus;
- use a bounded live status for handoff failures;
- not rely on color alone;
- remain readable in Urdu RTL context.

The primary CTA should not steal focus on page load.

---

## Failure behavior

Fail closed and recoverably.

If the handoff runtime is unavailable:

- do not navigate while promising restored text;
- keep the public page usable;
- show calm status copy;
- allow copy/share actions to continue.

If `Use these words` payload expires/fails:

- recipient may start fresh;
- do not silently substitute unrelated/local text;
- do not destroy an existing destination draft.

---

## Completion report

Return exactly these sections:

### Changed

Files + behavior.

### Reused

Confirm which existing share/handoff/own-words components were reused.

### Preserved

Explicitly confirm:

- `/api/shares` unchanged unless required;
- `/s/:id` remains noindex;
- report/delete/manage privacy preserved;
- direct share/copy/download preserved;
- 5A/5B/6A/6B behavior preserved;
- no custom text persistence;
- no content/share IDs in telemetry.

### Verification

Exact commands/results and desktop/mobile browser coverage.

### Risks

Known edge cases only.

### Rollback

How to remove 7A recipient-to-cards enhancement without breaking existing public share pages.

### Next

State whether 7B is ready, but do not implement it without instruction.

---

## Definition of success

A successful Slice 7A lets a recipient of a real `/s/:id` link reach `/urdu-cards` and begin a card with almost no cognitive overhead. Fresh start remains fresh. `Use these words` restores only the intentionally public text. URLs stay clean. Handoffs are consumed. Mobile works. Existing share/report/privacy behavior remains intact. Telemetry can distinguish click from destination-ready and meaningful start without collecting content or identity.

That is the foundation for the later remix and republish loop.