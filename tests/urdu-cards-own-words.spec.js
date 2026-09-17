const { test, expect } = require('@playwright/test');
const cards = require('../js/urdu-cards-data.js').getAllCards();

const cardCount = cards.length;
const uniqueDesignCount = new Set(cards.map(card => card.backgroundId)).size;
const originalDua = cards.find(card => card.id === 'dua-1').textUr;
const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function openCards(page, path = '/urdu-cards') {
  await blockExternal(page);
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  await expect.poll(() => page.evaluate(() => Boolean(window.WriteUrduCardsOwnWords))).toBe(true);
}

async function openOwnWords(page) {
  const choice = page.locator('[data-urdu-cards-start-choice="own-words"]');
  await expect(choice).toHaveAttribute('href', /urdu-card-gallery/); // no-JS fallback remains intact
  await choice.click();
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-own-input]')).toBeFocused();
}

test('Use my own words opens inline and keeps the cards route', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-words] h2')).toHaveText('Use your own words');
  await expect(page.locator('[data-input-mode-control]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-start-choice="own-words"]')).toHaveAttribute('aria-expanded', 'true');
});

test('own Urdu text replaces previews and collapses duplicate backgrounds to unique designs', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'اللہ آپ کو ہمیشہ خوش رکھے اور ہر قدم پر آسانی عطا فرمائے۔';
  await page.locator('[data-urdu-cards-own-input]').fill(custom);

  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(uniqueDesignCount);
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${uniqueDesignCount} designs`);
  await expect(page.locator('[data-urdu-cards-filters]')).toBeHidden();
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(custom);
  await expect(page.locator('#card-dua-1 [data-urdu-cards-share]')).toBeHidden();
  await expect(page.locator('#card-dua-1 [data-urdu-cards-favorite]')).toBeHidden();

  const state = await page.evaluate(() => window.WriteUrduCardsOwnWords.getState());
  expect(state).toMatchObject({ active: true, composerOpen: true, designCount: uniqueDesignCount, textLength: custom.length });
});

test('existing image share and personalization actions receive the custom text', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'میری پیاری امی، اللہ آپ کو ہمیشہ سلامت اور خوش رکھے۔';
  await page.evaluate(() => {
    window.__ownWordsSharedText = null;
    window.WriteUrduWhatsAppStatusShare = {
      shareCard: async () => ({ result: 'shared' }),
      shareImage: async card => {
        window.__ownWordsSharedText = card.textUr;
        return { result: 'shared', width: 720, height: 900 };
      }
    };
  });
  await page.locator('[data-urdu-cards-own-input]').fill(custom);

  await page.locator('[data-urdu-cards-image-share="dua-1"]').click();
  await expect.poll(() => page.evaluate(() => window.__ownWordsSharedText)).toBe(custom);

  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-personalizer-text="dua-1"]')).toHaveValue(custom);
});

test('clearing or leaving own-words mode restores the complete ready-made gallery', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  await page.locator('[data-urdu-cards-own-input]').fill('یہ میرا اپنا پیغام ہے۔');
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(uniqueDesignCount);

  await page.locator('[data-urdu-cards-own-clear]').click();
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(cardCount);
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${cardCount} cards`);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(originalDua);
  await expect(page.locator('[data-urdu-cards-filters]')).toBeVisible();
  expect(await page.evaluate(() => window.WriteUrduCardsOwnWords.getState().active)).toBe(false);

  await page.locator('[data-urdu-cards-own-back]').click();
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeHidden();
  await expect(page).toHaveURL(/\/urdu-cards$/);
});

test('custom Urdu text is never persisted in browser storage by the cards journey', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'نجی پیغام ۹۸۷۶۵ صرف اسی ٹیسٹ کے لیے';
  await page.evaluate(() => {
    window.WriteUrduWhatsAppStatusShare = {
      shareCard: async () => ({ result: 'shared' }),
      shareImage: async () => ({ result: 'shared', width: 720, height: 900 })
    };
  });
  await page.locator('[data-urdu-cards-own-input]').fill(custom);
  await page.locator('[data-urdu-cards-image-share="dua-1"]').click();

  const storage = await page.evaluate(() => {
    const values = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      values[key] = localStorage.getItem(key);
    }
    return values;
  });
  expect(JSON.stringify(storage)).not.toContain(custom);
  expect(storage['writeUrdu.urduCardsRecents.v1']).toContain('dua-1');
});

test('own-words input reuses the existing Roman Urdu transliteration adapter', async ({ page }) => {
  await openCards(page);
  await page.evaluate(() => {
    window.__transliterationTargets = [];
    window.google = {
      load: () => {},
      setOnLoadCallback: callback => callback(),
      elements: {
        transliteration: {
          LanguageCode: { ENGLISH: 'en', URDU: 'ur' },
          TransliterationControl: function () {
            this.makeTransliteratable = ids => { window.__transliterationTargets = ids.slice(); };
            this.enableTransliteration = () => {};
            this.disableTransliteration = () => {};
          }
        }
      }
    };
  });

  await openOwnWords(page);
  await expect.poll(() => page.evaluate(() => window.__transliterationTargets)).toContain('urduCardsOwnText');
  await expect(page.locator('[data-input-mode-control]')).toHaveAttribute('data-input-mode', 'roman');

  await page.locator('[data-input-mode-option="direct"]').click();
  await expect(page.locator('[data-input-mode-control]')).toHaveAttribute('data-input-mode', 'direct');
  await page.locator('[data-urdu-cards-own-input]').fill('اردو براہ راست بھی کام کرتی ہے۔');
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('اردو براہ راست بھی کام کرتی ہے۔');
});

test('Urdu locale keeps the inline own-words journey localized', async ({ page }) => {
  await openCards(page, '/urdu/urdu-cards');
  await openOwnWords(page);

  await expect(page).toHaveURL(/\/urdu\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-words] h2')).toHaveText('اپنا پیغام استعمال کریں');
  await expect(page.locator('[data-urdu-cards-own-back]')).toHaveText('تیار شدہ کارڈز پر واپس جائیں');
  await page.locator('[data-urdu-cards-own-input]').fill('آپ ہمیشہ خوش رہیں۔');
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${uniqueDesignCount} ڈیزائنز`);
});
