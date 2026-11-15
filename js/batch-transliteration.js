(function () {
    'use strict';

    var endpoint = 'https://inputtools.google.com/request';
    var activeRequest = 0;
    var protectedTokenPattern = /(https?:\/\/[^\s<>"']+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(@[A-Za-z0-9_]+)|(\b[A-Z]{2,6}\b)|(\b(?:[a-z][A-Za-z]*[A-Z][A-Za-z]*|[A-Z][A-Za-z]*[A-Z][A-Za-z]*)\b)|(\b\d+(?:[-\/:.]\d+)*\b)/g;
    var copy = {
        en: {
            title: 'Two ways to write Urdu',
            guide: 'Type Urdu words using English letters and press Space after each word, or paste/finish a longer passage and convert it to Urdu script in one step.',
            directGuide: 'Direct mode keeps Urdu or English exactly as you type it. Choose English letters → Urdu for word-by-word or bulk conversion.',
            prompt: 'Long Urdu text written with English letters detected. Convert this passage to Urdu script?',
            note: 'Use English letters to write Urdu words. This does not translate English sentences into Urdu.',
            action: 'Convert passage to Urdu script',
            busy: 'Converting the passage…',
            done: 'The passage was converted to Urdu script.',
            changed: 'The text changed while conversion was running. Review it and try again.',
            error: 'The passage could not be converted. Check your connection and try again.'
        },
        ur: {
            title: 'اردو لکھنے کے دو طریقے',
            guide: 'اردو الفاظ انگریزی حروف میں لکھیں اور ہر لفظ کے بعد Space دبائیں، یا طویل متن پیسٹ کر کے اسے ایک ہی مرحلے میں اردو رسم الخط میں تبدیل کریں۔',
            directGuide: 'براہِ راست طریقہ اردو یا انگریزی کو جوں کا توں رکھتا ہے۔ لفظ بہ لفظ یا مکمل متن کی تبدیلی کے لیے انگریزی حروف → اردو منتخب کریں۔',
            prompt: 'انگریزی حروف میں لکھا ہوا طویل اردو متن ملا ہے۔ کیا اسے اردو رسم الخط میں تبدیل کریں؟',
            note: 'انگریزی حروف سے لکھے اردو الفاظ کو اردو رسم الخط میں بدلا جاتا ہے؛ انگریزی جملوں کا ترجمہ نہیں ہوتا۔',
            action: 'متن کو اردو رسم الخط میں تبدیل کریں',
            busy: 'متن تبدیل کیا جا رہا ہے…',
            done: 'متن اردو رسم الخط میں تبدیل ہو گیا۔',
            changed: 'تبدیلی کے دوران متن بدل گیا۔ اسے دیکھ کر دوبارہ کوشش کریں۔',
            error: 'متن تبدیل نہیں ہو سکا۔ کنکشن دیکھ کر دوبارہ کوشش کریں۔'
        }
    };

    function language() {
        return window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function' && window.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
    }

    function text(key) { return copy[language()][key]; }

    // Shares provider health with the word-by-word input-mode notice.
    function reportAvailability(available) {
        document.dispatchEvent(new CustomEvent('write-urdu:transliteration-status', { detail: { available: available } }));
    }

    function hasRomanText(value) { return /[A-Za-z]{3,}/.test(String(value || '')); }

    function isLongEnough(value) { return String(value || '').trim().length >= 24; }

    function splitParagraph(value, limit) {
        var remaining = String(value || '');
        var chunks = [];
        while (remaining.length > limit) {
            var cut = remaining.lastIndexOf(' ', limit);
            if (cut < Math.floor(limit * .45)) cut = limit;
            chunks.push(remaining.slice(0, cut));
            remaining = remaining.slice(cut).replace(/^\s+/, '');
        }
        if (remaining) chunks.push(remaining);
        return chunks;
    }

    // Bulk conversion can contain values that must remain byte-for-byte usable
    // (for example URLs, email addresses, handles and phone numbers). Keep this
    // classifier deliberately structural: Roman Urdu itself uses Latin letters,
    // so ordinary English-looking words must continue through the provider.
    function splitProtectedTokens(value) {
        var input = String(value == null ? '' : value);
        var parts = [];
        var cursor = 0;
        var match;
        protectedTokenPattern.lastIndex = 0;
        while ((match = protectedTokenPattern.exec(input))) {
            if (match.index > cursor) parts.push({ protected: false, value: input.slice(cursor, match.index) });
            parts.push({ protected: true, value: match[0] });
            cursor = match.index + match[0].length;
        }
        if (cursor < input.length) parts.push({ protected: false, value: input.slice(cursor) });
        if (!parts.length) parts.push({ protected: false, value: input });
        return parts;
    }

    function edgeWhitespace(value) {
        var input = String(value == null ? '' : value);
        var leading = (input.match(/^\s+/) || [''])[0];
        var trailing = (input.match(/\s+$/) || [''])[0];
        var end = trailing ? input.length - trailing.length : input.length;
        return { leading: leading, trailing: trailing, core: input.slice(leading.length, end) };
    }

    // Google Input Tools misspells the most common greetings and blessings
    // (for example `assalam o alaikum` -> اسسلام و علیکم). Each entry pairs a
    // provider output with its standard spelling. Only whole words are
    // replaced, and only provider misspellings are listed, so real words such
    // as اسلام, جما or جامہ are never changed on their own. Word fixes come
    // first because the phrase fixes after them build on their output.
    // Arabic-script letters and marks plus Latin word characters. Everything
    // else, including Urdu punctuation (، ۔ ؟) and digits, is a word edge.
    var WORD_CHARACTERS = '\\u0610-\\u061A\\u0620-\\u065F\\u066E-\\u06D3\\u06D5-\\u06EF\\u06FA-\\u06FF\\w';
    var PHRASE_CORRECTIONS = [
        ['اسسلمالیکم', 'السلام علیکم'],
        ['سلامالیکم', 'السلام علیکم'],
        ['والیکمسسلام', 'وعلیکم السلام'],
        ['اسسلامو', 'السلام'],
        ['اسسلام', 'السلام'],
        ['انشاللہ', 'انشاءاللہ'],
        ['انشااللہ', 'انشاءاللہ'],
        ['انشا الله', 'انشاءاللہ'],
        ['انشا اللہ', 'انشاءاللہ'],
        ['ماشاللہ', 'ماشاءاللہ'],
        ['ماشااللہ', 'ماشاءاللہ'],
        ['ماشا الله', 'ماشاءاللہ'],
        ['ماشا اللہ', 'ماشاءاللہ'],
        ['الحمدلللہ', 'الحمدللہ'],
        ['الحمدولللہ', 'الحمدللہ'],
        ['سبحاناللہ', 'سبحان اللہ'],
        ['جزاکاللہ', 'جزاک اللہ'],
        ['جزاکللاہو', 'جزاک اللہ'],
        ['جزاک الله', 'جزاک اللہ'],
        ['بسمللہ', 'بسم اللہ'],
        ['فی امنللہ', 'فی امان اللہ'],
        ['السلام و علیکم', 'السلام علیکم'],
        ['اسلام و علیکم', 'السلام علیکم'],
        ['وہ علیکم', 'وعلیکم'],
        ['جمّ مبارک', 'جمعہ مبارک'],
        ['جما مبارک', 'جمعہ مبارک'],
        ['جامہ مبارک', 'جمعہ مبارک'],
        ['عید ال فطر', 'عید الفطر'],
        ['عید ال آدھا', 'عید الاضحیٰ'],
        ['عید ال اظہا', 'عید الاضحیٰ']
    ].map(function (pair) {
        return { pattern: new RegExp('(^|[^' + WORD_CHARACTERS + '])' + pair[0] + '(?=$|[^' + WORD_CHARACTERS + '])', 'g'), value: pair[1] };
    });

    function correctPhrases(value) {
        var output = String(value == null ? '' : value);
        PHRASE_CORRECTIONS.forEach(function (rule) {
            output = output.replace(rule.pattern, function (match, edge) { return edge + rule.value; });
        });
        return output;
    }

    function requestChunk(value) {
        var query = endpoint + '?text=' + encodeURIComponent(value) + '&itc=ur-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8';
        if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
        return window.fetch(query, { credentials: 'omit' }).then(function (response) {
            if (!response.ok) throw new Error('transliteration request failed');
            return response.json();
        }).then(function (data) {
            if (!Array.isArray(data) || data[0] !== 'SUCCESS' || !Array.isArray(data[1])) throw new Error('unexpected transliteration response');
            var entries = data[1];
            if (entries.length === 1 && Array.isArray(entries[0]) && Array.isArray(entries[0][1]) && entries[0][1][0]) return correctPhrases(String(entries[0][1][0]));
            return correctPhrases(entries.map(function (entry) { return entry && Array.isArray(entry[1]) && entry[1][0] ? entry[1][0] : entry && entry[0] || ''; }).join(' ').trim());
        });
    }

    function requestProtectedChunk(value) {
        var parts = splitProtectedTokens(value);
        if (!parts.some(function (part) { return part.protected; })) return requestChunk(value);
        var converted = [];
        return parts.reduce(function (promise, part, index) {
            return promise.then(function () {
                if (part.protected || !hasRomanText(part.value)) {
                    converted[index] = part.value;
                    return;
                }
                var edge = edgeWhitespace(part.value);
                if (!edge.core) {
                    converted[index] = part.value;
                    return;
                }
                return requestChunk(edge.core).then(function (result) {
                    converted[index] = edge.leading + (result || edge.core) + edge.trailing;
                });
            });
        }, Promise.resolve()).then(function () {
            return converted.join('');
        });
    }

    function transliterate(value, onProgress) {
        var lines = String(value || '').replace(/\r\n?/g, '\n').split('\n');
        var jobs = [];
        lines.forEach(function (line, index) {
            if (!hasRomanText(line)) return;
            splitParagraph(line, 900).forEach(function (chunk, chunkIndex) {
                jobs.push({ line: index, chunk: chunkIndex, total: 0, value: chunk });
            });
        });
        if (!jobs.length) return Promise.resolve(value);
        var grouped = {};
        var completed = 0;
        return jobs.reduce(function (promise, job) {
            return promise.then(function () {
                return requestProtectedChunk(job.value).then(function (result) {
                    if (!grouped[job.line]) grouped[job.line] = [];
                    grouped[job.line][job.chunk] = result;
                    completed += 1;
                    if (typeof onProgress === 'function') onProgress(completed, jobs.length);
                });
            });
        }, Promise.resolve()).then(function () {
            return lines.map(function (line, index) {
                return grouped[index] ? grouped[index].filter(Boolean).join(' ') : line;
            }).join('\n');
        });
    }

    // Reuse the same conversion engine in browser-only tools that offer an
    // explicit conversion action (for example, the QR text field). Nothing is
    // sent until a feature calls this method.
    window.WriteUrduBatchTransliteration = window.WriteUrduBatchTransliteration || {};
    window.WriteUrduBatchTransliteration.transliterate = transliterate;
    window.WriteUrduBatchTransliteration.correctPhrases = correctPhrases;

    // Word-by-word conversion: the Google control loads one JSONP script per
    // word and writes the result into the field before the script's `load`
    // event. Correct the words just written, near the caret, in the focused
    // field only, so pasted or earlier text is never rewritten.
    var CORRECTION_REACH = 60;
    var PROVIDER_REQUEST = /inputtools(\.google\.com\/request|\/request)/;
    var liveFields = [];

    function correctFieldNearCaret(field) {
        var value = field.value || '';
        var caret = typeof field.selectionEnd === 'number' ? field.selectionEnd : value.length;
        var start = Math.max(0, caret - CORRECTION_REACH);
        if (start > 0) {
            var edge = value.slice(start, caret).search(/\s/);
            if (edge < 0) return;
            start += edge;
        }
        var recent = value.slice(start, caret);
        var fixed = correctPhrases(recent);
        if (fixed === recent) return;
        field.value = value.slice(0, start) + fixed + value.slice(caret);
        var position = start + fixed.length;
        if (typeof field.setSelectionRange === 'function') field.setSelectionRange(position, position);
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function correctLiveFields() {
        liveFields.forEach(function (entry) {
            if (document.activeElement === entry.field && entry.isRomanMode()) correctFieldNearCaret(entry.field);
        });
    }

    function watchWordConversions() {
        if (!document.head || !window.MutationObserver) return;
        new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                Array.prototype.forEach.call(mutation.addedNodes, function (node) {
                    if (!node || node.tagName !== 'SCRIPT' || !PROVIDER_REQUEST.test(node.src || '')) return;
                    node.addEventListener('load', correctLiveFields);
                });
            });
        }).observe(document.head, { childList: true });
    }

    function dispatchInput(target) {
        if (target.tagName === 'IFRAME') {
            var editorId = target.id && target.id.replace(/_ifr$/, '');
            var editor = window.tinymce && typeof window.tinymce.get === 'function' ? window.tinymce.get(editorId) : null;
            if (editor && typeof editor.fire === 'function') {
                editor.fire('input');
                editor.fire('change');
            }
            var frameBody = target.contentDocument && target.contentDocument.body;
            if (frameBody) frameBody.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function readValue(target) {
        if (target.tagName === 'IFRAME') {
            var body = target.contentDocument && (target.contentDocument.getElementById('tinymce') || target.contentDocument.body);
            return body ? (typeof body.innerText === 'string' ? body.innerText : body.textContent || '') : '';
        }
        return target.value || '';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>\"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function writeValue(target, value) {
        if (target.tagName === 'IFRAME') {
            var editorId = target.id && target.id.replace(/_ifr$/, '');
            var editor = window.tinymce && typeof window.tinymce.get === 'function' ? window.tinymce.get(editorId) : null;
            var html = String(value || '').replace(/\r\n?/g, '\n').split('\n').map(escapeHtml).join('<br>');
            if (editor && typeof editor.setContent === 'function') {
                editor.setContent(html);
                if (typeof editor.save === 'function') editor.save();
            } else {
                var body = target.contentDocument && (target.contentDocument.getElementById('tinymce') || target.contentDocument.body);
                if (body) body.innerHTML = html;
            }
            return;
        }
        target.value = value;
    }

    function configure(panel) {
        if (panel.dataset.batchBound) return;
        var target = document.querySelector(panel.getAttribute('data-batch-target') || '');
        var modeStorage = panel.getAttribute('data-batch-input-mode');
        var modeControl = modeStorage ? document.querySelector('[data-input-mode-control][data-input-mode-storage="' + modeStorage + '"]') : null;
        var action = panel.querySelector('[data-batch-action]');
        var title = panel.querySelector('[data-batch-title]');
        var guide = panel.querySelector('[data-batch-guide]');
        var prompt = panel.querySelector('[data-batch-prompt]');
        var note = panel.querySelector('[data-batch-note]');
        var status = panel.querySelector('[data-batch-status]');
        if (!target || !action) return;
        function isRomanMode() { return !modeControl || modeControl.dataset.inputMode !== 'direct'; }
        panel.dataset.batchBound = 'true';
        function refresh() {
            if (!panel.dataset.batchBusy) {
                var value = readValue(target);
                var romanMode = isRomanMode();
                var ready = romanMode && isLongEnough(value) && hasRomanText(value);
                panel.hidden = false;
                if (title) title.textContent = text('title');
                if (guide) guide.textContent = text(romanMode ? 'guide' : 'directGuide');
                if (prompt) {
                    prompt.hidden = !ready;
                    prompt.textContent = text('prompt');
                }
                if (note) note.textContent = text('note');
                action.textContent = text('action');
                action.hidden = !ready;
                if (status) status.textContent = '';
            }
        }
        panel._batchRefresh = refresh;
        if (target.tagName !== 'IFRAME') liveFields.push({ field: target, isRomanMode: isRomanMode });
        target.addEventListener('input', refresh);
        target.addEventListener('paste', function () { window.setTimeout(refresh, 0); });
        function bindFrameEvents() {
            if (target.tagName !== 'IFRAME') return;
            var frameBody = target.contentDocument && target.contentDocument.body;
            if (!frameBody || frameBody.dataset.batchTransliterationBound) return;
            frameBody.addEventListener('input', refresh);
            frameBody.addEventListener('paste', function () { window.setTimeout(refresh, 0); });
            frameBody.dataset.batchTransliterationBound = 'true';
        }
        if (target.tagName === 'IFRAME') {
            target.addEventListener('load', function () { bindFrameEvents(); refresh(); });
            bindFrameEvents();
        }
        action.addEventListener('click', function () {
            if (panel.dataset.batchBusy) return;
            var original = readValue(target);
            if (!isLongEnough(original) || !hasRomanText(original)) return refresh();
            var request = ++activeRequest;
            panel.dataset.batchBusy = 'true';
            panel.hidden = false;
            action.disabled = true;
            action.hidden = false;
            if (prompt) prompt.hidden = false;
            if (prompt) prompt.textContent = text('busy');
            if (status) status.textContent = '';
            transliterate(original, function (completed, total) {
                if (prompt) prompt.textContent = text('busy') + ' ' + completed + '/' + total;
            }).then(function (result) {
                if (request !== activeRequest) return;
                if (readValue(target) !== original) {
                    // Keep the question visible for a retry; explain once, in the live status.
                    if (prompt) prompt.textContent = text('prompt');
                    if (status) status.textContent = text('changed');
                    return;
                }
                reportAvailability(true);
                writeValue(target, result);
                dispatchInput(target);
                // Confirm once (announced via the live status) and retire the
                // prompt and button until new English-letter text needs them.
                if (prompt) prompt.hidden = true;
                action.hidden = true;
                if (note) note.textContent = text('note');
                if (status) status.textContent = text('done');
            }).catch(function () {
                reportAvailability(false);
                if (request !== activeRequest) return;
                if (status) status.textContent = text('error');
                if (prompt) prompt.textContent = text('prompt');
                if (prompt) prompt.hidden = false;
                action.hidden = false;
            }).finally(function () {
                if (request !== activeRequest) return;
                panel.dataset.batchBusy = '';
                action.disabled = false;
            });
        });
        refresh();
    }

    var targetObserver = null;
    function refreshAll() {
        var panels = document.querySelectorAll('[data-batch-transliteration]');
        panels.forEach(configure);
        panels.forEach(function (panel) { if (typeof panel._batchRefresh === 'function') panel._batchRefresh(); });
        if (targetObserver && panels.length && Array.prototype.every.call(panels, function (panel) { return panel.dataset.batchBound === 'true'; })) {
            targetObserver.disconnect();
            targetObserver = null;
        }
    }

    function start() {
        watchWordConversions();
        refreshAll();
        if (window.MutationObserver && document.body) {
            targetObserver = new MutationObserver(refreshAll);
            targetObserver.observe(document.body, { childList: true, subtree: true });
            window.setTimeout(function () {
                if (targetObserver) {
                    targetObserver.disconnect();
                    targetObserver = null;
                }
            }, 10000);
        }
    }

    document.addEventListener('write-urdu:locale-change', refreshAll);
    document.addEventListener('write-urdu:input-mode-change', refreshAll);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());