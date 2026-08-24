(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWritingTemplates = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CATEGORIES = [
        { id: 'all', label: 'All templates' },
        { id: 'school', label: 'School' },
        { id: 'office', label: 'Office' },
        { id: 'applications', label: 'Applications' },
        { id: 'business', label: 'Business' },
        { id: 'personal', label: 'Personal' }
    ];

    var TEMPLATES = [
        {
            id: 'school-sick-leave',
            category: 'school',
            title: 'School sick leave application',
            titleUrdu: 'درخواست برائے بیماری کی رخصت',
            description: 'A simple school leave request for illness.',
            keywords: ['leave', 'sick', 'school', 'student', 'بیماری', 'چھٹی', 'رخصت'],
            body: 'بخدمت جناب پرنسپل صاحب/صاحبہ\n[اسکول کا نام]\n\nموضوع: بیماری کی وجہ سے رخصت کی درخواست\n\nمحترم جناب/محترمہ،\nباادب گزارش ہے کہ میں [کلاس] کا طالب علم/طالبہ ہوں۔ میری طبیعت ناساز ہے، اس لیے میں [شروع ہونے کی تاریخ] سے [واپسی کی تاریخ] تک اسکول حاضر نہیں ہو سکوں گا/گی۔\nبراہِ کرم مجھے [تعداد] دن کی رخصت منظور فرمائیں۔\n\nشکریہ\nنام: [آپ کا نام]\nکلاس/سیکشن: [کلاس]\nرول نمبر: [رول نمبر]\nتاریخ: [تاریخ]'
        },
        {
            id: 'school-urgent-leave',
            category: 'school',
            title: 'School leave for urgent work',
            titleUrdu: 'درخواست برائے ضروری کام کی رخصت',
            description: 'A short leave request for an urgent family or personal matter.',
            keywords: ['urgent', 'leave', 'school', 'ضروری کام', 'رخصت', 'چھٹی'],
            body: 'بخدمت جناب پرنسپل صاحب/صاحبہ\n[اسکول کا نام]\n\nموضوع: ضروری کام کی وجہ سے رخصت کی درخواست\n\nمحترم جناب/محترمہ،\nباادب گزارش ہے کہ مجھے [مختصر وجہ] کے باعث [تاریخ] کو اسکول سے رخصت درکار ہے۔ میں اپنی رہ جانے والی پڑھائی مکمل کر لوں گا/گی۔\nبراہِ کرم ایک دن کی رخصت منظور فرمائیں۔\n\nشکریہ\nنام: [آپ کا نام]\nکلاس/سیکشن: [کلاس]\nرول نمبر: [رول نمبر]\nتاریخ: [تاریخ]'
        },
        {
            id: 'school-fee-concession',
            category: 'school',
            title: 'Fee concession request',
            titleUrdu: 'درخواست برائے فیس میں رعایت',
            description: 'A respectful starter request for school fee concession.',
            keywords: ['fee', 'concession', 'school', 'فیس', 'رعایت', 'درخواست'],
            body: 'بخدمت جناب پرنسپل صاحب/صاحبہ\n[اسکول/کالج کا نام]\n\nموضوع: فیس میں رعایت کی درخواست\n\nمحترم جناب/محترمہ،\nباادب گزارش ہے کہ میں [کلاس/پروگرام] کا طالب علم/طالبہ ہوں۔ [اپنی صورتِ حال مختصر اور درست الفاظ میں لکھیں]۔ اس وجہ سے مکمل فیس ادا کرنا میرے لیے مشکل ہے۔\nبراہِ کرم میری درخواست پر غور کرتے ہوئے فیس میں مناسب رعایت کی منظوری عطا فرمائیں۔ مطلوبہ دستاویزات فراہم کی جا سکتی ہیں۔\n\nشکریہ\nنام: [آپ کا نام]\nکلاس/رول نمبر: [تفصیل]\nتاریخ: [تاریخ]'
        },
        {
            id: 'school-certificate-request',
            category: 'school',
            title: 'Certificate request',
            titleUrdu: 'درخواست برائے سرٹیفکیٹ',
            description: 'Request a school or college certificate using a clear formal format.',
            keywords: ['certificate', 'school', 'college', 'سرٹیفکیٹ', 'درخواست'],
            body: 'بخدمت جناب پرنسپل صاحب/صاحبہ\n[ادارے کا نام]\n\nموضوع: [سرٹیفکیٹ کا نام] جاری کرنے کی درخواست\n\nمحترم جناب/محترمہ،\nباادب گزارش ہے کہ میں [کلاس/پروگرام] کا طالب علم/طالبہ ہوں۔ مجھے [مقصد] کے لیے [سرٹیفکیٹ کا نام] درکار ہے۔\nبراہِ کرم ضروری کارروائی مکمل کرتے ہوئے مذکورہ سرٹیفکیٹ جاری فرمانے کی مہربانی کریں۔\n\nشکریہ\nنام: [آپ کا نام]\nرول نمبر/رجسٹریشن نمبر: [نمبر]\nتاریخ: [تاریخ]'
        },
        {
            id: 'office-leave',
            category: 'office',
            title: 'Office leave application',
            titleUrdu: 'دفتر سے رخصت کی درخواست',
            description: 'A professional leave request for an employee.',
            keywords: ['office', 'employee', 'leave', 'دفتر', 'ملازم', 'رخصت'],
            body: 'بخدمت [منیجر/متعلقہ افسر]\n[ادارے/کمپنی کا نام]\n\nموضوع: رخصت کی درخواست\n\nمحترم جناب/محترمہ،\nمیں [مختصر وجہ] کے باعث [شروع ہونے کی تاریخ] سے [اختتامی تاریخ] تک دفتر حاضر نہیں ہو سکوں گا/گی۔ ضروری کام کی منتقلی/ہینڈ اوور [متعلقہ شخص یا طریقہ] کے مطابق مکمل کر دوں گا/گی۔\nبراہِ کرم مذکورہ مدت کے لیے رخصت منظور فرمائیں۔\n\nشکریہ\nنام: [آپ کا نام]\nعہدہ: [عہدہ]\nتاریخ: [تاریخ]'
        },
        {
            id: 'job-application',
            category: 'office',
            title: 'Job application letter',
            titleUrdu: 'ملازمت کے لیے درخواست',
            description: 'A concise cover letter starter for a job application.',
            keywords: ['job', 'application', 'career', 'ملازمت', 'نوکری', 'درخواست'],
            body: 'بخدمت [بھرتی کرنے والے افسر/ادارے کا نام]\n\nموضوع: [عہدے کا نام] کے لیے درخواست\n\nمحترم جناب/محترمہ،\nآپ کے ادارے میں [عہدے کا نام] کی آسامی کے لیے اپنی درخواست پیش کر رہا/رہی ہوں۔ میرے پاس [متعلقہ تعلیم/تجربہ] ہے اور میں [متعلقہ مہارت] میں کام کر چکا/چکی ہوں۔\nمیرا تعلیمی و پیشہ ورانہ خلاصہ ساتھ منسلک ہے۔ موقع ملنے پر اپنی صلاحیتوں کے بارے میں مزید گفتگو کرنا پسند کروں گا/گی۔\n\nمخلص\n[آپ کا نام]\nفون: [فون نمبر]\nای میل: [ای میل]\nتاریخ: [تاریخ]'
        },
        {
            id: 'resignation-letter',
            category: 'office',
            title: 'Resignation letter',
            titleUrdu: 'استعفیٰ کا خط',
            description: 'A neutral professional resignation starter.',
            keywords: ['resignation', 'office', 'job', 'استعفیٰ', 'ملازمت'],
            body: 'بخدمت [منیجر/متعلقہ افسر]\n[ادارے کا نام]\n\nموضوع: استعفیٰ\n\nمحترم جناب/محترمہ،\nمیں اپنے عہدے [عہدے کا نام] سے استعفیٰ پیش کر رہا/رہی ہوں۔ میری مجوزہ آخری کام کی تاریخ [تاریخ] ہے، جو ادارے کی پالیسی اور قابلِ اطلاق نوٹس مدت کے مطابق ایڈجسٹ کی جا سکتی ہے۔\nمیں اپنی ذمہ داریوں اور جاری کام کا مناسب ہینڈ اوور مکمل کرنے میں تعاون کروں گا/گی۔ ادارے میں ملنے والے تجربے اور تعاون کا شکریہ۔\n\nمخلص\n[آپ کا نام]\nتاریخ: [تاریخ]'
        },
        {
            id: 'complaint-application',
            category: 'applications',
            title: 'Complaint application',
            titleUrdu: 'شکایت کی درخواست',
            description: 'A structured complaint format for an organization or authority.',
            keywords: ['complaint', 'application', 'authority', 'شکایت', 'درخواست'],
            body: 'بخدمت [متعلقہ افسر/ادارے کا نام]\n\nموضوع: [مسئلے] کے بارے میں شکایت\n\nمحترم جناب/محترمہ،\nمیں آپ کی توجہ [مسئلے کی مختصر وضاحت] کی طرف دلانا چاہتا/چاہتی ہوں۔ یہ مسئلہ [تاریخ/مدت] سے موجود ہے اور اس کی وجہ سے [مختصر اثر] پیش آ رہا ہے۔\nمتعلقہ تفصیل: [واقعہ، حوالہ نمبر یا ضروری حقائق]\nبراہِ کرم معاملے کا جائزہ لے کر مناسب کارروائی فرمائیں اور ممکن ہو تو مجھے نتیجے سے آگاہ کریں۔\n\nشکریہ\nنام: [آپ کا نام]\nرابطہ: [فون/ای میل]\nتاریخ: [تاریخ]'
        },
        {
            id: 'general-request-letter',
            category: 'applications',
            title: 'General request letter',
            titleUrdu: 'عمومی درخواست کا خط',
            description: 'A flexible formal request that can be adapted to many situations.',
            keywords: ['request', 'application', 'letter', 'درخواست', 'خط'],
            body: 'بخدمت [نام/عہدہ]\n[ادارے کا نام]\n\nموضوع: [درخواست کا مختصر عنوان]\n\nمحترم جناب/محترمہ،\nباادب گزارش ہے کہ [اپنی درخواست ایک یا دو واضح جملوں میں لکھیں]۔ اس درخواست کی وجہ/ضرورت [مختصر وجہ] ہے۔\nبراہِ کرم میری درخواست پر غور کرتے ہوئے [مطلوبہ کارروائی] کی منظوری/رہنمائی فراہم فرمائیں۔\n\nشکریہ\nنام: [آپ کا نام]\nرابطہ: [رابطہ]\nتاریخ: [تاریخ]'
        },
        {
            id: 'payment-reminder',
            category: 'business',
            title: 'Payment reminder',
            titleUrdu: 'ادائیگی کی یاد دہانی',
            description: 'A polite payment reminder for a customer or business contact.',
            keywords: ['payment', 'reminder', 'invoice', 'business', 'ادائیگی', 'یاد دہانی'],
            body: 'محترم [نام/کمپنی]،\n\nموضوع: ادائیگی کی یاد دہانی — [انوائس/حوالہ نمبر]\n\nامید ہے آپ خیریت سے ہوں گے۔ یہ [رقم] کی ادائیگی کے بارے میں دوستانہ یاد دہانی ہے، جس کی مقررہ تاریخ [تاریخ] تھی۔\nاگر ادائیگی ہو چکی ہے تو براہِ کرم اس پیغام کو نظر انداز کریں۔ بصورتِ دیگر، مہربانی کرکے ادائیگی کی متوقع تاریخ سے آگاہ کر دیں۔\n\nشکریہ\n[آپ کا نام/کاروبار]\nرابطہ: [فون/ای میل]'
        },
        {
            id: 'meeting-notice',
            category: 'business',
            title: 'Meeting notice',
            titleUrdu: 'اجلاس کا نوٹس',
            description: 'A short notice for a team, committee or community meeting.',
            keywords: ['meeting', 'notice', 'announcement', 'اجلاس', 'میٹنگ', 'نوٹس'],
            body: 'اجلاس کا نوٹس\n\nتمام متعلقہ افراد کو مطلع کیا جاتا ہے کہ [موضوع/مقصد] کے سلسلے میں اجلاس منعقد ہوگا۔\n\nتاریخ: [تاریخ]\nوقت: [وقت]\nمقام/آن لائن لنک: [تفصیل]\nایجنڈا: [مختصر ایجنڈا]\n\nبراہِ کرم وقت پر شرکت یقینی بنائیں اور اگر کسی دستاویز/تیاری کی ضرورت ہو تو [تفصیل] کے مطابق ساتھ لائیں۔\n\nجاری کنندہ: [نام/ادارہ]'
        },
        {
            id: 'invitation-letter',
            category: 'personal',
            title: 'Invitation letter',
            titleUrdu: 'دعوت نامہ / دعوتی خط',
            description: 'A warm editable invitation for a family or community event.',
            keywords: ['invitation', 'event', 'personal', 'دعوت', 'تقریب'],
            body: 'محترم/محترمہ [نام]،\n\nہمیں خوشی ہے کہ آپ کو [تقریب/موقع] میں شرکت کی دعوت دیں۔ آپ کی موجودگی ہمارے لیے باعثِ مسرت ہوگی۔\n\nتقریب: [تقریب کا نام]\nتاریخ: [تاریخ]\nوقت: [وقت]\nمقام: [مقام]\n\nبراہِ کرم [اگر ضروری ہو تو شرکت کی تصدیق/رابطے کی تفصیل] سے آگاہ کریں۔\n\nخیراندیش\n[آپ/خاندان/ادارے کا نام]'
        }
    ];

    function getTemplate(id) {
        return TEMPLATES.find(function (template) { return template.id === id; }) || null;
    }

    function searchTemplates(query, category) {
        var q = String(query || '').trim().toLowerCase();
        var selectedCategory = category || 'all';
        return TEMPLATES.filter(function (template) {
            if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
            if (!q) return true;
            var haystack = [template.title, template.titleUrdu, template.description]
                .concat(template.keywords || [])
                .join(' ')
                .toLowerCase();
            return haystack.indexOf(q) !== -1;
        });
    }

    function copyText(text) {
        if (root && root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
            return root.navigator.clipboard.writeText(text);
        }
        return Promise.reject(new Error('clipboard_unavailable'));
    }

    function transfer(text, targetWorkspace, actionId) {
        var handoff = root && root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.transfer !== 'function') return { ok: false, reason: 'handoff-unavailable' };
        return handoff.transfer({
            sourceWorkspace: 'templates',
            sourceRoute: '/urdu-writing-templates',
            targetWorkspace: targetWorkspace,
            kind: 'plain-text',
            payload: { text: String(text || '') },
            actionId: actionId
        });
    }

    function mount() {
        if (!root || !root.document) return null;
        var scope = root.document.querySelector('[data-writing-templates]');
        if (!scope) return null;

        var grid = scope.querySelector('[data-writing-template-grid]');
        var search = scope.querySelector('[data-writing-template-search]');
        var categories = scope.querySelector('[data-writing-template-categories]');
        var count = scope.querySelector('[data-writing-template-count]');
        var empty = scope.querySelector('[data-writing-template-empty]');
        var editor = scope.querySelector('[data-writing-template-editor]');
        var editorTitle = scope.querySelector('[data-writing-template-editor-title]');
        var editorMeta = scope.querySelector('[data-writing-template-editor-meta]');
        var selectedSection = scope.querySelector('[data-writing-template-selected]');
        var copyButton = scope.querySelector('[data-writing-template-copy]');
        var writerButton = scope.querySelector('[data-writing-template-writer]');
        var richButton = scope.querySelector('[data-writing-template-rich]');
        var resetButton = scope.querySelector('[data-writing-template-reset]');
        var notice = scope.querySelector('[data-writing-template-notice]');
        var state = { query: '', category: 'all', selectedId: null, originalText: '' };

        function setNotice(message, kind) {
            if (!notice) return;
            notice.textContent = message || '';
            notice.dataset.state = kind || '';
        }

        function currentTemplate() {
            return getTemplate(state.selectedId);
        }

        function selectTemplate(id, shouldFocus) {
            var template = getTemplate(id);
            if (!template) return;
            state.selectedId = template.id;
            state.originalText = template.body;
            editor.value = template.body;
            editorTitle.textContent = template.titleUrdu;
            editorMeta.textContent = template.title + ' · Edit the placeholders before using it.';
            selectedSection.hidden = false;
            setNotice('', '');
            if (shouldFocus) {
                selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                root.setTimeout(function () { editor.focus(); }, 250);
            }
        }

        function createCard(template) {
            var card = root.document.createElement('article');
            card.className = 'writing-template-card';
            card.dataset.templateId = template.id;

            var badge = root.document.createElement('span');
            badge.className = 'writing-template-badge';
            badge.textContent = CATEGORIES.find(function (item) { return item.id === template.category; }).label;
            card.appendChild(badge);

            var title = root.document.createElement('h3');
            title.lang = 'ur';
            title.dir = 'rtl';
            title.textContent = template.titleUrdu;
            card.appendChild(title);

            var english = root.document.createElement('p');
            english.className = 'writing-template-english-title';
            english.textContent = template.title;
            card.appendChild(english);

            var description = root.document.createElement('p');
            description.textContent = template.description;
            card.appendChild(description);

            var preview = root.document.createElement('p');
            preview.className = 'writing-template-preview';
            preview.lang = 'ur';
            preview.dir = 'rtl';
            preview.textContent = template.body.split('\n').filter(Boolean).slice(0, 3).join(' ');
            card.appendChild(preview);

            var action = root.document.createElement('button');
            action.type = 'button';
            action.className = 'urdu-tool-button primary';
            action.dataset.writingTemplateOpen = template.id;
            action.textContent = 'Use this template';
            card.appendChild(action);
            return card;
        }

        function renderCategories() {
            categories.replaceChildren();
            CATEGORIES.forEach(function (category) {
                var button = root.document.createElement('button');
                button.type = 'button';
                button.className = 'writing-template-filter';
                button.dataset.writingTemplateCategory = category.id;
                button.setAttribute('aria-pressed', String(state.category === category.id));
                button.textContent = category.label;
                categories.appendChild(button);
            });
        }

        function render() {
            var templates = searchTemplates(state.query, state.category);
            grid.replaceChildren();
            templates.forEach(function (template) { grid.appendChild(createCard(template)); });
            count.textContent = templates.length + ' writing template' + (templates.length === 1 ? '' : 's');
            empty.hidden = templates.length !== 0;
            renderCategories();
        }

        scope.addEventListener('click', function (event) {
            var category = event.target.closest('[data-writing-template-category]');
            if (category) {
                state.category = category.dataset.writingTemplateCategory;
                render();
                return;
            }
            var open = event.target.closest('[data-writing-template-open]');
            if (open) {
                selectTemplate(open.dataset.writingTemplateOpen, true);
                return;
            }
        });

        search.addEventListener('input', function () {
            state.query = search.value;
            render();
        });

        resetButton.addEventListener('click', function () {
            var template = currentTemplate();
            if (!template) return;
            editor.value = state.originalText;
            setNotice('Template reset to its original wording.', 'success');
            editor.focus();
        });

        copyButton.addEventListener('click', async function () {
            var text = String(editor.value || '').trim();
            if (!text) return;
            try {
                await copyText(text);
                setNotice('Template copied.', 'success');
            } catch (error) {
                editor.focus();
                editor.select();
                setNotice('Select the template text and copy it from your browser.', 'info');
            }
        });

        writerButton.addEventListener('click', function () {
            var text = String(editor.value || '').trim();
            if (!text) return;
            var result = transfer(text, 'basic-writer', 'writing-template-to-basic');
            if (result && result.ok && result.route) {
                root.location.assign(result.route);
                return;
            }
            setNotice('Copy the template, then open WriteUrdu to continue.', 'info');
        });

        richButton.addEventListener('click', function () {
            var text = String(editor.value || '').trim();
            if (!text) return;
            var result = transfer(text, 'rich-editor', 'writing-template-to-rich');
            if (result && result.ok && result.route) {
                root.location.assign(result.route);
                return;
            }
            setNotice('Copy the template, then open the Urdu editor to format it.', 'info');
        });

        render();
        selectTemplate(TEMPLATES[0].id, false);
        return { state: state, editor: editor };
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', mount);
        else mount();
    }

    return {
        CATEGORIES: CATEGORIES,
        TEMPLATES: TEMPLATES,
        getTemplate: getTemplate,
        searchTemplates: searchTemplates,
        transfer: transfer,
        mount: mount
    };
}));
