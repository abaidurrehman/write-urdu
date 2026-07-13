# Write Urdu

A static browser application for Roman-Urdu transliteration, rich Urdu editing, and direct Urdu keyboard input.

## Run locally

Install the development test dependency once:

```powershell
npm install
```

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

Google transliteration is an external service and can be tested separately when network access is available:

```powershell
cmd /c "set LIVE_TRANSLITERATION=1&&npx playwright test --grep transliterat"
```

## Production pages

- `index.html`: basic Roman-Urdu editor
- `urdu-editor.html`: TinyMCE rich-text editor
- `urdu-keyboard.html`: direct Urdu keyboard and transliteration editor
- `write-urdu-documentation.html`: visual guide to the editors, shortcuts, drafts, privacy and export workflows

Obsolete prototype editor files have been removed; `urdu-editor.html` is the only supported rich-text editor.

## Language preference

Every supported page includes the language control in the shared header. English is the default; choosing **اردو** switches the interface copy, page headings, common editor actions, navigation and footer to Urdu, changes the document direction to RTL, and remembers the choice in `localStorage` under `write-urdu:locale:v1`. Choosing **English** restores the LTR interface. Transliteration, keyboard input and export routines are unchanged.

Long-form translations are maintained in `js/content-locale.js`. It localizes the documentation hub, editor help cards, feature and formatting guides, tutorials, FAQ, alphabet guide, sitemap, search, feedback and privacy headings without replacing the editor's live input or export markup.

## Third-party integrations

The former `GTM-M45V9FW` loader is intentionally disabled because its live container injected duplicate application controls. Remove the affected Custom HTML tag in Google Tag Manager before adding the container back.

Advertising slots on content pages are initialized through `js/ads.js`, which loads the current AdSense client once and initializes each slot once. Content pages also receive a responsive header unit; the editor workspaces intentionally do not load advertising so the writing surface stays above the fold.
