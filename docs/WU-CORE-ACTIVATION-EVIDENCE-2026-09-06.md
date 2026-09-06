# WriteUrdu Core Activation Evidence — 2026-09-06

**Source:** WriteUrdu OS → Product Intelligence → Product Pulse founder control-plane export captured 2026-09-06.  
**Purpose:** Convert the latest observed usage signals into bounded product decisions for `WU-PLAT-002H`.  
**Important:** These numbers are a dated decision baseline, not permanent product claims.

---

## 1. Executive read

The strongest new signal is **quality of product usage, not top-line traffic growth**.

Current-period Product Pulse reports:

- product visits: **5,323** (**+2%** vs previous period);
- engaged visits: **4,225** (**+19%**);
- engagement rate: **79.4%**;
- copy completions: **268** (**+191%**);
- exports completed: **593** (**-4%**).

This means the immediate roadmap should continue to favor **activation, continuation and post-value conversion** over another major feature launch.

The second important signal is that the product already has several healthy islands of value — especially Basic Writer, Rich Editor and Card Studio — while cross-tool continuation and distribution loops remain weak.

The third important signal is data quality: several funnel ratios exceed 100%, proving that repeated events / independent code paths are being divided by non-compatible denominators. **No new continuation or funnel UI should be optimized from those ratios until the denominator contract is normalized.**

---

## 2. Traffic and engagement

### 2.1 Product-level

| Metric | Current |
| --- | ---: |
| Product visits | 5,323 |
| Engaged visits | 4,225 |
| Engagement rate | 79.4% |
| Copy completions | 268 |
| Exports completed | 593 |

The previous period's engagement rate is not directly reported. Do not backfill it as a canonical metric from the percentage deltas; retain only the observed current value and reported deltas.

### 2.2 Device mix

Product visits by device:

- Desktop: **2,950**
- Mobile: **2,237**
- Tablet: **136**

Mobile therefore represents about **42.0%** of measured product visits.

Writer-workspace traffic by device:

- Desktop: **2,437**
- Mobile: **1,242**
- Tablet: **102**

### Product decision

Mobile remains strategically important, but the mobile editor repair shipped on 2026-09-03/04 and the owning backlog explicitly requires a stable post-change evidence window. **Do not start another speculative mobile redesign from this 2026-09-06 snapshot.** Finish the existing B2 acceptance/real-device evidence and wait for the planned 7-day post-release review before another material layout change.

---

## 3. Outcome mix

Current-period outcomes:

| Outcome | Count |
| --- | ---: |
| Copy | 268 |
| Export | 593 |
| Share | 85 |
| Print | 71 |
| Handoff | 88 |
| Batch transliteration | 30 |
| Canvas edit | 105 |
| Template use | 92 |
| Local image | 4 |

Export formats:

- PDF: **278**
- Word: **176**
- PNG: **138**
- JPEG: **1**
- TXT: **0**
- SVG: **0**

### Product decision

PDF, Word and PNG represent essentially all observed exports. The implementation may **prioritize** these proven outputs contextually, but it must not remove the lower-frequency formats merely because this snapshot is low-volume. Lower-frequency formats should remain reachable through the existing progressive/More surface unless a separate deprecation decision is approved.

---

## 4. Voice funnel and account signal

Dedicated voice funnel:

| Step | Count / rate |
| --- | ---: |
| Voice visitors | 298 |
| Tried voice typing | 91 |
| Visitor → try | 30.5% |
| Produced Urdu text | 51 |
| Try → Urdu success | 56% |
| New accounts | 19 |
| Total registered accounts | 45 |
| Voice-assisted sign-ups | 3 |
| Voice-try sessions → assisted signup | 3.3% |

Voice adoption across workspaces:

- mic exposed: **3,162**;
- voice started: **97**;
- final speech events: **1,427**;
- switch-to-manual: **9**;
- voice-led concluded sessions: **68.7%**.

Voice-enabled workspace detail:

| Workspace | Visits | Voice started |
| --- | ---: | ---: |
| Rich Editor | 864 | 83 |
| Basic Editor | 2,862 | 14 |
| Card Studio | 132 | 0 |
| Name Art | 120 | 0 |
| Urdu Keyboard | 55 | 0 |

