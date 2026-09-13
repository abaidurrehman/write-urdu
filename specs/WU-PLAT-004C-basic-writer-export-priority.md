# WU-PLAT-004C — Basic Writer Export Priority

Status: implementation slice
Parent: WU-PLAT-004 / WU-PLAT-004B
Date: 2026-09-13

## Why this slice exists

The WU-PLAT-004B cleanup improved hierarchy, but the resulting single `Download` disclosure hid the formats users actually choose most often.

Observed export counts supplied from current product telemetry:

- PDF: 1,347
- Word: 909
- PNG: 583
- TXT: 32
- SVG: 8
- JPEG: 1

Across the shown sample there are 2,880 exports. PDF, Word and PNG account for 2,839 of them, or about 98.6%. The toolbar should therefore optimize first for these three observed jobs rather than give every format equal discovery cost.

## Decision

### Desktop hierarchy

Use the following first-level sequence after content exists:

`Copy · Preview | PDF · Word · PNG · ▾ | Share · Print · More`

The three high-frequency export formats remain directly visible. The small chevron belongs to the export cluster and opens secondary export options.

### Export overflow

The overflow keeps the existing filename control and secondary formats such as SVG and Text file. Do not add JPEG to Basic Writer unless the underlying export engine actually supports it; telemetry from another export surface is not enough reason to expose a non-existent capability.

### Empty state

PDF, Word and PNG remain visible but disabled before writing exists. This preserves discovery without inviting a dead action.

### Input method hierarchy

The input-mode control is intentionally placed on its own row below document actions instead of being allowed to wrap there accidentally. This keeps `English letters → Urdu`, direct Urdu and Voice together as writing-method choices and prevents them from competing visually with completion/export actions.

### Responsive behavior

On compact screens:

- PDF, Word and PNG remain directly visible in the first command line rather than forcing a new pre-editor row;
- the export overflow remains adjacent to those formats;
- Print continues to move into `More`;
- the input-mode row remains full width;
- the existing mobile editor visibility floor takes precedence over decorative spacing or an extra export row;
- do not introduce a sticky/fixed toolbar.

This is deliberate: at the empty state the export cluster and `More` must fit on one compact line so the writing surface still begins high enough in a 360×800 viewport. Once content exists, normal wrapping may occur as completion actions are progressively revealed.

## Engineering approach

Keep the proven WU-PLAT-004B command implementation and export handlers intact. `basic-writer-export-priority.js` is a bounded presentation adapter that promotes the existing PDF/Word/PNG controls into the first-level export cluster and returns them to the existing disclosure while that disclosure is open, preserving the established download-panel contract and action wiring. `basic-writer-export-priority.css` owns the visual priority and deliberate input-mode row.

## Guardrails

- No user text enters URLs or telemetry.
- No export engine is duplicated.
- No new account requirement.
- Existing Share, Voice, AI writing, Print, Clear and filename behaviors remain owned by their current implementations.
- PDF/Word/PNG action telemetry must continue to use the existing `basic_toolbar_action` path.
- Existing mobile tap targets remain at least 44px where compact-mode controls require it.
- A 360×800 initial viewport must keep the established Basic Writer visible-editor floor.

## Acceptance

1. With an empty writer, PDF, Word and PNG are visible and disabled.
2. With content, PDF, Word and PNG are visible and enabled without opening a disclosure.
3. Opening the export overflow preserves access to filename, SVG and Text file.
4. Closing the overflow restores PDF, Word and PNG to the direct export cluster.
5. Input mode is rendered on a deliberate full-width row beneath document actions.
6. Print remains direct on desktop and moves into `More` on compact layouts.
7. On 360×800, direct export discovery must not create an extra pre-editor row that violates the existing visible-editor floor.
8. Existing export handlers and privacy-safe telemetry remain unchanged.
