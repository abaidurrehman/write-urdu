const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice A (CARD-UX-003): a phone number typed after Urdu text must be drawn on the card
// in typed order (0300-1234567), not reversed (1234567-0300).
// The notice from the audit (P5): several lines, so auto-fit keeps "رابطہ: 0300-1234567" on one line.
const TEXT = 'اعلانِ عام\nمحلہ کمیٹی کا ماہانہ اجلاس\nبروز اتوار، 19 اکتوبر 2026، شام 5 بجے\nبمقام: جامع مسجد ہال، گلشن اقبال\nرابطہ: 0300-1234567';

test.beforeEach(async ({ page }) => {
  // Record every string drawn on the card canvas with the font and direction it was drawn in.
  await page.addInitScript(() => {
    window.__cardDraws = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      if (this.canvas && this.canvas.id === 'cardCanvas') window.__cardDraws.push({ text: String(text), font: this.font, direction: this.direction });
      return fillText.call(this, text, ...rest);
    };
  });
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
});

// Redraw a recorded line on an offscreen canvas and find where a run of digits sits, by swapping
// those digits for "8"s (same width in tabular digits) and taking the centre of the changed pixels.
const runCentre = (page, draw, run) => page.evaluate(({ draw, run }) => {
  const width = 2400, height = 260;
  const render = text => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.font = draw.font; ctx.direction = draw.direction; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000';
    ctx.fillText(text, width - 20, height / 2);
    return ctx.getImageData(0, 0, width, height).data;
  };
  const base = render(draw.text);
  const swapped = render(draw.text.replace(run, run.replace(/[0-9]/g, '8')));
  let sum = 0, count = 0;
  for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) {
    const i = (y * width + x) * 4 + 3;
    if (Math.abs(base[i] - swapped[i]) > 60) { sum += x; count++; }
  }
  return count ? sum / count : null;
}, { draw, run });

test('a phone number after Urdu text is drawn in typed order', async ({ page }) => {
  await page.goto('/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp), null, { timeout: 15000 });
  await page.locator('[data-input-mode-option="direct"]').first().evaluate(node => node.click());
  await page.evaluate(() => { window.__cardDraws = []; });
  const rendered = page.evaluate(() => new Promise(resolve => document.addEventListener('write-urdu:card-rendered', resolve, { once: true })));
  await page.locator('#cardText').fill(TEXT);
  await page.locator('#cardText').dispatchEvent('input');
  await rendered;
  await page.evaluate(() => document.fonts.ready);

  // The defect needs Urdu letters and the number on the same drawn line.
  const draw = await page.evaluate(() => window.__cardDraws.filter(d => d.text.replace(/[\u2066\u2069]/g, '').includes('رابطہ: 0300-1234567')).pop());
  expect(draw, 'the line "رابطہ: 0300-1234567" was drawn on the card').toBeTruthy();
  expect(draw.direction).toBe('rtl');

  const first = await runCentre(page, draw, '0300');
  const second = await runCentre(page, draw, '1234567');
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(first, '"0300" must be drawn left of "1234567"').toBeLessThan(second);

  // Render-only: the typed text is stored and announced unchanged.
  const stored = await page.evaluate(() => ({ value: window.WriteUrduCardStudioApp.getState().text.value, announced: document.querySelector('[data-accessible-card-text]').textContent }));
  expect(stored).toEqual({ value: TEXT, announced: TEXT });
});
