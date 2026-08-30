import { ACCOUNT_STATE, fetchAccountState, flushLocalWriting } from './account-session.mjs';
import {
  COMMUNITY_CONTENT_LIMITS,
  createCommunityClient,
  buildSubmissionPayload,
  validateSubmissionForm,
  shouldShowPrompt,
  suppressPrompt,
  promptSignature,
  writePublishIntent,
  readPublishIntent,
  CommunityApiError
} from './community-publishing.mjs';
import {
  categoryLabel,
  tagLabel,
  categoryOptionsMarkup,
  tagCheckboxesMarkup,
  formErrorMessage
} from './community-publishing-taxonomy-ui.mjs';

const runtime = window;
const client = createCommunityClient();
const ROUTE_EDITOR_KIND = Object.freeze({
  '/': 'basic',
  '/urdu-editor': 'rich',
  '/urdu-keyboard': 'keyboard',
  '/tools/urdu-voice-typing': 'voice'
});

let dialog = null;
let editorKind = null;
let account = { state: ACCOUNT_STATE.DISABLED, user: null };

function normalizedPath() {
  if (runtime.WriteUrduLocaleRoute && typeof runtime.WriteUrduLocaleRoute.productPath === 'function') return runtime.WriteUrduLocaleRoute.productPath(location.pathname || '/');
  let path = String(location.pathname || '/');
  if (/\.html$/i.test(path)) path = path.slice(0, -5);
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

function sessionStore() {
  try { return runtime.sessionStorage; } catch { return null; }
}

function track(eventName, detail) {
  if (runtime.WriteUrduTelemetry && typeof runtime.WriteUrduTelemetry.track === 'function') runtime.WriteUrduTelemetry.track(eventName, detail || {});
}

function currentText() {
  if (editorKind === 'voice') {
    const field = document.getElementById('voiceTranscript');
    return field ? String(field.value || '') : '';
  }
  const adapter = runtime.WriteUrduTools && runtime.WriteUrduTools.adapter;
  return adapter && adapter.kind === editorKind ? String(adapter.getText() || '') : '';
}

function waitForReady() {
  return new Promise((resolve) => {
    let attempts = 0;
    const timer = runtime.setInterval(() => {
      attempts += 1;
      const ready = editorKind === 'voice'
        ? Boolean(document.getElementById('voiceTranscript'))
        : Boolean(runtime.WriteUrduTools && runtime.WriteUrduTools.adapter && runtime.WriteUrduTools.adapter.kind === editorKind);
      if (ready || attempts >= 180) {
        runtime.clearInterval(timer);
        resolve(ready);
      }
    }, 50);
  });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'wu-community-dialog';
  dialog.setAttribute('aria-label', 'Publish to Urdu Writers');
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  document.body.appendChild(dialog);
  return dialog;
}

function openDialog(html) {
  const node = ensureDialog();
  node.innerHTML = html;
  if (typeof node.showModal === 'function') { if (!node.open) node.showModal(); }
  else node.setAttribute('open', '');
  return node;
}

function closeDialog() {
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
}

function bindClose(node) {
  node.querySelectorAll('[data-wu-community-close]').forEach((button) => button.addEventListener('click', closeDialog));
}

function submitErrorMessage(error) {
  if (error instanceof CommunityApiError) {
    if (error.code === 'community_pending_quota_reached') return 'You have reached the current pending-submission limit.';
    if (error.code === 'community_submission_rate_limited') return 'Too many submissions were made recently. Please try again later.';
    if (error.status === 401) return 'Please sign in again to submit for review.';
  }
  return 'Could not submit — your writing is still safe.';
}

function readFormState(form, state) {
  const data = new FormData(form);
  return {
    ...state,
    title: String(data.get('title') || '').trim(),
    publicAuthorName: String(data.get('publicAuthorName') || '').trim(),
    primaryCategory: String(data.get('primaryCategory') || ''),
    tags: data.getAll('tags').map(String),
    rightsConfirmed: data.get('rightsConfirmed') === 'on',
    publicConfirmed: data.get('publicConfirmed') === 'on',
    guidelinesConfirmed: data.get('guidelinesConfirmed') === 'on'
  };
}

function formDialog(state) {
  const node = openDialog(`
    <form class="wu-community-form" data-wu-community-form>
      <div class="wu-community-dialog-head">
        <div>
          <h2>Publish to Urdu Writers</h2>
          <p>Share this writing with the WriteUrdu community. It will be reviewed before anyone else can see it.</p>
        </div>
        <button type="button" class="wu-community-dialog-close" aria-label="Close" data-wu-community-close>×</button>
      </div>
      <label class="wu-community-field">
        <span>Title</span>
        <div class="wu-community-field-row">
          <input type="text" name="title" value="${escapeHtml(state.title)}" maxlength="${COMMUNITY_CONTENT_LIMITS.maxTitleChars}" required data-wu-community-title>
          <button type="button" class="wu-community-convert" data-wu-community-convert-title>Convert to Urdu</button>
        </div>
        <small>Type in English letters, then convert to Urdu script — or type Urdu directly.</small>
      </label>
      <label class="wu-community-field">
        <span>Name shown with your writing</span>
        <input type="text" name="publicAuthorName" value="${escapeHtml(state.publicAuthorName)}" maxlength="${COMMUNITY_CONTENT_LIMITS.maxPublicAuthorChars}" required>
        <small>Use your name or a pen name. Readers never see your account email.</small>
      </label>
      <label class="wu-community-field">
        <span>Category</span>
        <select name="primaryCategory" required>
          <option value="" disabled${state.primaryCategory ? '' : ' selected'}>Choose one</option>
          ${categoryOptionsMarkup(state.primaryCategory)}
        </select>
      </label>
      <fieldset class="wu-community-field">
        <legend>Tags (choose 1 to 5)</legend>
        <div class="wu-community-tags">${tagCheckboxesMarkup(state.tags)}</div>
      </fieldset>
      <div class="wu-community-confirms">
        <label><input type="checkbox" name="rightsConfirmed"${state.rightsConfirmed ? ' checked' : ''} required> I wrote this, or I have permission to publish it.</label>
        <label><input type="checkbox" name="publicConfirmed"${state.publicConfirmed ? ' checked' : ''} required> I understand approved writing will be publicly readable on WriteUrdu.</label>
        <label><input type="checkbox" name="guidelinesConfirmed"${state.guidelinesConfirmed ? ' checked' : ''} required> I agree to the <a href="/community-guidelines" target="_blank" rel="noopener">Community Publishing Guidelines</a>.</label>
      </div>
      <p class="wu-community-error" data-wu-community-form-error hidden></p>
      <div class="wu-community-dialog-actions">
        <button type="button" data-wu-community-close>Cancel</button>
        <button type="submit" class="primary">Preview submission</button>
      </div>
    </form>`);
  bindClose(node);
  bindTitleConvert(node);
  const form = node.querySelector('[data-wu-community-form]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = readFormState(form, state);
    next.plainText = currentText();
    const { valid, errors } = validateSubmissionForm(next);
    if (!valid) {
      const errorNode = form.querySelector('[data-wu-community-form-error]');
      if (errorNode) { errorNode.hidden = false; errorNode.textContent = formErrorMessage(errors); }
      return;
    }
    previewDialog(next);
  });
  return node;
}

