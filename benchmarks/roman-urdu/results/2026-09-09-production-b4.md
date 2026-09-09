# WU-JOURNEY-001B B4 — Production protected-token promotion

**Captured:** 2026-09-09  
**Production path:** `js/batch-transliteration.js`  
**Provider:** Google Input Tools `ur-t-i0-und`  
**Final dedicated workflow run:** `34319104260` (`Roman Urdu benchmark`, run 28)  
**Validated branch head:** `a05833a04bc55a2fe2a46abbf4114637924d1441`  
**Artifact:** `wu-journey-001b-b4`, artifact id `10091198120`  
**Artifact SHA-256:** `21559c582ac6bb6aef5e52f5c15034e13f240b96e93d9dc41596b55b7792ee99`  
**Production behavior changed:** Yes — explicit batch/passage transliteration only

## Decision

B4 is validated for the narrow production promotion tested in B3.

The actual shipped `js/batch-transliteration.js` runtime now protects structurally unambiguous tokens during explicit batch/passage conversion, while preserving the existing provider request path for ordinary Roman Urdu chunks that contain no protected token.

The mature per-word typing path, Space/Backspace interaction, suggestion behavior, direct Urdu mode, provider selection, UI and analytics are unchanged.

## Measured production result

The dedicated workflow executed the authored 106-fixture corpus through the **actual production batch runtime**, not a copied experimental implementation.

| Measure | Baseline | B4 production | Delta |
| --- | ---: | ---: | ---: |
| Scored pass rate | 59.2% | 71.8% | **+12.6 pp** |
| Passed scored fixtures | 61/103 | 74/103 | **+13** |
| Fail → pass wins | — | 13 | **+13** |
| Pass → fail regressions | — | 0 | **0** |

### Category delta

| Category | Baseline pass | B4 pass | Delta |
| --- | ---: | ---: | ---: |
| canonical_phonetic | 10 | 10 | +0 |
| spelling_variant | 16 | 16 | +0 |
| texting_shorthand | 5 | 5 | +0 |
| code_switching | 1 | 12 | **+11** |
| names_entities | 9 | 9 | +0 |
| long_paste | 2 | 4 | **+2** |
| suggestion_recovery | 10 | 10 | +0 |
| direct_urdu_protection | 8 | 8 | +0 |

The production promotion therefore reproduces the B3 experimental gain in exactly the target failure families without changing the scored outcomes of unrelated Roman Urdu categories.

## Production boundary

B4 protects only these structural families before a batch provider call:

- `http://` / `https://` URLs;
- email-shaped strings;
- `@handles`;
- ASCII numeric shapes, including standalone numbers, phone/date/time-like forms;
- short ALL-CAPS acronyms/codes of 2–6 letters, such as `PDF`, `PKR`, `PM`;
- internally mixed-case tokens such as `WhatsApp` and `iPhone`.

The protected fragment is kept byte-for-byte. Surrounding Roman Urdu fragments continue through Google Input Tools and are reassembled with the protected token locally.

### Deliberate non-goals

B4 does **not** broadly preserve every English-looking Latin token. In particular, it intentionally leaves ambiguous forms such as the following provider-owned:

- `Facebook`;
- `Instagram`;
- `Word`;
- `Ali`;
- `kg`;
- `plz` / `thx` / `ok`;
- normal Roman Urdu words.

Roman Urdu itself uses Latin characters, so a generic “English-word detector” would create unacceptable false-positive risk.

## Measured wins

The production runtime converted 13 previously failing fixtures to pass, including:

- `WhatsApp par message bhej do` preserving `WhatsApp`;
- `PDF bana kar bhej do` preserving `PDF`;
- `https://write-urdu.com` remaining a usable URL;
- `admin@example.com` remaining a usable email address;
- `@ali` remaining an intact handle;
- `PKR 2500` retaining its code and ASCII amount;
- `0300-1234567` remaining an intact phone number;
- `12/09/2026` retaining ASCII date digits;
- `3:30 PM` remaining intact;
- `iPhone 15` remaining intact;
- URL and PKR/amount preservation inside multiline pasted passages.

