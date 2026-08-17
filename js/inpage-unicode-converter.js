(function () {
    'use strict';

    var root = document.querySelector('[data-inpage-converter]');
    var Core = window.WriteUrduInPageCore;
    if (!root || !Core) return;

    var source = root.querySelector('#inpageSource');
    var result = root.querySelector('#inpageResult');
    var modeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-inpage-mode]'));
    var convertButton = root.querySelector('[data-inpage-convert]');
    var swapButton = root.querySelector('[data-inpage-swap]');
    var clearButton = root.querySelector('[data-inpage-clear]');
    var sampleButton = root.querySelector('[data-inpage-sample]');
    var copyButton = root.querySelector('[data-inpage-copy]');
    var cleanButton = root.querySelector('[data-inpage-clean]');
    var editorButton = root.querySelector('[data-inpage-editor]');
    var sourceLabel = root.querySelector('[data-inpage-source-label]');
    var resultLabel = root.querySelector('[data-inpage-result-label]');
    var sourceHint = root.querySelector('[data-inpage-source-hint]');
    var resultHint = root.querySelector('[data-inpage-result-hint]');
    var status = root.querySelector('[data-inpage-status]');
    var summary = root.querySelector('[data-inpage-summary]');
    var warnings = root.querySelector('[data-inpage-warnings]');
    var notice = root.querySelector('[data-inpage-notice]');
    var mode = 'legacy-to-unicode';

    function restorePageIdentity() {
        var urdu = document.documentElement.lang === 'ur';
        var heading = root.querySelector('h1');
        if (heading) heading.textContent = urdu ? 'InPage سے Unicode اردو کنورٹر' : 'InPage to Unicode Urdu Converter';
        document.title = urdu ? 'InPage سے Unicode اردو کنورٹر | رائٹ اردو' : 'InPage to Unicode Urdu Converter — Both Directions | WriteUrdu';
    }

    // The shared shell historically falls back to homepage copy for routes it does
    // not own. Nested tool routes preserve their own page identity after locale/shell
    // initialization instead of inheriting the homepage H1.
    document.addEventListener('write-urdu:locale-change', restorePageIdentity);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restorePageIdentity);
    else restorePageIdentity();

    function telemetryEngage() {
        if (window.WriteUrduTelemetry && typeof window.WriteUrduTelemetry.engage === 'function') {
            window.WriteUrduTelemetry.engage();
        }
    }

    function setNotice(message, type) {
        notice.textContent = message || '';
        notice.className = 'urdu-tool-notice' + (type ? ' ' + type : '');
    }

    function setSharedCopyNotice() {
        var shared = document.getElementById('appNotifications');
        if (!shared) return;
        shared.textContent = 'Converted text copied to the clipboard.';
        shared.className = 'app-notifications is-visible is-success';
    }

    function hasResult() {
        return Boolean(String(result.value || '').length);
    }

    function refreshActions() {
        var ready = hasResult();
        copyButton.disabled = !ready;
        swapButton.disabled = !ready;
        var unicodeOutput = mode === 'legacy-to-unicode';
        cleanButton.hidden = !unicodeOutput;
        editorButton.hidden = !unicodeOutput;
        cleanButton.disabled = !ready || !unicodeOutput;
        editorButton.disabled = !ready || !unicodeOutput;
    }

    function resetAnalysis() {
        result.value = '';
        status.textContent = source.value ? 'Ready to convert' : 'Waiting for text';
        summary.innerHTML = '<span class="inpage-summary-empty">Conversion summary appears here.</span>';
        warnings.innerHTML = '<li class="inpage-warning-empty">Unsupported or ambiguous characters will be listed here without changing your source.</li>';
        setNotice('');
        refreshActions();
    }

    function applyMode(nextMode, keepSource) {
        mode = nextMode === 'unicode-to-legacy' ? 'unicode-to-legacy' : 'legacy-to-unicode';
        modeButtons.forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.getAttribute('data-inpage-mode') === mode));
        });
        if (mode === 'legacy-to-unicode') {
            sourceLabel.textContent = 'InPage / legacy text';
            resultLabel.textContent = 'Unicode Urdu result';
            sourceHint.textContent = 'Paste text copied from a supported legacy InPage workflow.';
            resultHint.textContent = 'Modern Unicode text for browsers, Word and WriteUrdu.';
            source.dir = 'auto';
            source.removeAttribute('lang');
            result.dir = 'rtl';
            result.lang = 'ur';
            convertButton.textContent = 'Convert to Unicode';
        } else {
            sourceLabel.textContent = 'Unicode Urdu text';
            resultLabel.textContent = 'InPage-compatible legacy text';
            sourceHint.textContent = 'Paste modern Unicode Urdu. Unsupported characters will be preserved and flagged.';
            resultHint.textContent = 'Legacy clipboard representation for compatible InPage workflows.';
            source.dir = 'rtl';
            source.lang = 'ur';
            result.dir = 'auto';
            result.removeAttribute('lang');
            convertButton.textContent = 'Convert to InPage text';
        }
        if (!keepSource) resetAnalysis();
        refreshActions();
    }

    function warningMessage(item) {
        if (item.kind === 'unsupported-byte') return 'An unrecognized legacy byte was preserved unchanged.';
        if (item.kind === 'unknown-byte') return 'A legacy character outside the supported byte representation was preserved.';
        if (item.kind === 'dangling-prefix') return 'A trailing InPage prefix marker was preserved for review.';
        if (item.kind === 'unsupported-urdu') return 'An Urdu/Arabic character has no confirmed reversible mapping and was preserved as Unicode.';
        return 'A non-legacy Unicode character has no confirmed InPage mapping and was preserved.';
    }

    function renderReport(report) {
        summary.innerHTML = '';
        var converted = document.createElement('span');
        converted.className = 'urdu-tool-chip good';
        converted.textContent = report.converted.toLocaleString() + ' mapped unit' + (report.converted === 1 ? '' : 's');
        summary.appendChild(converted);

        var unsupported = document.createElement('span');
        unsupported.className = 'urdu-tool-chip' + (report.unsupported ? ' review' : ' good');
        unsupported.textContent = report.unsupported ? report.unsupported.toLocaleString() + ' review item' + (report.unsupported === 1 ? '' : 's') : 'No unsupported characters';
        summary.appendChild(unsupported);

        var profile = document.createElement('span');
        profile.className = 'urdu-tool-chip';
        profile.textContent = 'Mapping: ' + report.profile;
        summary.appendChild(profile);

        warnings.innerHTML = '';
        if (!report.warnings.length) {
            var clean = document.createElement('li');
            clean.className = 'inpage-warning-empty';
            clean.textContent = 'No unsupported characters were detected in this conversion.';
            warnings.appendChild(clean);
        } else {
            var counts = {};
            report.warnings.forEach(function (item) { counts[item.kind] = (counts[item.kind] || 0) + 1; });
            Object.keys(counts).forEach(function (kind) {
                var row = document.createElement('li');
                row.className = 'inpage-warning-item';
                var strong = document.createElement('strong');
                strong.textContent = counts[kind] + ' × ';
                row.appendChild(strong);
                row.appendChild(document.createTextNode(warningMessage({ kind: kind })));
                warnings.appendChild(row);
            });
        }
    }

    function convert() {
        var value = String(source.value || '');
        if (!value.length) {
            setNotice('Paste or type some text first.', 'error');
            source.focus();
            return;
        }
        telemetryEngage();
        var report = mode === 'legacy-to-unicode' ? Core.decodeLegacyText(value) : Core.encodeUnicodeText(value);
        result.value = report.text;
        renderReport(report);

        if (mode === 'legacy-to-unicode' && !report.looksLikeLegacy) {
            status.textContent = 'No InPage markers detected';
            setNotice('This text does not contain the legacy InPage prefix pattern supported by this converter. It may already be Unicode or come from a different InPage workflow.', 'error');
        } else if (report.unsupported) {
            status.textContent = 'Converted with review items';
            setNotice('Conversion completed, but some characters were preserved because their mapping is not confirmed. Review the warnings before using the result.', '');
        } else {
            status.textContent = 'Conversion complete';
            setNotice('Conversion completed in this browser. Your source text was not changed.', 'success');
        }
        refreshActions();
    }

    function swap() {
        if (!hasResult()) return;
        var value = result.value;
        applyMode(mode === 'legacy-to-unicode' ? 'unicode-to-legacy' : 'legacy-to-unicode', true);
        source.value = value;
        resetAnalysis();
        status.textContent = 'Direction swapped';
        setNotice('The previous result is now the source. Select Convert when you are ready.', 'success');
        source.focus();
    }

    function loadSample() {
        var sample = 'یہ ایک اردو متن ہے۔ ۱۲۳';
        source.value = mode === 'legacy-to-unicode' ? Core.encodeUnicodeText(sample).text : sample;
        resetAnalysis();
        status.textContent = 'Example loaded';
        setNotice('Example loaded. Select Convert to see the result.', 'success');
        source.focus();
    }

    function copyResult() {
        var text = String(result.value || '');
        if (!text) return;
        var promise;
        if (navigator.clipboard && window.isSecureContext) promise = navigator.clipboard.writeText(text);
        else {
            result.focus();
            result.select();
            promise = document.execCommand('copy') ? Promise.resolve() : Promise.reject(new Error('copy'));
        }
        promise.then(function () {
            setNotice('Converted text copied to the clipboard.', 'success');
            setSharedCopyNotice();
        }).catch(function () {
            setNotice('Copy was blocked. Select the result and copy it manually.', 'error');
        });
    }

    function handoff(target) {
        if (mode !== 'legacy-to-unicode' || !hasResult()) return;
        var text = String(result.value || '');
        var Handoff = window.WriteUrduTextHandoff;
        if (Handoff && Handoff.store(text, target)) {
            if (window.WriteUrduTelemetry && typeof window.WriteUrduTelemetry.track === 'function') {
                window.WriteUrduTelemetry.track('tool_handoff', { target_route: target });
                window.WriteUrduTelemetry.flush(true);
            }
            window.location.assign(target);
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () { window.location.assign(target); })
                .catch(function () { setNotice('Session handoff was unavailable. Copy the Unicode result first, then open the next tool.', 'error'); });
        } else setNotice('Session handoff was unavailable. Copy the Unicode result first, then open the next tool.', 'error');
    }

    modeButtons.forEach(function (button) {
        button.addEventListener('click', function () { applyMode(button.getAttribute('data-inpage-mode')); });
    });
    source.addEventListener('input', resetAnalysis);
    convertButton.addEventListener('click', convert);
    swapButton.addEventListener('click', swap);
    sampleButton.addEventListener('click', loadSample);
    copyButton.addEventListener('click', copyResult);
    cleanButton.addEventListener('click', function () { handoff('/urdu-text-cleaner'); });
    editorButton.addEventListener('click', function () { handoff('/'); });
    clearButton.addEventListener('click', function () {
        source.value = '';
        resetAnalysis();
        source.focus();
    });

    applyMode(mode, true);
    resetAnalysis();
}());
