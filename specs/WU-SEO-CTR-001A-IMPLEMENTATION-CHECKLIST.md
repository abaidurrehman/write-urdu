# WU-SEO-CTR-001A — Traffic Action Checklist

**Status:** In execution — A0 partial; A1 `www` redirect defect confirmed

**Canonical spec:** [`WU-SEO-CTR-001A-pakistan-search-capture.md`](WU-SEO-CTR-001A-pakistan-search-capture.md)

**Evidence date:** 2026-10-04

**Primary market:** Pakistan

**Stop condition:** complete one action, record a comparable measurement window, then decide keep/iterate/rollback before starting another change on the same route.

## Outcome

Increase qualified organic clicks and completed Urdu-writing tasks by improving existing ranking routes. Do not create new keyword-clone pages, a generic translation product or an unmeasured site-wide metadata rewrite.

## Non-negotiable rules

- One canonical owner per user job.
- Query→page and host evidence must precede traffic-facing changes.
- Ranking, CTR, clicks and product activation are separate measures.
- Scenario values are arithmetic illustrations, not forecasts or acceptance promises.
- Never log raw Urdu/Roman Urdu text, full query strings, document contents, identity or IP data.
- Protect `/`, `/stylish-urdu-text-generator` and `/urdu-editor` during host/metadata changes; they account for about 91% of page-level clicks in the export.

## Ordered action board

| Order | Action | Target evidence/opportunity | Effort | Gate | Definition of done |
| ---: | --- | --- | --- | --- | --- |
| A0 | Build attribution baseline | UI query export covers only 71% of impressions and 53% of clicks | XS | none | Dated query→page, host→date and release baseline exists |
| A1 | Verify and, only if needed, repair authority consolidation | `www` holds 14.1% of page impressions and 19.1% of clicks | XS–S | A0 | Live apex/canonical/legacy contract proven; narrow defect fixed or explicit no-change decision recorded |
| A2 | Improve rank for generic Urdu typing on `/` | `urdu typing`: 27,294 impressions, 471 clicks, 1.73%, position 6-range | S–M | A0/A1 | One relevance/internal-link/task-proof hypothesis shipped and measured without title churn |
| A3 | Strengthen `/urdu-keyboard` as the direct-input owner | Four-query scenario: 24,150 impressions, 197 clicks | M | A0/A1 | Host split resolved; useful key reference shipped; Roman intent remains separate |
| A4 | Turn Roman page into a task | Roman family: about 8,083 impressions; page impressions are probably mixed | M | A0 | Existing engine embedded; Roman-owned title/H1; Roman-query outcome measured separately |
| A5 | Align InPage route without disrupting its existing winner | `unicode to inpage`: 38,135 impressions / 85 clicks; `online InPage`: about 896 clicks elsewhere | S–M | A0 | Current winner known; one bidirectional route retained; direction change supported and measured |
| A6 | Extend proven font intent on stylish page | Fonts cluster: 16,691 impressions / 1,205 clicks / 7.2% CTR | S–M | winner protection | Bounded copy/paste or preview enhancement tested on existing owner; no standalone route |
| A7 | Run one homepage SERP experiment | `english to urdu typing`: 164,935 impressions / 135 clicks; translation-like SERP | S | A0 and Pakistan SERP review | One variable tested with dated before/after record; editor activation protected |
| A8 | Hold low-evidence expansion | Voice about 57 impressions; practice/test about 2,560 impressions | none | fresh evidence | No new voice acquisition, typing-test route, backlink campaign or generic translator |

## A0 — Attribution baseline

- [ ] Export queries for `/` and `/roman-urdu-transliteration`; confirm where `english to urdu typing` impressions land.
- [ ] Export landing pages for `urdu typing`, `urdu writing` and `urdu typing online`.
- [ ] Export landing pages for `online inpage`, `inpage online` and related variants.
- [ ] Export keyboard queries split by apex and `www` URLs.
- [ ] Export apex versus `www` by date; classify each as decaying, stable or growing.
- [x] Run live canonical/redirect checks for `/`, Roman, keyboard, InPage, stylish and editor routes. HTTPS `www` incorrectly returns `200`; see the [A0/A1 baseline](../docs/evidence/WU-SEO-CTR-001A/2026-10-04/A0-A1-BASELINE.md).
- [x] Record releases around 2026-08-18/19, when impressions stepped up.
- [x] Exclude the 2026-09-26 outlier from baselines.
- [ ] Prefer Search Console API extraction beyond the 1,000-row UI limit.
- [x] Save a dated, privacy-safe partial baseline artifact. Query-by-page and host-by-date exports remain required before A0 exit.

**Exit:** owner, host and baseline questions are answered. If unavailable, mark dependent actions blocked; do not substitute assumptions.

## A1 — Authority consolidation

- [x] Verify HTTP apex, HTTP `www` and HTTPS `www`. Result: HTTP apex passes; both `www` variants fail the one-hop apex contract.
- [ ] Verify canonical, sitemap, Open Graph, structured-data and internal URLs use apex.
- [ ] Check priority `.html`, trailing-slash and historical editor/keyboard paths.
- [ ] If no live defect exists, record **no redirect change**.
- [ ] Fix only the confirmed Cloudflare `www` redirect defect, then monitor homepage, stylish and editor clicks/position through a comparable window.

