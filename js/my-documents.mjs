import { ACCOUNT_STATE, fetchAccountState } from './account-session.mjs';
import { DocumentApiError, createDocumentsClient, writeDocumentOpenHandoff } from './account-documents.mjs';
import { MAX_DOCUMENT_SHARE_TEXT, copyShareLink, publishDocumentShare, shareLink } from './document-share.mjs';
import { confirmAction, editorKindLabel, renderDocumentCards, showShareResult } from './my-documents-ui.mjs';

const client = createDocumentsClient();
const message = document.querySelector('[data-documents-message]');
const list = document.querySelector('[data-documents-list]');
const signedOut = document.querySelector('[data-documents-signed-out]');
const unavailable = document.querySelector('[data-documents-unavailable]');
const empty = document.querySelector('[data-documents-empty]');
const dialog = document.querySelector('[data-documents-dialog]');
let items = [];
let busy = false;

function setMessage(text, state = '') {
  if (!message) return;
  message.textContent = text;
  message.dataset.state = state;
}

function hideStates() {
  [signedOut, unavailable, empty, list].forEach((node) => { if (node) node.hidden = true; });
}

function findItem(id) {
  return items.find((item) => item.id === id) || null;
}

function render() {
  hideStates();
  if (!items.length) {
    if (empty) empty.hidden = false;
    setMessage('Your account is ready. Save writing from the Basic Writer to see it here.', 'empty');
    return;
  }
  renderDocumentCards(list, items);
  list.hidden = false;
  setMessage(`${items.length} saved document${items.length === 1 ? '' : 's'}.`, 'ready');
}

async function refresh() {
  items = await client.list();
  render();
}

function sessionStore() {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

async function openDocument(item) {
  if (item.editorKind !== 'basic') {
    setMessage(`${editorKindLabel(item.editorKind)} account restore is coming in the next editor-integration slice.`, 'notice');
    return;
  }
  setMessage('Opening your saved writing…', 'working');
  const full = await client.get(item.id);
  const target = sessionStore();
  if (!target || !writeDocumentOpenHandoff(target, full)) throw new Error('handoff_unavailable');
  location.assign('/');
}

async function renameDocument(item) {
  const next = await confirmAction(dialog, {
    title: 'Rename document',
    copy: 'Choose a short name that will help you find this writing later.',
    confirmLabel: 'Rename',
    inputValue: item.title || 'Urdu writing'
  });
  if (!next || next === item.title) return;
  setMessage('Renaming document…', 'working');
  await client.rename(item.id, item.revision, next);
  await refresh();
}

async function copyDocument(item) {
  setMessage('Making a private copy…', 'working');
  await client.copy(item.id, `Copy of ${item.title || 'Urdu writing'}`);
  await refresh();
  setMessage('Private copy created.', 'success');
}

async function deleteDocument(item) {
  const confirmed = await confirmAction(dialog, {
    title: 'Delete this account copy?',
    copy: 'This removes the account-saved document. Browser-local drafts and history are not deleted.',
    confirmLabel: 'Delete'
  });
  if (!confirmed) return;
  setMessage('Deleting account copy…', 'working');
  await client.remove(item.id);
  await refresh();
}

async function publishShare(item, card) {
  const full = await client.get(item.id);
  const text = String(full.plainText || '').trim();
  if (!text) {
    setMessage('This document has no plain Urdu text to share.', 'error');
    return;
  }
  if (text.length > MAX_DOCUMENT_SHARE_TEXT) {
    setMessage(`Share links currently support up to ${MAX_DOCUMENT_SHARE_TEXT.toLocaleString()} characters. Your private document was not changed.`, 'error');
    return;
  }
  const confirmed = await confirmAction(dialog, {
    title: 'Create a public share link?',
    copy: 'This publishes a snapshot at an unlisted Write Urdu link. The saved account document stays private, and later edits do not silently change this snapshot.',
    confirmLabel: 'Publish & get link'
  });
  if (!confirmed) return;
  setMessage('Creating public snapshot…', 'working');
  const result = await publishDocumentShare(full);
  showShareResult(card, result);
  setMessage('Share link created. Your account document remains private.', 'success');
}

async function handleAction(button) {
  const action = button.dataset.action;
  if (action === 'copy-share-link' || action === 'native-share-link') {
    const url = button.dataset.shareUrl;
    if (!url) return;
    if (action === 'copy-share-link') {
      await copyShareLink(url);
      setMessage('Share link copied.', 'success');
      return;
    }
    const result = await shareLink(url);
    if (result === 'copied') setMessage('Sharing was unavailable, so the link was copied.', 'success');
    return;
  }

  const item = findItem(button.dataset.documentId);
  if (!item) return;
  const card = button.closest('.my-document-card');
  if (action === 'open') return openDocument(item);
  if (action === 'rename') return renameDocument(item);
  if (action === 'copy') return copyDocument(item);
  if (action === 'delete') return deleteDocument(item);
  if (action === 'share') return publishShare(item, card);
}

list?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || busy) return;
  busy = true;
  button.disabled = true;
  Promise.resolve(handleAction(button)).catch((error) => {
    if (error instanceof DocumentApiError && error.code === 'document_revision_conflict') {
      setMessage('This document changed elsewhere. Refreshing the latest version…', 'error');
      return refresh();
    }
    setMessage('That action could not be completed. Your saved and local writing were not changed.', 'error');
  }).finally(() => {
    busy = false;
    if (button.isConnected) button.disabled = false;
  });
});

async function start() {
  hideStates();
  try {
    const feature = await client.probe();
    if (!feature.available) {
      if (unavailable) unavailable.hidden = false;
      setMessage('My Documents is not enabled here.', 'unavailable');
      return;
    }
    const account = await fetchAccountState();
    if (account.state !== ACCOUNT_STATE.SIGNED_IN) {
      if (signedOut) signedOut.hidden = false;
      setMessage('Sign in to view account-saved documents.', 'signed-out');
      return;
    }
    await refresh();
  } catch (error) {
    if (error instanceof DocumentApiError && error.status === 401) {
      if (signedOut) signedOut.hidden = false;
      setMessage('Sign in to view account-saved documents.', 'signed-out');
      return;
    }
    if (unavailable) unavailable.hidden = false;
    setMessage('My Documents is temporarily unavailable. Local writing is unaffected.', 'error');
  }
}

void start();
