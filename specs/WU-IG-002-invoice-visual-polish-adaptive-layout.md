# WU-IG-002 — Invoice Visual Polish and Adaptive Layout

**Feature ID:** `WU-IG-002`  
**Depends on:** `WU-IG-001`  
**Route:** `/urdu-invoice-generator`  
**Status:** Complete  

## Objective

Refine the Phase 1 Invoice Generator so sparse invoices feel intentional, dense invoices
remain readable within one A4 page, and optional sections compose without empty gaps.

## Product boundaries

- Preserve the standalone semantic HTML/CSS invoice architecture.
- Do not import Card Studio or replace the renderer with a canvas editor.
- Preserve calculations, six-item maximum, local drafts, QR behavior, transliteration modes,
  and PDF/PNG/print export paths.
- Keep the existing `professional-bilingual` stored template compatible; expose the current
  visual direction as the `minimal-professional` presentation where appropriate.

## Refinement scope

1. Add a pure preview view model with deterministic `comfortable`, `balanced`, and `compact`
   density modes.
2. Reduce duplicated seller details in the top header; retain only business identity and the
   preferred website/email/phone contact while the seller card remains authoritative.
3. Resolve notes-only, terms-only, and combined headings from actual content.
4. Improve table contrast, numeric direction, totals hierarchy, and alternating rows for larger
   item sets.
5. Compose notes, totals, payment, and authorization through conditional lower-section slots.
6. Remove excessive fixed party-card height and collapse QR space when disabled.
7. Keep the footer anchored and make the Write Urdu generator credit configurable, defaulting
   to visible for old and new drafts.

## State compatibility

The new presentation preference is `showGeneratorCredit: true` by default. Missing values in
older saved drafts normalize to `true`. Density, headings, lower layout, header contact, and
row visibility are derived and are not persisted as invoice business data.

## Acceptance criteria

- Two-item sparse invoices use comfortable or low-pressure balanced spacing.
- Six-item invoices with QR, payment, and authorization use compact spacing or block export
  through the existing one-page check.
- The header no longer repeats the full seller address/contact list.
- Notes-only and terms-only headings are accurate in English, Urdu, and bilingual modes.
- Totals, prices, and quantities remain readable and LTR-isolated in Urdu mode.
- Optional lower sections render valid combinations without empty containers.
- Disabling QR removes its seller-card column without deleting QR values.
- The generator credit can be toggled off while a custom footer message remains.
- Existing drafts load safely and all exports use the same visible preview DOM.

## Implementation map

- `js/invoice-generator-core.js` — pure derived view-model, density, heading, header-contact,
  lower-layout, totals visibility, and migration helpers.
- `js/invoice-generator.js` — applies derived attributes, preference controls, and preview
  rendering.
- `css/invoice-generator-preview.css` — density tokens and adaptive document styling.
- `urdu-invoice-generator.html` — presentation preference control and semantic preview hooks.
- `tests/static.test.js`, `tests/site.spec.js` — regression and browser coverage.
