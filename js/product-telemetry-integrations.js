(function () {
    'use strict';

    var telemetry = window.WriteUrduTelemetry;
    if (!telemetry) return;

    var route = String(window.location.pathname || '/').replace(/\.html$/i, '').replace(/\/+$/, '') || '/';

    function outcome(eventName, detail) {
        telemetry.trackOutcome(eventName, detail || {});
    }

    function track(eventName, detail) {
        telemetry.engage();
        telemetry.track(eventName, detail || {});
    }

    function observeStatus(selector, handler) {
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts += 1;
            var node = document.querySelector(selector);
            if (!node) {
                if (attempts >= 40) window.clearInterval(timer);
                return;
            }
            window.clearInterval(timer);
            var observer = new MutationObserver(function () {
                handler(String(node.textContent || '').trim());
            });
            observer.observe(node, { childList: true, characterData: true, subtree: true });
        }, 250);
    }

    function cardStudioOutcomes() {
        if (['/urdu-card-studio', '/urdu-name-art-maker', '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker'].indexOf(route) < 0) return;
        observeStatus('[data-card-status]', function (message) {
            if (/^PNG downloaded\.?$/i.test(message)) outcome('export_completed', { format: 'png', success: true });
            else if (/^JPEG downloaded\.?$/i.test(message)) outcome('export_completed', { format: 'jpeg', success: true });
            else if (/share sheet opened/i.test(message)) outcome('share_completed', { success: true });
        });

        if (route === '/urdu-name-art-maker') {
            observeStatus('[data-name-art-status]', function (message) {
                if (/transparent PNG downloaded/i.test(message)) outcome('export_completed', { format: 'png_transparent', success: true });
            });
        }
    }

    function invoiceOutcomes() {
        if (route !== '/urdu-invoice-generator') return;
        observeStatus('[data-invoice-fit-status]', function (message) {
            if (/^PDF downloaded\.?$/i.test(message)) outcome('export_completed', { format: 'pdf', success: true });
            else if (/^PNG downloaded\.?$/i.test(message)) outcome('export_completed', { format: 'png', success: true });
        });
        document.addEventListener('click', function (event) {
            if (event.target && event.target.closest && event.target.closest('[data-invoice-print]')) {
                outcome('print_started', { format: 'print', success: true });
            }
        }, true);
    }

    function qrOutcomes() {
        if (route !== '/qr-code-generator') return;
        observeStatus('[data-qr-status]', function (message) {
            if (/^PNG downloaded$/i.test(message)) outcome('export_completed', { format: 'png', success: true });
            else if (/^SVG downloaded$/i.test(message)) outcome('export_completed', { format: 'svg', success: true });
            else if (/^QR image copied$/i.test(message)) outcome('copy_completed', { format: 'clipboard_image', success: true });
            else if (/^QR image shared$/i.test(message)) outcome('share_completed', { success: true });
        });
    }

    function stylishOutcomes() {
        if (route !== '/stylish-urdu-text-generator') return;
        observeStatus('[data-stylish-status]', function (message) {
            if (/^Copied “|^Style copied for sharing\.|^Text copied for sharing\./i.test(message)) {
                outcome('copy_completed', { format: 'clipboard', success: true });
            } else if (/^Share sheet opened/i.test(message)) {
                outcome('share_completed', { success: true });
            }
        });
        document.addEventListener('click', function (event) {
            if (!event.target || !event.target.closest) return;
            var button = event.target.closest('.stylish-card-actions button');
            if (button && /^Name Art$/i.test(String(button.textContent || '').trim())) {
                track('tool_handoff', { target_route: '/urdu-name-art-maker' });
                return;
            }
            if (event.target.closest('[data-stylish-share]')) {
                track('share_clicked');
            }
        }, true);
    }

    cardStudioOutcomes();
    invoiceOutcomes();
    qrOutcomes();
    stylishOutcomes();
}());
