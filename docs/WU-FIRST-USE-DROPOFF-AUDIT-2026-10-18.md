# First 30 Seconds: Drop-off Investigation (2026-10-18)

Scope: the Product Pulse panels "How much people write" and "Active usage time", and the first-use journey on `/`, the Basic Writer. The method was measurement first: code trace, production D1 rollups, then real browser journeys against production (ads and analytics blocked, telemetry intercepted so no test traffic reached production data).

## A. Executive diagnosis

**The headline numbers do not mean what they appear to mean.** Most of the apparent "people leave before writing" signal comes from measurement, not from users:

1. **The "0 characters" bucket was mostly fake engagement.** Until PR #277 (deployed 2026-10-17 ~21:00 UTC), page load itself marked every Basic Writer visit as "engaged". In the 7 days before the fix, 88.9% of Basic Writer visits counted as engaged (2,488 / 2,800), and 57.7% of their summaries were 0 characters. In the first 11 hours after the fix, 35.5% of visits counted as engaged and 34.9% of summaries were 0 characters. The dashboard screenshot spans both periods.
2. **The "1–20 characters" bucket is mostly a different product.** The panel mixes every tool. In the screenshot's 24-hour window, Stylish Text supplies 56 of the 102 "1–20" sessions. Stylish Text users style a name or short phrase, so short text there is success, not failure.
3. **Successful Basic Writer sessions were systematically dropped (confirmed, now fixed).** Every Basic Writer toolbar click, including **Copy**, queued an event name the server did not recognise. The server then rejected the *whole batch* of up to 10 events, so `copy_completed`, `writer_outcome_first` and any `session_summary` queued alongside were lost. Over 7 days, Basic Writer recorded **2** copies, while Stylish Text recorded **352**. Copying is the main way Basic Writer users finish a task, so the length chart was biased *against* successful users.
4. **The real, trustworthy activation signal is Urdu success ÷ visits.** Before #277 this was desktop 34.9% and mobile 18.8%. In the first 11 hours after #277 it was desktop 40.9% (36/88) and mobile 8.2% (4/49). The post-fix mobile sample is too small to judge. Mobile is the weaker funnel in both periods: only 20–31% of mobile visitors ever focus the editor.

**Proven UX/technical problems** (independent of analytics):

- The homepage has severe layout shift. Lab CLS is 1.78 on Android emulation and 0.93 on desktop (good is under 0.1). At first paint the mobile editor sits at y=1357, below the fold, then jumps to y=446 within about 450 ms as JavaScript rebuilds the toolbar and shell.
- At 1366×768, the most common laptop size, only about 116 px of the editor is visible on arrival. The hero, a voice promo card, a "Two ways to write Urdu" box, the toolbar and an example strip all stack above it.
- On a constrained network (400 kbps, 400 ms RTT, 4× CPU), first paint takes 19 s. The largest download is a 324 KB PNG video poster far below the fold. `preload="none"` does not stop poster images from loading.

**Not proven:** that visitors leave because they *cannot* use the tool. Every persona completed its core task on production. The likely drivers of short sessions are quick completed tasks, intent mismatch and mobile focus friction, but the data cannot yet separate these. Section F lists what would.

## B. Analytics validity assessment

### Pipeline

`js/product-telemetry.js` (client) → `POST /api/events` (`functions/api/events.js`), which validates against an allow-list and upserts **hourly rollups** only. The raw `product_events` table is empty in production. `functions/api/internal/product-pulse.js` sums rollups for a 1/7/30-day window, and `os/product-pulse.html` + `js/product-pulse.js` render them.

### Answers to the Phase A questions

