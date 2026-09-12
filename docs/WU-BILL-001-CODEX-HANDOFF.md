# WU-BILL-001 — Codex / VS Code Handoff

Use this handoff when transferring the Pakistan Everyday Billing Toolkit to Codex or another implementation agent.

## Copy/paste prompt

```text
You are resuming implementation planning for Write Urdu feature WU-BILL-001 — Pakistan Everyday Billing Toolkit.

Repository:
https://github.com/abaidurrehman/write-urdu

Before changing code, read in this exact order:

1. specs/BACKLOG.md
2. skills/wu-bill-001/SKILL.md
3. specs/WU-BILL-001-pakistan-everyday-billing-toolkit.md
4. specs/WU-BILL-001-ARCHITECTURE-CONTRACT.md
5. specs/WU-BILL-001-IMPLEMENTATION-CHECKLIST.md
6. specs/WU-BILL-001-ACCEPTANCE-MATRIX.md
7. docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md
8. specs/WU-PLAT-002H-SCOPE-FREEZE.md
9. archived WU-IG-001/002/003 invoice specs
10. current runtime/tests relevant to invoice, telemetry, shell, SEO and print/export

Important invariants:

- Keep the existing /urdu-invoice-generator as-is. It is the professional invoice product.
- Do not redesign, simplify, migrate or refactor the existing invoice generator for this epic.
- WU-BILL-001 owns the new /urdu-bill-generator sibling for everyday Bill / Cash Memo / Receipt workflows.
- The package is implementation-ready planning, but WU-PLAT-002H remains the P0 roadmap gate unless the current backlog or founder explicitly reprioritizes this feature.
- Do not introduce POS, inventory, CRM, cloud khata, payment processing, tax filing or FBR integration.
- Keep bill contents browser-local and out of telemetry.
- Do not create separate cash-memo/receipt SEO routes during MVP.

Your first task is Slice 0 only unless the current backlog explicitly authorizes production implementation:

1. Reconcile the current repository implementation map.
2. Confirm protected invoice files and existing regression coverage.
3. Validate/record Pakistan-facing terminology decisions.
4. Add deterministic schema/calculation/bidi fixtures and focused pure tests in current repo conventions.
5. Confirm SEO canonical ownership and telemetry privacy allowlist design.
6. Do not change production UI in Slice 0.
7. Run the relevant tests.
8. Update the Slice 0 checklist/status with exact evidence.

Before coding, inspect current code rather than trusting filenames from the spec blindly.

When done, report:

- slice completed;
- roadmap authorization state;
- exact files changed;
- protected invoice files changed? (expected No);
- terminology decisions;
- fixtures/tests added;
- privacy/SEO findings;
- test commands and results;
- blockers/gates;
- recommended next slice.

Do not proceed to Slice 1 automatically if the roadmap gate is still closed. Finish Slice 0 cleanly and stop with a concrete implementation-readiness report.
```

## If Slice 1 has been explicitly authorized

Append this instruction:

```text
The founder/current backlog has explicitly authorized WU-BILL-001 Slice 1 production implementation.

Proceed with /urdu-bill-generator Bill-mode foundation only after Slice 0 acceptance is complete. Follow the canonical skill and architecture contract. Do not add Cash Memo/Receipt as cosmetic aliases; those belong to Slice 2. Do not touch protected invoice files unless a separately documented regression-safe reason exists.
```

## Review prompt after implementation

```text
Review the WU-BILL-001 implementation against specs/WU-BILL-001-ACCEPTANCE-MATRIX.md.

Be adversarial. Specifically inspect:
- existing /urdu-invoice-generator regressions;
- calculation edge cases;
- Urdu RTL + LTR phone/account/number behavior;
- mobile software-keyboard/focus behavior;
- print/PDF parity;
- native-share fallback;
- telemetry/network leakage using sentinel content;
- unsupported FBR/payment-integration claims;
- SEO canonical duplication or thin route creation.

Run repository tests, report every failing acceptance ID, and do not mark the slice complete based only on visual screenshots.
```