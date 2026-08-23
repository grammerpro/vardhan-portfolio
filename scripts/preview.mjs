/**
 * Recaptures the README preview images from a running production build.
 *   node scripts/preview.mjs <baseUrl>
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:4000';
const OUT = 'docs/preview';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base, { waitUntil: 'load' });
await page.waitForTimeout(5000);

const shots = [
  ['hero', 'hero', 0],
  ['positioning', 'positioning', 0.5],
  ['work', 'work', 0.5],
];

for (const [file, id, pct] of shots) {
  const box = await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return null;
    const target = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    const rect = target.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: target.offsetHeight };
  }, id);
  if (!box) continue;
  const y = box.top + (box.height - 900) * pct;
  await page.evaluate((v) => window.scrollTo({ top: Math.max(0, v), behavior: 'instant' }), y);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${file}.png` });
}

// Fit Check with a real assessment on screen.
await page.evaluate(() => document.getElementById('fit')?.scrollIntoView());
await page.waitForTimeout(1000);
await page.fill('#fit-input', 'Senior AEM Developer. 5+ years Adobe Experience Manager, Sling models, dispatcher configuration, Java Spring Boot, React and TypeScript. Enterprise CMS delivery.');
await page.click('#fit button[type="submit"]');
await page.waitForTimeout(11000);
await page.evaluate(() => document.getElementById('fit')?.scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/fit-check.png` });

await browser.close();
console.log('preview images recaptured');
