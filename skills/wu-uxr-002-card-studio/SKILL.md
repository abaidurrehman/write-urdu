# WU-UXR-002 — Card Studio UX Remediation (execution skill)

Use this skill whenever implementing, reviewing or continuing any slice of `WU-UXR-002`, the remediation of the 2026-10-11 Card Studio UX field study. It also applies to any change touching Card Studio, the Instagram/WhatsApp makers, `/urdu-cards` sharing or the `/s/` share pages while WU-UXR-002 is active.

The plan is already decided. Your job is to execute **one slice**, prove it with tests and the audit harness, and stop. Do not redesign beyond the slice.

---

## Mandatory read order (before writing any code)

```text
specs/WU-UXR-002-card-studio-ux-remediation.md          # the plan: §4 conventions, §6 your slice, §7 decisions
specs/WU-UXR-002-IMPLEMENTATION-CHECKLIST.md            # tick boxes; prompts
docs/audits/urdu-card-studio-ux-2026-10-11/03-ux-findings.md   # only the CARD-UX IDs your slice closes
specs/BACKLOG.md   (sections P0.11 and P0.12)
specs/WU-PLAT-002H-SCOPE-FREEZE.md
specs/WU-UXR-001-persona-ux-review-remediation.md       # Slice D lineage + decisions D-1…D-5
```

Read additionally per slice:

| Slice | Also read |
|---|---|
| C | `specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md` (returning state) |
| F, H, I, J | `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md`, `WU-SHARE-001R`, `docs/WU-SHARE-001-USER-GUIDE.md` |
| F | `skills/wu-card-retention-001/SKILL.md` (homepage featured card constraints) |
| M | `specs/WU-CARD-GALLERY-001A-social-background-collection-expansion.md` |
| N | `skills/wu-card-content-001a/SKILL.md`, `specs/WU-CARD-CONTENT-001A-recurring-social-content-library.md` |
| O | `specs/WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md` §5.3 and §15 |

Then read the actual code the slice names. **Line numbers in the plan are approximate**: search by function name and confirm before editing.

---

## Non-negotiable rules

1. **One slice per branch/PR.** Branch `claude/wu-uxr-002<letter>-<slug>`. Do not start the next slice in the same session.
2. **Gates.**
   - If the slice is marked *decision line*, confirm the line exists in `specs/BACKLOG.md` P0.12 before coding. Otherwise **ask the user** and stop.
   - If it depends on `D-UX2-x`, confirm the decision is recorded in the spec §7. Otherwise ask and stop.
   - Slice O is gated: never implement it without recorded production evidence plus `D-UX2-1`.
3. **Tests first.** Write the new contract test and browser spec, run them on the unchanged code, and capture that they **fail**. Then implement until they pass. Say so in the PR.
4. **Register every new test:**
   - contract tests in `scripts/run-contract-tests.js`;
   - browser specs in `playwright.config.js` `testMatch` **and** `.github/workflows/quality.yml` (step "Run focused product browser acceptance").
5. **Shared renderer.** `js/card-studio.js` and `js/card-studio-core.js` power Card Studio, both social makers, name art, the Facebook role, the Gallery/Cards previews and (indirectly) the wedding maker. Run the renderer regression set in plan §4.7 on every renderer change.
6. **Both languages.** Every new or changed user-facing string needs natural Urdu, not a literal translation. Card Studio strings go through `copy.en`/`copy.ur` in `js/card-studio.js`. After editing any public HTML page, run `npm run locale:generate` and commit `urdu/*.html`.
7. **Service-worker cache.** If any changed file is in `sw.js` `APP_SHELL`, bump `CACHE_NAME` and update every `write-urdu-shell-vNN` pin under `tests/`.
8. **Privacy.**
   - Nothing becomes public without the publish consent model (`WU-SHARE-001`).
   - User-uploaded images never enter remix payloads.
   - No new third-party scripts, trackers, accounts or auto-posting.
   - Telemetry is content-free, following the `WU-PLAT-002H` metrics contract.
9. **Don't touch** homepage hierarchy, SEO titles/canonicals/structured data of maker pages, ad placement, or other tools.
10. **Keep `data-*` hooks stable.** Existing specs and the audit harness depend on them. If you must rename a hook, update all specs **and** `docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness/*.mjs` in the same PR.
11. **Do not weaken existing tests** to make a slice pass. If an existing expectation encodes the defect (for example an immediate POST on "Shareable link"), change it deliberately and explain why in the PR.

---

## Standard validation (run all; paste the summary in the PR)

```bash
npm ci                                   # once per session
npm test
npx playwright test <new + touched specs> --project=desktop-chromium --project=mobile-chromium
npm run shell:check && npm run seo:graph:check && npm run collections:check
npm run locale:check && npm run seo:check && npm run governance:check
```

`playwright.config.js` uses `channel: 'chrome'`. If Chrome is missing, run `npx playwright install chrome`.

## Audit harness re-measure

```bash
cd docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness
npm install            # first time
npm run server &       # local repo + real share functions with in-memory storage
node <the persona scripts listed for your slice>
```

Compare `out/*.json` with the baseline in `../logs/*.json` and quote the changed numbers in the PR. Never run `p3`, `p7`, `p8` or `del` against production.

---

## PR description template

```markdown
## WU-UXR-002 Slice <X> — <title>
Closes: CARD-UX-…, CARD-UX-…
Spec: specs/WU-UXR-002-card-studio-ux-remediation.md §6 Slice <X>

### What changed
- …

### Tests
- New: tests/<…>-contract.test.js, tests/<…>.spec.js — failed before (paste 1 line each), pass after
- Registered in run-contract-tests.js / playwright.config.js / quality.yml
- Regression set (§4.7): …

### Validation
<npm test / playwright / checks summary>

### Harness (before → after)
- <metric>: <baseline> → <now>

### Copy (en / ur)
| key | en | ur |

### Not done / follow-ups
- …
```

## Finish a slice

1. Tick the slice in `specs/WU-UXR-002-IMPLEMENTATION-CHECKLIST.md`.
2. Update P0.12 in `specs/BACKLOG.md` (`[x]` plus one sentence of what shipped).
3. Fill the closed rows in the spec §9 verification log (harness evidence; device evidence if any).
4. Commit with a message like `Card Studio: <outcome> (WU-UXR-002 Slice <X>)`, push the slice branch, and stop. Do not merge.
