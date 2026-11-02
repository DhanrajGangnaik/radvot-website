import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('artwork, motion controls, and expandable details', async ({ page }, testInfo) => {
  await page.goto('/');
  const images = page.locator('img');
  await expect(images).toHaveCount(1);
  for (const img of await images.all()) {
    await img.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(img).toHaveAttribute('width', '1440');
    await expect(img).toHaveAttribute('height', '960');
  }
  await page.getByRole('button', { name: 'Pause motion' }).click();
  expect(await page.locator('.lens-ring').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.getByRole('button', { name: 'Resume motion' }).click();
  expect(await page.locator('.lens-ring').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('running');
  for (const detail of await page.locator('.capability-row, .trust-list details').all()) {
    await detail.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(detail.locator('p')).toBeVisible();
  }
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  for (const detail of await page.locator('.capability-row, .trust-list details').all()) {
    await detail.locator('summary').click();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.lens-ring').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.signal-node').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/${testInfo.project.name}-hero-refresh.png` });
  await page.screenshot({ path: `test-results/${testInfo.project.name}-refresh-full.png`, fullPage: true });
});
