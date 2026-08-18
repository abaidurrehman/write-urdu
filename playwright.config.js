const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['site.spec.js', 'sua.spec.js', 'journey.spec.js', 'outcome-navigation.spec.js', 'workspace-next-step.spec.js', 'v2-creation.spec.js', 'seo-acquisition.spec.js', 'role-journeys.spec.js', 'v3-visual-quality.spec.js', 'inpage.spec.js'],
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
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
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: true
  }
});