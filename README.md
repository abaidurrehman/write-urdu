# Write Urdu

A static browser application for Roman-Urdu transliteration, rich Urdu editing, and direct Urdu keyboard input.

## Run locally

Install the development test dependency once:

```powershell
npm install
```

Start the local site server (including extensionless routes):

```powershell
npm start
```

Then open <http://127.0.0.1:8787>. Use `PORT=9000 npm start` if another local
service is using port 8787.

Run the static regression checks:

```powershell
npm test
```

Run the deterministic desktop and mobile browser suite using installed Chrome:

```powershell
npm run test:browser
```

Run both suites:

```powershell
npm run test:all
```

Generate and validate search metadata, crawler policy and the XML sitemap:

```powershell
npm run seo:generate
npm run seo:check
# Optional deployment-time notification for materially changed routes
npm run seo:indexnow -- /urdu-card-studio
# Optional mobile Lighthouse workflow (requires Lighthouse installed locally)
npm run lighthouse:seo
```

Google transliteration is an external service and can be tested separately when network access is available:

```powershell
cmd /c "set LIVE_TRANSLITERATION=1&&npx playwright test --grep transliterat"
```

## Production pages

- `index.html`: basic Roman-Urdu editor
- `urdu-editor.html`: TinyMCE rich-text editor
- `urdu-keyboard.html`: direct Urdu keyboard and transliteration editor
- `urdu-card-studio.html`: local-first Urdu card designer with canvas PNG export
- `urdu-whatsapp-status-maker.html`: focused 1080 × 1920 WhatsApp Status maker
- `urdu-instagram-post-maker.html`: Instagram square, portrait and story maker
- `qr-code-generator.html`: browser-only static QR generator with Urdu, Wi-Fi, contact, image and SVG/PNG export support
- `write-urdu-documentation.html`: visual guide to the editors, shortcuts, drafts, privacy and export workflows

Obsolete prototype editor files have been removed; `urdu-editor.html` is the only supported rich-text editor.

## Clean URLs

Public navigation uses extensionless routes such as `/urdu-editor`, `/urdu-keyboard` and `/urdu-alphabet`. The canonical production origin is `https://write-urdu.com`. The original `.html` files remain in the repository for backwards-compatible bookmarks and are permanently redirected by the included `.htaccess` or Cloudflare Pages `_redirects`; the local test server serves both forms for browser tests.

## Search and AI discoverability

`seo.config.js` is the source of truth for page titles, descriptions, indexability, legacy routes, sitemap inclusion and update dates. `npm run seo:generate` produces the canonical-host `sitemap.xml` and crawler policy in `robots.txt`; `npm run seo:check` validates headings, metadata, canonicals, JSON-LD hooks and sitemap/registry alignment. Apache uses `.htaccess`, while Cloudflare Pages uses the root `_redirects` file for legacy and trailing-slash redirects. Search Console, Bing Webmaster Tools, IndexNow and CDN crawler checks are deployment tasks documented in `docs/SEO-DEPLOYMENT-CHECKLIST.md` and `docs/SEO-POST-DEPLOYMENT.md`.

## Language preference

Every supported page includes the language control in the shared header. English is the default; choosing **اردو** switches the interface copy, page headings, common editor actions, navigation and footer to Urdu, changes the document direction to RTL, and remembers the choice in `localStorage` under `write-urdu:locale:v1`. Choosing **English** restores the LTR interface. Transliteration, keyboard input and export routines are unchanged.

Long-form translations are maintained in `js/content-locale.js`. It localizes the documentation hub, editor help cards, feature and formatting guides, tutorials, FAQ, alphabet guide, sitemap, search, feedback and privacy headings without replacing the editor's live input or export markup.

## Urdu Card Studio

Both editors expose **Create Urdu Card**. The action transfers the selected plain text (or the complete editor text when nothing is selected) through `sessionStorage`; private text is never placed in a URL. Card Studio also initializes the existing Google Roman-Urdu transliteration control for text entered directly on the page, with a retry message when that dependency is unavailable. It renders four exact-size presets and nine built-in designs with the Canvas 2D API, supports local JPG/PNG/WebP backgrounds, and downloads a high-resolution PNG without a backend. Projects and image blobs are saved separately in IndexedDB when available, with a session-only fallback when local storage is unavailable.

## QR Code Generator

Both editors also expose **Create QR Code**. The action transfers selected or complete plain text through `sessionStorage`, never through a URL. The standalone generator builds URL, Urdu text, WhatsApp, Wi-Fi, email, phone, SMS, vCard and location payloads locally using the bundled MIT-licensed `qrcode` encoder. Colors, quiet-zone margin, error correction, local raster logos, exact-size PNG and safe SVG export are validated in the browser; no payload or logo is uploaded. The current design is saved locally when browser storage is available, while download remains usable when it is not.

## Urdu Template Library

The `/urdu-templates` route provides 46 browser-local starter designs across poetry, social media, religious and seasonal, education, business, and personal/event categories. Search, filter by output shape, sort featured or newest designs, and keep favorites and recent choices in versioned local storage. Selecting **Edit template** opens the existing Urdu Card Studio with a cloned design configuration; the registry is validated by `npm run templates:check` and does not create thin individual template pages.

## Editor workspace features

- First-use onboarding explains the shortest path to a converted Urdu word and can be dismissed per editor.
- Drafts are saved locally, with recent-history counts, restore, rename, individual delete and clear-history controls.
- Export actions show a busy state, support an on-screen preview, and retry the PDF dependency when a CDN is unavailable.
- `Ctrl/Cmd+Shift+P` opens the command palette; `Ctrl/Cmd+S` saves a local draft and `Ctrl/Cmd+F` opens find and replace.
- The editor action bar becomes sticky and compact on mobile screens.
- The site exposes a manifest and service worker for an installable shell. Roman Urdu transliteration still needs the Google service when no local engine is available.

## Third-party integrations

The former `GTM-M45V9FW` loader is intentionally disabled because its live container injected duplicate application controls. Remove the affected Custom HTML tag in Google Tag Manager before adding the container back.

Advertising slots on content pages are initialized through `js/ads.js`, which loads the current AdSense client once and initializes each slot once. Content pages also receive a responsive header unit; the editor workspaces intentionally do not load advertising so the writing surface stays above the fold.
