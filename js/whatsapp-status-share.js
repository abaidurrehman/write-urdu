(function (root) {
    'use strict';

    var document = root.document;
    var STATUS_WIDTH = 720;
    var STATUS_HEIGHT = 1280;
    var STATUS_RATIO = STATUS_WIDTH / STATUS_HEIGHT;
    var CARD_WIDTH = 720;
    var CARD_HEIGHT = 900;
    var CARD_RATIO = CARD_WIDTH / CARD_HEIGHT;
    var FONT_FAMILY = '"Noto Nastaliq Urdu", "Noto Naskh Arabic", serif';
    var WATERMARK = 'اپنا کارڈ بنائیں · write-urdu.com';

    function loadImage(src) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () { resolve(image); };
            image.onerror = function () { reject(new Error('background_unavailable')); };
            try { image.crossOrigin = 'anonymous'; } catch (error) {}
            image.src = src;
        });
    }

    function waitForFonts() {
        if (!document.fonts || typeof document.fonts.load !== 'function') return Promise.resolve();
        return Promise.all([
            document.fonts.load('600 56px ' + FONT_FAMILY),
            document.fonts.load('700 24px Arial')
        ]).catch(function () {});
    }

    function drawCover(ctx, image, width, height) {
        var imageRatio = image.naturalWidth / image.naturalHeight;
        var targetRatio = width / height;
        var sourceWidth = image.naturalWidth;
        var sourceHeight = image.naturalHeight;
        var sourceX = 0;
        var sourceY = 0;

        if (imageRatio > targetRatio) {
            sourceWidth = image.naturalHeight * targetRatio;
            sourceX = (image.naturalWidth - sourceWidth) / 2;
        } else if (imageRatio < targetRatio) {
            sourceHeight = image.naturalWidth / targetRatio;
            sourceY = (image.naturalHeight - sourceHeight) / 2;
        }

        ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
    }

    function fontSizeFor(text) {
        var length = String(text || '').trim().length;
        if (length > 170) return 40;
        if (length > 125) return 46;
        if (length > 85) return 52;
        if (length > 55) return 60;
        return 68;
    }

    function wrapParagraph(ctx, paragraph, maxWidth) {
        var words = String(paragraph || '').trim().split(/\s+/).filter(Boolean);
        if (!words.length) return [''];
        var lines = [];
        var line = words[0];
        for (var i = 1; i < words.length; i += 1) {
            var candidate = line + ' ' + words[i];
            if (ctx.measureText(candidate).width <= maxWidth) line = candidate;
            else {
                lines.push(line);
                line = words[i];
            }
        }
        lines.push(line);
        return lines;
    }

    function wrapText(ctx, text, maxWidth) {
        var paragraphs = String(text || '').replace(/\r/g, '').split('\n');
        var lines = [];
        paragraphs.forEach(function (paragraph, index) {
            lines = lines.concat(wrapParagraph(ctx, paragraph, maxWidth));
            if (index < paragraphs.length - 1) lines.push('');
        });
        return lines;
    }

    function fitText(ctx, text, maxWidth, maxHeight) {
        var size = fontSizeFor(text);
        var lineHeight;
        var lines;
        while (size >= 34) {
            ctx.font = '600 ' + size + 'px ' + FONT_FAMILY;
            lines = wrapText(ctx, text, maxWidth);
            lineHeight = Math.round(size * 1.72);
            if (lines.length * lineHeight <= maxHeight) break;
            size -= 2;
        }
        return { size: size, lineHeight: lineHeight, lines: lines };
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        var r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    function drawWatermark(ctx, width, height) {
        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 22px Arial, sans-serif';
        var textWidth = Math.min(width - 72, Math.ceil(ctx.measureText(WATERMARK).width) + 44);
        var badgeWidth = Math.max(330, textWidth);
        var badgeHeight = 48;
        var x = (width - badgeWidth) / 2;
        var y = height - 78;
        roundedRect(ctx, x, y, badgeWidth, badgeHeight, 24);
        ctx.fillStyle = 'rgba(6, 20, 14, .62)';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';
        ctx.fillText(WATERMARK, width / 2, y + badgeHeight / 2 + 1);
        ctx.restore();
    }

    function drawCardText(ctx, text, background, width, height) {
        var safeArea = background.safeArea || { top: 0.16, right: 0.12, bottom: 0.16, left: 0.12 };
        var left = Math.round(width * safeArea.left);
        var right = Math.round(width * (1 - safeArea.right));
        var top = Math.round(height * safeArea.top);
        var bottom = Math.round(height * (1 - safeArea.bottom));
        var maxWidth = Math.max(240, right - left);
        var maxHeight = Math.max(220, bottom - top - 64);
        var fitted = fitText(ctx, text, maxWidth, maxHeight);
        var align = background.preferredAlign || 'center';
        var x = width / 2;
        if (align === 'left') x = left;
        else if (align === 'right') x = right;

        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = align === 'left' ? 'left' : (align === 'right' ? 'right' : 'center');
        ctx.textBaseline = 'middle';
        ctx.font = '600 ' + fitted.size + 'px ' + FONT_FAMILY;
        ctx.fillStyle = background.textColor || '#fff7df';
        ctx.shadowColor = 'rgba(0, 0, 0, .26)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;

        var totalHeight = fitted.lines.length * fitted.lineHeight;
        var y = top + Math.max(0, (maxHeight - totalHeight) / 2) + fitted.lineHeight / 2;
        fitted.lines.forEach(function (line) {
            if (line) ctx.fillText(line, x, y, maxWidth);
            y += fitted.lineHeight;
        });
        ctx.restore();
    }

    function canvasToBlob(canvas) {
        return new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) {
                if (blob) resolve(blob);
                else reject(new Error('image_generation_failed'));
            }, 'image/png', 1);
        });
    }

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        root.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    }

    async function renderCard(card, background, width, height) {
        if (!card || !background || !background.src) throw new Error('missing_card_data');
        await waitForFonts();
        var image = await loadImage(background.src);
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        drawCover(ctx, image, width, height);
        if (Number(background.overlayOpacity) > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, Number(background.overlayOpacity) || 0));
            ctx.fillStyle = background.overlayColor || '#000000';
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
        drawCardText(ctx, card.textUr, background, width, height);
        drawWatermark(ctx, width, height);
        return canvas;
    }

    function renderStatus(card, background) {
        return renderCard(card, background, STATUS_WIDTH, STATUS_HEIGHT);
    }

    function renderImage(card, background) {
        return renderCard(card, background, CARD_WIDTH, CARD_HEIGHT);
    }

    function sharePayload(file) {
        return {
            files: [file],
            title: 'Urdu card · Write Urdu',
            text: 'Create your own Urdu card at write-urdu.com/urdu-cards'
        };
    }

    function canShareFile(file) {
        if (!root.navigator || typeof root.navigator.share !== 'function' || typeof root.File !== 'function') return false;
        if (typeof root.navigator.canShare !== 'function') return true;
        try { return root.navigator.canShare({ files: [file] }); }
        catch (error) { return false; }
    }

    async function shareRendered(card, background, options) {
        options = options || {};
        var width = options.width || CARD_WIDTH;
        var height = options.height || CARD_HEIGHT;
        var canvas = await renderCard(card, background, width, height);
        var blob = await canvasToBlob(canvas);
        var suffix = options.suffix || '';
        var filename = 'write-urdu-' + String(card.id || 'card').replace(/[^a-z0-9_-]+/gi, '-') + suffix + '.png';
        var file = typeof root.File === 'function' ? new File([blob], filename, { type: 'image/png' }) : null;

        if (file && canShareFile(file)) {
            try {
                await root.navigator.share(sharePayload(file));
                return { result: 'shared', filename: filename, width: width, height: height };
            } catch (error) {
                if (error && error.name === 'AbortError') return { result: 'cancelled', filename: filename, width: width, height: height };
            }
        }

        downloadBlob(blob, filename);
        return { result: 'downloaded', filename: filename, width: width, height: height };
    }

    function shareCard(card, background) {
        return shareRendered(card, background, {
            width: STATUS_WIDTH,
            height: STATUS_HEIGHT,
            suffix: '-whatsapp-status'
        });
    }

    function shareImage(card, background) {
        return shareRendered(card, background, {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            suffix: ''
        });
    }

    return root.WriteUrduWhatsAppStatusShare = {
        shareCard: shareCard,
        shareImage: shareImage,
        renderStatus: renderStatus,
        renderImage: renderImage,
        getDiagnostics: function () {
            return {
                width: STATUS_WIDTH,
                height: STATUS_HEIGHT,
                ratio: STATUS_RATIO,
                cardWidth: CARD_WIDTH,
                cardHeight: CARD_HEIGHT,
                cardRatio: CARD_RATIO,
                watermark: WATERMARK
            };
        }
    };
}(window));