# WU-BILL-001 Slice 0 — Contract, Terminology, Fixtures & Implementation Map

**Date:** 2026-09-12  
**Parent:** `specs/WU-BILL-001-pakistan-everyday-billing-toolkit.md`  
**Slice:** 0  
**Status:** Implementation branch — no production route/UI  
**Branch:** `feat/wu-bill-001-slice-0`

## Decision summary

Slice 0 establishes the billing document contract without publishing `/urdu-bill-generator` or changing any current user-facing surface.

The founder explicitly approved proceeding with `WU-BILL-001` on 2026-09-12. This permits Slice 0 planning/fixtures/pure-core work. It does **not** by itself relax the `WU-PLAT-002H` gate for a public route, homepage/global-nav promotion or core-writer UI change.

Protected Invoice Generator behavior remains out of scope.

---

## 1. Terminology decisions

The MVP should sound like a Pakistani everyday business utility rather than translated accounting software.

| Concept | English | Urdu | Decision |
| --- | --- | --- | --- |
| Bill | Bill | بل | accepted |
| Cash Memo | Cash Memo | کیش میمو | accepted as familiar loanword |
| Receipt | Receipt | رسید | accepted |
| Customer | Customer | گاہک | use for everyday bill UI; `خریدار` may still appear in explanatory/formal copy |
| Description | Description | تفصیل | accepted |
| Quantity | Quantity | تعداد | accepted |
| Rate | Rate | نرخ | accepted |
| Subtotal | Subtotal | جمع | prefer short familiar label over forced literal `ذیلی مجموعہ` in everyday bill UI |
| Discount | Discount | رعایت | accepted |
| Total | Total | کل رقم | accepted |
| Paid | Paid | ادا شدہ | accepted |
| Balance | Balance | بقایا | accepted |
| Udhaar | Udhaar | ادھار | preserve familiar South-Asian business word |
| Cash | Cash | نقد | accepted |

### Language rule

Do not translate familiar product/payment names into unnatural Urdu. Keep `Raast`, `JazzCash`, `Easypaisa`, `WhatsApp`, `Bill` and `Cash Memo` recognizable while pairing them with Urdu explanation where useful.

### Review status

These labels are accepted for implementation fixtures and core contracts. Public marketing/help copy still gets a final Pakistan-facing language pass before Slice 7 release. Slice 0 does not claim a separate external linguist review that has not occurred.

---

## 2. Versioned state decision

Runtime contract starts at:

```text
BillingDocumentV1
version = 1
```

Supported types:

```text
bill
cash-memo
receipt
```

Supported language modes:

```text
english
urdu
bilingual
```

Supported payment methods:

```text
cash
raast
jazzcash
easypaisa
bank-transfer
udhaar
other
```

Receipt is a discriminated document shape with `amountReceived`; it does not fabricate sale item rows.

Derived totals are never persisted as authoritative document state.

---

## 3. Money/calculation decision

Persist/input monetary values are normalized as non-negative **major-unit numeric values** (PKR-facing MVP). Derived calculations use integer minor units internally.

Canonical calculation:

```text
rateMinor = round(rate * 100)
lineAmountMinor = round(rateMinor * quantity)
subtotalMinor = sum(lineAmountMinor)
discountMinor = clamp(round(discount * 100), 0, subtotalMinor)
totalMinor = max(0, subtotalMinor - discountMinor)
amountPaidMinor = clamp(round(amountPaid * 100), 0, totalMinor)
balanceMinor = max(0, totalMinor - amountPaidMinor)
```

Payment state remains arithmetic:

```text
paid            total > 0 && amountPaid >= total
partially-paid  amountPaid > 0 && amountPaid < total
unpaid          amountPaid == 0
```

`paymentMethod = udhaar` does not override the arithmetic state.

---

## 4. Fixture corpus

Canonical fixture file:

```text
tests/fixtures/wu-bill-001/billing-documents.v1.json
```

Committed cases:

1. English bill — one item — fully paid cash.
2. Urdu bill — multiple items — partial payment.
3. Bilingual bill — Latin phone/Raast/IBAN identifiers.
4. Cash memo — walk-in customer omitted.
5. Urdu receipt — amount received only.
6. Udhaar bill — zero paid / full balance.
7. Discounted bill.
8. Invalid quantity/rate/discount/payment inputs.
9. Large-value bill.
10. Urdu description containing Latin SKU and numerals.

The fixtures intentionally contain no production/user data.

---

## 5. Bidi decision

Screen/print implementation later must use semantic direction rather than manipulating source strings.

Pure Slice 0 rule:

- text follows its first strong Urdu/Latin character;
- phone/date/account/payment identifiers are explicit LTR islands;
- normalization preserves mixed source strings byte-for-byte except bounded trimming;
- no code reverses phone numbers, SKUs, Raast IDs or IBAN/account strings.

Fixture examples include:

```text
پرنٹر کارٹریج SKU-HP85A
03005554444
PK36SCBL0000001123456702
```

The future renderer should use semantic `dir`, `<bdi>` or equivalent browser bidi primitives rather than custom string reversal.

---

## 6. Current-code implementation map

This audit records current ownership without changing it.

### 6.1 Existing Invoice Generator

Protected implementation:

```text
urdu-invoice-generator.html
js/invoice-generator-core.js
js/invoice-generator.js
css/invoice-generator.css
```

Current invoice state is versioned and normalized in `js/invoice-generator-core.js`. Invoice calculations already use minor-unit arithmetic. This is a useful precedent, but `WU-BILL-001` intentionally owns a smaller independent schema rather than migrating invoice state.