| # | Question | Finding |
|---|---|---|
| 1 | What is a "session"? | A **page view**. `session_summary` is sent at most once per page load. A per-tab `session_id` exists but rollups are not deduplicated by it. |
| 2 | What creates a summary? | The `pagehide` event, only if the page was "engaged". |
| 3 | What is "engaged"? | Any call to `markEngaged()`. That includes trusted editor `input/paste/change`, and before this fix also **any keyup**. It also includes input-mode button clicks, toolbar clicks, voice actions, creation-tool interactions, and before #277 page load (`voice_exposed`). |
| 4 | Why can an engaged session have 0 characters? | Reproduced on production. Shift/Alt alone in the autofocused desktop editor, a mode-button tap, or a Speak Urdu tap all mark engagement with an empty editor. So does typing then clearing, or whitespace only. |
| 5 | What is counted? | Final editor content at page close, trimmed, in characters (`textarea.value` or TinyMCE text). It is not keystrokes or converted output. |
| 6 | Pasted text? | Yes, because it is content at close. Paste also marks engagement. |
| 7 | Phonetic/IME typing? | Yes, because it is content at close. |
| 8 | Paste then copy? | Content is counted, but the **copy was dropped server-side** (see B.1). |
| 9 | Tool navigation? | Each page load is a separate summary. A Basic → Rich handoff produces two. |
| 10 | Tab close reliability? | `pagehide` is unreliable when mobile browsers discard background tabs. Strongly suspected: after the fix, mobile summaries (16) exceed mobile first inputs (7) in the same hours, which fits summaries arriving hours after the page view. Rollups are bucketed by **receipt** time. |
| 11 | visibilitychange/pagehide loss? | `visibilitychange: hidden` flushes the queue but does not send a summary. Only `pagehide` does. |
| 12 | Double counting? | Refresh and bfcache restore can each produce a summary. No cross-page deduplication. |
| 13 | Errors blocking records? | **Yes, confirmed.** See B.1. |
| 14 | Bots/internal visits? | No bot or internal filtering at ingestion (only an origin check). Bots rarely produce trusted input, so they mostly add to `visits`, not to summaries. Before #277, bots that ran JavaScript and fired `pagehide` produced 0-character "engaged" summaries. |
| 15 | Why different denominators? | Both panels count the same `session_summary` events. Pages with no text editor (`content` pages, invoice) send a summary with an active-time bucket but no length bucket: 9 of 345 in the screenshot window. |

### B.1 Confirmed analytics defects

| ID | Defect | Evidence | Status |
|---|---|---|---|
| AN-1 | One unknown event name made `/api/events` reject the whole batch | Local endpoint run: `basic_toolbar_action + copy_completed + session_summary` returned `400 invalid_event`. D1: 2 Basic Writer copies in 7 days. The client emits ~25 event names the server does not know: `basic_toolbar_action` (every Basic Writer toolbar click since 2026-08-18), `billing_*`, `typing_practice_*`, `roman_conversion_*`, `ai_writing_*`, `card_image_share_*`, `whatsapp_status_ready_made_*`. Each one also took down the valid events batched with it. | **Fixed**: invalid events are now dropped individually |
| AN-2 | `basic_toolbar_action` went through `trackOutcome()`, so opening a menu counted as `writer_outcome_first` | Browser spec reproduced it | **Fixed**: now a plain event plus engagement |
| AN-3 | `writer_first_input` fired with an empty editor (mode tap, modifier keys, toolbar click) | Reproduced on production and locally. This inflates Gate B2's primary metric, `mobile writer_first_input / visits`. | **Fixed**: requires non-empty editor text |
| AN-4 | Keyup alone started engagement (Shift/Alt layout switch in the autofocused desktop editor) | Reproduced on production | **Fixed**: keyup only keeps an engaged session active |
| AN-5 | Length panel mixes all tools under the label "Engaged writing sessions only" | D1 per-tool breakdown | **Relabelled**. A per-tool view is recommended (P2). |
| AN-6 | Speak Urdu tap counts as `writer_first_input` and `writer_outcome_first` with no text | Reproduced on production | **Fixed** (owner decision, 2026-10-18): voice select/start/final/error are now interactions. They engage the session and keep `input_mode=voice`, but never record `writer_outcome_first`. Urdu success is still detected from the committed text. |
| AN-7 | Summaries attributed to receipt hour; `pagehide`-only | Strongly suspected (see Q10) | Not changed. Changing it breaks comparability; needs its own slice. |
| AN-8 | Rich Editor has no copy-completion tracking | D1: 0 Rich Editor copies in 7 days | Not changed |
| AN-9 | Copy-continuation shown/share/dismiss measurements (Slice 4) were never recorded | They travel inside `basic_toolbar_action`, which the server does not accept and whose `action` field the payload does not carry | Not changed. Needs a bounded action dimension and a rollup. |

### Which numbers to trust

