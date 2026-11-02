import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('standalone branding and requested FAQ content remain accessible', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const details = page.locator('.faq-list details');
  await expect(details).toHaveCount(8);
  const identity = details.filter({ has: page.locator('summary', { hasText: 'What is RADVOT?' }) });
  const priority = details.filter({ has: page.locator('summary', { hasText: 'How does RADVOT prioritize vulnerabilities?' }) });
  await expect(identity.locator('p')).toHaveText('RADVOT is an autonomous offensive and defensive security intelligence platform that helps organizations discover vulnerabilities, perform authorized security assessments, validate defenses, and prioritize risks through evidence-backed findings.');
  await expect(priority.locator('p')).toHaveText('RADVOT helps prioritize findings using CVSS severity, EPSS exploitation probability where available, asset exposure, assessment evidence, and potential business impact. Reports include actionable mitigation recommendations and follow-up validation.');
  await expect(details.filter({ hasText: 'How does RADVOT work?' })).toContainText('Create Agent → Deploy Agent → Run Assessments through Natural Language → Review Findings and Reports.');
  for (const item of await details.all()) {
    const summary = item.locator('summary');
    if (info.project.name === 'mobile') await summary.tap();
    else { await summary.focus(); await page.keyboard.press('Enter'); }
    await expect(item.locator('p')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(item.locator('p')).not.toBeVisible();
  }
  await identity.locator('summary').click();
  await priority.locator('summary').click();
  const publicMarkup = await page.content();
  expect(publicMarkup).not.toMatch(/purpleclaw|formerly|rebrand|new identity|successor|migration narrative|what happened to/i);
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain('RADVOT is an autonomous offensive and defensive security intelligence platform');
  const contacts = page.locator('.footer-links a');
  await expect(contacts).toHaveCount(2);
  await expect(contacts.first()).toHaveAttribute('href', 'mailto:dhanrajgangnaik47@gmail.com');
  await expect(contacts.last()).toHaveAttribute('href', 'https://www.linkedin.com/in/dhanraj-gangnaik-b5b9131b8/');
  await expect(contacts.last()).toHaveAttribute('target', '_blank');
  await expect(contacts.last()).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('footer svg')).toHaveCount(2);
  await expect(page.locator('footer .footer-bottom')).toHaveCount(0);
  await expect(page.locator('footer a')).toHaveCount(3);
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).include('#faq').include('footer').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.locator('#faq').screenshot({ path: info.outputPath('faq.png'), style: '.site-header,.scroll-progress,.skip-link{visibility:hidden!important}' });
  await page.locator('footer').screenshot({ path: info.outputPath('footer.png'), style: '.site-header,.scroll-progress,.skip-link{visibility:hidden!important}' });
  expect(errors).toEqual([]);
});
