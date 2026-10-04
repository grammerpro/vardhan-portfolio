// General browser regression suite. All form endpoints are blocked; forms have
// their own mocked suite. Run against a built server, optionally with --capture.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import * as playwright from 'playwright';

const base = process.argv[2] || 'http://localhost:3200';
const engine = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'chromium';
assert.ok(['chromium', 'webkit', 'firefox'].includes(engine));
const capture = process.argv.includes('--capture');
const directory = `docs/evidence/verification/${engine}`;
await mkdir(directory, { recursive: true });
const browser = await playwright[engine].launch({ headless: true });
const results = [];
const pageErrors = [];
const consoleErrors = [];
const missingResources = [];
let unexpectedSubmissions = 0;
let testName = '';
const projects = [
  ['java-native-rag', 'Java Native RAG', 'Java-Native-RAG-System'],
  ['chroma-loop', 'Chroma Loop', 'Chroma-Loop'],
  ['anon-dapp', 'ANON Dapp', 'ANON-Dapp'],
  ['aura-landing', 'Aura Landing', 'aura-landing'],
  ['pdf-editor-tool', 'PDF Editor Tool', 'pdf-editor-tool'],
  ['blockchain-storage', 'Blockchain Storage', 'BlockchainFileStorage'],
];
const sizes = [[1440, 900], [1920, 1080], [1280, 800], [768, 1024], [390, 844], [360, 800], [320, 800]];
const url = path => new URL(path, base).href;
async function check(name, run) {
  testName = name;
  const started = Date.now();
  try {
    const detail = await run();
    results.push({ name, status: detail?.skip ? 'unavailable' : 'passed', milliseconds: Date.now() - started, detail });
    console.log(`${detail?.skip ? 'UNAVAILABLE' : 'PASS'} ${name}${detail?.skip ? ': ' + detail.skip : ''}`);
  } catch (error) {
    results.push({ name, status: 'failed', milliseconds: Date.now() - started, error: error.message });
    console.log(`FAIL ${name}: ${error.message}`);
  }
}
async function withPage(options, run, setup) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', ...options });
  await context.route(/\/api\/(?:fit|contact)(?:\?|$)/, async route => { unexpectedSubmissions++; await route.abort(); });
  if (setup) await setup(context);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => pageErrors.push({ test: testName, message: error.message }));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ test: testName, message: message.text() }); });
  page.on('response', response => { if (response.status() >= 400 && new URL(response.url()).origin === new URL(base).origin) missingResources.push({ test: testName, status: response.status(), url: response.url() }); });
  try { return await run(page, context); } finally { await context.close(); }
}
async function visit(page, path = '/') {
  const response = await page.goto(url(path), { waitUntil: 'networkidle', timeout: 60000 });
  assert.equal(response?.status(), 200, `${path} must load directly`);
  await page.evaluate(() => document.fonts.ready);
}
async function mode(page, expected) {
  await page.waitForFunction(value => document.documentElement.dataset.motion === value, expected);
}
async function settings(page) {
  const disclosure = page.locator('.experience-settings');
  if (!await disclosure.evaluate(element => element.open)) await disclosure.locator('summary').click();
}
async function sectionInView(page, id) {
  await page.waitForFunction(target => {
    const node = document.getElementById(target);
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    return rect.top >= -3 && rect.top < innerHeight * .45 && rect.bottom > innerHeight * .2;
  }, id);
}
async function shot(page, name, fullPage = false) {
  if (capture) {
    // Scroll-driven DOM labels and the still poster update on animation frames.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: `${directory}/${name}.png`, fullPage, animations: 'disabled' });
  }
}
async function rendererReady(page) {
  await page.waitForFunction(() => !!document.querySelector('[data-ready="true"] canvas') || !!Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Retry graphics')), null, { timeout: 20000 });
  return await page.locator('[data-ready="true"] canvas').count() === 1;
}
async function retryGraphics(page) {
  const button = page.getByRole('button', { name: 'Retry graphics', exact: false });
  const previousFailure = await button.elementHandle();
  await button.click();
  // Wait for the old failure state to leave before observing this attempt.
  // Otherwise an immediate query can mistake its still-mounted toast for a
  // second initialization failure.
  await page.waitForFunction(previous => !previous.isConnected, previousFailure);
  await previousFailure.dispose();
  return rendererReady(page);
}

for (const motion of ['static', 'full']) {
  await check(`Main navigation with ${motion} motion`, () => withPage({ reducedMotion: motion === 'static' ? 'reduce' : 'no-preference' }, async page => {
    await visit(page);
    await mode(page, motion);
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    for (const [name, id] of [['Work', 'work'], ['Expertise', 'capability'], ['About', 'about'], ['Let’s talk', 'contact']]) {
      await nav.getByRole('link', { name, exact: false }).click();
      await sectionInView(page, id);
      assert.equal(new URL(page.url()).hash, `#${id}`);
    }
    await nav.getByRole('link', { name: 'Résumé', exact: false }).click();
    await page.waitForURL('**/resume');
    assert.equal(await page.getByRole('heading', { name: 'Selected experience', exact: true }).isVisible(), true);
  }));
}

await check('Six direct case routes, source evidence, refresh, and archive', () => withPage({}, async page => {
  const titles = new Set();
  for (const [slug, name, repository] of projects) {
    await visit(page, `/work/${slug}`);
    assert.equal(await page.getByRole('heading', { name, exact: true, level: 1 }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: 'Explore source', exact: false }).getAttribute('href'), `https://github.com/grammerpro/${repository}`);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://vardhansudo.me/work/${slug}`);
    titles.add(await page.title());
    assert.equal(await page.getByRole('heading', { name: 'Current limits', exact: true }).count(), 1);
    await shot(page, `case-${slug}`);
    const response = await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200);
    assert.equal(await page.getByRole('heading', { name, exact: true, level: 1 }).isVisible(), true);
  }
  assert.equal(titles.size, 6);
  await visit(page, '/projects');
  for (const [slug] of projects) assert.ok(await page.locator(`a[href="/work/${slug}"]`).count() > 0, `Archive contains ${slug}`);
}));

