# WU-TOOLS-EXPANSION-002 — Urdu Text Cleaner + RTL Fixer

Status: Approved / P0
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17

## 1. Problem

Urdu text copied between websites, Word, PDFs, messaging apps and older publishing software often contains mixed Arabic/Urdu code points, invisible bidirectional controls, inconsistent punctuation, repeated spacing, kashida, mixed numeral styles and direction-sensitive punctuation sequences.

These defects are difficult to see and can cause search, copy/paste, export and layout problems.

## 2. Product promise

Paste Urdu text and get a transparent, browser-local diagnosis with safe fixes.

The tool is a text cleaner and Unicode/RTL diagnostic utility. It does not rewrite wording, translate text or silently modify input.

## 3. V1 route and identity

Suggested route: `/tools/urdu-text-cleaner/`

Working title: `Urdu Text Cleaner & RTL Fixer`

Primary query families to serve naturally:
- Urdu text cleaner
- fix Urdu text
- Urdu Unicode fixer
- Urdu RTL fixer
- Arabic to Urdu characters
- remove invisible characters Urdu
- Urdu punctuation fixer

Avoid producing separate thin pages for each individual fix.

## 4. V1 issue rules

### Character normalization

Detect and optionally normalize common Arabic forms used unintentionally in Urdu text, including at minimum:
- Arabic yeh `ي` → Urdu bari/standard yeh form appropriate to the rule set (`ی` for the common normalization rule);
- Arabic kaf `ك` → Urdu kaf `ک`;
- Arabic heh/yeh variants only where the mapping is demonstrably safe;
- Arabic presentation forms where Unicode normalization can safely resolve them.

Do not map characters whose Urdu meaning/spelling could change without an explicit reviewed rule.

### Invisible/bidirectional controls

Detect Unicode direction controls including relevant LRM/RLM/embedding/override/isolate marks.

Classify as:
- safe/redundant removable mark;
- suspicious unmatched control;
- intentional/ambiguous control requiring review.

V1 may offer “remove unnecessary direction controls” only for a conservative safe subset. It must not blindly strip all bidi controls.

### Zero-width characters

Detect ZWJ/ZWNJ and related zero-width characters.

Only automatically remove characters covered by a conservative rule. Urdu shaping can legitimately use join controls, so ambiguous instances must be surfaced instead of silently removed.

### Spacing

Detect/fix:
- repeated regular spaces;
- spaces before punctuation where clearly unintended;
- repeated blank-space runs while preserving line breaks;
- non-breaking/invisible spaces where they create an obvious copy/paste defect.

### Kashida/tatweel

Detect repeated or decorative tatweel (`ـ`).

Provide a specific optional fix: remove decorative kashida.

Do not remove it automatically as part of unrelated normalization.

### Punctuation and direction-sensitive patterns

Detect common suspicious patterns involving:
- Arabic vs Latin question/comma punctuation where Urdu context makes the intended form clear;
- brackets/parentheses adjacent to RTL text;
- slash, colon and hyphen sequences around Urdu and numbers;
- punctuation separated from its word by obvious accidental spaces.

For patterns that cannot be fixed safely by code-point replacement alone, offer an explanation and preview rather than an unsafe automatic transform.

### Numerals

Provide explicit user-selected numeral conversion:
- preserve as-is;
- Western 0–9;
- Arabic-Indic;
- Eastern Arabic/Persian-style digits used with Urdu.

Numeral conversion is never part of the default Fix All action unless the user chooses a target style.

## 5. UX

Layout:
1. Intro and privacy note.
2. Source textarea.
3. `Analyze text` primary action.
4. Result summary: issue count + categories.
5. Issue list with description, count, severity/safety and individual fix action.
6. `Fix safe issues` action.
7. Cleaned output / before-after preview.
8. `Copy cleaned text` and `Open in WriteUrdu`.
9. Short useful guide/FAQ content after the workspace.

Required states:
- empty;
- clean/no issues;
- issues found;
- fixes applied;
- partial fix with review-needed issues.

Never overwrite the source textarea when applying fixes. The cleaned result is separate.

## 6. Safe-fix model

Each rule must expose metadata:
- rule id;
- category;
- title;
- explanation;
- count;
- confidence/safety class (`safe`, `review`);
- transform function only when safe.

`Fix safe issues` applies only `safe` rules.

The issue list must make clear which issues remain review-only.

## 7. Browser/privacy architecture

- 100% client-side processing.
- No text sent to `/api/events` or any external service.
- No source/result text persisted to localStorage, cookies, D1 or server logs by product code.
- Existing generic page telemetry may record bounded event names and buckets only.

## 8. Handoff contract

`Open in WriteUrdu` must transfer the cleaned text without placing it in a URL query string.

Preferred mechanisms in order:
1. same-tab/session-only handoff using `sessionStorage` with immediate consume-and-delete in the editor;
2. explicit clipboard + navigation fallback if the editor does not yet support session handoff.

The handoff key must be scoped, documented and must not survive beyond the browser session.

## 9. Accessibility

- issue counts announced with an ARIA live region;
- buttons have descriptive labels;
- source and result labels are explicit;
- issue status is not communicated by color alone;
- keyboard workflow supports analyze → fix → copy/handoff.

## 10. SEO/content

Page content should explain:
- why Urdu text sometimes contains Arabic code points;
- what invisible RTL characters are;
- why a cleaner may help after copying from PDFs/Word/websites;
- that the tool is not a grammar/spelling rewriter;
- that text is processed in the browser.

Do not claim every bidi/layout problem can be repaired automatically.

## 11. Telemetry

Allowed bounded events/attributes:
- tool engagement;
- analysis started/completed;
- issue-count bucket (`0`, `1-2`, `3-5`, `6-10`, `11+`);
- category presence booleans or bounded category enum;
- safe fix applied;
- result copied;
- handoff.

Never send actual characters, snippets, counts by character value, or source/result text.

## 12. Acceptance criteria

- known Arabic yeh/kaf samples are diagnosed and safely normalized;
- repeated spaces are fixed without collapsing line breaks;
- tatweel is detected and removable via its explicit fix;
- common bidi controls are detected and safe subset removal is tested;
- ambiguous join controls are not blindly removed;
- source remains unchanged after fixes;
- output can be copied;
- output can be handed to the editor without a URL payload;
- all processing works offline after assets are loaded;
- no network request contains user text;
- mobile and RTL layout remain usable;
- core transliteration tests remain green.

## 13. Out of scope for V1

- grammar correction;
- spelling correction;
- semantic rewriting;
- translation;
- automatic repair of every visual bidi anomaly;
- server-side text analysis;
- saved document history.