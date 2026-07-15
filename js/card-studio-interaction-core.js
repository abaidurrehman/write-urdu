(function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardStudioInteraction = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    function number(value, fallback) { value = Number(value); return Number.isFinite(value) ? value : fallback; }
    function getPreviewTransform(canvasSize, artboardRect) {
        var width = number(canvasSize.width, 1), height = number(canvasSize.height, 1);
        var scaleX = number(artboardRect.width, width) / width;
        var scaleY = number(artboardRect.height, height) / height;
        var scale = Math.min(scaleX, scaleY);
        return { scaleX: scale, scaleY: scale, offsetLeft: number(artboardRect.left, 0), offsetTop: number(artboardRect.top, 0) };
    }
    function clientPointToCardPoint(clientPoint, transform) {
        return { x: (number(clientPoint.x, 0) - transform.offsetLeft) / transform.scaleX, y: (number(clientPoint.y, 0) - transform.offsetTop) / transform.scaleY };
    }
    function cardPointToCssPoint(cardPoint, transform) {
        return { x: transform.offsetLeft + number(cardPoint.x, 0) * transform.scaleX, y: transform.offsetTop + number(cardPoint.y, 0) * transform.scaleY };
    }
    function cardRectToCssRect(rect, transform) {
        return { left: number(rect.x, 0) * transform.scaleX, top: number(rect.y, 0) * transform.scaleY, width: number(rect.width, 0) * transform.scaleX, height: number(rect.height, 0) * transform.scaleY };
    }
    function pointInExpandedRect(point, rect, padding) {
        padding = number(padding, 0);
        return point.x >= rect.x - padding && point.x <= rect.x + rect.width + padding && point.y >= rect.y - padding && point.y <= rect.y + rect.height + padding;
    }
    function clampRectToCard(rect, card, options) {
        options = options || {};
        var minVisible = Math.max(0, number(options.minVisible, 20));
        var minX = -rect.width + minVisible, maxX = card.width - minVisible;
        var minY = -rect.height + minVisible, maxY = card.height - minVisible;
        return { x: Math.max(minX, Math.min(maxX, rect.x)), y: Math.max(minY, Math.min(maxY, rect.y)), width: rect.width, height: rect.height };
    }
    function moveRect(startRect, delta, card, options) {
        return clampRectToCard({ x: startRect.x + number(delta.x, 0), y: startRect.y + number(delta.y, 0), width: startRect.width, height: startRect.height }, card, options);
    }
    function resizeRect(startRect, side, delta, limits) {
        limits = limits || {};
        var minWidth = number(limits.minWidth, 80), maxWidth = number(limits.maxWidth, Infinity);
        var next = { x: startRect.x, y: startRect.y, width: startRect.width, height: startRect.height };
        if (side === 'left') { next.x = startRect.x + delta.x; next.width = startRect.width - delta.x; }
        else { next.width = startRect.width + delta.x; }
        if (next.width < minWidth) { if (side === 'left') next.x = startRect.x + startRect.width - minWidth; next.width = minWidth; }
        if (next.width > maxWidth) { if (side === 'left') next.x = startRect.x + startRect.width - maxWidth; next.width = maxWidth; }
        return next;
    }
    function anchors(rect) { return { left: rect.x, center: rect.x + rect.width / 2, right: rect.x + rect.width, top: rect.y, middle: rect.y + rect.height / 2, bottom: rect.y + rect.height }; }
    function calculateSnap(rect, card, safe, threshold, disabled) {
        if (disabled) return { rect: rect, guides: [], snappedX: false, snappedY: false };
        threshold = number(threshold, 12);
        safe = safe || { left: 0, top: 0, right: card.width, bottom: card.height };
        var a = anchors(rect), targetsX = [{ value: card.width / 2, label: 'Centre' }, { value: safe.left, label: 'Safe area' }, { value: safe.right, label: 'Safe area' }], targetsY = [{ value: card.height / 2, label: 'Centre' }, { value: safe.top, label: 'Safe area' }, { value: safe.bottom, label: 'Safe area' }];
        var bestX = null, bestY = null;
        [['left', a.left], ['center', a.center], ['right', a.right]].forEach(function (entry) { targetsX.forEach(function (target) { var delta = target.value - entry[1]; if (Math.abs(delta) <= threshold && (!bestX || Math.abs(delta) < Math.abs(bestX.delta))) bestX = { delta: delta, anchor: entry[0], target: target }; }); });
        [['top', a.top], ['middle', a.middle], ['bottom', a.bottom]].forEach(function (entry) { targetsY.forEach(function (target) { var delta = target.value - entry[1]; if (Math.abs(delta) <= threshold && (!bestY || Math.abs(delta) < Math.abs(bestY.delta))) bestY = { delta: delta, anchor: entry[0], target: target }; }); });
        var result = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, guides = [];
        if (bestX) { result.x += bestX.delta; guides.push({ axis: 'x', value: bestX.target.value, label: bestX.target.label }); }
        if (bestY) { result.y += bestY.delta; guides.push({ axis: 'y', value: bestY.target.value, label: bestY.target.label }); }
        return { rect: clampRectToCard(result, card, { minVisible: 20 }), guides: guides, snappedX: Boolean(bestX), snappedY: Boolean(bestY) };
    }
    function logicalMovement(event, card) {
        var amount = event && event.shiftKey ? 20 : 2;
        var direction = { x: 0, y: 0 };
        if (event.key === 'ArrowLeft') direction.x = -amount;
        if (event.key === 'ArrowRight') direction.x = amount;
        if (event.key === 'ArrowUp') direction.y = -amount;
        if (event.key === 'ArrowDown') direction.y = amount;
        return moveRect({ x: 0, y: 0, width: 0, height: 0 }, direction, card, { minVisible: 0 });
    }
    return { getPreviewTransform: getPreviewTransform, clientPointToCardPoint: clientPointToCardPoint, cardPointToCssPoint: cardPointToCssPoint, cardRectToCssRect: cardRectToCssRect, pointInExpandedRect: pointInExpandedRect, clampRectToCard: clampRectToCard, moveRect: moveRect, resizeRect: resizeRect, calculateSnap: calculateSnap, logicalMovement: logicalMovement };
}));
