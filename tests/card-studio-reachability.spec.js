const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice E: reachability (CARD-UX-001 step bar, 009, 024, 025, 038).
// Plus the 7-day Product Pulse rider: one Download click counts as one export attempt.

async function openStudio(page, options = {}) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
  if (options.incoming) {
    await page.addInitScript(incoming => {
      if (sessionStorage.getItem('reachability-seeded')) return;
      sessionStorage.setItem('reachability-seeded', '1');
      sessionStorage.setItem('writeUrdu.cardStudio.incoming', JSON.stringify({ version: 1, text: 'میرا نام', source: incoming, createdAt: new Date().toISOString() }));
    }, options.incoming);
  }
  await page.goto(options.path || '/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioUi && document.querySelector('[data-card-built-in-library]')), null, { timeout: 15000 });
  await page.waitForTimeout(300);
}

const visibleWrongPanels = page => page.evaluate(() => {
  const active = document.querySelector('[data-card-studio]').dataset.cardActiveStep;
  return [...document.querySelectorAll('[data-card-step-panel]')]
    .filter(panel => panel.dataset.cardStep !== active && !panel.hidden && panel.getClientRects().length > 0)
    .map(panel => panel.className);
});

test('on load only the active step is shown, so the background collection waits for Format', async ({ page }) => {
  await openStudio(page);
  expect(await page.locator('[data-card-studio]').getAttribute('data-card-active-step')).toBe('content');
  expect(await visibleWrongPanels(page)).toEqual([]);
  await expect(page.locator('[data-card-built-in-library]')).toBeHidden();
  // The Content step leads with the text box: the only controls before it are the "Start here" cue and the
  // shared input-mode choice (English letters / Voice / Type Urdu directly) that every writer shows above its field.
  const before = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('[data-card-step-panel][data-card-step="content"]')].find(node => !node.hidden);
    const controls = [...panel.querySelectorAll('textarea, input, select, button, a[href]')].filter(node => node.getClientRects().length > 0);
    const index = controls.findIndex(node => node.id === 'cardText');
    return index < 0 ? null : controls.slice(0, index).filter(node => !node.matches('[data-card-empty-cue-dismiss], .input-mode-option')).map(node => node.outerHTML.slice(0, 80));
  });
  expect(before).toEqual([]);
});

test('the background collection still appears on the Format step', async ({ page, isMobile }) => {
  await openStudio(page);
  await page.locator('#cardText').fill('میرا نام');
  const format = isMobile ? '[data-card-mobile-stepbar] [data-card-step="format"]' : '.card-studio-stepper [data-card-step="format"]';
  await page.locator(format).click();
  await expect(page.locator('[data-card-built-in-library]')).toBeVisible();
  expect(await visibleWrongPanels(page)).toEqual([]);
});

test.describe('phones', () => {
  test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'phone layout'));

  test('tapping Content in the step bar takes the writer to the text box', async ({ page }) => {
    await openStudio(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.locator('[data-card-mobile-stepbar] [data-card-step="content"]').tap();
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => {
      const rect = document.querySelector('#cardText').getBoundingClientRect();
      const bar = document.querySelector('[data-card-mobile-stepbar]').getBoundingClientRect();
      return { scrollY: window.scrollY, top: rect.top, bottom: rect.bottom, barTop: bar.top, focused: document.activeElement && document.activeElement.id };
    });
    expect(after.scrollY, 'the page scrolled').toBeGreaterThan(before);
    expect(after.top, 'field top on screen').toBeGreaterThanOrEqual(0);
    expect(after.top, 'field top above the step bar').toBeLessThan(after.barTop);
    expect(after.focused).toBe('cardText');
  });

  test('tapping Format scrolls to the format choices', async ({ page }) => {
    await openStudio(page);
    await page.locator('#cardText').fill('میرا نام');
    await page.locator('[data-card-mobile-stepbar] [data-card-step="format"]').tap();
    await page.waitForTimeout(900);
    const top = await page.evaluate(() => {
      const panel = [...document.querySelectorAll('[data-card-step-panel][data-card-step="format"]')].find(node => !node.hidden && node.getClientRects().length);
      return panel.getBoundingClientRect().top;
    });
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(await page.evaluate(() => window.innerHeight / 2));
  });

  for (const width of [360, 375, 393]) {
    test(`nothing spills off a ${width} px screen and toolbar labels are whole`, async ({ page }) => {
      await page.setViewportSize({ width, height: 780 });
      await openStudio(page);
      const result = await page.evaluate(() => {
        const vw = window.innerWidth;
        const main = document.querySelector('main.card-studio-shell');
        const clips = node => { for (let n = node.parentElement; n && n !== main; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o !== 'visible') return true; } return false; };
        const spill = [...main.querySelectorAll('*')].filter(node => {
          const rect = node.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2 || getComputedStyle(node).position === 'fixed') return false;
          return (rect.right > vw + 1 || rect.left < -1) && !clips(node);
        }).map(node => node.tagName + '.' + String(node.className).split(' ')[0]);
        const canvas = document.querySelector('.card-studio-canvas').getBoundingClientRect();
        const truncated = [...document.querySelectorAll('.card-studio-top-actions .card-studio-button, .card-studio-stepper button')]
          .filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 1)
          .map(node => node.textContent.trim());
        return { scrollWidth: document.documentElement.scrollWidth, vw, spill, canvasLeft: canvas.left, canvasRight: canvas.right, truncated };
      });
      expect(result.scrollWidth).toBe(result.vw);
      expect(result.canvasLeft).toBeGreaterThanOrEqual(0);
      expect(result.canvasRight).toBeLessThanOrEqual(result.vw);
      expect(result.spill).toEqual([]);
      expect(result.truncated).toEqual([]);
    });
  }
});

