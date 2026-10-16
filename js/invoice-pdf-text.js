(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduInvoicePdfText = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // PDF pages are images of the rendered invoice, because only the browser
    // can shape Nastaliq correctly. This module lays an invisible copy of the
    // Latin text (invoice numbers, amounts, IBANs, emails, English words) over
    // each image, so people can select, copy and search it. Urdu words are
    // left out: the PDF's built-in fonts cannot encode them, and a wrongly
    // shaped copy would be worse than none.

    var REPLACEMENTS = {
        '·': '-', '×': 'x', '—': '-', '–': '-', '−': '-', '•': '-',
        '‘': "'", '’': "'", '“': '"', '”': '"', '…': '...',
        '\u00a0': ' ', '\u2009': ' ', '\u202f': ' ',
        '\u200e': '', '\u200f': '', '\u2066': '', '\u2067': '', '\u2068': '', '\u2069': ''
    };
    var REPLACEABLE = /[·×—–−•‘’“”…\u00a0\u2009\u202f\u200e\u200f\u2066-\u2069]/g;
    // Plain ASCII is the only range every PDF viewer maps back to the same
    // characters from the built-in fonts.
    var ENCODABLE = /^[ -~]+$/;
    var LINE_TOLERANCE = 3;

    function toPdfText(value) {
        return String(value || '').replace(REPLACEABLE, function (char) { return REPLACEMENTS[char]; });
    }
    function isEncodable(word) { return ENCODABLE.test(word); }

    // Splits a text node's value into words with their offsets, keeping
    // only the words the PDF fonts can encode.
    function words(value) {
        var list = [], pattern = /\S+/g, match;
        while ((match = pattern.exec(value))) {
            var clean = toPdfText(match[0]).trim();
            if (clean && isEncodable(clean)) list.push({ text: clean, start: match.index, end: match.index + match[0].length });
        }
        return list;
    }

    // Joins neighbouring words that sit on the same line into one run, so a
    // copied phrase keeps its spaces. Words are given with their boxes.
    function groupRuns(boxes) {
        var runs = [], current = null;
        boxes.forEach(function (box) {
            var sameLine = current && Math.abs(box.top - current.top) <= LINE_TOLERANCE && box.left >= current.right - 1 && box.left - current.right < box.height * 1.5;
            if (sameLine) {
                current.text += ' ' + box.text;
                current.right = Math.max(current.right, box.right);
                current.height = Math.max(current.height, box.height);
            } else {
                if (current) runs.push(current);
                current = { text: box.text, left: box.left, right: box.right, top: box.top, height: box.height };
            }
        });
        if (current) runs.push(current);
        return runs.map(function (run) { return { text: run.text, x: run.left, y: run.top, width: run.right - run.left, height: run.height }; });
    }

    // Collects text runs from a rendered page, in CSS pixels relative to it.
    // The page must not be scaled (the export host renders at full size).
    function collectRuns(page) {
        var doc = page.ownerDocument, origin = page.getBoundingClientRect(), runs = [];
        var walker = doc.createTreeWalker(page, 4, null);
        var range = doc.createRange();
        var node;
        while ((node = walker.nextNode())) {
            var list = words(node.nodeValue);
            if (!list.length) continue;
            var boxes = [];
            list.forEach(function (word) {
                range.setStart(node, word.start);
                range.setEnd(node, word.end);
                var rect = range.getBoundingClientRect();
                if (rect.width < 0.5 || rect.height < 0.5) return;
                boxes.push({ text: word.text, left: rect.left - origin.left, right: rect.right - origin.left, top: rect.top - origin.top, height: rect.height });
            });
            runs = runs.concat(groupRuns(boxes));
        }
        if (range.detach) range.detach();
        return runs;
    }

    // Writes runs onto the current jsPDF page as invisible text. Each run is
    // stretched to the width it occupies on the image so selections line up.
    function addTextLayer(pdf, runs, pageWidthPx, pageWidthMm) {
        var mmPerPx = pageWidthMm / pageWidthPx, ptPerMm = 72 / 25.4;
        pdf.setFont('helvetica', 'normal');
        runs.forEach(function (run) {
            // A text box is about 1.2 times the font size for the faces we use.
            var fontPx = run.height / 1.2;
            pdf.setFontSize(fontPx * mmPerPx * ptPerMm);
            var natural = pdf.getTextWidth(run.text);
            if (!(natural > 0)) return;
            var scale = (run.width * mmPerPx) / natural;
            var baseline = (run.y + run.height * 0.78) * mmPerPx;
            pdf.text(run.text, run.x * mmPerPx, baseline, { renderingMode: 'invisible', horizontalScale: Math.max(0.2, Math.min(scale, 5)), baseline: 'alphabetic' });
        });
    }

    return { toPdfText: toPdfText, isEncodable: isEncodable, words: words, groupRuns: groupRuns, collectRuns: collectRuns, addTextLayer: addTextLayer };
}));
