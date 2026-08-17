/**
 * Screenshot harness for the section 9 definition-of-done gate.
 *
 * Captures each section at 0%, 50%, and 100% of its own scroll range, at
 * 1440px and 390px, and reports any console errors or page errors it saw.
 *
 *   node scripts/shoot.mjs <baseUrl> <outDir> [--reduced]
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const outDir = process.argv[3] || 'shots';
const reduced = process.argv.includes('--reduced');

const SECTIONS = ['hero', 'positioning', 'work', 'capability', 'about', 'contact'];
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`[console ${viewport.name}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    problems.push(`[pageerror ${viewport.name}] ${err.message}`);
  });

  // Not networkidle: the dev server's HMR websocket stays open, so it never
  // settles. Wait for load, then give the entry sequence and hero reveal
  // (1360ms counter + 1400ms curtain + 1150ms reveal) time to finish.
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForTimeout(4500);

  for (const id of SECTIONS) {
    const box = await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return null;
      // A pinned section is wrapped by GSAP in a .pin-spacer whose height is
      // the section plus its pin distance. Measuring the section itself would
      // put "50%" barely inside the pin, so the whole scrubbed range would go
      // uncaptured.
      const target = el.parentElement?.classList.contains('pin-spacer')
        ? el.parentElement
        : el;
      const rect = target.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        height: target.offsetHeight,
        pinned: target !== el,
      };
    }, id);

    if (!box) {
      problems.push(`[missing ${viewport.name}] #${id} not found`);
      continue;
    }

    for (const pct of [0, 50, 100]) {
      // Scroll so the requested fraction of the section has passed the top of
      // the viewport, clamped to the document.
      const target = box.top + (box.height - viewport.height) * (pct / 100);
      await page.evaluate((y) => window.scrollTo({ top: Math.max(0, y), behavior: 'instant' }), target);
      await page.waitForTimeout(900);
      await page.screenshot({
        path: `${outDir}/${id}-${pct}-${viewport.name}${reduced ? '-reduced' : ''}.png`,
      });
    }
  }

  await context.close();
}

await browser.close();

if (problems.length) {
  console.log('PROBLEMS:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
} else {
  console.log('No console errors, no page errors, all sections found.');
}
