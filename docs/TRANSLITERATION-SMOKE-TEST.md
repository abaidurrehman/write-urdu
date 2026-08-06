# WriteUrdu transliteration smoke test

Run this checklist on the Cloudflare Pages preview before merging any change that touches the homepage, editor markup, editor scripts, shared CSS, or third-party script loading.

## Required environments

Test at minimum:

- Desktop Chromium
- Mobile viewport in Chromium
- One additional browser when the change affects script loading or focus behavior

## Core transliteration

1. Open the homepage with a clean browser session.
2. Confirm there is one visible Urdu writing textarea.
3. Click the textarea and type `mera khyal hai` using English letters.
4. Press Space after each word.
5. Confirm the text converts to Urdu script and remains editable.
6. Type a word that produces suggestions, then use Backspace as supported by the transliteration control.
7. Confirm suggestions remain usable and do not move behind overlays or toolbars.
8. Press `Ctrl+G` and confirm the input mode toggles between English and Urdu.
9. Press `Ctrl+G` again and confirm transliteration resumes.

## Editor actions

1. Enter a mix of Urdu and English text.
2. Use **Copy text** and paste into a plain-text destination.
3. Confirm the copied text exactly matches the editor.
4. Use **Clear** and confirm only the editor content is removed.
5. Confirm the editor keeps focus or can immediately receive input again.
6. Export a text file and confirm it contains the current editor text.

## Resilience checks

1. Reload the page and confirm the editor initializes once.
2. Resize between desktop and mobile widths and confirm no duplicate editor appears.
3. Open and close navigation, export, and settings controls; confirm typing still works.
4. Use keyboard-only navigation to reach the textarea and primary actions.
5. Confirm the focus indicator is visible.
6. Confirm no uncaught error appears in the browser console during initialization or typing.

## Merge blocker

Do not merge when any of the following occurs:

- Roman Urdu no longer converts after Space.
- The textarea is missing, duplicated, replaced, or hidden.
- `Ctrl+G` no longer toggles input mode.
- Copy, clear, or text export reads from a different control.
- A visual overlay blocks suggestions or keyboard interaction.
- Initialization throws an uncaught error.

Record the Cloudflare preview URL and tested browsers in the pull request before marking it ready for review.
