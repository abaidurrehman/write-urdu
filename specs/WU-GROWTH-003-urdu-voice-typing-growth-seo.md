# WU-GROWTH-003 — Urdu Voice Typing Growth & SEO

**Product:** Write Urdu  
**Feature/strategy ID:** `WU-GROWTH-003`  
**Status:** Active — Slices A/B/C/E shipped (PR #114); Slice D correctly held on Search Console evidence gate  
**Primary owner route:** `/tools/urdu-voice-typing`  
**Urdu locale route:** `/urdu/tools/urdu-voice-typing`  
**Commercial parent:** `WU-GROWTH-001`  
**Feature contract:** `WU-TOOLS-EXPANSION-004`  
**Locale dependency:** `WU-I18N-001`  
**Journey dependency:** `WU-PLAT-002`  
**Account/share dependency:** `WU-GROWTH-002` / `WU-SHARE-001` where those capabilities are available  
**Architecture:** existing browser-first voice feature; static-first acquisition pages; no speech-engine rebuild

## 1. Executive decision

Urdu voice typing has moved from an experimental utility to a strategically important acquisition surface.

The product already has a functioning voice workspace, a crawlable English owner route, an Urdu locale counterpart, browser-safe progressive enhancement, post-workspace monetization boundaries and privacy-safe first-stage voice analytics. The growth problem is therefore no longer “can Write Urdu build speech-to-text?” It is:

1. can search engines clearly recognize Write Urdu as a strong destination for Urdu voice typing intent;
2. can more users discover the feature from search and from within Write Urdu;
3. can a search visitor reach the microphone immediately, produce useful Urdu text and continue into another useful Write Urdu action;
4. can the product measure this funnel without collecting audio or transcript content; and
5. can Write Urdu build topical authority around the job without publishing thin keyword variants.

`WU-GROWTH-003` owns that growth system. It does **not** replace `WU-TOOLS-EXPANSION-004`, which continues to own speech-recognition behavior, browser support, accessibility, privacy wording and transcript correctness.

## 2. Strategic thesis

Voice typing is a strong growth wedge because it combines four properties that are unusually valuable for Write Urdu:

- **clear user intent:** users understand jobs such as Urdu voice typing, Urdu speech to text and speaking Urdu to produce text;
- **immediate product proof:** the landing page can satisfy the intent directly with a microphone rather than only explaining it;
- **natural continuation:** successful speech can become editable text, a document, a card, a copied message or a shared artifact;
- **demonstrability:** the speak → Urdu appears interaction is easy to show in search snippets, screenshots and short-form video.

The strategy is therefore **one strong destination + a small useful support cluster + strong internal discovery + measured continuation**, not a large SEO content farm.

## 3. Commercial rationale

Classification under `WU-GROWTH-001`:

- expands a demonstrated/proven product job;
- creates qualified organic entrances to an existing useful tool;
- increases useful session depth through natural voice → edit / copy / save / share / create handoffs;
- creates additional Learn-page inventory only where a distinct search job exists;
- protects the active voice workspace from intrusive monetization or SEO copy.

Voice growth contributes directionally to the broader `$5/day` AdSense objective through useful organic entrances and additional product journeys. It is not acceptable to manufacture pageviews, interrupt microphone use with ads, or create near-duplicate pages solely for keywords.

## 4. Non-negotiable invariants

### 4.1 Preserve the existing owner URL

The English owner remains:

```text
/tools/urdu-voice-typing
```

The Urdu owner remains:

```text
/urdu/tools/urdu-voice-typing
```

Do not rename or redirect these routes merely to add words such as `speech-to-text`, `online`, `voice-to-urdu` or `free` to the URL.

### 4.2 Do not rebuild the speech engine

This epic must reuse the existing `SpeechRecognition` / `webkitSpeechRecognition` implementation and `WU-TOOLS-EXPANSION-004` behavior contract.

A paid transcription API, audio upload pipeline, custom model or account-gated microphone experience is out of scope unless later evidence proves the browser feature is structurally insufficient.

### 4.3 The microphone remains the primary task

SEO content, ads, account prompts and supporting guidance must not push the microphone workspace below a long article or obscure the primary action on mobile.

The acquisition page must feel like a product first and an SEO page second.

### 4.4 No transcript/audio analytics

Never send:

- audio;
- transcript text;
- recognized words;
- user-edited content;
- raw browser error objects.

Only bounded event names, coarse categories and non-content metadata are allowed.

### 4.5 No bulk keyword pages

Do not create separate pages for every phrase variation such as:

- `urdu voice typing`;
- `urdu speech to text`;
- `voice to urdu`;
- `speak urdu to text`;
- `urdu microphone typing`.

These are query variants of the same core job and belong to the owner route unless Search Console later demonstrates a genuinely different intent.

### 4.6 Do not destabilize existing metadata without evidence

The live owner already has strong intent alignment:

```text
Title: Urdu Voice Typing — Speak Urdu to Text Online | WriteUrdu
H1: Urdu Voice Typing
```

Do not churn the title/H1 merely because another wording is theoretically attractive. Capture the query/page baseline first. Change snippet copy only when Search Console evidence shows a CTR or intent-alignment opportunity, then measure the result over a comparable period.

## 5. Search intent ownership

### 5.1 Core owner cluster — `/tools/urdu-voice-typing`

The English owner should naturally cover variants around:

```text
urdu voice typing
urdu voice typing online
urdu speech to text
speech to urdu text
voice to urdu
speak urdu to text
type urdu by voice
urdu microphone typing
```

These terms are a measurement/query family, not a keyword-stuffing checklist.

The visible page should continue to use simple task language such as:

- Urdu Voice Typing;
- Speak Urdu to text;
- Tap the mic and speak Urdu;
- Your Urdu text appears here;
- Edit, copy or keep writing.

Avoid making technical language such as `Web Speech API`, `SpeechRecognition`, “speech engine” or “browser vendor service” primary marketing copy. Necessary compatibility/privacy detail belongs in bounded help/privacy content.

### 5.2 Urdu-script owner cluster — `/urdu/tools/urdu-voice-typing`

The Urdu counterpart should use natural task phrasing such as:

```text
اردو وائس ٹائپنگ
آواز سے اردو لکھیں
بول کر اردو لکھیں
اردو میں بول کر ٹائپ کریں
آواز کو اردو تحریر میں تبدیل کریں
```

The Urdu page must remain genuine Urdu content under the `WU-I18N-001` initial-HTML, canonical, hreflang and RTL contracts. Do not mechanically repeat query variants.

### 5.3 Supporting intent candidates

Potential support pages are allowed only when they answer a distinct job better than the tool page itself. Candidate families:

- how to use Urdu voice typing;
- Urdu voice typing on mobile / Android / iPhone;
- Urdu voice typing on a computer/browser;
- using voice-typed Urdu in WhatsApp or messaging;
- punctuation and numbers while voice typing;
- microphone permission / voice typing not working.

Preferred route style should follow the existing root-level Write Urdu guide convention rather than introduce a new `/guides/` hierarchy solely for this epic. Candidate URLs include:

```text
/how-to-use-urdu-voice-typing
/urdu-voice-typing-on-mobile
/urdu-voice-typing-on-computer
/urdu-voice-typing-for-whatsapp
/urdu-voice-typing-punctuation
/urdu-voice-typing-not-working
```

**Publication gate:** select only 1–3 support pages from Search Console evidence, product support evidence or clear recurring user friction. The other candidates remain unbuilt until justified.

## 6. Owner-page product contract

### 6.1 Above the fold

On common mobile and desktop viewports, users should encounter:

1. the H1 / concise benefit;
2. clear microphone affordance or workspace context;
3. Start voice typing;
4. editable Urdu result area or an obvious indication of where the result will appear.

The decorative hero/demo may support comprehension but must not compete with the real microphone action.

### 6.2 Product-first copy

Preferred message hierarchy:

```text
Urdu Voice Typing
Speak Urdu and turn it into editable Urdu text.
Start voice typing
```

Urdu equivalent should use simple user language, for example:

```text
آواز سے اردو لکھیں
مائیک دبائیں، اردو میں بولیں اور اپنی بات کو اردو تحریر میں بدلیں۔
```

Do not lead with privacy architecture, browser internals, recognition vendor detail or implementation explanations.

### 6.3 Successful-result state

Once useful transcript text exists, the page should make the next useful actions obvious without blocking the result:

- Copy text;
- Keep writing / open the main editor;
- Clean text where needed;
- Save when account-backed drafts are available;
- Share when the approved share flow is available;
- Create a card/status where context makes sense.

Visible next actions should follow `WU-PLAT-002` contextual handoff limits rather than growing into an uncapped toolbar.

### 6.4 Account conversion

Voice typing remains usable without signup.

After successful transcript generation, `WU-GROWTH-002` may present a compact continuity prompt such as keeping the writing across devices. It must not appear as a prerequisite to microphone use and must not interrupt permission handling.

### 6.5 Share loop

Where `WU-SHARE-001` supports a safe text/share artifact from the relevant workspace, voice-generated writing can enter that loop exactly like typed writing. The growth epic does not create a separate voice-only publishing backend.

## 7. Owner-page SEO/content contract

The owner page should remain concise above the workspace and add useful crawlable support content **after** the task boundary.

Recommended below-workspace content modules:

1. three-step “Start → Speak → Edit/use” explanation;
2. practical tips for clearer recognition;
3. short mobile/browser compatibility guidance;
4. microphone permission recovery link/instructions;
5. examples of what users can do with the text (message, document, card, copy);
6. concise distinction between voice typing and typing Urdu with English letters, with a link to the main typing owner;
7. a small visible FAQ only if it answers recurring user questions not already handled by the workspace.

Content must be written for users, not expanded to hit an arbitrary word count.

### 7.1 Structured data

Use only schema already supported by the site’s shared SEO system and valid for the visible content. A software/web application representation may describe the tool where appropriate.

Do not add FAQ schema merely to chase a rich result. If visible FAQs exist, schema must match them exactly and must not become the reason to add repetitive copy.

### 7.2 Search metadata

Required on both owner routes:

- indexable initial HTML;
- self canonical;
- reciprocal `hreflang=en` / `hreflang=ur` / `x-default`;
- locale-correct title and description;
- locale-correct OG/Twitter metadata;
- sitemap membership through the existing SEO/i18n generation path;
- no accidental `.html` duplicate owner;
- no JS-only title/H1 dependency.

### 7.3 Cannibalization rule

Every support guide must declare the query/job it owns and explicitly defer “use the microphone now” intent to `/tools/urdu-voice-typing`.

Guides must link prominently to the owner route using descriptive anchor text such as `Urdu Voice Typing`, `Start Urdu voice typing` or natural Urdu equivalents.

The owner route may link back to a support guide only when the guide resolves a likely problem (for example mobile setup or permission troubleshooting).

## 8. Internal discovery contract

Voice typing should become a first-class discoverable Write Urdu capability without taking over every surface.

Required discovery locations to evaluate/implement through existing navigation/journey components:

| Source | User context | Preferred entry |
| --- | --- | --- |
| Homepage / Basic Writer | user wants a faster input method | visible mic/voice entry near input-mode or next-step UI |
| Urdu Keyboard | direct input is inconvenient | `Use Urdu voice typing` contextual link |
| Rich Editor | user wants to dictate new text | contextual voice entry, preserving current work |
| My Documents / Drafts | user is starting new writing | `Start with voice` creation entry when that surface supports creation shortcuts |
| Tools / outcome navigation | user is discovering capabilities | strong Voice card under Write |
| Relevant guides | user is learning how to write/use Urdu | descriptive contextual link to the owner tool |
| Footer | crawlable secondary discovery | `Urdu Voice Typing` where the shared footer taxonomy permits it |

Do not add five competing microphone icons to one workspace. The route should be highly discoverable but the active writing control hierarchy remains clear.

## 9. Measurement contract

### 9.1 Search baseline

Before judging SEO success, capture the voice cluster from Search Console by:

- page: `/tools/urdu-voice-typing`;
- page: `/urdu/tools/urdu-voice-typing`;
- queries containing relevant voice/speech terms in English and Urdu script;
- country;
- device;
- daily trend.

Record at minimum:

- impressions;
- clicks;
- CTR;
- average position;
- ranking URL;
- top query variants;
- mobile vs desktop split.

Do not fabricate a historical baseline if Search Console has not yet accumulated enough data for the new route.

### 9.2 Existing product funnel

Preserve the existing event vocabulary:

```text
voice_page_viewed
voice_typing_started
voice_transcript_received
```

These form the minimum funnel:

```text
landing/page view
    ↓
voice start
    ↓
useful transcript received
```

Core ratios:

```text
voice activation rate = voice_typing_started / voice_page_viewed
voice success rate = voice_transcript_received / voice_typing_started
```

### 9.3 Funnel extension

Extend telemetry through the existing product analytics conventions, using event names that do not include content. Required downstream outcomes should cover, where the action exists:

```text
voice_copy_used
voice_clean_handoff
voice_editor_handoff
voice_save_prompt_viewed
voice_save_started
voice_share_started
voice_create_handoff
```

Names may be normalized to an existing shared analytics taxonomy during implementation; do not create duplicate network sinks merely to preserve these literal strings.

Useful funnel measures:

```text
search entrance → voice start
voice start → transcript success
transcript success → copy or continuation
transcript success → second useful workspace
transcript success → save/signup where offered
transcript success → share where offered
```

### 9.4 Failure observability

Capture bounded categories for:

- unsupported recognition;
- permission denied;
- microphone/audio capture unavailable;
- no speech;
- network/service recognition failure;
- aborted/backgrounded session.

Do not capture browser error objects, audio or words.

### 9.5 Growth reporting

Add a Voice Typing section to the existing product/growth reporting surface when implementation reaches the reporting slice. It should answer:

1. Are search impressions/clicks growing for the voice owner routes?
2. Which query families are appearing?
3. Do visitors actually start voice typing?
4. Does voice typing produce a useful transcript?
5. What do successful users do next?
6. Are mobile/browser failures suppressing activation?
7. Is the Urdu locale beginning to acquire Urdu-script search demand?

## 10. Success criteria

Because a reliable voice-specific Search Console baseline is not yet recorded in the canonical growth spec, do not invent absolute traffic targets.

### Phase 1 success

- owner route remains indexable and technically healthy;
- baseline query/page/device data is captured;
- internal discovery materially increases qualified entrances to the voice page without harming core writer navigation;
- activation and transcript-success funnels are measurable;
- no transcript/audio content enters analytics;
- no regression to microphone UX, Core Web Vitals or active-workspace ad safety.

### Phase 2 success

After a stable baseline exists, set numeric targets in the growth report for a comparable measurement window. Candidate measures:

- growth in non-brand voice-cluster impressions;
- growth in voice-cluster clicks;
- improved CTR where position is stable enough to interpret;
- more queries in positions 4–10 and 11–20;
- higher voice activation rate;
- maintained/improved transcript-success rate;
- increased useful continuation after transcript success;
- measurable Urdu-script discovery on the `/urdu/` owner.

Numeric goals must be evidence-derived and recorded with baseline date/window.

## 11. AdSense contract

Voice typing is a **Write** workspace.

Rules:

- never place an ad between the hero/workspace instructions and microphone control;
- never place an ad inside the microphone/transcript control grid;
- preserve the explicit post-workspace boundary;
- avoid layout shift near Start/Stop/Copy controls;
- support content below the workspace may use the same bounded Write/Learn monetization conventions already defined by `WU-GROWTH-001` and the AdSense operating contract;
- support guide pages may use Learn-page inventory but must show the answer/product CTA before ads interrupt the reading flow.

Do not increase ad density simply because voice traffic grows.

## 12. Distribution loop

SEO is the primary acquisition channel for this epic, but voice typing also supports low-cost demonstration content.

Reusable demo format:

```text
spoken Urdu phrase
        ↓
Urdu text appears on screen
        ↓
edit / copy / use it
        ↓
write-urdu.com/tools/urdu-voice-typing
```

Potential distribution surfaces:

- YouTube Shorts;
- Facebook/Instagram short video;
- TikTok where operationally useful;
- product changelog/update posts;
- relevant Urdu-writing guides.

Video/content should demonstrate the actual product. Do not claim recognition accuracy, offline operation, browser support or privacy properties beyond the feature contract.

Distribution is a later slice and must not block owner-page/indexation/funnel work.

## 13. Implementation slices

Execute in order. A later slice may begin only when its dependencies are sufficiently stable; content publication remains evidence-gated.

### `WU-GROWTH-003A` — Voice acquisition baseline + owner-page audit

**Goal:** establish the measurement and technical SEO baseline before unnecessary page churn.

Implementation:

- capture current Search Console page/query/device baseline for both voice owner routes when data is available;
- document current title, H1, description, canonical, hreflang, sitemap and schema ownership;
- confirm initial HTML is crawlable in English and Urdu;
- confirm no duplicate `.html`/slash/canonical owner competes;
- check mobile viewport placement of the real microphone workspace;
- preserve current title/H1 unless evidence justifies a change;
- record current page → start → transcript funnel counts/rates;
- add any missing voice-specific growth reporting dimensions without collecting content.

**Acceptance:** a future title/content/internal-link change can be compared against a recorded baseline rather than intuition.

### `WU-GROWTH-003B` — Internal discovery + product activation

**Goal:** make the already-working feature easy to find and easy to start.

Implementation:

- add/strengthen Voice entry in the Write outcome/tool discovery surface;
- add contextual discovery from core writing surfaces through `WU-PLAT-002` patterns;
- add My Documents/Drafts entry when the creation surface supports it;
- verify the real mic action remains visible and dominant on mobile/desktop;
- improve successful-result continuation ordering if analytics/UX inspection reveals friction;
- preserve current text through any handoff using shared handoff contracts;
- instrument source → voice route and successful voice → next action without content.

**Acceptance:** users can discover voice typing from the primary writing journey without hunting through a generic tools directory, and the active workspace remains uncluttered.

### `WU-GROWTH-003C` — Search authority + Urdu owner strengthening

**Goal:** make both owner pages the clearest, strongest answers for their language-specific intent.

Implementation:

- review below-workspace support content for missing user questions;
- keep copy task-first and remove/relocate unnecessary technical explanation;
- strengthen descriptive internal anchor text pointing to the voice owner;
- verify English↔Urdu reciprocal hreflang and self-canonical behavior;
- ensure the Urdu page uses natural Urdu acquisition language rather than literal technical translations;
- verify owner pages are present in locale-aware sitemap generation;
- verify OG/Twitter/schema fields match each locale;
- add only useful visible FAQs/examples if evidence supports them.

**Acceptance:** search engines and users receive one unambiguous English owner and one unambiguous Urdu owner with no cannibalizing variants.

### `WU-GROWTH-003D` — Evidence-backed support cluster

**Goal:** capture distinct adjacent jobs that cannot be fully served by the core tool page.

Implementation:

- review Search Console query expansion after owner strengthening;
- select only 1–3 support intents with evidence;
- assign each selected guide one primary job and canonical route;
- create genuinely useful content with screenshots/examples/instructions where appropriate;
- place a strong `Start Urdu Voice Typing` product handoff near the answer and after relevant instructions;
- link the owner route to troubleshooting/setup guides only where contextually useful;
- add Urdu equivalents only when the `/urdu/` content expansion gate and real Urdu query/user need justify them;
- keep unselected candidate pages on hold.

**Acceptance:** no thin or near-duplicate voice pages are published and every support page has a distinct user job plus a working product continuation.

### `WU-GROWTH-003E` — Distribution + growth experiments

**Goal:** compound the search destination with demonstration and measured conversion experiments.

Implementation:

- create reusable short demo assets/scripts around speak → Urdu appears → edit/use;
- publish/repurpose only on channels Write Urdu can maintain;
- test owner-page snippet/CTA changes one bounded change at a time when baseline volume supports interpretation;
- test contextual internal discovery placements using stable source IDs;
- measure voice → save/share/create continuation as those downstream features ship;
- feed Search Console/product evidence back into the support-cluster queue.

**Acceptance:** experiments have a hypothesis, baseline, change date and result; no uncontrolled page-title churn or bulk content publication.

## 14. Implementation map

Primary existing files/systems expected to participate:

```text
tools/urdu-voice-typing.html
urdu/tools/urdu-voice-typing.html
js/urdu-voice-typing.js
css/urdu-voice-typing.css
js/voice-account-analytics.js
js/product-telemetry.js
seo.config.js
locale.config.js
js/locale-route.js
site-header.js / js/site-header-core.js
js/text-handoff.js
js/ads.js
specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md
specs/WU-I18N-001-crawlable-urdu-locale.md
specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md
specs/WU-GROWTH-002-account-save-share-entry-points.md
```

Implementation must inspect current shared components before adding route-specific duplicates.

Potential tests should extend existing static/SEO/browser/product telemetry contracts rather than creating a separate voice-only test framework.

## 15. Acceptance criteria for the epic

`WU-GROWTH-003` reaches Implemented when:

- [ ] `/tools/urdu-voice-typing` is the documented single English owner for the core voice/speech-to-Urdu job.
- [ ] `/urdu/tools/urdu-voice-typing` is the documented Urdu-script counterpart under `WU-I18N-001`.
- [ ] Both owner pages are indexable, self-canonical, reciprocal-hreflang and sitemap-owned.
- [ ] Current metadata is baseline-measured before any title/H1 experiment.
- [ ] The real microphone workspace is immediately discoverable and remains the primary task on mobile and desktop.
- [ ] Voice typing is discoverable from the appropriate Write journey/navigation surfaces.
- [ ] Existing `voice_page_viewed`, `voice_typing_started` and `voice_transcript_received` funnel remains intact.
- [ ] Downstream copy/handoff/save/share outcomes are measurable where those actions exist.
- [ ] No audio, transcript text or recognized words are sent in telemetry.
- [ ] Unsupported/permission/error categories can be monitored without raw sensitive data.
- [ ] Search Console reporting exists for English + Urdu voice owner routes and query families.
- [ ] Any support cluster contains no more than 1–3 evidence-backed pages in the first release.
- [ ] Every published support page has a distinct job, canonical ownership and prominent product handoff.
- [ ] No support page cannibalizes the main voice owner for generic `Urdu voice typing` intent.
- [ ] Post-workspace AdSense boundary remains intact and no ad enters the mic/transcript workspace.
- [ ] Existing voice typing behavior and physical-device acceptance contract remain green.
- [ ] Search/product experiments record baseline, change date and result.

## 16. Verification gates

Run the repository’s current canonical checks and add focused assertions where needed:

```text
npm test
npm run seo:check
npm run governance:check
npm run test:browser
```

Also verify manually/with production smoke where automation cannot prove platform speech behavior:

- current iPhone Safari path from `WU-TOOLS-EXPANSION-004`;
- current Android Chrome path from `WU-TOOLS-EXPANSION-004`;
- English and Urdu owner initial HTML;
- canonical/hreflang/sitemap ownership;
- microphone visibility and permission flow;
- post-workspace ad placement;
- Search Console URL inspection after meaningful SEO changes.

## 17. Explicit non-goals

This epic does not include:

- replacing browser speech recognition with a paid API;
- recording or storing audio;
- storing transcripts merely for analytics;
- guaranteed offline voice recognition;
- universal browser-support claims;
- a voice-only account system;
- a voice-only sharing backend;
- a new `/guides/` site architecture;
- dozens of programmatic voice keyword pages;
- automatic locale/geo redirects;
- title/meta rewrites without measurement;
- intrusive signup before microphone use;
- increased ad density inside the voice workspace;
- rebuilding the main transliteration/editor product.

## 18. Decision log

### 2026-08-22 — CI caught a Slice A regression: mobile fold fix broke an existing shared-shell contract

PR #104's `static-and-seo` check failed on `tests/inpage.spec.js`'s `nested Urdu tools preserve their own shared-shell page identity` test (mobile-chromium/Pixel 5 project): `.urdu-voice-hero-demo` was expected visible but was hidden.

Root cause: Slice A's mobile-fold fix hid `.urdu-voice-hero-demo` (and other elements) under a plain `@media (max-width: 600px)` query. That query fires on any narrow viewport regardless of height, including Pixel 5 (393×851) — a device with no fold problem at all (851px is tall), where the pre-existing test's expectation that the hero-demo stays visible was correct all along. My original manual verification only checked a short 375×667 viewport and never ran `tests/inpage.spec.js`, so the conflict wasn't caught locally.

Fix: split the mobile block — layout-only rules (`urdu-tool-main` width, textarea min-height, help-grid padding) stay at `max-width: 600px`; the fold-rescue rules (hiding hero-demo/benefits/paragraphs, shrinking the mic) moved to `@media (max-width: 600px) and (max-height: 700px)`, so they only apply to genuinely short viewports. Re-verified: 375×667 still keeps the mic above the fold (bottom 601.8px, hero-demo hidden); Pixel 5 keeps the hero-demo visible. `tests/inpage.spec.js` (4/4), `voice-mobile-acceptance.spec.js` (4/4), and `seo:check` all pass.

Lesson: a targeted manual Playwright check on one viewport is not a substitute for running the existing suite before pushing.

### 2026-08-22 — Slice E: closed the continuation-measurement gap, rest stays blocked on baseline traffic

Reviewed §13E's six implementation bullets against current state:

- **"measure voice → save/share/create continuation as those downstream features ship"** — found this was never actually instrumented, despite being listed (in different words) under Slice B. The generic `window.WriteUrduTelemetry` client (`js/product-telemetry.js`) had no route entry for `/tools/urdu-voice-typing` in either `toolForRoute()` (fell back to the generic `content` bucket) or `bindPrimaryEditor()` (transcript textarea was never bound, so engagement/length tracking never fired), and `js/urdu-voice-typing.js`'s copy/clean/continue-writing handlers never called the telemetry client at all — they were pure `navigator.clipboard`/`window.location.assign` calls with no signal. Fixed:
  - `js/product-telemetry.js`: added `/tools/urdu-voice-typing → 'voice_typing'` to `toolForRoute()` and `bindPrimaryEditor()` (binds `#voiceTranscript`, which already dispatches a bubbling `input` event on recognized speech — `js/urdu-voice-typing.js:152` — so engagement tracking needed no product-code change);
  - `functions/api/events.js`: added `'voice_typing'` to the backend `TOOLS` allowlist (`cleanEvent` silently drops any event whose `tool` isn't allowlisted, so this was required or the route-name fix above would have caused every voice-page event to be dropped server-side). No migration/schema change needed — `tool` is a free-text column keyed generically in `product_hourly_metrics`/`product_hourly_handoffs`, not a fixed-column design;
  - `js/urdu-voice-typing.js`: wired `copyTranscript()` to call `trackOutcome('copy_completed', { format: 'clipboard', success: true })` and `handoff()` to call `track('tool_handoff', { target_route })` before navigating away, reusing the exact event names/shapes already used by every other tool (no new event type, no content in the payload);
  - live-verified via Playwright network interception: `tool: "voice_typing"` correctly attributed on `page_session_started`/`tool_engaged`; `copy_completed` fires with `format: clipboard, success: true`; `tool_handoff` fires with `target_route` before the page navigates away (delivered via the existing `pagehide` → `sendBeacon` flush, no dropped events).
- **"test owner-page snippet/CTA changes"** and **"test contextual internal discovery placements using stable source IDs"** — both are explicitly gated ("when baseline volume supports interpretation"). Per the Slice D finding, the voice route has no accumulated Search Console/traffic history yet (new page) to interpret any experiment against. No experiment started; no new instrumentation speculatively built for hypothetical future placements, per the same reasoning that kept Slice B/D from adding unused infrastructure.
- **"create reusable short demo assets/scripts"** and **"publish/repurpose on channels Write Urdu can maintain"** — distribution/marketing actions outside this session's tooling (no channel access), not attempted.
- **"feed Search Console/product evidence back into the support-cluster queue"** — not an action, re-run Slice D once evidence exists.

Verified after fix: `npm run seo:check`, `npm run governance:check`, `npm run locale:check`, `node tests/product-telemetry-contract.test.js` (pre-existing unrelated failure at the `payload()` regex assertion — reproduced identically on a clean stash of this branch before any of this session's edits, not caused by this change), `node tests/urdu-voice-typing-contract.test.js`, `node tests/product-pulse-contract.test.js`, plus live Playwright verification above.

Net: one real measurement gap closed with existing, already-allowlisted infrastructure (no new schema/migration). Everything else in Slice E remains correctly on hold pending either baseline traffic or channel/creative decisions outside this session's scope.

### 2026-08-22 — Slice D: blocked on evidence gate, no pages built

Checked Search Console evidence per §5.3's publication gate before selecting any of the 6 candidate support intents (mobile/Android/iPhone, computer/browser, WhatsApp, punctuation/numbers, permission/not-working, how-to-use).

- top ~150 sitewide queries by clicks contain zero voice-related terms;
- confirmed with product owner: the voice owner page is new, no Search Console query data has accumulated around it yet;
- no product-support-ticket or recurring-friction evidence was offered as an alternate gate-satisfying signal.

Per §5.3 ("select only 1–3 support pages from Search Console evidence, product support evidence or clear recurring user friction... other candidates remain unbuilt until justified") and §13D's own first implementation step ("review Search Console query expansion after owner strengthening"), none of the 6 candidates are justified yet.

Net: Slice D stays on hold, no pages built. Revisit once Search Console shows query expansion around voice terms, or product support/feedback surfaces recurring friction. Slice E's owner-page/internal-discovery experiments do not depend on this and can proceed independently of Slice D.

### 2026-08-22 — Slice C: owner strengthening, one content gap closed

Reviewed both owner routes live against §7's below-workspace content checklist and §5.2's Urdu acquisition-language requirement:

- reciprocal `hreflang`/self-canonical: already correct on both routes (fixed under Slice A);
- Urdu page copy: already natural task phrasing (`اردو وائس ٹائپنگ`, `آواز سے اردو`), not literal API/technical translation — no change needed;
- sitemap membership: both routes present, but `sitemap.xml`/`robots.txt` were stale against Slice A's `lastmod` bump in `seo.config.js` — regenerated via `node scripts/generate-seo-files.js` (only the voice route's `lastmod` line changed, verified with `git diff`);
- OG/Twitter/schema per locale: EN carries `WebApplication` only (Slice A fix); UR mirrors it — confirmed via `seo:check`;
- internal anchor text pointing to the owner (`outcome-navigation.js`, `site-header.js`, `core-workspace-convergence.js`): already descriptive (`Speak and turn it into Urdu text`, `Urdu Voice Typing`, `Start voice typing`) — no change needed;
- §7 item 6 (distinguish voice typing from typing Urdu with English letters, link to the main typing owner) was a genuine gap — added one descriptive link (`Prefer typing? Type Urdu with English letters` / `ٹائپ کرنا پسند ہے؟ انگریزی حروف سے اردو ٹائپ کریں`) to `/` in both `tools/urdu-voice-typing.html` and `locale/ur.js`, regenerated the Urdu page via `npm run locale:generate` (href auto-localizes to `/urdu/`);
- §7 items 3–4 (mobile/browser compatibility guidance, permission recovery) were judged already met by existing runtime behavior — `js/urdu-voice-typing.js`'s `mic-blocked`/`unsupported-note` strings surface actionable guidance exactly when relevant — rather than adding unverified static browser-support claims to the page. Full troubleshooting content remains Slice D's evidence-gated support cluster.

Verified after fix: `npm run seo:check`, `npm run locale:check`, `npm run governance:check`, `node tests/urdu-voice-typing-contract.test.js`, `node tests/urdu-locale-generated-contract.test.js`, and live Playwright checks confirming the new link renders on both locales without pushing the mobile mic button below the fold.

Net: one real content gap closed, one stale generated-file gap closed (sitemap/robots), everything else on the §7/§5.2/§7.3 checklist was already correct.

### 2026-08-22 — Slice A baseline recorded, three metadata defects fixed

Baseline captured for both voice owner routes (live-rendered, Playwright-verified):

```text
EN  /tools/urdu-voice-typing
    title: Urdu Voice Typing — Speak Urdu to Text Online | WriteUrdu
    h1: Urdu Voice Typing
    canonical: https://write-urdu.com/tools/urdu-voice-typing
    hreflang: en/ur/x-default reciprocal, correct
    schema: WebSite, Organization, WebPage, BreadcrumbList, WebApplication

UR  /urdu/tools/urdu-voice-typing
    title: اردو وائس ٹائپنگ | بولیں اور اردو متن حاصل کریں | WriteUrdu
    h1: اردو وائس ٹائپنگ
    canonical: https://write-urdu.com/urdu/tools/urdu-voice-typing
    hreflang: en/ur/x-default reciprocal, correct
    schema: WebPage, WebApplication
```

Search Console evidence not yet available for these routes (too new); baseline above is technical/on-page only.

Three defects found and fixed as baseline-preserving corrections (not SEO experiments — no title/copy invented, only pre-existing drift removed):

1. `js/urdu-voice-typing.js` `restorePageIdentity()` unconditionally overwrote `document.title`/H1 with stale hardcoded strings on every load and locale-change, silently downgrading the Urdu owner's title/H1 (lost the `اردو وائس ٹائپنگ` query term from section 5.2, lost brand-consistent title) below what the HTML source and seo.config.js already declared. Removed the override; page now trusts static HTML + seo.js as intended.
2. Removing (1) exposed that `seo.config.js`'s EN title (`Speak to Type Urdu Online`) had drifted from the HTML file and this spec's own §4.6 baseline (`Speak Urdu to Text Online`). Realigned `seo.config.js` to the documented baseline.
3. The Urdu HTML's static `ld+json` carried an empty `FAQPage` node (no `mainEntity`, no visible FAQ content anywhere on the page) — a direct §7.1 violation. Removed it, and dropped the matching `FAQPage` entry from `seo.config.js`'s schema list for the EN route (already inert there via `js/seo.js`'s entity guard, but declared a type that renders nothing).

A fourth issue was found while checking §6.1's mobile requirement: on a 375×667 viewport the real "Start voice typing" button sat below the fold (y≈865–935) on both routes — the decorative hero-demo aside (mic icon + waveform + example sentence) and several redundant description paragraphs pushed it down, violating §4.3's non-negotiable invariant. Fixed in `css/urdu-voice-typing.css`'s `max-width: 600px` block: hero-demo, benefit-pill row, workspace-header paragraph and control-column paragraph are hidden at that width (visual only — no DOM/copy removed, no a11y-critical content lost since the button/H1 already carry the accessible name), and the mic icon is shrunk. Start button now lands at y≈482–552 on both routes, comfortably above the fold. Verified with `tests/voice-mobile-acceptance.spec.js` (4/4 pass, desktop + mobile-chromium projects) plus a direct Playwright bounding-box check.

Verified after fix: `npm run seo:check`, `npm run governance:check`, `tests/urdu-voice-typing-contract.test.js`, `tests/voice-account-analytics-contract.test.js`, `tests/voice-mobile-acceptance.spec.js` all pass; live title/H1/schema/mobile-fold re-checked via Playwright on both routes.

### 2026-08-22 — Slice B verified already complete, no changes needed

Audited all `§8` discovery rows against live rendering (not just source) before building anything:

- Homepage: `.wu-voice-entry-home` banner after `.home-hero-actions` (`site-header.js`) — confirmed live.
- Urdu Keyboard / Rich Editor: contextual next-step card to the voice tool (`workspace-journey-registry.js` + `core-continuity.js`) — confirmed live on both.
- My Documents: `.my-documents-hero` entry wired in `site-header.js`; route is a Pages Function so it can't render on the static dev server, but the wiring and `tests/urdu-voice-typing-contract.test.js` confirm it.
- Tools/outcome navigation + Footer: `js/outcome-navigation.js`'s `GROUPS`/`FOOTER_GROUPS` already include voice, rendered into the global header nav and footer on every page, both locales — confirmed live (`/`, `/urdu/`).

Nearly duplicated two things before catching it via live verification: (1) added a footer link directly in `js/site-header-core.js` before discovering `outcome-navigation.js` fully overwrites `.wu-footer-nav` at runtime, making that edit dead code — reverted, no diff left. (2) Started designing a new `voice_account_source_*` D1 table for source→route attribution before discovering `js/acquisition-telemetry.js` (loaded via `js/ads.js`, already active on this page, already classified as `page_type: create`) already posts `{route, locale, page_type, acquisition_channel}` per pageview to `/api/acquisition`, persisted via migration `0008_locale_metrics.sql`'s `site_hourly_locale_entry_routes`, and already reported per-route in `functions/api/internal/acquisition-pulse.js`. No new table needed or built.

Net: Slice B required no code changes. Every acceptance item is already met by existing shared infrastructure predating this epic. Only §5.3/§13D's support-guide contextual links remain open, correctly gated behind Search Console evidence (Slice D).

### 2026-08-22 — Voice typing promoted to a dedicated growth epic

Founder observation: the shipped Urdu voice typing feature is performing well enough to warrant strategic acquisition investment.

Decision:

- preserve `WU-TOOLS-EXPANSION-004` as the behavior/quality contract;
- create `WU-GROWTH-003` as the acquisition, SEO, discovery, continuation and measurement layer;
- preserve existing English and Urdu owner routes;
- prefer one strong owner plus evidence-backed support pages over keyword proliferation;
- treat search baseline + activation telemetry as Slice A so later SEO changes are measurable;
- integrate voice with the shared product journey, account continuity and share systems rather than creating parallel voice-specific infrastructure.
