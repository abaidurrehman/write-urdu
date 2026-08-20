function kindLabel(kind) {
  if (kind === 'rich') return 'Rich editor';
  if (kind === 'keyboard') return 'Urdu keyboard';
  return 'Basic writer';
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return String(value || '');
  }
}

function actionButton(action, label, id) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'my-documents-action';
  button.dataset.action = action;
  button.dataset.documentId = id;
  button.textContent = label;
  return button;
}

export function renderDocumentCards(container, documents) {
  container.textContent = '';
  documents.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'my-document-card';
    card.dataset.documentId = item.id;

    const content = document.createElement('div');
    const titleRow = document.createElement('div');
    titleRow.className = 'my-document-title-row';
    const title = document.createElement('h2');
    title.className = 'my-document-title';
    title.textContent = item.title || 'Urdu writing';
    const kind = document.createElement('span');
    kind.className = 'my-document-kind';
    kind.textContent = kindLabel(item.editorKind);
    titleRow.append(title, kind);

    const preview = document.createElement('p');
    preview.className = 'my-document-preview';
    preview.lang = 'ur';
    preview.dir = 'rtl';
    preview.textContent = String(item.preview || '').replace(/\s+/g, ' ').trim() || 'Saved Urdu writing';

    const meta = document.createElement('p');
    meta.className = 'my-document-meta';
    meta.textContent = `Updated ${formatTime(item.updatedAt)} · Revision ${item.revision}`;
    content.append(titleRow, preview, meta);

    const actions = document.createElement('div');
    actions.className = 'my-document-actions';
    actions.append(
      actionButton('open', 'Open', item.id),
      actionButton('rename', 'Rename', item.id),
      actionButton('copy', 'Make a copy', item.id),
      actionButton('share', 'Share link', item.id),
      actionButton('delete', 'Delete', item.id)
    );
    card.append(content, actions);
    container.appendChild(card);
  });
}

export function showShareResult(card, result) {
  card.querySelector('.my-documents-share-result')?.remove();
  const panel = document.createElement('div');
  panel.className = 'my-documents-share-result';
  const copy = document.createElement('p');
  copy.textContent = 'Public snapshot created. Your saved document remains private.';
  const link = document.createElement('a');
  link.href = result.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = result.url;
  const actions = document.createElement('div');
  actions.className = 'my-document-actions';
  const copyButton = actionButton('copy-share-link', 'Copy link', result.id);
  const shareButton = actionButton('native-share-link', 'Share', result.id);
  copyButton.dataset.shareUrl = result.url;
  shareButton.dataset.shareUrl = result.url;
  actions.append(copyButton, shareButton);
  panel.append(copy, link, actions);
  card.appendChild(panel);
}

export function confirmAction(dialog, options) {
  if (!dialog) return Promise.resolve(null);
  dialog.querySelector('[data-dialog-title]').textContent = options.title;
  dialog.querySelector('[data-dialog-copy]').textContent = options.copy;
  const inputWrap = dialog.querySelector('[data-dialog-input-wrap]');
  const input = dialog.querySelector('[data-dialog-input]');
  const confirm = dialog.querySelector('[data-dialog-confirm]');
  confirm.textContent = options.confirmLabel || 'Confirm';
  const usesInput = options.inputValue !== undefined && options.inputValue !== null;
  inputWrap.hidden = !usesInput;
  if (usesInput) input.value = options.inputValue;
  return new Promise((resolve) => {
    const onClose = () => {
      dialog.removeEventListener('close', onClose);
      resolve(dialog.returnValue === 'confirm' ? (usesInput ? input.value.trim() : true) : null);
    };
    dialog.addEventListener('close', onClose);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    if (usesInput) setTimeout(() => input.focus(), 0);
  });
}

export function editorKindLabel(kind) {
  return kindLabel(kind);
}