function bindTitleConvert(node) {
  const button = node.querySelector('[data-wu-community-convert-title]');
  const input = node.querySelector('[data-wu-community-title]');
  if (!button || !input) return;
  button.addEventListener('click', () => {
    const value = String(input.value || '').trim();
    if (!value) { input.focus(); return; }
    const service = runtime.WriteUrduBatchTransliteration;
    if (!service || typeof service.transliterate !== 'function') return;
    button.disabled = true;
    service.transliterate(value)
      .then((converted) => { input.value = converted; input.focus(); })
      .finally(() => { button.disabled = false; });
  });
}

function previewDialog(state) {
  const frozenText = state.plainText;
  const node = openDialog(`
    <div class="wu-community-dialog-head">
      <div>
        <h2>Preview your submission</h2>
        <p>This is exactly what will be sent for review. Publication happens only after a moderator approves it.</p>
      </div>
      <button type="button" class="wu-community-dialog-close" aria-label="Close" data-wu-community-close>×</button>
    </div>
    <div class="wu-community-preview" lang="ur" dir="rtl">
      <h3>${escapeHtml(state.title)}</h3>
      <p class="wu-community-preview-meta">${escapeHtml(state.publicAuthorName)} · ${escapeHtml(categoryLabel(state.primaryCategory))} · ${state.tags.map((tag) => escapeHtml(tagLabel(tag))).join('، ')}</p>
      <div class="wu-community-preview-body">${escapeHtml(frozenText).replace(/\n/g, '<br>')}</div>
    </div>
    <p class="wu-community-error" data-wu-community-form-error hidden></p>
    <div class="wu-community-dialog-actions">
      <button type="button" data-wu-community-back>Edit details</button>
      <button type="button" class="primary" data-wu-community-submit>Submit for review</button>
    </div>`);
  bindClose(node);
  node.querySelector('[data-wu-community-back]').addEventListener('click', () => formDialog(state));
  node.querySelector('[data-wu-community-submit]').addEventListener('click', () => submitSnapshot(state, frozenText, node));
}

