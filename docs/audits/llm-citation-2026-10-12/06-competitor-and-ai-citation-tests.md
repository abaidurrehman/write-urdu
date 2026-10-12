# 06 — Competitor comparison and AI citation tests

## 1. What was actually tested

**Engine tested:** Claude web search (the `WebSearch` tool available to this audit agent), 2026-10-12. Results are drawn from a **US-located index**; Pakistani-localised results may differ. Two modes were used: `standard` (fast) and `extended` (deeper/fresher).

**Not tested (no authenticated access from this environment):** ChatGPT Search, Perplexity, Google AI Overviews / AI Mode, Gemini. No claim is made about how those engines treat Write Urdu.

**Cannot fetch competitor pages:** WebFetch was blocked for every external host tried (DNS failure through the proxy), so competitor structure is inferred from search-result titles/snippets only.

### 1.1 Results log (16 queries)

| # | Date | Mode | Query (exact) | Lang | Target WU page | WU mentioned | WU URL linked | Tool recommended | Sources the engine surfaced (selection) |
| --- | --- | --- | --- | --- | --- | :---: | :---: | :---: | --- |
| 1 | 2026-10-12 | std | type Urdu online using English keyboard free | EN | `/` | No | No | No | apps.apple.com (Asan Urdu Editor, KeyNounce), Microsoft Indic tool mirrors (spam domains) |
| 2 | 2026-10-12 | std | write-urdu.com | EN | `/` | No | No | No | unrelated (apkcombo, rolecatcher, Cambridge, UNC) |
| 3 | 2026-10-12 | std | InPage to Unicode converter online | EN | InPage | No | No | No | cle.org.pk (UET Lahore CLE), pythonware.com, peerlist/peerpush (unicodeinpage), capterra |
| 4 | 2026-10-12 | std | Unicode to InPage converter Urdu | EN | InPage | No | No | No | peerlist (unicodeinpage.com), pythonware.com, packagist zanysoft, contra.com |
| 5 | 2026-10-12 | std | Roman Urdu to Urdu converter online | EN | Roman | No | No | No | arxiv/deepai papers, Romanian(!) translators; engine stated it "didn't turn up a dedicated, verified online Roman Urdu to Urdu script converter" |
| 6 | 2026-10-12 | std | Urdu voice typing online speech to text | EN | Voice | No | No | No | vatis.tech, rajbhasha.net, soniox.com, dictanote.co, jotme.io |
| 7 | 2026-10-12 | std | Urdu poetry card maker online shayari on photo | EN | Card Studio | No | No | No | CapCut/Pippit templates, App Store apps; engine stated it "didn't find a dedicated free website" |
| 8 | 2026-10-12 | std | Urdu keyboard online phonetic type Urdu | EN | Keyboard | No | No | No | branah.com/urdu, cle.org.pk CRULP layout, spam mirrors |
| 9 | 2026-10-12 | std | urdu typing online english to urdu | EN | `/` | No | No | No | typingbaba.com, App Store keyboards |
| 10 | 2026-10-12 | std | Assalamualaikum in Urdu script copy paste | EN | Phrases | No | No | — | openbooks.lib.msu.edu, urdupod101.com, libretexts, wiktionary |
| 11 | 2026-10-12 | std | Urdu mein typing kaise karein mobile | Roman | `/` / FAQ | No | No | No | App Store keyboards, urdupod101 keyboard guide, phoneworld.com.pk (Matnsaz) |
| 12 | 2026-10-12 | std | ان پیج کو یونی کوڈ میں کیسے تبدیل کریں | Urdu | InPage | No | No | No | cle.org.pk PDF, pythonware, unicodeconverters, packagist |
| 13 | 2026-10-12 | ext | "write-urdu.com" urdu editor | EN | brand | **Yes** | `write-urdu.com/urdu-editor`, **`www.write-urdu.com/write-urdu-features`, `/write-urdu-privacy`, `/write-urdu-sitemap`** | n/a | Summary repeated **obsolete** product text ("Switch to Urdu HTML editor", "WhatsApp it", non-commercial-use terms) |
| 14 | 2026-10-12 | std | how to write Urdu on WhatsApp | EN | FAQ (A-7) | No | No | No | App Store apps, propakistani.pk, cafebazaar |
| 15 | 2026-10-12 | ext | where can I type Urdu online without installing software | EN | `/`, keyboard | **Yes** | `write-urdu.com/urdu-keyboard` | **Yes** — "Offers an on-screen keyboard, or you can type Urdu words using English letters and press Space after each word." | onlinetyping.org, tamiltyping.net, urdu-nigaar.com (guide), urdukeyboard.com, keyboardsonline.net, urdulabs.com, seomagnifier.com |
| 16 | 2026-10-12 | ext | best free Urdu typing website English letters to Urdu script | EN | `/` | No | No | No | urdupoint.com, easyurdutyping.com, lipikaar.com, hindityping.info, bhashatyping.in, urdutexts.com, hamariweb.com, accentgenerator.com |

