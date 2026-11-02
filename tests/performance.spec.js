import { test, expect } from '@playwright/test';

test('preview load stability and animation scheduling', async ({ page }, info) => {
  await page.addInitScript(() => {
    window.qaLayoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.qaLayoutShift += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.hero-system')).toBeVisible();
  await page.waitForTimeout(900);
  const metrics = await page.evaluate(async () => {
    const frames = [];
    let previous = performance.now();
    await new Promise(resolve => {
      const sample = now => {
        frames.push(now - previous); previous = now;
        if (frames.length < 45) requestAnimationFrame(sample); else resolve();
      };
      requestAnimationFrame(sample);
    });
    const sorted = frames.slice(1).sort((a,b)=>a-b);
    const consoleBox = document.querySelector('.hero-system').getBoundingClientRect();
    const reserved = document.querySelector('.system-space').getBoundingClientRect();
    return { cls: window.qaLayoutShift, medianFrameMs: sorted[Math.floor(sorted.length/2)], p95FrameMs: sorted[Math.floor(sorted.length*.95)], consoleHeight: Math.round(consoleBox.height), reservedHeight: Math.round(reserved.height), overflow: document.documentElement.scrollWidth > innerWidth, chunks: performance.getEntriesByType('resource').filter(r=>r.name.includes('IntelligencePreview')).length };
  });
  console.log(`${info.project.name}: ${JSON.stringify(metrics)}`);
  expect(metrics.cls).toBeLessThan(.1);
  expect(metrics.overflow).toBe(false);
  expect(metrics.chunks).toBe(0);
  for (const image of await page.locator('img').all()) {
    await image.evaluate(el=>el.scrollIntoView({behavior:'instant'}));
    await expect.poll(()=>image.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
  }
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  await page.screenshot({ path: `test-results/${info.project.name}-premium-full.png`, fullPage: true, style: '.skip-link,.scroll-progress{visibility:hidden!important}' });
});
