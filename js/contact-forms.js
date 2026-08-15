(function () {
  'use strict';

  var CONFIG_ENDPOINT = '/api/form-config';
  var SUBMISSION_ENDPOINT = '/api/messages';
  var turnstileLoader;

  function setStatus(element, message, state) {
    if (!element) return;
    element.textContent = message || '';
    element.dataset.state = state || '';
  }

  function showFallback(form) {
    var fallback = form.querySelector('[data-form-fallback]');
    if (fallback) fallback.hidden = false;
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileLoader) return turnstileLoader;

    turnstileLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', function () { resolve(window.turnstile); }, { once: true });
      script.addEventListener('error', function () { reject(new Error('Spam protection could not load.')); }, { once: true });
      document.head.appendChild(script);
    });

    return turnstileLoader;
  }

  function getFormConfiguration() {
    return fetch(CONFIG_ENDPOINT, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store'
    }).then(function (response) {
      if (!response.ok) throw new Error('The message form is not available yet.');
      return response.json();
    });
  }

  function formPayload(form) {
    var data = new FormData(form);
    var payload = {};
    data.forEach(function (value, key) { payload[key] = value; });
    return payload;
  }

  function readJson(response) {
    return response.json().catch(function () { return {}; });
  }

  function enhanceForm(form) {
    var formType = form.dataset.formType;
    var submitButton = form.querySelector('[data-message-submit]');
    var submitLabel = submitButton && submitButton.querySelector('span');
    var originalLabel = submitLabel ? submitLabel.textContent : 'Send';
    var submittingLabel = formType === 'feedback' ? 'Sending feedback…' : 'Sending message…';
    var status = form.querySelector('[data-message-status]');
    var startedAt = form.querySelector('[data-started-at]');
    var turnstileSlot = form.querySelector('[data-turnstile-slot]');
    var turnstileNote = form.querySelector('[data-turnstile-note]');
    var widgetId;

    if (!submitButton || !startedAt || !turnstileSlot) return;
    startedAt.value = String(Date.now());

    getFormConfiguration().then(function (config) {
      if (!config.configured || !config.turnstileSiteKey) {
        throw new Error('The secure message form is being configured. Use the email option for now.');
      }
      return loadTurnstile().then(function (turnstile) {
        widgetId = turnstile.render(turnstileSlot, {
          sitekey: config.turnstileSiteKey,
          action: formType,
          theme: 'light',
          callback: function () {
            submitButton.disabled = false;
            if (turnstileNote) turnstileNote.textContent = 'Spam protection complete.';
          },
          'expired-callback': function () {
            submitButton.disabled = true;
            if (turnstileNote) turnstileNote.textContent = 'Spam check expired. Please complete it again.';
          },
          'error-callback': function () {
            submitButton.disabled = true;
            if (turnstileNote) turnstileNote.textContent = 'Spam protection could not be verified. Please retry or use email.';
            showFallback(form);
          }
        });
        if (turnstileNote) turnstileNote.textContent = 'Complete the spam check to enable sending.';
      });
    }).catch(function (error) {
      submitButton.disabled = true;
      if (turnstileNote) turnstileNote.textContent = error.message;
      showFallback(form);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity() || submitButton.disabled) return;

      submitButton.disabled = true;
      submitButton.dataset.loading = 'true';
      if (submitLabel) submitLabel.textContent = submittingLabel;
      setStatus(status, '', '');

      fetch(SUBMISSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(formPayload(form))
      }).then(function (response) {
        return readJson(response).then(function (result) {
          if (!response.ok || !result.ok) throw new Error(result.message || 'Your message could not be sent. Please try again.');
          form.reset();
          startedAt.value = String(Date.now());
          if (window.turnstile && widgetId !== undefined) window.turnstile.reset(widgetId);
          if (turnstileNote) turnstileNote.textContent = 'Complete the spam check to send another message.';
          setStatus(status, result.message || 'Thank you—your message was sent.', 'success');
        });
      }).catch(function (error) {
        if (window.turnstile && widgetId !== undefined) window.turnstile.reset(widgetId);
        if (turnstileNote) turnstileNote.textContent = 'Complete the spam check to try again, or use email.';
        setStatus(status, error.message, 'error');
        showFallback(form);
      }).finally(function () {
        submitButton.dataset.loading = 'false';
        if (submitLabel) submitLabel.textContent = originalLabel;
      });
    });
  }

  document.querySelectorAll('[data-message-form]').forEach(enhanceForm);
}());
