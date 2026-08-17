# WU-TOOLS-EXPANSION-001 — Browser-first Urdu tools program

Status: Approved for implementation
Owner: WriteUrdu
Date: 2026-08-17

## 1. Purpose

Expand WriteUrdu from an Urdu typing utility into a browser-first Urdu text workspace without compromising the existing Roman Urdu → Urdu writing experience.

The expansion is deliberately focused on useful, low-cost tools that can be run in the browser and can feed users back into the core WriteUrdu editing and export workflow.

## 2. Strategic objective

This program supports three goals at the same time:

1. Help existing users solve adjacent Urdu text problems without leaving WriteUrdu.
2. Create useful search-acquisition landing pages with genuine standalone utility.
3. Increase sustainable AdSense-supported usage without increasing ad pressure inside the core authoring workspace.

This is product expansion first and monetization second. No tool should exist solely to create an ad impression.

## 3. Product model

The tools belong to one coherent workflow:

Capture → Fix → Write → Export

Capture:
- Urdu OCR: image/screenshot → editable Urdu text.
- Urdu Voice Typing: speech → editable Urdu text.
- InPage → Unicode: legacy encoded text → Unicode Urdu.

Fix:
- Urdu Text Cleaner.
- Urdu RTL & Unicode Fixer.
- Unicode → InPage conversion where a user needs to return to a legacy workflow.

Write:
- Hand off cleaned or captured text to the existing WriteUrdu editor without changing the core transliteration contract.

Export:
- Reuse the existing copy, PDF, Word, image and other export capabilities where appropriate.

## 4. Program backlog

### P0 — WU-TOOLS-EXPANSION-002: Urdu Text Cleaner + RTL Fixer

Browser-local normalization and diagnostics for common Urdu/Arabic Unicode, punctuation, spacing and bidirectional-text problems.

### P0 experiment — WU-TOOLS-EXPANSION-003: Urdu OCR

Browser-side OCR using Tesseract.js/WebAssembly and an Urdu model. The first delivery is an accuracy and performance benchmark plus a usable MVP if benchmark gates pass.

### P1 — WU-TOOLS-EXPANSION-004: Urdu Voice Typing

Progressive enhancement using browser speech recognition. Unsupported browsers must degrade cleanly. Product copy must not imply that audio is always processed locally.

### P1 — WU-TOOLS-EXPANSION-005: InPage ↔ Unicode

Both-direction text conversion. V1 is pasted/copyable encoded text conversion, not arbitrary `.inp` binary document parsing.

### R&D — WU-TOOLS-EXPANSION-006: Urdu ↔ Hindi Script Conversion

Investigate a browser-native, legally safe and quality-gated script conversion engine. This item must not block the four tools above.

## 5. Shared experience requirements

Every tool must:

- work without account creation;
- preserve user text in the browser wherever technically possible;
- state clearly when a browser/vendor service may process data;
- expose a strong primary action and a clear result state;
- support copy of results;
- offer an explicit “Open in WriteUrdu” handoff where the output is Urdu Unicode text;
- never overwrite source input without an intentional user action;
- be usable on desktop and mobile;
- be keyboard accessible;
- avoid placing ads adjacent to primary actions, upload controls, copy/download buttons or result controls;
- emit privacy-safe product telemetry using the existing event vocabulary or a deliberately extended bounded vocabulary;
- avoid recording document text, filenames, image contents, speech transcripts, referrer URLs or persistent user identities.

## 6. SEO and content requirements

Each public tool page must be a complete useful page rather than a thin programmatic shell.

Minimum requirements:
- unique title, H1 and description;
- clear explanation of what the tool does and does not do;
- short “how to use” section;
- privacy/processing explanation appropriate to the tool;
- FAQ only where questions are genuinely useful;
- canonical URL on `https://write-urdu.com`;
- relevant structured data where valid;
- internal links to the core editor and related tools;
- sitemap inclusion;
- no doorway-page duplication between closely related cleaner/fixer capabilities.

The Text Cleaner and RTL Fixer are one product surface unless later usage data justifies separate pages.

## 7. Monetization guardrails

These tools are intended to help the broader revenue-growth target through additional useful sessions and acquisition, not through aggressive ad density.

Rules:
- the input/result workspace is protected from accidental-click placements;
- manual or Auto-ad experiments belong after the useful workspace/content boundary;
- Learn/content sections may be monetized more aggressively than interactive controls;
- one monetization variable should be tested at a time;
- tool engagement, successful completion, handoff rate, mobile usability and Core Web Vitals are guardrail metrics;
- a revenue increase that materially harms tool completion or the core writing funnel is not considered a win.

## 8. Shared technical constraints

- Prefer static HTML/CSS/JavaScript and browser APIs.
- Do not introduce a paid API dependency for the initial program.
- Do not introduce server persistence of user content.
- Large libraries/models should be lazy-loaded only after user intent.
- Cacheable self-hosted assets are preferred for core tool dependencies where licensing allows it.
- Tool failures must remain isolated from the core editor and site shell.
- Keep existing transliteration behavior untouched unless a specification explicitly changes it.

## 9. Shared analytics

Minimum privacy-safe events to support, using bounded values only:
- tool visit/engagement through existing product telemetry;
- conversion started;
- conversion completed;
- conversion failed;
- issues found bucket;
- fix applied;
- result copied;
- handoff to editor;
- OCR quality/size buckets where derivable without retaining content;
- voice support available/unavailable and recognition started/completed/error.

No event may contain text contents, OCR output, transcript, image bytes, file names or raw error payloads.

## 10. Release strategy

Release tools independently behind small, reversible changes.

Recommended sequence:
1. Text Cleaner + RTL Fixer.
2. OCR benchmark/prototype; ship only after quality gate.
3. Voice Typing.
4. InPage ↔ Unicode.
5. Urdu ↔ Hindi R&D decision.

Each implementation must include contract tests for route governance, privacy, SEO and core editor regression where applicable.

## 11. Definition of program success

The program is successful when it produces measurable additional useful sessions without degrading the core editor, and at least two new tools establish recurring acquisition or meaningful handoffs into the editor.

Revenue is an outcome metric, but the primary product signals are successful tool completions, editor handoffs, repeat usage and search acquisition.