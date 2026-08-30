# WU-PLAT-002H — UX State Matrix

This matrix is the source of truth for what may be visually promoted in the Basic Writer during the activation phase. It exists to prevent every feature owner from independently adding another button/banner.

| State | Definition | Primary UI | Eligible secondary UI | Growth request | Must not dominate |
| --- | --- | --- | --- | --- | --- |
| E0 Empty | No meaningful text | Input choices + editor | quiet help/settings | none | Share, exports, account, publish, tool grid |
| E1 First value | First useful text exists | Copy + editor | Continue/More | none by default | full export row, community promo |
| E2 Short | ~20–499 chars | Copy + context | Stylish/Card only when appropriate; More | usually none | generic all-tools directory |
| E3 Substantial | ~500–999 chars | Continue with formatting | PDF, Word, More | Keep if unsaved/signed out | simultaneous Share + Publish promos |
| E4 Long form | 1000+ chars | Rich/document completion | PDF, Word, save state | Keep or Publish according to arbitration | design-tool clutter |
| E5 Post-completion | successful copy/export/save | completed outcome feedback | relevant next action | Share or Publish (one) | another pre-task acquisition wall |

Thresholds are measurement buckets, not semantic truth. Implementation may tune exact character boundaries from evidence while preserving the state purposes.

## Input-choice contract

Before/while writing, the user may choose among:

- **English letters -> Urdu** — default proven path;
- **Type Urdu directly** — existing direct mode;
- **Speak Urdu** — when supported/available.

Voice is a peer input choice in discovery terms, but the product must handle unsupported browsers/devices gracefully and must not make the editor dependent on Voice availability.

## Command visibility contract

### Always reachable

Capabilities may remain reachable through stable progressive navigation (`More`, output menu, contextual continuation) even when not directly promoted.

### Directly promoted only when eligible

- Copy: E1+
- PDF/Word: E3+
- PNG: output menu/E2+ when relevant, not equal to PDF/Word for long writing
- Share: E5 or explicit user request
- Keep: E3/E4 when value protection is relevant
- Community Publish: E4/E5 and only when rollout/eligibility permits
- Rich Editor continuation: E3/E4

## Growth-request arbitration examples

### Signed-out, 700 chars, no completion yet

Show: **Keep this writing**  
Do not simultaneously show: Share promo + Community Publish promo.

### Signed-out, 80 chars, Copy completed

Eligible: Share link suggestion if product evidence supports it.  
Do not force account creation.

### Signed-in, 1,500 chars, saved

Do not advertise account creation or Keep.  
Eligible: Publish to Urdu Writers after a meaningful completion point if public rollout is enabled.

### Public reader arriving from share CTA

Do not show account gate first.  
Open the promised creation workspace ready to start; account can be offered after value.

## Layout rule

State transitions must not move the textarea/caret unexpectedly. New actions should appear in reserved/after-task regions or through stable controls. Avoid inserting banners above the focused editor after the user crosses a character threshold.
