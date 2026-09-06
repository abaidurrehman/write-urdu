import { ACCOUNT_STATE, fetchAccountState, flushLocalWriting } from './account-session.mjs';
import { createDocumentsClient } from './account-documents.mjs';
import { publishDocumentShare, shareLink } from './document-share.mjs';
import { GROWTH_REQUEST, createGrowthRequestArbiter, writerStateFromLength } from './growth-request-arbiter.mjs';

const runtime = window;
const path = normalizedPath();
const documentsClient = createDocumentsClient();
const VOICE_DRAFT_KEY = 'writeUrdu.accountGrowth.voiceDraft.v1';
const VOICE_DRAFT_MAX_AGE_MS = 30 * 60 * 1000;
const WAIT_ATTEMPTS = 160;
const WAIT_DELAY_MS = 50;
const WORKSPACE = Object.freeze({ '/': 'basic-writer', '/urdu-editor': 'rich-editor', '/urdu-keyboard': 'urdu-keyboard', '/tools/urdu-voice-typing': 'voice-typing' });

let account = { state: ACCOUNT_STATE.DISABLED, user: null };
let feature = { available: false, authenticated: false };
let meaningfulOutcome = false;
let localProtected = false;
let lastSavedState = false;
let voiceSuccessEligible = false;

function normalizedPath() {
  if (window.WriteUrduLocaleRoute && typeof window.WriteUrduLocaleRoute.productPath === 'function') return window.WriteUrduLocaleRoute.productPath(location.pathname || '/');
  let value = String(location.pathname || '/').split('?')[0].split('#')[0] || '/';
  if (value === '/index' || value === '/index.html') return '/';
  if (/\.html$/i.test(value)) value = value.slice(0, -5);
  if (value.length > 1) value = value.replace(/\/+$/, '');
  return value || '/';
}

function notify(message, type) {
  if (runtime.WriteUrduUI && typeof runtime.WriteUrduUI.notify === 'function') runtime.WriteUrduUI.notify(message, type);
}

function track(eventName, detail = {}) {
  if (runtime.WriteUrduTelemetry && typeof runtime.WriteUrduTelemetry.track === 'function') runtime.WriteUrduTelemetry.track(eventName, detail);
}

const growthArbiter = WORKSPACE[path] ? createGrowthRequestArbiter({ workspace: WORKSPACE[path], telemetry: track }) : null;
if (growthArbiter) runtime.WriteUrduGrowthRequestArbiter = growthArbiter;

function waitFor(selector) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      const node = document.querySelector(selector);
      if (node || attempts >= WAIT_ATTEMPTS) { resolve(node || null); return; }
      runtime.setTimeout(check, WAIT_DELAY_MS);
    };
    check();
  });
}

function currentLength() {
  if (path === '/') return String(document.getElementById('transliterateTextarea')?.value || '').trim().length;
  if (path === '/tools/urdu-voice-typing') return voiceText().length;
  const adapter = runtime.WriteUrduTools?.adapter;
  return adapter ? String(adapter.getText?.() || '').trim().length : 0;
}

function syncWriterState() {
  if (!growthArbiter) return;
  growthArbiter.update({ writerState: writerStateFromLength(currentLength(), meaningfulOutcome), meaningfulOutcome, localProtected, keepMomentEligible: path === '/tools/urdu-voice-typing' && voiceSuccessEligible });
}

function onWritingChanged() {
  if (meaningfulOutcome) { meaningfulOutcome = false; localProtected = false; }
  if (path === '/tools/urdu-voice-typing' && currentLength() === 0) {
    voiceSuccessEligible = false;
    growthArbiter?.update({ keepEnabled: false, keepMomentEligible: false });
  }
  syncWriterState();
}

function protectLocalWriting() {
  if (path === '/tools/urdu-voice-typing') { preserveVoiceDraft(); return Boolean(voiceText()); }
  return flushLocalWriting(runtime);
}

function statusSelector() {
  if (path === '/') return '[data-account-continuity-status]';
  if (path === '/urdu-editor' || path === '/urdu-keyboard') return '[data-editor-account-status]';
  return '[data-voice-account-status]';
}

function syncSavedStatus(node) {
  if (!growthArbiter || !node) return;
  const saved = node.dataset.state === 'saved';
  if (saved && !lastSavedState) growthArbiter.completed(GROWTH_REQUEST.KEEP);
  lastSavedState = saved;
  growthArbiter.update({ safelySaved: saved });
}

