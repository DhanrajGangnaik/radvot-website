# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story.spec.js >> chapter navigation, pause, review, all retest outcomes, skip and replay
- Location: tests/story.spec.js:34:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "6ca33135b1284b6a06d3bbb04909d4caf47f2b9c06abe6ee5f50ac9d591b4ae5"
Received: "ea38dc07a11811ff5a4715556cc7894396d5167ed43c8b88953cc3fda99e76a4"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "RADVOT home" [ref=e5] [cursor=pointer]:
      - /url: /
      - text: RADVOT /
    - navigation "Experience controls" [ref=e6]:
      - link "Product demo ↗" [ref=e7] [cursor=pointer]:
        - /url: /demo
      - button "Skip experience" [ref=e8] [cursor=pointer]
      - button "Read experience" [ref=e9] [cursor=pointer]
      - button "Resume motion" [active] [pressed] [ref=e10] [cursor=pointer]
  - main "Explore The Third Force" [ref=e11]:
    - generic [ref=e12]:
      - generic [aria-hidden] [ref=e18]:
        - generic [ref=e19]: ● RED / OFFENSIVE INVESTIGATION
        - generic [ref=e20]: ● BLUE / DEFENSIVE SECURITY
      - generic "Chapter narrative and controls" [ref=e21]:
        - paragraph [ref=e22]: 01 / TWO PERSPECTIVES
        - heading "The same world. Two lines of sight." [level=1] [ref=e23]
        - paragraph [ref=e24]: Red investigates how systems could fail. Blue watches how defenses respond. Both protect the same infrastructure.
        - paragraph [ref=e25]: Risk begins where the evidence is incomplete.
      - generic "Intelligence Core components":
        - generic:
          - generic: R
          - generic: Risk
        - generic:
          - generic: A
          - generic: Assessment
        - generic:
          - generic: D
          - generic: Defense
        - generic:
          - generic: V
          - generic: Validation
        - generic:
          - generic: O
          - generic: Orchestrated
        - generic:
          - generic: T
          - generic: Testing
      - generic [ref=e26]:
        - generic [ref=e27]: SCROLL TO UNFOLD ↓
        - generic [ref=e28]: Illustrative narrative · No real systems accessed
  - navigation "Sequences" [ref=e29]:
    - button "1. Two Teams, One Mission" [ref=e30] [cursor=pointer]:
      - generic [ref=e31]: "01"
    - button "2. The Disconnect" [ref=e32] [cursor=pointer]:
      - generic [ref=e33]: "02"
    - button "3. The Silence" [ref=e34] [cursor=pointer]:
      - generic [ref=e35]: "03"
    - button "4. RADVOT’s Arrival" [ref=e36] [cursor=pointer]:
      - generic [ref=e37]: "04"
    - button "5. The Orchestration" [ref=e38] [cursor=pointer]:
      - generic [ref=e39]: "05"
    - button "6. The Revelation" [ref=e40] [cursor=pointer]:
      - generic [ref=e41]: "06"
    - button "7. The Human Decision" [ref=e42] [cursor=pointer]:
      - generic [ref=e43]: "07"
    - button "8. The Third Force" [ref=e44] [cursor=pointer]:
      - generic [ref=e45]: "08"
    - button "9. RADVOT" [ref=e46] [cursor=pointer]:
      - generic [ref=e47]: "09"
    - button "10. Your System" [ref=e48] [cursor=pointer]:
      - generic [ref=e49]: "10"
  - contentinfo [ref=e50]:
    - paragraph [ref=e51]: The experience ends. Your investigation begins.
    - link "Launch interactive demo ↗" [ref=e52] [cursor=pointer]:
      - /url: /demo
    - button "Replay experience" [ref=e53] [cursor=pointer]
    - link "Homepage" [ref=e54] [cursor=pointer]:
      - /url: /
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import { createHash } from 'node:crypto';
  4   | 
  5   | async function seek(page,p){
  6   |   await page.locator('.cin-scroll').evaluate((el,p)=>window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p/9.99,behavior:'instant'}),p);
  7   |   await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter',String(Math.floor(p)));
  8   |   await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-scene',String(Math.floor(p)));
  9   |   // Wait for the single scrub to settle, including paused demand-rendered scenes.
  10  |   await expect.poll(async()=>Math.abs(Number(await page.locator('.cin-scene canvas').getAttribute('data-progress'))-p)).toBeLessThan(.003);
  11  |   await page.waitForTimeout(150);
  12  | }
  13  | 
  14  | test('continuous world renders all chapters, intermediate states and reverse scroll',async({page},info)=>{
  15  |   test.setTimeout(120000);
  16  |   const errors=[];page.on('pageerror',e=>errors.push(e.message));
  17  |   await page.goto('/story');
  18  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true',{timeout:30000});
  19  |   await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  20  |   const positions=[.5,1.5,2.65,3.3,3.85,4.75,5.75,6.65,7.5,7.95,8.45,8.95,9.75];
  21  |   for(const p of positions){
  22  |     await seek(page,p);
  23  |     if(p===3.85)await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-portal','true');
  24  |     if(p===4.75)await expect(page.locator('.cin-scene canvas')).toHaveAttribute('data-core','true');
  25  |     await expect(page.locator('.cinematic')).toHaveAttribute('data-active',String([.18,4.18,4.58,5.12,5.55,6.35].filter(x=>x<=p).length));
  26  |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  27  |     await page.screenshot({path:info.outputPath(`chapter-${p}.png`)});
  28  |   }
  29  |   for(const p of [8.45,7.5,5.75,3.85,2.65,1.5,.5])await seek(page,p);
  30  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-active','1');
  31  |   expect(errors).toEqual([]);
  32  | });
  33  | 
  34  | test('chapter navigation, pause, review, all retest outcomes, skip and replay',async({page},info)=>{
  35  |   await page.goto('/story');await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true',{timeout:30000});
  36  |   await page.getByRole('button',{name:'4. RADVOT’s Arrival',exact:true}).click();
  37  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter','3');
  38  |   await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  39  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-paused','true');
  40  |   await seek(page,3.85);
  41  |   await page.waitForTimeout(400);
  42  |   const before=await page.locator('.cin-scene').screenshot();await page.waitForTimeout(200);
  43  |   const after=await page.locator('.cin-scene').screenshot();
  44  |   // Compare exact pixels without serializing megabytes of Buffer diffs on failure.
> 45  |   expect(createHash('sha256').update(after).digest('hex')).toBe(createHash('sha256').update(before).digest('hex'));
      |                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  46  |   await page.getByRole('button',{name:'Resume motion',exact:true}).click();
  47  |   await page.getByRole('button',{name:'7. The Human Decision',exact:true}).click();
  48  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-active','6');
  49  |   await page.getByRole('button',{name:'Public admin route',exact:true}).click();
  50  |   await page.getByRole('button',{name:'Review mitigation'}).click();
  51  |   await expect(page.locator('.cin-decision')).toContainText('Preserve a recovery path');
  52  |   await page.getByRole('button',{name:'Mark change as simulated / applied'}).click();
  53  |   for(const result of ['Verified Resolved','Still Present','Inconclusive']){
  54  |     await page.getByLabel('Simulated verification evidence').selectOption(result);
  55  |     await page.getByRole('button',{name:'Run simulated retest'}).click();
  56  |     await expect(page.locator('.cin-status')).toHaveText(`Retest: ${result}`);
  57  |     await expect(page.locator('.cin-decision [role="status"]')).toContainText('After:');
  58  |     await page.waitForTimeout(150);
  59  |     await page.screenshot({path:info.outputPath(`retest-${result.replaceAll(' ','-')}.png`)});
  60  |   }
  61  |   await page.getByRole('button',{name:'Incomplete audit trail',exact:true}).click();
  62  |   await page.getByRole('button',{name:'Review mitigation'}).click();
  63  |   await expect(page.locator('.cin-decision')).toContainText('retention capacity');
  64  |   await page.getByRole('button',{name:'Skip experience',exact:true}).click();
  65  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter','9');
  66  |   await page.locator('.cin-copy').getByRole('button',{name:'Replay experience'}).click();
  67  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-chapter','0');
  68  | });
  69  | 
  70  | test('reduced motion and unavailable WebGL provide complete accessible story',async({page})=>{
  71  |   await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/story');
  72  |   await expect(page.locator('.cinematic')).toHaveAttribute('data-mode','text');
  73  |   await expect(page.locator('.cin-text article')).toHaveCount(10);
  74  |   await expect(page.locator('canvas')).toHaveCount(0);
  75  |   await expect(page.locator('.cin-text')).toContainText('Yours. Both of you.');
  76  |   const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(accessibility.violations).toEqual([]);
  77  |   await page.emulateMedia({reducedMotion:'no-preference'});
  78  |   await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await page.reload();
  79  |   await expect(page.locator('.cin-text')).toContainText('WebGL is unavailable');
  80  |   await expect(page.getByRole('link',{name:/Cloud Your workloads/})).toBeVisible();
  81  | });
  82  | 
  83  | test('final choices open the existing demo with mode and preserve existing sessions',async({page})=>{
  84  |   for(const mode of ['cloud','onprem']){
  85  |     await page.goto('/story');await page.evaluate(()=>sessionStorage.clear());
  86  |     await page.getByRole('button',{name:'Skip experience',exact:true}).click();
  87  |     await page.locator(`.cin-copy a[href="/demo?from=story&mode=${mode}"]`).click();
  88  |     await expect(page).toHaveURL(new RegExp(`/demo\\?from=story&mode=${mode}`));
  89  |     await expect(page.getByRole('heading',{name:/Where would you like/})).toBeVisible();
  90  |     expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('radvot-demo-v1')).environment.mode)).toBe(mode);
  91  |   }
  92  |   await page.goto('/demo?from=story&mode=cloud');
  93  |   await expect(page.getByRole('status')).toContainText('existing demo session was preserved');
  94  |   expect(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('radvot-demo-v1')).environment.mode)).toBe('onprem');
  95  | });
  96  | 
  97  | test('homepage entry, keyboard controls, narrow screens and local-only narrative',async({page},info)=>{
  98  |   const traffic=[];page.on('request',r=>{if(['fetch','xhr','websocket'].includes(r.resourceType()))traffic.push(r.url());});
  99  |   await page.goto('/');
  100 |   await expect(page.locator('.skull-glitch')).toHaveCount(0);
  101 |   await page.screenshot({path:info.outputPath('homepage.png')});
  102 |   await page.getByRole('link',{name:'Enter the experience',exact:true}).click();
  103 |   await expect(page).toHaveURL(/\/story$/);
  104 |   await expect(page.locator('.cinematic')).toHaveAttribute('data-ready','true');
  105 |   await page.getByRole('button',{name:'Pause motion',exact:true}).focus();await page.keyboard.press('Enter');
  106 |   await expect(page.getByRole('button',{name:'Resume motion',exact:true})).toBeFocused();
  107 |   await seek(page,5.75);
  108 |   const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a11y.violations).toEqual([]);
  109 |   for(const viewport of [{width:320,height:720},{width:844,height:390}]){
  110 |     await page.setViewportSize(viewport);await page.waitForTimeout(250);await seek(page,3.85);
  111 |     await page.waitForTimeout(100);
  112 |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  113 |     await page.screenshot({path:info.outputPath(`compact-${viewport.width}.png`)});
  114 |   }
  115 |   expect(traffic).toEqual([]);
  116 | });
  117 | 
```