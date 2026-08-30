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

- [ ] Remove/demote content-dependent command wall from empty state.
- [ ] Preserve intent-matched heading and one simple conversion example.
- [ ] Present English-letter, direct-Urdu and Voice choices coherently.
- [ ] Keep writing canvas dominant on mobile.
- [ ] Do not add an account/share/community promo in empty state.
- [ ] Reveal Copy after useful text.
- [ ] Keep lower-frequency outputs reachable through a stable progressive control.
- [ ] Remove superseded/duplicate legacy action nodes rather than hiding a second generation indefinitely.
- [ ] Browser-test keyboard, touch, screen-reader labels and focus behavior.

**Exit gate:** first-value funnel is no worse on guardrails and the pre-value UI has materially fewer competing commands.

## Gate C — Contextual continuation

- [ ] Implement no-more-than-three visible next actions.
- [ ] Promote Basic -> Rich for substantial writing with safe state transfer.
- [ ] Make PDF/Word appropriately discoverable for substantial writing.
- [ ] Do not infer recommendation from private text content.
- [ ] Instrument destination ready + destination meaningful start.
- [ ] Validate no source draft is destroyed on handoff conflicts/failures.

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
