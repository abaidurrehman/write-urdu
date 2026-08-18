# WriteUrdu V2 — Product Language & Search Contract

**Date:** 2026-08-18  
**Status:** P0 supporting contract  
**Applies to:** navigation, tool cards, headings, metadata, help text, next-step actions and new-tool launch copy  
**Companion:** `WU-PLAT-002`

## Purpose

WriteUrdu must describe capabilities in the language users recognize before using implementation or engineering terms.

The rule is simple:

> **Lead with the job. Use the technical term only when it helps explain, disambiguate or capture a real search synonym.**

This is both a UX and search-quality rule. It avoids forcing ordinary users to learn internal terminology while still allowing established search phrases to appear naturally.

## Core language rules

1. **Outcome first.** Prefer `Turn a screenshot into editable Urdu text` over `Run Urdu OCR`.
2. **Plain-language labels in navigation and CTAs.** Technical terms can appear in supporting copy, FAQ text or metadata.
3. **Do not keyword-stuff.** A page may cover several genuine search synonyms naturally, but the visible UI should remain readable.
4. **Keep established canonical routes unless there is a separate SEO reason to change them.** User-facing names can improve without URL churn.
5. **Explain unfamiliar terms once.** Example: `OCR (optical character recognition) is the technology that reads text inside an image.` Do not repeat `OCR` throughout the page when `image to text`, `read the image`, or `extract the text` is clearer.
6. **Describe limitations in user terms.** Prefer `decorative Urdu, handwriting and newspaper layouts may need more correction` over implementation-specific model caveats.
7. **Never imply quality that has not been benchmarked.** Search-friendly wording does not justify stronger accuracy claims.
8. **Outcome-led next steps.** Prefer `Format this as a document` over `Open Rich Editor`, with the destination product name as secondary context where useful.

## Image / screenshot → Urdu text language contract

### Primary user-facing concept

Use **Urdu Image to Text** / **convert Urdu from a screenshot or photo into editable text** as the primary concept.

Recommended labels:

- Navigation/card: **Image to Urdu Text**
- H1: **Convert Urdu Images to Editable Text**
- Short description: **Turn Urdu in screenshots, photos and scanned pages into text you can copy, edit and continue using in WriteUrdu.**
- Primary action: **Extract Urdu text** or **Convert image to text**
- Result label: **Editable Urdu text**

### Secondary technical/search term

`Urdu OCR` remains useful as:

- a secondary phrase in the page title or meta description;
- one short explainer section;
- an FAQ synonym (`What is Urdu OCR?`);
- internal engineering/spec terminology where precision matters.

Do not make `OCR` the repeated primary noun in hero, workspace title, buttons, status messages and every help paragraph.

### Natural search vocabulary

Use these phrases only where they fit naturally:

- Urdu image to text
- Urdu photo to text
- screenshot to Urdu text
- extract Urdu text from image
- convert Urdu image to editable text
- Urdu OCR

The page should satisfy the task first rather than mechanically repeating all variants.

## Font / script support language

Current engineering evidence supports a careful distinction.

### What we can say

- **Best current results are expected from clear printed Urdu with simple, readable letterforms.**
- **Our current benchmark is strongest on Naskh-style printed text.**
- **Nastaliq can be more difficult because its joined, sloping layout is more complex; users should review the result carefully.**
- Clear screenshots with good contrast are preferable to distant, skewed or compressed photos.
- Important names, numbers and punctuation should always be checked.

### What we must not say yet

Do not claim:

- perfect Nastaliq support;
- that every Urdu font works equally well;
- handwriting recognition as a supported strength;
- newspaper/multi-column accuracy;
- production accuracy percentages based on synthetic benchmark fixtures.

### Recommended user-facing help block

**Which Urdu text works best?**  
Clear printed Urdu works best. Our current testing is strongest with simple Naskh-style text. Nastaliq is more decorative and complex, so it can need extra corrections—especially in newspapers, poetry images, low-quality photos or heavily styled text.

## Navigation examples across WriteUrdu

Prefer:

- **Start writing in Urdu** — Roman Urdu writer
- **Format an assignment or document** — Rich Editor
- **Image to Urdu Text** — technical synonym: Urdu OCR
- **Speak and turn it into Urdu text** — Voice Typing
- **Fix spacing and Urdu text direction** — Text Cleaner / RTL fixer
- **Convert old InPage text to Unicode Urdu** — InPage converter
- **Make a poetry or quote image** — Card Studio
- **Create a QR code from this text** — QR Generator
- **Create an Urdu / English invoice** — Invoice Generator

Avoid presenting the implementation name alone when a normal user would have to infer the job from it.

## SEO title/meta pattern for specialist tools

A useful pattern is:

`[user task / common query] — [clear outcome] | WriteUrdu`

Example:

- Title: `Urdu Image to Text — Convert Screenshots & Photos to Editable Urdu | WriteUrdu`
- Description: `Convert Urdu in a screenshot, photo or scanned page into editable text you can copy and correct. Urdu OCR runs in your browser; best results are with clear printed text.`

This keeps the high-intent phrase close to the front while remaining readable.

## Acceptance checklist for new tools

Before a new interactive tool ships:

- [ ] Primary navigation/card label is understandable without knowing the implementation technology.
- [ ] H1 describes the user's job or output.
- [ ] Primary CTA describes the action the user wants.
- [ ] Technical term is explained once if needed.
- [ ] Real search synonyms appear naturally in title/meta/body without repetition.
- [ ] Limitations are written in user language.
- [ ] Font/script claims are evidence-backed.
- [ ] Next-step labels are outcome-led.
- [ ] Canonical ownership remains explicit.

## Evidence used for the image-to-text wording decision

Current search-result language in this category consistently pairs `Urdu image to text` / `extract Urdu text from images` with `Urdu OCR` as a technical synonym. WriteUrdu should therefore lead with the plain-language task while retaining OCR in secondary search/explainer copy.

WriteUrdu's own 2026-08-17 benchmark used an Urdu-capable Naskh font for its synthetic fixtures and explicitly states that it does not prove broad quality on arbitrary real-world Nastaliq, handwriting, newspapers or mobile photographs. The public product wording must preserve that limitation.