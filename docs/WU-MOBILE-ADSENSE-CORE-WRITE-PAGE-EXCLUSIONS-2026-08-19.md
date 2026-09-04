# Write Urdu — Core writing pages: AdSense Auto Ads exclusion

**Original date:** 2026-08-19  
**Last reviewed:** 2026-09-04  
**Status:** P0 required production configuration — re-verify now  
**Scope:** `/`, `/urdu-editor`, `/urdu-keyboard`

## Why this exists

The core Write surfaces are application workspaces first. Write Urdu intentionally monetizes them with a controlled responsive ad unit only **after** the active writing workspace (`data-wu-ad-boundary="post-workspace"`).

A production mobile capture on 2026-08-19 showed Google Auto Ads inserting additional advertising inside supporting semantic cards and reserving very large mobile areas. On 2026-09-04 the problem was reported again, this time as advertising appearing in/over the editor input experience. Treat any such placement as a P0 writing-activation defect.

Those placements are not authored by Write Urdu and violate the product rule that advertising must stay outside authoring, input-choice, result, action and semantic-card surfaces.

The application code cannot reliably turn account-level Auto Ads off for one URL while keeping our manual ad unit active. Do not attempt to solve this by hiding already-rendered Google ad iframes or containers with CSS/JavaScript.

## Required AdSense account configuration

Use **Page exclusions** for the core writing routes. This is deliberately stronger than an area-only exclusion.

In the Google AdSense site settings for `write-urdu.com`:

1. Open **Ads**.
2. Select/edit `write-urdu.com`.
3. Open **Page exclusions** / **Manage**.
4. Add each of these as an exact **This page only** exclusion:
   - `https://write-urdu.com/`
   - `https://write-urdu.com/urdu-editor`
   - `https://write-urdu.com/urdu-keyboard`
5. Apply/save the site changes.
6. Re-open the site settings and verify all three exclusions are still present after saving.

These exclusions are for **Auto Ads only**. They must not remove the intentional manual responsive unit placed by Write Urdu after the active workspace.

### Why not rely only on “Excluded areas”

Google's AdSense controls distinguish page exclusions from excluded areas:

- **Excluded areas** apply to in-page Auto Ads around the selected CSS-defined region.
- They do **not** prevent overlay formats such as anchor ads.
- A selector-based exclusion can also stop working if the page structure/selectors later change.
- **Page exclusions** are therefore the required control on core writing routes because these pages already have a deliberate manual post-workspace monetization boundary.

Area exclusions may still be used on other mixed content/tool pages where Auto Ads remain enabled, but they are not the primary protection for `/`, `/urdu-editor` or `/urdu-keyboard`.

### `google-anno-skip` is not the production control

`js/ads.js` marks writing pages with `google-anno-skip` and related annotations as a defensive signal. Do not treat that markup as equivalent to an AdSense Page Exclusion. The account-level exclusion is the authoritative Auto Ads control.

## Code-side contract that remains

`js/write-monetization.js` and `js/ads.js` continue to own the manual core-Write placement:

- page type is `write`;
- placement family is `write_post_workspace`;
- the unit is only retained when `[data-wu-ad-boundary="post-workspace"]` exists;
- no manual ad is inserted inside the Basic Writer toolbar/editor, Keyboard workspace or Rich Editor canvas;
- no ad belongs between input method choices and the editable surface;
- no ad belongs over the caret, active line, formatting controls, Copy/Continue actions or first-success state;
- trust pages remain unmonetized.

The permitted Write-page monetization topology is therefore:

`intent -> compact input choice -> writer -> task/continuation -> post-workspace boundary -> one controlled manual ad -> supporting content`

Never:

`intent -> ad -> input -> ad -> writer`

or:

`writer/editor -> Auto Ad injected inside active workspace`.

## Production verification

After AdSense has applied the exclusions, verify in a private/incognito mobile session:

1. Open `https://write-urdu.com/` at approximately 375x667 and 390x844 viewports.
2. Confirm there is no Auto Ad inside or over the input-mode chooser, Basic Writer textarea, command surface, first Urdu result or continuation actions.
3. Focus the textarea and open the mobile keyboard; confirm no anchor/overlay covers the caret or active writing region.
4. Confirm the intentional **ADVERTISEMENT** unit after the active workspace can still render.
5. Repeat on `/urdu-editor`; verify no ad appears inside/over TinyMCE, its toolbar or active caret area.
6. Repeat on `/urdu-keyboard`; verify no ad appears between the text input and the on-screen keyboard or covers either keyboard.
7. Confirm no large blank Auto Ad reservation appears inside the active task.
8. Do not treat a temporary empty manual post-workspace slot as an application defect; AdSense fill can vary.

## Mobile Gate B2 release rule

`WU-PLAT-002H` mobile acceptance cannot close while an Auto Ad can reproduce inside or deceptively adjacent to the active writing workspace.

Production evidence must confirm:

- all three AdSense Page Exclusions are active;
- no uncontrolled Auto Ad is observed on the three core writing routes;
- the single approved manual post-workspace placement remains outside the active authoring task;
- editor visibility, focus/keyboard behavior and Core Web Vitals are not degraded by advertising.

## Regression rule

Future monetization work must not re-enable uncontrolled Auto Ads on the three core writing routes merely to increase impression count. If monetization needs to change, add/reposition explicit design-system ad boundaries and measure the effect without degrading the writing task.
