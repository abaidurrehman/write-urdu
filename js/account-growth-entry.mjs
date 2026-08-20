import { ACCOUNT_STATE, fetchAccountState } from './account-session.mjs';
import { createDocumentsClient } from './account-documents.mjs';
import { publishDocumentShare, shareLink } from './document-share.mjs';

const runtime = window;
const path = normalizedPath();
const documentsClient = createDocumentsClient();
const VOICE_DRAFT_KEY = 'writeUrdu.accountGrowth.voiceDraft.v1';
const VOICE_DRAFT_MAX_AGE_MS = 30 * 60 * 1000;
const WAIT_ATTEMPTS = 160;
const WAIT_DELAY_MS = 50;

function normalizedPath() {
  let value = String(location.pathname || '/').split('?')[0].split('#')[0] || '/';
  if (value === '/index' || value === '/index.html') return '/';
  if (/\.html$/i.test(value)) value = value.slice(0, -5);
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return value || '/';
}

function notify(message, type) {
  if (runtime.WriteUrduUI && typeof runtime.WriteUrduUI.notify === 'function') {
    runtime.WriteUrduUI.notify(message, type);
  }
}

function track(eventName, detail = {}) {
  if (runtime.WriteUrduTelemetry && typeof runtime.WriteUrduTelemetry.track === 'function') {
    runtime.WriteUrduTelemetry.track(eventName, detail);
  }
}

function trackAccountEntry() {
  track('tool_handoff', { target_route: '/sign-in' });
}

function waitFor(selector) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      const node = document.querySelector(selector);
      if (node || attempts >= WAIT_ATTEMPTS) {
        resolve(node || null);
        return;
      }
      runtime.setTimeout(check, WAIT_DELAY_MS);
    };
    check();
  });
}

function rewriteSignedOutStatus(node) {
  if (!node) return;
  const rewrite = () => {
    const value = String(node.textContent || '').trim();
    if (value === 'Sign in to save across devices') node.textContent = 'Create an account to save this writing';
  };
  rewrite();
  if (!runtime.MutationObserver) return;
  const observer = new MutationObserver(rewrite);
  observer.observe(node, { childList: true, characterData: true, subtree: true });
  runtime.setTimeout(() => observer.disconnect(), 8000);
}

function ensureBasicPublish() {
  if (runtime.WriteUrduBasicPublish && typeof runtime.WriteUrduBasicPublish.open === 'function') {
    return Promise.resolve(runtime.WriteUrduBasicPublish);
  }
  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[src$="/js/basic-writer-publish.js"]');
    const done = () => {
      if (runtime.WriteUrduBasicPublish && typeof runtime.WriteUrduBasicPublish.open === 'function') resolve(runtime.WriteUrduBasicPublish);
      else reject(new Error('share_unavailable'));
    };
    if (script) {
      script.addEventListener('load', done, { once: true });
      runtime.setTimeout(done, 1200);
      return;
    }
    script = document.createElement('script');
    script.src = '/js/basic-writer-publish.js';
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', () => reject(new Error('share_unavailable')), { once: true });
    document.head.appendChild(script);
  });
}

