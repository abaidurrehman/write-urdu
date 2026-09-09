'use strict';

// Curated, public-safe benchmark fixtures for WU-JOURNEY-001B.
// These examples are authored for testing and contain no production user text.

function fx(id, category, input, assertion, data) {
  return Object.assign({ id, category, input, assertion }, data || {});
}

const fixtures = [
  // canonical_phonetic
  fx('canon-mera-khayal', 'canonical_phonetic', 'mera khayal hai', 'accepted_set', { accepted: ['میرا خیال ہے'] }),
  fx('canon-ap-kaise', 'canonical_phonetic', 'ap kaise hain', 'suggestion_contains', { accepted: ['آپ کیسے ہیں', 'آپ کیسے ہیں؟'] }),
  fx('canon-main-theek', 'canonical_phonetic', 'main theek hun', 'suggestion_contains', { accepted: ['میں ٹھیک ہوں'] }),
  fx('canon-aap-kahan', 'canonical_phonetic', 'aap kahan hain', 'suggestion_contains', { accepted: ['آپ کہاں ہیں'] }),
  fx('canon-kal-milenge', 'canonical_phonetic', 'kal milenge', 'suggestion_contains', { accepted: ['کل ملیں گے', 'کل ملینگے'] }),
  fx('canon-shukriya', 'canonical_phonetic', 'shukriya', 'suggestion_contains', { accepted: ['شکریہ'] }),
  fx('canon-meherbani', 'canonical_phonetic', 'meherbani', 'suggestion_contains', { accepted: ['مہربانی'] }),
  fx('canon-zaroor', 'canonical_phonetic', 'zaroor', 'suggestion_contains', { accepted: ['ضرور'] }),
  fx('canon-mujhe-pata', 'canonical_phonetic', 'mujhe pata hai', 'suggestion_contains', { accepted: ['مجھے پتا ہے', 'مجھے پتہ ہے'] }),
  fx('canon-kya-hua', 'canonical_phonetic', 'kya hua', 'suggestion_contains', { accepted: ['کیا ہوا'] }),
  fx('canon-bahut-acha', 'canonical_phonetic', 'bohat acha hai', 'suggestion_contains', { accepted: ['بہت اچھا ہے'] }),
  fx('canon-koi-baat', 'canonical_phonetic', 'koi baat nahi', 'suggestion_contains', { accepted: ['کوئی بات نہیں'] }),
  fx('canon-jaldi-ao', 'canonical_phonetic', 'jaldi ao', 'suggestion_contains', { accepted: ['جلدی آؤ', 'جلدی آو'] }),
  fx('canon-ghar-jao', 'canonical_phonetic', 'ghar jao', 'suggestion_contains', { accepted: ['گھر جاؤ', 'گھر جاو'] }),
  fx('canon-khana-khao', 'canonical_phonetic', 'khana khao', 'suggestion_contains', { accepted: ['کھانا کھاؤ', 'کھانا کھاو'] }),

  // spelling_variant
  fx('var-kese', 'spelling_variant', 'kese', 'suggestion_contains', { accepted: ['کیسے'] }),
  fx('var-kaise', 'spelling_variant', 'kaise', 'suggestion_contains', { accepted: ['کیسے'] }),
  fx('var-kaisy', 'spelling_variant', 'kaisy', 'suggestion_contains', { accepted: ['کیسے'] }),
  fx('var-muje', 'spelling_variant', 'muje', 'suggestion_contains', { accepted: ['مجھے'] }),
  fx('var-mujhe', 'spelling_variant', 'mujhe', 'suggestion_contains', { accepted: ['مجھے'] }),
  fx('var-mujhay', 'spelling_variant', 'mujhay', 'suggestion_contains', { accepted: ['مجھے'] }),
  fx('var-tumhe', 'spelling_variant', 'tumhe', 'suggestion_contains', { accepted: ['تمہیں', 'تمھے'] }),
  fx('var-tumhain', 'spelling_variant', 'tumhain', 'suggestion_contains', { accepted: ['تمہیں'] }),
  fx('var-acha', 'spelling_variant', 'acha', 'suggestion_contains', { accepted: ['اچھا'] }),
  fx('var-accha', 'spelling_variant', 'accha', 'suggestion_contains', { accepted: ['اچھا'] }),
  fx('var-bohat', 'spelling_variant', 'bohat', 'suggestion_contains', { accepted: ['بہت'] }),
  fx('var-buhat', 'spelling_variant', 'buhat', 'suggestion_contains', { accepted: ['بہت'] }),
  fx('var-bahut', 'spelling_variant', 'bahut', 'suggestion_contains', { accepted: ['بہت'] }),
  fx('var-kyun', 'spelling_variant', 'kyun', 'suggestion_contains', { accepted: ['کیوں'] }),
  fx('var-kiun', 'spelling_variant', 'kiun', 'suggestion_contains', { accepted: ['کیوں'] }),
  fx('var-kion', 'spelling_variant', 'kion', 'suggestion_contains', { accepted: ['کیوں'] }),
  fx('var-hun', 'spelling_variant', 'hun', 'suggestion_contains', { accepted: ['ہوں'] }),
  fx('var-hoon', 'spelling_variant', 'hoon', 'suggestion_contains', { accepted: ['ہوں'] }),
  fx('var-nahi', 'spelling_variant', 'nahi', 'suggestion_contains', { accepted: ['نہیں'] }),
  fx('var-nahin', 'spelling_variant', 'nahin', 'suggestion_contains', { accepted: ['نہیں'] }),

  // texting_shorthand
  fx('short-mjy', 'texting_shorthand', 'mjy', 'suggestion_contains', { accepted: ['مجھے'] }),
  fx('short-mje', 'texting_shorthand', 'mje', 'suggestion_contains', { accepted: ['مجھے'] }),
  fx('short-ap', 'texting_shorthand', 'ap', 'suggestion_contains', { accepted: ['آپ'] }),
  fx('short-aap', 'texting_shorthand', 'aap', 'suggestion_contains', { accepted: ['آپ'] }),
  fx('short-kl', 'texting_shorthand', 'kl', 'manual_review'),
  fx('short-aj', 'texting_shorthand', 'aj', 'suggestion_contains', { accepted: ['آج'] }),
  fx('short-plz', 'texting_shorthand', 'plz', 'preserve_token', { tokens: ['plz'] }),
  fx('short-thx', 'texting_shorthand', 'thx', 'preserve_token', { tokens: ['thx'] }),
  fx('short-ok', 'texting_shorthand', 'ok', 'preserve_token', { tokens: ['ok'] }),
  fx('short-inshallah', 'texting_shorthand', 'inshallah', 'suggestion_contains', { accepted: ['انشاءاللہ', 'ان شاء اللہ'] }),
  fx('short-insha-allah', 'texting_shorthand', 'insha allah', 'suggestion_contains', { accepted: ['ان شاء اللہ', 'انشا اللہ', 'انشاء اللہ'] }),
  fx('short-mashallah', 'texting_shorthand', 'mashallah', 'suggestion_contains', { accepted: ['ماشاءاللہ', 'ما شاء اللہ'] }),
  fx('short-assalam', 'texting_shorthand', 'assalam o alaikum', 'suggestion_contains', { accepted: ['السلام علیکم', 'اسلام و علیکم'] }),
  fx('short-wsalam', 'texting_shorthand', 'walaikum assalam', 'suggestion_contains', { accepted: ['وعلیکم السلام', 'والیکم السلام'] }),
  fx('short-khuda-hafiz', 'texting_shorthand', 'khuda hafiz', 'suggestion_contains', { accepted: ['خدا حافظ'] }),

  // code_switching
  fx('code-whatsapp', 'code_switching', 'WhatsApp par message bhej do', 'preserve_token', { tokens: ['WhatsApp'] }),
  fx('code-facebook', 'code_switching', 'Facebook par post kar do', 'preserve_token', { tokens: ['Facebook'] }),
  fx('code-instagram', 'code_switching', 'Instagram story laga do', 'preserve_token', { tokens: ['Instagram'] }),
  fx('code-pdf', 'code_switching', 'PDF bana kar bhej do', 'preserve_token', { tokens: ['PDF'] }),
  fx('code-word', 'code_switching', 'Word file save kar lo', 'preserve_token', { tokens: ['Word'] }),
  fx('code-link', 'code_switching', 'ye link kholo https://write-urdu.com', 'preserve_token', { tokens: ['https://write-urdu.com'] }),
  fx('code-email', 'code_switching', 'email admin@example.com par bhejo', 'preserve_token', { tokens: ['admin@example.com'] }),
  fx('code-handle', 'code_switching', '@ali ko tag kar do', 'preserve_token', { tokens: ['@ali'] }),
  fx('code-pkr', 'code_switching', 'price PKR 2500 hai', 'preserve_token', { tokens: ['PKR', '2500'] }),
  fx('code-rs', 'code_switching', 'Rs 400 kal dena', 'preserve_token', { tokens: ['Rs', '400'] }),
  fx('code-phone', 'code_switching', 'mujhe 0300-1234567 par call karo', 'preserve_token', { tokens: ['0300-1234567'] }),
  fx('code-date', 'code_switching', 'meeting 12/09/2026 ko hai', 'preserve_token', { tokens: ['12/09/2026'] }),
  fx('code-time', 'code_switching', 'kal 3:30 PM par ao', 'preserve_token', { tokens: ['3:30', 'PM'] }),
  fx('code-unit', 'code_switching', '2 kg aam le ao', 'preserve_token', { tokens: ['2', 'kg'] }),
  fx('code-model', 'code_switching', 'iPhone 15 ka cover lana', 'preserve_token', { tokens: ['iPhone', '15'] }),
  fx('code-emoji', 'code_switching', 'bohat acha laga 😊', 'preserve_token', { tokens: ['😊'] }),

  // names_entities
  fx('name-ali', 'names_entities', 'Ali kal aye ga', 'suggestion_contains', { accepted: ['علی کل آئے گا', 'علی کل آے گا'] }),
  fx('name-aisha', 'names_entities', 'Aisha ghar par hai', 'suggestion_contains', { accepted: ['عائشہ گھر پر ہے', 'عایشہ گھر پر ہے'] }),
  fx('name-fatima', 'names_entities', 'Fatima ko bulao', 'suggestion_contains', { accepted: ['فاطمہ کو بلاؤ', 'فاطمہ کو بلاو'] }),
  fx('name-ahmed', 'names_entities', 'Ahmed se baat karo', 'suggestion_contains', { accepted: ['احمد سے بات کرو'] }),
  fx('name-karachi', 'names_entities', 'Karachi jana hai', 'suggestion_contains', { accepted: ['کراچی جانا ہے'] }),
  fx('name-lahore', 'names_entities', 'Lahore kal jana hai', 'suggestion_contains', { accepted: ['لاہور کل جانا ہے'] }),
  fx('name-islamabad', 'names_entities', 'Islamabad mein meeting hai', 'suggestion_contains', { accepted: ['اسلام آباد میں میٹنگ ہے', 'اسلام آباد میں meeting ہے'] }),
  fx('name-peshawar', 'names_entities', 'Peshawar se aya hun', 'suggestion_contains', { accepted: ['پشاور سے آیا ہوں'] }),
  fx('name-multan', 'names_entities', 'Multan ka mausam acha hai', 'suggestion_contains', { accepted: ['ملتان کا موسم اچھا ہے'] }),
  fx('name-quetta', 'names_entities', 'Quetta jana hai', 'suggestion_contains', { accepted: ['کوئٹہ جانا ہے'] }),
  fx('name-sindh', 'names_entities', 'Sindh mein garmi hai', 'suggestion_contains', { accepted: ['سندھ میں گرمی ہے'] }),
  fx('name-punjab', 'names_entities', 'Punjab mein barish hai', 'suggestion_contains', { accepted: ['پنجاب میں بارش ہے'] }),

  // long_paste
  fx('paste-two-lines', 'long_paste', 'mera khayal hai ke kal ana chahiye\nagar waqt mila to zaroor milenge', 'manual_review'),
  fx('paste-three-lines', 'long_paste', 'assalam o alaikum\nap kaise hain\nkal ghar aa sakte hain', 'manual_review'),
  fx('paste-mixed-url', 'long_paste', 'ye website dekhein:\nhttps://write-urdu.com\nphir mujhe batayein', 'preserve_token', { tokens: ['https://write-urdu.com'] }),
  fx('paste-phone', 'long_paste', 'Ali bhai kal call karna\n0300-1234567\nshukriya', 'preserve_token', { tokens: ['0300-1234567'] }),
  fx('paste-emoji', 'long_paste', 'aj bohat acha din tha 😊\nkal phir milte hain 👍', 'preserve_token', { tokens: ['😊', '👍'] }),
  fx('paste-pkr', 'long_paste', 'total PKR 2500 hai\nRs 500 advance de diye\nbaqi kal', 'preserve_token', { tokens: ['PKR', '2500', 'Rs', '500'] }),
  fx('paste-english-line', 'long_paste', 'mera naam Ali hai\nProject Update\nkal report bhej dunga', 'preserve_token', { tokens: ['Project Update'] }),
  fx('paste-whatsapp-shape', 'long_paste', 'salam\nkal 3:30 PM par milte hain\nlocation: Gulberg Lahore\nthanks', 'preserve_token', { tokens: ['3:30', 'PM', 'location:', 'thanks'] }),

  // suggestion_recovery
  fx('recover-salam', 'suggestion_recovery', 'salam', 'suggestion_contains', { accepted: ['سلام'] }),
  fx('recover-salaam', 'suggestion_recovery', 'salaam', 'suggestion_contains', { accepted: ['سلام'] }),
  fx('recover-zaroor', 'suggestion_recovery', 'zaroor', 'suggestion_contains', { accepted: ['ضرور'] }),
  fx('recover-sabar', 'suggestion_recovery', 'sabar', 'suggestion_contains', { accepted: ['صبر'] }),
  fx('recover-safar', 'suggestion_recovery', 'safar', 'suggestion_contains', { accepted: ['سفر'] }),
  fx('recover-sehat', 'suggestion_recovery', 'sehat', 'suggestion_contains', { accepted: ['صحت'] }),
  fx('recover-zindagi', 'suggestion_recovery', 'zindagi', 'suggestion_contains', { accepted: ['زندگی'] }),
  fx('recover-khushi', 'suggestion_recovery', 'khushi', 'suggestion_contains', { accepted: ['خوشی'] }),
  fx('recover-mohabbat', 'suggestion_recovery', 'mohabbat', 'suggestion_contains', { accepted: ['محبت'] }),
  fx('recover-muhabbat', 'suggestion_recovery', 'muhabbat', 'suggestion_contains', { accepted: ['محبت'] }),
  fx('recover-izzat', 'suggestion_recovery', 'izzat', 'suggestion_contains', { accepted: ['عزت'] }),
  fx('recover-ilm', 'suggestion_recovery', 'ilm', 'suggestion_contains', { accepted: ['علم'] }),

  // direct_urdu_protection
  fx('direct-urdu-one', 'direct_urdu_protection', 'میں ٹھیک ہوں', 'exact_expected', { expected: 'میں ٹھیک ہوں' }),
  fx('direct-urdu-two', 'direct_urdu_protection', 'آپ کیسے ہیں؟', 'exact_expected', { expected: 'آپ کیسے ہیں؟' }),
  fx('direct-english-one', 'direct_urdu_protection', 'PDF', 'exact_expected', { expected: 'PDF' }),
  fx('direct-number', 'direct_urdu_protection', '0300-1234567', 'exact_expected', { expected: '0300-1234567' }),
  fx('direct-url', 'direct_urdu_protection', 'https://write-urdu.com', 'exact_expected', { expected: 'https://write-urdu.com' }),
  fx('direct-mixed', 'direct_urdu_protection', 'میرا نام Ali ہے', 'exact_expected', { expected: 'میرا نام Ali ہے' }),
  fx('direct-pkr', 'direct_urdu_protection', 'قیمت PKR 2500 ہے', 'exact_expected', { expected: 'قیمت PKR 2500 ہے' }),
  fx('direct-lines', 'direct_urdu_protection', 'پہلی سطر\nدوسری سطر', 'exact_expected', { expected: 'پہلی سطر\nدوسری سطر' })
];

module.exports = fixtures;
