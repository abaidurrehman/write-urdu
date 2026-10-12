# 05 — Content and authority gaps

Scope: what an AI retrieval system would need to **quote** (informational citation) or to **recommend with confidence** (tool recommendation), compared with what the static HTML currently provides. Only gaps verified against the repo are listed; content that already exists is called out so it is not rewritten.

Legend: **O** = observation (verified) · **H** = hypothesis · **R** = recommendation.

---

## 1. Already strong — do not rewrite

| Asset | Why it is citation-worthy | Where |
| --- | --- | --- |
| Translation vs transliteration boundary | Short, quotable, consistent on four surfaces: "It does not translate an English sentence into Urdu…" | `/`, `/roman-urdu-transliteration`, `/urdu-faq`, `llms.txt` (test-enforced) |
| Concrete Roman → Urdu examples | `mera khayal hai → میرا خیال ہے`, `mera naam ahmad hai → میرا نام احمد ہے`, `khairiyat/kheriyat se hain → خیریت سے ہیں` (stated as reproduced by the production engine) | `/`, `/roman-urdu-transliteration` |
| InPage capability limits | ".inp files contain layout… this tool handles pasted text only"; unsupported characters kept visible | `/tools/inpage-unicode-converter` |
| Phonetic keyboard reference | CRULP-style mapping, Shift-key letters, links to CLE | `/urdu-keyboard`, `/urdu-typing-practice` |
| Phrase spellings with variants | "Assalamualaikum, also searched as Assalam o Alaikum and Assalamu Alaikum, is written: السلام علیکم" (+ reply form, Mashallah, Inshallah, Kalma, Jumma/Eid Mubarak…) | `/urdu-phrases-copy-paste` |
| Card output sizes and fonts | 1080×1080, 1280×720, 1200×630, 1080×1920; Noto Nastaliq Urdu / Noto Naskh Arabic | `/urdu-card-studio` |
| Honest usage evidence | Measured weekly numbers vs labelled lifetime *estimate*; "not a historical counter" | `/10-years-of-write-urdu` |
| Privacy specifics | Google transliteration provider disclosed; voice recognition by browser/platform; local Card Studio processing | `/write-urdu-privacy` |

These are exactly the "concise explanatory passages" AI answers reuse. The problem is mostly **coverage and placement**, not quality.

---

## 2. Missing or weak answer passages (by page)

### 2.1 InPage ↔ Unicode (`/tools/inpage-unicode-converter`) — highest value

- **O:** 82,953 impressions / 450 clicks (0.54%) in 3 months; `unicode to inpage` 38,135 impressions at 0.22%; `inpage to unicode` 16,062 at 0.97%.
- **O:** The page never says what "InPage text" *is* or why pasted InPage text looks like random punctuation. The repo already has a verified explanation in `docs/WU-INPAGE-MAPPING-RESEARCH-2026-08-17.md` §2: InPage v1/v2 text is a `U+0004` prefix + an 8-bit index, so it appears as `‚ ƒ „ … Š Œ Ž` etc. when pasted into a Unicode editor. The engine profile is literally `inpage-v1v2-clipboard-2026-08-17`.
- **O:** The worked example exists only behind the JS "Load example" button (`js/inpage-unicode-converter.js:196`: `یہ ایک اردو متن ہے۔ ۱۲۳`). Running the shipped core on `یہ ایک اردو متن ہے۔` gives 19 converted characters, 0 unsupported, round-trips exactly.
- **O:** FAQ "Does WriteUrdu upload my text?" answers "Your pasted text is used for the conversion. See Privacy…" — while the code converts entirely in the browser (no network call in the converter; telemetry sends only a handoff route name). The vague wording is an **intentional** product-language decision enforced by `scripts/public-language-firewall.js` (privacy/processing details belong on `/write-urdu-privacy`; "processed in your browser"-style phrases fail `language:check` elsewhere).
- **O:** The same firewall bans implementation vocabulary such as "mapping profile: inpage-…" and "preferred legacy byte", so the explainer must be written in user language (no byte/prefix/profile terms).
- **O:** `featureList: []` in the WebApplication JSON-LD.
- **R (quotable additions, ~150–200 words total, below the tool):**
  1. *Why does InPage text look like symbols?* — 2 user-language sentences derived from the research doc: older InPage versions do not save Urdu as standard Unicode letters, so text pasted into Word, WhatsApp or a browser shows up as symbols such as `‚ ƒ „ Ž` instead of Urdu; converting it to Unicode makes it readable and searchable everywhere. State the supported scope as "text copied from older InPage versions" — do not claim InPage 3 support unless tested, and do not use byte/prefix/profile vocabulary (firewall).
  2. *Example* — a static two-column figure: Unicode `یہ ایک اردو متن ہے۔` ⇄ "pasted older InPage text appears as symbols such as `¤ ¦ Ž ‹ ¢`" (glyphs only, never raw control characters; label it illustrative).
  3. *Compatibility & limits* — a 4-row list: pasted text ✅ · `.inp` file ❌ · layout/fonts ❌ · unknown characters kept and listed ✅.
  4. *Privacy FAQ* — **owner decision, not part of the P1 slice** (see file 07 A-20). The current vague answer is enforced on purpose by the language firewall.
  5. *How to paste into InPage* — one step for the Unicode→InPage direction (the larger query). **Must be tested in a real InPage install before publishing** (H: users paste into InPage via Ctrl+V; unverified).
