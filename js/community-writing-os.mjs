import { COMMUNITY_TAXONOMY } from './community-publishing.mjs';

const REJECTION_CODES = Object.freeze([
  { code: 'incomplete_or_low_quality', label: 'Incomplete or low quality' },
  { code: 'spam_or_promotion', label: 'Spam or promotion' },
  { code: 'abusive_or_hateful', label: 'Abusive or hateful' },
  { code: 'sexual_or_unsafe', label: 'Sexual or unsafe' },
  { code: 'personal_information', label: 'Personal information' },
  { code: 'copyright_or_ownership', label: 'Copyright or ownership' },
  { code: 'plagiarism_concern', label: 'Plagiarism concern' },
  { code: 'off_topic', label: 'Off topic' },
  { code: 'needs_writer_revision', label: 'Needs writer revision' },
  { code: 'other', label: 'Other' }
]);

const state = {
  status: 'pending',
  cursor: null,
  items: [],
  activeId: null,
  activeSubmission: null,
  busy: false
};

const el = {
  pulse: document.getElementById('osPulse'),
  banner: document.getElementById('queueBanner'),
  tabs: document.getElementById('statusTabs'),
  list: document.getElementById('queueList'),
  empty: document.getElementById('queueEmpty'),
  loadMore: document.getElementById('loadMore'),
  dialog: document.getElementById('reviewDialog'),
  reviewTitle: document.getElementById('reviewTitle'),
  reviewMeta: document.getElementById('reviewMeta'),
  reviewConflict: document.getElementById('reviewConflict'),
  fieldTitle: document.getElementById('reviewFieldTitle'),
  fieldAuthor: document.getElementById('reviewFieldAuthor'),
  fieldText: document.getElementById('reviewFieldText'),
  category: document.getElementById('reviewCategory'),
  tags: document.getElementById('reviewTags'),
  close: document.getElementById('reviewClose'),
  startReject: document.getElementById('startReject'),
  cancelReject: document.getElementById('cancelReject'),
  confirmReject: document.getElementById('confirmReject'),
  confirmApprove: document.getElementById('confirmApprove'),
  rejectPanel: document.getElementById('rejectPanel'),
  rejectionCode: document.getElementById('rejectionCode'),
  rejectionNote: document.getElementById('rejectionNote')
};

function showBanner(message, isError) {
  el.banner.textContent = message;
  el.banner.classList.toggle('is-error', Boolean(isError));
  el.banner.hidden = !message;
}

async function api(path, options) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: options && options.body ? { 'Content-Type': 'application/json; charset=utf-8' } : undefined,
    ...options
  });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) {
    const code = body && body.error && body.error.code;
    const err = new Error(code || 'request_failed');
    err.status = response.status;
    err.code = code;
    err.body = body;
    throw err;
  }
  return body;
}

function formatTimestamp(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function renderQueue() {
  el.list.textContent = '';
  el.empty.hidden = state.items.length > 0;

  for (const item of state.items) {
    const row = document.createElement('article');
    row.className = 'os-card os-queue-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.dataset.id = item.id;

    const main = document.createElement('div');
    main.className = 'os-queue-main';

    const title = document.createElement('p');
    title.className = 'os-queue-title';
    title.lang = 'ur';
    title.dir = 'rtl';
    title.textContent = item.title;
    main.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'os-queue-meta';
    meta.textContent = [item.primaryCategory, (item.tags || []).join(', '), item.editorKind, formatTimestamp(item.submittedAt)]
      .filter(Boolean).join(' · ');
    main.appendChild(meta);

    const preview = document.createElement('p');
    preview.className = 'os-queue-preview';
    preview.textContent = item.plainTextPreview;
    main.appendChild(preview);

    const side = document.createElement('div');
    side.className = 'os-queue-side';
    const badge = document.createElement('span');
    badge.className = `os-badge ${item.isRevision ? 'is-revision' : 'is-new'}`;
    badge.textContent = item.isRevision ? 'Revision' : 'New';
    side.appendChild(badge);
    if (item.reportCount > 0) {
      const reportBadge = document.createElement('span');
      reportBadge.className = 'os-badge is-report';
      reportBadge.textContent = `${item.reportCount} report${item.reportCount === 1 ? '' : 's'}`;
      side.appendChild(reportBadge);
    }

    row.appendChild(main);
    row.appendChild(side);
    row.addEventListener('click', () => openReview(item.id));
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openReview(item.id);
      }
    });

    el.list.appendChild(row);
  }
}

