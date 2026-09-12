# WU-BILL-001 — Implementation Checklist

**Parent:** `WU-BILL-001-pakistan-everyday-billing-toolkit.md`  
**Architecture:** `WU-BILL-001-ARCHITECTURE-CONTRACT.md`  
**Acceptance:** `WU-BILL-001-ACCEPTANCE-MATRIX.md`  
**Date:** 2026-09-12  
**Status:** Ready for ordered implementation after roadmap gate/reprioritization

---

## 0. Preconditions

- [ ] Read `specs/BACKLOG.md` and confirm `WU-BILL-001` is allowed to enter production implementation.
- [ ] Read `specs/WU-PLAT-002H-SCOPE-FREEZE.md` and verify the planned change does not violate active P0 ownership.
- [ ] Read archived `WU-IG-001`, `WU-IG-002`, `WU-IG-003` as implementation history.
- [ ] Confirm `/urdu-invoice-generator` remains behaviorally out of scope.
- [ ] Inspect current repository shell, SEO graph, telemetry and browser-test conventions before adding files.
- [ ] Revalidate the FBR/public-source facts in the evidence ledger if public copy will ship.

Stop if implementation needs to redesign or refactor the current invoice generator.

---

# Slice 0 — Contract, fixtures and implementation map

**Production UI:** none.

## 0.1 Terminology

- [ ] Review Bill / بل with Pakistan-facing language reviewer(s).
- [ ] Review Cash Memo / کیش میمو.
- [ ] Review Receipt / رسید.
- [ ] Review Paid / ادا شدہ, Balance / بقایا, Udhaar / ادھار.
- [ ] Decide the least awkward public label for Customer.
- [ ] Validate Subtotal label; do not force overly formal Urdu.
- [ ] Preserve common English loanwords where that improves recognition.

## 0.2 Schema fixtures

Create deterministic fixtures for at least:

- [ ] English bill, one item, paid in cash.
- [ ] Urdu bill, multiple items, partial payment.
- [ ] Bilingual bill with Latin phone/account identifiers.
- [ ] Cash memo, walk-in customer omitted.
- [ ] Receipt, amount received only.
- [ ] Udhaar bill with zero amount paid.
- [ ] Discounted bill.
- [ ] Zero/invalid quantity/rate inputs.
- [ ] Large amount.
- [ ] Urdu item description with Latin SKU/numerals.

## 0.3 Calculation tests

- [ ] line amount.
- [ ] subtotal.
- [ ] discount clamp.
- [ ] total.
- [ ] amount-paid clamp.
- [ ] balance.
- [ ] paid state.
- [ ] partially-paid state.
- [ ] unpaid state.
- [ ] deterministic money formatting.

## 0.4 Current-code audit

Record, without changing behavior:

- [ ] existing invoice export approach;
- [ ] existing local-state approach;
- [ ] existing Roman Urdu integration opportunities;
- [ ] current telemetry helper;
- [ ] static shell registration mechanism;
- [ ] SEO metadata/head synchronization;
- [ ] sitemap/SEO graph generation;
- [ ] current print CSS constraints;
- [ ] relevant Playwright helpers.

## Slice 0 exit

- [ ] no production UI changed;
- [ ] invoice files untouched;
- [ ] terminology decisions recorded;
- [ ] schema accepted;
- [ ] fixtures committed;
- [ ] calculation tests green;
- [ ] implementation map reconciled with current code.

---

# Slice 1 — Bill Generator foundation

**Route:** `/urdu-bill-generator`

## 1.1 Static route

- [ ] Add standalone static page using current Write Urdu shell conventions.
- [ ] Add unique title/meta/H1 without claiming FBR integration.
- [ ] Keep public content crawlable without client rendering.
- [ ] Do not add homepage/global-navigation promotion yet unless separately approved.

## 1.2 Core state

- [ ] Implement `BillingDocumentV1` or reconciled equivalent.
- [ ] Implement pure calculations.
- [ ] Implement numbering/default date.
- [ ] Implement language mode state.
- [ ] Implement payment method/state state.
- [ ] Keep derived totals out of authoritative persistence.

