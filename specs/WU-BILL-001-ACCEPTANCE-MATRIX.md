# WU-BILL-001 — Acceptance Matrix

**Parent:** `WU-BILL-001-pakistan-everyday-billing-toolkit.md`  
**Date:** 2026-09-12  
**Status:** Planned acceptance contract

This matrix defines what must be true before `WU-BILL-001` is considered safe to release publicly. It is intentionally stricter than “the page renders”.

---

## A. Product boundary

| ID | Scenario | Expected |
| --- | --- | --- |
| A1 | Open `/urdu-invoice-generator` after implementing Bill Generator | Existing invoice behavior, layout, state and outputs remain unchanged |
| A2 | Inspect production diff | No protected invoice file changed unless a separately documented invoice bug required it |
| A3 | Open `/urdu-bill-generator` | User sees a simple everyday billing job, not the professional invoice form copied under a new title |
| A4 | Search/navigation ownership | Bill Generator and Invoice Generator have distinct canonical intent and metadata |
| A5 | Roadmap gate still active | Planning/fixtures may exist, but no unauthorized public promotion/core-UI insertion occurs |

---

## B. Route and crawlability

| ID | Scenario | Expected |
| --- | --- | --- |
| B1 | Request canonical route | 200 response on approved public release |
| B2 | View source without running JS | H1, core explanatory copy and essential metadata are present |
| B3 | Inspect canonical | Exactly one self-referencing canonical for `/urdu-bill-generator` |
| B4 | Inspect page title/description | Distinct from `/urdu-invoice-generator`; no keyword stuffing |
| B5 | Sitemap generation | Route is included only after public release is approved |
| B6 | Structured data | Only truthful supported type/properties; no invented ratings/claims |
| B7 | Alternate route attempt | No thin `/cash-memo-generator` or `/urdu-receipt-generator` is introduced by MVP |

---

## C. Bill calculations

| ID | Fixture | Expected |
| --- | --- | --- |
| C1 | 2 × 500 | line amount 1000 |
| C2 | rows 1000 + 250 + 750 | subtotal 2000 |
| C3 | subtotal 2000, discount 200 | total 1800 |
| C4 | total 1800, paid 1800 | balance 0, state paid |
| C5 | total 1800, paid 800 | balance 1000, state partially-paid |
| C6 | total 1800, paid 0 | balance 1800, state unpaid/udhaar-capable |
| C7 | paid greater than total | value safely normalized/rejected; no negative balance |
| C8 | negative quantity/rate | rejected or normalized per core contract; never silently creates negative sale |
| C9 | malformed numeric input | no `NaN`/Infinity leaks into preview or output |
| C10 | discount greater than subtotal | clamped/rejected per contract; total never becomes negative |

---

## D. Bill mode

| ID | Scenario | Expected |
| --- | --- | --- |
| D1 | Walk-in customer | Customer name/phone may be empty |
| D2 | One meaningful item | Valid preview can be produced |
| D3 | Multiple items | Totals update deterministically |
| D4 | Optional fields empty | No empty decorative blocks/gaps in output |
| D5 | Positive balance | `Balance / بقایا` is visibly prominent |
| D6 | Full payment | Paid state is clear without showing misleading balance |
| D7 | Udhaar method | Arithmetic still determines actual balance; method cannot falsify paid state |

---

## E. Cash Memo mode

| ID | Scenario | Expected |
| --- | --- | --- |
| E1 | Switch Bill → Cash Memo | Mode title/defaults change without corrupting item values |
| E2 | Walk-in sale | Customer remains optional |
| E3 | Immediate payment | Paid/cash default can be used quickly |
| E4 | Preview/export | Identifies document as Cash Memo / کیش میمو |
| E5 | Due date | No due-date concept appears |
| E6 | Compact layout | Total remains visually dominant and readable on print/mobile |

---

## F. Receipt mode

| ID | Scenario | Expected |
| --- | --- | --- |
| F1 | Switch to Receipt | Item-table requirements disappear |
| F2 | Enter amount received | Receipt can be valid without fake product rows |
| F3 | Received from omitted/allowed state | Behavior follows approved validation, not accidental Bill rules |
| F4 | Enter purpose | Appears correctly in preview/output |
| F5 | Payment method | Appears as receipt context, not invoice terms |
| F6 | Export | Clearly identifies Receipt / رسید |

---

## G. Urdu / English / bilingual behavior

| ID | Scenario | Expected |
| --- | --- | --- |
| G1 | Urdu mode | Urdu labels are readable RTL |
| G2 | English mode | English labels are readable LTR |
| G3 | Bilingual mode | Both labels appear without layout collision |
| G4 | Urdu item + `SKU-45` | Latin SKU remains readable in correct order |
| G5 | Urdu name + `03001234567` | Phone number remains LTR/readable |
| G6 | Urdu document + IBAN/Raast ID | Identifier is not visually reversed |
| G7 | Switch language mode | Entered values are preserved |
| G8 | Print/PDF | Bidi behavior matches screen semantics |
| G9 | Missing Urdu font | Usable fallback; no invisible/tofu-critical UI |

---

## H. Pakistan payment methods

| ID | Method | Expected |
| --- | --- | --- |
| H1 | Cash | No irrelevant account field |
| H2 | Raast | Optional Raast ID field only; no false official integration claim |
| H3 | JazzCash | Optional phone/account field |
| H4 | Easypaisa | Optional phone/account field |
| H5 | Bank transfer | Optional account title + IBAN/account |
| H6 | Udhaar | No credential fields; balance remains arithmetic-driven |
| H7 | Other | Bounded free-text note if required |
| H8 | Any method | UI never asks for PIN, OTP, password or secret |
| H9 | Print/export | Only fields chosen/entered by user are shown |