### Product decision

Voice is still better treated as an **input mode that can produce a high-intent moment**, not as a standalone promotional destination only.

The strongest experiment candidate is a **post-success account/save request** after Urdu has actually been produced through Voice, but only under the existing one-growth-request arbitration rules:

- signed out;
- successful Urdu output has occurred;
- user still has unsaved work;
- no competing Keep/Share/Publish request is already active;
- no sign-up gate before voice use;
- no microphone/audio/transcript telemetry changes.

The 3 voice-assisted sign-ups are too small a sample to claim causality or a superior conversion rate. Treat the signal as a reason to test, not a conclusion.

---

## 5. First-value funnel: useful counts, invalid rates

Current counters:

- writer viewed: **3,147**;
- focused: **1,979**;
- first input: **2,880**;
- first Urdu success: **1,262**;
- first outcome: **2,693**.

The dashboard currently reports ratios such as:

- first input / focused: **145.5%**;
- first outcome / first Urdu success: **213.4%**.

These are not valid conversion rates. The counts are being assembled from events that are not all single-occurrence states in the same eligible population.

### Product decision

Before any funnel-based UI optimization:

1. materialize/derive **unique session-state transitions** for rate denominators;
2. preserve repeated event counters separately;
3. label event-frequency metrics as `events per start`, `results per start`, etc.;
4. never render a metric named `success rate`, `conversion`, or equivalent above 100%;
5. expose the actual denominator beside every funnel rate in Product Pulse.

This is **Slice 0** of the new conversion-repair execution contract.

---

## 6. Continuation is the largest actionable leak — but instrumentation must be fixed first

Current continuation counters:

- shown: **2,585**;
- selected: **88** (**3.4% shown → selected**);
- stored: **28**;
- destination ready: **10**;
- payload restored: **33**;
- meaningful start: **6**.

The sequence is internally inconsistent because `payload restored` exceeds `destination ready`. Product Pulse already notes that two independent handoff code paths are instrumented and a consolidation gap exists.

### Product decision

Do **not** immediately make continuation CTAs larger or more numerous.

Execution order:

1. normalize the two handoff code paths into a comparable funnel identity / denominator model;
2. verify `shown → selected → stored/created → destination ready → restored (when applicable) → meaningful start`;
3. identify which recommendations and source/destination pairs produce the loss;
4. only then change copy, placement or recommendation ranking;
5. preserve the maximum-three-continuation rule and remove/demote before adding.

After telemetry normalization, `shown → selected` is still a legitimate first diagnostic because both are already represented as a direct current-period count; however it must be split by recommendation/source workspace before UI conclusions.

---

## 7. Long-form writing is a real cohort

Engaged writing-session depth distribution:

- 1–20: **443**
- 21–50: **139**
- 51–100: **70**
- 101–250: **54**
- 251–500: **56**
- 501–1000: **78**
- 1001–2500: **99**
- 2500+: **128**

Non-zero sessions represented by these buckets: **1,067**.

Derived cohort sizes:

- 500+ characters: **305** (~28.6% of non-zero sessions);
- 1,000+ characters: **227** (~21.3%);
- 2,500+ characters: **128** (~12.0%).

### Product decision

The 1,000+ cohort is large enough to justify **state-based continuation**, but not a new independent banner system.

For long-form signed-out/unsaved work, priority remains:

1. `Keep this writing` / save-value protection;
2. Rich Editor / Word / PDF as normal task continuations;
3. Share after meaningful completion;
4. Community Publish only when eligible and not competing with a higher-priority recovery request.

Do not inspect writing content to decide eligibility. Use only state/depth/account/outcome signals allowed by `WU-PLAT-002H-METRICS-CONTRACT`.

---

## 8. Tool health

Measured engagement by tool:

