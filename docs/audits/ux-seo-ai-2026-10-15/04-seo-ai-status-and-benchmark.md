# 04 — Search intent, LLM-citation status and AI visibility benchmark

This file reconciles the 2026-10-12 LLM citation audit (`docs/audits/llm-citation-2026-10-12/`) with today's state. It does **not** replace that audit. Read its 02 file for the full crawl audit and its 06 file for the 16 earlier searches and the competitor table.

## 1. Search-intent ownership (verified against `seo.config.js` today)

Typing/conversion rows are already governed by `specs/WU-SEO-CTR-001A-pakistan-search-capture.md` §4.1. The creative rows below are the hypotheses from the initiative prompt, checked against existing routes. **No new routes are proposed.**

| Intent | Owner (exists) | Current title (searchTitle where set) | Verdict |
| --- | --- | --- | --- |
| English to Urdu typing online | `/` | English to Urdu Typing Online \| WriteUrdu | Confirmed. Metadata frozen (A-series experiment). |
| Roman Urdu to Urdu converter | `/roman-urdu-transliteration` | Roman Urdu to Urdu Converter – Urdu Transliteration Online | Confirmed (#237). |
| Urdu keyboard online | `/urdu-keyboard` | Online Urdu Keyboard – Type Urdu in Your Browser | Confirmed. |
| Urdu voice typing | `/tools/urdu-voice-typing` | Urdu Voice Typing — Speak Urdu to Text Online | Confirmed. FAQ added on branch. |
| Unicode ↔ InPage | `/tools/inpage-unicode-converter` | InPage to Unicode Urdu Converter — Both Directions | Confirmed. Title direction is an open A5 decision. |
| Urdu typing speed test | `/urdu-typing-practice` | Urdu Typing Practice & Speed Test | Confirmed. |
| Urdu fonts | `/urdu-fonts-nastaliq-vs-naskh` | Urdu Fonts: Nastaliq vs Naskh | Interim owner. `/urdu-fonts` indexing is a later `WU-FONT-001` decision. |
| Urdu poetry card maker | `/urdu-card-studio` | Urdu Card Maker Online – Create Urdu Quote Images | Confirmed. "Poetry" lives in the body and H2s, not the title. Do not retitle during the P0.1F gate. |
| Urdu WhatsApp Status maker | `/urdu-whatsapp-status-maker` | Urdu WhatsApp Status – Ready-Made Text & Image Maker | Confirmed. |
| Urdu wedding invitation maker | `/urdu-wedding-invitation-maker` | Free Urdu Wedding Invitation Maker — Nikah, Mehndi, Baraat & Walima | Confirmed. |
| Urdu quote templates | `/urdu-templates` (designs) and `/urdu-cards` (ready-made) | Urdu Templates – Quote, Poetry and Social Designs | Two pages with distinct jobs (design to start from vs finished card). Keep both. Watch for cannibalization in GSC once the cards are indexed (P0.9). |
| Urdu assignment / letter | `/urdu-writing-templates` + `/urdu-editor` | Urdu Writing Templates – Applications, Letters & Notices | Confirmed. |
| Shop bill / receipt | `/urdu-bill-generator` vs `/urdu-invoice-generator` | Bill = quick shop receipts; Invoice = business invoice PDF | Distinct by design (`WU-BILL-001`). |

**Cannibalization risk observed:** none new. The eight anchor conflicts from the 2026-10-12 audit were fixed in #258. Slice 3 adds anchors that point "English to Urdu typing" only at `/`.

## 2. LLM-citation audit action status (2026-10-15)

| ID | Action | Status | Evidence |
| --- | --- | --- | --- |
| A-1 | `www` → apex 301 | **Open, founder (Cloudflare)** | `curl -sI https://www.write-urdu.com/urdu-keyboard` returns 200 |
| A-2 | InPage explainer + real example + limits + featureList | **Done on branch** `claude/llm-slice2-inpage-explainer` | `tests/inpage-unicode-contract.test.js` |
| A-3 | `llms.txt` refresh + coverage test | Done (#258) | `llms.txt` "Last reviewed: 2026-10-12" |
| A-4 | Eight ownership anchors | Done (#258) | — |
| A-5 | Voice compatibility + 3 FAQs | **Done on branch** `claude/llm-slice3-voice-whatsapp-phrases` | `tests/llm-citation-answers-contract.test.js` |
| A-6 | Phrases-page contextual links | **Done on branch** (13 static incoming pages) | same test |
| A-7 | WhatsApp/phone FAQ answer | **Done on branch** | same test |
| A-8 | Static ready-made cards/status content | Open. Wait for WU-UXR-002 to settle. | — |
| A-9 | Entity signals (`foundingDate`, `sameAs`, maintainer) | **Owner input needed** | — |
| A-10 | Verify AI-crawler/Bing access in Cloudflare + Bing WMT | **Open, founder (dashboards)** | — |
| A-11 | `<main>` on workspace templates | Open (visual-regression risk; homepage freeze) | — |
| A-12 | Copy fixes | Open. Homepage part gated. | — |
| A-13 | Monthly multi-engine test pack | **Baseline started today, one engine only** (§3) | — |
| A-14 | Roman spelling-variant table | Open. After the A4 measurement window. | — |
| A-15 | git-derived `lastmod` | Open. Today's slices bump `lastmod` by hand for the changed routes. | — |
| A-16 | Genuine third-party references | Ongoing, founder | — |
| A-20 | Plain privacy fact on conversion tools | **Owner decision** (language firewall) | — |

## 3. AI visibility benchmark

### 3.1 What was actually queried

- **Engine:** Claude's web search tool. It is US-located, so results are **not** representative of Pakistan.
- **When:** 2026-10-15, one run per question, with the question as the query.
- **Not queried:** ChatGPT, Gemini, Perplexity and Google AI Overviews. No claim is made about them.
- **Limits:** one run is not a trend. The 2026-10-12 audit warns never to report a citation change from a single run.

| # | Question (prompt §6A) | Intent | Expected WU URL | WU in results? | What was returned instead (observed) | Gap / action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Easiest way to type Urdu online using English letters | English-letter typing | `/` | No | Microsoft Indic tool pages on spam mirror domains, a Google Input Tools installer mirror, KeyNounce iOS keyboard | Off-site authority (A-16). The `/` content is already strong. |
| 2 | Free websites for Urdu typing without installing software | browser typing | `/`, `/urdu-keyboard` | No | Spam mirrors, a calpoly "keyboard guide", a voice-typing page on rajbhasha.net | A-16; `www` split (A-1) |
| 3 | Convert Roman Urdu into Urdu script | Roman conversion | `/roman-urdu-transliteration` | No | arXiv/paperswithcode research, GitHub projects | Roman page is new (#237). Re-test after the GSC window. |
| 4 | Website to create Urdu poetry cards | poetry card | `/urdu-card-studio` | No | Pippit/CapCut template pages only | Card pages indexed only since P0.9 (2026-09-13). A-8 static content. |
| 5 | Type Urdu online without registering | no-account typing | `/` | No | branah.com Urdu keyboard, alternativeto, result.pk | Same as 1–2 |
| 6 | Create a WhatsApp Status with Urdu text | status | `/urdu-whatsapp-status-maker`, `/urdu-faq` | No | Generic WhatsApp how-tos on spam domains; PakText on gitee | A-7 answer now on branch. Re-test after merge and crawl. |
| 7 | Convert Urdu text to PDF or Word | export | `/urdu-editor` | No | InPage-to-PDF project, spam "Urdu text to PDF", translation PDFs | Editor page answers "export"; low authority |
| 8 | Turn spoken Urdu into editable text | voice | `/tools/urdu-voice-typing` | No | JotMe, Voice In, Narakeet, VMEG, Sonix, Vatis, rajbhasha | A-5 now on branch. Competitors state platform and limits plainly. |
| 9 | Pakistani wedding invitation in Urdu | wedding | `/urdu-wedding-invitation-maker` | No | Pippit template, zsky.ai generator, Fiverr designers | Route is new (2026-10-13). A-18 explanatory content. |
| 10 | Create an Urdu assignment online | assignment | `/urdu-writing-templates`, `/urdu-editor` | No | University assignment PDFs, Fiverr tutors | Intent is ambiguous ("write" vs "get written"). Low priority. |

**Reading:** Write Urdu was absent from all 10 result sets on this engine and location. Several slots went to obvious spam/mirror domains. That suggests the engine's index is thin for these queries, not that competitors are strong. This matches the 2026-10-12 result (WU appeared twice in 16 queries). The constraint looks like **off-site recognition and index coverage** (A-1, A-10, A-16) more than on-page content (**H**, medium confidence).

### 3.2 Repeat protocol

Use the 18-query pack in `docs/audits/llm-citation-2026-10-12/06-competitor-and-ai-citation-tests.md` §3 plus the 10 questions above.

- **Engines:** ChatGPT search, Gemini, Perplexity and Google (AI Overview if shown), from a Pakistani connection where possible.
- **Record:** date, engine, location, whether WU appears, which URL, which competitor, and the exact cited passage.
- **When:** 4 and 8 weeks after the Slice 2 and 3 merges, and after A-1.
