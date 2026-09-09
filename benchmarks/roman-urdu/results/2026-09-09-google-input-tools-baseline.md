# WU-JOURNEY-001B B2 — Current-provider baseline

**Captured:** 2026-09-09  
**Provider:** Google Input Tools `ur-t-i0-und`  
**Harness:** `scripts/roman-urdu-benchmark/run.js`  
**Fixture version:** `wu-journey-001b-v1`  
**GitHub Actions run:** `34311683622` (`Roman Urdu benchmark`, run 1)  
**Artifact:** `wu-journey-001b-baseline`, artifact id `10088598466`  
**Artifact SHA-256:** `7ee5c8318de3da11bbb32ac2343957531b35a26c780739b88eabcb2f0751b4b6`  
**Production behavior changed:** No

## Result

The current provider + production-like batch line/chunk handling scored **61 pass / 42 fail / 3 manual review / 0 errors** across 106 authored, public-safe fixtures. The scored pass rate is **59.2%**.

This number must **not** be presented as “WriteUrdu transliteration accuracy”. The corpus deliberately overweights difficult code-switching, protected-token and shorthand cases, and the runner primarily models the current batch/passage provider path rather than every interactive per-word keyboard behavior.

| Category | Total | Pass | Fail | Manual | Pass rate on scored cases |
| --- | ---: | ---: | ---: | ---: | ---: |
| canonical_phonetic | 15 | 10 | 5 | 0 | 66.7% |
| spelling_variant | 20 | 16 | 4 | 0 | 80.0% |
| texting_shorthand | 15 | 5 | 9 | 1 | 35.7% |
| code_switching | 16 | 1 | 15 | 0 | 6.3% |
| names_entities | 12 | 9 | 3 | 0 | 75.0% |
| long_paste | 8 | 2 | 4 | 2 | 33.3% |
| suggestion_recovery | 12 | 10 | 2 | 0 | 83.3% |
| direct_urdu_protection | 8 | 8 | 0 | 0 | 100.0% |

A useful view of the ordinary Roman-Urdu core is canonical + spelling variants + names/entities + suggestion recovery: **45/59 = 76.3%** on this corpus. The largest drop in the overall score comes from code-switching and intentionally preserved tokens rather than a universal provider collapse.

## What is working

### 1. Direct-mode protection is clean

All 8/8 direct-input fixtures passed, including Urdu, English, mixed Urdu/English, phone-shaped text, URL, PKR and line breaks. There is no evidence here to redesign direct mode.

### 2. Common spelling variation is mostly handled

16/20 spelling-variant fixtures passed. Examples that already work include the `kese / kaise / kaisy` family, `mujhe / mujhay`, `acha`, `buhat / bahut`, `kyun / kiun / kion`, `hun / hoon`, and `nahi / nahin`.

### 3. Suggestion-quality fixtures are mostly healthy

10/12 suggestion-recovery fixtures passed. `salam / salaam`, `zaroor`, `sabar`, `safar`, `sehat`, `zindagi`, `khushi`, `izzat` and `ilm` all produced an accepted candidate.

### 4. Line structure survives the batch path

The two manual multiline fixtures retained their line breaks. The main long-paste problem is therefore not line collapse; it is damage to code-switched or protected tokens inside otherwise valid converted text.

## Main failure classes

### A. High-confidence protected-token corruption — highest-severity finding

The current batch provider can transliterate text that should often remain structurally intact:

- URL: `https://write-urdu.com` → `ہتتپس://ورتے-اردو.کوم`
- email-shaped string: `admin@example.com` → transliterated local/domain text
- handle: `@ali` → `@الی`
- phone-shaped digits: `0300-1234567` → Urdu/Arabic digits
- date: `12/09/2026` → Urdu/Arabic digits
- time: `3:30 PM` → `٣:٣٠ پم`
- acronyms/codes such as `PDF`, `PKR`, `PM`
- mixed-case product tokens such as `WhatsApp` and `iPhone`

This is more serious than an imperfect Urdu spelling because a URL, email address, handle or phone number can become unusable after conversion.

**Classification:** `bounded_transform` candidate, not provider replacement.

### B. Common provider-sensitive Roman aliases

Several failing forms have a closely related form in the same corpus that already passes:

