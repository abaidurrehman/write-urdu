import { ACCOUNT_STATE, fetchAccountState } from './account-session.mjs';
import {
  COMMUNITY_CONTENT_LIMITS,
  createCommunityClient,
  buildSubmissionPayload,
  validateSubmissionForm,
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
const EDITOR_KIND = 'card';
const PREFILL_KEY = 'write-urdu:community-asset-prefill:v1';

let dialog = null;
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

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'wu-community-dialog';
  dialog.setAttribute('aria-label', 'Submit to Urdu Writers');
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
  return 'Could not submit — your card is still safe.';
}

function readFormState(form, state) {
  const data = new FormData(form);
  return {
    ...state,
    title: String(data.get('title') || '').trim(),
    publicAuthorName: String(data.get('publicAuthorName') || '').trim(),
    primaryCategory: String(data.get('primaryCategory') || ''),
    tags: data.getAll('tags').map(String),
    plainText: String(data.get('plainText') || ''),
    rightsConfirmed: data.get('rightsConfirmed') === 'on',
    publicConfirmed: data.get('publicConfirmed') === 'on',
    guidelinesConfirmed: data.get('guidelinesConfirmed') === 'on'
  };
}

function emptyFormState(prefillText) {
  return {
    title: '',
    publicAuthorName: account.state === ACCOUNT_STATE.SIGNED_IN ? (account.user.name || '') : '',
    primaryCategory: '',
    tags: [],
    plainText: String(prefillText || ''),
    rightsConfirmed: false,
    publicConfirmed: false,
    guidelinesConfirmed: false
  };
}

function formDialog(state) {
  const node = openDialog(`
    <form class="wu-community-form" data-wu-community-form>
      <div class="wu-community-dialog-head">
        <div>
          <h2>Submit to Urdu Writers</h2>
          <p>Add a short piece of writing to go with this image. It will be reviewed before anyone else can see it.</p>
        </div>
        <button type="button" class="wu-community-dialog-close" aria-label="Close" data-wu-community-close>×</button>
      </div>
      <label class="wu-community-field">
        <span>Title</span>
        <input type="text" name="title" value="${escapeHtml(state.title)}" maxlength="${COMMUNITY_CONTENT_LIMITS.maxTitleChars}" required>
      </label>
      <label class="wu-community-field">
        <span>Name shown with your writing</span>
        <input type="text" name="publicAuthorName" value="${escapeHtml(state.publicAuthorName)}" maxlength="${COMMUNITY_CONTENT_LIMITS.maxPublicAuthorChars}" required>
        <small>Use your name or a pen name. Readers never see your account email.</small>
      </label>
      <label class="wu-community-field">
        <span>Caption / writing</span>
        <textarea name="plainText" rows="5" required>${escapeHtml(state.plainText)}</textarea>
        <small>Add a short piece of writing or context (at least ${COMMUNITY_CONTENT_LIMITS.minPlainTextChars} characters) to go with this image.</small>
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
  const form = node.querySelector('[data-wu-community-form]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = readFormState(form, state);
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

function previewDialog(state) {
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
      <div class="wu-community-preview-body">${escapeHtml(state.plainText).replace(/\n/g, '<br>')}</div>
    </div>
    <p class="wu-community-error" data-wu-community-form-error hidden></p>
    <div class="wu-community-dialog-actions">
      <button type="button" data-wu-community-back>Edit details</button>
      <button type="button" class="primary" data-wu-community-submit>Submit for review</button>
    </div>`);
  bindClose(node);
  node.querySelector('[data-wu-community-back]').addEventListener('click', () => formDialog(state));
  node.querySelector('[data-wu-community-submit]').addEventListener('click', () => submitSnapshot(state, node));
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
      <button type="button" class="primary" data-wu-community-close>Keep creating</button>
    </div>`);
  bindClose(node);
}

async function submitSnapshot(state, previewNode) {
  const submitButton = previewNode.querySelector('[data-wu-community-submit]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting…';
  track('community_submission_started', { tool: 'card_studio' });

  try {
    const payload = buildSubmissionPayload({ ...state, editorKind: EDITOR_KIND });
    const { submission, reused } = await client.submit(payload);
    track('community_submission_completed', { success: true, tool: 'card_studio' });
    successDialog(submission, reused);
  } catch (error) {
    track('community_submission_failed', { success: false, tool: 'card_studio' });
    submitButton.disabled = false;
    submitButton.textContent = 'Submit for review';
    const errorNode = previewNode.querySelector('[data-wu-community-form-error]');
    if (errorNode) { errorNode.hidden = false; errorNode.textContent = submitErrorMessage(error); }
  }
}

async function beginPublishFlow(prefillText) {
  if (account.state !== ACCOUNT_STATE.SIGNED_IN) {
    writePublishIntent(sessionStore(), { workspaceKind: EDITOR_KIND, editorKind: EDITOR_KIND, entryPoint: 'manual' });
    const store = sessionStore();
    if (store) { try { store.setItem(PREFILL_KEY, String(prefillText || '').slice(0, 4000)); } catch {} }
    track('community_publish_manual_clicked', { tool: 'card_studio' });
    location.href = `/sign-in?returnTo=${encodeURIComponent(normalizedPath())}`;
    return;
  }
  track('community_publish_manual_clicked', { tool: 'card_studio' });
  formDialog(emptyFormState(prefillText));
}

async function resumeIntentIfSignedIn() {
  if (account.state !== ACCOUNT_STATE.SIGNED_IN) return;
  const intent = readPublishIntent(sessionStore());
  if (!intent || intent.editorKind !== EDITOR_KIND) return;
  const store = sessionStore();
  let prefill = '';
  if (store) { try { prefill = store.getItem(PREFILL_KEY) || ''; store.removeItem(PREFILL_KEY); } catch {} }
  formDialog(emptyFormState(prefill));
}

async function init() {
  try { account = await fetchAccountState(); } catch { account = { state: ACCOUNT_STATE.DISABLED, user: null }; }
  if (account.state !== ACCOUNT_STATE.DISABLED) await resumeIntentIfSignedIn();
}

void init();

runtime.WriteUrduCommunityAssetPublish = Object.freeze({
  open(prefillText) { beginPublishFlow(prefillText || ''); }
});
