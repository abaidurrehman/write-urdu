import { ACCOUNT_STATE, fetchAccountState, flushLocalWriting } from './account-session.mjs';
import {
  DOCUMENT_SYNC_DELAY_MS,
  DocumentApiError,
  clearAccountDocumentMetadata,
  createDocumentsClient,
  documentMetadataKey,
  documentSnapshotSignature,
  readAccountDocumentMetadata,
  readDocumentOpenHandoff,
  writeAccountDocumentMetadata
} from './account-documents.mjs';

const runtime = window;
const client = createDocumentsClient();
const ROUTE_KIND = Object.freeze({
  '/urdu-editor': 'rich',
  '/urdu-keyboard': 'keyboard'
});

function normalizedPath() {
  let path = String(location.pathname || '/');
  if (/\.html$/i.test(path)) path = path.slice(0, -5);
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

const editorKind = ROUTE_KIND[normalizedPath()] || null;
let adapter = null;
let account = null;
let metadata = null;
let syncTimer = 0;
let syncInFlight = false;
let conflictPaused = false;
let saveButton = null;
let signInLink = null;
let documentsLink = null;
let statusNode = null;

function storage() {
  try { return runtime.localStorage; } catch { return null; }
}

function sessionStore() {
  try { return runtime.sessionStorage; } catch { return null; }
}

function metadataKey() {
  return documentMetadataKey(editorKind);
}

function snapshot() {
  return {
    content: adapter ? adapter.getContent() : '',
    text: adapter ? adapter.getText() : ''
  };
}

function hasWriting(value = snapshot()) {
  return Boolean(String(value.text || '').trim() || String(value.content || '').trim());
}

function notify(message, type) {
  if (runtime.WriteUrduUI && typeof runtime.WriteUrduUI.notify === 'function') {
    runtime.WriteUrduUI.notify(message, type);
  }
}

function ensureRemoteStatus() {
  const stats = document.querySelector('.editor-stats');
  if (!stats) return null;
  let node = stats.querySelector('[data-account-save-status]');
  if (!node) {
    const separator = document.createElement('span');
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '·';
    node = document.createElement('span');
    node.className = 'editor-account-save-status';
    node.setAttribute('data-account-save-status', '');
    stats.appendChild(separator);
    stats.appendChild(node);
  }
  return node;
}

function setStatus(message, state = '') {
  if (statusNode) {
    statusNode.textContent = message;
    statusNode.dataset.state = state;
  }
  const remote = ensureRemoteStatus();
  if (remote) {
    remote.textContent = message;
    remote.dataset.state = state;
  }
}

function setSaving(value) {
  if (!saveButton) return;
  saveButton.disabled = value;
  saveButton.textContent = value ? 'Saving…' : (metadata ? 'Save now' : 'Save to my account');
}

function createAccountPanel() {
  const toolsPanel = document.querySelector('.editor-productivity');
  if (!toolsPanel) return null;
  const existing = toolsPanel.querySelector('[data-editor-account-documents]');
  if (existing) return existing;

  const node = document.createElement('section');
  node.className = 'editor-account-documents';
  node.setAttribute('data-editor-account-documents', editorKind);
  node.hidden = true;
  const noun = editorKind === 'rich' ? 'formatted document' : 'Urdu writing';
  node.innerHTML = `
    <div class="editor-account-documents-copy">
      <strong>Keep this ${noun}</strong>
      <span>Save it to your account when you want to continue on another device. Local drafts stay independent.</span>
    </div>
    <div class="editor-account-documents-actions">
      <a href="/sign-in?returnTo=${encodeURIComponent(normalizedPath())}" data-editor-account-signin>Sign in to save</a>
      <button type="button" data-editor-account-save hidden>Save to my account</button>
      <a href="/my-documents" class="is-secondary" data-editor-account-library hidden>My Documents</a>
    </div>
    <p class="editor-account-documents-status" data-editor-account-status aria-live="polite"></p>`;

  const main = toolsPanel.querySelector('.editor-productivity-main');
  if (main) main.insertAdjacentElement('afterend', node);
  else toolsPanel.appendChild(node);
  return node;
}

function revealPanel() {
  const panel = createAccountPanel();
  if (!panel) return false;
  panel.hidden = false;
  saveButton = panel.querySelector('[data-editor-account-save]');
  signInLink = panel.querySelector('[data-editor-account-signin]');
  documentsLink = panel.querySelector('[data-editor-account-library]');
  statusNode = panel.querySelector('[data-editor-account-status]');
  if (signInLink) signInLink.addEventListener('click', () => flushLocalWriting(runtime));
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      conflictPaused = false;
      void syncToAccount({ explicit: true });
    });
  }
  return true;
}

function persistMetadata(documentRecord) {
  metadata = Object.freeze({
    documentId: String(documentRecord.id),
    ownerUserId: String(account.user.id),
    revision: Number(documentRecord.revision),
    lastSyncedSignature: documentSnapshotSignature(snapshot())
  });
  writeAccountDocumentMetadata(storage(), metadata, metadataKey());
}

function resetAssociation(message) {
  clearAccountDocumentMetadata(storage(), metadataKey());
  metadata = null;
  conflictPaused = false;
  runtime.clearTimeout(syncTimer);
  syncTimer = 0;
  if (saveButton) saveButton.textContent = 'Save to my account';
  setStatus(message || 'Not saved to your account', 'idle');
}

