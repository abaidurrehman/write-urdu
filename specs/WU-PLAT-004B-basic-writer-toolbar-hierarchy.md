# WU-PLAT-004B — Basic Writer Toolbar Hierarchy

**Priority:** P0  
**Status:** Implemented candidate  
**Route owner:** `/`  
**Parent:** `WU-PLAT-004` Basic Writer Adaptive Command Surface  
**Date:** 2026-09-13

## 1. Decision

This addendum refines the post-value command hierarchy in `WU-PLAT-004`. It supersedes the layout details in §§5, 7, 8 and 12 where they conflict with this document, while preserving the evidence and state model behind the parent spec.

The earlier evidence remains important: moving export capability behind a generic **More** menu reduced discovery. The correction is **not** to restore a permanent row of PDF, Word and PNG tiles. Instead, export stays first-level through a clearly named **Download** disclosure. Users can discover the job (`Download`) immediately, then choose the format in a focused menu.

## 2. Desktop hierarchy

Before useful content exists, input choice and the writer remain dominant. `Download` may remain visible but disabled as a stable completion affordance; content-dependent document commands stay progressive.

After useful content exists, the first-level document actions are:

`Copy → Preview → Download ▾ → Share → Print → More`

The input selector remains a separate visual group on the other side of the toolbar. Document actions answer **what do I do with this writing?** while input controls answer **how do I enter Urdu?**

### First-level responsibilities

- **Copy** — fastest reuse path and existing E1 primary action.
- **Preview** — lets users check the document before output.
- **Download** — one stable entry point for PDF, Word, PNG, SVG and Text.
- **Share** — first-class distribution action after value; publication remains explicit.
- **Print** — direct desktop document action.
- **More** — settings/help/destructive task options only; it is no longer the general export drawer.

## 3. Download disclosure

The Download menu owns all downloadable formats:

- PDF;
- Word;
- PNG;
- SVG;
- Text file.

The existing filename field stays with Download because it affects exported files. Existing export functions, IDs and handlers remain the action owners; this slice only changes presentation.

Requirements:

- no duplicate export buttons elsewhere in the toolbar;
- familiar format icons remain visually distinct;
- menu closes after choosing a format, Escape, or an outside click;
- focus returns to the Download trigger on Escape;
- user text and filenames never enter telemetry or URLs.

## 4. More disclosure

`More` becomes a small utility popover rather than a second workspace. It may contain:

- page/editor options already owned by the current settings engine;
- concise help links already present in the existing settings panel;
- **Clear document** as a visually separated destructive action;
- mobile-only document actions that do not fit the first row.

`More` must not duplicate Download, Share, Preview or other first-level actions on desktop.

## 5. Responsive behavior

### Desktop

Use the direct hierarchy above. Keep the input-mode control visually separated from document completion actions.

### Mobile

Do not create a horizontally scrolling command wall. Keep the high-frequency post-writing actions reachable in the compact toolbar and move **Print** into `More`. Download remains a named first-level disclosure rather than disappearing into a generic overflow menu.

Both Download and More open bounded popovers/sheets that remain inside the viewport. Touch targets should be approximately 44px or larger.

## 6. Progressive state contract

### E0 — empty

- input modes and writer dominate;
- Copy, Preview, Share and Print are hidden;
- Download remains visible but disabled;
- More remains available for help/settings;
- no growth prompt interrupts first value.

### E1+ — useful content

- Copy, Preview, Download and Share become directly available;
- Print is direct on desktop and available in More on mobile;
- all Download formats become enabled;
- Clear document becomes available in More.

This preserves `WU-PLAT-004`'s progressive-disclosure principle without hiding the completion jobs behind an ambiguous menu.

## 7. Non-negotiable preservation

Do not rewrite:

- transliteration/input-mode engines;
- Voice recognition platform;
- export functions;
- public-share/publish contract;
- AI writing assistant;
- browser-local draft/history behavior;
- workspace handoff behavior;
- privacy-safe toolbar telemetry.

No fixed or sticky toolbar is introduced.

## 8. Acceptance

- [ ] Empty state keeps the writer/input choices dominant.
- [ ] Download is visible but disabled at E0.
- [ ] After value, Copy, Preview, Download and Share are first-level.
- [ ] Print is first-level on desktop.
- [ ] PDF, Word, PNG, SVG and Text are all inside one Download menu.
- [ ] Filename configuration is inside Download, not More.
- [ ] More contains editor/help/destructive options, not a duplicate export grid.
- [ ] Mobile moves Print into More without horizontal overflow.
- [ ] Download and More support Escape and outside-click dismissal.
- [ ] Existing export/share/voice/AI behaviors remain green.
- [ ] No user writing enters URLs or telemetry.
