# Write Urdu — Core writing pages: AdSense Auto Ads exclusion

**Date:** 2026-08-19  
**Status:** Required production configuration  
**Scope:** `/`, `/urdu-editor`, `/urdu-keyboard`

## Why this exists

The core Write surfaces are application workspaces first. Write Urdu intentionally monetizes them with a controlled responsive ad unit only **after** the active writing workspace (`data-wu-ad-boundary="post-workspace"`).

A production mobile capture on 2026-08-19 showed Google Auto Ads inserting additional advertising inside supporting semantic cards and reserving very large mobile areas. Examples included an insertion between a tool-card heading and its description and a large interruption inside the supporting tool directory. Those placements are not authored by Write Urdu and violate the product rule that advertising must stay outside authoring, result, action and semantic-card surfaces.

The application code cannot reliably turn account-level Auto Ads off for one URL while keeping our manual ad unit active. Do not attempt to solve this by hiding already-rendered Google ad iframes or containers with CSS/JavaScript.

## Required AdSense account configuration

In the Google AdSense site settings for `write-urdu.com`:

1. Open **Ads**.
2. Select/edit `write-urdu.com`.
3. Open **Page exclusions**.
4. Add each of these as an exact **This page only** exclusion:
   - `https://write-urdu.com/`
   - `https://write-urdu.com/urdu-editor`
   - `https://write-urdu.com/urdu-keyboard`
5. Apply/save the site changes.

These exclusions are for **Auto Ads only**. They must not remove the intentional manual responsive unit placed by Write Urdu after the active workspace.

## Code-side contract that remains

`js/write-monetization.js` and `js/ads.js` continue to own the manual core-Write placement:

- page type is `write`;
- placement family is `write_post_workspace`;
- the unit is only retained when `[data-wu-ad-boundary="post-workspace"]` exists;
- no ad is inserted inside the Basic Writer toolbar/editor, Keyboard workspace or Rich Editor canvas;
- trust pages remain unmonetized.

## Production verification

After AdSense has applied the exclusions, verify in a private/incognito mobile session:

1. Open `https://write-urdu.com/` at an approximately Pixel 5 / 393px viewport.
2. Confirm there is no Auto Ad injected inside the toolbar, editor, Continue-with panel, supporting tool cards, How-it-works cards or footer.
3. Confirm the intentional **ADVERTISEMENT** unit after the active workspace can still render.
4. Confirm no large blank Auto Ad reservation appears between supporting content and the footer.
5. Repeat on `/urdu-editor` and `/urdu-keyboard`.
6. Do not treat a temporary empty manual slot as an application defect; AdSense fill can vary.

## Regression rule

Future monetization work must not re-enable uncontrolled Auto Ads on the three core writing routes merely to increase impression count. If monetization needs to change, add/reposition explicit design-system ad boundaries and measure the effect without degrading the writing task.
