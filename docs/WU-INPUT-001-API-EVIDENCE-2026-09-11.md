# WU-INPUT-001 — API, Traffic & Free-Tier Evidence Ledger

**Date:** 2026-09-11  
**Purpose:** Dated evidence supporting `specs/WU-INPUT-001-multimodal-urdu-input-conversion-platform.md`  
**Rule:** Provider/model/pricing facts are volatile. Revalidate official sources immediately before implementation or release.

---

## 1. First-party Write Urdu evidence

### 1.1 Search evidence

Primary source set reviewed for this epic:

- `write-urdu.com-Performance-on-Search-2026-09-04.zip`
- prior exports from 2026-08-19, 2026-08-24, 2026-08-30 and 2026-09-02 for trend/context

Key decision signals from the September review:

- `english to urdu typing` is the dominant individual acquisition opportunity and has unusually low CTR relative to its average position;
- mobile represents roughly two thirds of search impressions in the 2026-09-04 export;
- adjacent demand exists for Roman Urdu, Urdu keyboard, Urdu writing, translation-like English→Urdu searches, document/export jobs, OCR and Voice;
- existing English-letter → Urdu ownership must therefore be protected while testing adjacent input modes.

This ledger intentionally does not treat every query containing `english to urdu` as semantic translation. The benchmark/product contract must distinguish transliteration from translation.

### 1.2 Product Pulse evidence

Primary source:

- `998f09fc727bf08971874c72027f3be675cb0fba.pdf` — Product Pulse snapshot, latest event 2026-09-06

Recorded headline values:

- product visits: 5,323;
- engaged visits: 4,225;
- engagement rate: 79.4%;
- copy completions: 268;
- exports completed: 593;
- shares: 85;
- prints: 71;
- handoffs: 88;
- Roman → Urdu writing summaries: 460;
- Direct Urdu / other measured summaries: 144;
- product entries from Google Search: 2,956;
- desktop product visits: 2,950;
- mobile product visits: 2,237;
- `/urdu-ocr` recorded site-entry traffic;
- Voice produced a meaningful successful-text cohort but still has browser/device activation constraints.

Interpretation:

> The strongest common job is not “use an API.” It is “reach usable Urdu and then copy/export/share/continue.”

---

## 2. Microsoft Translator

### 2.1 Urdu transliteration support

Official language support currently lists:

- language: Urdu (`ur`);
- Arabic script (`Arab`) ↔ Latin script (`Latn`);
- bidirectional transliteration.

Official source:

- https://learn.microsoft.com/azure/ai-services/translator/language-support

Planning consequence:

Microsoft Translator is a credible challenger for the Roman Urdu quality benchmark, but support alone does not prove superiority on Pakistani shorthand, code-switching or alternative-candidate UX.

### 2.2 Free tier

Current Azure Translator F0 pricing states:

- 2 million characters/month free;
- standard text translation, language detection, bilingual dictionary and transliteration are included in the free tier combination.

Official source:

- https://azure.microsoft.com/pricing/details/translator/

Important distinction:

- the **commercial free allowance** is 2 million characters/month;
- Microsoft also documents an F0 **throughput/service limit** of 2 million characters/hour.

Do not confuse the hourly service ceiling with the monthly free allowance.

### 2.3 Request limits

Current Translator service limits list:

- transliterate: maximum 5,000 characters/request;
- up to 10 array elements for transliteration;
- standard Translate has a larger per-request character ceiling.

Official source:

- https://learn.microsoft.com/azure/ai-services/translator/service-limits

Planning rule:

Do not call transliteration on every keystroke merely because the service limit permits it. Natural word/sentence/paste boundaries are more compatible with cost, privacy and latency control.

---

## 3. Cloudflare Workers AI

### 3.1 Free allocation

Current Workers AI pricing states:

- Workers Free and Workers Paid receive 10,000 neurons/day at no charge;
- usage resets daily at 00:00 UTC;
- on Workers Paid, usage above the free allocation is billed by model pricing.

Official source:

- https://developers.cloudflare.com/workers-ai/platform/pricing/

Epic consequence:

This is shared infrastructure capacity. `WU-INPUT-001` must inspect actual account-level usage/headroom before assigning a production feature budget.

### 3.2 IndicTrans2 English → Indic translation

Current Cloudflare model:

- `@cf/ai4bharat/indictrans2-en-indic-1B`
- Urdu target language is explicitly available as `urd_Arab`;
- current pricing is approximately $0.34/M input tokens and $0.34/M output tokens;
- current neuron equivalence in Workers AI pricing is 31,050 neurons/M input tokens and 31,050 neurons/M output tokens.

Official sources:

- https://developers.cloudflare.com/workers-ai/models/indictrans2-en-indic-1B/
- https://developers.cloudflare.com/workers-ai/platform/pricing/

Illustrative planning math only:

- 100 input + 100 output tokens ≈ 6.21 neurons;
- if the entire 10,000-neuron daily pool were available, that would be about 1,610 such requests/day;
- the epic explicitly forbids assuming the entire account allocation belongs to this feature.

Quality remains unproven for Write Urdu until the human-reviewed Urdu benchmark passes.

### 3.3 Whisper Large V3 Turbo

Current Workers AI pricing lists:

- `@cf/openai/whisper-large-v3-turbo`;
- approximately 46.63 neurons/audio minute.

Official source:

- https://developers.cloudflare.com/workers-ai/platform/pricing/

