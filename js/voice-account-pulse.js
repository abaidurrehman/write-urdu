(function () {
  'use strict';

  var days = 7;
  var number = new Intl.NumberFormat('en-US');

  function q(selector) { return document.querySelector(selector); }
  function qa(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function fmt(value) { return number.format(Number(value || 0)); }
  function percent(value) { return (Number(value || 0) * 100).toFixed(1).replace(/\.0$/, '') + '%'; }

  function setValue(key, value, formatter) {
    var node = q('[data-voice-kpi="' + key + '"]');
    if (node) node.textContent = (formatter || fmt)(value);
  }

  function renderBars(items) {
    var container = q('#voiceAccountBars');
    if (!container) return;
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = '<div class="os-empty">No voice activity yet for this period.</div>';
      return;
    }
    var max = Math.max.apply(null, items.map(function (item) { return Number(item.value || 0); }).concat([1]));
    items.forEach(function (item) {
      var value = Number(item.value || 0);
      var row = document.createElement('div');
      row.className = 'os-bar-row';

      var label = document.createElement('div');
      label.className = 'os-bar-label';
      label.textContent = item.label;

      var track = document.createElement('div');
      track.className = 'os-bar-track';
      var fill = document.createElement('div');
      fill.className = 'os-bar-fill';
      fill.style.width = Math.max(2, (value / max) * 100) + '%';
      track.appendChild(fill);

      var valueNode = document.createElement('div');
      valueNode.className = 'os-bar-value';
      valueNode.textContent = fmt(value);

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(valueNode);
      container.appendChild(row);
    });
  }

  function render(data) {
    if (!data.ready) return;
    var current = data.current || {};
    var pageSessions = Number(current.voice_page_sessions || 0);
    var tries = Number(current.voice_try_sessions || 0);

    setValue('voice_page_sessions', pageSessions);
    setValue('voice_try_sessions', tries);
    setValue('voice_success_sessions', current.voice_success_sessions);
    setValue('voice_success_rate', current.voice_success_rate, percent);
    setValue('account_signups', current.account_signups);
    setValue('voice_assisted_signups', current.voice_assisted_signups);

    var tryRate = q('[data-voice-meta="try_rate"]');
    if (tryRate) tryRate.textContent = pageSessions ? percent(tries / pageSessions) + ' of voice visitors tried it' : 'Waiting for voice visitors';

    var totalAccounts = q('[data-voice-meta="total_accounts"]');
    if (totalAccounts) totalAccounts.textContent = fmt(data.total_accounts) + ' total registered accounts';

    var signupRate = q('[data-voice-meta="voice_signup_rate"]');
    if (signupRate) signupRate.textContent = tries ? percent(current.voice_signup_rate) + ' of voice-try sessions' : 'Same-browser 24h marker';

    renderBars([
      { label: 'Voice visitors', value: pageSessions },
      { label: 'Tried voice typing', value: tries },
      { label: 'Produced Urdu text', value: current.voice_success_sessions },
      { label: 'Voice-assisted sign-ups', value: current.voice_assisted_signups }
    ].filter(function (item) { return Number(item.value || 0) > 0; }));

    var note = q('#voiceAccountNote');
    if (note) {
      var latest = current.latest_event_at ? ' · latest event ' + new Date(current.latest_event_at).toLocaleString() : '';
      note.textContent = days + 'd anonymous voice sessions + aggregate account creation' + latest;
    }
  }

  async function load() {
    try {
      var response = await fetch('/api/internal/voice-account-pulse?days=' + days, {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Voice & Accounts metrics unavailable');
      render(await response.json());
    } catch (error) {
      var note = q('#voiceAccountNote');
      if (note) note.textContent = 'Voice & Accounts metrics unavailable';
    }
  }

  qa('[data-days]').forEach(function (button) {
    button.addEventListener('click', function () {
      days = Number(button.getAttribute('data-days') || 7);
      load();
    });
  });

  var refresh = q('#refreshPulse');
  if (refresh) refresh.addEventListener('click', load);
  load();
}());
