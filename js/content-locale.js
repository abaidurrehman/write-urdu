(function () {
    'use strict';

    /*
     * The shared header owns the language preference and the navigation. This
     * companion keeps long-form help and documentation copy in one place so
     * the HTML remains readable and the editor's functional markup is never
     * replaced by a translation routine.
     */
    var originals = new WeakMap();
    var attributeOriginals = new WeakMap();
    var textOriginals = new WeakMap();

    function pathName() {
        var path = window.location.pathname.replace(/\/+$/, '') || '/';
        if (window.location.protocol === 'file:') path = '/' + path.split('/').pop();
        return path.toLowerCase();
    }

    function remember(element) {
        if (!originals.has(element)) originals.set(element, element.innerHTML);
        return originals.get(element);
    }

    function setMarkup(element, urdu, locale) {
        if (!element) return;
        var english = remember(element);
        element.innerHTML = locale === 'ur' ? urdu : english;
        element.setAttribute('lang', locale === 'ur' ? 'ur' : 'en');
    }

    function setText(element, urdu, locale) {
        setMarkup(element, urdu.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), locale);
    }

    function setTextPreservingChildren(element, urdu, locale) {
        if (!element) return;
        var textNode = Array.prototype.find.call(element.childNodes, function (node) { return node.nodeType === 3; });
        if (!textNode) return;
        if (!textOriginals.has(element)) textOriginals.set(element, textNode.nodeValue);
        textNode.nodeValue = locale === 'ur' ? urdu : textOriginals.get(element);
    }

    function sequence(selector, values, locale) {
        var nodes = document.querySelectorAll(selector);
        Array.prototype.forEach.call(nodes, function (node, index) {
            if (values[index]) setMarkup(node, values[index], locale);
        });
    }

    function one(selector, value, locale) {
        setMarkup(document.querySelector(selector), value, locale);
    }

    function setAttribute(selector, name, urdu, locale) {
        var nodes = document.querySelectorAll(selector);
        Array.prototype.forEach.call(nodes, function (node) {
            var saved = attributeOriginals.get(node) || {};
            if (!Object.prototype.hasOwnProperty.call(saved, name)) saved[name] = node.getAttribute(name) || '';
            attributeOriginals.set(node, saved);
            node.setAttribute(name, locale === 'ur' ? urdu : saved[name]);
        });
    }

    function attributeSequence(selector, name, values, locale) {
        var nodes = document.querySelectorAll(selector);
        Array.prototype.forEach.call(nodes, function (node, index) {
            if (!values[index]) return;
            var saved = attributeOriginals.get(node) || {};
            if (!Object.prototype.hasOwnProperty.call(saved, name)) saved[name] = node.getAttribute(name) || '';
            attributeOriginals.set(node, saved);
            node.setAttribute(name, locale === 'ur' ? values[index] : saved[name]);
        });
    }

    function localizeDocumentation(locale) {
        one('.docs-eyebrow', 'رائٹ اردو دستاویزات', locale);
        one('.docs-actions .docs-button', 'بنیادی ایڈیٹر کھولیں', locale);
        one('.docs-actions .docs-button-light', 'رچ ایڈیٹنگ دیکھیں', locale);
        sequence('.docs-chip', ['آپ کے براؤزر میں چلتا ہے', 'اکاؤنٹ کی ضرورت نہیں', 'اردو کو ترجیح دینے والا آؤٹ پٹ'], locale);
        one('.docs-card-label', 'ایک سادہ خیال', locale);
        one('.docs-hero-card > p:not(.docs-script)', 'قدرتی انداز میں لکھیں، اپنے الفاظ قریب رکھیں، اور ضرورت کے مطابق صرف وہی ٹول منتخب کریں جس کی آپ کو ضرورت ہو۔', locale);

        sequence('.docs-section-heading h2', [
            'اپنا لکھنے کا طریقہ منتخب کریں', 'پہلے لفظ سے مکمل مسودے تک', 'چھوٹے ٹولز، بڑا فائدہ',
            'یاد رکھنے کے قابل شارٹ کٹس', 'اعتماد کے ساتھ برآمد کریں', 'سوالات کے جواب'
        ], locale);
        sequence('.docs-section-heading > p', [
            'اپنی سوچ کے مطابق ورک اسپیس سے آغاز کریں۔ جب مسودہ آگے بڑھے تو آپ کسی بھی وقت دوسرے ٹول پر جا سکتے ہیں۔',
            'کارآمد اردو لکھنے کا مختصر راستہ جان بوجھ کر آسان رکھا گیا ہے۔',
            'لکھنے کے کنٹرول ایڈیٹر کے قریب رہتے ہیں، مگر اصل توجہ لکھنے کی جگہ پر رہتی ہے۔',
            'یہ شارٹ کٹس لکھتے وقت ہاتھوں کو کی بورڈ پر رکھنے میں مدد دیتے ہیں۔',
            'آسانی سے منتقل کرنے کے لیے سادہ متن محفوظ کریں یا اگلے مرحلے کے لیے پیش کرنے کے قابل فارمیٹ منتخب کریں۔',
            'اب بھی فیصلہ نہیں کر پا رہے؟ یہ مختصر جوابات عام صورتوں کا احاطہ کرتے ہیں۔'
        ], locale);
        sequence('.docs-card-grid .docs-card h3', ['بنیادی ایڈیٹر', 'اردو کی بورڈ', 'رچ ٹیکسٹ ایڈیٹر', 'TXT', 'ورڈ، PDF اور تصویر', 'پرنٹ یا شیئر کریں'], locale);
        sequence('.docs-card-grid .docs-card p', [
            'مانوس انگریزی حروف سے رومن اردو لکھیں۔ لفظ مکمل کرنے کے لیے Space دبائیں اور تحریر کی تبدیلی کو اسے اردو میں بدلنے دیں۔',
            'جب آپ رسم الخط جانتے ہوں یا لکھنے کی جگہ کے ساتھ بصری کی بورڈ چاہتے ہوں تو اردو حروف براہِ راست منتخب کریں۔',
            'اردو متن برقرار رکھتے ہوئے عنوانات، فہرستوں، ترتیب، فونٹس اور برآمد کے اختیارات سے ایک مکمل دستاویز تیار کریں۔',
            'ہلکی UTF-8 فائل جو اردو حروف محفوظ رکھتی ہے اور تقریباً ہر جگہ کھل جاتی ہے۔',
            'جب لے آؤٹ اہم ہو تو رچ ایڈیٹر استعمال کریں، پھر دستاویز، PDF یا شیئر کرنے کے قابل تصویر برآمد کریں۔',
            'براہِ راست براؤزر سے پرنٹ کریں یا اپنے آلے کے مقامی شیئرنگ آپشن سے متن بھیجیں۔'
        ], locale);
        sequence('.docs-card-grid .docs-card > a', [
            'بنیادی ایڈیٹر کھولیں <span aria-hidden="true">←</span>',
            'کی بورڈ کھولیں <span aria-hidden="true">←</span>',
            'رچ ایڈیٹنگ کھولیں <span aria-hidden="true">←</span>'
        ], locale);
        sequence('.docs-step-list h3', ['لکھیں', 'تبدیل کریں', 'بہتر بنائیں', 'شیئر کریں'], locale);
        sequence('.docs-step-list p', [
            'رومن اردو، اردو حروف لکھیں یا متن ایڈیٹر میں پیسٹ کریں۔',
            'تحریر تبدیل کیے گئے الفاظ مکمل کرنے کے لیے Space دبائیں یا براہِ راست کی بورڈ استعمال کریں۔',
            'فاصلہ درست کریں، رموزِ اوقاف شامل کریں، متن تلاش کر کے تبدیل کریں یا رچ دستاویز فارمیٹ کریں۔',
            'تیار ہونے پر نتیجہ کاپی، ڈاؤن لوڈ، پرنٹ یا شیئر کریں۔'
        ], locale);
        sequence('.docs-feature strong', ['مقامی مسودے', 'حالیہ مسودے', 'متن درآمد کریں', 'رموزِ اوقاف', 'تلاش اور تبدیلی', 'فوکس موڈ', 'براہِ راست اعداد و شمار', 'مقامی شیئرنگ'], locale);
        sequence('.docs-feature span', [
            'اس براؤزر میں کام کا مسودہ محفوظ کریں اور ریفریش کے بعد اسے بحال کریں۔',
            'پانچ تک حالیہ نسخے محفوظ رکھیں تاکہ پچھلا ورژن کبھی دور نہ ہو۔',
            'سادہ UTF-8 فائل سرور پر بھیجے بغیر درآمد کریں۔',
            'ایک ٹیپ سے اردو کاما، فل اسٹاپ اور واوین شامل کریں۔',
            'بنیادی یا رچ مسودے میں دہرائے گئے لفظ یا جملے کو درست کریں۔',
            'پرسکون، پوری اسکرین کی لکھنے کی جگہ کے لیے غیر ضروری چیزیں چھپا دیں۔',
            'مسودہ بڑھتے ہوئے الفاظ، حروف اور پڑھنے کا وقت دیکھیں۔',
            'دستیاب ہونے پر آلے کی شیئر شیٹ استعمال کریں؛ بصورتِ دیگر کاپی کریں۔'
        ], locale);
        one('.docs-shortcuts caption', 'بنیادی ایڈیٹر کے کی بورڈ شارٹ کٹس', locale);
        sequence('.docs-shortcuts thead th', ['شارٹ کٹ', 'عمل'], locale);
        sequence('.docs-shortcuts tbody td:nth-child(2)', ['انگریزی اور اردو ان پٹ کے درمیان تبدیل کریں', 'موجودہ تبدیل کیے گئے لفظ کو مکمل کریں', 'فوکس موڈ چھوڑیں یا کھلا مینو بند کریں', 'براؤزر کے ذریعے منتخب متن کاپی کریں'], locale);
        one('.docs-privacy h2', 'رازداری بطور اصول', locale);
        one('.docs-privacy > p', 'آپ کی تحریر آپ کی رہنی چاہیے۔ ایڈیٹرز جہاں ممکن ہو مفید کام مقامی طور پر انجام دیتے ہیں۔', locale);
        sequence('.docs-privacy li', ['مقامی مسودے اور حالیہ تاریخچہ آپ کے براؤزر میں محفوظ ہوتے ہیں۔', 'ٹائپ، فارمیٹ یا برآمد کے لیے سائن اِن ضروری نہیں۔', 'رومن اردو کی تحریر تبدیل کرنے کے لیے گوگل سروس کو انٹرنیٹ درکار ہو سکتا ہے۔', 'جب چاہیں ایڈیٹر سے محفوظ مسودہ یا تاریخچہ صاف کریں۔'], locale);
        one('.docs-cta h2', 'لکھنے کے لیے تیار ہیں؟', locale);
        one('.docs-cta p', 'صاف ایڈیٹر کھولیں اور اپنے اگلے اردو جملے کو شکل لینے دیں۔', locale);
        one('.docs-cta .docs-button', 'اردو میں لکھنا شروع کریں <span aria-hidden="true">←</span>', locale);
        sequence('.docs-faq summary', ['سب سے پہلے کون سا ایڈیٹر استعمال کروں؟', 'لفظ میری توقع کے مطابق مختلف کیوں تبدیل ہوا؟', 'کیا میں Write Urdu فون پر استعمال کر سکتا ہوں؟', 'کیا یہ انٹرنیٹ کے بغیر کام کرتا ہے؟'], locale);
        sequence('.docs-faq p', [
            'اگر آپ رومن اردو میں سوچتے ہیں تو <a href="index.html">بنیادی ایڈیٹر</a> منتخب کریں۔ براہِ راست حروف کے لیے <a href="urdu-keyboard.html">اردو کی بورڈ</a>، اور فارمیٹنگ کے لیے <a href="urdu-editor.html">رچ ایڈیٹر</a> منتخب کریں۔',
            'تحریر کی تبدیلی سیاق و سباق اور تبدیلی کی سروس پر منحصر ہے۔ ہجے بدل کر آزمائیں، تجاویز دیکھیں، یا درست حروف کے لیے براہِ راست اردو کی بورڈ استعمال کریں۔',
            'جی ہاں۔ ایڈیٹرز، کنٹرولز اور نیویگیشن چھوٹی اسکرین کے مطابق ڈھل جاتے ہیں۔ فزیکل کی بورڈ اختیاری ہے؛ ٹچ ڈیوائس پر اردو کی بورڈ صفحہ مفید رہتا ہے۔',
            'براہِ راست اردو ان پٹ، رچ ایڈیٹنگ، مقامی مسودے اور برآمد براؤزر میں کام کرنے کے لیے بنائے گئے ہیں۔ گوگل سروس مقامی طور پر دستیاب نہ ہو تو رومن اردو کی تبدیلی کے لیے انٹرنیٹ درکار ہو سکتا ہے۔'
        ], locale);
        setAttribute('.docs-chips', 'aria-label', 'نمایاں خصوصیات', locale);
        setAttribute('.docs-hero-card', 'aria-label', 'اردو لکھنے کا پیش نظارہ', locale);
    }

    function localizeEditorHelp(locale) {
        setAttribute('.home-actions, .tool-actions, .keyboard-actions', 'aria-label', 'ایڈیٹر کے اعمال', locale);
        setAttribute('.editor-chrome', 'aria-label', 'تحریر تبدیلی کی حالت اور ایڈیٹر کنٹرولز', locale);
        setAttribute('.wu-header-ad', 'aria-label', 'اشتہار', locale);
        one('.spinner-grow .sr-only', 'تحریر تبدیل ہو رہی ہے...', locale);
        if (pathName() === '/index.html' || pathName() === '/') {
            one('#UsageAlert', '<i class="fas fa-info-circle" aria-hidden="true"></i> رومن اردو لکھیں اور ہر لفظ تبدیل کرنے کے لیے Space دبائیں۔ متبادل دیکھنے کے لیے Backspace دو بار دبائیں۔', locale);
            one('.card-subtitle', 'اردو میں لکھیں — انگریزی اور اردو کے درمیان تبدیل کرنے کے لیے Ctrl+G دبائیں', locale);
            one('h3.card-title', 'انگریزی حروف سے اردو کیسے لکھیں', locale);
            sequence('.card-text li', [
                'اوپر موجود ایڈیٹر میں رومن اردو کا لفظ لکھیں، مثلاً <em>mera</em>۔',
                'لفظ کو خودکار طور پر اردو رسم الخط میں تبدیل کرنے کے لیے Space دبائیں۔',
                'اگر نتیجہ مطلوبہ لفظ نہ ہو تو متبادل <a href="write-urdu-feedback.html" title="رائٹ اردو کے بارے میں رائے">تجاویز</a> کھولنے کے لیے Backspace دو بار دبائیں۔',
                'جب اردو کسی دوسری ایپ میں پیسٹ کرنی ہو تو <strong>متن کاپی کریں</strong> منتخب کریں۔',
                '“میرا خیال ہے” اردو رسم الخط میں لکھنے کے لیے <a href="urdu-alphabet.html" title="اردو حروف تہجی کا رہنما">اردو رسم الخط</a> منتخب کریں، <em>mera khayal hai</em> لکھیں اور ہر لفظ کے بعد Space دبائیں۔',
                'اسی طریقے سے نام اور مختصر پیغامات لکھ کر سوشل میڈیا پر شیئر کریں۔',
                'عنوان، رنگ، فہرست یا دوسری فارمیٹنگ کے لیے <a href="urdu-editor.html" title="رچ ٹیکسٹ ایڈیٹر میں اردو فارمیٹ کریں">اردو رچ ٹیکسٹ ایڈیٹر</a> کھولیں۔',
                'کسی اردو کی بورڈ سافٹ ویئر کی ضرورت نہیں؛ ایڈیٹر براہِ راست براؤزر میں چلتا ہے۔',
                'زبان اور رسم الخط کے مختصر جوابات کے لیے <a href="urdu-faq.html" title="اردو کے بارے میں اکثر پوچھے گئے سوالات">اردو سوالات</a> دیکھیں۔'
            ], locale);
            one('.card:nth-of-type(2) h4.card-title', 'رائٹ اردو کا ویڈیو رہنما', locale);
            one('.editor-chrome > span:first-child', '<i class="fas fa-language" aria-hidden="true"></i> رومن اردو ← اردو', locale);
            one('.editor-shortcut', 'Ctrl+G سے زبان تبدیل کریں', locale);
            one('.settings-panel > label', 'صفحے کا پس منظر', locale);
            one('.settings-panel > a', '<i class="fas fa-question-circle" aria-hidden="true"></i> رائٹ اردو استعمال کرنے کا طریقہ', locale);
            setAttribute('#demo-input', 'aria-label', 'صفحے کا پس منظر', locale);
            setAttribute('#transliterateTextarea', 'aria-label', 'اردو لکھنے کا ایڈیٹر', locale);
        }

        if (pathName() === '/urdu-editor.html') {
            sequence('.card-title', ['رچ ٹیکسٹ ایڈیٹر میں اردو لکھیں اور فارمیٹ کریں', 'آپ کیا بنا سکتے ہیں', 'اردو رچ ٹیکسٹ ایڈیٹر کا ویڈیو رہنما'], locale);
            sequence('.card-text li', [
                'رومن اردو کا لفظ لکھیں اور اسے اردو رسم الخط میں تبدیل کرنے کے لیے Space دبائیں۔',
                'نتیجہ غلط ہو تو Backspace دو بار دبائیں اور تجویز کردہ الفاظ میں سے منتخب کریں۔',
                'فونٹ، سائز، رنگ، ترتیب یا نمایاں انداز بدلنے کے لیے متن منتخب کریں۔',
                'فارمیٹ شدہ متن کاپی کرنے کے لیے ایڈیٹر کا Edit مینو یا اپنا کی بورڈ شارٹ کٹ استعمال کریں۔',
                'Word دستاویز، PDF یا PNG تصویر برآمد کرنے یا کام پرنٹ کرنے کے لیے <strong>برآمد کریں</strong> منتخب کریں۔',
                'Word دستاویز، خطوط اور رپورٹس کے لیے فارمیٹ شدہ اردو متن۔',
                'ویب سائٹس اور ویب ایپلی کیشنز کے لیے دائیں سے بائیں HTML مواد۔',
                'اردو مضامین یا بلاگ پوسٹس کے لیے عنوانات، اقتباسات اور بنیادی متن۔',
                'ای میل، پریزنٹیشن اور سوشل میڈیا کے لیے خوب صورت اردو پیغامات۔'
            ], locale);
            one('label[for="basic-example"]', 'اردو رچ ٹیکسٹ ایڈیٹر', locale);
            one('#exampleModalLabel', 'دستیاب فونٹس کے ساتھ نمونہ اردو متن', locale);
        }

        if (pathName() === '/urdu-keyboard.html') {
            sequence('.card-title', ['اردو کی بورڈ استعمال کرنے کا طریقہ'], locale);
            sequence('.card-text li', [
                'کرسر کی جگہ شامل کرنے کے لیے اردو حرف، عدد یا رموزِ اوقاف منتخب کریں۔',
                'آپ فزیکل کی بورڈ سے بھی براہِ راست لکھ سکتے ہیں۔ Space دبانے کے بعد رومن اردو کے الفاظ تبدیل ہو جاتے ہیں۔',
                'پچھلا حرف مٹانے کے لیے آن اسکرین کی بورڈ پر <strong>Backspace</strong> استعمال کریں۔',
                'مکمل اردو متن کلپ بورڈ پر رکھنے کے لیے <strong>متن کاپی کریں</strong> منتخب کریں۔',
                'فائل کا نام منتخب کر کے سادہ متنی فائل ڈاؤن لوڈ کرنے کے لیے <strong>محفوظ کریں</strong> کھولیں۔',
                'ایڈیٹر خالی کر کے دوبارہ شروع کرنے کے لیے <strong>صاف کریں</strong> منتخب کریں۔',
                'اردو اور اس کے رسم الخط کے بارے میں مزید جاننے کے لیے <a href="urdu-faq.html" title="اردو کے بارے میں اکثر پوچھے گئے سوالات">اردو سوالات</a> پڑھیں۔'
            ], locale);
            setAttribute('#write', 'aria-label', 'اردو کی بورڈ ایڈیٹر', locale);
            setAttribute('.spacebar[value="Backspace"]', 'value', 'بیک اسپیس', locale);
            setAttribute('.spacebar[value=" spacebar"]', 'value', 'اسپیس بار', locale);
        }
    }

    function localizeDynamicEditorTools(locale) {
        var panel = document.querySelector('.editor-productivity');
        if (!panel) return;
        setAttribute('.editor-productivity', 'aria-label', 'لکھنے کے ٹولز اور مقامی مسودے کی حالت', locale);
        setAttribute('.editor-quick-tools', 'aria-label', 'اردو رموزِ اوقاف اور صفائی کے ٹولز', locale);
        one('.editor-quick-label', 'شامل کریں', locale);
        one('.editor-productivity [data-save-status]', 'مسودے اسی آلے پر محفوظ رہتے ہیں', locale);
        var historyHeading = document.querySelector('.editor-history-heading strong');
        if (historyHeading) setTextPreservingChildren(historyHeading, 'حالیہ مسودے', locale);
        one('.editor-history-empty', 'ابھی کوئی محفوظ مسودہ نہیں۔', locale);
        var labels = document.querySelectorAll('.editor-find-panel label');
        if (labels[0]) setTextPreservingChildren(labels[0], 'تلاش', locale);
        if (labels[1]) setTextPreservingChildren(labels[1], 'اس سے تبدیل کریں', locale);
        var onboardingKind = document.querySelector('[data-editor-onboarding]');
        if (onboardingKind) {
            var kind = onboardingKind.getAttribute('data-editor-onboarding');
            one('[data-onboarding-title]', kind === 'keyboard' ? 'براہِ راست اردو لکھیں' : kind === 'rich' ? 'اپنی اردو دستاویز لکھیں اور فارمیٹ کریں' : 'تین آسان مرحلوں میں اردو لکھیں', locale);
            one('[data-onboarding-body]', kind === 'keyboard' ? 'آن اسکرین کی بورڈ سے حرف منتخب کریں یا اپنے فزیکل کی بورڈ سے براہِ راست لکھیں۔ آپ کا کام اسی براؤزر میں رہتا ہے۔' : kind === 'rich' ? 'رومن اردو لکھیں اور الفاظ تبدیل کرنے کے لیے Space دبائیں، پھر عنوانات، فہرست، فونٹ اور ترتیب کے لیے ایڈیٹر استعمال کریں۔' : 'رومن اردو لکھیں—مثلاً mera—اور لفظ کو اردو رسم الخط میں تبدیل کرنے کے لیے Space دبائیں۔', locale);
            one('[data-onboarding-tip]', kind === 'keyboard' ? 'مشورہ: اردو متن دوسری جگہ پیسٹ کرنے کے لیے متن کاپی کریں۔' : 'مشورہ: ٹولز اور مقامی مسودہ تیزی سے استعمال کرنے کے لیے شارٹ کٹس کھولیں۔', locale);
        }
        setAttribute('[data-onboarding-dismiss]', 'aria-label', 'رہنے دیں', locale);
        one('.editor-command-heading h2', 'شارٹ کٹس اور ٹولز', locale);
        one('.editor-command-note', 'آپ کے مسودے صرف اسی آلے پر محفوظ ہوتے ہیں۔', locale);
        setAttribute('[data-command-search]', 'placeholder', 'کمانڈز تلاش کریں', locale);
        sequence('.editor-command-list strong', ['مسودہ محفوظ کریں', 'تلاش اور تبدیلی', 'حالیہ مسودے', 'متن درآمد کریں', 'فوکس موڈ'], locale);
    }

    function localizeGuides(locale) {
        var route = pathName();
        if (route === '/write-urdu-features.html') {
            sequence('.content-article h2', ['۱۔ سادہ متنی فائل محفوظ کریں', '۲۔ متن کلپ بورڈ پر کاپی کریں', '۳۔ اردو متن پرنٹ کریں', '۴۔ Word دستاویز برآمد کریں', '۵۔ PDF برآمد کریں', '۶۔ PNG تصویر برآمد کریں', '۷۔ WhatsApp پر شیئر کریں', '۸۔ اردو رچ ٹیکسٹ ایڈیٹر استعمال کریں', '۹۔ مقامی مسودے بحال کریں', '۱۰۔ متنی فائل درآمد کریں'], locale);
            sequence('.content-article p:not(.page-intro)', [
                'متنی فائل ہلکی ہوتی ہے اور Notepad، TextEdit یا کسی دوسرے سادہ متن ایڈیٹر میں آسانی سے کھل جاتی ہے۔ ایک کاپی محفوظ کرنے سے صفحہ بند یا ریفریش ہونے کی صورت میں کام محفوظ رہتا ہے۔',
                'جب اردو کو فائل ڈاؤن لوڈ کیے بغیر ای میل، دستاویز، پیغام یا سوشل میڈیا پوسٹ میں پیسٹ کرنا ہو تو کلپ بورڈ استعمال کریں۔',
                'پرنٹ کا اختیار براؤزر کا پرنٹ ڈائیلاگ کھولتا ہے جہاں پرنٹر، صفحے کا سائز اور دیگر دستیاب اختیارات منتخب کیے جا سکتے ہیں۔',
                'جب آپ کو ایسی قابلِ تدوین فائل چاہیے جو Microsoft Word یا کسی ہم آہنگ ورڈ پروسیسر میں کھل سکے تو Word فارمیٹ منتخب کریں۔',
                'PDF پڑھنے، پرنٹ کرنے یا شیئر کرنے کے لیے دستاویز کی ظاہری شکل محفوظ رکھتا ہے۔ وصول کنندہ کو وہی ایڈیٹر ترتیب درکار نہیں ہوتی۔',
                'پریزنٹیشن، بصری پوسٹس اور ان ایپس کے لیے تصویر مفید ہے جو اردو متن کو مستقل طور پر درست نہیں دکھاتیں۔',
                'Share بٹن اردو متن کو WhatsApp کے لیے تیار کرتا ہے۔ آلے کے لحاظ سے WhatsApp ایپ یا براؤزر میں کھل سکتا ہے۔',
                'جب عنوانات، فہرستوں، رنگ، ترتیب، متعدد فونٹس یا دیگر دستاویزی فارمیٹنگ کی ضرورت ہو تو <a href="urdu-editor.html" title="اردو رچ ٹیکسٹ ایڈیٹر کھولیں">اردو رچ ٹیکسٹ ایڈیٹر</a> کھولیں۔',
                'ایڈیٹر حالیہ مسودے صرف اسی براؤزر میں محفوظ کرتے ہیں۔ اکاؤنٹ یا سرور اپ لوڈ کی ضرورت نہیں، اور متن اسی آلے پر رہتا ہے جب تک آپ اسے صاف نہ کریں۔',
                '<strong>متن درآمد کریں</strong> سے UTF-8 سادہ متنی فائل ایڈیٹر میں لائیں۔ درآمد شدہ مواد مقامی طور پر پراسیس ہوتا ہے اور معمول کے مطابق تبدیل، فارمیٹ، کاپی یا برآمد کیا جا سکتا ہے۔'
            ], locale);
            sequence('.content-article ol li', [
                'ایڈیٹر میں اردو ٹائپ کرنا مکمل کریں۔', 'برآمد کھولیں اور فائل کا نام درج کریں۔', '<strong>متنی فائل</strong> منتخب کر کے <code>.txt</code> کاپی ڈاؤن لوڈ کریں۔',
                'ایڈیٹر کے اوپر <strong>متن کاپی کریں</strong> منتخب کریں۔', 'Ctrl+V، Command+V یا آلے کے Paste کمانڈ سے متن دوسری ایپ میں پیسٹ کریں۔',
                'برآمد کھولیں اور <strong>پرنٹ</strong> منتخب کریں۔', 'پیش نظارہ دیکھیں، پرنٹ کی ترتیبات منتخب کریں اور تصدیق کریں۔',
                'برآمد کھولیں۔', '<strong>Word دستاویز</strong> منتخب کر کے فائل ڈاؤن لوڈ کریں۔', 'برآمد کھولیں۔', '<strong>PDF دستاویز</strong> منتخب کریں اور ڈاؤن لوڈ مکمل ہونے کا انتظار کریں۔',
                'برآمد کھولیں اور <strong>PNG تصویر</strong> منتخب کریں۔', 'اپنے آلے کے معمول کے کنٹرول سے ڈاؤن لوڈ شدہ PNG محفوظ یا شیئر کریں۔',
                'ایڈیٹر کے اوپر <strong>شیئر کریں</strong> منتخب کریں۔', 'WhatsApp میں گفتگو منتخب کریں اور بھیجنے سے پہلے متن دیکھ لیں۔',
                'کسی بھی Write Urdu ایڈیٹر میں متن لکھیں یا پیسٹ کریں۔', 'ایڈیٹر کے نیچے <strong>حالیہ مسودے</strong> کھولیں۔', 'پچھلا مسودہ بحال کرنے کے لیے اسے منتخب کریں، یا مقامی کاپیاں ہٹانے کے لیے <strong>تاریخچہ صاف کریں</strong> منتخب کریں۔'
            ], locale);
            one('.card-title', 'رائٹ اردو کی خصوصیات کا ویڈیو رہنما', locale);
        }

        if (route === '/urdu-editor-features.html') {
            sequence('.content-article h2', ['۱۔ متن کا رنگ تبدیل کریں', '۲۔ متن کو نمایاں کریں', '۳۔ بولڈ، اٹالک، انڈر لائن یا خط کشیدہ لگائیں', '۴۔ تبدیلیاں واپس یا دوبارہ کریں', '۵۔ اردو فونٹ منتخب کریں', '۶۔ فونٹ کا سائز تبدیل کریں'], locale);
            sequence('.content-article p:not(.page-intro)', [
                'رنگ عنوانات، اقتباسات یا اہم اصطلاحات کو الگ دکھا سکتا ہے۔ دستاویز پڑھنے میں آسان رکھنے کے لیے اسے مناسب مقدار میں استعمال کریں۔',
                'ہائی لائٹ منتخب متن کے پیچھے رنگ شامل کرتی ہے اور اہم جملے یا یاد دہانی کی طرف توجہ دلاتی ہے۔',
                'متن منتخب کریں، پھر متعلقہ ٹول بار بٹن منتخب کریں۔ بولڈ زور دیتا ہے، اٹالک ثانوی زور دیتا ہے، انڈر لائن توجہ دلاتی ہے، اور خط کشیدہ متن کو حذف شدہ دکھاتا ہے مگر اسے نظر آنے دیتا ہے۔',
                '<strong>واپس کریں</strong> آپ کی تازہ ترین ترمیم ختم کرتا ہے۔ <strong>دوبارہ کریں</strong> ابھی واپس کی گئی ترمیم بحال کرتا ہے۔ معاون کی بورڈ پر Ctrl+Z اور Ctrl+Y بھی استعمال کیے جا سکتے ہیں۔',
                'مختلف مقاصد کے لیے مختلف فونٹ مناسب ہوتے ہیں۔ نستعلیق روایتی رواں انداز دیتا ہے، جبکہ نسخ چھوٹے سائز اور انٹرفیس متن میں زیادہ واضح ہو سکتا ہے۔',
                'عنوانات کے لیے بڑا اور معاون متن کے لیے چھوٹا سائز استعمال کریں، مگر ہر سطر کو پڑھنے کے لیے آرام دہ رکھیں۔'
            ], locale);
            sequence('.content-article ol li', [
                'اردو متن لکھیں اور تبدیل کرنے والے الفاظ منتخب کریں۔', 'ٹول بار میں <strong>متن کا رنگ</strong> کنٹرول کھولیں۔', 'پیلیٹ سے رنگ منتخب کریں۔',
                'جس متن کو نمایاں کرنا ہے اسے منتخب کریں۔', '<strong>پس منظر کا رنگ</strong> یا ہائی لائٹ کنٹرول کھولیں۔', 'رنگ منتخب کریں؛ ہائی لائٹ ہٹانے کے لیے ری سیٹ اختیار منتخب کریں۔',
                'جس متن کا انداز بدلنا ہے اسے منتخب کریں۔', 'فونٹ فیملی مینو کھولیں اور دستیاب فونٹ منتخب کریں۔', 'برآمد سے پہلے مطلوبہ پڑھنے کے سائز پر نتیجہ دیکھیں۔',
                'متن منتخب کریں۔', 'فونٹ فیملی کنٹرول کے ساتھ موجود فونٹ سائز مینو کھولیں۔', 'سائز منتخب کریں اور تازہ متن کے اردگرد فاصلہ دیکھیں۔'
            ], locale);
            one('.content-article h3', 'دستیاب اردو دوست فونٹس میں شامل ہیں', locale);
            attributeSequence('.content-article img', 'alt', ['متن کے رنگ کی پیلیٹ', 'منتخب رنگ میں اردو متن', 'اردو ایڈیٹر کی پس منظر رنگ پیلیٹ', 'نمایاں کیا گیا اردو متن', 'بولڈ فارمیٹنگ کنٹرول', 'اٹالک فارمیٹنگ کنٹرول', 'خط کشیدہ فارمیٹنگ کنٹرول', 'اردو ایڈیٹر کا فونٹ فیملی مینو', 'اردو ایڈیٹر کا فونٹ سائز مینو'], locale);
            one('.card-title', 'رائٹ اردو کی خصوصیات کا ویڈیو رہنما', locale);
        }

        if (route === '/english-urdu-typing-tutorial.html') {
            sequence('.card-title', ['بنیادی رائٹ اردو ایڈیٹر استعمال کرنا', 'اردو رچ ٹیکسٹ ایڈیٹر میں متن فارمیٹ کرنا'], locale);
        }
    }

    function localizeReferencePages(locale) {
        var route = pathName();
        if (route === '/urdu-alphabet.html') {
            one('.alphabet-content h2', 'اردو حروف تہجی کا تعارف', locale);
            sequence('.alphabet-content p.lead', [
                '<a href="/" title="اردو تحریر تبدیلی ایڈیٹر کھولیں">اردو لکھی جاتی ہے</a> فارسی عربی رسم الخط میں، جس میں فارسی اور جنوبی ایشیائی زبانوں کی آوازوں کے لیے اضافی حروف بنائے گئے ہیں۔ اردو عموماً نستعلیق کے رواں خط میں لکھی جاتی ہے۔',
                'اردو دائیں سے بائیں لکھی جاتی ہے۔ زیادہ تر حروف لفظ میں اپنی جگہ کے مطابق شکل بدلتے ہیں، جبکہ کچھ حروف اگلے حرف سے نہیں جڑتے۔ مختصر حرکات اکثر سیاق و سباق سے سمجھی جاتی ہیں۔',
                'حروف تہجی کی تعداد مختلف ہو سکتی ہے کیونکہ بعض حوالوں میں مرکب آوازیں، ہمزہ اور مختلف جگہوں کی شکلیں الگ شمار کی جاتی ہیں۔ نیچے کا جدول اردو میں استعمال ہونے والے عام الگ حروف دکھاتا ہے۔'
            ], locale);
            one('.alphabet-table caption', 'عام الگ اردو حروف اور ان کے نام', locale);
            sequence('.alphabet-table th', ['اردو حرف', 'عام نام'], locale);
        }
        if (route === '/urdu-faq.html') {
            sequence('h4', ['اردو کہاں بولی جاتی ہے؟', 'اگر میں اردو سیکھوں تو کیا دوسری زبانوں میں مدد ملے گی؟', 'کیا ہندی اور اردو ایک ہی زبان کی دو مختلف شکلیں ہیں؟'], locale);
            sequence('p.steps', [
                '<a href="why-write-urdu.html" title="آن لائن اردو کیوں لکھیں">اردو</a> پاکستان کی قومی زبان ہے اور پاکستان و بھارت میں وسیع پیمانے پر بولی جاتی ہے۔ اردو بولنے والی برادریاں جنوبی ایشیا اور دنیا بھر میں بھی موجود ہیں۔',
                'روزمرہ بولی جانے والی اردو اور ہندی کی گرامر اور بنیادی ذخیرۂ الفاظ میں کافی مماثلت ہے، اس لیے ایک زبان سیکھنے سے دوسری میں گفتگو آسان ہو سکتی ہے۔ اردو عموماً نستعلیق فارسی عربی رسم الخط استعمال کرتی ہے جبکہ ہندی دیوناگری استعمال کرتی ہے۔ <a href="urdu-alphabet.html" title="اردو حروف تہجی کا رہنما">اردو حروف تہجی</a> سیکھنے سے فارسی اور عربی کی بعض شکلیں بھی مانوس ہو سکتی ہیں، اگرچہ ہر زبان کے ہجے اور تلفظ الگ ہیں۔',
                'معیاری اردو اور معیاری ہندی ہندوستانی زبان کے قریبی رجسٹر ہیں۔ گفتگو میں اکثر ایک دوسرے کو سمجھا جا سکتا ہے، مگر رسمی ذخیرۂ الفاظ مختلف ہے: اردو فارسی اور عربی سے زیادہ الفاظ لیتی ہے جبکہ ہندی سنسکرت سے زیادہ۔',
                'ان کے رسم الخط الگ ہیں۔ ہندی دیوناگری میں بائیں سے دائیں لکھی جاتی ہے؛ <a href="urdu-editor.html" title="اردو رچ ٹیکسٹ ایڈیٹر کھولیں">اردو</a> دائیں سے بائیں فارسی عربی رسم الخط میں لکھی جاتی ہے، جو عموماً نستعلیق انداز میں دکھائی جاتی ہے۔'
            ], locale);
            setAttribute('input[type="submit"]', 'value', 'تلاش', locale);
        }
        if (route === '/why-write-urdu.html') {
            one('h2', 'آن لائن اردو کو آسان بنانا', locale);
            one('.page-intro', '<a class="active" href="/" title="رائٹ اردو ایڈیٹر کھولیں">رائٹ اردو</a> لوگوں کو خصوصی ڈیسک ٹاپ سافٹ ویئر انسٹال کیے بغیر قابلِ مطالعہ اردو بنانے میں مدد دیتا ہے۔', locale);
            sequence('ul.steps li', ['اردو لکھنے کو بولنے والوں، سیکھنے والوں اور بیرونِ ملک برادریوں کے لیے زیادہ قابلِ رسائی بنانا۔', 'مانوس رومن اردو ٹائپنگ کو دائیں سے بائیں اردو رسم الخط میں تبدیل کرنا۔', 'پیغامات، ای میل، دستاویزات اور سوشل میڈیا میں روزمرہ گفتگو کی مدد کرنا۔', 'فارمیٹ شدہ کام کے لیے سادہ ایڈیٹر اور <a href="urdu-editor.html">رچ ٹیکسٹ ایڈیٹر</a> دونوں فراہم کرنا۔', 'براہِ راست حروف درج کرنے کے لیے <a href="urdu-keyboard.html">آن اسکرین اردو کی بورڈ</a> دینا۔'], locale);
            one('h2:nth-of-type(2)', 'ہمیں بہتر بنانے میں مدد کریں', locale);
            one('p.steps', 'واضح رائے درستگی، رسائی اور استعمال میں آسانی بہتر بنانے میں ہماری مدد کرتی ہے۔ مسئلہ یا عملی تجویز ہو تو براہِ کرم <a href="write-urdu-feedback.html" title="رائٹ اردو کے بارے میں رائے بھیجیں">رائے کا صفحہ</a> دیکھیں۔', locale);
        }
        if (route === '/write-urdu-feedback.html') {
            one('.card-title', 'ہم آپ کی رائے سننا چاہتے ہیں', locale);
            one('.card-text', 'غلط تحریر تبدیلی، رسائی کے مسائل یا ایسی تجاویز کے بارے میں بتائیں جو ایڈیٹرز کو زیادہ مفید بنائیں۔ <a href="mailto:admin@write-urdu.com">admin@write-urdu.com</a> پر ای میل بھیجیں اور مسئلے کے وقت استعمال کیے گئے صفحے، آلے اور براؤزر کا نام شامل کریں۔', locale);
        }
        if (route === '/write-urdu-search.html') {
            one('p.steps', 'رومن اردو تحریر تبدیلی، <a href="urdu-keyboard.html" title="آن لائن اردو کی بورڈ کھولیں">آن لائن اردو کی بورڈ</a>، دستاویز برآمد کرنے یا اردو متن فارمیٹ کرنے کے بارے میں رہنمائی تلاش کریں۔', locale);
            setAttribute('input[type="submit"]', 'value', 'تلاش', locale);
            one('.cse-branding-text', 'رائٹ اردو تلاش', locale);
        }
        if (route === '/write-urdu-sitemap.html') {
            sequence('.lpage a', ['رائٹ اردو', 'اردو رچ ٹیکسٹ ایڈیٹر', 'اردو کی بورڈ', 'اردو حروف تہجی', 'رائٹ اردو خصوصیات', 'دستاویزات', 'رائے اور تجاویز', 'استعمال کی شرائط اور رازداری کی پالیسی', 'سائٹ میپ', 'اردو سوالات'], locale);
            setAttribute('input[type="submit"]', 'value', 'تلاش', locale);
            one('.cse-branding-text', 'رائٹ اردو تلاش', locale);
        }
        if (route === '/write-urdu-privacy.html') {
            sequence('.legal-copy h3', ['۱۔ شرائط', '۲۔ استعمال کا لائسنس', '۳۔ دستبرداری', '۴۔ حدود', '۵۔ مواد کی درستگی', '۶۔ روابط', '۷۔ ترامیم', '۸۔ قابلِ اطلاق قانون'], locale);
            sequence('.legal-copy > ol > li', [
                'رائٹ اردو کی ویب سائٹ پر موجود مواد (معلومات یا سافٹ ویئر) کی ایک کاپی صرف ذاتی، غیر تجارتی اور عارضی مطالعے کے لیے عارضی طور پر ڈاؤن لوڈ کرنے کی اجازت ہے۔ یہ لائسنس ہے، ملکیت کی منتقلی نہیں، اور اس کے تحت آپ یہ کام نہیں کر سکتے:<ol type="i"><li>مواد میں ترمیم یا اسے کاپی کرنا؛</li><li>مواد کو کسی تجارتی مقصد یا عوامی نمائش کے لیے استعمال کرنا؛</li><li>رائٹ اردو کی ویب سائٹ میں موجود سافٹ ویئر کو ڈی کمپائل یا ریورس انجینئر کرنے کی کوشش کرنا؛</li><li>کاپی رائٹ یا ملکیتی نوٹس ہٹانا؛</li><li>مواد کسی دوسرے شخص کو منتقل کرنا یا اسے کسی دوسرے سرور پر نقل کرنا۔</li></ol>',
                'اگر آپ ان پابندیوں میں سے کسی کی خلاف ورزی کرتے ہیں تو یہ لائسنس خود بخود ختم ہو جائے گا اور رائٹ اردو اسے کسی بھی وقت ختم کر سکتا ہے۔ مواد دیکھنا یا لائسنس ختم ہونے پر آپ کے پاس موجود تمام ڈاؤن لوڈ شدہ مواد، خواہ برقی ہو یا طباعتی، تلف کرنا ہوگا۔',
                'رائٹ اردو کی ویب سائٹ کا مواد “جیسا ہے” کی بنیاد پر فراہم کیا جاتا ہے۔ رائٹ اردو کسی واضح یا مضمر ضمانت کا ذمہ دار نہیں، جن میں قابلِ فروخت ہونے، کسی خاص مقصد کے لیے موزونیت یا فکری ملکیت کی خلاف ورزی سے پاک ہونے کی ضمانتیں بھی شامل ہیں۔',
                'رائٹ اردو اس ویب سائٹ یا اس سے منسلک سائٹس کے مواد کی درستگی، ممکنہ نتائج یا قابلِ اعتماد ہونے کی کوئی ضمانت یا نمائندگی نہیں کرتا۔'
            ], locale);
            sequence('.legal-copy p:not(.page-intro)', [
                'ویب سائٹ <a href="https://www.write-Urdu.com/">https://www.write-Urdu.com/</a> تک رسائی حاصل کر کے آپ ان استعمال کی شرائط اور تمام قابلِ اطلاق قوانین و ضوابط کے پابند ہونے پر رضامند ہوتے ہیں۔ مقامی قوانین کی پابندی آپ کی ذمہ داری ہے۔ اگر آپ ان شرائط سے متفق نہیں تو اس سائٹ کو استعمال یا اس تک رسائی ممنوع ہے۔ ویب سائٹ میں موجود مواد متعلقہ کاپی رائٹ اور ٹریڈ مارک قوانین کے تحت محفوظ ہے۔',
                'کسی بھی صورت میں <a href="urdu-editor.html" title="اردو رچ ٹیکسٹ ایڈیٹر">رائٹ اردو</a> یا اس کے فراہم کنندگان ڈیٹا یا منافع کے نقصان، کاروباری تعطل یا ویب سائٹ کے مواد کو استعمال نہ کر پانے سے پیدا ہونے والے کسی نقصان کے ذمہ دار نہیں ہوں گے، چاہے <a href="why-write-urdu.html" title="رائٹ اردو کیوں؟">رائٹ اردو</a> یا اس کے مجاز نمائندے کو ایسے نقصان کے امکان سے زبانی یا تحریری طور پر آگاہ کیا گیا ہو۔',
                'رائٹ اردو کی ویب سائٹ پر موجود مواد میں تکنیکی، طباعتی یا تصویری غلطیاں ہو سکتی ہیں۔ رائٹ اردو اس بات کی ضمانت نہیں دیتا کہ تمام مواد درست، مکمل یا تازہ ہے۔ رائٹ اردو بغیر اطلاع مواد تبدیل کر سکتا ہے اور اسے اپ ڈیٹ کرنے کا پابند نہیں۔',
                'رائٹ اردو نے اپنی ویب سائٹ سے منسلک تمام سائٹس کا جائزہ نہیں لیا اور ان کے مواد کا ذمہ دار نہیں ہے۔ کسی لنک کی شمولیت رائٹ اردو کی جانب سے اس سائٹ کی توثیق نہیں ہے۔ ایسی ویب سائٹ استعمال کرنا صارف کی اپنی ذمہ داری ہے۔',
                'رائٹ اردو بغیر اطلاع ان استعمال کی شرائط میں ترمیم کر سکتا ہے۔ ویب سائٹ استعمال جاری رکھنے سے آپ شرائط کے موجودہ ورژن سے اتفاق کرتے ہیں۔',
                'یہ شرائط و ضوابط پاکستان کے قوانین کے مطابق نافذ اور سمجھے جائیں گے، اور آپ پاکستان کی عدالتوں کے دائرۂ اختیار کو تسلیم کرتے ہیں۔',
                'آپ کی رازداری ہمارے لیے اہم ہے۔',
                'ویب سائٹ چلاتے وقت جمع کی جانے والی معلومات کے بارے میں رائٹ اردو کی پالیسی آپ کی رازداری کا احترام کرنا ہے۔ یہ پالیسی بتاتی ہے کہ ذاتی معلومات کیسے جمع، استعمال، رابطہ، ظاہر اور سنبھالی جاتی ہیں۔',
                'رائٹ اردو تحریر تبدیلی، تجزیات، اشتہارات اور شامل کردہ میڈیا کے لیے تیسرے فریق کی سروسز استعمال کرتا ہے۔ یہ فراہم کنندگان اپنی پالیسیوں کے مطابق تکنیکی معلومات پراسیس یا کوکیز استعمال کر سکتے ہیں۔ ای میل سے بھیجی گئی معلومات آپ کے پیغام کا جواب دینے اور سروس بہتر بنانے کے لیے استعمال ہوتی ہیں۔',
                'ہم ذاتی معلومات کی رازداری کے تحفظ کے لیے یہ اصول اختیار کرتے ہیں۔ رائٹ اردو وقتاً فوقتاً اس رازداری کی پالیسی کو اپ ڈیٹ کر سکتا ہے۔'
            ], locale);
            sequence('.legal-copy > ul > li', [
                'ہم ذاتی معلومات قانونی اور منصفانہ طریقے سے جمع کریں گے اور جہاں مناسب ہو متعلقہ فرد کے علم یا رضامندی سے جمع کریں گے۔',
                'معلومات جمع کرنے کے وقت یا اس سے پہلے ہم ان مقاصد کی نشاندہی کریں گے جن کے لیے معلومات جمع کی جا رہی ہیں۔',
                'ہم ذاتی معلومات صرف اپنے بیان کردہ مقاصد اور متعلقہ ضمنی مقاصد کے لیے جمع و استعمال کریں گے، الا یہ کہ فرد کی رضامندی حاصل ہو یا قانون ایسا تقاضا کرے۔',
                'ذاتی ڈیٹا اپنے استعمال کے مقاصد سے متعلق ہونا چاہیے اور ضرورت کے مطابق درست، مکمل اور تازہ ہونا چاہیے۔',
                'ہم ذاتی معلومات کو نقصان، چوری، غیر مجاز رسائی، افشا، نقل، استعمال یا ترمیم سے بچانے کے لیے مناسب حفاظتی اقدامات کریں گے۔',
                'ہم زائرین کو ذاتی معلومات کے انتظام سے متعلق اپنی پالیسیوں اور طریقۂ کار کے بارے میں معلومات فراہم کریں گے۔',
                'ہم ذاتی معلومات صرف اتنی مدت تک محفوظ رکھیں گے جتنی ان مقاصد کی تکمیل کے لیے ضروری ہو۔'
            ], locale);
            one('.legal-copy h2', 'رازداری کی پالیسی', locale);
        }
    }

    function apply(locale) {
        localizeDocumentation(locale);
        localizeEditorHelp(locale);
        localizeGuides(locale);
        localizeReferencePages(locale);
        localizeDynamicEditorTools(locale);
    }

    window.WriteUrduContentLocale = { apply: apply };
    document.addEventListener('write-urdu:locale-change', function (event) { apply(event.detail && event.detail.locale || 'en'); });
    if (window.MutationObserver && document.body) {
        new MutationObserver(function (mutations) {
            var panelAdded = mutations.some(function (mutation) {
                return Array.prototype.some.call(mutation.addedNodes, function (node) {
                    return node.nodeType === 1 && node.classList && node.classList.contains('editor-productivity');
                });
            });
            if (panelAdded) {
                window.setTimeout(function () {
                    var locale = window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function' ? window.WriteUrduLocale.get() : 'en';
                    apply(locale);
                }, 0);
            }
        }).observe(document.body, { childList: true, subtree: true });
    }
    window.setTimeout(function () {
        var locale = window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function' ? window.WriteUrduLocale.get() : 'en';
        apply(locale);
    }, 0);
}());
