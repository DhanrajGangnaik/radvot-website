import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('all stages, evidence, next and restart work without contacting targets', async ({ page }) => {
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (new URL(request.url()).hostname !== '127.0.0.1') externalRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/RADVOT/);
  const steps = page.locator('.steps button');
  for (let i = 0; i < 4; i++) {
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('.stage-story .eyebrow')).toContainText(`0${i + 1} /`);
    for (const detail of await page.locator('.evidence-list details').all()) {
      await detail.locator('summary').click();
      await expect(detail.locator('p')).toBeVisible();
      await expect(detail.locator('p')).toContainText('Synthetic');
      await detail.locator('summary').click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByRole('button', { name: 'Walkthrough complete' })).toBeDisabled();
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(steps.first()).toHaveAttribute('aria-current', 'step');
  for (let i = 1; i < 4; i++) {
    await page.getByRole('button', { name: 'Next stage' }).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current', 'step');
  }
  await page.getByRole('button', { name: 'Restart' }).click();
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('navigation, filters, FAQ and keyboard controls', async ({ page }, testInfo) => {
  await page.goto('/');
  const menu = page.locator('.menu-toggle');
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
  for (const name of ['Platform', 'How It Works', 'Capabilities', 'Trust', 'FAQ']) {
    if (await menu.isVisible()) await menu.click();
    const link = page.getByRole('navigation').getByRole('link', { name, exact: true });
    const target = await link.getAttribute('href');
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.locator(target)).toBeVisible();
    if (await menu.isVisible()) await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
  for (const filter of ['Implemented', 'Experimental', 'Planned']) {
    await page.getByRole('button', { name: filter, exact: true }).click();
    for (const status of await page.locator('.capability-status').all()) await expect(status).toContainText(filter);
    expect(await page.locator('.capability-row').count()).toBeGreaterThan(0);
  }
  await page.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('.capability-row')).toHaveCount(7);
  for (const detail of await page.locator('.faq-list details').all()) {
    await detail.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(detail.locator('p')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(detail.locator('p')).not.toBeVisible();
  }
  for (const link of await page.locator('a[href^="#"]').all()) {
    const href = await link.getAttribute('href');
    if (href !== '#') await expect(page.locator(href)).toHaveCount(1);
  }
  await page.goto('/');
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full.png`, fullPage: true });
});

test('accessibility, reduced motion, and assets', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await request.get('/favicon.svg')).status()).toBe(200);
  for (let i = 0; i < 4; i++) {
    await page.locator('.steps button').nth(i).click();
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
  }
  if (await page.getByRole('button', { name: 'Menu' }).isVisible()) {
    await page.getByRole('button', { name: 'Menu' }).click();
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