- **Trust:** `writer_first_urdu_success ÷ visits` by device (`product_hourly_device_metrics`), export counts, Stylish Text copies, visits.
- **Do not trust before this fix deploys:** Basic Writer copies and outcomes, `writer_first_input`, engaged visits, the "0" length bucket, and anything on Typing Practice, Bill Generator, Roman converter or Urdu Cards share flows that relied on co-batched events.
- **Interpret with care:** active time. One interaction adds up to 15 s, so "11–30 s" largely means "one burst of interaction". It is not time on page.

## C. Persona journeys (production, Playwright, Chromium)

Every result below is **emulated** (Pixel 5 profile or 1366×768 desktop). No physical devices were used, and real Android IMEs (Gboard composition) were not reproduced.

| Persona | Task | Done? | Notes |
|---|---|---|---|
| 1 Android, `mera naam abaid hai` | Type, copy | Yes | Editor top at y=446 after settle (281 px visible). Output `میرا نام عبید ہے` is correct. Copy appears only once there is text, top of screen while typing. The toast confirmed the copy. Client emitted `copy_completed`; **the server would have rejected that batch** (AN-1). |
| 2 Android, `Assalam o Alaikum` | Type, copy | Yes, with a quality issue | Output `اسسلام و علیکم`, a misspelling of `السلام علیکم`. This is the Google Input Tools engine, not site code. A wrong-looking greeting is a plausible reason for a quick exit (unverified). |
| 3 Desktop, paragraph | Type, copy | Yes | Autofocus on load, but only about 116 px of the editor is visible at 1366×768. `bahar` became `بہار` ("spring") instead of `باہر` ("outside"): ambiguous words need the suggestion list. |
| 4 Native Urdu input | Direct Urdu | Partly | Inserted Urdu text works (trusted `insertText`). A real Urdu OS keyboard and cursor editing were **not** verified. |
| 5 From Google | Typing intent | Not verified | `/` gets 1,446 Google entries a week. Title and H1 say "English to Urdu Typing Online", which matches transliteration. Whether a share of visitors wanted *translation* needs Search Console query data. |
| 6 Slow network | Load | Degraded | FCP 19 s, load 38 s, CLS 1.62, editor not visible within 15 s. Largest transfer is a 324 KB video poster PNG. |
| 7 Paste, fix, copy | Paste, copy | Yes | Works. The analytics loss is the same as Persona 1. |
| Idle visitor | Nothing | — | No summary is sent (correct): an idle bounce never appears in either panel. |

Console: only blocked-ad errors and expected `401`s from signed-out account endpoints (`/api/documents` etc.). No JavaScript exceptions on `/`.

## D. Technical issues

| ID | Issue | Evidence | Severity | Confidence |
|---|---|---|---|---|
| T-1 | Homepage CLS 1.78 (Android) / 0.93 (desktop) in the lab. The editor moves 1357→490→446 px in about 450 ms after first paint. Main sources: `.container`, `.batch-transliteration-panel`, `.editor-chrome` and `#demo` re-flowing while `basic-writer-command-toolbar.js` rebuilds the toolbar. | Layout-shift observer in `perf.js` (scratch probe) | High: tap targets move under the finger; CLS is a Core Web Vital | Confirmed (lab); field CLS not checked |
| T-2 | Video poster PNGs (324–479 KB) load eagerly despite `preload="none"` | Resource timing, slow profile | Medium on slow networks | Confirmed |
| T-3 | Transliteration accuracy for common greetings and ambiguous words | Personas 2 and 3 | Medium | Confirmed output; impact on exits unverified |
| T-4 | Rich Editor mobile test "effective viewport shrinks" is flaky | Fails 3 of 10 runs on clean `origin/main` | Low (test) | Confirmed, pre-existing |

## E. UX issues

- **E-1 Desktop editor below the fold at 1366×768** (confirmed). Five blocks precede the editor. The voice promo card competes with the primary task in the hero.
- **E-2 Mobile focus gap** (confirmed by data). 20–31% of mobile visitors focus the editor, versus 79–81% on desktop, where autofocus inflates the figure. T-1 makes the first tap unreliable.
- **E-3 Explanation repeats** (observed). The intro paragraph, the "Two ways to write Urdu" box and the example strip all explain the same thing.
- **E-4 Copy discoverability** is fine once text exists (Copy is first in the toolbar). Before text exists it is hidden by design.