### 1.2 Interpretation (with confidence)

- **Observed:** In this one engine and region, Write Urdu was surfaced in **2 of 16** queries; once as a correct tool recommendation (keyboard page, query 15) and once only for a brand-name query, where the retrieved copies were **stale `www` pages**.
- **Observed:** For three high-demand tasks — Roman→Urdu conversion, InPage conversion, Urdu poetry-on-photo — the engine explicitly said it could not find a strong dedicated web tool, or returned third-party/app results. Write Urdu has a working tool for each. This is a **retrieval gap, not a product gap**.
- **Observed:** The one successful recommendation quoted text that exists in the current `/urdu-keyboard` static HTML ("type Urdu words using English letters and press Space after each word"). Static, concise how-to passages are what get reused.
- **Hypothesis (medium confidence):** Retrieval indexes outside Google under-represent write-urdu.com relative to its Google footprint (GSC: ~516k Pakistan impressions/3 months, position ~6). Possible causes: `www`/apex split, weaker Bing coverage (unverified), and the absence of the InPage/voice pages from `llms.txt` (low weight). A Bing Webmaster Tools coverage check is the cheapest way to test this.
- **Not concluded:** A single run per query cannot establish citation frequency. US-index results are not Pakistani results. Search-tool output varies between runs.

## 2. Competitor comparison (evidence = search titles/snippets only)

| Competitor / source | Type | Wins on | Why an AI might choose it over WU | WU advantage |
| --- | --- | --- | --- | --- |
| **cle.org.pk** (Center for Language Engineering, UET Lahore) | Institutional reference (downloadable tools, keyboard layouts, PDFs) | InPage→Unicode, CRULP phonetic layout | Academic authority; describes the problem in plain terms; long-standing citations | WU has a **browser** converter in both directions and already links to CLE for CRULP. WU should cite CLE as background and be the "use it now" option. |
| **pythonware.com/unicode-to-inpage-converter**, **unicodeinpage.com** (via peerlist/peerpush/contra listings) | Competing tools | Unicode→InPage | Exact-match titles; directory/listing pages create many independent mentions; explicit "runs in your browser" and ligature caveat | WU has a documented mapping provenance, unsupported-character reporting, cleaner/editor handoff, npm package — none of which is visible in a static, quotable way. |
| **branah.com/urdu**, **urdukeyboard.com**, **keyboardsonline.net**, **urdulabs.com** | Competing keyboard/typing tools | Urdu keyboard online | Very short, task-matched titles ("Urdu Keyboard – Type Urdu Now"); some publish "how to type Urdu online" guides (urdu-nigaar.com) | WU combines keyboard + English-letter typing + CRULP reference + practice; already recommended once (query 15). |
| **easyurdutyping.com**, **lipikaar.com**, **bhashatyping.in**, **urdupoint.com**, **hamariweb.com** | Competing Roman→Urdu tools | "best free Urdu typing website" | Snippets state concrete features (Space to convert, local autosave, alternate spellings) — the engine quoted those features directly | WU has the same features plus voice, cards, InPage; but its homepage feature list is spread across UI and nav. |
| **urdupod101.com**, **openbooks.lib.msu.edu**, **wiktionary** | Informational references | Greetings/phrases | Educational authority; explanation of meaning and reply forms | WU phrases page is more task-oriented (variants + copy + card) but only 5 internal links and absent from llms.txt. |
| **CapCut / Pippit templates**, App Store apps | Apps/design platforms | Poetry on photo | Massive domain authority; many template pages | WU is free, no sign-up, browser-local photos, Urdu-safe fonts — stated on page but not echoed by any third party. |
| **soniox, rajbhasha.net, dictanote, jotme** | Voice tools | Urdu voice typing | Explicit platform/compatibility statements ("works system-wide", "Chrome/Edge extension") | WU is free and browser-native but does not say *where* it works. |

