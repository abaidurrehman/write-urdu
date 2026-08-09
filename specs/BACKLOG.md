# WriteUrdu — Canonical Product & Spec Backlog

**Status:** Active  
**Last updated:** 2026-08-09  
**Purpose:** One source of truth for what gets built next.

This file owns **priority and sequence**. Individual feature specs own detailed behaviour and acceptance criteria. `docs/WU-I001-IMPLEMENTATION-TRACKER.md` records migration execution; SEO/content documents provide supporting evidence and checklists.

## Priority rules

1. Protect the production transliteration workflow and existing search equity.
2. Prefer working product improvements over documentation-only work.
3. Finish and verify partially implemented product specs before creating more surface area.
4. Each implementation slice must include tests and a Cloudflare preview.
5. Do not create thin keyword pages or new tools without a clear user job and route ownership.
6. New feature specs use `WU-<AREA>-<NUMBER>` and must define route, scope, state/data contract, acceptance criteria, implementation map and verification commands.

---

## NOW — P0

### P0.1 — Close SEO-A1 production follow-up

**Type:** Growth / operational verification  
**Source:** `docs/WU-SEO-AUTHORITY-001.md`, `docs/SEO-POST-DEPLOYMENT.md`  
**Code status:** Merged in PR #9 (`f9bce99ddd501bf294ca2f58766e69c307e59527`)

- [ ] Verify production deployment after cache purge.
- [ ] Smoke-test homepage transliteration in production.
- [ ] Validate homepage and authority JSON-LD with Google Rich Results Test and Schema.org Validator.
- [ ] Request recrawl for `/`, `/urdu-editor`, `/urdu-keyboard`, `/write-urdu-documentation`, `/urdu-faq`, `/roman-urdu-transliteration`, `/urdu-alphabet` and `/why-write-urdu`.
- [ ] Confirm `/llms.txt`, `/robots.txt`, `/sitemap.xml` and `/.well-known/security.txt` are publicly reachable without Cloudflare challenges.
- [ ] Start weekly tracking for `urdu typing` and `urdu writing` from the recorded Search Console baseline.

**Why P0:** This closes the growth work we just shipped and gives us evidence before further SEO changes.

### P0.2 — V2-S3 completion: authority pages + overlap decision

**Type:** Product/UX + SEO safety  
**Source:** `docs/WU-V2-EXECUTION.md`, `docs/WU-I001-IMPLEMENTATION-TRACKER.md`

- [ ] Migrate `/urdu-fonts-nastaliq-vs-naskh` to the shared v2 authority system.
- [ ] Review `/english-urdu-typing-tutorial` against the homepage, Documentation and Roman Urdu guide.
- [ ] Decide: keep, narrow, merge or redirect the tutorial using route/Search Console evidence.
- [ ] If consolidation is justified, preserve a one-hop redirect and update sitemap, structured data and internal links in the same PR.

**Next implementation PR:** this is the next normal v2 delivery slice.

### P0.3 — Close `WU-SUA-001` as real product work

**Type:** Product completion  
**Spec:** `specs/WU-SUA-001-stylish-urdu-text-name-art.md`  
**Current spec status:** Implementing

Before treating Stylish Urdu Text and Name Art as finished, audit the implementation against the spec acceptance checklist rather than assuming the routes are complete because they exist.

- [ ] Verify 80+ unique styles and category/intensity behaviour.
- [ ] Verify favourites/collections/recent-input local persistence and recovery.
- [ ] Verify grapheme safety, Urdu-specific character preservation and conservative Kashida handling.
- [ ] Verify Name Art has the required template/preset coverage and local handoff.
- [ ] Verify exact-size PNG/transparent PNG export waits for fonts/assets.
- [ ] Verify accessibility, mobile layout, privacy copy and failure recovery.
- [ ] Add any missing browser/integration coverage.
- [ ] Change spec status to Implemented only after the acceptance checklist is actually green.

**Why P0:** This is unfinished product functionality already promised by an active spec, so it should be closed before inventing more tools.

---

## NEXT — P1

### P1.1 — V2-S4A: Card Studio + Templates

**Type:** Product UX migration  
**Specs:** `WU-CS-UX-001`, `WU-CS-UX-002`

- [ ] Move Card Studio onto the v2 application hierarchy without changing rendering/export contracts.
- [ ] Make the canvas/workspace dominant and move educational/promo content below it.
- [ ] Migrate Template Library into the same creation workflow and strengthen handoff into Card Studio.
- [ ] Preserve template IDs, local state, transliteration and export behaviour.

### P1.2 — V2-S4B: Stylish Urdu Text + Name Art

**Type:** Product UX migration after `WU-SUA-001` acceptance closure