async function syncToAccount({ explicit = false } = {}) {
  if (!adapter || !account || account.state !== ACCOUNT_STATE.SIGNED_IN || syncInFlight || conflictPaused) return;
  const current = snapshot();
  if (!hasWriting(current)) {
    if (explicit) {
      setStatus('Add some writing before saving to your account', 'idle');
      notify('Add some writing before saving to your account.', 'error');
    }
    return;
  }
  if (!metadata && !explicit) return;

  syncInFlight = true;
  runtime.clearTimeout(syncTimer);
  syncTimer = 0;
  setSaving(true);
  setStatus('Saving to your account…', 'saving');
  flushLocalWriting(runtime);

  try {
    const documentRecord = metadata
      ? await client.update(metadata.documentId, metadata.revision, current)
      : await client.create(current, { editorKind });
    persistMetadata(documentRecord);
    conflictPaused = false;
    setStatus('Saved to your account', 'saved');
    if (explicit) notify('Writing saved to your account.', 'success');
  } catch (error) {
    if (error instanceof DocumentApiError && error.code === 'document_revision_conflict') {
      conflictPaused = true;
      setStatus('This document changed on another device', 'conflict');
      notify('This document changed on another device. Nothing was overwritten.', 'error');
    } else if (error instanceof DocumentApiError && error.code === 'document_not_found') {
      resetAssociation('Saved copy not found — choose Save to my account to create a new copy');
    } else if (error instanceof DocumentApiError && error.status === 401) {
      setStatus('Sign in again to save across devices', 'paused');
    } else {
      setStatus('Account save paused — your local draft is safe', 'paused');
    }
  } finally {
    syncInFlight = false;
    setSaving(false);
  }
}

function scheduleRemoteSync() {
  if (!metadata || conflictPaused || syncInFlight) return;
  const signature = documentSnapshotSignature(snapshot());
  if (signature === metadata.lastSyncedSignature) {
    setStatus('Saved to your account', 'saved');
    return;
  }
  setStatus('Changes saved on this device — account save pending', 'pending');
  runtime.clearTimeout(syncTimer);
  syncTimer = runtime.setTimeout(() => { void syncToAccount(); }, DOCUMENT_SYNC_DELAY_MS);
}

function applyOpenHandoff() {
  const handoff = readDocumentOpenHandoff(sessionStore());
  if (!handoff || handoff.editorKind !== editorKind) return false;
  const incoming = { content: handoff.content, text: handoff.plainText };
  const current = snapshot();
  const different = hasWriting(current) && documentSnapshotSignature(current) !== documentSnapshotSignature(incoming);

  if (different) {
    flushLocalWriting(runtime);
    const confirmed = runtime.confirm('Open the saved document from My Documents? Your current writing is kept in local drafts/history before this editor is replaced.');
    if (!confirmed) {
      setStatus('Saved document was not opened. Your current writing is unchanged.', 'idle');
      return false;
    }
  } else if (hasWriting(current)) {
    flushLocalWriting(runtime);
  }

  clearAccountDocumentMetadata(storage(), metadataKey());
  metadata = null;
  conflictPaused = false;
  adapter.setContent(handoff.content || handoff.plainText || '');
  persistMetadata(handoff);
  setStatus('Opened from My Documents · Saved to your account', 'saved');
  notify('Saved document opened. Your browser-local history remains available.', 'success');
  return true;
}

function bindAdapter() {
  adapter.onChange(scheduleRemoteSync);
  const clearButton = document.getElementById('clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      runtime.setTimeout(() => {
        if (adapter && !adapter.hasContent()) resetAssociation('Not saved to your account');
      }, 0);
    });
  }
}

function waitForAdapter() {
  return new Promise((resolve) => {
    let attempts = 0;
    const timer = runtime.setInterval(() => {
      attempts += 1;
      const tools = runtime.WriteUrduTools;
      if (tools?.adapter?.kind === editorKind) {
        runtime.clearInterval(timer);
        resolve(tools.adapter);
      } else if (attempts >= 180) {
        runtime.clearInterval(timer);
        resolve(null);
      }
    }, 50);
  });
}

async function start() {
  if (!editorKind) return;
  let feature;
  try { feature = await client.probe(); } catch { return; }
  if (!feature.available) return;

  adapter = await waitForAdapter();
  if (!adapter) return;
  try { account = await fetchAccountState(); } catch { return; }
  if (!revealPanel()) return;

  if (account.state !== ACCOUNT_STATE.SIGNED_IN) {
    if (saveButton) saveButton.hidden = true;
    if (documentsLink) documentsLink.hidden = true;
    if (signInLink) signInLink.hidden = false;
    setStatus('Sign in to save across devices', 'signed-out');
    return;
  }

  if (saveButton) saveButton.hidden = false;
  if (documentsLink) documentsLink.hidden = false;
  if (signInLink) signInLink.hidden = true;

  const opened = applyOpenHandoff();
  bindAdapter();
  if (opened) return;

  metadata = readAccountDocumentMetadata(storage(), metadataKey());
  if (metadata && metadata.ownerUserId !== account.user.id) {
    clearAccountDocumentMetadata(storage(), metadataKey());
    metadata = null;
  }
  if (!metadata) {
    setStatus('Not saved to your account', 'idle');
    return;
  }

  const signature = documentSnapshotSignature(snapshot());
  if (signature === metadata.lastSyncedSignature) setStatus('Saved to your account', 'saved');
  else if (hasWriting()) scheduleRemoteSync();
  else resetAssociation('Not saved to your account');
}

void start();