Not assumed: none of these is claimed to outrank WU because of schema, domain age or word count. GSC shows WU at average position ~4–8 on most of these queries in Google; the gap is in **AI answer selection and non-Google indexes**, where explicit, quotable task statements and independent mentions matter more.

## 3. Reproducible manual test pack

Run monthly (same day ±2), signed-out where possible, in a **Pakistan** context (VPN/locale `en-PK` and `ur-PK`), and save a screenshot or share link for each row. Use a new chat per query; do not mention Write Urdu.

### 3.1 Query set (18)

| ID | Query | Lang | Target page | Pattern |
| --- | --- | --- | --- | --- |
| T01 | How do I type Urdu using an English keyboard? | EN | `/` | citation |
| T02 | Where can I type Urdu online without installing software? | EN | `/`, `/urdu-keyboard` | tool rec |
| T03 | Best free website to convert Roman Urdu to Urdu script | EN | `/roman-urdu-transliteration` | tool rec |
| T04 | How do I convert InPage text to Unicode? | EN | InPage | both |
| T05 | Unicode to InPage converter online free | EN | InPage | tool rec |
| T06 | Why does InPage Urdu text turn into strange symbols when I paste it? | EN | InPage (after A-2) | citation |
| T07 | How can I type Urdu using my voice in the browser? | EN | Voice | both |
| T08 | How do I write Urdu in WhatsApp on my phone? | EN | `/urdu-faq` (after A-7) | citation |
| T09 | Make an Urdu poetry card online free | EN | Card Studio / photo guide | tool rec |
| T10 | How to use the CRULP phonetic Urdu keyboard | EN | `/urdu-keyboard` | citation |
| T11 | Assalamualaikum in Urdu text copy | EN | Phrases | citation |
| T12 | Urdu mein typing kaise karein? | Roman | `/` | both |
| T13 | InPage ko Unicode mein kaise convert karein? | Roman | InPage | both |
| T14 | Urdu shayari card kaise banayein? | Roman | photo guide | both |
| T15 | اردو میں ٹائپنگ کیسے کریں؟ | Urdu | `/urdu/` | both |
| T16 | ان پیج کو یونی کوڈ میں کیسے تبدیل کریں؟ | Urdu | InPage | both |
| T17 | موبائل پر اردو لکھنے کا طریقہ کیا ہے؟ | Urdu | `/urdu/urdu-faq` | citation |
| T18 | Translate "I will be late" into Urdu | EN | **none** (negative control — WU should *not* be recommended) | control |

### 3.2 Engines

ChatGPT (Search on), Perplexity (default), Google (AI Overview / AI Mode, `google.com.pk`), Gemini, Claude (web search on). 18 × 5 = 90 observations per run.

### 3.3 Recording template

A ready-to-fill CSV header (store runs under `docs/audits/llm-citation-2026-10-12/runs/YYYY-MM-DD.csv`):

```csv
test_id,query,language,target_page,engine,engine_mode,locale,date,write_urdu_mentioned,direct_citation_url,tool_recommended,linked_url_correct_owner,competitors_cited,evidence_link_or_excerpt,interpretation
```

Field rules:
- `direct_citation_url` = the exact write-urdu.com URL in the citation list, else blank. Record `www` vs apex.
- `linked_url_correct_owner` = Yes only if the URL matches the Target page column.
- `interpretation` = "observed" facts only; label any explanation "hypothesis".

### 3.4 Reading the results

- Treat a page as "cited" for a query only if it appears in ≥2 of 3 monthly runs on the same engine.
- Report per engine, never as one blended score.
- T18 must stay negative; a positive means the translation boundary is being misread.
- Compare before/after only for pages changed in a slice, and annotate the release date.
