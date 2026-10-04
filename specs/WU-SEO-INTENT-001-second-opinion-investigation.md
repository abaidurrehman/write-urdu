# WU-SEO-INTENT-001 — Second-Opinion Investigation and Reconciliation with WU-SEO-CTR-001A

**Status:** Supporting analysis memo — findings integrated into `WU-SEO-CTR-001A-pakistan-search-capture.md`; not a separate execution plan
**Date:** 2026-10-04
**Repo commit inspected:** `000e617` (both branches share this base)
**Evidence used:** `docs/evidence/WU-SEO-CTR-001A/` (Search Console zip extracted; Pakistan Keyword Planner `11_49_18` CSV, UTF-16, decompressed). The earlier `11_41_08` CSV is preserved only inside the raw archive, is US-targeted, and was not analysed for implementation decisions.
**Still blocked:** live web, SERP, competitor pages, backlink data (egress proxy). All competitor and SERP statements below are therefore **hypotheses requiring external validation**.

All numbers below were recomputed from the CSVs, not copied from the other spec. Where they match it, that is stated. The canonical action order and resolved decisions live in `WU-SEO-CTR-001A-pakistan-search-capture.md` and `WU-SEO-CTR-001A-IMPLEMENTATION-CHECKLIST.md`.

## 0. Summary of where I agree and disagree with 001A

| Topic | 001A | This investigation | Verdict |
| --- | --- | --- | --- |
| Data accuracy (28d windows, Pakistan share, device split, query/page figures) | as listed | All reproduced exactly | **Agree** |
| Homepage keeps `english to urdu typing` | yes | yes, but the query is mostly **not addressable** (see §2.1) | **Agree on owner, disagree on upside** |
| Roman page → working tool | "Very High" impact | Roman-intent demand visible in GSC is ~8k impressions, not 45k. The page's impressions mostly come from something else (see §2.2) | **Agree on the change, disagree on the size and the diagnosis** |
| InPage: lead with Unicode→InPage | High impact | Weakly supported; most InPage *clicks* come from "online InPage" queries that don't land on the converter (see §2.3) | **Partially disagree** |
| Host consolidation: "don't act until a live defect is proven" | cautious | 14% of impressions and 19% of clicks in the window are still on `www`; flipping direction carries real risk (see §2.4) | **Disagree on the posture** |
| Planner as independent demand evidence | used for cluster sizing | 785 of 786 Planner keywords are already GSC queries, so it cannot reveal unseen demand (see §2.5) | **Methodology flaw not noted in 001A** |
| Fonts / typing practice / keyboard sequencing | P2/P3, gated | Largely agree; fonts is partly captured by the stylish page already | **Agree with nuance** |
| CTR scenarios at 0.5/1/2% on 164,935 impressions | listed as scenarios | Plausible ceiling is lower; see §6 | **Disagree on realism** |

## 1. Verified data (3-month export, 16 Jul – 29 Sep 2026, Web)

| Metric | Value |
| --- | --- |
| Clicks / impressions (chart) | 25,626 / 690,234 |
| Pakistan share | 74.7% of impressions, 78.9% of clicks, CTR 3.92%, pos 6.36 |
| India | 77,874 impressions (11.3%), CTR 3.71% — second market, not noted in 001A |
| Mobile / desktop | 61% of impressions at 2.77% CTR (pos 6.34); desktop 5.23% (pos 7.27) |
| Queries export | 1,000 rows covering 493,128 impressions (71%) but only 13,635 clicks (53%); the remaining 29% of impressions (197k) produced ~11,990 clicks at ~6.1% CTR |
| Page concentration | `/` (both hosts), `/stylish-urdu-text-generator` and `/urdu-editor` produce **~91%** of all page-level clicks |

Daily trend:

| Window | Days | Impressions/day | Clicks/day | CTR |
| --- | ---: | ---: | ---: | ---: |
| 16 Jul – 17 Aug | 33 | 5,711 | 306 | 5.35% |
| 18 Aug – 1 Sep | 15 | 9,549 | 304 | 3.18% |
| 2 Sep – 29 Sep | 28 | 12,805 | 392 | 3.06% |