| Tool | Visits | Engaged | Engagement |
| --- | ---: | ---: | ---: |
| Basic Editor | 2,862 | 2,544 | 88.9% |
| Rich Editor | 864 | 828 | 95.8% |
| Stylish Urdu Text | 721 | 482 | 66.9% |
| Voice Typing | 281 | 101 | 35.9% |
| Content page | 221 | 75 | 33.9% |
| Card Studio | 132 | 78 | 59.1% |
| Name Art | 120 | 65 | 54.2% |
| Urdu Keyboard | 55 | 28 | 50.9% |
| Invoice Generator | 24 | 5 | 20.8% |
| QR Generator | 16 | 2 | 12.5% |
| Instagram Post | 14 | 6 | 42.9% |
| WhatsApp Status | 13 | 11 | 84.6% |

### Product decision

- **Rich Editor is proven enough to remain the natural substantial-writing escalation.**
- Basic Writer remains the volume engine.
- Card Studio is not currently a failure: 59.1% engagement plus meaningful edit/export activity suggests discovery/completion should be interpreted carefully rather than broad acquisition being increased blindly.
- Low-volume utilities should not drive major roadmap work from this snapshot.

---

## 9. Card Studio completion

Current Card Studio counters:

- visits: **132**;
- preset choice: **34**;
- text entered: **78**;
- first canvas change: **57**;
- export step reached: **12**;
- export attempted: **53**;
- quick exports: **31**;
- advanced exports: **22**.

The reported `export attempted / reached export step = 441.7%` is another denominator/model mismatch. It does not prove a UI funnel sequence.

### Product decision

Keep the existing P0.1F Card Studio gate, but **normalize its funnel measurement before redesign**. Do not interpret `export step reached` as a strict prerequisite until the implementation confirms the event semantics for Quick vs Advanced paths.

---

## 10. Share loop: too little volume for product conclusions

Current share-loop counters:

- publish attempts: **2**;
- published links: **2**;
- public views: **0**;
- CTA clicks: **0**;
- referred starts: **0**;
- republished: **0**.

### Product decision

This snapshot does not justify a share-page redesign. The immediate work is instrumentation/continuity acceptance only. Defer product-level CTA optimization until there is meaningful reader volume.

Recommended minimum review gate: **at least 20 public human views** or a longer observation window, whichever comes later, before judging reader CTA performance. This is an execution guardrail, not a statistical significance claim.

---

## 11. Acquisition mix

Product entries: **4,893**.

- Google Search: **2,956** (~60.4%);
- Direct / saved / unknown: **1,585**;
- Other search: **123**;
- Referral: **128**;
- Campaign: **101**.

Top site entry pages:

- `/`: **2,684**;
- `/urdu-editor`: **828**;
- `/stylish-urdu-*`: **758**;
- `/tools/inpage-*`: **153**;
- `/tools/urdu-voice-*`: **152**.

Language entrances:

- English: **5,128**;
- Urdu `/urdu/`: **166**.

### Product decision

SEO remains the acquisition engine. Conversion work must therefore protect:

- canonical owner routes;
- current H1/title intent ownership;
- Core Web Vitals;
- mobile first-value hierarchy;
- English-letter → Urdu behavior.

Do not use this conversion programme to manufacture new keyword pages.

---

## 12. Priority generated from this evidence

### P0 — execute now

1. **Telemetry normalization / funnel denominator repair**
2. **Continuation diagnostic + consolidation**
3. **Growth CTA arbitration: Keep vs Share vs Publish**
4. **Voice-success → Keep/account experiment through the same arbiter**
5. **Long-form state-based continuation**

### P0 — continue existing work, do not restart

6. mobile B2 evidence closeout / real-device validation / 7-day post-release review

### P1 / evidence-gated

7. export-priority cleanup after activation guardrails are stable
8. Card Studio Quick-path changes only if normalized completion data identifies complexity
9. share-loop UX changes only after reader volume exists

---

## 13. What this evidence explicitly does not justify

- another broad homepage/mobile redesign before B2 closeout;
- more generic tool-directory UI;
- a new voice engine or paid speech provider;
- account gating before core writing/voice value;
- a new database;
- content/transcript telemetry;
- removing low-volume export formats solely from this one window;
- declaring the share loop broken from 0 public views;
- declaring voice causally superior for signup from 3 assisted sign-ups;
- treating >100% funnel ratios as valid conversion rates.

This evidence is consumed by `specs/WU-PLAT-002H-CONVERSION-REPAIR.md`.