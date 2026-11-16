(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCuratedCardShare = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CANONICAL_ORIGIN = 'https://write-urdu.com';
    var CARD_TIER_FONT_SIZE = { short: 84, medium: 62, long: 44 };

    function cardUrl(card, options) {
        options = options || {};
        return CANONICAL_ORIGIN + (options.route || '/urdu-cards') + '#card-' + card.id;
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

    // --- Public links (WU-UXR-002 Slice F, CARD-UX-012) -------------------------------------------
    // A ready-made card becomes public only after the shared one-time consent, the link is remembered so
    // it can be deleted, and sharing the same words again reuses the link instead of making another page.
    var CORE_SRC = '/js/share-publish-core.js';
    var LINK_CACHE_KEY = 'writeUrdu.curatedShareLinks.v1';
    var LINK_CACHE_LIMIT = 100;
    var corePromise = null;

    function loadCore() {
        if (root && root.WriteUrduSharePublishCore) return Promise.resolve(root.WriteUrduSharePublishCore);
        var document = documentRef();
        if (!document || !document.head) return Promise.reject(new Error('core_unavailable'));
        if (corePromise) return corePromise;
        corePromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = CORE_SRC;
            script.async = true;
            script.setAttribute('data-wu-share-publish-core', '');
            script.onload = function () { root.WriteUrduSharePublishCore ? resolve(root.WriteUrduSharePublishCore) : reject(new Error('core_unavailable')); };
            script.onerror = function () { corePromise = null; reject(new Error('core_unavailable')); };
            document.head.appendChild(script);
        });
        return corePromise;
    }

    // FNV-1a: the cache keys a link by card and a hash of its words, so the words never sit in storage.
    function textHash(value) {
        var hash = 0x811c9dc5;
        var text = String(value || '');
        for (var i = 0; i < text.length; i += 1) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
        return hash.toString(16);
    }
    function linkKey(card) { return String(card.id) + ':' + textHash(card.textUr); }
    function readLinkCache() {
        try {
            var parsed = JSON.parse(root.localStorage.getItem(LINK_CACHE_KEY) || 'null');
            return parsed && parsed.items && typeof parsed.items === 'object' ? parsed : { items: {} };
        } catch (error) { return { items: {} }; }
    }
    function writeLinkCache(cache) {
        var keys = Object.keys(cache.items).sort(function (a, b) { return (cache.items[b].at || 0) - (cache.items[a].at || 0); });
        keys.slice(LINK_CACHE_LIMIT).forEach(function (key) { delete cache.items[key]; });
        try { root.localStorage.setItem(LINK_CACHE_KEY, JSON.stringify(cache)); } catch (error) {}
    }
    function rememberLink(card, result) {
        var cache = readLinkCache();
        cache.items[linkKey(card)] = { id: result.id, url: result.url, at: Date.now() };
        writeLinkCache(cache);
    }
    function forgetLink(key) {
        var cache = readLinkCache();
        delete cache.items[key];
        writeLinkCache(cache);
    }

    // Reuse a link only while this browser still manages it and its page still answers.
    function reusableLink(card, core) {
        var key = linkKey(card);
        var entry = readLinkCache().items[key];
        if (!entry || !entry.id || !entry.url) return Promise.resolve(null);
        if (!core.isManaged(entry.id) || typeof root.fetch !== 'function') { forgetLink(key); return Promise.resolve(null); }
        return root.fetch('/s/' + encodeURIComponent(entry.id), { method: 'HEAD', credentials: 'same-origin', cache: 'no-store' }).then(function (response) {
            if (response.ok) return entry.url;
            forgetLink(key);
            if (response.status === 404 || response.status === 410) core.forgetShare(entry.id);
            return null;
        }, function () { return null; });
    }

    // Ready-made cards are original Write Urdu copy: send a credit only when the card names a real source.
    function cardAttribution(card) {
        var source = card && card.source;
        if (!source || source.type === 'original') return '';
        return String(source.attribution || '').trim();
    }

    function publishCardShare(card, background) {
        if (!root || typeof root.fetch !== 'function' || typeof root.FormData !== 'function') return Promise.reject(new Error('publish_unavailable'));
        return Promise.all([loadCore(), buildCardShareImage(card, background)]).then(function (parts) {
            var form = new root.FormData();
            form.set('source_tool', 'card_studio');
            form.set('public_text', card.textUr);
            form.set('preset', 'ready_made_card');
            var attribution = cardAttribution(card);
            if (attribution) form.set('attribution', attribution);
            form.set('image', parts[1], 'write-urdu-card.png');
            return parts[0].publish(form);
        }).then(function (result) {
            rememberLink(card, result);
            return result.url;
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

    function deliver(url, published, options) {
        var navigator = root && root.navigator;
        if (navigator && typeof navigator.share === 'function') {
            return navigator.share({ title: options.title || 'Write Urdu Card', url: url }).then(function () {
                return { result: 'native_invoked', url: url, published: published };
            }, function () {
                return copyLink(url).then(function (result) { result.published = published; return result; });
            });
        }
        return copyLink(url).then(function (result) { result.published = published; return result; });
    }

    function shareCard(card, background, options) {
        options = options || {};
        var onStatus = typeof options.onStatus === 'function' ? options.onStatus : function () {};
        return loadCore().then(function (core) {
            return core.requestConsent().then(function (agreed) {
                if (!agreed) return { result: 'cancelled', url: null, published: false };
                onStatus('creating');
                return reusableLink(card, core).then(function (url) {
                    if (url) return deliver(url, true, options).then(function (result) { result.reused = true; return result; });
                    return publishCardShare(card, background).then(function (published) {
                        return deliver(published, true, options);
                    }, function () {
                        return deliver(cardUrl(card, options), false, options);
                    });
                });
            });
        }, function () {
            // Without the consent dialog nothing is published: share the card's own page instead.
            onStatus('creating');
            return deliver(cardUrl(card, options), false, options);
        }).then(function (result) {
            onStatus(result.result, result);
            return result;
        });
    }

    function manageLinks(options) {
        return loadCore().then(function (core) { return core.manageDialog(options); });
    }

    return {
        CANONICAL_ORIGIN: CANONICAL_ORIGIN,
        cardUrl: cardUrl,
        buildCardShareImage: buildCardShareImage,
        publishCardShare: publishCardShare,
        copyLink: copyLink,
        shareCard: shareCard,
        manageLinks: manageLinks,
        loadCore: loadCore
    };
}));