async function loadQueue(reset) {
  if (reset) {
    state.cursor = null;
    state.items = [];
  }
  el.loadMore.disabled = true;
  try {
    const params = new URLSearchParams({ status: state.status });
    if (state.cursor) params.set('cursor', state.cursor);
    const result = await api(`/api/internal/community/moderation?${params.toString()}`);
    state.items = reset ? result.items : state.items.concat(result.items);
    state.cursor = result.nextCursor;
    el.loadMore.hidden = !state.cursor;
    el.loadMore.disabled = false;
    renderQueue();
    showBanner('', false);
  } catch (err) {
    showBanner(moderationErrorMessage(err), true);
  }
}

function moderationErrorMessage(err) {
  if (err && err.code === 'moderator_identity_required') return 'Sign in through Cloudflare Access to review submissions.';
  if (err && err.code === 'moderator_not_authorized') return 'Your Access identity is not on the moderator allowlist.';
  if (err && err.status === 404) return 'Community Writing moderation is not available on this host.';
  return 'Could not load the moderation queue. Try again.';
}

function populateCategorySelect(selected) {
  el.category.textContent = '';
  for (const category of COMMUNITY_TAXONOMY.primaryCategories) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    option.selected = category === selected;
    el.category.appendChild(option);
  }
}

function populateTags(selectedTags) {
  el.tags.textContent = '';
  const selected = new Set(selectedTags || []);
  for (const tag of COMMUNITY_TAXONOMY.tags) {
    const label = document.createElement('label');
    label.className = 'os-review-tag';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = tag;
    input.checked = selected.has(tag);
    label.appendChild(input);
    label.appendChild(document.createTextNode(tag));
    el.tags.appendChild(label);
  }
}