---

## I. Mobile usability

Required viewports should include at least:

```text
360 × 800
375 × 667
390 × 844
412 × 915
```

and real-device/manual iOS Safari + Android Chrome where available.

| ID | Scenario | Expected |
| --- | --- | --- |
| I1 | First load | Primary bill action/form is obvious without hunting through large promotional sections |
| I2 | Focus description | Software keyboard does not hide the active field irrecoverably |
| I3 | Quantity/rate entry | Numeric fields remain reachable and understandable |
| I4 | Add item | Touch target is usable and new row is brought into sensible view |
| I5 | Remove item | No accidental destructive action; minimum valid row behavior defined |
| I6 | Edit paid amount | Balance update remains visible/recoverable |
| I7 | Mode/language switch | Does not reset document unexpectedly |
| I8 | Preview access | User can review output without pathological scroll/focus loops |
| I9 | Output action | Share/PDF/Print controls are reachable after completion |
| I10 | Rotation/resizing | State remains intact |

---

## J. Output and print

| ID | Scenario | Expected |
| --- | --- | --- |
| J1 | Browser print | No editor controls print |
| J2 | Save as PDF | Document values match preview |
| J3 | Long description | Defined wrap/overflow behavior, no invisible clipping |
| J4 | Multiple items | No accidental blank page unless content genuinely exceeds supported format |
| J5 | Filename | Sanitized meaningful filename |
| J6 | Urdu PDF/print | Urdu shaping/order remains readable |
| J7 | Optional payment details absent | No empty headings/containers |
| J8 | Paid/balance | Same arithmetic result in preview and output |

---

## K. Native share

| ID | Scenario | Expected |
| --- | --- | --- |
| K1 | File share supported | Native share sheet can be invoked with local generated file |
| K2 | `navigator.share` unsupported | Download/print fallback appears |
| K3 | User cancels share | No destructive error/state loss |
| K4 | Share API throws | Graceful message/fallback |
| K5 | Network inspection | No third-party upload of document is performed to enable sharing |
| K6 | Copy/public language | UI says Share, not guaranteed “WhatsApp”, unless behavior truly targets it |

---

## L. Privacy and telemetry

Inspect analytics/network payloads using representative fixtures containing unique sentinel strings.

Forbidden sentinel examples:

```text
CUSTOMER-SENTINEL-91
0300-SECRET-TEST
ITEM-SENTINEL-URDU
RAAST-SENTINEL-88
125000.77
```

| ID | Scenario | Expected |
| --- | --- | --- |
| L1 | Type customer name | Sentinel never appears in telemetry/network payload |
| L2 | Type phone | Never appears in telemetry/network payload |
| L3 | Type item text | Never appears in telemetry/network payload |
| L4 | Enter amount | Numeric monetary value never appears in analytics |
| L5 | Enter payment ID/account | Never appears in analytics |
| L6 | Export/share | File/document body remains local except user-invoked OS share handoff |
| L7 | Product telemetry | Only allowlisted categorical properties appear |
| L8 | Local storage if enabled | No server sync or reuse of invoice storage keys |

---

## M. Accessibility

| ID | Scenario | Expected |
| --- | --- | --- |
| M1 | Keyboard-only navigation | Core form/mode/output controls usable |
| M2 | Mode selector | Current state exposed accessibly |
| M3 | Add/remove item buttons | Clear accessible names |
| M4 | Validation error | Programmatically associated and understandable |
| M5 | Language direction | `lang`/`dir` usage is semantically appropriate |
| M6 | Contrast/focus | Meets existing site accessibility expectations; visible focus retained |
| M7 | Dynamic total/balance | Update is perceivable without excessive live-region chatter |

---

## N. SEO cannibalization guardrail

After public release and sufficient data:

| ID | Check | Expected |
| --- | --- | --- |
| N1 | `urdu invoice generator` queries | Continue to resolve primarily to professional invoice route where appropriate |
| N2 | bill/cash-memo/receipt queries | New route earns incremental relevant impressions/clicks |
| N3 | Titles/H1s | Clearly distinguish bill vs invoice jobs |
| N4 | Internal linking | Contextual, not sitewide spam |
| N5 | Search evidence | No immediate creation of synonym routes merely because one query appears |

If `/urdu-bill-generator` materially cannibalizes established invoice demand without incremental reach, investigate intent/content before adding more pages.

---

## O. FBR/public-claim safety

| ID | Scenario | Expected |
| --- | --- | --- |
| O1 | Search page for `FBR approved` | No such claim unless separately verified integration exists |
| O2 | Search page for `FBR compliant` | No unsupported compliance claim |
| O3 | FAQ/help | Everyday-bill vs FBR-integrated invoice distinction is concise and dated/revalidated |
| O4 | Payment section | No claim that displayed Raast/JazzCash/Easypaisa details constitute provider integration |
| O5 | User interpretation | No tax-advice language or guarantee of statutory sufficiency |

---

## P. Regression suite

Before release:

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

Additionally:

- existing Invoice Generator focused browser/contract coverage must pass;
- no snapshots/expected results should be weakened merely to accommodate the new route;
- public page generation artifacts should be synchronized using existing repository scripts.

---

## Q. Release decision

Record one of:

```text
KEEP — acceptance passed, public release remains stable
ITERATE — bounded defects/opportunities identified
ROLLBACK — release harms privacy, established routes, mobile usability or output reliability
HOLD — product works but roadmap/evidence does not justify promotion/expansion
```

The acceptance record should include commit/release marker, browser/device coverage, test output summary and any remaining manual/external gate.