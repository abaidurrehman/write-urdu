# WU-INPUT-001 — Multimodal Urdu Input & Conversion Platform

**Product:** Write Urdu  
**Feature ID:** `WU-INPUT-001`  
**Status:** Planned / evidence-gated — founder-approved epic; no core-UI implementation while `WU-PLAT-002H` remains the roadmap gate  
**Priority:** P1 candidate after activation evidence review  
**Date:** 2026-09-11  
**Area:** Urdu acquisition / input / conversion / multimodal continuity  
**Evidence ledger:** `docs/WU-INPUT-001-API-EVIDENCE-2026-09-11.md`  
**Primary dependencies:** `WU-PLAT-002H`, `WU-SEO-CTR-001`, `WU-JOURNEY-001B`, `WU-VOICE-PLAT-001`, `WU-TOOLS-EXPANSION-001`, `WU-DOC-001`, `WU-AI-001`, `WU-ANALYTICS-001/003`

---

## 1. Executive decision

Create one evidence-driven **multimodal Urdu input and conversion platform** rather than a collection of unrelated API tools.

The durable product promise is:

> **However your Urdu starts — English letters, English meaning, speech, audio, an image, a scan or direct Urdu — Write Urdu should help you reach editable Urdu and then use it.**

The target journey is:

```text
Roman Urdu / direct Urdu / English meaning / live voice / audio / image / document
                                  ↓
                         editable Urdu state
                                  ↓
                        review / correct / format
                                  ↓
                  copy / export / share / publish / keep
```

This epic is a **coordination and architecture contract**. It must reuse existing owners instead of re-implementing them:

- Roman Urdu resilience belongs to `WU-JOURNEY-001B`;
- current English-letter → Urdu acquisition/CTR belongs to `WU-SEO-CTR-001` and the implemented `WU-SEO-ETU-001` history;
- live microphone input belongs to `WU-VOICE-PLAT-001`;
- current `/urdu-ocr` belongs to the shipped `WU-TOOLS-EXPANSION-003` implementation under the active tools umbrella;
- Urdu correction/rewrite belongs to `WU-AI-001`;
- file/document translation and scanned-document R&D belong to `WU-DOC-001` and its children.

`WU-INPUT-001` exists to connect those capabilities, identify the missing input modes, define common contracts, benchmark free providers, and prevent five separate mini-products from emerging.

---

## 2. Why this epic exists

The strongest opportunity is not generic AI. It is reducing the distance between **what a user already has** and **usable Urdu text**.

### 2.1 Search demand is concentrated around getting into Urdu

The September 2026 GSC review shows very large existing exposure around English-letter/English-to-Urdu intent. The 2026-09-04 export recorded mobile as approximately 67.3% of impressions and `english to urdu typing` as the dominant individual query opportunity, with high impressions but exceptionally weak CTR relative to its average position.

This epic does **not** assume every `english to urdu` search means semantic translation. It explicitly separates:

1. **transliteration** — Urdu sounds typed in Latin letters → Urdu script;
2. **translation** — English meaning → Urdu meaning.

That distinction is a product and SEO invariant.

### 2.2 Product usage validates an input → outcome model

The 2026-09-06 Product Pulse snapshot recorded:

- 5,323 product visits;
- 4,225 engaged visits (79.4% engagement);
- 268 copy completions;
- 593 exports;
- 85 shares;
- 71 prints;
- 88 handoffs;
- writer traffic split materially across desktop and mobile;
- measured Roman → Urdu writing summaries substantially ahead of direct Urdu/English mode summaries;
- once successful Urdu exists, users frequently continue to an outcome.

The durable lesson is:

> **Improve first Urdu success and continuity before inventing unrelated destinations.**

### 2.3 Existing product breadth is already sufficient

Write Urdu already has:

