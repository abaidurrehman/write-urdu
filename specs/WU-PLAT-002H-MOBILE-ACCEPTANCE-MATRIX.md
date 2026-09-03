# WU-PLAT-002H — Mobile Activation Acceptance Matrix

**Parent:** `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md`  
**Status:** Active acceptance contract  
**Purpose:** turn the mobile first-value requirement into repeatable browser/manual checks without requiring pixel-identical UI.

---

## 1. Required viewports

| Class | Viewport | Purpose |
| --- | ---: | --- |
| Small Android-class | `360 x 800` | narrow common mobile baseline |
| Small iPhone-class | `375 x 667` | short-height stress case |
| Modern iPhone-class | `390 x 844` | common modern iPhone viewport |
| Android-class | `412 x 915` | wider/taller mobile baseline |

Desktop smoke coverage remains required but is not the acceptance owner of this matrix.

---

## 2. Global first-viewport assertions

For every writing-first route in scope:

- [ ] Primary route purpose is understandable without scrolling.
- [ ] The real editable surface begins inside the first visual viewport.
- [ ] At `375 x 667`, at least **160 CSS px** of usable editor surface is visible before user scroll.
- [ ] At >=800px viewport height, at least **220 CSS px** of usable editor surface is visible before user scroll.
- [ ] Visible editor area is not a token sliver used only to satisfy geometry checks.
- [ ] The editor has a clear visual boundary and looks interactive.
- [ ] No overlay/sticky header/promo/ad masks the initial writing surface.
- [ ] No horizontal overflow appears at default zoom.
- [ ] Page does not autofocus and summon the software keyboard on load.
- [ ] User can tap the real editor directly; no gateway panel is required.
- [ ] Focus order matches the intended visual/task order.

---

## 3. `/` — Basic Writer

### Empty state E0

- [ ] `English to Urdu Typing` or approved simple-intent equivalent is visible.
- [ ] At most one compact conversion example appears before the writer.
- [ ] English-letter input remains the default/proven path.
- [ ] Direct Urdu remains discoverable.
- [ ] `Speak Urdu` is compact and uses the existing Voice platform when supported.
- [ ] Input choices do not become three large cards that displace the writer.
- [ ] The primary writer is visible without scrolling.
- [ ] No large Voice promo appears above the writer.
- [ ] No account/save/community banner appears above the writer.
- [ ] No all-tools directory appears above the writer.
- [ ] No Share/PDF/Word/PNG/Preview/Print command wall appears in E0.
- [ ] No large ad appears between intent/input choice and writer.
- [ ] Any retained `Start typing` CTA is secondary and not required to reveal the writer.

### First useful text E1

- [ ] Copy becomes obvious without moving or obscuring the caret.
- [ ] First converted Urdu remains visible during normal typing.
- [ ] Account/publish/share promotions do not interrupt first success.
- [ ] Input mode remains understandable/reachable.

### Short writing E2

- [ ] Copy remains the dominant completion action.
- [ ] Contextual actions remain bounded by the max-three continuation rule.
- [ ] Generic tool grids do not invade the active writer.

### Substantial/long writing E3/E4

- [ ] Rich Editor continuation remains reachable.
- [ ] PDF/Word remain discoverable according to the adaptive-command contract.
- [ ] Keep/Save obeys growth-prompt arbitration.
- [ ] The writer is not squeezed into an unusable strip by newly revealed actions.

### Post-completion E5

- [ ] Share/Publish prompts obey one-growth-request-at-a-time.
- [ ] Normal task commands remain usable without signup.

---

## 4. `/urdu-editor` — Rich Editor

### Entry / empty editor

- [ ] Main editable TinyMCE/workspace area is visible and clearly identifiable without hunting.
- [ ] Formatting/export/help/account/discovery chrome does not push the primary editor out of the first usable viewport.
- [ ] Core formatting controls remain reachable through a stable mobile pattern.
- [ ] No duplicate mobile editor is introduced.
- [ ] Basic -> Rich handoff text restoration remains intact.
- [ ] Existing draft conflict protection remains intact.

