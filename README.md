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

## Third-party integrations

The former `GTM-M45V9FW` loader is intentionally disabled because its live container injected duplicate application controls. Remove the affected Custom HTML tag in Google Tag Manager before adding the container back.

Advertising slots on content pages are initialized through `js/ads.js`, which loads AdSense once and initializes each slot once. The editor workspaces do not load advertising.
