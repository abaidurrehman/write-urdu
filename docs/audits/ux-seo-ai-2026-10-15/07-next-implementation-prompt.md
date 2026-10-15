# 07 — Next implementation prompt (self-contained)

Copy everything below the line into a fresh Claude Code or Codex session in `c:\Projects\writeurdu`.

---

You are implementing **one** slice of the 2026-10-15 UX/SEO/AI initiative for write-urdu.com: **X-7 — homepage post-text action hierarchy** (spec: `docs/audits/ux-seo-ai-2026-10-15/03-homepage-spec.md` H-2).

## Stop conditions — check these before writing any code

1. Open `specs/BACKLOG.md` → P0.1. Continue only if **either**:
   - P0.1G records a keep/iterate decision for the mobile writer release, **or**
   - there is a dated founder exception line naming "X-7" or "homepage post-text action hierarchy".

   If neither is there, stop and report. Do not start.
2. Confirm X-1 (AdSense in-page ads out of the core Write task) is done. Load `https://write-urdu.com/` at 390×844 and check that no `.google-auto-placed` element sits between the H1 and `#transliterateTextarea` or inside `section.wu-basic-command-surface`. If X-1 is not done, report it. Proceeding is allowed, but production measurements will be confounded, and you must say so in the PR.

## Context you must read first

- `docs/audits/ux-seo-ai-2026-10-15/01-executive-assessment.md` and `02-journeys-and-findings.md` §2
- `specs/WU-PLAT-004-basic-writer-command-toolbar.md` and `specs/WU-PLAT-002H-MOBILE-ACCEPTANCE-MATRIX.md`
- `js/basic-writer-command-toolbar.js` (builds the command bar at runtime), `js/workspace-next-step.js` (max three continuation actions)
- Memory rules for this repo:
  - Much of the UI is injected at runtime. Render with Playwright before trusting HTML source.
  - Never touch `google_jsapi.js` or its load order.

## The problem (observed 2026-10-15, local render)

After the first converted word on a 390×844 phone, nine buttons and three mode chips appear above the editor:

- Buttons: Copy, Preview, PDF, Word, PNG, ⌄, Create Card, Share, More
- Mode chips: English letters → Urdu, Type Urdu directly, Speak Urdu

The editor moves down. Evidence: `docs/audits/ux-seo-ai-2026-10-15/evidence/local-home-390-after-first-text.png`.

## The change

- After the first text, show **Copy** (primary) and **More** above the editor. Add at most **one** contextual action, Create Card or Format as document, chosen by the existing next-step logic.
- Move Preview/PDF/Word/PNG/Download/Share/Print into **More**. Each must stay reachable in ≤2 taps.
- Do not add a new toolbar. Change the existing one built by `js/basic-writer-command-toolbar.js`.
- Desktop may keep PDF/Word visible if width allows. They are 82.9% of exports.

## Protected (do not change)

- `#transliterateTextarea`, the transliteration init, copy/clear/save/share/export behaviour and handoffs
- Homepage title/searchTitle/H1/description
- The mobile floors in `tests/mobile-editor-activation.spec.js`
- No autofocus. No ads inside the task region.

## Tests first

1. Add a Playwright test to `tests/mobile-editor-activation.spec.js`: at 360×740, 390×844 and 412×915, after typing `mera ` there are **≤3** visible buttons between the H1 and the editor, and the editor `top` moves by **≤8 px** compared with before typing.
2. Add a test that PDF and Word export are reachable through More in ≤2 taps and still produce files (reuse the existing export test helpers).
3. Run them and watch them fail. Then implement.

## Gate before you finish

- `npm test`, `npm run shell:check`, `npm run seo:check`, `npm run seo:graph:check`, `npm run governance:check`
- `npx playwright test tests/mobile-editor-activation.spec.js tests/basic-writer-workspace-integrity.spec.js tests/core-workspace-convergence.spec.js tests/workspace-next-step.spec.js`
- Port warning: many specs hard-code port **8765**. If another process already listens there, Playwright reuses it and tests the wrong checkout. Check `Get-NetTCPConnection -LocalPort 8765` first.
- Before/after screenshots at 375×667, 390×844 and 1366×768 go in `docs/audits/ux-seo-ai-2026-10-15/evidence/`.

## Deliver

- Branch `claude/homepage-post-text-actions` from current `main`. One PR, not merged.
- The PR body states the hypothesis, governed state, removed/demoted UI, primary metric (copy/export completion per session with text), guardrails (PDF+Word export share; voice starts), release marker and rollback. This is the BACKLOG grooming rule.
- Update `specs/BACKLOG.md` P0.1 with one dated state line. Then stop.
