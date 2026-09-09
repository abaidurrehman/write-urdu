# WU-JOURNEY-001B B3 — Protected-token candidate experiment

**Captured:** 2026-09-09  
**Candidate:** `protected-tokens`  
**Provider:** Google Input Tools `ur-t-i0-und`  
**Workflow:** `Roman Urdu benchmark` run `34317038008`  
**Artifact:** `wu-journey-001b-b3`, artifact id `10090459319`  
**Artifact SHA-256:** `99e75c63df9fd7b61bb51c9992502713934d0cc225147f6e5a06c386636acec7`  
**Production behavior changed:** No

## Result

The B3 candidate materially improved the authored benchmark without introducing any pass→fail regression.

| Measure | Baseline | B3 candidate | Delta |
| --- | ---: | ---: | ---: |
| Scored pass rate | 59.2% | 71.8% | **+12.6 pp** |
| Passed scored fixtures | 61/103 | 74/103 | **+13** |
| Fail → pass wins | — | 13 | **+13** |
| Pass → fail regressions | — | 0 | **0** |

### Category delta

| Category | Baseline pass | Candidate pass | Delta |
| --- | ---: | ---: | ---: |
| canonical_phonetic | 10 | 10 | +0 |
| spelling_variant | 16 | 16 | +0 |
| texting_shorthand | 5 | 5 | +0 |
| code_switching | 1 | 12 | **+11** |
| names_entities | 9 | 9 | +0 |
| long_paste | 2 | 4 | **+2** |
| suggestion_recovery | 10 | 10 | +0 |
| direct_urdu_protection | 8 | 8 | +0 |

The candidate therefore improved exactly the failure family it targeted while leaving the unrelated benchmark families unchanged.

## Candidate rules tested

The experiment protects only structurally unambiguous token families before a batch/passage provider call, transliterates surrounding Roman Urdu, then restores the protected token byte-for-byte.

Protected in B3:

- `http://` / `https://` URLs;
- email-shaped strings;
- `@handles`;
- ASCII numeric shapes, including phone/date/time/standalone-number forms;
- short ALL-CAPS acronyms/codes such as `PDF`, `PKR`, `PM`;
- internal mixed-case tokens such as `WhatsApp` and `iPhone`.

Deliberately **not** protected in B3:

- ordinary title-case words such as `Facebook`, `Instagram`, `Word`, `Ali`;
- ambiguous short Latin words such as `Rs`, `kg`, `plz`, `thx`, `ok`;
- normal Roman Urdu words.

This boundary is important: Roman Urdu itself is Latin text, so a broad “preserve English-looking words” rule would be unsafe.

## 13 measured wins

### Code-switching

1. `WhatsApp par message bhej do`  
   `وہاتسپپ پر میسج بھیج دو` → `WhatsApp پر میسج بھیج دو`
2. `PDF bana kar bhej do`  
   `پی ڈی ایف بنا کر بھیج دو` → `PDF بنا کر بھیج دو`
3. URL preservation  
   broken transliterated URL → `https://write-urdu.com`
4. email preservation  
   broken transliterated address → `admin@example.com`
5. `@ali` preservation  
   `@الی` → `@ali`
6. `PKR 2500` preservation  
   `پکڑ ٢٥٠٠` → `PKR 2500`
7. `Rs 400` fixture became usable because the numeric value remains ASCII while `Rs` stayed unchanged in this context.
8. phone number preservation  
   Urdu/Arabic digits → `0300-1234567`
9. date preservation  
   Urdu/Arabic digits → `12/09/2026`
10. time/acronym preservation  
   `٣:٣٠ پم` → `3:30 PM`
11. `iPhone 15` preservation  
   `افونے ١٥` → `iPhone 15`

### Long-paste

12. URL inside multiline passage remained intact.
13. `PKR 2500` / `Rs 500` inside multiline passage remained intact.

## Remaining failures are useful boundaries

The candidate intentionally does not solve every code-switching case.

Still failing examples include:

- `Facebook`;
- `Instagram`;
- `Word`;
- `kg`;
- `Project Update`;
- `location:` / `thanks` in a WhatsApp-shaped multiline example.

These are **not evidence that B3 failed**. They demonstrate where the first deterministic protection boundary stops. Expanding into ordinary Latin-word detection would require a separate experiment because those tokens are inherently ambiguous with Roman Urdu.

The candidate also does not address existing provider-sensitive Roman aliases such as `muje`, `mje`, `accha`, `bohat`, `tumhe`, or conversational/religious phrase variants. Those remain separate future candidate families.

## Regression assessment

### Protected behavior

- canonical phonetic: unchanged;
- spelling variants: unchanged;
- texting shorthand: unchanged;
- names/entities: unchanged;
- suggestion recovery: unchanged;
- direct Urdu protection: unchanged;
- pass→fail regressions: **0**.

### Privacy

No production writing was used. The experiment uses only the authored benchmark corpus and does not add telemetry or log real user tokens.

### Scope

This is a **benchmark/test-path experiment only**. `js/batch-transliteration.js` production behavior has not been modified in B3.

## B3 decision

**B3 succeeds.** The protected-token strategy is strongly supported for a production implementation decision because it:

1. fixes a high-severity data-corruption class;
2. improves the target category by 11 fixtures;
3. improves long-paste outcomes by 2 fixtures;
4. produces zero measured regressions in unrelated families;
5. does not require replacing Google Input Tools;
6. does not require a dictionary, fuzzy matcher, AI model, or user-content telemetry.

## Recommended B4

Promote the same narrow structural rules into the real **explicit batch/passage conversion path only**, with the following release gates:

- keep per-word interactive transliteration unchanged;
- keep direct mode unchanged;
- use the same structural allowlist as the B3 experiment;
- add production contract tests for exact preservation and false-positive boundaries;
- run the 106-fixture benchmark again against the production implementation;
- add browser acceptance for URL/email/handle/phone/date/time/PKR/WhatsApp/iPhone multiline examples;
- do not widen the rule to ordinary English-looking words in the same change.

Only after that should B4 be considered ready to merge into production.
