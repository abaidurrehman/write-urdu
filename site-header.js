(function () {
    'use strict';

    var LOCALE_KEY = 'write-urdu:locale:v1';
    var currentLocale = readLocale();
    var deferredInstallPrompt = null;

    var links = [
        { href: '/', match: ['/', '/index.html'], key: 'home', label: 'Write Urdu' },
        { href: '/urdu-editor', match: ['/urdu-editor', '/urdu-editor.html'], key: 'editor', label: 'Rich Text Editor' },
        { href: '/urdu-keyboard', match: ['/urdu-keyboard', '/urdu-keyboard.html'], key: 'keyboard', label: 'Urdu Keyboard' },
        { href: '/urdu-alphabet', match: ['/urdu-alphabet', '/urdu-alphabet.html'], key: 'alphabet', label: 'Urdu Alphabet' },
        { href: '/urdu-card-studio', match: ['/urdu-card-studio', '/urdu-card-studio.html'], key: 'cardStudio', label: 'Card Studio' },
        { href: '/urdu-templates', match: ['/urdu-templates', '/urdu-templates.html'], key: 'templates', label: 'Templates' },
        { href: '/qr-code-generator', match: ['/qr-code-generator', '/qr-code-generator.html'], key: 'qrGenerator', label: 'QR Code Generator' },
        { href: '/write-urdu-documentation', match: ['/write-urdu-documentation', '/write-urdu-documentation.html'], key: 'documentation', label: 'Documentation' },
        { href: '/write-urdu-features', match: ['/write-urdu-features', '/write-urdu-features.html'], key: 'features', label: 'Features' },
        { href: '/english-urdu-typing-tutorial', match: ['/english-urdu-typing-tutorial', '/english-urdu-typing-tutorial.html'], key: 'tutorials', label: 'Tutorials' }
    ];

    var dictionary = {
        en: {
            brand: 'Write Urdu',
            tagline: 'Write Urdu, simply',
            nav: {
                home: 'Write Urdu', editor: 'Rich Text Editor', keyboard: 'Urdu Keyboard',
                alphabet: 'Urdu Alphabet', cardStudio: 'Card Studio', templates: 'Templates', qrGenerator: 'QR Code Generator', documentation: 'Documentation', features: 'Features',
                tutorials: 'Tutorials', feedback: 'Feedback'
            },
            footer: {
                home: 'Write Urdu', faq: 'FAQ', documentation: 'Documentation', features: 'Features',
                formatting: 'Editor formatting guide', tutorials: 'Tutorials', privacy: 'Privacy and terms',
                sitemap: 'Sitemap', search: 'Search', why: 'Why Write Urdu?', cardStudio: 'Card Studio', templates: 'Templates', qrGenerator: 'QR Code Generator', quran: 'Learn Quran Online',
                eyebrow: 'WRITE URDU TOOLS', description: 'A simple, private space to type, format, and share Urdu online.',
                local: 'Runs in your browser', noAccount: 'No account required', tools: 'Tools', learn: 'Learn and explore',
                about: 'About Write Urdu', privacyNote: 'Your writing stays in this browser unless you choose to export or share it.', made: 'Made for Urdu writers everywhere', transliteration: 'Roman Urdu and transliteration', fonts: 'Urdu font comparison',
                note: '© Write Urdu. Browser-based Urdu typing tools.'
            },
            header: { local: 'Runs in your browser', noAccount: 'No account required', free: 'Free to use', privacy: 'Your writing stays in this browser unless you choose to export or share it.' },
            aria: { primary: 'Primary navigation', footer: 'Footer navigation', switchUrdu: 'Switch to Urdu', switchEnglish: 'Switch to English' },
            languageAction: 'اردو',
            ui: {
                'Copy text': 'Copy text', Export: 'Export', Share: 'Share', More: 'More', Clear: 'Clear',
                'Basic editor': 'Basic editor', 'Rich editor': 'Rich editor', Save: 'Save',
                'Save as text file': 'Save as text file', 'Text file': 'Text file', 'Word document': 'Word document',
                'PDF document': 'PDF document', 'PNG image': 'PNG image', Print: 'Print', 'Typing help': 'Typing help',
                'Font samples': 'Font samples', Search: 'Search', Feedback: 'Feedback', Documentation: 'Documentation',
                Features: 'Features', Tutorials: 'Tutorials', FAQ: 'FAQ', 'Editor formatting guide': 'Editor formatting guide',
                'Privacy and terms': 'Privacy and terms', Sitemap: 'Sitemap', 'Why Write Urdu?': 'Why Write Urdu?',
                'Learn Quran Online': 'Learn Quran Online', 'Loading transliteration...': 'Loading transliteration...',
                Filename: 'Filename', Restore: 'Restore', 'Recent drafts': 'Recent drafts', 'Clear history': 'Clear history',
                'No saved drafts yet.': 'No saved drafts yet.', 'Find & replace': 'Find & replace', 'Focus mode': 'Focus mode',
                'Insert Urdu comma': 'Insert Urdu comma', 'Enter the text you want to find.': 'Enter the text you want to find.',
                'Replace all': 'Replace all', Discard: 'Discard', 'Import text': 'Import text', 'Clean spacing': 'Clean spacing',
                'Drafts are saved only on this device': 'Drafts are saved only on this device', 'No saved drafts yet. Type something to create one.': 'No saved drafts yet. Type something to create one.',
                'Saved on this device': 'Saved on this device', 'Saved on this device at': 'Saved on this device at', 'No local draft': 'No local draft',
                'Local saving unavailable': 'Local saving unavailable', 'Draft could not be saved': 'Draft could not be saved', 'Saving locally…': 'Saving locally…', 'Draft available to restore': 'Draft available to restore',
                'Your local draft has been restored.': 'Your local draft has been restored.', 'Local draft deleted.': 'Local draft deleted.', 'Draft deleted from this device.': 'Draft deleted from this device.',
                'Recent draft restored successfully.': 'Recent draft restored successfully.', 'Draft history cleared from this device.': 'Draft history cleared from this device.', 'No English numerals found.': 'No English numerals found.',
                'Spacing and Urdu punctuation cleaned.': 'Spacing and Urdu punctuation cleaned.', 'Spacing was already clean.': 'Spacing was already clean.', 'Enter text to find.': 'Enter text to find.',
                'Draft saved locally on this device.': 'Draft saved locally on this device.', 'Draft name updated.': 'Draft name updated.', 'Text file imported successfully.': 'Text file imported successfully.', 'Text file could not be imported.': 'Text file could not be imported.',
                'English numerals converted to Urdu numerals.': 'English numerals converted to Urdu numerals.', 'No matching text was found.': 'No matching text was found.',
                'Type some Urdu text before sharing.': 'Type some Urdu text before sharing.', 'Text shared successfully.': 'Text shared successfully.', 'Sharing was unavailable. You can copy the text instead.': 'Sharing was unavailable. You can copy the text instead.', 'Sharing was blocked. Copy the text and share it manually.': 'Sharing was blocked. Copy the text and share it manually.',
                 Cancel: 'Cancel', Close: 'Close', 'Got it': 'Got it', 'Exit focus': 'Exit focus', 'Install app': 'Install app', Rename: 'Rename', Delete: 'Delete', Preview: 'Preview', Shortcuts: 'Shortcuts', 'Keyboard shortcuts': 'Keyboard shortcuts',
                 'Convert English numerals to Urdu numerals': 'Convert English numerals to Urdu numerals',
                'Insert Urdu full stop': 'Insert Urdu full stop', 'Insert Urdu question mark': 'Insert Urdu question mark',
                'Insert Urdu semicolon': 'Insert Urdu semicolon'
            }
        },
        ur: {
            brand: 'رائٹ اردو',
            tagline: 'آسانی سے اردو لکھیں',
            nav: {
                home: 'رائٹ اردو', editor: 'رچ ٹیکسٹ ایڈیٹر', keyboard: 'اردو کی بورڈ',
                alphabet: 'اردو حروف تہجی', cardStudio: 'کارڈ اسٹوڈیو', templates: 'ٹیمپلیٹس', qrGenerator: 'QR کوڈ جنریٹر', documentation: 'دستاویزات', features: 'خصوصیات',
                tutorials: 'سبق', feedback: 'رائے'
            },
            footer: {
                home: 'رائٹ اردو', faq: 'سوالات', documentation: 'دستاویزات', features: 'خصوصیات',
                formatting: 'ایڈیٹر فارمیٹنگ گائیڈ', tutorials: 'سبق', privacy: 'رازداری اور شرائط',
                sitemap: 'سائٹ میپ', search: 'تلاش', why: 'رائٹ اردو کیوں؟', cardStudio: 'کارڈ اسٹوڈیو', templates: 'ٹیمپلیٹس', qrGenerator: 'QR کوڈ بنائیں', quran: 'قرآن آن لائن سیکھیں',
                eyebrow: 'رائٹ اردو ٹولز', description: 'اردو لکھنے، فارمیٹ کرنے اور شیئر کرنے کے لیے آسان اور نجی جگہ۔',
                local: 'آپ کے براؤزر میں چلتا ہے', noAccount: 'اکاؤنٹ کی ضرورت نہیں', tools: 'ٹولز', learn: 'سیکھیں اور دریافت کریں',
                about: 'رائٹ اردو کے بارے میں', privacyNote: 'آپ کی تحریر اسی براؤزر میں رہتی ہے، جب تک آپ اسے خود برآمد یا شیئر نہ کریں۔', made: 'دنیا بھر کے اردو لکھنے والوں کے لیے', transliteration: 'رومن اردو اور تحریر کی تبدیلی', fonts: 'اردو فونٹس کا موازنہ',
                note: '© رائٹ اردو۔ براؤزر پر مبنی اردو ٹائپنگ ٹولز۔'
            },
            header: { local: 'آپ کے براؤزر میں چلتا ہے', noAccount: 'اکاؤنٹ کی ضرورت نہیں', free: 'استعمال کے لیے مفت', privacy: 'آپ کی تحریر اسی براؤزر میں رہتی ہے، جب تک آپ اسے خود برآمد یا شیئر نہ کریں۔' },
            aria: { primary: 'بنیادی نیویگیشن', footer: 'فٹر نیویگیشن', switchUrdu: 'اردو میں تبدیل کریں', switchEnglish: 'انگریزی میں تبدیل کریں' },
            languageAction: 'English',
            ui: {
                'Copy text': 'متن کاپی کریں', Export: 'برآمد کریں', Share: 'شیئر کریں', More: 'مزید', Clear: 'صاف کریں',
                'Basic editor': 'بنیادی ایڈیٹر', 'Rich editor': 'رچ ایڈیٹر', Save: 'محفوظ کریں',
                'Save as text file': 'بطور متن محفوظ کریں', 'Text file': 'متنی فائل', 'Word document': 'ورڈ دستاویز',
                'PDF document': 'PDF دستاویز', 'PNG image': 'PNG تصویر', Print: 'پرنٹ', 'Typing help': 'ٹائپنگ مدد',
                'Font samples': 'فونٹ نمونے', Search: 'تلاش', Feedback: 'رائے', Documentation: 'دستاویزات',
                Features: 'خصوصیات', Tutorials: 'سبق', FAQ: 'سوالات', 'Editor formatting guide': 'ایڈیٹر فارمیٹنگ گائیڈ',
                'Privacy and terms': 'رازداری اور شرائط', Sitemap: 'سائٹ میپ', 'Why Write Urdu?': 'رائٹ اردو کیوں؟',
                'Learn Quran Online': 'قرآن آن لائن سیکھیں', 'Loading transliteration...': 'تحریر تبدیل ہو رہی ہے...',
                Filename: 'فائل کا نام', Restore: 'بحال کریں', 'Recent drafts': 'حالیہ مسودے', 'Clear history': 'تاریخچہ صاف کریں',
                'No saved drafts yet.': 'ابھی کوئی محفوظ مسودہ نہیں۔', 'Find & replace': 'تلاش اور تبدیلی', 'Focus mode': 'فوکس موڈ',
                'Insert Urdu comma': 'اردو کاما داخل کریں', 'Enter the text you want to find.': 'تلاش کے لیے متن درج کریں۔',
                'Replace all': 'سب تبدیل کریں', Discard: 'رد کریں', 'Import text': 'متن درآمد کریں', 'Clean spacing': 'فاصلہ درست کریں',
                'Drafts are saved only on this device': 'مسودے صرف اسی آلے پر محفوظ ہوتے ہیں', 'No saved drafts yet. Type something to create one.': 'ابھی کوئی محفوظ مسودہ نہیں۔ کچھ لکھیں تاکہ نیا مسودہ بن جائے۔',
                'Saved on this device': 'اسی آلے پر محفوظ ہے', 'Saved on this device at': 'اسی آلے پر محفوظ کیا گیا، وقت', 'No local draft': 'کوئی مقامی مسودہ نہیں',
                'Local saving unavailable': 'مقامی محفوظ کاری دستیاب نہیں', 'Draft could not be saved': 'مسودہ محفوظ نہیں ہو سکا', 'Saving locally…': 'مقامی طور پر محفوظ کیا جا رہا ہے…', 'Draft available to restore': 'بحال کرنے کے لیے مسودہ موجود ہے',
                'Your local draft has been restored.': 'آپ کا مقامی مسودہ بحال کر دیا گیا ہے۔', 'Local draft deleted.': 'مقامی مسودہ حذف کر دیا گیا ہے۔', 'Draft deleted from this device.': 'مسودہ اس آلے سے حذف کر دیا گیا ہے۔',
                'Recent draft restored successfully.': 'حالیہ مسودہ کامیابی سے بحال کر دیا گیا ہے۔', 'Draft history cleared from this device.': 'اس آلے سے مسودوں کا تاریخچہ صاف کر دیا گیا ہے۔', 'No English numerals found.': 'انگریزی اعداد نہیں ملے۔',
                'Spacing and Urdu punctuation cleaned.': 'فاصلہ اور اردو رموزِ اوقاف درست کر دیے گئے ہیں۔', 'Spacing was already clean.': 'فاصلہ پہلے ہی درست ہے۔', 'Enter text to find.': 'تلاش کے لیے متن درج کریں۔',
                'Draft saved locally on this device.': 'مسودہ اسی آلے پر مقامی طور پر محفوظ کر دیا گیا ہے۔', 'Draft name updated.': 'مسودے کا نام تبدیل کر دیا گیا ہے۔', 'Text file imported successfully.': 'متنی فائل کامیابی سے درآمد ہو گئی ہے۔', 'Text file could not be imported.': 'متنی فائل درآمد نہیں ہو سکی۔',
                'English numerals converted to Urdu numerals.': 'انگریزی اعداد اردو اعداد میں تبدیل کر دیے گئے ہیں۔', 'No matching text was found.': 'مطابق متن نہیں ملا۔',
                'Type some Urdu text before sharing.': 'شیئر کرنے سے پہلے کچھ اردو متن لکھیں۔', 'Text shared successfully.': 'متن کامیابی سے شیئر ہو گیا ہے۔', 'Sharing was unavailable. You can copy the text instead.': 'شیئرنگ دستیاب نہیں۔ اس کے بجائے متن کاپی کریں۔', 'Sharing was blocked. Copy the text and share it manually.': 'شیئرنگ روک دی گئی۔ متن کاپی کر کے خود شیئر کریں۔',
                 Cancel: 'منسوخ کریں', Close: 'بند کریں', 'Got it': 'سمجھ گیا', 'Exit focus': 'فوکس سے باہر نکلیں', 'Install app': 'ایپ انسٹال کریں', Rename: 'نام بدلیں', Delete: 'حذف کریں', Preview: 'پیش نظارہ', Shortcuts: 'شارٹ کٹس', 'Keyboard shortcuts': 'کی بورڈ شارٹ کٹس', 'Convert English numerals to Urdu numerals': 'انگریزی اعداد کو اردو اعداد میں تبدیل کریں',
                'Insert Urdu full stop': 'اردو فل اسٹاپ داخل کریں', 'Insert Urdu question mark': 'اردو سوالیہ نشان داخل کریں',
                'Insert Urdu semicolon': 'اردو سیمی کولن داخل کریں'
            }
        }
    };

    var pageCopy = {
        '/': { title: ['Write Urdu online', 'آن لائن اردو لکھیں'], subtitle: ['Type Roman Urdu and convert it to Urdu in your browser', 'رومن اردو لکھیں اور اسے براؤزر میں اردو میں تبدیل کریں'], documentTitle: ['Write Urdu Online | Roman Urdu to Urdu Typing', 'آن لائن اردو لکھیں | رومن اردو سے اردو ٹائپنگ'] },
        '/index.html': { title: ['Write Urdu online', 'آن لائن اردو لکھیں'], subtitle: ['Type Roman Urdu and convert it to Urdu in your browser', 'رومن اردو لکھیں اور اسے براؤزر میں اردو میں تبدیل کریں'], documentTitle: ['Write Urdu Online | Roman Urdu to Urdu Typing', 'آن لائن اردو لکھیں | رومن اردو سے اردو ٹائپنگ'] },
        '/urdu-editor.html': { title: ['Urdu Rich Text Editor', 'اردو رچ ٹیکسٹ ایڈیٹر'], subtitle: ['Write, format and export Urdu documents online', 'آن لائن اردو دستاویز لکھیں، فارمیٹ کریں اور برآمد کریں'], documentTitle: ['Urdu Rich Text Editor | Type and Format Urdu Online', 'اردو رچ ٹیکسٹ ایڈیٹر | آن لائن اردو لکھیں'] },
        '/urdu-keyboard.html': { title: ['Urdu Keyboard', 'اردو کی بورڈ'], subtitle: ['Type Urdu directly—no installation required', 'براہِ راست اردو لکھیں—انسٹالیشن کی ضرورت نہیں'], documentTitle: ['Online Urdu Keyboard | Type Urdu in Your Browser', 'آن لائن اردو کی بورڈ | براؤزر میں اردو لکھیں'] },
        '/urdu-alphabet.html': { title: ['Urdu alphabet', 'اردو حروف تہجی'], subtitle: ['A practical guide to Urdu letters and writing direction', 'اردو حروف اور لکھنے کی سمت کا عملی رہنما'], documentTitle: ['Urdu Alphabet Guide | Letters and Writing Direction', 'اردو حروف تہجی | حروف اور لکھنے کی سمت'] },
        '/urdu-card-studio.html': { title: ['Urdu Card Studio', 'اردو کارڈ اسٹوڈیو'], subtitle: ['Design and download polished Urdu cards in your browser', 'براؤزر میں خوب صورت اردو کارڈ بنائیں اور ڈاؤن لوڈ کریں'], documentTitle: ['Urdu Card Studio | Design Urdu Cards Online', 'اردو کارڈ اسٹوڈیو | آن لائن اردو کارڈ بنائیں'] },
        '/qr-code-generator.html': { title: ['Free QR Code Generator', 'مفت QR کوڈ جنریٹر'], subtitle: ['Create a static QR code privately in your browser', 'اپنے براؤزر میں نجی طور پر جامد QR کوڈ بنائیں'], documentTitle: ['Free QR Code Generator | Create QR Codes Privately', 'مفت QR کوڈ جنریٹر | نجی طور پر QR کوڈ بنائیں'] },
        '/write-urdu-documentation.html': { title: ['Write Urdu, beautifully explained.', 'رائٹ اردو، آسان انداز میں'], lede: ['A clear guide to every writing path on the site—from typing Roman Urdu and converting it into Urdu to polishing, saving and sharing a finished piece.', 'اس ویب سائٹ پر اردو لکھنے کے ہر طریقے کی واضح رہنمائی—رومن اردو کو اردو میں تبدیل کرنے سے لے کر متن کو سنوارنے، محفوظ کرنے اور شیئر کرنے تک۔'], documentTitle: ['Write Urdu Documentation | Roman Urdu, Keyboard and Rich Editor', 'رائٹ اردو دستاویزات | رومن اردو، کی بورڈ اور رچ ایڈیٹر'] },
        '/write-urdu-features.html': { title: ['Write Urdu features and export options', 'رائٹ اردو کی خصوصیات اور برآمد کے اختیارات'], subtitle: ['Write, refine and share Urdu text with browser-based tools', 'براؤزر پر مبنی ٹولز سے اردو متن لکھیں، بہتر بنائیں اور شیئر کریں'], documentTitle: ['Write Urdu Features | Drafts, Import, Export and Share', 'رائٹ اردو خصوصیات | مسودے، درآمد، برآمد اور شیئرنگ'] },
        '/urdu-editor-features.html': { title: ['Urdu Rich Text Editor formatting guide', 'اردو رچ ٹیکسٹ ایڈیٹر فارمیٹنگ گائیڈ'], subtitle: ['Learn how to format, export and share polished Urdu documents', 'خوب صورت اردو دستاویزات کو فارمیٹ، برآمد اور شیئر کرنے کا طریقہ سیکھیں'], documentTitle: ['Urdu Editor Formatting Guide | Fonts, Colour and Size', 'اردو ایڈیٹر فارمیٹنگ گائیڈ | فونٹس، رنگ اور سائز'] },
        '/english-urdu-typing-tutorial.html': { title: ['Write Urdu video tutorials', 'رائٹ اردو ویڈیو اسباق'], subtitle: ['Short guides for transliteration, typing and formatting', 'تحریر کی تبدیلی، ٹائپنگ اور فارمیٹنگ کے مختصر رہنما'], documentTitle: ['Write Urdu Tutorials | Typing and Formatting Guides', 'رائٹ اردو اسباق | ٹائپنگ اور فارمیٹنگ رہنما'] },
        '/urdu-faq.html': { title: ['Frequently Asked Questions', 'اکثر پوچھے گئے سوالات'], documentTitle: ['Urdu FAQ | Language, Script and Hindi–Urdu Questions', 'اردو سوالات | زبان، رسم الخط اور ہندی اردو'] },
        '/why-write-urdu.html': { title: ['Why write Urdu online?', 'آن لائن اردو کیوں لکھیں؟'], documentTitle: ['Why Write Urdu? | Our Purpose', 'رائٹ اردو کیوں؟ | ہمارا مقصد'] },
        '/write-urdu-feedback.html': { title: ['Feedback and suggestions', 'رائے اور تجاویز'], subtitle: ['Help us improve Write Urdu for every writer', 'ہر لکھنے والے کے لیے رائٹ اردو بہتر بنانے میں ہماری مدد کریں'], documentTitle: ['Write Urdu Feedback and Suggestions', 'رائٹ اردو رائے اور تجاویز'] },
        '/write-urdu-privacy.html': { title: ['Terms of Service and Privacy Policy', 'استعمال کی شرائط اور رازداری کی پالیسی'], subtitle: ['Plain-language information about using this website', 'اس ویب سائٹ کے استعمال سے متعلق آسان معلومات'], documentTitle: ['Write Urdu Terms of Service and Privacy Policy', 'رائٹ اردو استعمال کی شرائط اور رازداری کی پالیسی'] },
        '/write-urdu-search.html': { title: ['Search Write Urdu', 'رائٹ اردو تلاش کریں'], documentTitle: ['Search Write Urdu Guides and Resources', 'رائٹ اردو رہنما اور وسائل تلاش کریں'] },
        '/write-urdu-sitemap.html': { title: ['Write Urdu Sitemap', 'رائٹ اردو سائٹ میپ'], subtitle: ['Editors, guides and information pages', 'ایڈیٹرز، رہنما اور معلوماتی صفحات'], documentTitle: ['Write Urdu Sitemap | Editors, Guides and Policies', 'رائٹ اردو سائٹ میپ | ایڈیٹرز، رہنما اور پالیسیاں'] }
    };

    // The source files remain available with their .html names for backwards
    // compatibility, while the public URLs use clean extensionless routes.
    Object.keys(pageCopy).forEach(function (path) {
        if (/\.html$/i.test(path)) pageCopy[path.replace(/\.html$/i, '')] = pageCopy[path];
    });

    function readLocale() {
        try {
            return window.localStorage.getItem(LOCALE_KEY) === 'ur' ? 'ur' : 'en';
        } catch (error) {
            return 'en';
        }
    }

    function translation(key, fallback) {
        var value = dictionary[currentLocale];
        key.split('.').forEach(function (part) { value = value && value[part]; });
        return value || fallback || key;
    }

    function translateUi(key, fallback) {
        var ui = dictionary[currentLocale] && dictionary[currentLocale].ui;
        return ui && ui[key] || fallback || key;
    }

    function normalizedPath() {
        var path = window.location.pathname.replace(/\/+$/, '') || '/';
        if (window.location.protocol === 'file:') path = '/' + path.split('/').pop();
        return path.toLowerCase();
    }

    function normalizeInternalLinks() {
        document.querySelectorAll('a[href]').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href || /^(?:[a-z]+:|\/\/|#)/i.test(href)) return;
            var match = href.match(/^([^?#]*?)([?#].*)?$/);
            if (!match || !/\.html$/i.test(match[1])) return;
            var route = match[1].replace(/\.html$/i, '');
            link.setAttribute('href', route === 'index' ? '/' : '/' + route.replace(/^\/+/, '') + (match[2] || ''));
        });
    }

    document.addEventListener('write-urdu:content-applied', normalizeInternalLinks);

    function isActive(link, path) {
        var candidates = link.match || [link.href];
        return candidates.some(function (candidate) {
            var candidatePath = candidate.charAt(0) === '/' ? candidate : '/' + candidate;
            return candidatePath.toLowerCase() === path;
        });
    }

    function addStylesheet() {
        if (document.querySelector('link[href$="css/site-header.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/site-header.css';
        link.setAttribute('data-write-urdu-header', '');
        document.head.appendChild(link);
    }

    function ensureBrandFavicon() {
        // Keep the tab icon in sync with the current logo even on legacy
        // pages that still contain the old /favicon.ico link in their head.
        if (document.querySelector('link[data-write-urdu-favicon]')) return;
        var favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        favicon.sizes = '192x192';
        favicon.href = 'image/logo10.png';
        favicon.setAttribute('data-write-urdu-favicon', '');
        document.head.appendChild(favicon);
    }

    function renderFooter() {
        var footer = document.querySelector('footer');
        if (!footer) return;
        footer.classList.add('wu-footer');
        footer.setAttribute('data-write-urdu-footer', '');
        footer.innerHTML =
            '<div class="wu-footer-glow" aria-hidden="true"></div>' +
            '<div class="wu-footer-inner">' +
                '<div class="wu-footer-main">' +
                    '<div class="wu-footer-brand-column">' +
                        '<a class="wu-footer-brand" href="/" aria-label="Write Urdu home">' +
                            '<img src="image/logo10.png" alt="" width="44" height="44">' +
                            '<span data-wu-i18n-key="brand">Write Urdu</span>' +
                        '</a>' +
                        '<p class="wu-footer-eyebrow" data-wu-i18n-key="footer.eyebrow">WRITE URDU TOOLS</p>' +
                        '<p class="wu-footer-description" data-wu-i18n-key="footer.description">A simple, private space to type, format, and share Urdu online.</p>' +
                        '<div class="wu-footer-trust" aria-label="Write Urdu benefits">' +
                            '<span><span class="wu-footer-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="footer.local">Runs in your browser</span></span>' +
                            '<span><span class="wu-footer-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="footer.noAccount">No account required</span></span>' +
                            '<span><span class="wu-footer-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="header.free">Free to use</span></span>' +
                        '</div>' +
                    '</div>' +
                    '<nav class="wu-footer-links wu-footer-nav" aria-label="Footer navigation">' +
                        '<div class="wu-footer-group">' +
                            '<h2 data-wu-i18n-key="footer.tools">Tools</h2>' +
                            '<a href="/" data-wu-i18n-key="footer.home">Write Urdu</a>' +
                            '<a href="/urdu-editor" data-wu-i18n-key="nav.editor">Rich Text Editor</a>' +
                            '<a href="/urdu-keyboard" data-wu-i18n-key="nav.keyboard">Urdu Keyboard</a>' +
                            '<a href="/urdu-card-studio" data-wu-i18n-key="footer.cardStudio">Card Studio</a>' +
                            '<a href="/urdu-templates" data-wu-i18n-key="footer.templates">Templates</a>' +
                            '<a href="/qr-code-generator" data-wu-i18n-key="footer.qrGenerator">QR Code Generator</a>' +
                        '</div>' +
                        '<div class="wu-footer-group">' +
                            '<h2 data-wu-i18n-key="footer.learn">Learn and explore</h2>' +
                            '<a href="/urdu-alphabet" data-wu-i18n-key="nav.alphabet">Urdu Alphabet</a>' +
                            '<a href="/urdu-faq" data-wu-i18n-key="footer.faq">FAQ</a>' +
                            '<a href="/write-urdu-documentation" data-wu-i18n-key="footer.documentation">Documentation</a>' +
                            '<a href="/write-urdu-features" data-wu-i18n-key="footer.features">Features</a>' +
                            '<a href="/urdu-editor-features" data-wu-i18n-key="footer.formatting">Editor formatting guide</a>' +
                            '<a href="/english-urdu-typing-tutorial" data-wu-i18n-key="footer.tutorials">Tutorials</a>' +
                            '<a href="/roman-urdu-transliteration" data-wu-i18n-key="footer.transliteration">Roman Urdu and transliteration</a>' +
                            '<a href="/urdu-fonts-nastaliq-vs-naskh" data-wu-i18n-key="footer.fonts">Urdu font comparison</a>' +
                        '</div>' +
                        '<div class="wu-footer-group">' +
                            '<h2 data-wu-i18n-key="footer.about">About Write Urdu</h2>' +
                            '<a href="/why-write-urdu" data-wu-i18n-key="footer.why">Why Write Urdu?</a>' +
                            '<a href="/write-urdu-feedback" data-wu-i18n-key="nav.feedback">Feedback</a>' +
                            '<a href="/write-urdu-search" data-wu-i18n-key="footer.search">Search</a>' +
                            '<a href="/write-urdu-sitemap" data-wu-i18n-key="footer.sitemap">Sitemap</a>' +
                            '<a href="/write-urdu-privacy" data-wu-i18n-key="footer.privacy">Privacy and terms</a>' +
                            '<a href="https://www.onlinekidsmadrasa.com" target="_blank" rel="noopener noreferrer" data-wu-i18n-key="footer.quran">Learn Quran Online</a>' +
                        '</div>' +
                    '</nav>' +
                '</div>' +
                '<div class="wu-footer-privacy" data-wu-i18n-key="footer.privacyNote">Your writing stays in this browser unless you choose to export or share it.</div>' +
                '<div class="wu-footer-bottom">' +
                    '<p class="wu-footer-note" data-wu-i18n-key="footer.note">© Write Urdu. Browser-based Urdu typing tools.</p>' +
                    '<span class="wu-footer-made" data-wu-i18n-key="footer.made">Made for Urdu writers everywhere</span>' +
                '</div>' +
            '</div>';
    }

    function renderHeaderAd(header) {
        if (!document.body.classList.contains('content-page') || document.body.classList.contains('card-studio-page') || document.body.classList.contains('qr-generator-page') || document.querySelector('.wu-header-ad')) return;

        var adRegion = document.createElement('aside');
        adRegion.className = 'wu-header-ad';
        adRegion.setAttribute('aria-label', 'Advertisement');
        adRegion.innerHTML =
            '<ins class="adsbygoogle"' +
                ' style="display:block"' +
                ' data-ad-client="ca-pub-4727847909946286"' +
                ' data-ad-slot="8323789671"' +
                ' data-ad-format="auto"' +
                ' data-full-width-responsive="true"></ins>';
        header.insertAdjacentElement('afterend', adRegion);
    }

    function loadAds() {
        if (!document.querySelector('ins.adsbygoogle') || document.querySelector('script[src="js/ads.js"]')) return;
        var ads = document.createElement('script');
        ads.src = 'js/ads.js';
        ads.defer = true;
        document.head.appendChild(ads);
    }

    function loadContentLocale() {
        if (document.querySelector('script[src="js/content-locale.js"]')) return;
        var script = document.createElement('script');
        script.src = 'js/content-locale.js';
        script.defer = true;
        document.head.appendChild(script);
    }

    function setupProgressiveWebApp() {
        if (!document.querySelector('link[rel="manifest"]')) {
            var manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = 'manifest.webmanifest';
            document.head.appendChild(manifest);
        }
        if (!document.querySelector('meta[name="theme-color"]')) {
            var theme = document.createElement('meta');
            theme.name = 'theme-color';
            theme.content = '#0a2a1b';
            document.head.appendChild(theme);
        }
        if (window.location.protocol !== 'file:' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {
                document.body.classList.add('pwa-unavailable');
            });
        }
        window.addEventListener('beforeinstallprompt', function (event) {
            event.preventDefault();
            deferredInstallPrompt = event;
            var button = document.querySelector('[data-wu-install]');
            if (button) button.hidden = false;
        });
        window.addEventListener('appinstalled', function () {
            deferredInstallPrompt = null;
            var button = document.querySelector('[data-wu-install]');
            if (button) button.hidden = true;
        });
        document.addEventListener('click', function (event) {
            var button = event.target.closest('[data-wu-install]');
            if (!button || !deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.finally(function () {
                deferredInstallPrompt = null;
                button.hidden = true;
            });
        });
    }

    function normalizePageTitle() {
        if (document.body.classList.contains('documentation-page')) return;

        var title = document.querySelector('h1');
        if (!title) return;
        title.classList.add('wu-page-title');

        var subtitle = title.nextElementSibling;
        if (subtitle && (subtitle.matches('h4.small') || subtitle.classList.contains('page-intro'))) {
            subtitle.classList.add('wu-page-subtitle');
        }
    }

    function textWithoutIcons(element) {
        var clone = element.cloneNode(true);
        clone.querySelectorAll('i,svg,img').forEach(function (icon) { icon.remove(); });
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }

    function setLabelPreservingIcon(element, label) {
        var icons = Array.prototype.slice.call(element.children).filter(function (child) {
            return /^(I|SVG|IMG)$/i.test(child.tagName);
        });
        var textNodes = Array.prototype.slice.call(element.childNodes).filter(function (node) {
            return node.nodeType === 3;
        });
        var current = textWithoutIcons(element);
        if (current === label) return;
        if (textNodes.length) {
            var target = textNodes.find(function (node) { return node.nodeValue.trim(); }) || textNodes[textNodes.length - 1];
            target.nodeValue = ' ' + label;
            textNodes.forEach(function (node) {
                if (node !== target && node.nodeValue.trim()) node.remove();
            });
        } else if (element.children.length && !icons.length) {
            // Leave complex controls (for example the mobile menu's icon and
            // label spans) intact; their dedicated labels are handled below.
            return;
        } else {
            element.appendChild(document.createTextNode(' ' + label));
        }
        if (!icons.length && element.textContent.trim() !== label) element.textContent = label;
    }

    function applyPageCopy() {
        var copy = pageCopy[normalizedPath()] || pageCopy['/index.html'];
        var title = document.querySelector('h1');
        if (title && copy.title) title.textContent = copy.title[currentLocale === 'ur' ? 1 : 0];
        var subtitle = title && title.nextElementSibling;
        if (subtitle && copy.subtitle && (subtitle.matches('h4.small') || subtitle.classList.contains('page-intro'))) {
            subtitle.textContent = copy.subtitle[currentLocale === 'ur' ? 1 : 0];
        }
        var lede = document.querySelector('.docs-lede');
        if (lede && copy.lede) lede.textContent = copy.lede[currentLocale === 'ur' ? 1 : 0];
        if (copy.documentTitle) document.title = copy.documentTitle[currentLocale === 'ur' ? 1 : 0];
    }

    function applyControlCopy() {
        var controls = document.querySelectorAll('button,summary,.btn');
        controls.forEach(function (element) {
            if (element.hasAttribute('data-wu-language-toggle')) return;
            var ariaLabel = element.getAttribute('aria-label');
            if (ariaLabel && dictionary.en.ui[ariaLabel]) {
                element.setAttribute('data-wu-i18n-aria', ariaLabel);
                element.setAttribute('aria-label', translation('ui.' + ariaLabel, ariaLabel));
            } else {
                var ariaKey = element.getAttribute('data-wu-i18n-aria');
                if (ariaKey) element.setAttribute('aria-label', translation('ui.' + ariaKey, ariaKey));
            }
            var title = element.getAttribute('title');
            if (title && dictionary.en.ui[title]) {
                element.setAttribute('data-wu-i18n-title', title);
                element.setAttribute('title', translation('ui.' + title, title));
            } else {
                var titleKey = element.getAttribute('data-wu-i18n-title');
                if (titleKey) element.setAttribute('title', translation('ui.' + titleKey, titleKey));
            }
            var key = element.getAttribute('data-wu-i18n-control');
            var original = textWithoutIcons(element);
            if (!key && dictionary.en.ui[original]) {
                key = original;
                element.setAttribute('data-wu-i18n-control', key);
            }
            if (key && dictionary.en.ui[key]) setLabelPreservingIcon(element, translation('ui.' + key, key));
        });
    }

    function applyLocale() {
        document.documentElement.lang = currentLocale;
        document.documentElement.dir = currentLocale === 'ur' ? 'rtl' : 'ltr';
        document.body.classList.toggle('locale-urdu', currentLocale === 'ur');

        document.querySelectorAll('[data-wu-i18n-key]').forEach(function (element) {
            var key = element.getAttribute('data-wu-i18n-key');
            var label = translation(key, element.textContent.trim());
            if (element.tagName === 'NAV') element.setAttribute('aria-label', label);
            else if (element.classList.contains('wu-footer-note')) element.textContent = label;
            else element.textContent = label;
        });
        document.querySelectorAll('.wu-primary-nav a').forEach(function (link) {
            var key = link.getAttribute('data-wu-i18n-key');
            if (key) link.textContent = translation(key, link.textContent.trim());
        });
        var brand = document.querySelector('.wu-brand strong');
        var tagline = document.querySelector('.wu-brand small');
        if (brand) brand.textContent = translation('brand', brand.textContent);
        if (tagline) tagline.textContent = translation('tagline', tagline.textContent);
        var primary = document.querySelector('.wu-primary-nav');
        if (primary) primary.setAttribute('aria-label', translation('aria.primary', 'Primary navigation'));
        var footer = document.querySelector('.wu-footer-links');
        if (footer) footer.setAttribute('aria-label', translation('aria.footer', 'Footer navigation'));
        var languageButton = document.querySelector('[data-wu-language-toggle]');
        if (languageButton) {
            // Keep the action name in the language it switches to; this makes
            // the control discoverable to screen readers in either locale.
            languageButton.setAttribute('aria-label', currentLocale === 'ur' ? 'Switch to English' : 'Switch to Urdu');
            languageButton.setAttribute('aria-pressed', String(currentLocale === 'ur'));
            var languageLabel = languageButton.querySelector('[data-wu-language-label]');
            if (languageLabel) languageLabel.textContent = currentLocale === 'ur' ? 'English' : 'اردو';
        }
        var menuLabel = document.querySelector('.wu-menu-label');
        if (menuLabel) menuLabel.textContent = currentLocale === 'ur' ? 'مینو' : 'Menu';
        var menuToggle = document.querySelector('.wu-menu-toggle');
        if (menuToggle) menuToggle.setAttribute('aria-label', currentLocale === 'ur' ? 'مینو کھولیں' : 'Open menu');
        applyPageCopy();
        applyControlCopy();
        if (window.WriteUrduContentLocale && typeof window.WriteUrduContentLocale.apply === 'function') {
            window.WriteUrduContentLocale.apply(currentLocale);
        }
        normalizeInternalLinks();
        document.dispatchEvent(new CustomEvent('write-urdu:locale-change', { detail: { locale: currentLocale } }));
    }

    function changeLocale(locale) {
        currentLocale = locale === 'ur' ? 'ur' : 'en';
        try { window.localStorage.setItem(LOCALE_KEY, currentLocale); } catch (error) { /* private browsing */ }
        applyLocale();
    }

    function observeDynamicControls() {
        if (!window.MutationObserver || !document.body) return;
        var pending = false;
        new MutationObserver(function (mutations) {
            if (pending || !mutations.some(function (mutation) {
                return Array.prototype.some.call(mutation.addedNodes, function (node) { return node.nodeType === 1; });
            })) return;
            pending = true;
            window.setTimeout(function () { pending = false; applyControlCopy(); }, 0);
        }).observe(document.body, { childList: true, subtree: true });
    }

    function renderHeader() {
        var oldNav = document.querySelector('nav.navbar, nav');
        if (!oldNav) return;

        var currentPath = normalizedPath();
        if (!['/', '/index.html', '/urdu-editor', '/urdu-editor.html', '/urdu-keyboard', '/urdu-keyboard.html'].includes(currentPath)) {
            document.body.classList.add('content-page');
        }

        document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
            link.rel = 'noopener noreferrer';
        });
        var path = currentPath;
        var header = document.createElement('header');
        header.className = 'wu-site-header';
        header.setAttribute('data-write-urdu-header', '');
        header.innerHTML =
                '<div class="wu-header-inner">' +
                '<a class="wu-brand" href="/" aria-label="Write Urdu home">' +
                    '<img class="wu-brand-mark" src="image/logo10.png" alt="" width="42" height="42">' +
                    '<span><strong data-wu-i18n-key="brand">Write Urdu</strong><small data-wu-i18n-key="tagline">Write Urdu, simply</small></span>' +
                '</a>' +
                '<button class="wu-menu-toggle" type="button" aria-expanded="false" aria-controls="wu-primary-nav">' +
                    '<span class="wu-menu-icon" aria-hidden="true"></span><span class="wu-menu-label">Menu</span>' +
                '</button>' +
                '<nav class="wu-primary-nav" id="wu-primary-nav" aria-label="Primary navigation">' +
                    links.map(function (item) {
                        var active = isActive(item, path);
                        return '<a href="' + item.href + '" data-wu-i18n-key="nav.' + item.key + '"' + (active ? ' class="is-active" aria-current="page"' : '') + '>' + item.label + '</a>';
                    }).join('') +
                    '<a class="wu-feedback-link" href="/write-urdu-feedback" data-wu-i18n-key="nav.feedback">Feedback</a>' +
                '</nav>' +
                '<button class="wu-install-toggle" type="button" data-wu-install hidden>Install app</button>' +
                '<button class="wu-language-toggle" type="button" data-wu-language-toggle aria-pressed="false"><span aria-hidden="true">文</span><span data-wu-language-label>اردو</span></button>' +
            '</div>' +
            '<div class="wu-header-trustbar" role="note" aria-label="Privacy and access information">' +
                '<div class="wu-header-trustbar-inner">' +
                    '<span class="wu-header-trust-item"><span class="wu-header-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="header.local">Runs in your browser</span></span>' +
                    '<span class="wu-header-trust-item"><span class="wu-header-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="header.noAccount">No account required</span></span>' +
                    '<span class="wu-header-trust-item"><span class="wu-header-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="header.free">Free to use</span></span>' +
                    '<span class="wu-header-privacy" data-wu-i18n-key="header.privacy">Your writing stays in this browser unless you choose to export or share it.</span>' +
                '</div>' +
            '</div>';

        var wrapper = oldNav.parentElement;
        oldNav.replaceWith(header);
        if (wrapper && wrapper.children.length === 1 && wrapper.firstElementChild === header) {
            wrapper.classList.add('wu-header-wrapper');
        }
        renderHeaderAd(header);
        loadAds();
        loadContentLocale();
        setupProgressiveWebApp();
        normalizePageTitle();
        renderFooter();
        applyLocale();
        observeDynamicControls();

        var toggle = header.querySelector('.wu-menu-toggle');
        var nav = header.querySelector('.wu-primary-nav');
        var languageToggle = header.querySelector('[data-wu-language-toggle]');

        function closeMenu() {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('is-open');
        }

        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            nav.classList.toggle('is-open', !open);
        });
        languageToggle.addEventListener('click', function () {
            changeLocale(currentLocale === 'ur' ? 'en' : 'ur');
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });
        document.addEventListener('click', function (event) {
            if (!header.contains(event.target)) closeMenu();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 960) closeMenu();
        });
    }

    window.WriteUrduLocale = {
        get: function () { return currentLocale; },
        set: changeLocale,
        apply: applyLocale,
        translateUi: translateUi,
        storageKey: LOCALE_KEY
    };

    if (!document.documentElement.lang) document.documentElement.lang = 'en';
    addStylesheet();
    ensureBrandFavicon();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderHeader);
    } else {
        renderHeader();
    }
}());
