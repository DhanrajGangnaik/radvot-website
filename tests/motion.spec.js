import { test, expect } from '@playwright/test';

async function settle(page,p){
  await page.locator('.cin-scroll').evaluate((el,p)=>scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,behavior:'instant'}),p);
  await expect.poll(async()=>Math.abs(Number(await page.locator('.cin-scene canvas').getAttribute('data-progress'))-p)).toBeLessThan(.003);
  await page.waitForTimeout(200);
}

test('single scrub handles slow, normal, rapid and reversed input without resizing canvas',async({page})=>{
  await page.goto('/');await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  const dimensions=await page.locator('canvas').evaluate(c=>[c.clientWidth,c.clientHeight]);
  await settle(page,.5);
  for(const [p,duration] of [[.65,450],[1.5,250],[3.85,0],[8.95,0],[3.3,0],[7.95,0],[1.5,0],[9.75,0]]){
    const samples=await page.evaluate(async({p,duration})=>{
      const el=document.querySelector('.cin-scroll'),canvas=document.querySelector('.cin-scene canvas');
      const start=scrollY,end=el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,begin=performance.now(),samples=[];
      await new Promise(resolve=>{const frame=now=>{
        const t=duration?Math.min(1,(now-begin)/duration):1;
        scrollTo({top:start+(end-start)*t,behavior:'instant'});samples.push(Number(canvas.dataset.progress));
        if(now-begin>duration+600)resolve();else requestAnimationFrame(frame);
      };requestAnimationFrame(frame);});return samples;
    },{p,duration});
    const direction=p>samples[0]?1:-1;
    for(let i=1;i<samples.length;i++)expect(direction*(samples[i]-samples[i-1])).toBeGreaterThanOrEqual(-.005);
    expect(Math.abs(samples.at(-1)-p),`target ${p}`).toBeLessThan(.003);
    expect(await page.locator('canvas').evaluate(c=>[c.clientWidth,c.clientHeight])).toEqual(dimensions);
    expect(await page.locator('.cin-copy').evaluate(el=>Number(getComputedStyle(el).opacity))).toBeGreaterThan(.5);
  }
  // Direction changes faster than the scrub are still resolved to the last intent.
  for(const p of [2,7,3,8,4]){
    await page.locator('.cin-scroll').evaluate((el,p)=>scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,behavior:'instant'}),p);
    await page.waitForTimeout(45);
  }
  await settle(page,4.75);
  await expect(page.locator('.cinematic')).toHaveAttribute('data-active','3');
  await expect(page.locator('.cin-copy')).toHaveCount(1);
});

test('visible wording and accessible labels use experience terminology',async({page})=>{
  const check=async()=>{
    const text=await page.evaluate(()=>document.body.innerText+' '+document.title+' '+[...document.querySelectorAll('[aria-label],[title],[alt]')].map(el=>[el.getAttribute('aria-label'),el.title,el.alt].join(' ')).join(' '));
    expect(text).not.toMatch(/\bstory\b/i);
  };
  await page.goto('/');await check();
  await page.goto('/');await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  for(let i=0;i<10;i++){await settle(page,i+.5);await check();}
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.cin-text')).toBeVisible();await check();
  await page.goto('/demo');await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();await check();
});

test('replay reuses resources and reduced motion disposes them and stops drawing',async({page})=>{
  test.setTimeout(90000);
  await page.addInitScript(()=>{
    const live=new Set();window.__gpu={created:0,deleted:0,draws:0,live:()=>live.size};
    for(const name of ['createBuffer','deleteBuffer','drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
      const original=WebGL2RenderingContext.prototype[name];
      WebGL2RenderingContext.prototype[name]=function(...args){
        const result=original.apply(this,args);
        if(name==='createBuffer'&&result){window.__gpu.created++;live.add(result);}
        else if(name==='deleteBuffer'&&live.delete(args[0]))window.__gpu.deleted++;
        else if(name.startsWith('draw'))window.__gpu.draws++;
        return result;
      };
    }
  });
  await page.goto('/');await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  await settle(page,3.85);
  // Exercise all lazily uploaded geometry before measuring stability.
  for(const p of [5.75,8.95,9.75])await settle(page,p);
  const buffers=await page.evaluate(()=>window.__gpu.created);
  for(let i=0;i<3;i++){
    await page.locator('.cin-copy').getByRole('button',{name:/Replay experience/}).click();
    await settle(page,.5);await settle(page,3.85);await settle(page,9.75);
  }
  expect(await page.evaluate(()=>window.__gpu.created)).toBe(buffers);
  for(let i=0;i<3;i++){
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>window.__gpu.live())).toBe(0);
    const before=await page.evaluate(()=>window.__gpu.draws);await page.waitForTimeout(300);
    expect(await page.evaluate(()=>window.__gpu.draws)).toBe(before);
    if(i<2){
      await page.emulateMedia({reducedMotion:'no-preference'});
      await expect(page.locator('canvas')).toBeVisible();await settle(page,3.85);
    }
  }
});