**Impressions rose ~2.2× from mid-August; clicks per day rose ~28%.** The step change begins around 18–19 Aug. 26 Sep is a one-day outlier (26,039 impressions, 347 clicks) and should be excluded from baselines.

## 2. Findings that change the picture

### 2.1 `english to urdu typing` is behaving like a translation SERP

| Query | Impressions | Clicks | CTR | Pos |
| --- | ---: | ---: | ---: | ---: |
| english to urdu typing | 164,935 | 135 | 0.08% | 7.0 |
| english to urdu (pure translation) | 8,153 | 6 | 0.07% | 6.2 |
| english to urdu text | 8,826 | 5 | 0.06% | 9.8 |
| english into urdu typing | 1,305 | 1 | 0.08% | 6.6 |
| english to urdu typing online | 273 | 11 | 4.03% | 5.1 |
| roman english to urdu typing | 580 | 20 | 3.45% | 4.8 |
| english to urdu typing google | 166 | 7 | 4.22% | 9.2 |

- The `english to urdu*` family is **193,003 impressions (39% of the queries export) and 290 clicks (2.1%)**.
- The headline query has the **same CTR as the plain translation query** (0.08% vs 0.07%) at a similar position. Variants that include "online", "roman" or "google" get 3–5%.
- Interpretation (hypothesis): searchers typing the bare phrase mostly want translation, and the SERP/AI surface satisfies them. The impressions at position 7 are largely unclickable.
- Consequence: a title rewrite is unlikely to lift this query materially. 001A's own measurement discipline (one variable at a time) is right, but its upside scenario is optimistic.

**Homepage CTR is not a page problem.** The homepage's 3.19% includes this one query. If the family's 193k impressions sat entirely on the homepage, the rest of the page would run at roughly 6.2% CTR, which is healthy. (Query→page split is not in the export, so this is a bound, not a measurement.)

### 2.2 The Roman page's impressions are probably not Roman-Urdu demand

- `/roman-urdu-transliteration`: 45,523 impressions, 120 clicks, 0.26%, pos 6.73.
- All Roman/transliteration queries in the export total **8,083 impressions and 144 clicks** (`roman urdu to urdu` 4,862 @ 0.97%, pos 8.6).
- The page's impressions are ~5.6× the entire visible Roman-intent demand. The page title is "English to Urdu Typing with English Letters", the same phrase as the 164,935-impression query. The most likely source of the surplus is that query.
- It is unproven because no query×page export exists. It is the highest-value thing to confirm (Search Console → Performance → Pages → click the Roman page → Queries).
- Why it matters: converting the page to a tool is still sensible, but the expected gain is bounded by Roman demand (~8k impressions; even at 5% CTR ≈ 400 clicks per 3 months), not by the 0.26% × 45k figure. Retitling it to "Roman Urdu to Urdu" will also remove it from the translation-ambiguous SERP, which should be neutral to clicks (those impressions yield ~0.3%) but will clean up ownership.
- Reversing the diagnosis: the Roman page is not "underperforming because it is a guide"; it is **mismatched to the query that is giving it impressions**.

### 2.3 InPage: the converter is not where InPage clicks come from

| Family | Impressions | Clicks | CTR | Pos |
| --- | ---: | ---: | ---: | ---: |
| `unicode to inpage` (+ converter, text/urdu to inpage, etc.) | ~51.7k | 149 | 0.29% | 7.6 |
| `inpage to unicode` (+ converter) | ~19.5k | 189 | 0.97% | 4.5 |
| "online InPage" intent: `inpage online`, `online inpage`, `online inpage urdu`, `urdu inpage online`, `online urdu inpage`, `inpage online free`, `inpage online typing` | ~9.0k | 896 | 10.0% | 4.4 |