| Failing form | Current result | Proven passing sibling |
| --- | --- | --- |
| `muje` | `مجے` | `mujhe`, `mujhay` |
| `mje` | `مجے` | `mjy` |
| `accha` | `اکچھا` | `acha` |
| `bohat` | `بوہت` | `buhat`, `bahut` |
| `tumhe` | `تمھ` | `tumhain` |
| `ap` in `ap kaise hain` | `اپ کیسے ہیں` | `aap` family works elsewhere |

This is strong evidence that a **small, explicit normalization experiment** could be evaluated later. It is not permission to build a broad fuzzy dictionary.

**Classification:** `bounded_transform` candidate after protected-token work.

### C. Conversational/religious shorthand is weak

Failures include `inshallah`, `insha allah`, `mashallah`, `assalam o alaikum` and `walaikum assalam`. Some outputs are visually close, but several omit or alter standard orthography (`ماشاءاللہ`, `السلام`, etc.). These phrases are high-frequency and culturally sensitive, so they should not be “corrected” by an unreviewed fuzzy rule.

**Classification:** `provider_investigation` / reviewed accepted-set expansion / later bounded phrase handling.

### D. Names and entities are mostly good, with notable misses

9/12 passed. Failures were:

- `Ali kal aye ga` → `الی کل ہے گا`
- `Fatima ko bulao` → `فاطمہ کو بولو`
- `Quetta jana hai` → `قیٹتا جانا ہے`

These mix name spelling and surrounding-word interpretation, so a generic name dictionary would be risky.

**Classification:** `ux_recovery` or narrowly reviewed entity handling, not a first B3 change.

### E. Two suggestion failures are likely scoring/normalization issues

`mohabbat` and `muhabbat` returned forms containing a shadda (`موحبّت`, `محبّت`) while the fixture expects unvocalized `محبت`. The latter is semantically/orthographically compatible enough that exact-codepoint scoring is too strict for this case.

**Classification:** `no_change` for production; improve benchmark normalization/accepted sets before using these two failures to justify product work.

## B2 decision

**Do not replace Google Input Tools based on this baseline.** The provider is reasonably strong on ordinary variants, names and recovery cases, while the most damaging failures are concentrated in a deterministic class WriteUrdu can potentially protect itself.

### Recommended B3 candidate: conservative protected-token handling in batch conversion

Evaluate exactly one bounded experiment first:

1. apply only to explicit batch/passage conversion, not the mature word-by-word input path;
2. segment and preserve structurally unambiguous tokens before provider calls, then restore/reassemble them unchanged;
3. first protected families:
   - URLs;
   - email-shaped strings;
   - `@handles`;
   - phone/date/time/numeric shapes;
   - short ALL-CAPS acronyms such as `PDF`, `PKR`, `PM`;
   - internally mixed-case tokens such as `WhatsApp` / `iPhone` only if the rule is deterministic;
4. do **not** yet auto-preserve every English-looking word (`Facebook`, `Word`, `kg`, `thanks`, etc.); ordinary Latin words remain ambiguous because Roman Urdu itself is Latin;
5. rerun all 106 fixtures and report category deltas plus any canonical regressions.

This candidate addresses data-destruction risk while minimizing interference with long-standing transliteration muscle memory.

## Full failed/manual fixture IDs

### canonical_phonetic
`canon-ap-kaise`, `canon-bahut-acha`, `canon-jaldi-ao`, `canon-ghar-jao`, `canon-khana-khao`

### spelling_variant
`var-muje`, `var-tumhe`, `var-accha`, `var-bohat`

### texting_shorthand
`short-mje`, `short-kl` (manual), `short-plz`, `short-thx`, `short-ok`, `short-inshallah`, `short-insha-allah`, `short-mashallah`, `short-assalam`, `short-wsalam`

### code_switching
`code-whatsapp`, `code-facebook`, `code-instagram`, `code-pdf`, `code-word`, `code-link`, `code-email`, `code-handle`, `code-pkr`, `code-rs`, `code-phone`, `code-date`, `code-time`, `code-unit`, `code-model`

### names_entities
`name-ali`, `name-fatima`, `name-quetta`

### long_paste
`paste-two-lines` (manual), `paste-three-lines` (manual), `paste-mixed-url`, `paste-pkr`, `paste-english-line`, `paste-whatsapp-shape`

### suggestion_recovery
`recover-mohabbat`, `recover-muhabbat`

## Reproducibility and privacy

The workflow completed with 0 provider/network errors and produced the same fixture statuses on both passes used to create JSON and Markdown artifacts. The corpus consists only of authored public-safe fixtures. No production writing, accepted/rejected user tokens, transcripts or private drafts were collected or logged.
