/**
 * Phase 8 audit against section 7 of the brief.
 *
 *   node scripts/audit.mjs <baseUrl>
 *
 * Checks: body-text contrast on both palettes, heading order, landmarks,
 * image alt text, keyboard tab order, focus ring visibility, reduced-motion
 * behaviour (no pins, no canvas, content readable), and console errors.
 */

import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const results = [];
const pass = (m) => results.push(['PASS', m]);
const fail = (m) => results.push(['FAIL', m]);
const info = (m) => results.push(['INFO', m]);

function luminance([r, g, b]) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// --- Static token contrast, independent of the browser -----------------------
const PAPER = hex('#E8E6E1');
const VOID = hex('#0D0F12');
const INK = hex('#121417');
const BONE = hex('#E8E6E1');
const GRAPHITE = hex('#5A5F66');
const SIGNAL = hex('#1F3BFF');

const pairs = [
  ['--ink on --paper (body)', INK, PAPER, 4.5],
  ['--bone on --void (body)', BONE, VOID, 4.5],
  ['--graphite on --paper (secondary)', GRAPHITE, PAPER, 4.5],
  ['--graphite-void on --void (secondary)', hex('#7E848E'), VOID, 4.5],
  ['--signal on --paper (link)', SIGNAL, PAPER, 4.5],
];

// Documented, not asserted: --graphite fails on --void at 2.98:1, which is
// exactly why --graphite-void exists. Kept visible so nobody reintroduces it.
info(`--graphite on --void would be ${contrast(GRAPHITE, VOID).toFixed(2)}:1, hence --graphite-void`);

for (const [label, fg, bg, min] of pairs) {
  const ratio = contrast(fg, bg);
  const line = `${label}: ${ratio.toFixed(2)}:1 (need ${min}:1)`;
  if (ratio >= min) pass(line);
  else fail(line);
}

// --- Live page checks --------------------------------------------------------
const browser = await chromium.launch();

async function run(reducedMotion) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(baseUrl, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForTimeout(4000);

  const tag = reducedMotion ? 'reduced-motion' : 'normal';

  if (errors.length === 0) pass(`${tag}: no console or page errors`);
  else errors.forEach((e) => fail(`${tag}: console error: ${e}`));

  const audit = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      level: Number(h.tagName[1]),
      text: (h.textContent || '').trim().slice(0, 40),
    }));

    // An empty alt on a decorative image is correct, not a defect: it tells a
    // screen reader to skip it. Only flag images with no alt attribute at all,
    // or an empty alt on an image that is not marked decorative.
    const imagesMissingAlt = [...document.images].filter((i) => {
      if (!i.hasAttribute('alt')) return true;
      if (i.alt.trim() !== '') return false;
      const decorative =
        i.getAttribute('aria-hidden') === 'true' ||
        i.getAttribute('role') === 'presentation' ||
        i.closest('[aria-hidden="true"]') !== null;
      return !decorative;
    }).length;

    const landmarks = {
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      footer: document.querySelectorAll('footer').length,
    };

    return {
      headings,
      imagesMissingAlt,
      landmarks,
      canvases: document.querySelectorAll('canvas').length,
      pinSpacers: document.querySelectorAll('.pin-spacer').length,
      hasLenisClass: document.documentElement.classList.contains('lenis'),
      docHeight: document.documentElement.scrollHeight,
    };
  });

  // Heading order: exactly one h1, and no level skipped going down.
  const h1s = audit.headings.filter((h) => h.level === 1).length;
  if (h1s === 1) pass(`${tag}: exactly one h1`);
  else fail(`${tag}: found ${h1s} h1 elements`);

  let skipped = null;
  for (let i = 1; i < audit.headings.length; i += 1) {
    const jump = audit.headings[i].level - audit.headings[i - 1].level;
    if (jump > 1) skipped = `${audit.headings[i - 1].text} (h${audit.headings[i - 1].level}) -> ${audit.headings[i].text} (h${audit.headings[i].level})`;
  }
  if (!skipped) pass(`${tag}: no skipped heading levels`);
  else fail(`${tag}: heading level skipped: ${skipped}`);

  if (audit.imagesMissingAlt === 0) pass(`${tag}: all images have alt text`);
  else fail(`${tag}: ${audit.imagesMissingAlt} images missing alt text`);

  const { main, nav, footer } = audit.landmarks;
  if (main === 1 && nav >= 1 && footer === 1) pass(`${tag}: landmarks present (main/nav/footer)`);
  else fail(`${tag}: landmarks main=${main} nav=${nav} footer=${footer}`);

  if (audit.canvases <= 1) pass(`${tag}: ${audit.canvases} canvas element(s), max allowed 1`);
  else fail(`${tag}: ${audit.canvases} canvas elements, brief allows exactly one`);

  if (reducedMotion) {
    if (audit.pinSpacers === 0) pass('reduced-motion: no ScrollTrigger pins created');
    else fail(`reduced-motion: ${audit.pinSpacers} pin-spacers created`);

    if (audit.canvases === 0) pass('reduced-motion: canvas never mounted');
    else fail('reduced-motion: canvas mounted');

    if (!audit.hasLenisClass) pass('reduced-motion: Lenis not constructed');
    else fail('reduced-motion: Lenis is running');

    // Every section must still be readable.
    const visible = await page.evaluate(() =>
      ['hero', 'positioning', 'work', 'capability', 'about', 'contact'].filter((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        return el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden';
      }),
    );
    if (visible.length === 6) pass('reduced-motion: all six sections rendered and visible');
    else fail(`reduced-motion: only ${visible.length}/6 sections visible`);

    // Text that is normally revealed must not be stuck at opacity 0.
    const hidden = await page.evaluate(() => {
      const suspects = [...document.querySelectorAll('h1, [data-cap-heading], [data-cap-body], [data-hero-fade]')];
      return suspects.filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length;
    });
    if (hidden === 0) pass('reduced-motion: no revealed text left at low opacity');
    else fail(`reduced-motion: ${hidden} elements still below 0.9 opacity`);
  } else {
    if (audit.hasLenisClass) pass('normal: Lenis is running');
    else fail('normal: Lenis did not attach');

    if (audit.pinSpacers >= 2) pass(`normal: ${audit.pinSpacers} pinned sections active`);
    else fail(`normal: expected pins, found ${audit.pinSpacers}`);

    // Keyboard order: tab through and record what receives focus.
    const order = [];
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      const item = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 26),
          outline: style.outlineColor,
          outlineWidth: style.outlineWidth,
        };
      });
      if (item) order.push(item);
    }
    info(`normal: tab order -> ${order.map((o) => o.text || o.tag).join(' | ')}`);

    const unringed = order.filter(
      (o) => o.outlineWidth === '0px' || !o.outline.includes('31, 59, 255'),
    );
    if (unringed.length === 0 && order.length > 0) {
      pass(`normal: all ${order.length} focused elements show the --signal ring`);
    } else {
      unringed.forEach((o) =>
        fail(
          `normal: no --signal focus ring on <${o.tag}> "${o.text}" (outline ${o.outlineWidth} ${o.outline})`,
        ),
      );
    }
  }

  await context.close();
}

await run(false);
await run(true);
await browser.close();

console.log('');
for (const [state, message] of results) {
  console.log(`  ${state}  ${message}`);
}
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n  ${results.filter((r) => r[0] === 'PASS').length} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
