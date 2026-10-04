import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://localhost:3200';
const directory = process.argv[3] || 'docs/evidence/review';
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const [name, width, height] of [['desktop',1440,900],['mobile',390,844],['tablet',768,1024]]) {
  const page = await browser.newPage({ viewport:{width,height}, deviceScaleFactor:1, isMobile:width<=768, hasTouch:width<=768, reducedMotion:'no-preference' });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base, {waitUntil:'networkidle',timeout:60000});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(700);
  for (const id of ['hero','unfold','java-native-rag','chroma-loop','anon-dapp','capability','about','contact']) {
    await page.evaluate(id=>{ const element=document.getElementById(id); if(element) scrollTo(0,element.getBoundingClientRect().top+scrollY-(innerWidth<600?112:86)); },id);
    await page.waitForTimeout(600);
    await page.screenshot({ path:`${directory}/${name}-${id}.png` });
  }
  const overflow = await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().width>0&&(el.getBoundingClientRect().right>innerWidth+2||el.getBoundingClientRect().left< -2)).filter(el=>!el.closest('[aria-hidden="true"]')).map(el=>({tag:el.tagName,cls:el.className,rect:el.getBoundingClientRect().toJSON()})).slice(0,15));
  results.push({name,viewport:{width,height},mode:await page.evaluate(()=>document.documentElement.dataset.motion),build:'production next start',browser:browser.version(),deviceScaleFactor:1,touch:width<=768,network:'unthrottled localhost',cache:'fresh context',capturedAt:new Date().toISOString(),errors,overflow});
  await page.close();
}
await browser.close();
await fs.writeFile(`${directory}/capture.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