function bindSavedStatus() {
  const node = document.querySelector(statusSelector());
  if (!node) return;
  syncSavedStatus(node);
  if (!runtime.MutationObserver) return;
  const observer = new MutationObserver(() => syncSavedStatus(node));
  observer.observe(node, { attributes: true, attributeFilter: ['data-state'], childList: true, characterData: true, subtree: true });
}

function bindGrowthSignals() {
  if (!growthArbiter) return;
  if (path === '/') document.getElementById('transliterateTextarea')?.addEventListener('input', onWritingChanged);
  else if (path === '/tools/urdu-voice-typing') document.getElementById('voiceTranscript')?.addEventListener('input', onWritingChanged);
  else {
    const adapter = runtime.WriteUrduTools?.adapter;
    if (adapter && typeof adapter.onChange === 'function') adapter.onChange(onWritingChanged);
  }
  document.addEventListener('write-urdu:voice-success-idle', (event) => {
    if (path !== '/tools/urdu-voice-typing' || event.detail?.workspace !== 'voice-typing' || currentLength() === 0) return;
    if (account.state !== ACCOUNT_STATE.SIGNED_OUT || !feature.available) return;
    voiceSuccessEligible = true;
    growthArbiter.update({ keepEnabled: true, keepMomentEligible: true });
    syncWriterState();
  });
  document.addEventListener('write-urdu:outcome', (event) => {
    const name = event.detail && event.detail.name;
    if (!['copy_completed', 'export_completed', 'print_started'].includes(name) || currentLength() === 0) return;
    meaningfulOutcome = true;
    localProtected = protectLocalWriting();
    syncWriterState();
  });
  document.addEventListener('write-urdu:growth-family-completed', (event) => {
    const family = event.detail && event.detail.family;
    if (family === GROWTH_REQUEST.SHARE) growthArbiter.completed(GROWTH_REQUEST.SHARE);
  });
  syncWriterState();
  bindSavedStatus();
}

function ensureBasicPublish() {
  if (runtime.WriteUrduBasicPublish && typeof runtime.WriteUrduBasicPublish.open === 'function') return Promise.resolve(runtime.WriteUrduBasicPublish);
  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[src$="/js/basic-writer-publish.js"]');
    const done = () => runtime.WriteUrduBasicPublish?.open ? resolve(runtime.WriteUrduBasicPublish) : reject(new Error('share_unavailable'));
    if (script) { script.addEventListener('load', done, { once: true }); runtime.setTimeout(done, 1200); return; }
    script = document.createElement('script');
    script.src = '/js/basic-writer-publish.js';
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', () => reject(new Error('share_unavailable')), { once: true });
    document.head.appendChild(script);
  });
}

function addHomeShareAction(panel) {
  const actions = panel.querySelector('.home-account-continuity-actions');
  if (!actions) return null;
  let button = actions.querySelector('[data-account-growth-share]');
  if (button) return button;
  button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-account-continuity-button is-secondary';
  button.setAttribute('data-account-growth-share', 'basic');
  button.textContent = 'Share link';
  button.hidden = true;
  button.addEventListener('click', async () => {
    growthArbiter?.opened(GROWTH_REQUEST.SHARE);
    track('share_clicked');
    try { const publisher = await ensureBasicPublish(); await publisher.open(); }
    catch { notify('Sharing is temporarily unavailable. Please try again.', 'error'); }
  });
  actions.appendChild(button);
  return button;
}

function renderHome(panel, share) {
  if (!growthArbiter || !panel) return;
  const winner = growthArbiter.current();
  const signedIn = growthArbiter.snapshot().signedIn;
  const eyebrow = panel.querySelector('.home-account-continuity-eyebrow');
  const description = panel.querySelector('.home-account-continuity-copy > p:not(.home-account-continuity-eyebrow):not(.home-account-continuity-status)');
  const benefits = panel.querySelector('.home-account-benefits');
  const signIn = panel.querySelector('[data-account-continuity-signin]');
  const save = panel.querySelector('[data-account-continuity-save]');
  const library = panel.querySelector('[data-account-continuity-documents]');
  const status = panel.querySelector('[data-account-continuity-status]');
  panel.dataset.growthWinner = winner;
  panel.hidden = winner !== GROWTH_REQUEST.KEEP && winner !== GROWTH_REQUEST.SHARE;
  if (panel.hidden) return;
  if (winner === GROWTH_REQUEST.KEEP) {
    if (eyebrow) eyebrow.textContent = 'Keep this writing';
    if (description) description.textContent = signedIn ? 'Save this writing in My Documents so you can continue later.' : 'Create a free account to keep this writing in My Documents.';
    if (benefits) benefits.innerHTML = '<span>Keep your writing safe</span><span>Continue later</span>';
    if (signIn) { signIn.hidden = signedIn; signIn.textContent = 'Create free account'; }
    if (save) save.hidden = !signedIn;
    if (library) library.hidden = !signedIn;
    if (share) share.hidden = true;
    if (status) status.hidden = false;
  } else {
    if (eyebrow) eyebrow.textContent = 'Share this writing';
    if (description) description.textContent = 'Create a public snapshot link to send this writing to someone.';
    if (benefits) benefits.innerHTML = '<span>Public snapshot</span><span>Easy link sharing</span>';
    if (signIn) signIn.hidden = true;
    if (save) save.hidden = true;
    if (library) library.hidden = true;
    if (share) share.hidden = false;
    if (status) status.hidden = true;
  }
  growthArbiter.shown(winner);
}

