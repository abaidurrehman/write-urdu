# WU-SEO-CTR-001 — SERP CTR and Intent Optimization

**Status:** Groomed / ready for implementation  
**Primary dependency:** `WU-SEO-ETU-001`  
**Primary route:** `/`  
**Secondary route:** `/urdu-keyboard`  
**Area:** Search acquisition / SERP CTR / intent ownership  
**Priority:** P0

## Purpose

Improve click-through rate and search-result clarity for Write Urdu's highest-impression queries **without undoing the query-ownership and plain-language decisions already implemented in `WU-SEO-ETU-001`**.

This specification is a follow-on optimization layer. It does not reopen the architecture decision that the established homepage is the single product owner for broad **English to Urdu typing**, **Urdu typing online**, and related English-letter Urdu input intent.

The goal is to make the existing search ownership perform better by:

- verifying what Google is actually showing after the latest recrawl;
- measuring query-to-page ownership before changing architecture;
- improving SERP promise and first-screen proof where evidence supports it;
- strengthening `/urdu-keyboard` for genuinely distinct direct-keyboard intent;
- running controlled title/description experiments only after a stable comparison window;
- preventing repeated SEO changes before Google has had time to reprocess the previous change.

## Why this follow-on exists

A newer feedback snapshot reports the following visible Search Console performance:

| Query | Impressions | Clicks | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| english to urdu typing | 31,966 | 25 | 0.1% | 7.4 |
| urdu typing | 10,309 | 199 | 1.9% | 6.5 |
| urdu writing | 5,290 | 82 | 1.6% | 6.4 |
| urdu typing online | 3,526 | 111 | 3.1% | 5.6 |
| urdu keyboard online | 3,403 | 26 | 0.8% | 8.1 |

Across those five queries, the snapshot contains **54,494 impressions and 443 clicks**, an aggregate CTR of roughly **0.81%**.

The most important signal is not a new keyword. It is the continued scale of **`english to urdu typing`** and the exceptionally weak CTR at a mid-page-one average position.

This strengthens the existing `WU-SEO-ETU-001` decision:

- the homepage must remain the strongest English-to-Urdu typing owner;
- public wording must match the language users actually search;
- technical terminology must not become the primary acquisition vocabulary;
- broad keyword-clone landing pages must not be created simply to repeat the same tool and intent.

## Governing decisions inherited from WU-SEO-ETU-001

The following are **not open for redesign in this initiative unless new Search Console evidence proves the current ownership is wrong**:

1. `/` remains the single broad product owner for:
   - English to Urdu typing;
   - Urdu typing online;
   - Urdu writing where the user's first job is to write Urdu;
   - typing Urdu with English letters;
   - English-keyboard Urdu input.

2. `/urdu-keyboard` remains the product owner for:
   - Urdu keyboard online;
   - direct Urdu-character input;
   - on-screen Urdu keyboard intent;
   - physical-keyboard Urdu character entry.

3. `/urdu-editor` remains the product owner for richer document formatting and export intent.

4. `/roman-urdu-transliteration` remains a supporting explanation/guide route, not the primary owner for the large English-to-Urdu typing query.

5. The public acquisition language must prefer:
   - English to Urdu typing;
   - Urdu typing;
   - Urdu writing;
   - type Urdu using English letters;
   - English letters → Urdu;
   - Urdu keyboard.

6. `Roman Urdu` may be used as secondary explanatory language where useful, but it must not displace the larger English-to-Urdu query language in the homepage title, H1, hero, primary editor controls, or primary instructions.

7. `transliteration`, `phonetic conversion`, and similar linguistic/technical terms must not be required vocabulary for understanding or using the core experience.

## Explicitly rejected recommendations

This initiative must **not** create keyword-clone routes such as:

- `/english-to-urdu-typing`;
- `/english-urdu-typing`;
- `/urdu-typing`;
- `/urdu-writing` when it would duplicate the homepage's writing job;
- `/roman-urdu-to-urdu` when it would duplicate the existing Roman-focused guide and homepage interaction.

A new route is allowed only when it represents a **genuinely different user job**, has materially different interaction/content, and Search Console evidence shows that the existing owner cannot satisfy the intent cleanly.

