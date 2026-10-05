const { test, expect } = require('@playwright/test');

async function openConverter(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: value => { window.__copiedRomanOutput = value; return Promise.resolve(); } }
    });
  });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?\/)/, route => {
    return route.abort();
  });
  await page.route('https://inputtools.google.com/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(['SUCCESS', [['mera khayal hai', ['میرا خیال ہے']]]])
  }));
  await page.goto('/roman-urdu-transliteration', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-roman-urdu-converter]')).toBeVisible();
}

test('Roman converter completes, copies and hands reviewed Urdu to the basic writer', async ({ page }) => {
  await openConverter(page);
  await page.evaluate(() => {
    window.__romanEvents = [];
    window.WriteUrduTelemetry = {
      track: (name, detail) => window.__romanEvents.push({ name, detail }),
      flush: () => {}
    };
  });

  await page.locator('[data-roman-source]').fill('mera khayal hai');
  await page.locator('[data-roman-convert]').click();
  await expect(page.locator('[data-roman-output]')).toHaveValue('میرا خیال ہے');
  await expect(page.locator('[data-roman-status]')).toContainText('Converted');

  await page.locator('[data-roman-copy]').click();
  await expect.poll(() => page.evaluate(() => window.__copiedRomanOutput)).toBe('میرا خیال ہے');
  const events = await page.evaluate(() => window.__romanEvents);
  expect(events.map(event => event.name)).toContain('roman_conversion_completed');
  expect(JSON.stringify(events)).not.toContain('mera khayal hai');
  expect(JSON.stringify(events)).not.toContain('میرا خیال ہے');

  await page.locator('[data-roman-continue]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#transliterateTextarea')).toHaveValue(/میرا خیال ہے/);
});

test('Roman conversion task begins in the first mobile viewport and precedes article guidance', async ({ page }) => {
  await openConverter(page);
  const layout = await page.evaluate(() => {
    const task = document.querySelector('[data-roman-urdu-converter]').getBoundingClientRect();
    const guidance = document.querySelector('#what-it-does').getBoundingClientRect();
    return { taskTop: task.top, taskBottom: task.bottom, guidanceTop: guidance.top, viewport: innerHeight };
  });
  expect(layout.taskTop).toBeLessThan(layout.viewport);
  expect(layout.taskBottom).toBeLessThan(layout.guidanceTop);
  await expect(page.locator('[data-roman-source]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