test.describe('desktop', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'desktop layout'));

  test('a skip link reaches the text box within 15 Tab presses', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStudio(page);
    let tabs = 0;
    for (; tabs < 15; tabs += 1) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => ({ id: document.activeElement && document.activeElement.id, skip: Boolean(document.activeElement && document.activeElement.matches('.card-studio-skip')) }));
      if (state.id === 'cardText') break;
      if (state.skip) {
        await expect(page.locator('.card-studio-skip')).toBeInViewport();
        await page.keyboard.press('Enter');
        break;
      }
    }
    expect(tabs).toBeLessThan(15);
    await expect(page.locator('#cardText')).toBeFocused();
    await expect(page.locator('#cardText')).toBeInViewport();
    expect(new URL(page.url()).hash).toBe('');
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }]) {
    test(`the whole card is visible next to the text box at ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openStudio(page);
      await page.locator('.card-studio-stepper [data-card-step="content"]').click();
      await page.waitForTimeout(900);
      const rects = await page.evaluate(() => {
        const canvas = document.querySelector('.card-studio-canvas').getBoundingClientRect();
        const text = document.querySelector('#cardText').getBoundingClientRect();
        return { top: canvas.top, bottom: canvas.bottom, textTop: text.top, textBottom: text.bottom, height: window.innerHeight };
      });
      expect(rects.top).toBeGreaterThanOrEqual(0);
      expect(rects.bottom).toBeLessThanOrEqual(rects.height);
      expect(rects.textTop).toBeGreaterThanOrEqual(0);
      expect(rects.textBottom).toBeLessThanOrEqual(rects.height);
    });
  }
});

test('Back to your writing appears only when the text came from a writer, and returns there', async ({ page }) => {
  await openStudio(page);
  await expect(page.locator('[data-card-action="back"]')).toBeHidden();

  const fromCards = await page.context().newPage();
  await openStudio(fromCards, { incoming: 'urdu-cards' });
  await expect(fromCards.locator('[data-card-action="back"]')).toBeHidden();
  await fromCards.close();

  const fromRich = await page.context().newPage();
  await openStudio(fromRich, { incoming: 'rich-editor' });
  const back = fromRich.locator('[data-card-action="back"]');
  await expect(back).toBeVisible();
  await expect(back).toHaveText('Back to your writing');
  await Promise.all([fromRich.waitForURL(url => new URL(url).pathname === '/urdu-editor', { timeout: 15000 }), back.click()]);
  await fromRich.close();
});

test('one Download click is counted as one export attempt', async ({ page }) => {
  const events = [];
  await page.route('**/api/events', async route => {
    const body = route.request().postDataJSON();
    for (const event of (body && body.events) || []) events.push(event);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await openStudio(page);
  await page.locator('[data-card-content-action="sample"]').click();
  const download = page.waitForEvent('download', { timeout: 15000 });
  await page.locator('.card-studio-top-actions [data-card-action="download"]').click();
  await download;
  for (let i = 0; i < 5; i += 1) await page.evaluate(() => window.WriteUrduTelemetry && window.WriteUrduTelemetry.flush(false));
  await page.waitForTimeout(500);
  const attempts = events.filter(event => event.event_name === 'card_studio_export_attempted');
  expect(attempts.length).toBe(1);
});
