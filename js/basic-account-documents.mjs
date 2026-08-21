import {
  ACCOUNT_STATE,
  fetchAccountState,
  flushLocalWriting
} from './account-session.mjs';
import {
  DOCUMENT_SYNC_DELAY_MS,
  DocumentApiError,
  clearAccountDocumentMetadata,
  createDocumentsClient,
  documentSnapshotSignature,
  readAccountDocumentMetadata,
  readDocumentOpenHandoff,
  writeAccountDocumentMetadata
} from './account-documents.mjs';

const runtime = window;
const client = createDocumentsClient();
let adapter = null;
let account = null;
let metadata = null;
let syncTimer = 0;
let syncInFlight = false;
let conflictPaused = false;
let card = null;
let cardStatus = null;
let saveButton = null;
let signInLink = null;
let documentsLink = null;
let remoteStatus = null;

function notify(message, type) {
  if (runtime.WriteUrduUI && typeof runtime.WriteUrduUI.notify === 'function') {
    runtime.WriteUrduUI.notify(message, type);
  }
}

function storage() {
  try {
    return runtime.localStorage;
  } catch {
    return null;
  }
}

function sessionStorageSafe() {
  try {
    return runtime.sessionStorage;
  } catch {
    return null;
  }
}

function currentSnapshot() {
  return {
    content: adapter ? adapter.getContent() : '',
    text: adapter ? adapter.getText() : ''
  };
}

function hasWriting(snapshot) {
  return Boolean(String(snapshot?.text || '').trim() || String(snapshot?.content || '').trim());
}

function ensureRemoteStatus() {
  if (remoteStatus && remoteStatus.isConnected) return remoteStatus;
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
  remoteStatus = node;
  return node;
}

function setStatus(message, state = '') {
  if (cardStatus) {
    cardStatus.textContent = message;
    cardStatus.dataset.state = state;
  }
  const node = ensureRemoteStatus();
  if (node) {
    node.textContent = message;
    node.dataset.state = state;
  }
}

function setSaving(value) {
  if (saveButton) {
    saveButton.disabled = value;
    saveButton.textContent = value ? 'Saving…' : (metadata ? 'Save now' : 'Save to my account');
  }
}

function createContinuityCard() {
  const heading = document.querySelector('h1');
  const copyColumn = heading && heading.closest('.col-sm');
  const row = copyColumn && copyColumn.parentElement;
  if (!row) return null;

  let existing = row.querySelector('[data-home-account-continuity]');
  if (existing) return existing;

  const aside = document.createElement('aside');
  aside.className = 'home-account-continuity';
  aside.setAttribute('data-home-account-continuity', '');
  aside.hidden = true;
  aside.innerHTML = `
    <div class="home-account-continuity-icon" aria-hidden="true">✓</div>
    <div class="home-account-continuity-copy">
      <p class="home-account-continuity-eyebrow">Optional account</p>
      <h2>Keep your writing</h2>
      <p>Save this Urdu writing for later, continue on another device, and share a selected snapshot when you are ready. Account-saved documents stay private by default.</p>
      <div class="home-account-benefits" aria-label="Account benefits">
        <span>Save for later</span>
        <span>Continue on another device</span>
        <span>Share with a link</span>
      </div>
      <div class="home-account-continuity-actions">
        <a href="/sign-in?returnTo=%2F" class="home-account-continuity-button" data-account-continuity-signin>Sign in to save</a>
        <button type="button" class="home-account-continuity-button" data-account-continuity-save hidden>Save to my account</button>
        <a href="/my-documents" class="home-account-continuity-button is-secondary" data-account-continuity-documents hidden>My Documents</a>
      </div>
      <p class="home-account-continuity-status" data-account-continuity-status aria-live="polite"></p>
    </div>`;
  row.appendChild(aside);
  return aside;
}

function revealCard() {
  if (!card) card = createContinuityCard();
  if (!card) return;
  const row = card.parentElement;
  const copyColumn = row && row.querySelector('.col-sm');
  if (row) row.classList.add('home-account-hero-layout');
  if (copyColumn) copyColumn.classList.add('home-account-hero-copy');
  card.hidden = false;
  cardStatus = card.querySelector('[data-account-continuity-status]');
  saveButton = card.querySelector('[data-account-continuity-save]');
  signInLink = card.querySelector('[data-account-continuity-signin]');
  documentsLink = card.querySelector('[data-account-continuity-documents]');
}