- Keep title/H1 direction decisions inside `WU-SEO-CTR-001A` A5 — this content work is direction-neutral.

### 2.2 Urdu Voice Typing (`/tools/urdu-voice-typing`)

- **O:** No compatibility, permission or troubleshooting text on the owner page; "Voice typing availability and processing depend on your browser or device" is the only statement. `WU-GROWTH-003` §7 already asks for "short mobile/browser compatibility guidance" and "microphone permission recovery" (modules 3–4) — not shipped.
- **O:** Implementation facts that can be stated truthfully: browser Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`), language `ur-PK`, starts only after pressing Start, Write Urdu does not record or send audio itself (privacy page).
- **R:** Add a "Works best in…" passage limited to **what `docs/VOICE-MOBILE-DEVICE-CHECKLIST.md` has actually signed off** (that template is currently empty — fill it first, or phrase generically: "works in browsers that provide speech recognition, such as Chrome on Android and desktop; if your browser lacks it, the page tells you and you can type instead"). Add 3 visible FAQs: microphone blocked → how to re-allow (generic browser steps), "Does voice typing start on its own?" (no — only after you press Start; link to Privacy for how speech recognition is handled, per the language firewall), "Voice typing vs English-letter typing". Add FAQPage schema only for those visible questions.

### 2.3 Using Urdu on a phone / in WhatsApp (no owner)

- **O:** GSC shows real, unserved demand: `urdu mein kaise likhate hain` 533 impressions at 0.19%; `whatsapp in urdu writing` 127 at 0%; `how to write urdu in whatsapp` 84 at 1.19%.
- **O:** `/urdu-faq` only says "tools are designed for phones"; voice and status pages show a "Send to WhatsApp" button but no explanation. `specs/BACKLOG.md` P2.3 already lists "Urdu in WhatsApp/Word/Docs" as an evidence-gated answer-ready candidate — the GSC rows above are that evidence.
- **R:** One FAQ entry (en + ur sibling) — not a new page — answering: (a) type in Write Urdu with English letters or voice, then **Copy** / **Send to WhatsApp**; (b) or add an Urdu keyboard in your phone settings (link to Android/iOS vendor help rather than restating steps); (c) why mixed Urdu/English messages may look reversed (RTL) and how the Text Cleaner helps. Include one natural Roman-Urdu sentence ("Mobile par Urdu likhne ka tareeqa…") only if it reads naturally to the owner.

### 2.4 Ready-made content invisible without JS

- **O:** `/urdu-whatsapp-status-maker` and `/urdu-cards` render their libraries (157 cards; status categories morning/Jumma/dua/love/friendship/poetry/night) only through JS from `js/urdu-cards-data.js`. Raw HTML has empty grid containers.
- **H:** AI fetchers that do not execute JS (most retrieval fetchers) cannot quote a single ready-made status/dua line from Write Urdu, so they cite text sources and recommend apps instead.
- **R:** Build-time static rendering of a **capped** subset (e.g. 3 per category) via the existing `sync-static-collection-content.js` pattern (`WU-SEO-CRAWL-001D`), progressively enhanced by the JS grid. Do not publish all 157 as separate URLs.

### 2.5 Wedding invitation maker

- **O:** ~61 words of static main content; meta promises Nikah/Mehndi/Baraat/Walima but the page explains none of them.
- **R (P4, inside WU-SHAADI-001):** one sentence per event + one real wording example each.

### 2.6 Smaller copy defects

- Card Studio: "Your background stays available while you work while you design." (duplicated clause).
- Homepage how-to list mixes 6 instructions with 4 navigation lines; extractors may quote the navigation lines as steps. **R (optional):** move the last four bullets (alphabet/editor/no-software/FAQ) out of the `<ul>` into a sentence below it.
- The word **shayari** appears nowhere in the photo guide, Card Studio or phrases page static copy, although it is the dominant Pakistani term for poetry posts. **R:** use it once, naturally, in the photo guide lede (no keyword stuffing).

---

## 3. Urdu-specific retrieval issues

| Issue | Observation | Effect | Recommendation |
| --- | --- | --- | --- |
| "English to Urdu" ambiguity | 164,935 impressions at 0.08% for `english to urdu typing`; bare variants behave like translation queries (`WU-SEO-INTENT-001` §2.1) | LLMs asked to *translate* should not recommend WU; asked to *type* they should. The distinction is on-page but sits in editor helper text rather than the lede. | Keep homepage frozen per A7. In llms.txt keep the disclaimer (already test-enforced). |
| Anchor ownership drift | "English to Urdu typing guide" → Roman page (5 places); "Roman Urdu typing" → homepage (4 places) | Two routes look interchangeable to link-graph-based retrieval | Fix 8 anchors (file 07 A-4). |
| Roman spelling variation | Variants shown for one phrase only (`khairiyat/kheriyat`) | LLMs answering "why did my word come out wrong?" have little to quote | Add a 4–6 row variant table using **only** engine-reproduced outputs (spec requirement already in `WU-SEO-CTR-001A` §6.3). |
| Urdu vs Arabic script | Phrases page gives Urdu vs Arabic forms (e.g. Bismillah in Arabic) | Strong, differentiating | Link it more (A-6). |
| Unicode normalisation / RTL | Cleaner exists and is linked from InPage; absent from llms.txt | — | Add to llms.txt. |
| InPage terminology | No glossary line for "InPage", "Nastaliq", "Unicode" on the converter | Retrieval for "what is InPage" goes to CLE/Wikipedia | 2-sentence explainer (2.1). |
| Urdu-script queries for InPage | `ان پیج کو یونی کوڈ…` has no Urdu-language page; live search returned only third parties | — | P4, gated by `WU-I18N-001D` (bulk locale expansion is on HOLD). |
| Pakistani vs international terms | "status", "shayari", "dua", "Jumma" used well on status/cards pages, but JS-only | — | Static rendering (2.4). |

---

## 4. Entity recognition and authority

| Signal | Current state (O) | Gap | Recommendation |
| --- | --- | --- | --- |
| Brand name | "Write Urdu", "WriteUrdu", "Write-Urdu.com" declared as `alternateName` | Consistent | none |
| Age / history | `/10-years-of-write-urdu`: online since July 2016, transparent methodology | Not in `Organization` schema or llms.txt | Add `foundingDate: "2016-07"` and llms.txt line |
| Who runs it | "Write Urdu is independently maintained" — `PUBLISHER.publicMaintainerName: null` | No person or legal entity; LLMs weigh accountable publishers | **Owner decision.** If comfortable, name the maintainer on `/why-write-urdu` and in `Organization.founder`. Never invent. |
| External profiles | No `sameAs`; outreach checklist mentions a maintained YouTube channel; GitHub repo `abaidurrehman/write-urdu` is public with no description/homepage/topics | Nothing for entity reconciliation | Add `sameAs` only for profiles the owner controls; set GitHub repo description + homepage URL (zero-code). |
| Developer evidence | `packages/inpage-unicode` npm package + beta API (`WU-API-001`) | Publishing it with a homepage link would be a genuine, first-party technical citation source | Track under P0.7 (existing). |
| Third-party mentions | Not measured in repo. Live search (file 06) surfaced WU once in 15 queries (keyboard page). Competitors cited by AI are app-store listings, CLE (UET Lahore), UrduPod101, branah.com, urdupoint, hamariweb, easyurdutyping. | Unknown | Realistic: CLE/university Urdu resource lists for the InPage converter and keyboard reference; genuine answers in communities; no paid links (`docs/SEO-OUTREACH-CHECKLIST.md`). |
| Claim consistency | "free, no account" consistent; local-processing facts deliberately confined to `/write-urdu-privacy` by the language firewall | Competitors state "runs entirely in your browser" on the tool page, and AI answers repeat it | Owner decision A-20 (allow one plain factual line on InPage/OCR/Cleaner). |
| Stale third-party copies | AI search returned obsolete `www.write-urdu.com/write-urdu-features` text | Wrong product facts can be repeated by LLMs | Fix `www` redirect (P0). |

**Assessment:** Write Urdu reads as a coherent *tool provider* (consistent brand, WebApplication markup, real tool on every URL, privacy specifics, changelog, contact). What it lacks is **external corroboration and an accountable identity** — the two things an LLM cannot infer from the site itself.

---

## 5. Multilingual opportunities (not a page factory)

- Keep the 11 existing Urdu-locale pages; they already carry reciprocal hreflang.
- Only two additions are justified by evidence, both as **sections on existing pages**: the phone/WhatsApp FAQ entry (en + `/urdu/urdu-faq`) and the InPage explainer (en). An Urdu-locale InPage page waits for `WU-I18N-001D`.
- Do not create Roman-Urdu-language duplicate pages; one natural Roman-Urdu sentence inside an existing passage is enough to match conversational queries.
