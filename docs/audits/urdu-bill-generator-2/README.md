# Urdu Bill Generator 2.0 UX audit

Date: 2026-10-15

Route: `/urdu-bill-generator`

Baseline: production route before this branch

Candidate: `ux/urdu-bill-generator-2`

## Executive finding

The previous route could produce a bilingual bill, but it treated every job as the same long form. On a phone, the preview and export actions sat below the form, bill intent was unclear, and there was no real cash-memo or payment-receipt workflow. The candidate keeps the existing route and local-first architecture while making the first decision the document job: Quick Bill, Cash Memo, or Payment Receipt.

## Six-user walkthrough

| User | Job | Baseline friction | Candidate outcome |
| --- | --- | --- | --- |
| Kiryana owner, Urdu-first Android | Make a two-item sale bill | Long undifferentiated form; preview far below editor | Chooses Quick Bill, enters two rows with kg units, sees total/balance in the fixed bar, opens full-screen preview, and shares the downloaded PDF |
| Boutique owner, mixed Urdu/English | Produce a branded customer bill | One visual treatment and no business-preserving reset | Selects Elegant Boutique, accent colour and contact details; New Document keeps shop identity but clears customer data |
| Home-based seller, WhatsApp-first | Send a simple bill without exposing details in a URL | Download-first flow did not explain the WhatsApp handoff | Share uses the native file share sheet where supported; fallback downloads locally and explicitly asks the user to attach the file |
| Repair technician | Record service work and an advance | Item-only model did not express service or partial payment clearly | Uses Service & Repair, hours/piece units, paid amount and a prominent balance-due state |
| Tutor/freelancer | Acknowledge a payment | A bill was the only document model | Payment Receipt replaces item rows with received-from, amount and purpose fields; the preview renders receipt semantics |
| Small retailer with printer | Print A4, A5 or thermal output | Only the browser's generic print path was visible | Selects A4, A5 or 80mm; Thermal Receipt also selects 80mm and keeps the same live preview |

## Before and after

- Baseline desktop: `before-desktop.png`
- Baseline mobile: `before-mobile.png`
- Candidate desktop with a two-item retail scenario: `after-desktop.png`
- Candidate 390px full-screen preview: `after-mobile-preview.png`
- Candidate A4 print rendering: `../../../output/pdf/urdu-bill-generator-a4.pdf`

## Product and interaction decisions

- Essential-first entry: business, customer, items and totals stay open; payment/contact and design controls are progressive disclosures.
- One source of truth: form edits update the live document model, and print, PDF and share all use that preview.
- Distinct jobs: Cash Memo automatically records the current total as paid; Payment Receipt has no item table and uses received-from/purpose fields.
- Honest sharing: bill data is never encoded in a public URL. The fallback is a local PDF download plus manual WhatsApp attachment guidance.
- Local continuity: shop profile/preferences and the current draft use separate browser storage. New Document clears transaction data; Clear local data removes both.
- Bilingual quality: English, Urdu and bilingual modes keep explicit direction boundaries around names, item text, amounts and labels.
- Validation: missing business/item names, zero quantity, negative rate, excessive discount and overpayment block export without discarding entered values.

## Evidence status

- Passed: core calculation fixtures, persistence, Urdu-input adapter, three document types, templates, print-size state, validation, local PDF share fallback, desktop/mobile browser flows.
- Passed: 320px, 360px and 390px overflow/action/preview checks.
- Passed: repository contract, SEO, governance and product-language gates.
- Visual evidence: baseline and candidate screenshots in this directory.
- PDF evidence: Chromium produced a valid `%PDF-1.4` A4 file from the candidate print stylesheet; the same filled preview was visually inspected on desktop and mobile. Poppler rendering was unavailable in this environment and is not reported as passed.
- Native OS share sheet: browser capability path is implemented; automated tests cover the deterministic download fallback because CI cannot operate an OS share sheet.

## Independent review lenses

- Principal UX: the new first decision maps to the user's document job and reduces the default surface.
- Mobile interaction: fixed total/Preview/Share controls, 44px minimum actions and a full-screen preview remove the longest baseline loop.
- Urdu typography: Noto Naskh Arabic remains the document font, Urdu fields use RTL, and mixed numeric content is isolated with bidi-safe wrappers.
- QA/accessibility: native controls, labels, focusable actions, validation summaries, retained invalid input and responsive overflow checks are covered by automated tests.