- [ ] Apply v2 creation shell to both routes.
- [ ] Make Copy/Favourite/Open in Name Art actions clear and contextual.
- [ ] Keep Unicode-style versus rendered-image distinction explicit.

### P1.3 — V2-S4C: Social makers + QR Generator

**Type:** Product UX migration  
**Spec:** `WU-SM-001` plus existing QR implementation contracts

- [ ] Migrate WhatsApp Status Maker and Instagram Post Maker.
- [ ] Migrate QR Generator.
- [ ] Preserve local processing, safe-area logic, QR payload validation and export contracts.

### P1.4 — V2-S5: Invoice Generator

**Type:** Business workflow migration  
**Specs:** `WU-IG-001`, `WU-IG-002`, `WU-IG-003`

- [ ] Move the invoice workflow onto the v2 shell without weakening the invoice-first workspace.
- [ ] Preserve totals, schema migration, language modes, adaptive density, QR and export behaviour.
- [ ] Review whether the WriteUrdu invoice remains strategically useful versus the dedicated InvoiceCraftly product; do not remove or redirect without traffic/product evidence.

### P1.5 — Content/canonical consolidation

**Type:** SEO safety / information architecture

- [ ] Review `write-urdu-features` against Documentation and About.
- [ ] Review `urdu-editor-features` against Rich Editor and Documentation.
- [ ] Finish the typing-tutorial decision if not completed in V2-S3.
- [ ] Remove genuine duplication only with one-hop redirect, canonical, sitemap and internal-link updates.

---

## LATER — P2

### P2.1 — V2-S6 release closure

- [ ] Complete extensionless internal-link migration across all remaining public pages.
- [ ] Migrate About, Privacy, Feedback, Search and human sitemap to the final shared shell where needed.
- [ ] Validate every registered canonical, sitemap entry and redirect.
- [ ] Publish v2 release notes.
- [ ] Capture post-release Search Console baseline.

### P2.2 — Asset/code/performance cleanup

**Source:** implementation tracker Phase 2D

- [ ] Build HTML/CSS/JS asset-reference report.
- [ ] Identify zero-reference images/documents.
- [ ] Identify obsolete CSS and JavaScript.
- [ ] Remove only confirmed unused assets/dependencies.
- [ ] Audit homepage legacy Bootstrap/jQuery/social dependencies after v2 migration, with transliteration protected.
- [ ] Confirm Cloudflare production artifact contains only required product files.

### P2.3 — Existing-demand SEO growth iteration

Do not change the homepage title repeatedly while the current experiment is unmeasured.

- [ ] Improve descriptive supporting links into `/` where natural.
- [ ] Refine examples/FAQ based on actual queries, not keyword density.
- [ ] Compare CTR, average position and ranking URL after recrawl.
- [ ] Evaluate after an 8–12 week window unless a material regression appears sooner.

### P2.4 — Answer-ready content backlog

**Source:** `docs/SEO-CONTENT-BACKLOG.md`

Candidates, only after the core product migrations above:

- [ ] 100 common Roman Urdu phrases with reviewed Urdu examples.
- [ ] How to type Urdu in WhatsApp, Microsoft Word and Google Docs.
- [ ] How to create Urdu WhatsApp Status / poetry cards.
- [ ] Static QR code mechanics and quiet-zone guidance.
- [ ] Browser compatibility notes for writing/creation tools.
- [ ] Local-draft, image-upload and QR-logo privacy guide.
- [ ] Urdu punctuation, numerals and RTL writing direction.

---

## HOLD / evidence required

These require evidence or a separate approved spec before implementation:

- Separate doorway pages for `urdu typing` / `urdu writing` keyword variants.
- Changing the transliteration provider or its initialization contract.
- Accounts, cloud documents or server-side storage for the core writing workflow.
- AI translation/calligraphy features.
- Removing established routes because they appear visually redundant.
- Publishing founder identity, reviews, ratings, usage counts or `sameAs` profiles without verified public evidence.

---

## Implemented feature specs

The detailed feature registry remains in `specs/README.md`. At backlog level:

- `WU-CS-UX-001` — implemented; v2 migration pending.
- `WU-CS-UX-002` — implemented; v2 migration pending.
- `WU-SM-001` — implemented; v2 migration pending.
- `WU-IG-001` — implemented; v2 migration pending.
- `WU-IG-002` — implemented; v2 migration pending.
- `WU-IG-003` — implemented; v2 migration pending.
- `WU-PLAT-001` — implemented.
- `WU-SUA-001` — **implementing; acceptance closure is P0.**

## Queue rule

When a PR merges, update this file in the next implementation branch or the same merge if the next priority is already known. There should always be exactly one clear **next implementation PR**.

**Current next implementation PR:** V2-S3 completion — Urdu font comparison migration + typing-tutorial overlap decision. In parallel, complete the non-code SEO-A1 production verification checklist.