The AdSense in-page drift above the mobile editor (2026-10-17 note) was **not re-checked**: ads were blocked on purpose, to avoid generating automated ad traffic. The owner should confirm in the AdSense account that in-page Auto Ads are excluded on `/`.

## F. Prioritised action plan

**P0, done in this change:** AN-1 batch rejection, AN-2 toolbar outcome inflation, AN-3 first-input inflation, AN-4 keyup engagement, AN-5 labels, AN-6 voice actions as outcomes.

**P1, recommended next slices (one PR each):**
1. **T-1 CLS.** Make the static homepage markup match the final toolbar and shell layout, or reserve space, so the JavaScript rebuild does not move the editor. Acceptance: lab CLS < 0.1 at 390×844 and 1366×768, with no change to the protected `#transliterateTextarea` contract.
2. **T-2 Poster images.** Attach `poster` only when the video nears the viewport, or serve compressed WebP/JPEG posters. `tests/product-video-embed-contract.test.js` pins the file names.
3. **E-1 Desktop first viewport.** At 1366×768, bring the editor top inside the viewport, for example by collapsing the "Two ways" box into the example strip. This needs owner sign-off because it touches homepage hierarchy.

**P2, measurement:**
1. Per-tool filter on the length and active-time panels.
2. Send `session_summary` on the first `visibilitychange: hidden` as well as `pagehide` (AN-7), behind a release marker.
3. Add the event names in AN-1 to the server allow-list **only** where a rollup will use them. Otherwise remove the client calls.
4. Bounded time-to-first-input bucket (already specified in `WU-PLAT-002H-MOBILE-ACTIVATION-REPAIR.md` §9.1).
5. Rich Editor copy completion (AN-8).

**P3, separate projects:** transliteration accuracy (custom dictionary for common greetings), translation-intent entry point if Search Console confirms demand.

## G. Implemented fixes

| File | Change | Why |
|---|---|---|
| `functions/api/events.js` | Drop unrecognised events individually; reply `202 {accepted, dropped}`; still `400` when nothing is valid; the 10-event limit is unchanged | AN-1 |
| `js/basic-writer-command-toolbar.js` | Non-voice toolbar clicks call `engage()` + `track('basic_toolbar_action')` instead of `trackOutcome()` | AN-2. `write-urdu:outcome` listeners only react to copy/export/print, so behaviour is unchanged. |
| `js/product-telemetry.js` | `writer_first_input` requires non-empty trimmed editor text; textarea and TinyMCE `keyup` only refresh activity | AN-3, AN-4 |
| `js/product-telemetry.js` `trackInteraction()`; `js/basic-writer-command-toolbar.js`, `js/writer-voice-input.js` | Writer-initiated voice events use `trackInteraction` instead of `trackOutcome` | AN-6 |
| `os/product-pulse.html` | Accurate panel notes and tooltips | AN-5 |
| `sw.js` + 12 contract tests | Shell cache v70 → v71 | Ship the updated precached toolbar script |
| `tests/telemetry-batch-resilience.test.js` | New contract test | Mixed batches are accepted, fully invalid batches rejected, batch limit kept |
| `tests/first-use-telemetry-integrity.spec.js` | New browser spec (desktop and mobile) | Modifier keys, mode taps and menu clicks are not input or outcomes; typing and Copy are |

Privacy: no new fields. Payloads still carry no text, filenames or identifiers.

## H. Measurement plan

**Release boundary:** the deploy time of this change. Compare **7 clean days after deploy plus 48 h** (to let service-worker caches turn over) against the same weekdays afterwards. Do not compare against pre-#277 data for engagement or first-input metrics.

Primary metrics, all per device on `/`:
- `writer_first_urdu_success ÷ visits` (trusted across releases).
- `copy_completed ÷ writer_first_urdu_success`. **Expect a step change from ~0 that is measurement, not UX improvement.**
- `writer_first_input ÷ visits` (new semantics: text reached the editor).
- `writer_outcome_first ÷ writer_first_input`.

Secondary metrics: 0-character share of Basic Writer summaries (expected to fall further from the AN-4 fix alone), mobile versus desktop gap, Google versus direct entries (`site_hourly_entry_routes`).

Do not claim any UX improvement from this change. It only makes the numbers honest.
