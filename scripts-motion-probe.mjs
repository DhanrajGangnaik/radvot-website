import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const phase=process.argv[2]||'baseline';
const browser=await chromium.launch({channel:'chrome'});
const results=[];
for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
 const page=await browser.newPage({viewport,isMobile:device==='mobile',hasTouch:device==='mobile'});
 await page.addInitScript(()=>{
  window.__probe={draws:0,longTasks:[]};
  for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
   const original=WebGL2RenderingContext.prototype[name];
   WebGL2RenderingContext.prototype[name]=function(...args){window.__probe.draws++;return original.apply(this,args);};
  }
  new PerformanceObserver(list=>window.__probe.longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});
 });
 await page.goto(`${process.env.RADVOT_PREVIEW_URL || 'http://127.0.0.1:4173'}/`);
 await page.locator('.cinematic[data-ready="true"]').waitFor({timeout:30000});await page.waitForTimeout(1200);
 const result=await page.evaluate(async()=>{
  const root=document.querySelector('.cin-scroll');const start=root.offsetTop,range=root.offsetHeight-innerHeight;
  window.__probe.longTasks=[];
  const samples=[],draws=[],path=[.5,3.85,5.75,8.95,9.75,7.95,3.3,1.5,5.75,3.85];
  let oldDraw=window.__probe.draws,oldTime=performance.now(),begin=oldTime;
  await new Promise(resolve=>{const frame=now=>{
   const elapsed=now-begin,segment=Math.floor(elapsed/750),f=(elapsed%750)/750;
   if(segment>=path.length-1){resolve();return;}
   window.scrollTo({top:start+range*(path[segment]+(path[segment+1]-path[segment])*f)/9.99,behavior:'instant'});
   samples.push(now-oldTime);draws.push(window.__probe.draws-oldDraw);oldDraw=window.__probe.draws;oldTime=now;requestAnimationFrame(frame);
  };requestAnimationFrame(frame);});
  const sorted=samples.slice(2).sort((a,b)=>a-b),active=draws.filter(v=>v>0);
  return {finalRenderedProgress:Number(document.querySelector('canvas').dataset.progress),samples:sorted.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],over33ms:sorted.filter(v=>v>33.4).length,meanDrawCallsPerActiveRaf:active.reduce((a,b)=>a+b,0)/active.length,longTasks:window.__probe.longTasks};
 });
 const dir=`artifacts/refinement/${phase}/${device}`;await mkdir(dir,{recursive:true});
 for(const p of [1.5,3.3,3.85,4.4,5.75,7.95,8.45,8.95,9.75]){
  await page.locator('.cin-scroll').evaluate((el,p)=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,behavior:'instant'}),p);await page.waitForTimeout(700);
  await page.screenshot({path:`${dir}/${p}.png`});
 }
 results.push({device,viewport,...result});await page.close();
}
await browser.close();await writeFile(`artifacts/refinement/${phase}/measurements.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
