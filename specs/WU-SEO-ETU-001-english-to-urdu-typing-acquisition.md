# WU-SEO-ETU-001 — English to Urdu Typing Acquisition

**Status:** Implemented with this slice once the acceptance contract is green  
**Primary route:** `/`  
**Area:** Search acquisition / mature-domain authority  
**Priority:** P1.1 / P1.2

## Purpose

Make the established Write Urdu homepage the single product owner for the high-value **English to Urdu typing** job while preserving the mature domain's existing Urdu typing and Urdu writing equity.

In this product, the phrase means typing Roman Urdu with English letters and converting the sounds into Urdu script. It is **transliteration, not translation of English meaning**.

## Evidence and intent decision

Current search-result sampling for `English to Urdu typing` is dominated by tools that ask the user to type Roman/phonetic Urdu with English letters and convert the input to Urdu script, commonly when Space is pressed. This matches the existing homepage interaction exactly.

The current Write Urdu site also carries historical exact-match signals on supporting routes. Those routes now have distinct product jobs, so the acquisition strategy is to concentrate broad typing intent on the homepage rather than create another keyword landing page.

No search-volume, CTR, traffic-share or RPM number is asserted by this spec without Search Console / AdSense evidence.

## Query ownership

### `/` — product owner

Owns:
- English to Urdu typing;
- Urdu typing online;
- Roman Urdu to Urdu typing;
- typing Urdu with English letters;
- English-keyboard Urdu input.

The homepage must remain the actual conversion tool, not become a content-first landing page.

### Supporting routes

- `/roman-urdu-transliteration` — owns transliteration mechanics, ambiguity and the transliteration-vs-translation explanation.
- `/english-urdu-typing-tutorial` — owns Write Urdu video/product walkthrough intent only.
- `/urdu-editor` — owns rich Urdu document formatting and export.
- `/urdu-keyboard` — owns direct Urdu-character keyboard input.
- `/urdu-editor-features` — owns formatting reference intent.

## Doorway-page guardrail

Do **not** create keyword-clone routes such as:
- `/english-to-urdu-typing`;
- `/english-urdu-typing`;
- `/type-urdu-in-english`;
- `/urdu-typing-in-english`.

A new route is justified only if future query/page evidence shows a genuinely different user job that the homepage cannot satisfy.

## Homepage acquisition contract

- Preserve canonical `/`.
- Preserve the established H1: `Type Roman Urdu and convert it to Urdu script`.
- Preserve the active transliteration editor as the first task.
- Search-facing metadata may lead with `English to Urdu Typing Online` while retaining `Urdu Typing Online` relevance and truthful Roman Urdu wording.
- Explain the real workflow: type Roman Urdu with English letters, press Space, receive Urdu script, review suggestions.
- State clearly that this is transliteration, not English-language translation.
- Do not add another ad inside the active writing surface.

## Rendered metadata contract

`seo.config.js` is the source of truth for canonical search metadata. The shared UI shell may localize interface/document copy, but on the initial page load it must not leave a generic shell title in place of an explicit `searchTitle` / `searchDescription` from the SEO registry.

This also protects other search-investment routes such as Card Studio that use explicit search-facing metadata.

## Internal authority distribution

Supporting writing routes should describe their own jobs clearly and point users to `/` when they need Roman Urdu / English-letter conversion. We should remove or avoid legacy exact-match claims that imply the Rich Editor, direct Urdu Keyboard or formatting reference is the primary English-to-Urdu typing product.

## Monetization guardrail

The homepage remains a **Write** page under the AdSense operating contract. Its existing safe post-workspace placement is the baseline. This acquisition slice does not add ad density or place ads inside the editor/input/action region.

## Acceptance criteria

- [x] `/` remains the only broad English-to-Urdu typing product owner.
- [x] Homepage search-facing title begins with `English to Urdu Typing Online` and still contains `Urdu Typing Online`.
- [x] Search description mentions Roman Urdu, English letters, Urdu script and transliteration-not-translation semantics.
- [x] Homepage H1 and canonical remain unchanged.
- [x] Homepage material revision date is refreshed for this acquisition change.
- [x] Rich Editor, Urdu Keyboard, tutorial and transliteration guide keep distinct registry titles/intents.
- [x] Rendered SEO metadata is re-applied after the shared shell's initial title localization.
- [x] `llms.txt` names the homepage as the English-to-Urdu typing owner.
- [x] No exact-match doorway route is added.
- [x] Regression tests protect ownership, wording and metadata precedence.

## Verification

```bash
npm test
npm run seo:check
npm run governance:check
npm run test:browser
```

After deployment, inspect and request recrawl for `/` and the supporting routes that historically appeared for the query, then monitor Search Console query-to-page ownership before making another title or route change.