**Keep:** host share moves toward apex without loss of intended owners or material click decline.

**Rollback/pause:** chains, wrong destinations, deindexing, or sustained loss on protected winners.

## A2 — Generic Urdu typing rank improvement

**Execution note (2026-10-04):** founder directed A2 to proceed while the A1 redirect repair is deferred. Scope is limited to one contextual internal-anchor change from the documentation guide. Homepage metadata, H1, hero and editor remain unchanged.

- [ ] Confirm homepage ownership for the three generic typing/writing clusters.
- [x] Audit static title/H1, first task proof, crawlable supporting copy and contextual internal anchors.
- [x] Select one change likely to improve relevance or usefulness, not only snippet wording: replace one vague documentation link with a contextual `Urdu typing online editor` anchor.
- [x] Keep the editor in the first useful viewport and retain broad English-letter Urdu typing ownership; no homepage layout or copy changes are included.
- [ ] Log rank, clicks, CTR and editor activation for Pakistan/mobile and desktop.

**Scenario:** moving `urdu typing` toward the site's position 4–5 band corresponds to about 819–1,365 clicks per three months versus 471 now. Rank movement, not a copy-only CTR target, is the hypothesis.

## A3 — Urdu keyboard owner

- [ ] Resolve/explain the apex and `www` split first.
- [ ] Reuse the existing key mapping source.
- [ ] Add a usable physical-key/Shift reference, punctuation/numerals and mobile guidance.
- [ ] Keep direct Urdu character input primary.
- [ ] Link users seeking English-letter conversion to the Roman owner.
- [ ] Test mobile/touch, keyboard-only use, RTL input and copy/save.

**Scenario:** 2–3% CTR on the four-query scenario is about 483–725 clicks per three months versus 197 now, but only if ranking and host ownership improve.

## A4 — Roman Urdu task

- [ ] Confirm the page's query mix before implementation.
- [ ] Reuse the current transliteration engine/provider and failure handling.
- [ ] Put working input/output before long explanation.
- [ ] Use Roman-specific title/H1 language; remove overlap with the homepage's broad phrase.
- [ ] Provide Copy and Continue Editing without sign-up.
- [ ] Test common spelling ambiguity and only show examples reproduced by the production engine.
- [ ] Report Roman-query clicks/activation separately from disappearing non-Roman impressions.

**Scenario:** `roman urdu to urdu` at 3–5% is about 146–243 clicks per three months versus 47 now. Do not use all 45,493 page impressions as obtainable Roman traffic.

## A5 — InPage alignment

- [ ] Identify which route currently wins `online InPage` queries and protect it.
- [ ] Review the Pakistan SERP for both conversion directions.
- [ ] Keep one route and one shared conversion core.
- [ ] Expose both directions clearly; emphasize Unicode→InPage only when evidence supports it.
- [ ] Keep capability wording limited to what pasted-text/encoding conversion actually supports.

**Scenario:** about 1% on `unicode to inpage` is about 380 clicks per three months versus 85 now and likely requires a move toward positions 5–6.

## A6 — Fonts on the proven owner

- [ ] Preserve the stylish page's current title, task and successful cluster coverage.
- [ ] Test a bounded font copy/paste or preview improvement on the same route.
- [ ] Review licensing, provenance and loading cost before adding font assets.
- [ ] Measure the font cluster and stylish task completion together.
- [ ] Keep `/urdu-fonts` blocked until a distinct, licensed and useful product exists.

## A7 — Homepage SERP experiment

- [ ] Confirm indexed title/snippet/canonical and query landing page.
- [ ] Review the Pakistan-localised SERP to test the translation-intent hypothesis.
- [ ] Add a dated row to `docs/SEO-SERP-EXPERIMENTS.csv`.
- [ ] Change one variable: title or description, not title/H1/canonical/hero together.
- [ ] Wait for recrawl and a comparable window before deciding.
- [ ] Check editor activation so a higher CTR is not mistaken for qualified traffic.

**Scenario:** 0.2–0.5% is about 330–825 clicks per three months versus 135 now. Treat 1% or more as unsupported until SERP evidence changes.

## Required proof for every shipped action

- [ ] Focused contract/static tests pass.
- [ ] `npm run seo:check` passes when metadata/ownership changes.
- [ ] `npm run governance:check` passes when governed public routes/specs change.
- [ ] Focused desktop and Pakistani mobile viewport QA passes for UI changes.
- [ ] Old/new values, deployed commit, baseline window and confounders are logged.
- [ ] Search Console comparison uses the same country, device, query and page filters.
- [ ] Decision is recorded as keep, iterate, rollback or insufficient evidence.

## Explicit holds

- No generic English→Urdu translator for this program.
- No `/english-to-urdu-typing`, `/urdu-typing`, `/roman-urdu-to-urdu`, `/urdu-typing-test` or direction-specific InPage clone.
- No standalone fonts route before product/licensing gates.
- No broad backlink campaign; the current export does not prove authority is the constraint.
- No voice-acquisition investment from this evidence.
- No mass metadata rewrite or concurrent experiments on one route.
