(function () {
  'use strict';

  var number = new Intl.NumberFormat('en-US');
  var channelLabels = {
    direct_unknown: 'Direct / saved / unknown',
    google_search: 'Google Search',
    other_search: 'Other search',
    referral: 'Referral',
    campaign: 'Campaign',
    internal: 'Internal navigation'
  };

  function q(selector) { return document.querySelector(selector); }
  function qa(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function fmt(value) { return number.format(Number(value || 0)); }

  function activeDays() {
    var active = q('[data-days][aria-pressed="true"]');
    return Number(active && active.getAttribute('data-days') || 7);
  }

  function renderBars(selector, items, labelKey, valueKey, labels) {
    var container = q(selector);
    if (!container) return;
    container.innerHTML = '';
    if (!items || !items.length) {
      container.innerHTML = '<div class="os-empty">No acquisition data yet for this period.</div>';
      return;
    }
    var max = Math.max.apply(null, items.map(function (item) { return Number(item[valueKey] || 0); }).concat([1]));
    items.forEach(function (item) {
      var value = Number(item[valueKey] || 0);
      var rawLabel = String(item[labelKey] || '');
      var label = labels && labels[rawLabel] ? labels[rawLabel] : rawLabel;
      var row = document.createElement('div');
      row.className = 'os-bar-row';
      var labelNode = document.createElement('div');
      labelNode.className = 'os-bar-label';
      labelNode.title = label;
      labelNode.textContent = label;
      var track = document.createElement('div');
      track.className = 'os-bar-track';
      var fill = document.createElement('div');
      fill.className = 'os-bar-fill';
      fill.style.width = Math.max(2, (value / max) * 100) + '%';
      track.appendChild(fill);
      var valueNode = document.createElement('div');
      valueNode.className = 'os-bar-value';
      valueNode.textContent = fmt(value);
      row.appendChild(labelNode);
      row.appendChild(track);
      row.appendChild(valueNode);
      container.appendChild(row);
    });
  }

  function orderedChannels(items) {
    var order = ['direct_unknown', 'google_search', 'other_search', 'referral', 'campaign'];
    var map = {};
    (items || []).forEach(function (item) { map[item.acquisition_channel] = item; });
    return order.filter(function (key) { return map[key]; }).map(function (key) { return map[key]; });
  }

  function render(data) {
    if (!data.ready) {
      var source = q('#productEntryBars');
      var routes = q('#entryRouteBars');
      if (source) source.innerHTML = '<div class="os-empty">' + (data.message || 'Acquisition data is not ready yet.') + '</div>';
      if (routes) routes.innerHTML = '<div class="os-empty">Waiting for entry-route data.</div>';
      return;
    }
    renderBars('#productEntryBars', orderedChannels(data.product_channels), 'acquisition_channel', 'entries', channelLabels);
    renderBars('#entryRouteBars', data.entry_routes || [], 'route', 'entries');
    var note = q('#productEntryNote');
    if (note) note.textContent = fmt(data.current && data.current.product_entries) + ' product entries';
    var routeNote = q('#entryRouteNote');
    if (routeNote) routeNote.textContent = fmt(data.current && data.current.site_entries) + ' site entries';
  }

  async function load() {
    try {
      var response = await fetch('/api/internal/acquisition-pulse?days=' + activeDays(), {
        credentials: 'same-origin', cache: 'no-store'
      });
      if (!response.ok) return;
      render(await response.json());
    } catch (error) { }
  }

  qa('[data-days]').forEach(function (button) {
    button.addEventListener('click', function () { window.setTimeout(load, 0); });
  });
  var refresh = q('#refreshPulse');
  if (refresh) refresh.addEventListener('click', load);
  load();
}());
