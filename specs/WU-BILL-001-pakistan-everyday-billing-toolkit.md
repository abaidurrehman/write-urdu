# WU-BILL-001 — Pakistan Everyday Billing Toolkit

**Product:** Write Urdu  
**Feature ID:** `WU-BILL-001`  
**Status:** Planned / founder-approved / implementation package ready  
**Priority:** P1 candidate after `WU-PLAT-002H` activation evidence review  
**Date:** 2026-09-12  
**Area:** Pakistan small-business utility / Urdu business documents / mobile creation  
**Evidence:** `docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md`  
**Architecture:** `specs/WU-BILL-001-ARCHITECTURE-CONTRACT.md`  
**Execution:** `specs/WU-BILL-001-IMPLEMENTATION-CHECKLIST.md`  
**Acceptance:** `specs/WU-BILL-001-ACCEPTANCE-MATRIX.md`  
**Canonical implementation skill:** `skills/wu-bill-001/SKILL.md`  
**Primary dependencies:** `WU-PLAT-002H`, `WU-SEO-CTR-001`, `WU-ANALYTICS-003`, archived `WU-IG-001/002/003`

---

## 1. Executive decision

Create a new Pakistan-focused everyday billing surface without changing the existing professional invoice product.

The product promise is:

> **Make a simple Urdu, English or bilingual bill, cash memo or receipt in under a minute, then print, save or share it.**

The first public route is:

```text
/urdu-bill-generator
```

It serves a different job from:

```text
/urdu-invoice-generator
```

The existing invoice route remains the professional A4 invoice tool for client details, due dates, tax, payment terms, QR/payment details and formal document structure. `WU-BILL-001` must not redesign, migrate, simplify or repurpose it.

---

## 2. Hard product invariant: protect the invoice generator

The following are protected unless a separate invoice-specific feature is approved:

- `urdu-invoice-generator.html`;
- `js/invoice-generator-core.js`;
- `js/invoice-generator.js`;
- `css/invoice-generator.css`;
- existing `WU-IG-001/002/003` invoice behavior;
- current `/urdu-invoice-generator` canonical/query ownership;
- current invoice draft state and numbering behavior;
- current invoice export/print contracts.

`WU-BILL-001` may reuse small generic utilities only when extraction is demonstrably regression-safe. Do not refactor invoice code merely to make the new bill tool look architecturally elegant.

Any implementation plan that requires a behavioral change to `/urdu-invoice-generator` must stop and file that work separately.

---

## 3. Why this epic exists

Pakistan small-business billing intent is broader and less formal than the English accounting word “invoice”. Everyday transactions commonly use overlapping concepts such as:

- bill / بل;
- cash memo / کیش میمو;
- receipt / رسید;
- parchi / پرچی;
- paid / ادا شدہ;
- balance / بقایا;
- udhaar / ادھار;
- khata / کھاتہ.

The opportunity is not to turn Write Urdu into accounting software. It is to solve the short transaction-document job that sits between handwriting a bill book and operating a full POS/ERP.

The product should fit users such as:

- small retail/shop counters;
- tailors and repair shops;
- electricians, plumbers and AC technicians;
- tutors and teachers;
- home businesses;
- freelancers and local service providers;
- microbusinesses that need a printable/shareable customer record.

The defining flow is closer to:

```text
items/work → total → paid/balance → payment method → print/share
```

than to:

```text
client account → formal invoice → payment terms → receivables workflow
```

---

## 4. Roadmap governance

`WU-BILL-001` is founder-approved planning, but it is **not** a hidden exception to the current `WU-PLAT-002H` P0 roadmap gate.

While that gate remains open:

- specs, fixtures, architecture, copy research and isolated prototypes may proceed;
- production implementation must not disturb Basic/Rich Writer first-value UI;
- no homepage command wall or global navigation expansion is authorized by this epic;
- a public route should not ship until the backlog is re-reviewed or the founder explicitly reprioritizes this work.

This matters because the canonical backlog currently freezes broad Invoice/QR expansion and unrelated mini-tools while activation evidence is still being closed.

---

## 5. Product principles

### P1 — Everyday bill, not mini-accounting

The default experience should ask only for information needed to produce a useful transaction document.

No account, CRM, inventory, customer database, tax filing or ledger is required for MVP.

### P2 — Mobile first

A repeat user should be able to produce a simple bill quickly on a phone. The item table must remain usable with a software keyboard and narrow viewport.

### P3 — Urdu, English and bilingual are equal modes

Do not translate familiar Pakistani commerce terms into unnatural formal Urdu merely to maximize localization coverage.

Mixed RTL/LTR content must preserve numbers, currency, phone numbers, account identifiers and item codes correctly.

### P4 — Paid and balance are central

`total`, `amountPaid` and `balance` are first-class values. Partial payment and udhaar are not edge cases.

### P5 — Sharing is an outcome

On mobile, Share should be a primary completion action alongside PDF/image/print where supported. Use native Web Share when available; never require WhatsApp or a specific app.

### P6 — Local first

The MVP should remain browser-first and should not transmit bill content to Write Urdu servers.

### P7 — Familiar Pakistani payment language

