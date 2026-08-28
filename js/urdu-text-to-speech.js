(function (root, document) {
  'use strict';

  var page = document.querySelector('[data-urdu-text-to-speech]');
  if (!page) return;

  var synth = root.speechSynthesis;
  var SpeechUtterance = root.SpeechSynthesisUtterance;
  var textarea = page.querySelector('#ttsText');
  var listenButton = page.querySelector('[data-tts-listen]');
  var pauseButton = page.querySelector('[data-tts-pause]');
  var stopButton = page.querySelector('[data-tts-stop]');
  var sampleButton = page.querySelector('[data-tts-sample]');
  var clearButton = page.querySelector('[data-tts-clear]');
  var count = page.querySelector('[data-tts-count]');
  var statusPill = page.querySelector('[data-tts-status-pill]');
  var supportMessage = page.querySelector('[data-tts-support-message]');
  var nowReading = page.querySelector('[data-tts-now-reading]');
  var voiceField = page.querySelector('[data-tts-voice-field]');
  var voiceSelect = page.querySelector('[data-tts-voice]');
  var rateSelect = page.querySelector('[data-tts-rate]');

  var SAMPLE_TEXT = 'السلام علیکم! یہ رائٹ اردو کا اردو سننے والا نیا تجربہ ہے۔ اگر آپ یہ آواز صاف سن رہے ہیں تو ہمیں ضرور بتائیں کہ تلفظ اور رفتار کیسی لگ رہی ہے۔';
  var urduVoices = [];
  var chunks = [];
  var chunkIndex = 0;
  var activeUtterance = null;
  var stoppedByUser = false;
  var loadAttempts = 0;

  function normalizeLanguage(value) {
    return String(value || '').toLowerCase().replace('_', '-');
  }

  function isUrduVoice(voice) {
    return normalizeLanguage(voice && voice.lang).indexOf('ur') === 0;
  }

  function selectedVoice() {
    if (!urduVoices.length) return null;
    var index = parseInt(voiceSelect.value, 10);
    if (!Number.isFinite(index) || !urduVoices[index]) index = 0;
    return urduVoices[index];
  }

  function setState(state) {
    page.setAttribute('data-reader-state', state);
  }

  function setStatus(text, warning) {
    supportMessage.textContent = text;
    supportMessage.classList.toggle('is-warning', Boolean(warning));
  }

  function updateTextState() {
    var length = textarea.value.length;
    count.textContent = String(length);
    clearButton.disabled = length === 0;
    listenButton.disabled = !urduVoices.length || !textarea.value.trim();
  }

  function populateVoiceOptions() {
    if (!synth || !SpeechUtterance) {
      statusPill.textContent = 'Not supported here';
      setStatus('This browser does not offer a built-in text reader. Please try another browser or device.', true);
      setState('unsupported');
      listenButton.disabled = true;
      return;
    }

    var voices = synth.getVoices ? synth.getVoices() : [];
    urduVoices = Array.prototype.filter.call(voices || [], isUrduVoice);

    voiceSelect.innerHTML = '';
    urduVoices.forEach(function (voice, index) {
      var option = document.createElement('option');
      option.value = String(index);
      option.textContent = voice.name + (voice.lang ? ' — ' + voice.lang : '');
      voiceSelect.appendChild(option);
    });

    voiceField.hidden = urduVoices.length < 2;

    if (urduVoices.length) {
      statusPill.textContent = urduVoices.length === 1 ? 'Urdu voice ready' : urduVoices.length + ' Urdu voices ready';
      setStatus('Urdu reading is ready on this device. Add some text and tap Listen.', false);
      setState('ready');
      updateTextState();
      return;
    }

    loadAttempts += 1;
    if (!voices.length && loadAttempts < 5) {
      statusPill.textContent = 'Checking Urdu voice';
      setStatus('Looking for an Urdu reading voice on this device…', false);
      root.setTimeout(populateVoiceOptions, 450 * loadAttempts);
      return;
    }

    statusPill.textContent = 'No Urdu voice found';
    setStatus('An Urdu reading voice is not available on this device right now. Try another browser or device, or add Urdu as a spoken language in your device settings.', true);
    setState('unavailable');
    listenButton.disabled = true;
  }

  function splitForSpeech(text) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return [];

    var pieces = clean.match(/[^۔؟!?]+[۔؟!?]?/g) || [clean];
    var result = [];

    pieces.forEach(function (piece) {
      var remaining = piece.trim();
      while (remaining.length > 220) {
        var cut = remaining.lastIndexOf(' ', 220);
        if (cut < 80) cut = 220;
        result.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut).trim();
      }
      if (remaining) result.push(remaining);
    });

    return result;
  }

  function finishPlayback(message) {
    activeUtterance = null;
    chunks = [];
    chunkIndex = 0;
    setState(urduVoices.length ? 'ready' : 'unavailable');
    statusPill.textContent = urduVoices.length ? (urduVoices.length === 1 ? 'Urdu voice ready' : urduVoices.length + ' Urdu voices ready') : 'No Urdu voice found';
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
    stopButton.disabled = true;
    nowReading.textContent = message || '';
    updateTextState();
  }

  function speakNextChunk() {
    if (stoppedByUser || chunkIndex >= chunks.length) {
      finishPlayback(stoppedByUser ? '' : 'Finished reading.');
      return;
    }

    var voice = selectedVoice();
    if (!voice) {
      finishPlayback('Urdu voice is no longer available.');
      populateVoiceOptions();
      return;
    }

    var utterance = new SpeechUtterance(chunks[chunkIndex]);
    activeUtterance = utterance;
    utterance.voice = voice;
    utterance.lang = voice.lang || 'ur-PK';
    utterance.rate = parseFloat(rateSelect.value) || 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = function () {
      setState('speaking');
      statusPill.textContent = 'Reading Urdu';
      nowReading.textContent = chunks.length > 1 ? 'Reading part ' + (chunkIndex + 1) + ' of ' + chunks.length : 'Reading…';
      pauseButton.disabled = false;
      stopButton.disabled = false;
      listenButton.disabled = true;
    };

    utterance.onend = function () {
      if (stoppedByUser) return;
      chunkIndex += 1;
      speakNextChunk();
    };

    utterance.onerror = function (event) {
      if (stoppedByUser || (event && event.error === 'canceled')) return;
      statusPill.textContent = 'Could not read';
      setStatus('The device could not read this text with the selected Urdu voice. Try a shorter sentence or another available Urdu voice.', true);
      finishPlayback('Reading stopped.');
    };

    synth.speak(utterance);
  }

  function startPlayback() {
    var text = textarea.value.trim();
    if (!text || !urduVoices.length || !synth) return;

    synth.cancel();
    stoppedByUser = false;
    chunks = splitForSpeech(text);
    chunkIndex = 0;
    statusPill.textContent = 'Starting…';
    setStatus('Using ' + selectedVoice().name + ' on this device.', false);
    speakNextChunk();
  }

  function togglePause() {
    if (!synth || !synth.speaking) return;
    if (synth.paused) {
      synth.resume();
      pauseButton.textContent = 'Pause';
      statusPill.textContent = 'Reading Urdu';
      setState('speaking');
      nowReading.textContent = 'Reading…';
    } else {
      synth.pause();
      pauseButton.textContent = 'Resume';
      statusPill.textContent = 'Paused';
      setState('paused');
      nowReading.textContent = 'Paused.';
    }
  }

  function stopPlayback() {
    if (!synth) return;
    stoppedByUser = true;
    synth.cancel();
    finishPlayback('Stopped.');
  }

  textarea.addEventListener('input', updateTextState);
  listenButton.addEventListener('click', startPlayback);
  pauseButton.addEventListener('click', togglePause);
  stopButton.addEventListener('click', stopPlayback);

  sampleButton.addEventListener('click', function () {
    textarea.value = SAMPLE_TEXT;
    textarea.focus();
    updateTextState();
  });

  clearButton.addEventListener('click', function () {
    stopPlayback();
    textarea.value = '';
    nowReading.textContent = '';
    textarea.focus();
    updateTextState();
  });

  voiceSelect.addEventListener('change', function () {
    if (synth && synth.speaking) stopPlayback();
    var voice = selectedVoice();
    if (voice) setStatus('Selected ' + voice.name + ' (' + voice.lang + ').', false);
  });

  rateSelect.addEventListener('change', function () {
    if (synth && synth.speaking) {
      stopPlayback();
      nowReading.textContent = 'Speed changed. Tap Listen to start again.';
    }
  });

  root.addEventListener('beforeunload', function () {
    if (synth) synth.cancel();
  });

  if (synth && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', populateVoiceOptions);
  } else if (synth) {
    synth.onvoiceschanged = populateVoiceOptions;
  }

  updateTextState();
  populateVoiceOptions();
})(window, document);