### Focused editor

- [ ] Caret/active line remains within effective visual viewport when software keyboard opens.
- [ ] Sticky headers/toolbars do not cover the active line.
- [ ] Formatting controls do not overlay the editor unexpectedly.
- [ ] Keyboard dismissal restores a sensible layout/scroll state.

---

## 5. `/urdu-keyboard`

- [ ] Primary writing/input job is visible without navigating through promotional content.
- [ ] If the on-screen keyboard is part of the primary job, editor + keyboard relationship is obvious.
- [ ] The keyboard does not push the only editable area completely out of the useful viewport.
- [ ] Mobile browser keyboard + on-screen Urdu keyboard interaction does not create unusable double-keyboard layout.
- [ ] No broad redesign is made unless a concrete acceptance failure is reproduced.

---

## 6. Software keyboard checks

Perform after a real user-initiated focus/tap.

### iOS Safari

- [ ] Keyboard opens only after user interaction.
- [ ] Focused writer/caret is not hidden behind browser chrome or sticky site header.
- [ ] Visual viewport resize does not leave a permanent blank gap.
- [ ] User scroll remains under user control; no repeated forced scrolling.
- [ ] Rotation/keyboard dismissal does not corrupt layout.

### Android Chrome

- [ ] Keyboard opens only after user interaction.
- [ ] Active line remains visible.
- [ ] No horizontal page drift/overflow occurs.
- [ ] Input-choice controls do not cover the caret.
- [ ] Keyboard dismissal restores stable viewport/scroll behavior.

---

## 7. Visual hierarchy checks

Use these as comparative assertions, not a mandate for a new design system.

- [ ] Editor container has stronger interaction affordance than adjacent promotional/support cards.
- [ ] Placeholder/instruction clearly tells the visitor where to begin.
- [ ] Focus state is visually apparent.
- [ ] Text remains readable at default mobile zoom.
- [ ] Urdu direction/rendering remains correct.
- [ ] English-letter input is still easy to understand.
- [ ] Voice is discoverable without visually dominating the editor.

---

## 8. Analytics/privacy checks

- [ ] `writer_eligible` or equivalent fires only for eligible route/workspace states.
- [ ] `writer_visible` is measured from reliable visibility, not page load assumption.
- [ ] `writer_focused` is user-initiated where appropriate.
- [ ] `writer_first_input` represents actual user input.
- [ ] `writer_first_urdu_success` remains mode-appropriate.
- [ ] first outcome remains measurable.
- [ ] route/device/input-mode/release marker dimensions are present where approved.
- [ ] no writing, speech transcript, selection, filename, draft ID, share ID, or document content enters telemetry.

---

## 9. SEO/performance guardrails

- [ ] H1/simple acquisition language remains intact.
- [ ] Useful support/SEO content remains crawlable below the workspace.
- [ ] No new near-duplicate English-to-Urdu doorway page is introduced.
- [ ] Canonical/indexing behavior is unchanged unless handled by a separate reviewed change.
- [ ] No material CLS regression from runtime relocation/reveal.
- [ ] No material INP regression from focus/resize handlers.
- [ ] No material LCP regression from new mobile assets.
- [ ] No large new image/library is added merely for this UX repair.

---

## 10. Release evidence required in PR

Every affected route PR must include:

1. before + after screenshot at `375 x 667`;
2. before + after screenshot at one >=800px-tall mobile viewport;
3. geometry/viewport assertion result;
4. focused/keyboard screenshot or video where relevant;
5. desktop smoke result;
6. telemetry release marker;
7. statement of what UI was removed/moved/demoted;
8. rollback path.

---

## 11. Exit decision

This matrix passes only when the founder/user-reported issue — **“I cannot spot the editing area on mobile”** — cannot be reproduced on `/` at the required viewports, and the Rich Editor has equivalent first-action clarity.

Passing a screenshot while failing focused keyboard use is not sufficient. Passing geometry while the editor is visually ambiguous is not sufficient. Passing UX while leaking writing content or regressing core input engines is not sufficient.