async function enhanceHome() {
  const panel = await waitFor('[data-home-account-continuity]');
  if (!panel) return;
  panel.setAttribute('data-account-growth-entry', 'basic');
  const share = addHomeShareAction(panel);
  const signIn = panel.querySelector('[data-account-continuity-signin]');
  const save = panel.querySelector('[data-account-continuity-save]');
  signIn?.addEventListener('click', () => { growthArbiter?.opened(GROWTH_REQUEST.KEEP); track('tool_handoff', { target_route: '/sign-in' }); });
  save?.addEventListener('click', () => growthArbiter?.opened(GROWTH_REQUEST.KEEP));
  const render = () => renderHome(panel, share);
  growthArbiter?.subscribe(render);
  render();
}

function editorSnapshot(adapter) {
  return { content: String(adapter?.getContent?.() || ''), text: String(adapter?.getText?.() || '') };
}

async function shareEditorWriting(adapter, button) {
  const current = editorSnapshot(adapter);
  if (!current.text.trim()) { notify('Add some writing before sharing.', 'error'); return; }
  if (!runtime.confirm('Create a public Write Urdu link? Anyone with the link can view this snapshot.')) return;
  growthArbiter?.opened(GROWTH_REQUEST.SHARE);
  button.disabled = true;
  const oldLabel = button.textContent;
  button.textContent = 'Creating link…';
  track('share_publish_started');
  try {
    const result = await publishDocumentShare({ plainText: current.text, content: current.content, editorKind: adapter.kind, title: adapter.kind === 'rich' ? 'Urdu formatted writing' : 'Urdu writing' });
    track('share_publish_completed', { success: true });
    growthArbiter?.completed(GROWTH_REQUEST.SHARE);
    const outcome = await shareLink(result.url);
    if (outcome !== 'cancelled') track('share_completed', { success: true });
    notify(outcome === 'shared' ? 'Write Urdu link shared.' : outcome === 'copied' ? 'Write Urdu link copied.' : 'Public link created.', 'success');
  } catch {
    track('share_publish_failed', { success: false });
    notify('Could not create a share link right now. Your writing is unchanged.', 'error');
  } finally { button.disabled = false; button.textContent = oldLabel; }
}

function renderEditor(panel, adapter, share) {
  if (!growthArbiter || !panel) return;
  const winner = growthArbiter.current();
  const signedIn = growthArbiter.snapshot().signedIn;
  const title = panel.querySelector('.editor-account-documents-copy strong');
  const description = panel.querySelector('.editor-account-documents-copy span');
  const signIn = panel.querySelector('[data-editor-account-signin]');
  const save = panel.querySelector('[data-editor-account-save]');
  const library = panel.querySelector('[data-editor-account-library]');
  const status = panel.querySelector('[data-editor-account-status]');
  panel.dataset.growthWinner = winner;
  panel.hidden = winner !== GROWTH_REQUEST.KEEP && winner !== GROWTH_REQUEST.SHARE;
  if (panel.hidden) return;
  if (winner === GROWTH_REQUEST.KEEP) {
    if (title) title.textContent = adapter.kind === 'rich' ? 'Keep this formatted writing' : 'Keep this writing';
    if (description) description.textContent = signedIn ? 'Save this writing in My Documents so you can continue later.' : 'Create a free account to keep this writing in My Documents.';
    if (signIn) { signIn.hidden = signedIn; signIn.textContent = 'Create free account'; }
    if (save) save.hidden = !signedIn;
    if (library) library.hidden = !signedIn;
    if (share) share.hidden = true;
    if (status) status.hidden = false;
  } else {
    if (title) title.textContent = 'Share this writing';
    if (description) description.textContent = 'Create a public snapshot link to send this writing to someone.';
    if (signIn) signIn.hidden = true;
    if (save) save.hidden = true;
    if (library) library.hidden = true;
    if (share) share.hidden = false;
    if (status) status.hidden = true;
  }
  growthArbiter.shown(winner);
}