await check('Browser Back restores useful work-gallery context', () => withPage({}, async page => {
  await visit(page);
  const study = page.locator('#chroma-loop').getByRole('link', { name: 'Case study', exact: false });
  await study.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await study.click();
  await page.waitForURL('**/work/chroma-loop');
  await page.getByRole('heading', { name: 'Chroma Loop', exact: true, level: 1 }).waitFor();
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.locator('#chroma-loop').waitFor();
  await page.waitForFunction(previous => Math.abs(scrollY - previous) < innerHeight * .8, before);
  await shot(page, 'back-restored-work');
}));

await check('Project previews, assembly inspector, and capability controls', () => withPage({}, async page => {
  await visit(page);
  await page.getByRole('button', { name: 'Separate the parts', exact: false }).click();
  assert.equal(await page.getByRole('button', { name: 'Reassemble', exact: false }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Reassemble', exact: false }).click();
  const retrieval = page.locator('.retrieval-preview');
  await retrieval.getByRole('button', { name: 'Generate', exact: false }).click();
  assert.match(await retrieval.locator('.flow-explanation').innerText(), /OpenAI.*remote/i);
  await retrieval.getByRole('button', { name: 'Sources', exact: false }).click();
  assert.match(await retrieval.locator('.flow-explanation').innerText(), /source names/);
  const slider = page.getByRole('slider', { name: 'Rotate the ring' });
  await slider.focus();
  const initial = Number(await slider.inputValue());
  await slider.press('ArrowRight');
  assert.ok(Number(await slider.inputValue()) > initial);
  await page.getByRole('button', { name: 'Mint orb', exact: true }).click();
  assert.match(await page.locator('.chroma-art svg').getAttribute('aria-label'), /mint orb/);
  await page.getByRole('button', { name: 'Optional Pinata', exact: true }).click();
  assert.match(await page.locator('.storage-preview .flow-explanation').innerText(), /configured Pinata token/);
  await page.getByRole('button', { name: 'Local sandbox', exact: true }).click();
  assert.match(await page.locator('.storage-preview .flow-explanation').innerText(), /IndexedDB/);
  for (const name of ['Front-end engineering', 'Services & delivery', 'Graphics & retrieval', 'Content platforms']) {
    const button = page.getByRole('button', { name, exact: false });
    await button.focus();
    await button.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#capability-detail h3').innerText(), name);
  }
  await page.getByText('Read all areas of practice', { exact: true }).click();
  assert.equal(await page.locator('.capability-text').evaluate(node => node.open), true);
}));

await check('Motion preference override, persistence, reset, and static renderer removal', () => withPage({}, async page => {
  await visit(page);
  await mode(page, 'static');
  assert.equal(await page.locator('canvas').count(), 0);
  await settings(page);
  await page.getByLabel('Choose your experience').selectOption('balanced');
  await mode(page, 'balanced');
  await page.reload({ waitUntil: 'networkidle' });
  await mode(page, 'balanced');
  await settings(page);
  assert.equal(await page.getByLabel('Choose your experience').inputValue(), 'balanced');
  await page.getByRole('button', { name: 'Reset to device settings', exact: true }).click();
  await mode(page, 'static');
  assert.equal(await page.locator('canvas').count(), 0);
  assert.equal(await page.getByLabel('Choose your experience').inputValue(), 'system');
}));

await check('Motion controls work when browser storage is denied', () => withPage({}, async page => {
  await visit(page);
  await settings(page);
  await page.getByLabel('Choose your experience').selectOption('balanced');
  await mode(page, 'balanced');
  await page.getByLabel('Choose your experience').selectOption('static');
  await mode(page, 'static');
  assert.equal(await page.locator('canvas').count(), 0);
  await page.getByRole('button', { name: 'Reset to device settings', exact: true }).click();
  assert.equal(await page.getByLabel('Choose your experience').inputValue(), 'system');
}, context => context.addInitScript(() => {
  Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage denied for test', 'SecurityError'); } });
})));

await check('Missing WebGL falls back to readable content and explicit retry', () => withPage({ reducedMotion: 'no-preference' }, async page => {
  await visit(page);
  await page.getByRole('button', { name: 'Retry graphics', exact: false }).waitFor();
  assert.equal(await page.getByRole('heading', { name: 'Vardhan.', exact: true, level: 1 }).isVisible(), true);
  assert.equal(await page.locator('img[src="/signature/hero-desktop.webp"]').evaluate(image => image.complete && image.naturalWidth > 0), true, 'The matched poster loads during graphics failure');
  assert.equal(await page.locator('a[href="mailto:vardhana1209@gmail.com"]').first().count(), 1);
  assert.equal(await page.locator('[data-ready="true"] canvas').count(), 0);
  await shot(page, 'graphics-fallback');
  await page.evaluate(() => window.restoreGraphicsForTest());
  if (!await retryGraphics(page)) return { skip: 'Fallback passed. Engine cannot create WebGL after restoring browser API, so real retry readiness is unavailable.' };
  assert.equal(await page.getByRole('button', { name: 'Retry graphics', exact: false }).count(), 0);
}, context => context.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(kind, ...args) { return /webgl|experimental-webgl/.test(kind) ? null : original.call(this, kind, ...args); };
  window.restoreGraphicsForTest = () => { HTMLCanvasElement.prototype.getContext = original; };
})));

