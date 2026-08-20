import {
  ACCOUNT_STATE,
  fetchAccountState,
  fetchAuthCsrfToken,
  flushLocalWriting,
  resolveAccountReturnTarget
} from './account-session.mjs';

function displayName(user) {
  return user?.name || user?.email || 'Account';
}

function profileImageUrl(user) {
  const candidate = typeof user?.image === 'string' ? user.image.trim() : '';
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function signedOutMarkup(returnTarget) {
  const href = `/sign-in?returnTo=${encodeURIComponent(returnTarget)}`;
  return `<a class="wu-account-sign-in" href="${href}" data-wu-sign-in>Sign in</a>`;
}

function signedInMarkup(returnTarget) {
  return `
    <details class="wu-account-menu">
      <summary class="wu-account-trigger" aria-label="Open account menu">
        <span class="wu-account-avatar" data-wu-account-avatar aria-hidden="true"></span>
        <span class="wu-account-label" data-wu-account-label>Account</span>
      </summary>
      <div class="wu-account-panel">
        <div class="wu-account-identity">
          <strong data-wu-account-name></strong>
          <span data-wu-account-email></span>
        </div>
        <a href="/my-documents">My Documents</a>
        <a href="/sign-in">Account</a>
        <form method="post" action="/api/auth/signout" data-wu-account-signout>
          <input type="hidden" name="csrfToken" value="">
          <input type="hidden" name="callbackUrl" value="${returnTarget}">
          <button type="submit" disabled>Sign out</button>
        </form>
      </div>
    </details>`;
}

function renderAccountAvatar(control, user, name) {
  const avatar = control.querySelector('[data-wu-account-avatar]');
  if (!avatar) return;

  const initial = name.charAt(0).toUpperCase() || '?';
  avatar.textContent = initial;

  const imageUrl = profileImageUrl(user);
  const image = imageUrl && avatar.ownerDocument?.createElement?.('img');
  if (!image) return;

  image.src = imageUrl;
  image.alt = '';
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    if (!avatar.contains(image)) return;
    avatar.textContent = initial;
    delete avatar.dataset.image;
  }, { once: true });

  avatar.replaceChildren(image);
  avatar.dataset.image = 'profile';
}

function currentReturnTarget(location) {
  return resolveAccountReturnTarget(`${location?.pathname || '/'}${location?.search || ''}${location?.hash || ''}`);
}

export function mountAccountControls({
  root = globalThis.document,
  fetchImpl = globalThis.fetch,
  location = globalThis.location,
  runtime = globalThis
} = {}) {
  const controls = [...(root?.querySelectorAll?.('[data-wu-account-control]') || [])];
  if (controls.length === 0) return () => {};

  let active = true;
  const returnTarget = currentReturnTarget(location);

  void fetchAccountState(fetchImpl).then(async (account) => {
    if (!active || account.state === ACCOUNT_STATE.DISABLED) return;

    if (account.state === ACCOUNT_STATE.SIGNED_OUT) {
      controls.forEach((control) => {
        control.innerHTML = signedOutMarkup(returnTarget);
        control.hidden = false;
        control.querySelector('[data-wu-sign-in]')?.addEventListener('click', () => {
          flushLocalWriting(runtime);
        });
      });
      return;
    }

    controls.forEach((control) => {
      control.innerHTML = signedInMarkup(returnTarget);
      const name = displayName(account.user);
      renderAccountAvatar(control, account.user, name);
      control.querySelector('[data-wu-account-label]').textContent = name;
      control.querySelector('[data-wu-account-name]').textContent = name;
      const email = control.querySelector('[data-wu-account-email]');
      email.textContent = account.user.email;
      email.hidden = !account.user.email;
      control.hidden = false;
    });

    try {
      const csrfToken = await fetchAuthCsrfToken(fetchImpl);
      if (!active) return;
      controls.forEach((control) => {
        const form = control.querySelector('[data-wu-account-signout]');
        if (!form) return;
        form.querySelector('input[name="csrfToken"]').value = csrfToken;
        form.querySelector('button').disabled = false;
      });
    } catch {
      // The account menu remains useful while sign-out is temporarily unavailable.
    }
  }).catch(() => {
    // Accounts are optional. An auth outage must not disturb the writing shell.
  });

  return () => {
    active = false;
  };
}

const unmount = mountAccountControls();
globalThis.addEventListener?.('pagehide', unmount, { once: true });
