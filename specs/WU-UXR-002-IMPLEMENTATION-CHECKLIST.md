# WU-UXR-002 — Implementation Checklist & Claude Prompts

Spec: [`WU-UXR-002-card-studio-ux-remediation.md`](WU-UXR-002-card-studio-ux-remediation.md) · Skill: [`skills/wu-uxr-002-card-studio/SKILL.md`](../skills/wu-uxr-002-card-studio/SKILL.md) · Evidence: [`docs/audits/urdu-card-studio-ux-2026-10-11/`](../docs/audits/urdu-card-studio-ux-2026-10-11/01-executive-summary.md)

## How to run this in VS Code with Claude Code

Fastest path: paste the handover prompt in [`docs/WU-UXR-002-CLAUDE-HANDOFF.md`](../docs/WU-UXR-002-CLAUDE-HANDOFF.md) into a new Claude Code session. It picks up the next unticked slice.

1. Check out the plan branch and pull it: `git fetch origin && git checkout claude/write-urdu-card-studio-audit-tefvyq`. Create each slice branch **from `main`** after the plan is merged, or from this branch if it is not merged yet.
2. One-time setup:
   ```bash
   npm ci
   npx playwright install chrome          # playwright.config.js uses channel: 'chrome'
   cd docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness && npm install && cd -
   ```
3. Open Claude Code in the repo root. The skill `wu-uxr-002-card-studio` is registered in `.claude/skills/`. Paste the prompt for the next unticked slice below. Each prompt tells Claude to read the skill first.
4. Review the diff. The PR description must list the closed `CARD-UX-…` IDs, the new tests (with "fails before / passes after"), the validation output and the harness deltas.
5. Tick the slice here and update P0.12 in `specs/BACKLOG.md` in the same PR.

> Tip: one slice per Claude session keeps context small. Start a new session per slice.

---

