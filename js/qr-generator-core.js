(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduQrCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var CONTENT_TYPES = [
        { id: 'url', label: 'Website URL' },
        { id: 'text', label: 'Text / Urdu Text' },
        { id: 'whatsapp', label: 'WhatsApp' },
        { id: 'wifi', label: 'Wi-Fi' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Phone call' },
        { id: 'sms', label: 'SMS' },
        { id: 'vcard', label: 'Contact card' },
        { id: 'location', label: 'Location' }
    ];
    var VALID_TYPES = CONTENT_TYPES.map(function (item) { return item.id; });
    var VALID_EC = ['L', 'M', 'Q', 'H'];
    var VALID_MARGINS = [0, 2, 4, 6];
    var VALID_SIZES = [512, 1024, 2048, 4096];

    function getUtf8ByteLength(value) {
        value = String(value == null ? '' : value);
        if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
        var encoded = unescape(encodeURIComponent(value));
        return encoded.length;
    }

    function result(payload, errors, warnings) {
        payload = payload || '';
        return {
            valid: !Object.keys(errors || {}).length,
            payload: payload,
            errors: errors || {},
            warnings: warnings || [],
            utf8Bytes: getUtf8ByteLength(payload)
        };
    }

    function normalizeUrl(value, addHttps) {
        var input = String(value == null ? '' : value).trim();
        if (!input) return { valid: false, value: '', error: 'Enter a complete website address, such as https://write-urdu.com.' };
        if (addHttps !== false && !/^[a-z][a-z\d+.-]*:/i.test(input)) input = 'https://' + input;
        try {
            var parsed = new URL(input);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('scheme');
            if (!parsed.hostname || /[\u0000-\u001f\u007f\s]/.test(input)) throw new Error('hostname');
            return { valid: true, value: parsed.toString().replace(/\/$/, parsed.pathname || parsed.search || parsed.hash ? '/' : '') };
        } catch (error) {
            return { valid: false, value: '', error: 'Enter a complete website address, such as https://write-urdu.com.' };
        }
    }

    function normalizePhone(value, whatsapp) {
        var input = String(value == null ? '' : value).trim();
        var plus = input.charAt(0) === '+';
        var digits = input.replace(/[\s().-]/g, '');
        if (whatsapp) {
            digits = digits.replace(/^\+/, '');
            if (!/^\d{7,15}$/.test(digits)) return { valid: false, value: '', error: 'Enter an international phone number with 7–15 digits.' };
            return { valid: true, value: digits };
        }
        if (!/^\+?\d{7,15}$/.test(digits) || (plus && digits.charAt(0) !== '+')) return { valid: false, value: '', error: 'Enter a valid phone number with 7–15 digits.' };
        return { valid: true, value: digits };
    }

    function escapeWifiValue(value) {
        return String(value == null ? '' : value).replace(/([\\;,:\"])/g, '\\$1');
    }

    function escapeVCardValue(value) {
        return String(value == null ? '' : value)
            .replace(/\\/g, '\\\\')
            .replace(/\r?\n/g, '\\n')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,');
    }

    function buildUrlPayload(fields) {
        var normalized = normalizeUrl(fields && fields.url, !fields || fields.addHttps !== false);
        return normalized.valid ? result(normalized.value) : result('', { url: normalized.error });
    }

    function buildTextPayload(fields) {
        var text = String(fields && fields.text == null ? '' : fields && fields.text).replace(/\r\n?/g, '\n');
        return text.trim() ? result(text) : result('', { text: 'Enter some text to encode.' });
    }

    function buildWhatsAppPayload(fields) {
        var phone = normalizePhone(fields && fields.phone, true);
        if (!phone.valid) return result('', { phone: phone.error });
        var message = String(fields && fields.message || '');
        var payload = 'https://wa.me/' + phone.value + (message ? '?text=' + encodeURIComponent(message) : '');
        return result(payload);
    }

    function buildWifiPayload(fields) {
        fields = fields || {};
        var ssid = String(fields.ssid || '');
        var security = fields.security === 'WEP' ? 'WEP' : fields.security === 'none' ? 'nopass' : 'WPA';
        var errors = {};
        if (!ssid.trim()) errors.ssid = 'Enter the Wi-Fi network name (SSID).';
        if (security !== 'nopass' && !String(fields.password || '')) errors.password = 'Enter the Wi-Fi password or choose an open network.';
        var payload = errors.ssid || errors.password ? '' : 'WIFI:T:' + security + ';S:' + escapeWifiValue(ssid) + ';P:' + escapeWifiValue(fields.password || '') + ';H:' + (fields.hidden ? 'true' : 'false') + ';;';
        return result(payload, errors, ['Anyone who scans this QR code may be able to connect to the network.']);
    }

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
    }

    function buildEmailPayload(fields) {
        fields = fields || {};
        var email = String(fields.email || '').trim();
        if (!isEmail(email)) return result('', { email: 'Enter a valid email address.' });
        var query = [];
        if (fields.subject) query.push('subject=' + encodeURIComponent(fields.subject));
        if (fields.message) query.push('body=' + encodeURIComponent(fields.message));
        return result('mailto:' + email + (query.length ? '?' + query.join('&') : ''));
    }

    function buildPhonePayload(fields) {
        var phone = normalizePhone(fields && fields.phone, false);
        return phone.valid ? result('tel:' + phone.value) : result('', { phone: phone.error });
    }

    function buildSmsPayload(fields) {
        var phone = normalizePhone(fields && fields.phone, false);
        if (!phone.valid) return result('', { phone: phone.error });
        var message = String(fields && fields.message || '');
        return result('sms:' + phone.value + (message ? '?body=' + encodeURIComponent(message) : ''));
    }

    function buildVCardPayload(fields) {
        fields = fields || {};
        var fullName = String(fields.fullName || '').trim();
        if (!fullName) return result('', { fullName: 'Enter a full name for this contact.' }, ['A contact QR code may contain personal information.']);
        var lines = [
            'BEGIN:VCARD', 'VERSION:3.0', 'N:;' + escapeVCardValue(fullName) + ';;;', 'FN:' + escapeVCardValue(fullName)
        ];
        [['ORG', 'organization'], ['TITLE', 'title'], ['TEL;TYPE=CELL', 'mobile'], ['TEL;TYPE=WORK', 'workPhone'], ['EMAIL', 'email'], ['URL', 'website']].forEach(function (pair) {
            if (fields[pair[1]]) lines.push(pair[0] + ':' + escapeVCardValue(fields[pair[1]]));
        });
        var address = [fields.street, fields.city, fields.region, fields.postalCode, fields.country].map(function (item) { return escapeVCardValue(item || ''); });
        if (address.some(Boolean)) lines.push('ADR;TYPE=WORK:;;' + address.join(';'));
        if (fields.note) lines.push('NOTE:' + escapeVCardValue(fields.note));
        lines.push('END:VCARD');
        return result(lines.join('\r\n') + '\r\n', {}, ['A contact QR code may contain personal information. Share it only with people you trust.']);
    }

    function buildLocationPayload(fields) {
        fields = fields || {};
        var latitude = Number(fields.latitude);
        var longitude = Number(fields.longitude);
        var errors = {};
        if (!String(fields.latitude == null ? '' : fields.latitude).trim() || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'Enter a latitude between −90 and 90.';
        if (!String(fields.longitude == null ? '' : fields.longitude).trim() || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'Enter a longitude between −180 and 180.';
        return Object.keys(errors).length ? result('', errors) : result('geo:' + latitude + ',' + longitude);
    }

    var BUILDERS = {
        url: buildUrlPayload, text: buildTextPayload, whatsapp: buildWhatsAppPayload, wifi: buildWifiPayload,
        email: buildEmailPayload, phone: buildPhonePayload, sms: buildSmsPayload, vcard: buildVCardPayload, location: buildLocationPayload
    };

    function buildQrPayload(content) {
        content = content || { type: 'url', fields: {} };
        var builder = BUILDERS[content.type] || BUILDERS.url;
        return builder(content.fields || {});
    }

    function normalizeHexColor(value, fallback) {
        var color = String(value || '').trim();
        if (/^#[0-9a-f]{3}$/i.test(color)) color = '#' + color.slice(1).split('').map(function (char) { return char + char; }).join('');
        return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
    }

    function hexToRgb(color) {
        var value = normalizeHexColor(color, '#000000').slice(1);
        return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
    }

    function relativeLuminance(color) {
        var rgb = hexToRgb(color);
        return [rgb.r, rgb.g, rgb.b].map(function (channel) {
            channel /= 255;
            return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
        }).reduce(function (sum, channel, index) { return sum + channel * [0.2126, 0.7152, 0.0722][index]; }, 0);
    }

    function contrastRatio(foreground, background) {
        var a = relativeLuminance(foreground);
        var b = relativeLuminance(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    function evaluateContrast(foreground, background) {
        var ratio = contrastRatio(foreground, background);
        return { ratio: ratio, level: ratio < 3 ? 'high-risk' : ratio < 4.5 ? 'caution' : 'good', valid: ratio >= 3 };
    }

    function defaultFields(type, incoming) {
        if (type === 'text') return { text: incoming || '' };
        if (type === 'url') return { url: 'https://write-urdu.com/', addHttps: true };
        return {};
    }

    function createDefaultQrProject(incoming) {
        var text = typeof incoming === 'string' ? incoming : incoming && incoming.text;
        var type = text ? 'text' : 'url';
        var now = new Date().toISOString();
        return {
            version: 1, id: 'qr_' + Date.now().toString(36), name: 'Write Urdu QR code', createdAt: now, updatedAt: now,
            content: { type: type, fields: defaultFields(type, text) },
            design: { foregroundColor: '#111827', backgroundColor: '#ffffff', margin: 4, errorCorrectionLevel: 'Q' },
            logo: { enabled: false, assetId: null, sizeRatio: 0.18, plateShape: 'rounded-square', plateColor: '#ffffff', dataUrl: null },
            export: { pngSize: 1024 }
        };
    }

    function normalizeQrProject(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var defaults = createDefaultQrProject();
        var content = source.content || {};
        var type = VALID_TYPES.indexOf(content.type) >= 0 ? content.type : defaults.content.type;
        var design = source.design || {};
        var logo = source.logo || {};
        var exportState = source.export || {};
        var correction = VALID_EC.indexOf(design.errorCorrectionLevel) >= 0 ? design.errorCorrectionLevel : defaults.design.errorCorrectionLevel;
        var logoEnabled = Boolean(logo.enabled && (logo.dataUrl || logo.assetId));
        if (logoEnabled) correction = 'H';
        return {
            version: 1, id: String(source.id || defaults.id), name: String(source.name || defaults.name).slice(0, 80),
            createdAt: source.createdAt || defaults.createdAt, updatedAt: new Date().toISOString(),
            content: { type: type, fields: Object.assign({}, defaultFields(type), content.fields || {}) },
            design: {
                foregroundColor: normalizeHexColor(design.foregroundColor, defaults.design.foregroundColor),
                backgroundColor: normalizeHexColor(design.backgroundColor, defaults.design.backgroundColor),
                margin: VALID_MARGINS.indexOf(Number(design.margin)) >= 0 ? Number(design.margin) : defaults.design.margin,
                errorCorrectionLevel: correction
            },
            logo: {
                enabled: logoEnabled, assetId: logo.assetId || null, dataUrl: logo.dataUrl || null,
                sizeRatio: Math.min(0.24, Math.max(0.1, Number(logo.sizeRatio) || defaults.logo.sizeRatio)),
                plateShape: logo.plateShape === 'circle' ? 'circle' : 'rounded-square', plateColor: normalizeHexColor(logo.plateColor, '#ffffff')
            },
            export: { pngSize: VALID_SIZES.indexOf(Number(exportState.pngSize)) >= 0 ? Number(exportState.pngSize) : defaults.export.pngSize }
        };
    }

    function calculateLogoPlacement(qrSize, imageSize, settings) {
        var ratio = Math.min(0.24, Math.max(0.1, Number(settings && settings.sizeRatio) || 0.18));
        var box = qrSize * ratio;
        var width = Number(imageSize && imageSize.width) || 1;
        var height = Number(imageSize && imageSize.height) || 1;
        var scale = Math.min(box / width, box / height);
        var drawnWidth = width * scale;
        var drawnHeight = height * scale;
        return { boxSize: box, x: (qrSize - box) / 2, y: (qrSize - box) / 2, imageX: (qrSize - drawnWidth) / 2, imageY: (qrSize - drawnHeight) / 2, imageWidth: drawnWidth, imageHeight: drawnHeight };
    }

    function safeFilename(title, fallback) {
        var value = String(title || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
        return (value || fallback || 'write-urdu-qr-code').replace(/\.+$/, '');
    }

    function validateQrProject(project) {
        project = normalizeQrProject(project);
        var payloadResult = buildQrPayload(project.content);
        var contrast = evaluateContrast(project.design.foregroundColor, project.design.backgroundColor);
        var warnings = payloadResult.warnings.slice();
        if (project.design.margin < 4) warnings.push('A clear margin of 4 modules is recommended for reliable scanning.');
        if (contrast.level !== 'good') warnings.push('These colors may be difficult for some cameras to scan.');
        if (project.logo.enabled) {
            if (project.design.errorCorrectionLevel !== 'H') warnings.push('A center logo works best with high error correction.');
            if (project.logo.sizeRatio > 0.2) warnings.push('A large logo can make the QR code harder to scan.');
        }
        return { valid: payloadResult.valid && contrast.valid && (!project.logo.enabled || Boolean(project.logo.dataUrl || project.logo.assetId)), payload: payloadResult, contrast: contrast, warnings: warnings };
    }

    return {
        CONTENT_TYPES: CONTENT_TYPES, VALID_EC: VALID_EC, VALID_MARGINS: VALID_MARGINS, VALID_SIZES: VALID_SIZES,
        getUtf8ByteLength: getUtf8ByteLength, normalizeUrl: normalizeUrl, normalizePhone: normalizePhone,
        escapeWifiValue: escapeWifiValue, escapeVCardValue: escapeVCardValue, buildUrlPayload: buildUrlPayload,
        buildTextPayload: buildTextPayload, buildWhatsAppPayload: buildWhatsAppPayload, buildWifiPayload: buildWifiPayload,
        buildEmailPayload: buildEmailPayload, buildPhonePayload: buildPhonePayload, buildSmsPayload: buildSmsPayload,
        buildVCardPayload: buildVCardPayload, buildLocationPayload: buildLocationPayload, buildQrPayload: buildQrPayload,
        normalizeHexColor: normalizeHexColor, contrastRatio: contrastRatio, evaluateContrast: evaluateContrast,
        createDefaultQrProject: createDefaultQrProject, normalizeQrProject: normalizeQrProject, validateQrProject: validateQrProject,
        calculateLogoPlacement: calculateLogoPlacement, safeFilename: safeFilename
    };
}));
