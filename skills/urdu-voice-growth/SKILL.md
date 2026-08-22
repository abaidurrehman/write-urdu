# Urdu Voice Typing Growth Implementation Skill

Use this skill when implementing `WU-GROWTH-003 — Urdu Voice Typing Growth & SEO`.

## Primary contracts

Read these before changing code or content:

- `specs/WU-GROWTH-003-urdu-voice-typing-growth-seo.md`
- `specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`
- `specs/WU-GROWTH-001-search-adsense-growth-system.md`
- `specs/WU-I18N-001-crawlable-urdu-locale.md`
- `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md`
- `specs/WU-GROWTH-002-account-save-share-entry-points.md`

`WU-GROWTH-003` owns discovery, SEO, activation, continuation and measurement. `WU-TOOLS-EXPANSION-004` remains authoritative for recognition behavior, permission handling, accessibility, browser support and transcript privacy.

## Core implementation rules

1. Preserve `/tools/urdu-voice-typing` as the English query owner.
2. Preserve `/urdu/tools/urdu-voice-typing` as the Urdu counterpart.
3. Do not rebuild or replace browser speech recognition as part of growth work.
4. Keep the microphone workspace above SEO/support content and visually primary.
5. Do not require signup before voice typing.
6. Never place transcript text, recognized words or audio in telemetry, URLs or logs.
7. Do not publish a page for every keyword variant.
8. Do not rewrite title/H1 before recording the current Search Console baseline.
9. Use existing shared journey, locale, SEO, telemetry and ad systems before adding route-specific infrastructure.
10. Keep ads out of the microphone/transcript workspace and preserve the post-workspace boundary.

## Slice execution order

### Slice A — baseline first

Before content or metadata churn:

- record current title/H1/meta/canonical/hreflang state;
- collect Search Console page/query/device evidence when available;
- record the current `voice_page_viewed → voice_typing_started → voice_transcript_received` funnel;
- confirm English/Urdu initial HTML and sitemap ownership;
- confirm mobile real-mic visibility;
- add only missing reporting needed to compare later changes.

Do not block safe technical fixes on missing Search Console data, but clearly separate baseline-preserving fixes from SEO experiments.

### Slice B — discovery and activation

Improve access through existing Write journey components:

- Write outcome/tool discovery;
- core writer contextual entry;
- keyboard/editor continuation where useful;
- My Documents creation entry when that surface supports shortcuts.

Avoid duplicate mic CTAs within the same viewport. Measure source → voice route and successful voice → next action without text content.

### Slice C — owner authority

Strengthen the two existing owners:

- useful below-workspace content;
- descriptive internal anchor text;
- canonical/hreflang/sitemap/OG/schema correctness;
- natural Urdu acquisition copy;
- concise compatibility/help content;
- no implementation jargon in the main value proposition.

The owner page is a working tool, not an article with a tool buried inside it.

### Slice D — support cluster

Only after evidence review, select 1–3 distinct support jobs. Candidate areas include mobile setup, computer/browser use, WhatsApp usage, punctuation and troubleshooting.

Every support page must:

- own a different job from generic Urdu voice typing;
- link prominently to the main voice tool;
- provide genuinely useful instructions/examples;
- avoid keyword repetition and near-duplicate copy;
- use the existing root-level guide route convention;
- remain unbuilt if evidence is weak.

### Slice E — distribution and experiments

Use actual product demonstrations for short-form content. Run one bounded SEO/CTA/internal-link experiment at a time with a baseline and change date.

Do not make unsupported claims about recognition accuracy, offline processing, privacy or browser compatibility.

## Existing files to inspect first

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
site-header.js
js/site-header-core.js
js/text-handoff.js
js/ads.js
```

Search for existing shared components/events before introducing a new helper or event sink.

## Analytics discipline

Preserve the existing minimum funnel:

```text
voice_page_viewed
voice_typing_started
voice_transcript_received
```

Possible downstream outcomes include copy, cleaner/editor handoff, save/share and creation handoff, but normalize them to the repository's current analytics taxonomy rather than duplicating concepts.

Allowed data is bounded event/category metadata. Forbidden data includes audio, transcript text, recognized words and raw browser error objects.

## SEO discipline

Treat these as query families, not separate URL requirements:

```text
urdu voice typing
urdu voice typing online
urdu speech to text
voice to urdu
speak urdu to text
آواز سے اردو لکھیں
بول کر اردو لکھیں
اردو وائس ٹائپنگ
```

Before changing title or description, record:

- current query impressions/clicks/CTR/position;
- current ranking URL;
- device mix;
- change date;
- hypothesis.

After an experiment, compare a meaningful period and record the result. Do not repeatedly rewrite metadata while Google is still recrawling/reprocessing the prior version.

## UX and monetization gates

The page must remain usable for someone who lands from Google and immediately wants to speak.

Reject changes that:

- push the real microphone below a long content block;
- insert ads into the microphone/transcript grid;
- require account creation before microphone use;
- overload the successful-result state with many next actions;
- expose technical/privacy caveats before the user understands the product;
- make unsupported browsers look broken instead of progressively enhanced.

## Verification

Run the current repository gates:

```text
npm test
npm run seo:check
npm run governance:check
npm run test:browser
```

Also perform the physical-device voice checks owned by `WU-TOOLS-EXPANSION-004` whenever implementation touches voice behavior, mic controls, visibility, lifecycle or permission UX.

For SEO/locale slices verify:

- English initial HTML;
- Urdu initial HTML/RTL;
- self canonicals;
- reciprocal hreflang;
- sitemap ownership;
- mobile workspace placement;
- no `.html` duplicate owner;
- post-workspace ad boundary;
- Search Console URL inspection after deployment where appropriate.

## Completion standard

Do not declare `WU-GROWTH-003` successful because a guide was published or metadata changed. Completion requires a measurable acquisition-to-product funnel, one clear English owner, one clear Urdu owner, strong internal discovery, preserved voice quality/privacy, and evidence-backed support content only where it earns a distinct search job.
