import {
  ACCOUNT_STATE,
  accountErrorMessage,
  fetchAccountState,
  fetchAuthCsrfToken,
  flushLocalWriting,
  resolveAccountReturnTarget
} from './account-session.mjs';

const loading = document.querySelector('[data-account-loading]');
const signedOut = document.querySelector('[data-account-signed-out]');
const signedIn = document.querySelector('[data-account-signed-in]');
const disabled = document.querySelector('[data-account-disabled]');
const error = document.querySelector('[data-account-error]');
const googleForm = document.querySelector('[data-google-sign-in]');
const signoutForm = document.querySelector('[data-account-page-signout]');
const continueLocal = document.querySelector('[data-continue-without-account]');
const params = new URLSearchParams(window.location.search);
const returnTarget = resolveAccountReturnTarget(params.get('returnTo'));

function show(node) {
  if (node) node.hidden = false;
}

function hide(node) {
  if (node) node.hidden = true;
}

function showError(message) {
  if (!message || !error) return;
  error.textContent = message;
  error.hidden = false;
}

function setFormReturnTarget(form) {
  const input = form?.querySelector('input[name="callbackUrl"]');
  if (input) input.value = returnTarget;
}

async function prepareCsrf(form) {
  const token = await fetchAuthCsrfToken();
  const input = form?.querySelector('input[name="csrfToken"]');
  const button = form?.querySelector('button[type="submit"]');
  if (input) input.value = token;
  if (button) button.disabled = false;
}

async function start() {
  if (continueLocal) continueLocal.href = returnTarget;
  setFormReturnTarget(googleForm);
  setFormReturnTarget(signoutForm);
  showError(accountErrorMessage(params.get('error')));

  try {
    const account = await fetchAccountState();
    hide(loading);

    if (account.state === ACCOUNT_STATE.DISABLED) {
      show(disabled);
      return;
    }

    if (account.state === ACCOUNT_STATE.SIGNED_OUT) {
      show(signedOut);
      try {
        await prepareCsrf(googleForm);
        const status = document.querySelector('[data-sign-in-status]');
        if (status) status.textContent = 'Google is used only to identify your account. Your existing local drafts are not uploaded.';
      } catch {
        showError('Sign-in is temporarily unavailable. You can keep writing without an account.');
      }
      return;
    }

    const name = account.user.name || account.user.email || 'Write Urdu account';
    const nameNode = document.querySelector('[data-account-page-name]');
    const emailNode = document.querySelector('[data-account-page-email]');
    const avatarNode = document.querySelector('[data-account-page-avatar]');
    if (nameNode) nameNode.textContent = name;
    if (emailNode) {
      emailNode.textContent = account.user.email;
      emailNode.hidden = !account.user.email;
    }
    if (avatarNode) avatarNode.textContent = name.charAt(0).toUpperCase() || '?';
    show(signedIn);
    try {
      await prepareCsrf(signoutForm);
    } catch {
      // Signed-in navigation remains usable while sign-out is temporarily unavailable.
    }
  } catch {
    hide(loading);
    show(disabled);
    showError('Account services are temporarily unavailable. You can keep using Write Urdu without an account.');
  }
}

googleForm?.addEventListener('submit', () => {
  flushLocalWriting(window);
  const button = googleForm.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  const status = document.querySelector('[data-sign-in-status]');
  if (status) status.textContent = 'Leaving for Google sign-in. Writing saved on this device stays here.';
});

void start();
