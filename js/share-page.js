(function () {
  'use strict';

  var telemetry = window.WriteUrduShareTelemetry;
  var Registry = window.WriteUrduWorkspaceRegistry;
  var Handoff = window.WriteUrduWorkspaceHandoff;
  var REFERRAL_KEY = 'writeUrdu.shareReferral.v1';
  var idMatch = String(window.location.pathname || '').match(/^\/s\/([A-Za-z0-9]{8,12})\/?$/);
  var shareId = idMatch ? idMatch[1] : null;

  function q(selector) { return document.querySelector(selector); }
  function track(name, detail) { if (telemetry && telemetry.track) telemetry.track(name, detail || {}); }
  function trackOnce(key, name, detail) { if (telemetry && telemetry.trackOnce) telemetry.trackOnce(key, name, detail || {}); }
  function status(message, error) {
    var node = q('[data-share-status]');
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(error));
  }

  function publicText() {
    var node = q('[data-share-public-text]');
    return node ? String(node.textContent || '').trim() : '';
  }

  function publicUrl() {
    return window.location.origin + window.location.pathname;
  }

  function setReferral(action) {
    if (!shareId) return;
    try {
      sessionStorage.setItem(REFERRAL_KEY, JSON.stringify({
        id: shareId,
        action: action,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      }));
    } catch (error) {}
  }

  function routeFor(targetWorkspace) {
    if (Handoff && typeof Handoff.destination === 'function') return Handoff.destination(targetWorkspace);
    var target = Registry && Registry.get ? Registry.get(targetWorkspace) : null;
    return target && target.routes && target.routes[0] || null;
  }

  function transfer(targetWorkspace, actionId, text, referralAction) {
    var route = routeFor(targetWorkspace);
    if (!route || !Handoff || typeof Handoff.transfer !== 'function') {
      status('This browser could not prepare the next step. The shared page is unchanged.', true);
      return false;
    }
    var result = Handoff.transfer({
      sourceWorkspace: 'public-share',
      sourceRoute: window.location.pathname,
      targetWorkspace: targetWorkspace,
      targetRoute: route,
      actionId: actionId,
      kind: 'plain-text',
      payload: { text: String(text || '') },
      context: { shareId: shareId }
    });
    if (!result || !result.ok) {
      status('This browser could not move this item safely. You can still copy the text or link manually.', true);
      return false;
    }
    if (referralAction) setReferral(referralAction);
    track('share_page_cta_clicked', { target_route: route, action_id: actionId });
    track('tool_handoff', { target_route: route, action_id: actionId });
    window.location.href = result.route || route;
    return true;
  }

  async function copyLink() {
    var value = publicUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(value);
      else {
        var field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      status('Link copied.');
      track('share_clicked', { success: true });
    } catch (error) {
      status('Could not copy the link. Select it from the address bar instead.', true);
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    track('share_clicked');
    try {
      await navigator.share({
        title: 'Urdu writing shared on Write Urdu',
        text: 'Open this Urdu writing on Write Urdu.',
        url: publicUrl()
      });
      track('share_completed', { success: true });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      status('Sharing is not available here. You can copy the link instead.', true);
    }
  }

  async function reportShare() {
    if (!shareId) return;
    var select = q('[data-share-report-reason]');
    var button = q('[data-share-report]');
    var reason = select ? select.value : '';
    if (!reason) {
      status('Choose a reason before reporting.', true);
      return;
    }
    if (button) button.disabled = true;
    try {
      var response = await fetch('/api/shares/' + encodeURIComponent(shareId) + '/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ reason: reason })
      });
      if (!response.ok) throw new Error('report_failed');
      status('Report received. Thank you.');
      track('share_reported', { success: true });
      if (select) select.disabled = true;
    } catch (error) {
      status('The report could not be sent right now. Please try again.', true);
      if (button) button.disabled = false;
    }
  }

  function bind() {
    trackOnce('share-page-view', 'share_page_viewed');
    var create = q('[data-share-create]');
    if (create) create.addEventListener('click', function (event) {
      event.preventDefault();
      transfer('card-studio', 'share-to-card', publicText(), 'create');
    });
    var useText = q('[data-share-use-text]');
    if (useText) useText.addEventListener('click', function () {
      transfer('basic-writer', 'share-to-basic', publicText(), null);
    });
    var qr = q('[data-share-qr]');
    if (qr) qr.addEventListener('click', function () {
      transfer('qr-generator', 'share-to-qr', publicUrl(), null);
    });
    var copy = q('[data-share-copy]');
    if (copy) copy.addEventListener('click', copyLink);
    var share = q('[data-share-native]');
    if (share) share.addEventListener('click', shareLink);
    var report = q('[data-share-report]');
    if (report) report.addEventListener('click', reportShare);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
}());
