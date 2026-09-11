# Microsoft translation activation evidence — 2026-09-11

## Scope

This record captures the live Microsoft Translator benchmark, production smoke tests and operator-supplied Azure configuration for `WU-INPUT-001F`. It contains only committed fixture text and public product responses. No credential value is recorded.

## Azure resource evidence

The operator confirmed the following Azure Translator configuration in the Azure portal:

- resource group: `write-urdu`;
- resource name: `writeurdu-translator`;
- region: East Asia (`eastasia` in runtime configuration);
- pricing tier: F0 Free, shown as up to 2 million translated characters per month;
- text translation endpoint: the standard global Microsoft Translator endpoint;
- key: configured as a Cloudflare production secret and not recorded here.

The current account usage and remaining monthly F0 headroom were not captured. Cost evidence therefore remains `partial` rather than `pass`.

## Full live fixture run

Provider: Microsoft Translator v3.

Sanitized operator result file SHA-256:

`B951171C16B5844FB4A4D902F0258BB6556AF7C78805E1902AF357C30C360212`

The file contained all 24 committed translation fixtures and no failed requests:

| Direction | Cases | Successful | Failed | Minimum | Median | Average | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Urdu to English | 12 | 12 | 0 | 314 ms | 1,127.5 ms | 1,132 ms | 2,059 ms |
| English to Urdu | 12 | 12 | 0 | 125 ms | 327.5 ms | 464 ms | 1,275 ms |

Raw outputs by fixture:

| Fixture | Direction | Microsoft output | Human decision |
| --- | --- | --- | --- |
| `ur_en_everyday_001` | Urdu to English | How are you? | pending |
| `ur_en_everyday_002` | Urdu to English | I'll be home tomorrow. | pending |
| `ur_en_message_001` | Urdu to English | Please reply to me by evening. | pending |
| `ur_en_work_001` | Urdu to English | The meeting will begin at 10 a.m. on Monday. | pending |
| `ur_en_work_002` | Urdu to English | Please email the invoice today. | pending |
| `ur_en_name_001` | Urdu to English | Ali is going to Karachi from Lahore. | pending |
| `ur_en_number_001` | Urdu to English | It is priced at Rs 2,500. | pending |
| `ur_en_formal_001` | Urdu to English | I request you to consider my request. | pending |
| `ur_en_learning_001` | Urdu to English | I don't understand the meaning of that word. | pending |
| `ur_en_social_001` | Urdu to English | The weather is great today, let's go outside? | pending |
| `ur_en_ambiguity_001` | Urdu to English | He will come tomorrow. | pending |
| `ur_en_multisentence_001` | Urdu to English | I've seen the file. Some changes are necessary. | pending |
| `en_ur_everyday_001` | English to Urdu | آپ کیسے ہیں؟ | pending |
| `en_ur_everyday_002` | English to Urdu | میں کل گھر آؤں گا۔ | pending |
| `en_ur_message_001` | English to Urdu | براہ کرم آج شام تک جواب دیں۔ | pending |
| `en_ur_work_001` | English to Urdu | میٹنگ پیر کو صبح 10 بجے شروع ہوگی۔ | pending |
| `en_ur_work_002` | English to Urdu | براہ کرم آج ہی انوائس ای میل کریں۔ | pending |
| `en_ur_name_001` | English to Urdu | علی لاہور سے کراچی جا رہے ہیں۔ | pending |
| `en_ur_number_001` | English to Urdu | اس کی قیمت 2,500 روپے ہے۔ | pending |
| `en_ur_formal_001` | English to Urdu | میں درخواست کرتا ہوں کہ براہ کرم میری درخواست پر غور کریں۔ | pending |
| `en_ur_learning_001` | English to Urdu | میں اس لفظ کا مطلب نہیں سمجھ سکا۔ | pending |
| `en_ur_social_001` | English to Urdu | آج موسم بہت خوبصورت ہے۔ کیا ہم باہر چلیں؟ | pending |
| `en_ur_ambiguity_001` | English to Urdu | وہ کل آئیں گے۔ | pending |
| `en_ur_multisentence_001` | English to Urdu | میں نے فائل کا جائزہ لیا ہے۔ کچھ تبدیلیاں ضروری ہیں۔ | pending |

An informal screening classified 20 outputs as pass candidates and four as requiring manual review. This is not the fixture-by-fixture fluent human review required by the activation threshold. Quality remains `partial` and both translation rows remain `ready: false` until that review is recorded.

## Production smoke evidence

Bounded production requests were run on 2026-09-11 using committed fixture text:

- `ur` to `en`: HTTP 200, `آپ کیسے ہیں؟` returned `How are you?`;
- `en` to `ur`: HTTP 200, `How are you?` returned `آپ کیسے ہیں؟`;
- both responses reported `providerAlias=microsoft-translator` and `modelAlias=translator-v3`;
- production response header included `Cache-Control: no-store`;
- `/tools/urdu-english-voice-translator` returned HTTP 200 and retained `noindex,follow`;
- deployed CSS contained explicit LTR/left-aligned and RTL/right-aligned textarea rules.

These checks prove provider routing and deployed text-direction behavior. They do not prove microphone recognition quality or the required browser/device matrix.

## Current decision

The founder enabled `INPUT_TRANSLATION_ENABLED` in production after the successful smoke tests. This operational choice is recorded separately from acceptance: both text rows remain not ready because fluent human review and current F0 usage/headroom evidence are incomplete.

Do not index the preview or enable audio/dictionary gates from this evidence. Next manual evidence is:

1. record a decision for every translation fixture;
2. capture current F0 usage/headroom without exposing credentials;
3. complete Urdu and English microphone scenarios in supported browsers;
4. record permission-denied and unsupported-browser behavior.