async function enhanceEditor() {
  const panel = await waitFor('[data-editor-account-documents]');
  if (!panel) return;
  const adapter = runtime.WriteUrduTools?.adapter;
  if (!adapter || (adapter.kind !== 'rich' && adapter.kind !== 'keyboard')) return;
  panel.setAttribute('data-account-growth-entry', adapter.kind);
  const actions = panel.querySelector('.editor-account-documents-actions');
  let share = actions?.querySelector('[data-account-growth-share]') || null;
  if (actions && !share) {
    share = document.createElement('button');
    share.type = 'button';
    share.className = 'is-secondary';
    share.setAttribute('data-account-growth-share', adapter.kind);
    share.textContent = 'Share link';
    share.hidden = true;
    share.addEventListener('click', () => shareEditorWriting(adapter, share));
    actions.appendChild(share);
  }
  panel.querySelector('[data-editor-account-signin]')?.addEventListener('click', () => { growthArbiter?.opened(GROWTH_REQUEST.KEEP); track('tool_handoff', { target_route: '/sign-in' }); });
  panel.querySelector('[data-editor-account-save]')?.addEventListener('click', () => growthArbiter?.opened(GROWTH_REQUEST.KEEP));
  const render = () => renderEditor(panel, adapter, share);
  growthArbiter?.subscribe(render);
  render();
}

function voiceText() {
  const field = document.getElementById('voiceTranscript');
  return field ? String(field.value || '').replace(/\r\n?/g, '\n').trim() : '';
}