function selectedTagValues() {
  return Array.from(el.tags.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
}

function populateRejectionCodes() {
  el.rejectionCode.textContent = '';
  for (const entry of REJECTION_CODES) {
    const option = document.createElement('option');
    option.value = entry.code;
    option.textContent = entry.label;
    el.rejectionCode.appendChild(option);
  }
}

function setBusy(busy) {
  state.busy = busy;
  el.confirmApprove.disabled = busy;
  el.confirmReject.disabled = busy;
  el.startReject.disabled = busy;
}

async function openReview(id) {
  try {
    const result = await api(`/api/internal/community/moderation/${id}`);
    state.activeId = id;
    state.activeSubmission = result.submission;
    el.reviewConflict.hidden = true;
    el.rejectPanel.hidden = true;
    el.confirmReject.hidden = true;
    el.cancelReject.hidden = true;
    el.startReject.hidden = false;
    el.confirmApprove.hidden = false;
    el.rejectionNote.value = '';

    el.reviewTitle.textContent = result.submission.isRevision ? 'Review revision' : 'Review submission';
    el.reviewMeta.textContent = [
      result.submission.editorKind,
      result.submission.isRevision ? 'Revision' : 'New publication',
      `Submitted ${formatTimestamp(result.submission.submittedAt)}`
    ].filter(Boolean).join(' · ');
    el.fieldTitle.textContent = result.submission.title;
    el.fieldAuthor.textContent = result.submission.publicAuthorName;
    el.fieldText.textContent = result.submission.plainText;
    populateCategorySelect(result.submission.primaryCategory);
    populateTags(result.submission.tags);

    el.dialog.showModal();
  } catch (err) {
    showBanner(moderationErrorMessage(err), true);
  }
}

function closeReview() {
  el.dialog.close();
  state.activeId = null;
  state.activeSubmission = null;
}

function showConflict(err) {
  const detail = err && err.body && err.body.error;
  el.reviewConflict.hidden = false;
  if (err && err.code === 'community_moderation_stale_review') {
    el.reviewConflict.textContent = 'This submission changed since you opened it. Close and reload to review the current version.';
  } else if (detail && detail.currentStatus) {
    el.reviewConflict.textContent = `This submission is now "${detail.currentStatus}" and can no longer be reviewed here.`;
  } else {
    el.reviewConflict.textContent = 'Could not complete this action. Close and try again.';
  }
}

async function approve() {
  if (!state.activeId || !state.activeSubmission || state.busy) return;
  setBusy(true);
  try {
    await api(`/api/internal/community/moderation/${state.activeId}/approve`, {
      method: 'POST',
      body: JSON.stringify({
        submissionRevision: state.activeSubmission.submissionRevision,
        primaryCategory: el.category.value,
        tags: selectedTagValues()
      })
    });
    closeReview();
    showBanner('Approved and published.', false);
    await loadQueue(true);
  } catch (err) {
    if (err.status === 409) {
      showConflict(err);
    } else {
      showBanner(moderationErrorMessage(err), true);
    }
  } finally {
    setBusy(false);
  }
}

async function reject() {
  if (!state.activeId || !state.activeSubmission || state.busy) return;
  setBusy(true);
  try {
    await api(`/api/internal/community/moderation/${state.activeId}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        submissionRevision: state.activeSubmission.submissionRevision,
        rejectionCode: el.rejectionCode.value,
        rejectionNote: el.rejectionNote.value.trim() || undefined
      })
    });
    closeReview();
    showBanner('Rejected.', false);
    await loadQueue(true);
  } catch (err) {
    if (err.status === 409) {
      showConflict(err);
    } else {
      showBanner(moderationErrorMessage(err), true);
    }
  } finally {
    setBusy(false);
  }
}

function bind() {
  el.tabs.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-status]');
    if (!button) return;
    for (const tab of el.tabs.querySelectorAll('button')) tab.setAttribute('aria-pressed', String(tab === button));
    state.status = button.dataset.status;
    loadQueue(true);
  });

  el.loadMore.addEventListener('click', () => loadQueue(false));
  el.close.addEventListener('click', closeReview);
  el.dialog.addEventListener('click', (event) => {
    if (event.target === el.dialog) closeReview();
  });

  el.startReject.addEventListener('click', () => {
    el.rejectPanel.hidden = false;
    el.startReject.hidden = true;
    el.confirmApprove.hidden = true;
    el.confirmReject.hidden = false;
    el.cancelReject.hidden = false;
  });
  el.cancelReject.addEventListener('click', () => {
    el.rejectPanel.hidden = true;
    el.startReject.hidden = false;
    el.confirmApprove.hidden = false;
    el.confirmReject.hidden = true;
    el.cancelReject.hidden = true;
  });

  el.confirmApprove.addEventListener('click', approve);
  el.confirmReject.addEventListener('click', reject);
}

function pulseStat(label, value, warn) {
  return `<div class="os-card os-pulse-stat${warn ? ' is-warn' : ''}"><span class="os-pulse-value">${value}</span><span class="os-pulse-label">${label}</span></div>`;
}

async function loadPulse() {
  if (!el.pulse) return;
  try {
    const pulse = await api('/api/internal/community/pulse');
    if (!pulse || pulse.ready === false) return;
    const oldestHours = pulse.pending.oldest_pending_age_hours;
    const oldestLabel = oldestHours === null ? 'no pending items' : `oldest ${oldestHours}h`;
    el.pulse.innerHTML = [
      pulseStat('Pending', `${pulse.pending.count}`, oldestHours !== null && oldestHours > 72),
      pulseStat('Oldest pending', oldestLabel, oldestHours !== null && oldestHours > 72),
      pulseStat('Approved (7d)', pulse.approved.last_7d),
      pulseStat('Rejected (7d)', pulse.rejected.last_7d),
      pulseStat('Approval rate (30d)', `${Math.round(pulse.approval_rate_30d * 100)}%`),
      pulseStat('Published total', pulse.published_total),
      pulseStat('Reports (7d)', pulse.reports.last_7d, pulse.reports.last_7d > 0),
      pulseStat('Reading views (7d)', pulse.reading.views_7d),
      pulseStat('Write CTA clicks (7d)', pulse.reading.cta_clicks_7d)
    ].join('');
  } catch {
    // Pulse is a convenience panel; the queue itself must keep working without it.
  }
}

populateRejectionCodes();
bind();
loadQueue(true);
loadPulse();

export const COMMUNITY_WRITING_OS_INTERNALS = Object.freeze({ REJECTION_CODES, moderationErrorMessage });
