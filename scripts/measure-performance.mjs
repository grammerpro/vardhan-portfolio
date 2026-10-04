import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import fs from 'node:fs/promises';
import os from 'node:os';
import { gzipSync } from 'node:zlib';
const base = process.argv[2] || 'http://localhost:3200';
const directory = 'docs/evidence/performance';
await fs.mkdir(directory,{recursive:true});
const browser = await chromium.launch({headless:true,args:['--remote-debugging-port=9223']});
try {
  const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await page.addInitScript(()=>{
    window.__vitals={lcp:0,cls:0};
    new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__vitals.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__vitals.cls+=entry.value;}).observe({type:'layout-shift',buffered:true});
  });
  const response = await page.goto(base,{waitUntil:'networkidle'});
  const html = await response.text();
  const initialScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match=>match[1]);
  await page.waitForTimeout(1500);
  const observed = await page.evaluate(()=>({vitals:window.__vitals,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,type:r.initiatorType,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize})),graphics:[...document.querySelectorAll('canvas')].map(c=>({...c.dataset,width:c.width,height:c.height})),userAgent:navigator.userAgent}));
  const assets=[];
  for(const resource of observed.resources.filter(r=>r.name.endsWith('.js'))) {
    const pathname=new URL(resource.name).pathname;
    const result=await fetch(resource.name);
    const bytes=Buffer.from(await result.arrayBuffer());
    assets.push({pathname,initial:initialScripts.includes(pathname),bytes:bytes.length,gzipBytes:gzipSync(bytes).length});
  }
  const total=(values,key)=>values.reduce((sum,item)=>sum+item[key],0);
  const measurement={date:new Date().toISOString(),build:'production (must run against next start)',system:{platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0]?.model,memoryGiB:Math.round(os.totalmem()/1024**3)},browser:browser.version(),viewport:'390x844, DPR2, touch/mobile emulation',cache:'fresh isolated browser context',network:'unthrottled localhost for resource/bundle observation; separate Lighthouse simulated mobile below',...observed,assets,initialJavaScriptGzipBytes:total(assets.filter(a=>a.initial),'gzipBytes'),deferredJavaScriptGzipBytes:total(assets.filter(a=>!a.initial),'gzipBytes'),firstVisitResourceTransferBytes:total(observed.resources,'transferSize'),documentBytes:Buffer.byteLength(html)};
  await fs.writeFile(`${directory}/resources.json`,JSON.stringify(measurement,null,2));
  await page.close();
  const report=await lighthouse(base,{port:9223,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:2,disabled:false}});
  await fs.writeFile(`${directory}/lighthouse.json`,report.report);
  const lhr=report.lhr;
  const summary={...lhr.configSettings,date:lhr.fetchTime,userAgent:lhr.userAgent,categories:Object.fromEntries(Object.entries(lhr.categories).map(([id,value])=>[id,value.score])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','interactive'].map(id=>[id,{value:lhr.audits[id]?.numericValue,display:lhr.audits[id]?.displayValue}])),failedAudits:Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<.9).map(a=>({id:a.id,title:a.title,score:a.score,display:a.displayValue})),runtimeError:lhr.runtimeError};
  await fs.writeFile(`${directory}/summary.json`,JSON.stringify(summary,null,2));
  console.log(JSON.stringify({initialJSgzip:measurement.initialJavaScriptGzipBytes,deferredJSgzip:measurement.deferredJavaScriptGzipBytes,firstVisitTransfer:measurement.firstVisitResourceTransferBytes,summary},null,2));
} finally { await browser.close(); }
