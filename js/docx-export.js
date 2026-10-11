(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.WriteUrduDocx = api;
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var URDU_FONT = 'Noto Nastaliq Urdu';
    var MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    var BLOCKS = /^(p|div|h[1-6]|li|blockquote|pre|tr|section|article|header|footer)$/;
    var HEADING_SIZE = { h1: 40, h2: 34, h3: 30, h4: 26, h5: 24, h6: 22 };
    var NAMED_COLORS = { black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000', blue: '0000FF', gray: '808080', grey: '808080' };

    function escapeXml(value) {
        return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function cssColor(value) {
        if (!value) return null;
        var v = String(value).trim().toLowerCase();
        var hex = v.match(/^#([0-9a-f]{6})$/);
        if (hex) return hex[1].toUpperCase();
        var short = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
        if (short) return (short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toUpperCase();
        var rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgb) {
            return [rgb[1], rgb[2], rgb[3]].map(function (n) {
                return ('0' + Math.min(255, Number(n)).toString(16)).slice(-2);
            }).join('').toUpperCase();
        }
        return NAMED_COLORS[v] || null;
    }

    function halfPoints(value) {
        var m = String(value || '').match(/^([\d.]+)\s*(px|pt)?$/);
        if (!m) return null;
        var pt = m[2] === 'pt' ? Number(m[1]) : Number(m[1]) * 0.75;
        return pt >= 6 && pt <= 120 ? Math.round(pt * 2) : null;
    }

    function mergeFormat(base, element) {
        var f = Object.assign({}, base);
        var tag = element.tagName.toLowerCase();
        var style = element.style || {};
        if (tag === 'b' || tag === 'strong' || /^h[1-6]$/.test(tag)) f.bold = true;
        if (tag === 'i' || tag === 'em') f.italic = true;
        if (tag === 'u' || tag === 'ins') f.underline = true;
        if (tag === 's' || tag === 'strike' || tag === 'del') f.strike = true;
        if (HEADING_SIZE[tag]) f.size = HEADING_SIZE[tag];
        if (tag === 'font') {
            var fontColor = cssColor(element.getAttribute('color'));
            if (fontColor) f.color = fontColor;
        }
        var weight = style.fontWeight;
        if (weight === 'bold' || Number(weight) >= 600) f.bold = true;
        else if (weight === 'normal' || (weight && Number(weight) < 600)) f.bold = false;
        if (style.fontStyle === 'italic') f.italic = true;
        var deco = style.textDecorationLine || style.textDecoration || '';
        if (/underline/.test(deco)) f.underline = true;
        if (/line-through/.test(deco)) f.strike = true;
        var color = cssColor(style.color);
        if (color) f.color = color;
        var size = halfPoints(style.fontSize);
        if (size) f.size = size;
        return f;
    }

    function runXml(text, format, extra) {
        var props = '<w:rFonts w:ascii="' + URDU_FONT + '" w:hAnsi="' + URDU_FONT + '" w:cs="' + URDU_FONT + '"/>';
        if (format.bold) props += '<w:b/><w:bCs/>';
        if (format.italic) props += '<w:i/><w:iCs/>';
        if (format.strike) props += '<w:strike/>';
        if (format.color) props += '<w:color w:val="' + format.color + '"/>';
        var size = format.size || 36;
        props += '<w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/>';
        if (format.underline) props += '<w:u w:val="single"/>';
        if (!format.ltr) props += '<w:rtl/>';
        var body = extra === 'br' ? '<w:br/>' : '<w:t xml:space="preserve">' + escapeXml(text) + '</w:t>';
        return '<w:r><w:rPr>' + props + '</w:rPr>' + body + '</w:r>';
    }

    function alignment(element, fallback) {
        var value = (element.style && element.style.textAlign) || element.getAttribute('align') || fallback || '';
        return value;
    }

    function wordAlignment(value) {
        // In a bidi paragraph Word's "left"/"right" are start/end, so physical
        // left needs w:jc="right" and the Urdu default (physical right) needs none.
        if (value === 'left') return 'right';
        if (value === 'center') return 'center';
        if (value === 'justify') return 'both';
        return '';
    }

    function paragraphXml(runs, jc, ltr, spacing) {
        var props = (ltr ? '' : '<w:bidi/>') + (spacing ? '<w:spacing w:after="' + spacing + '"/>' : '') + (jc ? '<w:jc w:val="' + jc + '"/>' : '');
        return '<w:p>' + (props ? '<w:pPr>' + props + '</w:pPr>' : '') + runs.join('') + '</w:p>';
    }

    // Convert a rich-text DOM subtree (or plain string) into WordprocessingML paragraphs.
    function bodyXml(source, doc) {
        var paragraphs = [];
        var runs = [];
        var current = { jc: '', ltr: false };

        function flush(force) {
            if (runs.length || force) paragraphs.push(paragraphXml(runs, current.jc, current.ltr, 120));
            runs = [];
        }

        function walk(node, format, listState, align) {
            if (node.nodeType === 3) {
                var text = node.nodeValue.replace(/[\r\n\t]+/g, ' ');
                if (text.replace(/\s+/g, '') || (runs.length && text)) runs.push(runXml(text, format));
                return;
            }
            if (node.nodeType !== 1) return;
            var tag = node.tagName.toLowerCase();
            if (/^(script|style|img|svg|canvas|video|audio|iframe)$/.test(tag)) return;
            if (tag === 'br') { runs.push(runXml('', format, 'br')); return; }

            var childFormat = mergeFormat(format, node);
            var block = BLOCKS.test(tag) || tag === 'ul' || tag === 'ol' || tag === 'table';
            var nextList = listState;
            var ownAlign = alignment(node, align);
            if (tag === 'ul' || tag === 'ol') nextList = { ordered: tag === 'ol', n: 0 };
            if (block) {
                flush(false);
                current = { jc: wordAlignment(ownAlign), ltr: node.getAttribute('dir') === 'ltr' };
            }
            if (tag === 'li' && nextList) {
                nextList.n += 1;
                runs.push(runXml((nextList.ordered ? nextList.n + '. ' : '• '), childFormat));
            }
            Array.prototype.forEach.call(node.childNodes, function (child) { walk(child, childFormat, nextList, ownAlign); });
            if (tag === 'td' || tag === 'th') runs.push(runXml('\t', childFormat));
            if (block && tag !== 'ul' && tag !== 'ol' && tag !== 'table') flush(tag === 'p' && !node.textContent.trim());
        }

        if (typeof source === 'string') {
            source.split(/\r?\n/).forEach(function (line) {
                runs = line ? [runXml(line, {})] : [];
                paragraphs.push(paragraphXml(runs, '', false, 120));
            });
            runs = [];
        } else if (source) {
            Array.prototype.forEach.call(source.childNodes, function (child) { walk(child, {}, null, ''); });
            flush(false);
        }
        if (!paragraphs.length) paragraphs.push(paragraphXml([], '', false, 120));
        return paragraphs.join('');
    }

    function footerXml() {
        return '<w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="6" w:color="D1E1D7"/></w:pBdr>' +
            '<w:spacing w:before="480"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>' +
            '<w:color w:val="6B7D73"/><w:sz w:val="16"/></w:rPr><w:t>Generated with Write Urdu · Write-Urdu.com</w:t></w:r></w:p>';
    }

    function documentXml(source) {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
            bodyXml(source) + footerXml() +
            '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1361" w:right="1361" w:bottom="1361" w:left="1361" w:header="708" w:footer="708" w:gutter="0"/><w:bidi/></w:sectPr>' +
            '</w:body></w:document>';
    }

    var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr>' +
        '<w:rFonts w:ascii="' + URDU_FONT + '" w:hAnsi="' + URDU_FONT + '" w:cs="' + URDU_FONT + '"/>' +
        '<w:sz w:val="36"/><w:szCs w:val="36"/><w:lang w:val="en-US" w:bidi="ur-PK"/></w:rPr></w:rPrDefault>' +
        '<w:pPrDefault><w:pPr><w:bidi/><w:spacing w:line="504" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
        '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>';

    var CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';

    var ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';

    var DOC_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';

    var crcTable = null;
    function crc32(bytes) {
        if (!crcTable) {
            crcTable = new Uint32Array(256);
            for (var n = 0; n < 256; n += 1) {
                var c = n;
                for (var k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
                crcTable[n] = c >>> 0;
            }
        }
        var crc = 0xffffffff;
        for (var i = 0; i < bytes.length; i += 1) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
    }

    function utf8(text) {
        if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
        return Uint8Array.from(Buffer.from(text, 'utf8'));
    }

    // Minimal "stored" (uncompressed) ZIP writer: enough for an OOXML package.
    function zip(files) {
        var chunks = [];
        var central = [];
        var offset = 0;
        var stamp = new Date();
        var dosTime = (stamp.getHours() << 11) | (stamp.getMinutes() << 5) | (stamp.getSeconds() >> 1);
        var dosDate = ((stamp.getFullYear() - 1980) << 9) | ((stamp.getMonth() + 1) << 5) | stamp.getDate();

        function u16(v) { return [v & 0xff, (v >>> 8) & 0xff]; }
        function u32(v) { return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]; }

        files.forEach(function (file) {
            var name = utf8(file.name);
            var data = utf8(file.content);
            var crc = crc32(data);
            var header = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
                u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
            chunks.push(Uint8Array.from(header), name, data);
            central.push({ name: name, crc: crc, size: data.length, offset: offset });
            offset += header.length + name.length + data.length;
        });

        var centralStart = offset;
        central.forEach(function (entry) {
            var record = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
                u32(entry.crc), u32(entry.size), u32(entry.size), u16(entry.name.length), u16(0), u16(0), u16(0), u16(0),
                u32(0), u32(entry.offset));
            chunks.push(Uint8Array.from(record), entry.name);
            offset += record.length + entry.name.length;
        });
        var end = [].concat(u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
            u32(offset - centralStart), u32(centralStart), u16(0));
        chunks.push(Uint8Array.from(end));
        return chunks;
    }

    // source: a DOM element (rich text) or a plain string.
    function buildParts(source) {
        return zip([
            { name: '[Content_Types].xml', content: CONTENT_TYPES },
            { name: '_rels/.rels', content: ROOT_RELS },
            { name: 'word/document.xml', content: documentXml(source) },
            { name: 'word/_rels/document.xml.rels', content: DOC_RELS },
            { name: 'word/styles.xml', content: STYLES }
        ]);
    }

    function buildBlob(source) {
        return new Blob(buildParts(source), { type: MIME });
    }

    return Object.freeze({
        MIME: MIME,
        buildParts: buildParts,
        buildBlob: buildBlob,
        documentXml: documentXml,
        crc32: crc32
    });
}));
