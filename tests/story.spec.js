import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function seek(page,p){
  await page.locator('.cin-scroll').evaluate((el,p)=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,behavior:'instant'}),p);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter',String(Math.floor(p)));
  await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-scene',String(Math.floor(p)));
  // Wait for the single scroll scrub to settle.
  await expect.poll(async()=>Math.abs(Number(await page.locator('.cin-scene canvas').getAttribute('data-progress'))-p)).toBeLessThan(.003);
  await page.waitForTimeout(150);
}

test('continuous world renders all chapters, intermediate states and reverse scroll',async({page},info)=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true',{timeout:30000});
  const positions=[.5,1.5,2.65,3.3,3.85,4.75,5.75,6.65,7.5,7.95,8.45,8.95,9.75];
  for(const p of positions){
    await seek(page,p);
    if(p===3.85)await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-portal','true');
    if(p===4.75)await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-core','true');
    await expect(page.locator('.cinematic')).toHaveAttribute('data-active',String([.18,4.18,4.58,5.12,5.55,6.35].filter(x=>x<=p).length));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(`chapter-${p}.png`)});
  }
  for(const p of [8.45,7.5,5.75,3.85,2.65,1.5,.5])await seek(page,p);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-active','1');
  expect(errors).toEqual([]);
});

test('natural scrolling, review, all retest outcomes and replay',async({page},info)=>{
  await page.goto('/');await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true',{timeout:30000});
  await seek(page,3.85);
  await seek(page,6.4);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-active','6');
  await page.getByRole('button',{name:'Public admin route',exact:true}).click();
  await page.getByRole('button',{name:'Review mitigation'}).click();
  await expect(page.locator('.cin-decision')).toContainText('Preserve a recovery path');
  await page.getByRole('button',{name:'Mark change as simulated / applied'}).click();
  for(const result of ['Verified Resolved','Still Present','Inconclusive']){
    await page.getByLabel('Simulated verification evidence').selectOption(result);
    await page.getByRole('button',{name:'Run simulated retest'}).click();
    await expect(page.locator('.cin-status')).toHaveText(`Retest: ${result}`);
    await expect(page.locator('.cin-decision [role="status"]')).toContainText('After:');
    await page.waitForTimeout(150);
    await page.screenshot({path:info.outputPath(`retest-${result.replaceAll(' ','-')}.png`)});
  }
  await page.getByRole('button',{name:'Incomplete audit trail',exact:true}).click();
  await page.getByRole('button',{name:'Review mitigation'}).click();
  await expect(page.locator('.cin-decision')).toContainText('retention capacity');
  await seek(page,9.7);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter','9');
  await page.locator('.cin-copy').getByRole('button',{name:'Replay experience'}).click();
  await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter','0');
});

test('reduced motion and unavailable WebGL provide complete accessible story',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-mode','text');
  await expect(page.locator('.cin-text article')).toHaveCount(10);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.cin-text')).toContainText('Yours. Both of you.');
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(accessibility.violations).toEqual([]);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await page.reload();
  await expect(page.locator('.cin-text')).toContainText('WebGL is unavailable');
  await expect(page.getByRole('link',{name:/Cloud Your workloads/})).toBeVisible();
});

test('final choices open the existing demo with mode and preserve existing sessions',async({page})=>{
  for(const mode of ['cloud','onprem']){
    await page.goto('/');await page.evaluate(()=>sessionStorage.clear());
    await seek(page,9.7);
    await page.locator(`.cin-copy a[href="/demo?from=story&mode=${mode}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/demo\\?from=story&mode=${mode}`));
    await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
    expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('radvot-demo-v1')).environment.mode)).toBe(mode);
  }
  await page.goto('/demo?from=story&mode=cloud');
  await expect(page.getByRole('status')).toContainText('existing demo session was preserved');
  expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('radvot-demo-v1')).environment.mode)).toBe('onprem');
});

test('homepage entry, keyboard controls, narrow screens and local-only narrative',async({page},info)=>{
  const traffic=[];page.on('request',r=>{if(['fetch','xhr','websocket'].includes(r.resourceType()))traffic.push(r.url());});
  await page.goto('/');
  await expect(page.locator('.skull-glitch')).toHaveCount(0);
  await page.screenshot({path:info.outputPath('homepage.png')});
  await expect(page.locator('.site,.hero,#faq,#capabilities')).toHaveCount(0);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  const header=page.locator('.cin-header');
  await expect(header.locator('button')).toHaveCount(0);
  await expect(header.locator('nav a')).toHaveCount(1);
  await expect(header).toContainText('THE THIRD FORCE');
  await expect(header).toContainText('AN IMMERSIVE EXPERIENCE');
  await expect(page.locator('.cin-progress')).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'Sequences'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:/Skip (story|experience)|Read (story|experience)|Pause motion|Resume motion/i})).toHaveCount(0);
  await header.getByRole('link',{name:/Product demo/}).focus();
  await expect(header.getByRole('link',{name:/Product demo/})).toBeFocused();
  const initialScroll=await page.evaluate(()=>scrollY);
  await page.keyboard.press('PageDown');
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(initialScroll);
  // Let the browser finish its native keyboard scroll before seeking elsewhere.
  await page.waitForTimeout(500);
  await seek(page,5.75);
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
  for(const viewport of [{width:320,height:720},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(250);await seek(page,3.85);
    await page.waitForTimeout(100);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(`compact-${viewport.width}.png`)});
  }
  expect(traffic).toEqual([]);
  await page.locator('.cin-header').getByRole('link',{name:/Product demo/}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
});

test('two primary routes survive refresh and browser history with contact links retained',async({page})=>{
  await page.goto('/');
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  await page.reload();
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  const footer=page.locator('.cin-end');
  await expect(footer.getByRole('link',{name:'Email ↗',exact:true})).toHaveAttribute('href','mailto:dhanrajgangnaik47@gmail.com');
  const linkedin=footer.getByRole('link',{name:'LinkedIn ↗',exact:true});
  await expect(linkedin).toHaveAttribute('href','https://www.linkedin.com/in/dhanraj-gangnaik-b5b9131b8/');
  await expect(linkedin).toHaveAttribute('target','_blank');
  await expect(linkedin).toHaveAttribute('rel','noopener noreferrer');
  await expect(footer.getByRole('button')).toHaveCount(0);
  await expect(footer.getByRole('link',{name:'Homepage',exact:true})).toHaveCount(0);
  await footer.getByRole('link',{name:/Launch interactive demo/}).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
  const returnLink=page.locator('.rd-topbar').getByRole('link',{name:'RADVOT / The Third Force',exact:true});
  await expect(returnLink).toHaveAttribute('href','/');
  await returnLink.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  await page.goBack();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  await page.goto('/story');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
});
