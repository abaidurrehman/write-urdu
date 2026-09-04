# Write Urdu — Core writing pages: protected-zone AdSense monetization

**Original date:** 2026-08-19  
**Last reviewed:** 2026-09-04  
**Status:** P0 production monetization contract  
**Scope:** English and Urdu-locale versions of `/`, `/urdu-editor`, `/urdu-keyboard`

## Product decision

Core Write pages must remain monetized. They are the site's primary traffic and product surfaces, so whole-page AdSense Page Exclusions are **not** the desired steady-state strategy.

The required topology is:

- **desktop:** Auto Ads side rails on the left/right where viewport width allows;
- **mobile:** Auto Ads anchor at the **bottom only**;
- **all devices:** keep the existing controlled manual responsive unit after the active workspace;
- **never:** allow in-page Auto Ads to split, cover, or appear inside the active writing/input/editor workflow.

The editor is a hard protected zone, not an ad-free page.

## Why this exists

A production mobile capture on 2026-08-19 showed Google Auto Ads inserting additional advertising inside supporting semantic cards and reserving very large mobile areas. On 2026-09-04 the problem was reported again, this time as advertising appearing in/over the editor input experience.

Any placement inside or deceptively adjacent to the active authoring task is a P0 activation defect because it can obscure the primary product action, shift the editor, cover the caret, or make advertising look like part of the writing UI.

Do not solve this by hiding already-rendered Google ad iframes or containers with CSS/JavaScript. Configure AdSense placement controls before rendering.

## Required AdSense account configuration

In **AdSense → Ads → write-urdu.com → Edit**:

### 1. Keep Auto Ads enabled

Do **not** add whole-page exclusions for the core writing routes as the normal production strategy.

Historical note: the earlier August 2026 emergency recommendation used **Page exclusions / This page only** as a fail-safe. That is now superseded because these pages carry most product traffic and need controlled monetization rather than zero Auto Ads.

### 2. Overlay formats

Under **Overlay formats**:

- **Side rail ads:** ON.
- **Side rail position:** **Left and right**.
- **Anchor ads:** ON.
- **Anchor position:** **Bottom only**.
- **Desktop anchor:** optional; prefer side rails on widescreen and avoid stacking an extra desktop anchor unless revenue evidence justifies it.
- **Vignette ads:** OFF for the conservative WriteUrdu configuration because full-screen interstitial navigation is not part of the desired write-first experience.

Google's current Auto Ads controls support explicit side-rail position and top/bottom anchor position.

### 3. In-page formats

The safest WriteUrdu configuration is:

- **Banner Auto Ads:** OFF if the majority of monetizable traffic is the core writing pages.
- **Multiplex Auto Ads:** OFF inside the core writing experience.

If product/business later decides to retain in-page Auto Ads for Learn/Create pages, use **Excluded areas** in the AdSense preview to protect the complete core writing block on layouts shared with Write pages.

The protected area must cover, as one task region where possible:

`intent / input method choice -> editor / textarea -> immediate task actions / first result -> continuation controls`

Do not define an exclusion that protects only the literal `<textarea>` while allowing Google to insert an ad between the input-mode chooser and the writer, between the editor and Copy/Continue, or between TinyMCE toolbar and document canvas.

Excluded areas govern **in-page** Auto Ads. Overlay formats such as anchor ads are controlled separately, which is why the bottom-only anchor setting is required.

## Code-side contract

`js/write-monetization.js` and `js/ads.js` continue to own the explicit manual core-Write placement:

- page type is `write`;
- placement family is `write_post_workspace`;
- the unit is retained only after `[data-wu-ad-boundary="post-workspace"]`;
- no manual ad is inserted inside the Basic Writer toolbar/editor, Keyboard workspace or Rich Editor canvas;
- no ad belongs between input method choices and the editable surface;
- no ad belongs over the caret, active line, formatting controls, Copy/Continue actions or first-success state;
- trust pages remain unmonetized.

The permitted core Write monetization topology is:

`side rail | intent -> input choice -> writer -> task/continuation -> post-workspace manual ad | side rail`

On mobile:

`intent -> input choice -> writer -> task/continuation -> post-workspace manual ad`

plus an independently dismissible **bottom anchor** that must not visually cover the active caret or essential controls.

Never:

`intent -> ad -> input -> ad -> writer`

or:

`writer/editor -> in-page Auto Ad injected inside active workspace`.

## Production verification

Verify after AdSense settings propagate:

1. Open `/` on mobile around 375x667 and 390x844.
2. Confirm the only overlay format is a **bottom anchor**, never top.
3. Confirm no in-page Auto Ad appears inside or between the input-mode chooser, Basic Writer textarea, first Urdu result, command surface or continuation actions.
4. Focus the textarea and open the software keyboard; confirm the bottom anchor does not make the active line/caret unusable.
5. Confirm the intentional manual **ADVERTISEMENT** unit remains after the active workspace.
6. Repeat on `/urdu-editor`; no ad may appear between/inside TinyMCE toolbar and editable document canvas.
7. Repeat on `/urdu-keyboard`; no ad may split or cover the input + on-screen keyboard relationship.
8. Repeat on `/urdu/`, `/urdu/urdu-editor` and `/urdu/urdu-keyboard`.
9. On desktop widescreen, confirm side rails appear outside the application content column and do not overlap the writer.
10. Confirm no large blank ad reservation appears inside the active task.

## Mobile Gate B2 release rule

`WU-PLAT-002H` mobile acceptance cannot close while advertising can reproduce inside or deceptively adjacent to the active writing workspace.

Production evidence must confirm:

- no whole-page Page Exclusion is required for normal operation;
- side rails/anchor/manual post-workspace monetization remain available;
- no uncontrolled in-page ad enters the protected writing block;
- bottom anchor behavior remains usable with the mobile keyboard open;
- editor visibility, focus behavior and Core Web Vitals are not materially degraded by advertising.

## Regression rule

Future monetization work must preserve **monetized page + protected authoring zone** as the governing model. Do not re-enable broad in-page Auto Ads inside core Write flows merely to increase impression count, and do not disable monetization across the entire high-traffic Write route as a routine workaround.
