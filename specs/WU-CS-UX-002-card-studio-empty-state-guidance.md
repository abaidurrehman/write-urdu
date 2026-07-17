# Urdu Card Studio Empty-State Guidance

**Feature ID:** `WU-CS-UX-002`
**Route:** `/urdu-card-studio`
**Status:** Implemented

## Scope

Improve the first-use Card Studio experience without changing the persisted card
content or the exported image. When the main text is empty, the canvas should
retain the selected design and show a faint, template-aware hint. The hint is
interaction guidance only: it must never be saved as card text, announced as
card content, or included in PNG/JPEG exports.

Add a small first-use cue near the content field that explains where the text
appears on the canvas. The cue is dismissible and is remembered locally for the
current browser.

## State contract

- Empty content remains `text.value === ""` in project state.
- The existing default/sample text remains available through “Use sample text”.
- The empty-canvas hint is derived UI state, not project state.
- The cue uses the versioned local-storage key
  `writeUrdu.cardStudio.emptyStateCue.v1`.
- No user-entered text is logged or sent over the network.

## Acceptance criteria

- A cleared card still renders its selected background, border, decoration and accent.
- An empty card shows a faint Urdu hint inside the text region.
- The hint uses the active template text colour with reduced opacity.
- The hint is hidden while real text is present or while the canvas editor is active.
- The hint is absent from PNG/JPEG exports and accessible card-content text.
- A first-use cue points users from the Card text field toward the preview.
- The cue can be dismissed and does not reappear on the next visit in the same browser.
- Existing template loading, direct editing, saving and export behavior remains unchanged.

## Implementation map

- `js/card-studio.js`: derive empty-state rendering and cue lifecycle.
- `urdu-card-studio.html`: add semantic cue markup and canvas hint layer.
- `css/card-studio.css`: style the non-exporting hint and cue responsively.
- `tests/static.test.js`: verify the contract and non-exporting markers.
- `tests/site.spec.js`: verify empty-state guidance in a browser where available.

## Verification

```text
npm test
npm run test:browser -- --grep "Card Studio"
```
