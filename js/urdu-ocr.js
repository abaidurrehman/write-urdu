(function () {
    'use strict';

    var root = document.querySelector('[data-urdu-ocr]');
    if (!root) return;

    var TESSERACT_VERSION = '7.0.0';
    var TESSERACT_SCRIPT = 'https://cdn.jsdelivr.net/npm/tesseract.js@' + TESSERACT_VERSION + '/dist/tesseract.min.js';
    var MAX_FILE_BYTES = 12 * 1024 * 1024;
    var MAX_PIXELS = 20 * 1000 * 1000;
    var MAX_OCR_EDGE = 4096;
    var ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

    var fileInput = root.querySelector('#ocrImage');
    var dropzone = root.querySelector('[data-ocr-dropzone]');
    var preview = root.querySelector('[data-ocr-preview]');
    var previewImage = root.querySelector('[data-ocr-preview-image]');
    var imageMeta = root.querySelector('[data-ocr-image-meta]');
    var startButton = root.querySelector('[data-ocr-start]');
    var cancelButton = root.querySelector('[data-ocr-cancel]');
    var clearButton = root.querySelector('[data-ocr-clear]');
    var copyButton = root.querySelector('[data-ocr-copy]');
    var cleanButton = root.querySelector('[data-ocr-clean]');
    var editorButton = root.querySelector('[data-ocr-editor]');
    var result = root.querySelector('#ocrResult');
    var progress = root.querySelector('[data-ocr-progress]');
    var progressBar = root.querySelector('[data-ocr-progress-bar]');
    var progressText = root.querySelector('[data-ocr-progress-text]');
    var statusPill = root.querySelector('[data-ocr-status-pill]');
    var notice = root.querySelector('[data-ocr-notice]');

    var selected = null;
    var selectedUrl = null;
    var worker = null;
    var workerPromise = null;
    var runToken = 0;
    var busy = false;

    function setNotice(message, type) {
        notice.textContent = message || '';
        notice.className = 'urdu-tool-notice' + (type ? ' ' + type : '');
    }

    function setStatus(label) {
        statusPill.textContent = label;
    }

    function setProgress(value, label) {
        var percent = Math.max(0, Math.min(100, Math.round((Number(value) || 0) * 100)));
        progress.hidden = false;
        progressBar.style.width = percent + '%';
        progressBar.parentElement.setAttribute('aria-valuenow', String(percent));
        progressText.textContent = (label || 'Processing') + (percent ? ' · ' + percent + '%' : '');
    }

    function hideProgress() {
        progress.hidden = true;
        progressBar.style.width = '0%';
        progressBar.parentElement.setAttribute('aria-valuenow', '0');
        progressText.textContent = '';
    }

    function humanBytes(bytes) {
        if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function resetResult() {
        result.value = '';
        copyButton.disabled = true;
        cleanButton.disabled = true;
        editorButton.disabled = true;
    }

    function revokePreview() {
        if (!selectedUrl) return;
        URL.revokeObjectURL(selectedUrl);
        selectedUrl = null;
    }

    function setBusy(value) {
        busy = Boolean(value);
        startButton.disabled = busy || !selected;
        fileInput.disabled = busy;
        clearButton.disabled = busy && !selected;
        cancelButton.hidden = !busy;
    }

    function validateFile(file) {
        if (!file) return Promise.reject(new Error('no-file'));
        if (ALLOWED_TYPES.indexOf(file.type) < 0) return Promise.reject(new Error('unsupported-type'));
        if (file.size > MAX_FILE_BYTES) return Promise.reject(new Error('file-too-large'));
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function () {
                var width = image.naturalWidth || 0;
                var height = image.naturalHeight || 0;
                URL.revokeObjectURL(url);
                if (!width || !height) return reject(new Error('image-decode'));
                if (width * height > MAX_PIXELS) return reject(new Error('image-too-large'));
                resolve({ file: file, width: width, height: height });
            };
            image.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image-decode')); };
            image.src = url;
        });
    }

    function friendlyError(error) {
        var code = error && error.message || '';
        if (code === 'unsupported-type') return 'Choose a PNG, JPEG or WebP image.';
        if (code === 'file-too-large') return 'That image is larger than 12 MB. Choose a smaller image.';
        if (code === 'image-too-large') return 'That image has too many pixels for safe browser OCR. Resize it below roughly 20 megapixels and try again.';
        if (code === 'image-decode') return 'The browser could not read that image.';
        if (code === 'no-file') return 'Choose an Urdu image first.';
        return 'Urdu OCR could not finish. Try a clearer or smaller image and run it again.';
    }

    function selectFile(file) {
        if (busy) return;
        setNotice('');
        validateFile(file).then(function (data) {
            revokePreview();
            selected = data;
            selectedUrl = URL.createObjectURL(file);
            previewImage.src = selectedUrl;
            preview.hidden = false;
            imageMeta.textContent = data.width + ' × ' + data.height + ' · ' + humanBytes(file.size);
            setStatus('Image ready');
            resetResult();
            hideProgress();
            startButton.disabled = false;
        }).catch(function (error) {
            selected = null;
            preview.hidden = true;
            startButton.disabled = true;
            setStatus('Choose an image');
            setNotice(friendlyError(error), 'error');
        });
    }

    function loadTesseract() {
        if (window.Tesseract && typeof window.Tesseract.createWorker === 'function') return Promise.resolve(window.Tesseract);
        if (root._tesseractLoader) return root._tesseractLoader;
        root._tesseractLoader = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = TESSERACT_SCRIPT;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.setAttribute('data-urdu-ocr-runtime', TESSERACT_VERSION);
            script.onload = function () {
                if (window.Tesseract && typeof window.Tesseract.createWorker === 'function') resolve(window.Tesseract);
                else reject(new Error('ocr-runtime'));
            };
            script.onerror = function () { reject(new Error('ocr-runtime')); };
            document.head.appendChild(script);
        }).catch(function (error) {
            root._tesseractLoader = null;
            throw error;
        });
        return root._tesseractLoader;
    }

    function progressLabel(message) {
        var status = String(message && message.status || '').replace(/_/g, ' ');
        if (/loading tesseract core/i.test(status)) return 'Loading OCR engine';
        if (/loading language traineddata/i.test(status)) return 'Loading Urdu language model';
        if (/initializing tesseract/i.test(status)) return 'Preparing Urdu OCR';
        if (/recognizing text/i.test(status)) return 'Reading Urdu text';
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Preparing OCR';
    }

    function ensureWorker(token) {
        if (worker) return Promise.resolve(worker);
        if (workerPromise) return workerPromise;
        setProgress(0, 'Loading OCR engine');
        workerPromise = loadTesseract().then(function (Tesseract) {
            return Tesseract.createWorker('urd', Tesseract.OEM && Tesseract.OEM.LSTM_ONLY || 1, {
                logger: function (message) {
                    if (token !== runToken) return;
                    setProgress(message.progress || 0, progressLabel(message));
                },
                errorHandler: function () { }
            }).then(function (created) {
                worker = created;
                var psm = Tesseract.PSM && Tesseract.PSM.SPARSE_TEXT || '11';
                return worker.setParameters({ tessedit_pageseg_mode: psm, preserve_interword_spaces: '1' }).then(function () {
                    return worker;
                });
            });
        }).finally(function () {
            workerPromise = null;
        });
        return workerPromise;
    }

    function loadImageForOcr(data) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(data.file);
            var image = new Image();
            image.onload = function () {
                URL.revokeObjectURL(url);
                var longest = Math.max(image.naturalWidth, image.naturalHeight);
                if (longest <= MAX_OCR_EDGE) return resolve(data.file);
                var scale = MAX_OCR_EDGE / longest;
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                var context = canvas.getContext('2d', { alpha: false });
                if (!context) return reject(new Error('canvas-unavailable'));
                context.fillStyle = '#fff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            };
            image.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image-decode')); };
            image.src = url;
        });
    }

    function startOcr() {
        if (busy || !selected) return;
        var token = ++runToken;
        setBusy(true);
        resetResult();
        setNotice('');
        setStatus('OCR running');
        setProgress(0, 'Preparing Urdu OCR');
        var startedAt = performance.now();

        Promise.all([ensureWorker(token), loadImageForOcr(selected)]).then(function (values) {
            if (token !== runToken) return null;
            setProgress(.02, 'Reading Urdu text');
            return values[0].recognize(values[1]);
        }).then(function (response) {
            if (!response || token !== runToken) return;
            var text = String(response.data && response.data.text || '').replace(/\r\n?/g, '\n').trim();
            result.value = text;
            if (!text) {
                setStatus('No text detected');
                setNotice('No useful Urdu text was detected. Try a clearer crop, a higher-resolution image, or text with stronger contrast.', 'error');
                return;
            }
            var seconds = Math.max(.1, (performance.now() - startedAt) / 1000);
            copyButton.disabled = false;
            cleanButton.disabled = false;
            editorButton.disabled = false;
            setStatus('Text extracted');
            setNotice('Urdu text extracted in about ' + seconds.toFixed(1) + ' seconds. OCR can make mistakes—review names, numbers and punctuation before using it.', 'success');
        }).catch(function (error) {
            if (token !== runToken) return;
            setStatus('OCR failed');
            setNotice(friendlyError(error), 'error');
        }).finally(function () {
            if (token !== runToken) return;
            setBusy(false);
            hideProgress();
        });
    }

    function cancelOcr() {
        if (!busy) return;
        runToken += 1;
        setBusy(false);
        hideProgress();
        setStatus(selected ? 'Image ready' : 'Choose an image');
        setNotice('OCR cancelled.', '');
        if (worker) {
            var old = worker;
            worker = null;
            try { old.terminate(); } catch (error) { }
        }
        workerPromise = null;
    }

    function clearAll() {
        if (busy) cancelOcr();
        selected = null;
        fileInput.value = '';
        revokePreview();
        previewImage.removeAttribute('src');
        preview.hidden = true;
        imageMeta.textContent = '';
        resetResult();
        hideProgress();
        setStatus('Choose an image');
        setNotice('');
        startButton.disabled = true;
    }

    function copyText() {
        var text = String(result.value || '');
        if (!text) return;
        var promise;
        if (navigator.clipboard && window.isSecureContext) promise = navigator.clipboard.writeText(text);
        else {
            result.focus();
            result.select();
            promise = document.execCommand('copy') ? Promise.resolve() : Promise.reject(new Error('copy'));
        }
        promise.then(function () { setNotice('Extracted Urdu text copied to the clipboard.', 'success'); })
            .catch(function () { setNotice('Copy was blocked. Select the result and copy it manually.', 'error'); });
    }

    function handoff(target) {
        var text = String(result.value || '');
        if (!text) return;
        var Handoff = window.WriteUrduTextHandoff;
        if (Handoff && Handoff.store(text, target)) {
            window.location.assign(target);
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () { window.location.assign(target); }).catch(function () {
                setNotice('Your browser blocked the session handoff. Copy the text first, then open the next tool.', 'error');
            });
        } else setNotice('Your browser blocked the session handoff. Copy the text first, then open the next tool.', 'error');
    }

    fileInput.addEventListener('change', function () { if (fileInput.files && fileInput.files[0]) selectFile(fileInput.files[0]); });
    startButton.addEventListener('click', startOcr);
    cancelButton.addEventListener('click', cancelOcr);
    clearButton.addEventListener('click', clearAll);
    copyButton.addEventListener('click', copyText);
    cleanButton.addEventListener('click', function () { handoff('/urdu-text-cleaner'); });
    editorButton.addEventListener('click', function () { handoff('/'); });

    ['dragenter', 'dragover'].forEach(function (name) {
        dropzone.addEventListener(name, function (event) {
            event.preventDefault();
            if (!busy) dropzone.classList.add('is-dragging');
        });
    });
    ['dragleave', 'drop'].forEach(function (name) {
        dropzone.addEventListener(name, function (event) {
            event.preventDefault();
            dropzone.classList.remove('is-dragging');
        });
    });
    dropzone.addEventListener('drop', function (event) {
        if (busy) return;
        var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) selectFile(file);
    });

    window.addEventListener('pagehide', function () {
        revokePreview();
        if (worker) {
            try { worker.terminate(); } catch (error) { }
            worker = null;
        }
    });

    clearAll();
}());
