(function () {
    'use strict';

    var endpoint = 'https://inputtools.google.com/request';
    var activeRequest = 0;
    var copy = {
        en: {
            prompt: 'Long Roman Urdu or English-letter text detected. Convert the whole passage in one step?',
            note: 'This converts sounds into Urdu script; it does not translate English meaning.',
            action: 'Convert all text',
            busy: 'Converting the passage…',
            done: 'The complete passage was converted to Urdu.',
            error: 'The passage could not be converted. Check your connection and try again.'
        },
        ur: {
            prompt: 'طویل رومن اردو یا انگریزی حروف والا متن ملا ہے۔ کیا پورے متن کو ایک ہی مرحلے میں تبدیل کریں؟',
            note: 'یہ آواز کو اردو رسم الخط میں بدلتا ہے؛ انگریزی کے معنی کا ترجمہ نہیں کرتا۔',
            action: 'پورا متن تبدیل کریں',
            busy: 'متن تبدیل کیا جا رہا ہے…',
            done: 'پورا متن اردو میں تبدیل ہو گیا۔',
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
        var action = panel.querySelector('[data-batch-action]');
        var prompt = panel.querySelector('[data-batch-prompt]');
        var note = panel.querySelector('[data-batch-note]');
        var status = panel.querySelector('[data-batch-status]');
        if (!target || !action) return;
        panel.dataset.batchBound = 'true';
        function refresh() {
            if (!panel.dataset.batchBusy) {
                var value = readValue(target);
                panel.hidden = !(isLongEnough(value) && hasRomanText(value));
                if (prompt) prompt.textContent = text('prompt');
                if (note) note.textContent = text('note');
                action.textContent = text('action');
            }
        }
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
            if (prompt) prompt.textContent = text('busy');
            if (status) status.textContent = '';
            transliterate(original, function (completed, total) {
                if (prompt) prompt.textContent = text('busy') + ' ' + completed + '/' + total;
            }).then(function (result) {
                if (request !== activeRequest) return;
                writeValue(target, result);
                dispatchInput(target);
                if (prompt) prompt.textContent = text('done');
                if (note) note.textContent = text('note');
                if (status) status.textContent = '';
            }).catch(function () {
                if (request !== activeRequest) return;
                if (status) status.textContent = text('error');
                if (prompt) prompt.textContent = text('prompt');
            }).finally(function () {
                if (request !== activeRequest) return;
                panel.dataset.batchBusy = '';
                action.disabled = false;
                if (status && !status.textContent) status.textContent = text('done');
            });
        });
        refresh();
    }

    function refreshAll() { document.querySelectorAll('[data-batch-transliteration]').forEach(configure); }

    document.addEventListener('write-urdu:locale-change', refreshAll);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshAll);
    else refreshAll();
}());
