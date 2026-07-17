# WU-IG-003 — Invoice Refinement v1.2

**Feature ID:** `WU-IG-003`  
**Depends on:** `WU-IG-001`, `WU-IG-002`  
**Route:** `/urdu-invoice-generator`  
**Status:** Implementing  

## Objective

Refine the browser-only Invoice Generator without replacing its structured A4 renderer.
The iteration improves seller identity hierarchy, dynamic notes and terms labels, QR
captions, adaptive density, totals emphasis, header balance, and export safety.

## Scope

- Keep calculations, conditional sections, local drafts, QR generation, transliteration,
  PDF/PNG/print export, and the six-item single-page constraint.
- Store only presentation preferences and QR caption metadata needed for the new behavior.
- Keep all derived layout decisions in pure, testable functions shared by preview and export.
- Require an explicit confirmation before exporting a valid zero-total invoice.
- Do not add accounts, cloud storage, payment gateways, multi-page output, or Card Studio
  dependencies.

## State and migration

Invoice schema version advances to `2`. Missing values normalize safely:

```js
preferences: {
  densityMode: "automatic",
  sellerHeaderMode: "identity-only",
  showGeneratorCredit: true
}

qr: {
  captionMode: "automatic",
  customCaption: "",
  position: "seller-section"
}
```

Existing business data, totals, and user-authored captions are preserved. Technical QR
payloads or raw numeric captions are not promoted to visible captions.

## Acceptance criteria

- Seller address, phone, and email appear only in the seller card by default.
- Notes-only, terms-only, and combined sections use accurate English, Urdu, or bilingual
  headings; empty sections are hidden.
- QR captions explain the selected purpose and never expose the payload value.
- One- or two-item invoices use comfortable spacing; dense invoices use compact spacing.
- Density overrides are respected and preview/export use the same derived model.
- Zero-total PDF, PNG, and print actions require explicit confirmation but remain allowed.
- Grand Total is stronger than Subtotal and Balance Due remains the strongest row.
- Header title remains centered with long or missing identity/metadata fields.
- Existing drafts migrate without losing invoice data, QR content, or credit preference.

## Implementation map

- `js/invoice-generator-core.js` — schema migration and pure presentation resolvers.
- `js/invoice-generator.js` — dynamic headings/captions and zero-total confirmation.
- `urdu-invoice-generator.html` — QR caption controls and accessible confirmation dialog.
- `css/invoice-generator-preview.css` — density variables, header balance, totals hierarchy.
- `tests/static.test.js`, `tests/site.spec.js` — unit and browser regression coverage.

## Verification

```text
npm test
npm run seo:check
npx playwright test tests/site.spec.js --grep "invoice generator"
```