function successDialog(submission, reused) {
  const node = openDialog(`
    <div class="wu-community-success-mark" aria-hidden="true">✓</div>
    <div class="wu-community-dialog-head">
      <div>
        <h2>${reused ? 'Already submitted for review' : 'Submitted for review'}</h2>
        <p>${reused ? 'You already have this exact version in review.' : 'A moderator will review this writing before it becomes public. This is not published yet.'}</p>
      </div>
      <button type="button" class="wu-community-dialog-close" aria-label="Close" data-wu-community-close>×</button>
    </div>
    <div class="wu-community-dialog-actions">
      <button type="button" class="primary" data-wu-community-close>Keep writing</button>
    </div>`);
  bindClose(node);
}

async function submitSnapshot(state, frozenText, previewNode) {
  if (currentText() !== frozenText) {
    const errorNode = previewNode.querySelector('[data-wu-community-form-error]');
    if (errorNode) { errorNode.hidden = false; errorNode.textContent = 'Your writing changed — refresh preview and try again.'; }
    return;
  }

  const submitButton = previewNode.querySelector('[data-wu-community-submit]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting…';
  track('community_submission_started');

  try {
    const payload = buildSubmissionPayload({ ...state, plainText: frozenText, editorKind });
    const { submission, reused } = await client.submit(payload);
    track('community_submission_completed', { success: true });
    successDialog(submission, reused);
  } catch (error) {
    track('community_submission_failed', { success: false });
    submitButton.disabled = false;
    submitButton.textContent = 'Submit for review';
    const errorNode = previewNode.querySelector('[data-wu-community-form-error]');
    if (errorNode) { errorNode.hidden = false; errorNode.textContent = submitErrorMessage(error); }
  }
}

function emptyFormState() {
  return {
    title: '',
    publicAuthorName: account.state === ACCOUNT_STATE.SIGNED_IN ? (account.user.name || '') : '',
    primaryCategory: '',
    tags: [],
    rightsConfirmed: false,
    publicConfirmed: false,
    guidelinesConfirmed: false
  };
}

async function beginPublishFlow(entryPoint) {
  if (account.state !== ACCOUNT_STATE.SIGNED_IN) {
    flushLocalWriting(runtime);
    writePublishIntent(sessionStore(), { workspaceKind: editorKind, editorKind, entryPoint });
    track(entryPoint === 'prompt' ? 'community_publish_prompt_clicked' : 'community_publish_manual_clicked');
    location.href = `/sign-in?returnTo=${encodeURIComponent(normalizedPath())}`;
    return;
  }
  track(entryPoint === 'prompt' ? 'community_publish_prompt_clicked' : 'community_publish_manual_clicked');
  formDialog(emptyFormState());
}

function addManualAction(actionsContainer) {
  if (!actionsContainer || actionsContainer.querySelector('[data-community-publish-manual]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wu-community-toolbar-button';
  button.setAttribute('data-community-publish-manual', '');
  button.innerHTML = '<i class="fas fa-feather-alt" aria-hidden="true"></i> Publish to Urdu Writers';
  button.addEventListener('click', () => beginPublishFlow('manual'));
  actionsContainer.appendChild(button);
}

function promptBanner() {
  let banner = document.querySelector('[data-community-publish-prompt]');
  if (banner) return banner;
  banner = document.createElement('aside');
  banner.className = 'wu-community-prompt';
  banner.setAttribute('data-community-publish-prompt', '');
  banner.setAttribute('role', 'status');
  banner.hidden = true;
  banner.innerHTML = `
    <div class="wu-community-prompt-copy">
      <strong>Share your writing with more readers</strong>
      <span>Publish this poem, essay or idea in Urdu Writers and show your creativity to the WriteUrdu community.</span>
    </div>
    <div class="wu-community-prompt-actions">
      <button type="button" class="primary" data-community-prompt-submit>Submit for publishing</button>
      <button type="button" class="is-secondary" data-community-prompt-dismiss>Not now</button>
    </div>`;
  return banner;
}

function attachPromptBanner(anchor) {
  if (!anchor) return null;
  const banner = promptBanner();
  if (!banner.isConnected) anchor.insertAdjacentElement('afterend', banner);
  const submit = banner.querySelector('[data-community-prompt-submit]');
  const dismiss = banner.querySelector('[data-community-prompt-dismiss]');
  submit.onclick = () => { banner.hidden = true; beginPublishFlow('prompt'); };
  dismiss.onclick = () => {
    banner.hidden = true;
    suppressPrompt(sessionStore(), promptSignature(editorKind, currentText()));
  };
  return banner;
}

let promptTrackedSignature = null;

function checkAutomaticPrompt(anchor) {
  const text = currentText();
  const banner = attachPromptBanner(anchor);
  if (!banner) return;
  const eligible = shouldShowPrompt(sessionStore(), editorKind, text);
  banner.hidden = !eligible;
  if (!eligible) return;
  const signature = promptSignature(editorKind, text);
  if (promptTrackedSignature === signature) return;
  promptTrackedSignature = signature;
  track('community_publish_prompt_shown');
}

const PANEL_SELECTOR = Object.freeze({
  basic: '[data-home-account-continuity]',
  rich: '[data-editor-account-documents]',
  keyboard: '[data-editor-account-documents]',
  voice: '[data-voice-account-growth]'
});

const TOOLBAR_SLOT_SELECTOR = Object.freeze({
  basic: '[data-wu-basic-command-surface] [data-wu-community-toolbar-slot]',
  rich: '[data-wu-community-toolbar-slot]',
  keyboard: '[data-wu-community-toolbar-slot]',
  voice: '[data-wu-community-toolbar-slot]'
});

function waitFor(selector) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      const node = document.querySelector(selector);
      if (node || attempts >= 160) { resolve(node || null); return; }
      runtime.setTimeout(check, 50);
    };
    check();
  });
}