function persistMetadata(document) {
  const snapshot = currentSnapshot();
  metadata = Object.freeze({
    documentId: String(document.id),
    ownerUserId: String(account.user.id),
    revision: Number(document.revision),
    lastSyncedSignature: documentSnapshotSignature(snapshot)
  });
  writeAccountDocumentMetadata(storage(), metadata);
}

function resetAssociation(message) {
  clearAccountDocumentMetadata(storage());
  metadata = null;
  conflictPaused = false;
  runtime.clearTimeout(syncTimer);
  syncTimer = 0;
  if (saveButton) saveButton.textContent = 'Save to my account';
  setStatus(message || 'Not saved to your account', 'idle');
}

async function syncToAccount({ explicit = false } = {}) {
  if (!adapter || !account || account.state !== ACCOUNT_STATE.SIGNED_IN || syncInFlight || conflictPaused) return;
  const snapshot = currentSnapshot();
  if (!hasWriting(snapshot)) {
    if (explicit) {
      setStatus('Type something before saving to your account', 'idle');
      notify('Type something before saving to your account.', 'error');
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
    const document = metadata
      ? await client.update(metadata.documentId, metadata.revision, snapshot)
      : await client.create(snapshot);
    persistMetadata(document);
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
  const signature = documentSnapshotSignature(currentSnapshot());
  if (signature === metadata.lastSyncedSignature) {
    setStatus('Saved to your account', 'saved');
    return;
  }
  setStatus('Changes saved on this device — account save pending', 'pending');
  runtime.clearTimeout(syncTimer);
  syncTimer = runtime.setTimeout(() => {
    void syncToAccount();
  }, DOCUMENT_SYNC_DELAY_MS);
}

function bindEditor() {
  const textarea = document.getElementById('transliterateTextarea');
  if (!textarea) return;
  textarea.addEventListener('input', scheduleRemoteSync);

  const clearButton = document.getElementById('clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      runtime.setTimeout(() => {
        if (adapter && !adapter.hasContent()) resetAssociation('Not saved to your account');
      }, 0);
    });
  }
}

function bindCard() {
  if (signInLink) signInLink.addEventListener('click', () => flushLocalWriting(runtime));
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      conflictPaused = false;
      void syncToAccount({ explicit: true });
    });
  }
}

function waitForBasicAdapter() {
  return new Promise((resolve) => {
    let attempts = 0;
    const timer = runtime.setInterval(() => {
      attempts += 1;
      const tools = runtime.WriteUrduTools;
      if (tools?.adapter?.kind === 'basic') {
        runtime.clearInterval(timer);
        resolve(tools.adapter);
      } else if (attempts >= 120) {
        runtime.clearInterval(timer);
        resolve(null);
      }
    }, 50);
  });
}

function applyOpenHandoff() {
  const handoff = readDocumentOpenHandoff(sessionStorageSafe());
  if (!handoff || handoff.editorKind !== 'basic') return false;
  const incoming = { content: handoff.content, text: handoff.plainText };
  const current = currentSnapshot();
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

  clearAccountDocumentMetadata(storage());
  metadata = null;
  conflictPaused = false;
  adapter.setContent(handoff.content || handoff.plainText || '');
  persistMetadata(handoff);
  setStatus('Opened from My Documents · Saved to your account', 'saved');
  notify('Saved document opened. Your browser-local history remains available.', 'success');
  return true;
}

async function start() {
  const productPath = window.WriteUrduLocaleRoute ? window.WriteUrduLocaleRoute.productPath(location.pathname || '/') : location.pathname;
  if (productPath !== '/' && productPath !== '/index.html') return;

  let feature;
  try { feature = await client.probe(); } catch { return; }
  if (!feature.available) return;

  adapter = await waitForBasicAdapter();
  if (!adapter) return;

  try { account = await fetchAccountState(); } catch { return; }

  revealCard();
  ensureRemoteStatus();
  bindCard();
  bindEditor();

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

  if (applyOpenHandoff()) return;

  metadata = readAccountDocumentMetadata(storage());
  if (metadata && metadata.ownerUserId !== account.user.id) {
    clearAccountDocumentMetadata(storage());
    metadata = null;
  }

  if (!metadata) {
    setStatus('Not saved to your account', 'idle');
    return;
  }

  const signature = documentSnapshotSignature(currentSnapshot());
  if (signature === metadata.lastSyncedSignature) setStatus('Saved to your account', 'saved');
  else if (hasWriting(currentSnapshot())) scheduleRemoteSync();
  else resetAssociation('Not saved to your account');
}

void start();
