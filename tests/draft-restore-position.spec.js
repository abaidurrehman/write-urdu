const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$)|localhost)/, route => route.abort());

const editors = [
  ['Basic Writer', '/', 'basic', '#demo'],
  ['Rich Editor', '/urdu-editor', 'rich', '.tox-tinymce, #basic-example'],
  ['Urdu Keyboard', '/urdu-keyboard', 'keyboard', '#write']
];

for (const [label, url, kind, editorSelector] of editors) {
  test(`${label}: saved-draft Restore line sits above the editor`, async ({ page }) => {
    await blockExternal(page);
    await page.addInitScript(([key]) => {
      try {
        localStorage.setItem(key, JSON.stringify({ content: '<p>میرا مسودہ</p>', text: 'میرا مسودہ', savedAt: Date.now() }));
      } catch (error) { /* storage unavailable */ }
    }, ['write-urdu:draft:v1:' + kind]);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const recovery = page.locator('[data-draft-recovery]');
    await expect(recovery).toBeVisible();
    const restoreTop = (await recovery.boundingBox()).y;
    const editorTop = await page.evaluate(sel => {
      const el = Array.from(document.querySelectorAll(sel)).find(node => node.offsetParent !== null);
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    }, editorSelector);
    expect(editorTop).not.toBeNull();
    expect(restoreTop).toBeLessThan(editorTop);
    // Inside the first viewport, so a returning visitor does not have to scroll.
    expect(restoreTop).toBeLessThan(page.viewportSize().height);
    await recovery.locator('[data-action="discard-draft"]').click();
    await expect(recovery).toBeHidden();
  });
}