## Slice 0 — Baseline & production verification
- [x] Local harness baseline captured (`out/` kept locally, not committed) — 2026-10-11, all journeys green after two harness fixes (p7 detach, production consent/anchor ad)
- [x] Production read-only runs: first-impression, p5, p6, j04j07 — 2026-10-11
- [ ] Real Android + iPhone: WhatsApp preview for a designer-background link and a gradient link (then delete both)
- [x] §9 verification log in the spec updated (WhatsApp/iPhone rows still pending)

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Execute WU-UXR-002 Slice 0 only.
Run the audit harness (docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness) against my local tree,
then the read-only production subset with WU_BASE=https://write-urdu.com (first-impression, p5, p6, j04j07 —
do NOT run p3/p7/p8/del against production). Compare out/*.json with ../logs/*.json and fill the §9 verification
log in specs/WU-UXR-002-card-studio-ux-remediation.md with confirmed / not reproducible for each P1 finding.
Tell me exactly which manual WhatsApp/iPhone checks remain for me. Do not change product code.
```

## Slice A — Bidi-safe canvas text (CARD-UX-003, 028 part)
- [ ] `isolateBidiRuns` in `js/card-studio-core.js`, used for measuring + drawing only
- [ ] Wedding renderer checked
- [ ] `tests/card-bidi-render-contract.test.js` + `tests/card-bidi-render.spec.js` registered (contract runner, playwright.config.js, quality.yml)
- [ ] Pure-Urdu / pure-Latin unchanged; card/wedding specs green
- [ ] SW cache bumped + pins updated

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice A (bidi-safe canvas text) exactly as specified in
specs/WU-UXR-002-card-studio-ux-remediation.md §6 Slice A, on a new branch claude/wu-uxr-002a-bidi.
Write the failing tests first and show them failing on current code, then implement. Never change stored text,
public_text or remix payloads. Run the standard validation from §4 and the renderer regression specs from §4.7,
re-run harness p5.mjs and report the before/after. Update the checklist and BACKLOG P0.12, commit, and stop.
```

## Slice B — Truthful feedback & copy (CARD-UX-004, 015 copy, 021, 022 status/placement, 030, 031)
- [ ] Real sample texts (≠ DEFAULT_TEXT)
- [ ] Save indicator separate from `[data-card-status]`; sticky errors + toast
- [ ] `removeImage`, `privacy`, `exportPrivacy` copy (en + ur), HTML + `locale:generate`
- [ ] Publish error copy + Download picture button
- [ ] One Roman-Urdu status during outage; convert button below the field (Card Studio + makers)
- [ ] Filename without "Untitled"/spaces
- [ ] Tests registered; `language:check` passes; SW bump

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice B (truthful feedback and copy) per §6 Slice B on
branch claude/wu-uxr-002b-feedback. Tests first (card-studio-feedback-contract.test.js, card-studio-feedback.spec.js),
proving: sample→Download downloads; refusals stay visible ≥6s at 360×780; broken upload keeps its error; publish
503 offers Download picture; a single Roman-Urdu status during an outage; convert button within 200px below #cardText.
Provide Urdu copy for every new/changed string and regenerate the Urdu locale. Standard validation + harness p1/p6.
Update checklist/BACKLOG, commit, stop.
```

## Slice C — Protect local work (CARD-UX-002, 034)
- [ ] `hasUserWork()` + `forkProject()`; fork in hand-off adapter and init paths
- [ ] Thumbnails saved with projects (≤ 12 KB)
- [ ] Recent cards UI (≥ 2 projects), en + ur, local-only note
- [ ] Cap 20/scope + orphan asset cleanup
- [ ] Optional D-UX2-4 line on `/urdu-cards`
- [ ] Tests registered; hand-off/gallery/cards specs green; SW bump

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice C (never overwrite a saved card + Recent cards on
this device) per §6 Slice C on branch claude/wu-uxr-002c-recent-cards. Start by writing card-studio-recent.spec.js
reproducing the audit's P7 loss (card A → /urdu-cards Make it mine → More editing in Card Studio → edit → reload
→ A must still exist) and show it failing. Keep everything local (IndexedDB), no new network calls. Watch the init
race described under Risks. Standard validation + harness p7. Update checklist/BACKLOG, commit, stop.
```

## Slice D — Legible credit & clean designer backgrounds (CARD-UX-006, 007)
- [ ] Attribution colour/font/size follow the background
- [ ] Attribution inside the safe area when untouched
- [ ] No motif/border/accent on designer backgrounds
- [ ] Author auto-enables; author field visible on makers
- [ ] `card-attribution-quality.spec.js` (contrast ≥ 4.5 over backgrounds × sizes) registered
- [ ] SW bump

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice D per §6 Slice D on branch
claude/wu-uxr-002d-attribution. Tests first: card-attribution-quality.spec.js iterating the background registry ×
square/portrait/story asserting attribution inside the safe area and contrast ≥4.5:1, and no template accent/frame
pixels on designer backgrounds. Keep solid/gradient/user-photo rendering unchanged and card-poetry-quality.spec.js
green. Standard validation + harness p1/p2 (attach the exported PNGs). Update checklist/BACKLOG, commit, stop.
```

## Slice E — Reachability fixes (CARD-UX-009, 024, 025, 038, 001 step bar)
- [ ] `WriteUrduCardStudioUi.refresh()` after late mounts; library hidden on Content
- [ ] Step taps scroll + focus (reduced-motion aware)
- [ ] No horizontal overflow ≤ 400 px; no truncated toolbar labels
- [ ] Skip link; Back-to-editor only from the writer
- [ ] Desktop canvas fits viewport
- [ ] `card-studio-reachability.spec.js` registered; SW bump

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice E per §6 Slice E on branch
claude/wu-uxr-002e-reachability. This is a defect/accessibility fix, NOT the gated hierarchy redesign (Slice O): do not
move the format switcher, toolbar or preview. Tests first (card-studio-reachability.spec.js incl. a 360×780 case).
Standard validation + harness 01-first-impression and resilience (Tab count). Update checklist/BACKLOG, commit, stop.
```

## Slice-1 gate
- [ ] A–E merged and deployed
- [ ] Full harness local + production read-only subset re-run; §9 updated
- [ ] Real-device P1 and P5
- [ ] 7-day Product Pulse comparison recorded; decision on D-UX2-1

## Slice F — Consistent publishing for ready-made cards (CARD-UX-012, 013)
- [ ] D-UX2-3 decided (homepage featured card shares the same curated path)
- [ ] `js/share-publish-core.js` extracted; Card Studio behaviour identical
- [ ] Curated share: consent, manage token stored, dedupe, no fake attribution
- [ ] Personaliser "Get link"
- [ ] `urdu-cards.spec.js` + `home-featured-card.spec.js` updated; `curated-share-consent.spec.js` registered; SW bump

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice F per §6 Slice F on branch
claude/wu-uxr-002f-curated-publish. First extract js/share-publish-core.js with zero behaviour change and prove the
existing Card Studio publish specs pass unchanged (separate commit). Then apply consent/manage/dedupe/no-attribution to
js/curated-card-share.js and add the personaliser "Get link". js/curated-card-share.js also serves the homepage
featured card: follow D-UX2-3 for the homepage (ask me if it is undecided) and keep the homepage to its two actions.
Respect WU-SHARE-001 privacy rules. Standard validation +
harness p8 locally only. Update checklist/BACKLOG, commit, stop.
```

## Slice G — Safe editing (CARD-UX-018, 019, 020)
- [ ] History for panel fields (debounced text), batched background apply
- [ ] Undoable Reset (no `confirm`)
- [ ] Template keeps user photo + "Use template background" action
- [ ] Luminance-based text colour/overlay on upload; Text readability slider in Quick
- [ ] `card-studio-history.spec.js` registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice G per §6 Slice G on branch
claude/wu-uxr-002g-safe-editing. Tests first (card-studio-history.spec.js). Keep history capped at 50 and avoid one
history entry per keystroke. Standard validation + harness p6/p7. Update checklist/BACKLOG, commit, stop.
```

## Slice H — Send sheet (CARD-UX-014, 015 rest) — needs a backlog decision line
- [ ] Decision recorded in BACKLOG P0.12
- [ ] WhatsApp/Facebook/Copy row in the success dialog; plain-language copy
- [ ] "Send picture" rename + fallback copy + Picture vs Link one-liner
- [ ] Recipient page Share fallback menu
- [ ] `card-share-sheet.spec.js` registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Confirm the Slice H decision line exists in specs/BACKLOG.md P0.12 (ask me if
not). Then implement WU-UXR-002 Slice H per §6 on branch claude/wu-uxr-002h-send-sheet. Link/image sharing only —
no raw-text sharing (that is founder decision D-1 in WU-UXR-001). Keep data-* hooks stable for existing specs.
Standard validation + harness p3. Update checklist/BACKLOG, commit, stop.
```

## Slice I — Lightweight og:image (CARD-UX-032) — needs D-UX2-2
- [ ] D-UX2-2 approved with Slice 0 device evidence
- [ ] Client JPEG preview ≤ 250 KB; server optional `preview` field; delete removes both
- [ ] `/s/` og:image uses preview when present
- [ ] `tests/share-preview-functions.test.mjs` (in-memory D1/R2) registered
- [ ] Device re-check of 5 links

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Check D-UX2-2 is approved in the spec (ask me if not). Implement WU-UXR-002
Slice I per §6 on branch claude/wu-uxr-002i-og-preview, fully backward compatible (publishing without preview must
behave exactly as today). Add a Node functions test using an in-memory D1/R2 shim modelled on
docs/audits/urdu-card-studio-ux-2026-10-11/evidence/harness/harness-server.mjs. Standard validation. Update
checklist/BACKLOG, commit, stop, and list the manual WhatsApp checks I must do after deploy.
```

## Slice J — Re-editable links & "Your published cards" (CARD-UX-016, 039)
- [ ] Generated `functions/_lib/card-background-ids.js` + match test
- [ ] Remix `type:'library'` accepted server-side; uploaded images still rejected
- [ ] Hand-off applies library background by id
- [ ] Manage dialog → thumbnails, excerpt, Make a new version
- [ ] Tests registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice J per §6 on branch claude/wu-uxr-002j-remix-library.
User-uploaded images must never enter a remix payload. Tests first (share-remix-library-contract.test.js,
share-edit-design.spec.js). Standard validation + harness p7 (expect "Edit this design" on the Emerald Mughal card).
Update checklist/BACKLOG, commit, stop.
```

## Slice K — Urdu UI & a11y polish (CARD-UX-023, 033, 035, 028)
- [ ] All workflow labels via copy tables; Urdu verified on `/urdu/urdu-card-studio`
- [ ] Focus ring + 14 px notes
- [ ] Storage SecurityError fixed
- [ ] Long-token wrapping + state-aware fit warning
- [ ] Specs registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Implement WU-UXR-002 Slice K per §6 on branch claude/wu-uxr-002k-urdu-a11y.
Get Urdu wording right and natural (not literal) — show me the en/ur string table in the PR description for review.
Standard validation incl. locale:check + harness resilience. Update checklist/BACKLOG, commit, stop.
```

## Slice L — Use-case defaults & emphasised first line (CARD-UX-026, 027) — decision line
- [ ] Decision recorded
- [ ] Greeting (square) / Notice (4:5); `announcement` alias kept
- [ ] `text.emphasis` in core, fit, draw, remix sanitizer
- [ ] Specs registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Confirm the Slice L decision line exists (ask me if not), then implement
WU-UXR-002 Slice L per §6 on branch claude/wu-uxr-002l-defaults. Saved projects with useCase 'announcement' must
still open. Standard validation + harness p3/p5. Update checklist/BACKLOG, commit, stop.
```

## Slice M — Maker parity (CARD-UX-017) — decision line
- [ ] Designer defaults pass safe area; author visible; Get link on makers; related link carries text
- [ ] `social-maker-parity.spec.js` registered

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Confirm the Slice M decision line, then implement WU-UXR-002 Slice M per §6 on
branch claude/wu-uxr-002m-maker-parity. Do not change maker page SEO copy/titles/canonicals. Standard validation +
harness p2 and j04j07. Update checklist/BACKLOG, commit, stop.
```

## Slice N — Ready-made tiles & occasions (CARD-UX-010, 011) — content owner gates
- [ ] Tile: ♡, Make it mine, Send sheet; ≥ 14 px, ≥ 44 px targets at 360
- [ ] Birthday ≥ 8; Eid ≥ 8; Congratulations ≥ 8 (original text, rights metadata per WU-CARD-CONTENT-001A)
- [ ] Specs/counts updated

**Prompt**
```text
Use the wu-uxr-002-card-studio skill and the wu-card-content-001a skill for content rules. Implement WU-UXR-002
Slice N per §6 on branch claude/wu-uxr-002n-cards-tiles. Propose the new Urdu card texts in the PR for my review
before marking content final. Standard validation + harness p4/p8. Update checklist/BACKLOG, commit, stop.
```

## Slice O 🔒 — Mobile hierarchy (CARD-UX-001, 005, 008) — gated by D-UX2-1
- [ ] D-UX2-1 approved with Slice-1 gate evidence
- [ ] Sticky preview, Format switcher in Format step, sticky finish row + ⋯ More
- [ ] `card-studio-mobile-hierarchy.spec.js`; real-device keyboard check

**Prompt**
```text
Use the wu-uxr-002-card-studio skill. Verify D-UX2-1 is approved in the spec with production evidence; if not, stop
and tell me. Otherwise implement WU-UXR-002 Slice O per §6 on branch claude/wu-uxr-002o-mobile-hierarchy, ≤900px only
unless D-UX2-1 includes desktop. Standard validation + harness 01-first-impression and p1/p8. Update checklist/BACKLOG,
commit, stop, and list the real-device checks (on-screen keyboard) I must run.
```

## Slice P — Later (each needs its own decision)
- [ ] P1 Performance (029)
- [ ] P2 Recipient font + CTA test (036)
- [ ] P3 Word-level Roman correction (022) — via WU-JOURNEY-001B
- [ ] P4 Homepage hand-off copy (037)
