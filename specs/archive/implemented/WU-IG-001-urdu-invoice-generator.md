# WU-IG-001 — Urdu / English Invoice Generator

**Feature ID:** `WU-IG-001`  
**Route:** `/urdu-invoice-generator`  
**Status:** Phase 1 implementation

## Product boundary

The Invoice Generator is a standalone, browser-only structured document tool. It is
separate from Card Studio: invoices use fixed semantic A4 sections and calculations,
while Card Studio supports free-form visual composition. No invoice module imports
Card Studio code or state.

## Phase 1 scope

- English, Urdu and bilingual labels
- One A4 portrait page
- Up to six line items
- Live subtotal, discount, tax, charges, paid and balance calculations
- Optional notes, payment details, QR, authorization and footer sections
- Local draft persistence with safe restore behavior
- Local PNG download, browser print/PDF and one-page overflow protection
- Local Roman Urdu entry for free-text fields where the existing input service is available

## State contract

`InvoiceDocument` is serializable and versioned. Derived totals, visibility and validation
are calculated from it and are not persisted. Uploaded images remain local and are not
sent to a server.

## Acceptance criteria

1. The route loads without an account or backend.
2. Changing form fields updates the A4 preview immediately.
3. Empty optional sections render no empty containers or gaps.
4. English, Urdu and bilingual modes preserve values and correctly isolate numbers,
   dates, phone numbers, email and currency as LTR data.
5. A seventh line item cannot be added.
6. Invalid required fields and an overflowing page block export with an actionable message.
7. PNG and print/PDF output contain the same visible sections as the preview.
8. A meaningful draft restores locally; an untouched default does not show a restore banner.
9. No invoice content, QR payload or uploaded image is transmitted.

## Implementation map

- `js/invoice-generator-core.js` — state defaults, migrations, calculations, visibility,
  validation, numbering and filenames.
- `js/invoice-generator.js` — form controller, live semantic preview and local persistence.
- `css/invoice-generator.css` — responsive editor, A4 preview and print styling.
- `urdu-invoice-generator.html` — standalone route and crawlable product explanation.

## Verification

Run `npm test`, `npm run seo:check`, and the invoice browser tests in
`tests/site.spec.js` when the local server is available.