The `Rs 400` fixture also becomes usable because the numeric token is protected and the adjacent two-letter `Rs` fragment is too short for the batch Roman-text detector, so it remains unchanged. This is an observed consequence of the existing batch threshold, not a new special-case dictionary rule.

## Regression gates

### 1. Legacy unprotected request path

`tests/batch-transliteration-protected-tokens.test.js` executes the actual browser runtime under a mocked provider and asserts that an ordinary unprotected Roman Urdu chunk still produces exactly **one provider request containing the original whole chunk**.

This is the most important compatibility guard for long-standing Roman Urdu behavior.

### 2. Protected tokens never enter provider segments

The same production test verifies URLs, emails, handles, acronyms, mixed-case product tokens and numeric shapes survive byte-for-byte and do not appear inside provider request segments.

### 3. False-positive boundary

The production test explicitly checks that ambiguous text such as:

`Facebook Word Ali plz kg thanks`

remains one provider-owned request rather than being silently preserved by B4.

### 4. Multiline behavior

Line count remains stable, protected tokens inside later lines survive, and a numeric-only line remains unchanged.

### 5. PWA rollout

`js/batch-transliteration.js` is part of the service-worker app shell, whose static assets are cache-first. B4 therefore advances the cache generation from `write-urdu-shell-v45` to `write-urdu-shell-v46` so returning users receive the new runtime.

No service-worker fetch, navigation, API, account or offline behavior was otherwise changed.

The dedicated B4 gate executes the service-worker freshness contract plus every existing PWA/cache-generation contract whose expected current generation moved from v45 to v46:

- account document editors;
- account growth entry;
- mobile authoring focus;
- capture continuity;
- mobile editor activation;
- Basic Writer voice;
- Rich Editor / Urdu Keyboard voice;
- outcome navigation;
- Create / Publish boundaries;
- core workspace convergence.

All passed in workflow run `34319104260`.

## Repository-wide quality status

The general Quality workflow reaches and passes the new B4 transliteration contract and all earlier unrelated contracts. It then stops at the already-known, pre-B4 Urdu-locale generator mismatch for `/urdu-editor`:

`Missing literal localization source for /urdu-editor: <summary class="btn btn-dark"><i class="fas fa-download" ...>`

B4 does not modify the Rich Editor HTML or Urdu locale generator and deliberately does not mix that independent repair into this production transliteration slice.

Because the general suite stops at that existing locale contract, B4 runs its later PWA generation contracts explicitly in the dedicated Roman Urdu workflow; all of them pass.

## Privacy and processing

- no production user writing was used in the benchmark corpus;
- no Roman source tokens, Urdu candidates or accepted/rejected user words are added to analytics;
- the existing provider remains Google Input Tools;
- conversion still occurs only when the relevant batch/passage feature calls the transliteration method;
- protected structural tokens are reassembled locally rather than being included in the segmented provider request;
- this does not change the product’s feature-specific privacy disclosures or justify a blanket “nothing leaves your browser” claim.

## Remaining failures / next evidence

B4 intentionally does not address:

- broad English-word preservation (`Facebook`, `Instagram`, `Word`, `kg`, `thanks`);
- common Roman aliases such as `muje`, `mje`, `accha`, `bohat`, `tumhe`;
- religious/conversational shorthand such as `inshallah`, `mashallah`, `assalam o alaikum`;
- entity/provider misses such as `Ali`, `Fatima`, `Quetta`;
- the separate benchmark-normalization question around `mohabbat` / `muhabbat` and shadda.

Those should remain separate evidence-led candidates rather than being bundled into B4.

## B4 conclusion

**Promote the narrow protected-token layer: validated.**

The production implementation addresses the highest-severity B2 failure class—destructive corruption of structurally important mixed content—while preserving ordinary Roman Urdu request behavior and producing zero scored regressions in the 106-fixture benchmark.