await check('Real context loss, retry, reverse scroll, and route teardown', () => withPage({ reducedMotion: 'no-preference' }, async page => {
  await visit(page);
  if (!await rendererReady(page)) return { skip: 'WebGL initialization is unavailable in this browser environment; fallback is covered separately.' };
  await shot(page, 'full-surface');
  const positions = await page.evaluate(() => {
    const top = id => document.getElementById(id).getBoundingClientRect().top + scrollY;
    return [top('unfold'), (top('unfold') + top('work')) / 2, top('work')];
  });
  for (let index = 0; index < positions.length; index++) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), positions[index]);
    await page.waitForTimeout(500);
    await shot(page, `full-entrance-${index + 1}`);
  }
  const forward = Number(await page.locator('canvas').getAttribute('data-chapter-progress'));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => Number(document.querySelector('canvas')?.dataset.chapterProgress) < .02);
  assert.ok(forward > .5, 'Canvas reconciles forward gallery progress');
  await page.waitForTimeout(700);
  const frames = await page.locator('canvas').getAttribute('data-render-frames');
  await page.waitForTimeout(500);
  assert.equal(await page.locator('canvas').getAttribute('data-render-frames'), frames, 'Idle rendering settles');
  const extension = await page.locator('canvas').evaluate(canvas => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const lose = gl?.getExtension('WEBGL_lose_context');
    if (!lose) return false;
    lose.loseContext();
    return true;
  });
  if (!extension) return { skip: 'Scroll/reversal/idle passed; WEBGL_lose_context extension unavailable for real context-loss test.' };
  await page.getByRole('button', { name: 'Retry graphics', exact: false }).waitFor();
  assert.equal(await page.locator('[data-ready="true"] canvas').count(), 0);
  await shot(page, 'real-context-loss');
  assert.equal(await retryGraphics(page), true, 'A fresh context renders after explicit retry');
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.locator('#java-native-rag').getByRole('link', { name: 'Case study', exact: false }).click();
    await page.waitForURL('**/work/java-native-rag');
    assert.equal(await page.locator('canvas').count(), 0);
    await page.getByRole('link', { name: 'Back to work', exact: false }).click();
    await page.locator('#work').waitFor();
    assert.equal(await rendererReady(page), true);
    assert.equal(await page.locator('canvas').count(), 1);
  }
}));

