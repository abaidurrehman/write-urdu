(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardsData = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var categories = [
        { id: 'all', name: 'All', nameUr: 'سب' },
        { id: 'dua', name: 'Dua', nameUr: 'دعا' },
        { id: 'eid-greeting', name: 'Eid Greeting', nameUr: 'عید مبارک' },
        { id: 'wedding', name: 'Wedding', nameUr: 'شادی' },
        { id: 'congratulations', name: 'Congratulations', nameUr: 'مبارکباد' },
        { id: 'love-friendship', name: 'Love & Friendship', nameUr: 'محبت و دوستی' },
        { id: 'poetry-quote', name: 'Poetry & Quotes', nameUr: 'شاعری و اقتباس' },
        { id: 'condolence', name: 'Condolence', nameUr: 'تعزیت' },
        { id: 'everyday-greeting', name: 'Everyday Greeting', nameUr: 'روزمرہ سلام' },
        { id: 'morning', name: 'Morning', nameUr: 'صبح بخیر' },
        { id: 'night', name: 'Night', nameUr: 'شب بخیر' },
        { id: 'jumma', name: 'Jumma', nameUr: 'جمعہ مبارک' },
        { id: 'reflection', name: 'Reflection', nameUr: 'دعا و خوبصورت بات' },
        { id: 'family', name: 'Family', nameUr: 'خاندان' },
        { id: 'friendship', name: 'Friendship', nameUr: 'دوستی' },
        { id: 'love', name: 'Love', nameUr: 'محبت' },
        { id: 'self-respect', name: 'Self-Respect', nameUr: 'خودداری' }
    ];

    var CONTEXTS = ['morning', 'daytime', 'evening', 'night', 'friday'];
    var SOURCE_TYPES = ['original'];
    var RIGHTS_STATUSES = ['original'];

    function record(id, category, backgroundId, textUr, metadata) {
        return Object.assign({
            schemaVersion: 1,
            status: 'approved',
            id: id,
            category: category,
            backgroundId: backgroundId,
            textUr: textUr,
            tags: [],
            mood: ['warm'],
            occasion: null,
            contexts: [],
            featuredEligible: false,
            schedulePriority: 0,
            romanUrdu: null,
            englishMeaning: null,
            source: { type: 'original', attribution: 'Write Urdu', verified: true },
            rights: { status: 'original', note: 'Original Write Urdu editorial copy.' }
        }, metadata || {});
    }

    var cards = [
        record('dua-1', 'dua', 'emerald-mughal', 'اللہ آپ کی حفاظت فرمائے اور ہر مشکل میں آسانی عطا کرے۔'),
        record('dua-2', 'dua', 'moonlit-lanterns', 'یا اللہ، میری دعاؤں کو قبول فرما اور میرے گھر والوں کو خوش رکھ۔'),
        record('dua-3', 'dua', 'ivory-arabesque', 'دعا ہے کہ اللہ تعالیٰ آپ کو صحت، سکون اور برکت عطا فرمائے۔'),
        record('dua-4', 'dua', 'regal-gold-arabesque', 'اللہ کرے آپ کا ہر دن خیر و عافیت سے گزرے۔'),

        record('eid-1', 'eid-greeting', 'emerald-eid-lanterns', 'عید مبارک! اللہ آپ کی خوشیوں کو دوبالا کرے۔'),
        record('eid-2', 'eid-greeting', 'burgundy-arch', 'عید کی خوشیاں آپ اور آپ کے پیاروں کے لیے مبارک ہوں۔'),
        record('eid-3', 'eid-greeting', 'teal-gold-botanical', 'چاند رات مبارک، عید سب کے لیے خوشیوں بھری ہو۔'),
        record('eid-4', 'eid-greeting', 'peacock-festival', 'عید الفطر مبارک! یہ دن آپ کے لیے برکتوں والا ہو۔'),

        record('wedding-1', 'wedding', 'blush-rose-lanterns', 'شادی مبارک ہو! اللہ آپ دونوں کی زندگی خوشیوں سے بھر دے۔'),
        record('wedding-2', 'wedding', 'rose-garden-frame', 'نکاح مبارک، یہ رشتہ محبت اور برکت کا باعث بنے۔'),
        record('wedding-3', 'wedding', 'maroon-wedding', 'دولہا دولہن کو مبارکباد، آپ کی نئی زندگی خوشگوار ہو۔'),
        record('wedding-4', 'wedding', 'blush-rose-lanterns', 'شادی کی سالگرہ مبارک، آپ کا رشتہ ہمیشہ قائم رہے۔'),

        record('congrats-1', 'congratulations', 'teal-gold-botanical', 'مبارک ہو! آپ کی محنت رنگ لائی۔'),
        record('congrats-2', 'congratulations', 'pastel-glass', 'کامیابی مبارک، یہ صرف آغاز ہے۔'),
        record('congrats-3', 'congratulations', 'black-gold-classic', 'نئی نوکری مبارک، آگے بڑھتے رہیں۔'),
        record('congrats-4', 'congratulations', 'lantern-sunrise', 'پیدائش مبارک، نیا مہمان خوشیاں لے کر آیا۔'),

        record('love-1', 'love-friendship', 'vintage-floral', 'دوستی ایک انمول رشتہ ہے، ہمیشہ قائم رہے۔'),
        record('love-2', 'love-friendship', 'moon-paper', 'تمہاری دوستی زندگی کا سب سے خوبصورت تحفہ ہے۔'),
        record('love-3', 'love-friendship', 'moonlit-lakeside', 'محبت وہی ہے جو بغیر کہے سمجھ لی جائے۔'),
        record('love-4', 'love-friendship', 'blush-rose-lanterns', 'تم میری زندگی کی سب سے خوبصورت کہانی ہو۔'),

        record('poetry-1', 'poetry-quote', 'ink-wash-poetry', 'خوشبو کی طرح اڑ جاؤں کہیں، یاد رہوں پھر بھی وہیں۔'),
        record('poetry-2', 'poetry-quote', 'old-lahore-journal', 'ہر رات کے بعد ایک نئی صبح ہوتی ہے، امید مت چھوڑنا۔'),
        record('poetry-3', 'poetry-quote', 'ajrak-heritage', 'زندگی مختصر ہے، اسے خلوص سے گزارو۔'),
        record('poetry-4', 'poetry-quote', 'heritage-mughal-garden', 'خواب دیکھنا آسان ہے، انہیں سچ کرنا ہمت مانگتا ہے۔'),

        record('condolence-1', 'condolence', 'midnight-crescent-city', 'اللہ تعالیٰ مرحوم کی مغفرت فرمائے اور پسماندگان کو صبر جمیل عطا کرے۔'),
        record('condolence-2', 'condolence', 'moon-paper', 'انا للہ و انا الیہ راجعون۔ اللہ آپ کو صبر دے۔'),
        record('condolence-3', 'condolence', 'ivory-arabesque', 'اس دکھ کی گھڑی میں ہم آپ کے ساتھ ہیں۔'),
        record('condolence-4', 'condolence', 'moonlit-lanterns', 'اللہ مرحوم کو جنت الفردوس میں اعلیٰ مقام عطا فرمائے۔'),

        record('greeting-1', 'everyday-greeting', 'truck-art-bloom', 'السلام علیکم! امید ہے آپ خیریت سے ہوں گے۔'),
        record('greeting-2', 'everyday-greeting', 'peacock-festival', 'صبح بخیر! آج کا دن آپ کے لیے اچھا ہو۔'),
        record('greeting-3', 'everyday-greeting', 'lantern-sunrise', 'شب بخیر، اچھے خواب دیکھیں۔'),
        record('greeting-4', 'everyday-greeting', 'pastel-glass', 'جمعہ مبارک، اللہ آپ کی دعائیں قبول فرمائے۔'),

        record('morning-001', 'morning', 'soft-sunrise-garden', 'صبح بخیر! دعا ہے آج آپ کے دل کو سکون اور کاموں میں آسانی ملے۔', { tags: ['morning-prayer'], contexts: ['morning'], featuredEligible: true, schedulePriority: 10 }),
        record('morning-002', 'morning', 'window-light-tea', 'نئی صبح آپ کے لیے امید، صحت اور خوش خبری لے کر آئے۔', { tags: ['hope'], contexts: ['morning'], featuredEligible: true, schedulePriority: 9 }),
        record('morning-003', 'morning', 'jumma-ivory-geometry', 'اللہ کرے آج کا دن آپ اور آپ کے گھر والوں کے لیے خیر والا ہو۔', { tags: ['family', 'morning-prayer'], contexts: ['morning'], featuredEligible: true, schedulePriority: 8 }),
        record('morning-004', 'morning', 'warm-paper-reflection', 'ہر صبح ایک نئی مہلت ہے؛ آج کو شکر اور مسکراہٹ سے شروع کریں۔', { tags: ['shukr', 'hope'], contexts: ['morning', 'daytime'], featuredEligible: true, schedulePriority: 8 }),
        record('morning-005', 'morning', 'soft-sunrise-garden', 'آپ کی صبح خوش گوار ہو اور پورا دن دل مطمئن رہے۔', { tags: ['greeting'], contexts: ['morning'], featuredEligible: true, schedulePriority: 7 }),
        record('morning-006', 'morning', 'window-light-tea', 'صبح کی پہلی دعا: آپ جہاں رہیں، سلامت اور خوش رہیں۔', { tags: ['morning-prayer'], contexts: ['morning'], featuredEligible: false }),
        record('morning-007', 'morning', 'lantern-sunrise', 'آج کی روشنی آپ کے ارادوں کو تازگی اور دل کو حوصلہ دے۔', { tags: ['courage', 'hope'], contexts: ['morning', 'daytime'], featuredEligible: false }),
        record('morning-008', 'morning', 'pastel-glass', 'صبح بخیر! چھوٹی خوشیوں کو محسوس کریں، یہی دن کو خوبصورت بناتی ہیں۔', { tags: ['shukr'], contexts: ['morning'], featuredEligible: false }),

        record('night-001', 'night', 'quiet-moon-sky', 'شب بخیر! اللہ آپ کو پرسکون نیند اور روشن صبح عطا کرے۔', { tags: ['night-prayer'], contexts: ['night'], featuredEligible: true, schedulePriority: 10 }),
        record('night-002', 'night', 'rainy-window-reflection', 'دن کی تھکن چھوڑ دیں؛ رات سکون، دعا اور آرام کے لیے ہے۔', { tags: ['quiet'], contexts: ['night'], featuredEligible: true, schedulePriority: 9 }),
        record('night-003', 'night', 'quiet-moon-sky', 'آپ کی رات اطمینان سے گزرے اور صبح نئی امید کے ساتھ آئے۔', { tags: ['hope', 'night-prayer'], contexts: ['night'], featuredEligible: true, schedulePriority: 8 }),
        record('night-004', 'night', 'warm-paper-reflection', 'جو بات دل پر بھاری ہے اسے دعا میں رکھ دیں؛ شب بخیر۔', { tags: ['quiet', 'healing'], contexts: ['night'], featuredEligible: true, schedulePriority: 8 }),
        record('night-005', 'night', 'jumma-midnight-silhouette', 'اللہ آپ اور آپ کے پیاروں کو رات بھر اپنی امان میں رکھے۔', { tags: ['family', 'night-prayer'], contexts: ['night'], featuredEligible: true, schedulePriority: 7 }),
        record('night-006', 'night', 'moon-paper', 'آج کی اچھی یادیں ساتھ رکھیں، باقی فکر صبح پر چھوڑ دیں۔', { tags: ['quiet'], contexts: ['night'], featuredEligible: false }),
        record('night-007', 'night', 'moonlit-lakeside', 'شب بخیر! دل مطمئن ہو، نیند گہری ہو اور خواب خوش گوار ہوں۔', { tags: ['greeting'], contexts: ['night'], featuredEligible: false }),
        record('night-008', 'night', 'rainy-window-reflection', 'رات خاموشی سے یاد دلاتی ہے کہ آرام بھی زندگی کا حصہ ہے۔', { tags: ['reflection'], contexts: ['night', 'evening'], featuredEligible: false }),

        record('jumma-001', 'jumma', 'jumma-ivory-geometry', 'جمعہ مبارک! دعا ہے یہ دن آپ کے لیے رحمت، سکون اور آسانی لائے۔', { tags: ['friday-prayer'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 10 }),
        record('jumma-002', 'jumma', 'emerald-prayer-light', 'اللہ آج کے مبارک دن آپ کے گھر میں خیر و برکت عطا فرمائے۔', { tags: ['family', 'friday-prayer'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 9 }),
        record('jumma-003', 'jumma', 'jumma-midnight-silhouette', 'جمعہ مبارک! دل سے مانگی گئی اچھی دعائیں قبول ہوں۔', { tags: ['friday-prayer'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 9 }),
        record('jumma-004', 'jumma', 'jumma-ivory-geometry', 'دعا ہے جمعہ کا دن آپ کی پریشانیوں کو سکون میں بدل دے۔', { tags: ['healing', 'friday-prayer'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 8 }),
        record('jumma-005', 'jumma', 'warm-paper-reflection', 'آج اپنے لیے بھی دعا کریں اور ان لوگوں کے لیے بھی جو آپ کو عزیز ہیں۔', { tags: ['kindness', 'family'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 8 }),
        record('jumma-006', 'jumma', 'emerald-prayer-light', 'جمعہ مبارک! اللہ آپ کے رزق، صحت اور وقت میں برکت دے۔', { tags: ['friday-prayer'], occasion: 'jumma', contexts: ['friday'], featuredEligible: true, schedulePriority: 7 }),
        record('jumma-007', 'jumma', 'jumma-midnight-silhouette', 'یہ جمعہ امید تازہ کرے اور دل کو نیکی کی طرف مائل رکھے۔', { tags: ['hope'], occasion: 'jumma', contexts: ['friday'], featuredEligible: false }),
        record('jumma-008', 'jumma', 'jumma-ivory-geometry', 'جمعہ مبارک! آپ کا آج امن، شکر اور خیر سے بھرپور ہو۔', { tags: ['shukr'], occasion: 'jumma', contexts: ['friday'], featuredEligible: false }),

        record('reflection-001', 'reflection', 'warm-paper-reflection', 'شکر دل کو اس نعمت سے بھی روشناس کراتا ہے جو ہمارے پاس پہلے سے موجود ہے۔', { tags: ['shukr', 'reflection'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 10 }),
        record('reflection-002', 'reflection', 'rainy-window-reflection', 'آسانی ہمیشہ حالات میں نہیں آتی، کبھی دل کو حوصلہ مل جاتا ہے۔', { tags: ['courage', 'healing'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 9 }),
        record('reflection-003', 'reflection', 'emerald-prayer-light', 'جو خیر آپ دوسروں کے لیے چاہتے ہیں، وہی دعا اپنے لیے بھی رکھیں۔', { tags: ['kindness'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 9 }),
        record('reflection-004', 'reflection', 'soft-sunrise-garden', 'ہر دن کامل نہیں ہوتا، مگر ہر دن میں شکر کی کوئی وجہ ضرور ہوتی ہے۔', { tags: ['shukr', 'hope'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 8 }),
        record('reflection-005', 'reflection', 'window-light-tea', 'نرمی سے کہا گیا ایک جملہ کسی کا پورا دن بہتر بنا سکتا ہے۔', { tags: ['kindness'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 8 }),
        record('reflection-006', 'reflection', 'quiet-moon-sky', 'امید شور نہیں کرتی؛ وہ خاموشی سے اگلا قدم اٹھانے کی ہمت دیتی ہے۔', { tags: ['hope', 'courage'], contexts: ['daytime', 'evening'], featuredEligible: true, schedulePriority: 7 }),
        record('reflection-007', 'reflection', 'emerald-prayer-light', 'دعا ہے آپ کو وہ سکون ملے جو کسی وضاحت کا محتاج نہ ہو۔', { tags: ['quiet', 'healing'], contexts: ['evening', 'night'], featuredEligible: false }),
        record('reflection-008', 'reflection', 'warm-paper-reflection', 'زندگی کی رفتار میں کچھ لمحے صرف سانس لینے اور شکر کرنے کے لیے رکھیں۔', { tags: ['shukr', 'quiet'], contexts: ['daytime', 'evening'], featuredEligible: false }),

        record('poetry-005', 'poetry-quote', 'minimal-cream-poetry', 'دل کی بات لفظوں میں کم پڑ جاتی ہے، خاموشی بھی کبھی مکمل جواب ہوتی ہے۔', { tags: ['quiet'] }),
        record('poetry-006', 'poetry-quote', 'ink-moon-poetry', 'چاند نے پوچھا رات سے، تیرا سب سے قیمتی راز کیا ہے؛ رات بولی، ستاروں کا صبر۔', { tags: ['sabr'] }),
        record('poetry-007', 'poetry-quote', 'quiet-blue-distance', 'فاصلے صرف نقشے پر ہوتے ہیں، دل والے ہمیشہ قریب رہتے ہیں۔', { tags: ['quiet'] }),
        record('poetry-008', 'poetry-quote', 'minimal-cream-poetry', 'ہر لفظ کو تولنا مشکل کام ہے، مگر سچی بات کبھی وزن نہیں مانگتی۔', { tags: ['quiet'] }),
        record('poetry-009', 'poetry-quote', 'ink-moon-poetry', 'خاموش راتیں بھی کہانی سناتی ہیں، بس سننے والا دل چاہیے۔', { tags: ['quiet', 'healing'] }),

        record('love-005', 'love', 'rose-mist-affection', 'تمہارا ساتھ ملا تو زندگی کے معنی بدل گئے۔', { tags: ['romantic'] }),
        record('love-006', 'love', 'blush-rose-lanterns', 'محبت شور نہیں مچاتی، وہ خاموشی سے دل میں بس جاتی ہے۔', { tags: ['romantic', 'quiet'] }),
        record('love-007', 'love', 'rose-mist-affection', 'تم جیسا اپنا مل جائے تو دنیا آسان لگنے لگتی ہے۔', { tags: ['romantic'] }),
        record('love-008', 'love', 'blush-rose-lanterns', 'میری ہر خوشی میں تمہاری موجودگی شامل ہے۔', { tags: ['romantic'] }),
        record('love-009', 'love', 'rose-mist-affection', 'محبت میں سب سے خوبصورت بات یہ ہے کہ کچھ کہے بغیر بھی سب کچھ سمجھ آجاتا ہے۔', { tags: ['romantic', 'quiet'] }),

        record('family-005', 'family', 'family-warm-interior', 'گھر وہ جگہ ہے جہاں دل کو سب سے زیادہ سکون ملتا ہے۔', { tags: ['parents', 'quiet'] }),
        record('family-006', 'family', 'window-light-tea', 'والدین کی دعا سے بڑی کوئی دولت نہیں ہوتی۔', { tags: ['parents'] }),
        record('family-007', 'family', 'family-warm-interior', 'بہن بھائیوں کا ساتھ زندگی کی سب سے بڑی نعمتوں میں سے ایک ہے۔', { tags: ['siblings'] }),
        record('family-008', 'family', 'window-light-tea', 'اپنوں کی موجودگی ہر مشکل کو ہلکا کر دیتی ہے۔', { tags: ['parents', 'healing'] }),
        record('family-009', 'family', 'family-warm-interior', 'ماں باپ کی خدمت سے بڑھ کر کوئی عبادت نہیں۔', { tags: ['mother', 'father'] }),

        record('friendship-005', 'friendship', 'friendship-bright-modern', 'سچا دوست وہی ہے جو مشکل وقت میں بھی ساتھ نہ چھوڑے۔', { tags: ['friend'] }),
        record('friendship-006', 'friendship', 'vintage-floral', 'دوستی میں نہ شرط ہوتی ہے نہ حساب، بس اعتماد ہوتا ہے۔', { tags: ['friend'] }),
        record('friendship-007', 'friendship', 'friendship-bright-modern', 'اچھے دوست زندگی کے سب سے قیمتی تحفوں میں سے ایک ہیں۔', { tags: ['friend'] }),
        record('friendship-008', 'friendship', 'vintage-floral', 'دوستی کی خوبصورتی یہ ہے کہ فاصلے بھی رشتہ کمزور نہیں کرتے۔', { tags: ['friend', 'quiet'] }),
        record('friendship-009', 'friendship', 'friendship-bright-modern', 'تمہاری دوستی نے زندگی کے کئی مشکل لمحے آسان بنا دیے۔', { tags: ['friend', 'healing'] }),

        record('self-respect-001', 'self-respect', 'self-respect-black-sand', 'خاموشی سے اپنا مقام بنائیں، شور مچانے کی ضرورت نہیں۔', { tags: ['courage', 'quiet'] }),
        record('self-respect-002', 'self-respect', 'black-gold-classic', 'عزتِ نفس پر کبھی سمجھوتہ مت کریں۔', { tags: ['courage'] }),
        record('self-respect-003', 'self-respect', 'self-respect-black-sand', 'اپنی قدر خود پہچانیں، دنیا خود بخود پہچان لے گی۔', { tags: ['courage', 'success'] }),
        record('self-respect-004', 'self-respect', 'self-respect-black-sand', 'جو لوگ آپ کی قدر نہیں کرتے، ان کے لیے خود کو ثابت کرنا ضروری نہیں۔', { tags: ['courage'] })
    ];

    function getAllCards() {
        return cards.slice();
    }

    function getCardCategories() {
        return categories.slice();
    }

    function getCardById(id) {
        return cards.find(function (card) { return card.id === id; }) || null;
    }

    function filterCards(category) {
        return category === 'all' ? cards.slice() : cards.filter(function (card) {
            return card.category === category;
        });
    }

    function getFeaturedCandidates(context) {
        return cards.filter(function (card) {
            return card.status === 'approved' && card.featuredEligible === true && card.contexts.indexOf(context) >= 0;
        });
    }

    function validateCards(backgroundRegistry) {
        var errors = [];
        var ids = Object.create(null);
        var texts = Object.create(null);
        var categoryIds = categories.filter(function (category) { return category.id !== 'all'; }).map(function (category) { return category.id; });

        cards.forEach(function (card) {
            if (!card.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(card.id) || ids[card.id]) errors.push('invalid-or-duplicate-id:' + card.id);
            ids[card.id] = true;
            if (card.status !== 'approved') errors.push('non-approved-public-card:' + card.id);
            if (categoryIds.indexOf(card.category) < 0) errors.push('unknown-category:' + card.id);
            if (typeof card.textUr !== 'string' || !card.textUr.trim()) errors.push('missing-urdu-text:' + card.id);
            else {
                var normalizedText = card.textUr.replace(/\s+/g, ' ').trim();
                if (normalizedText.length > 600) errors.push('text-too-long:' + card.id);
                if (texts[normalizedText]) errors.push('duplicate-public-text:' + card.id);
                texts[normalizedText] = true;
            }
            if (!Array.isArray(card.contexts) || card.contexts.some(function (context) { return CONTEXTS.indexOf(context) < 0; })) errors.push('unknown-context:' + card.id);
            if (card.featuredEligible && !card.contexts.length) errors.push('featured-without-context:' + card.id);
            if (!card.source || SOURCE_TYPES.indexOf(card.source.type) < 0 || card.source.verified !== true) errors.push('unverified-source:' + card.id);
            if (!card.rights || RIGHTS_STATUSES.indexOf(card.rights.status) < 0) errors.push('blocked-or-unknown-rights:' + card.id);
            if (card.romanUrdu !== null && typeof card.romanUrdu !== 'string') errors.push('invalid-roman-urdu:' + card.id);
            if (card.englishMeaning !== null && typeof card.englishMeaning !== 'string') errors.push('invalid-english-meaning:' + card.id);
            if (!backgroundRegistry || typeof backgroundRegistry.getBackgroundById !== 'function' || !backgroundRegistry.getBackgroundById(card.backgroundId)) errors.push('unknown-background:' + card.id);
        });
        return errors;
    }

    return {
        CONTEXTS: CONTEXTS.slice(),
        SOURCE_TYPES: SOURCE_TYPES.slice(),
        RIGHTS_STATUSES: RIGHTS_STATUSES.slice(),
        cards: cards,
        categories: categories,
        getAllCards: getAllCards,
        getCardCategories: getCardCategories,
        getCardById: getCardById,
        filterCards: filterCards,
        getFeaturedCandidates: getFeaturedCandidates,
        validateCards: validateCards
    };
}));