- Roman Urdu → Urdu typing;
- direct Urdu keyboard input;
- live Voice typing;
- local/browser OCR;
- Urdu Text Cleaner;
- Rich Editor;
- Word/PDF/image exports;
- Card/social creation;
- account drafts and public publishing.

The gap is not “more tools.” The gap is a coherent, measurable input platform with stronger conversion quality, missing audio/file paths, bounded server-assisted enhancement and continuity into the existing editor.

---

## 3. Product principles

### P1 — One destination, multiple inputs

Every supported input mode should converge on an editable Urdu state. Do not create isolated mini-apps that trap the result.

### P2 — Protect the proven Roman Urdu engine

No provider replacement, initialization rewrite or autocomplete change ships without the `WU-JOURNEY-001B` benchmark and rollback path.

### P3 — Local first where it works

Browser-local typing, direct input, deterministic cleanup and current local OCR remain preferred when quality is acceptable.

Server/API processing is an **explicit enhancement or capability gap**, not a reason to move all writing off-device.

### P4 — Translation is not transliteration

Never label semantic English → Urdu translation as “typing,” and never claim Roman Urdu transliteration translates English meaning.

### P5 — Do not make AI the product language

Users choose a job:

- Type with English letters
- Translate English
- Speak Urdu
- Upload audio
- Scan Urdu
- Fix Urdu

They should not need to choose a model/provider.

### P6 — No feature may depend on paid compute to keep core writing usable

When a free allowance, provider or model is unavailable:

- core typing still works;
- local/direct paths still work;
- server-enhanced controls fail gracefully;
- the user is never locked out of their text.

### P7 — Mobile-first input design

The majority of search impressions are mobile. New input capabilities must not recreate the pre-value command wall or push the writer below the accepted mobile viewport floors owned by `WU-PLAT-002H`.

---

## 4. Capability map and ownership

| Input/job | Current state | Canonical owner | `WU-INPUT-001` role |
| --- | --- | --- | --- |
| Roman Urdu → Urdu | Shipped / core | `/`, `WU-JOURNEY-001B`, `WU-SEO-CTR-001` | provider benchmark + common adapter only |
| Direct Urdu | Shipped | core writer / `/urdu-keyboard` | preserve + normalize common result handoff |
| English meaning → Urdu | Partial/planned | `WU-AI-001` bounded selected text; `WU-DOC-001` files | benchmark dedicated translation path; no route until evidence gate |
| Live Urdu voice | Shipped | `WU-VOICE-PLAT-001` | common result/handoff contract only |
| Uploaded audio/voice note → Urdu | Missing | **new gap under this epic** | benchmark + bounded proof after P0 gate |
| Image/screenshot → Urdu | Shipped local OCR | `/urdu-ocr`, historical `WU-TOOLS-EXPANSION-003` | enhanced OCR benchmark + optional server-assisted tier |
| Urdu correction/rewrite | Built behind gate | `WU-AI-001` | reuse only; no duplicate “AI cleaner” |
| PDF/document → Urdu | Planned | `WU-DOC-001` + A/B/C/D | integrate with common input/result contract later |
| Card/background discovery | Separate creation concern | Card Studio | **out of scope**; Pexels remains P2 creation candidate |
| Quran/religious source content | Separate verified-content concern | future content contract | **out of scope** for input platform |

If another spec owns the behavior, this epic must reference it rather than silently replacing it.

---

## 5. Canonical input contract

Implementation may evolve, but all new input adapters should converge conceptually on:

```ts
type UrduInputMode =
  | "roman"
  | "direct"
  | "english_translation"
  | "live_voice"
  | "audio_upload"
  | "image_ocr"
  | "document";

type UrduInputResult = {
  version: 1;
  mode: UrduInputMode;
  text: string;
  source?: {
    local: boolean;
    providerAlias?: string;
  };
  quality?: {
    needsReview?: boolean;
    confidenceAvailable?: boolean;
  };
};
```

This is **not** permission to persist input content.

