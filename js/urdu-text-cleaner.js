(function () {
    'use strict';

    function ensureCoreContinuity() {
        if (window.WriteUrduCoreContinuity) return;
        function load(src, ready, next) {
            if (ready()) { next(); return; }
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) { existing.addEventListener('load', next, { once: true }); return; }
            var script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.addEventListener('load', next, { once: true });
            document.head.appendChild(script);
        }
        load('js/workspace-journey-registry.js', function () { return Boolean(window.WriteUrduWorkspaceRegistry); }, function () {
            load('js/workspace-handoff.js', function () { return Boolean(window.WriteUrduWorkspaceHandoff); }, function () {
                load('js/core-continuity.js', function () { return Boolean(window.WriteUrduCoreContinuity); }, function () {});
            });
        });
    }

    ensureCoreContinuity();

    var root = document.querySelector('[data-urdu-text-cleaner]');
    var Core = window.WriteUrduTextCleanerCore;
    if (!root || !Core) return;

    var source = root.querySelector('#cleanerSource');
    var result = root.querySelector('#cleanerResult');
    var analyzeButton = root.querySelector('[data-cleaner-analyze]');
    var safeFixButton = root.querySelector('[data-cleaner-fix-safe]');
    var clearButton = root.querySelector('[data-cleaner-clear]');
    var copyButton = root.querySelector('[data-cleaner-copy]');
    var handoffButton = root.querySelector('[data-cleaner-handoff]');
    var issues = root.querySelector('[data-cleaner-issues]');
    var summary = root.querySelector('[data-cleaner-summary]');
    var statusPill = root.querySelector('[data-cleaner-status-pill]');
    var notice = root.querySelector('[data-cleaner-notice]');
    var numeralTarget = root.querySelector('#cleanerNumeralTarget');
    var numeralButton = root.querySelector('[data-cleaner-numerals]');
    var hasAnalysis = false;

    function setNotice(message, type) {
        notice.textContent = message || '';
        notice.className = 'urdu-tool-notice' + (type ? ' ' + type : '');
    }

    function setResult(value) {
        result.value = String(value || '');
        result.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function sourceLengthText() {
        var length = String(source.value || '').length;
        return length ? length.toLocaleString() + ' characters' : 'Paste or type Urdu text';
    }

    function refreshSourceMeta() {
        var helper = root.querySelector('[data-cleaner-source-meta]');
        if (helper) helper.textContent = sourceLengthText();
    }

    function renderSummary(report) {
        summary.innerHTML = '';
        var title = document.createElement('h3');
        title.textContent = report.issueCount ? report.issueCount + ' issue' + (report.issueCount === 1 ? '' : 's') + ' found' : 'No obvious issues found';
        summary.appendChild(title);

        var safe = document.createElement('span');
        safe.className = 'urdu-tool-chip good';
        safe.textContent = report.safeIssueTypes + ' safe fix' + (report.safeIssueTypes === 1 ? '' : 'es');
        summary.appendChild(safe);

        var review = document.createElement('span');
        review.className = 'urdu-tool-chip review';
        review.textContent = report.reviewIssueTypes + ' review item' + (report.reviewIssueTypes === 1 ? '' : 's');
        summary.appendChild(review);

        statusPill.textContent = report.issueCount ? 'Review ready' : 'Text looks clean';
        safeFixButton.disabled = report.safeIssueTypes === 0;
        copyButton.disabled = !result.value;
        handoffButton.disabled = !result.value;
        numeralButton.disabled = !result.value;
    }

    function issueButton(issue) {
        if (!issue.actionable || !issue.actionLabel) return null;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'urdu-tool-button ghost';
        button.textContent = issue.actionLabel;
        button.setAttribute('data-cleaner-rule', issue.id);
        return button;
    }

    function renderIssues(report) {
        issues.innerHTML = '';
        if (!report.issues.length) {
            var empty = document.createElement('li');
            empty.className = 'urdu-tool-empty';
            empty.textContent = 'No common character, spacing, punctuation or text-direction problems were found. Review the text once before using it elsewhere.';
            issues.appendChild(empty);
            return;
        }

        report.issues.forEach(function (issue) {
            var item = document.createElement('li');
            item.className = 'urdu-tool-issue';
            item.setAttribute('data-cleaner-issue', issue.id);

            var content = document.createElement('div');
            var heading = document.createElement('div');
            heading.className = 'urdu-tool-issue-title';
            var label = document.createElement('span');
            label.textContent = issue.title + ' · ' + issue.count;
            var badge = document.createElement('span');
            badge.className = 'urdu-tool-badge' + (issue.safety === 'review' ? ' review' : '');
            badge.textContent = issue.safety === 'safe' ? 'Safe fix' : 'Review';
            heading.appendChild(label);
            heading.appendChild(badge);
            var explanation = document.createElement('p');
            explanation.textContent = issue.explanation;
            content.appendChild(heading);
            content.appendChild(explanation);
            item.appendChild(content);

            var action = issueButton(issue);
            if (action) item.appendChild(action);
            issues.appendChild(item);
        });
    }

    function analyzeCurrent(message) {
        var report = Core.analyze(result.value);
        renderSummary(report);
        renderIssues(report);
        hasAnalysis = true;
        if (message) setNotice(message, 'success');
        return report;
    }

    function analyzeSource() {
        var value = String(source.value || '');
        if (!value.trim()) {
            setNotice('Paste or type some Urdu text first.', 'error');
            source.focus();
            return;
        }
        setResult(value);
        var report = analyzeCurrent();
        setNotice(report.issueCount ? 'Analysis complete. Safe fixes are separated from items that need review.' : 'Analysis complete. No common issues were detected.', 'success');
    }

    function invalidateAnalysis() {
        hasAnalysis = false;
        statusPill.textContent = source.value.trim() ? 'Ready to check' : 'Waiting for text';
        safeFixButton.disabled = true;
        copyButton.disabled = true;
        handoffButton.disabled = true;
        numeralButton.disabled = true;
        summary.innerHTML = '<h3>Analysis appears here</h3><span class="urdu-tool-chip">Source is never overwritten</span>';
        issues.innerHTML = '<li class="urdu-tool-empty">Check your text to see suggested fixes and anything that needs your review.</li>';
        setResult('');
        setNotice('');
        refreshSourceMeta();
    }

    function applySafeFixes() {
        if (!hasAnalysis) return analyzeSource();
        var before = result.value;
        var after = Core.applySafeFixes(before);
        setResult(after);
        var changed = before !== after;
        analyzeCurrent(changed ? 'Safe fixes applied. Review-only items were left unchanged.' : 'No additional safe fixes were available.');
    }

    function applyRule(id) {
        var before = result.value;
        var after = Core.applyRule(before, id);
        if (after === before) {
            setNotice('That issue did not require a text change.', '');
            return;
        }
        setResult(after);
        analyzeCurrent('The selected fix was applied to the cleaned result.');
    }

    function copyResult() {
        var text = String(result.value || '');
        if (!text) return;
        var promise;
        if (navigator.clipboard && window.isSecureContext) {
            promise = navigator.clipboard.writeText(text);
        } else {
            result.focus();
            result.select();
            promise = document.execCommand('copy') ? Promise.resolve() : Promise.reject(new Error('copy unavailable'));
        }
        promise.then(function () {
            setNotice('Urdu text copied to the clipboard.', 'success');
            var sharedNotice = document.getElementById('appNotifications');
            if (sharedNotice) {
                sharedNotice.textContent = 'Urdu text copied to the clipboard.';
                sharedNotice.className = 'app-notifications is-visible is-success';
            }
        }).catch(function () {
            setNotice('Copy failed. Select the cleaned text and copy it manually.', 'error');
        });
    }

    function handoff() {
        var text = String(result.value || '');
        if (!text) return;
        var Handoff = window.WriteUrduTextHandoff;
        if (Handoff && Handoff.store(text, '/')) {
            window.location.assign('/');
            return;
        }
        var promise = navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(text) : Promise.reject();
        promise.then(function () {
            window.location.assign('/');
        }).catch(function () {
            setNotice('Your browser blocked the session handoff. Copy the cleaned text, then open WriteUrdu.', 'error');
        });
    }

    function convertNumerals() {
        var target = numeralTarget.value;
        if (!target || !result.value) return;
        var before = result.value;
        var after = Core.convertNumerals(before, target);
        setResult(after);
        analyzeCurrent(before === after ? 'The numerals already use that style.' : 'Numerals converted in the cleaned result.');
    }

    source.addEventListener('input', invalidateAnalysis);
    analyzeButton.addEventListener('click', analyzeSource);
    safeFixButton.addEventListener('click', applySafeFixes);
    copyButton.addEventListener('click', copyResult);
    handoffButton.addEventListener('click', handoff);
    numeralButton.addEventListener('click', convertNumerals);
    clearButton.addEventListener('click', function () {
        source.value = '';
        invalidateAnalysis();
        source.focus();
    });

    issues.addEventListener('click', function (event) {
        var button = event.target.closest && event.target.closest('[data-cleaner-rule]');
        if (button) applyRule(button.getAttribute('data-cleaner-rule'));
    });

    refreshSourceMeta();
    invalidateAnalysis();
}());