await check('Keyboard skip link and reachable contact controls', () => withPage({}, async page => {
  await visit(page);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('href'), '#main-content');
  const focus = await page.locator(':focus').evaluate(node => ({ style: getComputedStyle(node).outlineStyle, width: parseFloat(getComputedStyle(node).outlineWidth) }));
  assert.ok(focus.style !== 'none' && focus.width >= 2, 'Skip link has a visible focus indicator');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content');
  let reached = false;
  for (let i = 0; i < 150; i++) {
    await page.keyboard.press('Tab');
    const id = await page.locator(':focus').getAttribute('id');
    if (id === 'name') { reached = true; break; }
  }
  assert.ok(reached, 'Keyboard reaches contact fields without a trap');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'email');
}));

await check('Viewport matrix and 320px reflow with expanded content', () => withPage({}, async page => {
  await visit(page);
  const measurements = [];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => { document.querySelectorAll('details').forEach(node => { node.open = false; }); scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForTimeout(150);
    await shot(page, `static-${width}-hero`);
    await page.evaluate(() => document.querySelectorAll('details').forEach(node => { node.open = true; }));
    const measurement = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    measurements.push({ width, height, ...measurement });
    assert.ok(measurement.content <= measurement.viewport + 1, `Expanded content overflows at ${width}px: ${measurement.content}`);
    const panel = page.getByLabel('Choose your experience');
    assert.equal(await panel.isVisible(), true);
  }
  if (capture) {
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.querySelectorAll('details').forEach(node => { node.open = false; }));
      for (const id of ['unfold', 'work', 'java-native-rag', 'chroma-loop', 'anon-dapp', 'capability', 'about', 'contact']) {
        await page.locator(`#${id}`).evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await shot(page, `static-${width}-${id}`);
      }
    }
  }
  return measurements;
}));

await check('No-JavaScript content, source links, contact, and résumé stay readable', () => withPage({ javaScriptEnabled: false }, async page => {
  await visit(page);
  assert.equal(await page.getByRole('heading', { name: 'Vardhan.', exact: true, level: 1 }).isVisible(), true);
  assert.equal(await page.locator('canvas').count(), 0);
  for (const [slug] of projects) assert.ok(await page.locator(`a[href="/work/${slug}"]`).count() > 0);
  assert.ok(await page.locator('a[href="mailto:vardhana1209@gmail.com"]').count() > 0);
  assert.ok(await page.locator('a[href="/resume"]').count() > 0);
  await page.getByText('Read all areas of practice', { exact: true }).click();
  assert.equal(await page.locator('.capability-text').evaluate(node => node.open), true);
  await shot(page, 'no-javascript');
}));

await check('No accidental provider submissions or uncaught app exceptions', async () => {
  assert.equal(unexpectedSubmissions, 0);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(missingResources, []);
});
const report = { capturedAt: new Date().toISOString(), baseUrl: base, requestedBuildMode: 'production (operator must confirm server mode)', engine, version: browser.version(), conditions: 'Headless desktop Windows host; DPR 1; fresh contexts; no CPU/network throttling. Reduced motion except named rich-mode checks. Mobile widths are emulation, not real phone hardware. All provider endpoints blocked.', results, pageErrors, consoleErrors, missingResources };
await writeFile(`${directory}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
const failures = results.filter(result => result.status === 'failed');
console.log(`${results.length - failures.length}/${results.length} checks without failure; ${results.filter(result => result.status === 'unavailable').length} have explicitly unavailable coverage. Report: ${directory}/report.json`);
if (failures.length) process.exitCode = 1;
