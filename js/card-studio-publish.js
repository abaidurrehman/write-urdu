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
  var stepPublishButton = null;
  var manageButton = null;
  var dialog = null;
  var busy = false;

  function ensureStyles() {
    if (!document.querySelector('link[href$="/css/card-studio-publish.css"],link[href$="css/card-studio-publish.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/card-studio-publish.css';
      document.head.appendChild(link);
    }
    if (!document.querySelector('link[href$="/css/community-publishing.css"],link[href$="css/community-publishing.css"]')) {
      var communityLink = document.createElement('link');
      communityLink.rel = 'stylesheet';
      communityLink.href = '/css/community-publishing.css';
      document.head.appendChild(communityLink);
    }
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

  // Publishing copy in both languages (WU-UXR-002 Slice K, CARD-UX-023).
  var P_COPY = {
    en: {
      groupLabel: 'Export & share', publish: 'Publish & Share', stepPublishSmall: 'Create a public Write-Urdu.com link', community: 'Submit to Urdu Writers',
      shareImageOnly: 'Share image only', shareImageTitle: 'Share the image file without creating a public Write Urdu link',
      note: 'Publishing creates a public Write-Urdu.com link. Download and Share image only stay local.', howPublic: 'How public sharing works', manage: 'Manage published links',
      stepNoteStrong: 'Best for social sharing:', stepNote: 'publish this snapshot to get a short link with the Urdu artwork as its social preview.', howItWorks: 'How it works',
      close: 'Close', cancel: 'Cancel',
      confirmTitle: 'Publish this card as a public link?', confirmIntro: 'This creates a new Write-Urdu.com share page for this snapshot.',
      confirmPublic: 'Public to anyone with the link', confirmWhat: 'Your selected card image, Urdu text and enabled attribution are uploaded. Your other local drafts and project history stay in this browser.',
      confirmMark: 'The hosted image always carries one small Write-Urdu.com mark.', confirmLocal: 'Download PNG and Share image only still do not create a public page.', confirmDelete: 'You can delete this published link later from this browser.',
      confirmPrivate: 'Do not publish confidential or private writing. Public share pages are unlisted and marked noindex, but the link can be forwarded.', confirmButton: 'Publish & get link',
      loadingTitle: 'Publishing your Urdu card', loadingIntro: 'Creating the public snapshot and short link…', loadingProgress: 'Preparing the hosted image securely.',
      errorTitle: 'Could not publish this card', errorIntro: 'The local card is unchanged.', retry: 'Try again', downloadPicture: 'Download picture',
      rateLimited: 'Too many publish attempts were made recently. Please wait a few minutes.', tooLarge: 'This published image is too large. Try a smaller card or background image.',
      successTitle: 'Your public Write Urdu link is ready', successIntro: 'Share the link so people get the visual preview and can continue into Write Urdu.', linkLabel: 'Published Write Urdu link',
      copyLink: 'Copy link', snapshot: 'This is an immutable snapshot. Editing your local card will not change this published link.', deleteLink: 'Delete published link', openPublic: 'Open public page', shareLink: 'Share link',
      deleteConfirm: 'Delete this published Write Urdu link? The local card will not be deleted.', deleteConfirmShort: 'Delete this published Write Urdu link?',
      copied: 'Public link copied.', shareFallback: 'Sharing was unavailable, so the link was copied.', deleted: 'Published link deleted.', deleteFailed: 'Could not delete this published link right now.',
      needText: 'Add your own Urdu text before publishing.', needTextSubmit: 'Add your own Urdu text before submitting.', communityFailed: 'Could not open the community submission form. Please try again.',
      manageTitle: 'Published links from this browser', manageIntro: 'Management tokens stay on this device and are never part of the public URL.', manageEmpty: 'No locally managed public links on this browser.',
      published: 'Published {date}', publishedLink: 'Published link', open: 'Open', remove: 'Delete'
    },
    ur: {
      groupLabel: 'ڈاؤن لوڈ اور شیئر', publish: 'شائع کریں اور شیئر کریں', stepPublishSmall: 'Write-Urdu.com کا عوامی لنک بنائیں', community: 'اردو لکھاریوں کو بھیجیں',
      shareImageOnly: 'صرف تصویر شیئر کریں', shareImageTitle: 'عوامی لنک بنائے بغیر صرف تصویر شیئر کریں',
      note: 'شائع کرنے سے Write-Urdu.com کا عوامی لنک بنتا ہے۔ ڈاؤن لوڈ اور «صرف تصویر شیئر کریں» سے کچھ شائع نہیں ہوتا۔', howPublic: 'عوامی شیئرنگ کیسے کام کرتی ہے', manage: 'شائع شدہ لنکس سنبھالیں',
      stepNoteStrong: 'سوشل میڈیا کے لیے بہترین:', stepNote: 'یہ کارڈ شائع کریں تو ایک مختصر لنک ملے گا جس کے ساتھ آپ کی اردو تصویر پیش منظر میں دکھائی دیتی ہے۔', howItWorks: 'یہ کیسے کام کرتا ہے',
      close: 'بند کریں', cancel: 'رہنے دیں',
      confirmTitle: 'اس کارڈ کا عوامی لنک بنائیں؟', confirmIntro: 'اس کارڈ کی موجودہ شکل کے لیے Write-Urdu.com پر ایک نیا صفحہ بنے گا۔',
      confirmPublic: 'لنک رکھنے والا ہر شخص اسے دیکھ سکتا ہے', confirmWhat: 'صرف کارڈ کی تصویر، اردو متن اور (اگر آن ہو) مصنف کا نام اپ لوڈ ہوتا ہے۔ آپ کے باقی کارڈ اور تبدیلیاں اپ لوڈ نہیں ہوتیں۔',
      confirmMark: 'شائع شدہ تصویر پر Write-Urdu.com کا ایک چھوٹا سا نشان ہوتا ہے۔', confirmLocal: 'PNG ڈاؤن لوڈ کرنے یا «صرف تصویر شیئر کریں» سے کوئی عوامی صفحہ نہیں بنتا۔', confirmDelete: 'بعد میں آپ یہ لنک اسی براؤزر سے مٹا سکتے ہیں۔',
      confirmPrivate: 'نجی یا راز کی تحریر شائع نہ کریں۔ لنک والے صفحے سرچ میں نہیں آتے، مگر لنک آگے بھیجا جا سکتا ہے۔', confirmButton: 'شائع کریں اور لنک لیں',
      loadingTitle: 'آپ کا اردو کارڈ شائع ہو رہا ہے', loadingIntro: 'عوامی صفحہ اور مختصر لنک بن رہا ہے…', loadingProgress: 'تصویر محفوظ طریقے سے تیار ہو رہی ہے۔',
      errorTitle: 'یہ کارڈ شائع نہیں ہو سکا', errorIntro: 'آپ کا کارڈ یہاں جوں کا توں ہے۔', retry: 'دوبارہ کوشش کریں', downloadPicture: 'تصویر ڈاؤن لوڈ کریں',
      rateLimited: 'حال ہی میں بہت بار شائع کرنے کی کوشش ہوئی ہے۔ چند منٹ بعد دوبارہ کوشش کریں۔', tooLarge: 'یہ تصویر شائع کرنے کے لیے بہت بڑی ہے۔ چھوٹا کارڈ یا چھوٹی پس منظر تصویر آزمائیں۔',
      successTitle: 'آپ کا عوامی لنک تیار ہے', successIntro: 'یہ لنک بھیجیں تاکہ لوگوں کو کارڈ کی تصویر دکھائی دے اور وہ رائٹ اردو پر آ سکیں۔', linkLabel: 'شائع شدہ لنک',
      copyLink: 'لنک کاپی کریں', snapshot: 'یہ کارڈ کی اسی وقت کی شکل ہے۔ اب کارڈ بدلنے سے یہ لنک نہیں بدلے گا۔', deleteLink: 'لنک مٹائیں', openPublic: 'صفحہ کھولیں', shareLink: 'لنک شیئر کریں',
      deleteConfirm: 'یہ شائع شدہ لنک مٹا دیں؟ آپ کا کارڈ یہاں رہے گا۔', deleteConfirmShort: 'یہ شائع شدہ لنک مٹا دیں؟',
      copied: 'عوامی لنک کاپی ہو گیا۔', shareFallback: 'شیئر کی سہولت نہیں ملی، اس لیے لنک کاپی کر دیا گیا۔', deleted: 'شائع شدہ لنک مٹا دیا گیا۔', deleteFailed: 'یہ لنک ابھی نہیں مٹ سکا۔',
      needText: 'شائع کرنے سے پہلے اپنا اردو متن لکھیں۔', needTextSubmit: 'بھیجنے سے پہلے اپنا اردو متن لکھیں۔', communityFailed: 'بھیجنے کا فارم نہیں کھل سکا۔ دوبارہ کوشش کریں۔',
      manageTitle: 'اس براؤزر سے شائع کیے گئے لنکس', manageIntro: 'لنک مٹانے کی کنجیاں اسی آلے پر رہتی ہیں اور عوامی لنک میں شامل نہیں ہوتیں۔', manageEmpty: 'اس براؤزر سے کوئی عوامی لنک نہیں بنا۔',
      published: '{date} کو شائع کیا', publishedLink: 'شائع شدہ لنک', open: 'کھولیں', remove: 'مٹائیں'
    }
  };
  function pt(key, values) {
    var value = (P_COPY[isUrdu() ? 'ur' : 'en'][key]) || P_COPY.en[key] || key;
    Object.keys(values || {}).forEach(function (name) { value = value.split('{' + name + '}').join(values[name]); });
    return value;
  }

  function ensureCommunityAssetUi() {
    return new Promise(function (resolve) {
      if (window.WriteUrduCommunityAssetPublish) { resolve(window.WriteUrduCommunityAssetPublish); return; }
      var existing = document.querySelector('script[data-wu-community-asset-ui]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.WriteUrduCommunityAssetPublish || null); }, { once: true });
        window.setTimeout(function () { resolve(window.WriteUrduCommunityAssetPublish || null); }, 1600);
        return;
      }
      var script = document.createElement('script');
      script.type = 'module';
      script.src = '/js/community-publishing-asset-ui.mjs';
      script.setAttribute('data-wu-community-asset-ui', '');
      script.onload = function () { resolve(window.WriteUrduCommunityAssetPublish || null); };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  function isUrdu() {
    return !!(window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function' && window.WriteUrduLocale.get() === 'ur');
  }

  function toast(message, error) {
    var current = document.querySelector('.wu-share-toast');
    if (current) current.remove();
    var node = document.createElement('div');
    node.className = 'wu-share-toast' + (error ? ' is-error' : '');
    node.setAttribute('role', error ? 'alert' : 'status');
    node.textContent = message;
    document.body.appendChild(node);
    // Refusals stay readable for at least six seconds (WU-UXR-002 Slice B).
    window.setTimeout(function () { node.remove(); }, error ? 6500 : 3200);
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

  // A touched field is not proof of a meaningful start (WU-SHARE-001R
  // section 5, step 8); an actual publish attempt is.
  function markReferredMeaningfulStart() {
    var referral = getReferral();
    if (!referral || referral.meaningful) return;
    referral.meaningful = true;
    saveReferral(referral);
    track('share_referred_meaningful_start', { tool: 'card_studio' });
  }

  function bindReferralEngagement() {
    if (!getReferral()) return;
    var handler = function (event) {
      if (!event.isTrusted || !event.target || !event.target.closest || !event.target.closest('[data-card-studio]')) return;
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
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>' + pt('confirmTitle') + '</h2><p>' + pt('confirmIntro') + '</p></div><button class="wu-share-dialog-close" type="button" aria-label="' + pt('close') + '" data-wu-share-close>×</button></div><div class="wu-share-public-card"><div class="wu-share-public-icon">WU</div><div><strong>' + pt('confirmPublic') + '</strong><span>' + pt('confirmWhat') + '</span></div></div><ul class="wu-share-checks"><li>' + pt('confirmMark') + '</li><li>' + pt('confirmLocal') + '</li><li>' + pt('confirmDelete') + '</li></ul><p class="wu-share-small">' + pt('confirmPrivate') + '</p><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>' + pt('cancel') + '</button><button class="primary" type="button" data-wu-share-confirm>' + pt('confirmButton').replace('&', '&amp;') + '</button></div></div>');
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

    var current = app.getState && app.getState();
    if (current && current.watermark && current.watermark.enabled) return canvasToPng(source);

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
    openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>' + pt('loadingTitle') + '</h2><p>' + pt('loadingIntro') + '</p></div></div><div class="wu-share-progress"><span class="wu-share-spinner" aria-hidden="true"></span><span>' + pt('loadingProgress') + '</span></div></div>');
  }

  function linkUnavailableMessage() {
    return isUrdu()
      ? 'ابھی لنک نہیں بن سکتا۔ آپ کا کارڈ یہاں محفوظ ہے، تصویر ڈاؤن لوڈ کر کے بھیج دیں۔'
      : "Links can't be created right now. Your card is safe here. Download the picture and send it instead.";
  }

  function errorDialog(message) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>' + pt('errorTitle') + '</h2><p>' + pt('errorIntro') + '</p></div><button class="wu-share-dialog-close" type="button" aria-label="' + pt('close') + '" data-wu-share-close>×</button></div><div class="wu-share-error" data-wu-share-error></div><div class="wu-share-dialog-actions"><button type="button" data-wu-share-close>' + pt('close') + '</button><button type="button" data-wu-share-retry>' + pt('retry') + '</button><button class="primary" type="button" data-wu-share-download></button></div></div>');
    node.querySelector('[data-wu-share-error]').textContent = message || linkUnavailableMessage();
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) { button.addEventListener('click', closeDialog); });
    node.querySelector('[data-wu-share-retry]').addEventListener('click', publishCurrent);
    // The picture does not need a link: offer it straight from the error (CARD-UX-031).
    var download = node.querySelector('[data-wu-share-download]');
    download.textContent = pt('downloadPicture');
    download.addEventListener('click', function () {
      closeDialog();
      var button = document.querySelector('[data-card-action="download"]');
      if (button) button.click();
    });
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
      toast(pt('copied'));
      return;
    }
    try {
      await navigator.share({ title: 'Urdu writing on Write Urdu', text: 'Open this Urdu card on Write Urdu.', url: url });
      track('share_completed', { tool: 'card_studio', success: true });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      await copyText(url);
      toast(pt('shareFallback'));
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
      toast(pt('deleted'));
      if (afterDelete) afterDelete();
    } catch (error) {
      toast(pt('deleteFailed'), true);
    }
  }

  function successDialog(result) {
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-success-mark" aria-hidden="true">✓</div><div class="wu-share-dialog-head"><div><h2>' + pt('successTitle') + '</h2><p>' + pt('successIntro') + '</p></div><button class="wu-share-dialog-close" type="button" aria-label="' + pt('close') + '" data-wu-share-close>×</button></div><div class="wu-share-url"><input type="text" readonly dir="ltr" aria-label="' + pt('linkLabel') + '" data-wu-share-url><button type="button" data-wu-share-copy>' + pt('copyLink') + '</button></div><p class="wu-share-small">' + pt('snapshot') + '</p><div class="wu-share-dialog-actions"><button class="danger" type="button" data-wu-share-delete>' + pt('deleteLink') + '</button><a data-wu-share-open target="_blank" rel="noopener">' + pt('openPublic') + '</a><button class="primary" type="button" data-wu-share-native>' + pt('shareLink') + '</button></div></div>');
    var input = node.querySelector('[data-wu-share-url]');
    input.value = result.url;
    var open = node.querySelector('[data-wu-share-open]');
    open.href = result.url;
    node.querySelectorAll('[data-wu-share-close]').forEach(function (button) { button.addEventListener('click', closeDialog); });
    node.querySelector('[data-wu-share-copy]').addEventListener('click', function () {
      copyText(result.url).then(function () { track('share_clicked', { tool: 'card_studio', success: true }); toast(pt('copied')); });
    });
    node.querySelector('[data-wu-share-native]').addEventListener('click', function () { sharePublicLink(result.url); });
    node.querySelector('[data-wu-share-delete]').addEventListener('click', function () {
      if (!window.confirm(pt('deleteConfirm'))) return;
      deleteShare(result.id, { token: result.manageToken, url: result.url }, function () { closeDialog(); });
    });
  }

  function setPublishBusy(value) {
    if (publishButton) publishButton.disabled = value;
    if (stepPublishButton) stepPublishButton.disabled = value;
  }

  function buildRemixCandidate(project) {
    project = project || {};
    var text = project.text || {};
    var attribution = project.attribution || {};
    var background = project.background || {};
    var watermark = project.watermark || {};
    return {
      version: 1,
      project: {
        version: 2,
        useCase: project.useCase || null,
        presetId: project.presetId,
        templateId: project.templateId,
        text: {
          value: text.value,
          fontFamily: text.fontFamily,
          fontMode: text.fontMode,
          fontSize: text.fontSize,
          minFontSize: text.minFontSize,
          maxFontSize: text.maxFontSize,
          color: text.color,
          align: text.align,
          verticalAlign: text.verticalAlign,
          lineHeight: text.lineHeight,
          shadow: text.shadow,
          transform: text.transform
        },
        attribution: {
          enabled: attribution.enabled === true,
          value: attribution.value,
          fontFamily: attribution.fontFamily,
          fontSizeRatio: attribution.fontSizeRatio,
          color: attribution.color,
          transform: attribution.transform
        },
        background: {
          type: background.type,
          color: background.color,
          gradientId: background.gradientId,
          fit: background.fit,
          positionX: background.positionX,
          positionY: background.positionY,
          overlayColor: background.overlayColor,
          overlayOpacity: background.overlayOpacity,
          blur: background.blur
        },
        watermark: {
          enabled: watermark.enabled === true,
          position: watermark.position
        }
      }
    };
  }

  async function publishCurrent() {
    if (busy) return;
    var state = app.getState && app.getState();
    var text = state && state.text ? String(state.text.value || '').trim() : '';
    if (!text || text === String(core.DEFAULT_TEXT || '').trim()) {
      toast(pt('needText'), true);
      closeDialog();
      return;
    }
    busy = true;
    setPublishBusy(true);
    markReferredCreationStarted();
    markReferredMeaningfulStart();
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
      form.append('remix_payload', JSON.stringify(buildRemixCandidate(latest)));
      if (referral && referral.id) form.append('origin_share_id', referral.id);

      var response = await fetch('/api/shares', { method: 'POST', body: form, credentials: 'same-origin' });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok || !result.id || !result.url || !result.manageToken) {
        var message = result.error === 'share_storage_unavailable' ? linkUnavailableMessage() : result.error === 'publish_rate_limited' ? pt('rateLimited') : result.error === 'image_too_large' ? pt('tooLarge') : linkUnavailableMessage();
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
      errorDialog(error && error.message && !/fetch|network|json/i.test(error.message) ? error.message : linkUnavailableMessage());
    } finally {
      busy = false;
      setPublishBusy(false);
    }
  }

  function manageDialog() {
    var state = managementState();
    var ids = Object.keys(state.items).sort(function (a, b) { return String(state.items[b].createdAt || '').localeCompare(String(state.items[a].createdAt || '')); });
    var node = openDialog('<div class="wu-share-dialog-shell"><div class="wu-share-dialog-head"><div><h2>' + pt('manageTitle') + '</h2><p>' + pt('manageIntro') + '</p></div><button class="wu-share-dialog-close" type="button" aria-label="' + pt('close') + '" data-wu-share-close>×</button></div><div class="wu-share-list" data-wu-share-list></div></div>');
    node.querySelector('[data-wu-share-close]').addEventListener('click', closeDialog);
    var list = node.querySelector('[data-wu-share-list]');
    if (!ids.length) {
      list.innerHTML = '<div class="wu-share-empty">' + pt('manageEmpty') + '</div>';
      return;
    }
    ids.forEach(function (id) {
      var item = state.items[id];
      var row = document.createElement('div');
      row.className = 'wu-share-list-item';
      var info = document.createElement('div');
      var strong = document.createElement('strong'); strong.textContent = item.url || id;
      var meta = document.createElement('span'); meta.textContent = item.createdAt ? pt('published', { date: new Date(item.createdAt).toLocaleString(isUrdu() ? 'ur-PK' : undefined) }) : pt('publishedLink');
      info.appendChild(strong); info.appendChild(meta);
      var actions = document.createElement('div'); actions.className = 'wu-share-list-actions';
      var open = document.createElement('a'); open.href = item.url; open.target = '_blank'; open.rel = 'noopener'; open.textContent = pt('open');
      var remove = document.createElement('button'); remove.type = 'button'; remove.textContent = pt('remove');
      remove.addEventListener('click', function () {
        if (!window.confirm(pt('deleteConfirmShort'))) return;
        deleteShare(id, item, manageDialog);
      });
      actions.appendChild(open); actions.appendChild(remove); row.appendChild(info); row.appendChild(actions); list.appendChild(row);
    });
  }

  function bindPublishButton(button, direct) {
    if (!button || button.dataset.wuSharePublishBound) return;
    button.dataset.wuSharePublishBound = 'true';
    button.addEventListener('click', function () {
      if (direct && publishButton && publishButton !== button) {
        publishButton.click();
        return;
      }
      if (hasAcknowledgedPublishing()) publishCurrent();
      else confirmationDialog();
    });
  }

  function bindCommunityPublishButton(button) {
    if (!button || button.dataset.wuCommunityPublishBound) return;
    button.dataset.wuCommunityPublishBound = 'true';
    button.addEventListener('click', function () {
      var state = app.getState && app.getState();
      var text = state && state.text ? String(state.text.value || '').trim() : '';
      if (!text || text === String(core.DEFAULT_TEXT || '').trim()) {
        toast(pt('needTextSubmit'), true);
        return;
      }
      ensureCommunityAssetUi().then(function (publisher) {
        if (publisher && publisher.open) publisher.open(text);
        else toast(pt('communityFailed'), true);
      });
    });
  }

  function normalizeLocalExportActions(container) {
    if (!container) return;
    var imageShare = container.querySelector('[data-card-action="share"]');
    if (imageShare) {
      imageShare.textContent = pt('shareImageOnly');
      imageShare.classList.remove('secondary');
      imageShare.classList.add('quiet');
      imageShare.title = pt('shareImageTitle');
    }
    var download = container.querySelector('[data-card-action="download"]');
    if (download) {
      download.classList.remove('primary');
      download.classList.add('secondary');
    }
  }

  function setupUi() {
    var group = root.querySelector('.card-studio-action-group-export .card-studio-action-group-buttons');
    if (!group) return;
    var label = root.querySelector('.card-studio-action-group-export .card-studio-action-group-label');
    if (label) label.textContent = pt('groupLabel');
    normalizeLocalExportActions(group);

    publishButton = group.querySelector('[data-card-action="publish"]');
    if (!publishButton) {
      publishButton = document.createElement('button');
      publishButton.type = 'button';
      publishButton.className = 'card-studio-button primary wu-share-publish-button';
      publishButton.setAttribute('data-card-action', 'publish');
      publishButton.textContent = pt('publish');
      group.appendChild(publishButton);
    }
    bindPublishButton(publishButton, false);

    var communityButton = group.querySelector('[data-card-action="publish-community"]');
    if (!communityButton) {
      communityButton = document.createElement('button');
      communityButton.type = 'button';
      communityButton.className = 'card-studio-button wu-community-toolbar-button';
      communityButton.setAttribute('data-card-action', 'publish-community');
      communityButton.innerHTML = '<i class="fas fa-feather-alt" aria-hidden="true"></i> <span data-wu-community-label></span>';
      communityButton.querySelector('[data-wu-community-label]').textContent = pt('community');
      group.appendChild(communityButton);
    }
    bindCommunityPublishButton(communityButton);

    var help = group.parentElement.querySelector('.wu-share-help-row');
    if (!help) {
      help = document.createElement('div');
      help.className = 'wu-share-help-row';
      var note = document.createElement('span');
      note.className = 'wu-share-publish-note';
      note.textContent = pt('note');
      var guide = document.createElement('a');
      guide.href = '/how-to-share-urdu-writing-online';
      guide.textContent = pt('howPublic');
      manageButton = document.createElement('button');
      manageButton.type = 'button';
      manageButton.className = 'wu-share-manage-trigger';
      manageButton.textContent = pt('manage');
      manageButton.addEventListener('click', manageDialog);
      help.appendChild(note); help.appendChild(guide); help.appendChild(manageButton);
      group.parentElement.appendChild(help);
    } else {
      manageButton = help.querySelector('.wu-share-manage-trigger');
    }

    var exportSection = root.querySelector('.card-studio-export-section');
    var exportActions = exportSection && exportSection.querySelector('.card-studio-export-actions');
    if (exportActions) {
      normalizeLocalExportActions(exportActions);
      stepPublishButton = exportActions.querySelector('[data-wu-share-step-publish]');
      if (!stepPublishButton) {
        stepPublishButton = document.createElement('button');
        stepPublishButton.type = 'button';
        stepPublishButton.className = 'card-studio-button primary wu-share-step-publish';
        stepPublishButton.setAttribute('data-wu-share-step-publish', '');
        stepPublishButton.innerHTML = '<span></span><small></small>';
        stepPublishButton.querySelector('span').textContent = pt('publish');
        stepPublishButton.querySelector('small').textContent = pt('stepPublishSmall');
        exportActions.insertBefore(stepPublishButton, exportActions.firstChild);
      }
      bindPublishButton(stepPublishButton, true);
      var sectionNote = exportSection.querySelector('.wu-share-step-note');
      if (!sectionNote) {
        sectionNote = document.createElement('p');
        sectionNote.className = 'wu-share-step-note';
        sectionNote.innerHTML = '<strong></strong> <span></span> <a href="/how-to-share-urdu-writing-online"></a>';
        sectionNote.querySelector('strong').textContent = pt('stepNoteStrong');
        sectionNote.querySelector('span').textContent = pt('stepNote');
        sectionNote.querySelector('a').textContent = pt('howItWorks');
        exportActions.insertAdjacentElement('afterend', sectionNote);
      }
    }
    syncManageButton();
  }

  // A language switch relabels everything this layer drew (WU-UXR-002 Slice K).
  function relabel() {
    var group = root.querySelector('.card-studio-action-group-export');
    if (!group) return;
    var label = group.querySelector('.card-studio-action-group-label'); if (label) label.textContent = pt('groupLabel');
    root.querySelectorAll('[data-card-action="share"]').forEach(function (button) { button.textContent = pt('shareImageOnly'); button.title = pt('shareImageTitle'); });
    if (publishButton) publishButton.textContent = pt('publish');
    var community = root.querySelector('[data-wu-community-label]'); if (community) community.textContent = pt('community');
    var note = root.querySelector('.wu-share-publish-note'); if (note) note.textContent = pt('note');
    var guide = root.querySelector('.wu-share-help-row a'); if (guide) guide.textContent = pt('howPublic');
    if (manageButton) manageButton.textContent = pt('manage');
    if (stepPublishButton) { var big = stepPublishButton.querySelector('span'); var small = stepPublishButton.querySelector('small'); if (big) big.textContent = pt('publish'); if (small) small.textContent = pt('stepPublishSmall'); }
    var sectionNote = root.querySelector('.wu-share-step-note');
    if (sectionNote) { var strong = sectionNote.querySelector('strong'); var span = sectionNote.querySelector('span'); var link = sectionNote.querySelector('a'); if (strong) strong.textContent = pt('stepNoteStrong'); if (span) span.textContent = pt('stepNote'); if (link) link.textContent = pt('howItWorks'); }
  }

  ensureStyles();
  ensureTelemetry().then(function () {
    setupUi();
    relabel();
    document.addEventListener('write-urdu:locale-change', relabel);
    bindReferralEngagement();
  });
}());
