# WU-PLAT-002H — Implementation Checklist

This checklist is subordinate to `WU-PLAT-002H-core-activation-feature-discovery.md`. It exists to sequence implementation without turning the programme into unrelated UI tweaks.

## Gate A — Baseline and instrumentation

- [x] Confirm current Product Pulse event definitions for writing depth, active use, handoffs, Voice and Share.
- [x] Add/validate first-value funnel: eligible/visible -> focus -> input -> first Urdu success -> depth -> first outcome.
- [x] Add device/workspace/input-mode breakdown without collecting content.
- [x] Add continuation funnel: shown -> clicked -> destination ready -> meaningful start -> outcome.
- [x] Add Share referral trace through destination ready and referred start.
- [x] Add/validate Card Studio completion stages.
- [x] Fix misleading rate labels where event counts can exceed starts.
- [ ] Capture pre-change 7-day baseline in Product Pulse.

**Exit gate:** we can explain the zero-char population more precisely than `abandoned`, and every planned UX change has a measurable primary funnel step.

## Gate B — Basic Writer empty/early state

- [x] Remove/demote content-dependent command wall from empty state.
- [x] Preserve intent-matched heading and one simple conversion example.
- [x] Present English-letter, direct-Urdu and Voice choices coherently.
- [x] Keep writing canvas dominant on mobile.
- [x] Do not add an account/share/community promo in empty state.
- [x] Reveal Copy after useful text.
- [x] Keep lower-frequency outputs reachable through a stable progressive control.
- [x] Remove superseded/duplicate legacy action nodes rather than hiding a second generation indefinitely.
- [x] Browser-test keyboard, touch, screen-reader labels and focus behavior.

**Historical exit:** the command-wall simplification shipped. **Mobile first-screen acceptance is reopened by Gate B2 below because fresh user feedback shows the editor is still difficult to spot on mobile.**

## Gate B2 — Mobile Editor Visibility & First-Value Repair

**Contract:** [`WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`](WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md)  
**Acceptance:** [`WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`](WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md)  
**Evidence:** [`../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`](../docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md)

- [ ] Capture comparable mobile first-value baseline before layout changes.
- [ ] Audit actual DOM/runtime injection order above the editable surface on `/`, `/urdu-editor` and `/urdu-keyboard`.
- [ ] Capture before screenshots at 360x800, 375x667, 390x844 and 412x915.
- [ ] On `/`, make the real writer begin in the initial visual viewport without requiring scroll/panel discovery.
- [ ] At 375x667, expose at least 160 CSS px of usable writing surface before user scroll.
- [ ] On >=800px-tall required mobile viewports, expose at least 220 CSS px of usable writing surface before user scroll.
- [ ] Demote/move any large Voice promo, tool directory, account/community/growth banner, command wall, long help or ad block that displaces first value.
- [ ] Keep English-letter typing, direct Urdu and Voice as compact input choices; do not create three large pre-editor cards.
- [ ] Do not autofocus on load merely to improve activation metrics.
- [ ] Verify user-initiated focus keeps active line/caret usable when the iOS/Android software keyboard opens.
- [ ] Avoid repeated forced-scroll/`scrollIntoView()` loops that fight user scrolling.
- [ ] Make editor affordance/focus state visually obvious without introducing a broad rebrand.
- [ ] Apply equivalent first-action hierarchy to `/urdu-editor` without breaking TinyMCE, exports, handoff or draft-conflict protection.
- [ ] Audit `/urdu-keyboard`; fix only reproduced mobile first-action failures.
- [ ] Preserve existing transliteration, Voice and input-mode engines.
- [ ] Preserve SEO support content below the task and do not create a new near-duplicate English-to-Urdu landing page.
- [ ] Instrument/verify `eligible -> visible -> focus -> first input -> first Urdu -> first outcome` by route/device/release marker with no writing content.
- [ ] Add/verify bounded time-to-first-input measurement if an equivalent aggregate does not already exist.
- [ ] Run automated viewport acceptance plus manual iOS Safari / Android Chrome checks where available.
- [ ] Include before/after mobile screenshots, removed/moved UI, metric, guardrails, release marker and rollback path in each implementation PR.
- [ ] Hold a stable release long enough for a comparable post-change review; record Keep / Iterate / Rollback.

**Exit gate:** the founder/user-reported “cannot spot the editing area on mobile” problem cannot be reproduced on the required viewports; focused keyboard use remains stable; mobile first-value metrics are stable/improved; no content/privacy/CWV/desktop/input-engine guardrail regresses.

## Gate C — Contextual continuation

- [x] Implement no-more-than-three visible next actions.
- [x] Promote Basic -> Rich for substantial writing with safe state transfer.
- [x] Make PDF/Word appropriately discoverable for substantial writing.
- [x] Do not infer recommendation from private text content.
- [x] Instrument destination ready + destination meaningful start.
- [x] Validate no source draft is destroyed on handoff conflicts/failures.

**Exit gate:** useful continuation can be measured end-to-end, not only by click.

## Gate D — Growth CTA arbitration

- [ ] Define one shared eligibility/arbitration owner for Keep / Share / Community Publish prompts.
- [ ] Signed-out substantial unsaved writing prioritizes Keep.
- [ ] Normal task commands are not treated as growth promos.
- [ ] Share becomes eligible at/post meaningful completion.
- [ ] Community Publish is shown only when rollout/eligibility allow and it does not stack with a higher-priority growth request.
- [ ] Signed-in states never advertise account creation.
- [ ] Distinguish `Share link` from `Publish to Urdu Writers` in copy and telemetry.

**Exit gate:** no core writing surface presents competing account/save/share/publish acquisition banners simultaneously.

## Gate E — Share referral continuity

- [ ] Verify public CTA destination for each source type.
- [ ] Verify referral/handoff context survives navigation.
- [ ] Verify target is ready/focused and can begin without authentication unless required.
- [ ] Verify `Use this text` actually restores public text where promised.
- [ ] Verify `Create your own` opens a clean ready workspace.
- [ ] Verify Product Pulse records destination ready and referred meaningful start.
- [ ] Run browser acceptance from real public share/community page through first creation action.

**Exit gate:** end-to-end path passes; production referred-start metric is trustworthy even if traffic is still too small for statistical conclusions.

## Gate F — Card Studio completion

- [ ] Collect enough funnel evidence to identify likely drop stage.
- [ ] Verify export controls work and export-completed telemetry is correct.
- [ ] If complexity is implicated, test an outcome-first Quick path.
- [ ] Keep Advanced controls available without making them the default first-completion path.
- [ ] Compare task decisions/steps and completion before/after.

**Exit gate:** only then consider additional Card Studio search/acquisition work.

## Gate G — Commercial review

- [ ] Obtain comparable current AdSense RPM/earnings baseline under `WU-GROWTH-001`.
- [ ] Join high-traffic page types to activation/continuation/CWV data.
- [ ] Recalculate daily monetizable pageviews required for $5/day using observed RPM.
- [ ] Identify whether the next best step is CTR, first-value, return use, Learn-page monetization or an evidence-backed content cluster.
- [ ] Reorder `BACKLOG.md` from the new evidence.

**Exit gate:** the next major feature/SEO investment is chosen from measured commercial/product opportunity rather than feature enthusiasm.
