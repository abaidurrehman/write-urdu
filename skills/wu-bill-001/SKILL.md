# WU-BILL-001 — Pakistan Everyday Billing Toolkit Skill

Use this skill when planning, implementing, reviewing or testing `WU-BILL-001`.

This skill is deliberately conservative: the new Bill Generator is a sibling to the existing professional Invoice Generator, not a rewrite of it.

---

## Mandatory read order

1. `specs/BACKLOG.md`
2. `specs/WU-BILL-001-pakistan-everyday-billing-toolkit.md`
3. `specs/WU-BILL-001-ARCHITECTURE-CONTRACT.md`
4. `specs/WU-BILL-001-IMPLEMENTATION-CHECKLIST.md`
5. `specs/WU-BILL-001-ACCEPTANCE-MATRIX.md`
6. `docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md`
7. `specs/WU-PLAT-002H-SCOPE-FREEZE.md`
8. `specs/archive/implemented/WU-IG-001-urdu-invoice-generator.md`
9. `specs/archive/implemented/WU-IG-002-invoice-visual-polish-adaptive-layout.md`
10. `specs/archive/implemented/WU-IG-003-invoice-refinement-v12.md`
11. current `urdu-invoice-generator.html` and invoice JS/CSS only to understand regression boundaries
12. current telemetry integration, shell/SEO generators and browser tests
13. `package.json`

Search the current repository before coding. Runtime code and regression tests are authoritative for shipped behavior.

---

## Core invariant

**Do not redesign, simplify, migrate or refactor `/urdu-invoice-generator` as part of this epic.**

Protected by default:

```text
urdu-invoice-generator.html
js/invoice-generator-core.js
js/invoice-generator.js
css/invoice-generator.css
```

The new product is:

```text
/urdu-bill-generator
```

with everyday Bill / Cash Memo / Receipt jobs.

If your implementation requires changing protected invoice behavior, stop and file that change separately.

---

## Roadmap gate

`WU-BILL-001` is implementation-ready planning, but the current backlog still treats `WU-PLAT-002H` as the P0 roadmap gate.

Before production work:

- confirm the backlog permits the slice; or
- confirm the founder has explicitly reprioritized it.

Planning, fixtures and isolated non-production work do not grant permission to add a new homepage command wall, redesign Basic/Rich Writer or bypass the active freeze.

---

## Slice discipline

Execute in this order unless the backlog explicitly changes it:

```text
Slice 0  contract + terminology + fixtures + implementation map
Slice 1  /urdu-bill-generator Bill-mode foundation
Slice 2  Cash Memo + Receipt mode semantics
Slice 3  Pakistan payment labels/details + native share
Slice 4  mobile speed + optional local continuity
Slice 5  print-format experiments
Slice 6  evidence-gated Roman/Voice accelerated entry
Slice 7  SEO/internal-link public release
Slice 8  evidence review and expansion decision
```

Do not skip Slice 0.

Do not build separate cash-memo/receipt routes in Slice 1.

---

## Slice 0 hard boundary

Slice 0 changes no production UI.

Required outputs:

- terminology decisions;
- versioned schema;
- calculation fixtures;
- bidi fixtures;
- mobile acceptance fixtures;
- current-code implementation map;
- SEO ownership decision;
- public/legal claim revalidation notes.

Invoice files must remain untouched.

---

## MVP product behavior

A repeat user should be able to make a simple bill quickly with:

- business/shop identity;
- optional customer;
- item rows;
- quantity/rate/amount;
- discount if needed;
- total;
- amount paid;
- balance;
- payment method;
- Urdu, English or bilingual labels;
- print/PDF/share outcome.

Do not introduce bookkeeping features merely because they are common in Pakistani POS products.

---

## Mode semantics

### Bill

Itemized transaction with optional partial payment/balance.

### Cash Memo

Immediate counter-sale behavior. Customer optional, no due date, compact output.

### Receipt

Proof of amount received. Prefer a receipt-specific discriminated state over fake item rows.

Do not make document modes cosmetic title changes only.

---

## Calculation discipline

Use pure functions and fixtures.

At minimum:

```text
lineAmount = quantity * rate
subtotal = sum(lineAmount)
total = max(0, subtotal - discount)
balance = max(0, total - normalizedPaid)
```

Never:

- allow `NaN`/Infinity into preview/export;
- produce negative balance silently;
- treat `udhaar` label as a substitute for arithmetic;
- send amount values to telemetry.

---

## Urdu/bidi discipline

Test real mixed-script cases, not only English screenshots.

Required examples:

- Urdu description + number;
- Urdu description + Latin SKU;
- Urdu business/customer name + Pakistani phone number;
- bilingual labels;
- Urdu document + Raast ID/IBAN.

Numbers, phone/account identifiers and Latin codes must not be visually reversed.

---

## Payment localization discipline

Supported document-level choices:

```text
Cash
Raast
JazzCash
Easypaisa
Bank transfer
Udhaar
Other
```

These are **presentation/state**, not integrations.

Never ask for:

- PIN;
- OTP;
- password;
- API secret;
- card security code;
- bank login.

Never claim official Raast/JazzCash/Easypaisa integration unless a future verified integration exists.

---

## Sharing discipline

Use browser capability detection.

Preferred behavior:

1. generate a local file;
2. use native Web Share/file share where supported;
3. otherwise show local download/print fallback.

Do not upload documents to a third-party service to make sharing work.

Do not promise WhatsApp specifically when the operating system share sheet decides the target.

---

## Privacy discipline

No bill content in Product Pulse or analytics.

Never emit:

```text
business/customer names
phone numbers
item descriptions
notes
amounts
payment identifiers/accounts
document JSON/rendered text
```

Telemetry must use an explicit categorical allowlist.

Use sentinel strings from the acceptance matrix to inspect network/analytics payloads.

---

## SEO discipline

The MVP has one canonical route:

```text
/urdu-bill-generator
```

Do not create:

```text
/cash-memo-generator
/urdu-receipt-generator
```

until distinct search demand and distinct product behavior are both proven.

Keep `/urdu-invoice-generator` metadata/canonical ownership intact.

Public copy may explain Bill vs Invoice vs Cash Memo vs Receipt naturally; do not stuff synonyms into headings.

---

## FBR/legal discipline

This epic does not implement FBR digital invoicing.

Never use unsupported claims such as:

```text
FBR approved
FBR compliant
FBR integrated
```

Before public release, re-check the current FBR Digital Invoicing FAQ/legal provisions linked in the evidence ledger.

The page may contain only a restrained distinction between an everyday bill and an FBR-integrated digital invoice.

---

## Architecture discipline

Prefer standalone files initially:

```text
urdu-bill-generator.html
js/bill-generator-core.js
js/bill-generator.js
css/bill-generator.css
```

Reconcile names with current repo conventions.

Do not create a backend for browser-local calculations/rendering.

Do not refactor invoice internals for speculative reuse.

If a tiny helper must be duplicated to protect the shipped invoice path, choose regression safety over premature abstraction.

---

## Testing discipline

Add focused pure tests first, then browser/mobile/output tests.

At minimum before a production merge:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer:

```bash
npm run test:all
```

Do not weaken existing assertions to make the new feature pass.

Existing Invoice Generator tests must stay green.

---

## Agent reporting format

For each slice, report:

1. **Slice:** exact slice number/name.
2. **Roadmap state:** why implementation is currently allowed.
3. **User job:** what became possible.
4. **Files changed:** exact paths.
5. **Protected invoice files changed?:** expected `No`; explain any exception.
6. **Privacy:** telemetry/network behavior.
7. **SEO:** canonical/metadata/internal-link impact.
8. **Mobile:** viewport/device evidence.
9. **Tests:** commands and results.
10. **Remaining gates:** manual, legal, SEO or evidence work.
11. **Rollback:** simplest safe rollback.

---

## Stop conditions

Stop and report instead of improvising if:

- the slice requires changing current Invoice Generator behavior;
- a new public route would violate the active backlog gate;
- Urdu terminology is uncertain and public copy depends on it;
- export/share requires sending private document content to a server;
- a proposed payment field looks like a credential;
- FBR/legal wording cannot be verified;
- a new canonical route would duplicate Bill Generator intent;
- tests reveal an established invoice/typing/mobile regression.

---

## Definition of a good implementation

The feature is successful when it feels like a fast Pakistani bill/cash-memo/receipt utility, not a cut-down international accounting app; works well in Urdu/mixed script on mobile; makes paid/balance/udhaar obvious; keeps user document content local; and expands search/product reach without damaging the professional Invoice Generator.