Do not create pages whose primary difference is a swapped keyword in the title, H1, URL, or supporting copy.

## Core diagnosis

The current problem should be treated in this order:

1. **Verify what Google is showing.**
2. **Verify which page owns each query.**
3. **Allow the latest acquisition changes to be recrawled and reprocessed.**
4. **Measure the new baseline.**
5. **Only then run a controlled SERP experiment.**

Do not jump directly from low CTR to new URLs.

At an average position around 7.4, a 0.1% CTR for `english to urdu typing` is weak enough to justify investigation, but it does not by itself prove that the homepage architecture is wrong.

Possible causes include:

- Google still showing an older title/snippet after recent changes;
- Google selecting a different title from page content;
- query impressions split across more than one URL;
- mobile/country segments with unusually weak CTR;
- competing results presenting the task more explicitly;
- a SERP promise that does not make the input→output result concrete enough;
- historical canonical/host consolidation effects still working through Google's index.

## Workstream A — Recrawl and indexed-SERP verification

Before changing title, description, H1, canonical, or route architecture again, verify the current production/indexed state.

### Required checks

For `/`:

- live HTTP response is successful;
- canonical is `https://write-urdu.com/`;
- initial HTML title is the intended current search title;
- initial HTML description is the intended current search description;
- H1 is present in static HTML;
- no JavaScript-only generic title overrides the intended acquisition title;
- Google-selected canonical, when available from Search Console, matches the non-www homepage;
- indexed title/snippet is recorded with date;
- URL Inspection last-crawl date is recorded with date;
- no stale `www` version is competing as the selected canonical.

For `/urdu-keyboard`:

- self canonical is correct;
- title/H1 clearly describe direct Urdu keyboard input;
- page is indexable in initial HTML;
- Google is not treating the homepage as the better owner for keyboard-specific queries.

### Evidence artifact

Create a dated short record under `docs/` or the existing SEO measurement system containing:

- observation date;
- query;
- Google-selected landing page where available;
- indexed/search title observed;
- indexed/search snippet observed;
- last-crawl date where available;
- device/country segment if material;
- whether the result appears to reflect the latest deployed metadata.

This artifact is evidence, not a new strategy document.

## Workstream B — Query-to-page ownership audit

For each priority query, record the URL receiving impressions/clicks.

### Priority queries

- `english to urdu typing`;
- `urdu typing`;
- `urdu writing`;
- `urdu typing online`;
- `urdu keyboard online`;
- meaningful Roman-specific secondary queries.

### Expected ownership

| Query family | Expected primary page | Reason |
| --- | --- | --- |
| English to Urdu typing | `/` | Actual live typing tool and established mature-domain owner |
| Urdu typing online | `/` | Same broad writing job and multiple input modes |
| Broad Urdu typing | `/` | Homepage provides the primary writing interaction |
| Direct Urdu keyboard | `/urdu-keyboard` | Distinct direct-character input job |
| Rich document formatting | `/urdu-editor` | Distinct formatting/export job |
| Roman-specific explanation | `/roman-urdu-transliteration` | Supporting educational intent |

### Escalation rule

If one query is split meaningfully across multiple Write Urdu pages, investigate internal links, titles, H1s, canonicals, and page purpose before creating any new page.

## Workstream C — Homepage first-screen proof

The homepage must remain an interactive product first.

Where the current design can support it without pushing the editor down or creating clutter, make the input/output promise concrete near the writing experience.

Preferred proof pattern:

- input example: `mera khayal hai`;
- output example: `میرا خیال ہے`;
- plain-language explanation: type Urdu words using English letters and press Space;
- clear `Copy text` action;
- clear input-mode distinction:
  - `English letters → Urdu`;
  - `Type Urdu directly`.

### Guardrails

- do not introduce a separate content-heavy SEO hero above the editor;
- do not move the active writing surface materially lower on the page;
- do not add another ad inside the writing surface;
- do not add technical linguistic explanations to the first task;
- do not make `Roman Urdu` the dominant visible phrase;
- do not add a large decorative illustration when an actual input/output example provides stronger proof.