## 1.3 Bill form

- [ ] Business/shop name.
- [ ] Business phone optional.
- [ ] Bill number.
- [ ] Date.
- [ ] Customer name optional.
- [ ] Customer phone optional.
- [ ] Add/remove item row.
- [ ] Description.
- [ ] Quantity.
- [ ] Rate.
- [ ] Amount derived.
- [ ] Discount optional.
- [ ] Total.
- [ ] Amount paid.
- [ ] Balance.
- [ ] Payment method.
- [ ] Notes optional.

## 1.4 Preview

- [ ] Live semantic preview.
- [ ] Empty optional fields do not leave visual gaps.
- [ ] Paid/partially-paid/balance state is visible.
- [ ] Urdu/English/bilingual labels switch without destroying values.
- [ ] Numbers/phone/account values remain directionally readable.

## 1.5 Output

- [ ] Print stylesheet.
- [ ] Browser PDF path.
- [ ] Safe filename.
- [ ] Overflow handling.
- [ ] Preview/output value parity.

## 1.6 Telemetry

- [ ] Add route/product integration through existing telemetry infrastructure.
- [ ] Add explicit allowlist of event properties.
- [ ] Prove no text/amount/contact/payment identifiers are emitted.

## Slice 1 exit

- [ ] Bill can be completed on desktop.
- [ ] Bill can be completed on required mobile viewports.
- [ ] PDF/print succeeds.
- [ ] privacy acceptance passes.
- [ ] invoice regression tests pass unchanged.
- [ ] route remains unpromoted if roadmap/public-release gate is still closed.

---

# Slice 2 — Cash Memo + Receipt

## 2.1 Mode selector

- [ ] Bill.
- [ ] Cash Memo.
- [ ] Receipt.
- [ ] Current mode is accessible to screen readers.
- [ ] Switching mode does not silently reinterpret incompatible values.

## 2.2 Cash Memo

- [ ] Customer remains optional.
- [ ] No due date.
- [ ] Payment defaults to immediate behavior.
- [ ] Compact output semantics.
- [ ] Total remains visually dominant.

## 2.3 Receipt

- [ ] Receipt number/date.
- [ ] Received from.
- [ ] Amount received.
- [ ] Purpose/for.
- [ ] Payment method.
- [ ] Business/shop identity.
- [ ] Optional note/signature line.
- [ ] Use receipt-specific state/rendering rather than fake item rows.

## Slice 2 exit

- [ ] each mode has distinct acceptance fixtures;
- [ ] no required field from one mode leaks into another;
- [ ] outputs identify the selected document type clearly;
- [ ] language/bidi tests pass for every mode.

---

# Slice 3 — Pakistan payment details + share

## 3.1 Payment-method registry

- [ ] Cash / نقد.
- [ ] Raast.
- [ ] JazzCash.
- [ ] Easypaisa.
- [ ] Bank transfer.
- [ ] Udhaar / ادھار.
- [ ] Other.

## 3.2 Adaptive details

- [ ] Raast ID field only where relevant.
- [ ] phone/account field for JazzCash/Easypaisa.
- [ ] account title/IBAN for bank transfer.
- [ ] no PIN/OTP/password/secret fields.
- [ ] no unsupported “official QR” claim.

## 3.3 Native sharing

- [ ] Detect `navigator.share`.
- [ ] Detect file-sharing support where applicable.
- [ ] Share generated local file where supported.
- [ ] Graceful download fallback.
- [ ] No external upload service.
- [ ] Never hard-code WhatsApp as if guaranteed.

## Slice 3 exit

- [ ] supported mobile browser can invoke native share;
- [ ] unsupported browser receives understandable fallback;
- [ ] network inspection confirms bill contents are not transmitted;
- [ ] payment details render correctly in all language modes.

---

# Slice 4 — Mobile speed + local continuity

