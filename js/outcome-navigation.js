(function (root, document) {
    'use strict';

    if (!root || !document) return;

    var GROUPS = [
        {
            id: 'write', icon: 'write',
            label: { en: 'Write', ur: 'لکھیں' },
            items: [
                { href: '/', icon: 'write', label: { en: 'Start writing in Urdu', ur: 'اردو لکھنا شروع کریں' }, tool: { en: 'Roman Urdu writer', ur: 'رومن اردو رائٹر' } },
                { href: '/urdu-keyboard', icon: 'keyboard', label: { en: 'Type directly in Urdu', ur: 'اردو براہِ راست ٹائپ کریں' }, tool: { en: 'Urdu Keyboard', ur: 'اردو کی بورڈ' } },
                { href: '/urdu-editor', icon: 'document', label: { en: 'Format an assignment or document', ur: 'اسائنمنٹ یا دستاویز فارمیٹ کریں' }, tool: { en: 'Rich Text Editor', ur: 'رچ ٹیکسٹ ایڈیٹر' } },
                { href: '/tools/urdu-voice-typing', icon: 'voice', label: { en: 'Speak and turn it into Urdu text', ur: 'بول کر اردو متن بنائیں' }, tool: { en: 'Urdu Voice Typing', ur: 'اردو وائس ٹائپنگ' } },
                { href: '/urdu-ocr', icon: 'image', label: { en: 'Extract Urdu text from an image', ur: 'تصویر سے اردو متن نکالیں' }, tool: { en: 'Urdu OCR', ur: 'اردو OCR' } },
                { href: '/urdu-text-cleaner', icon: 'fix', label: { en: 'Fix spacing, RTL and Unicode issues', ur: 'فاصلہ، RTL اور یونیکوڈ مسائل درست کریں' }, tool: { en: 'Text Cleaner', ur: 'ٹیکسٹ کلینر' } },
                { href: '/tools/inpage-unicode-converter', icon: 'convert', label: { en: 'Convert legacy InPage text', ur: 'پرانا InPage متن تبدیل کریں' }, tool: { en: 'InPage ↔ Unicode', ur: 'InPage ↔ Unicode' } }
            ]
        },
        {
            id: 'create', icon: 'create',
            label: { en: 'Create', ur: 'بنائیں' },
            items: [
                { href: '/urdu-card-studio', icon: 'card', label: { en: 'Make a poetry, quote or announcement image', ur: 'شاعری، اقتباس یا اعلان کی تصویر بنائیں' }, tool: { en: 'Card Studio', ur: 'کارڈ اسٹوڈیو' }, excludeRole: 'facebook' },
                { href: '/urdu-whatsapp-status-maker', icon: 'phone', label: { en: 'Create a WhatsApp Status', ur: 'واٹس ایپ اسٹیٹس بنائیں' }, tool: { en: 'WhatsApp Status Maker', ur: 'واٹس ایپ اسٹیٹس میکر' } },
                { href: '/urdu-instagram-post-maker', icon: 'image', label: { en: 'Create an Instagram post', ur: 'انسٹاگرام پوسٹ بنائیں' }, tool: { en: 'Instagram Post Maker', ur: 'انسٹاگرام پوسٹ میکر' } },
                { href: '/urdu-card-studio?role=facebook', icon: 'image', label: { en: 'Create a Facebook post', ur: 'فیس بک پوسٹ بنائیں' }, tool: { en: 'Card Studio · Facebook', ur: 'کارڈ اسٹوڈیو · فیس بک' }, role: 'facebook' },
                { href: '/urdu-name-art-maker', icon: 'name', label: { en: 'Make Urdu Name Art or a profile image', ur: 'اردو نام آرٹ یا پروفائل تصویر بنائیں' }, tool: { en: 'Urdu Name Art', ur: 'اردو نام آرٹ' } },
                { href: '/stylish-urdu-text-generator', icon: 'sparkle', label: { en: 'Create stylish copyable Urdu text', ur: 'خوب صورت کاپی ہونے والا اردو متن بنائیں' }, tool: { en: 'Stylish Urdu Text', ur: 'خوب صورت اردو متن' } },
                { href: '/urdu-templates', icon: 'grid', label: { en: 'Start from a ready-made design', ur: 'تیار ڈیزائن سے شروع کریں' }, tool: { en: 'Urdu Templates', ur: 'اردو ٹیمپلیٹس' } },
                { href: '/qr-code-generator', icon: 'qr', label: { en: 'Turn text or a link into a QR code', ur: 'متن یا لنک کو QR کوڈ بنائیں' }, tool: { en: 'QR Code Generator', ur: 'QR کوڈ جنریٹر' } }
            ]
        },
        {
            id: 'work', icon: 'work',
            label: { en: 'Work', ur: 'کام' },
            items: [
                { href: '/urdu-invoice-generator', icon: 'invoice', label: { en: 'Create an Urdu or English invoice', ur: 'اردو یا انگریزی انوائس بنائیں' }, tool: { en: 'Invoice Generator', ur: 'انوائس جنریٹر' } },
                { href: '/urdu-editor', icon: 'document', label: { en: 'Prepare a formal Urdu document', ur: 'رسمی اردو دستاویز تیار کریں' }, tool: { en: 'Rich Text Editor', ur: 'رچ ٹیکسٹ ایڈیٹر' }, activeOwner: false }
            ]
        },
        {
            id: 'learn', icon: 'learn',
            label: { en: 'Learn', ur: 'سیکھیں' },
            items: [
                { href: '/urdu-alphabet', icon: 'alphabet', label: { en: 'Learn the Urdu alphabet', ur: 'اردو حروف تہجی سیکھیں' }, tool: { en: 'Alphabet guide', ur: 'حروف تہجی گائیڈ' } },
                { href: '/roman-urdu-transliteration', icon: 'convert', label: { en: 'Understand Roman Urdu transliteration', ur: 'رومن اردو تحریری تبدیلی سمجھیں' }, tool: { en: 'Roman Urdu guide', ur: 'رومن اردو گائیڈ' } },
                { href: '/urdu-fonts-nastaliq-vs-naskh', icon: 'document', label: { en: 'Choose an Urdu font', ur: 'اردو فونٹ منتخب کریں' }, tool: { en: 'Nastaliq vs Naskh guide', ur: 'نستعلیق بمقابلہ نسخ گائیڈ' } },
                { href: '/english-urdu-typing-tutorial', icon: 'keyboard', label: { en: 'Learn English-to-Urdu typing', ur: 'انگریزی سے اردو ٹائپنگ سیکھیں' }, tool: { en: 'Typing tutorial', ur: 'ٹائپنگ سبق' } },
                { href: '/how-to-write-urdu-on-photo', icon: 'image', label: { en: 'Learn to put Urdu on a photo', ur: 'تصویر پر اردو لکھنا سیکھیں' }, tool: { en: 'Photo guide', ur: 'تصویر گائیڈ' } },
                { href: '/how-to-share-urdu-writing-online', icon: 'share', label: { en: 'Learn to share Urdu writing online', ur: 'اردو تحریر آن لائن شیئر کرنا سیکھیں' }, tool: { en: 'Sharing guide', ur: 'شیئرنگ گائیڈ' } },
                { href: '/write-urdu-documentation', icon: 'book', label: { en: 'Use Write Urdu documentation', ur: 'رائٹ اردو دستاویزات دیکھیں' }, tool: { en: 'Documentation', ur: 'دستاویزات' } },
                { href: '/urdu-faq', icon: 'question', label: { en: 'Get answers to common questions', ur: 'عام سوالات کے جواب حاصل کریں' }, tool: { en: 'FAQ', ur: 'سوالات' } }
            ]
        }
    ];

    var FOOTER_ABOUT = {
        label: { en: 'About', ur: 'متعلق' },
        items: [
            { href: '/why-write-urdu', label: { en: 'Why Write Urdu?', ur: 'رائٹ اردو کیوں؟' } },
            { href: '/write-urdu-features', label: { en: 'Features', ur: 'خصوصیات' } },
            { href: '/changelog', label: { en: 'What’s new', ur: 'نیا کیا ہے' } },
            { href: '/write-urdu-feedback', label: { en: 'Feedback', ur: 'رائے' } },
            { href: '/write-urdu-search', label: { en: 'Search', ur: 'تلاش' } },
            { href: '/write-urdu-sitemap', label: { en: 'Sitemap', ur: 'سائٹ میپ' } },
            { href: '/write-urdu-privacy', label: { en: 'Privacy and terms', ur: 'رازداری اور شرائط' } }
        ]
    };

    var ICONS = {
        write: '<path d="M4 19.5 8.3 18.7 19 8l-3-3L5.3 15.7 4 19.5Z"/><path d="m14.5 6.5 3 3"/>',
        create: '<path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/>',
        work: '<path d="M4 7h16v12H4z"/><path d="M9 7V4h6v3M4 11h16M10 11v2h4v-2"/>',
        learn: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M8 7h8M8 10h8"/>',
        keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
        document: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
        voice: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 10a6 6 0 0 0 12 0M12 16v5M9 21h6"/>',
        image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.4"/><path d="m4 17 5-5 3.5 3 2.5-2.5 6 5"/>',
        fix: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/>',
        convert: '<path d="M4 8h12M13 5l3 3-3 3M20 16H8M11 13l-3 3 3 3"/>',
        card: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15h10M7 11h6M7 8h3"/>',
        phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 18h4"/>',
        name: '<path d="M4 19c2.3-4.8 4.8-7.2 7.5-7.2 2.6 0 3.2 2.2 5 2.2 1.1 0 2.3-.7 3.5-2"/><path d="M6 7.5c1.3-1.7 2.8-2.5 4.4-2.5 1.2 0 2.2.4 3.2 1.2"/>',
        sparkle: '<path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/>',
        grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
        qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM17 14h3"/>',
        invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        alphabet: '<circle cx="12" cy="12" r="9"/><path d="M8 16V8h2.8a2 2 0 0 1 0 4H8m2.8 0H12"/>',
        share: '<path d="M8 12h8"/><path d="m13 7 5 5-5 5"/><path d="M6 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>',
        book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M8 7h8M8 10h8"/>',
        question: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1.1.8-1.6 1.2-1.6 2.5M12 16.5h.01"/>'
    };

    function locale() {
        if (root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function') return root.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
        return document.documentElement.getAttribute('dir') === 'rtl' || /^ur\b/i.test(document.documentElement.lang || '') ? 'ur' : 'en';
    }

    function normalizePath(value) {
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\/index\.html$/i.test(path)) path = path.replace(/\/index\.html$/i, '');
        else if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function itemPath(item) {
        try { return normalizePath(new URL(item.href, root.location.href).pathname); }
        catch (error) { return normalizePath(item.href); }
    }

    function active(item) {
        if (item.activeOwner === false) return false;
        var path = normalizePath(root.location && root.location.pathname || '/');
        if (path !== itemPath(item)) return false;
        var role = new URLSearchParams(root.location && root.location.search || '').get('role');
        if (item.role) return role === item.role;
        if (item.excludeRole) return role !== item.excludeRole;
        return true;
    }

    function icon(name) {
        return '<span class="wu-nav-icon wu-outcome-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">' + (ICONS[name] || ICONS.write) + '</svg></span>';
    }

    function renderItem(item, lang) {
        var isActive = active(item);
        var className = 'wu-outcome-link' + (isActive ? ' is-active' : '');
        return '<a class="' + className + '" href="' + item.href + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
            icon(item.icon) +
            '<span class="wu-outcome-link-copy"><strong>' + item.label[lang] + '</strong><small>' + item.tool[lang] + '</small></span>' +
        '</a>';
    }

    function renderGroup(group, lang) {
        var isActive = group.items.some(active);
        return '<details class="wu-nav-more wu-outcome-menu" data-wu-nav-group="' + group.id + '">' +
            '<summary' + (isActive ? ' class="is-active"' : '') + '>' + icon(group.icon) + '<span>' + group.label[lang] + '</span><span class="wu-nav-chevron" aria-hidden="true">⌄</span></summary>' +
            '<div class="wu-nav-more-menu wu-outcome-menu-panel">' + group.items.map(function (item) { return renderItem(item, lang); }).join('') + '</div>' +
        '</details>';
    }

    function ensureStyles() {
        if (document.querySelector('link[data-wu-outcome-navigation-style]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/outcome-navigation.css';
        link.setAttribute('data-wu-outcome-navigation-style', '');
        document.head.appendChild(link);
    }

    function renderHeader() {
        var nav = document.querySelector('.wu-primary-nav');
        var header = document.querySelector('.wu-site-header');
        if (!nav || !header) return false;
        var lang = locale();
        nav.innerHTML = GROUPS.map(function (group) { return renderGroup(group, lang); }).join('');
        nav.setAttribute('data-wu-outcome-nav', 'v2');
        header.setAttribute('data-wu-outcome-navigation', 'v2');

        var utilitySlot = header.querySelector('[data-wu-drafts-utility-slot]');
        if (!utilitySlot) {
            utilitySlot = document.createElement('span');
            utilitySlot.hidden = true;
            utilitySlot.setAttribute('data-wu-drafts-utility-slot', '');
            utilitySlot.setAttribute('aria-hidden', 'true');
            var install = header.querySelector('[data-wu-install]');
            (install && install.parentNode ? install.parentNode : header).insertBefore(utilitySlot, install || null);
        }
        return true;
    }

    function footerGroup(group, lang) {
        var ownerItems = group.items.filter(function (item) { return item.activeOwner !== false; });
        return '<div class="wu-footer-group" data-wu-footer-group="' + group.id + '"><h2>' + group.label[lang] + '</h2>' +
            ownerItems.map(function (item) { return '<a href="' + item.href + '">' + item.label[lang] + '</a>'; }).join('') + '</div>';
    }

    function renderFooter() {
        var footer = document.querySelector('.wu-footer-nav');
        if (!footer) return false;
        var lang = locale();
        footer.innerHTML = GROUPS.map(function (group) { return footerGroup(group, lang); }).join('') +
            '<div class="wu-footer-group wu-footer-about" data-wu-footer-group="about"><h2>' + FOOTER_ABOUT.label[lang] + '</h2>' +
            FOOTER_ABOUT.items.map(function (item) { return '<a href="' + item.href + '">' + item.label[lang] + '</a>'; }).join('') + '</div>';
        footer.setAttribute('data-wu-outcome-footer', 'v2');
        return true;
    }

    function render() {
        ensureStyles();
        var headerReady = renderHeader();
        var footerReady = renderFooter();
        if (headerReady) {
            document.dispatchEvent(new CustomEvent('write-urdu:outcome-navigation-ready', { detail: { groups: GROUPS.map(function (group) { return group.id; }) } }));
        }
        return headerReady && footerReady;
    }

    function start(attempt) {
        if (render()) return;
        if ((attempt || 0) >= 120) return;
        root.setTimeout(function () { start((attempt || 0) + 1); }, 25);
    }

    document.addEventListener('write-urdu:locale-change', function () { root.setTimeout(function () { render(); }, 0); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { start(0); });
    else start(0);

    root.WriteUrduOutcomeNavigation = {
        groups: GROUPS,
        render: render,
        normalizePath: normalizePath
    };
}(window, document));