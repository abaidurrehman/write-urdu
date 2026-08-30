# WU-SEO-ETU-001 — English to Urdu Typing Acquisition

**Status:** Implemented / corrected  
**Primary route:** `/`  
**Area:** Search acquisition / mature-domain authority  
**Priority:** P0

## Purpose

Make the established Write Urdu homepage the single product owner for the high-value **English to Urdu typing** job while preserving the mature domain's existing Urdu typing and Urdu writing equity.

The public language must describe the job in the words users actually use: **English to Urdu typing**, **Urdu typing**, **Urdu writing**, **type Urdu using English letters**, and **Urdu keyboard**.

Technical linguistic terms such as **transliteration** must not be required vocabulary for understanding or using the product. **Roman Urdu** remains valid secondary language because Search Console still shows meaningful demand for Roman-specific queries, but it must not displace the larger English-to-Urdu typing intent in the homepage title, H1, hero, primary editor controls, or primary instructions.

## Evidence and intent decision

The 19 August 2026 Search Console export shows the language hierarchy clearly:

- `english to urdu typing` — 26,997 impressions;
- `urdu typing` — 10,279 impressions;
- `urdu writing` — 5,267 impressions;
- `urdu typing online` — 3,498 impressions;
- `roman urdu to urdu` — 3,064 impressions;
- `urdu transliteration` — 73 impressions.

Across the exported top queries, typing/English-to-Urdu language is orders of magnitude larger than transliteration terminology. This makes Search Console the governing source for public acquisition vocabulary.

## Product-language hierarchy

### Primary public language

Use prominently in titles, H1s, hero copy, editor labels, onboarding, internal links and search snippets:

- English to Urdu typing;
- Urdu typing;
- Urdu writing;
- type Urdu using English letters;
- English letters → Urdu;
- Urdu keyboard;
- Urdu typing online.

### Secondary public language

Use only where it helps users who already know the term or where the query/page is specifically Roman-focused:

- Roman Urdu;
- Roman Urdu to Urdu typing.

### Technical / explanatory language

Use in implementation code, provider documentation, privacy/legal explanations, or lower-level educational copy where precision is useful:

- transliteration;
- transliterate;
- phonetic conversion.

Users must never need to understand these terms to use the core Write Urdu experience.

## Query ownership

### `/` — product owner

Owns:
- English to Urdu typing;
- Urdu typing online;
- Urdu writing;
- typing Urdu with English letters;
- English-keyboard Urdu input.

The homepage remains the actual writing tool, not a content-first SEO landing page.

### Supporting routes

- `/roman-urdu-transliteration` — secondary Roman Urdu to Urdu typing guide, spelling ambiguity and explanation of how English-letter Urdu becomes Urdu script;
- `/english-urdu-typing-tutorial` — Write Urdu video/product walkthrough intent only;
- `/urdu-editor` — rich Urdu document formatting and export;
- `/urdu-keyboard` — direct Urdu-character keyboard input;
- `/urdu-editor-features` — formatting reference intent.

## Doorway-page guardrail

Do **not** create keyword-clone routes such as:
- `/english-to-urdu-typing`;
- `/english-urdu-typing`;
- `/type-urdu-in-english`;
- `/urdu-typing-in-english`.

A new route is justified only if future query/page evidence shows a genuinely different user job that the homepage cannot satisfy.

## Homepage acquisition contract

- Preserve canonical `/`.
- H1 must lead with `English to Urdu Typing Online`.
- The first-screen explanation must say that users can type Urdu using English letters and press Space to get Urdu script.
- The primary editor mode must be labelled in plain language such as `English letters → Urdu`.
- The direct-input mode must use plain language such as `Type Urdu directly`.
- Do not use `transliteration` in the homepage title, H1, hero, primary editor controls, primary instructions or search description.
- Do not make `Roman Urdu` the dominant homepage phrase. It may appear only in secondary/help content when genuinely useful.
- Preserve the active writing editor as the first task.
- Do not add another ad inside the active writing surface.

## Initial HTML and rendered metadata contract

`seo.config.js` is the source of truth for canonical search metadata. Explicit `searchTitle` / `searchDescription` values must be present in the **initial static HTML** `<title>`, description, Open Graph and Twitter metadata; search crawlers must not need JavaScript just to discover the preferred acquisition title.

The shared UI shell may localize interface/document copy, but on the initial page load it must not leave a generic shell title in place of the SEO registry. `scripts/sync-static-search-metadata.js` keeps the checked-in HTML synchronized and `npm run seo:check` fails if it drifts.

## Internal authority distribution

Supporting writing routes should describe their own jobs clearly and point users to `/` when they need English-to-Urdu typing. Internal anchors should prefer natural user language such as `English to Urdu typing`, `type Urdu with English letters`, `Urdu typing`, and `Urdu writing` rather than repeatedly using technical terminology.

## Public-language guardrail

Search Console vocabulary outranks internal product terminology for public-facing acquisition and primary UX copy.

Do not introduce linguistic or implementation terminology into titles, H1s, primary descriptions, editor controls or primary CTAs when an established plain-language user term exists.

This guardrail does **not** require renaming internal JavaScript identifiers, provider APIs, telemetry event names, file names or privacy/legal terminology when those names are technically meaningful.

## Monetization guardrail

The homepage remains a **Write** page under the AdSense operating contract. Its existing safe post-workspace placement is the baseline. This acquisition correction does not add ad density or place ads inside the editor/input/action region.

## Acceptance criteria

- [x] `/` remains the only broad English-to-Urdu typing product owner.
- [x] Homepage search-facing title leads with `English to Urdu Typing Online`.
- [x] Homepage H1 is `English to Urdu Typing Online`.
- [x] Homepage search description explains typing Urdu with English letters and getting Urdu script without technical terminology.
- [x] Primary homepage editor controls use plain-language labels.
- [x] Preferred acquisition title/description are present in initial HTML, Open Graph and Twitter metadata.
- [x] Canonical `/` remains unchanged.
- [x] Roman-specific intent remains available on the existing supporting route without competing with the homepage.
- [x] No exact-match doorway route is added.
- [x] Regression tests protect plain-language ownership and rendered metadata precedence.
- [x] Internal implementation identifiers are not renamed as part of this copy correction.

## Measurement

After deployment, allow Google to recrawl and reprocess the changed title, H1 and page copy before drawing conclusions from short-term movement. Near-term volatility is acceptable; the decision should be judged on query-level CTR, position and page ownership over subsequent Search Console exports.

Monitor specifically:

- `english to urdu typing`;
- `urdu typing`;
- `urdu writing`;
- `urdu typing online`;
- Roman-specific secondary queries;
- homepage CTR by device;
- www → non-www consolidation;
- query-to-page ownership.

## Verification

```bash
npm test
npm run seo:check
npm run governance:check
npm run test:browser
npm run seo:production
npm run seo:live
```