The owning workspace should receive the result through the existing continuity/handoff architecture, not via query strings containing private text.

---

## 6. Provider strategy

Provider facts and free allowances are dated evidence and live in the companion evidence ledger. They must be revalidated immediately before implementation or release.

### 6.1 Microsoft Translator — benchmark candidate

Use as a benchmark for:

- Urdu Arabic-script ↔ Latin-script transliteration;
- English → Urdu semantic translation;
- possible fallback where its quality and terms beat the current path.

Do **not** replace the current Roman Urdu suggestion engine merely because Microsoft supports transliteration. Pakistani shorthand, code-switching and candidate-choice behavior must win a real fixture benchmark first.

### 6.2 Cloudflare Workers AI — preferred experiment control plane

Write Urdu is already Cloudflare-native. Current candidates include:

- IndicTrans2 for English → Urdu translation;
- Whisper family for uploaded audio transcription;
- Gemma 4 for enhanced OCR / OCR repair experiments;
- approved text model(s) under `WU-AI-001` for explicit correction actions.

The Workers AI free allocation is shared capacity, not an entitlement per feature. This epic therefore requires an account-level budget view and feature quotas before production use.

### 6.3 Google Cloud Vision — OCR quality challenger

Google Vision is a benchmark/fallback candidate for printed Urdu OCR because Urdu is present in the OCR language support and the first usage tier is currently free up to a bounded monthly amount.

Do not make claims about Nastaliq or handwriting quality from provider language support alone. Benchmark real Pakistani material.

### 6.4 Provider-neutral rule

No user-facing behavior may depend on a hard-coded provider SDK in presentation code.

Use a server-side adapter boundary for remote processing so a provider can be disabled or changed without rebuilding the product journey.

---

## 7. Free-first budget contract

The default release objective for this epic is **$0 incremental variable cost at current Write Urdu traffic**.

That is a budget target, not a promise that every upstream provider will remain free.

Required controls:

1. feature-level daily/monthly counters;
2. account-level Workers AI neuron headroom measurement;
3. soft caps below external hard limits;
4. per-feature kill switches;
5. graceful local/manual fallback;
6. no silent transition from free to billable usage;
7. founder approval before enabling material paid overage.

Initial planning ceilings:

- Workers AI: reserve capacity rather than assuming the full 10,000-neuron daily allocation belongs to Write Urdu;
- Microsoft F0: stay below the current monthly free character allowance and request limits;
- Google Vision: keep a safety margin below the free monthly OCR unit allowance;
- uploaded audio: enforce duration/file-size limits before inference.

Provider economics must be recalculated from current official docs during each release gate.

---

## 8. Privacy and trust contract

Different input modes have different privacy boundaries. Do not collapse them into one generic “everything stays private” claim.

### 8.1 Local modes

When processing is local/browser-only, say so accurately.

### 8.2 Remote enhancement

Before the first remote image/audio/document or AI-text request, explain the actual boundary in simple product language.

For example:

> **Enhanced recognition**  
> This file needs secure server processing to improve recognition. It is sent only when you choose this option.

Exact copy is release-reviewed and provider-specific.

### 8.3 Data minimization

Do not send:

- account profile data unless required by the owning authenticated workflow;
- unrelated document text;
- analytics identifiers as prompt context;
- filenames unless technically necessary and approved;
- writing content to Product Pulse.

### 8.4 Storage

Default remote processing contract:

- process;
- return result;
- do not persist the user payload in application storage;
- disable prompt/payload logging where the selected gateway/provider supports it;
- verify provider retention/training behavior before release.

### 8.5 Age/provider restrictions

Do not invent one global age rule for every API.

- AI rewriting inherits the approved `WU-AI-001` gate and provider review;
- translation/OCR/speech providers receive their own current terms review;
- if a provider's terms are incompatible with the general Write Urdu audience, do not use that provider in production.

---

## 9. Benchmark programme

No provider decision is made from marketing claims.