async function resumeIntentIfSignedIn() {
  if (account.state !== ACCOUNT_STATE.SIGNED_IN) return;
  const intent = readPublishIntent(sessionStore());
  if (!intent || intent.editorKind !== editorKind) return;
  formDialog(emptyFormState());
}

async function start() {
  editorKind = ROUTE_EDITOR_KIND[normalizedPath()];
  if (!editorKind) return;

  let feature;
  try { feature = await client.probe(); } catch { return; }
  if (!feature.available) return;

  const ready = await waitForReady();
  if (!ready) return;

  try { account = await fetchAccountState(); } catch { account = { state: ACCOUNT_STATE.DISABLED, user: null }; }
  if (account.state === ACCOUNT_STATE.DISABLED) return;

  await resumeIntentIfSignedIn();

  const toolbarSlot = await waitFor(TOOLBAR_SLOT_SELECTOR[editorKind]);
  if (toolbarSlot) addManualAction(toolbarSlot);

  const anchor = await waitFor(PANEL_SELECTOR[editorKind]);
  if (!anchor) return;

  const evaluate = () => checkAutomaticPrompt(anchor);
  evaluate();

  document.addEventListener('write-urdu:outcome', (event) => {
    const name = event.detail && event.detail.name;
    if (name !== 'export_completed' && name !== 'print_started') return;
    evaluate();
  });

  if (editorKind === 'voice') {
    const field = document.getElementById('voiceTranscript');
    if (field) field.addEventListener('input', evaluate);
  } else {
    const adapter = runtime.WriteUrduTools && runtime.WriteUrduTools.adapter;
    if (adapter && typeof adapter.onChange === 'function') adapter.onChange(evaluate);
  }
}

void start();
