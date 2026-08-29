import { stateLabel, rejectionCopy } from './community-my-publications-state.mjs';

function formatTime(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return String(value || '');
  }
}

function actionButton(action, label, key) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'my-publications-action';
  button.dataset.action = action;
  button.dataset.cardKey = key;
  button.textContent = label;
  return button;
}

function actionLink(href, label) {
  const link = document.createElement('a');
  link.className = 'my-publications-action';
  link.href = href;
  link.textContent = label;
  return link;
}

function metaLine(card) {
  if (card.state === 'published' || card.state === 'revision_in_review') {
    return `Published ${formatTime(card.publishedAt)} · Updated ${formatTime(card.updatedAt)}`;
  }
  if (card.state === 'withdrawn' || card.state === 'unpublished_removed') {
    return `Updated ${formatTime(card.updatedAt)}`;
  }
  return `Submitted ${formatTime(card.submittedAt)}`;
}

function appendNote(content, text, tone) {
  const note = document.createElement('p');
  note.className = 'my-publication-note';
  if (tone) note.dataset.tone = tone;
  note.textContent = text;
  content.appendChild(note);
}

function buildActions(card) {
  const actions = document.createElement('div');
  actions.className = 'my-publication-actions';

  if (card.state === 'in_review') {
    actions.appendChild(actionButton('update-pending', 'Update pending submission', card.key));
  } else if (card.state === 'published' || card.state === 'revision_in_review') {
    if (card.publicSlug) actions.appendChild(actionLink(`/urdu-writers/${encodeURIComponent(card.publicSlug)}`, 'View public page'));
    if (card.state === 'published') actions.appendChild(actionButton('submit-revision', 'Submit a revision', card.key));
    actions.appendChild(actionButton('withdraw', 'Withdraw publication', card.key));
  } else {
    actions.appendChild(actionLink('/', card.state === 'not_approved' ? 'Revise and resubmit' : 'Create a new submission'));
    if (card.sourceDocumentId) actions.appendChild(actionButton('return-to-source', 'Return to source writing', card.key));
  }

  return actions;
}

export function renderPublicationCards(container, cards) {
  container.textContent = '';
  cards.forEach((card) => {
    const article = document.createElement('article');
    article.className = 'my-publication-card';
    article.dataset.cardKey = card.key;

    const content = document.createElement('div');
    const titleRow = document.createElement('div');
    titleRow.className = 'my-publication-title-row';
    const title = document.createElement('h2');
    title.className = 'my-publication-title';
    title.textContent = card.title || 'Urdu writing';
    const chip = document.createElement('span');
    chip.className = 'my-publication-chip';
    chip.dataset.state = card.state;
    chip.textContent = stateLabel(card.state);
    const category = document.createElement('span');
    category.className = 'my-publication-category';
    category.textContent = card.primaryCategory || '';
    titleRow.append(title, chip, category);

    const meta = document.createElement('p');
    meta.className = 'my-publication-meta';
    meta.textContent = metaLine(card);

    content.append(titleRow, meta);

    if (card.state === 'not_approved' && card.rejectionCode) {
      appendNote(content, rejectionCopy(card.rejectionCode), null);
    }
    if (card.state === 'unpublished_removed') {
      appendNote(content, 'This publication is no longer public.', null);
    }
    if (card.revisionRejection) {
      appendNote(content, `Revision not approved: ${rejectionCopy(card.revisionRejection.rejectionCode)}`, 'info');
    }

    article.append(content, buildActions(card));
    container.appendChild(article);
  });
}

export function confirmDialog(dialog, { title, copy, confirmLabel }) {
  if (!dialog) return Promise.resolve(false);
  dialog.querySelector('[data-confirm-title]').textContent = title;
  dialog.querySelector('[data-confirm-copy]').textContent = copy;
  const confirmButton = dialog.querySelector('[data-confirm-button]');
  confirmButton.textContent = confirmLabel || 'Confirm';
  return new Promise((resolve) => {
    const onClose = () => {
      dialog.removeEventListener('close', onClose);
      resolve(dialog.returnValue === 'confirm');
    };
    dialog.addEventListener('close', onClose);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
}

export function openRevisionDialog(dialog, { title, publicAuthorName, plainText }) {
  if (!dialog) return Promise.resolve(null);
  const titleInput = dialog.querySelector('[data-revision-title]');
  const authorInput = dialog.querySelector('[data-revision-author-name]');
  const bodyInput = dialog.querySelector('[data-revision-body]');
  const errorNode = dialog.querySelector('[data-revision-error]');
  titleInput.value = title || '';
  authorInput.value = publicAuthorName || '';
  bodyInput.value = plainText || '';
  errorNode.hidden = true;
  errorNode.textContent = '';

  return new Promise((resolve) => {
    const onClose = () => {
      dialog.removeEventListener('close', onClose);
      if (dialog.returnValue !== 'confirm') {
        resolve(null);
        return;
      }
      resolve({
        title: titleInput.value.trim(),
        publicAuthorName: authorInput.value.trim(),
        plainText: bodyInput.value
      });
    };
    dialog.addEventListener('close', onClose);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    setTimeout(() => titleInput.focus(), 0);
  });
}

export function showRevisionError(dialog, message) {
  const errorNode = dialog?.querySelector('[data-revision-error]');
  if (!errorNode) return;
  errorNode.textContent = message;
  errorNode.hidden = false;
}
