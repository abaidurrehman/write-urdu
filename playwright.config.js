const { defineConfig, devices } = require('@playwright/test');
const testPort = process.env.WRITE_URDU_TEST_PORT || '8765';
const testBaseUrl = `http://127.0.0.1:${testPort}`;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: [
    'sua.spec.js',
    'journey.spec.js',
    'outcome-navigation.spec.js',
    'workspace-next-step.spec.js',
    'core-workspace-convergence.spec.js',
    'capture-continuity.spec.js',
    'create-publish-boundaries.spec.js',
    'v2-creation.spec.js',
    'card-studio-background-collection.spec.js',
    'card-gallery.spec.js',
    'urdu-cards.spec.js',
    'urdu-cards-own-words.spec.js',
    'urdu-cards-social-formats.spec.js',
    'home-featured-card.spec.js',
    'whatsapp-status-discovery.spec.js',
    'seo-acquisition.spec.js',
    'role-journeys.spec.js',
    'sitemap-directory.spec.js',
    'account-documents-editors.spec.js',
    'voice-mobile-acceptance.spec.js',
    'writer-voice-input.spec.js',
    'mobile-editor-activation.spec.js',
    'rich-editor-mobile-activation.spec.js',
    'urdu-locale.spec.js',
    'v3-visual-quality.spec.js',
    'inpage.spec.js',
    'wedding-invitation-render-adapter.spec.js',
    'urdu-wedding-invitation-maker.spec.js'
  ],
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: testBaseUrl,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } }
  ],
  webServer: {
    command: 'node tests/server.js',
    url: testBaseUrl,
    env: { ...process.env, PORT: testPort },
    reuseExistingServer: true
  }
});