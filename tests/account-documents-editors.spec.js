const { test, expect } = require('@playwright/test');

const signedInUser = {
  available: true,
  authenticated: true,
  user: { id: 'user-doc-d', name: 'DOC D User', email: 'docd@example.test', image: '' }
};

async function mockAccount(page, onWrite) {
  await page.route('**/api/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(signedInUser)
  }));
  await page.route('**/api/documents', async route => {
    const request = route.request();
    if (request.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] })
      });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      onWrite(body);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          document: {
            id: '11111111-1111-4111-8111-111111111111',
            editorKind: body.editorKind,
            title: body.title,
            content: body.content,
            plainText: body.plainText,
            formatVersion: body.formatVersion,
            revision: 1
          }
        })
      });
    }
    return route.abort();
  });
}

async function blockExternalServices(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
}

test('Urdu Keyboard keeps local-first behavior and saves to account only after explicit opt-in', async ({ page }) => {
  const writes = [];
  await blockExternalServices(page);
  await mockAccount(page, body => writes.push(body));

  await page.goto('/urdu-keyboard', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.WriteUrduTools?.adapter?.kind === 'keyboard');

  const panel = page.locator('[data-editor-account-documents="keyboard"]');
  const save = panel.locator('[data-editor-account-save]');
  const editor = page.locator('#write');
  await expect(panel).toBeVisible();
  await expect(save).toHaveText('Save to my account');
  await expect(panel.locator('[data-editor-account-library]')).toBeVisible();
  expect(writes).toHaveLength(0);

  const urdu = 'یہ اردو کی بورڈ سے لکھی ہوئی تحریر ہے۔ ۱۲۳';
  await editor.fill(urdu);
  await page.waitForTimeout(100);
  expect(writes).toHaveLength(0);

  await save.click();
  await expect(panel.locator('[data-editor-account-status]')).toHaveText('Saved to your account');
  expect(writes).toHaveLength(1);
  expect(writes[0].editorKind).toBe('keyboard');
  expect(writes[0].content).toBe(urdu);
  expect(writes[0].plainText).toBe(urdu);
});

test('Rich Editor account save uses the shared adapter and preserves exact HTML', async ({ page }) => {
  const writes = [];
  const richHtml = '<p dir="rtl" style="text-align: right;"><strong>میری تحریر</strong> — اردو ۱۲۳</p><ul><li>پہلا نکتہ</li></ul>';
  const richText = 'میری تحریر — اردو ۱۲۳\nپہلا نکتہ';

  await blockExternalServices(page);
  await mockAccount(page, body => writes.push(body));
  await page.addInitScript(({ html, text }) => {
    document.addEventListener('DOMContentLoaded', () => {
      if (!document.querySelector('.editor-productivity')) {
        const panel = document.createElement('section');
        panel.className = 'editor-productivity';
        panel.innerHTML = '<div class="editor-productivity-main"><p class="editor-stats"></p></div>';
        document.body.appendChild(panel);
      }
      let content = html;
      let plain = text;
      let change = () => {};
      window.__docDLocalSaves = 0;
      window.WriteUrduTools = {
        adapter: {
          kind: 'rich',
          getContent: () => content,
          getText: () => plain,
          hasContent: () => Boolean(plain.trim() || content.trim()),
          setContent: value => { content = String(value || ''); change(); },
          setPlainText: value => { plain = String(value || ''); content = plain; change(); },
          onChange: callback => { change = callback; }
        },
        saveDraft: () => { window.__docDLocalSaves += 1; }
      };
    }, { once: true });
  }, { html: richHtml, text: richText });

  await page.goto('/urdu-editor', { waitUntil: 'domcontentloaded' });
  const panel = page.locator('[data-editor-account-documents="rich"]');
  const save = panel.locator('[data-editor-account-save]');
  await expect(panel).toBeVisible();
  await expect(save).toHaveText('Save to my account');
  expect(writes).toHaveLength(0);

  await save.click();
  await expect(panel.locator('[data-editor-account-status]')).toHaveText('Saved to your account');
  expect(writes).toHaveLength(1);
  expect(writes[0].editorKind).toBe('rich');
  expect(writes[0].content).toBe(richHtml);
  expect(writes[0].plainText).toBe(richText);
  expect(await page.evaluate(() => window.__docDLocalSaves)).toBeGreaterThan(0);
});