function addHomeShareAction(panel) {
  const actions = panel.querySelector('.home-account-continuity-actions');
  if (!actions || actions.querySelector('[data-account-growth-share]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-account-continuity-button is-secondary';
  button.setAttribute('data-account-growth-share', 'basic');
  button.textContent = 'Share link';
  button.addEventListener('click', async () => {
    track('share_clicked');
    try {
      const publisher = await ensureBasicPublish();
      await publisher.open();
    } catch {
      notify('Sharing is temporarily unavailable. Please try again.', 'error');
    }
  });
  actions.appendChild(button);
}

async function enhanceHome() {
  const panel = await waitFor('[data-home-account-continuity]');
  if (!panel) return;
  panel.setAttribute('data-account-growth-entry', 'basic');
  const eyebrow = panel.querySelector('.home-account-continuity-eyebrow');
  const description = panel.querySelector('.home-account-continuity-copy > p:not(.home-account-continuity-eyebrow):not(.home-account-continuity-status)');
  const benefits = panel.querySelector('.home-account-benefits');
  const signIn = panel.querySelector('[data-account-continuity-signin]');
  if (eyebrow) eyebrow.textContent = 'Free account';
  if (description) description.textContent = 'Create a free account to save this Urdu writing in My Documents. Share a public snapshot with a link whenever you want.';
  if (benefits) benefits.innerHTML = '<span>Save in My Documents</span><span>Share with a link</span>';
  if (signIn) {
    signIn.textContent = 'Create free account';
    signIn.addEventListener('click', trackAccountEntry);
  }
  addHomeShareAction(panel);
  rewriteSignedOutStatus(panel.querySelector('[data-account-continuity-status]'));
}

function editorSnapshot(adapter) {
  return {
    content: String(adapter?.getContent?.() || ''),
    text: String(adapter?.getText?.() || '')
  };
}

async function shareEditorWriting(adapter, button) {
  const current = editorSnapshot(adapter);
  if (!current.text.trim()) {
    notify('Add some writing before sharing.', 'error');
    return;
  }
  if (!runtime.confirm('Create a public Write Urdu link? Anyone with the link can view this snapshot.')) return;
  button.disabled = true;
  const oldLabel = button.textContent;
  button.textContent = 'Creating link…';
  track('share_publish_started');
  try {
    const result = await publishDocumentShare({
      plainText: current.text,
      content: current.content,
      editorKind: adapter.kind,
      title: adapter.kind === 'rich' ? 'Urdu formatted writing' : 'Urdu writing'
    });
    track('share_publish_completed', { success: true });
    const outcome = await shareLink(result.url);
    if (outcome !== 'cancelled') track('share_completed', { success: true });
    notify(outcome === 'shared' ? 'Write Urdu link shared.' : outcome === 'copied' ? 'Write Urdu link copied.' : 'Public link created.', 'success');
  } catch {
    track('share_publish_failed', { success: false });
    notify('Could not create a share link right now. Your writing is unchanged.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = oldLabel;
  }
}

async function enhanceEditor() {
  const panel = await waitFor('[data-editor-account-documents]');
  if (!panel) return;
  const adapter = runtime.WriteUrduTools?.adapter;
  if (!adapter || (adapter.kind !== 'rich' && adapter.kind !== 'keyboard')) return;
  panel.setAttribute('data-account-growth-entry', adapter.kind);
  const title = panel.querySelector('.editor-account-documents-copy strong');
  const description = panel.querySelector('.editor-account-documents-copy span');
  const signIn = panel.querySelector('[data-editor-account-signin]');
  const actions = panel.querySelector('.editor-account-documents-actions');
  if (title) title.textContent = adapter.kind === 'rich' ? 'Keep this formatted writing' : 'Keep this writing';
  if (description) description.textContent = 'Create a free account to save it in My Documents, or share a public snapshot with a link.';
  if (signIn) {
    signIn.textContent = 'Create free account';
    signIn.addEventListener('click', trackAccountEntry);
  }
  if (actions && !actions.querySelector('[data-account-growth-share]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'is-secondary';
    button.setAttribute('data-account-growth-share', adapter.kind);
    button.textContent = 'Share link';
    button.addEventListener('click', () => shareEditorWriting(adapter, button));
    actions.appendChild(button);
  }
  rewriteSignedOutStatus(panel.querySelector('[data-editor-account-status]'));
}

function voiceText() {
  const field = document.getElementById('voiceTranscript');
  return field ? String(field.value || '').replace(/\r\n?/g, '\n').trim() : '';
}

function preserveVoiceDraft() {
  const text = voiceText();
  if (!text) return;
  try {
    runtime.sessionStorage.setItem(VOICE_DRAFT_KEY, JSON.stringify({ text, savedAt: Date.now() }));
  } catch {}
}

function restoreVoiceDraft(field) {
  if (!field || String(field.value || '').trim()) return false;
  try {
    const raw = runtime.sessionStorage.getItem(VOICE_DRAFT_KEY);
    const value = raw ? JSON.parse(raw) : null;
    runtime.sessionStorage.removeItem(VOICE_DRAFT_KEY);
    if (!value || typeof value.text !== 'string' || Date.now() - Number(value.savedAt || 0) > VOICE_DRAFT_MAX_AGE_MS) return false;
    field.value = value.text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  } catch {
    return false;
  }
}

function voicePanel() {
  const column = document.querySelector('.urdu-voice-transcript');
  const actions = column?.querySelector('.urdu-tool-actions');
  if (!column || !actions) return null;
  let panel = column.querySelector('[data-voice-account-growth]');
  if (panel) return panel;
  panel = document.createElement('section');
  panel.className = 'editor-account-documents voice-account-growth';
  panel.setAttribute('data-voice-account-growth', '');
  panel.setAttribute('data-account-growth-entry', 'voice');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="editor-account-documents-copy">
      <strong>Keep this transcript</strong>
      <span data-voice-account-copy>Create a free account to save a copy in My Documents, or share it with a link.</span>
    </div>
    <div class="editor-account-documents-actions">
      <a href="/sign-in?returnTo=%2Ftools%2Furdu-voice-typing" data-voice-account-signin>Create free account</a>
      <button type="button" data-voice-account-save hidden>Save to My Documents</button>
      <a href="/my-documents" class="is-secondary" data-voice-account-library hidden>My Documents</a>
      <button type="button" class="is-secondary" data-voice-account-share>Share link</button>
    </div>
    <p class="editor-account-documents-status" data-voice-account-status aria-live="polite"></p>`;
  actions.insertAdjacentElement('afterend', panel);
  return panel;
}

async function shareVoiceTranscript(button) {
  const text = voiceText();
  if (!text) return;
  if (!runtime.confirm('Create a public Write Urdu link? Anyone with the link can view this transcript snapshot.')) return;
  button.disabled = true;
  const oldLabel = button.textContent;
  button.textContent = 'Creating link…';
  track('share_publish_started');
  try {
    const result = await publishDocumentShare({
      plainText: text,
      content: text,
      editorKind: 'basic',
      title: 'Urdu voice transcript'
    });
    track('share_publish_completed', { success: true });
    const outcome = await shareLink(result.url);
    if (outcome !== 'cancelled') track('share_completed', { success: true });
    notify(outcome === 'shared' ? 'Transcript link shared.' : outcome === 'copied' ? 'Transcript link copied.' : 'Public transcript link created.', 'success');
  } catch {
    track('share_publish_failed', { success: false });
    notify('Could not create a share link right now. Your transcript is unchanged.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = oldLabel;
  }
}

async function enhanceVoice() {
  const field = document.getElementById('voiceTranscript');
  const panel = voicePanel();
  if (!field || !panel) return;
  restoreVoiceDraft(field);

  const copy = panel.querySelector('[data-voice-account-copy]');
  const status = panel.querySelector('[data-voice-account-status]');
  const signIn = panel.querySelector('[data-voice-account-signin]');
  const save = panel.querySelector('[data-voice-account-save]');
  const library = panel.querySelector('[data-voice-account-library]');
  const share = panel.querySelector('[data-voice-account-share]');
  let lastSavedText = '';

  const syncVisibility = () => {
    const hasText = Boolean(voiceText());
    panel.hidden = !hasText;
    if (hasText && save && lastSavedText !== voiceText()) {
      save.disabled = false;
      if (save.textContent === 'Saved') save.textContent = 'Save to My Documents';
    }
  };
  field.addEventListener('input', syncVisibility);
  syncVisibility();

  if (signIn) {
    signIn.addEventListener('click', () => {
      preserveVoiceDraft();
      trackAccountEntry();
    });
  }
  if (share) share.addEventListener('click', () => shareVoiceTranscript(share));

  let account = { state: ACCOUNT_STATE.DISABLED, user: null };
  let feature = { available: false, authenticated: false };
  try { account = await fetchAccountState(); } catch {}
  try { feature = await documentsClient.probe(); } catch {}

  if (account.state === ACCOUNT_STATE.SIGNED_IN && feature.available) {
    if (signIn) signIn.hidden = true;
    if (save) save.hidden = false;
    if (library) library.hidden = false;
    if (copy) copy.textContent = 'Save a copy in My Documents, or share a public snapshot with a link.';
    if (status) status.textContent = 'Not saved to My Documents yet';
    save?.addEventListener('click', async () => {
      const text = voiceText();
      if (!text || text === lastSavedText) return;
      save.disabled = true;
      save.textContent = 'Saving…';
      if (status) status.textContent = 'Saving to My Documents…';
      try {
        await documentsClient.create({ content: text, text }, { editorKind: 'basic' });
        lastSavedText = text;
        save.textContent = 'Saved';
        if (status) {
          status.textContent = 'Saved to My Documents';
          status.dataset.state = 'saved';
        }
        notify('Transcript saved to My Documents.', 'success');
      } catch {
        save.disabled = false;
        save.textContent = 'Save to My Documents';
        if (status) status.textContent = 'Could not save right now — your transcript is unchanged';
        notify('Could not save to My Documents right now.', 'error');
      }
    });
  } else if (account.state === ACCOUNT_STATE.SIGNED_OUT && feature.available) {
    if (signIn) signIn.hidden = false;
    if (copy) copy.textContent = 'Create a free account to save a copy in My Documents, or share it with a link.';
    if (status) status.textContent = 'Create an account to save this transcript';
  } else {
    if (signIn) signIn.hidden = true;
    if (copy) copy.textContent = 'Share this transcript with a public Write Urdu link.';
    if (status) status.textContent = '';
  }
}

async function start() {
  if (path === '/') await enhanceHome();
  else if (path === '/urdu-editor' || path === '/urdu-keyboard') await enhanceEditor();
  else if (path === '/tools/urdu-voice-typing') await enhanceVoice();
}

void start();
