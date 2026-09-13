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

On desktop and wider compact layouts, PDF, Word and PNG can remain visible but disabled before writing exists. On the narrowest phone widths (up to 380px), the empty-state export cluster is deferred until the first text exists so the real writing canvas keeps its established first-viewport visibility floor. The moment content exists, PDF, Word and PNG appear as first-level actions.

### Input method hierarchy

Input modes remain one visually distinct writing-method group rather than competing with completion/export actions. When horizontal space is available, the group stays right-aligned on the first toolbar line behind a divider. At constrained desktop/tablet widths (1180px and below), it moves intentionally to a full-width second row. This avoids an unnecessary second row on 1280×720 laptops while keeping `English letters → Urdu`, direct Urdu and Voice together.

### Responsive behavior

On compact screens:

- PDF, Word and PNG remain directly visible once there is exportable content;
- the export overflow remains adjacent to those formats;
- Print continues to move into `More`;
- the input-mode group moves to a deliberate full-width row once the viewport is constrained;
- the existing mobile editor visibility floor takes precedence over showing disabled export controls in the empty state;
- do not introduce a sticky/fixed toolbar.

This is deliberate: a 360×800 empty writer should prioritize starting the writing task, while a 1280×720 laptop should not lose another row merely to separate controls that already have a visual divider. Once content exists, the high-frequency export cluster becomes directly visible without forcing users through `Download`.

## Engineering approach

Keep the proven WU-PLAT-004B command implementation and export handlers intact. `basic-writer-export-priority.js` is a bounded presentation adapter that promotes the existing PDF/Word/PNG controls into the first-level export cluster and returns them to the existing disclosure while that disclosure is open, preserving the established download-panel contract and action wiring. `basic-writer-export-priority.css` owns the visual priority and responsive row decisions.

## Guardrails

- No user text enters URLs or telemetry.
- No export engine is duplicated.
- No new account requirement.
- Existing Share, Voice, AI writing, Print, Clear and filename behaviors remain owned by their current implementations.
- PDF/Word/PNG action telemetry must continue to use the existing `basic_toolbar_action` path.
- Existing mobile tap targets remain at least 44px where compact-mode controls require it.
- A 360×800 initial viewport must keep the established Basic Writer visible-editor floor.
- The homepage typing surface must continue to begin before the production visual-audit fold threshold on 1280×720 laptops.

## Acceptance

1. On desktop/wider layouts with an empty writer, PDF, Word and PNG are visible and disabled.
2. On phone widths up to 380px with an empty writer, the export cluster may stay hidden to preserve the editor visibility floor.
3. With content, PDF, Word and PNG are visible and enabled without opening a disclosure on all supported layouts.
4. Opening the export overflow preserves access to filename, SVG and Text file.
5. Closing the overflow restores PDF, Word and PNG to the direct export cluster.
6. Input modes stay right-aligned and visually separated when space allows, then move to a full-width row at 1180px and below.
7. Print remains direct on desktop and moves into `More` on compact layouts.
8. On 360×800, direct export discovery must not violate the existing visible-editor floor.
9. On 1280×720, the Basic Writer typing surface must stay within the established production visual-audit fold threshold.
10. Existing export handlers and privacy-safe telemetry remain unchanged.
