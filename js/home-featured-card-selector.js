(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduHomeFeaturedCardSelector = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var CONTEXTS = ['morning', 'daytime', 'evening', 'night', 'friday'];
    var PUBLIC_RIGHTS = ['original', 'public-domain-verified', 'licensed', 'permission-granted', 'rights-not-applicable'];

    function validDate(date) {
        return date instanceof Date && Number.isFinite(date.getTime());
    }

    function contextForDate(date) {
        if (!validDate(date)) return null;
        if (date.getDay() === 5) return 'friday';
        var hour = date.getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'daytime';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    function editoriallySafe(card) {
        return Boolean(card && card.status === 'approved' && card.featuredEligible === true &&
            card.source && card.source.verified === true &&
            card.rights && PUBLIC_RIGHTS.indexOf(card.rights.status) >= 0 &&
            typeof card.textUr === 'string' && card.textUr.trim());
    }

    function featuredCandidates(cards, context, backgroundRegistry) {
        if (!Array.isArray(cards) || CONTEXTS.indexOf(context) < 0 || !backgroundRegistry || typeof backgroundRegistry.getBackgroundById !== 'function') return [];
        return cards.filter(function (card) {
            return editoriallySafe(card) && Array.isArray(card.contexts) && card.contexts.indexOf(context) >= 0 && backgroundRegistry.getBackgroundById(card.backgroundId);
        }).slice().sort(function (left, right) {
            return (Number(right.schedulePriority) || 0) - (Number(left.schedulePriority) || 0) || left.id.localeCompare(right.id);
        });
    }

    function localDateKey(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    function stableHash(value) {
        var hash = 2166136261;
        for (var index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function selectFeaturedCard(cards, date, backgroundRegistry) {
        var context = contextForDate(date);
        if (!context) return null;
        var candidates = featuredCandidates(cards, context, backgroundRegistry);
        if (!candidates.length) return null;
        return candidates[stableHash(localDateKey(date) + ':' + context) % candidates.length];
    }

    return {
        CONTEXTS: CONTEXTS.slice(),
        contextForDate: contextForDate,
        featuredCandidates: featuredCandidates,
        localDateKey: localDateKey,
        stableHash: stableHash,
        selectFeaturedCard: selectFeaturedCard
    };
}));