Support user-entered payment details for:

- Cash / نقد;
- Raast;
- JazzCash;
- Easypaisa;
- Bank transfer;
- Udhaar / ادھار.

Do not claim payment-network integration when the tool is only displaying user-entered details.

### P8 — No false FBR positioning

An everyday bill/cash memo/receipt is not automatically an FBR-integrated digital tax invoice.

Do not use “FBR approved”, “FBR compliant”, “FBR integrated” or equivalent claims unless a separate verified integration exists.

---

## 6. Initial document modes

The first route should support three modes within one product surface:

```text
bill
cash-memo
receipt
```

### Bill

Use for an itemized customer transaction with optional partial payment or balance.

Primary fields:

- business/shop name;
- business phone (optional but prominent);
- bill number;
- date;
- customer name/phone optional;
- item rows;
- subtotal;
- optional discount;
- total;
- amount paid;
- balance;
- payment method;
- optional payment details/notes.

### Cash memo

Optimize for immediate counter sale:

- customer optional;
- no due date;
- payment assumed immediate unless changed;
- compact output;
- total is visually dominant;
- fast repeat entry.

### Receipt

Receipt mode is not a renamed bill. Its primary model is:

- receipt number;
- date;
- received from;
- amount received;
- purpose/for;
- payment method;
- business/shop name;
- optional phone/note/signature line.

---

## 7. Canonical terminology

Initial language registry:

| Concept | English | Urdu / familiar label |
| --- | --- | --- |
| Bill | Bill | بل |
| Cash Memo | Cash Memo | کیش میمو |
| Receipt | Receipt | رسید |
| Customer | Customer | گاہک / خریدار (validate in UI copy) |
| Description | Description | تفصیل |
| Quantity | Qty | تعداد |
| Rate | Rate | نرخ |
| Amount | Amount | رقم |
| Subtotal | Subtotal | ذیلی کل / use bilingual validation before launch |
| Discount | Discount | رعایت |
| Total | Total | کل رقم |
| Paid | Paid | ادا شدہ |
| Balance | Balance | بقایا |
| Cash | Cash | نقد |
| Udhaar | Credit/Udhaar | ادھار |
| Payment method | Payment Method | طریقۂ ادائیگی |

Slice 0 must validate awkward/formal labels with Pakistani speakers before treating this table as final public copy.

---

## 8. Proposed route and SEO ownership

### Canonical MVP route

```text
/urdu-bill-generator
```

Primary job:

> Create a simple Urdu, English or bilingual bill/cash memo/receipt for a customer.

The page may naturally answer adjacent terminology, but it must not become a keyword-stuffed doorway page.

### Existing professional sibling

```text
/urdu-invoice-generator
```

Keep its canonical intent as formal/professional invoicing.

### Possible later routes — evidence only

Do not create these in Slice 1:

```text
/cash-memo-generator
/urdu-receipt-generator
/urdu-quotation-maker
/delivery-challan-generator
```

A separate route requires evidence of distinct search intent **and** a meaningfully distinct product job. Otherwise keep the mode inside `/urdu-bill-generator`.

---

## 9. MVP output actions

After a useful document exists, expose:

1. Share;
2. Download PDF;
3. Save Image where browser implementation is stable;
4. Print.

Do not block output behind sign-in.

For Web Share:

- share a generated file when browser support allows;
- otherwise share/download through a graceful fallback;
- never send bill contents to an external service merely to make sharing work.

---

## 10. Print/output roadmap

### MVP

- responsive screen preview;
- print/PDF output;
- clean A4 or compact bill layout selected by implementation after print testing.

### Later validated formats

- A5;
- 80mm receipt;
- two copies on one A4 sheet;
- Customer Copy / Shop Copy.

Do not let printer-format breadth delay a reliable mobile bill flow.

---

## 11. Udhaar / partial payment contract

For bill mode:

```text
balance = max(0, total - amountPaid)
```

Display state:

```text
amountPaid >= total     → paid
0 < amountPaid < total  → partially-paid
amountPaid == 0         → unpaid/udhaar option
```

If balance is positive, output must make it obvious:

```text
Paid / ادا شدہ
Balance / بقایا
```

Do not create a hidden debt database in MVP.

A later convenience may generate a user-copyable payment reminder, but it must not automatically message customers or create recurring collection workflows.

---

## 12. Pakistan payment localization

Payment mode is presentation/state only in MVP.

Supported enum:

```text
cash
raast
jazzcash
easypaisa
bank-transfer
udhaar
other
```

Adaptive optional fields may include:

- Raast ID;
- phone/account number;
- account title;
- IBAN/account number;
- free-text payment note.

Guardrails:

- never label a user-entered QR/details block as an official network-generated payment request unless that is technically true;
- never collect or transmit payment credentials;
- never request PIN, OTP or secret keys;
- account/phone identifiers remain local document content.

---

## 13. Privacy and telemetry

MVP requires no backend persistence.

Permitted product telemetry is content-free and categorical, for example:

- route visit;
- selected document mode;
- selected language mode;
- bill started;
- item added count bucket;
- output attempted/completed;
- output type;
- payment method category;
- paid-state category;
- viewport/device category;
- repeat/local draft restoration event if implemented.

