import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:3200';
const directory = 'docs/evidence/resume';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const [name, width, height] of [['desktop', 1440, 900], ['phone', 390, 844], ['small-phone', 360, 800]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(new URL('/resume', base).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  if (name === 'desktop') {
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: `${directory}/print-layout.png`, fullPage: true });
    await page.pdf({ path: `${directory}/overview-print.pdf`, printBackground: true, format: 'A4', preferCSSPageSize: true });
  }
  results.push({ name, width, height, status: response.status(), overflow, errors });
  await page.close();
}
await writeFile(`${directory}/capture.json`, JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), baseUrl: base, buildMode: process.argv[3] || 'Not specified; confirm the local server mode.', conditions: 'Headless Chromium, fresh page contexts, reduced motion, DPR 1, no CPU/network throttling, font loading awaited. Print PDF is HTML overview; original public/resume.pdf unchanged.', results }, null, 2));
await browser.close();
console.log(JSON.stringify(results));
