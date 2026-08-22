(function () {
  'use strict';

  var days = 7;
  var number = new Intl.NumberFormat('en-US');
  var toolLabels = {
    basic_editor: 'Basic editor',
    rich_editor: 'Rich editor',
    urdu_keyboard: 'Urdu keyboard',
    card_studio: 'Card Studio',
    stylish_text: 'Stylish Urdu Text',
    name_art: 'Name Art',
    whatsapp_status: 'WhatsApp Status',
    instagram_post: 'Instagram Post',
    invoice_generator: 'Invoice Generator',
    qr_generator: 'QR Generator',
    public_share: 'Public share page',
    content: 'Content page'
  };

  function q(selector) { return document.querySelector(selector); }
  function qa(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }
  function fmt(value) { return number.format(Number(value || 0)); }
  function percent(value) { return (Number(value || 0) * 100).toFixed(1).replace(/\.0$/, '') + '%'; }
  function ratio(value) { return Number(value || 0).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1') + '×'; }
  function safeText(value) { return String(value == null ? '' : value); }

  function showBanner(message, error) {
    var banner = q('#pulseBanner');
    banner.textContent = message;
    banner.hidden = false;
    banner.classList.toggle('is-error', Boolean(error));
  }

  function hideBanner() {
    var banner = q('#pulseBanner');
    banner.hidden = true;
    banner.classList.remove('is-error');
  }

  function setLoading(loading) {
    var button = q('#refreshPulse');
    button.disabled = loading;
    button.textContent = loading ? 'Refreshing…' : 'Refresh';
  }

  function compareText(current, previous) {
    current = Number(current || 0);
    previous = Number(previous || 0);
    if (!previous && !current) return { text: 'No activity in either period', className: '' };
    if (!previous) return { text: 'New activity vs previous period', className: 'is-up' };
    var change = ((current - previous) / previous) * 100;
    var sign = change > 0 ? '+' : '';
    return {
      text: sign + change.toFixed(0) + '% vs previous period',
      className: change > 0 ? 'is-up' : change < 0 ? 'is-down' : ''
    };
  }

  function renderKpis(data) {
    var current = data.current || {};
    var previous = data.previous || {};
    ['sessions', 'engaged_sessions', 'copies', 'exports'].forEach(function (key) {
      var node = q('[data-kpi="' + key + '"]');
      if (node) node.textContent = fmt(current[key]);
      var meta = q('[data-compare="' + key + '"]');
      if (meta) {
        var comparison = compareText(current[key], previous[key]);
        meta.textContent = comparison.text;
        meta.classList.remove('is-up', 'is-down');
        if (comparison.className) meta.classList.add(comparison.className);
      }
    });
    var engagement = q('[data-kpi="engagement_rate"]');
    if (engagement) engagement.textContent = percent(current.engagement_rate);

    var formats = current.exports_by_format || {};
    qa('[data-format]').forEach(function (node) {
      node.textContent = fmt(formats[node.getAttribute('data-format')] || 0);
    });
  }

  function renderBars(containerSelector, items, labelKey, valueKey, labelTransform) {
    var container = q(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    if (!items || !items.length) {
      container.innerHTML = '<div class="os-empty">No data yet for this period.</div>';
      return;
    }
    var max = Math.max.apply(null, items.map(function (item) { return Number(item[valueKey] || 0); }).concat([1]));
    items.forEach(function (item) {
      var value = Number(item[valueKey] || 0);
      var label = labelTransform ? labelTransform(item[labelKey]) : safeText(item[labelKey]);
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

  function renderOutcomes(data) {
    var c = data.current || {};
    renderBars('#outcomeBars', [
      { label: 'Copy', value: c.copies },
      { label: 'Export', value: c.exports },
      { label: 'Share', value: c.shares },
      { label: 'Print', value: c.prints },
      { label: 'Handoff', value: c.handoffs },
      { label: 'Batch translit.', value: c.batch_transliterations },
      { label: 'Canvas edit', value: c.canvas_interactions },
      { label: 'Template use', value: c.template_uses },
      { label: 'Local image', value: c.background_image_uses }
    ], 'label', 'value');
  }

  function renderShareLoop(data) {
    var share = data.share_loop || {};
    var panel = q('#shareLoopPanel');
    if (!panel) return;

    var published = q('[data-share-kpi="published_links"]');
    var views = q('[data-share-kpi="public_page_views"]');
    var cta = q('[data-share-kpi="cta_rate"]');
    var republish = q('[data-share-kpi="republish_rate"]');
    var reproduction = q('[data-share-kpi="reproduction_ratio"]');
    var viewsMeta = q('[data-share-meta="views_per_link"]');
    var trustNote = q('#shareLoopTrustNote');

    if (!share.ready) {
      [published, views, cta, republish, reproduction].forEach(function (node) { if (node) node.textContent = '—'; });
      if (viewsMeta) viewsMeta.textContent = 'Waiting for first published link';
      renderBars('#shareLoopBars', [], 'label', 'value');
      renderBars('#shareDeviceBars', [], 'device_class', 'views');
      if (trustNote) trustNote.textContent = 'Share Loop will appear after the first publishing/visitor events. Share IDs and public Urdu text are never included in anonymous telemetry.';
      return;
    }

    if (published) published.textContent = fmt(share.published_links);
    if (views) views.textContent = fmt(share.public_page_views);
    if (cta) cta.textContent = percent(share.cta_rate);
    if (republish) republish.textContent = percent(share.republish_rate);
    if (reproduction) reproduction.textContent = ratio(share.reproduction_ratio);
    if (viewsMeta) viewsMeta.textContent = Number(share.views_per_published_link || 0).toFixed(1).replace(/\.0$/, '') + ' views / link';

    renderBars('#shareLoopBars', [
      { label: 'Publish attempts', value: share.publish_attempts },
      { label: 'Published links', value: share.published_links },
      { label: 'Public views', value: share.public_page_views },
      { label: 'CTA clicks', value: share.cta_clicks },
      { label: 'Referred starts', value: share.referred_creation_starts },
      { label: 'Republished', value: share.republish_completed },
      { label: 'Child shares', value: share.child_share_artifacts }
    ], 'label', 'value');
    renderBars('#shareDeviceBars', share.devices || [], 'device_class', 'views', function (label) {
      return safeText(label).replace(/^./, function (c) { return c.toUpperCase(); });
    });

    if (trustNote) {
      trustNote.textContent = fmt(share.link_share_actions) + ' copy/native share actions · ' +
        fmt(share.deletions) + ' deletions · ' + fmt(share.reports) + ' reports · ' +
        Number(share.report_rate_per_1000_views || 0).toFixed(1).replace(/\.0$/, '') +
        ' reports / 1,000 public views. Share IDs and public Urdu text are not included in anonymous telemetry.';
    }
  }

  function orderedBuckets(items, order) {
    var map = {};
    (items || []).forEach(function (item) { map[item.bucket] = item; });
    return order.filter(function (key) { return map[key]; }).map(function (key) { return map[key]; });
  }

  function renderDistributions(data) {
    var lengths = orderedBuckets(data.length_distribution, ['0', '1-20', '21-50', '51-100', '101-250', '251-500', '501-1000', '1001-2500', '2500+', 'unknown']);
    var active = orderedBuckets(data.active_time_distribution, ['0-10s', '11-30s', '31-60s', '61-180s', '181-600s', '600s+', 'unknown']);
    renderBars('#lengthBars', lengths, 'bucket', 'summaries');
    renderBars('#activeBars', active, 'bucket', 'summaries');
    renderBars('#modeBars', data.input_modes || [], 'input_mode', 'summaries', function (label) {
      return label === 'roman' ? 'Roman → Urdu' : label === 'direct' ? 'Direct Urdu / English' : 'Unknown';
    });
    renderBars('#deviceBars', data.devices || [], 'device_class', 'sessions', function (label) {
      return safeText(label).replace(/^./, function (c) { return c.toUpperCase(); });
    });
    renderBars('#handoffBars', data.handoffs || [], 'target_route', 'events');
    renderBars('#localeUsageBars', data.locale_breakdown || [], 'locale', 'sessions', function (label) {
      return label === 'ur' ? 'Urdu (/urdu/)' : 'English';
    });
  }

  function renderTools(data) {
    var body = q('#toolRows');
    body.innerHTML = '';
    var tools = data.tools || [];
    if (!tools.length) {
      body.innerHTML = '<tr><td colspan="7" class="os-empty">No tool activity yet for this period.</td></tr>';
      return;
    }
    tools.forEach(function (item) {
      var sessions = Number(item.sessions || 0);
      var engaged = Number(item.engaged_sessions || 0);
      var row = document.createElement('tr');
      var values = [
        toolLabels[item.tool] || item.tool,
        fmt(sessions),
        fmt(engaged),
        sessions ? percent(engaged / sessions) : '—',
        fmt(item.copies),
        fmt(item.exports),
        fmt(item.canvas_interactions)
      ];
      values.forEach(function (value, index) {
        var cell = document.createElement('td');
        if (index === 0) cell.className = 'os-tool-name';
        else cell.className = 'num';
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  function renderDaily(data) {
    var chart = q('#dailyChart');
    chart.innerHTML = '';
    var daily = data.daily || [];
    if (!daily.length) {
      chart.innerHTML = '<div class="os-empty">No daily activity yet.</div>';
      return;
    }
    var max = Math.max.apply(null, daily.map(function (item) { return Number(item.sessions || 0); }).concat([1]));
    daily.forEach(function (item) {
      var day = document.createElement('div');
      day.className = 'os-day';
      day.title = item.day + ': ' + fmt(item.sessions) + ' visits, ' + fmt(item.engaged_sessions) + ' engaged';
      var bars = document.createElement('div');
      bars.className = 'os-day-bars';
      var sessionBar = document.createElement('div');
      sessionBar.className = 'os-day-bar';
      sessionBar.style.height = Math.max(2, (Number(item.sessions || 0) / max) * 100) + '%';
      var engagedBar = document.createElement('div');
      engagedBar.className = 'os-day-bar is-engaged';
      engagedBar.style.height = Math.max(2, (Number(item.engaged_sessions || 0) / max) * 100) + '%';
      bars.appendChild(sessionBar);
      bars.appendChild(engagedBar);
      var label = document.createElement('div');
      label.className = 'os-day-label';
      label.textContent = safeText(item.day).slice(5);
      day.appendChild(bars);
      day.appendChild(label);
      chart.appendChild(day);
    });
  }

  function render(data) {
    if (!data.ready) {
      showBanner(data.message || 'Product telemetry is not ready yet.', false);
      return;
    }
    hideBanner();
    renderKpis(data);
    renderOutcomes(data);
    renderShareLoop(data);
    renderDistributions(data);
    renderTools(data);
    renderDaily(data);
    q('#lastUpdated').textContent = 'Updated ' + new Date(data.generated_at).toLocaleString() + (data.current && data.current.latest_event_at ? ' · latest event ' + new Date(data.current.latest_event_at).toLocaleString() : '');
    q('#dataStatus').textContent = data.storage === 'hourly_rollups' ? 'Rollups live' : (data.current && data.current.latest_event_at ? 'Telemetry live' : 'Telemetry ready');
  }

  async function load() {
    setLoading(true);
    try {
      var response = await fetch('/api/internal/product-pulse?days=' + days, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 404) throw new Error('Product Pulse data is only available from the protected WriteUrdu OS host.');
        throw new Error('Product Pulse API returned HTTP ' + response.status + '.');
      }
      var data = await response.json();
      render(data);
    } catch (error) {
      showBanner(error.message || 'Could not load Product Pulse.', true);
      q('#dataStatus').textContent = 'Telemetry unavailable';
    } finally {
      setLoading(false);
    }
  }

  qa('[data-days]').forEach(function (button) {
    button.addEventListener('click', function () {
      days = Number(button.getAttribute('data-days') || 7);
      qa('[data-days]').forEach(function (other) { other.setAttribute('aria-pressed', other === button ? 'true' : 'false'); });
      load();
    });
  });
  q('#refreshPulse').addEventListener('click', load);
  load();
}());