### 9.1 Roman Urdu benchmark — reuse `WU-JOURNEY-001B`

Extend the existing fixture programme, do not duplicate it.

Required coverage:

- normal Roman Urdu;
- Pakistani shorthand (`mjhy`, `nhi`, `krna`, `hy`);
- spelling variants (`main`, `mein`, `may`);
- names and Pakistani place names;
- numbers/dates;
- English/Urdu code-switching;
- WhatsApp-style punctuation/casing;
- long passage formatting;
- recovery/alternative candidate behavior.

Minimum release corpus target: **300–500 fixtures**.

Compare current provider/engine against Microsoft transliteration only after the fixture contract is stable.

### 9.2 English → Urdu translation benchmark

Minimum target: **200 curated inputs**, including:

- short everyday messages;
- formal requests/applications;
- social messages;
- work/business language;
- mixed proper nouns;
- ambiguous pronouns/gender;
- idioms;
- paragraph-length prose.

Compare at least:

- Cloudflare IndicTrans2;
- Microsoft Translator;
- existing approved AI translation path if applicable.

Human Urdu review scores:

- meaning preservation;
- naturalness;
- grammar;
- proper-name handling;
- hallucination/addition;
- latency.

### 9.3 OCR benchmark

Minimum **100 real images**:

- clean Naskh;
- Nastaliq;
- newspaper/magazine;
- social/WhatsApp screenshots;
- poetry cards;
- phone photographs;
- low contrast;
- rotated text;
- mixed Urdu/English;
- handwriting.

Compare:

- current local OCR;
- Gemma 4 enhanced path;
- Google Vision;
- any later challenger only if it has a clear cost/privacy reason to enter.

Metrics:

- character error rate;
- word error rate;
- reading-order preservation;
- mixed-script preservation;
- latency;
- cost/quota units.

Do not claim handwriting support merely because a general multimodal model advertises handwriting recognition.

### 9.4 Uploaded audio benchmark

Minimum **100 clips** across:

- male/female speakers;
- Pakistani regional accents where available;
- quiet/noisy environments;
- short WhatsApp-style notes;
- longer dictation;
- Urdu + English code-switching;
- names/numbers;
- punctuation expectation.

Compare Whisper candidates on word-error rate, intelligibility, code-switching, latency and neuron consumption.

---

## 10. UX model

This epic does **not** authorize a new homepage command wall.

The future experience is progressive:

### Before first value

Keep the primary acquisition task obvious. Any input switcher must remain compact and satisfy the current mobile first-viewport contract.

### After a user chooses a different input job

Show only the controls needed for that input.

Examples:

- Roman Urdu → existing writer behavior;
- Translate English → English input + Urdu result;
- Upload audio → file picker + transcript result;
- Scan Urdu → current OCR/local path + optional enhanced recognition;
- Fix Urdu → existing AI-writing preview contract.

### After Urdu exists

Converge on existing high-value outcomes:

- Copy;
- continue in Rich Editor;
- Word/PDF export where appropriate;
- share/publish only under existing CTA arbitration rules.

Do not expose provider/model selectors to normal users.

---

## 11. SEO and route ownership

### 11.1 Protect established owners

The homepage remains governed by the existing English-to-Urdu typing/query ownership contracts. This epic does not automatically create a second Roman-Urdu doorway.

### 11.2 Candidate route: semantic English → Urdu translation

A dedicated route such as `/english-to-urdu-translator` is **not approved by this epic alone**.

It becomes eligible only when:

1. GSC/external evidence proves distinct semantic-translation intent;
2. the translation benchmark passes;
3. one canonical route owner is assigned;
4. the page provides a real task-specific experience rather than a duplicate textarea;
5. `WU-SEO-CTR-001` confirms it will not cannibalize typing ownership.

### 11.3 Existing OCR route

Enhance `/urdu-ocr` rather than creating `image-to-urdu`, `urdu-image-to-text`, `photo-to-urdu`, etc. as thin duplicate owner pages.

