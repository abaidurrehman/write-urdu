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

  function route() {
    var path = String(window.location.pathname || '/').split('?')[0].split('#')[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    if (/^\/s\/[A-Za-z0-9]{8,12}$/.test(path)) return '/s/:share';
    return /^\/[a-z0-9\/:_-]*$/i.test(path) ? path : '/';
  }

  function tool(path) {
    if (path === '/s/:share') return 'public_share';
    if (path === '/urdu-card-studio') return 'card_studio';
    return 'content';
  }

  function deviceClass() {
    var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (width < 600) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  var currentRoute = route();
  var currentTool = tool(currentRoute);
  var session = sessionId();

  function normalizeTarget(value) {
    var path = String(value || '').split('?')[0].split('#')[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    return /^\/[a-z0-9\/-]*$/i.test(path) ? path : null;
  }

  function track(eventName, detail) {
    detail = detail || {};
    var event = {
      event_id: randomId(),
      session_id: session,
      route: currentRoute,
      tool: detail.tool || currentTool,
      event_name: eventName,
      format: null,
      length_bucket: null,
      active_time_bucket: null,
      input_mode: null,
      success: typeof detail.success === 'boolean' ? detail.success : null,
      device_class: deviceClass(),
      target_route: detail.target_route ? normalizeTarget(detail.target_route) : null
    };
    var body = JSON.stringify({ events: [event] });
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        credentials: 'same-origin',
        keepalive: true
      }).catch(function () {});
    } catch (error) {}
  }

  function trackOnce(key, eventName, detail) {
    if (once[key]) return false;
    once[key] = true;
    track(eventName, detail);
    return true;
  }

  window.WriteUrduShareTelemetry = { track: track, trackOnce: trackOnce };
}());