## Workstream D — `/urdu-keyboard` intent strengthening

`urdu keyboard online` is a genuinely different job and should be optimized independently.

The page should communicate, in the first useful viewport:

- direct Urdu-character input;
- on-screen Urdu keyboard;
- physical keyboard support where actually supported;
- right-to-left Urdu writing;
- copy/save actions;
- no software installation required;
- mobile/touch usability where actually supported.

English-letter Urdu conversion may be offered as a secondary route/mode, but it must not become the keyboard page's primary promise.

### Metadata direction

Do not mechanically adopt a suggested title without validation. Candidate language may include:

- `Urdu Keyboard Online`;
- `Type Urdu Online`;
- `No installation required`;
- `On-screen Urdu keyboard`.

The implementation should preserve natural wording and current page capability rather than keyword repetition.

## Workstream E — SERP message experiments

### Change freeze before experiment

The August 19–22 acquisition/title/H1 changes must be given a stable recrawl/reprocessing window before another homepage metadata change.

Do not change the homepage search title repeatedly in response to day-to-day movement.

A new experiment may begin only when one of these conditions is met:

- Search Console/URL Inspection evidence indicates Google has recrawled the latest version and the result has been stable long enough for a meaningful comparison; or
- a clear technical defect is found, such as stale initial HTML metadata or an incorrect canonical.

### Experiment design

Change **one primary SERP variable at a time** where practical.

Preferred order:

1. title;
2. description;
3. only then supporting first-screen wording if needed.

Do not simultaneously change title, H1, description, canonical, route ownership, and major page content and then attempt to attribute CTR movement.

### Candidate title direction

The current title is the baseline:

`English to Urdu Typing Online | WriteUrdu`

Future candidates should remain plain-language and exact-task-led. Example directions:

- `English to Urdu Typing Online – Type Urdu with English Letters | WriteUrdu`
- `English to Urdu Typing Online – Copy Urdu Text | WriteUrdu`

These are experiment directions, not pre-approved replacements.

Do **not** make `Roman Urdu Converter` the primary title phrase unless future query evidence demonstrates that this wording materially improves the dominant search intent without weakening the larger English-to-Urdu vocabulary.

## Workstream F — Measurement and decision rules

### Primary metrics

For each priority query and landing page, monitor:

- impressions;
- clicks;
- CTR;
- average position;
- landing page;
- device;
- country where material;
- search appearance where available.

### Product-quality metrics

CTR improvement is not sufficient if incoming users do not use the product.

Where existing privacy-safe aggregate telemetry supports it, compare:

- page entry;
- editor start/use;
- copy action;
- export action;
- movement to another Write Urdu workspace.

Do not add raw typed Urdu text, search queries, full referrers, user identity, IP addresses, or other unnecessary personal/content telemetry for this initiative.

### Initial success threshold

For `english to urdu typing`, the first objective is not a ranking promise. It is to improve CTR from the reported **0.1%** while preserving or improving query ownership and average position.

A practical first validation milestone is:

- sustained CTR improvement toward **1%+** over a comparable period;
- no material loss of homepage ownership for the query;
- no new cannibalization from supporting pages;
- no reduction in actual editor usage from the acquired traffic.

A move toward 1–2% CTR would be commercially meaningful at the reported impression scale, but this is a measurement target rather than a guarantee.

## Workstream G — SEO change log discipline

Every meaningful homepage SERP experiment must have a dated entry containing:

- deployment date;
- previous title/description;
- new title/description;
- reason for change;
- query(s) being tested;
- baseline comparison window;
- evaluation window;
- result;
- keep/revert/follow-up decision.

This prevents memory-driven or feedback-driven churn.

### One-change-at-a-time rule

When possible, do not combine a search-message experiment with unrelated major homepage UX work.

If product changes must ship in the same period, record them so later interpretation does not falsely attribute all movement to metadata.

## Workstream H — Internal-link clarity

Maintain descriptive, intent-aware internal anchors.

Preferred examples:

- `English to Urdu typing` → `/`;
- `type Urdu with English letters` → `/`;
- `Urdu keyboard online` → `/urdu-keyboard`;
- `Urdu Rich Text Editor` → `/urdu-editor`;
- Roman-specific explanatory anchor → `/roman-urdu-transliteration`.

