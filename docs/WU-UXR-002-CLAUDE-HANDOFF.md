# WU-UXR-002 — Claude Code (VS Code) Handoff

Branch with everything: `claude/write-urdu-card-studio-audit-tefvyq`

## One-time setup (terminal in VS Code)

```bash
git fetch origin
git checkout claude/write-urdu-card-studio-audit-tefvyq
npm ci
npx playwright install chrome
cd docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness && npm install && cd -
```

## Handover prompt (paste into a new Claude Code session)

```text
You are taking over WU-UXR-002, the Card Studio UX remediation for Write-Urdu. Work in this repo on branch
claude/write-urdu-card-studio-audit-tefvyq (already checked out).

Context already in the repo — read before doing anything:
1. skills/wu-uxr-002-card-studio/SKILL.md  (execution rules; also registered as the wu-uxr-002-card-studio skill)
2. specs/WU-UXR-002-card-studio-ux-remediation.md  (the plan: §4 conventions, §5 order, §6 slices, §7 decisions)
3. specs/WU-UXR-002-IMPLEMENTATION-CHECKLIST.md  (tick boxes + per-slice prompts)
4. docs/audits/urdu-card-studio-ux-2026-10-11/01-executive-summary.md and 03-ux-findings.md
   (39 findings CARD-UX-001…039 with evidence)
5. specs/BACKLOG.md sections P0.11 and P0.12, and specs/WU-PLAT-002H-SCOPE-FREEZE.md

Your job this session:
- Report back in 10 lines or fewer: which slices are done (from the checklist), which slice is next, and whether
  that slice needs a decision (D-UX2-1…4 in the spec §7, or a "decision line" in BACKLOG P0.12) that is not yet
  recorded. If a needed decision is missing, ask me and stop.
- Otherwise implement ONLY that next slice, following the skill exactly:
  * create branch claude/wu-uxr-002<letter>-<slug> from the current branch;
  * write the new contract test + browser spec first, run them, and show they FAIL on current code;
  * implement; register tests in scripts/run-contract-tests.js, playwright.config.js and
    .github/workflows/quality.yml;
  * English + natural Urdu for every string; npm run locale:generate after HTML edits;
  * bump sw.js CACHE_NAME and the write-urdu-shell-vNN test pins if APP_SHELL files changed;
  * run the standard validation in spec §4.5 and the renderer regression set in §4.7;
  * re-measure with the audit harness (README in docs/audits/.../evidence/harness) and compare out/*.json with
    ../logs/*.json — never run p3, p7, p8 or del against production;
  * tick the checklist, update BACKLOG P0.12 and the spec §9 verification log;
  * commit, push the slice branch, and give me a PR description using the template in the skill.
- Do not start a second slice. Do not merge. Do not touch the homepage hierarchy, maker SEO metadata, ads, or
  unrelated tools. Never publish user-uploaded images or create public links without the consent model.

Start with Slice 0 if it is unticked: it needs network access to https://write-urdu.com (read-only harness runs).
List the manual real-device checks (WhatsApp link previews on Android + iPhone) that I must do myself.
```

## Next sessions

Open a new Claude Code session per slice and paste the same handover prompt. It always picks up the next unticked
slice. Alternatively, paste that slice's specific prompt from `specs/WU-UXR-002-IMPLEMENTATION-CHECKLIST.md`.

Order: 0 → A → B → C → D → E → (Slice-1 gate) → F → G → J → K → then H, L, M, N after you record decision lines,
I after D-UX2-2, O only after D-UX2-1 with production evidence.

## Decisions only you can make

| ID | Question | Needed before |
|---|---|---|
| D-UX2-1 | Approve the mobile layout change (sticky preview, finish row, ⋯ More) after the Slice-1 data | Slice O |
| D-UX2-2 | Store a small JPEG preview for link previews, if WhatsApp drops large PNG previews | Slice I |
| D-UX2-3 | Apply the one-time "creates a public page" confirmation to ready-made cards **and** the homepage featured card's Share | Slice F |
| D-UX2-4 | Add a "Continue your last card" line on `/urdu-cards` | Slice C (optional step) |
| Decision lines | One dated line in BACKLOG P0.12 approving H, L, M, N | Those slices |
