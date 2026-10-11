const { test, expect } = require('@playwright/test');

const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

test('lesson 1 highlights the next key and the Space bar between letters', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-typing-practice', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('[data-input-mode="phonetic"]').click();

  await expect(page.locator('[data-current-description]')).toContainText('Press Space between letters');
  await expect(page.locator('.phonetic-key.is-next')).toHaveAttribute('data-key', 'a');

  await page.locator('[data-practice-entry]').click();
  await page.keyboard.press('a');
  await expect(page.locator('[data-keyboard-space]')).toHaveClass(/is-next/);
  await expect(page.locator('.phonetic-key.is-next')).toHaveCount(0);

  await page.keyboard.press('Space');
  await expect(page.locator('.phonetic-key.is-next')).toHaveAttribute('data-key', 's');
});

test('shift lesson points at Shift before the shifted key', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-typing-practice', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('[data-input-mode="phonetic"]').click();
  await page.locator('[data-lesson-id="shift-letters"]').click();
  await expect(page.locator('[data-keyboard-shift]')).toHaveClass(/is-next/);
  await page.locator('[data-keyboard-shift]').click();
  await expect(page.locator('.phonetic-key.is-next')).toHaveAttribute('data-key', 'a');
});

test('practice page explains key layout versus word-level English letters → Urdu', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-typing-practice', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const note = page.locator('[data-practice-method-note]');
  await expect(note.locator('a[href="/urdu-keyboard"]')).toBeVisible();
  await expect(note.locator('a[href="/roman-urdu-transliteration"]')).toBeVisible();
});
