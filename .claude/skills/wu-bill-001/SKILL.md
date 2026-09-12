# WU-BILL-001 — Claude Orchestrator Skill

Use this skill for `WU-BILL-001` planning or implementation.

## Canonical skill

Read first:

```text
skills/wu-bill-001/SKILL.md
```

Then follow its read order, roadmap gate and slice discipline exactly.

## Epic sources

```text
specs/WU-BILL-001-pakistan-everyday-billing-toolkit.md
specs/WU-BILL-001-ARCHITECTURE-CONTRACT.md
specs/WU-BILL-001-IMPLEMENTATION-CHECKLIST.md
specs/WU-BILL-001-ACCEPTANCE-MATRIX.md
docs/WU-BILL-001-PAKISTAN-BILLING-EVIDENCE-2026-09-12.md
```

## Core rule

The current professional Invoice Generator is protected.

Never treat this epic as permission to redesign or refactor:

```text
/urdu-invoice-generator
urdu-invoice-generator.html
js/invoice-generator-core.js
js/invoice-generator.js
css/invoice-generator.css
```

The new product owner is:

```text
/urdu-bill-generator
```

with Bill / Cash Memo / Receipt behavior.

## Roadmap rule

The implementation package is ready, but `WU-PLAT-002H` remains the canonical P0 roadmap gate unless the current backlog or founder explicitly reprioritizes `WU-BILL-001`.

Do not confuse “spec complete” with “production release authorized”.

## Slice order

```text
0  contract + terminology + fixtures
1  Bill Generator foundation
2  Cash Memo + Receipt modes
3  Pakistan payment details + native share
4  mobile speed + local continuity
5  print formats
6  Roman/Voice accelerated entry experiments
7  SEO/internal-link release
8  evidence review
```

## Non-goals

Do not grow this into:

- POS;
- inventory;
- CRM;
- cloud khata/ledger;
- payment processing;
- FBR integration;
- tax filing;
- a rewrite of the existing Invoice Generator.

## Required checks

Use the canonical skill plus the current repository scripts. At minimum before a public production merge:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer `npm run test:all` before public release.