Illustrative ceiling:

- 10,000 / 46.63 ≈ 214 audio minutes/day if the whole free allocation were available;
- in production use a substantially lower feature cap because the allocation is shared.

The product opportunity is uploaded audio/voice-note transcription, not replacing the existing live browser Voice path.

### 3.4 Gemma 4

Cloudflare currently documents Gemma 4 on Workers AI with:

- vision understanding;
- document/PDF parsing;
- multilingual OCR;
- handwriting recognition;
- broad multilingual pretraining/support.

Cloudflare also currently lists Gemma 4 among models that remain available on the Workers Free plan after the July 2026 model-access change.

Official sources:

- https://developers.cloudflare.com/changelog/post/2026-04-04-gemma-4-26b-a4b-workers-ai/
- https://developers.cloudflare.com/changelog/post/2026-07-28-models-require-workers-paid/

Critical caveat:

General multilingual OCR/handwriting support is **not evidence of Urdu Nastaliq or Pakistani handwriting accuracy**. Only a real benchmark can justify those claims.

---

## 4. Google Cloud Vision OCR

### 4.1 Urdu language support

Google Cloud Vision OCR currently lists Urdu:

- Urdu (`ur`);
- Arabic script (`Arab`).

Official source:

- https://cloud.google.com/vision/docs/languages

Treat this as eligibility for testing, not a quality guarantee for Nastaliq, newspaper layouts or handwriting.

### 4.2 Free tier

Current Cloud Vision pricing states:

- first 1,000 units/month are free;
- Text Detection and Document Text Detection are included in that tier;
- for multi-page files such as PDFs, each page is treated as an image/billable unit.

Official source:

- https://cloud.google.com/vision/pricing

Planning consequence:

- benchmark use is easily compatible with the free tier;
- production should use a soft cap below 1,000 units/month;
- PDF OCR belongs under the document programme and needs page-count limits/budgeting.

---

## 5. Pexels — deliberately not part of the core epic

Pexels currently documents:

- API is free;
- default rate limit: 200 requests/hour;
- default monthly limit: 20,000 requests/month;
- eligible compliant apps may request higher/unlimited limits for free;
- attribution/linking requirements apply;
- the API cannot be used to simply recreate Pexels core functionality.

Official sources:

- https://www.pexels.com/api/documentation/
- https://help.pexels.com/hc/en-us/articles/47677890260761-Is-the-Pexels-API-free-to-use

Decision:

Potential future Card Studio background search is valid, but it is a **creation/retention** feature. It does not belong in the multimodal input epic and should not displace the current activation/Urdu-input priorities.

---

## 6. Quran/religious-content APIs — deliberately separate

The prior research identified Quran Foundation as a credible source of authoritative Quran data, translations/recitations/search subject to its developer terms.

Decision for this epic:

- religious phrase/Quran content is not an input-platform capability;
- do not generate authoritative Quran text using an LLM;
- if Write Urdu builds a dedicated common-phrases/verified religious-content experience, give it its own source-integrity contract.

Reference:

- https://api-docs.quran.com/

---

## 7. Provider selection rules

A provider enters production only when all of these are true:

1. official terms and current pricing have been revalidated;
2. data retention/training behavior is compatible with Write Urdu's audience and disclosures;
3. benchmark quality passes a predeclared threshold;
4. cost fits a bounded feature quota;
5. provider failure leaves a usable fallback;
6. credentials remain server-side;
7. telemetry can remain content-free;
8. claims in UI/SEO do not exceed measured capability.

A provider can be removed even after launch if terms, pricing, quality or availability change.

---

## 8. Benchmark decision ledger to fill during Slice 0–D

| Capability | Incumbent/baseline | Challenger(s) | Metric | Decision |
| --- | --- | --- | --- | --- |
| Roman Urdu → Urdu | current Write Urdu engine/provider | Microsoft Translator | fixture pass + human acceptance + alternatives + latency | Pending |
| English → Urdu meaning | approved existing path if any | IndicTrans2, Microsoft Translator | meaning/naturalness/error/addition/latency | Pending |
| Image → Urdu | current local OCR | Gemma 4, Google Vision | CER/WER/layout/mixed script/latency | Pending |
| Audio → Urdu | existing live Voice is behavioral reference, not file baseline | Whisper Large V3 Turbo and approved challenger | WER/intelligibility/code-switching/latency/cost | Pending |
| Urdu correction | `WU-AI-001` benchmark | governed by that epic | existing AI-writing acceptance | Reuse owner |
| PDF/document | `WU-DOC-001` | governed by that programme | ingestion/translation/layout acceptance | Reuse owner |

---

## 9. Revalidation checklist before implementation

Before each provider-backed slice moves beyond benchmark/prototype:

- [ ] official pricing checked on current date;
- [ ] free-tier account eligibility checked;
- [ ] current model is still available to the active Workers plan;
- [ ] region/data-location requirements reviewed;
- [ ] provider retention/training terms recorded;
- [ ] age/minor restrictions reviewed;
- [ ] commercial use allowed;
- [ ] current hard request/file/token/page limits recorded;
- [ ] application soft cap defined below hard limit;
- [ ] kill switch implemented/tested;
- [ ] fallback copy reviewed;
- [ ] benchmark result linked in the epic/implementation PR.

This ledger is evidence, not implementation permission. `specs/BACKLOG.md` still owns roadmap priority.
