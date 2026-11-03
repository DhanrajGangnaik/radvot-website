import { defineConfig } from '@playwright/test';

const port=process.env.PLAYWRIGHT_PORT || '4173';
const baseURL=`http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: { baseURL, channel: 'chrome', headless: true },
  webServer: { command: `npm run preview -- --port ${port}`, url: baseURL, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