function preserveVoiceDraft() {
  const text = voiceText();
  if (!text) return;
  try { runtime.sessionStorage.setItem(VOICE_DRAFT_KEY, JSON.stringify({ text, savedAt: Date.now() })); } catch {}
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
  } catch { return false; }
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
    <div class="editor-account-documents-copy"><strong data-voice-account-title>Keep this writing</strong><span data-voice-account-copy>Keep or share this writing when it is ready.</span></div>
    <div class="editor-account-documents-actions">
      <a href="/sign-in?returnTo=%2Ftools%2Furdu-voice-typing" data-voice-account-signin hidden>Create free account</a>
      <button type="button" data-voice-account-save hidden>Save to My Documents</button>
      <a href="/my-documents" class="is-secondary" data-voice-account-library hidden>My Documents</a>
      <button type="button" class="is-secondary" data-voice-account-share hidden>Share link</button>
    </div>
    <p class="editor-account-documents-status" data-voice-account-status aria-live="polite"></p>`;
  actions.insertAdjacentElement('afterend', panel);
  return panel;
}

async function shareVoiceTranscript(button) {
  const text = voiceText();
  if (!text) return;
  if (!runtime.confirm('Create a public Write Urdu link? Anyone with the link can view this transcript snapshot.')) return;
  growthArbiter?.opened(GROWTH_REQUEST.SHARE);
  button.disabled = true;
  const oldLabel = button.textContent;
  button.textContent = 'Creating link…';
  track('share_publish_started');
  try {
    const result = await publishDocumentShare({ plainText: text, content: text, editorKind: 'basic', title: 'Urdu voice transcript' });
    track('share_publish_completed', { success: true });
    growthArbiter?.completed(GROWTH_REQUEST.SHARE);
    const outcome = await shareLink(result.url);
    if (outcome !== 'cancelled') track('share_completed', { success: true });
    notify(outcome === 'shared' ? 'Transcript link shared.' : outcome === 'copied' ? 'Transcript link copied.' : 'Public transcript link created.', 'success');
  } catch { track('share_publish_failed', { success: false }); notify('Could not create a share link right now. Your transcript is unchanged.', 'error'); }
  finally { button.disabled = false; button.textContent = oldLabel; }
}

function renderVoice(panel) {
  if (!growthArbiter || !panel) return;
  const winner = growthArbiter.current();
  const signedIn = growthArbiter.snapshot().signedIn;
  const hasText = Boolean(voiceText());
  const title = panel.querySelector('[data-voice-account-title]');
  const copy = panel.querySelector('[data-voice-account-copy]');
  const signIn = panel.querySelector('[data-voice-account-signin]');
  const save = panel.querySelector('[data-voice-account-save]');
  const library = panel.querySelector('[data-voice-account-library]');
  const share = panel.querySelector('[data-voice-account-share]');
  const status = panel.querySelector('[data-voice-account-status]');
  const keepWins = winner === GROWTH_REQUEST.KEEP;
  const shareWins = winner === GROWTH_REQUEST.SHARE;
  const showSignedInSaveUtility = signedIn && feature.available && hasText && !keepWins && !shareWins;
  panel.dataset.growthWinner = keepWins || shareWins ? winner : GROWTH_REQUEST.NONE;
  panel.hidden = !(keepWins || shareWins || showSignedInSaveUtility);
  if (panel.hidden) return;

  if (shareWins) {
    if (title) title.textContent = 'Share this writing';
    if (copy) copy.textContent = 'Create a public snapshot link to share this transcript.';
    if (signIn) signIn.hidden = true;
    if (save) save.hidden = true;
    if (library) library.hidden = true;
    if (share) share.hidden = false;
    if (status) status.hidden = true;
    growthArbiter.shown(GROWTH_REQUEST.SHARE);
    return;
  }

  if (keepWins) {
    if (title) title.textContent = 'Keep this writing';
    if (copy) copy.textContent = signedIn ? 'Save this writing in My Documents so you can continue later.' : 'Create a free account to keep this writing in My Documents.';
    if (signIn) { signIn.hidden = signedIn; signIn.textContent = 'Create free account'; }
    if (save) save.hidden = !signedIn;
    if (library) library.hidden = !signedIn;
    if (share) share.hidden = true;
    if (status) status.hidden = false;
    growthArbiter.shown(GROWTH_REQUEST.KEEP);
    return;
  }

  if (title) title.textContent = 'Keep this writing';
  if (copy) copy.textContent = 'Save a copy in My Documents so you can continue later.';
  if (signIn) signIn.hidden = true;
  if (save) save.hidden = false;
  if (library) library.hidden = false;
  if (share) share.hidden = true;
  if (status) status.hidden = false;
}

async function enhanceVoice() {
  const field = document.getElementById('voiceTranscript');
  const panel = voicePanel();
  if (!field || !panel) return;
  const restoredFromAccountFlow = restoreVoiceDraft(field);

  const status = panel.querySelector('[data-voice-account-status]');
  const signIn = panel.querySelector('[data-voice-account-signin]');
  const save = panel.querySelector('[data-voice-account-save]');
  const share = panel.querySelector('[data-voice-account-share]');
  let lastSavedText = '';

  const render = () => {
    renderVoice(panel);
    if (save && voiceText() && lastSavedText !== voiceText()) {
      save.disabled = false;
      if (save.textContent === 'Saved') save.textContent = 'Save to My Documents';
    }
  };

  field.addEventListener('input', render);
  signIn?.addEventListener('click', () => {
    preserveVoiceDraft();
    growthArbiter?.opened(GROWTH_REQUEST.KEEP);
    track('tool_handoff', { target_route: '/sign-in' });
  });
  share?.addEventListener('click', () => shareVoiceTranscript(share));

  if (account.state === ACCOUNT_STATE.SIGNED_IN && feature.available && save) {
    save.addEventListener('click', async () => {
      const text = voiceText();
      if (!text || text === lastSavedText) return;
      save.disabled = true;
      save.textContent = 'Saving…';
      if (status) {
        status.hidden = false;
        status.textContent = 'Saving to My Documents…';
        status.dataset.state = 'saving';
      }
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
        if (status) {
          status.textContent = 'Could not save right now — your transcript is unchanged';
          status.dataset.state = 'paused';
        }
        notify('Could not save to My Documents right now.', 'error');
      }
      render();
    });
  }

  growthArbiter?.subscribe(render);
  render();
  if (restoredFromAccountFlow && account.state === ACCOUNT_STATE.SIGNED_IN && feature.available && save) save.click();
}

async function start() {
  if (!growthArbiter) return;
  try { account = await fetchAccountState(); } catch { account = { state: ACCOUNT_STATE.DISABLED, user: null }; }
  try { feature = await documentsClient.probe(); } catch { feature = { available: false, authenticated: false }; }
  growthArbiter.update({
    ready: true,
    signedIn: account.state === ACCOUNT_STATE.SIGNED_IN,
    accountState: account.state === ACCOUNT_STATE.SIGNED_IN ? 'signed-in' : account.state === ACCOUNT_STATE.SIGNED_OUT ? 'signed-out' : 'disabled',
    keepEnabled: path !== '/tools/urdu-voice-typing' && feature.available,
    shareEnabled: true,
    communityEnabled: true
  });

  if (path === '/') await enhanceHome();
  else if (path === '/urdu-editor' || path === '/urdu-keyboard') await enhanceEditor();
  else if (path === '/tools/urdu-voice-typing') await enhanceVoice();
  bindGrowthSignals();
}

void start();
