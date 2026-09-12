# WU-BILL-001 — Pakistan Billing Evidence Ledger

**Date:** 2026-09-12  
**Purpose:** Dated product/market evidence for `specs/WU-BILL-001-pakistan-everyday-billing-toolkit.md`  
**Rule:** Legal, payment-network and market facts can change. Revalidate official sources immediately before public claims or provider/network integration.

---

## 1. Decision summary

The evidence supports a product distinction between:

1. the existing professional `/urdu-invoice-generator`; and
2. a simpler Pakistan-focused everyday bill/cash-memo/receipt tool.

The strongest signals are:

- Pakistan has a very large base of tiny economic establishments and retail shops;
- physical Pakistani stationery combines the language of “cash memo”, “bill book” and “receipt book”, including Urdu versions;
- Pakistan-specific retail/business products foreground khata/udhaar, WhatsApp receipts and local payment rails;
- Raast merchant/QR adoption is already large enough that local payment vocabulary is not a niche concern;
- FBR digital invoicing is a distinct regulated integration regime for registered persons and must not be conflated with an ordinary browser-generated bill.

This ledger is product evidence, not a claim that every Pakistani business uses the same terminology or workflow.

---

## 2. Small-business market structure

### Pakistan Bureau of Statistics — Economic Census

Source:

- https://www.pbs.gov.pk/pakistan-bureau-of-statistics-economic-statistics-production/

Observed on 2026-09-12:

- approximately 7 million economic establishments;
- about 2.9 million establishments in wholesale and retail trade;
- about 2.7 million retail shops;
- roughly 95% of establishments have fewer than 10 employees;
- roughly 99% fall in the <=50 employee small-enterprise category cited by PBS.

Product implication:

> A lightweight phone/browser transaction document can address a structurally large micro/small-business segment without becoming enterprise accounting software.

Do not turn these establishment counts into a market-size/revenue forecast without a separate adoption model.

---

## 3. Everyday terminology evidence

### Physical Urdu/English cash-memo and bill books

Sources reviewed:

- https://www.daraz.pk/i422902013.html
- https://unicolor.pk/products/cash-memo-english-urdu-bill-book-receipt-book-cash-memo
- https://shop.hamariweb.com/cash-memo-urdu-bill-book-mpid763451
- https://habibprint.com/services/printing/bill-books-cash-memos-streamlined-business-tools
- https://www.printing.com.pk/product/bill-book-printing/

Observed product language includes combinations such as:

- “Cash Memo English/Urdu - Bill Book”;
- “Receipt Book Cash Memo”;
- Urdu cash-memo/bill books;
- duplicate/triplicate carbon-copy bill books;
- sequential numbering;
- customer + merchant copies;
- A5/smaller physical formats.

Product implication:

> “Bill” and “Cash Memo” deserve first-class product language rather than being treated only as synonyms hidden inside an invoice page.

The physical bill-book evidence also supports later experiments with compact print layouts and two-copy A4 output, but those formats are not required for MVP.

---

## 4. Khata / udhaar and local checkout evidence

### Pakistan-focused retail software

Sources reviewed:

- https://www.posline.pk/pos
- https://nafaa.pk/solutions/small-business
- https://www.barkatos.com/en
- https://udhaar.pk/automate-invoicing-payment-reminders-retail-store-udhaar-book/

Observed positioning includes:

- digital khata;
- udhaar/customer running balances;
- WhatsApp receipts/reminders;
- Cash, JazzCash, Easypaisa and Raast at checkout;
- phone-first small-shop positioning;
- invoice/bill generation after a sale.

Product implication:

> `amount paid` and `balance / بقایا` should be central in a Pakistan-facing bill tool. Udhaar is a strong local workflow signal, but Write Urdu should stop at document state in MVP rather than build a debt/ledger platform.

---

## 5. WhatsApp/share evidence

Pakistan-focused products repeatedly present WhatsApp as a distribution/receipt/reminder channel.

Sources:

- https://nafaa.pk/solutions/small-business
- https://udhaar.pk/automate-invoicing-payment-reminders-retail-store-udhaar-book/
- https://rapidgateway.pk/invoicing

Product implication:

> “Share” should be a primary completion action on mobile, implemented through the browser/device native share sheet rather than a brittle WhatsApp-only dependency.

Write Urdu should not promise that every device/browser can share directly to WhatsApp.

---

## 6. Local payment rails

### State Bank of Pakistan — Payment Systems Quarterly Review Q3 FY26

Sources:

- https://www.sbp.org.pk/psd/pdf/PS-Review-Q3FY26.pdf
- https://www.sbp.org.pk/our-operations/publications/payment-systems-review/365/payment-systems-quarterly-reports-2025-2026

Observed on 2026-09-12:

- approximately 2.5 million QR-enabled stores;
- approximately 2.6 million merchants registered on Raast P2M Alias.

### JazzCash Business

Sources:

- https://www.jazzcash.com.pk/business
- https://www.jazzcash.com.pk/business/account/basic-services

