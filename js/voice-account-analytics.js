(function () {
  'use strict';

  var ENDPOINT = '/api/voice-account-events';
  var SESSION_KEY = 'write-urdu:telemetry-session:v1';
  var TRACKED_PREFIX = 'write-urdu:voice-analytics:v1:';
  var VOICE_TRY_COOKIE = 'wu_voice_tried';
  var ACTIVE_STATES = { listening: true, 'hearing-speech': true };
  var READY_NOTE = {
    en: 'Ready when you are. Press Start voice typing and speak Urdu.',
    ur: 'جب آپ تیار ہوں، آواز سے ٹائپنگ شروع کریں دبائیں اور اردو بولیں۔'
  };
  var PERMISSION_HELP = {
    'ios-safari': {
      en: {
        title: 'Enable the microphone on iPhone or iPad',
        steps: [
          'In Safari, open WriteUrdu and tap the Page Menu in the address bar.',
          'Tap More → Website Settings → Microphone → Allow.',
          'If it is still blocked, open iPhone/iPad Settings → Apps → Safari → Microphone and choose Ask or Allow.',
          'Return here, reload the page, then tap Start voice typing again.'
        ]
      },
      ur: {
        title: 'iPhone یا iPad پر مائیک کی اجازت دیں',
        steps: [
          'Safari میں WriteUrdu کھولیں اور ایڈریس بار میں Page Menu دبائیں۔',
          'More → Website Settings → Microphone → Allow منتخب کریں۔',
          'اگر پھر بھی مائیک بند ہو تو Settings → Apps → Safari → Microphone میں Ask یا Allow منتخب کریں۔',
          'اس صفحے پر واپس آئیں، صفحہ دوبارہ لوڈ کریں، پھر آواز سے ٹائپنگ شروع کریں دبائیں۔'
        ]
      }
    },
    'ios-chrome': {
      en: {
        title: 'Enable the microphone in Chrome on iPhone or iPad',
        steps: [
          'In Chrome, tap the microphone icon beside the address bar if it appears, then turn Permissions on.',
          'If Chrome itself is blocked, open iPhone/iPad Settings → Apps → Chrome and turn on Microphone. Turn on Speech Recognition too if it is offered.',
          'Return here, reload the page, then tap Start voice typing again.'
        ]
      },
      ur: {
        title: 'iPhone یا iPad پر Chrome میں مائیک کی اجازت دیں',
        steps: [
          'Chrome میں ایڈریس بار کے ساتھ مائیک کا آئیکن نظر آئے تو اسے دبائیں اور Permissions آن کریں۔',
          'اگر Chrome کی مائیک اجازت بند ہے تو Settings → Apps → Chrome میں Microphone آن کریں۔ Speech Recognition کا آپشن ہو تو اسے بھی آن کریں۔',
          'اس صفحے پر واپس آئیں، صفحہ دوبارہ لوڈ کریں، پھر آواز سے ٹائپنگ شروع کریں دبائیں۔'
        ]
      }
    },
    android: {
      en: {
        title: 'Enable the microphone on Android',
        steps: [
          'In Chrome, tap the site controls icon beside the address bar, then Permissions.',
          'Set Microphone to Allow. If WriteUrdu is still blocked, open Chrome → Settings → Site settings → Microphone and allow write-urdu.com.',
          'Return here, reload the page, then tap Start voice typing again.'
        ]
      },
      ur: {
        title: 'Android پر مائیک کی اجازت دیں',
        steps: [
          'Chrome میں ایڈریس بار کے ساتھ Site controls آئیکن دبائیں، پھر Permissions کھولیں۔',
          'Microphone کو Allow کریں۔ اگر WriteUrdu اب بھی بلاک ہے تو Chrome → Settings → Site settings → Microphone میں write-urdu.com کو Allow کریں۔',
          'اس صفحے پر واپس آئیں، صفحہ دوبارہ لوڈ کریں، پھر آواز سے ٹائپنگ شروع کریں دبائیں۔'
        ]
      }
    },
    other: {
      en: {
        title: 'Enable microphone access',
        steps: [
          'Open this site’s permissions from the icon beside the browser address bar.',
          'Set Microphone to Allow.',
          'Reload the page, then tap Start voice typing again.'
        ]
      },
      ur: {
        title: 'مائیک کی اجازت دیں',
        steps: [
          'براؤزر کی ایڈریس بار کے ساتھ موجود آئیکن سے اس سائٹ کی Permissions کھولیں۔',
          'Microphone کو Allow کریں۔',
          'صفحہ دوبارہ لوڈ کریں، پھر آواز سے ٹائپنگ شروع کریں دبائیں۔'
        ]
      }
    }
  };

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

  function isUrduLocale() {
    return document.documentElement.lang === 'ur';
  }

  function permissionPlatform() {
    var ua = String(window.navigator.userAgent || '');
    var isIOS = /iPad|iPhone|iPod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    if (isIOS && /CriOS/i.test(ua)) return 'ios-chrome';
    if (isIOS) return 'ios-safari';
    if (/Android/i.test(ua)) return 'android';
    return 'other';
  }

  function restoreReadySupportNote(supportNote) {
    if (supportNote.getAttribute('data-voice-permission-help') !== 'true') return;
    supportNote.textContent = READY_NOTE[isUrduLocale() ? 'ur' : 'en'];
    supportNote.classList.remove('is-warning');
    supportNote.removeAttribute('data-voice-permission-help');
    supportNote.removeAttribute('role');
    supportNote.removeAttribute('dir');
  }

  function renderPermissionHelp(root, supportNote) {
    if (voiceState(root) !== 'permission-blocked') {
      restoreReadySupportNote(supportNote);
      return;
    }

    var locale = isUrduLocale() ? 'ur' : 'en';
    var copy = PERMISSION_HELP[permissionPlatform()][locale];
    supportNote.textContent = '';
    supportNote.classList.add('is-warning');
    supportNote.setAttribute('data-voice-permission-help', 'true');
    supportNote.setAttribute('role', 'alert');
    supportNote.setAttribute('dir', locale === 'ur' ? 'rtl' : 'ltr');

    var title = document.createElement('strong');
    title.textContent = copy.title;
    title.style.display = 'block';
    title.style.marginBottom = '0.45rem';

    var steps = document.createElement('ol');
    steps.style.margin = '0';
    steps.style.paddingInlineStart = '1.3rem';
    copy.steps.forEach(function (step) {
      var item = document.createElement('li');
      item.textContent = step;
      item.style.marginTop = '0.35rem';
      steps.appendChild(item);
    });

    supportNote.appendChild(title);
    supportNote.appendChild(steps);
  }

  function init() {
    var root = document.querySelector('[data-urdu-voice-typing]');
    if (!root) return;
    var start = root.querySelector('[data-voice-start]');
    var transcript = root.querySelector('#voiceTranscript');
    var supportNote = root.querySelector('[data-voice-support-note]');
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

    if (supportNote && typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function (mutations) {
        if (mutations.some(function (mutation) { return mutation.attributeName === 'data-voice-state'; })) {
          renderPermissionHelp(root, supportNote);
        }
      });
      observer.observe(root, { attributes: true, attributeFilter: ['data-voice-state'] });
      document.addEventListener('write-urdu:locale-change', function () { renderPermissionHelp(root, supportNote); });
      renderPermissionHelp(root, supportNote);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());