Never emit:

- customer name;
- phone number;
- business name;
- item description;
- amount values;
- payment account identifiers;
- notes;
- document text;
- generated file content.

---

## 14. FBR boundary

Public copy should contain a restrained clarification in the FAQ/help area, not a scary banner:

> This tool is for everyday bills, cash memos and receipts. Businesses required to issue FBR-integrated digital tax invoices should use an appropriately integrated invoicing system.

The wording must be reviewed against current FBR rules immediately before publication.

The tool must not present itself as tax advice.

---

## 15. Slice plan

### Slice 0 — Contract + terminology + implementation map

- validate Pakistan-facing terminology;
- confirm canonical route ownership;
- inspect current invoice code without changing it;
- identify reusable generic utilities vs invoice-owned code;
- lock schema and calculation fixtures;
- create mobile/RTL fixture set;
- confirm SEO cannibalization guardrails;
- no production UI change.

### Slice 1 — `/urdu-bill-generator` foundation

- standalone route;
- Bill mode first;
- English/Urdu/bilingual labels;
- business/customer optional fields;
- line items;
- subtotal/discount/total;
- paid/balance/udhaar state;
- local preview;
- print/PDF output;
- content-free telemetry;
- no navigation/homepage expansion yet unless separately approved.

### Slice 2 — Cash Memo + Receipt modes

- real mode-specific forms/renderers;
- compact cash memo behavior;
- amount-received receipt behavior;
- shared document shell without pretending all modes have identical semantics.

### Slice 3 — Pakistan payment details + native share

- Cash/Raast/JazzCash/Easypaisa/bank/udhaar selectors;
- adaptive optional payment details;
- Web Share/file fallback;
- privacy tests proving no document content leaves the browser.

### Slice 4 — Mobile speed + local draft continuity

- repeat-entry ergonomics;
- keyboard/focus resilience;
- safe local draft state if evidence says it reduces re-entry;
- no customer cloud database.

### Slice 5 — Print formats

- A5/compact validation;
- 80mm only after print fixtures/browser testing;
- optional two-up A4 customer/shop copy.

### Slice 6 — Urdu-first accelerated entry experiments

Evidence-gated only:

- Roman Urdu item entry assistance;
- voice-to-item prototype using existing owned voice/input architecture;
- structured extraction only after fixtures prove quality;
- no AI dependency for the core bill.

### Slice 7 — SEO/internal-link release

Only after product acceptance:

- crawlable explanatory content;
- bill vs invoice vs cash memo vs receipt guidance;
- contextual link to professional Invoice Generator;
- reciprocal link from invoice only if separately reviewed and regression-safe;
- sitemap/canonical/metadata/JSON-LD updates;
- no thin sibling routes.

### Slice 8 — Evidence review

Use Product Pulse + GSC to decide whether to:

- keep one route;
- promote the feature more widely;
- add a distinct receipt/cash-memo route;
- add quotation/delivery challan;
- hold expansion.

---

## 16. Explicit non-goals

MVP does not include:

- POS;
- inventory management;
- product catalog;
- CRM/customer database;
- cloud ledger;
- multi-user accounts;
- automatic debt collection;
- tax filing;
- FBR digital-invoice integration;
- accounting integrations;
- payment processing;
- automatic Raast/JazzCash/Easypaisa transactions;
- business analytics dashboard;
- AI-generated bookkeeping;
- replacement or redesign of `/urdu-invoice-generator`.

---

## 17. Success metrics

Primary product metric:

```text
useful bill start → successful output completion
```

Supporting metrics:

- mobile completion rate;
- time to first useful preview where measurable without content capture;
- Share/PDF/Print completion mix;
- document-mode mix;
- return/local-restore usage if shipped;
- errors/overflow/failure rate;
- GSC impressions/clicks/CTR for bill/cash-memo/receipt intent;
- incremental Pakistan organic entrances;
- evidence that `/urdu-bill-generator` is not cannibalizing `/urdu-invoice-generator`.

Do not optimize for raw pageviews at the expense of completed documents.

---

## 18. Release gate

A public MVP is releasable only when:

1. P0 roadmap governance permits the release or the founder explicitly reprioritizes it;
2. existing `/urdu-invoice-generator` regression tests remain green;
3. bill calculation fixtures pass;
4. Urdu/English/bilingual directionality passes the acceptance matrix;
5. mobile item entry works on narrow viewports with software keyboard;
6. generated output matches preview semantics;
7. privacy tests show no document content in telemetry/network calls;
8. FBR wording has been revalidated;
9. SEO ownership/canonical checks pass;
10. no additional thin acquisition routes are created as part of MVP.

---

## 19. Definition of done for the epic package

Planning is implementation-ready when the following exist and agree:

- this parent epic;
- architecture contract;
- ordered implementation checklist;
- acceptance matrix;
- dated evidence ledger;
- canonical Codex/Claude implementation skill;
- Claude orchestrator skill;
- handoff prompt;
- active spec registry entry;
- canonical backlog entry.

Implementation completion is a later state and must be recorded slice by slice.