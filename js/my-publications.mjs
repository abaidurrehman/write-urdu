import { ACCOUNT_STATE, fetchAccountState } from './account-session.mjs';
import { createDocumentsClient, writeDocumentOpenHandoff } from './account-documents.mjs';
import { createCommunityClient, CommunityApiError, validateSubmissionForm } from './community-publishing.mjs';
import { groupMyPublicationItems } from './community-my-publications-state.mjs';
import { renderPublicationCards, confirmDialog, openRevisionDialog, showRevisionError } from './my-publications-ui.mjs';

const client = createCommunityClient();
const documentsClient = createDocumentsClient();
const EDITOR_ROUTES = Object.freeze({ basic: '/', rich: '/urdu-editor', keyboard: '/urdu-keyboard' });

const message = document.querySelector('[data-publications-message]');
const list = document.querySelector('[data-publications-list]');
const signedOut = document.querySelector('[data-publications-signed-out]');
const unavailable = document.querySelector('[data-publications-unavailable]');
const empty = document.querySelector('[data-publications-empty]');
const confirmDialogEl = document.querySelector('[data-publications-confirm-dialog]');
const revisionDialogEl = document.querySelector('[data-publications-revision-dialog]');
let cards = [];
let busy = false;
let revisionContext = null;

function setMessage(text, state = '') {
  if (!message) return;
  message.textContent = text;
  message.dataset.state = state;
}

function hideStates() {
  [signedOut, unavailable, empty, list].forEach((node) => { if (node) node.hidden = true; });
}

function findCard(key) {
  return cards.find((card) => card.key === key) || null;
}

function render() {
  hideStates();
  if (!cards.length) {
    if (empty) empty.hidden = false;
    setMessage('Write something meaningful, then choose to submit it to Urdu Writers.', 'empty');
    return;
  }
  renderPublicationCards(list, cards);
  list.hidden = false;
  setMessage(`${cards.length} submission${cards.length === 1 ? '' : 's'}.`, 'ready');
}

async function refresh() {
  const items = await client.myPublicationsList();
  cards = groupMyPublicationItems(items);
  render();
}

function sessionStore() {
  try { return sessionStorage; } catch { return null; }
}

async function returnToSource(card) {
  setMessage('Opening your saved writing…', 'working');
  const source = await documentsClient.get(card.sourceDocumentId);
  const route = EDITOR_ROUTES[source.editorKind];
  if (!route) {
    setMessage('This source document uses an editor type that is not available here.', 'notice');
    return;
  }
  const store = sessionStore();
  if (!store || !writeDocumentOpenHandoff(store, source)) throw new Error('handoff_unavailable');
  location.assign(route);
}

async function withdrawPublication(card) {
  const confirmed = await confirmDialog(confirmDialogEl, {
    title: 'Withdraw this writing?',
    copy: 'It will no longer be publicly readable on WriteUrdu. Your private writing will not be deleted.',
    confirmLabel: 'Withdraw'
  });
  if (!confirmed) return;
  setMessage('Withdrawing…', 'working');
  await client.withdrawPublication(card.publicationId);
  await refresh();
  setMessage('Withdrawn. This is no longer publicly readable.', 'success');
}

async function submitRevision(card) {
  setMessage('Loading the currently published writing…', 'working');
  const response = await fetch(`/api/community/publications/${encodeURIComponent(card.publicSlug)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json' }
  });
  if (!response.ok) {
    setMessage('Could not load the currently published writing.', 'error');
    return;
  }
  const detail = (await response.json()).publication;
  revisionContext = { primaryCategory: detail.primaryCategory, tags: detail.tags };
  const fields = await openRevisionDialog(revisionDialogEl, detail);
  if (!fields) return;
  setMessage('Submitting revision…', 'working');
  await client.submitPublicationRevision(card.reviseSubmissionId, {
    ...fields,
    editorKind: 'basic',
    sourceDocumentId: card.sourceDocumentId || undefined,
    primaryCategory: detail.primaryCategory,
    tags: detail.tags,
    rightsConfirmed: true,
    publicConfirmed: true,
    guidelinesConfirmed: true
  });
  await refresh();
  setMessage('Revision submitted for review. Your current published version is still visible.', 'success');
}

async function updatePending(card) {
  setMessage('Loading your pending submission…', 'working');
  const submission = await client.get(card.submissionId);
  revisionContext = { primaryCategory: submission.primaryCategory, tags: submission.tags };
  const fields = await openRevisionDialog(revisionDialogEl, submission);
  if (!fields) return;
  setMessage('Updating pending submission…', 'working');
  await client.revise(card.submissionId, submission.submissionRevision, {
    ...fields,
    editorKind: submission.editorKind,
    sourceDocumentId: submission.sourceDocumentId || undefined,
    primaryCategory: submission.primaryCategory,
    tags: submission.tags,
    rightsConfirmed: true,
    publicConfirmed: true,
    guidelinesConfirmed: true
  });
  await refresh();
  setMessage('Updating this submission sends the new version for review.', 'success');
}

async function handleAction(button) {
  const card = findCard(button.dataset.cardKey);
  if (!card) return;
  const action = button.dataset.action;
  if (action === 'update-pending') return updatePending(card);
  if (action === 'submit-revision') return submitRevision(card);
  if (action === 'withdraw') return withdrawPublication(card);
  if (action === 'return-to-source') return returnToSource(card);
}

list?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || busy) return;
  busy = true;
  button.disabled = true;
  Promise.resolve(handleAction(button)).catch(() => {
    setMessage('That action could not be completed. Nothing you submitted was changed.', 'error');
  }).finally(() => {
    busy = false;
    if (button.isConnected) button.disabled = false;
  });
});

const revisionForm = revisionDialogEl?.querySelector('form');
revisionForm?.addEventListener('submit', (event) => {
  if (event.submitter?.value !== 'confirm') return;
  const titleInput = revisionDialogEl.querySelector('[data-revision-title]');
  const authorInput = revisionDialogEl.querySelector('[data-revision-author-name]');
  const bodyInput = revisionDialogEl.querySelector('[data-revision-body]');
  const check = validateSubmissionForm({
    title: titleInput.value,
    publicAuthorName: authorInput.value,
    plainText: bodyInput.value,
    primaryCategory: revisionContext?.primaryCategory,
    tags: revisionContext?.tags || [],
    rightsConfirmed: true,
    publicConfirmed: true,
    guidelinesConfirmed: true
  });
  if (!check.valid) {
    event.preventDefault();
    showRevisionError(revisionDialogEl, 'Please check the title and writing length before submitting.');
  }
});

async function start() {
  hideStates();
  try {
    const feature = await client.probe();
    if (!feature.available) {
      if (unavailable) unavailable.hidden = false;
      setMessage('My Publications is not enabled here.', 'unavailable');
      return;
    }
    const account = await fetchAccountState();
    if (account.state !== ACCOUNT_STATE.SIGNED_IN) {
      if (signedOut) signedOut.hidden = false;
      setMessage('Sign in to view your submissions.', 'signed-out');
      return;
    }
    await refresh();
  } catch (error) {
    if (error instanceof CommunityApiError && error.status === 401) {
      if (signedOut) signedOut.hidden = false;
      setMessage('Sign in to view your submissions.', 'signed-out');
      return;
    }
    if (unavailable) unavailable.hidden = false;
    setMessage('My Publications is temporarily unavailable. Your submissions are unaffected.', 'error');
  }
}

void start();
