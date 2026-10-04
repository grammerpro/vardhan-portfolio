import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';

const poster = readFileSync('public/signature/hero-desktop.webp').toString('base64');
let font = '';
try {
  // The latin Archivo file is emitted by the existing next/font configuration.
  const css = readdirSync('.next-production/static/css', { recursive: true }).filter((file) => file.endsWith('.css')).map((file) => readFileSync(`.next-production/static/css/${file}`, 'utf8')).join('');
  const face = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].find((match) => /font-family:\s*['"]?Archivo/.test(match[1]) && match[1].includes('.p.woff2'));
  const file = face?.[1].match(/media\/([^"')]+\.woff2)/)?.[1];
  if (!file) throw new Error('Archivo Latin face is not present in the local build.');
  const fontData = readFileSync(`.next-production/static/media/${file}`).toString('base64');
  font = `@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${fontData}) format('woff2');font-weight:100 900;font-display:block}`;
} catch { console.log('No built Archivo font found; preview uses the system sans fallback.'); }

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><html><head><style>${font}
*{box-sizing:border-box}body{margin:0;background:#e9e6df;color:#151719;font-family:Archivo,Arial,sans-serif;width:1200px;height:630px;overflow:hidden}.frame{position:relative;padding:50px 60px;height:100%}.top{font:13px monospace;letter-spacing:2px}.rule{width:1080px;border-bottom:1px solid #b7b8b3;margin-top:25px}.name{position:relative;z-index:2;margin:71px 0 0;font-size:118px;font-weight:580;letter-spacing:-8px;line-height:1}.copy{position:relative;z-index:2;font-size:34px;line-height:1.12;letter-spacing:-1.2px;margin-top:30px;width:550px}.copy em{font-style:normal;color:#6b665d}.caption{position:absolute;left:62px;bottom:45px;font:13px monospace;letter-spacing:.5px}.image{position:absolute;width:960px;height:600px;object-fit:contain;left:270px;top:38px}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#98622e;margin-right:10px}</style></head><body><div class="frame"><div class="top">VARDHAN / INSIDE THE SYSTEM</div><div class="rule"></div><img class="image" src="data:image/webp;base64,${poster}" alt=""/><h1 class="name">Vardhan.</h1><p class="copy">Full stack engineer.<br/><em>Systems with depth.</em></p><div class="caption"><span class="dot"></span>CINCINNATI, OHIO · VARDHANSUDO.ME</div></div></body></html>`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('Wrote public/og-image.png (1200 × 630) from original scene artwork and HTML.');