- All InPage/Unicode-term queries in the export produced 1,278 clicks on 83,655 impressions; the converter page produced **450**. At least ~830 InPage-term clicks therefore land on other pages (editor/homepage). Write Urdu is already winning "type InPage-style Urdu online" at positions 3.6–4.6 with 8–16% CTR, which is a different job from converting files.
- `inpage to unicode` ranks 4.3 yet gets only 0.97%, while `inpage online` ranks 4.6 and gets 8.5%. Position is not the explanation for the converter queries' low CTR; the SERP for them is probably crowded with exact-match converters or a snippet (hypothesis).
- So 001A's "lead with Unicode→InPage" is a defensible bet on a large query (38k impressions) but rests on a weaker case than stated. A rank move from 7.6 to ~5–6 would roughly double CTR to ~1%, worth ~+300 clicks per 3 months. Modest.
- **Missed by 001A:** the "online InPage" cluster already converts at 10%+. Identify which URL receives those clicks and make sure it is a deliberate owner rather than an accident.

### 2.4 `www` is not merely historical

- Pages report: `www` URLs = 105,172 impressions (14.1%) and 4,946 clicks (19.1%).
- Homepage: `www` 86,686 imps / 4,150 clicks (4.79% CTR) vs apex 389,601 / 12,411 (3.19%). `www/urdu-editor`: 12,956 imps at pos 10.44 vs apex 42,749 at 7.38.
- Legacy `.html` URLs still appear (`www/index.html`, `www/urdu-keyboard.html`, etc.) but total only 761 impressions — negligible. Typos/hallucinated slugs (e.g. `/stylish-urgent-text-generator`) are noise.
- `docs/P0-SEO-HOST-CONSOLIDATION-2026-08.md` says historical evidence favoured `www` and the Cloudflare redirect was "not changed yet" in mid-August.
- 001A says do not act on `www` impressions without a proven live defect. I'd tighten that: a fifth of clicks is still being served on the host the site decided to retire. The repo cannot show whether the edge redirect is live now, and this export has no host×date split, so **I cannot say whether `www` is decaying or stable**.
- Risk 001A omits: consolidating *direction* (www→apex) means the 19% click share must migrate. If it is slow or incomplete, clicks could dip during the move, and the impression surge since 18 Aug may partly reflect consolidation churn.
- First action: export Pages with a date dimension filtered to `www` vs apex and verify the redirect live (`npm run seo:live`).

### 2.5 The Keyword Planner file cannot discover new demand

- 785 of the 786 Planner keywords are already queries in the GSC export, so the file was seeded from Search Console. It is a **volume lookup for existing queries**, not a demand-discovery list (the Planner list even includes junk GSC queries like "compuetr", "pick", "convert" at 50,000).
- Volume buckets are coarse (50 / 500 / 5k / 50k / 500k / 5M) and the YoY and three-month fields (±90%, +900%) are bucket-jump artefacts.
- Planner buckets are consistent with GSC where both are clear: `english to urdu typing`, `urdu typing`, `urdu keyboard`, `unicode to inpage`, `inpage to unicode`, `urdu fonts` and `write urdu` are all 50k.
- Where Planner is large but Write Urdu is invisible: `urdu transliteration` (500k bucket, 102 GSC impressions, pos 29.0), `english to urdu transliteration` (5M bucket, 101 impressions, pos 34.7), `urdu fonts` (50k bucket, 80 impressions, pos 37.5). The first two are almost certainly translation-contaminated (the same bucket as `english to urdu`); `urdu fonts` is a genuine gap (see §2.7).
- Therefore 001A's statement that Planner shows `urdu transliteration` as "very large relative demand" is accurate but should not be used to justify Roman page investment without a SERP check.

### 2.6 Position cliff: ranking matters more than snippets

Site-wide CTR by average-position bucket (excluding the `english to urdu` family):

| Pos | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CTR | 41.6% | 28.0% | 15.6% | 6.2% | 4.8% | 2.4% | 1.0% | 1.1% |

