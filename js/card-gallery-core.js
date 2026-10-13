(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardGalleryCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var TEXT_CAPACITIES = ['short', 'medium', 'long'];
    var MAX_PREVIEW_TEXT_LENGTH = 600;

    function preserveText(value) {
        return String(value == null ? '' : value).replace(/\r\n?/g, '\n').slice(0, MAX_PREVIEW_TEXT_LENGTH);
    }

    function normalizeText(value) {
        return String(value == null ? '' : value)
            .replace(/\r\n?/g, '\n')
            .replace(/[\t\f\v]+/g, ' ')
            .trim();
    }

    function classifyText(value) {
        var normalized = normalizeText(value);
        if (!normalized) return 'empty';
        var lineCount = normalized.split('\n').length;
        if (normalized.length <= 80 && lineCount <= 2) return 'short';
        if (normalized.length <= 220 && lineCount <= 4) return 'medium';
        return 'long';
    }

    function isTextWithinPreviewLimit(value) {
        return normalizeText(value).length <= MAX_PREVIEW_TEXT_LENGTH;
    }

    function normalizeSafeArea(safeArea) {
        if (!safeArea || typeof safeArea !== 'object') return null;
        var normalized = {};
        var keys = ['top', 'right', 'bottom', 'left'];
        for (var index = 0; index < keys.length; index += 1) {
            var key = keys[index];
            var value = Number(safeArea[key]);
            if (!Number.isFinite(value) || value < 0 || value > 1) return null;
            normalized[key] = value;
        }
        if (normalized.top + normalized.bottom >= 1 || normalized.left + normalized.right >= 1) return null;
        return normalized;
    }

    function safeAreaStyle(safeArea) {
        var normalized = normalizeSafeArea(safeArea);
        if (!normalized) return null;
        return {
            top: (normalized.top * 100) + '%',
            right: (normalized.right * 100) + '%',
            bottom: (normalized.bottom * 100) + '%',
            left: (normalized.left * 100) + '%'
        };
    }

    function isSuitable(textBucket, textCapacity) {
        if (textBucket === 'empty') return true;
        var needed = TEXT_CAPACITIES.indexOf(textBucket);
        var available = TEXT_CAPACITIES.indexOf(textCapacity);
        return needed >= 0 && available >= needed;
    }

    function previewTextTier(value) {
        var bucket = classifyText(value);
        if (bucket === 'empty' || bucket === 'short') return 'short';
        return bucket;
    }

    // Shrink a preview's text until it fits its safe area, instead of letting the tile clip
    // it silently. Starts from the stylesheet size, steps down by 10% and stops at minPx.
    // Returns { fits, fontSize }; callers show a "shorter text" hint when it cannot fit.
    function fitPreviewText(text, box, options) {
        var minPx = (options && options.minPx) || 9;
        text.style.fontSize = '';
        var view = text.ownerDocument && text.ownerDocument.defaultView;
        var size = view ? parseFloat(view.getComputedStyle(text).fontSize) : NaN;
        if (!Number.isFinite(size) || !box.clientHeight) return { fits: true, fontSize: size };
        function overflows() {
            return text.scrollHeight > box.clientHeight + 1 || text.scrollWidth > box.clientWidth + 1;
        }
        var steps = 0;
        while (overflows() && size > minPx && steps < 10) {
            size = Math.max(minPx, size * 0.9);
            text.style.fontSize = size.toFixed(2) + 'px';
            steps += 1;
        }
        return { fits: !overflows(), fontSize: size };
    }

    return {
        fitPreviewText: fitPreviewText,
        TEXT_CAPACITIES: TEXT_CAPACITIES,
        MAX_PREVIEW_TEXT_LENGTH: MAX_PREVIEW_TEXT_LENGTH,
        preserveText: preserveText,
        normalizeText: normalizeText,
        classifyText: classifyText,
        isTextWithinPreviewLimit: isTextWithinPreviewLimit,
        normalizeSafeArea: normalizeSafeArea,
        safeAreaStyle: safeAreaStyle,
        isSuitable: isSuitable,
        previewTextTier: previewTextTier
    };
}));
