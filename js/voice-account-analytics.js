(function () {
  'use strict';

  var ENDPOINT = '/api/voice-account-events';
  var SESSION_KEY = 'write-urdu:telemetry-session:v1';
  var TRACKED_PREFIX = 'write-urdu:voice-analytics:v1:';
  var VOICE_TRY_COOKIE = 'wu_voice_tried';
  var ACTIVE_STATES = { listening: true, 'hearing-speech': true };

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
    else for (var i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(bytes, function (value) { return value.toString(16).padStart(2, '0'); }).join('');
  }

  function sessionId() {
    try {
      var existing = window.sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var created = randomId();
      window.sessionStorage.setItem(SESSION_KEY, created);
      return created;
    } catch (error) {
      return randomId();
    }
  }

  var session = sessionId();
  var memoryTracked = Object.create(null);
  var voiceStartLength = 0;

  function storageKey(eventName) {
    return TRACKED_PREFIX + eventName;
  }

  function wasTracked(eventName) {
    if (memoryTracked[eventName]) return true;
    try {
      return window.sessionStorage.getItem(storageKey(eventName)) === '1';
    } catch (error) {
      return false;
    }
  }

  function markTracked(eventName) {
    memoryTracked[eventName] = true;
    try { window.sessionStorage.setItem(storageKey(eventName), '1'); } catch (error) { }
  }

  function trackOnce(eventName) {
    if (wasTracked(eventName)) return false;
    markTracked(eventName);
    var body = JSON.stringify({
      event_id: randomId(),
      session_id: session,
      event_name: eventName
    });
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'same-origin'
      }).catch(function () { });
    } catch (error) { }
    return true;
  }

  function markVoiceTry() {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = VOICE_TRY_COOKIE + '=1; Path=/; Max-Age=86400; SameSite=Lax' + secure;
  }

  function voiceState(root) {
    return String(root.getAttribute('data-voice-state') || '').toLowerCase();
  }

  function textLength(transcript) {
    return String(transcript.value || '').trim().length;
  }

  function init() {
    var root = document.querySelector('[data-urdu-voice-typing]');
    if (!root) return;
    var start = root.querySelector('[data-voice-start]');
    var transcript = root.querySelector('#voiceTranscript');
    if (!start || !transcript) return;

    trackOnce('voice_page_viewed');

    start.addEventListener('click', function () {
      voiceStartLength = textLength(transcript);
      markVoiceTry();
      trackOnce('voice_typing_started');
    });

    transcript.addEventListener('input', function (event) {
      if (event.isTrusted) return;
      if (!wasTracked('voice_typing_started')) return;
      if (!ACTIVE_STATES[voiceState(root)]) return;
      if (textLength(transcript) <= voiceStartLength) return;
      trackOnce('voice_transcript_received');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
