(function (root) {
  'use strict';

  if (!root || !root.document) return;

  var MANAGEMENT_KEY = 'writeUrdu.shareManagement.v1';
  var LAST_KEY = 'writeUrdu.basicShareLast.v1';
  var MAX_PUBLIC_TEXT = 8000;
  var busy = false;
  var dialog = null;
  var telemetry = null;

  function editor() {
    return root.document.getElementById('transliterateTextarea');
  }

  function currentText() {
    var node = editor();
    return node ? String(node.value || '').replace(/\r\n?/g, '\n').trim() : '';
  }

  function ensureStyles() {
    if (root.document.querySelector('link[data-wu-share-publish-style]')) return;
    var link = root.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/card-studio-publish.css';
    link.setAttribute('data-wu-share-publish-style', '');
    root.document.head.appendChild(link);
  }

  function ensureTelemetry() {
    return new Promise(function (resolve) {
      if (root.WriteUrduShareTelemetry) {
        telemetry = root.WriteUrduShareTelemetry;
        resolve(telemetry);
        return;
      }
      var existing = root.document.querySelector('script[src$="/js/share-loop-telemetry.js"]');
      if (existing) {
        existing.addEventListener('load', function () {
          telemetry = root.WriteUrduShareTelemetry || null;
          resolve(telemetry);
        }, { once: true });
        root.setTimeout(function () {
          telemetry = root.WriteUrduShareTelemetry || null;
          resolve(telemetry);
        }, 1200);
        return;
      }
      var script = root.document.createElement('script');
      script.src = '/js/share-loop-telemetry.js';
      script.onload = function () {
        telemetry = root.WriteUrduShareTelemetry || null;
        resolve(telemetry);
      };
      script.onerror = function () { resolve(null); };
      root.document.head.appendChild(script);
    });
  }

  function track(name, detail) {
    if (telemetry && typeof telemetry.track === 'function') telemetry.track(name, detail || {});
  }

  function toast(message, error) {
    var current = root.document.querySelector('.wu-share-toast');
    if (current) current.remove();
    var node = root.document.createElement('div');
    node.className = 'wu-share-toast' + (error ? ' is-error' : '');
    node.setAttribute('role', 'status');
    node.textContent = message;
    root.document.body.appendChild(node);
    root.setTimeout(function () { node.remove(); }, 3200);
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = root.document.createElement('dialog');
    dialog.className = 'wu-share-dialog';
    dialog.setAttribute('aria-label', 'Publish and share Urdu writing');
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog();
    });
    root.document.body.appendChild(dialog);
    return dialog;
  }

  function openDialog(html) {
    var node = ensureDialog();
    node.innerHTML = html;
    if (typeof node.showModal === 'function') {
      if (!node.open) node.showModal();
    } else {
      node.setAttribute('open', '');
    }
    return node;
  }

  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function bindClose(node) {
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) {
      button.addEventListener('click', closeDialog);
    });
  }

  function managementState() {
    try {
      var raw = root.localStorage.getItem(MANAGEMENT_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.items && typeof parsed.items === 'object' ? parsed : { items: {} };
    } catch (error) {
      return { items: {} };
    }
  }

  function saveManagement(state) {
    try { root.localStorage.setItem(MANAGEMENT_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function rememberShare(result) {
    var state = managementState();
    state.items[result.id] = {
      token: result.manageToken,
      url: result.url,
      createdAt: new Date().toISOString(),
      source: 'basic_editor'
    };
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

  function saveLast(hash, result) {
    if (!hash) return;
    try {
      root.localStorage.setItem(LAST_KEY, JSON.stringify({
        hash: hash,
        id: result.id,
        url: result.url,
        manageToken: result.manageToken,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {}
  }

  function clearLast(id) {
    try {
      var raw = root.localStorage.getItem(LAST_KEY);
      var current = raw ? JSON.parse(raw) : null;
      if (!id || (current && current.id === id)) root.localStorage.removeItem(LAST_KEY);
    } catch (error) {}
  }

  function readLast(hash) {
    if (!hash) return null;
    try {
      var raw = root.localStorage.getItem(LAST_KEY);
      var current = raw ? JSON.parse(raw) : null;
      if (!current || current.hash !== hash || !/^[A-Za-z0-9]{8,12}$/.test(String(current.id || ''))) return null;
      if (!/^https:\/\/write-urdu\.com\/s\/[A-Za-z0-9]{8,12}$/.test(String(current.url || '')) &&
          !/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/s\/[A-Za-z0-9]{8,12}$/.test(String(current.url || '')) &&
          !/^https:\/\/[A-Za-z0-9.-]+\.pages\.dev\/s\/[A-Za-z0-9]{8,12}$/.test(String(current.url || ''))) return null;
      return current;
    } catch (error) {
      return null;
    }
  }

  async function fingerprint(value) {
    if (!root.crypto || !root.crypto.subtle || typeof TextEncoder === 'undefined') return null;
    try {
      var bytes = new TextEncoder().encode(String(value || ''));
      var digest = new Uint8Array(await root.crypto.subtle.digest('SHA-256', bytes));
      return Array.prototype.map.call(digest, function (item) { return item.toString(16).padStart(2, '0'); }).join('');
    } catch (error) {
      return null;
    }
  }

  function copyText(value) {
    if (root.navigator.clipboard && root.navigator.clipboard.writeText) return root.navigator.clipboard.writeText(value);
    return new Promise(function (resolve, reject) {
      try {
        var field = root.document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        root.document.body.appendChild(field);
        field.select();
        root.document.execCommand('copy');
        field.remove();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async function sharePublicLink(url) {
    track('share_clicked', { tool: 'basic_editor' });
    if (!root.navigator.share) {
      await copyText(url);
      toast('Write Urdu link copied.');
      return;
    }
    try {
      await root.navigator.share({
        title: 'Urdu writing on Write Urdu',
        text: 'Open this Urdu writing on Write Urdu.',
        url: url
      });
      track('share_completed', { tool: 'basic_editor', success: true });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      await copyText(url);
      toast('Sharing was unavailable, so the Write Urdu link was copied.');
    }
  }

  function canvasToPng(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('Could not prepare the share preview.'));
      }, 'image/png');
    });
  }

  function previewFontFamily() {
    var node = editor();
    if (!node || !root.getComputedStyle) return 'serif';
    var family = root.getComputedStyle(node).fontFamily;
    return family || 'serif';
  }

  function wrapRtlText(ctx, value, maxWidth, maxLines) {
    var lines = [];
    var paragraphs = String(value || '').split(/\n+/);
    for (var p = 0; p < paragraphs.length && lines.length < maxLines; p += 1) {
      var words = paragraphs[p].trim().split(/\s+/).filter(Boolean);
      if (!words.length) continue;
      var line = '';
      for (var i = 0; i < words.length; i += 1) {
        var candidate = line ? line + ' ' + words[i] : words[i];
        if (line && ctx.measureText(candidate).width > maxWidth) {
          lines.push(line);
          line = words[i];
          if (lines.length >= maxLines) break;
        } else {
          line = candidate;
        }
      }
      if (lines.length < maxLines && line) lines.push(line);
    }
    if (lines.length === maxLines) {
      var consumed = lines.join(' ').replace(/…$/, '').length;
      var normalized = String(value || '').replace(/\s+/g, ' ').trim();
      if (consumed < normalized.length) lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s،,.؛;:!?؟]+$/, '') + '…';
    }
    return lines;
  }

  async function buildPreview(text) {
    if (root.document.fonts && root.document.fonts.ready) {
      try { await root.document.fonts.ready; } catch (error) {}
    }

    var canvas = root.document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare the share preview.');

    ctx.fillStyle = '#f4f8f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(54, 48, 1092, 534);
    ctx.strokeStyle = '#d8e6dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(54, 48, 1092, 534);

    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#176b45';
    ctx.beginPath();
    ctx.arc(96, 91, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#284d3d';
    ctx.font = '700 24px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Write Urdu', 120, 91);

    var normalized = String(text || '').replace(/\s+/g, ' ').trim();
    var length = normalized.length;
    var fontSize = length <= 120 ? 66 : length <= 260 ? 56 : length <= 520 ? 46 : 38;
    var maxLines = length <= 260 ? 5 : 6;
    var lineHeight = Math.round(fontSize * 1.62);
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#11251c';
    ctx.font = '600 ' + fontSize + 'px ' + previewFontFamily();

    var previewText = normalized.length > 1100 ? normalized.slice(0, 1100).trim() + '…' : normalized;
    var lines = wrapRtlText(ctx, previewText, 972, maxLines);
    var totalHeight = Math.max(lineHeight, lines.length * lineHeight);
    var startY = Math.max(176, 314 - totalHeight / 2 + lineHeight / 2);
    for (var index = 0; index < lines.length; index += 1) {
      ctx.fillText(lines[index], 1080, startY + index * lineHeight, 972);
    }

    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#60756a';
    ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Shared from Write-Urdu.com', 88, 548);

    return canvasToPng(canvas);
  }

  function confirmationDialog(text, hash) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Share this writing with a Write Urdu link?</h2><p>We will create a short <strong>write-urdu.com/s/…</strong> public link with a visual preview.</p></div><button class="wu-share-dialog-close" type="button" aria-label="Close" data-wu-share-close>×</button></div><div class="wu-share-public-card"><div class="wu-share-public-icon">WU</div><div><strong>Public to anyone with the link</strong><span>Only this writing and its generated preview are published. Your other local drafts and history stay in this browser.</span></div></div><ul class="wu-share-checks"><li>The shared page shows your Urdu as selectable text.</li><li>Social apps can use the generated Write Urdu preview image.</li><li>You can copy, open, share or delete the short public link.</li></ul><p class="wu-share-small">Do not publish confidential or private writing. Shared pages are unlisted and noindex, but anyone with the link can forward it.</p><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>Cancel</button><button class="primary" type="button" data-wu-basic-publish-confirm>Publish &amp; get short link</button></div></div>');
    bindClose(node);
    node.querySelector('[data-wu-basic-publish-confirm]').addEventListener('click', function () {
      publishCurrent(text, hash);
    });
  }

  function loadingDialog() {
    openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Creating your Write Urdu link</h2><p>Preparing the public preview and short URL…</p></div></div><div class="wu-share-progress"><span class="wu-share-spinner" aria-hidden="true"></span><span>Publishing this snapshot securely.</span></div></div>');
  }

  function errorDialog(message, text, hash) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>Could not create the public link</h2><p>Your local writing is unchanged.</p></div><button class="wu-share-dialog-close" type="button" data-wu-share-close aria-label="Close">×</button></div><div class="wu-share-error" data-wu-share-error></div><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>Close</button><button class="primary" type="button" data-wu-share-retry>Try again</button></div></div>');
    node.querySelector('[data-wu-share-error]').textContent = message || 'Publishing is temporarily unavailable. Please try again.';
    bindClose(node);
    node.querySelector('[data-wu-share-retry]').addEventListener('click', function () { publishCurrent(text, hash); });
  }

  async function deleteShare(result) {
    if (!result || !result.id || !result.manageToken) return;
    try {
      var response = await root.fetch('/api/shares/' + encodeURIComponent(result.id), {
        method: 'DELETE',
        headers: { 'x-writeurdu-manage-token': result.manageToken },
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error('delete_failed');
      forgetShare(result.id);
      clearLast(result.id);
      track('share_deleted', { tool: 'basic_editor', success: true });
      closeDialog();
      toast('Published Write Urdu link deleted.');
    } catch (error) {
      toast('Could not delete this published link right now.', true);
    }
  }

  function successDialog(result, reused) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-success-mark" aria-hidden="true">✓</div><div class="wu-share-dialog-head"><div><h2>Your Write Urdu link is ready</h2><p>' + (reused ? 'This writing already has a public link from this browser.' : 'Share this short link instead of sending raw text.') + '</p></div><button class="wu-share-dialog-close" type="button" aria-label="Close" data-wu-share-close>×</button></div><div class="wu-share-url"><input type="text" readonly aria-label="Published Write Urdu link" data-wu-share-url><button type="button" data-wu-share-copy>Copy link</button></div><p class="wu-share-small">The public page is an immutable snapshot. Editing this writer will not change the published link.</p><div class="wu-share-dialog-actions"><button class="danger" type="button" data-wu-share-delete>Delete link</button><a data-wu-share-open target="_blank" rel="noopener">Open public page</a><button class="primary" type="button" data-wu-share-native>Share link</button></div></div>');
    var input = node.querySelector('[data-wu-share-url]');
    input.value = result.url;
    var open = node.querySelector('[data-wu-share-open]');
    open.href = result.url;
    bindClose(node);
    node.querySelector('[data-wu-share-copy]').addEventListener('click', function () {
      copyText(result.url).then(function () { toast('Write Urdu link copied.'); });
    });
    node.querySelector('[data-wu-share-native]').addEventListener('click', function () { sharePublicLink(result.url); });
    node.querySelector('[data-wu-share-delete]').addEventListener('click', function () {
      if (!root.confirm('Delete this published Write Urdu link? Your local writing will remain here.')) return;
      deleteShare(result);
    });
  }

  async function publishCurrent(text, hash) {
    if (busy) return;
    text = String(text || '').trim();
    if (!text) {
      toast('Write something before sharing.', true);
      closeDialog();
      return;
    }
    if (text.length > MAX_PUBLIC_TEXT) {
      toast('Public sharing supports up to 8,000 characters.', true);
      closeDialog();
      return;
    }

    busy = true;
    track('share_publish_started', { tool: 'basic_editor' });
    loadingDialog();
    try {
      var blob = await buildPreview(text);
      var form = new FormData();
      form.append('image', blob, 'write-urdu-writing.png');
      form.append('source_tool', 'basic_editor');
      form.append('public_text', text);

      var response = await root.fetch('/api/shares', {
        method: 'POST',
        body: form,
        credentials: 'same-origin'
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok || !result.id || !result.url || !result.manageToken) {
        var message = result.error === 'share_storage_unavailable' ? 'Public sharing storage is not connected to this deployment yet.' : result.error === 'publish_rate_limited' ? 'Too many publish attempts were made recently. Please wait a few minutes.' : result.error === 'image_too_large' ? 'The generated preview was too large to publish.' : result.error === 'invalid_public_text' ? 'This writing cannot be published in its current form.' : 'Publishing is temporarily unavailable. Please try again.';
        throw new Error(message);
      }
      rememberShare(result);
      saveLast(hash, result);
      track('share_publish_completed', { tool: 'basic_editor', success: true });
      successDialog(result, false);
    } catch (error) {
      track('share_publish_failed', { tool: 'basic_editor', success: false });
      errorDialog(error && error.message ? error.message : 'Publishing is temporarily unavailable. Please try again.', text, hash);
    } finally {
      busy = false;
    }
  }

  async function open() {
    ensureStyles();
    ensureTelemetry();
    var text = currentText();
    if (!text) {
      toast('Write something before sharing.', true);
      return false;
    }
    if (text.length > MAX_PUBLIC_TEXT) {
      toast('Public sharing supports up to 8,000 characters.', true);
      return false;
    }
    var hash = await fingerprint(text);
    var existing = readLast(hash);
    if (existing) {
      successDialog(existing, true);
      return true;
    }
    confirmationDialog(text, hash);
    return true;
  }

  ensureStyles();
  ensureTelemetry();

  root.WriteUrduBasicPublish = {
    open: open,
    currentText: currentText,
    buildPreview: buildPreview
  };
}(window));