Avoid creating a site-wide pattern where every page targets every broad keyword.

Internal links should reinforce page ownership, not blur it.

## Out of scope

This initiative does not include:

- building an English→Urdu semantic translation product;
- creating multiple near-duplicate SEO landing pages;
- changing the canonical host away from non-www;
- changing Urdu locale architecture;
- introducing a new database;
- adding raw query-level or user-content telemetry to D1;
- building typing tests/practice unless separately justified as a distinct product job;
- adding new ad units inside active writing workspaces.

## Implementation order

### Phase 0 — Evidence first

1. Confirm current live metadata and canonicals.
2. Confirm Google recrawl/indexed state where Search Console evidence is available.
3. Export/record query→page mapping.
4. Establish the post-August-19 baseline.

### Phase 1 — Distinct-intent strengthening

1. Tighten `/urdu-keyboard` around direct keyboard intent if the audit finds gaps.
2. Improve descriptive internal anchors where they currently blur ownership.
3. Add/adjust compact homepage input→output proof only if it improves clarity without delaying the editor.

### Phase 2 — Controlled SERP experiment

1. Select one title or description hypothesis.
2. Record baseline and deployment date.
3. Deploy without changing canonical/ownership.
4. Allow Google to recrawl/reprocess.
5. Compare a complete, comparable measurement window.
6. Keep, revert, or iterate based on evidence.

### Phase 3 — Architecture review only if evidence requires it

Only reopen page ownership if Search Console demonstrates that the current page cannot own a genuinely distinct intent despite clear metadata/content/internal-link separation.

## Acceptance criteria

### Architecture protection

- [ ] `/` remains the only broad English-to-Urdu typing product owner.
- [ ] No `/english-to-urdu-typing` keyword-clone page is created.
- [ ] No broad `/urdu-typing` clone is created.
- [ ] Supporting pages retain distinct user jobs.
- [ ] Canonical non-www ownership remains intact.

### Evidence and process

- [ ] Current production title, description, H1, canonical, and indexability are verified before another homepage metadata change.
- [ ] Priority query→page ownership is recorded.
- [ ] Google recrawl/indexed-state evidence is recorded where available.
- [ ] A dated SERP experiment/change log exists before a new title test is shipped.
- [ ] The previous comparison window is preserved for measurement.

### Homepage

- [ ] `English to Urdu Typing Online` remains the primary acquisition job unless measured evidence approves a better plain-language variant.
- [ ] First-screen copy explains English letters → Urdu script in user language.
- [ ] The active editor remains prominent.
- [ ] Copy remains an obvious action.
- [ ] No technical terminology is required for the primary workflow.
- [ ] No new ad is placed inside the writing surface.

### Urdu keyboard

- [ ] `/urdu-keyboard` clearly owns direct Urdu keyboard intent.
- [ ] Direct character input is the dominant promise.
- [ ] Copy/save and no-install benefits are visible where accurate.
- [ ] The page does not compete with `/` by making English-letter conversion its primary promise.

### Measurement

- [ ] `english to urdu typing` CTR, position, clicks, impressions, and landing page are monitored.
- [ ] `urdu keyboard online` is monitored independently.
- [ ] Device/country splits are reviewed when they materially explain CTR.
- [ ] Product-use metrics are checked so higher CTR is not mistaken for success if editor usage degrades.
- [ ] No raw writing/user-content telemetry is introduced.

## Verification commands

Repository implementation changes should continue to pass the existing gates appropriate to the files touched:

```bash
npm test
npm run seo:check
npm run governance:check
npm run test:browser
npm run seo:production
npm run seo:live
```

For docs-only changes, avoid triggering unnecessary expensive CI beyond the repository's normal documentation policy.

## Decision summary

The low CTR is a real opportunity, but the correct response is **better evidence, clearer SERP promise, stronger distinct-intent pages, and controlled experimentation — not a new exact-match page for every query**.

The mature homepage already owns the most valuable job and already contains the live product. This initiative improves how that ownership is presented, measured, and iterated while protecting the authority accumulated by the existing URL.
