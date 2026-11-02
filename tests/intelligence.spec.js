import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('agent-to-report journey, evidence, scoring, approval and restart', async ({ page }, info) => {
  const errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).hostname !== '127.0.0.1') external.push(request.url()); });
  await page.goto('/');
  await page.locator('#agent-name').fill('demo-billing-linux');
  await page.getByRole('button', { name: 'Create demo agent', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Demo agent created' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next stage' }).click();
  await page.getByRole('button', { name: 'Simulate deployment' }).click();
  await expect(page.locator('.heartbeat')).toContainText('synthetic heartbeat received');
  await page.getByRole('button', { name: 'Next stage' }).click();
  const report = page.getByRole('button', { name: 'View sample assessment report' });
  await expect(report).toBeDisabled();
  await page.getByRole('checkbox').check();
  await report.click();
  await expect(page.locator('.asset-line')).toContainText('demo-billing-linux');
  await expect(page.locator('.score-grid')).toContainText('10.0');
  await expect(page.locator('.score-grid')).toContainText('97.112%');
  await expect(page.locator('.score-note')).toContainText('2025-03-01');
  await page.locator('.report-preview').screenshot({path:info.outputPath('report.png'),style:'.site-header,.skip-link,.scroll-progress{visibility:hidden!important}'});
  await page.locator('.report-evidence summary').click();
  await expect(page.locator('.report-evidence')).toContainText('Synthetic package inventory');
  await page.getByRole('button', { name: 'Show sample retest' }).click();
  await expect(page.locator('.retest-record')).toContainText('runtime security and other controls remain untested');
  await page.locator('.finding-list button').nth(1).click();
  await expect(page.locator('.retest-record')).toContainText('retest not run');
  await expect(page.locator('.score-grid')).toContainText('Not available');
  await expect(page.locator('.score-grid')).toContainText('Not scored');
  await expect(page.locator('.score-note')).toContainText('Unscored does not mean low risk');
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.locator('#agent-name')).toHaveValue('sentinel-linux-01');
  await page.locator('.steps button').nth(2).click();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await expect(report).toBeDisabled();
  await page.locator('.steps button').last().click();
  await expect(page.locator('.retest-record')).toContainText('retest not run');
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('interactive 3D workflow, keyboard, touch, pause and offscreen behavior', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('.hero img')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  const nodes = page.locator('.system-node');
  for (let i = 0; i < 4; i++) {
    if (info.project.name === 'mobile') await nodes.nth(i).tap();
    else { await nodes.nth(i).focus(); await page.keyboard.press('Enter'); }
    await expect(nodes.nth(i)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#system-readout')).toContainText(`0${i + 1}/04`);
  }
  if (info.project.name === 'desktop') {
    await page.locator('.hero-system').hover();
    await expect(page.locator('.hero')).toHaveAttribute('style', /parallax/);
  }
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  expect(await page.locator('.signal-stream').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
  await page.locator('#faq').scrollIntoViewIfNeeded();
  await expect(page.locator('.hero')).toHaveAttribute('data-active', 'false');
  expect(await page.locator('.signal-stream').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  const feature = page.locator('.pillar').first();
  await feature.scrollIntoViewIfNeeded();
  if (info.project.name === 'desktop') {
    await feature.hover({ position: { x: 50, y: 50 } });
    await expect(feature).toHaveAttribute('style', /perspective/);
  }
  await feature.locator('summary').click();
  await expect(feature.locator('.feature-details>p')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.signal-stream').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.system-depth').evaluate(el => getComputedStyle(el).transform)).toBe('none');
});

test('five navigation links, stable alignment, active sections and contact links', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const nav = page.locator('nav');
  const links = nav.locator('a');
  await expect(links).toHaveText(['Platform','How It Works','Capabilities','Trust','FAQ']);
  await expect(nav.locator('.nav-cta')).toHaveCount(0);
  const menu = page.locator('.menu-toggle');
  for (const [i, target] of ['platform','how-it-works','capabilities','trust','faq'].entries()) {
    if (await menu.isVisible()) await menu.click();
    const before = await links.nth(i).boundingBox();
    await links.nth(i).click();
    await expect(links.nth(i)).toHaveAttribute('aria-current','location');
    expect(await page.locator(`#${target}`).evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(72);
    if (await menu.isVisible()) await expect(menu).toHaveAttribute('aria-expanded','false');
    else {
      const after = await links.nth(i).boundingBox();
      expect(Math.abs(after.x-before.x)).toBeLessThan(1);
      expect(Math.abs(after.y-before.y)).toBeLessThan(1);
    }
  }
  await page.locator('#trust').evaluate(el => el.scrollIntoView({behavior:'instant'}));
  await expect(links.nth(3)).toHaveAttribute('aria-current','location');
  expect(await page.evaluate(() => document.fonts.check('700 24px Orbitron'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('400 16px Manrope'))).toBe(true);
  const emails = page.locator('a[href^="mailto:"]');
  await expect(emails).toHaveCount(2);
  for (const email of await emails.all()) await expect(email).toHaveAttribute('href','mailto:dhanrajgangnaik47@gmail.com');
  await expect(page.locator('footer')).toContainText('dhanrajgangnaik47@gmail.com');
  if (info.project.name === 'desktop') {
    for (const width of [1920,1440,1024,768,390,375,320]) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (await menu.isVisible()) { await menu.click(); await links.first().click(); await expect(menu).toHaveAttribute('aria-expanded','false'); }
      const heading = page.locator('h1');
      expect(await heading.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
      await expect(nav.locator('a[aria-current]')).toHaveCount(0);
      await page.screenshot({path:info.outputPath(`hero-${width}.png`)});
    }
  }
});
