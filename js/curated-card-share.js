(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCuratedCardShare = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CANONICAL_ORIGIN = 'https://write-urdu.com';
    var CARD_TIER_FONT_SIZE = { short: 84, medium: 62, long: 44 };

    function cardUrl(card) {
        return CANONICAL_ORIGIN + '/urdu-cards#card-' + card.id;
    }

    function documentRef() {
        return root && root.document;
    }

    function coreRef() {
        return root && root.WriteUrduCardGalleryCore;
    }

    function ensureFontsReady() {
        var document = documentRef();
        return (document && document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function () {}) : Promise.resolve();
    }

    function loadCardImage(src) {
        return new Promise(function (resolve, reject) {
            if (!root || typeof root.Image !== 'function') { reject(new Error('image_unavailable')); return; }
            var image = new root.Image();
            image.onload = function () { resolve(image); };
            image.onerror = function () { reject(new Error('image_load_failed')); };
            image.src = src;
        });
    }

    function coverFit(imageWidth, imageHeight, canvasWidth, canvasHeight) {
        var scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
        var width = imageWidth * scale;
        var height = imageHeight * scale;
        return { x: (canvasWidth - width) / 2, y: (canvasHeight - height) / 2, width: width, height: height };
    }

    function wrapCardText(context, value, maxWidth) {
        var lines = [];
        String(value || '').split(/\n+/).forEach(function (paragraph) {
            var words = paragraph.trim().split(/\s+/).filter(Boolean);
            var line = '';
            words.forEach(function (word) {
                var candidate = line ? line + ' ' + word : word;
                if (line && context.measureText(candidate).width > maxWidth) {
                    lines.push(line);
                    line = word;
                } else {
                    line = candidate;
                }
            });
            if (line) lines.push(line);
        });
        return lines;
    }

    function buildCardShareImage(card, background) {
        var document = documentRef();
        var core = coreRef();
        if (!document || !core || !card || !background) return Promise.reject(new Error('share_dependencies_missing'));
        return ensureFontsReady().then(function () {
            return loadCardImage(background.src);
        }).then(function (image) {
            var width = 1080;
            var height = 1350;
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var context = canvas.getContext('2d');
            if (!context) throw new Error('canvas_unavailable');
            var placement = coverFit(image.naturalWidth || image.width, image.naturalHeight || image.height, width, height);
            context.drawImage(image, placement.x, placement.y, placement.width, placement.height);

            if (background.overlayOpacity) {
                context.save();
                context.globalAlpha = background.overlayOpacity;
                context.fillStyle = background.overlayColor;
                context.fillRect(0, 0, width, height);
                context.restore();
            }

            var safeArea = core.normalizeSafeArea(background.safeArea) || { top: 0.16, right: 0.12, bottom: 0.16, left: 0.12 };
            var box = {
                x: safeArea.left * width,
                y: safeArea.top * height,
                width: width - (safeArea.left + safeArea.right) * width,
                height: height - (safeArea.top + safeArea.bottom) * height
            };
            var fontSize = CARD_TIER_FONT_SIZE[core.previewTextTier(card.textUr)] || CARD_TIER_FONT_SIZE.medium;
            context.direction = 'rtl';
            context.textBaseline = 'middle';
            context.font = '600 ' + fontSize + 'px "Noto Nastaliq Urdu", "Noto Naskh Arabic", serif';
            var lines = wrapCardText(context, card.textUr, box.width);
            var lineHeight = Math.round(fontSize * 1.65);
            var totalHeight = lines.length * lineHeight;
            var startY = box.y + box.height / 2 - totalHeight / 2 + lineHeight / 2;
            var align = background.preferredAlign === 'start' ? 'right' : background.preferredAlign === 'end' ? 'left' : 'center';
            var x = align === 'left' ? box.x : align === 'right' ? box.x + box.width : box.x + box.width / 2;
            context.textAlign = align;
            context.fillStyle = background.textColor || '#ffffff';
            context.shadowColor = 'rgba(0,0,0,.32)';
            context.shadowBlur = 10;
            context.shadowOffsetY = 2;
            lines.forEach(function (line, index) {
                context.fillText(line, x, startY + index * lineHeight, box.width);
            });
            context.shadowColor = 'transparent';
            context.direction = 'ltr';
            context.textAlign = 'center';
            context.textBaseline = 'alphabetic';
            context.font = '600 22px "Segoe UI", Arial, sans-serif';
            context.fillStyle = background.textColor || '#ffffff';
            context.globalAlpha = 0.85;
            context.fillText('Write-Urdu.com', width / 2, height - 40);
            context.globalAlpha = 1;

            return new Promise(function (resolve, reject) {
                canvas.toBlob(function (blob) {
                    blob ? resolve(blob) : reject(new Error('share_preview_failed'));
                }, 'image/png');
            });
        });
    }

    function publishCardShare(card, background) {
        if (!root || typeof root.fetch !== 'function' || typeof root.FormData !== 'function') return Promise.reject(new Error('publish_unavailable'));
        return buildCardShareImage(card, background).then(function (blob) {
            var form = new root.FormData();
            form.set('source_tool', 'card_studio');
            form.set('public_text', card.textUr);
            form.set('preset', 'ready_made_card');
            form.set('attribution', background.name + ' · Write Urdu Card');
            form.set('image', blob, 'write-urdu-card.png');
            return root.fetch('/api/shares', { method: 'POST', body: form, credentials: 'same-origin', cache: 'no-store' });
        }).then(function (response) {
            return response.json().catch(function () { return null; }).then(function (payload) {
                if (!response.ok || !payload || !payload.ok || !payload.url) throw new Error('publish_failed');
                return payload.url;
            });
        });
    }

    function copyLink(url) {
        var clipboard = root && root.navigator && root.navigator.clipboard;
        if (!clipboard || typeof clipboard.writeText !== 'function') return Promise.resolve({ result: 'fallback', url: url });
        return clipboard.writeText(url).then(function () {
            return { result: 'link_copied', url: url };
        }, function () {
            return { result: 'fallback', url: url };
        });
    }

    function shareCard(card, background, options) {
        options = options || {};
        var onStatus = typeof options.onStatus === 'function' ? options.onStatus : function () {};
        onStatus('creating');
        var published = true;
        return publishCardShare(card, background).catch(function () {
            published = false;
            return cardUrl(card);
        }).then(function (url) {
            var navigator = root && root.navigator;
            if (navigator && typeof navigator.share === 'function') {
                return navigator.share({ title: options.title || 'Write Urdu Card', url: url }).then(function () {
                    return { result: 'native_invoked', url: url, published: published };
                }, function () {
                    return copyLink(url).then(function (result) { result.published = published; return result; });
                });
            }
            return copyLink(url).then(function (result) { result.published = published; return result; });
        }).then(function (result) {
            onStatus(result.result, result);
            return result;
        });
    }

    return {
        CANONICAL_ORIGIN: CANONICAL_ORIGIN,
        cardUrl: cardUrl,
        buildCardShareImage: buildCardShareImage,
        publishCardShare: publishCardShare,
        copyLink: copyLink,
        shareCard: shareCard
    };
}));
