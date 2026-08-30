# WriteUrdu Core Activation — Implementation Guardrails

This note is intentionally short and operational. It supplements `WU-PLAT-002H` so implementation agents do not turn the evidence into broad aesthetic rewrites.

## Before changing UI

Every PR affecting `/`, `/urdu-editor`, Voice, Share referral, Card Studio, Save/Publish prompts or the active continuation surface must state:

1. the measured problem/hypothesis;
2. the exact user state being changed;
3. the element being removed/demoted/replaced;
4. the primary event/funnel step expected to improve;
5. the guardrails;
6. rollback approach.

## Do not do these

- Do not add another toolbar on top of existing toolbar/action layers.
- Do not solve discovery by exposing every feature at once.
- Do not redesign the transliteration engine or change its initialization as part of UX work.
- Do not rename established ranking URLs merely for IA consistency.
- Do not add technical terms (`transliteration`, implementation details, vendor details) to public primary copy.
- Do not add account/share/publish prompts before the user has created value.
- Do not display Save, Share and Community Publish as simultaneous growth banners.
- Do not move AdSense into active writing, input, export, share or result controls.
- Do not send writing/transcript content to telemetry.
- Do not call time-on-page or raw click-through a success metric without task outcome.
- Do not expand Card Studio acquisition before the completion funnel identifies the leak.
- Do not bulk-build new tools/content while the P0 activation work is open.

## Preserve these

- established English-letter -> Urdu behavior and search ownership;
- direct Urdu mode and Ctrl+G behavior where currently supported;
- all existing output engines even when their visible prominence changes;
- browser-local drafts/history;
- account document revision safety;
- public share privacy/safety constraints;
- community moderation/rollout gates;
- source-visible SEO content/canonicals/schema;
- mobile accessibility and Core Web Vitals.

## Default implementation posture

Prefer the smallest source-owned convergence change that removes old UI rather than layering runtime UI over it.

Prefer state-driven visibility over timers.

Prefer stable layout regions over controls that jump around while typing.

Prefer semantic labels over icon-only controls.

Prefer real end-to-end continuation success over click counts.

Prefer one measurable release question at a time.
