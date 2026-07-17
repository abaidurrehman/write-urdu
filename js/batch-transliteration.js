(function () {
    'use strict';

    var endpoint = 'https://inputtools.google.com/request';
    var activeRequest = 0;
    var copy = {
        en: {
            title: 'Two ways to write Urdu',
            guide: 'Type Roman Urdu and press Space after each word, or paste/finish a longer passage and convert it to Urdu script in one step.',
            directGuide: 'Direct mode keeps Urdu or English exactly as you type it. Choose Roman Urdu → Urdu for word-by-word or bulk transliteration.',
            prompt: 'Long Roman Urdu text detected. Convert this passage to Urdu script?',
            note: 'This is transliteration: it changes sounds into Urdu script, not English meaning.',
            action: 'Convert passage to Urdu script',
            busy: 'Converting the passage…',
            done: 'The passage was converted to Urdu script.',
            changed: 'The text changed while conversion was running. Review it and try again.',
            error: 'The passage could not be converted. Check your connection and try again.'
        },
        ur: {
            title: 'اردو لکھنے کے دو طریقے',
            guide: 'رومن اردو لکھیں اور ہر لفظ کے بعد Space دبائیں، یا طویل متن پیسٹ کر کے اسے ایک ہی مرحلے میں اردو رسم الخط میں تبدیل کریں۔',
            directGuide: 'براہِ راست طریقہ اردو یا انگریزی کو جوں کا توں رکھتا ہے۔ لفظ بہ لفظ یا مکمل متن کی تبدیلی کے لیے رومن اردو → اردو منتخب کریں۔',
            prompt: 'طویل رومن اردو کا متن ملا ہے۔ کیا اسے اردو رسم الخط میں تبدیل کریں؟',
            note: 'یہ ترجمہ نہیں بلکہ تحریری تبدیلی ہے: آواز کو اردو رسم الخط میں بدلا جاتا ہے۔',
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

    function requestChunk(value) {
        var query = endpoint + '?text=' + encodeURIComponent(value) + '&itc=ur-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8';
        if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
        return window.fetch(query, { credentials: 'omit' }).then(function (response) {
            if (!response.ok) throw new Error('transliteration request failed');
            return response.json();
        }).then(function (data) {
            if (!Array.isArray(data) || data[0] !== 'SUCCESS' || !Array.isArray(data[1])) throw new Error('unexpected transliteration response');
            var entries = data[1];
            if (entries.length === 1 && Array.isArray(entries[0]) && Array.isArray(entries[0][1]) && entries[0][1][0]) return String(entries[0][1][0]);
            return entries.map(function (entry) { return entry && Array.isArray(entry[1]) && entry[1][0] ? entry[1][0] : entry && entry[0] || ''; }).join(' ').trim();
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
                return requestChunk(job.value).then(function (result) {
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
                    if (prompt) prompt.textContent = text('changed');
                    if (status) status.textContent = text('changed');
                    return;
                }
                writeValue(target, result);
                dispatchInput(target);
                if (prompt) prompt.textContent = text('done');
                if (prompt) prompt.hidden = false;
                if (note) note.textContent = text('note');
                if (status) status.textContent = '';
            }).catch(function () {
                if (request !== activeRequest) return;
                if (status) status.textContent = text('error');
                if (prompt) prompt.textContent = text('prompt');
                if (prompt) prompt.hidden = false;
                action.hidden = false;
            }).finally(function () {
                if (request !== activeRequest) return;
                panel.dataset.batchBusy = '';
                action.disabled = false;
                if (status && !status.textContent) status.textContent = text('done');
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
