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
        { id: 'everyday-greeting', name: 'Everyday Greeting', nameUr: 'روزمرہ سلام' }
    ];

    function record(id, category, backgroundId, textUr) {
        return { id: id, category: category, backgroundId: backgroundId, textUr: textUr };
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
        record('greeting-4', 'everyday-greeting', 'pastel-glass', 'جمعہ مبارک، اللہ آپ کی دعائیں قبول فرمائے۔')
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

    return {
        cards: cards,
        categories: categories,
        getAllCards: getAllCards,
        getCardCategories: getCardCategories,
        getCardById: getCardById,
        filterCards: filterCards
    };
}));
