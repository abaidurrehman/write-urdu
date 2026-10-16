# WU-IG-004 — Invoice Studio redesign

**Route:** `/urdu-invoice-generator` (unchanged)
**Status:** Implemented on branch `ux/invoice-generator-redesign` (2026-10-16). Founder-directed exception to the "Broad Invoice/QR expansion" hold; see `specs/BACKLOG.md` P0.14.
**Supersedes the UI of:** `WU-IG-001`, `WU-IG-002`, `WU-IG-003` (archived). Their calculation, validation, QR, draft and telemetry contracts are kept.

## Problem (audit, 2026-10-16)

Measured on the live page before the change:

- Desktop: the preview sat beside a single long form of about 1,600px, with every optional field visible.
- Mobile (390px): the preview started about 3,440px down the page, after four screens of fields, and was too small to read.
- There was one visual template. The 6-item limit was enforced and the copy said "one-page invoice". Long content blocked export with "too much content".
- "Load sample invoice" overwrote real fields. "New invoice" and "Reset" both deleted the draft.
- PNG was the primary action, and PDF was secondary.
- There were no labels for JazzCash or Easypaisa, no logo, and no reuse of business details.

## What shipped

### Architecture

| File | Role |
| --- | --- |
| `js/invoice-generator-core.js` | Data model, migration, calculations and validation. It now has templates, design (accent and Urdu font), mobile wallet fields, a logo data URL, sample builders, invoice-number increments and a 50-item limit. `schemaVersion` stays at 2, and old drafts normalise in place (`professional-bilingual` becomes `modern`). |
| `js/invoice-document.js` | **New.** This is the only invoice renderer. The live preview, template thumbnails, PDF, PNG and print all call `renderPages()`. It paginates onto A4 pages and repeats the table heading on each page. The last two rows move with the totals, so the totals never sit alone on a page. |
| `js/invoice-generator.js` | Editor controller. It covers the sample (demo) state, drafts, local history, the remembered business, logo, mobile Edit/Preview modes, full-screen preview, exports, sharing and Urdu typing. |
| `css/invoice-document.css` | **New.** Three templates and the print stylesheet. Selectors use `.inv-page.inv-page` because site-wide `body h2`, `body td:first-child` and `[dir=rtl]` rules would otherwise restyle the document. |
| `css/invoice-generator.css` | Workspace UI. Replaces `invoice-generator-preview.css` and `invoice-generator-tweaks.css`. |

Pages are always laid out in an off-screen host that is never hidden. Pagination needs real element heights, and a hidden panel, such as the mobile preview while editing, measures as zero. The finished pages are then moved into the preview, a thumbnail, or the export host. html2canvas captures the export host at full size, never the scaled preview.

### Export rules learned during implementation

- Do not use `font-variant-numeric` or other font-feature settings in the document. html2canvas draws glyphs without them, so characters end up misplaced in PDF and PNG files.
- Use exactly one Latin face (`Inter`, or `Plus Jakarta Sans` for Contemporary), followed by the Urdu face. System fallbacks such as Segoe UI include Arabic glyphs and would replace Nastaliq in mixed text.
- Chromium does not support `text-align: match-parent`. User text uses `dir="auto"`, with explicit page-direction alignment.
- Theme colours are computed in JS as hex values. html2canvas cannot read `color-mix()`.

### Templates

- **Modern Professional**: an accent rule along the top, a quiet hierarchy, a tinted table header and an accent total bar.
- **Classic Urdu**: a framed ivory sheet with double hairline borders and a small geometric star ornament. It has a centred Nastaliq heading, a bordered meta strip that includes the amount due, a ledger table, a double-rule total and a signature line.
- **Contemporary Business**: a full-bleed accent band, meta chips, a bordered "Amount due" card, a zebra table and a strong total block.

All three templates work in English, Urdu (RTL) and bilingual modes. Users can pick an accent from 6 presets or a custom colour, and choose Nastaliq or Naskh lettering.

### Workflow

- The toolbar holds the language choice, save status, My invoices, New invoice, Print and Download PDF (the primary action).
- The editor has four sections: Design, Business and customer, Items and prices, and Payment and finishing. Advanced fields sit behind "Add …" disclosures. A Finish card shows the amount due, a checklist, Download PDF, Share, PNG and Print.
- First visit: the preview shows a sample marked "Sample". Nothing is saved, and export is blocked until the person starts their own invoice. "Try a sample invoice" loads the sample explicitly. Exporting while sample details remain asks for confirmation first.
- New invoice saves the current invoice to My invoices (12 kept locally). It carries over the business, payment details and design, and increments the number. History supports Open, Duplicate and Delete, and Delete asks for confirmation.
- "Remember my business details on this device" is opt-in.
- Entering an amount already received sets the status automatically to Partially paid or Paid.
- Share uses the Web Share API with the PDF file when the browser supports it. Otherwise it downloads the PDF and explains how to attach it in WhatsApp, with an optional `wa.me` text-only message.
- Phones and tablets (≤900px) get Edit | Preview tabs, a sticky bottom bar (total + Preview invoice, or Edit + Share + Download PDF), stacked item cards, numeric keyboards, and a full-screen preview with zoom.

### Urdu typing

The page uses the shared `input-mode.js` control and the existing Google transliteration control; `google_jsapi.js` is untouched.

- English invoices force direct typing. A guard keeps `dir="auto"` because the Google control re-applies `dir="rtl"`.
- Urdu invoices default to English-letter conversion. Bilingual invoices default to direct typing. The person's choice is remembered for each language.

## Contracts kept

- The URL, title, meta, canonical tag and JSON-LD are unchanged. The H1 text is unchanged.
- The ad anchor `.invoice-workspace` and `[data-invoice-generator]` are protected and unchanged.
- The telemetry status region `[data-invoice-fit-status]` still shows "PDF downloaded." and "PNG downloaded.", and `[data-invoice-print]` is kept.
- The draft key `writeUrdu.invoiceGenerator.draft.v1` is kept. jsPDF 2.5.2 and html2canvas 1.4.1 load as before.
- The about section keeps the Bill Generator link and the "Show only what you need" copy.

## Tests

- `tests/invoice-generator-core.test.js` (extended)
- `tests/invoice-preview-footer-contract.test.js` (rewritten for the new architecture)
- `tests/invoice-generator.spec.js` (new; desktop and mobile Playwright journeys: sample guard, English three items and template switching, Urdu RTL, discount/tax/partial totals, draft restore and New, validation focus, multi-page PDF page count, mobile Edit/Preview without overflow)

## Remaining slices

See the "Next improvements" list in the PR description.