Support pages may explain variants of the task, but one tool route should own the action.

### 11.4 Candidate audio route

An `/audio-to-urdu-text` route is evidence-gated behind product quality/usage. Build the capability before building an acquisition programme around it.

---

## 12. Telemetry contract

Use aggregate, content-free telemetry.

Allowed event dimensions may include:

- input mode;
- route;
- device class;
- started;
- succeeded;
- failed;
- failure category;
- duration bucket;
- size bucket;
- enhanced/local mode;
- provider alias where operationally needed;
- quota/budget units;
- copied/exported/continued outcome.

Never store in analytics:

- typed/transliterated text;
- translated text;
- OCR result;
- audio transcript;
- image/document content;
- filename;
- prompt/response body.

Primary funnel:

```text
input offered
→ input selected
→ processing started
→ first usable Urdu
→ reviewed/edited
→ first outcome
```

The primary metric is **successful usable Urdu and continuation**, not API invocation count.

---

## 13. Slices

### Slice 0 — Governance + benchmark foundation

**May proceed as planning/fixtures without changing core UI.**

- adopt this epic into registry/backlog;
- reconcile overlap with existing specs;
- extend `WU-JOURNEY-001B` fixtures rather than creating another Roman corpus;
- create translation/OCR/audio benchmark harnesses and fixture rules;
- record current provider terms/pricing/retention evidence;
- establish feature kill-switch and budget requirements.

**Exit:** benchmarks can run without a production UI change.

### Slice A — Roman Urdu quality challenge

**Owner:** `WU-JOURNEY-001B` with this epic as provider/economics coordinator.

- benchmark current engine vs Microsoft transliteration;
- score shorthand, code-switching, names and alternatives;
- do not change production provider unless challenger materially wins and rollback is ready.

**Exit:** Keep / hybrid / replace decision recorded with evidence.

### Slice B — English → Urdu semantic translation proof

- benchmark IndicTrans2 vs Microsoft and any approved incumbent;
- prove translation is materially different from current transliteration UX;
- define provider-neutral server adapter;
- validate privacy/terms and quota envelope;
- no SEO route until quality passes.

**Exit:** provider decision + human quality threshold + go/no-go route decision.

### Slice C — Enhanced Urdu OCR

- preserve local OCR as default/private path;
- benchmark Gemma 4 vs Google Vision vs local baseline;
- add explicit enhanced-processing mode only if a remote path materially improves difficult cases;
- keep `/urdu-ocr` as the owner route.

**Exit:** measurable quality gain on named image categories without breaking local fallback.

### Slice D — Uploaded audio / voice-note → Urdu proof

- accept a bounded set of audio formats;
- enforce duration and size limits before upload;
- benchmark Whisper path;
- return transcript into editable Urdu continuity;
- do not duplicate live microphone Voice.

**Exit:** acceptable Urdu/code-switching quality and free-budget fit at real measured usage.

### Slice E — Common input adapter + continuation

**Blocked until `WU-PLAT-002H` evidence review permits core journey work.**

- converge successful results on existing writer/handoff architecture;
- keep input mode provenance only where operationally useful;
- preserve mobile first-viewport and CTA arbitration contracts;
- remove/demote any duplicated controls rather than adding another command layer.

**Exit:** multiple inputs feed the same editable/outcome journey safely.

### Slice F — Evidence-gated acquisition release

Only after product proof:

- improve existing route copy/schema/internal links;
- consider one semantic-translation owner route;
- consider audio route only if usage/search evidence supports it;
- no doorway variants;
- measure CTR → first usable Urdu → outcome, not rankings alone.

### Slice G — Cost, reliability and provider resilience

- dashboard quota/headroom by feature;
- rate limits/abuse protection;
- failover/fallback rules;
- provider kill switches;
- no-payload-log verification;
- monthly cost ceiling and founder approval path;
- update dated provider evidence.

