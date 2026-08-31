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
    if (cta) cta.textContent = ratio(share.cta_rate);
    if (republish) republish.textContent = ratio(share.republish_rate);
    if (reproduction) reproduction.textContent = ratio(share.reproduction_ratio);
    if (viewsMeta) viewsMeta.textContent = Number(share.views_per_published_link || 0).toFixed(1).replace(/\.0$/, '') + ' views / link';

    renderBars('#shareLoopBars', [
      { label: 'Publish attempts', value: share.publish_attempts },
      { label: 'Published links', value: share.published_links },
      { label: 'Public views', value: share.public_page_views },
      { label: 'CTA clicks', value: share.cta_clicks },
      { label: 'Destination ready', value: share.destination_ready },
      { label: 'Referral recognized', value: share.referral_recognized },
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

  function renderVoiceCrossWorkspace(data) {
    var voice = data.voice || {};
    var panel = q('#voiceCrossWorkspacePanel');
    if (!panel) return;

    var kpis = {
      exposed: q('[data-voice-cw-kpi="exposed"]'),
      started: q('[data-voice-cw-kpi="started"]'),
      final_rate: q('[data-voice-cw-kpi="final_rate"]'),
      switch_continued_rate: q('[data-voice-cw-kpi="switch_continued_rate"]'),
      voice_led_share_of_concluded_sessions: q('[data-voice-cw-kpi="voice_led_share_of_concluded_sessions"]')
    };

    if (!voice.ready) {
      Object.keys(kpis).forEach(function (key) { if (kpis[key]) kpis[key].textContent = '—'; });
      renderBars('#voiceCrossWorkspaceBars', [], 'label', 'value');
      renderBars('#voiceErrorBars', [], 'category', 'events');
      renderBars('#voiceEligibleDeviceBars', [], 'device_class', 'sessions');
      var body = q('#voiceWorkspaceRows');
      if (body) body.innerHTML = '<tr><td colspan="8" class="os-empty">No Voice activity yet for this period.</td></tr>';
      return;
    }

    if (kpis.exposed) kpis.exposed.textContent = fmt(voice.exposed);
    if (kpis.started) kpis.started.textContent = fmt(voice.started);
    if (kpis.final_rate) kpis.final_rate.textContent = ratio(voice.final_rate);
    if (kpis.switch_continued_rate) kpis.switch_continued_rate.textContent = percent(voice.switch_continued_rate);
    if (kpis.voice_led_share_of_concluded_sessions) kpis.voice_led_share_of_concluded_sessions.textContent = percent(voice.voice_led_share_of_concluded_sessions);

    renderBars('#voiceCrossWorkspaceBars', [
      { label: 'Mic exposed', value: voice.exposed },
      { label: 'Mic selected', value: voice.selected },
      { label: 'Voice started', value: voice.started },
      { label: 'Final speech', value: voice.final },
      { label: 'Switched to Roman/direct', value: voice.switch_continued }
    ], 'label', 'value');

    renderBars('#voiceErrorBars', voice.errors || [], 'category', 'events', function (label) {
      var names = {
        permission_denied: 'Mic permission denied', audio_capture: 'No microphone found',
        no_speech: 'No speech heard', network: 'Network error',
        language_unsupported: 'Language unsupported', unknown: 'Other'
      };
      return names[label] || safeText(label);
    });

    renderBars('#voiceEligibleDeviceBars', voice.eligible_workspace_devices || [], 'device_class', 'sessions', function (label) {
      return safeText(label).replace(/^./, function (c) { return c.toUpperCase(); });
    });

    var rows = q('#voiceWorkspaceRows');
    if (rows) {
      rows.innerHTML = '';
      var workspaces = voice.by_workspace || [];
      if (!workspaces.length) {
        rows.innerHTML = '<tr><td colspan="8" class="os-empty">No workspace exposes Voice yet for this period.</td></tr>';
      } else {
        workspaces.forEach(function (item) {
          var row = document.createElement('tr');
          var values = [
            toolLabels[item.tool] || item.tool,
            fmt(item.sessions),
            fmt(item.voice_started),
            ratio(item.adoption_rate),
            ratio(item.final_rate),
            percent(item.switch_continued_rate),
            fmt(item.voice_led_sessions),
            percent(item.voice_led_share_of_concluded_sessions)
          ];
          values.forEach(function (value, index) {
            var cell = document.createElement('td');
            cell.className = index === 0 ? 'os-tool-name' : 'num';
            cell.textContent = value;
            row.appendChild(cell);
          });
          rows.appendChild(row);
        });
      }
    }
  }

  function renderActivation(data) {
    var activation = data.activation || {};
    var panel = q('#activationFunnelPanel');
    if (!panel) return;

    var funnel = activation.funnel || {};
    var conversion = activation.conversion || {};
    var classification = activation.session_classification || {};

    var kpis = {
      writer_viewed: q('[data-activation-kpi="writer_viewed"]'),
      focused_rate: q('[data-activation-kpi="focused_rate"]'),
      first_input_rate: q('[data-activation-kpi="first_input_rate"]'),
      first_urdu_success_rate: q('[data-activation-kpi="first_urdu_success_rate"]'),
      outcome_rate: q('[data-activation-kpi="outcome_rate"]')
    };

    if (!activation.ready) {
      Object.keys(kpis).forEach(function (key) { if (kpis[key]) kpis[key].textContent = '—'; });
      renderBars('#activationFunnelBars', [], 'label', 'value');
      renderBars('#activationClassificationBars', [], 'label', 'value');
      renderBars('#activationDeviceBars', [], 'device_class', 'sessions');
      var body = q('#activationWorkspaceRows');
      if (body) body.innerHTML = '<tr><td colspan="6" class="os-empty">No writer activity yet for this period.</td></tr>';
      return;
    }

    if (kpis.writer_viewed) kpis.writer_viewed.textContent = fmt(funnel.writer_viewed);
    if (kpis.focused_rate) kpis.focused_rate.textContent = percent(conversion.focused_rate);
    if (kpis.first_input_rate) kpis.first_input_rate.textContent = percent(conversion.first_input_rate);
    if (kpis.first_urdu_success_rate) kpis.first_urdu_success_rate.textContent = percent(conversion.first_urdu_success_rate);
    if (kpis.outcome_rate) kpis.outcome_rate.textContent = percent(conversion.outcome_rate);

    renderBars('#activationFunnelBars', [
      { label: 'Viewed', value: funnel.writer_viewed },
      { label: 'Focused', value: funnel.writer_focused },
      { label: 'First input', value: funnel.writer_first_input },
      { label: 'First Urdu success', value: funnel.writer_first_urdu_success },
      { label: 'First outcome', value: funnel.writer_outcome_first }
    ], 'label', 'value');

    renderBars('#activationClassificationBars', [
      { label: 'Visible, never focused', value: classification.visible_not_focused },
      { label: 'Focused, no input', value: classification.focused_no_input },
      { label: 'Input, no Urdu success', value: classification.input_no_urdu_success },
      { label: 'Urdu success, no outcome', value: classification.success_no_outcome },
      { label: 'Success with outcome', value: classification.success_with_outcome }
    ], 'label', 'value');

    renderBars('#activationDeviceBars', activation.eligible_workspace_devices || [], 'device_class', 'sessions', function (label) {
      return safeText(label).replace(/^./, function (c) { return c.toUpperCase(); });
    });

    var rows = q('#activationWorkspaceRows');
    if (rows) {
      rows.innerHTML = '';
      var workspaces = activation.by_workspace || [];
      if (!workspaces.length) {
        rows.innerHTML = '<tr><td colspan="6" class="os-empty">No workspace has writer activity yet for this period.</td></tr>';
      } else {
        workspaces.forEach(function (item) {
          var row = document.createElement('tr');
          var values = [
            toolLabels[item.tool] || item.tool,
            fmt(item.writer_viewed),
            fmt(item.writer_focused),
            fmt(item.writer_first_input),
            fmt(item.writer_first_urdu_success),
            fmt(item.writer_outcome_first)
          ];
          values.forEach(function (value, index) {
            var cell = document.createElement('td');
            cell.className = index === 0 ? 'os-tool-name' : 'num';
            cell.textContent = value;
            row.appendChild(cell);
          });
          rows.appendChild(row);
        });
      }
    }
  }

  function renderCardStudioFunnel(data) {
    var studio = data.card_studio_funnel || {};
    var panel = q('#cardStudioFunnelPanel');
    if (!panel) return;

    var funnel = studio.funnel || {};
    var conversion = studio.conversion || {};
    var modeSplit = studio.mode_split || {};

    var kpis = {
      visit: q('[data-card-studio-kpi="visit"]'),
      canvas_change_rate: q('[data-card-studio-kpi="canvas_change_rate"]'),
      export_attempted_rate: q('[data-card-studio-kpi="export_attempted_rate"]'),
      advanced_rate: q('[data-card-studio-kpi="advanced_rate"]')
    };

    if (!studio.ready) {
      Object.keys(kpis).forEach(function (key) { if (kpis[key]) kpis[key].textContent = '—'; });
      renderBars('#cardStudioFunnelBars', [], 'label', 'value');
      renderBars('#cardStudioModeBars', [], 'label', 'value');
      return;
    }

    if (kpis.visit) kpis.visit.textContent = fmt(funnel.visit);
    if (kpis.canvas_change_rate) kpis.canvas_change_rate.textContent = percent(conversion.canvas_change_rate);
    if (kpis.export_attempted_rate) kpis.export_attempted_rate.textContent = percent(conversion.export_attempted_rate);
    if (kpis.advanced_rate) kpis.advanced_rate.textContent = percent(modeSplit.advanced_rate);

    renderBars('#cardStudioFunnelBars', [
      { label: 'Visit', value: funnel.visit },
      { label: 'Preset choice', value: funnel.preset_choice },
      { label: 'Text entered', value: funnel.text_entered },
      { label: 'First canvas change', value: funnel.first_canvas_change },
      { label: 'Export step reached', value: funnel.export_step_reached },
      { label: 'Export attempted', value: funnel.export_attempted }
    ], 'label', 'value');

    renderBars('#cardStudioModeBars', [
      { label: 'Quick mode exports', value: modeSplit.quick },
      { label: 'Advanced mode exports', value: modeSplit.advanced }
    ], 'label', 'value');
  }

  function renderContinuationFunnel(data) {
    var continuation = data.continuation || {};
    var panel = q('#continuationFunnelPanel');
    if (!panel) return;

    var funnel = continuation.funnel || {};
    var conversion = continuation.conversion || {};

    var kpis = {
      shown: q('[data-continuation-kpi="shown"]'),
      selected_rate: q('[data-continuation-kpi="selected_rate"]'),
      destination_ready_rate: q('[data-continuation-kpi="destination_ready_rate"]'),
      payload_restored_rate: q('[data-continuation-kpi="payload_restored_rate"]'),
      meaningful_start_rate: q('[data-continuation-kpi="meaningful_start_rate"]')
    };

    if (!continuation.ready) {
      Object.keys(kpis).forEach(function (key) { if (kpis[key]) kpis[key].textContent = '—'; });
      renderBars('#continuationFunnelBars', [], 'label', 'value');
      return;
    }

    if (kpis.shown) kpis.shown.textContent = fmt(funnel.shown);
    if (kpis.selected_rate) kpis.selected_rate.textContent = percent(conversion.selected_rate);
    if (kpis.destination_ready_rate) kpis.destination_ready_rate.textContent = percent(conversion.destination_ready_rate);
    if (kpis.payload_restored_rate) kpis.payload_restored_rate.textContent = percent(conversion.payload_restored_rate);
    if (kpis.meaningful_start_rate) kpis.meaningful_start_rate.textContent = percent(conversion.meaningful_start_rate);

    renderBars('#continuationFunnelBars', [
      { label: 'Shown', value: funnel.shown },
      { label: 'Selected', value: funnel.selected },
      { label: 'Stored', value: funnel.stored },
      { label: 'Destination ready', value: funnel.destination_ready },
      { label: 'Payload restored', value: funnel.payload_restored },
      { label: 'Meaningful start', value: funnel.meaningful_start }
    ], 'label', 'value');
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
    renderVoiceCrossWorkspace(data);
    renderActivation(data);
    renderCardStudioFunnel(data);
    renderContinuationFunnel(data);
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