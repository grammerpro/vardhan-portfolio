import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:3100';
const label = process.argv[3] || 'local';
const output = 'docs/evidence/baseline';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 });
  await page.screenshot({ path: `${output}/${label}-${name}-hero.png` });
  const sections = await page.locator('section[id]').evaluateAll(nodes => nodes.map(node => ({ id: node.id, text: node.textContent.slice(0, 100) })));
  const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent.trim(), href: node.getAttribute('href') })));
  for (const id of ['work', 'projects', 'fit', 'contact']) {
    const locator = page.locator(`#${id}`);
    if (!await locator.count()) continue;
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${output}/${label}-${name}-${id}.png` });
  }
  await page.screenshot({ path: `${output}/${label}-${name}-full.png`, fullPage: true });
  results.push({ name, width, height, url: base, status: response.status(), browser: browser.version(), sections, links, errors });
  await context.close();
}
await browser.close();
await writeFile(`${output}/${label}-capture.json`, JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify(results.map(({ name, status, errors, sections }) => ({ name, status, errors, sections: sections.map(s => s.id) }))));
