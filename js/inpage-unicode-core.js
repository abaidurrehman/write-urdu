(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduInPageCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var PREFIX = '\u0004';
    var PROFILE = 'inpage-v1v2-clipboard-2026-08-17';

    // InPage v1/v2 text commonly represents Urdu as 0x04 + an 8-bit character index.
    // The map below is an independently expressed interoperability table cross-checked
    // against published/reverse-engineered InPage mapping documentation. Unknown bytes
    // are deliberately preserved rather than guessed.
    var BYTE_TO_UNICODE = {
        0x81:'ا',0x82:'ب',0x83:'پ',0x84:'ت',0x85:'ٹ',0x86:'ث',0x87:'ج',0x88:'چ',
        0x89:'ح',0x8A:'خ',0x8B:'د',0x8C:'ڈ',0x8D:'ذ',0x8E:'ر',0x8F:'ڑ',0x90:'ز',
        0x91:'ژ',0x92:'س',0x93:'ش',0x94:'ص',0x95:'ض',0x96:'ط',0x97:'ظ',0x98:'ع',
        0x99:'غ',0x9A:'ف',0x9B:'ق',0x9C:'ک',0x9D:'گ',0x9E:'ل',0x9F:'م',0xA0:'ن',
        0xA1:'ں',0xA2:'و',0xA3:'ء',0xA4:'ی',0xA5:'ے',0xA6:'ہ',0xA7:'ھ',0xB8:'ي',0xB9:'ۃ',
        0xA8:'ٍ',0xAA:'ِ',0xAB:'َ',0xAC:'ُ',0xAD:'ّ',0xAE:'ؑ',0xB0:'ٖ',0xB1:'ْ',0xB3:'ٓ',
        0xB5:'ٌ',0xBD:'ٰ',0xBE:'ٗ',0xBF:'ٔ',0xC1:'ٗ',0xC2:'ٔ',0xC3:'ٕ',0xC6:'ّ',
        0xC7:'ً',0xC9:'ٰ',0xCA:'ٖ',0xCC:'ؔ',0xCD:'،',0xCF:'ؔ',
        0xA9:'ـ',0xB4:'',
        0xD0:'۰',0xD1:'۱',0xD2:'۲',0xD3:'۳',0xD4:'۴',0xD5:'۵',0xD6:'۶',0xD7:'۷',0xD8:'۸',0xD9:'۹',
        0xDA:'!',0xDB:'﴾',0xDC:'﴿',0xDF:'/',0xE1:')',0xE2:'(',0xE4:'+',0xE6:'ؓ',0xE7:'ؒ',
        0xE8:'٭',0xE9:':',0xEA:'؛',0xEB:'×',0xEC:'=',0xED:'،',0xEE:'؟',0xEF:'÷',0xF1:'/',
        0xF2:'؎',0xF3:'۔',0xF5:'-',0xF6:'ﷺ',0xF7:'؁',0xF8:'ؐ',0xF9:',',0xFA:']',0xFB:'[',
        0xFC:'.',0xFD:'‘',0xFE:'’',0x20:' '
    };

    var COMPOSITES = {
        '81_BF':'أ',
        '81_B3':'آ',
        'A2_BF':'ؤ',
        'A4_BF':'یئ'
    };

    // Preferred reversible bytes for Unicode -> legacy output. Alternate duplicate
    // bytes intentionally decode but are not generated.
    var PREFERRED_BYTE = {
        'ا':0x81,'ب':0x82,'پ':0x83,'ت':0x84,'ٹ':0x85,'ث':0x86,'ج':0x87,'چ':0x88,
        'ح':0x89,'خ':0x8A,'د':0x8B,'ڈ':0x8C,'ذ':0x8D,'ر':0x8E,'ڑ':0x8F,'ز':0x90,
        'ژ':0x91,'س':0x92,'ش':0x93,'ص':0x94,'ض':0x95,'ط':0x96,'ظ':0x97,'ع':0x98,
        'غ':0x99,'ف':0x9A,'ق':0x9B,'ک':0x9C,'گ':0x9D,'ل':0x9E,'م':0x9F,'ن':0xA0,
        'ں':0xA1,'و':0xA2,'ء':0xA3,'ی':0xA4,'ے':0xA5,'ہ':0xA6,'ھ':0xA7,'ي':0xB8,'ۃ':0xB9,
        'ٍ':0xA8,'ِ':0xAA,'َ':0xAB,'ُ':0xAC,'ّ':0xAD,'ؑ':0xAE,'ٖ':0xB0,'ْ':0xB1,'ٓ':0xB3,
        'ٌ':0xB5,'ٰ':0xBD,'ٗ':0xBE,'ٔ':0xBF,'ٕ':0xC3,'ً':0xC7,'ؔ':0xCF,'ـ':0xA9,
        '۰':0xD0,'۱':0xD1,'۲':0xD2,'۳':0xD3,'۴':0xD4,'۵':0xD5,'۶':0xD6,'۷':0xD7,'۸':0xD8,'۹':0xD9,
        '!':0xDA,'﴾':0xDB,'﴿':0xDC,')':0xE1,'(':0xE2,'+':0xE4,'ؓ':0xE6,'ؒ':0xE7,
        '٭':0xE8,':':0xE9,'؛':0xEA,'×':0xEB,'=':0xEC,'،':0xED,'؟':0xEE,'÷':0xEF,
        '/':0xF1,'؎':0xF2,'۔':0xF3,'-':0xF5,'ﷺ':0xF6,'؁':0xF7,'ؐ':0xF8,',':0xF9,
        ']':0xFA,'[':0xFB,'.':0xFC,'‘':0xFD,'’':0xFE,' ':0x20
    };

    var UNICODE_TO_COMPOSITE = {
        'أ':[0x81,0xBF],
        'آ':[0x81,0xB3],
        'ؤ':[0xA2,0xBF],
        'یئ':[0xA4,0xBF]
    };

    var CP1252 = {
        0x80:'€',0x81:'\u0081',0x82:'‚',0x83:'ƒ',0x84:'„',0x85:'…',0x86:'†',0x87:'‡',
        0x88:'ˆ',0x89:'‰',0x8A:'Š',0x8B:'‹',0x8C:'Œ',0x8D:'\u008D',0x8E:'Ž',0x8F:'\u008F',
        0x90:'\u0090',0x91:'‘',0x92:'’',0x93:'“',0x94:'”',0x95:'•',0x96:'–',0x97:'—',
        0x98:'˜',0x99:'™',0x9A:'š',0x9B:'›',0x9C:'œ',0x9D:'\u009D',0x9E:'ž',0x9F:'Ÿ'
    };
    var CP1252_REVERSE = {};
    Object.keys(CP1252).forEach(function (key) { CP1252_REVERSE[CP1252[key]] = Number(key); });

    function byteToClipboardChar(byte) {
        if (Object.prototype.hasOwnProperty.call(CP1252, byte)) return CP1252[byte];
        return String.fromCharCode(byte);
    }

    function clipboardCharToByte(ch) {
        if (!ch) return null;
        if (Object.prototype.hasOwnProperty.call(CP1252_REVERSE, ch)) return CP1252_REVERSE[ch];
        var code = ch.charCodeAt(0);
        return code >= 0 && code <= 255 ? code : null;
    }

    function legacyPair(byte) {
        return PREFIX + byteToClipboardChar(byte);
    }

    function legacyComposite(bytes) {
        return bytes.map(legacyPair).join('');
    }

    function isUrduChar(ch) {
        if (!ch) return false;
        var code = ch.codePointAt(0);
        return (code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F) ||
            (code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF);
    }

    function warning(kind, index, value) {
        return { kind: kind, index: index, value: value };
    }

    function decodeLegacyText(input) {
        var source = String(input || '');
        var output = '';
        var warnings = [];
        var converted = 0;
        var prefixCount = 0;

        for (var i = 0; i < source.length; i += 1) {
            var ch = source[i];
            if (ch !== PREFIX) {
                output += ch;
                continue;
            }
            prefixCount += 1;
            if (i + 1 >= source.length) {
                output += PREFIX;
                warnings.push(warning('dangling-prefix', i, null));
                continue;
            }

            var firstChar = source[i + 1];
            var firstByte = clipboardCharToByte(firstChar);
            if (firstByte === null) {
                output += PREFIX + firstChar;
                warnings.push(warning('unknown-byte', i, firstChar));
                i += 1;
                continue;
            }

            if (i + 3 < source.length && source[i + 2] === PREFIX) {
                var secondByte = clipboardCharToByte(source[i + 3]);
                var key = secondByte === null ? '' : firstByte.toString(16).toUpperCase().padStart(2, '0') + '_' + secondByte.toString(16).toUpperCase().padStart(2, '0');
                if (key && Object.prototype.hasOwnProperty.call(COMPOSITES, key)) {
                    output += COMPOSITES[key];
                    converted += 1;
                    prefixCount += 1;
                    i += 3;
                    continue;
                }
            }

            if (Object.prototype.hasOwnProperty.call(BYTE_TO_UNICODE, firstByte)) {
                output += BYTE_TO_UNICODE[firstByte];
                converted += 1;
            } else {
                output += PREFIX + firstChar;
                warnings.push(warning('unsupported-byte', i, firstByte));
            }
            i += 1;
        }

        return {
            text: output,
            converted: converted,
            warnings: warnings,
            unsupported: warnings.length,
            prefixCount: prefixCount,
            profile: PROFILE,
            looksLikeLegacy: prefixCount > 0
        };
    }

    function encodeUnicodeText(input) {
        var source = String(input || '');
        var output = '';
        var warnings = [];
        var converted = 0;

        for (var i = 0; i < source.length; i += 1) {
            var pair = source.slice(i, i + 2);
            if (Object.prototype.hasOwnProperty.call(UNICODE_TO_COMPOSITE, pair)) {
                output += legacyComposite(UNICODE_TO_COMPOSITE[pair]);
                converted += 1;
                i += 1;
                continue;
            }

            var ch = String.fromCodePoint(source.codePointAt(i));
            var width = ch.length;
            if (Object.prototype.hasOwnProperty.call(UNICODE_TO_COMPOSITE, ch)) {
                output += legacyComposite(UNICODE_TO_COMPOSITE[ch]);
                converted += 1;
                i += width - 1;
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(PREFERRED_BYTE, ch)) {
                output += legacyPair(PREFERRED_BYTE[ch]);
                converted += 1;
                i += width - 1;
                continue;
            }

            // Plain Latin text, Western digits, tabs and line breaks can coexist with
            // InPage legacy Urdu text and are preserved as ordinary characters.
            if (/^[\x20-\x7E\t\r\n]$/.test(ch)) {
                output += ch;
                i += width - 1;
                continue;
            }

            // Preserve unsupported Unicode rather than silently substituting a guess.
            output += ch;
            warnings.push(warning(isUrduChar(ch) ? 'unsupported-urdu' : 'unsupported-unicode', i, ch));
            i += width - 1;
        }

        return {
            text: output,
            converted: converted,
            warnings: warnings,
            unsupported: warnings.length,
            profile: PROFILE
        };
    }

    function unsupportedBucket(count) {
        var n = Math.max(0, Number(count) || 0);
        if (!n) return '0';
        if (n <= 2) return '1-2';
        if (n <= 5) return '3-5';
        if (n <= 10) return '6-10';
        return '11+';
    }

    return {
        PREFIX: PREFIX,
        PROFILE: PROFILE,
        decodeLegacyText: decodeLegacyText,
        encodeUnicodeText: encodeUnicodeText,
        unsupportedBucket: unsupportedBucket,
        byteToClipboardChar: byteToClipboardChar,
        clipboardCharToByte: clipboardCharToByte,
        _mapping: BYTE_TO_UNICODE
    };
}));