- The steepest drop is between positions 3 and 6. Snippet tweaks cannot cross it; ranking moves can.
- 28% of all queries-export clicks come from ~50 navigational/editor queries at positions 1.4–3.6 (`write urdu`, `urdu editor online`, `urdu writer`, `urdu writing online`): 14,099 impressions, 3,802 clicks, 27% CTR.
- Large generic queries (`urdu typing` 27k, `urdu writing` 15k, `urdu typing online` 9k) sit at positions 5.8–6.6 with 1.7–3.1%. Getting `urdu typing` to the 4–5 band would roughly triple its clicks (471 → ~1,365 at the site's own 4–5 band); this is a ranking problem, not a CTR-copy problem.

### 2.7 Internal control group: why the winners win

| Page / cluster | Impr. | Clicks | CTR | Pos |
| --- | ---: | ---: | ---: | ---: |
| `/stylish-urdu-text-generator` | 35,367 | 3,459 | 9.78% | 5.18 |
| `/urdu-editor` (apex) | 42,749 | 2,796 | 6.54% | 7.38 |
| `/urdu-typing-practice` | 4,664 | 326 | 6.99% | 5.79 |
| Fonts cluster (copy/paste, generator, changer) | 16,691 | 1,205 | 7.2% | 6.9 |
| Stylish/name/design cluster | 18,985 | 2,004 | 10.6% | 5.7 |

- Winners have **tool-noun queries** ("generator", "changer", "editor online", "practice") with one unambiguous task and no translation reading. Losers have **generic or ambiguous phrases** ("english to urdu typing", "unicode to inpage", "urdu keyboard") that a SERP can satisfy without a click or that attract a head-to-head with exact-match competitors.
- Fonts demand is already partly captured by the stylish page (`urdu font changer` 11.6% @ 4.4; `urdu font generator` 4.8% @ 6.7). The head term `urdu fonts` is not. A fonts surface should start as an extension of the winning stylish page, not a new product.
- Typing practice/test: ~2,560 impressions across 22 queries, small. 001A's "preserve and extend" is right; it is not a large lever.
- Voice: 3 queries, ~57 impressions in the export. Voice is not a search-acquisition lever on this evidence.

## 3. Internal cannibalization map

Query→page data is not in the export, so ownership is inferred and must be confirmed.

| Cluster | Competing / suspected URLs | Recommended owner | Required change |
| --- | --- | --- | --- |
| English to Urdu typing (head) | `/`, `/roman-urdu-transliteration` (title match), `/english-urdu-typing-tutorial` (slug) | `/` | Confirm via Pages→Queries for the Roman page; retitle Roman page away from the phrase |
| Roman Urdu → Urdu | Roman page (guide), `/` (engine) | Roman page, once a tool | Embed converter; "Roman Urdu to Urdu" title/H1 |
| Online InPage typing | unknown (editor/home) | Decide and document | Identify landing page for "online inpage" queries |
| InPage conversion | `/tools/inpage-unicode-converter` | same | Direction emphasis after SERP check |
| Keyboard | `/urdu-keyboard`, `www/urdu-keyboard` (21% of its impressions at pos 22) | `/urdu-keyboard` | Resolve `www` split; interactive reference |
| Urdu editor | `/urdu-editor` apex + `www` (23% of impressions at pos 10.4) | `/urdu-editor` | Resolve `www` split first; it is a proven winner |

## 4. Reconciled action plan

**P0 — Measure and consolidate (all XS, no engineering unless noted)**
1. Query→page export for `/` and `/roman-urdu-transliteration` filtered to `english to urdu typing`. This decides §2.2. (Confidence in the diagnosis: Medium until done.)
2. Host×date export (`www` vs apex) and a live check of the `www`→apex redirect. Decide with data whether the 19% click share is moving.
3. Exclude 26 Sep from any baseline; record 18–19 Aug as the impression step change and look for what shipped.

**P1 — Harvest existing impressions**
4. `urdu typing` / `urdu writing` / `urdu typing online` (≈51k impressions, positions 5.8–6.6): treat as ranking work, not copy work. Requires page-level query ownership first.
5. Keyboard cluster (~24k impressions, 0.8% CTR, pos 7–9): interactive key reference, `www` split resolved. Effort M, engineering needed.
6. Roman page → tool (001A Slice B) is reasonable but should be re-scoped to Roman demand (~8k impressions) and judged on that, not on the 45k.

**P2 — Strengthen proven winners**
7. Protect `/stylish-urdu-text-generator` and `/urdu-editor` (91% of clicks across three pages). Any site-wide metadata or host change should be monitored on these first.
8. Extend the stylish/fonts page toward `urdu fonts copy and paste` before building a fonts product.

**P3 — New surfaces:** none supported by this data. Voice and typing-test volumes are small.

**P4 — Authority:** no evidence that authority is the limiting factor; the weak queries are intent- or SERP-limited. Do not run a link campaign.

## 5. Traffic scenarios (constant impressions, per 3 months)

| Query / cluster | Impressions | Now | 0.5% | 1% | 2% | 3% | 5% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| english to urdu typing | 164,935 | 135 (0.08%) | 825 | 1,649 | 3,299 | — | — |
| unicode to inpage | 38,135 | 85 (0.22%) | 191 | 381 | 763 | 1,144 | — |
| urdu typing | 27,294 | 471 (1.73%) | — | — | — | 819 | 1,365 |
| keyboard (4 queries) | 24,150 | 197 (0.82%) | 121 | 242 | 483 | 725 | — |
| roman urdu to urdu | 4,862 | 47 (0.97%) | — | — | — | 146 | 243 |

Realistic ranges, given §2:

- `english to urdu typing`: 0.2–0.5% is plausible (≈330–825 clicks). 1%+ would require the SERP to stop being treated as translation, which is outside Write Urdu's control.
- `unicode to inpage`: ~1% if rank improves to ~5–6 (≈380 clicks).
- `urdu typing`: the 3–5% band corresponds to a rank improvement to ~4–5, not a snippet change.
- Combined, the plausible gain across these clusters is a few thousand clicks per quarter on a base of ~25k; it is meaningful but not transformative, and it depends on ranking moves.

## 6. Things not to pursue

- A generic English→Urdu translator.
- More routes for `english to urdu typing`, `urdu typing`, `roman urdu to urdu`, `urdu typing test` (agree with 001A).
- A backlink campaign.
- A voice or typing-test acquisition push on this evidence.
- Treating Planner volume as obtainable traffic.

## 7. Uncertainty and evidence still needed

| Open item | Why it matters | How to resolve |
| --- | --- | --- |
| Which page receives `english to urdu typing` impressions | Determines whether the Roman page's 45k are cannibalization | GSC Pages→Queries for each page |
| `www` vs apex trend | Whether consolidation is progressing or stalled, and whether the Aug step change is related | GSC Pages with date dimension, host filter |
| What shipped around 18 Aug | Cause of the 2.2× impression jump | Deploy log / git history (this checkout is shallow: 110 commits from 13 Sep) |
| SERP for `english to urdu typing`, `unicode to inpage`, `urdu keyboard online` | Confirms translation/exact-match explanations; identifies competitors | Pakistan-localised SERP review (blocked here) |
| Competitor ages, backlinks, whether small sites outrank us | Tests whether authority matters at all | External tools (blocked here) |
| The earlier Planner CSV `11_41_08` | Could contain different keyword sets | Add to the evidence folder |
| Missing 47% of clicks in the queries export | Long tail/anonymised queries convert at ~6%; unknown composition | Use the Search Console API rather than the 1,000-row export |

## 8. Challenge to a conventional conclusion

A conventional read says "huge impressions at positions 4–10 with 0.1–0.5% CTR means optimise titles and snippets". The data says something more specific: **39% of the impressions belong to a query family that behaves like translation search and returns almost no clicks regardless of position, while the site's real traffic comes from a small set of narrow-task queries ranked 1–5.** Chasing the big impression numbers risks optimising the one thing Write Urdu cannot win, while the three pages generating 91% of clicks, and the `www` host still carrying a fifth of them, are the actual exposure.
