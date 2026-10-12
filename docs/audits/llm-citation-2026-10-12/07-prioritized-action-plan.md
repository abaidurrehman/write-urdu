# 07 — Prioritized action plan

Every action is tied to evidence in files 02–06. IDs (`A-n`) are referenced by the implementation handoff (file 08). Ordering respects `specs/BACKLOG.md` governance: P0.1 activation freeze, `WU-SEO-CTR-001A` measurement discipline (one variable per route at a time, frozen homepage title/H1), no doorway pages, ad-free task areas.

Complexity: XS (<1h), S (≤½ day), M (1–2 days). Confidence: how sure we are the change is correct *and* useful, not that it will produce citations.

---

## P0 — Critical blockers

### A-1 · Permanently redirect `www` → apex (external Cloudflare rule)
- **Evidence:** 2026-10-04 live check: HTTPS `www` returns 200 duplicates; GSC `www` = 105,172 impressions / 19.1% of clicks; 2026-10-12 AI search returned stale `www` pages with obsolete product facts (file 06 #13).
- **URLs:** all `https://www.write-urdu.com/*`, `http://www.write-urdu.com/*`.
- **Root cause:** zone-level redirect not configured; token lacks `Zone > Single Redirect > Edit`.
- **Change:** exactly the rule in `docs/evidence/WU-SEO-CTR-001A/2026-10-04/A0-A1-BASELINE.md` ("Required repair"). No repository change.
- **Mechanism:** one host for every index (Google, Bing, OAI/Perplexity/Claude indexes) → stale `www` copies get replaced; link/citation signals consolidate.
- **Complexity:** XS (dashboard). **Confidence:** high.
- **Validate:** `npm run seo:live` with the six-path list; `curl -sI https://www.write-urdu.com/urdu-keyboard` → `301 location: https://write-urdu.com/urdu-keyboard`; GSC Pages host split by date afterwards.
- **Risks:** temporary click dip while `www` equity migrates (`WU-SEO-INTENT-001` §2.4); loops if `www` is not proxied. Already an approved item (A1) — this audit only raises urgency.

### A-10 · Verify AI-crawler and Bing access in production (verification, no code)
- **Evidence:** cannot be verified from this environment; robots allows all relevant bots but Cloudflare WAF/Bot Fight could still challenge them (`docs/SEO-CRAWLER-POLICY.md` notes this). ChatGPT search draws heavily on Bing; Bing coverage of write-urdu.com is unknown.
- **Change:** run file 02 §8 commands; check Cloudflare Security → Events for `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `bingbot`; confirm site is verified in Bing Webmaster Tools and inspect `/tools/inpage-unicode-converter` there; run `npm run seo:indexnow -- /tools/inpage-unicode-converter /tools/urdu-voice-typing` after content slices ship (script exists; needs `INDEXNOW_KEY`).
- **Complexity:** XS. **Confidence:** high that it is worth checking; outcome unknown.
- **Escalate to P0 fix** only if a challenge/403 is observed.

---

## P1 — High-impact quick wins

### A-2 · Make the InPage converter quotable and accurate
- **Evidence:** 82,953 impressions at 0.54%; no "what is InPage text" passage; example JS-only; privacy FAQ evasive though conversion is local; `featureList: []`; absent from llms.txt; zero WU appearances in 3 InPage AI-search tests where CLE/pythonware were cited.
- **URL:** `/tools/inpage-unicode-converter`. **Files:** `tools/inpage-unicode-converter.html` (below the tool, inside existing "What this converter supports" section and FAQ), `seo.config.js` (only if `featureList` is sourced there; otherwise `scripts/static-seo-graph.js`), regenerate with `npm run seo:graph:sync`.
- **Change:** add (a) a 2-sentence user-language "Why does InPage text look like symbols?" passage derived from `docs/WU-INPAGE-MAPPING-RESEARCH-2026-08-17.md` §2 (wording in file 05 §2.1); (b) static before/after figure (Unicode `یہ ایک اردو متن ہے۔` ↔ illustrative legacy glyphs, no control characters); (c) compatibility list (text pasted from older InPage versions ✅, `.inp` ❌, layout/fonts ❌, unknown characters kept ✅); (d) `featureList` with 4–5 visible capabilities. Write all copy in user language — `scripts/public-language-firewall.js` fails on implementation terms ("mapping profile", "legacy byte") and on local-processing claims outside Privacy. The privacy FAQ stays as is unless A-20 is approved.
- **Do not change** title, H1, description or default direction (owned by `WU-SEO-CTR-001A` A5).
- **Mechanism:** gives AI answers a short, correct passage for "why does InPage text look garbled / how do I convert it", with a working tool on the same URL.
- **Complexity:** S. **Confidence:** high (facts are already in repo research and code).
- **Validate:** `npm test`, `npm run seo:check`, `npm run seo:graph:check`, `npm run language:check` (public-language firewall: keep user-domain words, avoid internal IDs such as the profile name), focused test asserting the new strings exist in raw HTML and FAQ JSON-LD matches visible FAQ.
- **Risk:** the A5 metadata experiment must log this content change as a confounder.

### A-3 · Bring `llms.txt` back in line with the product and guard it
- **Evidence:** 13 indexable routes missing (file 02 T-2), including InPage (82,953 impr) and Voice (4,042); "Last reviewed 2026-08-28"; no Urdu-locale list; no founding date.
- **Files:** `llms.txt`, `tests/seo-authority-contract.test.js`.
- **Change:** add "Convert and fix" section (InPage converter, Text Cleaner, Urdu image to text), Voice Typing under "Start writing", phrases + writing templates under "Learn"/"Create", wedding invitation under "Create and export", a short "Urdu-language pages" section listing the 11 `/urdu/` routes, one fact line "Online since July 2016 (see 10 years of Write Urdu)", and an explicit "Not supported" line (English→Urdu meaning translation, `.inp` file upload, Urdu→Roman). Update `Last reviewed`. Add a test: every `seo.config.js` route with `indexable: true` appears in `llms.txt` unless listed in an explicit exemption array (`community-guidelines`, `write-urdu-features`, `urdu-editor-features` may stay out).
- **Mechanism:** cheap, accurate summary for agents that read llms.txt; **no guarantee** any engine uses it.
- **Complexity:** XS–S. **Confidence:** high (correctness), low (impact).
- **Validate:** `npm test`; `npm run language:check`.

### A-4 · Fix eight anchors that contradict intent ownership
- **Evidence:** file 02 §7 table; contract in `specs/WU-SEO-CTR-001A-pakistan-search-capture.md` §13.
- **Changes (exact):**
  | File:line | From | To |
  | --- | --- | --- |
  | `index.html:277` | `English to Urdu typing guide` → `/roman-urdu-transliteration` | `Roman Urdu to Urdu converter` (same href) |
  | `index.html:324` | `Read the English-to-Urdu typing guide →` → Roman | `Convert a Roman Urdu passage →` (same href) |
  | `urdu-faq.html:51` | `English to Urdu typing guide` → Roman | `Roman Urdu to Urdu converter` |
  | `urdu-alphabet.html:189` | H3 `English to Urdu typing guide` (Roman card) | `Roman Urdu to Urdu converter` |
  | `write-urdu-sitemap.html:109` | card title "How English to Urdu typing works" → Roman | "Roman Urdu to Urdu converter" |
  | `english-urdu-typing-tutorial.html:32` | `Open Roman Urdu typing` → `/` | `Open English to Urdu typing` |
  | `urdu-alphabet.html:36` | `Try Roman Urdu typing` → `/` | `Try English to Urdu typing` |
  | `urdu-ocr.html:130`, `urdu-text-cleaner.html:128` | `Write Roman Urdu → Urdu` → `/` | `Type Urdu with English letters` |
- Update matching `data-wu-l10n` strings in `locale/` if keys exist (check `home.toolCard2Title`, `home.videoLink`, `urdu-faq.navRoman`, `urdu-alphabet.ctaRoman`, `urdu-alphabet.related2Title`) and regenerate `/urdu/` with `npm run locale:generate`.
- **Mechanism:** consistent link-text → owner mapping for link-graph-aware retrieval and Google.
- **Complexity:** XS. **Confidence:** high.
- **Validate:** `npm test`, `npm run shell:check`, `npm run locale:check`, `npm run seo:check`; grep that no anchor text containing "English to Urdu typing" points anywhere except `/` and `/english-urdu-typing-tutorial`.
- **Risk:** `/english-urdu-typing-tutorial` legitimately uses "Learn English-to-Urdu typing" (informational modifier) — leave it.
- **Firewall note:** `scripts/public-language-firewall.js:50-53` rewrites "Roman Urdu typing guide"/"Roman Urdu to Urdu typing guide" → "English to Urdu typing guide". Those rules date from when the Roman page was titled "English to Urdu Typing with English Letters" (before #237). The new anchors above do not match any left-hand string, so `language:check` passes; do **not** reintroduce the exact left-hand strings. Optionally ask the owner to retire rules 50 and 52 as stale.

### A-5 · Add compatibility, permission recovery and a visible FAQ to Voice Typing
- **Evidence:** file 05 §2.2; `WU-GROWTH-003` §7 modules 3–4 unshipped; competitors' snippets state platform support explicitly.
- **File:** `tools/urdu-voice-typing.html` (below the "Your text is ready to use" section), FAQ JSON via the existing schema path; Urdu sibling via `npm run locale:generate` if the locale generator owns it.
- **Change:** ≤120 words: where it works (phrase truthfully; fill `docs/VOICE-MOBILE-DEVICE-CHECKLIST.md` before naming browsers), what to do if the microphone is blocked, that listening starts only after pressing Start (with the existing "voice typing privacy & browser details" link for processing details — the firewall keeps those on Privacy), voice vs English-letter typing link to `/`. 3 visible FAQs + FAQPage schema.
- **Complexity:** S. **Confidence:** medium-high (browser-specific claims need device sign-off).
- **Validate:** `npm test`, `npm run seo:check`, `npm run test:browser -- --grep voice` (existing voice tests), `language:check`.

### A-6 · Give the phrases page contextual internal links
- **Evidence:** `/urdu-phrases-copy-paste` has 5 incoming static links, no nav/llms entry; it holds the best greeting/phrase passages on the site; AI test #10 cited UrduPod101/MSU instead.
- **Links to add (contextual, not sitewide):**
  | Source | Anchor | Rationale |
  | --- | --- | --- |
  | `/` (how-to card, after the "names and short messages" bullet) | `Copy common Urdu phrases like السلام علیکم` | users typing greetings are the homepage's common job |
  | `/urdu-card-studio` (Related tools list) | `Urdu and Arabic phrases to put on a card` | phrases page already sends users to Card Studio; close the loop |
  | `/urdu-faq` (Tools section) | `Urdu & Arabic phrases (Assalamualaikum, Mashallah…)` | FAQ users ask spelling questions |
  | `/how-to-write-urdu-on-photo` | `Ready-to-copy Urdu greetings and duas` | photo-card makers need text |
- **Complexity:** XS. **Confidence:** high.
- **Validate:** inventory script incoming count ≥ 9; `npm run shell:check`.

### A-7 · Answer "How do I write Urdu in WhatsApp / on my phone?" on the FAQ
- **Evidence:** GSC `urdu mein kaise likhate hain` 533 impr @0.19%, `whatsapp in urdu writing` 127 @0%, `how to write urdu in whatsapp` 84; BACKLOG P2.3 lists this exact theme; AI test #14 surfaced only apps.
- **Files:** `urdu-faq.html` (+ FAQPage JSON), `urdu/urdu-faq.html` via locale source, optional one-line link from `index.html` how-to list.
- **Change:** one Q&A, ≤90 words (see file 05 §2.3). No new URL.
- **Complexity:** XS–S. **Confidence:** medium-high.
- **Validate:** `npm test`, `npm run seo:check`, `npm run locale:check`.

---

## P2 — Content and semantic improvements

### A-8 · Static-render a capped subset of ready-made cards and statuses
- **Evidence:** `/urdu-cards` raw 423 → rendered 8,210 words; `/urdu-whatsapp-status-maker` 490 → 1,027; empty grid containers; data in Node-importable `js/urdu-cards-data.js`.
- **Files:** `scripts/static-collection-content.js` (+ sync script), `urdu-cards.html`, `urdu-whatsapp-status-maker.html`, `urdu/urdu-cards.html` (locale), JS grid scripts must replace/hydrate the static markup without duplicates.
- **Change:** between `<!-- wu-static-collection:start:… -->` markers, render category headings and up to 3 items per category as plain text (`lang="ur" dir="rtl"`), each with a link into the JS experience. Extend the archived `WU-SEO-CRAWL-001D` contract rather than inventing a new mechanism.
- **Complexity:** M. **Confidence:** medium-high.
- **Validate:** `npm run collections:check`, a raw-HTML test asserting ≥N Urdu items present, browser test that the JS grid shows each card once, CLS check on mobile.
- **Risk:** duplicate render/CLS; must coordinate with `WU-UXR-002` and `WU-CARD-RETENTION-001` (both touch these pages).

### A-14 · Roman spelling-variant table on the Roman converter
- **Evidence:** only one variant pair shown; spec `WU-SEO-CTR-001A` §6.3 requires examples "reproduced by the production engine".
- **Change:** 4–6 rows captured from the live engine (`LIVE_TRANSLITERATION=1` run per README) and stored as a fixture; render statically.
- **Complexity:** S. **Confidence:** medium. **Dependency:** do after A4 measurement window is logged.

### A-11 · Server-delivered `<main>` on the three workspace templates
- **Evidence:** file 02 T-6.
- **Change:** wrap the existing main column in `<main>` in `index.html`, `urdu-keyboard.html`, `urdu-editor.html` (+ locale generator output); keep `site-header.js` fallback.
- **Complexity:** S (visual regression risk). **Confidence:** medium (benefit is modest).
- **Validate:** `npm run test:browser` (desktop + mobile snapshots), `shell:check`.

### A-12 · Copy fixes
- Card Studio duplicated clause; use "shayari" once in `/how-to-write-urdu-on-photo` lede; move 4 navigation bullets out of the homepage how-to `<ul>` **only if** the homepage freeze owner agrees (A7 confounder).
- **Complexity:** XS.

### A-15 · Accurate `lastmod` / `dateModified`
- Derive from `git log -1 --format=%cs` in `scripts/generate-seo-files.js` and the graph sync. **Complexity:** S. **Confidence:** medium. Low impact.

---

## P3 — Authority and distribution

### A-9 · Accountable entity signals (owner decisions first)
- `Organization.foundingDate: "2016-07"` (sourced from `/10-years-of-write-urdu`). XS.
- `sameAs` **only** for profiles the owner controls (YouTube channel referenced in `docs/SEO-OUTREACH-CHECKLIST.md`; GitHub repo if the owner wants it public-facing). XS.
- Name a maintainer or legal entity on `/why-write-urdu` and in `Organization.founder` — **owner decision**; do not invent.
- Set the GitHub repo description ("Free browser tools to type, convert and design Urdu") and homepage URL. XS, no deploy.
- **Confidence:** medium. Mechanism: entity reconciliation and accountability; no direct ranking claim.

### A-20 · Owner decision: one plain privacy fact on conversion tools
- **Evidence:** competitors' snippets state "runs entirely on this page"/"everything runs directly in your browser" and AI answers repeat it (file 06 #3); Write Urdu's InPage, OCR and Cleaner pages are prevented from saying the equivalent by `defensiveOutsidePrivacy` in `scripts/public-language-firewall.js`, and the InPage FAQ answer was deliberately softened (line 60).
- **Trade-off:** the firewall exists to keep public copy value-first and avoid defensive/architecture language (`WU-SEO-CRAWL-001A`). For document-conversion tools, "is my text uploaded?" is a decision factor for users and for an LLM choosing what to recommend.
- **Option:** allow a single FAQ answer per conversion tool, e.g. InPage: "No. Conversion happens on your device and Write Urdu does not save the text you paste. See Privacy for details." Implement by adding a narrow, documented exemption (per-file allow-list) in the firewall rather than deleting rules.
- **Complexity:** XS once decided. **Confidence:** medium. **Do not implement without explicit owner approval.**

### A-16 · Genuine third-party references
- InPage converter + npm package (`WU-API-001`, P0.7) → submit to relevant developer/language-resource lists; ask CLE (UET Lahore) or university Urdu programmes whether they list browser tools. Answer real questions in Urdu-typing communities with a link only when it is the best answer. Follow `docs/SEO-OUTREACH-CHECKLIST.md`; no paid links, no fake reviews.
- **Complexity:** ongoing, low cost. **Confidence:** medium.

---

## P4 — Experiments and future opportunities

- **A-13 · Monthly AI citation test run** using file 06 §3 (90 observations; 1–2 hours/month). Start a baseline **before** A-2/A-5/A-7 ship.
- **A-17 · Urdu-locale InPage page** (`/urdu/tools/inpage-unicode-converter`) — only when `WU-I18N-001D` reopens locale expansion; evidence: Urdu-script InPage query returned only third parties.
- **A-18 · Wedding invitation explanatory content** — inside `WU-SHAADI-001` slices.
- **A-19 · Tool-derived original data** — e.g. publish the InPage mapping coverage table (letters/numerals/punctuation supported, unsupported bucket) from `js/inpage-unicode-core.js` as a reference table; genuinely unique, citable evidence. Only after A-2.

---

## Reconciliation with existing initiatives

| Audit finding | Existing initiative | Status in repo | This audit's position |
| --- | --- | --- | --- |
| `www` duplicates (A-1) | `WU-SEO-CTR-001A` A1; `docs/CLOUDFLARE-CANONICAL-HOST.md`; `docs/P0-SEO-HOST-CONSOLIDATION-2026-08.md` | Defect confirmed 2026-10-04; fix blocked on token | Reuse exact rule; adds AI-index evidence; no new work item |
| InPage direction & metadata | `WU-SEO-CTR-001A` A5 / §7 | Open | A-2 is direction-neutral content; leave title/H1/default to A5 |
| InPage engine/package | `WU-API-001`, P0.7, `packages/inpage-unicode` | In progress | A-2 reuses `js/inpage-unicode-core.js`; no new mapping |
| Roman page | A4 (#237, 2026-10-05) | Shipped; measurement open | Only anchors (A-4) + later variant table (A-14) |
| Homepage metadata | A2/A7, P1.1 | Frozen pending evidence | No title/H1 change; A-12 homepage list tweak needs owner OK |
| Keyboard | A3 | Shipped | No change except optional device-setup line |
| Voice SEO | `WU-GROWTH-003` §7 | Modules 3–4 not shipped | A-5 implements those modules |
| Static crawlability | `WU-SEO-CRAWL-001A–D` (archived complete) | Complete but pre-dates current card/status libraries | A-8 extends CRAWL-D to two pages |
| Answer-ready content | BACKLOG P2.3 | Evidence-gated | A-7 supplies the GSC evidence and the smallest form |
| Fonts | `WU-FONT-001`, A6 | Slice 1C next | No font action from this audit |
| Card Studio UX | `WU-UXR-002` (P0.12) | Slices A–D shipped 2026-10-11 | A-12 copy fix can ride the next UXR-002 slice |
| Crawler policy | `docs/SEO-CRAWLER-POLICY.md` | Correct | A-10 verifies WAF only |
| llms.txt | `tests/seo-authority-contract.test.js` | Partially guarded | A-3 adds route-coverage guard |
| Measurement | `WU-SEO-CTR-001A` §14, `docs/SEO-SERP-EXPERIMENTS.csv` | GSC-based | A-13 adds AI-engine observations, kept separate from GSC |
| Outreach | `docs/SEO-OUTREACH-CHECKLIST.md` | Principles only | A-16 gives concrete, honest targets |

## Incremental sequence

1. **Week 0 (no code):** A-1 (Cloudflare), A-10 (verification), A-13 baseline test run, GitHub repo description (A-9 part).
2. **Slice 1:** A-3 + A-4 (llms.txt + anchors) — smallest, fully testable, no UI risk.
3. **Slice 2:** A-2 (InPage content).
4. **Slice 3:** A-5 (Voice) + A-7 (WhatsApp FAQ) + A-6 (phrases links).
5. **Slice 4:** A-9 schema parts after owner decisions.
6. **Slice 5:** A-8 (static collections) after `WU-UXR-002` settles.
7. Re-run A-13 four and eight weeks after each slice; compare GSC for changed pages only.
