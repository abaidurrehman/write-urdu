const fs = require('fs');
const { test, expect } = require('@playwright/test');
const core = require('../js/wedding-project-core.js');
const wording = require('../js/wedding-wording-registry.js');
const adapter = require('../js/wedding-invitation-render-adapter.js');
const fixtureSet = require('./fixtures/wu-shaadi-001/wedding-projects.v1.json');

// Real-browser follow-up to tests/wedding-invitation-render-adapter.test.js (which proves the
// adapter/layout pipeline structurally in Node, with a mocked canvas). This spec proves the
// same pipeline through an actual Chromium canvas, on the current, unmodified Card Studio page:
// real Nastaliq/Naskh font shaping, real pixel painting, and a real PNG export -- none of which
// a mocked measureText can demonstrate.

function fixtureById(id) {
  const fixture = fixtureSet.cases.find((candidate) => candidate.id === id);
  if (!fixture) throw new Error(`fixture ${id} not found`);
  return fixture;
}

function buildSeed(fixtureId, templateId, presetId) {
  const fixture = fixtureById(fixtureId);
  const project = core.normalizeWeddingProject(fixture.document);
  const event = project.events[0];
  const rendered = wording.renderWording(templateId, project, event);
  if (!rendered.complete) throw new Error(`${fixtureId}/${templateId} did not render complete`);
  const viewModel = core.buildInvitationViewModel(project, null);
  const seed = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: presetId || 'portrait' });
  return { seed, renderedText: rendered.text, direction: seed.wedding.direction };
}

const blockExternal = (page) => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort());

async function openStudioAndSeed(page, seed) {
  await page.goto('/urdu-card-studio.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('[data-card-built-in-library]')).toBeVisible();
  await page.evaluate((project) => {
    window.__renderCount = 0;
    document.addEventListener('write-urdu:card-rendered', () => { window.__renderCount += 1; });
    window.WriteUrduCardStudioApp.replaceState(project, { save: false });
  }, seed);
  await page.waitForFunction(() => window.__renderCount > 0);
}

async function nonBackgroundPixelRatio(page) {
  return page.evaluate(() => {
    const canvas = window.WriteUrduCardStudioApp.getCanvas();
    const ctx = canvas.getContext('2d');
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const bg = [data[0], data[1], data[2]];
    const strideX = Math.max(1, Math.floor(width / 200));
    const strideY = Math.max(1, Math.floor(height / 200));
    let painted = 0;
    let sampled = 0;
    for (let y = 0; y < height; y += strideY) {
      for (let x = 0; x < width; x += strideX) {
        const i = (y * width + x) * 4;
        sampled += 1;
        if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 24) painted += 1;
      }
    }
    return sampled ? painted / sampled : 0;
  });
}

const cases = [
  { fixtureId: 'formal-nikah', templateId: 'formal-nikah-ur', label: 'Urdu-only formal Nikah' },
  { fixtureId: 'bride-side-baraat', templateId: 'traditional-baraat-bilingual', label: 'bilingual mixed-script Baraat' },
  { fixtureId: 'groom-side-walima', templateId: 'groom-family-walima-en', label: 'English-only Walima' }
];

for (const { fixtureId, templateId, label } of cases) {
  test(`WU-SHAADI-001 render proof: ${label} paints correctly in the real Card Studio renderer`, async ({ page }) => {
    await blockExternal(page);
    const { seed, renderedText, direction } = buildSeed(fixtureId, templateId);
    await openStudioAndSeed(page, seed);

    // The rendered wording text reached the live app unmodified.
    const accessibleText = await page.locator('[data-accessible-card-text]').textContent();
    expect(accessibleText).toBe(renderedText);

    // Auto font-fit stayed on (the adapter never forces manual sizing), meaning the real
    // renderer's own fit logic -- not this test -- is responsible for avoiding overflow.
    const fontMode = await page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.fontMode);
    expect(fontMode).toBe('auto');

    // Seeding a wedding-shaped project into the existing studio does not break page layout.
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(pageOverflow).toBeLessThanOrEqual(1);

    // The canvas actually painted visible glyphs (not a blank/placeholder frame). This is the
    // one check the Node contract test cannot make, since it has no real font shaping engine.
    const painted = await nonBackgroundPixelRatio(page);
    expect(painted).toBeGreaterThan(0.01);

    // Direction/alignment followed the wording text, matching what the adapter computed.
    const align = await page.evaluate(() => window.WriteUrduCardStudioApp.getState().text.align);
    expect(align).toBe(direction === 'rtl' ? 'right' : 'left');
  });
}

test('WU-SHAADI-001 render proof: portrait preset export path produces a real, non-trivial PNG', async ({ page }) => {
  await blockExternal(page);
  const { seed } = buildSeed('formal-nikah', 'formal-nikah-ur', 'portrait');
  await openStudioAndSeed(page, seed);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-card-action="download"]:visible').first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);

  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const stats = fs.statSync(downloadPath);
  // A blank/placeholder PNG at this resolution would still be a few hundred bytes; a real
  // rasterized invitation card with decoration and Urdu text is comfortably larger.
  expect(stats.size).toBeGreaterThan(5000);
});
