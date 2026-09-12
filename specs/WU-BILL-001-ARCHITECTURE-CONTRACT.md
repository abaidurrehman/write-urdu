# WU-BILL-001 — Architecture Contract

**Parent:** `WU-BILL-001-pakistan-everyday-billing-toolkit.md`  
**Date:** 2026-09-12  
**Status:** Planned implementation contract  
**Scope:** Browser-first Bill / Cash Memo / Receipt document model, rendering and output boundaries

---

## 1. Architecture objective

Build a standalone everyday billing tool that is simple enough for fast mobile transactions while remaining structurally safe for future receipt/cash-memo/quotation expansion.

The implementation must not achieve reuse by destabilizing the existing Invoice Generator. The current invoice implementation is an independent shipped product and remains authoritative for `/urdu-invoice-generator`.

---

## 2. Protected existing implementation

Do not modify in Slice 0 or Slice 1 unless an independently justified invoice bug requires it:

```text
urdu-invoice-generator.html
js/invoice-generator-core.js
js/invoice-generator.js
css/invoice-generator.css
```

If a generic helper can be safely extracted, first prove:

1. invoice behavior is unchanged;
2. invoice tests remain green;
3. the extraction reduces duplication materially;
4. rollback is trivial.

Default decision: duplicate a tiny pure helper before performing a risky cross-product refactor.

---

## 3. Proposed implementation map

Names are guidance; inspect current repository conventions before coding.

```text
urdu-bill-generator.html
js/bill-generator-core.js
js/bill-generator.js
css/bill-generator.css
```

Focused tests should live with existing contract/browser test conventions rather than creating a parallel test framework.

Potential fixture location:

```text
tests/fixtures/wu-bill-001/
```

Do not create a backend merely for document generation.

---

## 4. Canonical versioned document model

The precise runtime shape may evolve, but persistence/rendering must use a versioned serializable state.

```ts
type BillingDocumentType = "bill" | "cash-memo" | "receipt";
type BillingLanguageMode = "urdu" | "english" | "bilingual";
type BillingPaymentMethod =
  | "cash"
  | "raast"
  | "jazzcash"
  | "easypaisa"
  | "bank-transfer"
  | "udhaar"
  | "other";

type BillingPaymentState = "paid" | "partially-paid" | "unpaid";

type BillingMoney = number; // runtime normalized numeric value; never telemetry

type BillingParty = {
  name?: string;
  phone?: string;
};

type BillingItem = {
  id: string;
  description: string;
  quantity: number;
  rate: BillingMoney;
};

type BillingPaymentDetails = {
  raastId?: string;
  phoneOrAccount?: string;
  accountTitle?: string;
  ibanOrAccount?: string;
  note?: string;
};

type BillingDocumentV1 = {
  version: 1;
  documentType: BillingDocumentType;
  languageMode: BillingLanguageMode;
  documentNumber: string;
  date: string;
  business: BillingParty;
  customer?: BillingParty;
  items: BillingItem[];
  discount: BillingMoney;
  amountPaid: BillingMoney;
  paymentMethod: BillingPaymentMethod;
  paymentDetails?: BillingPaymentDetails;
  notes?: string;
};
```

Receipt mode may use a mode-specific payload if forcing it into item rows creates awkward semantics. If so, prefer a discriminated union:

```ts
type BillingDocument = BillLikeDocumentV1 | ReceiptDocumentV1;
```

Do not keep adding nullable fields until every document type becomes ambiguous.

---

## 5. Derived state

Derived values must not be persisted as authoritative state.

For bill/cash-memo:

```ts
lineAmount = quantity * rate
subtotal = sum(lineAmount)
discount = clamp(userDiscount, 0, subtotal)
total = max(0, subtotal - discount)
normalizedPaid = clamp(amountPaid, 0, total)
balance = max(0, total - normalizedPaid)
```

Payment state:

```ts
if (total > 0 && normalizedPaid >= total) paid
else if (normalizedPaid > 0) partially-paid
else unpaid
```

`paymentMethod === "udhaar"` does not override arithmetic. It is a user-facing payment-method/status intent and must remain logically consistent with the calculated balance.

For cash memo, the UI may default `amountPaid = total`, but it must not hide an inconsistent state silently.

---

## 6. Money rules

MVP currency is PKR-focused presentation but calculations should remain numeric and deterministic.

Rules:

- never use formatted strings as calculation inputs;
- reject `NaN`, infinities and negative quantities/rates;
- define decimal rounding in one pure function;
- format PKR consistently in preview/export;
- never send monetary values to analytics;
- test zero, decimal, large and malformed values;
- do not claim tax/accounting precision beyond the tool's scope.

If minor-unit arithmetic is introduced, document the conversion contract explicitly. Do not mix float and integer-minor-unit logic across modules.

---

## 7. Language and bidi contract

The document may contain Urdu and English simultaneously.

Rules:

1. Urdu labels/body text use RTL semantics.
2. Numbers, dates, phone numbers, account identifiers and Latin item codes remain readable LTR islands.
3. User content direction should be inferred conservatively or explicitly wrapped; do not reverse numeric strings.
4. Bilingual labels must not rely on visual punctuation order that breaks under RTL.
5. Print/export must preserve the same semantic ordering as screen preview.
6. Urdu font fallback must use repository-approved/public webfont strategy; do not bundle unapproved proprietary fonts.

Test examples should include:

- Urdu description + Arabic numerals;
- Urdu description + Latin SKU;
- English description + Pakistani phone number;
- bilingual business/customer names;
- Raast ID / IBAN inside Urdu document.

---

## 8. Mode-specific form/render contract

### Bill

Required for useful output:

- business/shop name or explicit allowed blank-state decision;
- at least one meaningful item;
- valid total.

Customer is optional.

### Cash Memo

Use the same item calculation engine but different defaults/presentation:

- customer optional;
- payment defaults toward paid/cash behavior;
- no due-date concept;
- compact heading/summary.

### Receipt

Do not pretend a receipt is an itemized sale when the user only needs proof of payment.

Preferred receipt model:

```ts
type ReceiptDocumentV1 = {
  version: 1;
  documentType: "receipt";
  languageMode: BillingLanguageMode;
  documentNumber: string;
  date: string;
  business: BillingParty;
  receivedFrom?: BillingParty;
  amountReceived: BillingMoney;
  purpose?: string;
  paymentMethod: BillingPaymentMethod;
  paymentDetails?: BillingPaymentDetails;
  notes?: string;
};
```

---

## 9. Numbering contract

Document numbering must be local and collision-tolerant rather than pretending to be an accounting ledger.

MVP options:

- a simple locally generated sequence; or
- date-based/default identifier that the user may edit.

Requirements:

- never imply globally unique/fiscal sequencing;
- safe local persistence if sequence is stored;
- no account required;
- output filename derived from sanitized type + document number/date.

Example:

```text
bill-2026-09-12-001.pdf
receipt-2026-09-12-001.png
```

---

## 10. Local persistence

Persistence is optional for first public MVP; if shipped, use local browser storage only.

Persist only the current draft/sequence needed for continuity.

Requirements:

- versioned state;
- safe migration/failure behavior;
- explicit reset/new document;
- untouched defaults should not produce confusing restore prompts;
- no silent server sync;
- no customer history/ledger under this epic.

Do not reuse invoice local-storage keys.

---

## 11. Output architecture

The screen preview is the semantic source for generated output, but implementation may require an export-specific clone/layout.

Supported MVP outcomes:

```text
print / browser PDF
native share or file share when supported
PNG/image only if current repository export technique is stable
```

Rules:

- preview and export display the same document values;
- hidden form controls are never printed;
- no unexpected blank pages;
- content overflow has a defined behavior;
- share fallback never uploads the document to a third-party conversion service;
- generated files remain local.

Do not depend on server-side PDF generation for MVP.

---

## 12. Native share contract

Use capability detection.

Preferred order:

1. generate supported local file;
2. if `navigator.canShare({ files })` and `navigator.share` support it, invoke native share;
3. otherwise offer download plus clear user action;
4. never claim “Share to WhatsApp” unless the browser/device actually routes there.

Share analytics may record:

```text
share_attempted
share_completed_or_resolved
share_fallback_shown
```

Do not capture target app or document contents unless the platform exposes only a harmless categorical value and privacy review approves it.

---

## 13. Payment-detail architecture

Payment details are printable user content, not credentials.

Never request/store:

- PIN;
- OTP;
- password;
- API key;
- card security code;
- bank login credentials.

Payment-method presentation logic should be data-driven rather than scattered conditionals.

Conceptual registry:

```ts
const PAYMENT_METHODS = {
  cash: { fields: [] },
  raast: { fields: ["raastId"] },
  jazzcash: { fields: ["phoneOrAccount"] },
  easypaisa: { fields: ["phoneOrAccount"] },
  "bank-transfer": { fields: ["accountTitle", "ibanOrAccount"] },
  udhaar: { fields: [] },
  other: { fields: ["note"] }
};
```

This registry must not imply API/payment integration.

---

## 14. Telemetry contract

Telemetry is outcome-level only.

Allowed examples:

```text
billing_tool_viewed { route }
billing_mode_selected { mode }
billing_language_selected { mode }
billing_started { mode }
billing_item_count_bucket { bucket }
billing_payment_category_selected { category }
billing_payment_state { state }
billing_output_attempted { format }
billing_output_completed { format }
billing_error { category }
```

Forbidden payloads:

```text
business name
customer name
phone number
item text
notes
amounts
payment IDs/account numbers
full document JSON
rendered document text
```

If the existing telemetry utility makes it easy to accidentally serialize DOM/form values, add a focused allowlist adapter for this route.

---

## 15. SEO/static architecture

The route should be statically crawlable like other Write Urdu tools.

Required once public:

- canonical URL;
- title/meta description unique from Invoice Generator;
- one clear H1;
- crawlable explanatory content;
- structured data only when truthful;
- sitemap inclusion through canonical repository process;
- internal link registration through existing shell/SEO graph rather than hand-editing generated artifacts blindly;
- no query-param canonical variants for language/mode.

Do not create `/cash-memo-generator` or `/urdu-receipt-generator` until evidence justifies distinct canonical ownership.

---

## 16. FBR/legal architecture boundary

No tax engine exists in this epic.

Therefore:

- no FBR API calls;
- no IRIS/PRAL integration;
- no tax-invoice QR generation;
- no FBR invoice-number claim;
- no “compliant” badge;
- no sales-tax validation.

The public page may explain the distinction between an everyday bill and an FBR-integrated digital invoice with dated, reviewed wording.

---

## 17. Future extension boundary

The model may later support:

```text
quotation
delivery-challan
```

Only if real evidence supports the job.

Do not add these enums now merely because they are imaginable. A future migration is preferable to prematurely shipping unused UI.

Likewise, voice/Roman structured item extraction must plug into `BillingDocument` as optional input assistance; it must never become required for calculation/render/export.

---

## 18. Required implementation discipline

Before writing production code:

1. inspect current static page/shell conventions;
2. inspect archived `WU-IG-001/002/003` for lessons, not ownership transfer;
3. inspect current telemetry integration conventions;
4. inspect current print/export dependencies;
5. inspect current SEO metadata/graph generators;
6. add pure calculation tests first;
7. add bidi/mobile/browser acceptance progressively;
8. run the repository's real test commands from `package.json`.

Minimum final validation for a public slice:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Use `npm run test:all` when practical before merge.