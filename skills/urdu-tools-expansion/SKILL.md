# Urdu Tools Expansion Implementation Skill

Use this skill to implement the WU-TOOLS-EXPANSION specification family safely.

## Scope

Primary specifications:
- `specs/WU-TOOLS-EXPANSION-001-browser-first-urdu-tools-program.md`
- `specs/WU-TOOLS-EXPANSION-002-urdu-text-cleaner-rtl-fixer.md`
- `specs/WU-TOOLS-EXPANSION-003-urdu-ocr.md`
- `specs/WU-TOOLS-EXPANSION-004-urdu-voice-typing.md`
- `specs/WU-TOOLS-EXPANSION-005-inpage-unicode-converter.md`
- `specs/WU-TOOLS-EXPANSION-006-urdu-hindi-script-converter-rnd.md`

## Non-negotiable product rules

1. Protect the existing Roman Urdu → Urdu authoring flow. Do not refactor the transliteration engine merely to share code with a new tool.
2. Browser-first by default. User document content must not be persisted server-side.
3. Do not add paid API dependencies for these tools.
4. Never put user text, OCR output, speech transcripts, filenames, image bytes or raw content into analytics.
5. New tool pages must be useful standalone pages, not thin SEO shells.
6. Keep ad placements away from upload, microphone, convert, fix, copy, download and editor-handoff controls.
7. Handoffs must not place user text in query strings. Use explicit session-only or clipboard mechanisms.
8. Large OCR assets must lazy-load after user intent.
9. Voice typing is progressive enhancement; never promise universal browser support or guaranteed on-device recognition.
10. InPage V1 is text conversion for a documented mapping, not generic `.inp` binary file parsing.
11. Urdu ↔ Hindi remains research until quality and licensing gates are satisfied.

## Implementation order

### Stage A — Text Cleaner + RTL Fixer

Build first because it has the lowest dependency and quality risk.

Required deliverables:
- deterministic rule engine in a standalone JS module;
- safe/review issue classification;
- public tool route;
- source/result separation;
- Fix Safe Issues, Copy and Open in WriteUrdu actions;
- tests for every safe transform and non-transform edge case;
- SEO route registration and sitemap/canonical coverage;
- privacy-safe telemetry.

Do not blindly remove all bidi controls or zero-width characters.

### Stage B — OCR benchmark/prototype

Before building polished public UX:
- select/pin Tesseract.js/runtime version;
- verify licensing for runtime and Urdu traineddata;
- establish benchmark fixtures/ground truth that may be committed legally;
- measure recognition quality and browser performance;
- document benchmark results.

Only then decide whether to ship the supported route or retain prototype status.

### Stage C — Voice Typing

- use feature detection;
- request microphone permission only after explicit click;
- use Urdu locale configuration where supported;
- keep interim and final recognition separate;
- stop recognition on page exit;
- no transcript telemetry.

### Stage D — InPage ↔ Unicode

Do not implement a guessed mapping.

First document exact encoding/mapping provenance. Then:
- build versioned mapping module;
- fixture-test both directions;
- identify reversible and lossy subsets;
- surface unsupported characters rather than guessing.

### Stage E — Urdu ↔ Hindi R&D

No public production route until:
- compatible data/code licensing is documented;
- quality corpus exists;
- both directions are benchmarked;
- ambiguity UX is designed;
- no restricted hosted API is required.

## Shared UI pattern

Prefer the site's existing shared shell/components. A tool page should generally contain:

1. Hero/title + concise value statement.
2. Small processing/privacy note.
3. Interactive workspace.
4. Results/actions.
5. Contextual handoff to editor/related tool.
6. Useful explanatory content/FAQ after the workspace.
7. Ad/content boundaries governed by the existing monetization contract.

Do not turn the global navigation into a catalogue of every tool. Use a coherent Tools hub/category and contextual internal links.

## Shared code architecture

Prefer:
- pure functions for conversion/normalization engines;
- thin DOM binding layer;
- explicit bounded telemetry adapter;
- common session handoff helper only if doing so does not destabilize the core editor;
- route metadata through the repository's existing SEO/governance mechanism.

Every transform should be deterministic and testable without a browser where practical.

## Testing gates

Before opening a PR:
- run repository unit/contract tests;
- run SEO/gov route checks;
- test core `/` and `/urdu-editor` transliteration manually or through existing acceptance coverage;
- run focused browser test for the new tool;
- verify mobile layout;
- inspect network requests to confirm user content is not transmitted;
- confirm ads/auto-ad exclusion markers protect primary actions/workspaces;
- check canonical/sitemap/indexability.

## Rollout discipline

Prefer one implementation PR per major tool after the shared program/spec PR unless the first tool is small enough to be safely included.

Track after release:
- visits;
- engagement;
- completion rate;
- copy rate;
- handoff rate;
- failure rate;
- search acquisition;
- revenue/page RPM at the page-type level where available;
- core editor guardrail metrics.

Do not interpret an AdSense improvement as success if tool completion or core editor engagement materially deteriorates.