# Urdu OCR preflight benchmark — 2026-08-17

Status: Engineering preflight, not a production accuracy guarantee
Spec: `WU-TOOLS-EXPANSION-003`

## Purpose

Before exposing browser Urdu OCR as a supported WriteUrdu tool, verify that the underlying Urdu Tesseract model is useful enough for ordinary printed/screenshot text to justify a browser MVP.

This preflight intentionally answers a narrow question: can an Urdu Tesseract pipeline recover clean Unicode Urdu from representative synthetic printed images with low infrastructure cost?

It does **not** prove quality on arbitrary real-world Nastaliq, handwriting, newspapers or mobile photographs.

## Engine available in the engineering environment

The local benchmark environment contained:
- Tesseract 5.5.0;
- Urdu language data (`urd`);
- English and Hindi models also installed but not used for the Urdu-only benchmark.

The public browser MVP pins Tesseract.js 7.0.0 at the top-level browser loader and requests the Urdu language model. Browser results must be treated as a separate validation surface because Tesseract.js/runtime defaults can differ from the command-line build.

## Fixture method

Synthetic test images were generated from known ground-truth strings with an Urdu-capable Naskh font. Fixtures covered:
- short clean Urdu;
- a longer clean sentence;
- Urdu with numbers;
- Urdu with English code-switching;
- punctuation;
- lower-resolution rendering;
- small rotation/skew;
- blur.

Character Error Rate (CER) and Word Error Rate (WER) were compared against the known strings.

## Preflight results

### Page segmentation mode 6 — uniform text block

- clean short Urdu: CER 0 / WER 0;
- clean sentence: CER 0 / WER 0;
- low-resolution sample: CER 0 / WER 0;
- rotated sample: CER 0 / WER 0;
- blurred sample: CER 0 / WER 0;
- punctuation sample: approximately CER 0.021 / WER 0.091, mainly punctuation variation;
- mixed English: poor enough that it should not be advertised as a strength;
- one mixed-number fixture unexpectedly returned no useful output under this segmentation mode.

### Page segmentation mode 11 — sparse text

- clean short Urdu: CER 0 / WER 0;
- clean sentence: CER 0 / WER 0;
- mixed-number fixture: CER 0 / WER 0;
- punctuation sample: approximately CER 0.021 / WER 0.091;
- low-resolution sample: CER 0 / WER 0;
- blurred sample: CER 0 / WER 0;
- rotated sample: approximately CER 0.20 / WER 0.20;
- mixed English: approximately CER 0.33 / WER 0.40.

## Decision

Proceed with a transparent browser MVP using sparse-text segmentation as the initial default.

The supported promise is deliberately narrow:

> Best for clear screenshots and ordinary printed Urdu. OCR can make mistakes; review names, numbers and punctuation. Complex Nastaliq layouts, handwriting, newspapers, skewed photographs and mixed English may require substantial correction.

Do not claim:
- perfect Nastaliq recognition;
- handwriting support;
- general document-layout preservation;
- perfect Urdu/English mixed-script recognition;
- benchmark accuracy percentages for production traffic.

## Browser MVP architecture

- Tesseract.js is lazy-loaded only after the user starts OCR.
- The selected image is processed in the browser.
- Initial supported input: PNG, JPEG, WebP.
- File-size and pixel-count limits guard browser memory.
- Very large dimensions are downscaled locally before recognition.
- Result remains editable and can hand off to Text Cleaner or the core editor.
- No paid OCR API is required.

## Licensing/provenance gate

Before changing distribution strategy, verify the exact license/version of:
- Tesseract.js runtime;
- Tesseract core assets;
- Urdu traineddata.

The implementation should prefer self-hosted, pinned runtime/model assets once the MVP is validated and traffic justifies the maintenance cost. The first MVP may use a pinned CDN loader under the tool specification's allowed prototype path.

## Remaining validation after release candidate

Before broad quality claims, add real-world fixtures that may legally be retained for testing:
- clean mobile screenshot;
- WhatsApp/social screenshot;
- printed Naskh page;
- common Nastaliq article;
- photographed page;
- low-resolution/compressed social image;
- newspaper/multi-column page;
- Urdu + English;
- Urdu + Western/Eastern numerals;
- rotated/skewed input.

Also measure browser-side:
- first-load model/runtime weight;
- median and p95 processing time on representative desktop/mobile hardware;
- memory failures/crashes;
- qualitative `good / usable with correction / poor` outcome.

## Product gate

The MVP can ship as a free browser utility because the preflight shows credible utility on clean printed Urdu and the UI makes limitations explicit. Further OCR expansion must be driven by real fixture quality and product usage rather than stronger marketing claims.