Observed positioning includes business acceptance of QR/Raast payments and merchant/business-account workflows.

Product implication:

> Cash, Raast, JazzCash, Easypaisa and bank transfer are appropriate user-facing payment categories for a Pakistan-oriented bill. In MVP they are document labels/details only, not transaction integrations.

Guardrail:

Never request PIN, OTP, passwords or secrets. Never claim a user-entered payment identifier/QR is an official generated payment request unless a future verified integration makes that true.

---

## 7. Formal invoice/payment-collection market evidence

Source:

- https://rapidgateway.pk/invoicing

Observed positioning:

- “professional invoices”;
- due dates;
- branded invoices;
- payment links;
- recurring invoices;
- WhatsApp/SMS/email delivery;
- cards/JazzCash/Easypaisa/Raast/bank transfer.

Product implication:

> Pakistan has a formal invoicing job as well as an everyday retail/shop billing job. This supports preserving `/urdu-invoice-generator` as the professional sibling rather than collapsing both jobs into one increasingly complex form.

---

## 8. FBR digital invoicing boundary

### Federal Board of Revenue — Digital Invoicing FAQ

Source:

- https://fbr.gov.pk/faqs/173967/173969
- https://www.fbr.gov.pk/di-legal-provisions/173967/173968

Observed on 2026-09-12:

- FBR defines electronic invoicing as a structured electronic tax-invoice process;
- FBR states electronic invoicing is mandatory for the registered corporate/non-corporate persons covered by the cited rules;
- integration is described through licensed integrators, with PRAL acting as a licensed integrator for specified purposes;
- simply transforming a paper invoice by scan/copy is not an electronic invoice under the FAQ definition.

Product implication:

> A browser-local bill/cash memo/receipt generator must not market itself as an FBR-integrated digital invoicing system.

Recommended bounded public explanation:

> This tool is for everyday bills, cash memos and receipts. Businesses required to issue FBR-integrated digital tax invoices should use an appropriately integrated invoicing system.

Revalidate the exact legal wording and affected-person scope before publishing or materially editing this statement.

---

## 9. Opportunity map

| Opportunity | Evidence strength | MVP decision |
| --- | --- | --- |
| Urdu/English simple Bill | High | Build |
| Cash Memo | High | Build as mode |
| Receipt | High | Build as mode |
| Paid / balance / udhaar | High | Build |
| Cash/Raast/JazzCash/Easypaisa/bank labels | High | Build as document details |
| Native mobile share | High | Build |
| WhatsApp-specific deep integration | Medium | Do not require; native share first |
| A5/compact print | Medium-high | Later slice |
| Duplicate/two-copy A4 | Medium | Later experiment |
| 80mm thermal | Medium | Later after browser-print validation |
| Khata/customer ledger | High market evidence, poor scope fit | Explicit non-goal for MVP |
| POS/inventory | High market evidence, poor Write Urdu fit | Explicit non-goal |
| FBR digital integration | Real regulated need, high complexity | Separate future product decision only |
| Quotation | Plausible | Evidence-gated later |
| Delivery challan | Plausible B2B job | Evidence-gated later |

---

## 10. Search/SEO hypothesis

Initial intent families to validate with GSC/external keyword evidence after release planning:

```text
urdu bill generator
bill maker pakistan
bill generator pakistan
urdu cash memo
cash memo generator
urdu receipt generator
bill banane wala
shop bill
دکان کا بل
بل بنائیں
رسید
کیش میمو
```

These are hypotheses, not permission to create a route for each phrase.

SEO architecture rule:

> Start with one canonical `/urdu-bill-generator` product that genuinely supports Bill, Cash Memo and Receipt. Split routes only after distinct search demand and distinct product behavior are both demonstrated.

---

## 11. Research uncertainties to validate in Slice 0

The following should not be treated as settled from web evidence alone:

1. Whether `گاہک` or `خریدار` is the better default Customer label across target segments.
2. Whether a translated Urdu label for “Subtotal” improves comprehension versus bilingual/English wording.
3. Whether users expect “رسید” primarily for proof-of-payment rather than itemized retail output.
4. How frequently target users need a named customer versus anonymous/walk-in bills.
5. Whether compact/A5, two-copy A4 or thermal is the most valuable second print format.
6. Whether users perceive “Udhaar” as payment method, status, or both; arithmetic balance must remain the source of truth regardless.
7. Which SEO phrases have meaningful search volume and which are merely plausible language.

Use Pakistani-speaker review + real product telemetry/search evidence before hard-coding uncertain vocabulary across the site.

---

## 12. Evidence quality rule

Prefer in this order:

1. official Pakistani regulator/statistics/payment-network sources;
2. first-party Pakistani product documentation;
3. local printers/retail stationery evidence for terminology/workflow;
4. marketplaces for supplementary terminology evidence;
5. SEO/blog claims only as hypotheses.

Never convert competitor marketing claims into Write Urdu public facts without independent verification.