# 02 — Persona journeys and UX findings

This is a heuristic walkthrough with browser automation (Playwright, Chromium). **It is not research with real users.** Where a persona was already studied in depth on a recent date, this file links to that study instead of repeating it, and only adds what was re-observed today.

Severity: **P0** blocks the task or breaks a repo contract · **P1** serious friction · **P2** polish.

## §1 Production first screen (all personas that land on `/`)

**Method (O):** `https://write-urdu.com/`, 2026-10-15, Chromium, 1366×768 desktop, 390×844 and 375×667 mobile with touch. Tested before and after accepting the consent dialog. Measured the top of `#transliterateTextarea` and every `ins.adsbygoogle` / `.google-auto-placed` element.

| Viewport | Editor top (prod) | Editor top (local, no ads) | Auto-placed units above editor |
| --- | --- | --- | --- |
| 1366×768, consented | 686 px | 534 px | `.home-account-hero-layout` (h 298), `.editor-page-intro` (h 280), **inside `section.wu-basic-command-surface`** (h 280) |
| 390×844, consented | 1056 px | 556 px | `.home-account-hero-layout` (h 408) |
| 375×667 | 852 px | 459 px | `.editor-page-intro` |

There are 8+ further auto-placed units in the SEO content below the tool. The manual `aside.wu-header-ad` (post-workspace) is where the contract wants it.

- **P0 · Ads split the writing task.** This breaks the `intent → input choice → writer` topology and Gate B2 (`WU-PLAT-002H` mobile acceptance). **Fix:** AdSense account settings per `docs/WU-MOBILE-ADSENSE-CORE-WRITE-PAGE-EXCLUSIONS-2026-08-19.md` §2–3. Never fix it with CSS/JS hiding.
- **P1 · Desktop hero.** Next to the H1 there is a voice promo card ("Talk. Get Urdu text."), then a "Two ways to write Urdu" box, a mode bar and an example strip, all before the editor. Local desktop editor top is 534 px of 768. **Gated:** see `03-homepage-spec.md`.

## §2 Persona A — first-time English-letter typer

**Entry:** search "English to Urdu typing online" → `/`. **Task:** type `mera naam ali hai`, copy.

Observed locally (390×844 and 1366×768, live Google transliteration):

| Step | Observation | Severity |
| --- | --- | --- |
| Find input | Local: editor visible in the first viewport with the label "Urdu writing editor". Production: below the fold (§1). | P0 on prod (ads), OK locally |
| Understand Space | H1 lede and example strip both show `mera khayal hai → میرا خیال ہے` with "Press Space" | OK |
| Result | `mera naam ali hai ` → `میرا نام الی ہے`. The common name **علی** comes out as **الی**. | P1: transliteration quality for common names (`WU-JOURNEY-001B`) |
| Correct it | "Backspace twice → suggestion" is explained in the lede and how-to list, not at the point of error | P2 |
| Copy | After the first word, **Copy, Preview, PDF, Word, PNG, ⌄, Create Card, Share, More** plus 3 mode chips appear above the editor, and the editor shifts down on mobile. Copy is first and green but competes with 8 other actions. | P1: action hierarchy (frozen, see 03) |
| Next step | "What do you want to do next? → Format this as a document" appears below the editor | OK (P0.1C shipped) |

Prior deep evidence: `docs/WU-MOBILE-ACTIVATION-EVIDENCE-2026-09-03.md`, `specs/WU-UXR-001` (2026-10-10).

## §3 Persona B — poetry to WhatsApp Status

**Observed (local, 390×844):** typed `dil se jo baat nikalti hai asar rakhti hai ` → `دل سے جو بات نکلتی ہے اثر رکھتی ہے`. **Create Card** navigated to `/urdu-card-gallery`, and the field already contained the full couplet. **No retyping, no content loss.**

Not re-walked today: gallery → Card Studio → download. That path was studied with 8 personas on 2026-10-11 (`docs/audits/urdu-card-studio-ux-2026-10-11/`, 39 findings). Its P1s are being fixed in `WU-UXR-002` (Slices A–D shipped; E–P open). The main open risk is the funnel from canvas edit to export (40 edits → 3 exports, `BACKLOG` P0.1F).

## §4 Persona C — student assignment

Not re-walked today. Known state (R):

- "Format this as a document" continuation appears after text.
- The Rich Editor (`/urdu-editor`) has PDF/Word export.
- PDF + Word are 82.9% of exports.
- Templates exist at `/urdu-writing-templates` (applications, letters, notices).

Open decisions are listed in `BACKLOG` P0.11 (D-3 `.docx`).

## §5 Persona D — mobile voice

**Before today (O, repo):** the voice page said only "availability and processing depend on your browser or device". It had no help for a blocked microphone and no answer on when listening starts.

**Shipped on branch today:**

- "Where voice typing works" passage
- 3 FAQs: microphone blocked, listening only after Start, voice vs English-letter typing
- FAQPage schema
- Urdu translation

Browser names are deliberately omitted until `docs/VOICE-MOBILE-DEVICE-CHECKLIST.md` has PASS records. That checklist is still unfilled (**P1, owner: device sign-off**). Existing voice browser specs pass, including the permission-denial recovery paths for iPhone Safari and Android Chrome.

## §6 Persona E — shop bill

`/urdu-bill-generator` was redesigned and merged today (#269, `docs/audits/urdu-bill-generator-2/`). It is listed in the nav as "Create a quick shop bill or receipt". It was not re-walked to avoid overlapping that just-merged work.

## §7 Persona F — wedding invitation

`/urdu-wedding-invitation-maker` shipped a visual composer with 16 original designs (2026-10-13) and a Royal Mughal suite (2026-10-14). It is linked from related pages (#262). It was not re-walked. Card-art work continues under `WU-CARD-ART-002`.

## §8 Persona G — returning user

Known state (R):

- local draft autosave/history on the writers;
- "Recent cards on this device" (last 20, WU-UXR-002 C);
- optional account + My Documents (`WU-DRAFT-001`).

**Open decision D-5** (returning-draft visibility) is in `BACKLOG` P0.11. Recommendation: resolve D-5 before building any new "resume" surface on `/`.

## §9 Findings not tied to one persona

| Finding | Severity | Label |
| --- | --- | --- |
| `www` duplicate host returns 200 | P0 (SEO/AI) | O |
| InPage page had no "why it looks like symbols" answer and its example was JS-only | P1 | O (fixed on branch) |
| WhatsApp/phone Urdu question had no answer anywhere | P1 | O (fixed on branch) |
| Schema text extraction put a space before punctuation after links (`السلام علیکم .`) | P2 | O (fixed on branch) |
| `/urdu-phrases-copy-paste` had few contextual incoming links | P2 | O (13 static incoming pages on branch) |