- [ ] Measure current field/keyboard friction first.
- [ ] Optimize item-row add/remove for touch.
- [ ] Keep core controls reachable at 360px width.
- [ ] Prevent focus jumps/forced scroll loops.
- [ ] Keep preview useful without requiring constant large-scroll travel.
- [ ] Decide whether local draft restore materially helps repeat use.
- [ ] If local persistence ships, version state and add safe reset/new document.
- [ ] Never create customer-history or cloud-ledger behavior.

Exit only after iOS Safari + Android Chrome manual/browser coverage where available.

---

# Slice 5 — Print format expansion

Do not start until basic output is proven.

- [ ] A5/compact layout experiment.
- [ ] 80mm fixture/print validation.
- [ ] Two-up A4 customer/shop copy experiment.
- [ ] Customer Copy / Shop Copy labels.
- [ ] Cutting guide only if print result is reliable.
- [ ] No format should break Urdu shaping/bidi.

Keep only formats that produce repeatable browser print results.

---

# Slice 6 — Urdu-first accelerated entry experiments

This slice is optional and evidence-gated.

- [ ] Evaluate Roman Urdu assistance for item descriptions using existing ownership.
- [ ] Evaluate Voice → item text only by reusing existing Voice/input architecture.
- [ ] Build fixture-based structured extraction benchmark before any auto-row creation.
- [ ] Require explicit review before extracted items alter the document.
- [ ] Core manual bill flow must continue without Voice/AI/provider availability.
- [ ] No production user content in benchmark corpus.

---

# Slice 7 — SEO + internal linking release

Only after product acceptance/public release is authorized.

## 7.1 Search ownership

- [ ] Unique canonical `/urdu-bill-generator`.
- [ ] Keep `/urdu-invoice-generator` canonical unchanged.
- [ ] Verify metadata differs by user job, not synonym stuffing.
- [ ] Check GSC/query ownership after release.

## 7.2 Crawlable content

Include useful, concise sections for:

- [ ] what is a bill;
- [ ] bill vs invoice;
- [ ] what is a cash memo;
- [ ] what is a receipt;
- [ ] paid vs balance/udhaar;
- [ ] sharing/printing;
- [ ] ordinary bill vs FBR-integrated digital invoice.

## 7.3 Internal links

- [ ] Link Bill Generator → professional Invoice Generator.
- [ ] Only add reciprocal Invoice → Bill link after a focused invoice regression/content review.
- [ ] Register through current shell/SEO graph mechanism.
- [ ] Update sitemap through generator, not manual drift.
- [ ] Update `llms.txt`/tool indexes only if current governance requires it.

## 7.4 Thin-route prohibition

- [ ] Do not create `/cash-memo-generator` yet.
- [ ] Do not create `/urdu-receipt-generator` yet.
- [ ] Do not create keyword-variant doorway pages.

---

# Slice 8 — Evidence review

After a stable measurement window:

- [ ] Record route entrances by country/device.
- [ ] Record start → output conversion.
- [ ] Record mode mix.
- [ ] Record output mix.
- [ ] Record mobile errors/failures.
- [ ] Review GSC bill/cash-memo/receipt query growth.
- [ ] Compare `/urdu-bill-generator` and `/urdu-invoice-generator` query/page ownership.
- [ ] Decide Keep / Iterate / Expand / Hold.

Expansion candidates require evidence:

- [ ] separate Receipt route;
- [ ] separate Cash Memo route;
- [ ] Quotation;
- [ ] Delivery Challan;
- [ ] additional printer formats;
- [ ] structured Voice/Roman item entry.

---

# Required test discipline

Before merge of any production slice, run the relevant focused tests plus:

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

before public release.

Do not “fix” unrelated failing tests by weakening assertions or changing established product behavior.

---

# Merge checklist

Every implementation PR must state:

- slice ID;
- exact user job added;
- files changed;
- whether any protected invoice file changed (expected: no);
- privacy impact;
- SEO/canonical impact;
- telemetry events/properties;
- desktop/mobile evidence;
- test commands/results;
- public-release gate state;
- rollback path.

After a slice ships, update this checklist, the parent epic and `specs/BACKLOG.md` so planning state does not drift from runtime.