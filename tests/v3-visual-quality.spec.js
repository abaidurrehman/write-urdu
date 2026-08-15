const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const routes = [
  { slug: 'home', path: '/', primary: ['#transliterateTextarea', '#demo', '.home-actions'] },
  { slug: 'keyboard', path: '/urdu-keyboard', primary: ['textarea', '.keyboard', '.keyboard-container', 'main'] },
  { slug: 'rich-editor', path: '/urdu-editor', primary: ['.tox-tinymce', '#mytextarea', 'textarea', 'main'] },
  { slug: 'card-studio', path: '/urdu-card-studio', primary: ['[data-card-studio]', '.card-studio-workspace', 'canvas', 'main'] },
  { slug: 'invoice', path: '/urdu-invoice-generator', primary: ['[data-invoice-generator]', '.invoice-workspace', 'main'] },
  { slug: 'guide', path: '/roman-urdu-transliteration', primary: ['main'] },
  { slug: 'documentation', path: '/write-urdu-documentation', primary: ['main'] },
  { slug: 'about', path: '/why-write-urdu', primary: ['main'] },
  { slug: 'privacy', path: '/write-urdu-privacy', primary: ['main'] },
  { slug: 'feedback', path: '/write-urdu-feedback', primary: ['main'] },
  { slug: 'search', path: '/write-urdu-search', primary: ['main'] }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'laptop', width: 1280, height: 720 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 }
];

const auditDir = path.resolve(__dirname, '..', 'visual-audit');

async function firstVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count() && await locator.isVisible().catch(() => false)) {
      return { selector, locator };
    }
  }
  return null;
}

async function boxIfPresent(locator) {
  if (!await locator.count()) return null;
  if (!await locator.isVisible().catch(() => false)) return null;
  return locator.boundingBox().catch(() => null);
}

async function captureMetrics(page, route, viewport) {
  const primary = await firstVisible(page, route.primary);
  const primaryBox = primary ? await boxIfPresent(primary.locator) : null;
  const headerBox = await boxIfPresent(page.locator('.wu-site-header').first());
  const mainBox = await boxIfPresent(page.locator('main').first());
  const h1Box = await boxIfPresent(page.locator('h1').first());
  const journeyBox = await boxIfPresent(page.locator('[data-wu-journey-panel]').first());
  const adBox = await boxIfPresent(page.locator('.wu-write-ad, .wu-ad-region, .wu-header-ad').first());

  return page.evaluate(({ viewport, primarySelector, primaryBox, headerBox, mainBox, h1Box, journeyBox, adBox }) => {
    const root = document.documentElement;
    const bodyStyle = getComputedStyle(document.body);
    const urduSample = document.querySelector('[lang="ur"], [dir="rtl"]');
    const urduStyle = urduSample ? getComputedStyle(urduSample) : null;
    const visibleAds = [...document.querySelectorAll('.adsbygoogle, [data-wu-ad-slot]')].filter(node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }).length;

    return {
      viewport,
      documentWidth: root.scrollWidth,
      viewportWidth: root.clientWidth,
      horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
      documentHeight: root.scrollHeight,
      bodyFontSize: parseFloat(bodyStyle.fontSize),
      headerHeight: headerBox ? Math.round(headerBox.height) : null,
      mainTop: mainBox ? Math.round(mainBox.y) : null,
      h1Top: h1Box ? Math.round(h1Box.y) : null,
      primarySelector,
      primaryTop: primaryBox ? Math.round(primaryBox.y) : null,
      primaryHeight: primaryBox ? Math.round(primaryBox.height) : null,
      primaryBottom: primaryBox ? Math.round(primaryBox.y + primaryBox.height) : null,
      primaryVisibleInInitialViewport: primaryBox ? primaryBox.y < viewport.height : null,
      primaryStartsBeforeFoldRatio: primaryBox ? Number((primaryBox.y / viewport.height).toFixed(3)) : null,
      journeyTop: journeyBox ? Math.round(journeyBox.y) : null,
      adTop: adBox ? Math.round(adBox.y) : null,
      visibleAds,
      urduDirection: urduStyle ? urduStyle.direction : null,
      urduFontFamily: urduStyle ? urduStyle.fontFamily : null
    };
  }, {
    viewport,
    primarySelector: primary ? primary.selector : null,
    primaryBox,
    headerBox,
    mainBox,
    h1Box,
    journeyBox,
    adBox
  });
}

test.describe('V3 production visual-quality audit', () => {
  test('capture representative routes across production viewports', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Single audit run controls its own viewport matrix.');
    test.setTimeout(150000);

    fs.rmSync(auditDir, { recursive: true, force: true });
    fs.mkdirSync(auditDir, { recursive: true });
    const report = {
      generatedAt: new Date().toISOString(),
      routes: [],
      criticalFailures: []
    };
    fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify(report, null, 2));

    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      page.setDefaultTimeout(2500);

      await page.route(/doubleclick|googlesyndication|google-analytics|googletagmanager|addthis|google\.com\/(?:jsapi|cse|afsonline)/, routeRequest => routeRequest.abort());

      for (const route of routes) {
        await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => null);
        await page.addStyleTag({ content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}' }).catch(() => null);
        await page.waitForTimeout(180);

        const metrics = await captureMetrics(page, route, viewport);
        const entry = { route: route.path, slug: route.slug, ...metrics };
        report.routes.push(entry);

        if (metrics.horizontalOverflow > 2) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: horizontal overflow ${metrics.horizontalOverflow}px`);
        }
        if (metrics.bodyFontSize < 14) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: body font ${metrics.bodyFontSize}px`);
        }
        if (metrics.headerHeight && metrics.headerHeight > (viewport.name === 'mobile' ? 76 : 90)) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: header height ${metrics.headerHeight}px`);
        }

        /* Task-first quality gates discovered by the production screenshot pass. */
        if (route.slug === 'home' && ['laptop', 'mobile'].includes(viewport.name) && metrics.primaryStartsBeforeFoldRatio > 0.85) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: typing surface starts too low (${metrics.primaryStartsBeforeFoldRatio} of viewport)`);
        }
        if (route.slug === 'rich-editor' && ['laptop', 'mobile'].includes(viewport.name) && metrics.primaryStartsBeforeFoldRatio > 0.70) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: Rich Editor starts too low (${metrics.primaryStartsBeforeFoldRatio} of viewport)`);
        }
        if (route.slug === 'rich-editor' && metrics.h1Top !== null && metrics.primaryTop !== null && metrics.h1Top >= metrics.primaryTop) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: Rich Editor heading must remain before the editor`);
        }
        if (route.slug === 'rich-editor' && metrics.primaryBottom !== null && metrics.journeyTop !== null && metrics.journeyTop < metrics.primaryBottom - 4) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: next-step journey must remain after the authoring surface`);
        }
        if (route.slug === 'rich-editor' && metrics.primaryBottom !== null && metrics.adTop !== null && metrics.adTop < metrics.primaryBottom - 4) {
          report.criticalFailures.push(`${viewport.name} ${route.path}: advertisement must remain after the authoring surface`);
        }

        await page.screenshot({
          path: path.join(auditDir, `${viewport.name}-${route.slug}.png`),
          fullPage: true,
          animations: 'disabled',
          timeout: 8000
        });
        fs.writeFileSync(path.join(auditDir, 'report.json'), JSON.stringify(report, null, 2));
      }

      await context.close();
    }

    expect(report.criticalFailures, report.criticalFailures.join('\n')).toEqual([]);
  });
});
