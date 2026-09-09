# WU-JOURNEY-001E — Urdu Typing Practice Career & Test Pathway

**Status:** Planned / evidence experiment  
**Priority:** P1  
**Parent:** `WU-JOURNEY-001`  
**Builds on:** shipped `/urdu-typing-practice` product  
**Related backlog item:** current P1.8 Urdu typing practice/test evaluation

---

## 1. Objective

Turn the already-built Urdu typing practice product into a credible acquisition and retention pathway for users preparing for Urdu typing requirements in jobs, recruitment tests and office work.

This is **not** a greenfield typing-test feature.

---

## 2. Current shipped capability

The existing page already provides:

- 12 guided lessons;
- 1, 2 and 5 minute speed tests;
- WPM;
- accuracy;
- mistakes;
- phonetic English-key → Urdu mode;
- native Urdu keyboard mode;
- local progress/history;
- best speed;
- streaks;
- course completion;
- paste/drag protection for valid practice.

The major gap is product positioning and demand validation.

---

## 3. User jobs

### Beginner

> “I want to learn where the Urdu keys are and become comfortable typing.”

### Improving typist

> “I want to increase speed without destroying accuracy.”

### Job/test candidate

> “I have an Urdu typing requirement and need a realistic way to practise repeatedly.”

### Office/professional user

> “I need practical Urdu keyboard fluency for documents and daily work.”

---

## 4. Trust rule

WriteUrdu must not imply that its test is an official PPSC/FPSC/NTS/government exam unless an official organization explicitly authorizes that claim.

Allowed language:

- `Practise for Urdu typing requirements`
- `Measure your Urdu WPM and accuracy`
- `Prepare for jobs that require Urdu typing`

Avoid:

- `Official PPSC test`
- `Guaranteed passing score`
- fixed “required WPM” claims without a current, cited job/exam source.

Requirements vary by role and recruitment cycle.

---

## 5. Product opportunity

### 5.1 Career mode / framing

Without changing the core test engine, add an optional career-oriented context:

- choose `Learn` or `Test my speed`;
- explain how WPM/accuracy are calculated;
- allow the user to set a personal target speed;
- show progress toward **their** target;
- encourage repeated practice.

The personal target is not represented as an official threshold.

### 5.2 Practice passages

Add professionally useful Urdu passages over time:

- office correspondence;
- notices;
- neutral administrative prose;
- general news-style prose;
- formal Urdu sentences.

Do not copy copyrighted passages from newspapers/books.

### 5.3 Result interpretation

After a test:

- speed;
- accuracy;
- mistakes;
- personal best delta;
- suggested next practice action.

Avoid pass/fail language unless using a user-entered target.

---

## 6. Search / content strategy

Before creating exam-specific pages:

1. inspect GSC for Urdu typing test/practice/WPM/job queries;
2. research current external demand;
3. verify current job/test terminology;
4. select one query owner.

Potential owner route remains `/urdu-typing-practice` unless evidence proves a distinct user job requiring another page.

Do not create separate near-identical pages for:

- Urdu typing test;
- Urdu speed test;
- Urdu WPM test;
- Urdu typing practice;

unless intent/cannibalization analysis demonstrates a clear reason.

---

## 7. Retention opportunity

Typing practice is one of the few WriteUrdu jobs where **returning repeatedly is naturally valuable**.

Useful privacy-safe retention measures:

- sessions per local profile/device;
- days practised;
- streak continuation;
- personal-best improvement;
- lesson completion;
- test mode repeats.

Keep progress local-first unless a separate account-sync feature is explicitly approved.

---

## 8. Destination intent integration

If a user selects `practice` / typing-test intent elsewhere in WriteUrdu:

- route to `/urdu-typing-practice`;
- optionally preserve no private text—practice uses its own safe passage set;
- mark destination ready and meaningful practice start.

Do not move a user’s personal draft into the typing test.

---

## 9. Implementation slices

### E0 — Demand validation

- GSC query audit;
- competitor/search-intent review;
- identify whether job/test framing is materially present;
- record decision before SEO expansion.

### E1 — Career framing on existing route

- add a bounded `Preparing for an Urdu typing requirement?` support section or mode entry;
- explain that requirements vary;
- no official affiliation claims;
- preserve current general practice use.

### E2 — Personal target

- optional user-entered WPM target stored locally;
- compare test result against personal target;
- no default official threshold.

### E3 — Professional practice corpus

- add original/public-domain-safe passages;
- category metadata remains local/static;
- no copyrighted scraping.

### E4 — Product Pulse / retention report

- test starts/completions;
- repeat practice;
- lesson → test progression;
- device split;
- acquisition query evidence where available.

### E5 — Decide exam-specific content

Only after evidence:

- one evidence-backed guide may explain how to practise for Urdu typing requirements;
- current official requirements must be sourced and dated;
- do not mass-create recruitment-board doorway pages.

---

## 10. Acceptance

1. Existing general practice workflow remains available.
2. Career framing does not claim official affiliation.
3. User-set target is clearly personal, not an official pass mark.
4. WPM/accuracy calculations remain unchanged unless separately tested.
5. Paste prevention remains intact in measured tests.
6. Progress remains local-first.
7. New passages are legally safe/original.
8. No near-duplicate SEO route explosion.
9. Product Pulse can distinguish lesson starts, test starts and completed tests without storing typed passage content.
10. Mobile usability remains strong.

---

## 11. Success decision

Continue investment if evidence shows one or more of:

- meaningful search acquisition;
- repeat practice behaviour;
- strong completion;
- improving local-return cohort;
- clear career/test intent.

If not, keep the existing practice product maintained without expanding it merely because the feature is already built.