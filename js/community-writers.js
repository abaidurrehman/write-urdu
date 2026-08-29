(function () {
  'use strict';

  var ENDPOINT = '/api/events';
  var SESSION_KEY = 'write-urdu:telemetry-session:v1';
  var once = Object.create(null);

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
    else for (var i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(bytes, function (value) { return value.toString(16).padStart(2, '0'); }).join('');
  }

  function sessionId() {
    try {
      var current = sessionStorage.getItem(SESSION_KEY);
      if (current) return current;
      current = randomId();
      sessionStorage.setItem(SESSION_KEY, current);
      return current;
    } catch (error) {
      return randomId();
    }
  }

  function routeType() {
    var path = String(window.location.pathname || '/').replace(/\/+$/, '') || '/';
    if (path === '/urdu-writers') return 'hub';
    if (path.indexOf('/urdu-writers/category/') === 0) return 'category';
    if (path.indexOf('/urdu-writers/') === 0) return 'detail';
    return 'hub';
  }

  var currentRouteType = routeType();
  var session = sessionId();

  function track(eventName) {
    var event = {
      event_id: randomId(),
      session_id: session,
      route: currentRouteType === 'hub' ? '/urdu-writers' : (currentRouteType === 'category' ? '/urdu-writers/category/:category' : '/urdu-writers/:slug'),
      tool: 'community_writing',
      event_name: eventName,
      format: null,
      length_bucket: null,
      active_time_bucket: null,
      input_mode: null,
      success: null,
      device_class: null,
      target_route: null
    };
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events: [event] }),
        credentials: 'same-origin',
        keepalive: true
      }).catch(function () {});
    } catch (error) {}
  }

  function trackOnce(key, eventName) {
    if (once[key]) return;
    once[key] = true;
    track(eventName);
  }

  function q(selector) {
    return document.querySelector(selector);
  }

  function reportPublication() {
    var panel = q('[data-cw-publication-id]');
    if (!panel) return;
    var id = panel.getAttribute('data-cw-publication-id');
    var select = q('[data-cw-report-reason]');
    var button = q('[data-cw-report]');
    var status = q('[data-cw-report-status]');
    var reason = select ? select.value : '';
    if (!reason) {
      if (status) { status.textContent = 'Choose a reason before reporting.'; status.className = 'cw-report-status is-error'; }
      return;
    }
    if (button) button.disabled = true;
    fetch('/api/community/publications/' + encodeURIComponent(id) + '/report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ reason: reason })
    })
      .then(function (response) {
        if (!response.ok) throw new Error('report_failed');
        if (status) { status.textContent = 'Report received. Thank you.'; status.className = 'cw-report-status'; }
        track('community_report_submitted');
        if (select) select.disabled = true;
      })
      .catch(function () {
        if (status) { status.textContent = 'The report could not be sent right now. Please try again.'; status.className = 'cw-report-status is-error'; }
        if (button) button.disabled = false;
      });
  }

  function bind() {
    trackOnce('community-page-view', 'community_publication_viewed');
    var reportButton = q('[data-cw-report]');
    if (reportButton) reportButton.addEventListener('click', reportPublication);
    var writeCtas = document.querySelectorAll('[data-cw-write-cta]');
    for (var i = 0; i < writeCtas.length; i += 1) {
      writeCtas[i].addEventListener('click', function () { track('community_write_cta_clicked'); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
}());
