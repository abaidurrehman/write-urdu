# Write Urdu new tool marketing and SEO launch

**Feature ID:** `WU-SEO-001`  
**Version:** 1.0  
**Status:** Planned  
**Primary route:** `/`  
**Related routes:** `/urdu-editor`, `/urdu-keyboard`, `/roman-urdu-transliteration`, `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker`

## Objective

Increase discoverability and adoption of newly developed Urdu tools by creating dedicated SEO-friendly landing experiences, surfacing them prominently across the site, and aligning content with the search queries already showing demand.

The work should turn the new tools into visible, clickable products rather than hidden utility pages.

## Product contract

- The homepage and relevant tool sections prominently feature the new tools.
- Each core tool page has a clear value proposition, primary keyword, CTA, and supporting content.
- Tool pages are optimized for high-intent search terms such as Urdu typing online, online Urdu typing, English to Urdu typing, Urdu keyboard online, and Roman Urdu to Urdu typing.
- The marketing experience stays static and browser-based; no backend service or account system is introduced.
- Existing tool functionality remains the source of truth; the spec only adds discoverability, promotion, and SEO structure.

## Scope

### P0

- Create or refine dedicated landing content for the new tools.
- Add SEO metadata, page titles, descriptions, H1s, and supporting sections.
- Add homepage and tool-section promotions for the new tools.
- Create internal links from related pages to the new tools.
- Add reusable promotional content blocks for tool highlights.

### P1/P2 follow-up

- Publish supporting blog-style content and use-case pages.
- Expand social and content marketing templates for launch campaigns.
- Add analytics-friendly CTA tracking for tool clicks and conversions.

## Content and UX requirements

- Each promoted tool page should include:
  - a primary keyword in the title and H1
  - a concise explanation of what the tool does
  - a visible “Try it now” or “Use tool” CTA
  - a short “How it works” section
  - a FAQ section for common user questions
  - related tool links to keep users engaged
- The homepage should include a visible “New tools” or “Popular tools” section.
- Tool cards should be descriptive and action-oriented rather than generic labels.
- Content should be written for both search engines and real users, with clear benefit-led language.

## Acceptance criteria

- The new tools are discoverable from the homepage without requiring the user to search deeply.
- Each primary tool page includes a clear SEO title, meta description, H1, and supporting sections.
- The site contains internal links from related content to the new tools.
- Tool promotion is consistent across the homepage and relevant landing sections.
- Existing tool behavior and routes remain intact.
- Basic SEO checks continue to pass after the update.

## Implementation map

- `index.html` — homepage promotion section and new-tool highlights.
- `urdu-keyboard.html` — SEO copy, tool intro, CTA, FAQ, and related links.
- `roman-urdu-transliteration.html` — SEO copy, tool intro, CTA, FAQ, and related links.
- `urdu-editor.html` — cross-linking and tool promotion context.
- `css/modern-home.css` or `css/tools-modern.css` — layout and styling for tool highlights.
- `site-header.js` or related runtime scripts — shared promo content hooks if needed.
- `tests/static.test.js` — verify that key tool pages include required SEO and CTA structure.
- `tests/site.spec.js` — verify homepage tool promotion and internal link presence.

## Verification

```text
npm test
npm run seo:check
npm run test:browser
```
