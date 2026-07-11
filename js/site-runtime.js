(function () {
    'use strict';

    var toastTimer;

    function getToastRegion() {
        var region = document.getElementById('appNotifications');
        if (region) return region;
        region = document.createElement('div');
        region.id = 'appNotifications';
        region.className = 'app-notifications';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        document.body.appendChild(region);
        return region;
    }

    function notify(message, type) {
        var region = getToastRegion();
        region.textContent = message;
        region.className = 'app-notifications is-visible ' + (type ? 'is-' + type : '');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            region.classList.remove('is-visible');
        }, 4500);
    }

    function showDependencyError() {
        if (document.getElementById('dependencyAlert')) return;
        var editor = document.getElementById('transliterateTextarea') || document.getElementById('basic-example');
        if (!editor) return;
        var alert = document.createElement('div');
        alert.id = 'dependencyAlert';
        alert.className = 'dependency-alert';
        alert.setAttribute('role', 'alert');
        alert.innerHTML = '<strong>Urdu transliteration could not be loaded.</strong>' +
            '<span> Check your internet connection, then try again.</span>' +
            '<button type="button">Retry</button>';
        alert.querySelector('button').addEventListener('click', function () {
            window.location.reload();
        });
        editor.parentNode.insertBefore(alert, editor);
    }

    function transliterationAvailable() {
        return typeof window.google !== 'undefined' &&
            google.elements && google.elements.transliteration &&
            typeof google.elements.transliteration.TransliterationControl === 'function';
    }

    function copyText(button) {
        var selector = button.getAttribute('data-copy-target') || button.getAttribute('data-clipboard-target');
        var target = selector ? document.querySelector(selector) : null;
        if (!target) {
            notify('Nothing is available to copy.', 'error');
            return;
        }
        var text = typeof target.value === 'string' ? target.value : target.innerText;
        var copyPromise;
        if (navigator.clipboard && window.isSecureContext) {
            copyPromise = navigator.clipboard.writeText(text);
        } else {
            target.focus();
            if (target.select) target.select();
            copyPromise = document.execCommand('copy') ? Promise.resolve() : Promise.reject();
        }
        copyPromise.then(function () {
            notify('Urdu text copied to the clipboard.', 'success');
        }).catch(function () {
            notify('Copy failed. Select the text and press Ctrl+C.', 'error');
        });
    }

    function removeInjectedExportButtons() {
        var buttons = document.querySelectorAll('#exportImage');
        for (var i = 1; i < buttons.length; i++) buttons[i].remove();
        var bodyButton = document.querySelector('body > #exportImage');
        if (bodyButton) bodyButton.remove();
    }

    function enhancePage() {
        document.documentElement.lang = document.documentElement.lang || 'en';
        document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
            link.rel = 'noopener noreferrer';
        });
        document.querySelectorAll('[data-copy-target], [data-clipboard-target]').forEach(function (button) {
            button.removeAttribute('data-clipboard-action');
            button.addEventListener('click', function (event) {
                event.preventDefault();
                copyText(button);
            });
        });
        removeInjectedExportButtons();
        new MutationObserver(removeInjectedExportButtons).observe(document.body, { childList: true });

        window.setTimeout(function () {
            if (!transliterationAvailable()) showDependencyError();
        }, 6500);

        window.addEventListener('offline', function () {
            notify('You are offline. Urdu transliteration may be unavailable.', 'error');
        });
        window.addEventListener('online', function () {
            notify('Connection restored.', 'success');
        });
    }

    window.WriteUrduUI = { notify: notify, showDependencyError: showDependencyError };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhancePage);
    else enhancePage();
}());
