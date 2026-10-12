# 01 — Executive summary: LLM citation & AI search readiness

**Date:** 2026-10-12 · **Repo commit:** `e04e08c` · **Type:** read-only audit (no application code changed)

## Bottom line

Write Urdu is a **real, mature tool provider with good on-page fundamentals**. It is held back by (1) an unresolved `www` duplicate host, which is already leaving stale copies in AI search indexes; (2) a few high-demand tools whose pages work but don't say enough that can be quoted, InPage and Voice especially; (3) drift between the product and its machine-readable/link signals; and (4) almost no external, accountable identity. None of this needs a rebuild. The highest-value work is small, testable copy, link and config changes.

## Citation-readiness score: **64 / 100** (moderate)

This score measures how ready the site is to be cited. It is **not** a measured citation rate or an AI ranking. It is a transparent judgement from repository and Search Console evidence. Production was not reachable from the audit environment, and only one AI engine was tested.

| Dimension | Weight | Score 0–5 | Weighted | Evidence | Main weakness | Confidence |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Technical crawlability & extraction | 20% | 3.5 | 14.0 | Static titles, H1s, canonicals, JSON-LD and explanations on every indexable route; permissive, correct robots | `www` 200 duplicates (as of 2026-10-04); ready-made cards/status texts JS-only; no raw `<main>` on 3 core templates | medium (production unverified today) |
| Search-intent alignment | 20% | 3.5 | 14.0 | Explicit ownership registry; Roman page converted (#237); translation boundary stated | 8 anchors contradict ownership; InPage framing vs larger `unicode to inpage` demand (A5 open); "english to urdu" translation ambiguity | high |
| Answer quality & passage extractability | 20% | 3.0 | 12.0 | Strong quotable passages (Roman examples, phrases, keyboard CRULP, card sizes) | InPage lacks "what/why" and example; Voice lacks compatibility/troubleshooting; no phone/WhatsApp answer | high |
| Verifiable credibility & authority | 15% | 2.0 | 6.0 | 10-year history page with honest methodology; privacy detail; changelog; contact | anonymous maintainer; no `sameAs`/`foundingDate`; no observed third-party mentions | medium |
| Internal discovery & semantic architecture | 10% | 3.5 | 7.0 | Static shared nav gives 38–51 incoming links to most tools | phrases page 5 links; anchor conflicts | high |
| Urdu & multilingual retrieval | 10% | 3.0 | 6.0 | 11 Urdu-locale pages with reciprocal hreflang; Urdu/Arabic phrase variants | no Urdu InPage answer; "shayari" absent; Roman-Urdu phrasing absent | medium |
| Tool accessibility from recommended URLs | 5% | 4.5 | 4.5 | Every recommended URL is the working tool, free, no account | Card Studio mobile UX remediation still in flight (WU-UXR-002) | high |
| **Total** | 100% | | **63.5 ≈ 64** | | | |

Per-URL scores (50–75) are in `03-page-citation-matrix.csv`.

## Biggest discovery gaps

1. **Host split visible to AI indexes.** GSC: `www` = 105,172 impressions / 19.1% of clicks. On 2026-10-12, a brand query in Claude web search returned `www.write-urdu.com` pages and repeated obsolete product text.
2. **High-demand tools that AI engines did not surface.** In 16 live queries, Write Urdu appeared twice. For Roman→Urdu, InPage and Urdu poetry-on-photo, the engine said it found no strong dedicated web tool or cited third parties. Write Urdu has working tools for all three. InPage alone has 82,953 Google impressions at 0.54% CTR.
3. **Quotable facts that are missing.** "Why does InPage text look like symbols?", "where does voice typing work?" and "how do I get Urdu into WhatsApp?" have no answer passage, although GSC shows demand: `urdu mein kaise likhate hain` 533 impressions at 0.19%; `whatsapp in urdu writing` 127 at 0%.
4. **Machine-readable drift.** `llms.txt` (reviewed 2026-08-28) omits 13 indexable routes, including InPage and Voice. Eight anchors send "English to Urdu typing" to the Roman page or "Roman Urdu" to the homepage.
5. **Weak external identity.** The maintainer is anonymous, there are no `sameAs` profiles, and the public GitHub repo has no description or homepage. LLMs cannot corroborate who stands behind the tool.

## Strongest existing assets

1. A working, free, no-account tool on every recommended URL, plus a broad toolkit (typing, keyboard, voice, InPage, OCR, cleaner, cards).
2. A crisp, test-enforced statement that this is transliteration, not translation, with real input/output examples.
3. Unusual first-party evidence: CRULP-style keyboard reference, a documented InPage mapping provenance study, and a 10-year history with measured-versus-estimated usage numbers.
4. Static-first architecture with central SEO configuration, schema and nav generators, and contract tests. Fixes are cheap and safe.
5. Strong Google position for the core cluster (Pakistan 515,526 impressions in 3 months; `urdu editor online` 49% CTR, `write urdu` 32%). This is a foundation that AI Overviews and Bing-based engines can draw on once signals are consistent.

## Five most important next actions

1. **A-1:** Apply the already-specified Cloudflare `www` → apex 301 (`A0-A1-BASELINE.md`). This is a dashboard change.
2. **Slice 1 (A-3 + A-4):** Refresh `llms.txt` and guard it with a route-coverage test. Fix the 8 ownership anchors.
3. **A-2:** Add a user-language InPage explainer, a real before/after example and a compatibility list, without touching A5's title/H1 direction decision.
4. **A-5 + A-7 + A-6:** Add voice compatibility and troubleshooting, one WhatsApp/phone FAQ answer, and contextual links to the phrases page.
5. **A-10 + A-13:** Verify Cloudflare/Bing access for AI crawlers. Start the monthly multi-engine test pack as a baseline **before** shipping content changes.

Owner decisions are needed for A-9 (a named maintainer and `sameAs` profiles) and A-20 (one plain privacy fact on conversion tools, which the public-language firewall currently forbids outside Privacy).

## Files

| File | Contents |
| --- | --- |
| `02-technical-crawl-audit.md` | robots/llms/sitemap/canonical/host findings, raw vs rendered table, schema, link graph, production commands |
| `03-page-citation-matrix.csv` | 18 priority URLs with GSC data, extractability, scores, best passage, fixes |
| `04-query-intent-and-fanout.csv` | 36 EN / Roman Urdu / Urdu intents with owners, evidence and opportunity type |
| `05-content-and-authority-gaps.md` | Missing passages, Urdu-specific retrieval issues, entity/authority |
| `06-competitor-and-ai-citation-tests.md` | 16 executed searches, competitor table, manual test pack |
| `07-prioritized-action-plan.md` | P0–P4 actions, reconciliation with existing specs, sequence |
| `08-implementation-handoff.md` | PR-sized slices with files, acceptance criteria and tests |
