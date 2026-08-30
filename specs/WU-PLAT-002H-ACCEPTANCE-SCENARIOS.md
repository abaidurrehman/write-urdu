# WU-PLAT-002H — Acceptance Scenarios

These scenarios are intentionally outcome-based. They should guide Playwright/browser acceptance and manual review without requiring pixel-identical UI.

## Scenario 1 — Mobile search visitor starts immediately

Given a mobile visitor lands on `/`  
When the first usable viewport is rendered  
Then the purpose (`English to Urdu Typing` or approved equivalent), a short example, input choices and the writer are the dominant task  
And no account, community, all-tools directory or ad displaces the writer  
And the visitor can focus and type without opening another panel.

## Scenario 2 — Empty writer is calm

Given the Basic Writer is empty  
Then content-dependent Share/PDF/Word/PNG/Preview/Print commands are not presented as a primary disabled command wall  
And input mode/help remain available  
And lower-frequency actions remain discoverable through a stable progressive surface if needed.

## Scenario 3 — First useful Urdu

Given a user produces useful text  
Then Copy becomes obvious without moving the caret/editor unexpectedly  
And a contextual continuation surface becomes eligible  
And no account/publish wall interrupts the first success.

## Scenario 4 — Substantial writing escalates safely

Given a user has substantial text in Basic Writer  
When `Continue with formatting` is selected  
Then Rich Editor opens with the source text preserved through the approved handoff mechanism  
And an existing target draft is not silently destroyed  
And telemetry records destination ready + meaningful start without the writing content.

## Scenario 5 — Long unsaved writing receives one value request

Given a signed-out user has long meaningful writing  
Then `Keep this writing` may be shown  
And Share/Community Publish do not simultaneously appear as competing promotional banners in the same decision area  
And normal Copy/PDF/Word task commands remain usable without signup.

## Scenario 6 — Signed-in writer is not re-acquired

Given the user is authenticated  
Then account-creation copy is absent  
And save/My Documents state is useful  
And Share or Community Publish can be suggested only according to state/arbitration.

## Scenario 7 — Voice is discoverable but optional

Given Voice is supported  
Then `Speak Urdu` is visible as an input choice in the governed Basic Writer discovery layer  
And it has a textual accessible name  
And choosing Voice invokes the existing Voice platform rather than a duplicated recognition engine.

Given Voice is unsupported  
Then English-letter and direct-Urdu writing remain fully usable  
And the unsupported Voice state is explained without blocking writing.

## Scenario 8 — Share recipient really starts

Given a reader clicks `Create your own` or equivalent on a public share/community surface  
Then the correct destination workspace loads  
And referral context is recognized  
And the target is ready to begin  
And the first creation action is measurable as a referred start.

If the CTA promises `Use this text`, the public text is restored through the approved first-party handoff and is not placed in the destination URL.

## Scenario 9 — Card Studio first completion

Given a first-time user enters Card Studio  
Then the default path makes the intended output/role, text, preview and Download path understandable  
And Advanced controls do not need to be understood to complete a common card  
And existing advanced capability remains reachable.

## Scenario 10 — No content leakage

Across every scenario  
Then telemetry contains only bounded state/action metadata  
And no writing/transcript/filename/document/share identifier is sent in product analytics or handoff URLs.

## Scenario 11 — Ad boundary

Across active writing/creation states  
Then ads do not appear inside or deceptively adjacent to input choices, the writing canvas, result, export/share/publish controls  
And approved post-workspace monetization remains governed by `WU-GROWTH-001`.

## Scenario 12 — Feature discovery does not become a directory

Given a user completes a task  
Then no more than three contextual continuation actions are visibly promoted  
And additional valid destinations use a progressive `More options`/global navigation path  
And the active task area does not render a generic product catalog as the primary next step.