### 6.2 Invoice local draft pattern

`js/invoice-generator.js` currently owns a browser-local draft key:

```text
writeUrdu.invoiceGenerator.draft.v1
```

The bill tool must use a separate future key if Slice 4 proves local continuity useful. Slice 0 introduces no persistence.

### 6.3 Existing invoice export pattern

`urdu-invoice-generator.html` currently includes jsPDF/html2canvas and `js/invoice-generator.js` owns invoice preview/export behavior. Other Write Urdu paths also have shared/lazy export support through `js/site-runtime.js`.

Slice 1 should inspect current dependency-loading constraints before choosing the bill output path. Do not copy eager dependencies blindly and do not refactor invoice export while adding bills.

### 6.4 Roman Urdu/input opportunity

Current product ownership for transliteration/input remains with existing input/transliteration infrastructure (including `js/input-mode.js`, Google transliteration integration and the `WU-INPUT-001`/`WU-JOURNEY-001B` contracts).

`WU-BILL-001` Slice 1 is manual-entry-first. Roman/Voice accelerated item entry remains Slice 6 and must reuse existing ownership rather than inventing a second input engine.

### 6.5 Telemetry integration

Current creation-tool telemetry is bounded through:

```text
js/v2-shell.js
js/product-telemetry.js
js/product-telemetry-integrations.js
functions/api/events.js
```

`js/v2-shell.js` uses an explicit product-route allowlist. `js/product-telemetry.js` maps route → product category. `js/product-telemetry-integrations.js` observes product-specific outcomes.

Future bill telemetry therefore needs an explicit route/product registration and a billing-specific categorical allowlist. Never emit names, phone numbers, item descriptions, notes, amounts, payment IDs/accounts or document JSON.

Slice 0 changes none of these files.

### 6.6 Static shell registration

Static navigation/shell ownership is generated from the current shell registry/scripts rather than hand-edited independently. Relevant implementation/tests include:

```text
scripts/static-shell-registry.js
scripts/static-shell.js
tests/static-shell-source-contract.test.js
js/site-header-core.js
js/outcome-navigation.js
```

Slice 1 may create an isolated unpromoted page, but global navigation promotion waits for its explicit release gate.

### 6.7 SEO head/graph/sitemap ownership

Current commands identify the canonical mechanisms:

```text
npm run seo:sync-heads
npm run seo:heads:check
npm run seo:graph:sync
npm run seo:graph:check
npm run seo:generate
npm run seo:check
```

Relevant scripts include:

```text
scripts/sync-static-search-metadata.js
scripts/sync-static-seo-graph.js
scripts/generate-seo-files.js
scripts/check-seo.js
```

Slice 7 owns broad public SEO/internal-link release. Slice 0 adds no sitemap, canonical or public metadata.

### 6.8 Print/output constraints

The existing invoice tool owns fixed-page print styling in `css/invoice-generator.css`; broader document output paths use browser-rendered/raster export in parts of the product.

Bill printing must be benchmarked independently. Do not assume A4 invoice CSS is appropriate for cash memo, A5 or 80mm output.

### 6.9 Browser/acceptance conventions

Repository CI runs static/SEO/governance contract tests plus focused Playwright suites from `.github/workflows/quality.yml`.

Core tests use Node `assert` and are enumerated in `scripts/run-contract-tests.js`. Slice 0 follows that existing convention with:

```text
tests/bill-generator-core.test.js
```

Future production/mobile acceptance belongs in Playwright after a real route exists.

---

## 7. SEO ownership decision

Canonical public route remains planned as:

```text
/urdu-bill-generator
```

Slice 0 does **not** publish it.

Protected existing ownership:

```text
/urdu-invoice-generator
```

No Slice 0 metadata, internal link, sitemap or canonical modification is allowed.

Future separate `/cash-memo-generator` and `/urdu-receipt-generator` routes remain prohibited until both distinct query evidence and distinct product behavior justify them.

---

## 8. Public/legal claim note

Slice 0 publishes no public billing/FBR copy.

The dated evidence ledger is:

```text
docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md
```

The implementation must continue to distinguish an everyday bill/cash memo/receipt from FBR-integrated digital invoicing.

Forbidden claims remain:

```text
FBR approved
FBR compliant
FBR integrated
```

FBR source material must be rechecked again immediately before any public release containing regulatory wording. No tax engine, PRAL/IRIS integration or FBR QR/numbering exists in this epic.

---

## 9. Slice 0 file boundary

Expected Slice 0 product/test files:

```text
js/bill-generator-core.js
tests/bill-generator-core.test.js
tests/fixtures/wu-bill-001/billing-documents.v1.json
docs/WU-BILL-001-SLICE-0-CONTRACT-2026-09-12.md
scripts/run-contract-tests.js
specs/WU-BILL-001-IMPLEMENTATION-CHECKLIST.md
```

Expected protected invoice files changed:

```text
none
```

Expected production route/UI changes:

```text
none
```

---

## 10. Slice 0 exit gate

Slice 0 may be marked complete only when:

- terminology above is recorded;
- schema version 1 is executable and tested;
- the complete fixture corpus is committed;
- calculation, clamp, formatting and payment-state tests are green;
- bidi/identifier preservation tests are green;
- implementation map is recorded against current code;
- no production page loads `js/bill-generator-core.js`;
- no protected invoice file changed;
- repository CI is green on the Slice 0 PR.

A green Slice 0 does not automatically authorize Slice 1 public-route release. That decision remains separately governed by the active roadmap gate.
