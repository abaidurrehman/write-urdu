# WU-TOOLS-EXPANSION-003 — Browser Urdu OCR

Status: Approved for benchmark / P0 experiment
Parent: WU-TOOLS-EXPANSION-001
Date: 2026-08-17

## 1. Problem

Users frequently receive Urdu as screenshots, scanned pages, social-media images, PDFs or photographs and need editable Unicode text before they can clean, write, format or export it.

Cloud OCR APIs create cost and privacy dependencies. A browser-side OCR path can make image → Urdu text a free utility if quality and performance are acceptable.

## 2. Product promise

Convert a printed Urdu image or screenshot into editable Unicode Urdu in the browser.

The product must clearly communicate that OCR is probabilistic and that complex Nastaliq, handwriting, low-resolution scans and decorative layouts may require manual correction.

## 3. Route and working title

Suggested route: `/tools/urdu-ocr/`

Working title: `Urdu OCR — Image to Urdu Text`

Natural query families:
- Urdu OCR
- Urdu image to text
- image to Urdu text
- Urdu photo to text
- Urdu screenshot to text
- Nastaliq OCR

## 4. Technical approach

Preferred MVP:
- Tesseract.js in the browser;
- Urdu `urd` traineddata;
- worker/WASM/model lazy-loaded only after the user selects an image or starts OCR;
- self-host core runtime/model assets when licensing and repository/deployment size permit;
- otherwise use a pinned, integrity/reviewed CDN dependency only as an initial prototype, with a migration plan to self-host.

No paid OCR API may be required for V1.

## 5. Benchmark-first gate

Before positioning OCR as production-quality, build a representative benchmark set outside user telemetry.

Minimum test categories:
- clean Urdu screenshot;
- clean Naskh print;
- common Nastaliq article text;
- WhatsApp/social screenshot;
- photographed printed page;
- low-resolution/compressed image;
- newspaper/multi-column text;
- mixed Urdu + English;
- Urdu + Western/Eastern numerals;
- skewed/rotated input.

The benchmark should record:
- character error rate where ground truth exists;
- word error rate where practical;
- median and p95 processing time on representative desktop and mobile hardware;
- first-load asset weight;
- crash/memory behavior;
- qualitative usability category: good / usable with correction / poor.

## 6. Promotion gate

Promote from experiment to supported P0 tool only when:
- clean screenshots and ordinary printed Urdu are consistently usable;
- common Nastaliq samples are not catastrophically wrong;
- a normal mobile browser can complete OCR without unacceptable memory failure;
- the model/runtime load is deferred and does not harm core page performance;
- privacy contract is verified;
- there is a clear correction workflow.

If Nastaliq quality is weak, ship with narrower positioning such as “best for clear screenshots and printed Urdu” rather than overclaiming.

## 7. V1 UX

1. Intro + browser-processing/privacy statement.
2. Drag/drop or file picker for image.
3. Local image preview.
4. Optional simple preprocessing controls only if benchmark shows material value:
   - rotate;
   - grayscale/contrast;
   - crop.
5. `Extract Urdu text`.
6. Progress state: loading OCR engine / recognizing / finishing.
7. Editable OCR result textarea.
8. Actions:
   - Copy text;
   - Clean text;
   - Open in WriteUrdu;
   - Try another image.
9. Accuracy guidance below workspace.

## 8. Supported input

Initial safe input set:
- PNG;
- JPEG/JPG;
- WebP where browser decoding is supported.

Set a conservative file-size and pixel-dimension guardrail to avoid browser memory exhaustion. The UI should explain oversized-image handling and may downscale locally before OCR.

PDF OCR is not part of V1 unless implemented as a separate browser-rendering pipeline and benchmarked independently.

## 9. Privacy and security

- selected image bytes remain in the browser;
- OCR result remains in the browser;
- do not upload image or result to WriteUrdu servers;
- do not record filenames;
- validate MIME/type defensively;
- object URLs must be revoked;
- worker/model network requests must contain no user content;
- telemetry is limited to bounded size/quality/performance buckets and success/error categories.

Copy must not claim “never leaves your device” if a prototype uses any OCR service that receives image data. The approved architecture is local browser OCR.

## 10. Performance

- do not load Tesseract on initial site/page boot;
- display model-download progress when possible;
- cache static model/runtime through normal browser caching/service infrastructure where appropriate;
- downscale extremely large images locally;
- terminate/reuse workers responsibly;
- ensure navigation away from OCR cannot leave runaway workers.

## 11. Error handling

Bounded user-facing errors:
- unsupported image;
- file too large;
- OCR engine failed to load;
- recognition failed;
- browser memory/resource failure;
- no useful text detected.

Never expose raw stack traces.

## 12. Integration

The result should hand off to:
- Urdu Text Cleaner + RTL Fixer;
- core WriteUrdu editor.

Use session-only or clipboard handoff; never place OCR text in URL parameters.

## 13. AdSense/UX guardrails

- no ad adjacent to upload/select/Extract/Copy/Open actions;
- no overlay ad over image preview/result/progress;
- monetization may appear after the OCR workspace or in explanatory content regions under the shared monetization contract;
- model loading must not be delayed by ad code.

## 14. Telemetry

Allowed:
- OCR page visit/engagement;
- supported/unsupported browser/runtime bucket;
- input size bucket;
- image dimension bucket;
- start/completion/failure;
- processing-time bucket;
- result-length bucket;
- copy/clean/editor handoff.

Forbidden:
- image bytes;
- image filename;
- OCR text;
- extracted words;
- raw exception details containing content.

## 15. Acceptance criteria for MVP

- a user can select a supported image and run Urdu OCR without a server upload;
- OCR assets load only after intent;
- progress and cancellation/retry states are understandable;
- result is editable and copyable;
- result can hand off to Cleaner and editor;
- oversized images are handled safely;
- no user content appears in network requests;
- benchmark evidence is committed/documented before broad quality claims;
- core editor performance is unaffected on users who never open OCR.

## 16. Out of scope initially

- handwriting guarantees;
- perfect Nastaliq recognition;
- server/cloud OCR fallback;
- multi-page PDF ingestion;
- table/layout preservation;
- document storage/history;
- account-based OCR quotas.