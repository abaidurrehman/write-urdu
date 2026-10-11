const { test, expect } = require('@playwright/test');

// WU-UXR-002 Slice D: the credit line is legible and inside the artwork-free area, and designer backgrounds carry no
// template accent, frame or motif (CARD-UX-006, CARD-UX-007).
const author = 'فیض احمد فیض';
const presets = ['square', 'portrait', 'story'];

async function openStudio(page, path) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());
  await page.goto(path || '/urdu-card-studio', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.WriteUrduCardStudioApp && window.WriteUrduCardStudioBackgroundLibrary && window.WriteUrduCardBackgroundRegistry), null, { timeout: 15000 });
}

// A sample of the registry: every poetry design plus a spread of the rest.
const sampleIds = page => page.evaluate(() => {
  const all = window.WriteUrduCardBackgroundRegistry.getAllBackgrounds();
  const poetry = all.filter(item => item.category === 'poetry');
  const rest = all.filter(item => item.category !== 'poetry');
  const step = Math.max(1, Math.floor(rest.length / 8));
  return poetry.concat(rest.filter((item, index) => index % step === 0).slice(0, 8)).map(item => item.id);
});

const render = page => page.evaluate(() => new Promise(resolve => {
  document.addEventListener('write-urdu:card-rendered', () => resolve(), { once: true });
  window.WriteUrduCardStudioApp.requestRender();
}));

test('credit line is inside the safe area and readable on every sampled designer background', async ({ page }) => {
  test.setTimeout(240000);
  await openStudio(page);
  const ids = await sampleIds(page);
  expect(ids.length).toBeGreaterThanOrEqual(12);
  const failures = [];
  for (const id of ids) {
    for (const presetId of presets) {
      await page.evaluate(value => { const select = document.getElementById('cardPreset'); select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); }, presetId);
      await page.evaluate(value => window.WriteUrduCardStudioApp.updateObjectText('text', value), 'صبح بخیر');
      await page.evaluate(async backgroundId => { await window.WriteUrduCardStudioBackgroundLibrary.applyById(backgroundId); }, id);
      // Without the credit first: this is the picture under it.
      await page.evaluate(() => { const s = window.WriteUrduCardStudioApp.getState(); s.attribution.enabled = false; s.attribution.value = ''; });
      await render(page);
      const result = await page.evaluate(({ backgroundId, name }) => {
        const app = window.WriteUrduCardStudioApp;
        const state = app.getState();
        const background = window.WriteUrduCardBackgroundRegistry.getBackgroundById(backgroundId);
        const canvas = app.getCanvas();
        const ctx = canvas.getContext('2d');
        // Read the picture under the credit once the credit is switched on.
        const field = document.getElementById('cardAttribution');
        field.value = name;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        const rect = app.getObjectRect('attribution');
        const safe = background.safeArea;
        const insidePx = {
          left: rect.x >= safe.left * canvas.width - 1,
          right: rect.x + rect.width <= (1 - safe.right) * canvas.width + 1,
          bottom: rect.y + rect.height <= (1 - safe.bottom) * canvas.height + 1,
          top: rect.y >= safe.top * canvas.height - 1
        };
        const data = ctx.getImageData(Math.round(rect.x), Math.round(rect.y), Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height))).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1; }
        return { enabled: state.attribution.enabled, color: state.attribution.color, font: state.attribution.fontFamily, ratio: state.attribution.fontSizeRatio, mainFont: state.text.fontFamily, under: [r / n, g / n, b / n], inside: insidePx };
      }, { backgroundId: id, name: author });
      const label = id + ' @ ' + presetId;
      if (!result.enabled) failures.push(label + ' typing an author did not switch the credit on');
      if (!Object.values(result.inside).every(Boolean)) failures.push(label + ' credit outside safe area ' + JSON.stringify(result.inside));
      if (result.ratio < 0.5) failures.push(label + ' credit too small (' + result.ratio + ')');
      if (result.mainFont === 'Noto Nastaliq Urdu' && result.font !== 'Noto Nastaliq Urdu') failures.push(label + ' credit font ' + result.font);
      const ratio = await page.evaluate(({ color, under }) => {
        const parse = value => { const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(value).trim()); if (!m) return null; const n = parseInt(m[1], 16); return { c: [(n >> 16) & 255, (n >> 8) & 255, n & 255], a: m[2] ? parseInt(m[2], 16) / 255 : 1 }; };
        const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
        const fg = parse(color); if (!fg) return 0;
        const blended = fg.c.map((v, i) => v * fg.a + under[i] * (1 - fg.a));
        const a = lum(blended), b = lum(under);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      }, { color: result.color, under: result.under });
      if (ratio < 4.5) failures.push(label + ' contrast ' + ratio.toFixed(2) + ' (' + result.color + ')');
    }
  }
  expect(failures, failures.join('\n')).toEqual([]);
});

test('designer backgrounds carry no template motif, frame or accent', async ({ page }) => {
  await openStudio(page);
  const counts = () => page.evaluate(() => new Promise(resolve => {
    const ctx = window.WriteUrduCardStudioApp.getCanvas().getContext('2d');
    const names = ['arc', 'ellipse', 'strokeRect', 'stroke', 'bezierCurveTo', 'createRadialGradient'];
    const hits = {}; const originals = {};
    names.forEach(name => { hits[name] = 0; originals[name] = ctx[name]; ctx[name] = function () { hits[name] += 1; return originals[name].apply(this, arguments); }; });
    document.addEventListener('write-urdu:card-rendered', () => { names.forEach(name => { ctx[name] = originals[name]; }); resolve(hits); }, { once: true });
    window.WriteUrduCardStudioApp.requestRender();
  }));
  const total = hits => Object.values(hits).reduce((sum, value) => sum + value, 0);

  // Control: a solid card keeps its template decoration.
  await page.evaluate(() => document.querySelector('[data-card-template="midnight"]').click());
  expect(total(await counts()), 'solid cards keep the template decoration').toBeGreaterThan(0);

  const ids = await sampleIds(page);
  for (const id of ids.slice(0, 4)) {
    await page.evaluate(async backgroundId => { await window.WriteUrduCardStudioBackgroundLibrary.applyById(backgroundId); }, id);
    expect(total(await counts()), id + ' draws no motif, frame or accent').toBe(0);
  }
});

test('typing an author switches the credit on, and unticking it stays off', async ({ page }) => {
  await openStudio(page);
  const box = page.locator('[data-card-field="attribution.enabled"]').first();
  await expect(box).not.toBeChecked();
  await page.locator('#cardAttribution').fill('احمد فراز');
  await expect(box).toBeChecked();
  await box.uncheck();
  await page.locator('#cardAttribution').fill('احمد فراز ؒ');
  await expect(box).not.toBeChecked();
});

for (const path of ['/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker']) {
  test('the author field is visible on ' + path, async ({ page }) => {
    await openStudio(page, path);
    const field = page.locator('#cardAttribution');
    await expect(field).toBeVisible();
    await expect(page.locator('label[for="cardAttribution"]')).toContainText('Poet / author (optional)');
  });
}
