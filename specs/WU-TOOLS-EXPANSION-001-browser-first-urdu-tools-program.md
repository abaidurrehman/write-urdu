# WU-TOOLS-EXPANSION-001 — Browser-first Urdu Tools Program

**Status:** Active umbrella — implemented children archived; `006` remains Hold/R&D  
**Reconciled:** 2026-08-30  
**Area:** Adjacent Urdu text utilities / acquisition / workspace handoffs

## Purpose

Keep WriteUrdu focused on useful adjacent Urdu text jobs that can feed naturally into the established writing/editing/creation journey without weakening the core English-letter-to-Urdu experience.

This umbrella is retained because it still governs whether future adjacent tools belong in the product. It is **not** an instruction to rebuild the children that already shipped.

## Child state

| ID | Capability | Current state |
| --- | --- | --- |
| `WU-TOOLS-EXPANSION-002` | Urdu Text Cleaner / RTL Fixer | **Implemented** — archived |
| `WU-TOOLS-EXPANSION-003` | Urdu OCR | **Implemented** — archived |
| `WU-TOOLS-EXPANSION-004` | Urdu Voice Typing speech behaviour | **Implemented** — archived; active voice growth/platform parents own future work |
| `WU-TOOLS-EXPANSION-005` | InPage Unicode Converter | **Implemented** — archived |
| `WU-TOOLS-EXPANSION-006` | Urdu/Hindi Script Converter | **Hold / R&D** — remains active-root because it is intentionally unbuilt |

Historical children:

- [`archive/implemented/WU-TOOLS-EXPANSION-002-urdu-text-cleaner-rtl-fixer.md`](archive/implemented/WU-TOOLS-EXPANSION-002-urdu-text-cleaner-rtl-fixer.md)
- [`archive/implemented/WU-TOOLS-EXPANSION-003-urdu-ocr.md`](archive/implemented/WU-TOOLS-EXPANSION-003-urdu-ocr.md)
- [`archive/implemented/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`](archive/implemented/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md)
- [`archive/implemented/WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md`](archive/implemented/WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md)

The pre-reconciliation umbrella is preserved at [`archive/snapshots/WU-TOOLS-EXPANSION-001-2026-08-30-pre-reconciliation.md`](archive/snapshots/WU-TOOLS-EXPANSION-001-2026-08-30-pre-reconciliation.md).

## Admission rules for another tool

A new child should enter this program only when it has:

1. a clear Urdu-writing/text job rather than generic novelty value;
2. evidence of user/search need or a strong continuation from an existing workflow;
3. one clear route owner and no duplicate-intent doorway strategy;
4. a natural handoff into/out of the existing workspace journey;
5. bounded privacy/telemetry behaviour;
6. a credible low-maintenance implementation compatible with the current Cloudflare product architecture.

Ideas that fail those checks stay on Hold instead of receiving a detailed implementation spec.

## Enduring guardrails

- Protect core transliteration behaviour and established ranking URLs.
- Reuse shared input/handoff/telemetry infrastructure rather than creating isolated mini-apps.
- Keep user content out of URLs/telemetry unless an explicit feature contract safely requires otherwise.
- Avoid paid/server-side processing where the job can be solved reliably in-browser; exceptions require their own approved contract.
- Do not create many near-identical SEO routes around the same tool.
- Implemented child specs remain history; maintenance follows code/tests and active parent contracts.
