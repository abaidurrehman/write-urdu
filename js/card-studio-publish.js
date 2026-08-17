(function () {
  'use strict';

  var root = document.querySelector('[data-card-studio]');
  var app = window.WriteUrduCardStudioApp;
  var core = window.WriteUrduCardStudio;
  if (!root || !app || !core) return;

  var MANAGEMENT_KEY = 'writeUrdu.shareManagement.v1';
  var ACK_KEY = 'writeUrdu.sharePublishAcknowledged.v1';
  var REFERRAL_KEY = 'writeUrdu.shareReferral.v1';
  var telemetry = null;
  var publishButton = null;
  var manageButton = null;
  var dialog = null;
  var busy = false;

  function ensureStyles() {
    if (document.querySelector('link[href$="/css/card-studio-publish.css"],link[href$="css/card-studio-publish.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/card-studio-publish.css';
    document.head.appendChild(link);
  }

  function ensureTelemetry() {
    return new Promise(function (resolve) {
      if (window.WriteUrduShareTelemetry) {
        telemetry = window.WriteUrduShareTelemetry;
        resolve(telemetry);
        return;
      }
      var existing = document.querySelector('script[src$="/js/share-loop-telemetry.js"]');
      if (existing) {
        existing.addEventListener('load', function () { telemetry = window.WriteUrduShareTelemetry || null; resolve(telemetry); }, { once: true });
        window.setTimeout(function () { telemetry = window.WriteUrduShareTelemetry || null; resolve(telemetry); }, 1200);
        return;
      }
      var script = document.createElement('script');
      script.src = '/js/share-loop-telemetry.js';
      script.onload = function () { telemetry = window.WriteUrduShareTelemetry || null; resolve(telemetry); };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  function track(name, detail) { if (telemetry && telemetry.track) telemetry.track(name, detail || {}); }

  function toast(message, error) {
    var current = document.querySelector('.wu-share-toast');
    if (current) current.remove();
    var node = document.createElement('div');
    node.className = 'wu-share-toast' + (error ? ' is-error' : '');
    node.setAttribute('role', 'status');
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 3200);
  }

  function managementState() {
    try {
      var raw = localStorage.getItem(MANAGEMENT_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.items && typeof parsed.items === 'object' ? parsed : { items: {} };
    } catch (error) {
      return { items: {} };
    }
  }

  function saveManagement(state) {
    try { localStorage.setItem(MANAGEMENT_KEY, JSON.stringify(state)); } catch (error) {}
    syncManageButton();
  }

  function rememberShare(result) {
    var state = managementState();
    state.items[result.id] = { token: result.manageToken, url: result.url, createdAt: new Date().toISOString() };
    var ids = Object.keys(state.items).sort(function (a, b) {
      return String(state.items[b].createdAt || '').localeCompare(String(state.items[a].createdAt || ''));
    });
    ids.slice(40).forEach(function (id) { delete state.items[id]; });
    saveManagement(state);
  }

  function forgetShare(id) {
    var state = managementState();
    delete state.items[id];
    saveManagement(state);
  }

  function syncManageButton() {
    if (!manageButton) return;
    manageButton.hidden = Object.keys(managementState().items).length === 0;
  }

  function getReferral() {
    try {
      var raw = sessionStorage.getItem(REFERRAL_KEY);
      if (!raw) return null;
      var value = JSON.parse(raw);
      if (!value || !/^[A-Za-z0-9]{8,12}$/.test(String(value.id || '')) || Number(value.expiresAt || 0) <= Date.now()) {
        sessionStorage.removeItem(REFERRAL_KEY);
        return null;
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  function saveReferral(value) {
    try { sessionStorage.setItem(REFERRAL_KEY, JSON.stringify(value)); } catch (error) {}
  }

  function markReferredCreationStarted() {
    var referral = getReferral();
    if (!referral || referral.started) return;
    referral.started = true;
    referral.startedAt = Date.now();
    saveReferral(referral);
    track('share_referred_creation_started', { tool: 'card_studio' });
  }

  function bindReferralEngagement() {
    if (!getReferral()) return;
    var handler = function (event) {
      if (!event.target || !event.target.closest || !event.target.closest('[data-card-studio]')) return;
      if (event.type === 'click' && !event.target.closest('[data-card-use-case],[data-card-template],[data-card-content-action],[data-card-field],[data-card-ui-mode]')) return;
      markReferredCreationStarted();
    };
    root.addEventListener('input', handler, true);
    root.addEventListener('change', handler, true);
    root.addEventListener('click', handler, true);
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'wu-share-dialog';
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog();
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function openDialog(html) {
    var node = ensureDialog();
    node.innerHTML = html;
    var close = node.querySelector('[data-wu-share-close]');
    if (close) close.addEventListener('click', closeDialog);
    if (typeof node.showModal === 'function') {
      if (!node.open) node.showModal();
    } else node.setAttribute('open', '');
    return node;
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function hasAcknowledgedPublishing() {
    try { return localStorage.getItem(ACK_KEY) === '1'; } catch (error) { return false; }
  }

  function acknowledgePublishing() {
    try { localStorage.setItem(ACK_KEY, '1'); } catch (error) {}
  }

  function confirmationDialog() {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Publish this card as a public link?</h2><p>This creates a new Write-Urdu.com share page for this snapshot.</p></div><button class="wu-share-dialog-close" type="button" aria-label="Close" data-wu-share-close>×</button></div><div class="wu-share-public-card"><div class="wu-share-public-icon">WU</div><div><strong>Public to anyone with the link</strong><span>Your selected card image, Urdu text and enabled attribution are uploaded. Your other local drafts and project history stay in this browser.</span></div></div><ul class="wu-share-checks"><li>The hosted image gets a small Write-Urdu.com footer.</li><li>Download PNG and Share image only still do not create a public page.</li><li>You can delete this published link later from this browser.</li></ul><p class="wu-share-small">Do not publish confidential or private writing. Public share pages are unlisted and marked noindex, but the link can be forwarded.</p><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>Cancel</button><button class="primary" type="button" data-wu-share-confirm>Publish &amp; get link</button></div></div>');
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) { button.addEventListener('click', closeDialog); });
    node.querySelector('[data-wu-share-confirm]').addEventListener('click', function () {
      acknowledgePublishing();
      publishCurrent();
    });
  }

  function renderWait() {
    return new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        document.removeEventListener('write-urdu:card-rendered', finish);
        resolve();
      }
      document.addEventListener('write-urdu:card-rendered', finish, { once: true });
      if (app.requestRender) app.requestRender();
      window.setTimeout(finish, 900);
    });
  }

  function canvasToPng(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('Could not prepare the published image.')); }, 'image/png');
    });
  }

  async function buildPublishedImage() {
    if (window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioInteractionApi.commit) window.WriteUrduCardStudioInteractionApi.commit();
    if (app.ensureProjectFonts) await app.ensureProjectFonts();
    await renderWait();
    var source = app.getCanvas();
    if (!source || !source.width || !source.height) throw new Error('Card preview is not ready yet.');

    var output = document.createElement('canvas');
    output.width = source.width;
    output.height = source.height;
    var ctx = output.getContext('2d');
    var footer = Math.max(34, Math.min(58, Math.round(output.height * .042)));
    var availableHeight = output.height - footer;
    var scale = Math.min(1, availableHeight / source.height);
    var drawWidth = Math.round(source.width * scale);
    var drawHeight = Math.round(source.height * scale);
    var x = Math.round((output.width - drawWidth) / 2);

    ctx.fillStyle = '#f5f8f6';
    ctx.fillRect(0, 0, output.width, output.height);
    ctx.drawImage(source, x, 0, drawWidth, drawHeight);
    ctx.strokeStyle = '#dbe5df';
    ctx.lineWidth = Math.max(1, Math.round(Math.min(output.width, output.height) * .0014));
    ctx.beginPath();
    ctx.moveTo(0, availableHeight + .5);
    ctx.lineTo(output.width, availableHeight + .5);
    ctx.stroke();
    var fontSize = Math.max(14, Math.min(24, Math.round(footer * .38)));
    var dotRadius = Math.max(4, Math.round(fontSize * .28));
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#466257';
    var label = 'Write-Urdu.com';
    var labelWidth = ctx.measureText(label).width;
    var centerX = output.width / 2;
    var y = availableHeight + footer / 2;
    ctx.fillStyle = '#176b45';
    ctx.beginPath();
    ctx.arc(centerX - labelWidth / 2 - dotRadius * 2.1, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#466257';
    ctx.fillText(label, centerX + dotRadius * .6, y);
    return canvasToPng(output);
  }

  function loadingDialog() {
    openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Publishing your Urdu card</h2><p>Creating the public snapshot and short link…</p></div></div><div class="wu-share-progress"><span class="wu-share-spinner" aria-hidden="true"></span><span>Preparing the hosted image securely.</span></div></div>');
  }

  function errorDialog(message) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Could not publish this card</h2><p>The local card is unchanged.</p></div><button class="wu-share-dialog-close" type="button" data-wu-share-close>×</button></div><div class="wu-share-error" data-wu-share-error></div><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>Close</button><button class="primary" type="button" data-wu-share-retry>Try again</button></div></div>');
    node.querySelector('[data-wu-share-error]').textContent = message || 'Publishing is temporarily unavailable. Please try again.';
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) { button.addEventListener('click', closeDialog); });
    node.querySelector('[data-wu-share-retry]').addEventListener('click', publishCurrent);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    return new Promise(function (resolve, reject) {
      try {
        var field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove(); resolve();
      } catch (error) { reject(error); }
    });
  }

  async function sharePublicLink(url) {
    track('share_clicked', { tool: 'card_studio' });
    if (!navigator.share) {
      await copyText(url);
      toast('Public link copied.');
      return;
    }
    try {
      await navigator.share({ title: 'Urdu writing on Write Urdu', text: 'Open this Urdu card on Write Urdu.', url: url });
      track('share_completed', { tool: 'card_studio', success: true });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      await copyText(url);
      toast('Sharing was unavailable, so the link was copied.');
    }
  }

  async function deleteShare(id, item, afterDelete) {
    if (!item || !item.token) return;
    try {
      var response = await fetch('/api/shares/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { 'x-writeurdu-manage-token': item.token },
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('delete_failed');
      forgetShare(id);
      track('share_deleted', { tool: 'card_studio', success: true });
      toast('Published link deleted.');
      if (afterDelete) afterDelete();
    } catch (error) {
      toast('Could not delete this published link right now.', true);
    }
  }

  function successDialog(result) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-success-mark" aria-hidden="true">✓</div><div class="wu-share-dialog-head"><div><h2>Your public Write Urdu link is ready</h2><p>Share the link so people get the visual preview and can continue into Write Urdu.</p></div><button class="wu-share-dialog-close" type="button" aria-label="Close" data-wu-share-close>×</button></div><div class="wu-share-url"><input type="text" readonly aria-label="Published Write Urdu link" data-wu-share-url><button type="button" data-wu-share-copy>Copy link</button></div><p class="wu-share-small">This is an immutable snapshot. Editing your local card will not change this published link.</p><div class="wu-share-dialog-actions"><button class="danger" type="button" data-wu-share-delete>Delete published link</button><a data-wu-share-open target="_blank" rel="noopener">Open public page</a><button class="primary" type="button" data-wu-share-native>Share link</button></div></div>');
    var input = node.querySelector('[data-wu-share-url]');
    input.value = result.url;
    var open = node.querySelector('[data-wu-share-open]');
    open.href = result.url;
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) { button.addEventListener('click', closeDialog); });
    node.querySelector('[data-wu-share-copy]').addEventListener('click', function () {
      copyText(result.url).then(function () { track('share_clicked', { tool: 'card_studio', success: true }); toast('Public link copied.'); });
    });
    node.querySelector('[data-wu-share-native]').addEventListener('click', function () { sharePublicLink(result.url); });
    node.querySelector('[data-wu-share-delete]').addEventListener('click', function () {
      if (!window.confirm('Delete this published Write Urdu link? The local card will not be deleted.')) return;
      deleteShare(result.id, { token: result.manageToken, url: result.url }, function () { closeDialog(); });
    });
  }

  async function publishCurrent() {
    if (busy) return;
    var state = app.getState && app.getState();
    var text = state && state.text ? String(state.text.value || '').trim() : '';
    if (!text || text === String(core.DEFAULT_TEXT || '').trim()) {
      toast('Add your own Urdu text before publishing.', true);
      closeDialog();
      return;
    }
    busy = true;
    if (publishButton) publishButton.disabled = true;
    markReferredCreationStarted();
    track('share_publish_started', { tool: 'card_studio' });
    loadingDialog();
    try {
      var blob = await buildPublishedImage();
      var latest = app.getState();
      var referral = getReferral();
      var form = new FormData();
      form.append('image', blob, 'write-urdu-share.png');
      form.append('source_tool', 'card_studio');
      form.append('public_text', String(latest.text.value || '').trim());
      if (latest.attribution && latest.attribution.enabled && String(latest.attribution.value || '').trim()) form.append('attribution', String(latest.attribution.value || '').trim());
      if (latest.presetId) form.append('preset', latest.presetId);
      if (referral && referral.id) form.append('origin_share_id', referral.id);

      var response = await fetch('/api/shares', { method: 'POST', body: form, credentials: 'same-origin' });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok || !result.id || !result.url || !result.manageToken) {
        var message = result.error === 'share_storage_unavailable' ? 'Public sharing storage is not connected to this deployment yet.' : result.error === 'publish_rate_limited' ? 'Too many publish attempts were made recently. Please wait a few minutes.' : result.error === 'image_too_large' ? 'This published image is too large. Try a smaller card or background image.' : 'Publishing is temporarily unavailable. Please try again.';
        throw new Error(message);
      }
      rememberShare(result);
      track('share_publish_completed', { tool: 'card_studio', success: true });
      if (referral && referral.id) {
        track('share_republish_completed', { tool: 'card_studio', success: true });
        try { sessionStorage.removeItem(REFERRAL_KEY); } catch (error) {}
      }
      successDialog(result);
    } catch (error) {
      track('share_publish_failed', { tool: 'card_studio', success: false });
      errorDialog(error && error.message ? error.message : 'Publishing is temporarily unavailable. Please try again.');
    } finally {
      busy = false;
      if (publishButton) publishButton.disabled = false;
    }
  }

  function manageDialog() {
    var state = managementState();
    var ids = Object.keys(state.items).sort(function (a, b) { return String(state.items[b].createdAt || '').localeCompare(String(state.items[a].createdAt || '')); });
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Published links from this browser</h2><p>Management tokens stay on this device and are never part of the public URL.</p></div><button class="wu-share-dialog-close" type="button" aria-label="Close" data-wu-share-close>×</button></div><div class="wu-share-list" data-wu-share-list></div></div>');
    node.querySelector('[data-wu-share-close]').addEventListener('click', closeDialog);
    var list = node.querySelector('[data-wu-share-list]');
    if (!ids.length) {
      list.innerHTML = '<div class="wu-share-empty">No locally managed public links on this browser.</div>';
      return;
    }
    ids.forEach(function (id) {
      var item = state.items[id];
      var row = document.createElement('div');
      row.className = 'wu-share-list-item';
      var info = document.createElement('div');
      var strong = document.createElement('strong'); strong.textContent = item.url || id;
      var meta = document.createElement('span'); meta.textContent = item.createdAt ? 'Published ' + new Date(item.createdAt).toLocaleString() : 'Published link';
      info.appendChild(strong); info.appendChild(meta);
      var actions = document.createElement('div'); actions.className = 'wu-share-list-actions';
      var open = document.createElement('a'); open.href = item.url; open.target = '_blank'; open.rel = 'noopener'; open.textContent = 'Open';
      var remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete';
      remove.addEventListener('click', function () {
        if (!window.confirm('Delete this published Write Urdu link?')) return;
        deleteShare(id, item, manageDialog);
      });
      actions.appendChild(open); actions.appendChild(remove); row.appendChild(info); row.appendChild(actions); list.appendChild(row);
    });
  }

  function setupUi() {
    var group = root.querySelector('.card-studio-action-group-export .card-studio-action-group-buttons');
    if (!group || group.querySelector('[data-card-action="publish"]')) return;
    var label = root.querySelector('.card-studio-action-group-export .card-studio-action-group-label');
    if (label) label.textContent = 'Export & share';
    var imageShare = group.querySelector('[data-card-action="share"]');
    if (imageShare) {
      imageShare.textContent = 'Share image only';
      imageShare.classList.remove('secondary');
      imageShare.classList.add('quiet');
      imageShare.title = 'Share the image file without creating a public Write Urdu link';
    }
    var download = group.querySelector('[data-card-action="download"]');
    if (download) {
      download.classList.remove('primary');
      download.classList.add('secondary');
    }
    publishButton = document.createElement('button');
    publishButton.type = 'button';
    publishButton.className = 'card-studio-button primary wu-share-publish-button';
    publishButton.setAttribute('data-card-action', 'publish');
    publishButton.textContent = 'Publish & Share';
    group.appendChild(publishButton);
    publishButton.addEventListener('click', function () {
      if (hasAcknowledgedPublishing()) publishCurrent();
      else confirmationDialog();
    });

    var help = document.createElement('div');
    help.className = 'wu-share-help-row';
    var note = document.createElement('span');
    note.className = 'wu-share-publish-note';
    note.textContent = 'Publishing uploads this card snapshot. Download and Share image only do not create a public page.';
    var guide = document.createElement('a');
    guide.href = '/how-to-share-urdu-writing-online';
    guide.textContent = 'How public sharing works';
    manageButton = document.createElement('button');
    manageButton.type = 'button';
    manageButton.className = 'wu-share-manage-trigger';
    manageButton.textContent = 'Manage published links';
    manageButton.addEventListener('click', manageDialog);
    help.appendChild(note); help.appendChild(guide); help.appendChild(manageButton);
    group.parentElement.appendChild(help);
    syncManageButton();
  }

  ensureStyles();
  ensureTelemetry().then(function () {
    setupUi();
    bindReferralEngagement();
  });
}());