---

## 14. Release gates

A server-assisted input capability cannot ship publicly until all applicable gates pass.

### Quality

- benchmark corpus exists;
- minimum quality threshold defined before seeing final results;
- human Urdu review completed for language-quality features;
- failure modes are documented and user-visible claims stay narrower than evidence.

### Privacy

- provider terms/retention/training behavior reviewed;
- server credentials never enter browser code;
- application does not persist user payload by default;
- analytics contain no writing/audio/image content;
- remote-processing disclosure is accurate.

### Cost

- free allowance/headroom verified from current provider docs and actual account state;
- rate limit + feature quota exists;
- no silent paid overage;
- kill switch tested.

### UX

- no command-wall regression;
- mobile viewport acceptance preserved;
- result returns to editable Urdu state;
- fallback is understandable;
- private content is not placed in URL/history.

### SEO

- one route owner per task;
- canonical/internal-link/schema contract is explicit;
- no duplicate keyword doorway pages;
- acquisition claims describe shipped capability exactly.

---

## 15. Success metrics

Evaluate each input mode separately and then at platform level.

### Core

- input selected → first usable Urdu success rate;
- median time to first usable Urdu;
- first outcome after success;
- repeat input usage where privacy-safe to measure;
- failure rate by bounded category.

### Search

- impressions/clicks/CTR for canonical intent owner;
- landing → processing start;
- landing → first usable Urdu;
- no cannibalization of established typing owner.

### Quality

- transliteration acceptance/fixture pass rate;
- translation human score;
- OCR CER/WER;
- audio WER / human intelligibility score.

### Economics

- provider units per successful result;
- free-allocation consumption;
- projected monthly variable cost at 2× and 5× usage;
- percentage of sessions completing via local/free fallback.

Do not call the epic successful merely because new API calls exist.

---

## 16. Explicit non-goals

This epic does not authorize:

- a generic Urdu chatbot;
- autonomous homework/essay generation;
- a new standalone AI editor;
- replacing the Roman Urdu engine without benchmark evidence;
- sending text on every keystroke to a paid/external model;
- uploading private files automatically;
- a global homepage redesign while `WU-PLAT-002H` is open;
- multiple SEO routes for the same converter;
- a Pexels background programme;
- a Quran reader/religious-content platform;
- generic image generation;
- storing user writing/transcripts for model training;
- paid overage without explicit founder approval.

---

## 17. Relationship to current P0 freeze

Founder approval creates this **planned epic**, not a new P0 exception.

Allowed now:

- spec/research reconciliation;
- benchmark fixtures/harnesses that do not change active writer UI;
- provider terms/cost research;
- isolated prototypes that cannot affect production behavior.

Blocked until the `WU-PLAT-002H` post-change review materially clears the breadth freeze:

- new homepage input chooser architecture;
- new major public acquisition route;
- changes to Roman provider behavior;
- server-assisted OCR/audio controls on high-traffic writer surfaces;
- cross-surface input-platform promotion.

If new GSC/Product Pulse evidence materially changes priority, update `specs/BACKLOG.md` before implementation.

---

## 18. Recommended execution order

After the current P0 gate:

1. **Roman benchmark closeout** — highest existing traffic/behavior fit, lowest speculative breadth;
2. **semantic translation benchmark** — strongest adjacent search opportunity;
3. **enhanced OCR benchmark** — existing route and real usage, improve a known hard case;
4. **uploaded audio proof** — extends validated Voice behavior without replacing live Voice;
5. **common input/continuation adapter** — only after individual capabilities prove value;
6. **SEO expansion** — only for capabilities that pass product-quality gates;
7. **Pexels/creative enhancements or verified religious-content APIs** — separate later initiatives, not part of this epic.

This keeps Write Urdu focused on one strategic outcome:

> **Get the user to useful Urdu faster, then help them complete the job they came to do.**
