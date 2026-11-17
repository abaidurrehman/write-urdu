const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice K (CARD-UX-023): on the Urdu Card Studio page, every visible control label is Urdu.
// Brand and format names stay as people know them.

const ALLOWED = /^(?:PNG|JPEG|JPG|WebP|PDF|WhatsApp|Instagram|Facebook|Write-Urdu\.com|Write Urdu|WU|URL|px|%|[\d\s.,%:×x/+\-–()]+)$/i;

async function openUrduStudio(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
  await page.goto('/urdu/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioUi && document.querySelector('[data-card-action="publish"]')), null, { timeout: 15000 });
  await page.waitForTimeout(600);
}

// Latin words left after removing allowed names, for every visible control and label in the workspace.
function latinLabels(page) {
  return page.evaluate(source => {
    const allowed = new RegExp(source, 'i');
    const main = document.querySelector('main.card-studio-shell');
    const nodes = [...main.querySelectorAll('button, a[href], label, summary, legend, h2, h3, option:checked, [role="tab"], .card-studio-help, .wu-share-publish-note, .card-studio-action-group-label, .card-studio-mode-label')]
      .filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    const out = [];
    for (const node of nodes) {
      const text = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const latin = text.replace(/https?:\/\/\S+/g, '').match(/[A-Za-z][A-Za-z'’.-]*/g) || [];
      const leftover = latin.filter(word => !allowed.test(word.replace(/[.’']+$/, '')));
      if (leftover.length) out.push(text.slice(0, 60));
    }
    return [...new Set(out)];
  }, ALLOWED.source);
}

test('the Urdu Card Studio speaks Urdu on every step', async ({ page }) => {
  await openUrduStudio(page);
  const found = {};
  await page.locator('#cardText').fill('سالگرہ مبارک');
  for (const step of ['content', 'format', 'style', 'export']) {
    await page.evaluate(next => window.WriteUrduCardStudioUi.setStep(next), step);
    await page.waitForTimeout(250);
    found[step] = await latinLabels(page);
  }
  await page.evaluate(() => window.WriteUrduCardStudioUi.setMode('advanced'));
  await page.evaluate(() => window.WriteUrduCardStudioUi.setStep('style'));
  await page.waitForTimeout(250);
  found.advanced = await latinLabels(page);
  expect(found).toEqual({ content: [], format: [], style: [], export: [], advanced: [] });
});

test('the publish question is in Urdu on the Urdu page', async ({ page }) => {
  await openUrduStudio(page);
  await page.locator('#cardText').fill('عید مبارک');
  await page.locator('[data-card-action="publish"]').first().click();
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  const text = await dialog.innerText();
  const latin = (text.replace(/https?:\/\/\S+/g, '').match(/[A-Za-z][A-Za-z'’.-]*/g) || []).filter(word => !ALLOWED.test(word));
  expect(latin).toEqual([]);
});

test('switching language relabels the workspace without a reload', async ({ page }) => {
  await openUrduStudio(page);
  await expect(page.locator('[data-card-ui-action="undo"]').first()).toHaveText('واپس');
  await page.evaluate(() => window.WriteUrduLocale && window.WriteUrduLocale.set && window.WriteUrduLocale.set('en'));
  await expect(page.locator('[data-card-ui-action="undo"]').first()).toHaveText('Undo');
});
