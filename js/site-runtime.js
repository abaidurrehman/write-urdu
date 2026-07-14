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
        var editor = document.getElementById('transliterateTextarea') || document.getElementById('basic-example') || document.getElementById('write');
        if (!editor) return;
        var spinner = document.getElementById('spinner');
        if (spinner) spinner.style.display = 'none';
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

    function safeFilename(value, fallback) {
        var name = String(value || '').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ');
        return name || fallback || 'write-urdu';
    }

    var pdfDependencyPromise = null;

    function hasPdfDependency() {
        return Boolean(window.jspdf && typeof window.jspdf.jsPDF === 'function');
    }

    function loadPdfScript(url) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = function () {
                if (hasPdfDependency()) resolve(window.jspdf.jsPDF);
                else reject(new Error('The PDF library loaded without its jsPDF API.'));
            };
            script.onerror = function () { reject(new Error('The PDF library could not be loaded.')); };
            document.head.appendChild(script);
        });
    }

    function ensurePdfDependency() {
        if (hasPdfDependency()) return Promise.resolve(window.jspdf.jsPDF);
        if (pdfDependencyPromise) return pdfDependencyPromise;

        // The page includes the primary URL for normal loads. These lazy
        // fallbacks handle blocked, offline or failed CDN requests when the
        // user actually chooses PDF export.
        var sources = [
            'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'
        ];
        function trySource(index) {
            if (index >= sources.length) return Promise.reject(new Error('PDF export dependency is unavailable.'));
            return loadPdfScript(sources[index]).catch(function () { return trySource(index + 1); });
        }
        pdfDependencyPromise = trySource(0).catch(function (error) {
            pdfDependencyPromise = null;
            throw error;
        });
        return pdfDependencyPromise;
    }

    function exportBackground(source) {
        var color = window.getComputedStyle(source).backgroundColor;
        return !color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent' ? '#ffffff' : color;
    }

    function createExportSurface(source, options) {
        var richText = options && options.richText;
        var sourceStyle = window.getComputedStyle(source);
        var surface = document.createElement('article');
        var content = document.createElement('div');
        var credit = document.createElement('div');
        var sourceWidth = Math.round(source.getBoundingClientRect().width || 800);

        surface.className = 'wu-export-surface';
        surface.setAttribute('aria-hidden', 'true');
        Object.assign(surface.style, {
            position: 'fixed',
            left: '-12000px',
            top: '0',
            width: Math.max(640, Math.min(960, sourceWidth)) + 'px',
            padding: '64px 58px 34px',
            boxSizing: 'border-box',
            color: richText ? '#16251e' : (sourceStyle.color || '#16251e'),
            background: richText ? '#ffffff' : exportBackground(source),
            fontFamily: sourceStyle.fontFamily || '"Noto Nastaliq Urdu", serif',
            fontSize: Math.max(22, parseFloat(sourceStyle.fontSize) || 26) + 'px',
            lineHeight: sourceStyle.lineHeight === 'normal' ? '2.2' : sourceStyle.lineHeight,
            textAlign: 'right',
            overflow: 'visible',
            zIndex: '-1'
        });

        content.dir = 'rtl';
        content.lang = 'ur';
        Object.assign(content.style, {
            minHeight: '160px',
            whiteSpace: richText ? 'normal' : 'pre-wrap',
            overflowWrap: 'anywhere'
        });
        if (richText) content.innerHTML = source.innerHTML;
        else content.textContent = source.value || source.textContent || '';

        credit.textContent = 'Generated using Write-Urdu.com';
        Object.assign(credit.style, {
            position: 'static',
            width: '100%',
            margin: '38px 0 0',
            padding: '15px 0 0',
            borderTop: '1px solid rgba(23, 114, 69, .25)',
            color: '#177245',
            background: 'transparent',
            fontFamily: 'Arial, sans-serif',
            fontSize: '13px',
            lineHeight: '1.4',
            textAlign: 'left',
            direction: 'ltr'
        });
        surface.appendChild(content);
        surface.appendChild(credit);
        document.body.appendChild(surface);
        return surface;
    }

    async function renderCanvas(source, options) {
        if (!source) throw new Error('Export source is unavailable.');
        if (typeof window.html2canvas !== 'function') throw new Error('Image export dependency is unavailable.');
        var surface = createExportSurface(source, options || {});
        try {
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            await new Promise(function (resolve) {
                window.requestAnimationFrame(function () { window.requestAnimationFrame(resolve); });
            });
            return await window.html2canvas(surface, {
                backgroundColor: options && options.richText ? '#ffffff' : exportBackground(source),
                scale: 2,
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                width: surface.scrollWidth,
                height: surface.scrollHeight,
                windowWidth: surface.scrollWidth,
                windowHeight: surface.scrollHeight
            });
        } finally {
            surface.remove();
        }
    }

    function downloadData(uri, filename) {
        var link = document.createElement('a');
        link.download = filename;
        link.href = uri;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function downloadWord(source, filename, richText) {
        var body = richText ? source.innerHTML : String(source.value || source.textContent || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br>');
        var html = '<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8">' +
            '<title>Write Urdu document</title><style>@page{margin:24mm}body{direction:rtl;text-align:right;' +
            'font-family:"Noto Nastaliq Urdu","Noto Naskh Arabic",serif;font-size:18pt;line-height:2.1;' +
            'color:#16251e}footer{direction:ltr;text-align:left;margin-top:32pt;padding-top:10pt;border-top:1px solid #b9d4c4;' +
            'font:9pt Arial,sans-serif;color:#177245}</style></head><body>' + body +
            '<footer>Generated using Write-Urdu.com</footer></body></html>';
        var blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        downloadData(url, safeFilename(filename, 'write-urdu') + '.doc');
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function createPdf(canvas, filename, jsPDF) {
        var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        var pageWidth = doc.internal.pageSize.getWidth();
        var pageHeight = doc.internal.pageSize.getHeight();
        var margin = 10;
        var footerSpace = 9;
        var imageWidth = pageWidth - margin * 2;
        var scale = imageWidth / canvas.width;
        var sliceHeight = Math.floor((pageHeight - margin * 2 - footerSpace) / scale);
        var offset = 0;
        var page = 0;

        while (offset < canvas.height) {
            var currentHeight = Math.min(sliceHeight, canvas.height - offset);
            var pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentHeight;
            pageCanvas.getContext('2d').drawImage(canvas, 0, offset, canvas.width, currentHeight, 0, 0, canvas.width, currentHeight);
            if (page > 0) doc.addPage();
            doc.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, imageWidth, currentHeight * scale);
            doc.setFontSize(8);
            doc.setTextColor(23, 114, 69);
            doc.text('Generated using Write-Urdu.com', margin, pageHeight - 5);
            offset += currentHeight;
            page += 1;
        }
        doc.save(safeFilename(filename, 'write-urdu') + '.pdf');
    }

    function downloadPdf(canvas, filename) {
        if (!hasPdfDependency()) {
            return ensurePdfDependency().then(function (jsPDF) {
                return createPdf(canvas, filename, jsPDF);
            });
        }
        return createPdf(canvas, filename, window.jspdf.jsPDF);
    }

    function printCanvas(printWindow, canvas) {
        var dataUrl = canvas.toDataURL('image/png');
        printWindow.document.open();
        printWindow.document.write('<!doctype html><html><head><title>Write Urdu document</title>' +
            '<style>@page{margin:12mm}html,body{margin:0;padding:0}img{display:block;width:100%;height:auto}</style>' +
            '</head><body><img id="printImage" alt="Urdu document" src="' + dataUrl + '"></body></html>');
        printWindow.document.close();
        var image = printWindow.document.getElementById('printImage');
        image.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
        if (image.complete) image.onload();
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
        document.querySelectorAll('details.action-menu').forEach(function (menu) {
            menu.addEventListener('toggle', function () {
                if (!menu.open) return;
                document.querySelectorAll('details.action-menu[open]').forEach(function (other) {
                    if (other !== menu) other.open = false;
                });
            });
            menu.querySelectorAll('.action-menu-panel button').forEach(function (button) {
                button.addEventListener('click', function () { menu.open = false; });
            });
        });
        document.addEventListener('click', function (event) {
            document.querySelectorAll('details.action-menu[open]').forEach(function (menu) {
                if (!menu.contains(event.target)) menu.open = false;
            });
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                document.querySelectorAll('details.action-menu[open]').forEach(function (menu) { menu.open = false; });
            }
        });
        removeInjectedExportButtons();
        new MutationObserver(removeInjectedExportButtons).observe(document.body, { childList: true });

        window.setTimeout(function () {
            if (!window.writeUrduTransliterationReady || !transliterationAvailable()) showDependencyError();
        }, 6500);

        window.addEventListener('offline', function () {
            notify('You are offline. Urdu transliteration may be unavailable.', 'error');
        });
        window.addEventListener('online', function () {
            notify('Connection restored.', 'success');
        });
    }

    window.WriteUrduUI = { notify: notify, showDependencyError: showDependencyError };
    window.WriteUrduExport = {
        renderCanvas: renderCanvas,
        downloadData: downloadData,
        downloadWord: downloadWord,
        downloadPdf: downloadPdf,
        printCanvas: printCanvas,
        safeFilename: safeFilename
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhancePage);
    else enhancePage();
}());
