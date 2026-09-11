(function () {
    'use strict';

    var root = document.querySelector('[data-audio-transcription]');
    var core = window.WriteUrduAudioTranscriptionCore;
    if (!root || !core) return;

    var languageSelect = root.querySelector('[data-audio-language]');
    var fileInput = root.querySelector('[data-audio-file]');
    var audioPreview = root.querySelector('[data-audio-preview]');
    var fileMeta = root.querySelector('[data-audio-file-meta]');
    var transcribeButton = root.querySelector('[data-audio-transcribe]');
    var translateButton = root.querySelector('[data-audio-translate]');
    var copyTranscriptButton = root.querySelector('[data-audio-copy-transcript]');
    var copyTranslationButton = root.querySelector('[data-audio-copy-translation]');
    var clearButton = root.querySelector('[data-audio-clear]');
    var transcript = root.querySelector('[data-audio-transcript]');
    var translation = root.querySelector('[data-audio-translation]');
    var transcriptLabel = root.querySelector('[data-audio-transcript-label]');
    var translationLabel = root.querySelector('[data-audio-translation-label]');
    var status = root.querySelector('[data-audio-status]');
    var notice = root.querySelector('[data-audio-notice]');

    var selectedFile = null;
    var selectedDuration = null;
    var selectedObjectUrl = null;
    var metadataReady = false;
    var transcribing = false;
    var translating = false;

    function setStatus(text, state) {
        status.textContent = text;
        status.setAttribute('data-state', state || 'idle');
    }

    function setNotice(text, state) {
        notice.textContent = text || '';
        notice.setAttribute('data-state', state || 'idle');
    }

    function formatBytes(bytes) {
        var mb = Number(bytes || 0) / (1024 * 1024);
        return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.max(1, Math.round(Number(bytes || 0) / 1024)) + ' KB';
    }

    function formatDuration(seconds) {
        var whole = Math.max(0, Math.round(Number(seconds || 0)));
        var minutes = Math.floor(whole / 60);
        var remainder = whole % 60;
        return minutes + ':' + String(remainder).padStart(2, '0');
    }

    function revokePreview() {
        if (selectedObjectUrl) URL.revokeObjectURL(selectedObjectUrl);
        selectedObjectUrl = null;
        audioPreview.removeAttribute('src');
        audioPreview.load();
    }

    function applyLanguageUi(clearOutput) {
        var config = core.language(languageSelect.value);
        transcript.setAttribute('lang', config.code);
        transcript.setAttribute('dir', config.transcriptDir);
        transcript.classList.toggle('audio-transcription-urdu-text', config.code === 'ur');
        translation.setAttribute('lang', config.translateTo);
        translation.setAttribute('dir', config.translateTo === 'ur' ? 'rtl' : 'ltr');
        translation.classList.toggle('audio-transcription-urdu-text', config.translateTo === 'ur');
        transcriptLabel.textContent = config.label + ' transcript';
        translationLabel.textContent = config.translateTo === 'ur' ? 'Urdu translation' : 'English translation';
        translateButton.textContent = config.translateLabel;
        if (clearOutput) {
            transcript.value = '';
            translation.value = '';
            setNotice('Language changed. The selected audio stays local until you press Transcribe.', 'info');
        }
        updateActions();
    }

    function currentFileValidation() {
        if (!selectedFile) return { ok: false, error: 'no_file' };
        if (!metadataReady) return { ok: false, error: 'audio_metadata_unavailable' };
        return core.validateFile(selectedFile, selectedDuration);
    }

    function updateActions() {
        var fileValidation = currentFileValidation();
        var transcriptReady = Boolean(core.cleanText(transcript.value));
        var translationReady = Boolean(core.cleanText(translation.value));
        transcribeButton.disabled = !fileValidation.ok || transcribing || translating;
        translateButton.disabled = !transcriptReady || transcribing || translating;
        copyTranscriptButton.disabled = !transcriptReady;
        copyTranslationButton.disabled = !translationReady;
        clearButton.disabled = !selectedFile && !transcriptReady && !translationReady;
    }

    function resetOutputs() {
        transcript.value = '';
        translation.value = '';
        updateActions();
    }

    function handleSelectedFile(file) {
        revokePreview();
        selectedFile = file || null;
        selectedDuration = null;
        metadataReady = false;
        resetOutputs();

        if (!selectedFile) {
            fileMeta.textContent = 'No audio selected.';
            setStatus('Waiting for audio', 'idle');
            setNotice('Choose a short Urdu or English voice note. Nothing is uploaded when you select a file.', 'info');
            updateActions();
            return;
        }

        var initialValidation = core.validateFile(selectedFile);
        if (!initialValidation.ok) {
            fileMeta.textContent = selectedFile.name + ' · ' + formatBytes(selectedFile.size);
            setStatus('Choose another file', 'error');
            setNotice(core.friendlyFileError(initialValidation.error), 'error');
            updateActions();
            return;
        }

        selectedObjectUrl = URL.createObjectURL(selectedFile);
        audioPreview.src = selectedObjectUrl;
        fileMeta.textContent = selectedFile.name + ' · ' + formatBytes(selectedFile.size) + ' · reading duration…';
        setStatus('Reading audio details', 'busy');
        setNotice('The file is still local. Press Transcribe only after you review the selected file.', 'info');
        audioPreview.load();
        updateActions();
    }

    audioPreview.addEventListener('loadedmetadata', function () {
        if (!selectedFile) return;
        selectedDuration = Number(audioPreview.duration);
        metadataReady = Number.isFinite(selectedDuration) && selectedDuration > 0;
        var validation = core.validateFile(selectedFile, selectedDuration);
        fileMeta.textContent = selectedFile.name + ' · ' + formatBytes(selectedFile.size) + (metadataReady ? ' · ' + formatDuration(selectedDuration) : '');
        if (!validation.ok) {
            setStatus('Choose another file', 'error');
            setNotice(core.friendlyFileError(validation.error), 'error');
        } else {
            setStatus('Ready to transcribe', 'ready');
            setNotice('Nothing has been uploaded yet. Press Transcribe to send this audio for speech recognition.', 'info');
        }
        updateActions();
    });

    audioPreview.addEventListener('error', function () {
        if (!selectedFile) return;
        metadataReady = false;
        setStatus('Audio unavailable', 'error');
        setNotice(core.friendlyFileError('audio_metadata_unavailable'), 'error');
        updateActions();
    });

    async function transcribeSelectedAudio() {
        var validation = currentFileValidation();
        if (!validation.ok) {
            setNotice(core.friendlyFileError(validation.error), 'error');
            return;
        }

        transcribing = true;
        setStatus('Transcribing', 'busy');
        setNotice('Uploading this audio once for transcription. WriteUrdu does not save the audio file.', 'info');
        updateActions();

        try {
            var response = await fetch(core.transcriptionUrl(languageSelect.value), {
                method: 'POST',
                headers: { 'content-type': validation.contentType },
                body: selectedFile
            });
            var payload = await response.json().catch(function () { return null; });
            if (!response.ok || !payload || payload.ok !== true || typeof payload.transcript !== 'string') {
                throw { code: payload && payload.error ? payload.error : 'transcription_unavailable' };
            }
            transcript.value = payload.transcript.trim();
            translation.value = '';
            setStatus('Transcript ready', 'ready');
            setNotice('Transcript ready. Review and correct it before translating or copying.', 'success');
        } catch (error) {
            setStatus('Transcription unavailable', 'error');
            setNotice(core.friendlyTranscriptionError(error && error.code), 'error');
        } finally {
            transcribing = false;
            updateActions();
        }
    }

    async function translateTranscript() {
        var request = core.buildTranslationRequest(languageSelect.value, transcript.value);
        if (!request.ok) {
            setNotice(request.error === 'text_too_long' ? 'Shorten the transcript to 5,000 characters or fewer before translating.' : 'Add or review the transcript first.', 'error');
            return;
        }

        translating = true;
        setStatus('Translating', 'busy');
        setNotice('Sending only the reviewed transcript for translation…', 'info');
        updateActions();

        try {
            var response = await fetch('/api/language-translate', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(request.body)
            });
            var payload = await response.json().catch(function () { return null; });
            if (!response.ok || !payload || payload.ok !== true || typeof payload.translation !== 'string') {
                throw { code: payload && payload.error ? payload.error : 'translation_unavailable' };
            }
            translation.value = payload.translation.trim();
            setStatus('Translation ready', 'ready');
            setNotice('Translation ready. Review it before copying or using it.', 'success');
        } catch (error) {
            setStatus('Translation unavailable', 'error');
            var code = error && error.code;
            setNotice(code === 'translation_service_not_enabled' ? 'Translation is not enabled yet.' : 'Translation is unavailable right now. You can still use the transcript.', 'error');
        } finally {
            translating = false;
            updateActions();
        }
    }

    async function copyText(value, successMessage) {
        var text = core.cleanText(value);
        if (!text) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                var helper = document.createElement('textarea');
                helper.value = text;
                helper.setAttribute('readonly', '');
                helper.style.position = 'fixed';
                helper.style.opacity = '0';
                document.body.appendChild(helper);
                helper.select();
                document.execCommand('copy');
                document.body.removeChild(helper);
            }
            setNotice(successMessage, 'success');
        } catch (error) {
            setNotice('Copy was blocked. Select the text and copy it manually.', 'error');
        }
    }

    fileInput.addEventListener('change', function () {
        handleSelectedFile(fileInput.files && fileInput.files[0]);
    });
    languageSelect.addEventListener('change', function () { applyLanguageUi(true); });
    transcribeButton.addEventListener('click', transcribeSelectedAudio);
    translateButton.addEventListener('click', translateTranscript);
    copyTranscriptButton.addEventListener('click', function () { copyText(transcript.value, 'Transcript copied.'); });
    copyTranslationButton.addEventListener('click', function () { copyText(translation.value, 'Translation copied.'); });
    transcript.addEventListener('input', function () {
        if (transcript.value.length > 5000) transcript.value = transcript.value.slice(0, 5000);
        translation.value = '';
        updateActions();
    });
    translation.addEventListener('input', updateActions);
    clearButton.addEventListener('click', function () {
        fileInput.value = '';
        selectedFile = null;
        selectedDuration = null;
        metadataReady = false;
        revokePreview();
        transcript.value = '';
        translation.value = '';
        fileMeta.textContent = 'No audio selected.';
        setStatus('Waiting for audio', 'idle');
        setNotice('Cleared. Choose another short voice note when you are ready.', 'info');
        updateActions();
    });
    window.addEventListener('pagehide', revokePreview);

    applyLanguageUi(false);
    handleSelectedFile(null);
}());
