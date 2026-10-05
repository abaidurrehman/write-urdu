(function (root) {
    'use strict';

    if (!root || !root.document) return;
    var workspace = root.document.querySelector('[data-roman-urdu-converter]');
    if (!workspace) return;

    var source = workspace.querySelector('[data-roman-source]');
    var output = workspace.querySelector('[data-roman-output]');
    var convert = workspace.querySelector('[data-roman-convert]');
    var copy = workspace.querySelector('[data-roman-copy]');
    var continueEditing = workspace.querySelector('[data-roman-continue]');
    var status = workspace.querySelector('[data-roman-status]');
    var convertedSource = '';

    function setStatus(message, state) {
        status.textContent = message || '';
        status.dataset.state = state || '';
    }

    function track(name, detail) {
        if (!root.WriteUrduTelemetry || typeof root.WriteUrduTelemetry.track !== 'function') return;
        root.WriteUrduTelemetry.track(name, detail || {});
    }

    function syncActions() {
        var hasOutput = Boolean(output.value.trim());
        copy.disabled = !hasOutput;
        continueEditing.disabled = !hasOutput;
    }

    function convertText() {
        var value = source.value.trim();
        var engine = root.WriteUrduBatchTransliteration;
        if (!value) {
            setStatus('Enter Roman Urdu first.', 'error');
            source.focus();
            return;
        }
        if (!engine || typeof engine.transliterate !== 'function') {
            setStatus('The converter is still loading. Check your connection and try again.', 'error');
            return;
        }

        convert.disabled = true;
        setStatus('Converting to Urdu script…', 'busy');
        engine.transliterate(value).then(function (result) {
            if (source.value.trim() !== value) {
                setStatus('Your Roman Urdu changed during conversion. Review it and try again.', 'error');
                return;
            }
            output.value = result || '';
            convertedSource = value;
            syncActions();
            setStatus('Converted. Review names, spelling and punctuation before using the Urdu text.', 'success');
            track('roman_conversion_completed', { success: true });
            output.focus();
        }).catch(function () {
            setStatus('Conversion failed. Check your connection and try again.', 'error');
            track('roman_conversion_failed', { success: false });
        }).finally(function () {
            convert.disabled = false;
        });
    }

    function fallbackCopy() {
        output.focus();
        output.select();
        return root.document.execCommand && root.document.execCommand('copy');
    }

    function copyOutput() {
        var value = output.value.trim();
        if (!value) return;
        var operation = root.navigator.clipboard && root.navigator.clipboard.writeText
            ? root.navigator.clipboard.writeText(value)
            : Promise.resolve(fallbackCopy());
        Promise.resolve(operation).then(function (copied) {
            if (copied === false) throw new Error('copy failed');
            setStatus('Urdu text copied.', 'success');
            track('copy_completed', { format: 'clipboard', success: true });
        }).catch(function () {
            setStatus('Copy was blocked. Select the Urdu output and copy it manually.', 'error');
        });
    }

    function handoffToWriter() {
        var value = output.value.trim();
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!value) return;
        if (!handoff || typeof handoff.transfer !== 'function') {
            setStatus('Continue Editing is unavailable. Copy the Urdu text, then open WriteUrdu.', 'error');
            return;
        }
        var result = handoff.transfer({
            sourceWorkspace: 'roman-converter',
            sourceRoute: '/roman-urdu-transliteration',
            targetWorkspace: 'basic-writer',
            targetRoute: '/',
            actionId: 'roman-to-basic',
            intent: 'continue-editing',
            kind: 'plain-text',
            payload: { text: value },
            context: { pathVersion: 'v2', handoffRequired: true, restoreRequired: true }
        });
        if (!result.ok) {
            setStatus('Continue Editing is unavailable. Copy the Urdu text, then open WriteUrdu.', 'error');
            return;
        }
        track('tool_handoff', { target_route: '/', action_id: 'roman-to-basic' });
        if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.flush === 'function') root.WriteUrduTelemetry.flush(true);
        root.location.assign(result.route || '/');
    }

    convert.addEventListener('click', convertText);
    copy.addEventListener('click', copyOutput);
    continueEditing.addEventListener('click', handoffToWriter);
    source.addEventListener('input', function () {
        if (convertedSource && source.value.trim() !== convertedSource) {
            setStatus('Roman Urdu changed. Convert again to refresh the output.', '');
        }
    });
    output.addEventListener('input', syncActions);
    workspace.querySelectorAll('[data-roman-example]').forEach(function (button) {
        button.addEventListener('click', function () {
            source.value = button.getAttribute('data-roman-example') || '';
            source.focus();
            setStatus('Example loaded. Select Convert to Urdu.', '');
        });
    });
    syncActions();
}(typeof window !== 'undefined' ? window : null));
